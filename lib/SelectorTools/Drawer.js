// VectorDrawer: Nikolas Coukoma: atrus@atrus.org


var DrawTool=Monomyth.Class.extend({
	init:function(args){
		//canvas we're drawing on
		this.mainCanvas=args.svgCanvas;
		//zoom elements
		this.maxZoom=args.zoomMax?args.zoomMax:1;
		this.minZoom=args.zoomMin?args.zoomMin:5;
		this.zoomLevel=this.minZoom;
	},
	figureSizeInfo:function(min,max){
		this.maxZoom=max;
		this.minZoom=min;
		this.zoomLevel=min;
	}
});

var RaphaelDrawTool=DrawTool.extend({
	init:function(args){
		this.$super(args);
		//creating vector drawer - mode is controlled by VD
		//MUST BE A RAPHAEL CANVAS OBJECT - raphael.org
		// this.drawer=new VectorDrawer('r',1,[],this.mainCanvas);
	},
	switchMode:function(e,type){
		var obj=e.data.obj;
		switch(type){
			case "rect":
				obj.drawer.drawMode('r');
				break;
			case "elli":
				obj.drawer.drawMode('e');
				break;
			case "poly":
				obj.drawer.drawMode('p');
				break;
		}
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if((val>0)&&(obj.zoomLevel<obj.zoomMax)){
			obj.zoomLevel++;
			obj.drawer.scale(obj.zoomLevel);
		} else if((val<0)&&(obj.zoomLevel>obj.zoomMin)){
			obj.zoomLevel--;
			obj.drawer.scale(obj.zoomLevel);
		}
	}
});
