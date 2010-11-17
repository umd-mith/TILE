<?php

# supply interface with premade TILE data
# Replaces: TILECONSTANTS.json


$m=$_SERVER['HTTP_REFERER'];
# TODO: is this valid?
if(preg_match('/\.php$|\.js$/',$m)==0){
	$host='http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
	
	$prefix=preg_replace('/tilevars\.php/','',$host);
	$prefix=preg_replace('/\//','\/',$prefix);
	
	# echo out the JSON
	echo "{\"hamLoad\":\"".$prefix."importWidgets\/importXML.php?uri=".$prefix."importWidgets\/testHam.xml&rname=text&rnum=0&ipath=".$prefix."Images\/\",
	\"archLoad\":\"".$prefix."importWidgets\/importXML.php?uri=".$prefix."importWidgets\/testArch.xml&rname=text&rnum=0&ipath=http:\/\/archimedespalimpsest.net\/Data\/065r-072v\/\",
	\"importDefault\":\"".$prefix."html\/testList.txt\",
	\"exportDefault\":\"".$prefix."importWidgets\/TEIexport.js\",
	\"pemLoad\":\"".$prefix."importWidgets\/importXML.php?uri=".$prefix."importWidgets\/testPemb.xml&rname=text&rnum=0&ipath=http:\/\/www.stoa.org\/Pembroke25\/Website-tv\/IMT\/\",
	\"jsLoad\":\"http:\/\/peach.umd.edu\/staff\/jdickie\/swinburne.json\",
	\"locJS\":\"".$prefix."html\/hooptydamndoo.js\",
	\"swineburne\":\"".$prefix."html\/swineburneJSON.json\"
	}";
	
	
}


?>