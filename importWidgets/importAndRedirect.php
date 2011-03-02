<?php
# Imports data using TILE PHP libraries
# then redirects the user to the TILE page with the data loaded

include_once('session.php');
include_once('simpleJSONLoad.php');

# OCCURS ON PAGE LOAD
$res=null;
# take GET file and put it in process
$f=$_GET['file'];
# if this is a URL, use the CURL function above
# to get the data
if(preg_match('/http\:\/\//i',$f)){
	$str=getURL($f);
	
	$res=parseStringIntoJSON($str);
} else {
	$raw=inputJSON($f);
	$res=parseStringIntoJSON($raw);
}



# send a POST request to loadJSON
$ch=curl_init('../PHP/loadJSON.php');
$headers = array ("Content-type: application/json;charset=ISO-8859-1,UTF-8;",
						"Accept: application/json");
$content={'jsonData':$res};
# curl_setopt($ch, CURLOPT_URL, $_POST['rest_service']);

curl_setopt($c, CURLOPT_HTTPHEADER, $headers);
curl_setopt($c, CURLOPT_POSTDATA, )


?>