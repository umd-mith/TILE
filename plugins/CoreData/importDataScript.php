<?php

// author: Grant Dickie

// Handles methods from coredata and xml_stream_import that will import data from XML into JSON


function decode_format($txt,$format){
	include_once('coredata.php');
	
	if(preg_match('/auto/i',$format)){
		// auto-select - try to detect by file affix
		// JSON has {} at beginning and end
		if(preg_match('/^{/i',$txt)){
			
			return stripslashes($txt);
		} else if(preg_match('/<TEI/',$txt)&&(preg_match('/<facsimile/i',$txt))){
				include_once('xml_stream_import.php');
				include_once('tei_p5_with_facsimile_import.php');
				$parser=new TEIP5WithFacsimileImport($txt);
				
				$data=$parser->to_json();
				return $data;
		} else if(preg_match('/<TEI/',$txt)){
			include_once('xml_stream_import.php');
			include_once('tei_p5_import.php');

			$parser=new TEIP5Import($txt);
			$data=$parser->to_json();
			return $data;
		} else {
			echo "ERROR";
			die();
		}
	}
	
	// figure out what the format is
	if((preg_match('/(json)/i',$format))&&(preg_match('/^{/',$txt))){
		
		// is a json file - use coredata methods
		return stripslashes($txt);
	} else if(preg_match('/(facsimile)/i',$format)){
		include_once('xml_stream_import.php');
		include_once('tei_p5_with_facsimile_import.php');
		$parser=new TEIP5WithFacsimileImport($txt);
	
		$data=$parser->to_json();
		return $data;
	} else if(preg_match('/(tei)/i',$format)){
		include_once('xml_stream_import.php');
		include_once('tei_p5_import.php');
		
		$parser=new TEIP5Import($txt);
		$data=$parser->to_json();
		return $data;
	} else {
		echo "ERROR";
		die();
	}
	
}

function html_template($data){
	
	
	// $content=preg_replace('/&amp;|&gt;|&lt;/','NO',$content);
	$html='<html><head><title>untitled</title></head><body><textarea>'.htmlspecialchars($data).'</textarea></body></html>';
	return $html;
	
}

// have to use this method since FF3+ don't allow 
// for paths to be recorded otherwise
if((isset($_FILES['fileUploadName']))){
	// hard-coded - need to go back and fix this issue
	
	$file=$_FILES['fileUploadName']['tmp_name'];
	
	
	$format=$_POST['importformat'];
	$imgpath=preg_replace("/\/[A-Za-z0-9]*\.[A-Za-z0-9]*/","/",$_FILES['fileUploadName']['name']);

	// read the file 
	if($handle=fopen($file,'r+')){
		$txt='';
		while(!feof($handle)){
			$txt.=fread($handle,1024);
		}
		// decode
		$data=decode_format($txt,$format);
		// send out by assigning to JScript variable
		// header('Content-type: text/html');
		// 	$page=html_template($data);
		header('Content-type: text/javascript');
		echo $data;
	}
	
} else 
// if not an imported filepath, then use regular POST values
if(isset($_POST['format'])&&isset($_POST['filepath'])){
	
	#check to see if filename is malicious
	$name=$_POST['filepath']; 
	if(preg_match('/<|>/',$name)){
		die("ERROR READING FILE");
	}
	$txt='';
	
	// use for HTTP
	$txt=file_get_contents($name);
	// send to decode format
	$data=decode_format($txt,$_POST['format']);
	// send out using JScript
	header('Content-type: text/javascript');
	echo $data;	
	
}



?>