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
		this.bkGrnd="(0,0,0)";
		this.context=this.canvas[0].getContext('2d');
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
		if(this.Region){
			this.dots=[]; //resets main dot matrix
			
			//disseminate the rbg color value into parts
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
	     	var selAverage=(selred+selgreen+selblue)/3;
			//get canvas imageData
			if(!this.regionData){
				this.regionData=this.context.getImageData(this.Region.ox, this.Region.oy, this.Region.w, this.Region.h); 
			
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
					if((this.dots["D"+j]==null)||(this.dots["D"+j]=="undefined")){
						this.dots["D"+j]=[];
					}
					
					this.dots["D"+j]["D"+i]=0;
					//$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"].length="+this.dots["D"+j].length);
					total++;
				} 
				
			  }
				
			}
	 		//convert area to black and white using putImageData
			this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
			
		}
	},
	filterDots:function(){
		//go through the Black Dots matrix and find blobs
		if(this.shapes.length>0){
			$(".blobbox").remove();
			
		}
		this.shapes=[];
		
		var shapecount=0;
		
		for(y in this.dots){
			row=parseInt(y.substring(1),10);
			for(x in this.dots[y]){
				if(this.dots[y][x]>=0){
					var dot=this.dots[y][x]; 
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
							this.shapes[this.dots[y][x]]=new Shape({index:shapecount,initialLeft:this.Region.ox,initialTop:this.Region.h});
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
		}
	},
	convertShapesToLines:function(attach){
		alert(this.shapes.length);
		if((this.shapes.length>0)&&this.Region){
			//create linebreak array
			this.lineBreaks=this.createLineBreaks();
			//take linebreak array and convert values into 
			//actual line divs
			for(s=0;s<this.shapes.length;s++){
				if(this.shapes[s]){
					var shape=this.shapes[s];
					if(jQuery.inArray(shape.index,this.lineBreaks)>0){
				
						var left=(this.Region.ox+this.canvas.position().left);
						var top=(this.Region.oy+shape.Top+this.canvas.position().top);
						var height=10;
						//create blob box
						bb=new BlobBox({
							width:this.Region.w,
							height:1,
							left:left,
							top:top,
							imageObj:this.canvasImage,
							loc:$(this.canvas.parent())
						});
					}
				}
			}
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
		
			/**
			if((val>0)&&(zoom<5)){
				//zoom in
				for(b=0;b<blobs.length;b++){
					var blob=$(blobs[b]);
					var left=(parseInt(blob.css("left"),10)*2)-this.canvas.position().left;
					var top=(parseInt(blob.css("top"),10)*2)-this.canvas.position().top;
					blob.css("left",left+"px");
					blob.css("top",top+"px");
					blob.width(blob.width()*2);
				}
			} else if(zoom>0){
				//zoom out 
			
					for(b=0;b<blobs.length;b++){
						var blob=$(blobs[b]);
						var left=(parseInt(blob.css("left"),10)/2)+this.canvas.offset().left;
						var top=(parseInt(blob.css("top"),10)/2)+this.canvas.offset().top;
						blob.css("left",left+"px");
						blob.css("top",top+"px");
						blob.width(blob.width()/2);
					}
			}**/
		}
	},
	createLineBreaks:function(){
		//creates linebreaks array from shapes array
		var count=0;
		lineBreaks=[];
		var prev = null;
		
		if (this.shapes.length > 3) {
			for (var n = 1; n < this.shapes.length; n++) {
				if ((this.shapes[(n-1)])&&(this.shapes[(n-1)].Right > this.shapes[n].Right)){
					if((lineBreaks.length<1)||(this.shapes[n].Top>this.shapes[lineBreaks[lineBreaks.length-1]].Bottom)){	
						lineBreaks[count] = this.shapes[n].index;
						count++;
					}
				}
				prev = n;
			}
		}
		return lineBreaks;
		//obj.fixWordBlobs(); //sort out shapes, combine ones that are supposed to be together
	},
	cleanLineBreaks:function(){
		var LINETHRESHOLD=20;
		for(c=0;c<this.lineBreaks.length;c++){
			if(this.shapes[this.lineBreaks[(c-1)]]){
				var	spe=this.shapes[this.lineBreaks[c]];
				var tpval=spe.Top;
				for(var x=0;x<this.lineBreaks.length;x++){
					if((tpval-this.shapes[this.lineBreaks[x]].Top)<LINETHRESHOLD){
						a=this.lineBreaks.slice(0,x);
						b=this.lineBreaks.slice((x+1));
						this.lineBreaks=a.concat(b);
						break;
					}
				}
			}
		}
	},
	colorLineBreaks:function(){
		for(y in this.dots){
			var row=parseInt(y.substring(1),10);
			for(x in this.dots[y]){
				var col=parseInt(x.substring(1),10);
				var shape=this.dots[y][x];
				if (jQuery.inArray(shape,this.lineBreaks)>0){
					var index=(col +row*this.Region.w)*4;
					var alpha=this.regionData.data[index+3];
					var odd=((shape%2)==0);
					//even, it gets a red value, ODD, gets a BLUE value
				
					this.regionData.data[index]=(odd)?255:0;	  
					this.regionData.data[index+1]=(odd)?0:255;
					this.regionData.data[index+2]=0;	
					this.regionData.data[index+3]=alpha;
				}
			}
		}
		//change colors
		var	nh = (parseInt(this.imageEl.height,10)*1000)/parseInt(this.imageEl.width,10);
		//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
	}
});