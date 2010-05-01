// Test Data -- delete later
var imageList = [{
    uri: "../../Images/ham.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}, {
    uri: "../../Images/hamTitle.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}, {
    uri: "../../Images/mss.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}];
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
pageStates = [// 0:  Defining boundary boxes
{

    "sidebar": "<div id='loadButton' class='nextButton'>Load</div>",
    
    "callback": function(){
        $('#loadButton').bind("click", function(){
       		loadImages("");
			
            $('#nextButton').unbind("click");
            changeState(1);
        });
    }
}, // 1:  Setting default color	
{
    "sidebar": "<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>" +
    
    "<div class='nextButton' id='captureButton'>Capture</div><div class='prevButton' id='prevButton'>Prev</div><div class='nextButton' id='nextButton'>Next</div><div id='done'>Done</div>" +
    "<div id='regionListBox'></div>",
    "callback": function(){
        showBoundingBox();
        
        $("#colorSection").css({
            display: "block"
        });
        $("#regionBox").resizable().bind("resizestop", function(){
            threshold = $("#backgroundimage").text();
            car.thresholdConversion(threshold);
        });
        $("#regionBox").draggable().bind("dragstop", function(){
            threshold = $("#backgroundimage").text();
            car.thresholdConversion(threshold);
        });
		$("#nextButton").bind("click",function(){
	
			curImage = parseInt(curImage)+1;
			curMove++;
			
			imgsrc = imageList[curImage].uri;	
				
			$("srcImageForCanvas").attr("src",imgsrc);
			
				
			
			CANVAS.setUpCanvas(imgsrc);
			
			
		});
			$("#prevButton").bind("click",function(){
			
			curImage = parseInt(curImage)-1;
			curMove--;
			
			imgsrc = imageList[curImage].uri;	
				
			$("srcImageForCanvas").attr("src",imgsrc);
			CANVAS.setUpCanvas(imgsrc);
			
			
		});
        $("#captureButton").bind("click", function(){
        
            storeRegion();
            
            
        });
        car = new CanvasAutoRecognizer({
            imageEl: "srcImageForCanvas",
            regionID: "regionBox"
        });
        $("body").bind("ColorChange", function(e, threshold){
        
            car.thresholdConversion(threshold);
        });
        $("#done").bind("click", function(){
        imgsrc = imageList[0].uri;	
				
			$("srcImageForCanvas").attr("src",imgsrc);
			CANVAS.setUpCanvas(imgsrc);
            changeState(2);
            
        });
    }
}, //State 2: Running recognizer
{

    "sidebar": "<div class='sbMessage'>Adjust the red box then click &quot;Recognize&quot;</div>" +
    "<div id='nextButton'>Next</div><div id='recognize' class='button'>Recognize</div>",
    
    "callback": function(){
        curRegion = 0;
        curImage = 0;
        	tr = imageList[0].transcript;
	out = "";
	
	for (var i=0;i<tr.length;i++){
		out+="<div class='trLine' id='trLine"+i+"'>"+tr[i]+"</div>";
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
   $("#transcript").bind("click",function(){
   	expandTranscript();
	 
   });
        
        // deal with move direction then...
        positionRegion(regionList[0]);
        cf.setValue(regionList[0].rgb);
        threshold = $("#backgroundimage").text();
        car.thresholdConversion(threshold);
        $('#nextButton').bind("click", function(){
			curRegion++;
        	nextRegion(curRegion);
        });
        $('#recognize').bind("click", function(){
			numOfLines = $(".selLine").length;
			alert(numOfLines);
            bucket = car.createLineBreaks(numOfLines);
			curLinesArray = [];
			var left = ($("#regionBox").position().left);
            var rtop = ($("#regionBox").position().top);    
            for (var i = 0; i < bucket.length; i++) {
            
    
                var top = rtop+bucket[i];
				// Blob box is in Box.js.  Figure out what imageObj is and
				// get rid of it.
                bb = new BlobBox({
                    width: $("#regionBox").width(),
                    height: 0,
                    left: left,
                    top: top,
                    loc: $("#workspace")
                });
			/*	curLinesArray.push(
					{width: $("#regionBox").width(),
                    height: 0,
                    left: left,
                    top: top}
				);*/
					
                
            }
			$('#recognize').replaceWith("<div id='save'>Save</div>");
				$('#save').bind("click",function(){
					lineData.push({
                    img: $("srcImageForCanvas").attr("src"),
					left: left,
					rtop: top,
					lines: bucket
                });
				$('#save').replaceWith("<div id='recognize'>Recognize</div>");
				 curRegion++;
				 nextRegion(curRegion);
				});
            
        });
		
        
    }
}];
function nextRegion(i){
		if (i == regionList.length) {
		 i=0;
		 curRegion = 0;
		 curImage++;
		}
			
			curImage = parseInt(curImage) + parseInt(regionList[i].move);
			
			
			imgsrc = imageList[curImage].uri;
			if (imgsrc != $("#srcImageForCanvas").attr("src")) {
				alert(imgsrc +" != "+$("#srcImageForCanvas").attr("src"));
				$("srcImageForCanvas").attr("src", imgsrc);
				
				CANVAS.setUpCanvas(imgsrc);
			}
		
			cf.setValue(regionList[i].rgb);
			positionRegion(regionList[i]);
			threshold = $("#backgroundimage").text();
			car.thresholdConversion(threshold);
		
		
}
function positionRegion(rData){
    var cw = $("#canvas").width(); //canvas width
    var ch = $("#canvas").height(); //canvas height
    var rb = $("#regionBox");
    debug(cw + "," + ch);
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
    var curList = $("#regionListBox").html() + "<div id=''><div class='deleteLine'>x</div>" + curMove + "," + left + "," + top + "," + width + "," +
    height +
    "," +
    rgb +
    "</div>";
    $(".deleteLine")
    $("#regionListBox").html(curList);
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





//-------DEBUGGER-----------------
my_window = window.open("", "mywindow1", "scrollbars=yes,status=1,width=350,height=150");
my_window.document.write("<HTML><body><div>Begin</div></body></HTML>");

function debug(txt){
    var dbugLine = document.createElement("div");
    dbugLine.appendChild(document.createTextNode(txt));
    my_window.document.getElementsByTagName("body")[0].appendChild(dbugLine);
}

debug("starting");
