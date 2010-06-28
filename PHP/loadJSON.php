<?php
include_once('session.php');

if($_POST["jsonData"]){
	$_SESSION['json']=$_POST["jsonData"];
}


?>