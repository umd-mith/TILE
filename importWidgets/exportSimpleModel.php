<?php
/*
PHP script for exporting a TILE JSON object back into the 
Simplified model - as defined by Mortiz Wissenbach and Gregor Middel
*/

# takes as input a JSON object in PHP
function reverseJSONToSM($arr){
	$result=array('images'=>array(),'text'=>array(),'links'=>array());
	foreach($arr['pages'] as $page){
		$p=array('id'=>$page['id'],'url'=>$page['url']);
		array_push($result['images'],$p);
		# create reference objecst for each type of link
		foreach($page as $key=>$prop){
			
			if((preg_match('/url|info|id/i',$key)==0)&&(is_array($prop))){
				# some kind of array
				if($key=='lines'){
					#replace lines with textfragments
					foreach($prop as $line){
						array_push($result['text'],$line);
						# store as reference
						$ref=array('text'=>$line['id'],'images'=>$page['id']);
						array_push($result['links'],$ref);
					}
					
				} else if($key=='shapes') {
					# save the SVG shape as a bounding box
					$bb=convertShape($prop);
					# push on to shapes stack
					if(is_null($result['shapes'])){
						$result['shapes']=array();
					}
					array_push($result['shapes'],$bb);
					
				} else {
					#create new array or add to existing array
					if(is_null($result[$key])){
						$result[$key]=array();
					}
					# insert the object into the correct array
					# and also register it as a reference to this page
					foreach($prop as $obj){
						array_push($result[$key],$obj);
						
						$ref=array($key=>$obj['id'],'images'=>$page['id']);
						array_push($result['links'],$ref);
					}
				}
			}
			
			
		}
	
	}
		#done converting over to Simple Model 
		return $result;
}

# take a TILE shape object and break it down
# to an object that describes a bounding box
# width, height, x, y
function convertShape($shpObj){
	$result=array('id'=>$shpObj['id'],'width'=>0,'height'=>0,'x'=>0,'y'=>0);
	foreach($shpObj as $key=>$prop){
		if(preg_match('/posInfo/i',$key)){
			# save all posInfo under EXTRA
			$result['extra']=array();
			# matched the position info of the shape - insert this
			# into the result
			foreach($prop as $k=>$o){
				if(!(is_null($result[$k]))){
					$result[$k]=$o;
				}
				$result[$k]=$o;
			}
			
			
		}
	}
	
	return $result;
}


?>