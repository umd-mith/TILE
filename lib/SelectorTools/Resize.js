/**
Resize

obj: object to be resized
container: DOM element that the object is attached to
**/

var Resize=Monomyth.Class.extend({
	init:function(args){
		this.resizeObj=args.obj;
		this.container=args.container;
	}
});

var SVGResize=Resize.extend({
	init:function(args){
		this.$super(args);
		$(this.resizeObj.node).bind("mousemove",{obj:this},this.trackMouse);
		$(this.resizeObj.node).bind("mousedown",{obj:this},this.startResize);
		this.precision=(args.precision)?args.precision:5;
		//this.container.bind("mouseup",{obj:this},this.stopResize);
		
		//if user is dragging shape, stop resizing
		this.container.bind("startDrag",{obj:this},this.deactivate);
		this.container.bind("stopDrag",{obj:this},this.activate);
	},
	trackMouse:function(e){
		
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();
	
		if((y>data.y)&&(y<(data.y+data.height))&&
		((Math.abs(x-(data.x+data.width))<=obj.precision)||
		(Math.abs(y-(data.y+data.height))<=obj.precision))){
			
			//close to the edge, show resize handle
			//pick correct resize pointer based on cursor position
			if(((Math.abs(x-(data.x+data.width))<=obj.precision)&&(Math.abs(y-(data.y+data.height))<=obj.precision))){
				$(obj.resizeObj.node).css("cursor","se-resize");
			}else if(Math.abs(x-(data.x+data.width))<=obj.precision){
				$(obj.resizeObj.node).css("cursor","e-resize");
			} else if(Math.abs(y-(data.y+data.height))<=obj.precision){
				$(obj.resizeObj.node).css("cursor","s-resize");
			}
		} else {
			$(obj.resizeObj.node).css("cursor","default");
		}
	},
	deactivate:function(e){
		if(e&&(e.type=="startDrag")){
			e.stopPropagation();
			//deactivates while dragging
			var obj=e.data.obj;
			$(obj.resizeObj.node).unbind("mousedown");
			obj.container.unbind("mousemove");
			obj.container.unbind("mouseup");
			$(obj.resizeObj.node).unbind("mousemove");
			//obj.container.unbind("mouseup",obj.stopResize);
		} else {
		
			//deactivates 
			
			$(this.resizeObj.node).unbind("mousedown");
			
			this.container.unbind("mousemove");
			this.container.unbind("mouseup");
			$(this.resizeObj.node).unbind("mousemove");
			//obj.container.unbind("mouseup",obj.stopResize);
		}
	},
	activate:function(e){
		if(e&&(e.type=="stopDrag")){
			e.stopPropagation();
			var obj=e.data.obj;
			$(obj.resizeObj.node).bind("mousemove",{obj:obj},obj.trackMouse);
			$(obj.resizeObj.node).bind("mousedown",{obj:obj},obj.startResize);
			//obj.container.bind("mouseup",{obj:obj},obj.stopResize);
		} else {
		
			$(this.resizeObj.node).bind("mousedown",{obj:this},this.startResize);
			$(this.resizeObj.node).bind("mousemove",{obj:this},this.trackMouse);
			//this.container.bind("mouseup",{obj:this},this.stopResize);
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
			//close to the edge, begin process
			$(obj.resizeObj.node).trigger("startResize");
			$(obj.resizeObj.node).unbind("mousemove");
			$(obj.resizeObj.node).unbind("mousedown");
			obj.container.bind("mouseup",{obj:obj},obj.stopResize);
			obj.container.bind("mousemove",{obj:obj},obj.resize);
		}
		
		
		/**
		var obj=e.data.obj;
		$(obj.resizeObj.node).trigger("startResize");
		//when user moves mouse with mousedown, it will resize the shape
	//	obj.container.unbind("mousemove",obj.trackMouse);
	//	obj.container.unbind("mousedown",obj.startResize);
		obj.container.bind("mousemove",{obj:obj},obj.resize);**/
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
		obj.container.unbind("mousemove");
		obj.container.unbind("mouseup");
		$(obj.resizeObj.node).trigger("stopResize");
		$(obj.resizeObj.node).bind("mousemove",{obj:obj},obj.trackMouse);
		$(obj.resizeObj.node).bind("mousedown",{obj:obj},obj.startResize);
	}
});


var SVGCircleResize=SVGResize.extend({
	init:function(args){
		this.$super(args);
		this.precision+=15;
		this.pi=(22/7);
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
			
			$(obj.resizeObj.node).trigger("startResize");
			$(obj.resizeObj.node).unbind("mousemove");
			$(obj.resizeObj.node).unbind("mousedown");
			obj.container.bind("mouseup",{obj:obj},obj.stopResize);
			obj.container.bind("mousemove",{obj:obj},obj.resize);
		
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