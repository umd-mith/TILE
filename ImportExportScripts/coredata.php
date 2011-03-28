<?php
class CoreData
{
	private $containers = array();
	public  $current_container;
	
	public function __construct($content) {
		$this -> newContainer();
		$this -> parse_content($content);
	}
	
	// this function should be overridden to parse the content and create a set of collections with lines
	//   and possibly links
	public function parse_content($content) {
		// we want to import $content as JSON for CoreData - other interpretations for other types
		//$json = json_decode($content);
		// loop through pages
	}
	
	public function to_json() {
		// outputs a JSON representation of the containers and lines
	}
	
	public function newContainer($url = "") {
		$c = new CoreDataContainer($url);
		print var_dump($this -> current_container);
		$this -> containers[] = $c;
		$this -> current_container = $c;
	}
}

class CoreDataContainer {
	private $lines = array();
	public $image_url = "";
	
	
	public function __construct($url = "") {
		$this -> image_url = $url;
	}
	
	public function addLine($line) {
		print "Adding [$line]\n";
		$this -> lines[] = $line;
	}
}

?>