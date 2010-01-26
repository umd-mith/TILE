<?php
//call command line

$image=$_FILES['datafile']['name'];
  
if($image){
	$command="tesseract ".$image." /Users/grantd/TESSERACT/ -l eng";
	exec($command);
}

?>