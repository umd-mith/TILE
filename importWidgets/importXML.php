<?php 

include_once('../PHP/secureInput.php');


 $uri = checkXML($_GET["uri"]); // uri of document
 

 $rname =checkXML($_GET["rname"]); // root nodeName 
 $rnum =  checkXML($_GET["rnum"]); // index of root Node in document e.g. 0 = first TEXT node
 $imgPath =  checkXML($_GET["ipath"]); // server path for images



class txtNode {
	public function __construct($txt,$context,$offset){
	
		$this->txt = $txt;
		$this->context = $context;
		$this->offset = $offset;	
	}
}
$xmlDoc = new DOMDocument;
$xmlDoc->validateOnParse = true;
$xmlDoc->load($uri);

$root = $xmlDoc->getElementsByTagName($rname)->item($rnum);
$offsets = array();
$milestones = array();
$txtStr = "";
function findTxtNode4Offset($offset,$txtArray,$totalOffset){
	$totes = count($txtArray);
	$i = intval(($offset/$totalOffset)*$totes);
	
	while (!(($txtArray[$i]->offset<=$offset)&&($txtArray[($i+1)]->offset>$offset))){
			if (($txtArray[$i]->offset)>$offset){
				$i--;
			}
		    else if ($txtarray[$i+1]->offset<$offset){
		    	$i++;
		    }
		
	}
	
	return $i;
	
}
function getTxts4Node($node,$off,$txtStr,$offsets,$context,$milestones){
	if ($node->childNodes->length>0){
		foreach ($node->childNodes as $index=>$item){
	$oldcontext = $context;
		$context .= ">".$item->nodeName."[".$index."]";
		//echo $item->nodeName." ".$off."<br/>";
	if ($item->nodeName=="#text"){
		//echo $item->nodeValue." ".strlen($item->nodeValue)."<br/>";
		$offsets[] = new txtNode($item->nodeValue,$context,$off);
		$off = $off + strlen($item->nodeValue);
		$txtStr .= $item->nodeValue;
	}
	else{
		
		
		$back = getTxts4Node($item,$off,$txtStr,$offsets,$context,$milestones);
		//$context = $oldcontext;
		$off = $back[0];
		$offsets = $back[1];
		$milestones = $back[2];
		$txtStr = $back[3];
	}
	$context=$oldcontext;
	}
	}

	else {
	 	if ($milestones[$node->nodeName]==null){
	 		$milestones[$node->nodeName]=array();	
	 	}
	 	
	 	$milestones[$node->nodeName][]=array($off,$context,$node->attributes);
	}
	
	return array($off,$offsets,$milestones,$txtStr);
}

function attsToString($atts){
	$ret = "";
	foreach ($atts as $att){
		$name = preg_replace("/,/","\,",$att->name);
		$value = preg_replace("/,/","\,",$att->value);
		$ret .= $att->name.",".$att->value.",";
	}
	$ret = substr($ret,0,strlen($ret)-1);
	return $ret;
}

$data = getTxts4Node($root,0,"",$offsets,$root->nodeName,$milestones);
//print_r($data);
//Export JSON

//print_r($data[1][$xyz]);
$ptxt = $data[3];

$lbs = $data[2]["lb"];
$cpb = 0;
$pbs = $data[2]["pb"];
$lastlb =0;
//-----
$curLb =0;
$lastP = 0;
$pbs[]=array(strlen($ptxt),"",null);
$JSON = "{\"sourceFile\": \"$uri\", \"pages\": [";
for ($i=0;$i<(count($pbs)-1);$i++){
	$facID = substr($pbs[$i][2]->getNamedItem("facs")->value,1);

	$fac = $imgPath.$xmlDoc->getElementById($facID)->getElementsByTagName("graphic")->item(0)->getAttribute("url");
	$pageInfo = "\"xpath\": \"".$pbs[$i][1]."\", \"facs\": \"".$facID."\""; 
	$JSON .= "{\"url\": \"".$fac."\", \"info\": {".$pageInfo."}, \"lines\": [";
	
	//echo $i." ".$curLb."<br/>";
	
	while (($curLb<count($lbs))&&($lbs[$curLb][0]<$pbs[$i+1][0])){
	  	
	$startCon = $lbs[$curLb][1];
	if (($curLb+1)>count($lbs)){
		$linetxt = substr($ptxt,$lbs[$curLb][0]);
	}
	else if ($lbs[$curLb+1][0]>$pbs[$i+1][0]) {
		$len = $pbs[$i+1][0]-$lbs[$curLb][0];
		$linetxt = substr($ptxt,$lbs[$curLb][0],$len);
	}
	else {
		$len = $lbs[$curLb+1][0]-$lbs[$curLb][0];
		$linetxt = substr($ptxt,$lbs[$curLb][0],$len);
	}
	
	//$linetxt = substr($ptxt,$lastlb,$len);
	
	
	$JSON.='{"text":"'.addslashes($linetxt).'","info": "lb['.$curLb.']>'.$startCon.'"}';
	$lastlb = $lbs[$curLb][0];	
	$curLb=$curLb+1;	
	if (($curLb<count($lbs))&&($lbs[$curLb][0]<$pbs[$i+1][0])){
		$JSON.=",";
	
	
	}
	
	}
	
	$lastP = $pbs[$i][0];
	$JSON .="]},";
	
}
//get rid of excessive spaces and last comma
$jlength=(strlen($JSON)-1);
echo preg_replace("/\n/","",substr($JSON,0,$jlength)."]}");



?>