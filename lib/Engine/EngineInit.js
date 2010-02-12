/**
 * Contains the document.ready function for initiating 
 * all scripts
 * @param {Object} args
 */

var EngineInit=Monomyth.Class.extend({
	init:function(args){
		//get HTML from PHP script and attach to passed container
		this.DOM=(args.attach)?args.attach:$("body");
		this.DOM.html($.ajax({
			dataType:"text",
			url:"./lib/Engine/mainlayout.php",
			async:false
		}).responseText);
		this.startURL=args.URL;
		this.setUpParts();
	
	},
	setUpParts:function(){
		//finishes the rest of init
		this.toolbarArea=$("#toolbar_container");
		this.stage=$("#stage");
		
		this.ColorBar=new ColorBar({
			loc:this.toolbarArea
		});
	 	this.image = new CanvasImage({
			url:this.startURL,
			loc:this.stage,
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
