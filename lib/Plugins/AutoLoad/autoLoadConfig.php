<?php
# Use to automatically load in data into TILE

$host='http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];

$prefix=preg_replace('/lib\/Plugins\/AutoLoad\/autoLoadConfig\.php/','',$host);
// $prefix=preg_replace('/\//','\/',$prefix);

# SET DEFAULT SCRIPT HERE
$DEFAULT_SCRIPT="".$prefix."importWidgets/importXML.php?uri=".$prefix."importWidgets/testPemb.xml&rname=text&rnum=0&ipath=http://www.stoa.org/Pembroke25/Website-tv/IMT/";

echo $DEFAULT_SCRIPT;



?>