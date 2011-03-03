<?php
# uses various TILE PHP script libraries to 
# import data


include_once('simpleJSONLoad.php');

# OCCURS ON PAGE LOAD
$res=null;
# take GET file and put it in process
$f=$_GET['file'];
$str='';
# if this is a URL, use the CURL function above
# to get the data
if(preg_match('/\.xml/',$f)){
	
} else if(preg_match('/http\:\/\//i',$f)){
	
	$str=getURL($f);
	
	if(preg_match('/\{\'images\':/i',$str)){
		# different model - use the SM converter
		$res=parseStringIntoJSON($str);
	} 
	
	
} else {
	$raw=inputJSON($f);
	$res=parseStringIntoJSON($raw);
}
if(isset($_GET['pretty'])){
	echo jsonPretty($res);
} else {

	echo json_encode($res);
}



?>