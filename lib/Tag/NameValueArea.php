<?php
	//used for each name-value pair in NameValue.js
	//set by each NVItem


	//Get id from GET request and insert into HTML

	if($_GET['id']){
		$ID=$_GET['id'];


?>

<div id="<?php echo $ID."_nameValue";?>" class="nameValue">
	<span id="<?php echo $ID."_nvInputArea"; ?>" class="nameValue_Input"><p></p></span>
	<hr style="width:25%;align:center;" />
	<span id="<?php echo $ID."_required";?>" class="nameValue_RequiredArea"></span>
	<span id="<?php echo $ID."_optional";?>" class="nameValue_OptionalArea"></span>
</div>
	
<?php } ?>