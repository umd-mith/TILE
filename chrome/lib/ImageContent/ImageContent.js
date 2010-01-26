

var ImageContent=function(args){
	PanelContent.call(this,args);
	this.pages=[];
	this.urlprefix=args.urlprefix;
	if(!args.url) throw "No URL for Map Graphic was given";
	this.url=args.url;
	this.map=null;
	this.boxlayer=null;
	this.linelayer=null;
	this.zoom=0;
	this.clickHandler=null;
	this.dragHandler=null;
	this.graphic=null;
	this.curPage=null;

	if(!args.panelid) throw "No id passed";
	this.panelid=args.panelid;
	var id="#"+this.panelid;
	this.DOM=$(id+"_content");

}
ImageContent.prototype={
	getPages:function(pages){
		if(this.pages){
			this.unsetContent();
		}
		if (!this.load) {
			this.load = new loadXML({
				file: pages.xml,
				imgprefix: pages.imgpath
			});
		}
		this.load.startNewFile(pages.xml);
		this.pages=this.load.getPages();
		this.curPage=10;
		this.words=this.load.getWords("tei",this.curPage);
		
		$(".mapDiv").trigger("wordsReady",[this.words]);
		
		this.setContent();
	},
	unsetContent:function(){

			this.mapdiv=$("#"+this.panelid+"_mapdiv");
			this.mapdiv.innerHTML = "";
	
		this.pages=null;
	},
	setContent:function(){
	
			this.mapdiv=$("#"+this.panelid+"_mapdiv");
	
			this.mapdiv.empty();
			//set up the image
		
			this.url=this.pages[this.curPage].url;
			this.graphic = $("<img>").attr({src:this.url,width:800}).appendTo(this.mapdiv);
		
			this.DOM.trigger("setTitle",[this.pages[this.curPage].url]);
			//bind mousedown to mapClickEvent
			
		
			if(!this.boxlayer) this.addBoxLayer();
			if(!this.linelayer) this.addLineLayer();
				$("#"+this.mapdiv.id).live("click",function(e){
				$(this).trigger("mapClickEvent");
			});
		
	},
	changePage:function(val){
		switch(val){
			case 0:
				//go back
				if (this.curPage > 0) {
					this.curPage--;
					this.setContent();
				}
				break;
			case 1:
				//go forward
				if(this.curPage<(this.pages.length-1)){
					this.curPage++;
					this.setContent();
				}
				break;
		}
	},

	addBox:function(){


		this.boxlayer.placeBox();
	},
	addBoxLayer:function(){
		//set image z index way lower than the box layer
		//	this.graphic.setZIndex(1);
		var containerdivid="#"+this.panelid+"_mapdiv";
		this.boxlayer=new BoxLayer({containerid:containerdivid});
		//this.map.addLayer(this.boxlayer.layer);
		//this.boxlayer.layer.setZIndex(1000);
	/*	var mapdiv=$("#"+this.graphic.div.id).bind("click",{obj:this},function(e){
				e.data.obj.toggleDrag(e,{mode:true});
			});*/
		//bind event to make sure that maplayer dragging is turned on
		//when the map is clicked
	//	$("body").bind("boxClickEvent",{obj:this},this.toggleMap);
		//vice-versa
	//	$("body").bind("mapClickEvent",{obj:this},this.toggleMap);
	},
	addLineLayer:function(){
		//create line layer and give it the current map extents
		//this.linelayer=new Lines({name:"Lines",map:this.map,mapbounds:this.map.getExtent()});
		//this.map.addLayer(this.linelayer.layer);
		//this.linelayer.layer.setZIndex(1000);
	},
	
	getLinesData:function(){
		if((this.linelayer==null)||(this.graphic==null)){
			throw "Image not set up yet";
			return false;
		}
		
		var data=[];
		data["lines"]= this.linelayer.getAllData();
		data["src"]=this.graphic.getURL();
		var size=this.graphic.getImageSize();
		data["imgw"]=parseInt(size.w);
		data["imgh"]=parseInt(size.h);
		return data;
	},
	imageOCR:function(args){
		
		//get pixel-bounds of box and calculate
		var dims=this.boxlayer.getBounds();
		if(!dims) {
			//$("#"+this.map.div.id).trigger('setProgress',[0,true]);
			return;
		}
		//get possible values from sidebar
		if(args){
			dims.minLineHeight=(args.line)?args.line:20;
			dims.minDotsPerRow=(args.dots)?args.dots:25;
			dims.threshold=(args.thresh)?args.thresh:85000000;
		}
		
		//what is image size?
		var src=this.graphic.getURL();
		dims.src=src;
		dims.orgw=800;
		dims.orgh=800;
		
		/*
var params={
			left:dims.x,
			top:dims.y,
			right:(dims.x+dims.w),
			bottom:(dims.y+dims.h),
			src:src,
			orgwidth:dims.orgw,
			orgheight:dims.orgh
		}
*/
		
		var params="left="+dims.x+"&top="+dims.y+"&right="+(dims.w+dims.x)+"&bottom="+(dims.h+dims.y)+
		"&src="+src+"&orgwidth="+dims.orgw+"&orgheight="+dims.orgh+"&mdpr="+dims.minDotsPerRow
		+"&mlh="+dims.minLineHeight+"&thresh="+dims.threshold;

		var url="PHP_OCR/ocr_script.php";
		setTimeout(function(obj,url,params){
			var lines=$.ajax({url:url,data:params,type:"GET",async:false}).responseText;
			obj.boxlayer.removeBox(); //get rid of bounding box
			$(".olLayerDiv").trigger('setProgress',[50,false]);
			obj.addLines(dims,lines);
		},1,this,url,params);
		/*
this.boxlayer.removeBox();//get rid of the box
		
		$(".olLayerDiv").trigger('setProgress',[50,false]);
		this.addLines(dims,lines);
*/
		
	},
	addLines:function(dims,lines){
		//Add boxes from Math given in PHP_OCR
		this.linelayer.setLines(dims,lines);
		$(".olLayerDiv").trigger('setProgress',[80,false]);
	},
	addLine:function(){
		if(!this.linelayer) return false;
		this.linelayer.addNextLine();
	},
	addRectangles:function(){
		//import from Hughs code
			var rect_style=OpenLayers.Util.extend({},OpenLayers.Feature.Vector.style['default']);
		  rect_style.fillOpacity = "0.2";
		  rect_style.strokeWidth = "2";
			 var rectsLayer = new OpenLayers.Layer.Vector("Lines",{style:rect_style});
		   var rectFeatures = new Array();
		   //Create Rectangle Setup
		   
		  // var leftbottom=this.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(55.50199, 63.42857));
		 //  var righttop=this.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(668.26934, 665.26934));
		   var bounds=new OpenLayers.Bounds();
		   bounds.extend(leftbottom);
		   bounds.extend(righttop);
		   var rect0 = new OpenLayers.Feature.Vector(bounds.toGeometry(), {id:'grpath3626'});
		     rectFeatures[0] = rect0;
		
			rectsLayer.addFeatures(rectFeatures);
			//this.map.addLayer(rectsLayer);
	},
	clearMap:function(){
		this.boxlayer.removeBox();
		this.linelayer.clearLines();
	}
}
extend(ImageContent,PanelContent);
