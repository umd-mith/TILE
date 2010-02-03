/**
 * Contains the document.ready function for initiating 
 * all scripts
 * @param {Object} args
 */

var EngineInit=Monomyth.Class.extend({
	init:function(args){
		this.ColorBar=new ColorBar({
			loc:$("body")
		});
	 	this.image = new CanvasImage({
			url:args.URL,
			loc:(args.attach)?args.attach:$("body"),
			width:1500,
			height:2000
		});
		
		this.box=null;
		$("body").bind("makeBox",{obj:this},this.displayBox);
		/**img.onload= function(){
		myImg = this;
		loadImage(this)};**/
	},
	displayBox:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		if(!obj.box){
			obj.box=new SelectorBox({});
			obj.box.makeDrag();
			obj.image.DOM.append(obj.box.DOM);
		}
		obj.box.DOM.show();
	}
});
