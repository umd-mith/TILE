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
			this.DOM=$("<div class=\"ImageContainer\"></div>");
			
			//set to specified width and height
			args.loc.append(this.DOM);
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
		this.srcImage.attr("src",this.url);
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
		
		this.context=document.getElementById("canvas").getContext('2d');
		
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
	/**
	cleanLineBreaks:function(){
		//checks to see what the difference between
		//top values in divs are
		var lines=$(".blobbox");
		var toparray=[];
		for(l=0;l<lines.length;l++){
			var lntop=parseInt($(lines[l]).css("top"),10);
			toparray.push(lntop);
			if(toparray.length>1){
				var ppe=toparray[toparray.length-2];
				if((lntop-ppe)<5){
					if(ppe>lntop){
						toparray.pop();
						$(lines[l]).remove();
					} else {
						$(lines[l-1]).remove();
						a=toparray.slice(0,(toparray.length-2));
						b=toparray.slice((toparray.length-1));
						toparray=a.concat(b);
					}
				}
			}
		}
		
	},
	layerRectangles:function(rects){
		this.DOM.trigger("ImageWorking"); //notify to hide colorbar and set loading bar up
	
		var rightmostpoint=0;
		var line=[]; //stores rightmostpoint values until a new line
		var blobLines=[]; //stores average top and bottom values of each line
		var AVGHEIGHT=0;
		var CONSTSPACE=0;
		var ck=0;
		//alert("wordBlobs length: "+rects.length);
		for(r=0;r<rects.length;r++){
			var rect=rects[r];
			//organizing basic word shapes into lines
			if((rightmostpoint==0)||(rightmostpoint<rect.right[0])){
				rightmostpoint=rect.right[0];
				line.push({
					right:rect.right[0],
					left:rect.left[0],
					top:rect.top[1],
					bottom:rect.bottom[1]
				});
			} else if(rect.right[0]<rightmostpoint){
				//assuming that r[new] is less than r[previous], this is a new line
				//take values from line array and set average lineheight
				var totaltop=0;
				var totalbottom=0;
				for(l=0;l<line.length;l++){
					totaltop+=line[l].top;
					totalbottom+=line[l].bottom;
				}
				//measure average height - repeat until end
				height=(totalbottom/line.length)-(totaltop/line.length);
				AVGHEIGHT=((AVGHEIGHT+height)/2);
				if(blobLines[(blobLines.length-1)]){
					CONSTSPACE+=(totaltop/line.length)-blobLines[(blobLines.length-1)].bottom;
					ck++;
				}
				
				//add current line to major array of lines
				blobLines.push({
					left:line[0].left,
					right:rightmostpoint,
					top:(totaltop/line.length),
					bottom:(totalbottom/line.length),
					height:height
				});
				rightmostpoint=rect.right[0];
				//start a new line area
				line=[];
				line.push({
					right:rect.right[0],
					left:rect.left[0],
					top:rect.top[1],
					bottom:rect.bottom[1]
				});
			}
			
		}
	
		//calculate CONSTSPACE
		CONSTSPACE=(CONSTSPACE/ck);
		//now that we have a blobLines array, go through
		//and create a box for each line
		var top=(blobLines[0].top+this.Region.oy);
		//reset canvas
		this.resetColorRegion();
		for(r=1;r<blobLines.length;r++){
			//average out the distance between two top values
			//and make this a constant distance between two lines
			var curr=blobLines[r];	
			
			this.context.beginPath();
			//	leftdiff=(this.canvas.position().left-curr.left);
			//	topdiff=(this.canvas.position().top-curr.top);
			
			leftdiff=0;topdiff=0;
			this.context.moveTo((this.Region.ox+curr.left),(curr.top+this.Region.oy));
			this.context.lineTo((this.Region.ox+this.Region.w),(curr.top+this.Region.oy));
			this.context.lineTo((this.Region.ox+this.Region.w),(curr.top+this.Region.oy+1));
			this.context.lineTo((this.Region.ox+curr.left),(curr.top+this.Region.oy+1));
			this.context.fill();
			this.context.closePath();
			
			
			box=new BlobBox({
				loc:this.DOM,
				left:(curr.left+this.Region.ox+this.canvas.position().left),
				top:(curr.top+this.Region.oy+this.canvas.position().top),
				width:(curr.right-curr.left)+this.Region.ox,
				height:(curr.bottom-curr.top)+this.Region.oy
			});
			
		}
		this.DOM.trigger("ImageDoneWorking");
	},
	resetColorRegion:function(){
		var	nh = (parseInt(this.imageEl.height,10)*1000)/parseInt(this.imageEl.width,10);
		this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
		this.regionData=this.context.getImageData(this.Region.ox, this.Region.oy, this.Region.w, this.Region.h);
	}**/
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
		//create raphael canvas
		
		this.canvasObj=Raphael(this.DOM[0],this.DOM.width(),this.DOM.height());
		$("body").bind("drawrectangle",{obj:this},this.drawRectangle);
		$("body").bind("drawellipse",{obj:this},this.drawEllipse);
		$("body").bind("drawpolygon",{obj:this},this.drawPolygon);
	},
	setUpCanvas:function(srcImage){
		//draw an image from img element
		this.srcImage=srcImage;
		//figure out first size attribute
		this.zoomLevel=2;
		this.size={w:0,h:0,zoomLevel:this.zoomLevel};
		this.size.w=this.srcImage[0].width/(Math.pow(2,this.zoomLevel));
		this.size.h=this.srcImage[0].height/(Math.pow(2,this.zoomLevel));
		//create image object - delete previous if present
		if(this.image) this.image.remove();
		this.image=this.canvasObj.image(this.srcImage.attr("src"),0,0,this.size.w,this.size.h);	
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
					color:"#FF0000",
					loc:obj.DOM
				});
			}
		}
	},
	drawEllipse:function(e){
		var obj=e.data.obj;
		if(obj.canvasObj){
			if(!obj.ellipse){
				obj.ellipse=new SVGEllipse({
					cx:15,
					cy:15,
					rx:100,
					ry:20,
					loc:obj.DOM,
					svg:obj.canvasObj,
					color:"#FF0000"
				});
			}
		}
	},
	drawPolygon:function(e){
		var obj=e.data.obj;
		if(obj.canvasObj){
			var poly=null;
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