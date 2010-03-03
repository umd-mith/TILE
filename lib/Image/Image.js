/**
 * Basic Image Object
 * 
 * Contains URL for where the image is (or an array of urls)
 * 
 */
var Image=Monomyth.Class.extend({
	init:function(args){
		if (typeof args.url == "Array") {
			this.urlmanifest = args.url;
			this.curUrl = 0;
			this.url = this.urlmanifest[this.curUrl];
		}
		else {
			this.url = args.url;
		}
		if(args.loc){
			this.loc=args.loc;
			//this.DOM=$("<div class=\"ImageContainer\"></div>");
			
			//set to specified width and height
			//args.loc.append(this.DOM);
			if(args.width) this.DOM.width(args.width);
			if(args.height) this.DOM.height(args.height);
		}
		
		this.zoomLevel=0;
	},
	//return a copy of the zoomLevel
	getZoomLevel:function(){var z=this.zoomLevel;return z;},
	activate:function(){
		this.DOM.show();
	},
	deactivate:function(){
		this.DOM.hide();
	}
});

/**
 * Image object that creates a canvas
 * and loads URL of image inside it
 * 
 * Possible functionality:
 * Can load a series of urls (array-based series) 
 */

 var CanvasImage=Image.extend({
 	init:function(args){
		this.$super(args);
		
		this.srcImage=$("<img id=\"srcImg\"></img>");
		this.srcImage.appendTo(this.DOM);
	
		this.canvas=$("<canvas id=\"canvas\"></canvas>");
		//this.canvas.width(this.srcImage.width());
		//this.canvas.height(this.srcImage.height());
		this.DOM.append(this.canvas);
		//need real DOM element, not jQuery object
		this.canvasEl=this.canvas[0];
		this.imageEl=this.srcImage[0];
		
		//store array of already used states
		this.statearray=[];
		
		
		
		//if(this.url) this.setUpCanvas();
		this.colorSet=false;
		
		this.dotThresh=(args.dotMin)?args.dotMin:15;
		this.recognize=new CanvasAutoRecognizer({obj:this,canvas:this.canvas});
		
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("RegionSet",{obj:this},this.getRegion);
		$("body").bind("ColorChange",{obj:this},this.convertToBW);
		$("body").bind("beginOCR",{obj:this},this.findBlackDots);
		//for testing
		$("body").bind("layerRectangles",{obj:this},function(e){
			var obj=e.data.obj;
			obj.recognize.convertShapesToLines();
		});
	},
	setUpCanvas:function(url){
		this.url=url;
		this.srcImage.attr("url",this.url);
		this.context=document.getElementById("canvas").getContext('2d');
		//set up first zoom level
		this.zoomLevel=2;
		var nw=(this.imageEl.width/(Math.pow(2,this.zoomLevel)));
		var	nh = (this.imageEl.height/(Math.pow(2,this.zoomLevel)));
		this.canvas.attr("width",this.imageEl.width);
		this.canvas.attr("height",this.imageEl.height);
		
		this.context.drawImage(this.imageEl, 0, 0, nw,nh);	
		//save original state to the stack
		//this.context.save();
		//set up listeners
		this.canvas.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			obj.colorSet=(obj.colorSet)?false:true;
			if(obj.colorSet){
				var x = e.pageX+obj.DOM.scrollLeft();
				var y = e.pageY+obj.DOM.scrollTop();
				data = obj.context.getImageData(x, y, 1, 1).data;
				
				hex = "";
				for (var n=0;n<3;n++){
					hex = hex+obj.d2h(data[n]);
				}
				$(this).trigger("hexValues",[hex,true]);			
			
			}
	 		//makeBox(true,e);
		});
		
		this.canvas.bind("mousemove",{obj:this},function(e){
			var obj=e.data.obj;
			if(!obj.colorSet){
				
				var x = (e.pageX+obj.DOM.scrollLeft())-obj.canvas.position().left;
				var y = (e.pageY+obj.DOM.scrollTop())-obj.canvas.position().top;
				data = obj.context.getImageData(x, y, 1, 1).data;
				hex = "";
				for (var n=0;n<3;n++){
					hex = hex+obj.d2h(data[n]);
				}
				$(this).trigger("hexValues",[hex,false]);
			}
		});
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if((val>0)&&(obj.zoomLevel>0)){
			//zoom in
			obj.zoomLevel--;
			var w=(obj.imageEl.width/(Math.pow(2,obj.zoomLevel)));
			var h=(obj.imageEl.height/(Math.pow(2,obj.zoomLevel)));
			obj.canvasEl.width=(obj.imageEl.width*(Math.pow(2,obj.zoomLevel)));
			obj.canvasEl.height=(obj.imageEl.height*(Math.pow(2,obj.zoomLevel)));
			obj.context.drawImage(obj.imageEl,0,0,w,h);
			if(obj.recognize.regionData) obj.recognize.thresholdConversion(obj.imageEl);
		} else if(obj.zoomLevel<5){
			//zoom out
			obj.zoomLevel++;
			var w=(obj.imageEl.width/(Math.pow(2,obj.zoomLevel)));
			var h=(obj.imageEl.height/(Math.pow(2,obj.zoomLevel)));
			obj.canvasEl.width=(obj.imageEl.width*(Math.pow(2,obj.zoomLevel)));
			obj.canvasEl.height=(obj.imageEl.height*(Math.pow(2,obj.zoomLevel)));
			obj.context.drawImage(obj.imageEl,0,0,w,h);
			if(obj.recognize.regionData) obj.recognize.thresholdConversion(obj.imageEl);
		}
	},
	getZoomLevel:function(){
		//sends a more complicated object 
		var w=(this.imageEl.width/(Math.pow(2,this.zoomLevel)));
		var h=(this.imageEl.height/(Math.pow(2,this.zoomLevel)));
		var pw=((this.zoomLevel-1)>0)?(this.imageEl.width/(Math.pow(2,(this.zoomLevel-1)))):w;
		var ph=((this.zoomLevel-1)>0)?(this.imageEl.height/(Math.pow(2,(this.zoomLevel-1)))):h;
		return {zoomLevel:this.zoomLevel,psize:[pw,ph],size:[w,h]};
	},
	d2h:function(d){return d.toString(16);},
	h2d:function(h) {return parseInt(h,16);},
	getRegion:function(e,values){
		var obj=e.data.obj;
		obj.recognize.setRegion(values);
	},
	convertToBW:function(e,bg){
		var obj=e.data.obj;
		obj.DOM.trigger("ImageWorking");
		obj.recognize.thresholdConversion(obj.imageEl,bg);
		obj.DOM.trigger("ImageDoneWorking",[false]);
	},
	
	findBlackDots:function(e){
		var obj=e.data.obj;
		
		if(obj.recognize.Region&&obj.recognize.regionData){
			obj.DOM.trigger("ImageWorking");			
			//go row by row, column by column and analyze black dot area
			obj.recognize.filterDots();
			obj.DOM.trigger("ImageDoneWorking",[true]);
		}
	},
	//for testing purposes - draws recognized areas as different colors
	revealAreas:function(){
		for(i in this.dots){
			var col=parseInt(i.substring(1),10);
			for(j in this.dots[i]){
				var row=parseInt(j.substring(1),10);
				var shape=this.dots[i][j];
				
				var index=(col +row*this.Region.w)*4;
				var alpha=this.regionData.data[index+3];
				var rand=10*(shape/10);
				//even, it gets a red value, ODD, gets a BLUE value
				this.regionData.data[index]=((rand%2)==0)?(255):0;	  
				this.regionData.data[index+1]=(0);
				this.regionData.data[index+2]=(!((rand%2)==0))?(255):0;	
				this.regionData.data[index+3]=alpha;
			}
		}
		//change colors
		
		var	nh = (parseInt(this.imageEl.height,10)*1000)/parseInt(this.imageEl.width,10);
		//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
		
	}
	
});

/**
RaphaelImage

Using the same features as CanvasImage 
Using RaphaelJS library for creating a Raphael canvas 

**USES SVG
**/

var RaphaelImage=Image.extend({
	init:function(args){
		this.$super(args);
		this.loc=$("#"+args.loc);
		this.loc.append($.ajax({
			async:false,
			url:'lib/Image/imageSpace.php',
			type:'text'
		}).responseText);
		this.DOM=this.loc;
		
		this.srcImage=$("#srcImageForCanvas");
		
		//raphael canvas holder
		this.canvasObj=null;
		
		$("body").bind("drawrectangle",{obj:this},this.drawRectangle);
		$("body").bind("drawellipse",{obj:this},this.drawEllipse);
		$("body").bind("drawpolygon",{obj:this},this.drawPolygon);
		$("body").bind("zoom",{obj:this},this.zoom);
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if(obj.srcImage&&obj.image){
			if((val>0)&&(obj.zoomLevel<=0)){
				obj.zoomLevel=1;
				//switch to actual pixel size of image - avoiding pixelation, scaling, etc.
				
				obj.image.attr({width:obj.size.w,height:obj.size.h});
			} else if(obj.zoomLevel>0){
				obj.zoomLevel=0;
				//switch to scaled portion of image - fits in window
				
				obj.image.attr({width:obj.size.sw,height:obj.size.sh});
			}
		}
	},
	setUpCanvas:function(url){
		//draw an image from img element
		this.srcImage.attr("src",url);
		if(this.canvasObj) this.canvasObj.remove();
		this.canvasObj=Raphael(this.DOM[0],this.srcImage[0].width,this.srcImage[0].height);
		//figure out first size attribute
		this.zoomLevel=0;
		var scalew=(this.srcImage[0].width*700)/this.srcImage[0].height;
		var scaleh=(this.srcImage[0].height*700)/this.srcImage[0].width;
		
		this.size={w:this.srcImage[0].width,h:this.srcImage[0].height,sw:scalew,sh:scaleh,zoomLevel:this.zoomLevel};
		
		//create image object - delete previous if present
		if(this.image) this.image.remove();
		
		this.image=this.canvasObj.image(this.srcImage.attr("src"),0,0,this.size.sw,this.size.sh);	
	},
	getSizeInfo:function(){
		return jQuery.merge([],this.size);
	},
	imageMouseOver:function(e){
		var obj=e.data.obj;
		var t=obj.canvasObj.path("M"+(e.pageX+obj.DOM.scrollLeft())+" "+(e.pageY+obj.DOM.scrollTop()));
	
	},
	drawRectangle:function(e){
		var obj=e.data.obj;
		
		if(obj.canvasObj){
			if(!obj.rect){
				var l=10;
				var t=10;
				var r=100;
				var b=100;
				obj.rect=new SVGRectangle({
					left:l,
					top:t,
					right:r,
					bottom:b,
					svg:obj.canvasObj,
					svgImage:obj.image,
					color:"#FF0000",
					loc:obj.DOM
				});
				if(obj.ellipse) obj.ellipse.deactivate();
				if(obj.polygon) obj.polygon.deactivate();
			} else {
				obj.rect.activate();
				if(obj.ellipse) obj.ellipse.deactivate();
				if(obj.polygon) obj.polygon.deactivate();
			}
		} 
	},
	drawEllipse:function(e){
		var obj=e.data.obj;
		if(obj.canvasObj){
			if(!obj.ellipse){
				obj.ellipse=new SVGEllipse({
					cx:100,
					cy:45,
					rx:100,
					ry:20,
					loc:obj.DOM,
					svg:obj.canvasObj,
					color:"#FF0000"
				});
				if(obj.rect) obj.rect.deactivate();
				if(obj.polygon) obj.polygon.deactivate();
			}else {
				obj.ellipse.activate();
				if(obj.rect) obj.rect.deactivate();
				if(obj.polygon) obj.polygon.deactivate();
			}
		} 
	},
	drawPolygon:function(e){
		var obj=e.data.obj;
		if(obj.canvasObj){
			if(obj.polygon){
				obj.polygon.destroy(); //starting over with new shape
			}
			obj.polygon=new SVGPolygon({
				svg:obj.canvasObj,
				loc:obj.DOM,
				color:"#FF0000"
			});
			
			if(obj.rect) obj.rect.deactivate();
			if(obj.ellipse) obj.ellipse.deactivate();
		
		}
	}
	
});//END RaphaelImage



/**OLD METHOD - gdickie
filterDots:function(){
	//go through the Dots matrix and find blobs
	var blobcount=0;
	
	for(i in this.dots){
		col=parseInt(i.substring(1),10);
		for(j in this.dots[i]){
			//pixel in black pixel array?
			
			if(this.dots[i][j]>=0){
				var dot=this.dots[i][j]; 
				if(dot==0){
					//not categorized - need to find it a shape 
					//or create a new shape to put it in
				
					row=parseInt(j.substring(1),10);
					//go in order: left, right, above, below
					kl="D"+(col-1);
					kr="D"+(col+1);
					ka="D"+(row-1);
					kb="D"+(row+1);
					sides=0;
					//check to see if surrounding dots are 
					//already given a value
					// ALSO: if a value is present in one or more 
					// surrounding dots, make sure this value is consistent
					// for all surrounding dots
					
					//Since we are going left to right, check the
					//previous LEFT value first, then mark the one down
					if((this.dots[kl])&&(this.dots[kl][j])){
						if(this.dots[kl][j]>0){
							this.dots[i][j]=this.dots[kl][j];
							
							if((this.dots[i][kb])){
								this.dots[i][kb]=this.dots[i][j];
							}
							sides++;
						} 
					}
					
					// if((this.dots[kr])&&(this.dots[kr][j])){
					// 							if(sides!=0){
					// 								this.dots[kr][j]=this.dots[i][j];
					// 							} else if(this.dots[kr][j]>0){
					// 								this.dots[i][j]=this.dots[kr][j];
					// 								//mark the one right below this dot if present
					// 								if(this.dots[kl]){
					// 									if(this.dots[kl][j]>=0){
					// 										this.dots[kl][j]=this.dots[i][j];
					// 									}
					// 								}
					// 								if((this.dots[i][kb])){
					// 									this.dots[i][kb]=this.dots[i][j];
					// 								}
					// 								sides++;
					// 							}
					// 						}
					
				
					if(this.dots[i][ka]>0){
						this.dots[i][j]=this.dots[i][ka];
						//mark the one right below this dot if present
						if(this.dots[kl]){
							if(this.dots[kl][j]){
								this.dots[kl][j]=this.dots[i][j];
							}
						}
						if((this.dots[i][kb])){
							this.dots[i][kb]=this.dots[i][j];
						}
						sides++;
					}
				
					
					if(sides==0){
						//new shape 
						blobcount++;
						this.dots[i][j]=blobcount;
						//mark the dot right below this dot (if present)
						if(this.dots[kl]){
							if(this.dots[kl][j]){
								this.dots[kl][j]=this.dots[i][j];
							}
						}
						if(this.dots[i][ka]){
							this.dots[i][ka]=this.dots[i][j];
						}
						if((this.dots[i][kb])){
							this.dots[i][kb]=this.dots[i][j];
						}
					}
				
				} 
			}
		}
	}

},
**/