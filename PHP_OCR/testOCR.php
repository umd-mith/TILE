<?php 
include "imageOCR.php";

$iocr = new imageOCR();
$iocr->LoadImg("../Images/ham.jpg");
header('Content-type: image/jpeg');
$iocr->change_color($image);
$iocr->showImage();

/*
$rgb = imagecolorat($im, 10, 15);

$colors = imagecolorsforindex($im, $rgb);

var_dump($colors);
*/
?>