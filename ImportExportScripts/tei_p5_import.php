<?php
class TEIP5Import extends XMLStreamImport 
{
	public function __construct($content) {
		$this -> setMilestoneXPath('//pb');
		$this -> setImageUrlXPath('//pb@facs');
		$this -> setLineStartXPath('//p|//l');
		//$this -> setLineEndXPath('//p');
		parent::__construct($content);
	}
}
?>