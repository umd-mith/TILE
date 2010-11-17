<?php
# Parse Remote JSON files
# For use in TILE
# author: Grant Dickie, MITH
#
#
#

$file=$_GET['file'];
if(preg_match("/^<[A-Za-z]*/",$file)>0){
	# contains html
	die("Error parsing ".$file);
}


# Gets contents of the [safe] url and 
# then echos them out 
function getData($url){
	$fp=fopen($url,'r');
	$content="";
	while(!feof($fp)){
		$content.=fread($fp,8192);
	}
	echo $content;
	#close stream
	fclose($fp);
}

function getScript($url){
	# go to script page
	header('Location: '.$url);
}
$file=preg_replace('/_AND_/',"&",$file);

if(preg_match("/\.txt$|\.json$|\.TXT$|\.JSON$/",$file)>0){
	# some kind of text file - get it
	getData($file);
}

if(preg_match("/\.php|\.PHP|\.js|\.JS/",$file)>0){
	#script - go to that page
	
	getScript($file);
}




?>