<?php
# PHP Importing script designed for use in TILE
# Uses the simple model as outlined by Gregor Middel
# Author: Grant Dickie
# 

# takes a JSON file and reads contents to 
# string
# returns string
function inputJSON($file){
	# make sure file is not malicious
	if(preg_match('/\.json|\.txt/i',$file)==0){
		die($file." is not a correct JSON file");
	}
	
	$str='';
	#get file contents
	$handle=fopen($file,'r');
	while(!feof($handle)){
		$str.=fread($handle,8192);
	}
	return $str;
}

# take a string of the SimpleModel JSON and convert
# it into TILE JSON
function parseStringIntoJSON($str){
	# create shell for final array that will be
	# loaded into TILE
	$result=array('pages'=>array(),'labels'=>array());
	# make string into a JSON object
	$json=json_decode($str);
	# go through pages and make a new page for each new image
	foreach($json->imagelist as $img){
		
		# new page obect
		$page=array('id'=>$img->id,'url'=>$img->url,'lines'=>array());
		array_push($result['pages'],$page);
		
	}
	
	# go through array references and add things together
	foreach($json->references as $ref){
		# check what objects are linked
		if($ref->imagelist){
			
			if($ref->textfragments){
				# add a line of text into the page
				$l=null;
				#find the line 
				foreach($json->textfragments as $text){
					if($text->id==$ref->textfragments){
						# found the object
						$l=$text;
						break;
					}
				}
			
				# create a new line object
				$lobj=array('id'=>$l->id,'text'=>$l->text);
					
					
				# attaching to a page - find page
				foreach($result['pages'] as &$page){

					if($page['id']==$ref->imagelist){
						# found page
						array_push($page['lines'],$lobj);
						
						break;
					}
				}	
				
				
			} else {
				# no handler for other objects right now
			}
		}
		
	}
	
	#return a copy of the array
	return $result;
	
}

# take a JSON array and print out
# it's structure in a user-friendly
# format
function jsonPretty($arr){
	$html='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
		"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

	<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
	<head>
	<title>TILE JSON</title>
	</head>
	<body><div class="main">';
	
	foreach($arr['pages'] as $page){
		$html.='<div class="page">Page<hr/><p>ID: '.$page['id'].'</p><p>URL: '.$page['url']."</p>";
		$html.='<div style="padding-left:15px;">';
		foreach($page['lines'] as $line){
			$html.="<p>Line ".$line['id']." ".$line['text']."</p>";
		}
		$html.="</div>";
		$html.="</div>";
	}
	
	return $html;
}

# take GET file and put it in process
$f=$_GET['file'];
$raw=inputJSON($f);
$res=parseStringIntoJSON($raw);
if(isset($_GET['pretty'])){
	echo jsonPretty($res);
} else {
	echo json_encode($res);
}


?>