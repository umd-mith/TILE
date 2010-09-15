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
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/png; filename=\"tmp.png\"");
			
			imagepng($img,null,4);
			break;
		case "image/jpeg":
			$img=imagecreatefromjpeg($file);
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/jpeg; filename=\"tmp.jpg\"");
			imagejpeg($img,null,4);
			break;
		case "image/gif":
			$img=imagecreatefromgif($file);
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/gif; filename=\"tmp.gif\"");
			imagegif($img,null,4);
			break;
		default:
			die("Security Error");
			break;
	}
	
	
	
}

imgRedirect($path);



?>