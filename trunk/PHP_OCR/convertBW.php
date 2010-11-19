<?php 
include "imageOCR.php";

$left = floatval($_GET["left"]);
$right = floatval($_GET["right"]);
$top = floatval($_GET["top"]);
$bottom = floatval($_GET["bottom"]);
$threshold = floatval($_GET["threshold"]);
$uri = $_GET["uri"];
$iocr = new imageOCR();
//$dims = array("top"=>220,"bottom"=>800,"right"=>1450,"left"=>300);
$dims = array("top"=>$top,"bottom"=>$bottom,"right"=>$right,"left"=>$left);
//$iocr->LoadImg("../Images/ham.jpg",$threshold,$dims);
$iocr->LoadImg($uri,4000000,$dims);

//$iocr->LoadImg($uri,$threshold,$dims);

$width = $right-$left;
$height = $bottom-$top;
$im2 = imagecreatetruecolor($width, $height);

header('Content-type: image/jpeg');
$iocr->change_color();
imagecopy($im2, $iocr->image, 0, 0, $left, $top, $width, $height);


imagejpeg($im2);


?>