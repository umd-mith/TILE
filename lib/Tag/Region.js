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
		this.index=args.htmlID;
		
		//create unique id for this shape
		var date=new Date();
		
		this.anchor=false;
		
		var html="<li id=\"tagcoordslabel_"+this.index+"\" class=\"tagtype\">Region Data:</li><li id=\"tagcoordsvalue_"+this.index+"\" class=\"tagvalue\"><span id=\"tagcoordstextoutput_"+this.index+"\">None</span></li>";
		args.loc.append(html);
		this.coordLabel=$("#tagcoordslabel_"+this.index);
		this.coordValue=$("#tagcoordsvalue_"+this.index);
		this.textOutput=$("#tagcoordstextoutput_"+this.index);
		
		$("body").bind(this.shape.shapeChangeCall,{obj:this},this.captureShapeData);
		
		this.updateCoordText(this.shape);
	},
	captureShapeData:function(e,data){
		var obj=e.data.obj;
		if(!obj.anchor){
			obj.updateCoordText(data);
		}
	},
	updateCoordText:function(coords){
		//TODO:make separate shape outputs, instead of one universal output
		
		var txt=$("<ul></ul>");
		var m=[];
		
		switch(this.shape.con){
			case 'rect':
				m=$.map(["scale","width","height","x","y"],function(v){
					if(v in coords){
						txt.append($("<li>"+v+": "+coords[v]+"</li>"));
					}
				});
				break;
			case 'ellipse':
				m=$.map(["scale","cx","cy","rx","ry"],function(v){
					if(v in coords){
						txt.append($("<li>"+v+": "+coords[v]+"</li>"));
					}
				});
				break;
			case 'path':
				m=$.map(["scale","points"],function(v){
					if(v in coords){
						txt.append($("<li>"+v+": "+coords[v]+"</li>"));
					}
				});
				break;	
		}	
		this.textOutput.html(txt);
	},
	destroy:function(i){	
		//this.coordLabel.trigger("drawerRemoveShape",[this.shape.id]);
		$("body").trigger("VD_REMOVESHAPE",[this.shape.id]);
		this.coordLabel.remove();
		this.coordValue.remove();
		
		return true;
	},
	listenOff:function(){
		//hide shape and turn off listeners
		this.shape.deactivate();
		$('body').unbind(this.shape.shapeChangeCall,this.captureShapeData);
	},
	listenOn:function(){
		this.shape.activate();
		$('body').bind(this.shape.shapeChangeCall,{obj:this},this.captureShapeData);
	},
	showcase:function(){
		this.shape.activate();
		$('body').unbind(this.shape.shapeChangeCall);
	},
	anchorOn:function(){
		this.anchor=true;
		this.shape.setAnchor();
	},
	anchorOff:function(){
		this.anchor=false;
		
		this.shape.releaseAnchor();
	},
	bundleData:function(){
		//produce json string of shape info
		var jsonreg={"uid":this.shape.index,"type":this.shape.con,"points":{"width":null,"height":null}};
		// var jsonreg="{";
		// 		jsonreg+="uid:"+this.shape.index+",type:"+this.shape.con+",points:[";
		for(p in this.shape.args){
			jsonreg[p]=this.shape.args[p];
			//jsonreg+="\""+p+"\":"+(typeof this.shape.args[p]=="string")?"\""+this.shape.args[p]+"\"":this.shape.args[p];
		}
		// jsonreg+="]}";
		return jsonreg;
	}
});