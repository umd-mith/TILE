<?php 
if(isset($_GET['id'])){
	
$id=trim($_GET['id']);

?>

<div id="<?php echo $id."_wordbar"; ?>" class="wordbar">
	<ul id=	"<?php echo $id."_wordbarList"; ?>" class="wordbarList">
		
	</ul>
</div>

<?php 
}
?>