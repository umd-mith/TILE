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
		this.json=(args.json)?args.json:false;
		this.schemaFile=null;
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
		this.Scroller=new AnimatedScroller({});
		//scroller events
		$("body").bind("switchImage",{obj:this},this.switchToImage);
		
		
		//load dialog boxes
		this.importDialog=new ImportDialog({
			loc:$("body")
		});
		
		this.imageDialog=new NewImageDialog({
			loc:$("body")
		});
		
		//JSON Reader
		this.jsonReader=new jsonReader({});
		
		//set global listeners
		$("body").bind("schemaFileImported",{obj:this},this.setSchemaData);
		$("body").bind("multiFileListImported",{obj:this},this.setMultiURL);
	//OLD: use ingestSchema, NEW: use jsonREader object
	//	$("body").bind("schemaLoaded",{obj:this},this.ingestSchema);
		$("body").bind("newImageAdded",{obj:this},this.addNewImage);
		$("body").bind("saveAllSettings",{obj:this},this.saveSettings);
	
		//tracking mouse to turn on/off images
		$(document).bind("mousemove",{obj:this},this.trackGlobalMouse);
		
		//if json data present, set up urls
		if(this.json){
			//parse data
		
			this.DOM.trigger("schemaLoaded",[this.json.schema]);
			this.DOM.trigger("multiFileListImported",[this.json.Images]);
		} else {
			this.DOM.trigger("openImport");
		}
		
	},
	loadCanvas:function(){
		this.mode="tagging";
		
		//load raphael canvas - for drawing shapes onto
		this.raphael=new RaphaelImage({
			loc:"images",
			maxZoom:5,
			minZoom:1
		});
		//load HTML canvas - for recognizing areas in images
		// this.canvasImage=new CanvasImage({
		// 			loc:"#images",
		// 			maxZoom:5,
		// 			minZoom:1
		// 		});
		// 		this.canvasImage.disable();
		
		//$("body").bind("tagging",{obj:this},this.switchToTagging);
		//$("body").bind("autorecognize",{obj:this},this.switchToAutoRecognition);
		this.imageLoaded=true;
		this.imagesON=true;
		
	},
	setCanvasURL:function(e,url){
		//called by ImportDialog
		//url must be a path to an image
		var obj=e.data.obj;
		obj.raphael.setUpCanvas(url);
		//obj.canvasImage.setUpCanvas(url);
	},
	setCurrentTag:function(e,id){
		//called by tabbar
		var obj=e.data.obj;
		
		obj.curTag=id;
		//obj.shapeToolBar.activateShapeBar();
	},
	//LOADING IN SCHEMA TAG RULES
	//@schema is {String} object representing filepath
	ingestSchema:function(e,schema){
		var obj=e.data.obj;
		if(!obj.schemaFile){
			obj.schemaFile=schema;
			//get the JSON data
			//url,data,function
			$.getJSON(obj.schemaFile,function(d){
				var b=[];
				//go through tag objects and create array of tags
				//and their rules
				$.each(d.tags,function(i,tag){
					b.push(tag.name);
					
				});
				
				$("body").trigger("tagRulesSet",[b]);
			});
			
		
			
		//	obj.Sidebar.initTags(a);
		}
	},
	// ***adding single image to canvas stack***
	// 	called by newImageDialog
	// 	
	addNewImage:function(e,data){
		var obj=e.data.obj;
		obj.raphael.addUrl([data]);
		//obj.canvasImage.addUrl([data]);
		obj.DOM.trigger("imageAdded");
	},
	// ***multiURL***
	// 	called by ImportDialog 
	// 	@path refers to file URI for loading multiple images in a set OR to a single image
	setMultiURL:function(e,path){
		var obj=e.data.obj;
		obj.DOM.trigger("closeImpD");
		if(/.jpg|.JPG|.gif|.GIF|.png|.PNG|.tif|.TIF/.test(path)){
			obj.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
			obj.Scroller.loadImages([{title:'unknown',uri:path,desc:'none'}]);
		} else {
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
		//	obj.canvasImage.addUrl(listarray);
			//update the scroller bar
			obj.Scroller.loadImages(obj.raphael.getUrlList());
		
			// if(obj.mode=="tagging") {
			// 			obj.raphael.showCurrentImage({data:{obj:obj.raphael}});
			// 		}
		}
		obj.DOM.trigger("imageAdded");
	},
	saveSettings:function(e){
		var obj=e.data.obj;
		var data=obj.raphael.bundleData();
		obj.DOM.trigger("dataReadyToSave",[data]);
	},
	switchToImage:function(e,data){
		var obj=e.data.obj;
		//@data is associative array
		if(obj.mode=="autorecognition"){
			obj.canvasImage.goToPage(data);
		} else if(obj.mode=="tagging"){
			obj.raphael.goToPage(data);
		}
		
	},
	// switchToTagging:function(e){
	// 		var obj=e.data.obj;
	// 		if(obj.mode=="autorecognition"){
	// 			obj.canvasImage.disable();
	// 			obj.raphael.enable();
	// 			obj.mode="tagging";
	// 		}
	// 		obj.DOM.trigger("imageAdded");
	// 	},
	// 	switchToAutoRecognition:function(e){
	// 		var obj=e.data.obj;
	// 		if(obj.mode=="tagging"){
	// 			obj.raphael.disable();
	// 		
	// 			obj.canvasImage.enable();
	// 			obj.mode="autorecognition";
	// 		}
	// 		obj.DOM.trigger("imageAdded");
	// 	},
	
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
	},
	trackGlobalMouse:function(e){
		var obj=e.data.obj;
		if(obj.imagesON) {
			var x=e.pageX;
			var y=e.pageY;
			if((x>=obj.Scroller.DOM.position().left)&&(y>=obj.Scroller.DOM.position().top)){
				obj.DOM.trigger("stopImageListening");
				obj.imagesON=false;
			}
		}
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
