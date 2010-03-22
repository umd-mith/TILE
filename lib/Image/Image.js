/**
 * Basic Image Object
 * 
 * Contains URL for where the image is (or an array of urls)
 * 
 */
var Image=Monomyth.Class.extend({
	init:function(args){
		// if (typeof args.url == "Array") {
		// 			this.urlmanifest = args.url;
		// 			this.curUrl = 0;
		// 			this.url = this.urlmanifest[this.curUrl];
		// 		}
		// 		else {
		// 			this.url = args.url;
		// 		}
		//url is actually an array of image values
		this.url=(typeof args.url=="object")?args.url:[args.url];
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
		// $("body").bind("layerRectangles",{obj:this},function(e){
		// 			var obj=e.data.obj;
		// 			obj.recognize.convertShapesToLines();
		// 			obj.recognize.colorLineBreaks(obj.imageEl);
		// 		});
	},
	showCurrentImage:function(e){
		var obj=e.data.obj;
		if(obj.url[obj.pageNum]){
			var file=obj.url[obj.pageNum].uri;
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
		var testimage=$.ajax({url:url,async:false,dataType:'text'}).responseText;
		if(testimage.length){
			this.figureSizeInfo(1,5);
			this.context=this.canvasEl.getContext('2d');
			//set up first zoom level
			this.zoomLevel=2;
			var nw=(this.imageEl.width/(Math.pow(2,this.zoomLevel)));
			var	nh = (this.imageEl.height/(Math.pow(2,this.zoomLevel)));
			this.canvas.attr("width",this.imageEl.width);
			this.canvas.attr("height",this.imageEl.height);
		
			this.context.drawImage(this.imageEl, 0, 0, nw,nh);	
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
			obj.DOM.trigger("ImageDoneWorking",[true]);
			$("body").unbind("ColorChange");
			$("body").unbind("beginOCR");
		}
	},
	layerRects:function(e){
		var obj=e.data.obj;
		obj.recognize.convertShapesToLines();
		obj.recognize.colorLineBreaks(obj.imageEl);
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
		this.loc.append($("<div id=\"raphael\"></div>"));
		this.DOM=$("#raphael");
		this.srcImage=$("#srcImageForCanvas");
		//array holding shapes, their data, and what tag they relate to
		this.shapeData=[];
		//type of shape to draw (changes through setShapetype call)
		this.shapeType='rect';
		//raphael canvas holder
		this.canvasObj=null;
		this.drawMode=false;
		$("body").bind("turnPage",{obj:this},this.showImg);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		$("body").bind("tagOpen",{obj:this},this.changeShapeData);
		$("body").bind("tagDeleted",{obj:this},this.deleteShapeData);
		$("body").bind("setCoordRegion",{obj:this},this.setDrawMode);
	//	$("body").bind("requestCoordData",{obj:this},this.sendCoordData);
		$("body").bind("changeShapeType",{obj:this},this.changeShapeType);
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("deleteCurrentShape",{obj:this},this.deleteShapeData);
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if(obj.srcImage&&obj.image){
			if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
				obj.zoomLevel++;
				//set new height value, then adjust the width - scale to height
				var scaleh=obj.zoomLevels[obj.zoomLevel];
				var scalew=((obj.srcImage[0].width*scaleh)/obj.srcImage[0].height);
				obj.image.attr({width:scalew,height:scaleh});
				//obj.image.attr({width:obj.size.w,height:obj.size.h});
			} else if((val<0)&&(obj.zoomLevel>obj.zoomMin)){
				obj.zoomLevel--;
				//switch to scaled portion of image - fits in window
				var scaleh=obj.zoomLevels[obj.zoomLevel];
				var scalew=((obj.srcImage[0].width*scaleh)/obj.srcImage[0].height);
				obj.image.attr({width:scalew,height:scaleh});
			//	obj.image.attr({width:obj.size.sw,height:obj.size.sh});
			}
		}
	},
	// @url can be a single string or an array of string values
	addUrl:function(url){
		if(typeof url=="string"){
			this.pageNum=this.url.length;
			this.url.push(url);
			
		//	this.setUpCanvas(this.url[this.pageNum]);
		} else if((typeof url=="object")&&(url!=null)){
			//is an array - process array
			this.pageNum=this.url.length;
			jQuery.merge(this.url,url);
			
		}
	},
	setUpCanvas:function(url){
		//set new height and width for canvas
		if(this.canvasObj) this.canvasObj.remove();
		this.srcImage.attr("src",url);
		var test=$.ajax({async:false,url:url,dataType:'text'}).responseText;
		if(test.length){
			if(this.loc.scrollTop()==0){
				this.loc.scrollTop(0);
				this.loc.scrollLeft(0);
			}
			//configure zoom variables
			this.figureSizeInfo(1,5);
			this.canvasObj=Raphael(this.DOM[0],this.srcImage[0].width,this.srcImage[0].height);
			//figure out first size attribute
		
			var scalew=(this.srcImage[0].width*this.zoomLevels[this.zoomLevel])/this.srcImage[0].height;
			var scaleh=this.zoomLevels[this.zoomLevel];
			//var scaleh=(this.srcImage[0].height*700)/this.srcImage[0].width;
	
			this.size={w:this.srcImage[0].width,h:this.srcImage[0].height,sw:scalew,sh:scaleh,zoomLevel:this.zoomLevel};
	
			//create image object - delete previous if present
			if(this.image) this.image.remove();
	
			this.image=this.canvasObj.image(this.srcImage.attr("src"),0,0,this.size.sw,this.size.sh);
			this.srcImage.trigger("newPageLoaded",[this.pageNum]);
		} else {
			this.setUpCanvas(url);
		}
	},
	activateShapes:function(e){
		var obj=e.data.obj;
		//show default shape
		if(obj.canvasObj){
			obj.DOM.trigger("drawrectangle");
		}
	},
	showCurrentImage:function(e){
		var obj=e.data.obj;
		if(obj.url[obj.pageNum]){
			var file=obj.url[obj.pageNum].uri;
			if(/[^.jpg|.tif|.png]/.test(file)){
				obj.setUpCanvas(file);
			} else {
				alert("The file: "+file+" returned an error.");
			}
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
	getSizeInfo:function(){
		return jQuery.merge([],this.size);
	},
	imageMouseOver:function(e){
		var obj=e.data.obj;
		var t=obj.canvasObj.path("M"+(e.pageX+obj.DOM.scrollLeft())+" "+(e.pageY+obj.DOM.scrollTop()));
	
	},
	changeShapeType:function(e,type){
		var obj=e.data.obj;
		obj.shapeType=type;
	},
	setDrawMode:function(e,id){
		//activated by setCoordRegion event
		var obj=e.data.obj;
		
		obj.drawMode=true;
		$("body").unbind("setCoordRegion",obj.setDrawMode);
		//set up shape data for this tag
		if(obj.currShape==null) obj.currShape=id;
		if(obj.shapeData[obj.currShape]){
			if(obj.shapeData[obj.currShape].shape) obj.shapeData[obj.currShape].shape.destroy();
		} else {
			obj.shapeData[obj.currShape]={shape:null,index:obj.shapeData.length};
		}
		//when user mouse's up in the svg image region, then a shape is drawn
		$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
		//$(document).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
	},
	handleMouseCanvasClick:function(e){
		var obj=e.data.obj;
		$(obj.image.node).unbind("mouseup");
		obj.drawMode=false;
		var x=e.pageX-(obj.DOM.offset().left);
		var y=e.pageY-(obj.DOM.offset().top);
		switch(obj.shapeType){
			case 'rect':
				obj.drawRectangle(x,y);
				break;
			case 'elli':
				obj.drawEllipse(x,y);
				break;
			case 'poly':
				obj.drawPolygon(x,y);
				break;
		}
		
	},
	drawRectangle:function(x,y){	
		if(this.image&&this.canvasObj&&this.shapeData[this.currShape]){
			
			if(this.shapeData[this.currShape].shape) this.shapeData[this.currShape].shape.destroy();
			var l=x;
			var t=y;
			var r=(x+100);
			var b=(y+100);
			this.shapeData[this.currShape].shape=new SVGRectangle({
											left:x,
											top:y,
											right:r,
											bottom:b,
											svg:this.canvasObj,
											svgImage:this.image,
											color:"#FF0000",
											loc:this.DOM,
											zoomLevel:this.zoomLevel,
											htmlID:this.shapeData[this.currShape].index
										});							
	
			//done, send to the tag
			this.DOM.trigger("coordDataSent",[this.shapeData[this.currShape].shape,this.shapeData[this.currShape].shape.getData()]);
			this.DOM.trigger("deactivateShapeBar");
		} 
	},
	drawEllipse:function(x,y){
	
		if(this.image&&this.canvasObj&&(this.shapeData[this.currShape])){
			if(this.shapeData[this.currShape].shape) this.shapeData[this.currShape].shape.destroy();
				
				this.shapeData[this.currShape].shape=new SVGEllipse({
					cx:x,
					cy:y,
					rx:100,
					ry:20,
					loc:this.DOM,
					svgImage:this.image,
					svg:this.canvasObj,
					color:"#FF0000",
					zoomLevel:this.zoomLevel,
					htmlID:this.shapeData[this.currShape].index
				});
				//done, send to the tag
				this.DOM.trigger("coordDataSent",[this.shapeData[this.currShape].shape,this.shapeData[this.currShape].shape.getData()]);
				this.DOM.trigger("deactivateShapeBar");
		} 
	},
	drawPolygon:function(x,y){
		
		if(this.canvasObj&&this.image&&(this.shapeData[this.currShape])){
			if(this.shapeData[this.currShape].shape) this.shapeData[this.currShape].shape.destroy();
		
			this.shapeData[this.currShape].shape=new SVGPolygon({
				svg:this.canvasObj,
				svgImage:this.image,
				loc:this.DOM,
				color:"#FF0000",
				startPoint:[x,y],
				htmlID:this.shapeData[this.currShape].index
			});
			//done, send to the tag
			this.DOM.trigger("coordDataSent",[this.shapeData[this.currShape].shape,this.shapeData[this.currShape].shape.getData()]);
			this.DOM.trigger("deactivateShapeBar");
		}
	},
	editCoordRegion:function(e,id){
		var obj=e.data.obj;
		//activate raphael image's mouse click listeners
		
		obj.currShape=id;
		
		//create or edit shape data
		if(!obj.shapeData[id]) {
			obj.shapeData[id]={
				shape:null
			};
			obj.drawRectangle(e);
		} else {
			if(obj.shapeData[id].shape){
				obj.shapeData[id].shape.releaseAnchor();
			} else {
				obj.drawRectangle(e);
			}
		}
	},
	lockShapeData:function(e){
		//anchor the current shape 
			
	},
	// sendCoordData:function(e){
	// 	var obj=e.data.obj;
	// 	if(obj.shapeData[obj.currShape]&&obj.shapeData[obj.currShape].shape){
	// 		var data=obj.shapeData[obj.currShape].shape.getData();
	// 		obj.shapeData[obj.currShape].shape.setAnchor();
	// 		//send the data and the shape to the requesting object
	// 		obj.DOM.trigger("coordDataSent",[obj.shapeData[obj.currShape].shape,data]);
	// 	}
	// },
	changeShapeData:function(e,id){
		var obj=e.data.obj;
		//close current shape, if active
		if(obj.shapeData[obj.currShape]){
			
			if(obj.shapeData[obj.currShape].shape) obj.shapeData[obj.currShape].shape.deactivate();
		}
		//change the current shape; either edit previously saved or create new
		obj.currShape=id;
		if(!obj.shapeData[obj.currShape]){
			obj.shapeData[obj.currShape]={index:obj.shapeData.length,shape:null};
			$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
		} else {
			if(!obj.shapeData[obj.currShape].shape) $(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
		}
	},
	deleteShapeData:function(e){
		var obj=e.data.obj;
		if((obj.currShape!=null)&&obj.shapeData[obj.currShape]){
			if(obj.shapeData[obj.currShape].shape) obj.DOM.trigger("shapeRemoved",[obj.shapeData[obj.currShape].index]);
			obj.shapeData[obj.currShape].shape=null;
			$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
			obj.drawMode=true;
		}
	},
	disable:function(){
		//hide DOM and disable listeners
		this.DOM.hide();
		if(this.image) this.image.remove();
		this.image=null;
		$("body").unbind("turnPage",this.showImg);
		$("body").unbind("imageAdded",this.showCurrentImage);
		$("body").unbind("setCoordRegion",this.activateShapes);
		$("body").unbind("drawrectangle",this.drawRectangle);
		$("body").unbind("drawellipse",this.drawEllipse);
		$("body").unbind("drawpolygon",this.drawPolygon);
		$("body").unbind("zoom",this.zoom);
	},
	enable:function(){
		this.DOM.show();
		$("body").bind("turnPage",{obj:this},this.showImg);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		$("body").bind("setCoordRegion",{obj:this},this.activateShapes);
		$("body").bind("drawrectangle",{obj:this},this.drawRectangle);
		$("body").bind("drawellipse",{obj:this},this.drawEllipse);
		$("body").bind("drawpolygon",{obj:this},this.drawPolygon);
		$("body").bind("zoom",{obj:this},this.zoom);
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