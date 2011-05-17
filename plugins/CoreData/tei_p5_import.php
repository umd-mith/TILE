<?php
	class TEIP5Import extends XMLStreamImport 
	{

	    public function __construct($content,$tile) {
		
	        $this -> setMilestoneXPath('//pb');
	        $this -> setDocumentStartXPath('//pb');
	        $this -> setImageUrlXPath('//pb/@facs');
	        // We divide lines based on elements that are one, two, or ... levels deep within the body
	        $this -> setLineStartXPath('//body/*|//body/*/*|//body/*/*/*|//body/*/*/*/*|//body/*/*/*/*/*');
	        $this -> break_lines_on_newline = true;
	        parent::__construct($content,$tile);
			// set the insertNode to determine this will be placed in the 
			// content
			$this->insertNode='teiHeader';
	    }
	}

	// declare namespace
	array_push(CoreData::$import_namespaces,'TEI :: P5 DTD');
?>