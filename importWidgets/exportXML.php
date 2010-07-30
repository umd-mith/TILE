<?php 
// Receives a POST form data "JSON", that is a string 
// of JSON data to be saved as XML

if(isset($_POST["JSON"])){
	$mine = $_POST["JSON"];
	$mine = stripslashes($mine);
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
	header("Cache-Control: public");
    header("Content-Description: File Transfer");
    header("Content-Disposition: attachment; filename=testSave.xml");
    
	echo $mine;
}

	
?>