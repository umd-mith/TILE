<?php
/*
Export script for exporting data from TILE into the original format or 
just back into JSON
*/

if(isset($_POST['uploadData'])&&(isset($_POST['extraData']))){
	# set up export using xml_stream_import
	include_once('coredata.php');
	include_once('xml_stream_import.php');
	
	$filename='test.xml';
	if(isset($_POST['uploadFileName'])&&strlen($_POST['uploadFileName'])>1){
		$filename=$_POST['uploadFileName'].".xml";
	}
	
	$parser=new XMLStreamImport('',stripslashes($_POST['uploadData']));
	$parser->convertTileToXML();
	$xmlstring=$parser->outputTILEXML();
	

	header('Content-type: text/xml');
	header('Content-Disposition: attachment; filename='.$filename);
	echo $xmlstring;
}


?>