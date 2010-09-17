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
			$img=@imagecreatefromjpeg($file);
			# $img=new Imagick();
			# $img->setResolution(72,72);
			# $img->readImage($file);
			# $img->setImageFormat("jpeg");
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/jpeg; filename=\"tmp.jpg\"");
			
			# going to manipulate data output by imagejpeg - start ob
			# $IG=imagecreatetruecolor($imgData[0]*.25,$imgData[1]*.25);
			# imagecopyresampled($IG,$img,0,0,0,0,($imgData[0]*.25),($imgData[1]*.25),$imgData[0],$imgData[1]);
			imagejpeg($img);
			// ob_start();
			// 		imagejpeg($img);
			// 		$cdata=ob_get_contents();
			// 		ob_end_clean();
			// 		
			// 		$cdata=substr_replace($cdata,pack('cnn',1,72,72),13,5);
			// 		
			// 		echo $cdata;
			
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