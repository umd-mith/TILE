<?php 

 $uri = $_GET["uri"]; // uri of document
 $pb = $_GET["pb"]; 
 $lb = $_GET["lb"];

class txtNode {
	public function __construct($txt,$context){
	
		$this->txt = $txt;
		$this->context = $context;
			
	}
}
$xmlDoc = new DOMDocument();
$xmlDoc->load($uri);
$root = $xmlDoc->documentElement;
$offsets = array();
$milestones = array();
$txtStr = "";
function getTxts4Node($node,$off,$txtStr,$offsets,$context,$milestones){
	if ($node->childNodes->length>0){
		foreach ($node->childNodes as $item){
	
		//echo $item->nodeName." ".$off."<br/>";
	if ($item->nodeName=="#text"){
		//echo $item->nodeValue." ".strlen($item->nodeValue)."<br/>";
		$offsets[$off] = new txtNode($item->nodeValue,$context);
		$off = $off + strlen($item->nodeValue);
		$txtStr .= $item->nodeValue;
	}
	else{
		$oldcontext = $context;
		$context .= ">".$item->nodeName;
		
		$back = getTxts4Node($item,$off,$txtStr,$offsets,$context,$milestones);
		$context = $oldcontext;
		$off = $back[0];
		$offsets = $back[1];
		$milestones = $back[2];
		$txtStr = $back[3];
	}
	
	}
	}

	else {
	 	if ($milestones[$node->nodeName]==null){
	 		$milestones[$node->nodeName]=array();	
	 	}
	 	$milestones[$node->nodeName][]=$off;
	}
	
	return array($off,$offsets,$milestones,$txtStr);
}
/*$filestr = file_get_contents($uri);
$filestr = html_entity_decode($filestr);
$ptxt = preg_replace("/\<[^\>]*\>/","",$filestr);
$ptxt = preg_replace("/[ ]+/"," ",$ptxt);*/
$data = getTxts4Node($root,0,"",$offsets,$root->nodeName,$milestones);
$ptxt = $data[3];

$lbs = $data[2]["lb"];
$cpb = 0;
$pbs = $data[2]["pb"];
$lastlb =0;
$JSON = "{pages: [{lines: [";
for ($i=0;$i<count($lbs)-1;$i++){
	
	$len = $lbs[$i]-$lastlb;
	$linetxt = substr($ptxt,$lastlb,$len);
	
	$JSON.='{text:"'.addslashes($linetxt).'"}';
	$next = intval($i)+1;
	if ($lbs[$next]>$pbs[$cpb]){
	 $JSON .="]},{lines: [";
	 $cpb=$cpb+1;
	}
	else{
		$JSON .=",";
	}
	$lastlb = $lbs[$i];
	
}
$last = count($lbs);
$off = $lbs[$last-1];

$len = $off-$lbs[$last-2];
$linetxt = substr($ptxt,$lbs[$last-2],$len);
$JSON.='{text:"'.addslashes($linetxt).'"}'.']}]}';
echo $JSON;
function getMilestones($txt,$pb){
	 $preg = "/\<".$pb."\/\>/";
	 $pages = preg_split($preg,$txt);
	 return $pages;
}
/* $filestr = file_get_contents($uri);
$pages=getMilestones($filestr,"pb");
$return = array();
echo "{pages:[";
for ($i=0;$i<count($pages);$i++){
	$lines = getMilestones($pages[$i],"lb");
	$return[$i]=array();
	echo"[";
	for ($j=0;$j<count($lines);$j++){
		$ltxt = preg_replace("/\<[^\>]*\>/","",$lines[$j]);
		echo "[".$ltxt."]<br/>";
		//$return[$i][$j]=$ltxt;
			if ($j<count($lines)){
		echo ",";
	}	
	}
	echo "]";
	if ($i<count($pages)){
		echo ",";
	}	
}
*/
//$data = getTxts4Node($root,0,$offsets,$root->nodeName);
//print_r($return);  
/*
 $filestr = file_get_contents($uri);
 

 $preg = "/\<".$pb."\/\>|\<\/".$pb."\>/";

 $pages = preg_split($preg,$filestr);
//echo count($pages);
//print_r($pages[0]);

for ($i=0;$i<count($pages);$i++){
	
	echo $pages[$i];
	if (preg_match("/\<".$pb."[ |\>]/",$pages[$i],$match,PREG_OFFSET_CAPTURE)){
		echo $match[0][1];
		
	}
}
*/

?>