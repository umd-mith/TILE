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
		this.container.bind("mousemove",{obj:this},this.trackMouse);
		this.precision=(args.precision)?args.precision:5;
		
	},
	trackMouse:function(e){
		var obj=e.data.obj;
		var x=(e.pageX-obj.container.offset().left);
		var y=(e.pageY-obj.container.offset().top);
		var data=obj.resizeObj.getBBox();
		if((y>data.y)&&(y<(data.y+data.height))&&(Math.abs(x-(data.x+data.width))<=obj.precision)){
			//close to the edge, show resize handle
			$(obj.resizeObj.node).css("cursor","pointer");
			
		} else {
			$(obj.resizeObj.node).css("cursor","default");
		}
	}
});