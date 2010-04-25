/**
 * Basic Image Object
 * 
 * Contains URL for where the image is (or an array of urls)
 * 
 */
var TileImage=Monomyth.Class.extend({
	init:function(args){

		//url is actually an array of image values
		this.url=(typeof args.url=="object")?args.url:[args.url];
		
		if(args.loc){
			this.loc=args.loc;
			//set to specified width and height
			if(args.width) this.DOM.width(args.width);
			if(args.height) this.DOM.height(args.height);
		}
		this.zoomMin=(args.minZoom)?args.minZoom:1;
		this.zoomMax=(args.maxZoom)?args.maxZoom:5;
		this.zoomLevel=this.zoomMin;
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

 var CanvasImage=TileImage.extend({
 	init:function(args){
		this.$super(args);
		this.loc=$(this.loc);
		
		this.srcImage=$("#srcImageForCanvas");
		
		this.loc.append($("<div id=\"canvasHTML\"><canvas id=\"canvas\"></canvas></div>"));
		this.DOM=$("#canvasHTML");
		
		this.canvas=$("#canvas");
		//need real DOM element, not jQuery object
		this.canvasEl=this.canvas[0];
		this.imageEl=this.srcImage[0];
		this.pageNum=0;
		this.url=[];
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
		});
	
		this.canvas.bind("mousemove",{obj:this},function(e){
			/*(var obj=e.data.obj;
			if(!obj.colorSet){
			
				var x = (e.pageX+obj.DOM.scrollLeft())-obj.canvas.position().left;
				var y = (e.pageY+obj.DOM.scrollTop())-obj.canvas.position().top;
				data = obj.context.getImageData(x, y, 1, 1).data;
				hex = "";
				for (var n=0;n<3;n++){
					hex = hex+obj.d2h(data[n]);
				}
				$(this).trigger("hexValues",[hex,false]);
			}*/
		});
		
		//global listeners
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		
	},
	addUrl:function(url){
		this.pageNum=this.url.length;
		jQuery.merge(this.url,url);
	
	},
	setRecognizer:function(args){
		this.recognize=new CanvasAutoRecognizer({obj:this,canvas:this.canvas});
		this.colorSet=false;
		
		this.dotThresh=(args.dotMin)?args.dotMin:15;
		$("body").bind("RegionSet",{obj:this},this.getRegion);
	//	$("body").bind("ColorChange",{obj:this},this.convertToBW);
		//$("body").bind("beginOCR",{obj:this},this.findBlackDots);
		//for testing
		 $("body").bind("layerRectangles",{obj:this},function(e){
		 			var obj=e.data.obj;
		 			obj.recognize.convertShapesToLines();
		 			//obj.recognize.colorLineBreaks(obj.imageEl);
		 		});
	},
	showCurrentImage:function(e){
		var obj=e.data.obj;
		if(obj.url[obj.pageNum]){
			var file=obj.url[obj.pageNum];
			if(/[^.jpg|.tif|.png]/.test(file)){
				obj.setUpCanvas(file);
			} else {
				alert("The file: "+file+" returned an error.");
			}
		}
	},
	goToPage:function(uri){
		//find the correct page data
		for(u=0;u<this.url.length;u++){
			if(this.url[u]){
				if(this.url[u].uri&&(this.url[u].uri==uri)){
					this.pageNum=u;
					break;
				}
			}
		}
		if(this.url[this.pageNum]){
			var file=this.url[this.pageNum].uri;
			if(/[^.jpg|.tif|.png]/.test(file)){
				this.setUpCanvas(file);
			} else {
				alert("The file: "+file+" returned an error.");
			}
		}
	},
	setUpCanvas:function(url){
		
		this.srcImage.attr("src",url);
		
		this.canvas[0].width=this.srcImage[0].width;
		this.canvas[0].height=this.srcImage[0].height;
		
		var testimage=$.ajax({url:url,async:false,dataType:'text'}).responseText;
		if(testimage.length){
			this.figureSizeInfo(1,5);
			
			this.context=this.canvasEl.getContext('2d');
			//set up first zoom level
			this.zoomLevel=1;
			
			//var nw=(this.imageEl.width/(Math.pow(2,this.zoomLevel)));
			//var	nh = (this.imageEl.height/(Math.pow(2,this.zoomLevel)));
			var nh = (800/this.srcImage[0].width)*this.srcImage[0].height;
			var nw = 800;
			
			
			//this.canvas.attr("width",this.imageEl.width);
			this.canvas.attr("width",nw);
			//this.canvas.attr("height",this.imageEl.height);
			this.canvas.attr("height",nh);
			this.imageEl.width=nw;
			this.imageEl.height=nh;
			this.context.drawImage(this.imageEl, 0, 0, nw, nh);	
			this.loc.width(this.canvas.width());
			this.loc.height(this.canvas.height());
		//	this.context.drawImage(this.imageEl, 0, 0, this.srcImage[0].width,this.srcImage[0].height);	
			//this.context.drawImage(this.imageEl, 0, 0, nw,nh);
			// this.srcImage[0].width,this.srcImage[0].height were nw, nh before ^ 
			this.srcImage.trigger("newPageLoaded",[this.pageNum]);
		}
	},
	showImg:function(e,val){
		var obj=e.data.obj;

		if((val>0)&&(obj.pageNum<obj.url.length)){
			obj.pageNum++;
			if(obj.url[obj.pageNum].uri){
				obj.setUpCanvas(obj.url[obj.pageNum].uri);
			} else {
				obj.pageNum--;
			}
		} else if((val<0)&&(obj.pageNum>0)) {
			obj.pageNum--;
			if(obj.url[obj.pageNum].uri){
				obj.setUpCanvas(obj.url[obj.pageNum].uri);
			} else {
				obj.pageNum++;
			}
		}
	},
	figureSizeInfo:function(min,max){
		//determine the zoom levels
		this.zoomLevels=[];
		this.zoomMin=min;
		this.zoomMax=max;
		
		this.zoomIncrement=Math.ceil(this.srcImage[0].height/this.zoomMax);
		for(i=this.zoomMin;i<this.zoomMax;i++){
			this.zoomLevels[i]=parseInt((this.zoomIncrement*i),10);
		}
		this.zoomLevels[this.zoomMax]=this.srcImage[0].height;
		this.zoomLevel=this.zoomMin;
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if((val>0)&&(obj.zoomLevel>0)){
			//zoom in
			obj.zoomLevel++;
			var w=(obj.imageEl.width*(obj.zoomLevels[obj.zoomLevel]))/obj.imageEl.height;
			var h=obj.zoomLevels[obj.zoomLevel];
			obj.canvasEl.width=w;
			obj.canvasEl.height=h;
			obj.context.drawImage(obj.imageEl,0,0,w,h);
		} else if((val<0)&&(obj.zoomLevel<5)){
			//zoom out
			obj.zoomLevel--;
			var w=(obj.imageEl.width*(obj.zoomLevels[obj.zoomLevel]))/obj.imageEl.height;
			var h=obj.zoomLevels[obj.zoomLevel];
			obj.canvasEl.width=w;
			obj.canvasEl.height=h;
			obj.context.drawImage(obj.imageEl,0,0,w,h);
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
		$("body").bind("ColorChange",{obj:obj},obj.convertToBW);
	},
	convertToBW:function(e,bg){
		var obj=e.data.obj;
		obj.DOM.trigger("ImageWorking");
		obj.recognize.thresholdConversion(obj.imageEl,bg);
		obj.DOM.trigger("ImageDoneWorking",[false]);
		$("body").bind("beginOCR",{obj:obj},obj.findBlackDots);
		
	},
	
	findBlackDots:function(e){
		var obj=e.data.obj;
		
		if(obj.recognize.Region&&obj.recognize.regionData){
			obj.DOM.trigger("ImageWorking");			
			//go row by row, column by column and analyze black dot area
			obj.recognize.filterDots(true);
			debug("filter done");
			obj.DOM.trigger("ImageDoneWorking",[true]);
			$("body").unbind("ColorChange");
			$("body").unbind("beginOCR");
		}
	},
	layerRects:function(e){
		var obj=e.data.obj;
		obj.recognize.convertShapesToLines();
		//obj.recognize.colorLineBreaks(obj.imageEl);
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
		this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
		
	},
	disable:function(){
		this.canvas.hide();
		$("body").unbind("zoom",this.zoom);
		$("body").unbind("RegionSet",this.getRegion);
		$("body").unbind("beginOCR");
		$("body").unbind("ColorChange");
		$("body").unbind("imageAdded",this.showCurrentImage);
	},
	enable:function(){
		this.canvas.show();
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("RegionSet",{obj:this},this.getRegion);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		// if((this.url.length>0)&&(this.url[this.pageNum].uri)){
		// 			this.setUpCanvas(this.url[this.pageNum].uri);
		// 		}
	}
	
});