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
		this.svgImage=args.svgImage;
		this.loc=args.loc;
		this.index=args.htmlID;
		this.linecount=0;
		this.precision=(args.precision)?args.precision:20;
		this.mainPath=null;
		this.loc.bind("click",{obj:this},this.makePoint);
		this.loc.bind("nodeReset",{obj:this},this.changePoint);
		this.shapeChangeCall="shapeChange"+this.index;
		this.active=true;
		
		this.figureSizeInfo(1,5);
		//set a point immediately if x,y coords already sent
		if(args.startPoint){
			this.pointFromXY(args.startPoint);
		}
		
		//zoom control
		$("body").bind("zoom",{obj:this},this.zoom);
		$("body").bind("shapeColorSubmit",{obj:this},this.changeStrokeColor);
	},
	figureSizeInfo:function(min,max){
		this.zoomMax=max;
		this.zoomMin=min;
		this.zoomLevel=min;
		this.svgImageW=this.svgImage.getBBox().width;
		this.svgImageH=this.svgImage.getBBox().height;
	},
	// @params	
	// 	point: Array of x,y coords
	pointFromXY:function(point){
		var node={
			el:new SVGNode({svg:this.svg,loc:this.loc,xy:point,index:this.points.length}),
			index:this.points.length,
			lines:[]
		};
		node.string=" L "+node.el.x+" "+node.el.y;
		this.points.push(node);
	},
	reInsert:function(svgImage,svg){
		//re-loading svg images (new objects - raphael derezzes them on .remove())
		this.svg=svg;
		this.svgImage=svgImage;
		//re-do proportions
		var box=this.svgImage.getBBox();
		for(p=0;p<this.points.length;p++){
			var point=this.points[p];
		
			var x=point.el.x;
			var y=point.el.y;
			
			x=(x*box.width)/this.svgImageW;
			y=(y*box.height)/this.svgImageH;
			point.string=" L "+x+" "+y;
			// point.el.x=x;
			// 				point.el.y=y;
				point.reInsert(this.svg);
			//point.el.updatePosition(x,y);
		}
		this.svgImageW=box.width;
		this.svgImageH=box.height;
		
		this.active=false;
		this.closeShape();
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
	closeShape:function(){
		var megapath="";
		jQuery.each(this.points,function(i,val){
			if(val.svg) val.svg.remove();
			megapath+=val.string;
		});
		
		if(this.mainPath) this.mainPath.remove();
		
		this.mainPath=this.svg.path("M"+this.points[0].el.x+" "+this.points[0].el.y+megapath+" z");
		this.mainPath.attr({stroke:this.color,fill:this.color,opacity:0.3});
		jQuery.each(this.points,function(i,val){
			val.el.svgCirc.toFront();
		});
		$(this.mainPath.node).trigger(this.shapeChangeCall,[this.getData()]);
		if(!this.active) this.mainPath.hide();
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
	changeStrokeColor:function(e,hex){
		var obj=e.data.obj;
		obj.color="#"+hex;
		if(obj.mainPath){
			obj.mainPath.attr({stroke:obj.color});
		}
	},
	activate:function(){
		if(this.mainPath) {this.loc.bind("click",{obj:this},this.addPoint);} else {this.loc.bind("click",{obj:this},this.makePoint);};
		jQuery.each(this.points,function(i,val){
			val.el.activate();
			if(val.svg) val.svg.show();
		});
		if(this.mainPath) {
			this.mainPath.show();
			this.loc.bind("click",{obj:this},this.addPoint);
		} else {
			this.loc.bind("click",{obj:this},this.makePoint);
		}
		this.active=true;
		
	},
	deactivate:function(){
		jQuery.each(this.points,function(i,val){
			val.el.deactivate();
			if(val.svg) val.svg.hide();
		});
		if(this.mainPath) this.mainPath.hide();
		this.loc.unbind("click",this.makePoint);
		this.loc.unbind("click",this.addPoint);
		this.active=false;
	},
	getData:function(){
		//export all the size data for this shape
		var massString="";
		for(p=0;p<this.points.length;p++){
			var point=this.points[p];
			massString+=point.string;
		}
		return {shape:"polygon",LineString:massString};
	},
	setAnchor:function(){
		jQuery.each(this.points,function(i,val){
			val.el.deactivate();
			if(val.svg) val.svg.hide();
		});
		if(this.mainPath){
			this.loc.unbind("click",this.addPoint);
		} else {
			this.loc.unbind("click",this.makePoint);
		}
	},
	releaseAnchor:function(){
			jQuery.each(this.points,function(i,val){
				val.el.activate();
				if(val.svg) val.svg.show();
			});
			if(this.mainPath){
				this.loc.bind("click",{obj:this},this.addPoint);
			} else {
				this.loc.bind("click",{obj:this},this.makePoint);
			}
	},
	destroy:function(){
		if(this.mainPath){
			this.mainPath.remove();
			this.loc.unbind("click",this.addPoint);
		}
		for(p=0;p<this.points.length;p++){
			if(this.points[p].el) this.points[p].el.destroy();
			// this.points[p].el.remove();
		}
		this.points=[];
		if(this.options) this.options.remove();
		
		//remove listeners
		this.loc.unbind("click",this.makePoint);
		this.loc.unbind("nodeReset",this.changePoint);
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if(obj.mainPath){
			if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
				obj.zoomLevel++;
				
				// var data=obj.mainPath.getBBox();
				// 			var box=obj.svgImage.getBBox();
				// 			var x=(data.x*box.width)/obj.svgImageW;
				// 			var y=(data.y*box.height)/obj.svgImageH;
				// 			var w=(data.width*box.width)/obj.svgImageW;
				// 			var h=(data.height*box.height)/obj.svgImageH;
				// 			obj.mainPath.attr({x:x,y:y,width:w,height:h});
				// 			obj.svgImageW=box.width;
				// 			obj.svgImageH=box.height;
			} else if ((val<0)&&(obj.zoomLevel>obj.zoomMin)){
				obj.zoomLevel--;
				// var data=obj.mainPath.getBBox();
				// 				var box=obj.svgImage.getBBox();
				// 				var x=(data.x*box.width)/obj.svgImageW;
				// 				var y=(data.y*box.height)/obj.svgImageH;
				// 				var w=(data.width*box.width)/obj.svgImageW;
				// 				var h=(data.height*box.height)/obj.svgImageH;
				// 				obj.mainPath.attr({x:x,y:y,width:w,height:h});
				// 				obj.svgImageW=box.width;
				// 				obj.svgImageH=box.height;
			}
		
			//var data=obj.mainPath.getBBox();
			var box=obj.svgImage.getBBox();
			for(p=0;p<obj.points.length;p++){
				var point=obj.points[p];
				var x=point.el.x;
				var y=point.el.y;
				
				x=(x*box.width)/obj.svgImageW;
				y=(y*box.height)/obj.svgImageH;
				point.string=" L "+x+" "+y;
				// point.el.x=x;
				// 				point.el.y=y;
				point.el.updatePosition(x,y);
			}
			obj.svgImageW=box.width;
			obj.svgImageH=box.height;
			obj.closeShape();
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
	reInsert:function(svg){
		this.svg=svg;
		//create a circle to represent node
		this.svgCirc=this.svg.circle(this.x,this.y,3);
		this.svgCirc.attr({fill:"#DDFF00",stroke:"#FF0000"});
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
	updatePosition:function(x,y){
		this.x=x;
		this.y=y;
		this.svgCirc.attr({cx:this.x,cy:this.y});
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