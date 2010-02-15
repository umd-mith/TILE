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
		this.DOM.append(this.srcImage);
	
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
	
		
		this.dotThresh=(args.dotMin)?args.dotMin:15;
		this.Region=null;
		this.regionData=null;
		this.dots=[];
		this.wordBlobs=[];
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("RegionSet",{obj:this},this.regionSet);
		$("body").bind("ColorChange",{obj:this},this.convertToBW);
		$("body").bind("beginOCR",{obj:this},this.findBlackDots);
		//for testing
		$("body").bind("layerRectangles",{obj:this},function(e){
			var obj=e.data.obj;
			if(obj.wordBlobs.length>0&&obj.Region){
		obj.layerRectangles(obj.wordBlobs);
		obj.revealAreas();
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
		this.canvas.click(function(e){
			$(this).trigger("makeBox");
			//makeBox(true,e);
		});
		
		this.canvas.bind("mousemove",{obj:this},function(e){
			var obj=e.data.obj;
			var x = e.pageX+obj.DOM.scrollLeft();
			var y = e.pageY+obj.DOM.scrollTop();
		//	var context = document.getElementById('canvas').getContext('2d');

			data = obj.context.getImageData(x, y, 1, 1).data;
			if (obj.statearray[data]==null){
				obj.statearray[data]=true;
				hex = "";
				for (var n=0;n<3;n++){
					hex = hex+obj.d2h(data[n]);
				}
				$(this).trigger("hexValues",[hex]);			
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
	//	e.stopPropagation();
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
			//REVERSING PROCEDURE - ORIGINALLY VERTICAL TO HORIZONTAL, NOW
			//IT'S HORIZONTAL TO VERTICAL
			for (var j=0; j<obj.Region.h; j++)
			{
	
			  for (var i=0; i<obj.Region.w; i++)
			  {
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
					if(!obj.dots["D"+i]){
						obj.dots["D"+i]=[];
					}
					
					obj.dots["D"+i]["D"+j]=0;
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
		//go row by row, column by column and analyze black dot area
		if(obj.Region&&obj.regionData){
			obj.DOM.trigger("ImageWorking");
			obj.wordBlobs=[];
			var total=0;
			var black=255;
			var blackdots=[];
			var shapecount=0;
			obj.filterDots();
			obj.createWordBlobs();
			obj.DOM.trigger("ImageDoneWorking");
		}
	},
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
						//previous LEFT value first
						if(this.dots[kl]){
							if(this.dots[kl][j]>0){
								this.dots[kl][j]=this.dots[i][j];
								sides++;
							} 
						}
						if((this.dots[i][ka])){
							if(sides!=0){
								this.dots[i][ka]=this.dots[i][ka];
								sides++;
							}	else if(this.dots[i][ka]>=0){
								 this.dots[i][j]=this.dots[i][ka];
 								sides++;
 							}
						}
						
						if((this.dots[kr])){
							if(sides!=0){
								this.dots[kr][j]=this.dots[i][j];
								
							} else if(this.dots[kr][j]>=0){
								this.dots[i][j]=this.dots[kr][j];
							 	sides++;
							}
						}
						
						if((this.dots[i][kb])){
							if(sides!=0){
								this.dots[i][kb]=this.dots[i][j];
								
							} else if(this.dots[i][kb]>=0){
								this.dots[i][j]=this.dots[i][kb];
								sides++;
							}
						}
						if(sides==0){
							//new shape 
							blobcount++;
							this.dots[i][j]=blobcount;
						}
					
					} 
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
	createWordBlobs:function(){
		//Sort Words into array of shapes
		//each shape has array of coordinates, top, right, left, and bottom attributes
		this.wordBlobs=[];
		var shapearray=[];
		for(i in this.dots){
			var col=parseInt(i.substring(1),10);
			for(j in this.dots[i]){
				var row=parseInt(j.substring(1),10);
				var shape=this.dots[i][j];
				if(jQuery.inArray(shape,shapearray)<0){
					shapearray.push(shape); //not in any order, just checking if shape is cataloged
					tempholder={shape:shape,coords:[]};
					tempholder.coords.push([col,row]); //in x,y format
					tempholder.top=[col,row];
					tempholder.bottom=[col,row];
					tempholder.right=[col,row];
					tempholder.left=[col,row];
					
					this.wordBlobs.push(tempholder);
					
				} else {
					//already cataloged, check wordBlobs
					for(k=0;k<this.wordBlobs.length;k++){
						part=this.wordBlobs[k];
						if(part.shape==shape){
							var val=[col,row];
							part.coords.push(val);
							//assess all sides of the blob and
							//update shape attributes
							if(val[0]>part.right[0]) part.right=val;
							if(val[0]<part.left[0]) part.left=val;
							if(val[1]<part.top[1]) part.top=val;
							if(val[1]>part.bottom[1]) part.bottom=val;
						}
					}
				}
			}
		}
		setTimeout(function(obj){
			obj.sortWordBlobs(); //sort out shapes, combine ones that are supposed to be together
		},1,this);
		//alert(this.wordBlobs[0].right+", "+this.wordBlobs[0].left+", "+this.wordBlobs[0].top+", "+this.wordBlobs[0].bottom);
	},
	sortWordBlobs:function(){
		//goes through wordBlobs and sorts out any incorrectly matched shapes/coords
		//first take out all shapes that don't meet the threshold
		var DOTTHRESH=this.dotThresh;
		var smallshapes=jQuery.grep(this.wordBlobs,function(n,i){
			//n=object, i=index
			return (n.coords.length<DOTTHRESH);
		});
		//get all shapes that do fulfill threshold
		var gds=jQuery.grep(this.wordBlobs,function(n,i){
			return (n.coords.length>=DOTTHRESH);
		});
		this.wordBlobs=gds;
		//go through bad shape array
		for(s=0;s<smallshapes.length;s++){
			var shape=smallshapes[s];
			//this is a dot or collection of dots not 
			//big enough to be a shape. It could be that 
			//its noise, or it could be that it accidentally
			//was cataloged as a different shape when it actually
			// should be part of a previous or next shape
			// 	This will put the currently selected shape with its 
			// rightful owner
			
			for(l=0;l<this.wordBlobs.length;l++){
				var blob=this.wordBlobs[l];
				var rdiff=Math.abs(blob.right[0]-shape.right[0]);
				var ldiff=Math.abs(blob.left[0]-shape.left[0]);
				var tdiff=Math.abs(blob.top[1]-shape.top[1]);
				var bdiff=Math.abs(blob.bottom[1]-shape.bottom[1]);
				//alert(rdiff+", "+ldiff+", "+tdiff+", "+bdiff); //for testing
				//if the two shapes are within each other's threshold range, put them together
				if(((rdiff<DOTTHRESH)&&(ldiff<DOTTHRESH))&&((tdiff<DOTTHRESH)&&(bdiff<DOTTHRESH))){
					//alert('consolidate into one shape');//for testing
					//consolidate into one shape
					for(i=0;i<shape.coords.length;i++){
						var val=shape.coords[i];
						if(val[0]>blob.right[0]) blob.right=val;
						if(val[0]<blob.left[0]) blob.left=val;
						if(val[1]<blob.top[1]) blob.top=val;
						if(val[1]>blob.bottom[1]) blob.bottom=val;
						blob.coords.push(val);
					}//end loop
					break;
				}
			}
			
		}
		
		// for(l=0;l<this.wordBlobs.length;l++){
		// 		var blob=this.wordBlobs[l];
		// 		if(blob.coords.length<this.dotThresh){
		// 			//coords that do not equal up to the amount of dots
		// 			//needed to make up a shape; find closest shape
		// 			// that fits within the dot threshold of this shape 
		// 			// 				and attach this shape to it
		// 		
		// 			var misfitcoords=jQuery.merge([],blob.coords);  //clones current array of coords
		// 			var misfitblobs=[];
		// 			misfitblobs.push(blob);
		// 			//GOING BACKWARDS
		// 			if(this.wordBlobs[(l-1)]){
		// 				var prev=this.wordBlobs[(l-1)];
		// 				while(prev.coords.length<this.dotThresh){
		// 				
		// 					//misfitcoords.push(prev.coords);
		// 					
		// 					if(!this.wordBlobs[(l-1)]) break;
		// 					misfitblobs.push(prev);
		// 					//jQuery.merge(misfitcoords,prev.coords);
		// 					prev=this.wordBlobs[(l-1)];
		// 				}
		// 				//consolidate into one shape
		// 			
		// 			} else if(this.wordBlobs[(l+1)]){
		// 				//GOING FORWARDS
		// 				var next=this.wordBlobs[(l+1)];
		// 				//check if this next blob is under threshold
		// 				while(next.coords.length<this.dotThresh){
		// 				
		// 					//misfitcoords.push(prev.coords);
		// 
		// 					if(!this.wordBlobs[(l+1)]) break;
		// 						misfitblobs.push(next);
		// 					//jQuery.merge(misfitcoords,next.coords);
		// 					next=this.wordBlobs[(l+1)];
		// 				}
		// 				//consolidate into one shape
		// 				for(i=0;i<misfitcoords.length;i++){
		// 					var val=misfitcoords[i];
		// 					if(val[0]>next.right[0]) next.right=val;
		// 					if(val[0]<next.left[0]) next.left=val;
		// 					if(val[1]<next.top[1]) next.top=val;
		// 					if(val[1]>next.bottom[1]) next.bottom=val;
		// 					next.coords.push(val);
		// 				}//end loop
		// 			}
		// 		}
		// 	}
		this.DOM.trigger("ImageDoneWorking");
	},
	layerRectangles:function(rects){
		this.DOM.trigger("ImageWorking"); //notify to hide colorbar and set loading bar up
		//clean out duplicates
		// rects=jQuery.grep(rects,function(v,i){
		// 			return (v.coords.length>this.dotThresh);
		// 		});
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
					CONSTSPACE+=(totaltop/line.length)-blobLines[blobLines.length-1].bottom;
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
		for(r=1;r<blobLines.length;r++){
			//average out the distance between two top values
			//and make this a constant distance between two lines
			var curr=blobLines[r];	
			
			box=new BlobBox({
				loc:this.DOM,
				left:(curr.left+this.Region.ox+this.canvas.position().left),
				top:(curr.top+this.Region.oy+this.canvas.position().top),
				//top:((curr.top+this.Region.oy)),
				width:(curr.right-curr.left),
				height:AVGHEIGHT
			});
			top+=(CONSTSPACE+this.Region.oy);
		}
		this.DOM.trigger("ImageDoneWorking");
	}
	// testDot:function(dot){
	// 	//track this dot until its logical end
	// 	var sides=1;
	// 	var x=parseInt(dot[0]);
	// 	var y=parseInt(dot[1]);
	// 	var nextdotx=x+1;
	// 	var nextdoty=y+1;
	// 	//alert("start: x: "+x+", y: "+y+", nextx: "+nextdotx+", nexty: "+nextdoty);
	// 	var xarray=[];
	// 	var yarray=[];
	// 	xarray.push(x);
	// 	yarray.push(y);
	// 	var trackarray=[];
	// 	trackarray.push([x,y]);
	// 
	// 	//searches the right and down-ward dots to find the end of a
	// 	//printed word -- may not work for handwriting
	// 	while(sides>0){
	// 		sides=0;
	// 		var dotright=(nextdotx+y*this.Region.w)*4;
	// 		var dotdown=(x+nextdoty*this.Region.w)*4;
	// 		//alert("wiederMal: x: "+x+", y: "+y+", nextx: "+nextdotx+", nexty: "+nextdoty);
	// 		if(this.regionData.data[dotdown]){
	// 			 red=this.regionData.data[dotdown];	  
	// 		   green=this.regionData.data[dotdown+1];
	// 		     blue=this.regionData.data[dotdown+2];
	// 			if(((red+green+blue)==0)&&(jQuery.inArray(nextdoty,yarray)<0)){
	// 				trackarray.push([x,nextdoty]);
	// 				yarray.push(nextdoty);
	// 				sides++;
	// 				
	// 			}
	// 		}
	// 		if(this.regionData.data[dotright]){
	// 			 red=this.regionData.data[dotright];	  
	// 		     green=this.regionData.data[dotright+1];
	// 		     blue=this.regionData.data[dotright+2];
	// 		alert('nextdotx: '+nextdotx+" "+jQuery.inArray(nextdotx,xarray));
	// 			if(((red+green+blue)==0)&&(jQuery.inArray(nextdotx,xarray)<0)){
	// 				trackarray.push([nextdotx,y]);
	// 					
	// 				xarray.push(nextdotx);
	// 				alert('right '+nextdotx+'  in array: '+jQuery.inArray(nextdotx,xarray)); //for testing
	// 				sides++;
	// 			
	// 			}
	// 		}
	// 		if(x>0){
	// 			var dotleft=((x-1)+y*this.Region.w)*4;
	// 			if(this.regionData.data[dotleft]){
	// 				 red=this.regionData.data[dotleft];	  
	// 			     green=this.regionData.data[dotleft+1];
	// 			     blue=this.regionData.data[dotleft+2];
	// 				if((((red+green+blue)/3)==0)&&(jQuery.inArray((x-1),xarray)<0)){
	// 					trackarray.push([(x-1),y]);
	// 					xarray.push((x-1));
	// 					sides++;
	// 				}
	// 			}
	// 		}
	// 		
	// 		if(sides==0){
	// 			break;
	// 		} else {
	// 			//find where to go next
	// 			if((jQuery.inArray(xarray,nextdotx)>=0)){
	// 				//to the right
	// 				x=nextdotx;
	// 				nextdotx+=1;
	// 			} else if(jQuery.inArray(yarray,nextdoty)>=0){
	// 				//downward
	// 				y=nextdoty;
	// 				nextdoty+=1;
	// 			} else if(jQuery.inArray(xarray,(x-1))>=0){
	// 				//to the left
	// 				x=(x-1);
	// 				nextdotx=x;
	// 			} else if(jQuery.inArray(yarray,(y-1) )>=0){
	// 				//upward
	// 				nextdoty=y;
	// 				y=(y-1);
	// 			}
	// 		}
	// 	}
	// 	return trackarray;
	// }
	
});
