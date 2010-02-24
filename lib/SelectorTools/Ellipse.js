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
	}
});

var SVGEllipse=Ellipse.extend({
	init:function(args){
		this.$super(args);
		if(!args.svg) throw "Error: no Raphael svg element passed to SVGEllipse";
		this.svg=args.svg;
		this.loc=args.loc;
		this.svgEl=this.svg.ellipse(this.centrex,this.centrey,this.rx,this.ry);
		this.svgEl.attr({stroke:this.color,fill:this.color,opacity:0.4});
		//0: no action, 1: move, 2: resize
		this.mouseDown=0;
		//attaching the listeners to the parent DOM node so that all actions
		//are captured
		this.loc.bind("click",{obj:this},this.setMouse);
	},
	activate:function(){
		this.loc.bind("click",{obj:this},this.setMouse);
		this.svgEl.show();
	},
	deactivate:function(){
		this.svgEl.hide();
		this.mouseDown=0;
		this.loc.unbind("click",this.setMouse);
	},
	setMouse:function(e){
		//switch the mouse mode between none, move, and resize
		var obj=e.data.obj;
		switch(obj.mouseDown){
			case 0:
				obj.loc.bind("mousemove",{obj:obj},obj.moveAround);
				obj.mouseDown=1;
				break;
			case 1:
				obj.loc.unbind("mousemove",obj.moveAround);
				obj.loc.bind("mousemove",{obj:obj},obj.expand);
				obj.mouseDown=2;
				break;
			case 2:
				obj.loc.unbind("mousemove",obj.expand);
				obj.mouseDown=0;
				break;
		}
		
	},
	moveAround:function(e){
		//change the center position of the ellipse
		//attr's x & y of Raphael element
		var obj=e.data.obj;
		if(obj.mouseDown){
			obj.centrex=e.pageX-obj.loc.offset().left;
			obj.centrey=e.pageY-obj.loc.offset().top;
			
			obj.svgEl.attr({cx:obj.centrex,cy:obj.centrey});
		}
	},
	expand:function(e){
		var obj=e.data.obj;
		if(obj.mouseDown){
			var data=obj.svgEl.getBBox();
			var x=(e.pageX-obj.loc.offset().left);
			var y=(e.pageY-obj.loc.offset().top);
			if(x>data.x){
				obj.rx=x-data.x;
				obj.svgEl.attr({rx:obj.rx});
			}
			if(y>data.y){
				obj.ry=y-data.y;
				obj.svgEl.attr({ry:obj.ry});
			}
		}
	}
});