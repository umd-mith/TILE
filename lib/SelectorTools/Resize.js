/**
Resize

obj: object to be resized
container: DOM element that the object is attached to
**/

var Resize=Monomyth.Class.extend({
	init:function(args){
		this.resizeObj=args.obj;
		this.container=args.container;
		this.listenEl=$(document);
	}
});

var SVGResize=Resize.extend({
	init:function(args){
		this.$super(args);
		this.listenEl.bind("mousemove",{obj:this},this.trackMouse);
		this.listenEl.bind("mousedown",{obj:this},this.startResize);
		
		this.precision=(args.precision)?args.precision:5;
		
		//if user is dragging shape, stop resizing
		this.listenEl.bind("startDrag",{obj:this},this.deactivate);
		this.listenEl.bind("stopDrag",{obj:this},this.activate);
	},
	deactivate:function(e){
		if(e&&(e.type=="startDrag")){
			e.stopPropagation();
			//deactivates while dragging
			var obj=e.data.obj;
			obj.listenEl.unbind("mousedown",obj.startResize);
			obj.listenEl.unbind("mousemove",obj.trackMouse);
			obj.listenEl.unbind("mousemove",obj.resize);
			obj.listenEl.unbind("mouseup",obj.stopResize);
		} else {
			//deactivates 
			this.listenEl.unbind("mousedown",obj.startResize);
			this.listenEl.unbind("mousemove",obj.resize);
			this.listenEl.unbind("mousemove",obj.trackMouse);
			this.listenEl.unbind("mouseup",obj.stopResize);
		}
	},
	activate:function(e){
		if(e&&(e.type=="stopDrag")){
			e.stopPropagation();
			var obj=e.data.obj;
			obj.listenEl.bind("mousemove",{obj:obj},obj.trackMouse);
			obj.listenEl.bind("mousedown",{obj:obj},obj.startResize);
		} else {
			this.listenEl.bind("mousedown",{obj:this},this.startResize);
			this.listenEl.bind("mousemove",{obj:this},this.trackMouse);
		}
	},
	trackMouse:function(e){
		
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();
	if(((y<data.y)||(y>(data.y+data.height+obj.precision)))&&((x<data.x)||(x>(data.x+data.width+obj.precision)))){
		//out of bounds of object
		obj.container.css("cursor","default");
	} else {
		if((y<(data.y+data.height+obj.precision))&&(y>((data.y+data.height)-obj.precision))){
			
			if((x<(data.x+data.width+obj.precision))&&(x>((data.x+data.width-obj.precision)))){
				obj.container.css("cursor","e-resize");
			} else {
				obj.container.css("cursor","s-resize");
			}
		} else if((x<(data.x+data.width+obj.precision))&&(x>((data.x+data.width)-obj.precision))){
			
			obj.container.css("cursor","se-resize");
		} 
		}
	},
	startResize:function(e){
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();

		if((y<(data.y+data.height+obj.precision))&&(y>((data.y+data.height)-obj.precision))){
			if((x<(data.x+data.width+obj.precision))&&(x>((data.x+data.width)-obj.precision))){
				e.stopPropagation();
				$(obj.resizeObj.node).trigger("startResize");
				obj.listenEl.unbind("mousedown",obj.startResize);
				obj.listenEl.unbind("mousemove",obj.trackMouse);
				obj.listenEl.bind("mouseup",{obj:obj},obj.stopResize);
				obj.listenEl.bind("mousemove",{obj:obj},obj.resize);
			} 
		} else if((x<(data.x+data.width+obj.precision))&&(x>(data.x+data.width-obj.precision))){
			e.stopPropagation();
			$(obj.resizeObj.node).trigger("startResize");
			obj.listenEl.unbind("mousedown",obj.startResize);
			obj.listenEl.unbind("mousemove",obj.trackMouse);
			obj.listenEl.bind("mouseup",{obj:obj},obj.stopResize);
			obj.listenEl.bind("mousemove",{obj:obj},obj.resize);
		}
	},
	resize:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		$(obj.resizeObj.node).trigger("resize");
		var data=obj.resizeObj.getBBox();
		var x=(e.pageX-obj.container.offset().left)-data.x;
		var y=(e.pageY-obj.container.offset().top)-data.y;
	
		obj.resizeObj.attr({width:x,height:y}); 
	},
	stopResize:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		obj.listenEl.unbind("mousemove",obj.resize);
		obj.listenEl.unbind("mouseup",obj.stopResize);
		$(obj.resizeObj.node).trigger("stopResize");
		obj.listenEl.bind("mousemove",{obj:obj},obj.trackMouse);
		obj.listenEl.bind("mousedown",{obj:obj},obj.startResize);
	}
});

/**
* 
* SVGCircleResize
*
*Resizes based on Raphael geometry attributes
***/


var SVGCircleResize=SVGResize.extend({
	init:function(args){
		this.$super(args);
		this.precision+=15;
		
	},
	trackMouse:function(e){
		
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();
	
		if((y>data.y)&&(y<(data.y+data.height))&&
		((Math.abs(x-(data.x+data.width))<=obj.precision)||
		(Math.abs(y-(data.y+data.height))<=obj.precision))){
			e.stopPropagation();
			//close to the edge, show resize handle
			//pick correct resize pointer based on cursor position
			
		if(Math.abs(x-(Math.sqrt(Math.pow((data.x+data.width),2)-Math.pow((data.y+data.height),2))))<=obj.precision){
				$(obj.resizeObj.node).css("cursor","e-resize");
				
			} else if(Math.abs(y-(data.y+data.height))<=obj.precision){
				$(obj.resizeObj.node).css("cursor","s-resize");
			}
		} else {
		
			$(obj.resizeObj.node).css("cursor","default");
		}
	},
	startResize:function(e){
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();
	
		if((y>data.y)&&(y<(data.y+data.height))&&
		((Math.abs(x-(data.x+data.width))<=obj.precision)||
		(Math.abs(y-(data.y+data.height))<=obj.precision))){
			e.stopPropagation();
			//close to the edge, show resize handle
			//pick correct resize pointer based on cursor position
			obj.listenEl.unbind("mousemove",obj.trackMouse);
			obj.listenEl.unbind("mousedown",obj.startResize);
			$(obj.resizeObj.node).trigger("startResize");
		//	$(obj.resizeObj.node).unbind("mousemove");
		//	$(obj.resizeObj.node).unbind("mousedown");
		
			obj.listenEl.bind("mouseup",{obj:obj},obj.stopResize);
			obj.listenEl.bind("mousemove",{obj:obj},obj.resize);
		
		}
	},
	//only method changed is the resize method
	resize:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		var data=obj.resizeObj.getBBox();

		var x=((e.pageX-obj.container.offset().left)-data.x)/2;
		var y=((e.pageY-obj.container.offset().top)-data.y)/2;
		
		obj.resizeObj.attr({rx:x,ry:y});
	}
});