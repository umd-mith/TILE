<?php
# uses various TILE PHP script libraries to 
# import data


include_once('simpleJSONLoad.php');
include_once('importXMLLib.php');


# OCCURS ON PAGE LOAD
$res=null;
# take GET file and put it in process
$f=$_GET['file'];

# cancel the operation if this is an
# unsafe file

if((preg_match('/^[http\:\/\/]|\.json|\.php|\.txt|\.xml|\.html/i',$f))==0){
	# something wrong with the file - not recognized
	header('HTTP/1.0 415 Error file not recognized');
	die();
}

$str='';
# if this is a URL, use the CURL function above
# to get the data
if(preg_match('/\.xml/',$f)){
	# use the import XML library
	$res=convertXMLIntoTILEJSON($f,'text',0);
} else if(preg_match('/^http\:\/\//i',$f)){
	# either a script or REST protocol - get file
	# then determine the type of data returned
	$str=getURL($f);
	
	if(preg_match('/\{\'images\':|\{\"images/i',$str)){
		# different model - use the SM converter
		$res=parseStringIntoJSON($str);
	} else {
		echo $str;
	}
	
	
} else if(preg_match('/\{&\}/i',$f)>0) {
	echo 'is a random var';
	# just a string that needs to be parsed
	$raw=inputJSON($f);
	$res=parseStringIntoJSON($raw);
} else if(preg_match('/\.html|^file\:\/\//',$f)>0){
	if(preg_match('/^file\:/',$f)==0){
		$f='file:/'.$f;
	}
	# is a file path - get contents
	$raw=file_get_contents($f);
	echo $raw;
} else {
	# something wrong with the file - not recognized
	header('HTTP/1.0 415 Error file not recognized');
	die();
}


if(isset($_GET['pretty'])){
	echo jsonPretty($res);
} else {

	echo json_encode($res);
}



?>