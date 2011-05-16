// Image Tagger : A plugin tool for TILE
// developed by grantd 
// Takes a JSON object representing the pages in a particular session, puts each
// url in a SVG Canvas and applies the VectorDrawer program to that image

// Objects:
// ITag (Main engine)
// ImageList
// TILEShapeToolBar
// RaphaelImage
// Shape
// AutoRecLine

// NOTE: Shapes are loaded into RaphaelCanvas by use of the loadItems Custom Event
// Example: $("body:first").trigger("loadItems",[{Object} arrayOfShapesOrItems]);


//Shape Constants
var SHAPE_ATTRS={"stroke-width": "1px", "stroke": "#a12fae"};

(function($){
	
	var ITag=this;
	/////constructor for ITag - loads all elements for ImageTagger
	// init(args) : takes args, which contains: {
		// loc: string representing ID of DOM object to attach to
		// base : string representing HTTP location of images
		// json : optional JSON object to pass as main source of images
			// layout : JSON retrieved from imagetagger.json
		// }

	var _Itag=function(args){
		this.loc=args.loc;
		// this._base=args.base;
		this.schemaFile=null;
		var self=this;
		this.JSONlist=(args.json||null);
		self.curURL=null;
		// if(!args.layout) throw "ERROR in setting up imagetagger";
		// this.html=args.layout;
		//pre-load the initial html content into loc area - needs .az.inner
		//to be visible
		self.htmlContent="<div id=\"raphworkspace_\" class=\"workspace\"></div>";
		self.htmlToolbar="<ul class=\"menuitem pluginTitle\">Image Tagger</ul><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"pointer\" class=\"btnIconLarge inactive\" title=\"Select\"></a></li></ul><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"rect\" class=\"btnIconLarge inactive\" title=\"Rectangle\"></a></li>"+
			"<li><a href=\"#\" id=\"poly\" class=\"btnIconLarge inactive\" title=\"Polygon\"></a></li>"+
			"<li><a href=\"#\" id=\"elli\" class=\"btnIconLarge inactive\"  title=\"Ellipse\"></a></li>"+
			"</ul><ul class=\"menuitem\"><li><a href=\"#\" id=\"zoomIn\" class=\"btnIconLarge\" title=\"Zoom In\"></a></li>"+
			"<li><a href=\"#\" id=\"zoomOut\" class=\"btnIconLarge\" title=\"Zoom Out\"></a></li></ul><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"pgPrev\" class=\"button\" title=\"Go One Image Back\">Prev</a></li><li><a href=\"#\" id=\"pgNext\" class=\"button\" title=\"Go One Image Forward\">Next</a></li>"+
			"<li><a class=\"button\" title=\"See a List of All Images\"><span id=\"listView\" class=\"listView\">List view</span></a></li></ul>";
		// $("#azcontentarea > .az.inner:eq(0)").append("<div class=\"workspace\"></div>");
		// attach toolbar buttons
		// $("#azcontentarea > .az.inner:eq(0) > .toolbar").append("<ul class=\"menuitem\">"+
		// 			"<li><a href=\"#\" id=\"pointer\" class=\"btnIconLarge inactive\" title=\"Select\"></a></li></ul><ul class=\"menuitem\">"+
		// 			"<li><a href=\"#\" id=\"rect\" class=\"btnIconLarge inactive\" title=\"Rectangle\"></a></li>"+
		// 			"<li><a href=\"#\" id=\"poly\" class=\"btnIconLarge inactive\" title=\"Polygon\"></a></li>"+
		// 			"<li><a href=\"#\" id=\"elli\" class=\"btnIconLarge inactive\"  title=\"Ellipse\"></a></li>"+
		// 			"</ul><ul class=\"menuitem\"><li><a href=\"#\" id=\"zoomIn\" class=\"btnIconLarge\" title=\"Zoom In\"></a></li>"+
		// 			"<li><a href=\"#\" id=\"zoomOut\" class=\"btnIconLarge\" title=\"Zoom Out\"></a></li></ul><ul class=\"menuitem\">"+
		// 			"<li><a href=\"#\" id=\"pgPrev\" class=\"button\" title=\"Go One Image Back\">Prev</a></li><li><a href=\"#\" id=\"pgNext\" class=\"button\" title=\"Go One Image Forward\">Next</a></li>"+
		// 			"<li><a class=\"button\" title=\"See a List of All Images\"><span id=\"listView\" class=\"listView\">List view</span></a></li></ul>");
		// attach id to toolbar
		// $("#azcontentarea > .az.inner:eq(0) > .toolbar").attr('id',"_raphshapebar");
		//global bind for when the VectorDrawer in raphaelImage is completed
		$("body").live("VDCanvasDONE",{obj:this},this.createShapeToolBar);
		//received from ImportDialog box
		// if(!this.JSONlist)	$("body").bind("loadImageList",{obj:this},this.ingestImages);
		//global bind relating to the event passed by ImageList
		// $("body").bind("switchImage",{obj:this},this.switchImageHandler);
		//global bind for when user adds a new image through NewImageDialog
		$("body").bind("newImageAdded",{obj:this},this.addNewImage);
		//global bind for when user clicks on the ShapeToolBar button 'imagelist'
		// $("body").bind("showImageList",{obj:this},this.showImageList);
		//this.jsonReader=new jsonReader({});
		//get JSON html data
		// $.ajax({
		// 			dataType:'json',
		// 			url:'lib/JSONHTML/imagetagger.json',
		// 			success:function(j){
		// 				//j is json data
		// 				self.setHTML(j);
		// 			}
		// 		});
		// self.setHTML();
	};
	_Itag.prototype={
	
		//receives a JSON string that will be used 
		//as a map of images and other data
		// e : {Event}
		// manifest : {Object} - JSON object that has all of the images in this session
		ingestImages:function(e,manifest){
			var obj=e.data.obj;
			//send image file data to canvas
			obj.raphael.setNewManifest(manifest);
			$("body:first").trigger("imageAdded");
		},
		// Sets up the HTML for this object. Creates RaphaelImage
		// html : {Object} - JSON object derived from imagetagger.json
		setHTML:function(){
			//html is JSON data
			var self=this;
			
			//setup the raphael div - give it a unique ID so that RaphaelImage can find it using Jquery
			
			//create raphael - Raphael Canvas that is used for drawing
			//this object initiates VectorDrawer
			self.raphael=new RaphaelImage({
				loc:"raphworkspace_",
				maxZoom:5,
				minZoom:1,
				url:[],
				canvasAreaId:"raphael"
			});
			
			//VDCanvasDONE called - initiates createShapeToolBar() 
			self.imageLoaded=true;
			self.imagesON=true;
			//create IMageList to display all given images in this set
			//activated by ShapeToolBar's showImgList event call
			self.imageList=new ImageList({
				
				loc:self.loc
			});
			
		
			// if(self.JSONlist){
			// 				self.raphael.addUrl(self.JSONlist);
			// 			
			// 				$("body").trigger("imageAdded");
			// 			}
			
		},
		// takes passed variable and passes to raphael canvas
		updateData:function(obj){
			var self=this;
			self.raphael.updateShape(obj.obj);
		},
		// sets the JSONlist to data
		addImages:function(data){
			var self=this;
			
			self.JSONlist=data;
			self.raphael.setNewManifest(self.JSONlist);
			$("body").trigger("imageAdded");
			
		},
		//called once the VectorDrawer makes its first build
		//activated by VDCanvasDONE event call
		// e : {Event}
		createShapeToolBar:function(e){
			var obj=e.data.obj; //@this
			$("body").unbind("VDCanvasDONE",obj.createShapeToolBar); //remove the bind - done only once

			//prepare the toolbar area
			$("#azcontentarea > .az.inner.imageannotation > .toolbar").attr("id","raphshapebar_");
			
			//load the second toolbar - shapes, etc.
			obj.ShapeToolBar=new TILEShapeToolBar({
				loc:"raphshapebar_",
				htmlready:true
			});
			// now that shapetoolbar is created, we can:
			//figure out the image dimensions for canvas area
			var w=$("#"+obj.loc).width();
			var h=$("#"+obj.loc).height()-obj.ShapeToolBar.DOM.height();
			$("#"+obj.loc+" > .az.inner > .workspace").width(w).height(h);
			
			// attach id to .az.inner of toolbar
			$("#az_log > .az.inner:eq(0)").attr("id","az_transcript_area");
		},
		//initiated once user adds a new image
		// triggered by 'newImageAdded' event
		// e : {Event}
		// path : {String} - path to the image
		addNewImage:function(e,path){
			if(e){
				var obj=e.data.obj;
				$("body").trigger("closeImpD");
				if(/\.jpg$|\.JPG$|\.gif$|\.GIF$|\.png$|\.PNG$|\.tif$|\.TIF$/.test(path)){
					obj.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					//obj.Scroller.loadImages([path]);
					$("body").trigger("imageAdded");
				} else if(/\.txt$/.test(path)){
					
					var list=$.ajax({
						url:path,
						async:false,
						dataType:'text'
					}).responseText;
					listarray = JSON.parse(list);
					var self=obj;
					obj.raphael.addUrl(list);
					
					//UPDATE THE TILE_LOGBAR URL LIST
					if(URL_LIST) URL_LIST=listarray;
					$("body").trigger("imageAdded");
				} else {
					//path = json object
					obj.raphael.addUrl(path);
				}
			} else {
				var self=this;
				$("body").trigger("closeImpD");
				if(/\.jpg$|\.JPG$|\.gif$|\.GIF$|\.png$|\.PNG$|\.tif$|\.TIF$/gi.test(path)){
					self.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					$("body").trigger("imageAdded");
				} else if(/\.txt$/.test(path)){
					var list=$.ajax({
						url:path,
						async:false,
						dataType:'text'
					}).responseText;
					var listarray=[];
					
					listarray = eval(list);	
					
					self.raphael.addUrl(listarray);
				
					//update the scroller bar
					//if(self.Scroller) self.Scroller.loadImages(self.raphael.getUrlList());
					$("body").trigger("imageAdded");
				} else {
					self.raphael.addUrl(path);
					//$("body").trigger("openNewImage");
				}
			}
		},
		//called by switchImage custom event
		// url : {String} representing the sent image url from imageList
		switchImageHandler:function(e,url){
			var obj=e.data.obj;
			//find pagenumber related to URL
			obj.raphael.goToPage(url);
		},
		//activates the imageList
		// receives array of images to display in image viewer
		// images : Array
		showImageList:function(images){
			// var obj = e.data.obj;
			this.imageList.show(images);
		},
		inputData:function(ref,obj){
			var self=this;
			self.raphael._addLinkHandle(ref,obj);
		},
		getLink:function(){
			// only outputs - doesn't provide link metadata
			return false;
		},
		addNewShapesToStack:function(shape){
			var self=this;
			if(__v) console.log('addNewShapesToStack: '+JSON.stringify(shape));
			if(self.raphael){
				if($.inArray(shape.id,self.raphael.shapeIds)<0){
					self.raphael.shapeIds.push(shape.id);
					self.raphael.manifest.push(shape);
				} 
			}
		},
		loadNewShapes:function(shapes){
			var self=this;
			if(self.ShapeToolBar){
				if((shapes.length==0)){
					// activate rectangle
					$("ul > li > #rect").click();
				} else if(shapes.length>0) {
					$("ul > li > #pointer").click();
				}
			}
			if(self.raphael) self.raphael.loadShapes(shapes);
		},
		eraseAllShapes:function(){
			var self=this;
			
			if(self.raphael){
				self.raphael.shapeIds=[];
				self.raphael.manifest=[];
			}
		},
		setImage:function(){
			var self=this;
			self.raphael.setUpCanvas(self.curURL);
		},
		// called once the plugin has been constructed by TILE_ENGINE,
		// then is being called again (re-attaches listeners and 
		// re-attaches DOM objects)
		// json : {Object} - JSON data with new shape information
		_restart:function(json){
			var self=this;
			//self.DOM.show();
			//reset the toolbar
			// $("#pgNext").click(function(e){
			// 				e.preventDefault();
			// 				$(this).trigger("turnPage",[1]);
			// 			});
			// 			$("#pgPrev").click(function(e){
			// 				e.preventDefault();
			// 				$(this).trigger("turnPage",[-1]);
			// 			});
			// $("#listView").parent().click(function(e){
			// 				e.preventDefault();
			// 				$(this).trigger("showImageList");
			// 			});
			// $("body:first").trigger("closeDownVD",[false]);
			
			// if(json){
			// 				// parse data
			// 				// data comes in format json.data.lines, which represent lines
			// 				// find shapes inside each line, then add them to shps array
			// 				var shps=[];
			// 				for(var j in json.shapes){
			// 					if(json.shapes[j]) shps.push(json.shapes[j]);
			// 				}
			// 			}
			self.curURL=TILE.url;
			
			// send off parsed array to the drawing canvas
			if(self.raphael) self.raphael._restart(json,self.curURL);
		},
		// called when image tagger is being hidden 
		_closeDown:function(){
			var self=this;
			
			$("body:first").trigger("closeDownVD",[true]);
			self.raphael._closeOut();
		},
		
		// saves all of the image_tagger data as JSON and returns it
		bundleData:function(){
			var self=this;
			var j=self.raphael.bundleData();
			return j;
		}
	};
	ITag._Itag=_Itag;

	/**
	ImageList
	**/
	// Displays images in a given session
	// 
	// Has its own JSON data that includes HTML 
	// mirrors HTML of ImageTagger toolbar and canvas container 
	
	/*
	Usage: 
	new ImageList({loc:{String},html:{String from JSON data}});
	
	*/
	var ImageList=function(args){
		//constructor
		var self=this;
		self.loc=args.loc;
		$("<div class=\"az inner textImageList\"><div class=\"toolbar\"><ul class=\"menuitem\">"+
		"<li><a href=\"#\" id=\"pointer\" class=\"btnIconLarge inactive\"></a></li></ul>"+
		"<ul class=\"menuitem\"><li><a href=\"#\" id=\"rect\" class=\"btnIconLarge inactive\"></a></li>"+
		"<li><a href=\"#\" id=\"poly\" class=\"btnIconLarge inactive\"></a></li><li>"+
		"<a href=\"#\" id=\"elli\" class=\"btnIconLarge inactive\"></a></li><li id=\"customWidget\">"+
		"<div id=\"colorSelector2\" class=\"btnIconLarge inactive\"><div id=\"colorSelectorBkgd\" style=\"background-color: #ff0000\"></div>"+
		"</div><div id=\"colorpickerHolder2\"></div></li></ul><ul class=\"menuitem\"><li>"+
		"<a href=\"#\" id=\"zoomIn\" class=\"btnIconLarge inactive\"></a></li><li><a href=\"#\" id=\"zoomOut\" class=\"btnIconLarge inactive\"></a>"+
		"</li></ul><ul class=\"menuitem\"><li><a href=\"#\" id=\"pgPrev\" class=\"button inactive\">Prev</a></li>"+
		"<li><a href=\"#\" id=\"pgNext\" class=\"button inactive\">Next</a></li><li><a href=\"#\" class=\"button\" title=\"Go Back to the Image Tagger Canvas\">"+
		"<span class=\"imgView\">Img view</span></a></li></ul></div><div class=\"list az\"><ul></ul></div><div class=\"image\"><img src=\"\"></div>").appendTo("#azcontentarea");
		
		$(".az.inner.textImageList").hide();
	};
	ImageList.prototype={
		//Displays the imagelist - loads HTML if not already loaded
		//@data: {Object} with uris and info on image(s)
		show:function(data){
			var self=this;
			$(".ui-dialog").hide();
			if ($("#textImageList").length > 0) {
				$("#textImageList").remove();
			}
			
			$("#azcontentarea > div.az.inner").hide();
			$(".az.inner.textImageList").show();
			// $(".az.inner.textImageList > .toolbar > ul > #imgNameDisplay").text($("#srcImageForCanvas").attr('src'));
			$(".az.inner.textImageList > .list > ul").empty();
			// For each page item in the JSON data, create a separate
			// title listing for that item
			for (var i=0;i<data.length;i++){
				 $("<li><a href='"+data[i]+"'>"+data[i]+"<\/a></li>").appendTo(".az.inner.textImageList > .list > ul");	
			}
			//Mouseover: Show Image to the right of list of titles
			$(".az.inner.textImageList > .list > ul > li > a").mouseover(function(e){
				var w=$(".az.inner.textImageList > .image").width()-10;
				uri = ($(this).attr("href"));
				
				$(".az.inner.textImageList > .image").html("<img src='"+uri+"' width=\""+w+"\">");
			}).click(function(e){
				//Mouse click: turn off ImageList and go to the image in 
				// image tagger
				e.preventDefault();
				uri = ($(this).attr("href"));
				//change the image we're looking at in canvas				
				$("body").trigger("switchImage",[uri]);
				//go back to canvas
				$("#"+self.loc+" > .az.inner.textImageList").hide();
				// display the image tagger area
				$("#azcontentarea > div.az.inner:eq(0)").show();
			});
			$(".az.inner.textImageList > .toolbar > ul.menuitem > li > a > span.imgView").click(function(e){
				e.preventDefault();
				//go back without changing the image 
				$("#"+self.loc+" > .az.inner.textImageList").hide();
				$(".ui-dialog").hide();
				// show the imagetagger area
				$("#azcontentarea > div.az.inner:eq(0)").show();
			});
		}
	};
	
	//ShapeToolBar
	/**Secondary toolbar for the TILE interface - 
	holds buttons for shape commands (rect, elli, poly, select)
	All,Current,None view settings
	Zoom Controls
	Next/Prev Page  
	
	Usage: 
	new TILEShapeToolBar({loc:{String}})
	
	Contains own JSON section in imagetagger.json
	
	**/
	var TILEShapeToolBar=function(args){
		// Constructor
			// this.$super(args);
			this.DOM=$("#"+args.loc);
			var self=this;
			//Define Area elements
			//Rectangle
			this.rect=$("#rect");
			this.rect.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#poly").removeClass("active");
					$("#elli").removeClass("active");
					$("#pointer").removeClass("active");
					self.shapeType='r';
					$(this).trigger("changeShapeType",['r']);
				}
			});
			//Polygon
			this.poly=$("#poly");
			this.poly.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#rect").removeClass("active");
					$("#elli").removeClass("active");
					$("#pointer").removeClass("active");
					self.shapeType='p';
					$(this).trigger("changeShapeType",['p']);
				}
			});
			//Ellipse
			this.elli=$("#elli");
			this.elli.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#rect").removeClass("active");
					$("#poly").removeClass("active");
					$("#pointer").removeClass("active");
					self.shapeType='e';
					$(this).trigger("changeShapeType",['e']);
				}
			});
			//select tool is only for when user wants to select shapes
			this.sel=$("#pointer");
			this.sel.click(function(e){
				if(!$(this).hasClass("active")){
					$("#rect").removeClass("active");
					$("#poly").removeClass("active");
					$("#elli").removeClass("active");
					self.shapeType='s';
					$(this).addClass("active");
					$(this).trigger("changeShapeType",['s']);
				}
			});
			//set up shape area- initially set to Rectangle
			// this is the default shape for VectorDrawer, too
			this.shapeType="r";
			//Delete Shape Area
			this.delShape=$("#areaDel");
			this.delShape.click(function(e){
				if(!$(this).hasClass("inactive")){
					$(this).trigger("deleteCurrentShape");
				}
			});
			//Zoom area situation
			this.zoomIn=$("#zoomIn");
			this.zoomIn.click(function(e){
				$("body:first").trigger("zoom",[1]);
			});
			this.zoomOut=$("#zoomOut");
			this.zoomOut.click(function(e){
				$("body:first").trigger("zoom",[-1]);
			});
			
			//Page changers
			this.pageNext=$("#pgNext");
			this.pageNext.live('click',function(e){
				$(this).trigger("turnPage",[1]);
			});
			this.pagePrev=$("#pgPrev");
			this.pagePrev.live('click',function(e){
				$(this).trigger("turnPage",[-1]);
			});
			//image list
			$("#listView").parent().click(function(e){
				$(this).trigger("showImageList");
			});

			//adding new tags controls
			this._tagChoices=$("#addATag");
			this._tagChoices.click(function(e){
				$(this).trigger("loadNewTag");
			});
			
			//attach listener for imageLoaded
			$("body").bind("activateShapeBar",{obj:this},this.activateShapeBar);
			$("body").bind("deactivateShapeBar",{obj:this},this.deactivateShapeBar);
			// $("body").bind("activateShapeDelete",{obj:this},this.shapeSet);
			// $("body").bind("deactivateShapeDelete",{obj:this},this.shapeUnSet);
			$("body").bind("turnOffShapeBar",{obj:this},this.turnOffShapeBar);
			// global bind for when loadItems is called
			$("body").bind("loadItems",function(e,data){
				// if there are no items, set controls to draw shapes
				// otherwise, set to pointer
				if(data.length==0){
					if(!$("#rect").hasClass("active")) $("#rect").addClass("active");
					$("#elli").removeClass("active");
					$("#poly").removeClass("active");
					$("#pointer").removeClass("active");
					self.shapeType='r';
					$(this).trigger("changeShapeType",['r']);
					
				} else {
					if(!$("#pointer").hasClass("active")) $("#pointer").addClass("active");
					$("#elli").removeClass("active");
					$("#poly").removeClass("active");
					$("#rect").removeClass("active");
					self.shapeType='s';
					$(this).trigger("changeShapeType",['s']);
					
				}
			});	
			//$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			//local listener
			
			//initiate
			this.activateShapeBar();
		};
	TILEShapeToolBar.prototype={
		// called either remotely ("ActivateShapeBar" event) or locally
		// sets all shape choices to inactive, then checks what the current shape
		// type is and activates that shape choice changes DOM styles
		// e : {Event}
		activateShapeBar:function(e){
			//user has no shape committed to the tag, turn on shape choices 
			if(e){
				var obj=e.data.obj;

				obj.rect.removeClass("inactive");
				obj.sel.removeClass("inactive");
				obj.poly.removeClass("inactive");
				obj.elli.removeClass("inactive");
				switch(obj.shapeType){
					case 'r':
						obj.rect.addClass('active');
						break;
					case 'e':
						obj.elli.addClass("active");
						break;
					case 'p':
						obj.poly.addClass("active");
						break;
					case 's':
						obj.sel.addClass("active");
						break;
				}
				obj.DOM.trigger("changeShapeType",[obj.shapeType]);
				// $("#colorSelector2").removeClass("inactive");
				if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
			} else {

				this.rect.removeClass("inactive");
				this.poly.removeClass("inactive");
				this.elli.removeClass("inactive");
				this.sel.removeClass("inactive");
				switch(this.shapeType){
					case 'r':
						this.rect.addClass('active');
						break;
					case 'e':
						this.elli.addClass("active");
						break;
					case 'p':
						this.poly.addClass("active");
						break;
					case 's':
						this.sel.addClass("active");
						break;
				};
				this.rect.trigger("changeShapeType",[this.shapeType]);
				// $("#colorSelector2").removeClass("inactive");
				if(!this.delShape.hasClass("inactive")) this.delShape.addClass("inactive");
			}
		},
		// called either remotely ("DeActivateShapeBar" event) or locally
		// sets all shape choices to inactive
		// e : {Event}
		deactivateShapeBar:function(e){
			if(e){
				var obj=e.data.obj;
				//attach listener for imageLoaded

			//	if(obj.rect.hasClass("active")){obj.rect.removeClass("active");obj.shapeType="rect";}
				obj.rect.removeClass("active").addClass("inactive");
			//	if(obj.poly.hasClass("active")){obj.poly.removeClass("active");obj.shapeType="poly";}
				obj.poly.removeClass("active").addClass("inactive");
			//	if(obj.elli.hasClass("active")){obj.elli.removeClass("active");obj.shapeType="elli";}
				obj.elli.removeClass("active").addClass("inactive");
				// $("#colorSelector2").addClass("inactive");
			} else {

				//attach listener for imageLoaded
				this.rect.addClass("inactive");
				if(this.rect.hasClass("active")){
					this.rect.removeClass("active");
					this.shapeType="rect";
				}
				this.poly.addClass("inactive");
				if(this.poly.hasClass("active")){
					this.poly.removeClass("active");
					this.shapeType="poly";
				}
				this.elli.addClass("inactive");
				if(this.elli.hasClass("active")){
					this.elli.removeClass("active");
					this.shapeType="elli";
				}
				// $("#colorSelector2").addClass("inactive");
			}
		},
		// Sets all the classes for buttons and tools in the toolbar to inactive
		// Called by 'turnOffShapeBar' event
		// e : {Event}
		turnOffShapeBar:function(e){
			var obj=e.data.obj;
			if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
			if(!obj.rect.hasClass("inactive")) obj.deactivateShapeBar();
			//tell vectordrawer to stop drawing
			obj.DOM.trigger("stopDrawing");
		}
	};
	
	/**
	RaphaelImage

	Using the same features as CanvasImage 
	Using RaphaelJS library for creating a Raphael canvas 

	**USES SVG
	
	new RaphaelImage({loc:{String}})
	
	loc: {String} - Id for parent DOM
	**/

	var RaphaelImage=function(args){
		var self=this;
		//create UID
		var d=new Date();
		this.uid="image_"+d.getTime("hours");

		//url is actually an array of image values
		this.url=(typeof args.url=="object")?args.url:[args.url];
		
		if(args.loc){
			this.loc=args.loc;
			//set to specified width and height
			if(args.width) this.DOM.width(args.width);
			if(args.height) this.DOM.height(args.height);
		}
		this.loc=$("#"+args.loc);
		this.loc.append($("<div id=\"raphael\"><img id=\"srcImageForCanvas\" src=\"\"/></div>"));
		this.DOM=$("#raphael").css({'z-index':'1000'});
		//this.DOM.width(this.DOM.parent().width()).height(this.DOM.parent().height());
		this.srcImage=$("#srcImageForCanvas");
		this.canvasAreaId=args.canvasAreaId;
		
		// zoom decrease factor
		this.zoomDF=0.9;
		// zoom increase factor
		this.zoomIF=1.1;
		
		//master array
		this.manifest=[];
		this.curUrl=null;
		this._imgScale=1;
		//array holding shapes, their data, and what tag they relate to
		this.tagData=[];
		this.curTag=null;
		// keep track of how many zooms have been done
		this.zoomTimes=0;
		//type of shape to draw (changes through setShapetype call)
		this.shapeType='rect';
		//raphael canvas holder
		this.canvasObj=null;
		this.image=null;
		this.drawMode=false;
		this.currShape=0;
		this.currShapeColor=args.shapeColor?args.shapeColor:"#FF0000";
		this.pageNum=0;
		//for creating random values for shapes
		this.dateRand=new Date();
		this.startShapes=null;
		this.shapeIds=[];
		this._loadPage=$("<div class=\"loadPage\" style=\"width:100%;height:100%;\"><img src=\"skins/columns/images/tileload.gif\"/></div>");
		//global listeners
		// $("body").bind("RaphaelImageReady",{obj:this},this.finishCanvas);
		// $("body").bind("turnPage",{obj:this},this.showImg);
		$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
		// $("body").bind("prevPageShapes",{obj:this},this.updateManifestShapes);
		
		self.containerSize={'x':0,'y':0};
		// self.containerOffset={'x':0,'y':0};
		// global bind to window to make sure that canvas area is correctly synched w/ 
		// window size
		$(window).resize(function(e){
			if($("#raphworkspace_").length){
				// adjust width
				
				$("#raphworkspace_").width($("#azcontentarea > .az.inner").innerWidth());
				diff=$("#azcontentarea > .az.inner > .toolbar").innerHeight();
				$("#raphworkspace_").height($("#azcontentarea > .az.inner").innerHeight()-diff);
				
				// figure out offset
				
			}
		});
	
			
	};
	RaphaelImage.prototype={
		//gets a new manifest and uses this as the new manifest
		// manifest : {Object}
		setNewManifest:function(manifest){
			var self=this;
			self.manifest=manifest;
			self.url=[];
			for(key in self.manifest){
				
				self.url.push(self.manifest[key]);
				 
			}
			self.addUrl(manifest);
		},
		// @url can be a single string or an array of string values
		//url is {array} with each element being in this format:
		//{uri:{String}}
		addUrl:function(url){
			// if(url.shapes) this.startShapes=url.shapes;
			// 			if(url.images) url=url.images;
			if((url!=null)){
				//is an array - process array
			
				for(u in url){
					//if not already present in array, add image to url list
					//and to the master array
					if(!url[u].url) continue;
					var cu=(url[u].uri||url[u].url);
					var lines=(url[u].lines)?url[u].lines:[];
					if((cu.length>1)&&(!(/php$|PHP$|js$|JS$/.test(cu)))&&(url[u].url)){
						//var cleanurl=url[u].uri.replace(/^[A-Za-z0-9]+|[\t\r]+/,"");
						
						this.url.push(url[u]);
						//Master Array ---
						//formatted to be output as a JSON
						this.manifest[url[u].url]=url[u];
					} else if(this.manifest[url[u].url]){
						//duplicate already exists; add info and lines to this image
						$.each(this.manifest[url[u].url].info,function(i,o){
							if(i in url[u].info){
								if($.isArray(o)){
									o.push(url[u].info[i]);
								} else {
									//make this item into an array
									var pre=o;
									o=[pre];
									o.push(url[u].info[i]);
								}
							}
						});
						//merge lines together
						$.merge(this.manifest[url[u].url].lines,url[u].lines);
					}
					this.pageNum=0;
				}
			}
		},
		//called once imageTagger is set to be hidden
		// flashes the canvas area
		closeDownCanvas:function(){
			var self=this;
			self.DOM.animate({"opacity":0.01},200,function(){
				self.DOM.css({"z-index":0});
			});
		},
		// finds the real width and height of the given URL and
		// sets the canvas area and other surrounding divs to this
		// proportion
		// url : {String}
		// 
		setUpCanvas:function(url,loadShapes){
			var self=this;
			// remove CSS from zoom
			$("#srcImageForCanvas").css("width","");
			if(!$.browser.webkit){
				$("#srcImageForCanvas").hide();
			}
			// make sure to get rid of all shpButtonHolders
			$(".shpButtonHolder").remove();
			// self._loadPage.appendTo($("#raphael"));
			if(url.indexOf('http')) url=url.substring(url.indexOf('http'));
			if(self.drawTool) self.drawTool.clearShapes();
			if(/\.js|\.html|\.JSP|\.jsp|\.JS|\.PHP|\.php|\.HTML|\.HTM|\.htm/.test(url)) return;
			// get image element
			var img=$("#srcImageForCanvas")[0];
			// attach load event
			$(img).load(function(e){
				if(!$.browser.webkit){
					$(img).show();
				}
				$(img).unbind("load");
				if(!self.drawTool){
					//set up drawing canvas
					self.setUpDrawTool();
					self._imgScale=self.drawTool._scale; //make sure scales are synched
				} else {
					//clear all shapes from the previous image
					self.drawTool.clearShapes();
				}
				if(loadShapes) self.drawTool.importShapes(loadShapes);
				
				if(self.manifest[url]){
					self.manifest[url].origWidth=this.width;
					self.manifest[url].origHeight=this.height;
					if(!self.manifest[url].shapes) self.manifest[url].shapes=[];
				}
				
				// size to fit window
			
				var ow=(TILEIMGSCALE!=self._imgScale)?(this.width*TILEIMGSCALE):this.width;
				var oh=(TILEIMGSCALE!=self._imgScale)?(this.height*TILEIMGSCALE):this.height;
		
				var contw=0;
				var conth=0;
				if($.browser.webkit){
					contw=parseInt(document.getElementById("raphworkspace_").style.width,10);
					conth=parseInt(document.getElementById("raphworkspace_").style.height,10);
				
				} else {
					contw=parseInt($("#raphworkspace_").css("width"),10);
					conth=parseInt($("#raphworkspace_").css("height"),10);
					
				}
				if(__v) console.log('start: contw: '+contw+', conth: '+conth+', ow: '+ow+', oh: '+oh);
				if((contw<ow)||(conth<oh)){
					while((contw<ow)||(conth<oh)){
						if(__v) console.log('contw: '+contw+', conth: '+conth+', ow: '+ow+', oh: '+oh);
						ow*=self.zoomDF;
						oh*=self.zoomDF;
						TILEIMGSCALE*=self.zoomDF;
						
					}
					for(var x=0;x<self.manifest.length;x++){
						var shape=self.manifest[x];
						if(shape._scale!=TILEIMGSCALE){
							for(var u in shape.posInfo){
								var dx=(shape.posInfo[u]*TILEIMGSCALE)*shape._scale;
								shape.posInfo[u]=dx;
							}
							shape._scale=TILEIMGSCALE;
						} 
					}
				}
				
				
				self._imgScale=TILEIMGSCALE;
				self.drawTool._scale=TILEIMGSCALE;
				if(self._imgScale!=1){
					// set correct scale
					if($.browser.webkit){
						document.getElementById('srcImageForCanvas').width=ow;
					} else {
						$("#srcImageForCanvas").width(ow);
					}
					$(".vd-container").css('width',ow+'px');
					$(".vd-container").css('height',oh+'px');
					// $(".vd-container").width(TILEIMGSCALE*parseFloat($(".vd-container").width()));
					// $(".vd-container").height(TILEIMGSCALE*parseFloat($(".vd-container").height()));
				
					//zooming in
					self.drawTool.scale(TILEIMGSCALE);
					
					if($(".shpButtonHolder").length){
						// also change positon of .shpButtonHolder
						$(".shpButtonHolder").css('left',($(".shpButtonHolder").position().left*TILEIMGSCALE)+'px');
						$(".shpButtonHolder").css('top',($(".shpButtonHolder").position().top*TILEIMGSCALE)+'px');
					}
				}
				if(self.curUrl!=url) self.curUrl=url;
				// self._loadPage.remove();
			}).attr("src",url);	
		},
		// only load shapes - does not change the URL or sets up a new canvas
		loadShapes:function(shapes){
			var self=this;
			if(!self.drawTool) return;
			// clear canvas
			self.drawTool.clearShapes();
			// set to scale
			self.drawTool._scale=TILEIMGSCALE;
			
			// clear buttons
			$(".shpButtonHolder").remove();
			
			if(!shapes.length) return;
			var vd=[];
			// collate shapes array with 
			// internal shape stack
			for(var prop in shapes){
				if(!shapes[prop]){
					continue;
				}
				
				var shape=shapes[prop];
				if(!shape.posInfo){
					// just an id, need to find object
					shape=self.findShapeFromId(shape);
					if(!shape) return;
				}
				
				if($.inArray(shape.id,self.shapeIds)<0){
					self.manifest.push(shape);
					self.shapeIds.push(shape.id);
					vd.push(shape);
				} else {
					// find in manifest
					for(var sh in self.manifest){
						if(self.manifest[sh].id==shape.id){
							self.manifest[sh]=shape;
						}
					}
					vd.push(shape);
				}
				
				
			}
			
			self.drawTool.importShapes(vd);
			// self.drawTool.selectShape(vd[0]);
			// 		$("body:first").trigger("shapeIsActive",[vd[0]]);
		},
		updateShape:function(obj){
			var self=this;
			
			var shape=self.findShapeFromId(obj.id);
			// replace
			shape=obj;
			
			var vd=self.drawTool.exportShapes();
			for(var x=0;x<vd.length;x++){
				if(vd[x]&&(vd[x].id==obj.id)){
					vd[x]=obj;
				}
			}
			
			self.drawTool.importShapes(vd);
			
			
		},
		findShapeFromId:function(id){
			var self=this;
			var sh=null;
			// step through manifest
			for(var s in self.manifest){
				if(self.manifest[s].id==id){
					sh=self.manifest[s];
					break;
				}
			}
			return sh;
		},
		//creates the VectorDrawer tool and sets up necessary 
		// listeners
		// NOTE: if a shape object has an ID containing D_ at the beginning,
		// that shape will be treated as a temporary shape/autoLine
		setUpDrawTool:function(){
			var self=this;
			//creates the VectorDrawer canvas and all associated triggers for using
			//said VectorDrawer canvas.  
	
			// RaphaelImage acts as a wrapper for the VectorDrawer class; no functions inside of VectorDrawer
			// are invoked directly outside of RaphaelImage
			self.drawTool=new VectorDrawer({"overElm":$("#raphworkspace_ > #raphael"),"initScale":self._imgScale}); 
			// for when all temp lines have been approved
			self.approved=false;
			//set up triggers
			$("body").bind("zoom",{obj:self},self.zoomHandle);
			$("body").bind("changeShapeType",{obj:self},function(e,m){
				var self=e.data.obj;
				//either r,e,p, or s
				self.drawTool._drawMode=m; 
			});
			$("body").bind("VD_REMOVESHAPE",{obj:self},function(e,id){
				
				self.drawTool.deleteShape(id);
				
			});
			$("body").bind("_showShape",{obj:self},function(e,id){
				var self=e.data.obj;
				self.drawTool.hideShapes();
				self.drawTool.showShape(id);
			});
			$("body").bind("clearShapes",{obj:this},function(e){
				self.drawTool.clearShapes();
				
			});
			$("body").live("noShapesSelected",function(e){
				$(".shpButtonHolder").remove();
				$(".ui-dialog").hide();
			});
			// global bind for when a new shape is drawn in VectorDrawer [VectorDrawer.js]
			$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
			// global bind for when [Transcript.js] is sending shape ids to imageTagger
			$("body").bind("loadItems",{obj:this},this._loadShapesHandle);
			// global bind for when a user makes some kind of link
			// $("body").bind("addLink",{obj:this},this._addLinkHandle);
			// global bind for when a user deletes a link - cancel out custom events for deleting shape links
			// $("body").bind("deleteLink",{obj:this},this._deleteLinkHandle);
			// global bind for when user interacts with the colorPicker [TILEShapeToolBar]
			// $("body").bind("NEWSHAPECOLOR",{obj:this},this._newColorHandle);
			// global bind for when a shape is dragged/resized
			$("body").bind("shapeChanged",{obj:self},this._shapeChangeHandle);
			// global bind for when a shape is selected
			$("body").bind("shapeActive",{obj:this},this._shapeActiveHandle);
			
			//global bind for when user clicks to approve a shape item in [ActiveBox.js]
			// $("body").bind("approveItem",{obj:this},this._approveItemHandle);
			// global bind for when user clicks on the approveAllKey [ActiveBox.js]
			$("body").bind("approveAllItems",{obj:this},this._approveAllItemsHandle);
			//global bind for when user clicks to delete a shape item in ActiveBox
			$("body").bind("deleteItem",{obj:this},this._deleteItemHandle);
		
			//set it up
			self.drawTool._drawMode='r';
			// listener for when a selBB is dragged
			$("body").live("drag",function(e,ui){
				// if(__v) console.log($(ui.helper).attr('id'));
				if(!ui) return;
				if($(ui.helper).attr('id')=="selBB"){
					// set left and top properties - can't be above the fold of the canvas

					var left=$("#selBB").position().left;
					var top=$("#selBB").position().top-$(".shpButtonHolder").height();
					if((left+$(".shpButtonHolder").width())>$(document).width()){
						left=left-$(".shpButtonHolder").width();
					}
					if(top<$(".vd-container").position().top){
						top=$("#selBB").position().top;
					}
					$(".shpButtonHolder").css("left",left+'px');
					$(".shpButtonHolder").css("top",top+'px');
				}
			});
			
			// listener for all delete tags on shapes
			$(".shpButtonHolder > .button.shape:contains('Delete')").live('mousedown',function(e){
				
				// Delete the shape completely and all references to the  shape
				
				var foundID=$(this).attr('id');
				// if(/^D\_/.test(foundID)){
				// 					// Auto Line - only need to shift lines
				// 					self._shiftAutoLines(foundID);
				// 					$(".shpButtonHolder > #approveAllButton").remove();
				// 					$("div[id^='approve_']").remove();
				// 					return;
				// 				}
				
				
				self.drawTool.deleteShape(foundID);
				self.deleteShape(foundID);
			});
			$("div[id^='approve_']").live('mousedown',function(e){
				var uid=$(this).attr("id").replace("approve_","");
			
				self._approveItemHandle(uid);
				$(".shpButtonHolder > #approveAllButton").remove();
				$("div[id^='approve_']").remove();
				$("#approveAllButton").remove();
			});
			$(".shpButtonHolder > #approveAllButton").live('click',function(e){
				$(".shpButtonHolder > #approveAllButton").remove();
				$("div[id^='approve_']").remove();
				
				self._approveAllItemsHandle();
				
			});
			
			// adjust width
			$("#raphworkspace_").width($("#azcontentarea > .az.inner").innerWidth());
			diff=$("#azcontentarea > .az.inner > .toolbar").innerHeight();
			$("#raphworkspace_").height($("#azcontentarea > .az.inner").innerHeight()-diff);
			self.containerSize.x=$("#raphworkspace_").width();
			self.containerSize.y=$("#raphworkspace_").height();
		},
		//whatever the current drawn shape is, change
		// that shapes color
		// uses a VectorDrawer function
		// color : {Integer} - hexidecimal color value
		changeShapeColor:function(color,shape){
			var self=this;
			self.drawTool.setPenColor(color);
			// currently selected shape - should change the color for this shape
			// var id=$("#selBB > .shpButtonHolder > div:eq(0)").attr('id');
			
			var url=$("#srcImageForCanvas").attr('src');
			for(var sh in self.manifest){
				if(self.manifest[sh].id==shape){
					self.manifest[sh].color=color;
					break;
				}
			}	
		
		},
		// when the user opens up something that overlaps
		// the canvas, this has to be called
		// e : {Event}
		// s : {Boolean} true - set the z-index to 0 ; false - set z-index back up to 1032
		closeSVGHandle:function(e,s){
			var self=e.data.obj;
			if(s){
				$(".vd-container").css("z-index","0");
			} else if(!s) {
				$(".vd-container").css("z-index","1032");
			}
		},
		// Called whenever a shape is dragged, resized
		// e : {Event} - Custom Event shapeChanged
		_shapeChangeHandle:function(e,obj){
			var self=e.data.obj;
			var url=TILE.url;
			// change in own manifest
			for(var sh=0;sh<self.manifest.length; sh++){
				if(__v) console.log('shape manifest[sh]: '+self.manifest[sh].id);
				if(self.manifest[sh].id==obj.id){
					if(__v) console.log("shapeChangeHandle itagger :: "+JSON.stringify(obj.posInfo));
					self.manifest[sh].posInfo=obj.posInfo;
					if(__v) console.log("shapeChangeHandle itagger handled :: "+JSON.stringify(self.manifest[sh]));
					shpObj=obj;
					break;
				}
			}
			
		
			$("body:first").trigger("imageShapeUpdate",[obj]);
		},
		// Called whenever a user clicks on an object while VectorDrawer
		// is in 's' mode
		// e : {Event} - shapeActive
		// shape : {Object}
		_shapeActiveHandle:function(e,shape){
			var self=e.data.obj;
			var url=TILE.url;
			
			var foundID=$(shape.node).attr('id');
			// find shape reference in manifest
			for(var sh in self.manifest){
				if(self.manifest[sh].id==foundID){
					shape=self.manifest[sh];
					break;
				}
			}
			// fire shapeactive trigger
			$("body:first").trigger("shapeIsActive",[shape]);
			// draw selBB and make active
			self.setActiveShape(shape);
		},
		// called by Imagetagger
		setActiveShape:function(shpObj){
			var self=this;
			// remove current selection area
			$(".shpButtonHolder").remove();
			// select shape, which will draw selBB area
			self.drawTool.selectShape(shpObj.id);
			// change the draw toolbar options
			$("#rect").removeClass("active");
			$("#poly").removeClass("active");
			$("#elli").removeClass("active");
			// pointer is now active
			$("#pointer").addClass("active");
			// attach buttons to selBB area
			$("<div class=\"shpButtonHolder\"><div id=\""+shpObj.id+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
		
			var left=$("#selBB").position().left;
			var top=$("#selBB").position().top-$(".shpButtonHolder").height();
			if((left+$(".shpButtonHolder").width())>$(document).width()){
				left=left-$(".shpButtonHolder").width();
			}
			if(top<$(".vd-container").position().top){
				top=$("#selBB").position().top;
			}
			$(".shpButtonHolder").css("left",left+'px');
			$(".shpButtonHolder").css("top",(top)+'px');
			
			// Either set up additional Auto Line options (For Ids beginning with D_),
			// or trigger event and set up buttons
			if(/^D\_/.test(shpObj.id)){
				// disable draggable and resizable from selBB - user has to approve a line before being 
				// able to drag/resize it
				
				// temp line - apply necessary buttons:
				// Approve
				// Approve All
				$("<div id=\"approve_"+shpObj.id+"\" class=\"button shape\">Approve</div>").appendTo($(".shpButtonHolder"));
				
				$("<div id=\"approveAllButton\" class=\"button shape\">Approve All</div>").appendTo($(".shpButtonHolder"));
				
			} 
			
		
		},
		// Called by the receiveShapeObj event
		// e : {Event}
		// shpObj : {Object} - array of shape values
		_shapeDrawnHandle:function(e,shpObj){
			var self=e.data.obj;
			var url=TILE.url;
			// if(!self.manifest[url]) self.manifest[url]={shapes:[]};
			// clear out the selBB element
			$(".shpButtonHolder").remove();
			
		
			if(!self.manifest) self.manifest=[];
			// take shape and pass it into the internal manifest file
			if(!self.manifest.push){
				var ag=[];
				for(var t in self.manifest){
					if(self.manifest[t]) ag.push(self.manifest[t]);
				}
				self.manifest=ag;
			}
			self.manifest.push(shpObj);
			self.shapeIds.push(shpObj.id);
			
			// select shape, which will also alert to other objects
			// self.drawTool.selectShape(shpObj.id);
			// 			$("#rect").removeClass("active");
			// 			$("#poly").removeClass("active");
			// 			$("#elli").removeClass("active");
			// 			$("#pointer").addClass("active");
			// 			// attach additional buttons
			// 			$("<div class=\"shpButtonHolder\"><div id=\""+shpObj.id+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
			// 			// set left and top properties - can't be above the fold of the canvas
			// 			
			// 			var left=$("#selBB").position().left;
			// 			var top=$("#selBB").position().top-$(".shpButtonHolder").height();
			// 			if((left+$(".shpButtonHolder").width())>$(document).width()){
			// 				left=left-$(".shpButtonHolder").width();
			// 			}
			// 			if(top<$(".vd-container").position().top){
			// 				top=$("#selBB").position().top;
			// 			}
			// 			$(".shpButtonHolder").css("left",left+'px');
			// 			$(".shpButtonHolder").css("top",(top)+'px');
				
			
					
			// send signal to other plugins
			
			$("body:first").trigger("shapeIsDrawn",[shpObj]);
			// make the active shape
			self.setActiveShape(shpObj);
		
		},
		// Called when an autoLine is approved and then
		// changes IDs to a regular VD shape
		// e : {Event}
		// id : {String} - unique ID for the shape
		_approveItemHandle:function(id){
			var self=this;
			var url=$("#srcImageForCanvas").attr('src');
			var elx=null;
			// get current state of canvas
			var vd=self.drawTool.exportShapes();
			var shpObj=null;
			for(var o in vd){
				if(vd[o]&&(vd[o].id==id)){
					shpObj=vd[o];
				}
			}
			// for(x in self.manifest[url].shapes){
			// 			if(self.manifest[url].shapes[x]&&(self.manifest[url].shapes[x].id==id)){
			// 				
			// 				if(self.manifest[url].shapes[x].id.substring(0,1)=="D"){
			// 					self.manifest[url].shapes[x].color="#000000";
			// 					self.manifest[url].shapes[x].id=self.manifest[url].shapes[x].id.replace("D_","");
			// 					elx=x;
			// 					// replace in current canvas state
			// 					for(v in vd){
			// 						if(vd[v].id==id){
			// 							if(__v) console.log("replacing "+JSON.stringify(vd[v])+" with "+JSON.stringify(self.manifest[url].shapes[x]));
			// 							// replace current temp line with modified one
			// 							vd[v]=self.manifest[url].shapes[x];
			// 						}
			// 					}
			// 				}
			// 			
			// 				
			// 				break;
			// 			}
			// 		}
			
			if(!shpObj) return;
			//clear all shapes
			self.drawTool.clearShapes();
			// TODO: introduce animation here for shifting/approving of lines?
			if(elx!=null) {
			 	self.drawTool.importShapes(JSON.stringify(vd));
 			}
			$("body:first").trigger("shapeDeleted",[id]);
			$("body:first").trigger("receiveShapeObj",[shpObj]);
		},
		// Instead of approving one item, approve all items.
		// Converts all shape IDs with prefix D_ to normal shape
		// ids (i.e. no prefix).
		_approveAllItemsHandle:function(e){
			var self=this;
			var url=$("#srcImageForCanvas").attr("src");
			// get current state of canvas
			var vd=self.drawTool.exportShapes();
			var total=[];
			// update line
			var temp={"shapes":[]};
			for(x in self.manifest){
				if(self.manifest[x].id.substring(0,1)=="D"){
					self.manifest[x].color="#000000";
					self.manifest[x].id=self.manifest[x].id.replace("D_","");
					temp.shapes.push({"old":"D_"+self.manifest[x].id,"curr":self.manifest[x].id});
					total.push(self.manifest[x]);
					// replace in current canvas state
					for(v in vd){
						if(vd[v].id.replace("D_","")==self.manifest[x].id){
							// replace current temp line with modified one
							vd[v]=self.manifest[x];
						}
					}
				}
				
			}
			
			
		
			// $("body:first").trigger("updateAllShapes",[temp]);
			// show all approved shapes then show current shape
			self.drawTool.clearShapes();
			self.drawTool.importShapes(JSON.stringify(total));
			setTimeout(function(){
				self.drawTool.clearShapes();
				
				self.drawTool.importShapes(JSON.stringify(vd));
			},100);
		},
		// uses a VectorDrawer function for loading shapes
		// from a JSON string
		// Called by loadShapes event
		// e : {Event}
		// json : {Object} JSON object with shape data
		_loadShapesHandle:function(e,json){
			var self=e.data.obj;
			// JSON data is full of ids - must match these up with ids
			// in manifest
			var vd=[];
			var url=$("#srcImageForCanvas").attr('src');
			// clear the canvas
			self.drawTool.clearShapes();
			// also remove shpButtonHolder
			$(".shpButtonHolder").remove();
			for(j in json){
				var shid=(json[j].id)?json[j].id:json[j];
				for(sh in self.manifest[url]){
					if(self.manifest[sh]&&(self.manifest[sh].id==shid)){
						vd.push(self.manifest[sh]);
						break;
					} 
				}
			}
			self.drawTool.importShapes(JSON.stringify(vd));
		},
		// used currently to delete a shape
		// passed an ID - finds ID then alerts 
		// that that shape is deleted from manifest
		deleteShape:function(id){
			var self=this;
			var shape=null;
			var ag=[];
			// clear from manifest
			for(var x in self.manifest){
				if(self.manifest[x].id==id){
					shape=self.manifest[x];
				} else {
					ag.push(self.manifest[x]);
				}
			}
			self.manifest=ag;
			// alert out the shape data
			$("body:first").trigger("shapeDeleted",[shape]);
		},
		// Called by deleteItem custom event
		// e : {Event}
		// id : {String} - id for object to delete
		_deleteItemHandle:function(id){
			var self=this;
			// if a temp line, then direct to shiftLines
			if(/^[D_]/.test(id)){
				self._shiftAutoLines(id);
				return;
			}
			
			var url=$("#srcImageForCanvas").attr('src');
			$(".shpButtonHolder").remove();
			
			
			// go through array of shapes and delete item
			for(obj in self.manifest){
				if(self.manifest[obj]&&(self.manifest[obj].id==id)){
					self.manifest[obj]=null;
				} 
			}
			// delete shape on canvas
			self.drawTool.deleteShape(id);
			
			// export the current shapes
			var vd=self.drawTool.exportShapes();
			// self.manifest[url].shapes=vd;
			// create ID array and pass to other listeners
			var ids=[];
			for(v in vd){
				ids.push(vd[v].id);
			}
			// update listening objects
			$("body:first").trigger("shapesUpdate",[ids]);
			
		},
		// Goes through the URLs shapes array and
		//  shifts up all temporary lines
		// Deletes line based one given id
		// id : {String} - if of line to delete. All temp lines 
		// following this one will be shifted up one
		_shiftAutoLines:function(id){
			var self=this;
			var url=$("#srcImageForCanvas").attr('src');
			if(__v) console.log("shifting shapes has been reached");
			if(!(self.manifest)) return;
			
			var check=false;
			var n=null;
			// remove the shape from the canvas
			self.drawTool.deleteShape(id);
			
			// separate autoLines and regular shapes
			// create new manifest (delete null pointers)
			var p=[];
			// also find all autoLines
			var autoLines=[];
			for(var x in self.manifest){
				if(!self.manifest[x]) continue;
				if(self.manifest[x].id==id){
				
					autoLines.push(self.manifest[x]);
						// store starting point for changing IDs
					n=autoLines.length-1;
					continue;
				} else if(self.manifest[x]){
					if(/^D\_/.test(self.manifest[x].id)){
						autoLines.push(self.manifest[x]);
						continue;
					}
					p.push(self.manifest[x]);
				}
			}
			// new manifest set
			self.manifest[url].shapes=p;
			
			var vd=self.drawTool.exportShapes();
			var curShapes=[];
			// if not found, return error
			if(n==null) die("Error");
			var newDLine=n;
			if(__v) console.log("shifting shapes upward starting at: "+n);
			for(var c=0;c<autoLines.length;c++){
				// unless this is the last shape in the stack, replace
				// the current id with the next shape's id in stack
				// var shape=self.manifest[url].shapes[c];
				if(c==(autoLines.length-1)){
					// send out call to delete the shape
					$("body:first").trigger("shapeDeleted",[autoLines[c].id]);
					if(__v) console.log("finishing the line shift; manifest is now: "+JSON.stringify(self.manifest));
					break;
				}
			
				// copy the autoLine below this one
				var shape={};
				
				// If the current place in the stack is on or below
				// the line being shifted, then:
				// give this shape the current shape's id
				if(c>=n){
					$.extend(true,shape,autoLines[(c+1)]);
					shape.id=autoLines[c].id;
				} else {
					$.extend(true,shape,autoLines[c]);
				}
				// store in shape manifest
				if(__v) console.log("adding shape "+JSON.stringify(shape));
				self.manifest.push(shape);
			}
			
			for(i in vd){
				curShapes.push(vd[i].id);
			}
			// update canvas
			self.drawTool.clearShapes();
			self.drawTool.importShapes(JSON.stringify(vd));
			// move the shpButtonHolder to the new location/shape
			var left=$("svg:first").position().left;
			var top=$("svg:first").position().top-$(".shpButtonHolder").height();
			$(".shpButtonHolder").css({"left":left+'px',"top":top+'px'});
			
		},
		// handles {Event} 'zoom'
		// also handles VectorDrawer canvas shapes - need to be cleared and re-sent
		// to transcript line
		// e : {Event}
		// n : {Integer} either -1 (zoom out) or 1 (zoom in)
		zoomHandle:function(e,n){
			var self=e.data.obj;
			if(self.drawTool&&($("#srcImageForCanvas").width()!=0)){
				//svg scale() function has to be called after 
				//RaphaelImage is done resizing container elements
				
				// true width
				var h=$("#srcImageForCanvas")[0].width;
				// true height
				var w=$("#srcImageForCanvas")[0].height;
				
				if(n>0){
					// test to see if reached maximum
					
					$("#srcImageForCanvas").css("width",(self.zoomIF*parseFloat($("#srcImageForCanvas").width()))+'px');
					//$("#srcImageForCanvas").height(1.25*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(self.zoomIF*parseFloat($(".vd-container").width()));
					$(".vd-container").height(self.zoomIF*parseFloat($(".vd-container").height()));
					//zooming in
					self.drawTool.scale(self.zoomIF); 
					if($(".shpButtonHolder").length){
						// also change positon of .shpButtonHolder
						$(".shpButtonHolder").css('left',($(".shpButtonHolder").position().left*self.zoomIF)+'px');
						$(".shpButtonHolder").css('top',($(".shpButtonHolder").position().top*self.zoomIF)+'px');
					}
					// set scales
					self._imgScale*=self.zoomIF;
					TILEIMGSCALE*=self.zoomIF;
					
					for(var x=0;x<self.manifest.length;x++){
						var shape=self.manifest[x];
						if(shape._scale!=self._imgScale){
							for(var u in shape.posInfo){
								shape.posInfo[u]=(shape.posInfo[u]*self._imgScale)/shape._scale;
							}
							shape._scale=self._imgScale;
							$("body:first").trigger('imageShapeUpdate',[shape]);
						}
						
					}
				} else if(n<0){
					$("#srcImageForCanvas").css("width",(self.zoomDF*parseFloat($("#srcImageForCanvas").width()))+'px');
					//$("#srcImageForCanvas").height(0.75*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(self.zoomDF*parseFloat($(".vd-container").width()));
					$(".vd-container").height(self.zoomDF*parseFloat($(".vd-container").height()));
					//zooming out
					self.drawTool.scale(self.zoomDF); 
					// also change positon of .shpButtonHolder
					if($(".shpButtonHolder").length){
						$(".shpButtonHolder").css('left',($(".shpButtonHolder").position().left*self.zoomDF)+'px');
						$(".shpButtonHolder").css('top',($(".shpButtonHolder").position().top*self.zoomDF)+'px');
					}
					for(var x=0;x<self.manifest.length;x++){
						var shape=self.manifest[x];
						if(shape._scale!=TILEIMGSCALE){
							for(var u in shape.posInfo){
								shape.posInfo[u]=(shape.posInfo[u]*self._imgScale)/shape._scale;
							}
							shape._scale=self._imgScale;
							$("body:first").trigger('imageShapeUpdate',[shape]);
						}
					}	
					
					// set scales
					self._imgScale*=self.zoomDF;
					TILEIMGSCALE*=self.zoomDF;
					
				}
		
			
			} else {
				$("body").unbind("zoom",self.zoomHandle);
			}
		},
		// When the image tagger tools is set to close, this is 
		// activated to cancel certain bound events from happening
		_closeOut:function(){
			var self=this;
			$("body").unbind("zoom",self.zoomHandle);
		},
		// called to deactivate zoomHandle once 
		// the user selects a different tool to use in TILE_ENGINE
		// json : {Object} JSON data containing shapes for this URL
		_restart:function(json,url){
			var self=this;
			// dump autoLines
			self.autoLines=[];
			if((!url)) return;
			$("body").bind("zoom",{obj:self},self.zoomHandle);
			if(self.drawTool){
				// erase current canvas
				self.drawTool.clearShapes();
			
				var vd=[];
				// check to see if shapes in passed data array
				// match up with any in the manifest
				for(var j in json){
					if($.inArray(json[j].id,self.shapeIds)<0){
						// add to manifest and array of ids
						self.shapeIds.push(json[j].id);
						self.manifest.push(json[j]);
						vd.push(json[j]);
					} else {
					
						for(var p in self.manifest){
							if(!json[j]) continue;
							if(json[j].id==self.manifest[p].id){
								// update item
								self.manifest[p]=json[j];
								vd.push(self.manifest[p]);
							}
						}
					}
				}
				
				// wipe out other shapes
				self.setUpCanvas(url,vd);
				// select the first shape in stack
				// self.drawTool.selectShape(vd[0].id);
				
				// notify through event 
				// $("body:first").trigger("shapeIsActive",[vd[0]]);
				
			} else {
				self.setUpCanvas(url);
			}
		},
		//changes the pages - called by turnPage Custom Event
		//page order wraps around when reaching end/beginning
		showImg:function(e,val){
			var obj=e.data.obj;
			//if greater than 0, turn page 1 forward
			//less than 0, turn page 1 back
			if((val>0)){
				obj.pageNum++;
				
				
				if(obj.url[obj.pageNum]){
					// listeners should already be loaded, just set to url
					obj.setUpCanvas(obj.url[obj.pageNum].url);
				} else {
					//ran out of pages, or not available, send to 
					//beginning
					obj.pageNum=0;
					// listeners should already be loaded, just set to url
					obj.setUpCanvas(obj.url[obj.pageNum].url);
				}
			} else if((val<0)) {
				obj.pageNum--;
				
				if(obj.url[obj.pageNum]){
					// listeners should already be loaded, just set to url
					obj.setUpCanvas(obj.url[obj.pageNum].url);
				} else {
					//ran out of pages, or page not available,
					//go to end (wraparound)
					obj.pageNum=(obj.url.length-1);
					// listeners should already be loaded, just set to url
					obj.setUpCanvas(obj.url[obj.pageNum].url);
				}
			}

		},
		// activated by switchImage
		// given a url to go to - has to find page number first 
		// in url array
		// url : {String}
		goToPage:function(url){
			var self=this;
			for(u in self.url){
				if(self.url[u].url==url){
					self.pageNum=u;
					break;
				}
			}
			
			if(self.url[self.pageNum]){
				// listeners should already be loaded, just set to url
				self.setUpCanvas(url);
				// self.setUpCanvas(self.url[self.pageNum].url);
			} else {
				//ran out of pages, or not available, send to 
				//beginning
				self.pageNum=0;
				// listeners should already be loaded, just set to url
				self.setUpCanvas(url);
			}
			
		},
		// activated by imageAdded Event
		// e : {Event}
		// shows the current pageNum image in the url array
		showCurrentImage:function(e){
			var obj=e.data.obj;
			
			if(obj.url[obj.pageNum].url){
				var file=obj.url[obj.pageNum].url;
				if(/.jpg$|.tif$|.png$|.gif$/i.test(file)){
					obj.setUpCanvas(file);

				} else {
					alert("The file: "+file+" returned an error.");
				}
			}
		},
		// activated by changeShapeType Event from ShapeToolBar
		// e : {Event}
		// type : {String} (r, e, p, s)
		changeShapeType:function(e,type){
			var obj=e.data.obj;
			obj.shapeType=type;
		},
		//save all Raphael Image data into a JSON object
		// now simply returns the manifest Object that records
		// shape data by url index
		bundleData:function(){
			//get all tags and other data into an associative array
			var self=this;
			// clean up manifest
			var cleanManifest=[];
			var use=$.extend(true,{},self.manifest);
			for(url in use){
				if(!cleanManifest[url]) cleanManifest[url]=[];
				for(sh in use[url].shapes){
					if(use[url].shapes[sh]&&(use[url].shapes[sh]!="null")){
						cleanManifest[url].push(use[url].shapes[sh]);
					}
				}
				self.manifest[url].shapes=cleanManifest[url];
			}
			
			// return cleaned up (i.e. no null values) manifest
			// self.manifest=cleanManifest;
			return cleanManifest;
		}

	};//END RaphaelImage
	
	ITag.RaphaelImage=RaphaelImage;

	ITag.TILEShapeToolBar=TILEShapeToolBar;
	//ITag.TileAnimatedScroller=TileAnimatedScroller;
	//SHAPE
	/**
	Shape 

	Created by: dreside

	Object that houses a collection of dot coordinates taken from an HTML canvas
	element.
	Stores x,y coordinates and organizes dots from their left-right, bottom-top positions


	**/
	var Shape = function(args){
		// Constructor
			this.coords=[];
			this.index=args.index;
			this.Top=args.initialTop;
			this.Right=0;
			this.Left=args.initialLeft;
			this.Bottom=0;
			this.hMid = 0; // horizontal midpoint
			this.vMid = 0; // vertical midpoint
			this.foundOnRow = (typeof args.foundOnRow=="string")?parseInt(args.foundOnRow.substring(1),10):args.foundOnRow;

	};
	Shape.prototype={
		// Add an xy value, which is processed into the Shape object's 
		// coords array
		// xy : {Object} - array of x and y pair
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


		},

		// @param
		// 	shape: Another Shape object to compare this one to
		// returns true of false
		compare:function(shape,criteria){
			return (this[criteria]<shape[criteria]);
		}
	};
	
	
})(jQuery);


// Object to be passed to the TILE interface to be 
// added as a plugin
// Functions follow a standard protocol that should be followed
// so that any particular plugin can work with the TILE interface
//
var IT={
	id:"IT1000",
	// name: {string} used as an array key for the TILE toolSet array
	name:'ImageTagger',
	// start(id,base,json): creates the imagetagger. Takes id (string representing
	// DOM location of tagger), base (string representing location of images - provided by TILE), and json
	//  (either null or JSON object representing TILE JSON data)
	start:function(mode){
		var self=this;
		self.activeShape=null;
		var _shapeDeletedHandle=function(e,data){
			if(!(data)) return;
			if(!self.itagger) return;
			// switch toolbar back to drawing mode
			// switch back to drawing mode
			
			$("#rect").addClass("active");
			$("#elli").removeClass("active");
			$("#poly").removeClass("active");
			$("#pointer").removeClass("active");
			self.itagger.ShapeToolBar.shapeType='r';
			$("body:first").trigger("changeShapeType",['r']);
			// get rid of selection box
			$("#selBB").remove();
			if($(".shpButtonHolder").length) $(".shpButtonHolder").remove();
			$(".ui-dialog").hide();
			if(self.activeShape==data.id){
				self.activeShape=null;
			}
			// create wrapper for TILE
			var w={
				id:data.id,
				type:'shapes',
				jsonName:TILE.url,
				obj:data
			};
			// delete data from engine
			TILE.engine.deleteObj(w);
		};
		
		var _receiveShapeObjHandle=function(shape){
			if(__v) console.log('receiveShp:  '+shape);
			// feed PC a wrapper for the shape
			var data={
				id:shape.id,
				type:'shapes',
				jsonName:TILE.url,
				obj:shape
			};
			
			// make active
			self.activeShape=data.obj.id;
			// send directly to engine
			TILE.engine.insertData(data);
		
			// link with activeObj, if any
			if(TILE.engine.linkWithActiveObj(data)){
				
			} else {	
				
				self.itagger.raphael.setActiveShape(shape);
				// set up active window
				TILE.engine.attachMetadataDialog(data,'#selBB');
			}
			
			// put on dashboard
			$("body:first").trigger('displayOnDashboard',[{mode:'Image Annotation',html:''}]);
		};
		// handles the showImageList call
		var showImageListHandle=function(e){
			// called by showImageList
			e.preventDefault();
			
			// get images from engine JSON
			var data=TILE.engine.getJSON();
			var urls=[];
			for(var p in data.pages){
				if(!data.pages[p]) continue;
				// don't add if already in array
				if($.inArray(data.pages[p].url,urls)>=0) continue;
				urls.push(data.pages[p].url);
			}
			if(__v) console.log('urls for imagelist: '+JSON.stringify(urls));
			// send unique url array to itagger
			self.itagger.showImageList(urls);
		};
		
		// handles when a shape is dragged or resized
		// makes a new insertData call to TILE coredata
		var shapeUpdateHandle=function(e,obj){
			if(!obj) return;
			// make a tile wrapper if needed
			if(!obj.jsonName){
				obj={
					id:obj.id,
					type:'shapes',
					jsonName:TILE.url,
					obj:obj
				};
			}
			// update in TILE
			TILE.engine.updateData(obj);
		};
		
		// handles when a link in imagelist is clicked
		var switchImageHandle=function(e,uri){
			// called by switchImage - see ImageList
			e.preventDefault();
			
			// change page
			TILE.engine.changePage(uri);
		};
		
		var json=TILE.engine.getJSON();
		if(!self.itagger){
			// var id="azcontentarea"; //defaults to TILE page
			this.itagger=new _Itag({loc:"azcontentarea",json:null});
			this.linkManifest=[];
			
			// attach HTML and
			// create new engine mode
			TILE.engine.insertModeHTML(this.itagger.htmlContent,'rightarea','Image Annotation');
			// add toolbar buttons
			TILE.engine.insertModeButtons(this.itagger.htmlToolbar,'rightarea','Image Annotation');
			
			$("#azcontentarea > .imageannotator > .toolbar").attr('id','_raphshapebar');
			this.itagger.setHTML();
			
			// global bind for receiving shape objects
			$("body").bind("shapeDeleted",{obj:self},_shapeDeletedHandle);
			$("body").bind("ObjectChange",{obj:self},self._objChangeHandle);
			// for when user clicks on 'listView'
			$("body").live("showImageList",showImageListHandle);
			// for when user clicks on li > a item in ImageList
			$("body").live("switchImage",switchImageHandle);
			// bind to the call for dragging/updating shapes
			$("body").live("imageShapeUpdate",shapeUpdateHandle);
			
			// bind turnPage events
			$("body").live("turnPage",function(e,val){
				if(val>0){
					TILE.engine.nextPage();
				} else if(val<0){
					TILE.engine.prevPage();
				}
			});
			
			$("body").live("shapeIsDrawn",function(e,shape){
				// send to the local receiveShapeObj handler
				_receiveShapeObjHandle(shape);
			});
			
			$("body").live("shapeIsActive",function(e,shape){
				
				if(!shape) return;
				// feed PC a wrapper for the shape
				var data={
					id:shape.id,
					type:'shapes',
					jsonName:TILE.url,
					obj:shape
				};
				// make active obj
				TILE.engine.attachMetadataDialog(data,"#selBB");
			});
			// bind ENGINE events
			$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
			$("body").live("newActive",{obj:self},self.newActiveHandle);
			$("body").live("newJSON",{obj:self},self.newJSONHandle);
			$("body").live("newPage",{obj:self},self.newPageHandle);
			// $("body").live("dataUpdated",{obj:self},self.dataUpdatedHandle);
			
			// check to see if data has been loaded
			var j=TILE.engine.getJSON(true);
			if(j){
				// data loaded - start up image tagger
				self.itagger.curUrl=TILE.url;
				self.itagger._restart();
			}
			
			// Add title to the azcontenarea
			$("#azcontentarea > .az.inner:eq(0) > .toolbar > .menuitem.pluginTitle").text("Image Tagger");
		} 
	},
	dataAddedHandle:function(e,obj){
		var self=e.data.obj;
		if(obj.type!='shapes') return;
		// if already in manifest, return
		if($.inArray(obj.id,self.itagger.raphael.shapeIds)>=0){
			return;
		}
		shape=obj.obj;
		
		if(self.itagger.curURL!=TILE.url){
			self.itagger.curURL=TILE.url;
			self.itagger.setImage();
		}
		// check to see if any shapes added to activeItems
		var vd=[shape];
		var a=false;
		self.itagger.addNewShapesToStack(shape);
	},
	dataLinkedHandle:function(e,args){
		var self=this;
		
		if((args[0].type=='shapes')||(args[1].type=='shapes')){
			
		}
	},
	newActiveHandle:function(e,obj){
		var self=e.data.obj;
		
		// update URL
		self.itagger.curURL=TILE.url;
		if(obj.obj.posInfo){
			// is a shape - handle differently
			self.itagger.raphael.setActiveShape(obj.obj);
			
		} else {
			var item=obj.obj;
			var vd=[];
			for(var prop in item){
				if(prop.toLowerCase()=='shapes'){
					// add to vd
					for(var shape in item[prop]){
						vd.push(item[prop][shape]);
					}
				}
			}	
			
			// add new shapes
			self.itagger.loadNewShapes(vd);
		}
	},
	newJSONHandle:function(e){
		var self=e.data.obj;
		self.itagger.curUrl=TILE.url;
		self.itagger.eraseAllShapes();
		var shapes=self.findShapesInJSON(TILE.engine.getJSON());
		
		self.itagger._restart(shapes);
	},	
	findShapesInJSON:function(json){
		var self=this;
		
		if(!json.pages) return;
		
		var arr=[];
		for(var p in json.pages){
			if(json.pages[p].shapes&&($.isArray(json.pages[p].shapes))){
				for(var sh in json.pages[p].shapes){
					var shape=json.pages[p].shapes[sh];
					if((!shape)||(!shape.id)){
						continue;
					} else {
						// correctify the posInfo
						if(shape._scale!=TILEIMGSCALE){
							for(var prop in shape.posInfo){
								if(/(c)(r)x|(c)(r)y|width|height/.test(prop)){
									var diff=(TILEIMGSCALE*shape.posInfo[prop])/shape._scale;
									shape.posInfo[prop]=diff;
								}
							}
							shape._scale=TILEIMGSCALE;
						}
						
						arr.push(shape);
					}
				}
				
			}
		}
		return arr;
	},
	newPageHandle:function(e){
		var self=e.data.obj;
		self.itagger.curUrl=TILE.url;
		self.itagger._restart(TILE.activeItems);
		
	},
	// updates the shape when it's moved
	dataUpdatedHandle:function(e,obj){
		var self=e.data.obj;
		if(__v) console.log('data updated in imagetagger  '+JSON.stringify(obj));
		if(obj.type=='shapes'){
			self.itagger.updateData(obj);
			
		}
	},
	// Listens for the ObjectChange event call
	// e: {Object}
	// data :{Object} 
	_objChangeHandle:function(e,data){
		
		if(data.obj.type!="shapes") return;
		var self=e.data.obj;
		
		// right now, can only change the color
		if(data.type=='color'){
			if(data.value==null) return;
			self.itagger.raphael.changeShapeColor(data.value,data.obj.id);
		}
	
	},
	deleteSelf:function(data){
		var self=this;
		if(data.type=="shapes"){
			if(__v) console.log("removing the shape");
			self.itagger.raphael._deleteItemHandle(data.id);
		} else {
			self.itagger.raphael._deleteLinkHandle(data);
		}
		$("#selBB").remove();
	},
	
	// string that represents the trigger event that is called
	// once close is complete
	done:"closeOutITag",
	_close:"closeITAG"
};

// register the plugin with TILE
TILE.engine.registerPlugin(IT);
