<?php
//include main output library
include_once('outputData.php');
if(isset($_GET['src'])){
	
	$ostream=new dataOutput();
	$src=$_GET['src'];
	$html=$_GET['html'];
	$sx=(isset($_GET['sx']))?$_GET['sx']:null;
	$sy=(isset($_GET['sy']))?$_GET['sy']:null;
	$outFile=(isset($_GET['os']))?$_GET['os']:null;
	$options=array("html"=>$html,"type"=>"tei","src"=>$src,"sx"=>$sx,"sy"=>$sy,"os"=>$outFile);
	
	$ostream->out(&$options);

}
?>