<?php
//For use with Tag.js
//Supply id through GET request

if(isset($_GET['id'])){
	$ID=preg_replace("/tag/","",$_GET['id']);
	
?>

<li id="tag_<?php echo $ID; ?>" class="tag">
	<h2><a id="tagtitle_<?php echo $ID; ?>" href="#" class="tagtitle open"><span></span></a><input id="tagTitleInput_<?php echo $ID; ?>" value="" type="text" class="tagTitleInput edit"></input><a id="tagdel_<?php echo $ID; ?>" class="tagdel btnIcon" href="#"></a><a id="<?php echo $ID."_moveMe"; ?>" class="moveTag">MOVE</a></h2>
	
	<a id="tagedit_<?php echo $ID; ?>" class="tagedit btnIcon unlock" href="#"></a>
	<ul id="tagAtr_<?php echo $ID; ?>" class="tagattrb">
	<!--	<a id="tagChoice_<?php //echo $ID; ?>" class="tagChoice"><select id="tagChoiceList_<?php //echo $ID; ?>" class="tagChoiceList"></select></a> -->
		</ul>
</li>
<?php } ?>