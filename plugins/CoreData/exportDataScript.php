<?php
/*
Export script for exporting data from TILE into the original format or 
just back into JSON
*/

if(isset($_POST['uploadData'])&&(isset($_POST['extraData']))&&(strlen($_POST['extraData'])>1)){
	# set up export using xml_stream_import
	include_once('coredata.php');
	include_once('xml_stream_import.php');
	
	$filename='saveData.xml';
	if(isset($_POST['uploadFileName'])&&strlen($_POST['uploadFileName'])>1){
		if(preg_match('/\.xml/',$_POST['uploadFileName'])){
			$filename=$_POST['uploadFileName'];
		} else {
			$filename=$_POST['uploadFileName'].".xml";
		}
	}
	
	
	
	
	$parser=new XMLStreamImport('',stripslashes($_POST['uploadData']));
	$parser->convertTileToXML();
	$xmlstring=$parser->outputTILEXML();
	

	header('Content-type: text/xml');
	header('Content-Disposition: attachment; filename='.$filename);
	echo $xmlstring;
} elseif(isset($_POST['uploadData'])){
	# outputting as json
	$JSON=$_POST['uploadData'];
	//$JSON=addslashes($JSON);
	//format the JSON text elements
	//$dJSON=json_decode($JSON); //decode string
	
	$filename='';
	if(isset($_POST['uploadFileName'])&&(strlen($_POST['uploadFileName'])>1)){
		$filename=$_POST['uploadFileName'].".json";
	} else {
		$d=date("j\_n\_Y");
		$filename="tile_".$d.".json";
	}
	// $doc="<HTML><HEAD><SCRIPT language=\"JavaScript\">function send(){document.aData.submit();}</SCRIPT></HEAD><BODY onload=\"send()\">
	// 	<form name=\"aData\" method=\"POST\" action=\"".$cwd."\">
	// 	<input type=\"hidden\" name=\"jsonData\" value=\"".$JSON."\"/></form></BODY></HTML>";
	//force-download the doc-string to the user to save
	header('Content-Type: text/javascript');
	header('Content-Disposition: attachment; filename='.$filename);
	header('Content-Transfer-Encoding: binary');
	echo $JSON;
}


?>