<?php
/*
author: Grant Dickie

Handles methods from coredata and xml_stream_import that will import data from XML into JSON
*/

function decode_format($txt,$format){
	include_once('coredata.php');
	
	# figure out what the format is
	if(preg_match('/xml/i',$format)){
		include_once('xml_stream_import.php');
		
		$parser=new XMLStreamImport($txt);
		$data=$parser->to_json();
		echo $data['tile'];
	}
	
}


# check if there was a local file uploaded
if (isset($_FILES)){
	#check to see if filename is malicious
	$name=$_FILES['fileTags']['tmp_name'];
	if(preg_match('/(\<)|(\>)|\*/m',$name)){
		die("ERROR READING FILE");
	}
	
	
	$txt=file_get_contents($_FILES['fileTags']['tmp_name']);
	
	if(isset($_POST['fileformat'])){
	
		decode_format($txt,$_POST['fileformat']);
	}
}
# if not, then 
if(isset($_POST['format'])&&isset($_POST['file'])){
	if($handle=fopen($_POST['file'])){
		while(fread($handle)){
			
		}
		
	}
	
	
}



?>