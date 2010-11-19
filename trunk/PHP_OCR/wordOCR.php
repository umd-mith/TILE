<?php
ini_set(	"memory_limit", "16M");

function LoadJpeg($imgname)
{
    $im = @imagecreatefromjpeg($imgname); /* Attempt to open */
    if (!$im) { /* See if it failed */
        $im  = imagecreatetruecolor(150, 30); /* Create a black image */
        $bgc = imagecolorallocate($im, 255, 255, 255);
        $tc  = imagecolorallocate($im, 0, 0, 0);
        imagefilledrectangle($im, 0, 0, 150, 30, $bgc);
        /* Output an errmsg */
        imagestring($im, 1, 5, 5, "Error loading $imgname", $tc);
    }
    return $im;
}
function change_color($image, $threshold=8500000, $top=103, $left=260, $bottom=1300, $right=992)
{
    $image_width = imagesx($image);
    $image_height = imagesy($image);
    // iterate through x axis
	$lastpixel = 0;
	$inLine = 0;
    $hrlines =  array();
	$hrlines[] = $top;
	for ($y = $top; $y < $bottom; $y++) {
	$blackdots = 0;
        // iterate through y axis
        for ($x = $left; $x < $right; $x++) {
            // look at current pixel
            $pixel_color = imagecolorat($image, $x, $y);
			// test threshold 8500000
            if (($pixel_color <= $threshold) && ($pixel_color >= 0)) {
      			imagesetpixel($image, $x, $y, imagecolorexact($image,0,0,0));
               
            }
			else{
				imagesetpixel($image, $x, $y, imagecolorexact($image,255,255,255));
			}
			
        }	
    }
	return $image;
}
function getLines($image, $top=103, $left=260, $bottom=1300, $right=992, $minDotsPerRow=25, $minLineHeight=20){
	$image_width = imagesx($image);
    $image_height = imagesy($image);
	$width = $right-$left;
	$boxes = array();
	
    // iterate through x axis
	$lastpixel = 0;
	$inLine = 0;
	
    $hrlines =  array();
	$hrlines[] = $top;
	for ($y = $top; $y < $bottom; $y++) {
		$blackdots = 0;
	
	 
        // iterate through y axis
        for ($x = $left; $x < $right; $x++) {
            // look at current pixel
            $pixel_color = imagecolorat($image, $x, $y);
			// test threshold 8500000
            if ($pixel_color == 0) {
      				
               $blackdots = $blackdots+1;
            }
			
			
        }
		$avg = $blackdots/$width;
		$minDotsPerRow = 25;
		//echo "*$avg*\n";
		// line space usually 25
		if (($inLine==0)&&($blackdots>=$minDotsPerRow)){
		//if (($inLine==0)&&($avg>=.5)){			
			$inLine = 1;
			
			
		}
		else if (($inLine==1)&&($blackdots<$minDotsPerRow)){
	//	else if (($inLine==1)&&($blackdots<.5)){	
				$lastHr =count($hrlines) - 1;
				//minlineheight = 20	
				if (($y-$hrlines[$lastHr])>$minLineHeight){
			imageline($image,$left,$y,$right,$y,0);
			$hrlines[]=$y;
			$inLine = 0;
			
			}
		}
		
	
    }

	


			
	
/*	foreach ($boxes as $rect){
		
		imagerectangle($image,$rect[0],$rect[1],$rect[2],$rect[3],65341);
	}*/
	//echo count($boxes);
	return $hrlines;
}
function getWords($image,$hrlines,$left,$right,$colsPerSpace,$minDotsPerCol, $ratioW, $ratioH, $getOrgL, $getOrgT){
	$boxes =array();
	for ($i=1;$i<count($hrlines);$i++){
		$inWord = 0;
		$blanklines=0;
		$vtlines = array();
		$vtlines[] = $left;
		
		for ($x = $left; $x < $right; $x++) {
			$blackdots = 0;	
			for($y=$hrlines[($i-1)];$y<$hrlines[$i];$y++){
			
	     	$pixel_color = imagecolorat($image, $x, $y);
            		  if ($pixel_color == 0) {
      				
              			 $blackdots = $blackdots+1;
						 $lastBlackDot = $x;
            		}
            		
				
            		
			
			}
		
			if ($blackdots<$minDotsPerCol){
				$blanklines = $blanklines+1;
				//colsPerSpace originially 5
				if (($inWord==1)&&($blanklines>$colsPerSpace)){
					
					imageline($image,$x,$hrlines[($i-1)],$x,$hrlines[$i],0);
					$vtlines[]=$x;
					$blanklines = 0;
					$inWord = 0;
				}
			
			}
			else{
				$inWord =1;
				$blanklines=0;
			
			}
					}
		for ($j=1;$j<count($vtlines);$j++){
			$box = array((($vtlines[($j-1)]/$ratioH)-$getOrgL),(($hrlines[($i-1)]/$ratioW)-$getOrgT),($vtlines[$j]/$ratioH),($hrlines[$i]/$ratioW));
			
			$boxes[] = $box;
			
		}
			}
	
	return $boxes;
}
// EXAMPLE:

// convert all red in the image to green
$getSrc = $_GET["src"];
//original image sizes from jscript
$getOrgW = $_GET["origW"];
$getOrgH = $_GET["origH"];
$getOrgL = $_GET["origL"];
$getOrgT = $_GET["origT"];

$getTop = $_GET["top"];
$getLeft = $_GET["left"];
$getBottom = $_GET["bottom"];
$getRight = $_GET["right"];




$minCol = $_GET["minCol"];
//$hrlines = $_GET["hrlines"];
$minRow = $_GET["minRow"];
$minSpace = $_GET["minSpace"];

$threshold = $_GET["thresh"];
$lineHeight = $_GET["lineHeight"];
$img=null;

$sizes=getimagesize($getSrc);
if($sizes['mime'] == 'image/jpeg') {
	$img = LoadJpeg($getSrc);
} else if($sizes['mime'] == 'image/tiff'){
	$img = LoadJpeg($getSrc);
}
$ratioW=1;
$ratioH=1;

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


$red = hexdec(substr($threshold,0,2));
$green = hexdec(substr($threshold,2,2));
$blue = hexdec(substr($threshold,4,2));


$thresh = imagecolorexact($img,$red,$green,$blue);


$image = change_color($img, $thresh, $getTop, $getLeft, $getBottom, $getRight);


/*
header('Content-type: image/jpeg');
imagejpeg($image);
*/









$hrlines = getLines($image, $getTop, $getLeft, $getBottom, $getRight, $minRow, $lineHeight);
if ($words=="words"){
$rects = getWords($image, $hrlines, $getLeft, $getRight, $minSpace, $minCol, $ratioW, $ratioH, $getOrgL, $getOrgT);

foreach ($rects as $rect){

	echo implode(",",$rect)."\n";
}
}
else{
 
foreach ($hrlines as $rect){
	echo $rect."\n";
}
}





imagedestroy($image);
?>
