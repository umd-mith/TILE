// Test Data -- delete later
var imageList = [{
    uri: "../../Images/ham.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}, {
    uri: "../../Images/hamTitle.jpg",
    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
}];

//  Region 
var regionList = [];

var colorPanel = "<span id='colorPanel' class='color'>" +
"<label>Red:</label>" +
"<div id='red'></div>" +
"<label>Green:</label>" +
"<div id='green'></div>" +
"<label>Blue:</label>" +
"<div id='blue'></div>" +
"</span>" +
"<div id='backgroundimage'>0,0,0</div>";

var curPageState = 0;
/*
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
    
	"sidebar": "<div class='sbMessage'>Please move and resize the red " +
    "box to enclose a column of text</div>" +
    "<div id='nextButton' class='nextButton'>Next</div>",
    
	"callback": function(){
    
        //showBoundingBox();
        $('#nextButton').bind("click", function(){
 
            $('#nextButton').unbind("click");
            changeState(1);
        });
    }
	}, 
// 1:  Setting default color	
	{
    "sidebar": "<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>" +
   
    "<div class='nextButton' id='nextButton'>Capture</div><div id='done'>Done</div>"+
	"<div id='regionListBox'></div>",
    "callback": function(){
     	showBoundingBox();
      
		$("#colorSection").css({
			display: "block"
		});
		$("#regionBox").resizable().bind("resizestop",function(){
			 	threshold = $("#backgroundimage").text();
				
        	car.thresholdConversion(threshold);
		});
		$("#regionBox").draggable().bind("dragstop",function(){
			 	threshold = $("#backgroundimage").text();
        	car.thresholdConversion(threshold);
		});
        $("#nextButton").bind("click", function(){
			
			storeRegion();
			
           
        });
		 car = new CanvasAutoRecognizer({
			imageEl: "srcImageForCanvas",
			regionID: "regionBox"
		});
		$("body").bind("ColorChange",function(e, threshold){
			
			car.thresholdConversion(threshold);
		});
		 $("#done").bind("click", function(){
			
			changeState(2);
			
        });
    }
},
 {
    
	"sidebar": "<div class='sbMessage'>Adjust the red box then click &quot;Recognize&quot;</div>" +
    "<div id='nextButton'>Next</div><div id='recognize' class='button'>Recognize</div>",
    
	"callback": function(){
  			i=0;
			
		
        	
			// deal with move direction then...
			positionRegion(regionList[0]);
			cf.setValue(regionList[0].rgb);
			threshold = $("#backgroundimage").text();
        	car.thresholdConversion(threshold);
        $('#nextButton').bind("click", function(){
 			
          
            i++;
			if (i==regionList.length){
				i=0;
			}
			cf.setValue(regionList[i].rgb);
			positionRegion(regionList[i]);
			threshold = $("#backgroundimage").text();
        	car.thresholdConversion(threshold);
        });
    }
	} ];


function positionRegion(rData){
			 var cw = $("#canvas").width(); //canvas width
			 var ch = $("#canvas").height(); //canvas height
			 var rb = $("#regionBox");
			 debug(cw+","+ch);
			 rb.width((parseFloat(rData.width) * cw));
			 rb.height((parseFloat(rData.height) * ch));
			 rb.css({
			 	top: (parseFloat(rData.top) * ch) + "px",
			 	left: (parseFloat(rData.left) * cw) + "px"
			 });
			 debug(rb.css());
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
var curMove = "stay";
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
  }, 250, function() {
  	$("#regionBox").css({
		"background-color": "transparent",
		"opacity": 1,
	}); 
    
  });
  	var curList = $("#regionListBox").html()+"<div>"+curMove+","+left+","+top+","+width+","+
				  height+","+rgb+"</div>";
				  
	$("#regionListBox").html(curList);
}

function loadImages(path){
    imageList = [{
        uri: "../../Images/ham.jpg",
        transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
    }, {
        uri: "../../Images/hamTitle.jpg",
        transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
    }];
    CANVAS.setUpCanvas("../../Images/ham.jpg");
	
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
