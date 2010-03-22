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
		
		obj.updateCoordText(data);
	},
	updateCoordText:function(coords){
		var txt=$("<ul></ul>");
		for(el in coords){
			txt.append($("<li>"+el+": "+coords[el]+"</li>"));
		}		
		this.textOutput.html(txt);
	},
	destroy:function(i){
		if(i==this.shape.index){
			this.shape.destroy();
			this.coordLabel.remove();
			this.coordValue.remove();
			return true;
		} else {
			return false;
		}
	}
	
});