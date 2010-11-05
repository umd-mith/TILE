<?php
# Redirects images that are on remote servers

header("no-cache");

include_once("secureInput.php");

#check referer
if(isset($_SERVER['HTTP_REFERER'])&&(preg_match('/ftp:|FTP:|.JS|.js|.php|.PHP/',$_SERVER['HTTP_REFERER']))) 
	die("Security Error");

# should stop if link is bad
$path=checkImgLink($_GET["uimg"]);

 function get_dpi($filename){  
   
     # open the file and read first 20 bytes.  
     $a = fopen($filename,'r');  
     $string = fread($a,20);  
     fclose($a);  
   
     # get the value of byte 14th up to 18th  
     $data = bin2hex(substr($string,14,4));  
     $x = substr($data,0,4);  
     $y = substr($data,4,4);  
     return array(hexdec($x),hexdec($y));  
   
 }

function imgRedirect($file){
	# WARNING: images must pass the security tests from secureInput.php BEFORE getting here!
	# first get mime type
	$imgData=getimagesize($file);
	$img="";

	switch($imgData["mime"]){
		case "image/png":
			$img=imagecreatefrompng($file);
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/png");
			
			imagepng($img,null,4);
			break;
		case "image/jpeg":
			$img=@imagecreatefromjpeg($file);
			// $dpi=get_dpi($file);
			// $dpiCorrect=(72/$dpi[0]);
			
			# $img=new Imagick();
			# $img->setResolution(72,72);
			# $img->readImage($file);
			# $img->setImageFormat("jpeg");
			header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
			header("Content-Type: image/jpeg");
			
			# going to manipulate data output by imagejpeg - start ob
			// $IG=imagecreatetruecolor($imgData[0]*$dpiCorrect,$imgData[1]*$dpiCorrect);
		// imagecopyresampled($IG,$img,0,0,0,0,($imgData[0]*$dpiCorrect),($imgData[1]*$dpiCorrect),$imgData[0],$imgData[1]);
			imagejpeg($img);
			imagedestroy($img);
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
			header("Content-Type: image/gif");
			imagegif($img,null,4);
			break;
		default:
			die("Security Error");
			break;
	}
	
	
	
}

imgRedirect($path);



?>