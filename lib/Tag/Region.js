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
		this.shapeId=date.getTime()+this.index.substring((this.index.length/3));
		this.anchor=false;
		
		var html="<li id=\"tagcoordslabel_"+this.index+"\" class=\"tagtype\">Coordinates:</li><li id=\"tagcoordsvalue_"+this.index+"\" class=\"tagvalue\"><span id=\"tagcoordstextoutput_"+this.index+"\">None</span></li>";
		args.loc.append(html);
		this.coordLabel=$("#tagcoordslabel_"+this.index);
		this.coordValue=$("#tagcoordsvalue_"+this.index);
		this.textOutput=$("#tagcoordstextoutput_"+this.index);
		
		$("body").bind(this.shape.shapeChangeCall,{obj:this},this.captureShapeData);
		
		if(args.initCoords){
			this.updateCoordText(args.initCoords);
		}
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
		for(el in coords){
			txt.append($("<li>"+el+": "+coords[el]+"</li>"));
		}		
		this.textOutput.html(txt);
	},
	destroy:function(i){	
		//this.shape.destroy();
		this.shape.destroy();
		this.coordLabel.trigger("drawerRemoveShape",[this.shape.id]);
		this.coordLabel.remove();
		this.coordValue.remove();
		return true;
	},
	reloadShape:function(img,svg){
		// if(this.shape){
		// 			this.shape.reInsert(img,svg);
		// 		}
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
		var jsonreg="{";
		jsonreg+="uid:"+this.shape.index+",type:"+this.shape.con+",points:["+this.textOutput.txt()+"]";
		jsonreg+="}";
		return jsonreg;
	}
	
});