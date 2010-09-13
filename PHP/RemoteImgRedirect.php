<?php
# Redirects images that are on remote servers



include_once("secureInput.php");

#check referer
if(isset($_SERVER['HTTP_REFERER'])&&(preg_match('/ftp:|FTP:|.JS|.js|.php|.PHP/',$_SERVER['HTTP_REFERER']))) 
	die("Security Error");

# should stop if link is bad
$path=checkLink($_GET["uimg"]);



function imgRedirect($file){
	# WARNING: images must pass the security tests from secureInput.php BEFORE getting here!
	# first get mime type
	$imgData=getimagesize($file);
	$img="";
	
	switch($imgData["mime"]){
		case "image/png":
			$img=imagecreatefrompng($file);
			header("Content-Type: image/png");
			imagepng($img);
			break;
		case "image/jpeg":
			$img=imagecreatefromjpeg($file);
			header("Content-Type: image/jpeg");
			imagejpeg($img);
			break;
		case "image/gif":
			$img=imagecreatefromgif($file);
			header("Content-Type: image/gif");
			imagegif($img);
			break;
		default:
			die("Security Error");
			break;
	}
	
	
	
}

imgRedirect($path);



?>