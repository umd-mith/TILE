<?php
# PHP Importing library designed for use in TILE
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

# copies a given object and returns result
function copyObject($obj){
	$resultObj=array();
	
	foreach($obj as $key=>$prop){
		if(is_null($resultObj[$key])){
			$resultObj[$key]=array();
		}
		
		if(is_array($prop)){
			$v=copyObject($prop);
			array_push($resultObj[$key],$v);
		} else {
			$resultObj[$key]=$prop;
		}
	}
	return $resultObj;
}

# take a string of the SimpleModel JSON and convert
# it into TILE JSON
function parseStringIntoJSON($str){
	# create shell for final array that will be
	# loaded into TILE
	$result=array('pages'=>array(),'labels'=>array());
	# make string into a JSON object
	$json=json_decode($str);
	# quick lookup array
	$pageMatch=array();
	
	# go through pages and make a new page for each new image
	foreach($json->images as $img){
		
		# new page obect
		$page=array('id'=>$img->id,'url'=>$img->url,'lines'=>array());
		array_push($result['pages'],$page);
		
		
	}
	
	# make sure to store imagelist connections first
	foreach($json->links as $pageref){
		# only store links between pages
		# and other objects
		$p=null;
		foreach($pageref as $arr=>$id){
			if(is_null($p)&&($arr=='images')){
				# is a page
				# put other object into page
				# first, find the page
				/*
				foreach($result['pages'] as &$page){
					if($id==$page['id']){
						$p=$page;
						break;
					}
					
				}
				*/
				$p=$id;
				# got page, now find other object
				
			} else {
				# got page
				foreach($json->$arr as &$prop){
					if($prop->id==$id){
						# found the object, insert 
						# into page
						if($arr=='text') $arr='lines';
						if(is_null($p[$arr])){
							$p[$arr]=array();
							
						}
						
						
						# copy object
						$or=copyObject($prop);
						if($or['content']){
							$or['text']=$or['content'];
						}
						# find the page and insert
						foreach($result['pages'] as &$page){
							if($page['id']==$p){
								array_push($page[$arr],$or);
							
								break;
							}
						}
					
						break;
						
					}
				}
				# store as object that belongs in a page
				$pageMatch[$id]=$p['id'];
			}
		}
	}
	
	# go through array references again and this 
	# time only focus on the links between non-page
	# objects
	foreach($json->links as $ref){
		# check what objects are linked
		$obj1=null;
		$obj1Key=null;
		# first link obj1 with obj2
		foreach($ref as $key=>$id){
			# skip images
			if($key=='images') break;
			if($key=='text') $key='lines';
			if(is_null(obj1)){
				# init first object
				# if the object ID is in pageMatch,
				# match it with that page
				$obj1Key=$key;
				if(is_null($pageMatch[$id])){
					# not in a page
					# initialize result array if not already
					if(is_null($result[$key])){
						$result[$key]=array();
					}
					
					foreach($result[$key] as &$obj){
						if($id==$obj['id']){
							$obj1=$obj;
							
							break;
						}
					}
					
					if(is_null(obj1)){
						# find the object in json
						# and put it in result
						foreach($json->$key as $prop){
							if($prop->id==$id){
								# found object
								
								# put into the results array
								array_push($result[$key],$prop);
								# need to use the referenced value 
								# in results, not in json
								foreach($result[$key] as &$val){
									if($prop->id==$val['id']){
										$obj1=$val;
										break;
									}
								}
							}
						}
					}
				} else {
				
					# in a page - find the page then the obj
					$p=null;
					foreach($result['pages'] as &$page){
						
						if($page['id']==$pageMatch[$id]){
							$p=$page;
							#find object in the page
							foreach($p[$key] as &$obj){
								if($obj['id']==$id){
									# set obj1
									$obj1=$obj;
									
									# push on to array for obj2
									if(is_null($obj[$obj1Key])){
										# init array
										$obj[$obj1Key]=array();
									}
									# push on to obj array the obj1 id
									array_push($obj[$obj1Key],$ob);
								}
							}
							break;
						}
					}
					
				
					
				} 
				
			} else {
				# obj1 already found - now link this next object
				# with obj1
				# find in the page or 
				# in the global results
				if($pageMatch[$id]){
					# this is a page
					# locate and attach obj1 inside page
					foreach($result['pages'] as &$val){
						if($val['id']==$pageMatch[$id]){
							# page found - find second
							# object
							$obj2=null;
							
							foreach($val[$key] as &$o){
								if($id==$o['id']){
									$obj2=$o;
									break;
								}
							}
							
							
							# link objects together
							
							# make sure to set up 
							# array if not present
							if(is_null($o[$obj1Key])){
								$o[$obj1Key]=array();
							}
							array_push($o[$obj1Key],$obj1['id']);
							
							# connect the obj1 to obj2
							if(is_null($obj1[$key])){
								# init array
								$obj1[$key]=array();
							}
							# push on to obj1 array
							array_push($obj1[$key],$id);
							
							break;
						}
					}
					
				} else {
					# find object in results, or 
					# insert into results
					$obj2=null;
					
					if(is_null($result[$key])){
						# need to init
						
						#first find in json
						foreach($json->$key as $prop){
							if($id==$prop->id){
								$obj2=$prop;
								break;
							}
						}
						
						$result[$key]=array($obj2);
						# get actual result reference
						foreach($result[$key] as &$o){
							if($o['id']==$id){
								$obj2=$o;
								break;
							}
						}
					}
					
					if(is_null($obj2)){
						# get actual result reference
						foreach($result[$key] as &$o){
							if($o['id']==$id){
								$obj2=$o;
								break;
							}
						}
					}
					
					# link objects together
					
					# push onto obj1 array
					if(is_null($obj1[$key])){
						$obj1[$key]=array();
						
					}
					array_push($obj1[$key],$obj1['id']);
					
					# push onto obj2 array
					if(is_null($obj2[$obj1Key])){
						$obj2[$obj1Key]=array();
						
					}
					array_push($obj2[$obj1Key],$obj1['id']);
					
					
					
					
				} 
			}
		}
	}
	
	#return a copy of the array
	return $result;
	
}

# returns a string object - for loading directly into TILE
function parseStringIntoString($str){
	$result="";
	
	
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

function getURL($url){
	
	$c=curl_init($url);
	if(!$c){
		# returned false - init 500 error
		header('HTTP/1.0 500 Error could not reach URL');
	}
	# set headers for HTML input
	$headers = array ("Content-type: application/json;charset=ISO-8859-1,UTF-8;",
							"Accept: application/json,text/plain");
	
	# curl_setopt($ch, CURLOPT_URL, $_POST['rest_service']);

	curl_setopt($c, CURLOPT_HTTPHEADER, $headers);
	# make sure curl doesn't output what it finds directly
	curl_setopt($c,CURLOPT_RETURNTRANSFER,true);
	
	$f=curl_exec($c);
	if(!$f){
		# returned false - init 500 error
		header('HTTP/1.0 500 Error in opening URL');
	}
	
	curl_close($c);
	return $f;
}





?>