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
			this.DOM.width(args.width);
			this.DOM.height(args.height);
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
		
		this.context=this.canvasEl.getContext('2d');
		
		if(this.url) this.setUpCanvas();
		
		this.Region=null;
		this.regionData=null;
		this.wordBlobs=[];
		
		$("body").bind("RegionSet",{obj:this},this.regionSet);
		$("body").bind("ColorChange",{obj:this},this.convertToBW);
		$("body").bind("beginOCR",{obj:this},this.findBlackDots);
		
	},
	setUpCanvas:function(){
		var	nh = (parseInt(this.imageEl.height)*1000)/parseInt(this.imageEl.width);
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
				//fc = $("#bgClrs").children();
			//	$("#bgClrs").css({
			//		"background-color": "#"+hex});
			//	$("#bgClrs").html(hex);				
			}
  			
		});
	},
	d2h:function(d){return d.toString(16);},
	h2d:function(h) {return parseInt(h,16);},
	regionSet:function(e,values){
		var obj=e.data.obj;
		obj.Region=values;
		//adjust values to the canvas area
		obj.Region.ox=obj.Region.ox-obj.canvas.offset().left;
		obj.Region.oy=obj.Region.oy-obj.canvas.offset().top;
		obj.Region.w+=obj.canvas.offset().left;
		obj.Region.h+=obj.canvas.offset().top;
		
		obj.DOM.trigger("regionloaded");
	//	ileft= values.left;
	//	itop= values.top;
	//	posx = bleft-ileft;
	//	posy = btop-itop;
		//context = document.getElementById('canvas').getContext('2d');
	
		/*imageData = obj.context.getImageData(values.x, values.y,values.w, values.h);
		var colorSet = [];
		 for (j = 0; j < imageData.height; j++) {
			for (i = 0; i < imageData.width; i++) {
				var index=(i*4)*imageData.width+(j*4);
	 			var red=obj.d2h(parseInt(imageData.data[index]));	  
	   			var green=obj.d2h(parseInt(imageData.data[index+1]));
	  			var blue=obj.d2h(parseInt(imageData.data[index+2]));
			
				hex = red+green+blue;
				colorSet.push(hex);
			}
		}
		
		var cleanColorSet=[];
		//go through and kill duplicate color entries
		jQuery.each(colorSet,function(item,value){
			if(jQuery.inArray(value,cleanColorSet)<0){
				//didn't find a match, put it in array
				cleanColorSet.push(value);
			}
		});
		obj.Region=values;
		cleanColorSet.sort();*/
		//obj.DOM.trigger("colorRangeSorted",[cleanColorSet]);
	},
	convertToBW:function(e,bg){
	//	e.stopPropagation();
		var obj=e.data.obj;
		if(obj.Region){
			obj.DOM.trigger("ImageWorking");
			//disseminate the rbg color value into parts
			var data = bg.split(",");
			//data[0] = data[0].substring(data[0].indexOf("(")+1);
			//data[2] = data[2].substring(0,data[2].indexOf(")"));
			var selred=parseInt(data[0]);	  
	     	var selgreen=parseInt(data[1]);
	     	var selblue=parseInt(data[2]);	
	     	var selAverage=(selred+selgreen+selblue)/3;
			//get canvas imageData
			if(!obj.regionData){
				obj.regionData=obj.context.getImageData(obj.Region.ox, obj.Region.oy, obj.Region.w, obj.Region.h); 
			
			} else {
				//create a blank slate - somehow 'createImageData' doesn't work in this case
				var	nh = (parseInt(obj.imageEl.height)*1000)/parseInt(obj.imageEl.width);
				obj.context.drawImage(obj.imageEl, 0, 0, 1000,nh);
				//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
				obj.regionData=obj.context.getImageData(obj.Region.ox, obj.Region.oy, obj.Region.w, obj.Region.h); 
		
			}
	 	
		 	var total = 0;
		
			for (var j=0; j<obj.Region.w; j++)
			{
	
			  for (var i=0; i<obj.Region.h; i++)
			  {
			    // var index=(i*4)*imageData.width+(j*4);
			     var index=(j +i*obj.Region.w)*4;
				 var red=obj.regionData.data[index];	  
			     var green=obj.regionData.data[index+1];
			     var blue=obj.regionData.data[index+2];	  
			     var alpha=obj.regionData.data[index+3];	 
			     var average=(red+green+blue)/3;
				 adiff = Math.abs(average-selAverage);
	 
				if (average>selAverage){
					//turn black
			   	 	obj.regionData.data[index]=255;	  
				    obj.regionData.data[index+1]=255;
				    obj.regionData.data[index+2]=255;
				    obj.regionData.data[index+3]=alpha;
				}	
				else{
					//turn white
				 	obj.regionData.data[index]=0;	  
				    obj.regionData.data[index+1]=0;
				    obj.regionData.data[index+2]=0;
				    obj.regionData.data[index+3]=alpha;
				} 
			  }
				total++;
			}
	 		setTimeout(function(obj){
				obj.context.putImageData(obj.regionData,obj.Region.ox,obj.Region.oy);
				obj.DOM.trigger("ImageDoneWorking");
			},1,obj);
			
		  
		}
	//	return false;
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
			//traverse coordinate array
			for (var j=0; j<obj.Region.w; j++){
			  for (var i=0; i<obj.Region.h; i++){
			    var index=(j +i*obj.Region.w)*4;
				var red=obj.regionData.data[index];	  
			    var green=obj.regionData.data[index+1];
			    var blue=obj.regionData.data[index+2];	  
			   	 
				if (((red+green+blue)/3)==0){
					//add dot's x,y coords to array if not already in there
					//retrieve the values first
					var dotarray=obj.testDot([j,i]);
					if((dotarray.length>1)&&(dotarray[0][0]!=dotarray[dotarray.length-1][0])&&(dotarray[0][1]!=dotarray[dotarray.length-1][1])){
						//is unique; add to wordblobs
						alert('dotarray:'+dotarray); //for testing
						obj.wordBlobs.push({dots:dotarray,shape:shapecount});
						shapecount++;
						j=(dotarray[dotarray.length-1][0])+1;
						break;//for testing
					}
				} 
		 	}
			total++;
		}
			obj.DOM.trigger("ImageDoneWorking");
			alert(obj.wordBlobs.length);
		//	alert(obj.wordBlobs[0].dotarray);
			
		}
	},
	testDot:function(dot){
		//track this dot until its logical end
		var sides=1;
		var x=parseInt(dot[0]);
		var y=parseInt(dot[1]);
		var nextdotx=x+1;
		var nextdoty=y+1;
		//alert("start: x: "+x+", y: "+y+", nextx: "+nextdotx+", nexty: "+nextdoty);
		var xarray=[];
		var yarray=[];
		xarray.push(x);
		yarray.push(y);
		var trackarray=[];
		trackarray.push([x,y]);
	
		//searches the right and down-ward dots to find the end of a
		//printed word -- may not work for handwriting
		while(sides>0){
			sides=0;
			var dotright=(nextdotx+y*this.Region.w)*4;
			var dotdown=(x+nextdoty*this.Region.w)*4;
			//alert("wiederMal: x: "+x+", y: "+y+", nextx: "+nextdotx+", nexty: "+nextdoty);
			if(this.regionData.data[dotdown]){
				 red=this.regionData.data[dotdown];	  
			   green=this.regionData.data[dotdown+1];
			     blue=this.regionData.data[dotdown+2];
				if(((red+green+blue)==0)&&(jQuery.inArray(nextdoty,yarray)<0)){
					trackarray.push([x,nextdoty]);
				
					yarray.push(nextdoty);
					sides++;
					
				}
			}
			if(this.regionData.data[dotright]){
				 red=this.regionData.data[dotright];	  
			     green=this.regionData.data[dotright+1];
			     blue=this.regionData.data[dotright+2];
			alert('nextdotx: '+nextdotx+" "+jQuery.inArray(nextdotx,xarray));
				if(((red+green+blue)==0)&&(jQuery.inArray(nextdotx,xarray)<0)){
					trackarray.push([nextdotx,y]);
						
					xarray.push(nextdotx);
					alert('right '+nextdotx+'  in array: '+jQuery.inArray(nextdotx,xarray)); //for testing
					sides++;
				
				}
			}
			if(x>0){
				var dotleft=((x-1)+y*this.Region.w)*4;
				if(this.regionData.data[dotleft]){
					 red=this.regionData.data[dotleft];	  
				     green=this.regionData.data[dotleft+1];
				     blue=this.regionData.data[dotleft+2];
					if((((red+green+blue)/3)==0)&&(jQuery.inArray((x-1),xarray)<0)){
						trackarray.push([(x-1),y]);
						xarray.push((x-1));
						sides++;
					}
				}
			}
			
			if(sides==0){
				break;
			} else {
				//find where to go next
				if((jQuery.inArray(xarray,nextdotx)>=0)){
					//to the right
					x=nextdotx;
					nextdotx+=1;
				} else if(jQuery.inArray(yarray,nextdoty)>=0){
					//downward
					y=nextdoty;
					nextdoty+=1;
				} else if(jQuery.inArray(xarray,(x-1))>=0){
					//to the left
					x=(x-1);
					nextdotx=x;
				} else if(jQuery.inArray(yarray,(y-1) )>=0){
					//upward
					nextdoty=y;
					y=(y-1);
				}
			}
		}
		return trackarray;
	}
	
});
