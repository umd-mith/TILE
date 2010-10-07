<?php
# getVars
# checks to make sure that the incoming $_GET['file'] variable is not malicious
# and doesn't serve up extra code into the TILE interface

# author: Grant Dickie

if(!(isset($_GET['file']))) 
	die("Error: NO file given");
$file=$_GET['file'];
if(preg_match('/json$|JSON$/')==0)
	die("Security Error: malicious file given")



function checkCode($path){
	$fp=fopen($path,'r');
	$contents="";
	while(!feof($fp)){
		$contents.=fread($fp,264);
	}
	$tokens=preg_split('/\n/',$contents);
	for($x=0;$x<count($tokens);$x++){
		if(preg_match('/http:\/\//',$tokens[$x])){
			
		}
	}
	
}

checkCode($file);



?>