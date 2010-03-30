/**
Rectangle

Shape for creating a basic, rectangle like shape for selecting 
areas on an image to be tagged/cataloged

**/

var Rectangle=Monomyth.Class.extend({
	init:function(args){
		this.left=(args.left)?args.left:0;
		this.top=(args.top)?args.top:0;
		this.right=(args.right)?args.right:0;
		this.bottom=(args.bottom)?args.bottom:0;
		this.color=args.color;
		this.zoomLevel=(args.zoomLevel)?args.zoomLevel:0;
		this.zoomLevels=[];
	}
	
});

/**
SVGRectangle

Inherits from: Rectangle

Takes a canvas object and creates a canvas-based rectangle (out of SVG elements)
Has a HTML div helper that is used to reposition the SVG rectangle - SVG is re-drawn when user
is done with div

Args:
left,
top,
right,
bottom,
color (Hex/RGB),
loc (jQuery Obj),
svg (SVG canvas - Raphael)
**/

var SVGRectangle=Rectangle.extend({
	init:function(args){
		this.$super(args);
		if(!args.svg) throw "No SVG canvas passed to SVGRectangle";
		this.svg=args.svg;
		this.svgImage=args.svgImage;
		
		this.loc=args.loc;
		this.index=args.htmlID;
	
		this.svgRect=this.svg.rect(this.left,this.top,(this.right-this.left),(this.bottom-this.top));
		this.svgRect.attr({stroke:this.color});
		this.shapeChangeCall="shapeChange"+this.index;
		this.figureSizeInfo(1,5);
		this.setUpResizeAndDrag();
		this.anchor=false;
		
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("shapeColorSubmit",{obj:this},this.changeStrokeColor);
	},
	setUpResizeAndDrag:function(){
		if(this.svgRect){
			this.resize=new SVGResize({container:this.loc,obj:this.svgRect});
			this.drag=new SVGDrag({container:this.loc,obj:this.svgRect});
			$(this.svgRect.node).bind("stopDrag",{obj:this},this.updateSize);
			$(this.svgRect.node).bind("stopResize",{obj:this},this.updateSize);
		}
	},
	reInsert:function(svgImage,svg){
		//re-loading svg images (new objects - raphael derezzes them on .remove())
		this.svg=svg;
		this.svgImage=svgImage;
		//configure proportions
		var data=this.svgImage.getBBox();
		
		this.left=(this.left*data.width)/this.svgImageW;
		this.right=(this.right*data.width)/this.svgImageW;
		this.bottom=(this.bottom*data.height)/this.svgImageH;
		this.top=(this.top*data.height)/this.svgImageH;
		this.svgImageW=data.width;
		this.svgImageH=data.height;
		this.svgRect=this.svg.rect(this.left,this.top,(this.right-this.left),(this.bottom-this.top));
		this.svgRect.attr({stroke:this.color});
		this.deactivate();
	},
	figureSizeInfo:function(min,max){
		this.zoomMin=min;
		this.zoomMax=max;
		this.svgImageW=this.svgImage.getBBox().width;
		this.svgImageH=this.svgImage.getBBox().height;
		
		//this.zoomIncrement=parseInt(Math.ceil(),10);
	},
	zoom:function(e,val){
		var obj=e.data.obj;
	
		if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
			//zoom in to full size
			var data=obj.svgRect.getBBox();
			var box=obj.svgImage.getBBox();
			var x=(data.x*box.width)/obj.svgImageW;
			var y=(data.y*box.height)/obj.svgImageH;
			var w=(data.width*box.width)/obj.svgImageW;
			var h=(data.height*box.height)/obj.svgImageH;
			
			obj.svgRect.attr({x:x,y:y,width:w,height:h});
			
			obj.svgImageW=box.width;
			obj.svgImageH=box.height;
			
		} else if((val<0)&&(obj.zoomLevel>0)){
			//zoom out to basic size
			var data=obj.svgRect.getBBox();
			var box=obj.svgImage.getBBox();
			var x=(data.x*box.width)/obj.svgImageW;
			var y=(data.y*box.height)/obj.svgImageH;
			var w=(data.width*box.width)/obj.svgImageW;
			var h=(data.height*box.height)/obj.svgImageH;
			
			obj.svgRect.attr({x:x,y:y,width:w,height:h});
			
			obj.svgImageW=box.width;
			obj.svgImageH=box.height;
		}
	},
	changeStrokeColor:function(e,hex){
		var obj=e.data.obj;
		obj.color="#"+hex;
		obj.svgRect.attr({stroke:obj.color});
	},
	setAnchor:function(){
		this.resize.deactivate();
		this.drag.deactivate();
		$("body").unbind("shapeColorSubmit",this.changeStrokeColor);
		this.anchor=true;
	},
	releaseAnchor:function(){
		this.resize.activate();
		this.drag.activate();
		$("body").bind("shapeColorSubmit",{obj:this},this.changeStrokeColor);
		this.anchor=false;
	},
	activate:function(){
		this.svgRect.show();
		if(!this.anchor){
			this.resize.activate();
			this.drag.activate();
			$("body").bind("shapeColorSubmit",{obj:this},this.changeStrokeColor);
		}
	},
	deactivate:function(){
		this.resize.deactivate();
		this.drag.deactivate();
		$("body").unbind("shapeColorSubmit",this.changeStrokeColor);
		this.svgRect.hide();
	},
	destroy:function(){
		this.resize.deactivate();
		this.drag.deactivate();
		$("body").unbind("shapeColorSubmit",this.changeStrokeColor);
		this.svgRect.remove();
	},
	getData:function(){
		var data=this.svgRect.getBBox();
		return {
			shape:'rect',
			ul:data.x,
			ut:data.y,
			br:(data.x+data.width),
			bb:(data.y+data.height)
		};
	},
	updateSize:function(e){
		var obj=e.data.obj;
		$(obj.svgRect.node).trigger(obj.shapeChangeCall,[obj.getData()]);
	}
});