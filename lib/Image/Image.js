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
		
		if(this.url) this.setUpCanvas();
		this.colorSet=false;
		
		this.dotThresh=(args.dotMin)?args.dotMin:15;
		this.Region=null;
		this.regionData=null;
		this.dots=[];
		this.wordBlobs=[];
		this.shapes=[];
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("RegionSet",{obj:this},this.regionSet);
		$("body").bind("ColorChange",{obj:this},this.convertToBW);
		$("body").bind("beginOCR",{obj:this},this.findBlackDots);
		//for testing
		$("body").bind("layerRectangles",{obj:this},function(e){
			var obj=e.data.obj;
			if(obj.shapes.length>0&&obj.Region){
			obj.createLineBreaks();
			obj.cleanLineBreaks();
			obj.convertShapesToLines();
			obj.colorLineBreaks();
			//obj.layerRectangles(obj.wordBlobs);
			//obj.revealAreas();
		
		}
		});
		
	},
	setUpCanvas:function(){
		var	nh = (this.imageEl.height*1000)/this.imageEl.width;
		this.canvas.attr("width",this.imageEl.width);
		this.canvas.attr("height",this.imageEl.height);
		
		this.context.drawImage(this.imageEl, 0, 0, 1000,nh);	
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
				
				var x = e.pageX+obj.DOM.scrollLeft();
				var y = e.pageY+obj.DOM.scrollTop();
				data = obj.context.getImageData(x, y, 1, 1).data;
				if (obj.statearray[data]==null){
					obj.statearray[data]=true;
					hex = "";
					for (var n=0;n<3;n++){
						hex = hex+obj.d2h(data[n]);
					}
					$(this).trigger("hexValues",[hex,false]);			
				}
			}
		});
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if(val>0){
			//zoom in
			var w=(obj.imageEl.width*(obj.canvasEl.width*2))/(obj.imageEl.height*2);
			var h=(obj.imageEl.height*(obj.canvasEl.height*2))/(obj.imageEl.width*2);
			obj.canvas.attr("width",(obj.imageEl.width*2));
			obj.canvas.attr("height",(obj.imageEl.height*2));
			obj.context.drawImage(obj.imageEl,0,0,w,h);
		} else {
			//zoom out
			var w=(obj.imageEl.width*(obj.canvasEl.width/2))/(obj.imageEl.height/2);
			var h=(obj.imageEl.height*(obj.canvasEl.height/2))/(obj.imageEl.width/2);
			obj.canvas.attr("width",(obj.imageEl.width/2));
			obj.canvas.attr("height",(obj.imageEl.height/2));
			obj.context.drawImage(obj.imageEl,0,0,w,h);
		}
	},
	d2h:function(d){return d.toString(16);},
	h2d:function(h) {return parseInt(h,16);},
	regionSet:function(e,values){
		var obj=e.data.obj;
		obj.Region=values;
		//adjust values to the canvas area
		obj.Region.ox=obj.Region.ox-obj.canvas.offset().left;
		obj.Region.oy=obj.Region.oy-obj.canvas.offset().top;
		// obj.Region.w+=obj.canvas.offset().left;
		// 		obj.Region.h+=obj.canvas.offset().top;
		
		obj.DOM.trigger("regionloaded");
	},
	convertToBW:function(e,bg){
		var obj=e.data.obj;
	
		
		if(obj.Region){
			obj.DOM.trigger("ImageWorking");
			obj.dots=[]; //resets main dot matrix
			
			//disseminate the rbg color value into parts
			var data = bg.split(",");
			var selred=parseInt(data[0],10);	  
	     	var selgreen=parseInt(data[1],10);
	     	var selblue=parseInt(data[2],10);	
	     	var selAverage=(selred+selgreen+selblue)/3;
			//get canvas imageData
			if(!obj.regionData){
				obj.regionData=obj.context.getImageData(obj.Region.ox, obj.Region.oy, obj.Region.w, obj.Region.h); 
			
			} else {
				//create a blank slate - somehow 'createImageData' doesn't work in this case
				var	nh = (parseInt(obj.imageEl.height,10)*1000)/parseInt(obj.imageEl.width,10);
				obj.context.drawImage(obj.imageEl, 0, 0, 1000,nh);
				//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
				obj.regionData=obj.context.getImageData(obj.Region.ox, obj.Region.oy, obj.Region.w, obj.Region.h); 
		
			}
	 	
		 	var total = 0;
			//CREATING this.dots array matrix
			//GOING HORIZONTAL TO VERTICAL
			for (var j=0; j<obj.Region.h; j++){
			  for (var i=0; i<obj.Region.w; i++){
			    // var index=(i*4)*imageData.width+(j*4);
			     var index=(i +j*obj.Region.w)*4;
				 var red=obj.regionData.data[index];	  
			     var green=obj.regionData.data[index+1];
			     var blue=obj.regionData.data[index+2];	  
			     var alpha=obj.regionData.data[index+3];	 
			     var average=(red+green+blue)/3;
				 adiff = Math.abs(average-selAverage);
	 
				if (average>selAverage){
					//turn white
			   	 	obj.regionData.data[index]=255;	  
				    obj.regionData.data[index+1]=255;
				    obj.regionData.data[index+2]=255;
				    obj.regionData.data[index+3]=alpha;
					
				}	
				else{
					//turn black
				 	obj.regionData.data[index]=0;	  
				    obj.regionData.data[index+1]=0;
				    obj.regionData.data[index+2]=0;
				    obj.regionData.data[index+3]=alpha;
					//add to large array
					if(!obj.dots["D"+j]){
						obj.dots["D"+j]=[];
					}
					
					obj.dots["D"+j]["D"+i]=0;
				} 
				
			  }
				total++;
			}
	 		setTimeout(function(obj){
				obj.context.putImageData(obj.regionData,obj.Region.ox,obj.Region.oy);
				obj.DOM.trigger("ImageDoneWorking");
			},1,obj);
			
		  
		}
	},
	
	findBlackDots:function(e){
		var obj=e.data.obj;
		
		if(obj.Region&&obj.regionData){
			obj.DOM.trigger("ImageWorking");
			//are there boxes already on screen?
			if(obj.shapes.length>0){
				$(".blobbox").remove();
			}
			
			obj.shapes=[];
			var total=0;
			var black=255;
			var blackdots=[];
			var shapecount=0;
			//go row by row, column by column and analyze black dot area
			obj.filterDots();
		//	obj.shapes=obj.createCleanShapes();
			//obj.createWordBlobs();
			obj.DOM.trigger("ImageDoneWorking");
		}
	},
	filterDots:function(){
		//go through the Black Dots matrix and find blobs
		var shapecount=0;
		//y=i, x=j
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
						}
						if (this.dots[kb]) {
							if (this.dots[kb][kl]) {
								this.dots[y][x] = this.dots[kb][kl];
								this.shapes[this.dots[y][x]].add({x:x,y:y});
								sides++;
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
	createLineBreaks:function(){
		//creates linebreaks array
		var count=0;
		this.lineBreaks=[];
		var prev = null;
		
		if (this.shapes.length > 3) {
			for (var n = 1; n < this.shapes.length; n++) {
				if ((this.shapes[(n-1)])&&(this.shapes[(n-1)].Right > this.shapes[n].Right)){
					this.lineBreaks[count] = this.shapes[n].index;
					count++;
				}
				prev = n;
			}
		}
		
		//obj.fixWordBlobs(); //sort out shapes, combine ones that are supposed to be together
	},
	cleanLineBreaks:function(){
		var LINETHRESHOLD=20;
		for(c=0;c<this.lineBreaks.length;c++){
		
			if(this.shapes[this.lineBreaks[(c-1)]]){
				var	spe=this.shapes[this.lineBreaks[c]];
				var	ppe=this.shapes[this.lineBreaks[(c-1)]];
				if((spe.Top-ppe.Top)<LINETHRESHOLD){
					a=this.lineBreaks.slice(0,c);
					b=this.lineBreaks.slice((c+1));
					this.lineBreaks=a.concat(b);
				}
			}
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
		
	},
	convertShapesToLines:function(){
		//takes linebreak array and converts values into 
		//actual line divs
	
		
		for(s=0;s<this.shapes.length;s++){
			if(this.shapes[s]){
			var shape=this.shapes[s];
			if(jQuery.inArray(shape.index,this.lineBreaks)>0){
				var div=$("<div id=\"line_"+shape.index+"\"class=\"linebox\"></div>");
				var left=(this.Region.ox+this.canvas.position().left);
				var top=(this.Region.oy+shape.Top+this.canvas.position().top);
				var height=10;
				//create blob box
				bb=new BlobBox({
					width:this.Region.w,
					height:1,
					left:left,
					top:top,
					loc:this.DOM
				});
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
					var rand=10*(shape/10);
					//even, it gets a red value, ODD, gets a BLUE value
				
					this.regionData.data[index]=0;	  
					this.regionData.data[index+1]=255;
					this.regionData.data[index+2]=0;	
					this.regionData.data[index+3]=alpha;
				}
			}
		}
		//change colors
		var	nh = (parseInt(this.imageEl.height,10)*1000)/parseInt(this.imageEl.width,10);
		//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
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
			/**
			leftdiff=0;topdiff=0;
			this.context.moveTo((this.Region.ox+curr.left),(curr.top+this.Region.oy));
			this.context.lineTo((this.Region.ox+this.Region.w),(curr.top+this.Region.oy));
			this.context.lineTo((this.Region.ox+this.Region.w),(curr.top+this.Region.oy+1));
			this.context.lineTo((this.Region.ox+curr.left),(curr.top+this.Region.oy+1));
			this.context.fill();
			this.context.closePath();
			**/
			
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
	}
});
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