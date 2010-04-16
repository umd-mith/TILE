<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"> 

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>

	<title>TILE: Text-Image Linking Environment</title>
	
	<!--><link type="text/css" href="lib/jquery/js/css/ui-lightness/jquery-ui-1.7.2.custom.css" rel="Stylesheet" />-->
	<link type="text/css" href="lib/jquery/development-bundle/themes/base/ui.all.css" rel="stylesheet" /> 
	<link type="text/css" href="skins/tileimage/css/style.css" rel="stylesheet" />	
  
	<script src="lib/jquery/js/jquery-1.3.2.min.js" type="text/javascript"></script>
	<script src="lib/jquery/js/jquery-ui-1.7.2.custom.min.js" type="text/javascript"></script>
	<script src="lib/jquery/js/jquery.pngFix.pack.js" type="text/javascript"></script>
	<script src="lib/jquery/js/mopslider/mopSlider-2.5.js" type="text/javascript"></script>
	<script src="lib/raphael.js" type="text/javascript" charset="utf-8"></script>
	
	<script type="text/javascript" src="lib/jquery/development-bundle/ui/ui.core.js"></script>
 	<script type="text/javascript" src="lib/jquery/development-bundle/ui/ui.slider.js"></script>
	<script type="text/javascript" src="lib/Extensible/Monomyth.js"></script>
	<script type="text/javascript" src="lib/Engine/EngineInit.js"></script>
	<script type="text/javascript" src="lib/Image/Image.js"></script>
	<script type="text/javascript" src="lib/AutoRecognizer/AutoRecognizer.js"></script>
	<script type="text/javascript" src="lib/Box/Box.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Rectangle.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Ellipse.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Polygon.js"></script>
	<script type="text/javascript" src="lib/Shape/Shape.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Drag.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Resize.js"></script>
	<script type="text/javascript" src="lib/ToolBar/TopToolbar.js"></script>
	<script type="text/javascript" src="lib/ToolBar/SideToolbar.js"></script>
	<script type="text/javascript" src="lib/ToolBar/TabBar.js"></script>
	<script type="text/javascript" src="lib/Tag/Tag.js"></script>
	<script type="text/javascript" src="lib/Tag/NameValue.js"></script>
	<script type="text/javascript" src="lib/Tag/Region.js"></script>
	<script type="text/javascript" src="lib/Dialog/Dialog.js"></script>
	<script type="text/javascript" src="lib/ScrollingImages/ScrollingImages.js"></script>
	<script type="text/javascript" src="lib/ToolBar/AutoRecognizerTools.js"></script>
	<script type="text/javascript" src="lib/SaveProgress/Save.js"></script>
	<script type="text/javascript" src="lib/SelectorTools/Drawer.js"></script>
	<script type="text/javascript" src="lib/JSONReader/jsonReader.js"></script>
	
	<link rel="stylesheet" href="lib/jquery/colorpicker/css/colorpicker.css" type="text/css" />
    <link rel="stylesheet" media="screen" type="text/css" href="lib/jquery/colorpicker/css/layout.css" />
	<script type="text/javascript" src="lib/jquery/colorpicker/js/colorpicker.js"></script>
    <script type="text/javascript" src="lib/jquery/colorpicker/js/eye.js"></script>
    <script type="text/javascript" src="lib/jquery/colorpicker/js/utils.js"></script>
   <!-- <script type="text/javascript" src="lib/jquery/colorpicker/js/layout.js"></script> -->

	<link rel="stylesheet" media="screen" type="text/css" href="skins/test/animatedscrolltest.css" />
	<script type="text/javascript" src="lib/ScrollingImages/AnimatedScroller.js"></script>
	<script type="text/javascript" src="lib/vectordrawingNik/underscore.js"></script>
    <script type="text/javascript" src="lib/vectordrawingNik/VectorDrawer.js"></script>
    
</head>

<body>
	<?php

	// Receives POST data - if submitted
	 if($_POST['jsonData']&&(preg_match("/.exe|.php/",$_POST['jsonData'])==0)){
	 	$out=stripslashes($_POST['jsonData']);
 		
 		echo "<SCRIPT TYPE=\"text/javascript\">var _JSON=\"".$out."\";</SCRIPT>";
 	} else {
	echo "<SCRIPT TYPE=\"text/javascript\">var _JSON=null;</SCRIPT>";
}	
	?>
	
			<div id="header">
				<div id="branding">
					<h1><a href="index.html">TILE: Text-Image Linking Environment</a></h1>
				</div>
			</div>

			<div id="sidebar">
		
			</div>
		
			<div id="content">
		
			</div><!-- end content -->
				
			
	
		<script>
			$(function(){
				//NEW: TO BE TAKEN OUT - setting the _JSON variable to allow for auto-loading
				//of schema and images (for testing only)
				// _JSON={
				// 					schema:"http://localhost:8888/TILE/lib/JSONReader/testSchema.json",
				// 					Images:"http://localhost:8888/TILE/html/testList.txt"
				// 				}
				if(_JSON){
			
					var littleenginethatcould=new EngineInit({
						attach:$("#content"),
						json:_JSON
					});
					//erase json data
					_JSON=null;
				} else {
					var littleenginethatcould=new EngineInit({
						attach:$("#content")
					});
				}
			});
		</script>

</body>
</html>
