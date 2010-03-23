<?php
if($_GET['urls']){
	$doc="<?php 
		
	";
	$loadpageparams="";
	$urlarray=preg_split("/%/",$_GET['urls']);
	for($item in $urlarray){
		$url=preg_split("/::/",$item);
		$loadpageparams.=$url[0];
	}
}


header("Location: ".$_SESSION['HTTP_REFERER']);

?>