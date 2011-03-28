<?php
class CoreData
{
	private $containers = array();
	public  $current_container;
	private $content;
	
	public function __construct($content) {
		$this -> newContainer();
		$this -> content = $content;
		$this -> parse_content($content);
	}
	
	// this function should be overridden to parse the content and create a set of collections with lines
	//   and possibly links
	public function parse_content($content) {
		// we want to import $content as JSON for CoreData - other interpretations for other types
		//$json = json_decode($content);
		// loop through pages
	}
	
	public function to_json($options = 0) {
		// outputs a JSON representation of the containers and lines
		$data = array();
		$data['content'] = $this -> content;
		$data['tile'] = array();
		$data['tile']['pages'] = array();
		
		foreach($this -> containers as $container) {
			if(!$container -> is_empty()) {
				$page = array();
				$page['url'] = $container -> image_url;
				$page['lines'] = $container -> lines;
				$data['tile']['pages'][] = $page;
			}
		}
		return json_encode($data, $options);
	}
	
	public function newContainer($url = "") {
		$c = new CoreDataContainer($url);
		$this -> containers[] = $c;
		$this -> current_container = $c;
	}
}

class CoreDataContainer {
	public $lines = array();
	public $image_url = "";
	
	
	public function __construct($url = "") {
		$this -> image_url = $url;
	}
	
	public function addLine($line) {
		if($line != "") {
			$this -> lines[] = $line;
		}
	}
	
	public function is_empty() {
		return count($this -> lines) == 0 && $this -> image_url == "";
	}
}

?>