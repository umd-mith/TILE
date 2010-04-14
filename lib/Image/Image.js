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
			var nw = 800;
			
			var nh = (800/this.srcImage[0].width)*this.srcImage[0].height;
			//this.canvas.attr("width",this.imageEl.width);
			this.canvas.attr("width",nw);
			//this.canvas.attr("height",this.imageEl.height);
			this.canvas.attr("height",nh);
			this.imageEl.width=nw;
			this.imageEl.height=nh;
			this.context.drawImage(this.imageEl, 0, 0, nw, nh);	
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

/**
RaphaelImage

Using the same features as CanvasImage 
Using RaphaelJS library for creating a Raphael canvas 

**USES SVG
**/

var RaphaelImage=TileImage.extend({
	init:function(args){
		this.$super(args);
		this.loc=$("#"+args.loc);
		this.loc.append($("<div id=\"raphael\"></div>"));
		this.DOM=$("#raphael");
		this.srcImage=$("#srcImageForCanvas");
		//master array
		this.manifest=[];
		this.curUrl=null;
		//array holding shapes, their data, and what tag they relate to
		this.tagData=[];
		this.curTag=null;
		//type of shape to draw (changes through setShapetype call)
		this.shapeType='rect';
		//raphael canvas holder
		this.canvasObj=null;
		this.image=null;
		this.drawMode=false;
		this.currShape=0;
		this.currShapeColor=args.shapeColor?args.shapeColor:"#FF0000";
		this.pageNum=0;
		//for creating random values for shapes
		this.dateRand=new Date();
		
		
		//global listeners
		$("body").bind("RaphaelImageReady",{obj:this},this.finishCanvas);
		$("body").bind("turnPage",{obj:this},this.showImg);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		$("body").bind("tagOpen",{obj:this},this.changeShapeData);
		$("body").bind("toggleTagState",{obj:this},this.changeShapeData);
		$("body").bind("tagDeleted",{obj:this},this.deleteTagData);
		$("body").bind("shapeAdded",{obj:this},this.updateCurrentTag);
		//$("body").bind("setCoordRegion",{obj:this},this.setDrawMode);
	//	$("body").bind("requestCoordData",{obj:this},this.sendCoordData);
		//$("body").bind("changeShapeType",{obj:this},this.changeShapeType);
		
		$("body").bind("clearSession",{obj:this},this.clearSessionData);
		$("body").bind("clearPage",{obj:this},this.clearCurrentPageData);
		$("body").bind("shapeColorSubmit",{obj:this},this.changeShapeColor);
		$("body").bind("prevPageShapes",{obj:this},this.updateManifestShapes);
		// $("body").bind("stopImageListening",{obj:this},function(e){
		// 		var obj=e.data.obj;
		// 		if(obj.drawTool) obj.drawTool.toggle('off');
		// 	});
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		//if shape is not present for current tag, then install VD canvas handlers
		if(!obj.curTag.mainRegion&&obj.drawTool){
			obj.drawTool.toggle('on');
		}
		
		
		//OLD: change width and dimensions of the canvas area (now controlled by VectorDrawer)
		// if(obj.srcImage&&obj.image){
		// 			if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
		// 				obj.zoomLevel++;
		// 				//set new height value, then adjust the width - scale to height using scale value
		// 				var scaleh=obj.srcImage[0].height*(obj.zoomLevel/obj.zoomMax);
		// 				var scalew=obj.srcImage[0].width*(obj.zoomLevel/obj.zoomMax);
		// 				
		// 				obj.manifest[obj.curUrl].zoomLevel=obj.zoomLevel;
		// 				obj.manifest[obj.curUrl].scale=[scalew,scaleh];
		// 				//OLD: change Raphael image attributes, NOW: change width and height of img element
		// 				obj.image.width(obj.manifest[obj.curUrl].scale[0]);
		// 				obj.image.height(obj.manifest[obj.curUrl].scale[1]);
		// 				
		// 			} else if((val<0)&&(obj.zoomLevel>obj.zoomMin)){
		// 				obj.zoomLevel--;
		// 				//OLD: switch to scaled portion of image - fits in window
		// 				//NEW: set new height value, then adjust the width - scale to height using scale value
		// 				var scaleh=obj.srcImage[0].height*(obj.zoomLevel/obj.zoomMax);
		// 				var scalew=obj.srcImage[0].width*(obj.zoomLevel/obj.zoomMax);
		// 			
		// 				obj.manifest[obj.curUrl].zoomLevel=obj.zoomLevel;
		// 				obj.manifest[obj.curUrl].scale=[scalew,scaleh];
		// 				//OLD: change Raphael image attributes, NOW: change width and height of img element
		// 				obj.image.width(obj.manifest[obj.curUrl].scale[0]);
		// 				obj.image.height(obj.manifest[obj.curUrl].scale[1]);
		// 			//	obj.image.attr({width:obj.size.sw,height:obj.size.sh});
		// 			}
		// 		}
	},
	// @url can be a single string or an array of string values
	addUrl:function(url){
		if((typeof url=="object")&&(url!=null)){
			//is an array - process array
			this.pageNum=this.url.length;
			//jQuery.merge(this.url,url);
			for(u in url){
				//if not already present in array, add image to url list
				//and to the master array
				
				if((/http|.gif|.jpg|.png/i.test(url[u].uri))&&(jQuery.inArray(url[u].uri,this.url)<0)){
					
					this.url.push(url[u].uri);
					//Master Array ---
					//tags: array of tags for this uri
					//n: index in this.url list
					this.manifest[url[u].uri]={
						tags:[],
						n:(this.url.length-1),
						zoomLevel:this.zoomLevel,
						scale:false,
						shapes:[]
					};
				}
			}
			
		}
	},
	getUrlList:function(){
		var data=[];
		for(d=0;d<this.url.length;d++){
			data[d]=this.url[d];
		}
		return data;
	},
	setUpCanvas:function(url,max,min){
		//create new image element
		this.srcImage.attr("src",url);
		if(!this.image){
			var imgID=this.dateRand.getTime()+"_"+this.pageNum;
			this.image=$("<img id=\""+imgID+"\" src=\""+url+"\"></img>");
			this.image.appendTo(this.DOM);
		} // else {
		// 			this.image.attr("src",url);
		// 		}
		this.curUrl=url;
		this.DOM.trigger("RaphaelImageReady",[max,min]);
		
		
	},
	finishCanvas:function(e,max,min){
		var obj=e.data.obj;
		if(obj.loc.scrollTop()==0){
			obj.loc.scrollTop(0);
			obj.loc.scrollLeft(0);
		}
		//new: user defines max and min in call to setupcanvas?
		if(max&&min){
			//configure zoom variables
			obj.figureSizeInfo(1,5);
		}
		
		obj.setPageInfo(obj.curUrl);
	},
	setPageInfo:function(url){
		if((this.curUrl==url)&&(this.manifest[url])){
			if(!this.manifest[this.curUrl].scale){
				//figure out first size attribute
				//OLD: use proportional scaling
				//NEW: use more mathematical scaling
				if(this.zoomLevel==0) this.zoomLevel=1;
				var scaleh=this.srcImage[0].height*(this.zoomLevel/this.zoomMax);
				var scalew=this.srcImage[0].width*(this.zoomLevel/this.zoomMax);
				this.manifest[this.curUrl].scale=[scalew,scaleh];
				this.manifest[this.curUrl].zoomLevel=this.zoomLevel;
				this.image.width(this.manifest[this.curUrl].scale[0]);
				this.image.height(this.manifest[this.curUrl].scale[1]);
			} else {
				
				this.zoomLevel=this.manifest[url].zoomLevel;
				this.image.width(this.manifest[this.curUrl].scale[0]);
				this.image.height(this.manifest[this.curUrl].scale[1]);
				//set up drawing canvas
				
				//this.image=this.canvasObj.image(this.srcImage.attr("src"),0,0,this.manifest[this.curUrl].scale[0],this.manifest[this.curUrl].scale[1]);
			}
			this.srcImage.trigger("newPageLoaded",[this.manifest[this.curUrl].tags,this.image,this.canvasObj]);
			if(!this.drawTool){
				//set up drawing canvas
				this.drawTool=new RaphaelDrawTool({
					svgCanvas:$("#"+this.image.attr("id")),
					initScale:(this.zoomLevel/this.zoomMax),
					startsize:[this.srcImage[0].width,this.srcImage[0].height]
				});
			
			} else {
				this.drawTool.switchImage(this.curUrl,this.manifest[this.curUrl].shapes);
			}
		
		}
	},
	//changes the pages
	showImg:function(e,val){
		var obj=e.data.obj;
		if((val>0)){
			obj.pageNum++;
			if(obj.url[obj.pageNum]){
				obj.setUpCanvas(obj.url[obj.pageNum]);
			} else {
				obj.pageNum--;
			}
		} else if((val<0)) {
			obj.pageNum--;
			if(obj.url[obj.pageNum]){
				obj.setUpCanvas(obj.url[obj.pageNum]);
			} else {
				obj.pageNum++;
			}
		}
		
	},
	goToPage:function(n){
		this.pageNum=n;
		if(this.pageNum>-1){
			this.setUpCanvas(this.url[this.pageNum]);
		}
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
	figureSizeInfo:function(min,max){
		//determine the zoom levels
		this.zoomLevels=[];
		this.zoomMin=min;
		this.zoomMax=max;
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
		if(obj.tagData[obj.currShape]){
			if(obj.tagData[obj.currShape].shape) obj.tagData[obj.currShape].shape.destroy();
		} else {
			obj.tagData[obj.currShape]={shape:null,index:obj.tagData.length};
		}
		//when user mouse's up in the svg image region, then a shape is drawn
		$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
		//$(document).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
	},
	changeShapeColor:function(e,hex){
		//hexidecimal value given for color
		var obj=e.data.obj;
		obj.currShapeColor="#"+hex;
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
	/**
	Create or change shape data
	Called from addTag, toggleTagState
	**/
	changeShapeData:function(e,id,tag){
		var obj=e.data.obj;
		//keeps track of tags
		//check if already cataloged
		
		if(!obj.manifest[obj.curUrl]){
			obj.setUpCanvas(obj.curUrl);
		}
		if(obj.manifest[obj.curUrl].tags){
			obj.curTag=tag;
			
			//if a new tag, create a new tag in manifest array for page
			var test=jQuery.grep(obj.manifest[obj.curUrl].tags,function(el,i){
				return (tag.htmlindex==el.tagEl.htmlindex);
			});
			if(test.length==0){
				//new tag, create tag object
				//tagEl: TileTag Obj
				//shape: shape obj
				//n: index int
				var d=new Date();
				obj.manifest[obj.curUrl].tags.push({
					tagEl:tag,
					shape:tag.shape,
					n:(d.getTime()*(obj.manifest[obj.curUrl].tags.length-1))
				});
				//set listener for shape - NOW: turning on/off the DrawerTool
				if(!tag.shape) {
					obj.DOM.trigger("changeShapeType",["rect"]);
					//if(!tag.shape) $(obj.image.node).bind("mouseup",{obj:obj},obj.drawer.handleMouseCanvasClick);
				} else {
					obj.DOM.trigger("changeShapeType",["select"]);
				}
			} else {
				//already entered, make sure there is a shape 
				if(!tag.shape){
					//turn on/off the drawerTool
					//obj.drawTool.toggle('on');
					//$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
				} else {
					//obj.drawTool.toggle('off');
				}
			}
		}
	},
	//Called by clearSession
	clearSessionData:function(e){
		var obj=e.data.obj;
		//if(obj.curUrl&&obj.manifest[obj.curUrl]) obj.manifest[obj.curUrl].tags=[];
		
		$.each(obj.manifest,function(u,i){
			//go through each manifest section and get rid of tags, shapes
			
			for(t in u.tags){
				u.tags[t].destroy();
			}
			u.tags=[];
		});
	},
	//Called by clearPage
	clearCurrentPageData:function(e){
		var obj=e.data.obj;
		if(obj.curUrl&&obj.manifest[obj.curUrl]) {
			for(t in obj.manifest[obj.curUrl].tags){
				obj.manifest[obj.curUrl].tags[t].destroy();
			}
			obj.manifest[obj.curUrl].tags=[];
		}
		
	},
	updateManifestShapes:function(e,shapes,url){
		var obj=e.data.obj;
		if(obj.manifest[url]){
			obj.manifest[url].shapes=shapes;
		}
	},
	updateCurrentTag:function(e,tag,shape){
		var obj=e.data.obj;
		if(tag.htmlindex==obj.curTag.htmlindex){
			obj.drawTool.switchMode(null,'select');
		}
		
	},
	deleteTagData:function(e){
		var obj=e.data.obj;
		if(obj.tagData[obj.currShape]){
			if(obj.tagData[obj.currShape].shape) obj.DOM.trigger("shapeRemoved",[obj.tagData[obj.currShape].index]);
			obj.tagData[obj.currShape]=null;
			obj.currShape=0;
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
	},
	bundleData:function(){
		//get all tags and other data into an associative array
		
		var date=new Date();
		var imgs=[];
		var tags=[];
		var shps=[];
		for(p in this.manifest){
			var record=this.manifest[p];
			var i={"uid":record.n,"uri":p,"tags":[]};
			
			// images+="{uid:"+record.n+",uri:"+p+",";
			for(t=0;t<this.manifest[p].tags;t++){
				
				var tg=this.manifest[p].tags[t];
				i.tags.push(tg.htmlindex);
				// images+=(t>0)?","+tg.htmlindex:tg.htmlindex;
				var tgdata=tg.bundleData(); //creates an array
				tags.push(tgdata[0]);
				if(tgdata[1]) shps.push(tgdata[1]);
			}
			imgs.push(i);
		}
		var json={"uid":date.toUTCString().replace(/[:|,]+/i,""),"Images":imgs,"Tags":tags,"Shapes":shps};
		
				// 
				// var json="{uid:"+date.toUTCString().replace(/[:|,]+/i,"");
				// var images="Images:[";
				// var tags="Tags:[";
				// var shapes="Shapes:[";
				// 
				// images+="]";
				// shapes+="]";
				// tags+="]";
				// json+=","+images+","+tags+","+shapes+"}";
		return JSON.stringify(json);
	}
	
});//END RaphaelImage
// setUpCanvas:function(url){
// 		//set image object to current URL
// 		this.srcImage.attr("src",url);
// 		
// 		this.canvasObj=Raphael(this.DOM.attr('id'),this.srcImage[0].width,this.srcImage[0].height);
// 		
// 		var test=$.ajax({async:false,url:url,dataType:'text'}).responseText;
// 		if(test.length){
// 			this.curUrl=url;
// 			if(this.loc.scrollTop()==0){
// 				this.loc.scrollTop(0);
// 				this.loc.scrollLeft(0);
// 			}
// 			//configure zoom variables
// 			this.figureSizeInfo(1,5);
// 			
// 			if(this.image) {
// 				this.image.remove();
// 			} 
// 			
// 			this.setPageInfo(url);
// 			
// 		} else {
// 			this.setUpCanvas(url);
// 		}
// 	},
// drawRectangle:function(x,y){
// 		if(this.image&&this.canvasObj){
// 			
// 			//if(this.tagData[this.currShape].shape) this.tagData[this.currShape].shape.destroy();
// 			var l=x;
// 			var t=y;
// 			var r=(x+100);
// 			var b=(y+100);
// 			
// 			var shape=new SVGRectangle({
// 				left:x,
// 				top:y,
// 				right:r,
// 				bottom:b,
// 				svg:this.canvasObj,
// 				svgImage:this.image,
// 				color:this.currShapeColor,
// 				loc:this.DOM,
// 				zoomLevel:this.zoomLevel,
// 				htmlID:this.dateRand.getTime()
// 			});							
// 	
// 			//done, send to the tag
// 			this.DOM.trigger("coordDataSent",[shape,shape.getData()]);
// 			this.DOM.trigger("deactivateShapeBar");
// 		} 
// 	},
// 	drawEllipse:function(x,y){
// 	
// 		if(this.image&&this.canvasObj){
// 			//if(this.tagData[this.currShape].shape) this.tagData[this.currShape].shape.destroy();
// 				
// 				var shape=new SVGEllipse({
// 					cx:x,
// 					cy:y,
// 					rx:100,
// 					ry:20,
// 					loc:this.DOM,
// 					svgImage:this.image,
// 					svg:this.canvasObj,
// 					color:this.currShapeColor,
// 					zoomLevel:this.zoomLevel,
// 					htmlID:this.dateRand.getTime()
// 				});
// 				
// 				//done, send to the tag
// 				this.DOM.trigger("coordDataSent",[shape,shape.getData()]);
// 				this.DOM.trigger("deactivateShapeBar");
// 		} 
// 	},
// 	drawPolygon:function(x,y){
// 		
// 		if(this.canvasObj&&this.image){
// 			//if(this.tagData[this.currShape].shape) this.tagData[this.currShape].shape.destroy();
// 		
// 			var shape=new SVGPolygon({
// 				svg:this.canvasObj,
// 				svgImage:this.image,
// 				loc:this.DOM,
// 				color:this.currShapeColor,
// 				startPoint:[x,y],
// 				htmlID:this.dateRand.getTime()
// 			});
// 			//done, send to the tag
// 			this.DOM.trigger("coordDataSent",[shape,shape.getData()]);
// 			this.DOM.trigger("deactivateShapeBar");
// 		}
// 	},