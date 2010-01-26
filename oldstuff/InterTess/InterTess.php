<?php
/**
 * Talks to tesseract ocr
 */

if(isset($_GET['file'])&&isset($_GET['output'])){
	$file=trim($_GET['file']);
	$out=trim($_GET['output']);
	$command="tesseract ".$file." ".$out;echo $command."<Br/>";
	
	exec($command);
	
}

?>