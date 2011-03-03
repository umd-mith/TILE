<?php
# use multiple PHP TILE libraries to export data from TILE JSON into other formats

include_once('exportSimpleModel.php');

function processMethod($format){
	switch($format){
		case 'JXML':
			# export to simplified representation of 
			# JSON in XML
			break;
		case 'TEI':
			# export to TEI
			
			break;
		case 'simple':
			$res=reverseJSONToSM($_POST['JSON']);
			break;
	}
}

$to=null;
if(isset($_POST['format'])){
	$to=$_POST['format'];
	
} else {
	echo json_encode($res);
	
}



?>