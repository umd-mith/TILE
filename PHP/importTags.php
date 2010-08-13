<?php
//For importing tags into the TILE interface
//checks for $FILE input data and echos the contents of the given filename
include_once('session.php');

if (is_uploaded_file($_FILES['fileTags']['tmp_name']))
 { 
 
	// header("Location: ".$_SERVER['HTTP_REFERER']);
	$fileData = file_get_contents($_FILES['fileTags']['tmp_name']);
	echo $fileData;
	
 } else {
	//send user back to the main page
	header("Location: ".$_SERVER['HTTP_REFERER']);
	
}






?>