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
		this.setResize();
		$("body").bind("move",{obj:this},function(e,dir,n){
			var obj=e.data.obj;
			var x=(dir=="left")?n:0;
			var y=(dir=="top")?n:0;
			obj.svgRect.attr("x",(obj.svgRect.attr("x")+x));
			obj.svgRect.attr("y",(obj.svgRect.attr("y")+y));
		});
		this.mouseState=0;
		this.setUpResizeAndDrag();
	},
	setUpResizeAndDrag:function(){
		this.resize=new SVGResize({container:this.loc,obj:this.svgRect});
	},
	setResize:function(){
		//set up svg marker for resizing
		/**var data=this.svgRect.getBBox();
		var x=data.x+(data.width-3)+this.loc.offset().left;
		var y=data.y+(data.height)+this.loc.offset().top;
		this.resizeMarker=this.svg.path("M"+x+" "+y+" l 3 0 l 0 -3 z");
		this.resizeMarker.attr({fill:"#FFFFFF"});**/
		this.rButton=$("<span class=\"shapeResize\">Resize</span>");
		this.rButton.attr("id",function(e){
			return "re"+$(".shapeResize").length;
		});
		this.rButton.appendTo(this.loc);
		this.rButton.css("left",this.svgRect.getBBox().x+'px');
		this.rButton.css("top",this.svgRect.getBBox().y+'px');
		this.resize=false;
		$(this.svgRect.node).bind("mouseover",{obj:this},this.showResizeButton);
		$(this.svgRect.node).bind("mousemove",{obj:this},this.showResizeButton);
		this.rButton.bind("click",{obj:this},this.triggerResize);
		
	},
	showResizeButton:function(e){
		var obj=e.data.obj;
		var data=obj.svgRect.getBBox();
		var x=data.x+obj.loc.offset().left;
		var y=data.y+obj.loc.offset().top-obj.rButton.height();
		obj.rButton.appendTo(obj.loc);
		obj.rButton.css("left",x+'px');
		obj.rButton.css("top",data.y+'px');
	},
	triggerResize:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		//follow the mouse with lower-right corner 
		//until user clicks mouse again
		obj.resize=(obj.resize)?false:true;
		if(obj.resize){
			//if(obj.mouseState==1) obj.loc.unbind("mousemove",obj.moveShape);
			//obj.mouseState=0;
			obj.loc.bind("mousemove",{obj:obj},obj.resizeDrag);
			
		} 
	},
	resizeDrag:function(e){
		var obj=e.data.obj;
		var data=obj.svgRect.getBBox();
		var x=(e.pageX-obj.loc.offset().left)-data.x;
		var y=(e.pageY-obj.loc.offset().top)-data.y;
		
		if(x>data.x) obj.svgRect.attr({width:x});
		if(y>data.y) obj.svgRect.attr({height:y});
	
	},
	activate:function(){
		this.loc.bind("click",{obj:this},this.setMouse);
		this.mouseState=0;
		this.resize=false;
		this.svgRect.show();
		this.rButton.show();
	},
	deactivate:function(){
		this.loc.unbind("click",this.setMouse);
		this.rButton.hide();
		this.svgRect.hide();
	},
	setMouse:function(e){
		var obj=e.data.obj;
		if(obj.resize){
			obj.resize=false;
			obj.loc.unbind("mousemove",obj.resizeDrag);
		} else {
		
			switch(obj.mouseState){
				case 0:
					obj.mouseState=1;
					obj.loc.bind("mousemove",{obj:obj},obj.moveShape);
				//	obj.loc.unbind("click",obj.setMouse);
				//	obj.loc.bind("mouseup",{obj:obj},obj.setMouse);
					break;
			
				case 1:
					obj.mouseState=0;
					obj.loc.unbind("mousemove",obj.moveShape);
				//	obj.loc.unbind("mouseup",obj.setMouse);
				//	obj.loc.bind("click",{obj:obj},obj.setMouse);
					break;
			}
		}
	},
	moveShape:function(e){
		var obj=e.data.obj;
		var shape=e.data.shape;
		obj.x=e.pageX-obj.loc.offset().left-(obj.svgRect.getBBox().width/2);
		obj.y=e.pageY-obj.loc.offset().top-(obj.svgRect.getBBox().height/2);
		obj.svgRect.attr({x:obj.x,y:obj.y});
		/**
		var svgx=obj.loc.offset().left+$(obj.svgRect.node)[0].x;
		var svgy=obj.loc.offset().top+$(obj.svgRect.node)[0].y;
		obj.rectPlaceHolder.width(data.width);
		obj.rectPlaceHolder.height(data.height);
		obj.svgRect.hide();
		obj.rectPlaceHolder.css("left",svgx+"px");
		obj.rectPlaceHolder.css("top",svgy+"px");
		obj.rectPlaceHolder.show();**/
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