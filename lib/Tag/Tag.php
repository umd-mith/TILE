<?php
//For use with Tag.js
//Supply id through GET request

if(isset($_GET['id'])){
	$ID=preg_replace("/tag/","",$_GET['id']);
	
?>

<div id="tag_<?php echo $ID; ?>" class="tag">
	<h2><a id="tagtitle_<?php echo $ID; ?>" href="#" class="tagtitle open"><input id="tagtitleselect_<?php echo $ID; ?>" /></a><a id="tagdel_<?php echo $ID; ?>" class="tagdel btnIcon" href="#"></a></h2>
	<p class="tagedit"><a id="tagedit_<?php echo $ID; ?>" href="#">Edit</a></p>
	<ul id="tagAtr_<?php echo $ID; ?>" class="tagattrb">
		<!-- ><li id="tagobjlabel_<?php echo $ID; ?>" class="tagtype">Object: <span id="tagobjInputLabel1_<?php echo $ID; ?>"></span><input id="tagObjInput_<?php echo $ID; ?>" class="tagObjInput" type="text"></input></li> <-->
		<!-- ><li id="tagobjchoice_<?php echo $ID; ?>" class="tagvalue"><input id="tagObjInput_<?php echo $ID; ?>" class="tagObjInput" type="text"></input></li> -->
		<li id="tagcoordslabel_<?php echo $ID; ?>" class="tagtype">Coordinates:</li>
		<li id="tagcoordsvalue_<?php echo $ID; ?>" class="tagvalue"><span id="tagcoordstextoutput_<?php echo $ID; ?>"></span><a href="#" id="tagCoords_<?php echo $ID; ?>" class="tagcoords closed">Set the object area</li>
	</ul>
</div>
<?php } ?>