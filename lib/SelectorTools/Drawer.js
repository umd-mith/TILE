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
		this.initScale=args.initScale;
		
		//creating vector drawer - mode is controlled by VD
		//MUST BE A RAPHAEL CANVAS OBJECT - raphael.org
		this.drawer=new VectorDrawer('r',1,[],this.initScale,this.mainCanvas);
		$("body").bind("changeShapeType",{obj:this},this.switchMode);
		this.active=true;
	},
	toggle:function(mode){
		
		if(this.drawer&&this.active){
			switch(mode){
				case 'on':
					this.drawer._installHandlers();
					break;
				case 'off':
					this.drawer._uninstallHandlers();
					break;
			}
			
		}
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
			//var scale=obj.mainCanvas.width()/obj.storedWidth;
			obj.drawer.scale(1);
		} else if((val<0)&&(obj.zoomLevel>obj.zoomMin)){
			obj.zoomLevel--;
			obj.drawer.scale(obj.zoomLevel);
		}
	}
});
