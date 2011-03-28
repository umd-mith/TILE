<?php
class TEIP5Import extends XMLStreamImport 
{
	public function __construct($content) {
		$this -> setMilestoneXPath('//pb');
		$this -> setImageUrlXPath('//pb@facs');
		$this -> setLineStartXPath('//p');
		$this -> setLineEndXPath('//p');
		parent::__construct($content);
	}
}
?>