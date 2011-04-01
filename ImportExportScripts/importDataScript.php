<?php
/**
author: Grant Dickie

Handles methods from coredata and xml_stream_import that will import data from XML into JSON
**/

function decode_format($txt,$format){
	include_once('coredata.php');
	
	# figure out what the format is
	if((preg_match('/(json)/i',$format))||(preg_match('/^{&}$/i',$txt))){
		# is a json file - use coredata methods
		$parser=new CoreData($txt);
		$data=$parser->to_json();
		header("Content-type: text/javascript");
		echo $data;
		
	} else if(preg_match('/(tei)&(facsimile)/i',$format)){
		include_once('xml_stream_import.php');
		include_once('tei_p5_with_facsimile_import.php');
		
		$parser=new TEIP5WithFacsimileImport($txt);
		
		$data=$parser->to_json();
		header("Content-type: text/javascript");
		echo $data;
	} else if(preg_match('/(tei)/i',$format)){
		include_once('xml_stream_import.php');
		include_once('tei_p5_import.php');
		
		$parser=new TEIP5Import($txt);
		$data=$parser->to_json();
		header("Content-type: text/javascript");
		echo $data;
	}
	
}


# check if there was a local file uploaded
/**
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
**/

# if not, then 
if(isset($_POST['format'])&&isset($_POST['filepath'])){
	#check to see if filename is malicious
	$name=$_POST['filepath'];
	if(preg_match('/(\<)|(\>)|\*/m',$name)){
		die("ERROR READING FILE");
	}
	$txt='';
	if($handle=fopen($name)){
		while(!feof($handle)){
			$txt.=fread($handle,1024);
		}
		
		# send to decode format
		decode_format($txt,$_POST['format']);
	}
	
	
	
}



?>