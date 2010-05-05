/**
 * Contains the document.ready function for initiating 
 * all scripts
 * @param {Object} args
* args.autoRecognize = whether to set up for Auto Recognition (Defaults to Raphael canvas)
* args.attach = Where the objects HTML content will be attached
* args.URL = URL for the image to be tagged 
*args.json = JSON file that is optionally loaded in index.php
*args.baseurl = pre-defined _BASE_URL variable 
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
		this._base=args.baseurl;
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
		this.Scroller=new TileAnimatedScroller({});
		//scroller events
		$("body").bind("switchImage",{obj:this},this.switchToImage);
		
		
		//load new tags
		this.loadTags=new LoadTags({
			loc:$("body")
		});
		
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
		$("body").bind("schemaFileImported",{obj:this},this.ingestSchema);
		$("body").bind("multiFileListImported",{obj:this},this.setMultiURL);
		//OLD: use ingestSchema, NEW: use jsonReader object
		$("body").bind("newImageAdded",{obj:this},this.setMultiURL);
		$("body").bind("saveAllSettings",{obj:this},this.saveSettings);		
		//TODO:create restartALL procedure
		$("body").bind("restartAll",{obj:this},this.start_New_Session);
		
		//if json data present, set up urls
		if(this.json){
			//parse data
			var p=this.jsonReader.read(this.json);
			if(!p) window.location(".");
			$("body").bind("tagRulesSet",{obj:this},this.JSONLoad);
			this.DOM.trigger("schemaLoaded",[p]);
		} else {
			this.DOM.trigger("openImport");
		}
		
	},
	JSONLoad:function(e,r,p){
		var obj=e.data.obj;
		obj.loadJSONImages(p.Images);
	},
	loadCanvas:function(){
		this.mode="tagging";
		
		//load raphael canvas - for drawing shapes onto
		this.raphael=new RaphaelImage({
			loc:"images",
			maxZoom:5,
			minZoom:1,
			base:this._base
		});
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
		}
	},
	// ***adding single image to canvas stack***
	// 	called by newImageDialog
	// 	
	addNewImage:function(e,data){
		var obj=e.data.obj;
		obj.raphael.addUrl({uri:data});
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
			obj.Scroller.loadImages([path]);
		} else {
			var list=$.ajax({
				url:path,
				async:false,
				dataType:'text'
			}).responseText.replace(/\n+\s+/g,"").split(/,/);
			var listarray=[];
			var self=obj;
			jQuery.each(list,function(i,val){
				if(val){//getting rid of undefined types - BUG
					listarray.push({
						uri:self._base+val.replace(/^[\n\r]+/g,"")
					});
				}
			});
			
			obj.raphael.addUrl(listarray);
		//	obj.canvasImage.addUrl(listarray);
			//update the scroller bar
			obj.Scroller.loadImages(obj.raphael.getUrlList());
		}
		obj.DOM.trigger("imageAdded");
	},
	loadJSONImages:function(imgs){
		// var listarray=[];
		// 		var tagarray=[];
		// 		$.each(imgs,function(i,v){
		// 			listarray.push({
		// 				title:"",uri:v.uri,desc:"",tags:
		// 			});
		// 		});
		this.raphael.addUrl(imgs);
		this.Scroller.loadImages(this.raphael.getUrlList());
		
		this.SideBar.loadJSONTags(imgs,$("#srcImageForCanvas").attr("src"));
		this.DOM.trigger("imageAdded");
	},
	saveSettings:function(e){
		var obj=e.data.obj;
		var data=obj.raphael.bundleData();
		//ADD SCHEMA
		data.schema=obj.jsonReader.schemaFile;
		//fill in data.Tags section
		var v=obj.SideBar.bundleData();
		//put references to tags in the Images section
		for(i in v){
			for(img in data.Images){
				if(data.Images[img].uri==v[i].url){
					for(tg in v[i].tags){
						//add reference to the Image object
						data.Images[img].tags.push(v[i].tags[tg].uid);
						//add object to the Tags 
						data.Tags.push(v[i].tags[tg]);
					}
				}
			}
		}
		obj.DOM.trigger("dataReadyToSave",[JSON.stringify(data)]);
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
	start_New_Session:function(e){
		var obj=e.data.obj;
		//restart the entire session
		//erases images, tags, shapes
		obj.raphael._destroy();
	
		//open up import dialog 
		obj.DOM.trigger("openImport");
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
