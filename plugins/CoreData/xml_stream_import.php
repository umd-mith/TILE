<?php
class XMLStreamImport extends CoreData
{	
	private $parser;
	private $milestone_xpath;
	private $image_xpath;
	private $line_start_xpath;
	private $line_end_xpath;
	private $document_start_xpath;
	private $text_stack;
	private $current_line;
	private $element_stack;
	private $element_count_stack;
	private $attributes_stack;
	private $element_stack_depth;
	private $tile_element_start;
	private $embedded_tile_start_xpath;
	private $document_started = false;
	public  $break_lines_on_newline = false;
	private $parsing_embedded_tile = false;
	private $done_parsing = false;
	// added data for exporting
	//private $json;
	// for defining which tagname tile data needs to be attached to
	protected $insertNode;
	protected $xml;
	
	// JIM: added $tile in here to test out using 
	// conversion functions on tile variable - not sure how else to include
	// it?
	public function __construct($content,$tile=null) {
		
		// if passed tile element, then parse
		if(isset($tile)&&(!is_null($tile))){
			if(is_array($tile)){
				$this->json=$tile;
			} else{
				$this->json = json_decode($tile); 
			}
		}
		$this -> setEmbeddedTILEStartXPath('//teiHeader/tile');
		
		$this -> setup_parser();
		parent::__construct($content);
	}
	
	// This function parses the supplied XML $content based on the configured
	// XPaths.  See tei_p5_import for an example of how to configure XPaths.
	// This function is called by the CoreData object constructor after setup.
	public function parse_content($content) {
		$this -> element_stack = array();
		$this -> element_count_stack = array(array());
		$this -> element_stack_depth = 0;
		$this -> text_stack = array("");
		$this -> current_line = "";
		$this -> attributes_stack = array();
		if($this -> document_start_xpath == "") {
			$this -> document_started = true;
		}
		$this -> done_parsing = false;
	
		xml_parse( $this -> parser, $content );
		if(!isset($this->line_end_xpath)) {
			$this -> saveCurrentLine();
		}
	}
	
	public function setEmbeddedTILEStartXPath($path) {
		$this -> embedded_tile_start_xpath = $this -> build_xpath_regex($path);
	}
	
	// Sets the XPath for Milestones, which divide the XML document into containers of lines.
	public function setMilestoneXPath($path) {
		// we want to parse it so we know what the element stack needs to look like
		// for now, we only support / and // for separators
		$this -> milestone_xpath = $this -> build_xpath_regex($path);
	}
	
	// Sets the XPath for Image URLs, which are attached to the current container
	// Each container only has one Image URL, so you may want to coordinate the XPaths
	// for Image URLs and Milestones.
	public function setImageURLXPath($path) {
		$this -> image_xpath = $this -> build_xpath_regex($path);
	}
	
	// Sets the XPath that denotes the beginning of a line within a container.  A container change will
	// save the contents of the line up to the new container in the prior container, and begin a new line.
	public function setLineStartXPath($path) {
		$this -> line_start_xpath = $this -> build_xpath_regex($path);
	}
	
	// Sets the XPath that denotes the end of a line within a container.  If not given, then the
	// start of a line will save the prior line text and begin a new line.
	public function setLineEndXPath($path) {
		$this -> line_end_xpath = $this -> build_xpath_regex($path);
	}
	
	public function setDocumentStartXPath($path) {
		$this -> document_start_xpath = $this -> build_xpath_regex($path);
	}
	
	// Sets XPath for the beginning of the TILE saved data: <tile>
	// If none given, doesn't look for path
	public function setTileStartPath($path){
		$this -> tile_element_start = $this->build_xpath_regex($path);
	}
	
	// Sets XPATH for where the saved shapes are in the TILE XML
	public function setSaveShapesPath($path){
		
	}
	
	// Converts the non-attribute portion of an XPath into a regular expression that
	// matches against the path that represents the element stack.
	// For example:
	//   //pb => array( '{^/.+/pb/$}', '' )
	//   /foo/bar => array( '{^/foo/bar/$}', '' )
	//   //pb/@facs => array( '{^/.+/pb/$}', 'facs' )
	//   /*/p => array( '{/[^/]+/p/$}', '' )
	public function build_xpath_regex($path) {
		$parts = explode('|', $path);
		$regex = "(";
		$attributes = array();
		foreach($parts as $part) {
			$foo = $this -> _build_xpath_regex($part);
			$regex .= $foo[0];
			if($foo[1]) {
				$attributes[$foo[0]] = $foo[1];
			}
			$regex .= '|';
		}
		$regex = substr($regex, 0, -1);
		$regex .= ")";
		return array( "{^$regex\$}", $attributes );
	}
	
	private function _build_xpath_regex($path) {
		$bits = explode('/@', $path, 2);
		$attribute = count($bits) > 1 ? $bits[1] : '';
		$bits = explode('/', $bits[0]);
				
		$regex = '';
		foreach($bits as $bit) {
			if($bit == '') {
				// we can skip any number of element names
				$regex = $regex . "/.+/";
			}
			else {
				$matches = array();
				$nom = '';
				$idx = '';
				if(preg_match('{^(.*)\[(\d*)\]$}', $bit, $matches)) {
					$nom = $matches[1];
					$idx = $matches[2];
				}
				else {
					$nom = $bit;
				}
				if($nom == '*') {
					$regex = $regex . "/[^/]+";
				}
				else {
				    $regex = $regex . "/$nom";
				}
				if($idx != "") {
					$regex = $regex . "\\[$idx\\]";
				}
				else {
					$regex = $regex . '\[\d*\]';
				}
				$regex .= "/";
			}
		}
		$regex = preg_replace('{/+}', '/', $regex);
		$regex = preg_replace('{/(\.\+/)+}', '/.+/', $regex);
		return array($regex, $attribute);
	}
	
	// returns a simple XPath expression representing the current element stack
	public function current_xpath() {
		$xpath = "/";
		for($i = 0; $i < $this -> element_stack_depth; $i++) {
			$el = $this -> element_stack[$i];
			$xpath .= $el . '[' . $this -> element_count_stack[$i][$el] . ']/';
		}
		return $xpath;
	}
	
	// returns true if the supplied regular expression info matches the current xpath
	// returns false if $regex is empty
	public function stack_matches_path_q($regex) {
		if($regex == '') {
			return false;
		}
		return preg_match($regex[0], $this -> current_xpath()) != 0;
	}
	
	// Internal function that sets up the XML SAX parser
	public function setup_parser() {
		$this -> parser = xml_parser_create();
		
		xml_parser_set_option($this -> parser, XML_OPTION_CASE_FOLDING, false);

		xml_set_element_handler(
			$this->parser,
			array(&$this, "_start_tag"),
			array(&$this, "_end_tag")
			);
		xml_set_character_data_handler(
			$this->parser,
			array(&$this, "character_data")
			);
	}
	
	private function get_attribute($attributes, $regex) {
		foreach($regex[1] as $path => $attr) {
			if($this -> stack_matches_path_q(array("{^$path\$}"))) {
				if(array_key_exists($attr, $attributes)) {
					return $attributes[$attr];
				}
			}
		}
		return false;
	}
	
	public function push_element_stack($name, $attributes) {
		$this -> element_stack[$this -> element_stack_depth] = $name;
		$this -> attribute_stack[$this -> element_stack_depth] = $attributes;
		if(!isset($this -> element_count_stack[$this -> element_stack_depth][$name])) {
			$this -> element_count_stack[$this -> element_stack_depth][$name] = 0;
		}
		$this -> element_count_stack[$this -> element_stack_depth][$name] += 1;
		$this -> element_count_stack[$this -> element_stack_depth + 1] = array();
		$this -> text_stack[$this -> element_stack_depth] = "";
		$this -> element_stack_depth += 1;
	}
	
	public function pop_element_stack() {
		if($this -> element_stack_depth > 1) {
  			$this -> text_stack[$this -> element_stack_depth - 2] .= $this -> text_stack[$this -> element_stack_depth-1];
		}
		$this -> element_stack_depth -= 1;
	}
	
	public function current_attributes() {
		return $this -> attribute_stack[$this -> element_stack_depth - 1];
	}
	
	public function current_element() {
	    return $this -> element_stack[$this -> element_stack_depth - 1];
	}
	
	public function _start_tag($parser, $name, array $attributes) {
		if($this -> done_parsing) {
			return;
		}
		$this -> push_element_stack($name, $attributes);
		$this -> start_tag($parser, $name, $attributes);
	}
	
	public function add_embedded_tile_value($k, $v) {
		// handle numeric $k
		if(preg_match('/^\d+$/', $k)) {
			$this -> embedded_tile_stack[$this -> embedded_tile_stack_size][] = $v;
		}
		else {
			$this -> embedded_tile_stack[$this -> embedded_tile_stack_size][$k] = $v;
		}
	}
		
	public function start_tag($parser, $name, array $attributes) {
		if($this -> stack_matches_path_q($this -> embedded_tile_start_xpath)) {
			// at this point, we want to dump everything we've stored and start over with
			// just the <tile/> children
			$this -> reset_parse_info();
			$this -> parsing_embedded_tile = true;
			$this -> embedded_tile_stack = array();
			$this -> embedded_tile_stack_size = 0;
			$this -> embedded_tile_stack[$this -> embedded_tile_stack_size] = array();
		}
		if($this -> parsing_embedded_tile) {
			if($name == "value") {
			    $this -> add_embedded_tile_value($attributes['key'], $attributes['value']);
			}
			else if($name == "array") {
				$this -> embedded_tile_stack_size += 1;
				$this -> embedded_tile_stack[$this -> embedded_tile_stack_size] = array();
			}
		}
		else {
	        if(!$this -> document_started) {
		        if($this -> stack_matches_path_q($this -> document_start_xpath)) {
			        $this -> document_started = true;
	        	}
	        }
			if($this -> stack_matches_path_q($this -> milestone_xpath)) {
				$this -> saveCurrentLine();
				$this -> newMilestone($name, $attributes);
			}
			if($this -> stack_matches_path_q($this -> image_xpath)) {
				$v = $this -> get_attribute($attributes, $this -> image_xpath);
				if($v !== false) {
					// we are using an attribute of the current element
					$this -> current_container -> image_url = $v;
				}
			}
			if($this -> stack_matches_path_q($this -> line_start_xpath)) {
				if($this -> line_end_xpath == '') {
					$this -> saveCurrentLine();
				}
				$this -> current_line = "";
			}
		}
	}
	
	public function _end_tag($parser, $name) {
		if($this -> done_parsing) {
			return;
		}
		$this -> end_tag($parser, $name, $this -> current_attributes());
		$this -> pop_element_stack();
	}
	
	public function end_tag($parser, $name, $attributes) {
	
		if($this -> parsing_embedded_tile) {
			if($this -> stack_matches_path_q($this -> embedded_tile_start_xpath)) {
				$this -> json = $this -> embedded_tile_stack[0];
				$this -> done_parsing = true; // ignore the rest
			}
			else if($name == "array") {
			    $value = $this -> embedded_tile_stack[$this -> embedded_tile_stack_size];
			    $this -> embedded_tile_stack_size -= 1;
				$this -> add_embedded_tile_value($attributes["key"], $value);
			}
		}
		else {
			if($this -> stack_matches_path_q($this -> image_xpath)) {
				if($this -> image_xpath[1] == '') {
					// we are using the text content
					$this -> current_container -> image_url = $this -> text_stack[$this -> element_stack_depth];
				}
			}
			if($this -> stack_matches_path_q($this -> line_end_xpath)) {
				$this -> saveCurrentLine();
			}
		}
	}
	
	public function character_data($parser, $data) {
		if($this -> document_started) {
		    $this -> text_stack[$this -> element_stack_depth-1] .= $data;
		    $this -> current_line .= $data;
		}
	}
	
	public function newMilestone($name, $attributes) {
		$this -> newContainer();
	}
	
	public function saveCurrentLine() {
		if($this -> document_started) {
			$line = trim($this -> current_line);
			if($this -> break_lines_on_newline) {
				$lines = explode("\n", $line);
				foreach($lines as $line) {
					$this -> current_container -> addLine(trim($line));
				}
			}
			else {
  			    $this -> current_container -> addLine($line);
            }
			$this -> current_line = "";
	    }
	}
	
	// Takes the TILE XML data that's inserted by jsonToXML
	// and adds it to the imported content container
	public function retrieveTILEXMLData(){
		// overwritten by child classes
	}
	
	// pass in array arr with possible arrays inside
	// it (recursive)
	// namespace optional - adds as prefix to elements
	private function convertArrayToXML($arr,$el){
		$xml='';
	
	    foreach($arr as $key => $value) {
			if(is_object($value) && get_class($value) == "stdClass") {
				$value = (array)$value;
			}
			if(is_array($value)) {
				$itemEl = $this->xml->createElement('array');
				$itemEl -> setAttribute('key', $key);
				$el -> appendChild($itemEl);
				$this -> convertArrayToXML($value, $itemEl);
			}
			else {
				$itemEl = $this -> xml -> createElement('value');
				$itemEl -> setAttribute('key', $key);
				$itemEl -> setAttribute('value', $value);
				$el -> appendChild($itemEl);
			}
		}
		return $el;
	}

	// Takes the tile container data and parses it into XML
	public function convertTileToXML(){
		if(!isset($this->json)) return;
		
		// create initial XML header
		// need to include source XML from content in here?
		
		$this->xml=new DOMDocument('1.0');
		// create root element with xmlns data
		$this->xml->loadXML('<tile xmlns="http://mith.umd.edu/namespaces/tile"></tile>');
		$root=$this->xml->getElementsByTagName('tile')->item(0);
		$this -> convertArrayToXML($this -> json, $root);
	}
	
	// outputs the generic XML format for TILE
	public function outputTILEXML(){
		if(!isset($this->json)) return;
		
		if(!isset($this->insertNode)){
			// output
			$this->xml->formatOutput=true;
			return $this->xml->saveXML();
		} else {
			// Outputting XML of original file +
			// contents of TILE JSON
			$this->xml->formatOutput=true;
			// insert into node in content
			$cxml=new DOMDocument();
			$cxml->loadXML($this->getContentData());
		
			$teiHeader=$cxml->getElementsByTagName('teiHeader')->item(0);

			$root=$this->xml->getElementsByTagName('tile')->item(0);
			// import the node
			$addToHeader=$cxml->importNode($root,true);
			$teiHeader->appendChild($addToHeader);
			// format
			$cxml->formatOutput=true;
			return $cxml->saveXML();
			
		}
	}
}

?>