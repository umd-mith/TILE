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

getData($file);
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






?>