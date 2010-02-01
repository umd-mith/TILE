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
			this.DOM.width(args.width);
			this.DOM.height(args.height);
			args.loc.append(this.DOM);
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
		this.DOM.append(this.srcImage);
		this.srcImage.attr("src",this.url);
		
		
		this.canvas=$("<canvas id=\"canvas\"></canvas>");
		//this.canvas.width(this.srcImage.width());
		//this.canvas.height(this.srcImage.height());
		this.DOM.append(this.canvas);
		//need real DOM element, not jQuery object
		this.canvasEl=document.getElementById("canvas");
		this.imageEl=document.getElementById("srcImg");
		
		//store array of already used states
		this.statearray=[];
		
		this.context=this.canvasEl.getContext('2d');
		
		if(this.url) this.setUpCanvas();
		$("body").bind("RegionSet",{obj:this},this.regionSet);
		$("body").bind("ColorChange",{obj:this},this.colorChange);
		
	},
	setUpCanvas:function(){
		var	nh = (parseInt(this.imageEl.height)*1000)/parseInt(this.imageEl.width);
		this.canvas.attr("width",this.imageEl.width);
		this.canvas.attr("height",this.imageEl.height);
		
		this.context.drawImage(this.imageEl, 0, 0, 1000,nh);	
		//save original state to the stack
		this.context.save();
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
	//	ileft= values.left;
	//	itop= values.top;
	//	posx = bleft-ileft;
	//	posy = btop-itop;
		//context = document.getElementById('canvas').getContext('2d');
		obj.Region=values;
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
	colorChange:function(e,bg){
	//	e.stopPropagation();
		var obj=e.data.obj;
		if(obj.Region){
		data = bg.split(",");
		//data[0] = data[0].substring(data[0].indexOf("(")+1);
		//data[2] = data[2].substring(0,data[2].indexOf(")"));
		var selred=parseInt(data[0]);	  
     	var selgreen=parseInt(data[1]);
     	var selblue=parseInt(data[2]);	
     	var selAverage=(selred+selgreen+selblue)/3;
	
		if(!obj.regionData){
			obj.regionData=obj.context.getImageData(obj.Region.x, obj.Region.y, obj.Region.w, obj.Region.h); 
			pageBlock = {
				iData: imageData,
				imgDataArray: imageData.data,
				left: obj.Region.x,
				top: obj.Region.y
			};
		} else {
			//obj.context.restore();
			obj.canvas.width(obj.canvas.width());
			obj.canvas.height(obj.canvas.height());
			var	nh = (parseInt(obj.imageEl.height)*1000)/parseInt(obj.imageEl.width);
			//FROM HTML5: Creating a blank slate using createImageData
			obj.context.createImageData(obj.canvas.width(),obj.canvas.height());
			obj.context.drawImage(obj.imageEl, 0, 0, 1000,nh);
			
			obj.regionData=obj.context.getImageData(obj.Region.x, obj.Region.y, obj.Region.w, obj.Region.h); 
		
		}
	 	
	 	total = 0;
		
		for (var j=0; j<obj.Region.w; j++)
		{
	
		  for (var i=0; i<obj.Region.h; i++)
		  {
		    // var index=(i*4)*imageData.width+(j*4);
		     var index = (j +i*obj.Region.w)*4;
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
			obj.context.putImageData(obj.regionData,obj.Region.x,obj.Region.y);
		},10,obj);
		
		  
	}
	//	return false;
	}
	
});
