<?php
include_once('session.php');

if(isset($_SESSION["json"])){
	
	
	$j=$_SESSION["json"];
	$j= stripslashes($j);
	$j=stripslashes($j);
	echo $j;
} 
//end session
session_destroy();

?>