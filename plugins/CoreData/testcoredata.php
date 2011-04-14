<?php
#test coredata's export
// include_once('coredata.php');
// include_once('xml_stream_import.php');
// include_once('tei_p5_import.php');



class XMLExport{
	
	private $json=array();
	private $content='';
	private $tilexml='';
	
	public function __construct($arr){
		$this->json=$arr->tile;
		$this->content=$arr->content;
		
	}
	
	# pass in array arr with possible arrays inside
	# it (recursive)
	# namespace optional - adds as prefix to elements
	private function convertArrayToXML($arr,$namespace=''){
		$xml='';
		foreach($arr as $key=>$item){
			if(is_array($item)||is_object($item)){
				# recursive (better way to do this?)
				# generate name
			
				if(strlen($key)>1){
				
					$name=preg_replace('/\n/','',$key);
				
			
					$xml.='<'.$namespace.$name.'>'."\n";
				}
				# go through children
				$xml.=$this->convertArrayToXML($item,$namespace);
				if(strlen($key)>1)	$xml.='</'.$namespace.$name.'>'."\n";
			} else {
				# generate name
				if(strlen($key)>1){
					$name=preg_replace('/\t|\n|[0-9]*/','',$key);
			
					$xml.='<'.$namespace.$name.'>'.$item.'</'.$namespace.$name.'>'."\n";
				} else {
					$xml.='<![CDATA['.$item.']]>';
				}
			}
		
		}
		return $xml;
	}

	# Takes the tile container data and parses it into XML
	public function convertTileToXML(){
		# create initial XML header
		# need to include source XML from content in here?
		$xml='<TILE>'."\n";
		#generate namespace
		$namespace='tile:';
	
		# step through JSON array
		foreach($this->json as $m=>$item){
			# major item element
			if(is_array($item)){
				#display major item, then display inner items
				# set up parent name
				$name=preg_replace('/\t|\n|[0-9]*/','',$m);
				$xml.='<'.$namespace.$name.'>'."\n";
				# go through children
				$xml.=$this->convertArrayToXML($item,$namespace);
				# end
				$xml.='</'.$namespace.$name.'>'."\n";
			} elseif($item!='') {
				# set up parent name
				$name=preg_replace('/\t|\n|[0-9]*/','',$m);
				$xml.='<'.$namespace.$name.'>'."\n".$item.'</'.$namespace.$name.'>'."\n";
			}
		
		}
		$xml.='</TILE>';
		$this->tilexml=$xml;
	}
	
	public function outputXML(){
		# find the area in XML document to include
		# our generic XML
		$off=strripos($this->content,'<');
		#insert
		$xmlout=substr($this->content,0,$off).$this->tilexml.substr($this->content,$off);
		
		return $xmlout;
	}
	
}
$tile='{"content":"<?xml version=\"1.0\" encoding=\"UTF-8\"?><?xml-stylesheet type=\"text/xsl\" href=\"butterflies1_wv.xsl\"?><?oasis-schema href=\"imt_1_8.rng\" type=\"application/xml\"?><?oxygen RNGSchema=\"imt_1_8.rng\" type=\"xml\"?><TEI xmlns=\"http://www.tei-c.org/ns/1.0\" version=\"5.0\" xml:id=\"butterflies1\"><teiHeader>  <fileDesc>    <titleStmt><title></title></titleStmt>          <publicationStmt>      <p></p></publicationStmt>    <sourceDesc>    <p>2053 x 3131</p></sourceDesc></fileDesc>  <encodingDesc><tagsDecl xml:id=\"imtAnnotationCategories\"><rendition xml:id=\"butterflies1_reading\"><label>Reading Text</label><code rend=\"rectangle\" lang=\"text/css\">color: #ff0000</code></rendition><rendition xml:id=\"butterflies1_revisions\"><label>Authorial Revisions</label><code rend=\"rectangle\" lang=\"text/css\">color: #0000ff</code></rendition></tagsDecl><appInfo>     <application ident=\"ImageMarkupTool01\" version=\"1.8.1.7\" notAfter=\"2010-06-01T16:37:46\">     <label>     Image Markup Tool</label><desc>     Tool for annotating images using TEI</desc><ref type=\"appURI\" target=\"http://www.tapor.uvic.ca/~mholmes/image_markup/\">     </ref><ptr target=\"#imtAnnotatedImage\"></ptr><ptr target=\"#imtImageAnnotations\"></ptr><ptr target=\"#imtAnnotationCategories\"></ptr></application>               </appInfo></encodingDesc></teiHeader><facsimile xml:id=\"imtAnnotatedImage\"><surface><graphic url=\"http://localhost:8888/tile/images/butterflies.jpg\" width=\"2053px\" height=\"3131px\"></graphic><zone xml:id=\"imtArea_0\" rendition=\"butterflies1_reading\" ulx=\"92\" uly=\"411\" lrx=\"1757\" lry=\"1948\" rend=\"visible\"></zone><zone xml:id=\"imtArea_1\" rendition=\"butterflies1_reading\" ulx=\"58\" uly=\"1969\" lrx=\"1311\" lry=\"2915\" rend=\"visible\"></zone><zone xml:id=\"imtArea_2\" rendition=\"butterflies1_revisions\" ulx=\"886\" uly=\"424\" lrx=\"1413\" lry=\"672\" rend=\"visible\"></zone><zone xml:id=\"imtArea_3\" rendition=\"butterflies1_revisions\" ulx=\"308\" uly=\"644\" lrx=\"761\" lry=\"798\" rend=\"visible\"></zone><zone xml:id=\"imtArea_4\" rendition=\"butterflies1_revisions\" ulx=\"294\" uly=\"1232\" lrx=\"467\" lry=\"1325\" rend=\"visible\"></zone><zone xml:id=\"imtArea_6\" rendition=\"butterflies1_revisions\" ulx=\"284\" uly=\"1540\" lrx=\"1236\" lry=\"1671\" rend=\"visible\"></zone><zone xml:id=\"imtArea__8\" rendition=\"butterflies1_revisions\" ulx=\"154\" uly=\"1768\" lrx=\"499\" lry=\"1927\" rend=\"visible\"></zone><zone xml:id=\"imtArea_7\" rendition=\"butterflies1_revisions\" ulx=\"821\" uly=\"2090\" lrx=\"933\" lry=\"2221\" rend=\"visible\"></zone><zone xml:id=\"imtArea_8\" rendition=\"butterflies1_revisions\" ulx=\"151\" uly=\"2222\" lrx=\"295\" lry=\"2316\" rend=\"visible\"></zone><zone xml:id=\"imtArea_9\" rendition=\"butterflies1_revisions\" ulx=\"65\" uly=\"2316\" lrx=\"425\" lry=\"2468\" rend=\"visible\"></zone><zone xml:id=\"imtArea_10\" rendition=\"butterflies1_revisions\" ulx=\"179\" uly=\"2633\" lrx=\"1095\" lry=\"2835\" rend=\"visible\"></zone></surface></facsimile><text><body><div xml:id=\"imtImageAnnotations\"><div corresp=\"#imtArea_0\" type=\"imtAnnotation\"><head>Stanza 1</head><div><p>01    Those butterflies enact it:</p><p>02    the ones that gather</p><p>03    on a dried stick:</p><p>04    small green unopened bud shapes</p><p>05    settle on the tip</p><p>06    below</p><p>07    those slightly larger</p><p>08    darkly pinker</p><p>09    &amp; lower</p><p>10    swarms</p><p>11    a blown — white-petalled cluster</p><p>12    which forms a loose brightly shaking blossom</p></div></div><div corresp=\"#imtArea_1\" type=\"imtAnnotation\"><head>Stanza 2</head><div><p>13    Frighten them &amp; they fly</p><p>14    green-winged, pink</p><p>15    in a flurry of snow</p><p>16    from a black stick</p><p>17    to settle again</p><p>18    exactly as before:</p><p>19    in a composite flower head</p></div></div><div corresp=\"#imtArea_2\" type=\"imtAnnotation\"><head>Line 1</head><div><p>01(1)    Those butterflies &lt;act it out&gt;:</p><p>01(2)    Those butterflies [enact it]:</p></div></div><div corresp=\"#imtArea_3\" type=\"imtAnnotation\"><head>Line 2</head><div><p>02(1)    the ones &lt;who&gt; gather</p><p>02(2)    the ones [that] gather</p></div></div><div corresp=\"#imtArea_4\" type=\"imtAnnotation\"><head>Line 7</head><div><p>07(1)    &lt;the&gt; slightly larger</p><p>07(2)    [those] slightly larger</p></div></div><div corresp=\"#imtArea_6\" type=\"imtAnnotation\"><head>Line 10</head><div><p>10(1)    &lt;the whole swarm almost&gt;</p><p>10(2)    [swarms]</p></div></div><div corresp=\"#imtArea__8\" type=\"imtAnnotation\"><head>Line 12</head><div><p>12(1)    &lt;in&gt; a loose brightly shaking blossom</p><p>12(2)    [which forms] a loose brightly shaking blossom</p></div></div><div corresp=\"#imtArea_7\" type=\"imtAnnotation\"><head>Line 14</head><div><p>14(1)    green-winged &lt;&amp;&gt; pink</p><p>14(2)    green-winged[,] pink</p></div></div><div corresp=\"#imtArea_8\" type=\"imtAnnotation\"><head>Line 15</head><div><p>15(1)    &lt;&gt;a flurry of snow</p><p>15(2)    [in] flurry of snow</p></div></div><div corresp=\"#imtArea_9\" type=\"imtAnnotation\"><head>Line 16</head><div><p>16(1)    &lt;near&gt; a &lt;dry&gt; stick</p><p>16(2)    [from] a &lt;[back]&gt; stick[incomplete]</p><p>16(3)    from a [black] stick</p></div></div><div corresp=\"#imtArea_10\" type=\"imtAnnotation\"><head>Line 19</head><div><p>19(1)    &lt;tight little green buds&gt;</p><p>20(1)    &lt;swelling pink&gt;</p><p>18/19(2) []</p></div></div></div></body></text></TEI>","tile":{"pages":[{"id":"95cc1","url":"http://localhost:8888/tile/images/butterflies.jpg","lines":[{"text":"Stanza 1","id":"line0"},{"text":"01    Those butterflies enact it:","id":"line1","shapes":["1302702836559_0"]},{"text":"02    the ones that gather","id":"line2"},{"text":"03    on a dried stick:","id":"line3"},{"text":"04    small green unopened bud shapes","id":"line4"},{"text":"05    settle on the tip","id":"line5"},{"text":"06    below","id":"line6"},{"text":"07    those slightly larger","id":"line7"},{"text":"08    darkly pinker","id":"line8"},{"text":"09    &amp; lower","id":"line9"},{"text":"10    swarms","id":"line10"},{"text":"11    a blown — white-petalled cluster","id":"line11"},{"text":"12    which forms a loose brightly shaking blossom","id":"line12"},{"text":"Stanza 2","id":"line13"},{"text":"13    Frighten them &amp; they fly","id":"line14"},{"text":"14    green-winged, pink","id":"line15"},{"text":"15    in a flurry of snow","id":"line16"},{"text":"16    from a black stick","id":"line17"},{"text":"17    to settle again","id":"line18"},{"text":"18    exactly as before:","id":"line19"},{"text":"19    in a composite flower head","id":"line20"},{"text":"Line 1","id":"line21"},{"text":"01(1)    Those butterflies &lt;act it out&gt;:","id":"line22"},{"text":"01(2)    Those butterflies [enact it]:","id":"line23"},{"text":"Line 2","id":"line24"},{"text":"02(1)    the ones &lt;who&gt; gather","id":"line25"},{"text":"02(2)    the ones [that] gather","id":"line26"},{"text":"Line 7","id":"line27"},{"text":"07(1)    &lt;the&gt; slightly larger","id":"line28"},{"text":"07(2)    [those] slightly larger","id":"line29"},{"text":"Line 10","id":"line30"},{"text":"10(1)    &lt;the whole swarm almost&gt;","id":"line31"},{"text":"10(2)    [swarms]","id":"line32"},{"text":"Line 12","id":"line33"},{"text":"12(1)    &lt;in&gt; a loose brightly shaking blossom","id":"line34"},{"text":"12(2)    [which forms] a loose brightly shaking blossom","id":"line35"},{"text":"Line 14","id":"line36"},{"text":"14(1)    green-winged &lt;&amp;&gt; pink","id":"line37"},{"text":"14(2)    green-winged[,] pink","id":"line38"},{"text":"Line 15","id":"line39"},{"text":"15(1)    &lt;&gt;a flurry of snow","id":"line40"},{"text":"15(2)    [in] flurry of snow","id":"line41"},{"text":"Line 16","id":"line42"},{"text":"16(1)    &lt;near&gt; a &lt;dry&gt; stick","id":"line43"},{"text":"16(2)    [from] a &lt;[back]&gt; stick[incomplete]","id":"line44"},{"text":"16(3)    from a [black] stick","id":"line45"},{"text":"Line 19","id":"line46"},{"text":"19(1)    &lt;tight little green buds&gt;","id":"line47"},{"text":"20(1)    &lt;swelling pink&gt;","id":"line48"}],"shapes":[{"id":"imtArea_0","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":92,"y":411,"width":1665,"height":1537}},{"id":"imtArea_1","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":58,"y":1969,"width":1253,"height":946}},{"id":"imtArea_2","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":886,"y":424,"width":527,"height":248}},{"id":"imtArea_3","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":308,"y":644,"width":453,"height":154}},{"id":"imtArea_4","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":294,"y":1232,"width":173,"height":93}},{"id":"imtArea_6","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":284,"y":1540,"width":952,"height":131}},{"id":"imtArea__8","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":154,"y":1768,"width":345,"height":159}},{"id":"imtArea_7","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":821,"y":2090,"width":112,"height":131}},{"id":"imtArea_8","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":151,"y":2222,"width":144,"height":94}},{"id":"imtArea_9","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":65,"y":2316,"width":360,"height":152}},{"id":"imtArea_10","type":"rect","color":"#000000","_scale":1,"posInfo":{"x":179,"y":2633,"width":916,"height":202}},{"id":"1302702836559_0","type":"rect","_scale":0.010022595757618546,"color":"#000000","posInfo":{"x":38.08331298828125,"y":3.25,"width":140,"height":35},"lines":["line1"]}]}],"labels":[{"id":"lbl_2","name":"butterflies1_reading","selections":["imtArea_0","imtArea_1"]},{"id":"lbl_3","name":"butterflies1_revisions","selections":["imtArea_2","imtArea_3","imtArea_4","imtArea_6","imtArea__8","imtArea_7","imtArea_8","imtArea_9","imtArea_10"]}]}}';

$json=json_decode($tile);


$parser=new XMLExport($json);

	# convert the tile into XML 
	$parser->convertTileToXML();
	# append somewhere in XML content area
	# just append before last </TEI>?
	echo $parser->outputXML();

?>