<?php
class TEIP5WithFacsimileImport extends XMLStreamImport
{
    // This is a more complex example than the simple TEI P5 import class (tei_p5_import.php)
    // Instead of using contiguous areas of the TEI to tie together pages and lines, we need
    // to track xml:id attributes
    
    // //facsimile/surface/graphic/@url is the image url
    // //facsimile/@xml:id is the container id
    // //body//div[@xml:id = $container-id] are the contents we can process for lines

    // We don't do anything with zones yet

    // the facsimile model seems to work well with the idea of using annotations to
    // assert relationships between a canvas and contents (images, text, areas)

    protected $containers_by_id = array();
    private   $zone_xpath;

    public function __construct($content,$tile=null) {
        $this -> setMilestoneXPath('//facsimile|//text/body/div');
        $this -> setImageURLXPath('//facsimile/surface/graphic/@url');
        // we want all of the child elements of a top-level div element in the body
        $this -> setLineStartXPath('//body/div/div/*|//body/div/div/*/*');
        // we don't want to 
        $this -> setDocumentStartXPath('//facsimile');
		
        $this -> zone_xpath = $this -> build_xpath_regex('//facsimile/surface/zone');
		if(isset($tile)){
			// $this->setTileStartPath('//teiHeader/tile/*|//teiHeader/tile/*/*|//teiHeader/tile/pages/*/*');
			// set the tile start path
			parent::__construct($content,$tile);
		} else {
			parent::__construct($content);
		}
		// set the insertNode to determine this will be placed in the 
		// content
		$this->insertNode='teiHeader';
    }
    
	

    // We have to manage milestones a little different.  The <facsimile/> element comes first, so we
    // set up the containers and store them by the id since we need to retrieve them by id later.
    // Then, when we get into the document, we have <div/> elements with the same id whose content
    // we want to associate with the container.
    public function newMilestone($name, $attributes) {
        if($name == "facsimile") {
            parent::newMilestone($name, $attributes);
            $container = $this -> current_container;
            $this -> containers_by_id[$attributes['xml:id']] = $container;
        }
        else if(
            $name == "div" 
            && array_key_exists('xml:id', $attributes) 
            && array_key_exists($attributes['xml:id'], $this -> containers_by_id)
        ) {
            $this -> current_container = $this -> containers_by_id[$attributes['xml:id']];
        }
    }
    
    public function start_tag($parser, $name, $attributes) {
        parent::start_tag($parser, $name, $attributes);
        
        if($this -> stack_matches_path_q($this -> zone_xpath)) {
            $shape = $this -> current_container -> addShape('rect');
            $shape -> id = $attributes['xml:id'];
            $posInfo = array();
            $posInfo['x'] = $attributes['ulx'] + 0;
            $posInfo['y'] = $attributes['uly'] + 0;
            $posInfo['width'] = $attributes['lrx'] - $attributes['ulx'];
            $posInfo['height'] = $attributes['lry'] - $attributes['uly'];
            $shape -> posInfo = $posInfo;
            $label = $attributes['rendition'];
            $this -> addLabel($label, $shape);
        }
    }

	
}

// declare namespace
array_push(CoreData::$import_namespaces,'TEI :: P5 :: Facsimile Tags');

?>