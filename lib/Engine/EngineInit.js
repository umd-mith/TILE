/**
 * Contains the document.ready function for initiating 
 * all scripts
 * @param {Object} args
* args.autoRecognize = whether to set up for Auto Recognition (Defaults to Raphael canvas)
* args.attach = Where the objects HTML content will be attached
* args.URL = URL for the image to be tagged 
*


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
		if(args.autoRecognize){
			this.setAutoRecognizer();
		} else {
			this.setUpTILE();
		}
	},
	setUpTILE:function(){
		//finishes the rest of init
		this.toolbarArea=$("#header");
		this.stage=$("#stage");
		this.ToolBar=new TILETopToolBar({
			loc:this.toolbarArea,
			position:'top'
		});
		
		//load the second toolbar - shapes, etc.
		this.ShapeToolBar=new TILESideToolBar({
			loc:"toolbar"
		});
		
		//load the sidebar
		this.SideBar=new TileTabBar({
			loc:"sidebar"
		});
		
		this.loadCanvas();
		
		//load the scroller
		this.Scroller=new TileScrollingImages({});
	},
	loadCanvas:function(){
		//load HTML canvas - for recognizing areas in images
		
		//load raphael canvas - for drawing shapes onto
		this.raphael=new RaphaelImage({
			loc:"images"
		});
		this.raphael.setUpCanvas('Images/ham.jpg');
	},
	setUpParts:function(){
		//finishes the rest of init
		this.toolbarArea=$("#header");
		this.stage=$("#stage");
		this.stage.addClass("mainStageBottom");
		this.ToolBar=new FullTopToolBar({
			loc:this.toolbarArea,
			position:'top'
		});
	 	this.image = new CanvasImage({
			url:this.startURL,
			loc:this.stage,
			width:1500,
			height:2000
		});
		this.image.setUpCanvas(this.startURL);
		this.image.deactivate();
		this.srcImage=$("#tehimahg");
		this.drawImage=new RaphaelImage({width:1500,height:1500,loc:this.stage});
		this.drawImage.setUpCanvas(this.srcImage);
		//for testing
		//this.setTestButtons();
		this.box=null;
		$("body").bind("makeBox",{obj:this},this.displayBox);
		$("body").bind("activateTextBar",{obj:this},this.setSideBar);
	},
	setAutoRecognizer:function(){
		//finishes the rest of init
		this.toolbarArea=$("#toolbar_container");
		this.stage=$("#stage");
		this.stage.addClass("mainStageRight");
		
		this.ToolBar=new AutoRecognizerTopToolBar({
			loc:this.toolbarArea
		});
	
		this.image = new CanvasImage({
			url:this.startURL,
			loc:this.stage,
			width:1500,
			height:2000
		});
		this.image.setUpCanvas(this.startURL);
		$("body").bind("makeBox",{obj:this},this.displayBox);
	},
	displayBox:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		if(!obj.box){
			obj.box=new SelectorBox({});
			obj.box.makeDrag();
			obj.image.DOM.append(obj.box.DOM);
			var canvasspot=obj.image.canvas.css("left");
			obj.box.DOM.css("left",canvasspot);
		}
		obj.box.DOM.show();
	},
	setSideBar:function(e){
		var obj=e.data.obj;
		obj.image.activate();
		obj.drawImage.deactivate();
		obj.SideBar.activate();
	}
});
