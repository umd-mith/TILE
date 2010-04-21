/***
Region Object

Stores data related to a Tag's region

**/

// @params
// name: String
// shape: SVGRect,SVGEllipse,SVGPolygon
var Region=Monomyth.Class.extend({
	init:function(args){
		if(!args.shape) throw "Error: Region created without a shape object";
		this.name=args.name;
		this.shape=args.shape;
	},
	destroy:function(){
		this.shape.destroy();
		
	}
});

var TagRegion=Region.extend({
	init:function(args){
		this.$super(args);
		this.shapeId=args.shapeId;

		this.anchor=false;
		
		var html="<li id=\"tagcoordslabel_"+this.shapeId+"\" class=\"tagtype\">Region Data:</li><li id=\"tagcoordsvalue_"+this.shapeId+"\" class=\"tagvalue\"><span id=\"tagcoordstextoutput_"+this.shapeId+"\">None</span></li>";
		args.loc.append(html);
		this.coordLabel=$("#tagcoordslabel_"+this.shapeId);
		this.coordValue=$("#tagcoordsvalue_"+this.shapeId);
		this.textOutput=$("#tagcoordstextoutput_"+this.shapeId);
		
		$("body").bind("shapeCoordUpdate"+this.shapeId,{obj:this},this.captureShapeData);
		
		if(this.shape.args) this.updateCoordText(this.shape);
	},
	captureShapeData:function(e,data){
		var obj=e.data.obj;
		if(!obj.anchor){
			obj.updateCoordText(data);
		}
	},
	updateCoordText:function(shape){
		//TODO:make separate shape outputs, instead of one universal output
		
		var txt=$("<ul></ul>");
		var m=[];
		
		switch(shape.con){
			case 'rect':
				m=$.map(["scale","width","height","x","y"],function(v){
					if(v in shape){
						txt.append($("<li>"+v+": "+shape[v]+"</li>"));
					}
				});
				break;
			case 'ellipse':
				m=$.map(["scale","cx","cy","rx","ry"],function(v){
					if(v in shape){
						txt.append($("<li>"+v+": "+shape[v]+"</li>"));
					}
				});
				break;
			case 'path':
				m=$.map(["scale","points"],function(v){
					if(v in shape){
						txt.append($("<li>"+v+": "+shape[v]+"</li>"));
					}
				});
				break;	
		}	
		this.textOutput.html(txt);
	},
	destroy:function(){	alert(this.shapeId);
		//this.coordLabel.trigger("drawerRemoveShape",[this.shape.id]);
		$("body").trigger("VD_REMOVESHAPE",[this.shapeId]);
		this.coordLabel.remove();
		this.coordValue.remove();
		
		return true;
	},
	listenOff:function(){
		//hide shape and turn off listeners
		$("body").trigger("shapeDisplayChange",["d",this.shapeId]);
		$('body').unbind("shapeCoordUpdate"+this.shapeId,this.captureShapeData);
	},
	listenOn:function(){
		$("body").trigger("shapeDisplayChange",["a",this.shapeId]);
		$('body').bind("shapeCoordUpdate"+this.shapeId,{obj:this},this.captureShapeData);
	},
	showcase:function(){
		// this.shape.activate();
		// 		$('body').unbind(this.shape.shapeChangeCall);
	},
	anchorOn:function(){
		this.anchor=true;
		$("body").trigger("shapeDisplayChange",["sa",this.shapeId]);
	},
	anchorOff:function(){
		this.anchor=false;
		$("body").trigger("shapeDisplayChange",["ra",this.shapeId]);
	},
	bundleData:function(){
		//produce json string of shape info
		var jsonreg={"uid":this.shape.id,"type":this.shape.con,"points":{"cx":null,"cy":null,"x":null,"y":null,"rx":null,"ry":null,"width":null,"height":null,"scale":null}};
		// var jsonreg="{";
		// 		jsonreg+="uid:"+this.shape.index+",type:"+this.shape.con+",points:[";
		var S=this.shape;
		var ps=["cx","cy","x","y","rx","ry","width","height","scale"];
		var points={};
		for(v in S){
			if($.inArray(v,ps)>-1){
				points[v]=S[v];
			}
		}
		jsonreg.points=points;
		//alert("jsonreg.points: "+jsonreg.points+" scale: "+jsonreg.points.scale+"  "+jsonreg.points.x);
		return jsonreg;
	}
});