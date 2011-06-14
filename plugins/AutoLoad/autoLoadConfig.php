<?php
# Use to automatically load in data into TILE

$host='http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];

$prefix=preg_replace('/plugins\/AutoLoad\/autoLoadConfig\.php/','',$host);
// $prefix=preg_replace('/\//','\/',$prefix);

# SET DEFAULT SCRIPT HERE
$DEFAULT_SCRIPT="".$prefix."importWidgets/importXML.php?uri=".$prefix."importWidgets/testPemb.xml&rname=text&rnum=0&ipath=http://www.nd.edu/~pemb25/Website-tv/IMT/";

$swinburne=$prefix."/plugins/CoreData/importDataScript.php?file=http://ella.slis.indiana.edu/~jawalsh/tmp/tile_tei_import_test/acs0000001-01-i010.xml";

echo $swinburne;



?>