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
		this.precision=(args.precision)?args.precision:20;
		this.mainPath=null;
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
			if((Math.abs(node.el.x-obj.points[0].el.x)<=obj.precision)&&(Math.abs(node.el.y-obj.points[0].el.y)<=obj.precision)){
				//node is close to the beginning node (obj.points[0].el)
				//close up the path
				//obj.points.push(node);
				//add coordinates to last node element in array
				//obj.points[(obj.points.length-1)].string+=" L "+node.el.x+" "+node.el.y;
				
				node.el.destroy();
			//	obj.lines.push({svg:null,nindex:node.index,string:(" L "+node.el.x+" "+node.el.y)});
				obj.loc.unbind("click",obj.makePoint);
				obj.loc.bind("click",{obj:obj},obj.addPoint);
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
				node.svg=path;
				node.string=" L "+node.el.x+" "+node.el.y;
				//obj.lines.push({svg:path,nindex:node.index,string:(" L "+node.el.x+" "+node.el.y)});
				//node.el.set();
				obj.points.push(node);
			}
		} else {
			node.string=" L "+node.el.x+" "+node.el.y;
			obj.points.push(node);
		}
	},
	closeShape:function(){
		var megapath="";
		jQuery.each(this.points,function(i,val){
			if(val.svg) val.svg.remove();
			megapath+=val.string;
		});
		
		if(this.mainPath) this.mainPath.remove();
		this.mainPath=this.svg.path("M"+this.points[0].el.x+" "+this.points[0].el.y+megapath+" z");
		this.mainPath.attr({stroke:this.color,fill:this.color,opacity:0.3});
		$(this.mainPath.node).bind("mouseover",{obj:this},this.showOptions);

		jQuery.each(this.points,function(i,val){
			val.el.svgCirc.toFront();
		});
		
	},
	changePoint:function(e,node){
		var obj=e.data.obj;
		var xystring=" L "+node.x+" "+node.y;
		for(x=0;x<obj.points.length;x++){
			if(obj.points[x].nindex==node.index){
				obj.points[x].string=xystring;
				break;
			}
		}
		obj.closeShape();
	},
	addPoint:function(e){
		//shape is already complete, set a new point
		//in the shape to alter the total path
		var obj=e.data.obj;
		if(obj.points.length>1){
			var x=e.pageX-obj.loc.offset().left;
			var y=e.pageY-obj.loc.offset().top;
			var node={
				el:new SVGNode({svg:obj.svg,loc:obj.loc,xy:[x,y],index:obj.points.length}),
				index:obj.points.length,
				lines:[],
				string:" L "+x+" "+y
			};
			var diff=0;
			var smalldiff=0;
			//find the points in current chain that are less than and more than the new point
			for(p=0;p<obj.points.length;p++){
				v=obj.points[p];
				var cdiff=Math.abs(v.el.y-node.el.y)+Math.abs(v.el.x-node.el.x);
				if((cdiff<diff)||(diff==0)){
					diff=cdiff;
					smalldiff=p;
				}
				if((v.el)&&((p+1)<obj.points.length)){
					if((Math.abs(v.el.y-node.el.y)<=obj.precision)&&(Math.abs(v.el.x-node.el.x)<=obj.precision)){
						node.index=p;
						
						var a1=obj.points.slice(0,p);
						var a2=obj.points.slice(p);
						a1.push(node);
						
						obj.points=a1.concat(a2);
					
						break;
					}
				} else {
					var a1=obj.points.slice(0,smalldiff);
					var a2=obj.points.slice(smalldiff);
					a1.push(node);
					
					obj.points=a1.concat(a2);
					break;
				}
			}
			obj.closeShape();
		} else {
			//reset the shape - not enough points
			obj.mainPath.remove();
			obj.mainPath=null;
			obj.loc.unbind("click",obj.addPoint);
			obj.loc.bind("click",{obj:obj},obj.makePoint);
		}
	},
	activate:function(){
		if(this.mainPath) {this.loc.bind("click",{obj:this},this.addPoint);} else {this.loc.bind("click",{obj:this},this.makePoint);};
		jQuery.each(this.points,function(i,val){
			val.el.activate();
			if(val.svg) val.svg.show();
		});
		if(this.mainPath) this.mainPath.show();
		
	},
	deactivate:function(){
		jQuery.each(this.points,function(i,val){
			val.el.deactivate();
			if(val.svg) val.svg.hide();
		});
		if(this.mainPath) this.mainPath.hide();
		this.loc.unbind("click",this.makePoint);
		if(this.options) this.options.hide();
	},
	getData:function(){
		//export all the size data for this shape
		var massString="";
		for(p=0;p<this.points.length;p++){
			var point=this.points[p];
			massString+=point.string;
		}
		return {s:massString};
	},
	showOptions:function(e){
		var obj=e.data.obj;
		if(!obj.options){
			obj.options=$("<div class=\"polyOptions\"></div>");
			obj.options.attr("id",function(e){
				return "polygonOptions"+$('.polyOptions').length;
			});
			obj.closePoly=$("<span class=\"polyStartOver\">Start Over</span>");
			obj.closePoly.attr("id",function(e){
				return "polyStartOver"+$(".polyStartOver").length;
			});
			obj.closePoly.appendTo(obj.options);
			obj.closePoly.bind("click",{obj:obj},function(e){
				e.stopPropagation(); //so as not to click through to image and create another node
				var obj=e.data.obj;
				obj.destroy();
			});
			obj.options.appendTo(obj.loc);
			var data=obj.mainPath.getBBox();
			obj.options.css("left",(data.x+(data.width/2))+"px");
			obj.options.css("top",(data.y+(data.height/2))+"px");
			$(obj.mainPath.node).bind("mouseout",{obj:obj},function(e){
				var obj=e.data.obj;
				obj.options.hide();
			});
		} else {
			var data=obj.mainPath.getBBox();
			obj.options.css("left",(data.x+(data.width/2))+"px");
			obj.options.css("top",(data.y+(data.height/2))+"px");
			obj.options.show();
		}
	},
	destroy:function(){
		if(this.mainPath){
			this.mainPath.remove();
		}
		for(p=0;p<this.points.length;p++){
			if(this.points[p].el) this.points[p].el.destroy();
			// this.points[p].el.remove();
		}
		this.points=[];
		if(this.options) this.options.remove();
	},
	setAnchor:function(){
		for(p in this.points){
			this.points[p].el.deactivate();
		}
	},
	releaseAnchor:function(){
		for(p in this.points){
			this.points[p].el.activate();
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
		
	},
	destroy:function(){
		this.svgCirc.remove();
	//	this=null;//destroyed.
	}
});