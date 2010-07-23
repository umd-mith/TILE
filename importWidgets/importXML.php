<?php 

 $uri = $_GET["uri"]; // uri of document
 $rname = $_GET["rname"]; // root nodeName 
 $rnum = $_GET["rnum"]; // index of root Node in document e.g. 0 = first TEXT node
 $imgPath = $_GET["ipath"]; // server path for images

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
$JSON = "{pages: [";
for ($i=0;$i<(count($pbs)-1);$i++){
	/*$len = $lbs[$i][0]-$lastP;
	$oops = substr($ptxt,$lastP,$len);
	echo $oops."<hr/>";
	$lastP = $lbs[$i][0];
	*/
	$facID = substr($pbs[$i][2]->getNamedItem("facs")->value,1);

	$fac = $imgPath.$xmlDoc->getElementById($facID)->getElementsByTagName("graphic")->item(0)->getAttribute("url");
	$pageInfo = "xpath: '".$pbs[$i][1]."', facs: '".$facID."'"; 
	$JSON .= "{url: '".$fac."', info: {".$pageInfo."}, lines: [";
	$lastlb = $pbs[$i][0];
	//echo $i." ".$curLb."<br/>";
	while (($curLb<count($lbs))&&($lbs[$curLb][0]<$pbs[$i+1][0])){
	  	
		$startCon = $lbs[$curLb][1];
	
	$len = $lbs[$curLb][0]-$lastlb;
	$linetxt = substr($ptxt,$lastlb,$len);
	
	$JSON.='{text:"'.addslashes($linetxt).'",info: "'.$startCon.'"},';
	$lastlb = $lbs[$curLb][0];	
	$curLb=$curLb+1;	
		
	
	}
	
	$startCon = $lbs[$curLb-1][1];
		if (($curLb-1)>0){
			
			$endCon = $pbs[$i][1];
			
			while ((strpos($endCon,$startCon)===false) && strlen($startCon)>1){
				$startCon = substr($startCon,0,strrpos($startCon,">"));
				//$endCon = substr($endCon,0,strrpos($endCon,">"));
				
			}
		
		}	
	$len = $pbs[$i][0]-$lastlb;
	$linetxt = substr($ptxt,$lastlb,$len);
	if ($len>0){
	$JSON.='{text:"'.addslashes($linetxt).'",info: "'.$startCon.'"}';
	}
	$lastP = $pbs[$i][0];
	$JSON .="]},";
	
}
//get rid of excessive spaces and last comma
$jlength=(strlen($JSON)-1);
echo preg_replace("/\n/","",substr($JSON,0,$jlength)."]}");



?>