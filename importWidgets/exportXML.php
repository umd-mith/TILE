<?php 
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
    echo $mine;            
	$data = json_decode($mine);
	var_dump($data);
?>