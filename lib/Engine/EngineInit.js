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
		this.loc=(args.attach)?args.attach:$("body");
		this.loc.html($.ajax({
			dataType:"text",
			url:"./lib/Engine/mainlayout.php",
			async:false
		}).responseText);
		this.DOM=$("#content");
		this.startURL=args.URL;
		
		this.setUpTILE();
	},
	setUpTILE:function(){
		
		//important variables
		this.imageLoaded=false;
		
		//finishes the rest of init
		this.toolbarArea=$("#header");
		this.stage=$("#stage");
		this.ToolBar=new TILETopToolBar({
			loc:this.toolbarArea,
			position:'top'
		});
		
		//load the second toolbar - shapes, etc.
		this.ShapeToolBar=new TILEShapeToolBar({
			loc:"toolbar"
		});
		
		//load the sidebar
		this.SideBar=new TileTabBar({
			loc:"sidebar"
		});
		
		this.loadCanvas();
		
		//load the scroller
		this.Scroller=new TileScrollingImages({});
		//scroller events
		$("body").bind("switchImage",{obj:this},this.switchToImage);
		
		
		//load dialog boxes
		this.importDialog=new ImportDialog({
			loc:$("body")
		});
		
		this.imageDialog=new NewImageDialog({
			loc:$("body")
		});
		
		$("body").bind("schemaFileImported",{obj:this},this.setSchemaData);
		$("body").bind("multiFileListImported",{obj:this},this.setMultiURL);
		$("body").bind("newImageImported",{obj:this},this.addNewImage);
		
	},
	loadCanvas:function(){
		this.mode="tagging";
		
		//load raphael canvas - for drawing shapes onto
		this.raphael=new RaphaelImage({
			loc:"images"
		});
		//load HTML canvas - for recognizing areas in images
		this.canvasImage=new CanvasImage({
			loc:"#images"
		});
		this.canvasImage.disable();
		$("body").bind("tagging",{obj:this},this.switchToTagging);
		$("body").bind("autorecognize",{obj:this},this.switchToAutoRecognition);
		this.imageLoaded=true;
	},
	setCanvasURL:function(e,url){
		//called by ImportDialog
		//url must be a path to an image
		var obj=e.data.obj;
		obj.raphael.setUpCanvas(url);
		obj.canvasImage.setUpCanvas(url);
	},
	// ***multiURL***
	// 	called by ImportDialog 
	// 	@path refers to file URI for loading multiple images in a set
	setMultiURL:function(e,path){
		var obj=e.data.obj;
		obj.DOM.trigger("closeImpD");
		var list=$.ajax({
			url:path,
			async:false,
			dataType:'text'
		}).responseText.split(/\t/);
		var listarray=[];
		jQuery.each(list,function(i,val){
			var temp=val.split(/,/);
			listarray.push({
				title:temp[0],uri:temp[1],desc:temp[2]
			});
		});
		obj.raphael.addUrl(listarray);
		obj.canvasImage.addUrl(listarray);
		//update the scroller bar
		obj.Scroller.loadImages(listarray);
		
		// if(obj.mode=="tagging") {
		// 			obj.raphael.showCurrentImage({data:{obj:obj.raphael}});
		// 		}
		obj.DOM.trigger("imageAdded");
	},
	switchToImage:function(e,data){
		var obj=e.data.obj;
		//@data is associative array
		if(obj.mode=="autorecognition"){
			obj.canvasImage.goToPage(data.uri);
		} else if(obj.mode=="tagging"){
			obj.raphael.goToPage(data.uri);
		}
		
	},
	switchToTagging:function(e){
		var obj=e.data.obj;
		if(obj.mode=="autorecognition"){
			obj.canvasImage.disable();
			obj.raphael.enable();
			obj.mode="tagging";
		}
		obj.DOM.trigger("imageAdded");
	},
	switchToAutoRecognition:function(e){
		var obj=e.data.obj;
		if(obj.mode=="tagging"){
			obj.raphael.disable();
		
			obj.canvasImage.enable();
			obj.mode="autorecognition";
		}
		obj.DOM.trigger("imageAdded");
	},
	// ***adding single image to canvas stack***
	// 	called by newImageDialog
	// 	
	addNewImage:function(e,data){
		var obj=e.data.obj;
		obj.raphael.addImage(data.uri);
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
	
	// deprecated function:
	// setAutoRecognizer:function(){
	// 		//finishes the rest of init
	// 		this.toolbarArea=$("#toolbar_container");
	// 		this.stage=$("#stage");
	// 		this.stage.addClass("mainStageRight");
	// 		
	// 		this.ToolBar=new AutoRecognizerTopToolBar({
	// 			loc:this.toolbarArea
	// 		});
	// 	
	// 		this.image = new CanvasImage({
	// 			url:this.startURL,
	// 			loc:this.stage,
	// 			width:1500,
	// 			height:2000
	// 		});
	// 		this.image.setUpCanvas(this.startURL);
	// 		$("body").bind("makeBox",{obj:this},this.displayBox);
	// 	},
});
