/**

Drag

Creating objects that will allow other objects
to be dragged 
**/

//GENERAL CLASS - SPECIFIES ONLY NECESSARY PROPERTIES
/**
args: 
container -- DOM/jQuery object that listeners are attached to
dragEl -- object that is being manipulated by functions 
**/
var Drag=Monomyth.Class.extend({
	init:function(args){
		if(!args.container) throw "No container passed to Drag";
		if(!args.obj) throw "No draggable DOM object passed to Drag";
		this.container=args.container;
		this.dragEl=args.obj;
		this.precision=(args.precision)?args.precision:10;
	}
});

//SVG Drag -- used for dragging elements drawn in Raphaeljs
/**
Cursor property and mouse listener properties change when cursor is 
located near the center of the object (away from the edges)

params:


**/
var SVGDrag=Drag.extend({
	init:function(args){
		this.$super(args);
		$(this.dragEl.node).bind("mousemove",{obj:this},this.trackMouse);
		$(this.dragEl.node).bind("mousedown",{obj:this},this.startDrag);
		//this.container.bind("mouseup",{obj:this},this.stopDrag);
		
		//adjust sides
		this.data=this.dragEl.getBBox();
		this.left=(this.data.x);
		this.top=(this.data.y);
		this.right=(this.data.x+this.data.width);
		this.bottom=(this.data.y+this.data.height);
		
		//If resize is set, make sure drag is off while resizing
		this.container.bind("startResize",{obj:this},this.deactivate);
		this.container.bind("stopResize",{obj:this},this.activate);
		//this.container.bind("stopResize",{obj:this});
	},
	deactivate:function(e){
		if(e&&(e.type=="startResize")){
			e.stopPropagation();
			//deactivates while resizing
			var obj=e.data.obj;
			$(obj.dragEl.node).unbind("mousedown");
			$(obj.dragEl.node).unbind("mousemove");
			obj.container.unbind("mousemove");
			obj.container.unbind("mouseup");
			//obj.container.unbind("mouseup",obj.stopDrag);
		} else {
			$(this.dragEl.node).unbind("mousemove");
			this.container.unbind("mouseup");
			$(this.dragEl.node).unbind("mousedown");
			this.container.unbind("mousemove");
		}
	},
	activate:function(e){
		if(e&&(e.type=="stopResize")){
			e.stopPropagation();
			var obj=e.data.obj;
	
			//get new size data
			obj.data=obj.dragEl.getBBox();
			obj.left=obj.data.x;
			obj.top=obj.data.y;
			obj.right=(obj.data.x+obj.data.width);
			obj.bottom=(obj.data.y+obj.data.height);
			$(obj.dragEl.node).bind("mousemove",{obj:obj},obj.trackMouse);
			$(obj.dragEl.node).bind("mousedown",{obj:obj},obj.startDrag);
			//obj.container.bind("mouseup",{obj:obj},obj.stopDrag);
		} else {
			this.data=this.dragEl.getBBox();
			this.left=this.data.x;
			this.top=this.data.y;
			this.right=(this.data.x+this.data.width);
			this.bottom=(this.data.y+this.data.height);
			$(this.dragEl.node).bind("mousemove",{obj:this},this.trackMouse);
			$(this.dragEl.node).bind("mousedown",{obj:this},this.startDrag);
			
		}
	},
	trackMouse:function(e){
		
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		
		if((x>obj.left)&&(x<obj.right)&&(Math.abs(x-(obj.right))>obj.precision)
		&&(Math.abs(y-(obj.bottom))>obj.precision)){
			e.stopPropagation();
			$(obj.dragEl.node).css("cursor","move");
			//obj.container.bind("mousedown",{obj:obj},obj.startDrag);
			
		} else {
			//unbinds all mousedown listeners (including Resize - if active)
			//obj.container.unbind("mousedown");
			$(obj.dragEl.node).css("cursor","default");
		}
		
	},
	startDrag:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		
		if((x>obj.left)&&(x<obj.right)&&(Math.abs(x-(obj.right))>obj.precision)
		&&(Math.abs(y-(obj.bottom))>obj.precision)){
			e.stopPropagation();
			//start the dragging experience
			$(obj.dragEl.node).trigger("startDrag");
			$(obj.dragEl.node).unbind("mousemove"); //stop mouse tracking
			$(obj.dragEl.node).unbind("mousedown");
			obj.container.bind("mouseup",{obj:obj},obj.stopDrag);
			obj.container.bind("mousemove",{obj:obj},obj.drag);
		}
	},
	drag:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		$(obj.dragEl.node).trigger("drag");
		var x=(e.pageX-obj.container.offset().left)-(obj.data.width/2);
		var y=(e.pageY-obj.container.offset().top)-(obj.data.height/2);
		//update sides
		obj.data=obj.dragEl.getBBox();
		obj.left=x;
		obj.top=y;
		obj.right=(x+obj.data.width);
		obj.bottom=(y+obj.data.height);
		obj.dragEl.attr({x:obj.left,y:obj.top});
	},
	stopDrag:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
	
		obj.container.unbind("mousemove");
		obj.container.unbind("mouseup");
		//return to original state
		$(obj.dragEl.node).trigger("stopDrag");
		$(obj.dragEl.node).bind("mousemove",{obj:obj},obj.trackMouse);
		$(obj.dragEl.node).bind("mousedown",{obj:obj},obj.startDrag);
	}
});


var SVGCircleDrag=SVGDrag.extend({
	init:function(args){
		this.$super(args);
		
	},
	trackMouse:function(e){
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		
		if((x>obj.left)&&(x<obj.right)&&(Math.abs(x-(obj.right))>obj.precision)
		&&(Math.abs(y-(obj.bottom))>obj.precision)){
			e.stopPropagation();
			$(obj.dragEl.node).css("cursor","move");
			obj.container.bind("mousedown",{obj:obj},obj.startDrag);
			
		} else {
			//unbinds all mousedown listeners (including Resize - if active)
			obj.container.unbind("mousedown");
			$(obj.dragEl.node).css("cursor","default");
		}
	},
	drag:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		$(obj.dragEl.node).trigger("drag");
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		//update sides
		obj.data=obj.dragEl.getBBox();
		obj.left=x;
		obj.top=y;
		obj.right=(x+(obj.data.width));
		obj.bottom=(y+obj.data.height);
		obj.dragEl.attr({cx:obj.left,cy:obj.top});
	}
});