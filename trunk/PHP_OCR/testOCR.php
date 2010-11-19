<?php 
include "imageOCR.php";
$iocr = new imageOCR();
$dims = array("top"=>220,"bottom"=>800,"right"=>1450,"left"=>300);
$iocr->LoadImg("../Images/ham.jpg",4000000,$dims);
header('Content-type: image/jpeg');
$iocr->change_color($image);
$iocr->showImage();


?>