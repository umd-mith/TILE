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
		$("#"+self.loc).append("<div class=\"az inner\"><div class=\"toolbar\"><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"pointer\" class=\"btnIconLarge inactive\" title=\"Select\"></a></li></ul><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"rect\" class=\"btnIconLarge inactive\" title=\"Rectangle\"></a></li>"+
			"<li><a href=\"#\" id=\"poly\" class=\"btnIconLarge inactive\" title=\"Polygon\"></a></li>"+
			"<li><a href=\"#\" id=\"elli\" class=\"btnIconLarge inactive\"  title=\"Ellipse\"></a></li>"+
			"</ul><ul class=\"menuitem\"><li><a href=\"#\" id=\"zoomIn\" class=\"btnIconLarge\" title=\"Zoom In\"></a></li>"+
			"<li><a href=\"#\" id=\"zoomOut\" class=\"btnIconLarge\" title=\"Zoom Out\"></a></li></ul><ul class=\"menuitem\">"+
			"<li><a href=\"#\" id=\"pgPrev\" class=\"button\" title=\"Go One Image Back\">Prev</a></li><li><a href=\"#\" id=\"pgNext\" class=\"button\" title=\"Go One Image Forward\">Next</a></li>"+
			"<li><a class=\"button\" title=\"See a List of All Images\"><span id=\"listView\" class=\"listView\">List view</span></a></li></ul>"+
			"</div><div class=\"workspace\"></div></div>");
		//global bind for when the VectorDrawer in raphaelImage is completed
		$("body").live("VDCanvasDONE",{obj:this},this.createShapeToolBar);
		//received from ImportDialog box
		// if(!this.JSONlist)	$("body").bind("loadImageList",{obj:this},this.ingestImages);
		//global bind relating to the event passed by ImageList
		$("body").bind("switchImage",{obj:this},this.switchImageHandler);
		//global bind for when user adds a new image through NewImageDialog
		$("body").bind("newImageAdded",{obj:this},this.addNewImage);
		//global bind for when user clicks on the ShapeToolBar button 'imagelist'
		$("body").bind("showImageList",{obj:this},this.showImageList);
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
		self.setHTML();
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
			$("#"+this.loc+" > .az.inner > .workspace").attr("id","raphworkspace_");
			
			
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
			
		
			if(self.JSONlist){
				self.raphael.addUrl(self.JSONlist);
			
				$("body").trigger("imageAdded");
			}
			
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
			if(__v) console.log("VDCANVASDONE");
			var obj=e.data.obj; //@this
			$("body").unbind("VDCanvasDONE",obj.createShapeToolBar); //remove the bind - done only once

			//prepare the toolbar area
			$("#"+obj.loc+" > .az.inner > .toolbar").attr("id","raphshapebar_");
			
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
		// e : {Event}
		showImageList:function(e){
			var obj = e.data.obj;
			obj.imageList.show(obj.raphael.url);
		},
		inputData:function(ref,obj){
			var self=this;
			self.raphael._addLinkHandle(ref,obj);
		},
		getLink:function(){
			// only outputs - doesn't provide link metadata
			return false;
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
			"<span class=\"imgView\">Img view</span></a></li></ul></div><div class=\"list az\"><ul></ul></div><div class=\"image\"><img src=\"\"></div>").appendTo("#"+self.loc);
			
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
			
			$("#"+self.loc+" > div.az").hide();
			$(".az.inner.textImageList").show();
			// $(".az.inner.textImageList > .toolbar > ul > #imgNameDisplay").text($("#srcImageForCanvas").attr('src'));
			
			// For each page item in the JSON data, create a separate
			// title listing for that item
			for (var i=0;i<data.length;i++){
				
				var title=(data[i].title)?data[i].title:null;
				if(!title){
					//create a title from the url
					var p=data[i].url.split('/');
					title=p[(p.length-1)];
				}
				 $("<li><a href='"+data[i].url+"'>"+title+"<\/a></li>").appendTo(".az.inner.textImageList > .list > ul");	
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
				$("#"+self.loc+" > .az.inner.textImageList").remove();
				$("#"+self.loc+" > div.az").show();
			});
			$(".az.inner.textImageList > .toolbar > ul.menuitem > li > a > span.imgView").click(function(e){
				e.preventDefault();
				//go back without changing the image 
				$("#"+self.loc+" > .az.inner.textImageList").remove();
				$(".ui-dialog").hide();
				$("#"+self.loc+" > div.az").show();
				
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
			this.pageNext.live('mousedown click',function(e){
				$(this).trigger("turnPage",[1]);
			});
			this.pagePrev=$("#pgPrev");
			this.pagePrev.live('mousedown click',function(e){
				if(__v) console.log("pagprev clicked");
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
		//creates ColorPicker from plugin code
		// setUpColorPicker:function(){
		// 		//html elements
		// 
		// 		this.colorWidgetB=$("#customWidget");
		// 		//NEW: attaching to SVG element
		// 		this.colorSelect=$("#colorSelector2");
		// 		//change main css of colorpicker so that it shows up above the canvas
		// 		this.colorPicker=$("#colorpickerHolder2").css("z-index","1001");
		// 
		// 		//this.colorPicker=$("<div id=\"colorpickerHolder2\"></div>").insertBefore($("svg"));
		// 
		// 
		// 		this.CP=this.colorPicker.ColorPicker({
		// 			flat: true,
		// 			color: '#000000',
		// 			onSubmit: this.onCPSubmit
		// 		});
		// 		$('#colorSelectorBkgd').css('background-color', '#000000');
		// 		$("body:first").trigger("NEWSHAPECOLOR",['000000']);
		// 		this.clickColorSubmit=$(".colorpicker_submit");
		// 		this.clickColorSubmit.bind("click",{obj:this},this.closeWidgetClick);
		// 
		// 		//listeners
		// 		this.widt=false;//toggles on/off mode of colorpicker
		// 		//widt=false=closed
		// 		//widt=true=open
		// 		this.colorWidgetB.bind("click",{obj:this},this.customWidgetClick);
		// 
		// 		this.colorWidgetB.trigger("sideBarDone");
		// 
		// 	},
		// 	//used for opening and closing the ColorPicker plugin
		// 	// e : {Event}
		// 	customWidgetClick:function(e){
		// 		var obj=e.data.obj;
		// 		if(!obj.widt&&(!obj.colorSelect.hasClass("inactive"))){
		// 			$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
		// 			obj.widt = !obj.widt;
		// 			$(this).trigger("closeDownVD",[obj.widt]);
		// 		} else {
		// 			$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
		// 			obj.widt = !obj.widt;
		// 			$(this).trigger("closeDownVD",[obj.widt]);
		// 		}
		// 	},
		// 	// Handles the events for closing the plugin-ColorPicker widget
		// 	// e : {Event}
		// 	closeWidgetClick:function(e){
		// 		e.stopPropagation();
		// 		var obj=e.data.obj;
		// 		$('#colorpickerHolder2').stop().animate({height:0}, 500);
		// 		obj.widt=false;
		// 		obj.DOM.trigger("closeDownVD",[obj.widt]);
		// 		//reset canvas drawer
		// 		obj.DOM.trigger("changeShapeType",[obj.shapeType]);
		// 		// if(!obj.rect.hasClass("inactive")){
		// 		// 		obj.colorPicker.trigger("changeShapeType",['rect']);
		// 		// 	} else if(!obj.poly.hasClass("inactive")){
		// 		// 		obj.colorPicker.trigger("changeShapeType",['poly']);
		// 		// 	} else if(!obj.elli.hasClass("inactive")){
		// 		// 		obj.colorPicker.trigger("changeShapeType",['elli']);
		// 		// 	}
		// 	},
		// 	// After user selects a color, this is activated and fires "NEWSHAPECOLOR"
		// 	// event which passes new hexidecimal color value to other objects
		// 	// hsb : {String}
		// 	// hex : {Integer} - value we're interested in
		// 	// rgb : {String} - (r,g,b) representation of color
		// 	onCPSubmit:function(hsb,hex,rgb){
		// 		$('#colorSelectorBkgd').css('background-color', '#' + hex);
		// 		$('body').trigger("NEWSHAPECOLOR",[hex]);
		// 		$('#colorpickerHolder2').stop().animate({height:0}, 500);
		// 	},
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
			//master array
			this.manifest=[];
			this.curUrl=null;
			this._imgScale=1;
			//array holding shapes, their data, and what tag they relate to
			this.tagData=[];
			this.curTag=null;
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
			$("#srcImageForCanvas").hide();
			// make sure to get rid of all shpButtonHolders
			$(".shpButtonHolder").remove();
			self._loadPage.appendTo($("#raphael"));
			if(url.indexOf('http')) url=url.substring(url.indexOf('http'));
			if(self.drawTool) self.drawTool.clearShapes();
			if(/\.js|\.html|\.JSP|\.jsp|\.JS|\.PHP|\.php|\.HTML|\.HTM|\.htm/.test(url)) return;
			$("#srcImageForCanvas").bind('load',function(e){
				$(this).show();
				$("#srcImageForCanvas").unbind("load");
				if(!self.drawTool){
					//set up drawing canvas
					self.setUpDrawTool();
					self._imgScale=self.drawTool._scale; //make sure scales are synched
				} else {
					//clear all shapes from the previous image
					self.drawTool.clearShapes();
				}
				if(loadShapes) self.drawTool.importShapes(loadShapes);
				$(".vd-container:first").width($("#srcImageForCanvas")[0].width);
				$(".vd-container:first").height($("#srcImageForCanvas")[0].height);
				if(self.manifest[url]){
					self.manifest[url].origWidth=$("#srcImageForCanvas")[0].width;
					self.manifest[url].origHeight=$("#srcImageForCanvas")[0].height;
					if(!self.manifest[url].shapes) self.manifest[url].shapes=[];
				}
				self._imgScale = 1;
				self.drawTool._scale=1;
				if(self.curUrl!=url) self.curUrl=url;
				self._loadPage.remove();
			}).attr("src",url);	
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
			self.drawTool=new VectorDrawer({"overElm":$("#"+self.loc.attr('id')+" > #raphael"),"initScale":self._imgScale}); 
			// for when all temp lines have been approved
			self.approved=false;
			//set up triggers
			$("body").bind("zoom",{obj:self},self.zoomHandle);
			$("body").bind("changeShapeType",{obj:self},function(e,m){
				self.drawTool._drawMode=m; //either r,e,p, or s
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
			// global bind for when a new shape is drawn in VectorDrawer [VectorDrawer.js]
			$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
			// global bind for when [Transcript.js] is sending shape ids to imageTagger
			$("body").bind("loadItems",{obj:this},this._loadShapesHandle);
			// global bind for when a user makes some kind of link
			$("body").bind("addLink",{obj:this},this._addLinkHandle);
			// global bind for when a user deletes a link - cancel out custom events for deleting shape links
			$("body").bind("deleteLink",{obj:this},this._deleteLinkHandle);
			// global bind for when user interacts with the colorPicker [TILEShapeToolBar]
			// $("body").bind("NEWSHAPECOLOR",{obj:this},this._newColorHandle);
			// global bind for when a shape is dragged/resized
			$("body").bind("shapeChanged",{obj:this},this._shapeChangeHandle);
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
				if(__v) console.log("clicked on delete for "+foundID);
				var foundID=$(this).attr('id');
				if(/^D\_/.test(foundID)){
					// Auto Line - only need to shift lines
					self._shiftAutoLines(foundID);
					$(".shpButtonHolder > #approveAllButton").remove();
					$("div[id^='approve_']").remove();
					return;
				}
				
				
				self.drawTool.deleteShape(foundID);
				$("body:first").trigger("shapeDeleted",[foundID]);
			});
			$("div[id^='approve_']").live('mousedown',function(e){
				var uid=$(this).attr("id").replace("approve_","");
			
				self._approveItemHandle(uid);
				$(".shpButtonHolder > #approveAllButton").remove();
				$("div[id^='approve_']").remove();
				$("#approveAllButton").remove();
			});
			$(".shpButtonHolder > #approveAllButton").live('click',function(e){
				// var id=$(this).attr("id").replace("approveAll_","");
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
			var url=TILEPAGE;
			// change in own manifest
			var vd=self.drawTool.exportShapes();
			
			// only need to change posInfo
			for(var v in vd){
				var id=vd[v].id;
				for(var sh in self.manifest[sh]){
					if(self.manifest[sh].id==id){
						
						self.manifest[sh].posInfo=vd[v].posInfo;
						
						break;
					}
				}
				
			}
		},
		// Called whenever a user clicks on an object while VectorDrawer
		// is in 's' mode
		// e : {Event} - shapeActive
		// shape : {Object}
		_shapeActiveHandle:function(e,shape){
			var self=e.data.obj;
			var url=TILEPAGE;
			$(".shpButtonHolder").remove();
			var foundID=$(shape.node).attr('id');
			// find shape reference in manifest
			for(var sh in self.manifest){
				if(self.manifest[sh].id==foundID){
					shape=self.manifest[sh];
					break;
				}
			}
			
			if(__v) console.log(foundID+" shape active handle for: "+shape);
			// notify that this has been clicked
			// $("body:first").trigger("receiveShapeObj",[{"id":id,"type":"shapes",attachHandle:"#selBB"}]);
			if(/^D\_/.test(shape.id)){
				// disable draggable and resizable from selBB - user has to approve a line before being 
				// able to drag/resize it
				
				// temp line - apply necessary buttons:
				// Approve
				// Approve All
				$("<div id=\"approve_"+foundID+"\" class=\"button shape\">Approve</div>").appendTo($(".shpButtonHolder"));
				
				$("<div id=\"approveAllButton\" class=\"button shape\">Approve All</div>").appendTo($(".shpButtonHolder"));
				
			} else {
				$("body:first").trigger("receiveShapeObj",[shape]);
			}
			
			// for(x in self.manifest[url].shapes){
			// 			if(self.manifest[url].shapes[x]&&(self.manifest[url].shapes[x].id==shape.id)){
			// 				
			// 				var foundID=id;
			// 				// if(__v) console.log("shape "+id+" clicked on. found: "+self.manifest[url].shapes[x].id+"  : "+foundID);
			// 				// if($(".shpButtonHolder > #"+foundID).length) return;
			// 				// $("#selBB").html("");
			// 				if($(".shpButtonHolder > #"+foundID).length==0){
			// 					if(__v) console.log('attaching delete button');
			// 					// attach delete button
			// 					$("<div class=\"shpButtonHolder\"><div id=\""+foundID+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
			// 						// set left and top properties - can't be above the fold of the canvas
			// 
			// 						var left=$("#selBB").position().left;
			// 						var top=$("#selBB").position().top-$(".shpButtonHolder").height();
			// 						if((left+$(".shpButtonHolder").width())>$(document).width()){
			// 							left=left-$(".shpButtonHolder").width();
			// 						}
			// 						if(top<$(".vd-container").position().top){
			// 							top=$("#selBB").position().top;
			// 						}
			// 						$(".shpButtonHolder").css("left",left+'px');
			// 						$(".shpButtonHolder").css("top",(top)+'px');
			// 				}
			// 				
			// 				
			// 		}
		},
		// Called by the receiveShapeObj event
		// e : {Event}
		// shpObj : {Object} - array of shape values
		_shapeDrawnHandle:function(e,shpObj){
			var self=e.data.obj;
			if(__v) console.log("shape is drawn: "+shpObj.id);
			var url=TILEPAGE;
			// if(!self.manifest[url]) self.manifest[url]={shapes:[]};
			// clear out the selBB element
			$(".shpButtonHolder").remove();
			
			// just export all the shapes out and load into transcript line
			// var vd=self.drawTool.exportShapes();
			// 		for(i in vd){
			// 			vd[i]=vd[i].id;
			// 		}
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
			
			
			// select shape
			self.drawTool.selectShape(shpObj.id);
			$("#rect").removeClass("active");
			$("#poly").removeClass("active");
			$("#elli").removeClass("active");
			$("#pointer").addClass("active");
			// attach additional buttons
			$("<div class=\"shpButtonHolder\"><div id=\""+shpObj.id+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
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
			$(".shpButtonHolder").css("top",(top)+'px');
					
			// take shape data and pass to listening objects
			$("body:first").trigger("receiveShapeObj",[shpObj]);
		
		
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
			if(__v) console.log("loadShapes receives json: "+json);
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
		// adds a reference to this shape
		// e : {Event}
		// ref : {Object} reference that includes two properties:
		// id : {String}
		// type : {String}
		_addLinkHandle:function(ref,shape){
			if(ref.type=='shapes') return;
			var self=this;
			if(!$(".shpButtonHolder").length) return;
			// add the link to the currently selected shape
			// find id for current shape first
			var id=$(".shpButtonHolder").children("div.button:eq(0)").attr("id");
			var url=$("#srcImageForCanvas").attr("src");
			
			// if($(".shpButtonHolder > div.button.shape > #delete_"+ref.id).length) return false;
			// $(".shpButtonHolder").append($("<div class=\"button shape\">"+ref.display+"<span id=\"delete_"+ref.id+"\" class=\"button shape delete\">X</span></div>"));
			// var foundShape=null;
			// add to the manifest for this shape
			for(var sh in self.manifest[url].shapes){
				if(!self.manifest[url].shapes[sh]) continue;
				if(self.manifest[url].shapes[sh].id==shape.id){
					// foundShape=self.manifest[url].shapes[sh];
					if(!self.manifest[url].shapes[sh][ref.type]) self.manifest[url].shapes[sh][ref.type]=[];
					if(__v) console.log("attaching "+ref.id+"  to: "+self.manifest[url].shapes[sh].id+"  in imagetagger");
					self.manifest[url].shapes[sh][ref.type].push(ref);
				}
			}
		
		},
		_deleteLinkHandle:function(ref,shape){
			if(ref.type=='shapes') return;
			var self=this;
			if(__v) console.log("deleteLinkHandle called with: "+ref.id);
			var url=$("#srcImageForCanvas").attr('src');
			for(var sh in self.manifest[url].shapes){
				if(!self.manifest[url].shapes[sh]) continue;
				// var shape=self.manifest[url].shapes[sh];
				// if(__v) console.log('shape '+ref.type+": "+shape[ref.type]);
				// 				if(!shape[ref.type]) continue;
				if(self.manifest[url].shapes[sh].id==shape){
					var fshape=self.manifest[url].shapes[sh];
					for(var x in fshape[ref.type]){
						if(fshape[ref.type][x].id==ref.id){
							if(__v) console.log("found: "+fshape[ref.type][x]);
							if(fshape[ref.type].length>1){
								// get rid of link in reference array
								var ac=[];
								for(var r in fshape[ref.type]){
									if(r==x) continue;
									ac.push(fshape[ref.type][r]);
								}
								fshape[ref.type]=ac;
								// var ac=fshape[ref.type].slice(0,x);
								// 								var bc=fshape[ref.type].slice((x+1));
								// 								fshape[ref.type]=ac.concat(bc);
							} else {
								fshape[ref.type]=[];
							}
							if(__v) console.log("after link delete imagetagger: "+fshape[ref.type]);
							break;
						}
					}
				}
			}
			
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
				if(n>0){
					$("#srcImageForCanvas").css("width",(1.25*parseFloat($("#srcImageForCanvas").width()))+'px');
					//$("#srcImageForCanvas").height(1.25*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(1.25*parseFloat($(".vd-container").width()));
					$(".vd-container").height(1.25*parseFloat($(".vd-container").height()));
					//zooming in
					self.drawTool.scale(1.25); 
					if($(".shpButtonHolder").length){
						// also change positon of .shpButtonHolder
						$(".shpButtonHolder").css('left',($(".shpButtonHolder").position().left*1.25)+'px');
						$(".shpButtonHolder").css('top',($(".shpButtonHolder").position().top*1.25)+'px');
					}
					self._imgScale*=1.25;
				} else if(n<0){
					$("#srcImageForCanvas").css("width",(0.75*parseFloat($("#srcImageForCanvas").width()))+'px');
					//$("#srcImageForCanvas").height(0.75*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(0.75*parseFloat($(".vd-container").width()));
					$(".vd-container").height(0.75*parseFloat($(".vd-container").height()));
					//zooming out
					self.drawTool.scale(0.75); 
						// also change positon of .shpButtonHolder
						if($(".shpButtonHolder").length){
							$(".shpButtonHolder").css('left',($(".shpButtonHolder").position().left*0.75)+'px');
							$(".shpButtonHolder").css('top',($(".shpButtonHolder").position().top*0.75)+'px');
						}
					self._imgScale*=0.75;
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
				var vd=[];
				// check to see if shapes in passed data array
				// match up with any in the manifest
				
				for(var j in json){
					for(var p in self.manifest){
						if(json[j].id==self.manifest[p].id){
							// update item
							self.manifest[p]=json[j];
							vd.push(self.manifest[p]);
						}
					}
				}
				if(__v) console.log("found shapes going to drawTool: ");
				if(__v) console.log(JSON.stringify(vd));
				// wipe out other shapes
				self.setUpCanvas(url,vd);
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
	
	// AutoRecLine
	// Expands Shape class
	// For lines that are fed back from the auto-recognizer
	// contains properties to automatically scale the set of lines
	// up or down
	var AutoRecLine=function(args){
			this.coords=[];
			this.index=args.index;
			this.Top=args.initialTop;
			this.Right=0;
			this.Left=args.initialLeft;
			this.Bottom=0;
			this.hMid = 0; // horizontal midpoint
			this.vMid = 0; // vertical midpoint
			this.foundOnRow = (typeof args.foundOnRow=="string")?parseInt(args.foundOnRow.substring(1),10):args.foundOnRow;
			
			this.uid=args.data.id;
			this._obj=args.data;
			this.DOM=$("#lineBox_"+this.uid);
			this.DOM.remove().appendTo("#raphael");
			this.DOM.bind("mousedown",{obj:this},this.clickHandle);
		
			// if(this._obj.imgScale){
			// 				this.resizeData(this._obj.imgScale);
			// 			}
			$("body").bind("zoom",{obj:this},this.zoomHandle);
			
		};
		
	AutoRecLine.prototype={
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
		},
		resizeData:function(newScale){
			var self=this;
			var wx=($("#srcImageForCanvas")[0].width*newScale)/($("#srcImageForCanvas")[0].width*self._obj._scale);
			var wy=($("#srcImageForCanvas")[0].height*newScale)/($("#srcImageForCanvas")[0].height*self._obj._scale);
			self.DOM.css({"left":(parseFloat(self.DOM.css("left"))*wx)+'px',"top":(parseFloat(self.DOM.css("top"))*wy)+'px'});
			self.DOM.width(self.DOM.width()*wx);
			self.DOM.height(self.DOM.height()*wy);
			self._obj._scale=newScale;
			// attach new scale to the DOM element - needed for re-organizing elements
			$.data(self.DOM,"_scale",newScale);
		},
		// When user clicks the DOM object, fires event and
		// sets up DOM to be resizeable and draggable
		// e : {Event}
		clickHandle:function(e){
			var self=e.data.obj;
			self.DOM.trigger("autoLineClick",[self.uid]);
			
			self.DOM.draggable();
			self.DOM.resizeable({
				handles:'all'
			});
			$(document).click(function(e){
				var x=e.pageX;
				var y=e.pageY;
				if((x<(self.DOM.position().x-5))||(x>(self.DOM.position().x+self.DOM.width()+5))||
				(y<(self.DOM.position().y-5))||(y>(self.DOM.position().y+self.DOM.height()+5))){
					self.DOM.draggable("destroy");
					self.DOM.resizeable("destroy");
				}
				
			});
		},
		// e : {Event}
		// n : {Integer} value of -1 or 1
		zoomHandle:function(e,n){
			var self=e.data.obj;
			if(n<0){
				self.DOM.width(self.DOM.width()*0.75);
				self.DOM.height(self.DOM.height()*0.75);
				var left=parseInt(self.DOM.css('left'),10)*0.75;
				var top=parseInt(self.DOM.css('top'),10)*0.75;
				self.DOM.css({'left':left+'px','top':top+'px'});
				self._obj._scale*=0.75;
			} else if(n>0){
				self.DOM.width(self.DOM.width()*1.25);
				self.DOM.height(self.DOM.height()*1.25);
				var left=parseInt(self.DOM.css('left'),10)*1.25;
				var top=parseInt(self.DOM.css('top'),10)*1.25;
				self.DOM.css({'left':left+'px','top':top+'px'});
				self._obj._scale*=1.25;
			}
		},
		// Convert the DOM data into a JSON shape object
		convertToJSON:function(){
			var self=this;
			var left=parseInt(self.DOM.css('left'),10)-$("#azcontentarea > .az.inner").scrollLeft();
			var top=parseInt(self.DOM.css('top'),10)-($("#azcontentarea > .az.inner").scrollTop()+$("#azcontentarea > .az.inner > .toolbar").innerHeight());
			var posInfo={'x':left,'y':top,'width':self.DOM.width(),'height':self.DOM.height()};
			
			var json={'id':self.uid,'type':'rect','_scale':self._obj._scale,'color':"#000",'posInfo':posInfo};
			return json;
			
			
		},
		// Convert to NULL
		destroy:function(){
			var self=this;
			self.DOM.remove();
			self.uid=null;
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
	
	// start(id,base,json): creates the imagetagger. Takes id (string representing
	// DOM location of tagger), base (string representing location of images - provided by TILE), and json
	//  (either null or JSON object representing TILE JSON data)
	start:function(engine){
		var self=this;
		
		var _shapeDeletedHandle=function(){
			if(/^D\_/.test(data)) return;
			// $("body:first").trigger(self.deleteCall,[{"id":data,"type":"shapes",parentTool:"none",tool:self.id,level:'page'}]);
			// switch toolbar back to drawing mode
			// switch back to drawing mode
			if(!$("#rect").hasClass("active")){ 
				$("#rect").addClass("active");
				$("#elli").removeClass("active");
				$("#poly").removeClass("active");
				$("#pointer").removeClass("active");
				self.itagger.ShapeToolBar.shapeType='r';
				// $("body:first").trigger("changeShapeType",['r']);
				// get rid of selection box
				$("#selBB").remove();
				$(".ui-dialog").hide();
			}
		};
		
		var _receiveShapeObjHandle=function(shape){
			if(__v) console.log('receiveShp:  '+shape);
			// feed PC a wrapper for the shape
			var data={
				id:shape.id,
				type:'shapes',
				attachHandle:'#selBB',
				jsonName:TILEPAGE,
				obj:shape
			};
			if(__v) console.log("sending data from imagetagger to engine: ");
			if(__v) console.log(JSON.stringify(data));
			// send directly to engine
			engine.insertData(data);
			// $("body:first").trigger(self.outputCall,[data]);
		};
		
		var json=engine.getJSON();
		if(!self.itagger){
			// var id="azcontentarea"; //defaults to TILE page
			this.itagger=new _Itag({loc:"azcontentarea",json:(json)?json:null});
			this.linkManifest=[];
			// global bind for receiving shape objects
			// $("body").bind("receiveShapeObj",{obj:self},_receiveShapeObjHandle);
			$("body").bind("shapeDeleted",{obj:self},_shapeDeletedHandle);
			$("body").bind("deleteShapeLink",{obj:self},function(e,data){
				// handle deleting a reference within a shape to another tool
				// data.parentTool=self.id;
				// var shid=$(".shpButtonHolder > .button:eq(0)").attr("id");
				// data.parentObj=shid;
				// data.parentType="shapes";
				// var url=$("#srcImageForCanvas").attr('src');
				// 				if(!self.linkManifest[url]) self.linkManifest[url]=[];
				// 				if(!self.linkManifest[url][data.parentObj]) self.linkManifest[url][data.parentObj]=[];
				// 				var ac=[];
				// 				$.each(self.linkManifest[url][data.parentObj],function(i,o){
				// 					if(data.id!=o.id){
				// 						ac.push(o);
				// 					}
				// 				});
				// 				self.linkManifest[url][data.parentObj]=ac;
				
				data.jsonName=self.itagger.curURL;
				
				$("body:first").trigger(self.deleteCall,[data]);
			});
			$("body").bind("ObjectChange",{obj:self},self._objChangeHandle);
			
			// bind turnPage events
			$("body").live("turnPage",function(e,val){
				if(val>0){
					engine.nextPage();
				} else if(val<0){
					engine.prevPage();
				}
			});
			
			$("body").live("receiveShapeObj",function(e,shape){
				// send to the local receiveShapeObj handler
				_receiveShapeObjHandle(shape);
			});
			
			// bind ENGINE events
			$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
			$("body").live("newActive",{obj:self},self.newActiveHandle);
			$("body").live("newJSON newPage",{obj:self},self.newJSONHandle);
			
			// set up image tagger activator button
			var button={
				id:'setUpIT1000',
				display:"Make Shapes",
				click:function(e){
					e.preventDefault();
					// close down any other az_log areas
					$("#az_log > .az.inner:eq(1)").hide();
					
					
					// restart function
					$("#az_log > .az.inner:eq(0)").show();
					// activate shape toolbar
					$(".toolbar > ul > li > #pgPrev").show();
					$(".toolbar > ul > li > #pgNext").show();
					$(".toolbar > ul > li > #pointer").show();
					$(".toolbar > ul > li > a > #listView").parent().show();
					$(".toolbar > ul > li > #rect").parent().parent().show();
					var data=engine.getJSON();
					self.itagger._restart(data);
					$("#az_transcript_area").show();
					$("#az_activeBox").show();
					$("#raphworkspace_").width($("#azcontentarea").width());
					$("#raphworkspace_").height($("#azcontentarea").height());
				}
			};
		} 
	},
	dataAddedHandle:function(e,o){
		var self=e.data.obj;
		self.itagger.curURL=TILEPAGE;
		self.itagger._restart(o.activeItems);
		
	},
	newActiveHandle:function(e,o){
		var self=e.data.obj;
		self.itagger.curURL=TILEPAGE;
		self.itagger._restart(o.activeItems);
	},
	newJSONHandle:function(e,o){
		var self=e.data.obj;
		
		self.itagger.curURL=TILEPAGE;
		self.itagger._restart(o.activeItems);
		
	},
	loadJSON:function(engine,activeItems){
		var self=this;
		// load current page of images
		// var data=engine.getJSON(true);
		
		// parse data
		self.itagger.curURL=TILEPAGE;
		self.itagger._restart(activeItems);
		
	},
	
	// Listens for the ObjectChange event call
	// e : {Object} 
	// data : {Object} : {value: {String}, type: {String}}
	_objChangeHandle:function(e,data){
		if(data.obj.type!="shapes") return;
		var self=e.data.obj;
		// right now, only accept color changes to border of shapes
		if(data.type=='color'){
			if(data.value==null) return;
			// change color of current shape
			self.itagger.raphael.changeShapeColor(data.value,data.obj.id);
		}
		
	},
	
	// _shapeDeletedHandle:function(e,data){
	// 		var self=e.data.obj;
	// 		if(/^D\_/.test(data)) return;
	// 		// $("body:first").trigger(self.deleteCall,[{"id":data,"type":"shapes",parentTool:"none",tool:self.id,level:'page'}]);
	// 		// switch toolbar back to drawing mode
	// 		// switch back to drawing mode
	// 		if(!$("#rect").hasClass("active")){ 
	// 			$("#rect").addClass("active");
	// 			$("#elli").removeClass("active");
	// 			$("#poly").removeClass("active");
	// 			$("#pointer").removeClass("active");
	// 			self.itagger.ShapeToolBar.shapeType='r';
	// 			// $("body:first").trigger("changeShapeType",['r']);
	// 			// get rid of selection box
	// 			$("#selBB").remove();
	// 			$(".ui-dialog").hide();
	// 		}
	// 	},
	// Used once the tool has been called once in TILE_ENGINE
	// reveals the canvas area and calls ImageTagger _restart()
	// json : {Object} url-keyed data array for images
	// args : {Object} (optional)
	restart:function(json,args){
		$("#az_log > .az.inner:eq(0)").show();
		// 		// make sure that logbar and activebox are open
		// 		$("#transcript_toolbar").parent(".az.inner").show();
		// 		$("#transcript_toolbar").show();
		
		
		$(".toolbar > ul > li > #pgPrev").show();
		$(".toolbar > ul > li > #pgNext").show();
		$(".toolbar > ul > li > #pointer").show();
		$(".toolbar > ul > li > a > #listView").parent().show();
		$(".toolbar > ul > li > #rect").parent().parent().show();
		this.itagger._restart(json);
		$("#az_transcript_area").show();
		$("#az_activeBox").show();
		$("#raphworkspace_").width($("#azcontentarea").width());
		$("#raphworkspace_").height($("#azcontentarea").height());
	
	},
	// Called in order to hide DOM container of image tagger area 
	close:function(){
		var self=this;
		var mv='-='+$(".az.main > #az_log").width();
		$("#srcImageForCanvas").css("width",""); // cancel out zoomed variable
		// $(".az.main > #az_log").animate({left:mv,opacity:0.25},400,function(e){
			//$(".az.main > #az_log").children().hide();
			self.itagger._closeDown();
			$(".az.main > #az_log > .az.inner:eq(0)").hide();
			$("#az_activeBox").hide();
			// $(".az.main > #az_log").removeClass("log").addClass("tool");
			// $(".az.main > #az_log").animate({opacity:1,left:0},200);
			$("body:first").trigger(self._close);
			
		// });
	},
	// create receiveObj handle
	// _receiveShapeObjHandle:function(shape,engine){
	// 		var self=this;
	// 		// feed PC a wrapper for the shape
	// 		var data={
	// 			id:shape.id,
	// 			type:'shapes',
	// 			attachHandle:'#selBB',
	// 			jsonName:TILEPAGE,
	// 			obj:shape
	// 		};
	// 		
	// 		// send directly to engine
	// 		engine.insertData(data);
	// 		// $("body:first").trigger(self.outputCall,[data]);
	// 	},
	inputData:function(data){
		var self=this;
		// add the link data to the linkManifest - links the reference to it's tool ID
		var url=$("#srcImageForCanvas").attr('src');
		// if(!self.linkManifest[url]) self.linkManifest[url]=[];
		// 		if(!self.linkManifest[url][data.obj.id]) {
		// 			self.linkManifest[url][data.obj.id]=[];
		// 			
		// 			self.linkManifest[url][data.obj.id].push(data.ref);
		// 			
		// 		} else {
		// 			for(var x in self.linkManifest[url][data.obj.id]){
		// 				if(self.linkManifest[url][data.obj.id][x].id==data.ref.id){
		// 					return;
		// 					break;
		// 				}
		// 				
		// 			}
		// 			self.linkManifest[url][data.obj.id].push(data.ref);
		// 		}
		self.itagger.inputData(data.ref,data.obj);
		// switch back to drawing mode
		if(!$("#rect").hasClass("active")){ 
			$("#rect").addClass("active");
			$("#elli").removeClass("active");
			$("#poly").removeClass("active");
			$("#pointer").removeClass("active");
			self.itagger.ShapeToolBar.shapeType='r';
			$("body:first").trigger("changeShapeType",['r']);
			// get rid of selection box
			// $("#selBB").remove();
		}
	},
	// remove the referenced data from 
	// the referenced shape's array
	removeData:function(ref,shape){
		var self=this;
		if(__v) console.log("removing ref from shape "+shape);
		var url=$("#srcImageForCanvas").attr('src');
		if(!self.linkManifest[url]) {
			self.linkManifest[url]=[];
			return;
		}
		for(var x in self.linkManifest[url][shape]){
			var ac=[];
			if(self.linkManifest[url][shape][x].id!=ref.id){
				ac.push(self.linkManifest[url][shape][x]);
			}
			
		}
		self.linkManifest[url][shape]=ac;
		self.itagger.raphael._deleteLinkHandle(ref,shape);
		
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
	//return JSON of all plugin data for this session
	bundleData:function(j){
		// will return the manifest of url => shapes
		// from RaphaelCanvas
		var itagData=this.itagger.bundleData();
		// deep copy the json file
		var jcopy=$.extend(true,{},j);
		// sort through url => shapes pairs
		for(o in jcopy){
			if(!itagData[o]) continue;
			// if url => [] in passed manifest from TILEENGINE
			if(itagData[o]){
				for(var i in itagData[o]){
					jcopy[o].shapes.push(itagData[o][i]);
				}
			}
		}
		j=jcopy;
		
		return j;
	},
	// Boolean that is set to true once the tool is created
	constructed:false,
	// string that represents the trigger event that is called
	// once close is complete
	done:"closeOutITag",
	_close:"closeITAG"
};