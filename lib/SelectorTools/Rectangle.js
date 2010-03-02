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
		this.zoomLevel=0;
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
		this.svgImageW=args.svgImage.getBBox().width;
		this.svgImageH=args.svgImage.getBBox().height;
		this.loc=args.loc;
		this.svgRect=this.svg.rect(this.left,this.top,(this.right-this.left),(this.bottom-this.top));
		this.svgRect.attr({stroke:this.color});
		
		this.setUpResizeAndDrag();
		$("body").bind("zoom",{obj:this},this.zoom);
	},
	setUpResizeAndDrag:function(){
		this.resize=new SVGResize({container:this.loc,obj:this.svgRect});
		this.drag=new SVGDrag({container:this.loc,obj:this.svgRect});
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		
		if((obj.zoomLevel<=0)&&(val>0)){
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
			
		} else if((obj.zoomLevel>0)&&(val<0)){
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
	activate:function(){
		this.svgRect.show();
		this.resize.activate();
		this.drag.activate();
	},
	deactivate:function(){
		this.resize.deactivate();
		this.drag.deactivate();
		this.svgRect.hide();
	},
	destroy:function(){
		this.resize.deactivate();
		this.drag.deactivate();
		this.svgRect.remove();
	},
	getData:function(){
		var data=this.svgRect.getBBox();
		return {
			ul:data.x,
			ut:data.y,
			br:(data.x+data.width),
			bb:(data.y+data.height)
		};
	}
});