<?php 
// Receives a POST form data "JSON", that is a string 
// of JSON data to be saved as XML

include_once('../PHP/secureInput.php');

checkJSON($_POST["JSON"]);

checkImgLink($_POST["srcFile"]);

if(isset($_POST["JSON"])){
	$mine = $_POST["JSON"];
	
	$mine = stripslashes($mine);
	$d=preg_split("/\//",$_POST["srcFile"]);
	
	$filename=$d[count($d)-1]."_MarkedUp_".date('j_m_y').".xml";
	    $find[] = "“";  // right side double smart quote
  $find[] = "”";  // left side double smart quote
    $find[] = '‘';  // left side single smart quote
  $find[] = '’';  // right side single smart quote
  $find[] = '\"';

  $find[] = "\'";

  
  $replace[] = "X";
    $replace[] = "X";
      $replace[] = "&#145;";
        $replace[] = "&#146;";
          $replace[] = "&#34;";
            $replace[] = "&#39;";
    
    $mine = str_replace($find,$replace,$mine);
               
	$data = json_decode($mine);
	
	// output to the user in a force download
	// Set headers
	header("Content-Disposition: attachment; filename=".$filename);
	header('Content-Type: text/xml');
	header('Content-Transfer-Encoding: binary');
	echo $mine;
}

	
?>