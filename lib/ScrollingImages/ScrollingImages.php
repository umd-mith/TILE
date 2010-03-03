<?php

if(isset($_GET['id'])){
	$ID=preg_replace("/scroller/","",$_GET['id']);

?>

<div id="scroller">
	<div id="handle_<?php $ID ?>" class="handle"><a href="#"><span class="button">Images</span></a></div>
	<div id="list_<?php $ID?>" class="list"></div>
</div>

<?php
}
?>