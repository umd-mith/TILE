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
		this.numOfLines=$("#numOfLines")[0].value;
		this.minLineHeight=5;
		this.canvasImage=args.obj;
		this.canvas=args.canvas;
		this.Region=null;
		this.regionData=null;
		this.bdrows = []; // Array of total black dots in each row
		this.bdcols = []; // Array of total black dots in each column
		this.maxes = []; // Array of row #s that represent peaks of dots
		this.mins = []; // Array of row #s that represent troughs of dots
		this.dotMatrix = [];
		this.dotMin=(args.dotMin)?args.dotMin:5;
		this.dotMax=(args.dotMax)?args.dotMax:1000;
		this.bkGrnd="(0,0,0)";
		this.imageEl=null;
		this.context=this.canvas[0].getContext('2d');
		this.selAverage="CCCCCC";
		$("body").bind('zoom',{obj:this},this.zoom);
	},
	setRegion:function(values){
		
		this.Region=values;
		//adjust values to the canvas area
		//this.Region.ox=this.Region.ox-this.canvas.offset().left;
		//this.Region.oy=this.Region.oy-this.canvas.offset().top;
		this.canvas.trigger("regionloaded");
	},

	

	thresholdConversion:function(imageEl,bg){
		debug("thresholdConversion");
		this.imageEl =imageEl;
		var goingUp = 0; // 1 if row n has more dots than row n-1, 2 if not
		this.dotMatrix=[];  
		if(this.Region){
			this.dots=[]; //resets main dot matrix
			
			//divide the rbg color value into parts
			var data = "";
			if(bg){
				data=bg.split(",");
				this.bkGrnd=bg;
			} else {
				data=this.bkGrnd.split(',');
			}
			var selred=parseInt(data[0],10);	  
	     	var selgreen=parseInt(data[1],10);
	     	var selblue=parseInt(data[2],10);	
	     	this.selAverage=(selred+selgreen+selblue)/3;
			//get canvas imageData
			if(!this.regionData){
				this.regionData=this.context.getImageData(this.Region.ox, this.Region.oy, this.Region.w, this.Region.h); 
			
			} else {
				//create a blank slate - somehow 'createImageData' doesn't work in this case
				var zoomData=this.canvasImage.getZoomLevel();
				//BUG: TODO: remove and replace with CanvasImage function
				//var nw=(imageEl.width/(Math.pow(2,zoomData.zoomLevel)));
				//var nh=(imageEl.height/(Math.pow(2,zoomData.zoomLevel)));
				this.context.drawImage(imageEl, 0, 0, imageEl.width,imageEl.height);
				//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
				this.regionData=this.context.getImageData(this.Region.ox, this.Region.oy, this.Region.w, this.Region.h); 
			}
	 	
		 	var total = 0;
			//CREATING this.dots array matrix
			//GOING HORIZONTAL TO VERTICAL
			for (var j=0; j<this.Region.h; j++){
				this.bdrows["R"+j]=0;
			  for (var i=0; i<this.Region.w; i++){
		
			    // var index=(i*4)*imageData.width+(j*4);
				this.bdcols["C"+i]=0;
			     var index=(i +j*this.Region.w)*4;
				 var red=this.regionData.data[index];	  
			     var green=this.regionData.data[index+1];
			     var blue=this.regionData.data[index+2];	  
			     var alpha=this.regionData.data[index+3];	 
			     var average=(red+green+blue)/3;
				 adiff = Math.abs(average-this.selAverage);
	 			if (!(this.dotMatrix[j])){
					this.dotMatrix[j]=[];
				}
				this.dotMatrix[j][i]= average;
			
				
				if (average>this.selAverage){
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
					this.bdcols["C"+i]++;
					this.bdrows["R"+j]++;
					
					this.dots["D"+j]["D"+i]=0;
					//$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"][D"+i+"]="+this.dots["D"+j]["D"+i]);
					total++;
				} 
				
			  }
			  /*
			  if (j>0){
			  	
			  	if (this.bdrows["R" + j] > this.bdrows["R" + (j - 1)]) {
						//debug("Push "+j);	
					if (goingUp == 2){
						if (this.maxes.length>0){
							var lastmax = this.bdrows[this.maxes[this.maxes.length-1]["row"]];
						}
						else{
							lastmax = 0;
						}
						this.mins.push({row: "R"+(j-1), lastMax: lastmax});
										
					}
					goingUp = 1;
				}
				else if (this.bdrows["R" + j] < this.bdrows["R" + (j - 1)]){
					if (goingUp == 1){
						this.maxes.push({
							row: "R" + (j - 1)
						});
						if (this.mins.length>0){
							this.mins[this.mins.length-1]["nextMax"]=this.bdrows["R"+j];
							this.mins[this.mins.length-1]["surroundHeight"]=this.mins[this.mins.length-1]["nextMax"]+this.mins[this.mins.length-1]["lastMax"];
						}
												
					}
					goingUp = 2;
				}
				
			  	
			  	
			  }
			  */
			  
				
			}
	 		//convert area to black and white using putImageData
			this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
			
		}
	},
	medianThreshold: function(){
		debug("running median");
		var newMatrix = [];
		for (var i=0;i<this.dotMatrix.length;i++){
			newMatrix[i]=[];
			newMatrix[i][0] = this.dotMatrix[i][0];
		}
		for (var i=0;i<this.dotMatrix[0].length;i++){
			newMatrix[0][i] = this.dotMatrix[0][i];
		}
		debug("big median loop");
		for(var y=1;y<this.dotMatrix.length-1;y++){
			newMatrix[y] = [];
			for (x=1;x<this.dotMatrix[y].length-1;x++){
				
				//var surrounding=[];
				var white = 0;
				var black =0;
				
				for (var i = -1; i < 2; i++) {
					for (var j = -1; j < 2; j++) {
								if (this.dotMatrix[(i+y)][(j+x)]<this.selAverage){
									black++
								}
								else{
									white++;
								}
								//surrounding.push(this.dotMatrix[(i+y)][(j+x)]);
						
						
					}
				} 
				debug("white "+white+" , black "+black);
				//surrounding.sort();	
				//var median = surrounding[Math.floor(surrounding.length/2)];
				//if (this.selAverage>median){
				if (black>2){
					newMatrix[y][x]=1; // white
				}
				else{
					newMatrix[y][x]=0; //black
				} 
			}
		}
		debug("new matrix");
		//this.dotMatrix = newMatrix; 
		this.paintFromDotMatrix(newMatrix);
	},
	paintFromDotMatrix: function(matrix){
		debug("paint from Dot Matrix "+matrix.length);
		for (j=0;j<matrix.length;j++){
			if (!(matrix[j])){
				matrix[j]=[];
			}
			for (i=0;i<matrix[j].length;i++){
				if (!(matrix[j][i])){
					matrix[j][i]=0;
				}
				 var index=(i +j*this.Region.w)*4;
			
				
				
				if (matrix[j][i]==1){
			
					//turn black
				 	this.regionData.data[index]=255;	  
				    this.regionData.data[index+1]=0;
				    this.regionData.data[index+2]=0;
				  //  this.regionData.data[index+3]=alpha;
					//add to large array
					if((this.dots["D"+j]==null)){
						this.dots["D"+j]=[];
					}
					this.bdcols["C"+i]++;
					this.bdrows["R"+j]++;
					
					this.dots["D"+j]["D"+i]=0;
					//$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"][D"+i+"]="+this.dots["D"+j]["D"+i]);
					//total++;
				}
					else{ 
						//turn white
			   	 	this.regionData.data[index]=255;	  
				    this.regionData.data[index+1]=255;
				    this.regionData.data[index+2]=255;
				  //  this.regionData.data[index+3]=alpha;
				}	
			
				
			  
				
				
				
				
			}
			this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
		}
	},
	filterDots:function(cancel){
		debug("filterDots");
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
		var iterShapes = [];
		debug("number of shapes before cancel: "+this.shapes.length);
 		//if(cancel) this.noiseCanceler();	
		//this.medianThreshold();
		debug("number of shapes after cancel: "+this.shapes.length);
 		
		for (n in this.shapes){
			iterShapes.push(this.shapes[n]);
		}
		this.shapes = iterShapes;
		//

	
	},
	noiseCanceler:function(){
		debug("noiseCanceler");
		//take shapes and cancel out the ones with coords fewer
		//than this.dotMin
		
			debug("Shapes before denoise: "+this.shapes.length);
		MIN=this.dotMin;
		
		var temp=jQuery.grep(this.shapes,function(el,i){
			
			return ((el)&&(el.coords.length>MIN));
		});
		this.shapes=temp;
		//update shape indexes
		jQuery.each(this.shapes,function(i,el){
			el.index=i;
		});
			debug("after: "+this.shapes.length);
				
	},
	convertShapesToLines:function(attach){
		debug("convertShapesToLines");
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
		debug("sortShapes");
	// DLR: From myBubbleSort function @ http://www.irt.org/articles/js054/index.htm
    for (var i=0; i<(this.shapes.length-1); i++)
        for (var j=i+1; j<this.shapes.length; j++)
		    //debug("sorting "+i+","+j);
            if (this.shapes[j][sortAttribute] < this.shapes[i][sortAttribute]) {
                var dummy = this.shapes[i];
                this.shapes[i] = this.shapes[j];
                this.shapes[j] = dummy;
            }
	},
	
	createLineBreaks:function(){
		//creates linebreaks array from shapes array
		debug("createLineBreaks");
		linebreaks=[];
		lineinfo = [];
		lineinfoSize = 0;
		maxes = [];
		mins = [];
/* Experimental stuff*/
		var OrderByDots = [];
		var OrderByRows = [];
		i=0;
		// Create iterative array
		for (var n in this.bdrows){
			OrderByDots[i]={
				row: n,
				num: this.bdrows[n]
			};
			OrderByRows.push(parseInt(this.bdrows[n]));
			i++;
		}
		
		for (var i = 0; i < (OrderByDots.length - 1); i++) {
			for (var j = i + 1; j < OrderByDots.length; j++) {
				//debug("sorting "+i+","+j);
				if (OrderByDots[j]["num"] < OrderByDots[i]["num"]) {
					var dummy = OrderByDots[i];
					OrderByDots[i] = OrderByDots[j];
					OrderByDots[j] = dummy;
				}
			}
		}
		var lastRow = 0;
		var bucket = [];
		var i=0;
		debug("medIndex: "+Math.floor(OrderByRows.length/2));
		var median = OrderByDots[Math.floor(OrderByRows.length/2)].num;
		debug("median: "+median);
		while ((bucket.length<this.numOfLines) && (i<OrderByDots.length)){
			var r = parseInt(OrderByDots[i]["row"].substring(1));
			var j = 0;
			while((j<bucket.length) && (Math.abs(r-bucket[j])>this.minLineHeight)){
				j++;
			}
			if (j==bucket.length){
				var blackLines = 0;
				var lastFew = r;
				if (r > 6) {
					lastFew = 6;
				}
				
					for (var k = (r - lastFew); k < r; k++) {
						//debug("comparing to median: " + OrderByRows[k]);
						if (OrderByRows[k] > median) {
							blackLines++;
						}
					}
					//debug("blacklines: " + blackLines);
					//debug("Next row has : " + OrderByRows[(r + 1)]);
					if ((blackLines > 2) 
					//&& (OrderByRows[(r + 1)] < median)) {
					){
						//debug("PUSHING "+r);
						bucket.push(r);
					}
				
				
			}
			i++;
		}
		debug("bucket full");
		bucket.sort();
	
		for (var i=0;i < bucket.length; i++){
			
			
			//debug(OrderByDots[i].row+" : "+OrderByDots[i].num);
			//if ((parseInt(OrderByDots[i]["row"].substring(1))-lastRow)>3) {
			
			var left = (this.Region.ox + this.canvas.position().left);
					//alert(left);
					var top = (this.Region.oy + bucket[i] + this.canvas.position().top);
					
					//var height=10;
					//create blob box
					//alert("making box "+top);
					//bottomList = bottomList+"<hr/>";
					bb = new BlobBox({
						width: this.Region.w,
						height: 0,
						left: left,
						top: top,
						imageObj: this.canvasImage,
						loc: $(this.canvas.parent())
					});
		/*}
		else{
			end++;
		}*/
		}
	
	/*
		for (var i = 0; i < (this.mins.length - 1); i++) {
			for (var j = i + 1; j < this.mins.length; j++) {
				//debug("sorting "+i+","+j);
				if (this.mins[j]["surroundHeight"] > this.mins[i]["surroundHeight"]) {
					var dummy = this.mins[i];
					this.mins[i] = this.mins[j];
					this.mins[j] = dummy;
				}
			}
		}
	for (var i=0;i<40;i++){
		var left = (this.Region.ox + this.canvas.position().left);
					//alert(left);
					debug(this.mins[i]["row"]+" : "+this.mins[i]["surroundHeight"]);
					var top = (this.Region.oy + parseInt(this.mins[i]["row"].substring(1)) + this.canvas.position().top);
					
					//var height=10;
					//create blob box
					//alert("making box "+top);
					//bottomList = bottomList+"<hr/>";
					bb = new BlobBox({
						width: this.Region.w,
						height: 0,
						left: left,
						top: top,
						imageObj: this.canvasImage,
						loc: $(this.canvas.parent())
					});
	}		*/
/*  Restore this in a minute
		this.sortShapes("foundOnRow");
		bottomList = "";
		
		/* First go through all the shapes and 
		 * sort them into the horizontal rows on which 
		 * they were first discovered.  While doing this 
		 * determine the average height and average lowest
		 * point of shapes discovered on that line.
		 */
/*
		for (var n=0;n<this.shapes.length;n++){
			//alert("FoR-"+this.shapes[n].foundOnRow);
			var row = parseInt(this.shapes[n].foundOnRow);
			var sheight = parseInt(this.shapes[n].Bottom)-parseInt(this.shapes[n].Top);
			if (lineinfo[row]){
				
			//	lineinfo[row].shapes.push(n);
				lineinfo[row].height = parseInt(lineinfo[row].height)+sheight;
				lineinfo[row].bottom += this.shapes[n].Bottom;
				if (lineinfo[row].absBottom<this.shapes[n].Bottom){
					lineinfo[row].absBottom=this.shapes[n].Bottom;
				}
			}
			else{
			
				lineinfo[row]={
					shapes: [],
					height: sheight,
					avgHeight: 0,
					bottom: 0,
					avgBottom: this.shapes[n].Bottom,
					absBottom: this.shapes[n].Bottom
				};
				
				
			}
			lineinfo[row].shapes.push(n);
		}
		avgHeight = 0;
		/*
		 * Convert to iterative array
		 */
/*		iLineInfo = [];
		for (var n in lineinfo){
			iLineInfo.push(lineinfo[n]);			
		}

			
			
			
		/*
		 * Now find the average height of all the lines in the image
		 */
/*		for (var n=0;n<iLineInfo.length;n++){
			if (iLineInfo[n].shapes.length > 0) {
				iLineInfo[n].avgHeight = iLineInfo[n].height / iLineInfo[n].shapes.length;
				iLineInfo[n].avgBottom = iLineInfo[n].bottom / iLineInfo[n].shapes.length;
				avgHeight = parseInt(avgHeight) + parseInt(iLineInfo[n].avgHeight);
				lineinfoSize++;
			}
		}
		debug(avgHeight+" total");
		avgHeight = avgHeight/(lineinfoSize);
		
		debug("avgHeight: "+avgHeight);
		/*
		 * Sort the lines in order by avgBottom
		 */
	
/*		
		
		    for (var i = 0; i < (iLineInfo.length - 1); i++) {
				for (var j = i + 1; j < iLineInfo.length; j++) {
					if (iLineInfo[j].avgBottom < iLineInfo[i].avgBottom) {
						var dummy = iLineInfo[i];
						iLineInfo[i] = iLineInfo[j];
						iLineInfo[j] = dummy;
					}
				}
			}
			
						
			
			var left = (this.Region.ox + this.canvas.position().left);
					//alert(left);
					var top = (this.Region.oy + iLineInfo[iLineInfo.length-1].absBottom + this.canvas.position().top);
					
				bb = new BlobBox({
						width: this.Region.w,
						height: 0,
						left: left,
						top: top,
						imageObj: this.canvasImage,
						loc: $(this.canvas.parent())
					});
		prevLine = 0;
	alert("BANG");
		/*
		 * Now, for every line in the image that has a height 
		 * greater than or equal to the average height, and which has an 
		 * average lowest point that is a distance from the previous line 
		 * greater than or equal to the average height, draw a red line. 
		 */
/*		for (var n=0;n<iLineInfo.length;n++) {
			if (iLineInfo[n].avgBottom > 0) {
				debug(iLineInfo[n].avgBottom+"  :  "+iLineInfo[n].avgHeight+"  :  "+(Math.abs(iLineInfo[n].avgBottom - prevLine)));
			
			
				if ((iLineInfo[n].avgHeight >= avgHeight) && (Math.abs(iLineInfo[n].avgBottom - prevLine) >= avgHeight)) {
					//alert("Dangerous area ");
					var left = (this.Region.ox + this.canvas.position().left);
					//alert(left);
					var top = (this.Region.oy + iLineInfo[n].absBottom + this.canvas.position().top);
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
*/	

		//document.getElementsByTagName("body")[0].innerHTML=bottomList;
		return;
		},
	addLineBreak:function(e){
		
	},
	colorLineBreaks:function(imageEl){
	debug("colorLineBreaks");
		
		for(y in this.dots){
			var row=parseInt(y.substring(1));
			for(x in this.dots[y]){
				var col=parseInt(x.substring(1));
				var shape=this.dots[y][x];
				color = 4
				if (this.shapes[shape]) {
					var forow = parseInt(this.shapes[shape].foundOnRow);
					
					//if (jQuery.inArray(shape,this.lineBreaks)>0){
					var index = (col + row * this.Region.w) * 4;
					var alpha = this.regionData.data[index + 3];
					//var odd=((forow%2)==0);
					var color = (forow % 3);
				//even, it gets a red value, ODD, gets a GREEN value
				}	
					this.regionData.data[index] = (color == 0) ? 255 : 0;
					this.regionData.data[index + 1] = (color == 1) ? 255 : 0;
					this.regionData.data[index + 2] = (color == 2) ? 255 : 0;
					this.regionData.data[index + 3] = alpha;
				
				//}
			}
		}
		//change colors
		var	nh = (parseInt(imageEl.height,10)*1000)/parseInt(imageEl.width,10);
		//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
	}
	
});