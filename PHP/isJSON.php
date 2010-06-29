<?php
include_once('session.php');

if(isset($_SESSION["json"])){
	echo stripslashes($_SESSION["json"]);
	//end session
	session_destroy();
}
?>