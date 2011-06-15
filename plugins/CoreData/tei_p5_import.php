<?php
	class TEIP5Import extends XMLStreamImport 
	{
		// @reconcile is boolean for whether there is saved TILE data in the XML 
		// to be reconciled
	    public function __construct($content,$tile=null) {
		
	        $this -> setMilestoneXPath('//pb');
	        $this -> setDocumentStartXPath('//pb');
	        $this -> setImageUrlXPath('//pb/@facs');
	        // We divide lines based on elements that are one, two, or ... levels deep within the body
	        $this -> setLineStartXPath('//body/*|//body/*/*|//body/*/*/*|//body/*/*/*/*|//body/*/*/*/*/*');
	        $this -> break_lines_on_newline = true;
			if(isset($tile)){
	 			parent::__construct($content,$tile);
			} else {
				parent::__construct($content);
			}
			// set the insertNode to determine this will be placed in the 
			// content
			$this->insertNode='teiHeader';
	    }
	
		public function retrieveTILEXMLData(){
			
		}
	
	}

	// declare namespace
	array_push(CoreData::$import_namespaces,'TEI :: P5');
?>