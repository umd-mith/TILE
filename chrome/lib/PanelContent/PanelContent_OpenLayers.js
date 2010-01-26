/**
 * Implementing an OpenLayers map onto the 
 * PanelContent area
 */

var OLPanelContent=function(args){
	PanelContent.call(this,args);
	this.pages=[];
	this.urlprefix=args.urlprefix;
	if(!args.url) throw "No URL for Map Graphic was given";
	this.url=args.url;
	this.mapextent=new OpenLayers.Bounds(-8192.0, -8912.0, 8912.0, 8912.0 );
	this.maxResolution=32.000000;
	this.mapZoomLevels=6;
	this.mapopacity=1;
  	this.mapoptions={
		controls:[],
       	maxExtent: this.mapextent,
       	maxResolution: this.maxResolution,
       	numZoomLevels: this.mapZoomLevels,
		allOverlays:true
	};
	this.map=null;
	this.boxlayer=null;
	this.linelayer=null;
	this.zoom=0;
	this.mapmousedrag=new OpenLayers.Control.Navigation({handleRightClicks:true,zoomWheelEnabled:false});
	this.clickHandler=null;
	this.dragHandler=null;
	this.graphic=null;
	this.curPage=null;
	
	this.triggerDiv=args.triggerDiv;
}
OLPanelContent.prototype={
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
		if(this.map){
			if(this.linelayer) this.map.removeLayer(this.linelayer);
			if(this.boxlayer) this.map.removeLayer(this.boxlayer);
			this.map.destroy();
		}
		this.pages=null;
	},
	setContent:function(){
		if (!this.map) {
			this.mapdiv=$("#"+this.panelid+"_mapdiv");
			this.map = new OpenLayers.Map(this.panelid + "_mapdiv",this.mapoptions);
			//controls
			this.map.addControl(this.mapmousedrag);
			this.dragHandler=new OpenLayers.Handler.Drag(this.mapmousedrag,{"done":function(e){}},{interval:1});
			//turn off double-click zooming
			this.clickHandler=new OpenLayers.Handler.Click(this.mapmousedrag,
			null,
			{stopDouble:true});
			this.map.events.register('moveend',this,function(e){
				var moves=this.map.getCenter();
				var imgsize=this.graphic.getImageSize();
				if(this.boxlayer){
					//this.boxlayer.setBounds(moves,imgsize);
				}
				if(this.linelayer){
					//this.linelayer.setBounds(moves,imgsize);
				}
				//$(".mapDiv").trigger("mapBoundsChanged",[this.map.getExtent()]);
			});
			
			//set up the image
			this.url=this.pages[this.curPage].url;
			this.graphic=new OpenLayers.Layer.Image("Page Image",this.url,new OpenLayers.Bounds(-8192.0, -8912.0, 8912.0, 8912.0),
                            new OpenLayers.Size(800, 800),{numZoomLevels:6});
			
			this.map.addLayer(this.graphic);
			if(!this.boxlayer) this.addBoxLayer();
			if(!this.linelayer) this.addLineLayer();
			this.map.zoomToMaxExtent();
			this.linelayer.setBounds(this.map.getExtent());
			this.boxlayer.setBounds(this.map.getExtent());
			this.zoom=this.map.getZoom();
			this.DOM.trigger("setTitle",[this.pages[this.curPage].url]);
			//bind mousedown to mapClickEvent
			$("#"+this.map.div.id).live("click",function(e){
				$(this).trigger("mapClickEvent");
			});
		} else {
			this.map.removeLayer(this.graphic);
			this.url=this.pages[this.curPage].url;
			this.DOM.trigger("setTitle",[this.url]);
			this.graphic=new OpenLayers.Layer.Image("Page Image",this.url,new OpenLayers.Bounds(-8192.0, -8912.0, 8912.0, 8912.0),
                            new OpenLayers.Size(800, 800),{numZoomLevels:6});
			this.map.addLayer(this.graphic);
			this.map.zoomToMaxExtent();
		}
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

	addBoxLayer:function(){
		//set image z index way lower than the box layer
		this.graphic.setZIndex(1);
		var containerdivid="#"+this.panelid+"_mapdiv_OpenLayers_Container";
		this.boxlayer=new BoxLayer({center:this.map.getCenter(),mapbounds:this.map.getExtent(),containerid:containerdivid});
		this.map.addLayer(this.boxlayer.layer);
		this.boxlayer.layer.setZIndex(1000);
		var mapdiv=$("#"+this.graphic.div.id).bind("click",{obj:this},function(e){
				e.data.obj.toggleDrag(e,{mode:true});
			});
		//$('#'+this.map.div.id).bind(this.boxlayer.boxClickEvent,{obj:this},this.toggleDrag);
		//bind event to make sure that maplayer dragging is turned on
		//when the map is clicked
		$("body").bind("boxClickEvent",{obj:this},this.toggleMap);
		
		//vice-versa
		$("body").bind("mapClickEvent",{obj:this},this.toggleMap);
	},
	addLineLayer:function(){
		//create line layer and give it the current map extents
		this.linelayer=new Lines({name:"Lines",map:this.map,mapbounds:this.map.getExtent()});
		this.map.addLayer(this.linelayer.layer);
		this.linelayer.layer.setZIndex(1000);
	},
	addBox:function(){
		if(!this.graphic) return false;
		var center=this.map.getCenter();
		var centerpx=this.map.getViewPortPxFromLonLat(center);
		var imgsize=this.graphic.getImageSize();
		var imlonlat=this.map.getLonLatFromPixel(new OpenLayers.Pixel(imgsize.w,imgsize.h));
		
		var x=center.lon-(imlonlat.lon/2);
		var y=center.lat-(imlonlat.lat/2);
		var r=(x+(imlonlat.lon));
		var b=(y+(imlonlat.lat));
		var bounds=new OpenLayers.Bounds(x,b,r,y);
		this.boxlayer.placeBox(bounds,this.map.getCenter());
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
			$("#"+this.map.div.id).trigger('setProgress',[0,true]);
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
		   
		   var leftbottom=this.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(55.50199, 63.42857));
		   var righttop=this.map.getLonLatFromViewPortPx(new OpenLayers.Pixel(668.26934, 665.26934));
		   var bounds=new OpenLayers.Bounds();
		   bounds.extend(leftbottom);
		   bounds.extend(righttop);
		   var rect0 = new OpenLayers.Feature.Vector(bounds.toGeometry(), {id:'grpath3626'});
		     rectFeatures[0] = rect0;
		
			rectsLayer.addFeatures(rectFeatures);
			this.map.addLayer(rectsLayer);
	},
	clearMap:function(){
		this.boxlayer.removeBox();
		this.linelayer.clearLines();
	}
}
extend(OLPanelContent,PanelContent);