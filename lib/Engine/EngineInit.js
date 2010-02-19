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
	 	/**this.image = new CanvasImage({
			url:this.startURL,
			loc:this.stage,
			width:1500,
			height:2000
		});
		this.image.setUpCanvas(this.startURL);**/
		this.image=$("#tehimahg");
		this.drawImage=new RaphaelImage({width:1500,height:1500,loc:this.stage});
		this.drawImage.setUpCanvas(this.image);
		//for testing
		this.setTestButtons();
		this.box=null;
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
		this.fireRect.appendTo($(".ColorBar"));
		this.fireRect.bind("click",{obj:this},function(e){
			$(this).trigger("drawrectangle");
		});
		
		this.fireEllipse=$("<button id=\"ellipsemebaby\" class=\"testcontrol\">Ellipse</button>");
		this.fireEllipse.appendTo($(".ColorBar"));
		this.fireEllipse.bind("click",{obj:this},function(e){
			$(this).trigger("drawellipse");
		});
		
		this.firePoly=$("<button id=\"polyponypocketpals\" class=\"testcontrol\">Freestyle Shape</button>");
		this.firePoly.appendTo($(".ColorBar"));
		this.firePoly.bind("click",{obj:this},function(e){
			$(this).trigger("drawpolygon");
		});
		
		this.moveLeft=$("<button class=\"testcontrol\"><-</button>");
		this.moveLeft.appendTo($(".ColorBar"));
		this.moveLeft.bind("click",{obj:this},function(e){
			$(this).trigger("move",["left",-1]);
		});
		
		this.moveRight=$("<button class=\"testcontrol\">-></button>");
		this.moveRight.appendTo($(".ColorBar"));
		this.moveRight.bind("click",{obj:this},function(e){
			$(this).trigger("move",["left",1]);
		});
		
		this.moveUp=$("<button class=\"testcontrol\">^</button>");
		this.moveUp.appendTo($(".ColorBar"));
		this.moveUp.bind("click",{obj:this},function(e){
			$(this).trigger("move",["top",-1]);
		});
		this.moveDown=$("<button class=\"testcontrol\">v</button>");
		this.moveDown.appendTo($(".ColorBar"));
		this.moveDown.bind("click",{obj:this},function(e){
			$(this).trigger("move",["top",1]);
		});
		
	}
});
