<?php
/*
Goes through the ImportExportScripts folder and searches for scripts that
represent file formats that CoreData can use as subclasses
*/

/* 
IGNORES:
coredata.php
findFileFormats.php (This file)
*/

class FileFormatSearch{
	
	private $formats=array();
	
	
	public function search(){
		// include coredata
		include_once('coredata.php');
		// include others - need to find a way to do this
		// dynamically. Trolling through the directory adds
		// things in the wrong order
		include_once('xml_stream_import.php');
		include_once('tei_p5_import.php');
		include_once('tei_p5_with_facsimile_import.php');
		
		// go through the current directory
		// find other import scripts
		$parser=new TEIP5WithFacsimileImport('',array());
		$html=$parser->parse_namespaces();
		
		return $html;
		
	}
	
	protected function processList(){
		$optionHTML='';
		foreach($this->formats as $a){
		
			// create the option HTML and add it to the bigger
			// string
			$optionHTML.=$this->generateFilenameHTML($a);
		}
		// hand over entire string of option data
		return $optionHTML;
	}
	
	private function generateFilenameHTML($str){
		// take the string and return its option html
		$file=preg_replace('/\.(php)|(import)/','',$str);
		$file=preg_replace('/(_)|(\.)|(\-)|(\/)/',' ',$file);
		$out='<option value="'.$str.'">'.strtoupper($file).'</option>';
		return $out;
	}
}

// implement
$search=new FileFormatSearch();
echo $search->search();

?>