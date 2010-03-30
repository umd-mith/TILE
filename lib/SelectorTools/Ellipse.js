/**
Ellipse

**/

var Ellipse=Monomyth.Class.extend({
	init:function(args){
		this.centrex=(args.cx)?args.cx:0;
		this.centrey=(args.cy)?args.cy:0;
		this.rx=(args.rx)?args.rx:0;
		this.ry=(args.ry)?args.ry:0;
		this.color=args.color;
		this.zoomLevel=(args.zoomLevel)?args.zoomLevel:1;
	}
});

var SVGEllipse=Ellipse.extend({
	init:function(args){
		this.$super(args);
		if(!args.svg) throw "Error: no Raphael svg element passed to SVGEllipse";
		this.svg=args.svg;
		this.loc=args.loc;
		this.index=args.htmlID;
		this.svgImage=args.svgImage;
		this.svgEl=this.svg.ellipse(this.centrex,this.centrey,this.rx,this.ry);
		this.svgEl.attr({stroke:this.color});
		
		this.shapeChangeCall="changeShape"+this.index;
		
		//create Resize and Drag
		this.setResizeAndDrag();
		
		this.figureSizeInfo(1,5);
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("shapeColorSubmit",{obj:this},this.changeStrokeColor);
	},
	figureSizeInfo:function(min,max){
		this.zoomMin=min;
		this.zoomMax=max;
		this.svgImageW=this.svgImage.getBBox().width;
		this.svgImageH=this.svgImage.getBBox().height;
	},
	setResizeAndDrag:function(){
		this.resize=new SVGCircleResize({container:this.loc,obj:this.svgEl});
		this.drag=new SVGCircleDrag({container:this.loc,obj:this.svgEl});
		$(this.svgEl.node).bind("stopDrag",{obj:this},this.shapeChange);
		$(this.svgEl.node).bind("stopResize",{obj:this},this.shapeChange);
	},
	reInsert:function(svgImage,svg){
		//re-loading svg images (new objects - raphael derezzes them on .remove())
		this.svg=svg;
		this.svgImage=svgImage;
		var data=this.svgImage.getBBox();
		this.centrex=(this.centrex*data.width)/this.svgImageW;
		this.centrey=(this.centrey*data.height)/this.svgImageH;
		this.rx=(this.rx*data.width)/this.svgImageW;
		this.ry=(this.ry*data.height)/this.svgImageH;
		this.svgImageW=data.width;
		this.svgImageH=data.height;
		this.svgEl=this.svg.ellipse(this.centrex,this.centrey,this.rx,this.ry);
		this.svgEl.attr({stroke:this.color});
		this.deactivate();
	},
	zoom:function(e,val){
		var obj=e.data.obj;
	
		if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
			//zoom in to full size
			obj.zoomLevel++;
			var data=obj.svgEl.getBBox();
			var box=obj.svgImage.getBBox();
			var x=((data.x*box.width)/obj.svgImageW);
			var y=((data.y*box.height)/obj.svgImageH);
			var w=(data.width*box.width)/obj.svgImageW;
			var h=(data.height*box.height)/obj.svgImageH;
			obj.centrex=(x+(w/2));
			obj.centrey=(y+(h/2));
			obj.rx=(w/2);
			obj.ry=(h/2);
			obj.svgEl.attr({cx:obj.centrex,cy:obj.centrey,rx:obj.rx,ry:obj.ry});
		
			obj.svgImageW=box.width;
			obj.svgImageH=box.height;
			
		} else if((val<0)&&(obj.zoomLevel>0)){
			//zoom out to basic size
			obj.zoomLevel--;
			var data=obj.svgEl.getBBox();
			var box=obj.svgImage.getBBox();
			var x=((data.x*box.width)/obj.svgImageW);
			var y=((data.y*box.height)/obj.svgImageH);
			var w=(data.width*box.width)/obj.svgImageW;
			var h=(data.height*box.height)/obj.svgImageH;
			obj.centrex=(x+(w/2));
			obj.centrey=(y+(h/2));
			obj.rx=(w/2);
			obj.ry=(h/2);
			obj.svgEl.attr({cx:obj.centrex,cy:obj.centrey,rx:obj.rx,ry:obj.ry});
			
			obj.svgImageW=box.width;
			obj.svgImageH=box.height;
		}
	},
	changeStrokeColor:function(e,hex){
		var obj=e.data.obj;
		obj.color="#"+hex;
	},
	activate:function(){
		
		this.svgEl.show();
	//	this.resize.activate();
	//	this.drag.activate();
	},
	deactivate:function(){
		this.svgEl.hide();
		this.resize.deactivate();
		this.drag.deactivate();
	},
	setAnchor:function(){
		this.resize.deactivate();
		this.drag.deactivate();
	},
	releaseAnchor:function(){
		this.resize.activate();
		this.drag.activate();
	},
	expand:function(e){
		var obj=e.data.obj;
		if(obj.mouseDown){
			var data=obj.svgEl.getBBox();
			var x=(e.pageX-obj.loc.offset().left)-data.x;
			var y=(e.pageY-obj.loc.offset().top)-data.y;
			
			obj.rx=x/2;
			obj.ry=y/2;
			obj.svgEl.attr({ry:obj.ry,rx:obj.rx});
			
		}
	},
	destroy:function(){
		this.loc.unbind();
		this.mouseDown=0;
		this.svgEl.remove();
		if(this.options) this.options.remove();
	},
	getData:function(){
		var data=this.svgEl.getBBox();
		return {
			shape:"ellipse",
			ul:data.x,
			ut:data.y,
			rx:data.width/2,
			ry:data.height/2
		};
	},
	shapeChange:function(e){
		var obj=e.data.obj;
		$(obj.svgEl.node).trigger(obj.shapeChangeCall,[obj.getData()]);
	}
});