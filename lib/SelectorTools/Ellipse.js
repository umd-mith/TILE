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
		this.svgEl=this.svg.ellipse(this.centrex,this.centrey,this.rx,this.ry);
		this.svgEl.attr({stroke:this.color});
	
		//create Resize and Drag
		this.setResizeAndDrag();
		
		$("body").bind("zoom",{obj:this},this.zoom);
	},
	setResizeAndDrag:function(){
		this.resize=new SVGCircleResize({container:this.loc,obj:this.svgEl});
		this.drag=new SVGCircleDrag({container:this.loc,obj:this.svgEl});
	},
	showOptions:function(e){
		var obj=e.data.obj;
		if(!obj.options){
			obj.options=$("<div class=\"ellipseOptions\"></div>");
			obj.options.attr("id",function(e){
				return "ellipseOptions"+$('.ellipseOptions').length;
			});
			obj.closeEl=$("<span class=\"ellipseOption\">Close</span>");
			obj.closeEl.attr("id",function(e){
				return "ellipseClose"+$(".ellipseOption").length;
			});
			obj.closeEl.appendTo(obj.options);
			obj.closeEl.bind("click",{obj:obj},function(e){
				e.stopPropagation(); //so as not to click through to image and create another node
				var obj=e.data.obj;
				obj.destroy();
			});
			
			obj.ellipseResize=$("<span class=\"ellipseOption\">Resize</span>");
			obj.ellipseResize.attr("id",function(e){
				return "ellipse"+$(".ellipseOption").length;
			});
			obj.ellipseResize.appendTo(obj.options);
			obj.ellipseResize.bind("click",{obj:obj},function(e){
				e.stopPropagation();
				var obj=e.data.obj;
				obj.options.hide();
				if(obj.mouseDown=="m") obj.loc.unbind("mousemove",obj.moveAround);
				obj.mouseDown="r";
				obj.loc.bind("mousemove",{obj:obj},obj.expand);
			});
			
			obj.ellipseMove=$("<span class=\"ellipseOption\">Move</span>");
			obj.ellipseMove.attr("id",function(e){
				return "ellipse"+$(".ellipseOption").length;
			});
			obj.ellipseMove.appendTo(obj.options);
			obj.ellipseMove.bind("click",{obj:obj},function(e){
				e.stopPropagation();
				var obj=e.data.obj;
				obj.options.hide();
				if(obj.mouseDown=="r") obj.loc.unbind("mousemove",obj.expand);
				obj.mouseDown="m";
				obj.loc.bind("mousemove",{obj:obj},obj.moveAround);
				
			});
			
			obj.options.appendTo(obj.loc);
			obj.options.bind("mousemove",{obj:obj},obj.showOptions);
			var data=obj.svgEl.getBBox();
			obj.options.css("left",(data.x+(data.width/2))+"px");
			obj.options.css("top",(data.y+(data.height/2))+"px");
			$(obj.svgEl.node).bind("mouseout",{obj:obj},function(e){
				var obj=e.data.obj;
				obj.options.hide();
			});
		} else {
			var data=obj.svgEl.getBBox();
			obj.options.css("left",(data.x+(data.width/2))+"px");
			obj.options.css("top",(data.y+(data.height/2))+"px");
			obj.options.show();
		}
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
			ul:data.x,
			ut:data.y,
			rx:data.width/2,
			ry:data.height/2
		};
	}
});