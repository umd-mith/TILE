/**
Shape 

Created by: dreside

Object that houses a collection of dot coordinates taken from an HTML canvas
element.
Stores x,y coordinates and organizes dots from their left-right, bottom-top positions


**/

var Shape = Monomyth.Class.extend({
	init:function(args){
		this.coords=[];
		this.index=args.index;
		this.Top=args.initialTop;
		this.Right=0;
		this.Left=args.initialLeft;
		this.Bottom=0;
	},
	add: function(xy){
		//add new xy value to coords array
		this.coords.push(xy);
		var x =parseInt(xy.x.substring(1),10); 
		var y =parseInt(xy.y.substring(1),10); 
		//check to make sure greatest left,top,right,bottom points
		//are updated
		if (x < this.Left) {
			this.Left = x;
		}
		if (x > this.Right) {
			this.Right = x;
		}
		if (y > this.Bottom) {
			this.Bottom = y;
		}
		if (y < this.Top) {
			this.Top = y;
		}
	}
});