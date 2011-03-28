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
		# go through the current directory
		if($handle=opendir('.')){
			# put all files in formats array
			while(($file=readdir($handle))){
				if(preg_match('/^coredata|^findFileFormats|^\./',$file)>0){
					continue;
				}
				array_push($this->formats,$file);
			}
			
			$list=$this->processList();
			return $list;
		}
	}
	
	protected function processList(){
		$optionHTML='';
		foreach($this->formats as $a){
		
			# create the option HTML and add it to the bigger
			# string
			$optionHTML.=$this->generateFilenameHTML($a);
		}
		# hand over entire string of option data
		return $optionHTML;
	}
	
	private function generateFilenameHTML($str){
		# take the string and return its option html
		$file=preg_replace('/\.(php)|(import)/','',$str);
		$file=preg_replace('/(_)|(\.)|(\-)|(\/)/',' ',$file);
		$out='<option value="'.$str.'">'.strtoupper($file).'</option>';
		return $out;
	}
}

#implement
$search=new FileFormatSearch();
echo $search->search();

?>