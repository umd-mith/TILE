<?php
include_once('session.php');

if($_POST["jsonData"]){
	$_SESSION['json']=$_POST["jsonData"];
	//get rid of extraneous text data
	$json=json_decode($_SESION['json']);
	foreach($json->{'pages'} as $page => $item){
		
		foreach($item->{'lines'} as $url => $line){
			$line=preg_replace("/\/u0009/","",$line);
		}
	}
	$next=preg_replace('/\/PHP\/loadJSON.php/',"/index.html",$_SERVER['PHP_SELF']);
	
	header("Location: ".$next);
}


?>