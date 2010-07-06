<?php
include_once('session.php');

if(isset($_SESSION["json"])){
	$j=stripslashes($_SESSION["json"]);
	echo $j;
} 
//end session
session_destroy();

?>