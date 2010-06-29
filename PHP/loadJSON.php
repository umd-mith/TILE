<?php
include_once('session.php');

if($_POST["jsonData"]){
	$_SESSION['json']=$_POST["jsonData"];
	$next=preg_replace('/\/PHP\/loadJSON.php/',"/index.html",$_SERVER['PHP_SELF']);
	
	header("Location: ".$next);
}


?>