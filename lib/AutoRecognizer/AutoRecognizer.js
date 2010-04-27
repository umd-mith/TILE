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
		// args:
		// Region: Region of image
		
		this.dots=[];
		this.numOfLines=40;
		//$("#numOfLines")[0].value;
		this.minLineHeight=5;
		this.canvasImage=args.obj;
		this.canvas=args.canvas;
		this.Region=$("#"+args.regionID);
		this.regionData=null;
		this.bdrows = []; // Array of total black dots in each row
		this.bdcols = []; // Array of total black dots in each column
		this.maxes = []; // Array of row #s that represent peaks of dots
		this.mins = []; // Array of row #s that represent troughs of dots
		this.dotMatrix = [];
		this.dotMin=(args.dotMin)?args.dotMin:5;
		this.dotMax=(args.dotMax)?args.dotMax:1000;
		this.bkGrnd="(0,0,0)";
		this.imageEl=$("#"+args.imageEl)[0];
		this.context=$("canvas")[0].getContext('2d');
		this.selAverage="CCCCCC";
	},
	thresholdConversion:function(threshold){
		this.dotMatrix=[];  
		if(this.Region){
			this.dots=[]; //resets main dot matrix
			//divide the rbg color value into parts
			
			data=threshold.split(',');
			
			var selred=parseInt(data[0],10);	  
	     	var selgreen=parseInt(data[1],10);
	     	var selblue=parseInt(data[2],10);	
	     	threshold=(selred+selgreen+selblue)/3;
			var rl = this.Region.position().left;
			var rt = this.Region.position().top;
			var rw = this.Region.width();
			var rh = this.Region.height();
			//get canvas imageData
			if(!this.regionData){
				this.regionData=this.context.getImageData(rl, rt, rw, rh); 
			
			} else {
				//create a blank slate - somehow 'createImageData' doesn't work in this case
				//var zoomData=this.canvasImage.getZoomLevel();
				//BUG: TODO: remove and replace with CanvasImage function
				this.context.drawImage(this.imageEl, 0, 0, this.imageEl.width,this.imageEl.height);
				//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
				this.regionData=this.context.getImageData(rl, rt, rw, rh); 
			}
	 	
		 	var total = 0;
			//CREATING this.dots array matrix
			//GOING HORIZONTAL TO VERTICAL
			for (var j=0; j<rh; j++){
				this.bdrows["R"+j]=0;
			  for (var i=0; i<rw; i++){
				this.bdcols["C"+i]=0;
			     var index=(i +j*rw)*4;
				 var red=this.regionData.data[index];	  
			     var green=this.regionData.data[index+1];
			     var blue=this.regionData.data[index+2];	  
			     var alpha=this.regionData.data[index+3];	 
			     var average=(red+green+blue)/3;
				 adiff = Math.abs(average-threshold);
	 			if (!(this.dotMatrix[j])){
					this.dotMatrix[j]=[];
				}
				this.dotMatrix[j][i]= average;
			
				
				if (average>threshold){
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
					total++;
				} 
				
			  }
			 
			  
				
			}
	 		//convert area to black and white using putImageData
			this.context.putImageData(this.regionData,rl,rt);
			
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
				if (black>2){
					newMatrix[y][x]=1; // white
				}
				else{
					newMatrix[y][x]=0; //black
				} 
			}
		}
		
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
	
		
	

		return bucket;
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