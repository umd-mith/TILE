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
	<script type="text/javascript" src="nospacebar.js"></script>
	<script type="text/javascript" src="lib/jquery/development-bundle/ui/ui.core.js"></script>
 	<script type="text/javascript" src="lib/jquery/development-bundle/ui/ui.slider.js"></script>
	<script type="text/javascript" src="lib/Extensible/Monomyth.js"></script>
		<script type="text/javascript" src="lib/_Interface/base.js"></script>
		<script type="text/javascript" src="lib/_Interface/tile_base.js"></script>
	<script type="text/javascript" src="lib/Engine/EngineInit.js"></script>

	<script type="text/javascript" src="lib/AutoRecognizer/AutoRecognizer.js"></script>
	<script type="text/javascript" src="lib/Box/Box.js"></script>
	<script type="text/javascript" src="lib/Shape/Shape.js"></script>

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
	<script type="text/javascript" src="lib/ScrollingImages/AnimatedScroller.js"></script>
	<script type="text/javascript" src="lib/vectordrawingNik/underscore.js"></script>
    <script type="text/javascript" src="lib/vectordrawingNik/NeoVectorDrawer.js"></script>

	<style>
		.nameValue{
			border:2px dotted;
		}
	</style>

<link rel="SHORTCUT ICON" href="favicon.ico">
	
</head>

<body>
	<?php
	//include list of CONSTANT values - see TILECONSTANTS.php script for info
	include_once('TILECONSTANTS.php');
	
	// Receives POST data - if submitted
	 if($_POST['jsonData']&&(preg_match("/.exe|.php/",$_POST['jsonData'])==0)){
	 	$out=stripslashes($_POST['jsonData']);
 		$defStr="<SCRIPT TYPE=\"text/javascript\">var _JSON=\"".$out."\";";
		//include the base url path
		if(BASE_URL){
			$defStr.="var _BASE_URL=\"".BASE_URL."\";</SCRIPT>";
		}else{
			$defStr.="</SCRIPT>";
		}
 		echo $defStr;
		
 	} else {
		//echo "<SCRIPT TYPE=\"text/javascript\">var _JSON=null;";
		$defStr="<SCRIPT TYPE=\"text/javascript\">var _JSON=null;";
		//include the base url path
		if(BASE_URL){
			$defStr.="var _BASE_URL=\"".BASE_URL."\";</SCRIPT>";
		}else{
			$defStr.="</SCRIPT>";
		}
 		echo $defStr;
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
				if(_JSON&&_BASE_URL){
			
					var littleenginethatcould=new EngineInit({
						attach:$("#content"),
						json:_JSON,
						baseurl:_BASE_URL
					});
					//erase json data
					_JSON=null;
				} else if(_BASE_URL){
					var littleenginethatcould=new EngineInit({
						attach:$("#content"),
						baseurl:_BASE_URL
					});
				} else {
					$("<p>Error: could not load page due to undefined _BASE_URL variable. Go to TILECONSTANTS.php to fix this problem.</p>").appendTo($("#content"));
				}
			});
		</script>

</body>
</html>
