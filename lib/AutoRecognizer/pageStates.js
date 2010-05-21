/**
 * @author dreside
 * Page States
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
			regionList = _.compact(regionList);	
			$("srcImageForCanvas").attr("src",imgsrc);
			CANVAS.setUpCanvas(imgsrc);
            changeState(2);
            
        });
    }
}, //State 2: Running recognizer
{

    "sidebar": "<div class='sbMessage'>Adjust the red box then click &quot;Recognize&quot;</div>" +
    "<div id='nextButton' class='button'>Skip</div><div id='recognize' class='button'>Recognize</div>",
    
    "callback": function(){
			$("#nextButton").bind("click",function(){
			 curRegion++;
				 nextRegion(curRegion);
		})
        $('#recognize').bind("click", function(){
			recognize();
            
        });
        curRegion = 0;
        curImage = 0;
        nextRegion(0);	
		
        
    }
}];