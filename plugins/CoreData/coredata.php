<?php
class CoreData
{
    private $containers = array();
    private $labels = array();
    public  $current_container;
	static	$import_namespaces = array();
    private $content;

    
    public function __construct($content) {
		
        $this -> newContainer();
        $this -> content = $content;
        $this -> parse_content($content);
    }
    
	// This is a function to return html for choosing
	// which import feature to use in the wide library 
	// of classes
	public function parse_namespaces(){
		
		$html='';
		foreach(self::$import_namespaces as $key=>$item){
		
			// create a select tag for each element in the array
			$html.='<option id="import_'.$key.'">'.$item.'</option>';
		}
		return $html;
	}

    // this function should be overridden to parse the content and create a set of collections with lines
    //   and possibly links
    public function parse_content($content) {
        // we want to import $content as JSON for CoreData - other interpretations for other types
        $json = json_decode($content);
        // each page is a container
        
        // loop through pages
    }
    
    public function to_json($options = 0) {
        // outputs a JSON representation of the containers and lines
        $data = array();
		/*
		NOTE: encoding the content in order to preserve original data format and special
		chars. Browser automatically resolves special chars. For now, encoding this in 
		order to use it later in export. 
		*/
        $data['content'] = base64_encode($this -> content);
        $data['tile'] = array();
        $data['tile']['pages'] = array();
        
        foreach($this -> containers as $container) {
            if(!$container -> is_empty()) {
                $page = array();
				$page['id'] = $this -> genRandomID(5);
                $page['url'] = $container -> image_url;
                $page['lines'] = array();
                $page['shapes'] = array();
                
                foreach($container -> lines as $line) {
					
                    $l = array();
                    $l['text'] = $line->text;
                    if($line->id != "") {
                        $l['id'] = $line->id;
                    } else if((!isset($line->id))||($line->id == '')){
						# generate a random ID for this line
						$l['id'] = 'line'.count($page['lines']);
					}
                    $page['lines'][] = $l;
                }
                
                foreach($container -> shapes as $shape) {
                    $s = array();
                    if($shape -> id != "") {
                        $s['id'] = $shape -> id;
                    } else if((!isset($s['id']))||($s['id']=='')){
						$s['id'] = 'shape'.count($page['shapes']);
					}
                    $s['type'] = $shape -> type;
                    $s['color'] = $shape -> color;
                    $s['_scale'] = $shape -> scale;
                    $s['posInfo'] = $shape -> posInfo;
                    $page['shapes'][] = $s;
                }
                $data['tile']['pages'][] = $page;
            }
        }
        $data['tile']['labels'] = array_values($this -> labels);
        
        return json_encode($data);
    }
    
    public function newContainer($url = "") {
        $c = new CoreDataContainer($url);
        $this -> containers[] = $c;
        $this -> current_container = $c;
    }
    
    public function addLabel($label, $object, $container = false) {
        if(!$container) {
            $container = $this -> current_container;
        }
        if($object -> id == "") {
            return; // we can't add a label for an object with no id
        }
        if(array_key_exists($label, $this -> labels)) {
            $this -> labels[$label]['selections'][] = $object -> id;
        }
        else {
            $this -> labels[$label] = array();
            $this -> labels[$label]['id'] = "lbl_" . (count($this -> labels) + 1);
            $this -> labels[$label]['name'] = $label;
            $this -> labels[$label]['selections'] = array();
            $this -> labels[$label]['selections'][] = $object -> id;
        }
    }
	
	// JIM: creating this protected function to fetch the content data
	// may want to erase because of bad OOP? just testing this out
	protected function getContentData(){
	
		return stripslashes($this->content);
	}
	
	# Used specifically for generating a random ID of length: $length
	private function genRandomID($length){
		$string=md5(time());
		$highest_startpoint = 32-$length;
		$randomString = substr($string,rand(0,$highest_startpoint),$length);
	    return $randomString;
	}
}

class CoreDataContainer {
    public $lines = array();
    public $shapes = array();
    public $image_url = "";
    
    
    public function __construct($url = "") {
        $this -> image_url = $url;
    }
    
    public function addLine($line) {
        if($line != "") {
            $l = new CoreDataLine($line);
            $this -> lines[] = $l;
            return $l;
        }
    }
    
    public function addShape($type, $color = "#000000", $scale = 1) {
        $s = new CoreDataShape($type, $color, $scale);
        $this -> shapes[] = $s;
        return $s;
    }
    
    public function is_empty() {
        return count($this -> lines) == 0 && $this -> image_url == "";
    }
}

class CoreDataLine {
    public $text = "";
    public $id = "";
    
    public function __construct($text, $id = "") {
        $this -> id = $id;
        $this -> text = $text;
    }
}

class CoreDataShape {
    public $id;
    public $type;
    public $scale;
    public $color;
    public $posInfo;
    
    public function __construct($type, $color = "#000000", $scale = 1) {
        $this -> type = $type;
        $this -> color = $color;
        $this -> scale = $scale;
    }
}
?>