var DefineLayout=Monomyth.Class.extend({
	init:function(args){
		
	}
	
});

/**
CanvasDefineLayout

Functions:
init (constructor)

listens for:


**/
var CanvasDefineLayout=DefineLayout.extend({
	init:function(args){
		this.$super(args);
		this.ruleList = [];
		
		
	},
	setRegion:function(values){
		
		this.Region=values;
		//adjust values to the canvas area
		//this.Region.ox=this.Region.ox-this.canvas.offset().left;
		//this.Region.oy=this.Region.oy-this.canvas.offset().top;
		this.canvas.trigger("regionloaded");
	},
	displayBox:function(e){
		var obj=e.data.obj;
		if($("#selectionbox").length==0){
			var box=new SelectorBox({
				loc:obj.loc
			});
			box.DOM.attr("id","selectionbox");
			box.makeDrag();
		}
	}
});
