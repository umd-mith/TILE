<?php
/***
Set of functions to ensure that all GET and POST data 
are filtered and untainted 

author: Grant Dickie
created for MITH, 2010, for the TILE project

***/


include_once("kses.php");

function checkPOST($data){
	
	$allowable=array('uri'=>array());
	
	if(get_magic_quotes_gpc()){
		$data=stripslashes($data);
	}
	# returns a string returned by kses function
	# adding 3rd parameter to make sure that only http and https are used - not file:: or javascript: for example
	$passText=kses($data,$allowable,array('http','https'));
	return $passText;
}

function checkXML($data){
	$passText=preg_match('/\bphp\b$|\bPHP\b$|\bjs\b$|\bJS\b$|\bhtml\b$|\bhtm\b$|\bHTML\b$|\bHTM\b|[<>;]+/',$data);
	if($passText>0){
		die("Security Error Found in: ".preg_replace('/<[A-Za-z\t-]*>|([A-Za-z\t\n\w]*)/','',$data));
	} else {
		return $data;
	}
	
}




# Checks a link to make sure it is not a link to some kind of code, or has a 
# prefix other than https: or http: 
# If tainted URL, stops the program with a die() call
function checkLink($link){
	$passText=preg_match('/\bphp\b$|\bPHP\b$|\bjs\b$|\bJS\b$|[<>;]+/',$data);
	if($passText>0){
		die("Security Error Found in: ".preg_replace('/<[A-Za-z\t-]*>|([A-Za-z\t\n\w]*)/','',$data));
	} else {
		$allowed=array('PHP/1.5');
		# returns a string returned by kses function
		# adding 3rd parameter to make sure that only http and https are used - not file:: or javascript: for example
		return kses($data,$allowed,array('http','https'));
	}
}

#Checks a link to make sure it's only an image
function checkImgLink($data){
	$passText=preg_match('/\bphp\b$|\bPHP\b$|\bjs\b$|\bJS\b$|\bhtml\b$|\bhtm\b$|\bHTML\b$|\bHTM\b|[<>;]+/',$data);
	if($passText>0){
		die("Security Error Found in: ".preg_replace('/<[A-Za-z\t-]*>|([A-Za-z\t\n\w]*)/','',$data));
	} else {
		$allowed=array();
		# returns a string returned by kses function
		# adding 3rd parameter to make sure that only http and https are used - not file:: or javascript: for example
		return kses($data,$allowed,array('http','https'));
	}
}

function checkJSON($data){
	$firstTest=preg_match('/[{}]*/',$data);
	if($firstTest==0) die("Security Error: not a valid JSON datatype");
	$passText=preg_match('/\bphp\b$|\bPHP\b$|\bjs\b$|\bJS\b$|\bhtml\b$|\bhtm\b$|\bHTML\b$|\bHTM\b$/',$data);
	if($passText>0){
		die("Security Error Found in: ".preg_replace('/<[A-Za-z\t-]*>|([A-Za-z\t\n\w]*)/','',$data));
	} else {
		$allowed=array();
		# returns a string returned by kses function
		# adding 3rd parameter to make sure that only http and https are used - not file:: or javascript: for example
		return kses($data,$allowed,array('http','https'));
	}
}

?>