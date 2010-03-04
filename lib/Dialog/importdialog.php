<?php
/**
*Dialog box for Importing Schemas 
*
* For TILE project
* Elisabeth Kvernen, 2010
**/

if(isset($_GET['id'])){
	$ID=preg_replace("/[A-Za-z]/","",$_GET['id']);

?>

<div id="dialogImport" class='dialog'>
	<div class="header">
		<h2 class="title">Import</h2>
		<h2><a href="#" id="impDClose_<?php echo $ID; ?>" class="button">Close</a></h2>
		<div class="clear"></div>
	</div>
	<div class="body">
		<div class="option">
			<h3>Tag Schema</h3>	
			<form id="impDForm1_<?php echo $ID; ?>" action="" method="post">
			<label for="file">Filename:</label>
			
			<input name="file" id="file<?php echo "_single".$ID; ?>" />
			<br />
			<input id="submit<?php echo "_single".$ID; ?>" type="submit" class="button" name="submit" value="Submit" />
			</form>
		</div>
		<div class="option">
			<h3>Image List from File</h3>
			<form id="impDForm2_<?php echo $ID; ?>" action="" method="post">
			<label for="file">Filename:</label>
			<input name="file" id="file<?php echo "_multi".$ID; ?>" />
			<br />
			<input id="submit<?php echo "_multi".$ID; ?>" type="submit" class="button" name="submit" value="Submit" />
			</form>		
		</div>
		<div class="clear"></div>
	</div>
	
</div>

<?php } ?>