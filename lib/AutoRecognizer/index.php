 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<HEAD>
<link type="text/css" href="../jquery/js/css/ui-lightness/jquery-ui-1.7.2.custom.css" rel="Stylesheet" />
<link type="text/css" href="../jquery/development-bundle/themes/base/ui.all.css" rel="stylesheet" /> 
<link type="text/css" href="../../skins/ImageConversion.css" rel="stylesheet" />
<link type="text/css" href="./style.css" rel="stylesheet" />  

<!--  JQuery Stuff -->	
<script src="../jquery/js/jquery-1.3.2.min.js" type="text/javascript" charset="utf-8"></script>
<script src="../jquery/js/jquery-ui-1.7.2.custom.min.js" type="text/javascript" charset="utf-8"></script>
<!-- Project Scripts -->
<script type="text/javascript" src="../Extensible/Monomyth.js"></script>
<script type="text/javascript" src="../Box/Box.js"></script>
<script type="text/javascript" src="./AutoRecImage.js"></script>
<script type="text/javascript" src="../Shape/Shape.js"></script>
<script type="text/javascript" src="./AutoRecognizer.js"></script>
<script type="text/javascript" src="../ColorFilter/ColorFilter.js"></script>
<script type="text/javascript" src="../RegionRule/RegionRule.js"></script>
<script type="text/javascript" src="./AutoRecInterface.js"></script>
</HEAD>
<BODY>
<div id="header">
</div>

<div id="content">
	<div id="sidebar">
		<div id="sidebarHead">
			<label for="imageManifest">Images uri:</label>
			<input type="text" size=10></input>
			<div id="boxSize"></div>
			<div id="boxPos"></div>
		</div>
		<div id="colorSection">
		<span id='colorPanel' class='color'>
<label>Red:</label>
<div id='red'></div>
<label>Green:</label>
<div id='green'></div>
<label>Blue:</label>
<div id='blue'></div>
</span>
<div id='backgroundimage'>0,0,0</div>
</div>
		<div id="sidebarContent">
		</div>
	<div id="transcript">
	
	</div>	
	</div>
	<div id="workspace">
		<img id="srcImageForCanvas" src=""/>
		</img>
		<div id="regionBox" class="boxer_plainbox"></div>
	</div>
</div>
</BODY>
</HTML>