<?php
/**
*TOPTOOLBAR HTML 
**/



?>

<h3>ToolBar</h3>
<span id="tab1" class="toolbar_mode">Do Some Image Stuffs</span>
<br/>
<span id="tab2" class="toolbar_mode">Do Some Text Stuffs</span>
<div id="colorbar_instructions" class="colorbarInstructions">
	<span id="colorbar_SETUPBOX">STEP 1: SET OCR REGION</span>
	<div id="colorbar_sliders" class="ColorBarSliders">
		<label class="colorbar_slider_label">STEP 1b: SET CONVERSION RGB</label>
		<h4>Color Sliders</h4>
		<br/>
		<label class="colorbar_slider_label">Red</label>
		<div id="colorbar_slider_red" class="colorbarslider"></div>
		<label class="colorbar_slider_label">Green</label>
		<div id="colorbar_slider_green" class="colorbarslider"></div>
		<label class="colorbar_slider_label">Blue</label>
		<div id="colorbar_slider_blue" class="colorbarslider"></div>
		<br/>
		<div id="colorbar_bkgdisplay" class="bkgDisplay">
			<label>Current Background Color:</label>
			<br/>
			<span id="bkg" class="bkgBox"></span>
		</div>
		<h4>Eyedropper Tool</h4>
		<span id="colorbar_eyedropper" class="eyedropper">USE EYEDROPPER<img id="colorbar_ed_img"></img></span>

	</div>
	<span id="colorbar_OCR">STEP 2: OCR</span>
	<br/>
	<span id="colorbar_test_rects">STEP 3: SHOW RECTANGLES</span>
	<hr/>
	
</div>
<div class="zoomcontrols">
	<span id="colorbar_ZOOMin" class="zoomcontrol">ZOOM IN</span>
	<br/>
	<span id="colorbar_ZOOMout" class="zoomcontrol">ZOOM OUT</span>
</div>
