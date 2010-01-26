<?php
include_once('rememberState.php');echo $_GET['values'];
if(isset($_GET['values'])){
	$values=trim($_GET['values']);
	$pieces=preg_split('/_/',$values);
	foreach($pieces as $p){
		$data=preg_split("/::/",$p);
		$_SESSION[$data[0]]=$data[1];
	}
	echo $_SESSION['imgfolder']."<br/>".$_SESSION['xmlfile'];
}


?>