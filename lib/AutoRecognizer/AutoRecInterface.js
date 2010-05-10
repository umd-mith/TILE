// Test Data -- delete later
var imageList = [{
    uri: "../../Images/ham.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}, {
    uri: "../../Images/hamTitle.jpg",
    transcript: ["word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word"]
}, {
    uri: "../../Images/mss.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}];

// Global variables
var curMove = 0;
//  Region 
var regionList = [];
// Data storage
var lineData = [];
var curImage = 0;
var curPageState = 0;
/*
 Page states: 0= Setting box for default
 1= Setting default color
 threshold
 2= Adjusting box
 3= Adjusting color
 4= Adjusting lines
 */
function sortNumber(a,b){
	return (a-b);	
}

function nextRegion(current){

	if (current == regionList.length) {
		
		current = 0;
		curRegion = 0;
		curImage++;
	}
	
	curImage = parseInt(curImage) + parseInt(regionList[current].move);
	
	
	imgsrc = imageList[curImage].uri;
	
	if (imgsrc != $("#srcImageForCanvas").attr("src")) {
		
	
	$("srcImageForCanvas").attr("src", imgsrc);
	
	CANVAS.setUpCanvas(imgsrc);
}
					
			
				
				
			
		
			cf.setValue(regionList[current].rgb);
				
			positionRegion(regionList[current]);
			threshold = $("#backgroundimage").text();
			car.thresholdConversion(threshold);
		   	tr = imageList[current].transcript;	
			out = "";
	for (var j=0;j<tr.length;j++){
		out+="<div class='trLine' id='trLine"+j+"'>"+tr[j]+"</div>";
	}
   
   	
   $("#transcript").html(out);
   $(".trLine").addClass("selLine");	
   
   
   
   $(".trLine").bind("mousedown",function(){
   		 ($(this).toggleClass("selLine"));
			
		
   		$(".trLine").bind("mouseover",function(){
			($(this).toggleClass("selLine"));
		});	
   });
   $(".trLine").bind("mouseup",function(){
   	$(".trLine").unbind("mouseover");
   });
   
   $("#transcript").css({display: "block"});        
        // deal with move direction then...
   
        threshold = $("#backgroundimage").text();
        car.thresholdConversion(threshold);
     

		
}
function positionRegion(rData){

    var cw = $("#canvas").width(); //canvas width
    var ch = $("#canvas").height(); //canvas height
    var rb = $("#regionBox");

    rb.width((parseFloat(rData.width) * cw));
    rb.height((parseFloat(rData.height) * ch));
    rb.css({
        top: (parseFloat(rData.top) * ch) + "px",
        left: (parseFloat(rData.left) * cw) + "px"
    });
    debug(rb.css());
}
function expandTranscript(){
	var newWidth = $("#transcript").width()*2;
	var newHeight = $("#transcript").height()*2;
	$("#sidebar").css({
		"z-index":"100",
		"overflow": "visible"
		
	});
	$("#transcript").css({
		"width": newWidth,
		"height": newHeight,
		"z-index": "100"
	});
	
	$("#transcript").unbind("click");
	 $("#transcript").bind("mouseout",function(e){
	 	if (e.target.id == "transcript") {
			collapseTranscript();
		}
	 });
	
	
}
function collapseTranscript(){
		var newWidth = $("#transcript").width()/2;
	var newHeight = $("#transcript").height()/2;
	$("#transcript").css({
		width: newWidth,
		height: newHeight
	});
		$("#sidebar").css({
		"z-index":"1",
		"overflow": "auto"
		
	});
		$("#transcript").unbind("mouseout");
	 $("#transcript").bind("click",function(e){
	 	
		expandTranscript();
		
	 });
}
function changeState(stateVal){
    state = pageStates[stateVal];
    $("#sidebarContent").html(state.sidebar);
    state.callback();
    
}

function showBoundingBox(){
    $("#regionBox").css("display", "block");
}

var regionList = [];

function storeRegion(){
    var pos = $("#regionBox").draggable().position();
    //var size = $("#regionBox").resizable("option","size");
    var totWidth = $("#regionBox").parent().width();
    var totHeight = $("#regionBox").parent().height();
    var left = pos.left / totWidth;
    var top = pos.top / totHeight;
    var width = $("#regionBox").width() / totWidth;
    var height = $("#regionBox").height() / totHeight;
    var rgb = $("#backgroundimage").text();
   
    regionList.push({
        move: curMove,
        left: left,
        top: top,
        width: width,
        height: height,
        rgb: rgb
    });
    $("#regionBox").css({
        "background-color": "red"
    });
    $("#regionBox").animate({
        "opacity": 0,
    }, 250, function(){
        $("#regionBox").css({
            "background-color": "transparent",
            "opacity": 1,
        });
        
    });
	var curLineId = "cl"+(regionList.length-1); 
    var curList = $("#regionListBox").html() + "<div id='"+curLineId+"'><div class='deleteLine'>x</div>" + curMove + "," + left + "," + top + "," + width + "," +
    height +
    "," +
    rgb +
    "</div>";
   
	
    $("#regionListBox").html(curList);
	 $(".deleteLine").bind("click",function(){
	 		var clIndex = parseInt($(this).parent().attr("id").substring(2));
			regionList[clIndex]=false;
			$(this).parent().remove();
			
	});
}

function loadImages(path){
	
 	$("srcImageForCanvas").attr("src",imageList[0].uri);
    CANVAS.setUpCanvas(imageList[0].uri);

   
    
}

$(document).ready(function(){
    var container = $("#workspace");
    CANVAS = new CanvasImage({
        loc: container
    });
    $("#regionBox").resizable();
    $("#regionBox").draggable({
        containment: 'parent'
    });
    
    
    cf = new TileColorFilter({
        DOM: "colorPanel",
        red: "red",
        green: "green",
        blue: "blue",
        colorBox: "backgroundimage"
    });
    changeState(0);
    //colorPicker = new TileColorFilter({DOM: "colorPanel",red: "red",green: "green",blue: "blue",rgbDiv: "backgroundimage"});

});

function recognize(){
	numOfLines = $(".selLine").length;
            bucket = car.createLineBreaks(numOfLines);
			bucket.sort(sortNumber);
			curLinesArray = [];
			var left = ($("#regionBox").position().left);
            var rtop = ($("#regionBox").position().top);    
            var lastTop = parseInt(rtop);
			$(".selLine").removeClass("selLine").addClass("recLine");	
            	
			for (var i = 0; i < bucket.length; i++) {
            
    
                var top = rtop+bucket[i];
				var height = parseInt(top)-parseInt(lastTop);
				// Blob box is in Box.js.  Figure out what imageObj is and
				// get rid of it.
				debug("top: "+top+" lastTop: "+lastTop+" height: "+height);
                bb = new lineBox({
                    width: $("#regionBox").width(),
                    height: height,
                    left: left,
                    top: lastTop,
                    loc: $("#workspace")
                });
				
				lastTop = top;
				jsel = ".recLine:eq("+(i)+")";
				debug("jsel: "+jsel);
				$(jsel).attr("id","recLine"+(i)).bind("click",{lineBox: bb},function(e){
					var lb = e.data.lineBox;
					var id = lb.DOM.attr("id");
					e.data.lineBox.select(id);
				});
				
				
            }
			$("body").bind("lineClicked",function(e,data){
					
					var num = data.substring(8);
					var id = "recLine"+num;
			
						
						$(".recLine").css({"background-color": "#ddaaaa"});
						$("#"+id).css({
							"background-color": "purple"
						});
					
				});
			$('#recognize').replaceWith("<div id='save'>Save</div>");
				$('#save').bind("click",function(){
					lineData.push({
                    img: $("srcImageForCanvas").attr("src"),
					left: left,
					rtop: top,
					lines: bucket
                });
				$('#save').replaceWith("<div id='recognize'>Recognize</div>");
				 $(".lineBox").remove();
				 curRegion++;
				 nextRegion(curRegion);
				});
}



//-------DEBUGGER-----------------
my_window = window.open("", "mywindow1", "scrollbars=yes,status=1,width=350,height=150");
my_window.document.write("<HTML><body><div>Begin</div></body></HTML>");

function debug(txt){
    var dbugLine = document.createElement("div");
    dbugLine.appendChild(document.createTextNode(txt));
    my_window.document.getElementsByTagName("body")[0].appendChild(dbugLine);
}

debug("starting");
