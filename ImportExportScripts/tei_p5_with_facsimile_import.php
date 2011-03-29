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
	
	public function __construct($content) {
		$this -> setMilestoneXPath('//facsimile|//text/body/div');
		$this -> setImageURLXPath('//facsimile/surface/graphic/@url');
		// we want all of the child elements of a top-level div element in the body
		$this -> setLineStartXPath('//body/div/div/*|//body/div/div/*/*');
		// we don't want to 
		$this -> setDocumentStartXPath('//facsimile');
		parent::__construct($content);
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
}
?>