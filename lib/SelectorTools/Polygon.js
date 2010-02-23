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
	},
	makePoint:function(e){
		var obj=e.data.obj;
		var x=e.pageX-obj.loc.offset().left;
		var y=e.pageY-obj.loc.offset().top;
		var node={
			el:new SVGNode({svg:obj.svg,loc:obj.loc,xy:[x,y]}),
			index:obj.points.length,
			lines:[]
		};
		//check if this should be part of a line
		var prev=obj.points[(obj.points.length-1)];
		if(prev){
			if((Math.abs(node.el.x-prev.el.x)<=20)&&(Math.abs(node.el.y-prev.el.y)<=20)){
				//close up the path
				var megapath="";
				jQuery.each(obj.lines,function(i,val){
					val.svg.remove();
					megapath+=val.string;
				});
				
				var path=obj.svg.path("M"+obj.points[0].el.x+" "+obj.points[0].el.y+megapath+" z");
				path.attr({stroke:obj.color,fill:obj.color,opacity:0.3});
				obj.loc.unbind("click",obj.makePoint);
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
				obj.lines.push({svg:path,string:(" L "+node.el.x+" "+node.el.y)});
				//node.el.set();
				obj.points.push(node);
			}
		} else {
			obj.points.push(node);
		}
	},
	activate:function(){
		
	},
	deactivate:function(){
		jQuery.each(this.points,function(i,val){
			val.el.deactivate();
			for(l=0;l<val.lines.length;l++){
				val.lines[l].hide();
			}
		});
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
		
	}
});


var SVGNode=Node.extend({
	init:function(args){
		this.$super(args);
		this.svg=args.svg;
		this.loc=args.loc;
		//create a circle to represent node
		this.svgCirc=this.svg.circle(this.x,this.y,3);
		this.active=false;
		//this.loc.bind("mousemove",{obj:this},this.mouseMoveEvent);
		//$(this.svgCirc.node).bind("click",{obj:this},this.mouseClickEvent);
	},
	mouseMoveEvent:function(e){
		var obj=e.data.obj;
		obj.x=e.pageX-obj.loc.offset().left;
		obj.y=e.pageY-obj.loc.offset().top;
		
	},
	mouseClickEvent:function(e){
		var obj=e.data.obj;
		if(obj.active){
			obj.loc.unbind("mousemove",obj.mouseMoveEvent);
		} else {
			obj.loc.bind("mousemove",{obj:obj},obj.mouseMoveEvent);
		}
	},
	set:function(){
		$(this.svgCirc.node).bind("click",{obj:this},this.mouseClickEvent);
	}
});