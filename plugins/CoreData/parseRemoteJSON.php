<?php
# Parse Remote JSON files
# For use in TILE
# author: Grant Dickie, MITH
#
#
#


$ids=array();
$file=$_GET['file'];
if(preg_match("/^<[A-Za-z]*/",$file)>0){
	# contains html
	die("Error parsing ".$file);
}

# create a unique ID 
function genLineID(){
	$str=preg_split('/ /',"A B C D eE F G h i J ak L l M m N n O o P p Q q R r S s T t U u V v e8 9a 0i");
	
	$n=rand(0,1000);
	$x=rand(0,(count($str)-1));
	$id=$str[$x].$n;
	while(in_array($id,$ids)){
		$n=rand(0,1000);
		$x=rand(0,(count($str)-1));
		$id=$str[$x].$n;
	}
	array_push($ids,$id);
	return $id;
}
# takes JSON PHP object
function parseOut($json){
	
	if(is_null($json)) die("Returned JSON is null");
	#go through entire JSON to make sure lines have ID values attached
	foreach($json->{'pages'} as $page){
		#inside loop - looking at page
		foreach($page->{'lines'} as $line){
			#inner loop - looking at lines of $page
			if((is_null($line->{'id'})||($line->{'id'}=='undefined'))){
				# generate line id
				$line->{'id'}=genLineId();
			}
		}
	}
	return $json;
}

# Gets contents of the [safe] url and 
# then echos them out 
function getData($url){
	$fp=fopen($url,'r');
	$content="";
	while(!feof($fp)){
		$content.=fread($fp,8192);
	}
	#check to make sure JSON string is parsed
	#correctly
	$j=parseOut(json_decode($content));
	
	
	echo json_encode($j);
	#close stream
	fclose($fp);
}

function getScript($url){
	# go to script page
	header('Location: '.$url);
}
$file=preg_replace('/_AND_/',"&",$file);

if(preg_match("/\.(txt)|(json)|(TXT)|(JSON)/",$file)>0){

	# some kind of text file - get it
	getData($file);
}

if(preg_match("/\.php|\.PHP|\.js|\.JS/",$file)>0){
	#script - go to that page
	
	getScript($file);
}




?>