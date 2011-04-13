<?php
class TEIP5Import extends XMLStreamImport 
{
    public function __construct($content) {
		array_push($import_namespaces,'XML set to TEI P5 DTD');
        $this -> setMilestoneXPath('//pb');
        $this -> setDocumentStartXPath('//pb');
        $this -> setImageUrlXPath('//pb/@facs');
        // We divide lines based on elements that are one, two, or ... levels deep within the body
        $this -> setLineStartXPath('//body/*|//body/*/*|//body/*/*/*|//body/*/*/*/*');
        $this -> break_lines_on_newline = true;
        parent::__construct($content);
    }
}
?>