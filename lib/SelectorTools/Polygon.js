/**
Polygon 


Set of lines bound together - lines are made of a line and a point, which are 
represented by Node objects
**/

var Polygon=Monomyth.Class.extend({
	init:function(args){
		this.points=[];
		this.lines=[];
		this.rightmost=0;
		this.leftmost=0;
		this.color=args.color; //hex/rgb
	}
	
});

var SVGPolygon=Polygon.extend({
	init:function(args){
		this.$super(args);
		this.svg=args.svg;
		this.loc=args.loc;
		this.linecount=0;
		this.loc.bind("click",{obj:this},this.makePoint);
		this.loc.bind("nodeReset",{obj:this},this.changePoint);
	},
	makePoint:function(e){
		var obj=e.data.obj;
		var x=e.pageX-obj.loc.offset().left;
		var y=e.pageY-obj.loc.offset().top;
		var node={
			el:new SVGNode({svg:obj.svg,loc:obj.loc,xy:[x,y],index:obj.points.length}),
			index:obj.points.length,
			lines:[]
		};
		//check if this should be part of a line
		var prev=obj.points[(obj.points.length-1)];
		if(prev){
			if((Math.abs(node.el.x-obj.points[0].el.x)<=20)&&(Math.abs(node.el.y-obj.points[0].el.y)<=20)){
				//close up the path
				obj.points.push(node);
				obj.lines.push({svg:null,nindex:node.index,string:(" L "+node.el.x+" "+node.el.y)});
				obj.loc.unbind("click",obj.makePoint);
				jQuery.each(obj.points,function(i,val){
					val.el.set();
				});
				obj.closeShape();
			} else {
			
				//has no line associated with it
				obj.linecount++;
				
				//draw line between two nodes
				//using SVG Path format for Raphael
				var dx=(prev.el.x-node.el.x);
				var dy=(prev.el.y-node.el.y);
				var coords="M "+node.el.x+" "+node.el.y+" l "+dx+" "+dy;
			
				var path=obj.svg.path(coords);
				path.attr({stroke:obj.color});
				//adds path to previous and current nodes
				prev.lines.push(path);
				node.lines.push(path);
				obj.lines.push({svg:path,nindex:node.index,string:(" L "+node.el.x+" "+node.el.y)});
				//node.el.set();
				obj.points.push(node);
			}
		} else {
			obj.points.push(node);
		}
	},
	closeShape:function(){
		var megapath="";
		jQuery.each(this.lines,function(i,val){
			if(val.svg) val.svg.remove();
			megapath+=val.string;
		});
		
		if(this.mainPath) this.mainPath.remove();
		this.mainPath=this.svg.path("M"+this.points[0].el.x+" "+this.points[0].el.y+megapath+" z");
		this.mainPath.attr({stroke:this.color,fill:this.color,opacity:0.3});
		//this.mainPath.insertAfter(this.points[0].el.svgCirc);
		jQuery.each(this.points,function(i,val){
			val.el.svgCirc.toFront();
		});
		
	},
	changePoint:function(e,node){
		var obj=e.data.obj;
		var xystring=" L "+node.x+" "+node.y;
		for(x=0;x<obj.lines.length;x++){
			if(obj.lines[x].nindex==node.index){
				obj.lines[x].string=xystring;
				break;
			}
		}
		obj.closeShape();
	},
	activate:function(){
		if(!this.mainPath) this.loc.bind("click",{obj:this},this.makePoint);
		jQuery.each(this.points,function(i,val){
			val.el.activate();
			for(l=0;l<val.lines.length;l++){
				val.lines[l].show();
			}
		});
		if(this.mainPath) this.mainPath.show();
	},
	deactivate:function(){
		jQuery.each(this.points,function(i,val){
			val.el.deactivate();
			for(l=0;l<val.lines.length;l++){
				val.lines[l].hide();
			}
		});
		if(this.mainPath) this.mainPath.hide();
		this.loc.unbind("click",this.makePoint);
	},
	getData:function(){
		//export all the size data for this shape
		for(p=0;p<this.points.length;p++){
			point=this.points[p];
			
		}
	}
});


/**
Node

Object representing a point in a Polygonal line
**/

var Node=Monomyth.Class.extend({
	init:function(args){
		this.x=args.xy[0];
		this.y=args.xy[1];
		this.point=args.xy;
		this.index=args.index;
	}
});


var SVGNode=Node.extend({
	init:function(args){
		this.$super(args);
		this.svg=args.svg;
		this.loc=args.loc;
		//create a circle to represent node
		this.svgCirc=this.svg.circle(this.x,this.y,3);
		this.svgCirc.attr({fill:"#DDFF00",stroke:"#FF0000"});
		this.active=false;
		//this.loc.bind("mousemove",{obj:this},this.mouseMoveEvent);
		//$(this.svgCirc.node).bind("click",{obj:this},this.mouseClickEvent);
	},
	mouseMoveEvent:function(e){
		var obj=e.data.obj;
		obj.x=e.pageX-obj.loc.offset().left;
		obj.y=e.pageY-obj.loc.offset().top;
		obj.svgCirc.attr({cx:obj.x,cy:obj.y});
		
	},
	mouseClickEvent:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		obj.active=(obj.active)?false:true;
		if(obj.active){
			obj.loc.bind("mousemove",{obj:obj},obj.mouseMoveEvent);
		//	obj.loc.bind("click",{obj:obj},obj.mouseClickEvent);
		} else {
			obj.loc.unbind("mousemove",obj.mouseMoveEvent);
		//	obj.loc.unbind("click",obj.mouseClickEvent);
			$(obj.svgCirc.node).trigger("nodeReset",[obj]);
		}
	},
	set:function(){
		$(this.svgCirc.node).bind("click",{obj:this},this.mouseClickEvent);
	},
	deactivate:function(){
		this.svgCirc.hide();
	},
	activate:function(){
		this.svgCirc.show();
		
	}
});