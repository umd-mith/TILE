<?php
/**
 * Requires: imageOCR.php
 * 
 * Uses imageOCR class to recognize lines in an image
 */

include_once("imageOCR.php");

if(isset($_GET["src"])&&
isset($_GET["top"])&&isset($_GET["left"])&&isset($_GET["bottom"])
&&isset($_GET["right"])&&isset($_GET["orgwidth"])&&isset($_GET['orgheight'])
){
	// convert all red in the image to green
	$getSrc = $_GET["src"];
	$getOrgW = $_GET["orgwidth"];
	$getOrgH = $_GET["orgheight"];
	//original image sizes from jscript
	/*
	
	$getOrgL = $_GET["origL"];
	$getOrgT = $_GET["origT"];
	
	*/
	$getTop = $_GET["top"];
	$getLeft = $_GET["left"];
	$getBottom = $_GET["bottom"];
	$getRight = $_GET["right"];
	$minCol = isset($_GET["minCol"])?$_GET["minCol"]:null;
	
	$minRow = isset($_GET["minRow"])?$_GET["minRow"]:null;
	$minSpace = isset($_GET["minSpace"])?$_GET["minSpace"]:null;
	$minDots=isset($_GET["mindots"])?$_GET['mindots']:null;
	
	$threshold = isset($_GET["thresh"])?$_GET["thresh"]:null;
	$lineHeight = isset($_GET["lineHeight"])?$_GET["lineHeight"]:null;
	
	$ocr=new imageOCR();
	$ocr->configureOCR(array("thresh"=>$threshold,"top"=>$getTop,"left"=>$getLeft,"bottom"=>$getBottom,
	"right"=>$getRight,"cols"=>$minCol,"rows"=>$minRow,"mindots"=>$minDots,"minline"=>$lineHeight,
	"scalewidth"=>$getOrgW,"scaleheight"=>$getOrgH));
	
	$ocr->LoadImg($_GET["src"]);
	$ocr->displayLines();
	
	/*
	$img=null;
	
	$sizes=getimagesize($getSrc);
	if($sizes['mime'] == 'image/jpeg') {
		$img = LoadJpeg($getSrc);
	} else if($sizes['mime'] == 'image/tiff'){
		$img = LoadJpeg($getSrc);
	}
	$ratioW=1;
	$ratioH=1;
	*/
	
	/*
	if(($sizes[0] != $getOrgW) || ($sizes[1] != $getOrgH)) {
		$ratioW=$getOrgW/$sizes[0];
		$ratioH=$getOrgH/$sizes[1];
		
			
		
	$getLeft *= $ratioW;
		$getTop *= $ratioH;
		$getBottom *= $ratioH;
		$getRight *= $ratioW;
	
		
	}
	*/
	/*
if(($sizes[0] != $getOrgW)){
		$ratioW=$sizes[0]/$getOrgW;
		$getLeft *= $ratioW;
		$getRight *= $ratioW;
	}
	if(($sizes[1] != $getOrgH)){
		
		$ratioH=$sizes[1]/$getOrgH;
		$getTop *= $ratioH;
		$getBottom *= $ratioH;
		
	}
	
	$words = $_GET["return"];
*/
	
	
	
	
	
	//$thresh = imagecolorexact($img,$red,$green,$blue);
	
	
	//$image = change_color($img, $thresh, $getTop, $getLeft, $getBottom, $getRight);
	
	
	/*
	header('Content-type: image/jpeg');
	imagejpeg($image);
	*/
	
	
	
	
	
	
	
	
	
	/*
$hrlines = getLines($image, $getTop, $getLeft, $getBottom, $getRight, $minRow, $lineHeight);
	if ($words=="words"){
	$rects = getWords($image, $hrlines, $getLeft, $getRight, $minSpace, $minCol, $ratioW, $ratioH, $getOrgL, $getOrgT);
	
*/
	/*
foreach ($rects as $rect){
	
		echo implode(",",$rect)."\n";
	}
	}
	else{
	 
	foreach ($hrlines as $rect){
		echo $rect."\n";
	}
	}
*/
	
	
	
	
	
	
	

}

?>