/**
 * 
 */

var Box=function(args){
	this.id=(Math.random(1,100)*100);
	this.id=this.id.toFixed(0);
	this.id="box"+this.id;
	this.DOM=new OpenLayers.Marker.Box(new OpenLayers.Bounds(0,155,0,155),"red",2);
	this.container=this.DOM.div;
	this.center=(args.center)?args.center:new OpenLayers.LonLat(0,0);
	
}
Box.prototype={
	
}
