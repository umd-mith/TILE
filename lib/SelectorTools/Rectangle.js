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
		this.loc=args.loc;
		this.svgRect=this.svg.rect(this.left,this.top,(this.right-this.left),(this.bottom-this.top));
		this.svgRect.attr({stroke:this.color,fill:this.color,opacity:0.4});
	
		$("body").bind("move",{obj:this},function(e,dir,n){
			var obj=e.data.obj;
			var x=(dir=="left")?n:0;
			var y=(dir=="top")?n:0;
			obj.svgRect.attr("x",(obj.svgRect.attr("x")+x));
			obj.svgRect.attr("y",(obj.svgRect.attr("y")+y));
		});
		
		this.rectPlaceHolder=$("<div class=\"shapeplaceholder\"></div>");
		this.rectPlaceHolder.attr("id",function(e){
			return "shpholder_"+$(".shapeplaceholder").length;
		});
		
		this.rectPlaceHolder.css("border","2px solid "+this.color);
		this.loc.append(this.rectPlaceHolder);
		this.rectSetSVG=$("<span class=\"shapeplaceholder_set\">SET</span>");
		this.rectSetSVG.bind("click",{obj:this},this.stopShape);
		this.rectSetSVG.appendTo(this.rectPlaceHolder);
		this.rectPlaceHolder.draggable();
		this.rectPlaceHolder.resizable({
			handles:'all'
		});
		
		$(this.svgRect.node).bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(obj.svgRect.node).bind("mousemove",{obj:obj,shape:obj.svgRect},obj.moveShape);
		});
	},
	activate:function(){
		this.svgRect.show();
	},
	deactivate:function(){
		this.svgRect.hide();
	},
	moveShape:function(e){
		var obj=e.data.obj;
		var shape=e.data.shape;
		var data=shape.getBBox();
		var svgx=obj.loc.offset().left+$(obj.svgRect.node)[0].x;
		var svgy=obj.loc.offset().top+$(obj.svgRect.node)[0].y;
		obj.rectPlaceHolder.width(data.width);
		obj.rectPlaceHolder.height(data.height);
		obj.svgRect.hide();
		obj.rectPlaceHolder.css("left",svgx+"px");
		obj.rectPlaceHolder.css("top",svgy+"px");
		obj.rectPlaceHolder.show();
	},
	stopShape:function(e){
		var obj=e.data.obj;
		var x=obj.rectPlaceHolder.position().left-obj.loc.position().left;
		var y=obj.rectPlaceHolder.position().top-obj.loc.position().top;
		
		var w=obj.rectPlaceHolder.width();
		var h=obj.rectPlaceHolder.height();
		obj.svgRect.attr({x:x,y:y,width:w,height:h});
	/*	obj.svgRect.attr("x",""+x);
		obj.svgRect.attr("y",""+y);
		obj.svgRect.attr("width",w);
		obj.svgRect.attr("height",h);*/
		obj.svgRect.show();
		
		$(obj.svgRect.node).unbind("mousemove",obj.moveShape);
		obj.rectPlaceHolder.hide();
	}
});