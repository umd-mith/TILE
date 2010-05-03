// VectorDrawer: Nikolas Coukoma: atrus@atrus.org


var DrawTool=Monomyth.Class.extend({
	init:function(args){
		//canvas we're drawing on
		this.mainCanvas=args.svgCanvas;
		//zoom elements
		this.maxZoom=args.zoomMax?args.zoomMax:5;
		this.minZoom=args.zoomMin?args.zoomMin:1;
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
		this.startsize=args.startsize;
		this.cSrc=this.mainCanvas.attr("src");
		//creating vector drawer - mode is controlled by VD
		//MUST BE A RAPHAEL CANVAS OBJECT - raphael.org
		this.drawer=new VectorDrawer('s',this.initScale,[],this.startsize,this.mainCanvas);
		$("body").bind("changeShapeType",{obj:this},this.switchMode);
		this.active=true;
		$("body").bind("zoom",{obj:this},this.zoom);
		
		if(args.startshapes&&(args.startshapes.length>0)){
			this.shapesToLoad=args.startshapes;
			this.loadJSONShapes();
		}
	},
	toggle:function(mode){
		
		if(this.drawer&&this.active){
			switch(mode){
				case 'on':
					this.drawer._installOneShotHandlers();
					//$("body").bind("shapeCommit",{obj:this},this.shapeCommitHandle);
					break;
				case 'off':
					this.drawer._uninstallHandlers();
					//$("body").unbind("shapeCommit",this.shapeCommitHandle);
					break;
			}
			
		}
	},
	//gets call from Region Object
	drawerRemoveShapeHandle:function(e,id){
		var obj=e.data.obj;
		if(obj.drawer){
			obj.drawer.destroySingleShape(id);
			//reset drawer
			obj.drawer._installOneShotHandlers();
		}
	},
	loadJSONShapes:function(){
		//load the shapesToLoad variable into the VD drawer
		this.drawer.loadMasterObjList(this.shapesToLoad);
	},
	switchMode:function(e,type){
		if(e){
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
				case 'select':
					obj.drawer.drawMode('s');
					break;
				default:
					return false;
					break;
			}
		}else if(type=="select"){
			this.drawer.drawMode('s');
		}
	},
	switchImage:function(url){
		if(this.drawer){
			//unload all current shapes
		//	this.mainCanvas.trigger("prevPageShapes",[this.drawer.savable(),this.cSrc]);
			this.cSrc=url;
			//this.mainCanvas=img;
			this.drawer.changeOverElm({
				scale:(this.zoomLevel/this.maxZoom),
				startsize:[($("#srcImageForCanvas")[0].width),($("#srcImageForCanvas")[0].height)],
				url:url
			});
		}
	},
	zoom:function(e,val){
		var obj=e.data.obj;
		if((val>0)&&(obj.zoomLevel<obj.maxZoom)){
			obj.zoomLevel++;
			//var scale=obj.mainCanvas.width()/obj.storedWidth;
			obj.drawer.scale((obj.zoomLevel/obj.maxZoom));
		} else if((val<0)&&(obj.zoomLevel>obj.minZoom)){
			obj.zoomLevel--;
			obj.drawer.scale((obj.zoomLevel/obj.maxZoom));
		}
	},
	bundleData:function(){
		var jshps=[];
		var pval=["scale","x","y","width","height","cx","cy","rx","ry","points"];
		for(u in this.drawer._manifest){
			for(sh in this.drawer._manifest[u]){
				if(this.drawer._manifest[u][sh]){
					var x=this.drawer._manifest[u][sh];
					var xargs={"scale":1};
					$.map(pval,function(o,i){
						if(o in x){
						
							xargs[o]=x[o];
							
						}
					});
					
					jshps.push({'uid':x.id,'type':x.con,'points':xargs});
				}
			}
		}
		return jshps;
	},
	_killSession:function(){
		this.drawer._end();
	}
});
