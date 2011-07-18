<?php
	class AltoImport extends XMLStreamImport 
	{
		// @reconcile is boolean for whether there is saved TILE data in the XML 
		// to be reconciled
	    public function __construct($content,$tile=null) {
		
	        $this -> setMilestoneXPath('//Page');
	        $this -> setDocumentStartXPath('//Page');
	        $this -> setImageUrlXPath('//Page/@PHYSICAL_IMG_NR');
			if(isset($tile)){
	 			parent::__construct($content,$tile);
			} else {
				parent::__construct($content);
			}
			// set the insertNode to determine this will be placed in the 
			// content
			$this->insertNode='alto';
	    }
	
		public function retrieveTILEXMLData(){
			
		}
	
	}

	// declare namespace
	array_push(CoreData::$import_namespaces,'Alto');
?>