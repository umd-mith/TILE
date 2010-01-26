<?php
//class for constructing data output for 
//given line coordinates

/**
 * Input:
 * type: TEI, Other - determines whether output is in TEI format or user-defined
 * format
 * src: Source URL of the image
 * sx: (optional) scaled-down width of the image (if different from normal size)
 * sy: (optional) sacled-down height of the image (if different from normal size)
 */

class dataOutput{
	private $dom; //HTML DOM that will have the data in zone tags
	private $pieces;
	private $os=null; //output string
	private $outString=null;
	private $width=null;
	private $height=null;
	private $data=null;
	
	public function out(&$args){
		if(!$args) throw "Error: must include values object";
		if(isset($args['outstring'])) $this->outString=$args['outstring'];
		if(isset($args['sx'])) $this->sx=$args['sx'];
		if(isset($args['sy'])) $this->sy=$args['sy'];
		if(isset($args['os'])) $this->os=$args['os'];
		
		$this->data=$args['html'];
		$this->src=$args['src'];
		$this->init($args['type']);
	}
	
	private function init($type){
		//get string data
		$this->getData();
		switch(strtolower($type)){
			case 'tei':
				$this->outputTEI();
				break;
			case 'other':
				if(!(isset($this->outString))) throw "Error: outString not specified";
				$this->outputUserDefinedString();
				break;
		}
	}
	
	private function getData(){
		//unlock secret level!
		if(isset($this->data)){
			$this->pieces=preg_split('/_/',$this->data);//GOOD!
		}
		
		//achieve secret powers!
		//use image src to get the size and dimensions
		$size=getimagesize("../../../".$this->src);
		$this->width=intval($size[0]);
		$this->height=intval($size[1]);
		
	}	
	private function outputTEI(){
		$this->dom="<TEI><facsimile>\n";
		/*
$graphic=array_shift($this->pieces);
		$size=array_shift($this->pieces);
		
		$this->dom.="<graphic url=\"".trim($graphic)."\"/>";
		if(!($size=="nosize")){
			$b=preg_split("/::/",$size);
			$sx=intval($b[0]);
			$sy=intval($b[1]);
			
		}
*/
		foreach($this->pieces as $p){
			
			$a=preg_split('/::/',$p);
			if(count($a)==4){
				//scale all values if necessary
				$ulx=($this->sx)?($a[0]/$this->sx)*$this->width:$a[0];
				$uly=($this->sy)?($a[1]/$this->sy)*$this->height:$a[1];
				$llx=($this->sx)?($a[2]/$this->sx)*$this->width:$a[2];
				$lly=($this->sy)?($a[3]/$this->sy)*$this->height:$a[3];
				$this->dom.="<zone ulx=\"".$ulx."px\" uly=\"".$uly."px\" llx=\"".$llx."px\" lly=\"".$lly."px\"/>\n";
			}
		}
		$this->dom.="</facsimile></TEI>";
		
		$doc=new DOMDocument();
		$doc->loadXML($this->dom);
		
		$name=preg_replace('/[.png]+|[.tif]+|[.gif]+|[.jpg]+|[.jpeg]+/',".xml",$this->src);
		header("Content-Type: application/force-download");
		header("Content-Disposition: attachment; filename=\"".$name."\"");
		echo $doc->saveXML();
		
		
		
	}
	private function outputPlainHTML(){
		
	}
	private function outputUserDefinedString(){
		
	}
}


?>