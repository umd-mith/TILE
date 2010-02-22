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
		
		this.mouseDown=false;
		this.loc.bind("click",{obj:this},this.setMouse);
		
		
	},
	setMouse:function(e){
		var obj=e.data.obj;
		obj.mouseDown=(!obj.mouseDown)?true:false;
		if(obj.mouseDown){
			obj.loc.bind("mousedown",{obj:obj},obj.dragExpand);
			obj.loc.bind("mousemove",{obj:obj},obj.moveAround);
		} else {
			obj.loc.unbind("mousedown",obj.dragExpand);
			obj.loc.unbind("mousemove",obj.moveAround);
		}
	},
	moveAround:function(e){
		//change the center position of the ellipse
		//attr's x & y of Raphael element
		var obj=e.data.obj;
		if(obj.mouseDown){
			var x=e.pageX-obj.loc.position().left;
			var y=e.pageY-obj.loc.position().top;
			obj.centrex=x;
			obj.centrey=y;
			obj.svgEl.attr({cx:obj.centrex,cy:obj.centrey});
		}
	},
	expand:function(e){
		var obj=e.data.obj;
		if(obj.mouseDown){
			var data=obj.svgEl.getBBox();
			var x=e.pageX-obj.loc.position().left;
			var y=e.pageY-obj.loc.offset().top;
			obj.rx=x;
			obj.ry=y;
			obj.svgEl.attr({rx:(obj.rx),ry:obj.ry});
			
		}
	},
	dragExpand:function(e){
		var obj=e.data.obj;
		obj.drag=(obj.drag)?false:true;
		if(obj.drag){
			
		}
	}
	
});