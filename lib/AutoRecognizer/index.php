 <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<HEAD>
<link type="text/css" href="../jquery/js/css/ui-lightness/jquery-ui-1.7.2.custom.css" rel="Stylesheet" />
	<link type="text/css" href="../jquery/development-bundle/themes/base/ui.all.css" rel="stylesheet" /> 
		<link type="text/css" href="../../skins/ImageConversion.css" rel="stylesheet" />
  
	<STYLE type="text/css">
		#header{
			background-color: black;
		}
		
		img{
			display:none;
		}
		#sidebar{
		position: absolute;
			top: 50px;
	
		width: 295px;
	
		}
		
		#workspace{
			position:absolute;
				top: 50px;
			left:305px;
			width: 500px;
			height: 500px;
			
			
		}
		#ARControls{
			position:absolute;
			border:solid 1px black;
			width:295px;
			padding:0;
			margin:0;
		}
		#backgroundimage{
			width:100px;
			height:100px;
			background-color:rgb(0,0,0);
			color:white;
		}
		.color div{
			margin:13px 0 10px 0px;
		}
		/**PlainBox**/
		#regionBox{
		display: none;
		}
		
		.boxer_plainbox{
			position:absolute;
			left:0px;
			top:17px;
			background-color:transparent;
			border: 2px solid #ff510b;
			width:200px;
			height:300px;
			margin-right:5px;
			padding-right:5px;
		}
		.boxer_plainbox_close{
			position:absolute;
			left:0px;
			top:0px;
			width:16px;
			height:16px;
			cursor:pointer;
		}
		.boxer_plainbox_useroptions{
			position:absolute;
			left:-65px;
			top:0px;
			width:65px;
			height:15px;
			background-color:#DBB2BB;
			border:solid 1px #D40633;
		}
		/**SelectorBox**/
		.boxer_select_ocr{
			position:absolute;
			left:25%;

			cursor:pointer;
		}
		/**BlobBox**/
		.blobbox{
			position:absolute;
			background-color:transparent;
			border: 1px solid #ff510b;

		}
		.blobbox:hover{
			border: 2px dotted yellow;
		}
		.boxer_blob_drag,.boxer_blob_resize{
			margin-left:2px;
		}
		.ui-state-disabled{
			opacity:1;
		}
		#testnotes{
			position:absolute;
			left:0px;
			top:500px;
		}
		
	</STYLE>
		<script src="../jquery/js/jquery-1.3.2.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="../jquery/js/jquery-ui-1.7.2.custom.min.js" type="text/javascript" charset="utf-8"></script>
	
	<script type="text/javascript" src="../Extensible/Monomyth.js"></script>
	<script type="text/javascript" src="../Box/Box.js"></script>
	<script type="text/javascript" src="./AutoRecImage.js"></script>
	<script type="text/javascript" src="../Shape/Shape.js"></script>
	<script type="text/javascript" src="./AutoRecognizer.js"></script>
	<script type="text/javascript" src="../ColorFilter/ColorFilter.js"></script>
	<script type="text/javascript" src="../RegionRule/RegionRule.js"></script>
	<SCRIPT type="text/JavaScript" language="JavaScript">

	var imageList = [{ uri: "../../Images/ham.jpg",
					transcript: [ "line","line","line","line","line","line",
					              "line","line","line","line","line","line",
					              "line","line","line","line","line","line",
					              "line","line","line","line","line","line",
					              "line","line","line","line","line","line",
					              "line","line","line","line","line","line",
					              "line","line","line","line","line","line"]},
					{ uri: "../../Images/hamTitle.jpg",
										transcript: [ "line","line","line","line","line","line",
										              "line","line","line","line","line","line",
										              "line","line","line","line","line","line",
										              "line","line","line","line","line","line",
										              "line","line","line","line","line","line",
										              "line","line","line","line","line","line",
										              "line","line","line","line","line","line"]}	              
					];              

	//  Region 
	var regionList = [];
	
	var regionList = [{ move: "stay", top: "50%", left: "30%", width: "10%", height: "5%"},
	                  { move: "next", top: "50%", left: "30%", width: "10%", height: "5%"}];

	                   
						
						
	
	
	var colorPanel = "<span id='colorPanel' class='color'>"+
	"<label>Red:</label>"+
	"<div id='red'></div>"+
	"<label>Green:</label>"+	            	
	"<div id='green'></div>"+
	"<label>Blue:</label>"+
	"<div id='blue'></div>"+	
	"</span>"+
	"<div id='backgroundimage'>0,0,0</div>";
	var curPageState=0; /*
	Page states: 0= Setting box for default
				 1= Setting default color 
				 				threshold
				 2= Adjusting box
				 3= Adjusting color
				 4= Adjusting lines				
 */
pageStates = [
// 0:  Defining boundary boxes
{
"sidebar": "<div class='sbMessage'>Please move and resize the red "+
		  "box to enclose a column of text</div>"+
		  "<div id='nextButton' class='nextButton'>Next</div>",
"callback": function(){
		
			  showBoundingBox();
			  $('#nextButton').bind("click",function(){	
				  
				  storeRegion();
				 // changeState(2);
			});}
		 

}];
	
/* 1:  Setting default color threshold of box
{
sidebarHTML:  "<div></div>"
 
}
				
	];*/
	var sidebars = [
	            	// 1 :  Defining box boundaries
	                "<div class='sbMessage'>Please move and resize the red box to enclose a column of text</div>"+
	                "<div class='nextButton'>Next</div>",
	                // 2:  Adjust default color
	                "<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>"+
	     			colorPanel+
	     			 "<div class='nextButton'>Next</div>",
					// 3:  Adjust the red box position
	                "<div class='sbMessage'>Please adjust the red box if necessary the red box to enclose a column of text.</div>"+
	                "<div class='nextButton'>Next</div>",
	                // 4:  Adjust the color
	                 "<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>"+
	     			colorPanel+
	     			 "<div class='nextButton'>Next</div>",
	     			// 5:  Adjust the lines
	     			"<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>"+
	     			 "<div class='nextButton'>Next</div>"
	     			];
	     			
	                
	               
	                
	                
	            	
	                
	                
	function changeState(stateVal){
				state = pageStates[stateVal];
				$("#sidebarContent").html(state.sidebar);
				state.callback();
				
		}				
	function showBoundingBox(){
		$("#regionBox").css("display","block");
	}
	function storeRegion(){
		var pos = $("#regionBox").draggable().position();
		//var size = $("#regionBox").resizable("option","size");
		var totWidth = $("#regionBox").parent().width();
		var totHeight = $("#regionBox").parent().height();
		var left = pos.left/totWidth;
		var top = pos.top/totHeight;
		var width = $("#regionBox").width()/totWidth;
		var height = $("#regionBox").height()/totHeight;
		alert(left+","+top+","+width+","+height);
		}
	
	function loadImages(path){
		imageList = [{ uri: "../../Images/ham.jpg",
			transcript: [ "line","line","line","line","line","line",
			              "line","line","line","line","line","line",
			              "line","line","line","line","line","line",
			              "line","line","line","line","line","line",
			              "line","line","line","line","line","line",
			              "line","line","line","line","line","line",
			              "line","line","line","line","line","line"]},
			{ uri: "../../Images/hamTitle.jpg",
								transcript: [ "line","line","line","line","line","line",
								              "line","line","line","line","line","line",
								              "line","line","line","line","line","line",
								              "line","line","line","line","line","line",
								              "line","line","line","line","line","line",
								              "line","line","line","line","line","line",
								              "line","line","line","line","line","line"]}	              
			]; 
		CANVAS.setUpCanvas("../../Images/ham.jpg"); 
		}   
	$(document).ready(function() {
		var container=$("#workspace");
		CANVAS=new CanvasImage({
			loc:container
		});
		$("#regionBox").resizable({
			/*stop: function(event,ui){

			$("#boxSize").trigger("boxResized",[ui.size]);
			}*/
		
		});
		$("#regionBox").draggable({ containment: 'parent',
									/*stop: function(event,ui){
									$("#boxSize").trigger("boxMoved",[ui.position]);
		}*/
			 });
		changeState(0);
		//colorPicker = new TileColorFilter({DOM: "colorPanel",red: "red",green: "green",blue: "blue",rgbDiv: "backgroundimage"});

	  });

	
		


//-------DEBUGGER-----------------
	my_window= window.open ("","mywindow1","scrollbars=yes,status=1,width=350,height=150");
		my_window.document.write("<HTML><body><div>Begin</div></body></HTML>");
	
	function debug(txt){
		var dbugLine = document.createElement("div");
		dbugLine.appendChild(document.createTextNode(txt));
		my_window.document.getElementsByTagName("body")[0].appendChild(dbugLine);
	}
	debug("starting");
	</SCRIPT>
</HEAD>
<BODY>
<div id="header">

</div>

<div id="content">

	<div id="sidebar">
		<div id="sidebarHead">
			<label for="imageManifest">Images uri:</label>
			<input type="text" size=10 onblur="loadImages(this.value)"></input>
			<div id="boxSize"></div>
			<div id="boxPos"></div>
		</div>
		<div id="sidebarContent">
		</div>
	</div>
	
	<div id="workspace">
		<img id="srcImageForCanvas" src=""/>
		</img>
		<div id="regionBox" class="boxer_plainbox"></div>
	</div>

</div>

</BODY>
</HTML>