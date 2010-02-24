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
			this.setUpParts();
		}
	},
	setUpParts:function(){
		//finishes the rest of init
		this.toolbarArea=$("#toolbar_container");
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
		this.setTestButtons();
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
	setTestButtons:function(){
		this.fireRect=$("<button id=\"rectify\" class=\"testcontrol\">Rectangle</button>");
		this.fireRect.appendTo($(".ToolBar"));
		this.fireRect.bind("click",{obj:this},function(e){
			$(this).trigger("drawrectangle");
		});
		
		this.fireEllipse=$("<button id=\"ellipsemebaby\" class=\"testcontrol\">Ellipse</button>");
		this.fireEllipse.appendTo($(".ToolBar"));
		this.fireEllipse.bind("click",{obj:this},function(e){
			$(this).trigger("drawellipse");
		});
		
		this.firePoly=$("<button id=\"polyponypocketpals\" class=\"testcontrol\">Freestyle Shape</button>");
		this.firePoly.appendTo($(".ToolBar"));
		this.firePoly.bind("click",{obj:this},function(e){
			$(this).trigger("drawpolygon");
		});
		
		this.moveLeft=$("<button class=\"testcontrol\"><-</button>");
		this.moveLeft.appendTo($(".ToolBar"));
		this.moveLeft.bind("click",{obj:this},function(e){
			$(this).trigger("move",["left",-1]);
		});
		
		this.moveRight=$("<button class=\"testcontrol\">-></button>");
		this.moveRight.appendTo($(".ToolBar"));
		this.moveRight.bind("click",{obj:this},function(e){
			$(this).trigger("move",["left",1]);
		});
		
		this.moveUp=$("<button class=\"testcontrol\">^</button>");
		this.moveUp.appendTo($(".ToolBar"));
		this.moveUp.bind("click",{obj:this},function(e){
			$(this).trigger("move",["top",-1]);
		});
		this.moveDown=$("<button class=\"testcontrol\">v</button>");
		this.moveDown.appendTo($(".ToolBar"));
		this.moveDown.bind("click",{obj:this},function(e){
			$(this).trigger("move",["top",1]);
		});
		
	},
	setSideBar:function(e){
		var obj=e.data.obj;
		obj.image.activate();
		obj.drawImage.deactivate();
		obj.SideBar.activate();
	}
});
