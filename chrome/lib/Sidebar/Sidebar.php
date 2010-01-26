<?php 
include_once('../State/rememberState.php');
?>

<div id="sidebar" class="sidebar">
	<div id="sidebarbody" class="sidebody">
		<ul id="sidelist" class="sidelist">
			<li class="sideitem">
				<label class="sideitemlabel">Image Folder Location</label>
				<input id="s_imgfolder" type="text" cols="2" value="<?php echo (isset($_SESSION['imgfolder']))?"".$_SESSION['imgfolder']:""; ?>" class="sideiteminput"></input>
				<label class="sideitemlabel">XML/Text File Location</label>
				<input id="s_xmltext" type="text" cols="2" value="<?php echo (isset($_SESSION['xmlfile']))?"".$_SESSION['xmlfile']:""; ?>" class="sideiteminput"></input>
			</li>
			<li class="sideitem">
				<label class="sideitemlabel">Threshold</label>
				<input id="s_threshold" type="text" cols="2" value="0" class="sideiteminput"></input>
			</li>
			<li class="sideitem">
				<label class="sideitemlabel">Minimum of Dots Per Row</label>
				<input id="s_dotsperrow" type="text" cols="1" value="0" class="sideiteminput"></input>
			</li>
			<li class="sideitem">
				<label class="sideitemlabel">Minimum Line Height</label>
				<input id="s_minlineheight" type="text" cols="1" value="0" class="sideiteminput"></input>
			</li>
			<li class="sideitem">
				<a id="s_addbox" class="sideitemoption">Add A Line Box</a>
			</li>
			<li class="sideitem">
				<a id="s_showbox" class="sideitemoption">Show Box</a>
			</li>
			<li class="sideitem">
				<a id="s_init" class="sideitemoption">Start OCR</a>
				
			</li>
			<li class="sideitem">
				<a id="s_startover" class="sideitemoption">Start Over</a>
			</li>
			<li class="sideitem">
				<a id="s_output" class="sideitemoption">Output</a><br/>
				
			</li>
		</ul>
	</div>
	
	
	
	
</div>
