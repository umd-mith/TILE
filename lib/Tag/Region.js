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