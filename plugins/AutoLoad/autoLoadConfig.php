<?php
# Use to automatically load in data into TILE

$host='http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];

$prefix=preg_replace('/plugins\/AutoLoad\/autoLoadConfig\.php/','',$host);
// $prefix=preg_replace('/\//','\/',$prefix);

# SET DEFAULT SCRIPT HERE
$DEFAULT_SCRIPT="".$prefix."importWidgets/importXML.php?uri=".$prefix."importWidgets/testPemb.xml&rname=text&rnum=0&ipath=http://www.nd.edu/~pemb25/Website-tv/IMT/";

$swinburne="".$prefix."swinburne.json";
$butterflies="".$prefix."butterflies.json";

echo $DEFAULT_SCRIPT;



?>