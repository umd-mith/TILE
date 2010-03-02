<?php
//For use with Tag.js
//Supply id through GET request

if($_GET['id']){
	$ID=preg_replace("/tag/","",$_GET['id']);
	
?>

<div id="tag_<?php echo $ID; ?>" class="tag">
	<h2><a href="#" class="tagtitle open">Flower ABC</a></h2>
	<p class="tagedit"><a id="tagedit_<?php echo $ID; ?>" href="#">Edit</a></p>
	<ul class="tagattrb">
		<li id="tagobjlabel_<?php echo $ID; ?>" class="tagtype">Object:</li>
		<li id="tagobjchoice_<?php echo $ID; ?>" class="tagvalue"></li>
		<li id="tagcoordslabel_<?php echo $ID; ?>" class="tagtype">Coordinates:</li>
		<li id="tagcoordsvalue_<?php echo $ID; ?>" class="tagvalue"></li>
	</ul>
</div>
<?php } ?>