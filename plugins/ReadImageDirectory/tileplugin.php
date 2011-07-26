<?php
// @author Grant Dickie
// Reads a given directory, searches for images in that directory, and produces TILE JSON output
// 
// Must be a local directory or a URL that supports directory listing
// 
// 

class ReadImageDir {
	public function __construct($dir) {
		
		$this -> path = $dir;
		
		$this -> json = '';
		
	}
	
	public function get_json() {
		$c = 0;
		$this -> json = '';
		$this -> json = "{ 'pages': [";
		// Won't work for URLs that don't support directory listing
		if($stream = opendir($this -> path)) {
			while(($file = readdir($stream)) !== false) {
				// check to make sure that 
				if(preg_match('/\.jpg$|\.gif$|\.png$|\.tif$/i', $file)){
					$this -> json .= "{'id':'page".$c."', 'url':'".$file."', 'lines':[]},"; 
					$c++;
				}
			}
			
			$this -> json = substr($this -> json, 0, (strlen($this -> json)-1));
			$this -> json.= "], 'shapes':[]}";
			return $this -> json;
		} else {
			return $this -> json."]}";
		}
		
	}
	
};

if(isset($_GET['dir'])) {
	$rddir = new ReadImageDir($_GET['dir']);
	
	echo $rddir -> get_json();
}


?>