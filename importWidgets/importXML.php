<?php 

 $uri = $_GET["uri"]; // uri of document
 $pb = $_GET["pb"]; 
 $lb = $_GET["lb"];

class txtNode {
	public function __construct($txt,$context,$offset){
	
		$this->txt = $txt;
		$this->context = $context;
		$this->offset = $offset;	
	}
}
$xmlDoc = new DOMDocument();
$xmlDoc->load($uri);
$root = $xmlDoc->documentElement;
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
	 	$milestones[$node->nodeName][]=array($off,$context);
	}
	
	return array($off,$offsets,$milestones,$txtStr);
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
$JSON = "{pages: [{lines: [";
for ($i=0;$i<count($lbs)-1;$i++){
		$startCon = $lbs[$i][1];
	if ($i>0){

	$endCon = $lbs[$i-1][1];
	while ($startCon != $endCon){
		$startCon = substr($startCon,0,strrpos($startCon,">"));
		$endCon = substr($endCon,0,strrpos($endCon,">"));
	}
	}	
	$len = $lbs[$i][0]-$lastlb;
	$linetxt = substr($ptxt,$lastlb,$len);
	
	$JSON.='{text:"'.addslashes($linetxt).'",info: '.$startCon.'}';
	$next = intval($i)+1;
	
	
	if ($lbs[$next][0]>$pbs[$cpb][0]){
	 $JSON .="]},{lines: [";
	 $cpb=$cpb+1;
	}
	else{
		$JSON .=",";
	}
	$lastlb = $lbs[$i][0];
	
	
}
$last = count($lbs);
$off = $lbs[$last-1][0];

$len = $off-$lbs[$last-2][0];
$linetxt = substr($ptxt,$lbs[$last-2][0],$len);
$JSON.='{text:"'.addslashes($linetxt).'",info: '.$endCon.'}'.']}]}';
echo $JSON;



?>