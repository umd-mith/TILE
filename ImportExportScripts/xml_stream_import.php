<?php
class XMLStreamImport extends CoreData
{	
	private $parser;
	private  $milestone_xpath;
	private  $image_xpath;
	private  $line_start_xpath;
	private  $line_end_xpath;
	private $text_stack;
	private $current_line;
	private $element_stack;
	private $element_stack_depth;
	
	public function __construct($content) {
		$this -> setup_parser();
		parent::__construct($content);
	}
	
	public function parse_content($content) {
		$this -> element_stack = array();
		$this -> element_stack_depth = 0;
		$this -> text_stack = array("");
		$this -> current_line = "";
				
		xml_parse( $this -> parser, $content );
	}
	
	public function setMilestoneXPath($path) {
		// we want to parse it so we know what the element stack needs to look like
		// for now, we only support / and // for separators
		$this -> milestone_xpath = $this -> build_xpath_regex($path);
	}
	
	public function setImageURLXPath($path) {
		$this -> image_xpath = $this -> build_xpath_regex($path);
	}
	
	public function setLineStartXPath($path) {
		$this -> line_start_xpath = $this -> build_xpath_regex($path);
	}
	
	public function setLineEndXPath($path) {
		$this -> line_end_xpath = $this -> build_xpath_regex($path);
	}
	
	public function build_xpath_regex($path) {
		$bits = explode('@', $path, 2);
		$attribute = count($bits) > 1 ? $bits[1] : '';
		$bits = explode('/', $bits[0]);
				
		$regex = '';
		foreach($bits as $bit) {
			if($bit == '') {
				// we can skip any number of element names
				$regex = $regex . "/.*/";
			}
			else {
				if($bit == '*') {
					$regex = $regex . "/[^/]+/";
				}
				else {
				    $regex = $regex . "/$bit/";
				}
			}
		}
		$regex = preg_replace('{/+}', '/', $regex);
		$regex = preg_replace('{/(\.\*/)+}', '/.*/', $regex);
		return array("{^$regex\$}", $attribute);
	}
	
	public function current_xpath() {
		return "/" . implode("/", array_slice(
			$this -> element_stack,
			0,
			$this -> element_stack_depth
			)
		) . "/";
	}
	public function stack_matches_path_q($regex) {
		if($regex == '') {
			return false;
		}
		return preg_match($regex[0], $this -> current_xpath()) != 0;
	}
	
	public function setup_parser() {
		$this -> parser = xml_parser_create();
		
		xml_parser_set_option($this -> parser, XML_OPTION_CASE_FOLDING, false);

		xml_set_element_handler(
			$this->parser,
			array(&$this, "start_tag"),
			array(&$this, "end_tag")
			);
		xml_set_character_data_handler(
			$this->parser,
			array(&$this, "character_data")
			);
	}
	
	public function start_tag($parser, $name, array $attributes) {
		$this -> element_stack[$this -> element_stack_depth] = $name;
		$this -> text_stack[$this -> element_stack_depth] = "";
		$this -> element_stack_depth += 1;
		if($this -> stack_matches_path_q($this -> milestone_xpath)) {
			$this -> current_container -> addLine($this -> current_line);
			$this -> current_line = "";
			$this -> newContainer();
		}
		if($this -> stack_matches_path_q($this -> image_xpath)) {
			if($this -> image_xpath[1] != '' && array_key_exists($this -> image_xpath[1], $attributes)) {
				// we are using an attribute of the current element
				$this -> current_container -> image_url = $attributes[$this -> image_xpath[1]];
			}
		}
		if($this -> stack_matches_path_q($this -> line_start_xpath)) {
			$this -> current_line = "";
		}
	}
	
	public function end_tag($parser, $name) {
		if($this -> stack_matches_path_q($this -> image_xpath)) {
			if($this -> image_xpath[1] == '') {
				// we are using the text content
				$this -> current_container -> image_url = $this -> text_stack[$this -> element_stack_depth];
			}
		}
		if($this -> stack_matches_path_q($this -> line_end_xpath)) {
			$this -> current_container -> addLine($this -> current_line);
			$this -> current_line = "";
		}
		
		if($this -> element_stack_depth > 1) {
  			$this -> text_stack[$this -> element_stack_depth - 2] .= $this -> text_stack[$this -> element_stack_depth-1];
		}
		$this -> element_stack_depth -= 1;
	}
	
	public function character_data($parser, $data) {
		$this -> text_stack[$this -> element_stack_depth-1] .= $data;
		$this -> current_line .= $data;
	}
}

?>