<?php
/*
Export script for exporting data from TILE into the original format or 
just back into JSON
*/

if(isset($_POST['uploadData'])&&(isset($_POST['extraData']))&&(strlen($_POST['extraData'])>1)){
	//set up export using xml_stream_import
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
	//determine documen ttype
	$text=base64_decode($_POST['extraData']);
	$tileData=stripslashes($_POST['uploadData']);
	
	$xmlstring='';
	if(preg_match('/TEI/i',$text)){
		//TEI - use normal or facsimile
		if(preg_match('/facsimile/i',$text)){
			
			//facsimile usage 
			include_once('tei_p5_with_facsimile_import.php');
			$parser=new TEIP5WithFacsimileImport($text,$tileData);
			
			//convert the tile into XML 
			$parser->convertTileToXML();
		
			$xmlstring=$parser->outputTILEXML();
			
		} else {
		
			//non-facsimile
			include_once('tei_p5_import.php');
			$parser=new TEIP5Import($text,$tileData);
			//convert the tile into XML 
			$parser->convertTileToXML();
		
			$xmlstring= $parser->outputTILEXML();
		}
		
	}
	
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.$filename);
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0,pre-check=0');
	header('Pragma: public');
	echo $xmlstring;
} elseif(isset($_POST['uploadData'])){
	//outputting as json
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
	header('Content-Description: File Transfer');
	header('Content-Type: application/octet-stream');
	header('Content-Disposition: attachment; filename='.$filename);
	header('Content-Transfer-Encoding: binary');
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0,pre-check=0');
	header('Pragma: public');
	
	echo $JSON;
}


?>