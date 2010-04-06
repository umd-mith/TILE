var AutoRecognizer=Monomyth.Class.extend({
	init:function(args){
		this.data=[];
		this.shapes=[];
	}
	
});

/**
CanvasAutoRecognizer

Functions:
init (constructor)
getRegion - receives values from Image object
thresholdConversion
filterDots
createLineBreaks
convertShapesToLines
cleanLineBreaks
colorLineBreaks

listens for:
RegionSet
**/

var CanvasAutoRecognizer=AutoRecognizer.extend({
	init:function(args){
		this.$super(args);
		this.dots=[];
		this.canvasImage=args.obj;
		this.canvas=args.canvas;
		this.Region=null;
		this.regionData=null;
		this.dotMin=(args.dotMin)?args.dotMin:10;
		this.dotMax=(args.dotMax)?args.dotMax:1000;
		this.bkGrnd="(0,0,0)";
		this.context=this.canvas[0].getContext('2d');
		
	},
	setRegion:function(values){
		
		this.Region=values;
		//adjust values to the canvas area
		//this.Region.ox=this.Region.ox-this.canvas.offset().left;
		//this.Region.oy=this.Region.oy-this.canvas.offset().top;
		this.canvas.trigger("regionloaded");
	},
	toBlackWhite:function(imageEl){
		      var canvas = document.getElementsByTagName("canvas")[0];
        var canvasContext = canvas.getContext('2d');
        
        var imgW = imageEl.width;
        var imgH = imageEl.height;
         alert(imgW);
        var imgPixels = canvasContext.getImageData(0, 0, imgW, imgH);
      
        for(var y = 0; y < imgPixels.height; y++){
            for(var x = 0; x < imgPixels.width; x++){
                var i = (y * 4) * imgPixels.width + x * 4;
                var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg; 
                imgPixels.data[i + 1] = avg; 
                imgPixels.data[i + 2] = avg;
            }
        }
        
        canvasContext.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
		alert("done")
	},
	thresholdConversion:function(imageEl,bg){
		if(this.Region){
			this.dots=[]; //resets main dot matrix
			
			//disseminate the rbg color value into parts
			var data = "";

			this.regionData=this.context.getImageData(0, 0, this.Region.w, this.Region.h); 
			
			} else {
				//create a blank slate - somehow 'createImageData' doesn't work in this case
				var zoomData=this.canvasImage.getZoomLevel();
				var nw=(imageEl.width/(Math.pow(2,zoomData.zoomLevel)));
				var nh=(imageEl.height/(Math.pow(2,zoomData.zoomLevel)));
				this.context.drawImage(imageEl, 0, 0, nw,nh);
				//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
				this.regionData=this.context.getImageData(this.Region.ox, this.Region.oy, this.Region.w, this.Region.h); 
			}
	 	
		 	var total = 0;
			//CREATING this.dots array matrix
			//GOING HORIZONTAL TO VERTICAL
			for (var j=0; j<this.Region.h; j++){
			  for (var i=0; i<this.Region.w; i++){
			    // var index=(i*4)*imageData.width+(j*4);
			     var index=(i +j*this.Region.w)*4;
				 var red=this.regionData.data[index];	  
			     var green=this.regionData.data[index+1];
			     var blue=this.regionData.data[index+2];	  
			     var alpha=this.regionData.data[index+3];	 
			     var average=(red+green+blue)/3;
				 adiff = Math.abs(average-selAverage);
	 
				if (average>selAverage){
					//turn white
			   	 	this.regionData.data[index]=255;	  
				    this.regionData.data[index+1]=255;
				    this.regionData.data[index+2]=255;
				    this.regionData.data[index+3]=alpha;
				}	
				else{
					//turn black
				 	this.regionData.data[index]=0;	  
				    this.regionData.data[index+1]=0;
				    this.regionData.data[index+2]=0;
				    this.regionData.data[index+3]=alpha;
					//add to large array
					if((this.dots["D"+j]==null)){
						this.dots["D"+j]=[];
					}
					
					this.dots["D"+j]["D"+i]=0;
					//$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"][D"+i+"]="+this.dots["D"+j]["D"+i]);
					total++;
				} 
				
			  }
				
			}
	 		//convert area to black and white using putImageData
			this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
			
		
	},
	filterDots:function(cancel){
		//go through the Black Dots matrix and find blobs
		if(this.shapes.length>0){
			$(".blobbox").remove();
			
		}
		this.shapes=[];
		
		var shapecount=0;
		
		for(y in this.dots){
			//$("#testnotes").append("<p>row: "+y+"</p>");
			row=parseInt(y.substring(1),10);
			
			for(x in this.dots[y]){
				if(this.dots[y][x]>=0){
					var dot=this.dots[y][x]; 
				//	$("#testnotes").append("<p>col: "+x+"</p>");
				if(dot==0){
						//not categorized - need to find it a shape 
						//or create a new shape to put it in
					 	
						col=parseInt(x.substring(1),10);
						
						//go in order: left, right, above, below
						kl="D"+(col-1);
						kr="D"+(col+1);
						ka="D"+(row-1);
						kb="D"+(row+1);
						sides=0;
						// First look at all dots immediately above 
						
						if (this.dots[ka]){
							if ((this.dots[ka][kl])){
								this.dots[y][x]=this.dots[ka][kl];
								this.shapes[this.dots[y][x]].add({x:x,y:y});
								sides++;
								
							}
							if ((this.dots[ka][x])){
								this.dots[y][x]=this.dots[ka][x];
								this.shapes[this.dots[y][x]].add({x:x,y:y});
								sides++;
							}
							if ((this.dots[ka][kr])){
								this.dots[y][x]=this.dots[ka][kr];
								this.shapes[this.dots[y][x]].add({x:x,y:y});
								sides++;
							}
						}
						//and also to the left
						if (this.dots[y][kl]){
								this.dots[y][x]=this.dots[y][kl];
								this.shapes[this.dots[y][x]].add({x:x,y:y});
								sides++;
						
							if (this.dots[kb]) {
								if (this.dots[kb][kl]) {
									this.dots[y][x] = this.dots[kb][kl];
									this.shapes[this.dots[y][x]].add({x:x,y:y});
									sides++;
								}
							}
						}
						if (sides == 0) {
							//new shape 
							shapecount++;
							this.dots[y][x] = shapecount;
							this.shapes[this.dots[y][x]]=new Shape({index:shapecount,initialLeft:this.Region.ox,initialTop:this.Region.h,foundOnRow:y});
							this.shapes[this.dots[y][x]].add({x:x,y:y});
							
						}
						//Now look to the right and below.
						
						if (this.dots[ka]){
							if (this.dots[ka][kl]) {
								this.dots[ka][kl] = this.dots[y][x];
								this.shapes[this.dots[y][x]].add({x:kl,y:ka});
							}
						}
						if (this.dots[y][kl]){
							this.dots[y][kl]=this.dots[y][x];
							this.shapes[this.dots[y][x]].add({x:kl,y:y});
						}
						if (this.dots[kb]) {
							if (this.dots[kb][kl]) {
								this.dots[kb][kl] = this.dots[y][x];
								this.shapes[this.dots[y][x]].add({x:kl,y:kb});
							}
						}
					}
				}
			}
			
			// End of Row
			
		}

		if(cancel) this.noiseCanceler();
	
	},
	noiseCanceler:function(){
		//take shapes and cancel out the ones with coords fewer
		//than this.dotMin
		MIN=this.dotMin;
		var temp=jQuery.grep(this.shapes,function(el,i){
			
			return ((el)&&(el.coords.length>MIN));
		});
		this.shapes=temp;
		//update shape indexes
		jQuery.each(this.shapes,function(i,el){
			el.index=i;
		});
	},
	convertShapesToLines:function(attach){
		
		if((this.shapes.length>0)&&this.Region){
			//create linebreak array
			//this.sortShapes("foundOnRow");
			this.createLineBreaks();

		}
	},
	storeData:function(){
		//create a smaller object that houses all of the
		//recognizer data for this particular instance
		//narrow down region to its original size
		var zoom=this.canvasImage.getZoomLevel();
		var ox=this.Region.ox/(Math.pow(2,zoom));
		var oy=this.Region.oy/(Math.pow(2,zoom));
		var w=this.Region.w/(Math.pow(2,zoom));
		var h=this.Region.h/(Math.pow(2,zoom));
		
		
		this.data={
			region:{ox:ox,oy:oy,w:w,h:h}
		};
		
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		var data=obj.canvasImage.getZoomLevel();
		
		if(obj.Region){
			if((data.zoomLevel>0)&&(data.zoomLevel<5)){
				obj.Region.ox=(data.size[0]*obj.Region.ox)/data.psize[0];
				obj.Region.oy=(data.size[1]*obj.Region.oy)/data.psize[1];
				obj.Region.w=(data.size[0]*obj.Region.w)/data.psize[0];
				obj.Region.h=(data.size[1]*obj.Region.h)/data.psize[1];
				if($(".blobbox").length>0) obj.adjustBlobBoxes();
			}
			/**if((val>0)&&(zoom>0)){
				obj.Region.ox*=2;
				obj.Region.oy*=2;
				obj.Region.w*=2;
				obj.Region.h*=2;
				if($(".blobbox").length>0) obj.adjustBlobBoxes(val);
			} else if(zoom<5){
				obj.Region.ox/=2;
				obj.Region.oy/=2;
				obj.Region.w/=2;
				obj.Region.h/=2;
				if($(".blobbox").length>0) obj.adjustBlobBoxes(val);
			}**/
		}
	},
	adjustBlobBoxes:function(){
		var data=this.canvasImage.getZoomLevel();
		var blobs=$(".blobbox");
		if(blobs.length>0){
			if((data.zoomLevel>0)&&(data.zoomLevel<5)){
				for(b=0;b<blobs.length;b++){
					var blob=$(blobs[b]);
					var left=((parseInt(blob.css("left"),10))*data.size[0])/data.psize[0];
					var top=((parseInt(blob.css("top"),10))*data.size[1])/data.psize[1];
					var w=(blob.width()*data.size[0])/data.psize[0];
					var h=(blob.height()*data.size[1])/data.psize[1];
					blob.width(w);
					blob.height(h);
					blob.css("left",left+'px');
					blob.css("top",top+'px');
				}
			}
		}
	},
	sortShapes:function(sortAttribute) {
	// DLR: From myBubbleSort function @ http://www.irt.org/articles/js054/index.htm
    for (var i=0; i<(this.shapes.length-1); i++)
        for (var j=i+1; j<this.shapes.length; j++)
            if (this.shapes[j][sortAttribute] < this.shapes[i][sortAttribute]) {
                var dummy = this.shapes[i];
                this.shapes[i] = this.shapes[j];
                this.shapes[j] = dummy;
            }
	},
	createLineBreaks:function(){
		//creates linebreaks array from shapes array
		
		linebreaks=[];
		lineinfo = [];
		lineinfoSize = 0;

		this.sortShapes("foundOnRow");
		bottomList = "";
		
		/* First go through all the shapes and 
		 * sort them into the horizontal rows on which 
		 * they were first discovered.  While doing this 
		 * determine the average height and average lowest
		 * point of shapes discovered on that line.
		 */
		for (var n=0;n<this.shapes.length;n++){
			//alert("FoR-"+this.shapes[n].foundOnRow);
			var row = parseInt(this.shapes[n].foundOnRow);
			var sheight = parseInt(this.shapes[n].Bottom)-parseInt(this.shapes[n].Top);
			if (lineinfo[row]){
				
				lineinfo[row].shapes.push(n);
				lineinfo[row].height = parseInt(lineinfo[row].height)+sheight;
				lineinfo[row].bottom += this.shapes[n].Bottom;
				
			}
			else{
			
				lineinfo[row]={
					shapes: [],
					height: sheight,
					avgHeight: 0,
					bottom: 0,
					avgBottom: this.shapes[n].Bottom
				};
				lineinfo[row].shapes.push(n);
				
			}
			
		}
		avgHeight = 0;
		/*
		 * Convert to iterative array
		 */
		iLineInfo = [];
		for (var n in lineinfo){
			iLineInfo.push(lineinfo[n]);			
		}

			
			
			
		/*
		 * Now find the average height of all the lines in the image
		 */
		for (var n=0;n<iLineInfo.length;n++){
			if (iLineInfo[n].shapes.length > 0) {
				iLineInfo[n].avgHeight = iLineInfo[n].height / iLineInfo[n].shapes.length;
				iLineInfo[n].avgBottom = iLineInfo[n].bottom / iLineInfo[n].shapes.length;
				avgHeight = parseInt(avgHeight) + parseInt(iLineInfo[n].avgHeight);
				lineinfoSize++;
			}
		}
		alert(avgHeight+" total");
		avgHeight = avgHeight/(lineinfoSize);
		
		alert("avgHeight: "+avgHeight);
		/*
		 * Sort the lines in order by avgBottom
		 */
	
		
		
		    for (var i = 0; i < (iLineInfo.length - 1); i++) {
				for (var j = i + 1; j < iLineInfo.length; j++) {
					if (iLineInfo[j].avgBottom < iLineInfo[i].avgBottom) {
						var dummy = iLineInfo[i];
						iLineInfo[i] = iLineInfo[j];
						iLineInfo[j] = dummy;
					}
				}
			}
		prevLine = 0;
		/*
		 * Now, for every line in the image that has a height 
		 * greater than or equal to the average height, and which has an 
		 * average lowest point that is a distance from the previous line 
		 * greater than or equal to the average height, draw a red line. 
		 */
		for (var n=0;n<iLineInfo.length;n++) {
			if (iLineInfo[n].avgBottom > 0) {
				bottomList = bottomList+iLineInfo[n].avgBottom+"  :  "+iLineInfo[n].avgHeight+"  :  "+(Math.abs(iLineInfo[n].avgBottom - prevLine))+"<br/>";
			
			
				if ((iLineInfo[n].avgHeight >= avgHeight) && (Math.abs(iLineInfo[n].avgBottom - prevLine) >= avgHeight)) {
					//alert("Dangerous area ");
					var left = (this.Region.ox + this.canvas.position().left);
					//alert(left);
					var top = (this.Region.oy + iLineInfo[n].avgBottom + this.canvas.position().top);
					//var height=10;
					//create blob box
					//alert("making box "+top);
					bottomList = bottomList+"<hr/>";
					bb = new BlobBox({
						width: this.Region.w,
						height: 0,
						left: left,
						top: top,
						imageObj: this.canvasImage,
						loc: $(this.canvas.parent())
					});
					prevLine = iLineInfo[n].avgBottom;
				}
				
			
				
			}
		}
		my_window= window.open ("",
  "mywindow1","status=1,width=350,height=150");
my_window.document.write(bottomList);  
		//document.getElementsByTagName("body")[0].innerHTML=bottomList;
		return;
		},
	addLineBreak:function(e){
		
	},
	colorLineBreaks:function(imageEl){
	
		for(y in this.dots){
			var row=parseInt(y.substring(1),10);
			for(x in this.dots[y]){
				var col=parseInt(x.substring(1),10);
				var shape=this.dots[y][x];
				if (jQuery.inArray(shape,this.lineBreaks)>0){
					var index=(col +row*this.Region.w)*4;
					var alpha=this.regionData.data[index+3];
					var odd=((shape%2)==0);
					//even, it gets a red value, ODD, gets a GREEN value
				
					this.regionData.data[index]=(odd)?255:0;	  
					this.regionData.data[index+1]=(odd)?0:255;
					this.regionData.data[index+2]=0;	
					this.regionData.data[index+3]=alpha;
				}
			}
		}
		//change colors
		var	nh = (parseInt(imageEl.height,10)*1000)/parseInt(imageEl.width,10);
		//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
	}
	
});