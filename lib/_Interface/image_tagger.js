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
		if(!args.layout) throw "ERROR in setting up imagetagger";
		this.html=args.layout;
		//global bind for when the VectorDrawer in raphaelImage is completed
		$("body").bind("VDCanvasDONE",{obj:this},this.createShapeToolBar);
		//received from ImportDialog box
		if(!this.JSONlist)	$("body").bind("loadImageList",{obj:this},this.ingestImages);
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
			//pre-load the initial html content into loc area - needs .az.inner
			//to be visible
			
			$("#"+self.loc).append(self.html.imagetagger);
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
				html:self.html.imageList,
				loc:self.loc
			});
			
		
			if(self.JSONlist){
				self.raphael.addUrl(self.JSONlist);
			
				$("body").trigger("imageAdded");
			}
			
		},
		//called once the VectorDrawer makes its first build
		//activated by VDCanvasDONE event call
		// e : {Event}
		createShapeToolBar:function(e){
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
				if(/.jpg|.JPG|.gif|.GIF|.png|.PNG|.tif|.TIF/.test(path)){
					obj.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					//obj.Scroller.loadImages([path]);
					$("body").trigger("imageAdded");
				} else if(/.txt/.test(path)){
					
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
				//	obj.canvasImage.addUrl(listarray);
					//update the scroller bar
					//if(obj.Scroller) obj.Scroller.loadImages(obj.raphael.getUrlList());
					$("body").trigger("imageAdded");
				} else {
					//path = json object
					obj.raphael.addUrl(path);
				}
			} else {
				var self=this;
				$("body").trigger("closeImpD");
				if(/.jpg|.JPG|.gif|.GIF|.png|.PNG|.tif|.TIF/.test(path)){
					self.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					//self.Scroller.loadImages([path]);
					$("body").trigger("imageAdded");
				} else if(/.txt/.test(path)){
					var list=$.ajax({
						url:path,
						async:false,
						dataType:'text'
					}).responseText;
					//.replace(/\n+\s+/g,"").split(/,/);
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
			if(self.raphael) self.raphael._restart(json);
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
	var ImageList=Monomyth.Class.extend({
		//constructor
		init:function(args){
			var self=this;
			self.loc=args.loc;
			self.html=args.html;
		},
		//Displays the imagelist - loads HTML if not already loaded
		//@data: {Object} with uris and info on image(s)
		show:function(data){
			var self=this;
			
			if ($("#textImageList").length > 0) {
				$("#textImageList").remove();
			}
			
			$("#"+self.loc+" > div.az").hide();
			$(self.html).appendTo($("#"+self.loc));
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
				$("#"+self.loc+" > div.az").show();
			});
		}
	});
	
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
	var TILEShapeToolBar=SideToolBar.extend({
		// Constructor
		init:function(args){
			this.$super(args);
			//button to show new image dialog 
			this.showNewImgB=$("#raphshapebar_ > ul.menuitem > li > #addImg").click(function(e){
				e.preventDefault();
				$(this).trigger("openNewImage");
			});
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
			this.pageNext.click(function(e){
				$(this).trigger("turnPage",[1]);
			});
			this.pagePrev=$("#pgPrev");
			this.pagePrev.click(function(e){
				$(this).trigger("turnPage",[-1]);
			});
			//image list
			$("#listView").parent().click(function(e){
				$(this).trigger("showImageList");
			});
			this.setUpColorPicker();

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
		},
		//creates ColorPicker from plugin code
		setUpColorPicker:function(){
			//html elements

			this.colorWidgetB=$("#customWidget");
			//NEW: attaching to SVG element
			this.colorSelect=$("#colorSelector2");
			//change main css of colorpicker so that it shows up above the canvas
			this.colorPicker=$("#colorpickerHolder2").css("z-index","1001");

			//this.colorPicker=$("<div id=\"colorpickerHolder2\"></div>").insertBefore($("svg"));


			this.CP=this.colorPicker.ColorPicker({
				flat: true,
				color: '#000000',
				onSubmit: this.onCPSubmit
			});
			$('#colorSelectorBkgd').css('background-color', '#000000');
			$("body:first").trigger("NEWSHAPECOLOR",['000000']);
			this.clickColorSubmit=$(".colorpicker_submit");
			this.clickColorSubmit.bind("click",{obj:this},this.closeWidgetClick);

			//listeners
			this.widt=false;//toggles on/off mode of colorpicker
			//widt=false=closed
			//widt=true=open
			this.colorWidgetB.bind("click",{obj:this},this.customWidgetClick);

			this.colorWidgetB.trigger("sideBarDone");

		},
		//used for opening and closing the ColorPicker plugin
		// e : {Event}
		customWidgetClick:function(e){
			var obj=e.data.obj;
			if(!obj.widt&&(!obj.colorSelect.hasClass("inactive"))){
				$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
				obj.widt = !obj.widt;
				$(this).trigger("closeDownVD",[obj.widt]);
			} else {
				$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
				obj.widt = !obj.widt;
				$(this).trigger("closeDownVD",[obj.widt]);
			}
		},
		// Handles the events for closing the plugin-ColorPicker widget
		// e : {Event}
		closeWidgetClick:function(e){
			e.stopPropagation();
			var obj=e.data.obj;
			$('#colorpickerHolder2').stop().animate({height:0}, 500);
			obj.widt=false;
			obj.DOM.trigger("closeDownVD",[obj.widt]);
			//reset canvas drawer
			obj.DOM.trigger("changeShapeType",[obj.shapeType]);
			// if(!obj.rect.hasClass("inactive")){
			// 		obj.colorPicker.trigger("changeShapeType",['rect']);
			// 	} else if(!obj.poly.hasClass("inactive")){
			// 		obj.colorPicker.trigger("changeShapeType",['poly']);
			// 	} else if(!obj.elli.hasClass("inactive")){
			// 		obj.colorPicker.trigger("changeShapeType",['elli']);
			// 	}
		},
		// After user selects a color, this is activated and fires "NEWSHAPECOLOR"
		// event which passes new hexidecimal color value to other objects
		// hsb : {String}
		// hex : {Integer} - value we're interested in
		// rgb : {String} - (r,g,b) representation of color
		onCPSubmit:function(hsb,hex,rgb){
			$('#colorSelectorBkgd').css('background-color', '#' + hex);
			$('body').trigger("NEWSHAPECOLOR",[hex]);
			$('#colorpickerHolder2').stop().animate({height:0}, 500);
		},
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
				$("#colorSelector2").removeClass("inactive");
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
				$("#colorSelector2").removeClass("inactive");
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
				$("#colorSelector2").addClass("inactive");
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
				$("#colorSelector2").addClass("inactive");
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
	});
	
	/**
	RaphaelImage

	Using the same features as CanvasImage 
	Using RaphaelJS library for creating a Raphael canvas 

	**USES SVG
	
	new RaphaelImage({loc:{String}})
	
	loc: {String} - Id for parent DOM
	**/

	var RaphaelImage=TILEImage.extend({
		init:function(args){
			this.$super(args);
			var self=this;
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
			$("body").bind("turnPage",{obj:this},this.showImg);
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
		
			
		},
		//gets a new manifest and uses this as the new manifest
		// manifest : {Object}
		setNewManifest:function(manifest){
			var self=this;
			self.manifest=manifest;
			self.url=[];
			for(key in self.manifest){
				
				self.url.push(self.manifest[key]);
				 
			}
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
		setUpCanvas:function(url){
			var self=this;
			// remove CSS from zoom
			$("#srcImageForCanvas").css("width","");
			$("#srcImageForCanvas").hide();
			// make sure to get rid of all shpButtonHolders
			$(".shpButtonHolder").remove();
			self._loadPage.appendTo($("#raphael"));
			if(url.indexOf('http')) url=url.substring(url.indexOf('http'));
			if(self.drawTool) self.drawTool.clearShapes();
			if(/.js|.html|.JSP|.jsp|.JS|.PHP|.php|.HTML|.HTM|.htm/.test(url)) return;
			$("#srcImageForCanvas").load(function(e){
				$(this).show();
				$(this).unbind("load");
				
				if(!self.drawTool){
					//set up drawing canvas
					self.setUpDrawTool();
					self._imgScale=self.drawTool._scale; //make sure scales are synched
				} else {
					//clear all shapes from the previous image
					self.drawTool.clearShapes();
				}
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
				
				$("body:first").trigger("newPageLoaded",[url]);
			}).attr("src",url);	
			
			// $("#imgNameDisplay").text(url);
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
			// global bind for making svg canvas z-index:0
			// $("body").bind("closeDownVD",{obj:this},this.closeSVGHandle);
			// global bind for when [Transcript.js] is sending shape ids to imageTagger
			$("body").bind("loadItems",{obj:this},this._loadShapesHandle);
			// global bind for when a user makes some kind of link
			$("body").bind("addLink",{obj:this},this._addLinkHandle);
			// global bind for when a user deletes a link - cancel out custom events for deleting shape links
			$("body").bind("deleteLink",{obj:this},this._deleteLinkHandle);
			// global bind for when user interacts with the colorPicker [TILEShapeToolBar]
			$("body").bind("NEWSHAPECOLOR",{obj:this},this._newColorHandle);
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
				if(__v) console.log($(ui.helper).attr('id'));
				if($(ui.helper).attr('id')=="selBB"){
					$(".shpButtonHolder").css("left",ui.position.left+'px');
					$(".shpButtonHolder").css("top",ui.position.top+'px');
				}
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
		// e : {Event}
		// cp : {Integer} - hexidecimal color value
		_newColorHandle:function(e,cp){
			var self=e.data.obj;
			self.drawTool.setPenColor("#"+cp);
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
			var url=$("#srcImageForCanvas").attr('src');
			// change in own manifest
			var vd=self.drawTool.exportShapes();
			// only need to change posInfo
			for(var v in vd){
				var id=vd[v].id;
				for(var sh in self.manifest[url].shapes){
					if(self.manifest[url].shapes[sh].id==id){
						self.manifest[url].shapes[sh].posInfo=vd[v].posInfo;
						
						break;
					}
				}
				
			}
			
			
			// $("body:first").trigger("shapesUpdate",[obj]);
		},
		// Called whenever a user clicks on an object while VectorDrawer
		// is in 's' mode
		// e : {Event} - shapeActive
		// id : {String} - ID of shape that was clicked on 
		_shapeActiveHandle:function(e,id){	
			var self=e.data.obj;
			var url=$("#srcImageForCanvas").attr('src');
			for(x in self.manifest[url].shapes){
				if(self.manifest[url].shapes[x]&&(self.manifest[url].shapes[x].id==id)){
					
					var foundID=id;
					// if(__v) console.log("shape "+id+" clicked on. found: "+self.manifest[url].shapes[x].id+"  : "+foundID);
					if($(".shpButtonHolder > #"+foundID).length) return;
					// $("#selBB").html("");
					
					// attach delete button
					$("<div class=\"shpButtonHolder\"><div id=\""+foundID+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
					$(".shpButtonHolder").css("left",$("#selBB").position().left+'px');
					$(".shpButtonHolder").css("top",($("#selBB").position().top-$(".shpButtonHolder").height())+'px');
					
					
				// Delete button handler
					$("#"+foundID).click(function(e){
						// Delete the shape completely and all references to the  shape
						if(__v) console.log("clicked on delete for "+foundID);
						
						if(/^D\_/.test(foundID)){
							// Auto Line - only need to shift lines
							self._shiftAutoLines(foundID);
							return;
						}
						
						
						self.drawTool.deleteShape(foundID);
						$("body:first").trigger("shapeDeleted",[foundID]);
						
					});
					// attach labels if found
					for(var n in self.manifest[url].shapes[x]){
						if(/id|color|type|_scale|posInfo/.test(n)) continue;
						
						for(var r in self.manifest[url].shapes[x][n]){
							var ref=self.manifest[url].shapes[x][n][r];
							$(".shpButtonHolder").append($("<div class=\"button shape\">"+ref.id+"<span id=\"delete_"+ref.id+"\" class=\"button shape\">X</span></div>"));
							// self.manifest[url].shapes[sh][ref.type].push(ref.id);
							$("#delete_"+ref.id).click(function(e){
								
							// 	$(this).remove();
								// delete the link 
								$("body:first").trigger("deleteShapeLink",[{id:ref.id,type:ref.type}]);
								$(this).parent().remove();
							});
						}
						
					}
					
					
					// notify that this has been clicked
					// $("body:first").trigger("receiveShapeObj",[{"id":id,"type":"shapes",attachHandle:"#selBB"}]);
					if(/^D\_/.test(foundID)){
						// temp line - apply necessary buttons:
						// Approve
						// Approve All
						if(__v) console.log("putting approve button for: "+foundID);
						$("<div id=\"approve_"+foundID+"\" class=\"button shape\">Approve</div>").live("click",function(e){
							e.stopPropagation();
							var uid=$(this).attr("id").replace("approve_","");
							
							self._approveItemHandle(uid);
						}).appendTo($("#selBB > .shpButtonHolder"));
						$("<div id=\"approveAllButton\" class=\"button shape\">Approve All</div>").live("click",function(e){
							e.stopPropagation();
							// var id=$(this).attr("id").replace("approveAll_","");
							self._approveAllItemsHandle();
							$("#selBB > .button:eq(1)").remove();
							$("#selBB > .button:eq(2)").remove();
						}).appendTo($("#selBB > .shpButtonHolder"));
					}
					// if(__v) console.log("no of items in ref: "+self.manifest[url].shapes[x].labels);
					// for(item in self.manifest[url].shapes[x]){
					// 						if((!(/posInfo|id|color|type|_scale/.test(item)))&&(self.manifest[url].shapes[x][item]!="")){
					// 							$("<div id=\""+self.manifest[url].shapes[x][item]+"\" class=\"button\">"+self.manifest[url].shapes[x][item]+"</div><span id=\"delete_"+self.manifest[url].shapes[x][item]+"\" class=\"button\">X</span>").appendTo($("#selBB"));
					// 							$("#delete_"+self.manifest[url].shapes[x][item]).click(function(e){
					// 								if(__v) console.log("clicked: "+self.manifest[url].shapes[x][item]);
					// 								// delete the link
					// 								// $("body:first").trigger("deleteLink",[{id:self.manifest[url].shapes[x][item],type:x}]);
					// 								$(this).remove();
					// 								$("#"+self.manifest[url].shapes[x][item]).remove();
					// 							});
					// 						}
					// 					}
					
					
					break;
				}
			}
			if(__v) console.log("------------------------------");
		},
		// Called by the receiveShapeObj event
		// e : {Event}
		// shpObj : {Object} - array of shape values
		_shapeDrawnHandle:function(e,shpObj){
			var self=e.data.obj;
			if(__v) console.log("shape is drawn: "+shpObj.id);
			var url=$("#srcImageForCanvas").attr("src");
			// clear out the selBB element
			$(".shpButtonHolder").remove();
			
			// just export all the shapes out and load into transcript line
			// var vd=self.drawTool.exportShapes();
			// 		for(i in vd){
			// 			vd[i]=vd[i].id;
			// 		}
			if(!self.manifest[url].shapes) self.manifest[url].shapes=[];
			// if(__v) console.log("self.manifest: "+JSON.stringify(self.manifest[url].shapes));
			// take shape and pass it into the internal manifest file
			self.manifest[url].shapes[self.manifest[url].shapes.length-1]=shpObj;
			
			// if(!$(".line_selected").length){
			// 				// erase all shapes - no transcript open
			// 				var vd=[shpObj];
			// 				self.drawTool.clearShapes();
			// 				self.drawTool.importShapes(JSON.stringify(vd));
			// 			}
			
			// select shape
			self.drawTool.selectShape(shpObj.id);
			$("#rect").removeClass("active");
			$("#poly").removeClass("active");
			$("#elli").removeClass("active");
			$("#pointer").addClass("active");
			// attach additional buttons
			$("<div class=\"shpButtonHolder\"><div id=\""+shpObj.id+"\" class=\"button shape\">Delete</div></div>").insertBefore($("svg"));
			
			$(".shpButtonHolder").css("left",$("#selBB").position().left+'px');
			$(".shpButtonHolder").css("top",($("#selBB").position().top-$(".shpButtonHolder").height())+'px');
					
			$("#"+shpObj.id).live("click",function(e){
				
				// Delete Shape Completely - delete all references, too

				if(__v) console.log("delete clicked on for "+shpObj.id);
				self.drawTool.deleteShape(shpObj.id);
				$(".shpButtonHolder").remove();
				$("body:first").trigger("shapeDeleted",[shpObj.id]);
			});
			// take shape data and pass to listening objects
			$("body:first").trigger("receiveShapeObj",[{"id":shpObj.id,"type":"shapes",attachHandle:"#selBB"}]);
		
		
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
			if(__v) console.log("approving item: "+id);
			for(x in self.manifest[url].shapes){
				if(self.manifest[url].shapes[x]&&(self.manifest[url].shapes[x].id==id)){
					
					if(self.manifest[url].shapes[x].id.substring(0,1)=="D"){
						self.manifest[url].shapes[x].color="#000000";
						self.manifest[url].shapes[x].id=self.manifest[url].shapes[x].id.replace("D_","");
						elx=x;
						// replace in current canvas state
						for(v in vd){
							if(vd[v].id==id){
								// replace current temp line with modified one
								vd[v]=self.manifest[url].shapes[x];
							}
						}
					}
				
					
					break;
				}
			}
			if(__v) console.log("Approving a line: "+id);
			//clear all shapes
			self.drawTool.clearShapes();
			// TODO: introduce animation here for shifting/approving of lines?
			if(elx!=null) {
			 	self.drawTool.importShapes(JSON.stringify(vd));
 			}
			$("body:first").trigger("shapeDeleted",[id]);
			$("body:first").trigger("receiveShapeObj",[{id:id.replace("D_",""),type:"shapes"}]);
			// var sendShps=[];
			
			// for(v in vd){
			// 			sendShps.push(vd[v].id);
			// 		}
			// 		// update listener objects with array of ids for set of shapes
			// 		$("body:first").trigger("shapesUpdate",[sendShps]);
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
			for(x in self.manifest[url].shapes){
				if(self.manifest[url].shapes[x].id.substring(0,1)=="D"){
					self.manifest[url].shapes[x].color="#000000";
					self.manifest[url].shapes[x].id=self.manifest[url].shapes[x].id.replace("D_","");
					temp.shapes.push({"old":"D_"+self.manifest[url].shapes[x].id,"curr":self.manifest[url].shapes[x].id});
					total.push(self.manifest[url].shapes[x]);
					// replace in current canvas state
					for(v in vd){
						if(vd[v].id.replace("D_","")==self.manifest[url].shapes[x].id){
							// replace current temp line with modified one
							vd[v]=self.manifest[url].shapes[x];
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
				var shid=json[j];
				for(sh in self.manifest[url].shapes){
					if(self.manifest[url].shapes[sh]&&(self.manifest[url].shapes[sh].id==shid)){
						vd.push(self.manifest[url].shapes[sh]);
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
			if(!$("#selBB").length) return;
			// add the link to the currently selected shape
			// find id for current shape first
			var id=$(".shpButtonHolder").children("div.button:eq(0)").attr("id");
			var url=$("#srcImageForCanvas").attr("src");
			$(".shpButtonHolder").append($("<div class=\"button shape\">"+ref.display+"<span id=\"delete_"+ref.id+"\" class=\"button shape delete\">X</span></div>"));
			// add to the manifest for this shape
			for(var sh in self.manifest[url].shapes){
				if(self.manifest[url].shapes[sh].id==shape.id){
					if(!self.manifest[url].shapes[sh][ref.type]) self.manifest[url].shapes[sh][ref.type]=[];
					if(__v) console.log("attaching "+ref.id+"  to: "+self.manifest[url].shapes[sh].id+"  in imagetagger");
					self.manifest[url].shapes[sh][ref.type].push(ref);
				}
			}
			$("span#delete_"+ref.id).bind("click",function(e){
				// if(__v) console.log("clicked on delete");
				// delete the link 
				$("body:first").trigger("deleteShapeLink",[{id:ref.id,type:ref.type,tool:ref.tool}]);
				$(this).parent().remove();
			});
		},
		_deleteLinkHandle:function(ref){
			if(ref.type=='shapes') return;
			var self=this;
			
			var url=$("#srcImageForCanvas").attr('src');
			for(sh in self.manifest[url].shapes){
				var shape=self.manifest[url].shapes[sh];
				if(!shape[ref.type]) continue;
				for(x in shape[ref.type]){
					if(shape[ref.type][x]==ref.id){
						if(__v) console.log("found: "+shape[ref.type][x]);
						if(shape[ref.type].length>1){
							var ac=shape[ref.type].slice(0,x);
							var bc=shape[ref.type].slice((x+1));
							shape[ref.type]=ac.concat(bc);
						} else {
							shape[ref.type]=[];
						}
						break;
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
			for(obj in self.manifest[url].shapes){
				if(self.manifest[url].shapes[obj]&&(self.manifest[url].shapes[obj].id==id)){
					self.manifest[url].shapes[obj]=null;
				} 
			}
			// delete shape on canvas
			self.drawTool.deleteShape(id);
			
			// export the current shapes
			var vd=self.drawTool.exportShapes();
			// self.manifest[url].shapes=vd;
			// create ID array and pass to other listners
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
			if(!(self.manifest)||(!self.manifest[url].shapes)) return;
			
			var check=false;
			var n=null;
		
			for(x in self.manifest[url].shapes){
				
				if(self.manifest[url].shapes[x]&&(self.manifest[url].shapes[x].id==id)){
					n=parseInt(x,10);
					
					// remove the shape from the canvas
					self.drawTool.deleteShape(id);
					break;
				}
			}
			var vd=self.drawTool.exportShapes();
			var curShapes=[];
			// if not found, return error
			if(n==null) die("Error");
			var newDLine=n;
			if(__v) console.log("shifting shapes upward starting at: "+n);
			// shift all next sibling D_ ids up one
			for(c=(n+1);c<self.manifest[url].shapes.length;c++){
				var shape=self.manifest[url].shapes[c];
				if(!shape) continue;
				if(c==(self.manifest[url].shapes.length-1)){
					// send out deleteLink 
					$("body:first").trigger("deleteShapeLink",[{id:self.manifest[url].shapes[c].id,type:'shapes'}]);
					self.manifest[url].shapes[c]=null;
					
					break;
				}
				
				if(/^[D\_]*/.test(shape.id)){
					if(id==shape.id){
						// erase deleted shape from memory
						var ac=self.manifest[url].shapes.slice(0,c);
						var bc=self.manifest[url].shapes.slice((c+1));
						self.manifest[url].shapes=ac.concat(bc);
						continue;
					}
					// is a temp-line/autoLine, shift
					// create deep copy
					var nObj={};
					$.extend(true,nObj,shape);
					nObj.id=self.manifest[url].shapes[n].id;
					self.manifest[url].shapes[n]=nObj;
					
					if(n==newDLine){
						// add to the current shapes to display when done
						// curShapes.push(shape.id);
						vd.push(nObj);
						newDLine=-5;
						
					} 
					// update pointer
					n=c;
					
				}
			}
			
			for(i in vd){
				curShapes.push(vd[i].id);
			}
			// update canvas
			self.drawTool.clearShapes();
			self.drawTool.importShapes(JSON.stringify(vd));
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
		_restart:function(json){
			var self=this;
			// dump autoLines
			self.autoLines=[];
		
			var url=$("#srcImageForCanvas").attr('src');
			if(__v) console.log("Raphael restart: JSON.stringify(json):");
			if(__v) console.log(JSON.stringify(json));
			// add all new shapes as new manifest - make sure to separate the 
			// autoLines out
			for(j in json.shapes){
				if(__v) console.log(url+" has shapes: "+JSON.stringify(json.shapes[j]));	
				var shape=json.shapes[j];
				if(!shape) continue;
				// check to make sure shape doesn't already exist
				for(s in self.manifest[url].shapes){
					if(self.manifest[url].shapes[s].id==shape.id){
						self.manifest[url].shapes[s]=shape;
						continue;
					}
				}
				self.manifest[url].shapes.push(shape);
				
				// self.manifest[$("#srcImageForCanvas").attr('src')].shapes=json.shapes;
			}
			self.setUpCanvas($("#srcImageForCanvas").attr('src'));
			$("body").bind("zoom",{obj:self},self.zoomHandle);
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
				if(/[^.jpg|.tif|.png]/.test(file)){
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
				
			}
			
			// return cleaned up (i.e. no null values) manifest
			
			return cleanManifest;
		}

	});//END RaphaelImage
	
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
	var Shape = Monomyth.Class.extend({
		// Constructor
		init:function(args){
			this.coords=[];
			this.index=args.index;
			this.Top=args.initialTop;
			this.Right=0;
			this.Left=args.initialLeft;
			this.Bottom=0;
			this.hMid = 0; // horizontal midpoint
			this.vMid = 0; // vertical midpoint
			this.foundOnRow = (typeof args.foundOnRow=="string")?parseInt(args.foundOnRow.substring(1),10):args.foundOnRow;

		},
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
	});
	
	// AutoRecLine
	// Expands Shape class
	// For lines that are fed back from the auto-recognizer
	// contains properties to automatically scale the set of lines
	// up or down
	var AutoRecLine=Shape.extend({
		init:function(args){
			this.$super(args);
			this.uid=args.data.id;
			this._obj=args.data;
			this.DOM=$("#lineBox_"+this.uid);
			this.DOM.remove().appendTo("#raphael");
			this.DOM.bind("mousedown",{obj:this},this.clickHandle);
		
			// if(this._obj.imgScale){
			// 				this.resizeData(this._obj.imgScale);
			// 			}
			$("body").bind("zoom",{obj:this},this.zoomHandle);
			
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
	});
	
	
})(jQuery);


// Object to be passed to the TILE interface to be 
// added as a plugin
// Functions follow a standard protocol that should be followed
// so that any particular plugin can work with the TILE interface
//
var IT={
	id:"IT1000",
	// name: {string} used as an array key for the TILE toolSet array
	name:"Image Tagger",
	json:"imagetagger.json",
	outputCall:"outputShapesDrawn",
	activeCall:null,
	deleteCall:"deleteALinkFromTheShape",
	// start(id,base,json): creates the imagetagger. Takes id (string representing
	// DOM location of tagger), base (string representing location of images - provided by TILE), and json
	//  (either null or JSON object representing TILE JSON data)
	start:function(id,json,layout){
		var self=this;
		
		if(!id) id="azcontentarea"; //defaults to TILE page
		this.itagger=new _Itag({loc:id,json:(json)?json:null,layout:layout});
		this.linkManifest=[];
		// global bind for receiving shape objects
		$("body").bind("receiveShapeObj",{obj:self},self._receiveShapeObjHandle);
		$("body").bind("shapeDeleted",{obj:self},self._shapeDeletedHandle);
		$("body").bind("deleteShapeLink",{obj:self},function(e,data){
			// handle deleting a reference within a shape to another tool
			data.parentTool=self.id;
			
			
			var shid=$(".shpButtonHolder > .button:eq(0)").attr("id");
			data.parentObj=shid;
			data.parentType="shapes";
			var url=$("#srcImageForCanvas").attr('src');
			for(var x in self.linkManifest[url][data.parentObj]){
				if(data.id==self.linkManifest[url][data.parentObj][x].id){
					data.tool=self.linkManifest[url][data.parentObj][x].tool;
					break;
				}
			}
			
			
			$("body:first").trigger(self.deleteCall,[data]);
		});
		$("body").bind("shapesUpdate",function(e,obj){
			
			$("body:first").trigger(self.outputCall,[{id:obj.id,type:"shapes",tool:self.id,parentTool:null}]);
		});
		if(__v) console.log("finished working on raphael");
	},
	_receiveShapeObjHandle:function(e,data){
		var self=e.data.obj;
		if(__v) console.log("receiveObj "+data.id);
		data.tool=self.id;
		
		if(!self.linkManifest[data.id]) self.linkManifest[data.id]=[];
		$("body:first").trigger(self.outputCall,[data]);
		
	},
	_shapeDeletedHandle:function(e,data){
		var self=e.data.obj;
		if(/^D\_/.test(data)) return;
		$("body:first").trigger(self.deleteCall,[{"id":data,"type":"shapes",parentTool:"none",tool:self.id}]);
	},
	// Used once the tool has been called once in TILE_ENGINE
	// reveals the canvas area and calls ImageTagger _restart()
	// json : {Object} url-keyed data array for images
	// args : {Object} (optional)
	restart:function(json,args){
		if(__v) console.log("imagetagger restarting and: "+json);
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
	inputData:function(data){
		if(__v) console.log('imagetagger reached inputData '+data);
		var self=this;
		// add the link data to the linkManifest - links the reference to it's tool ID
		var url=$("#srcImageForCanvas").attr('src');
		if(!self.linkManifest[url]) self.linkManifest[url]=[];
		if(!self.linkManifest[url][data.obj.id]) {
			self.linkManifest[url][data.obj.id]=[];
			self.linkManifest[url][data.obj.id].push(data.ref);
			
		} else {
			for(var x in self.linkManifest[url][data.obj.id]){
				if(self.linkManifest[url][data.obj.id][x].id==data.ref.id){
					return;
					break;
				}
				
			}
			self.linkManifest[url][data.obj.id].push(data.ref);
		}
		self.itagger.inputData(data.ref,data.obj);
		
	},
	removeData:function(data){
		var self=this;
		// if(data.type=="shapes"){
		// 		if(__v) console.log("removing the shape");
		// 		self.itagger.raphael._deleteItemHandle(data.id);
		// 	} else {
		// 		self.itagger.raphael._deleteLinkHandle(data);
		// 	}
		// 	$("#selBB").remove();
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
		
		// sort through url => shapes pairs
		for(o in j){
			if(!itagData[o]) continue;
			// if url => [] in passed manifest from TILEENGINE
			if(j[o]){
				// if(__v) console.log("SHAPE DATA: "+JSON.stringify(itagData[o]));
				j[o].shapes=$.extend(true,{},itagData[o]);
				// if(__v) console.log("bundleData imagetagger: j["+o+"].shapes="+JSON.stringify(j[o].shapes));
				
			}
		}
		return j;
	},
	// Boolean that is set to true once the tool is created
	constructed:false,
	// string that represents the trigger event that is called
	// once close is complete
	done:"closeOutITag",
	_close:"closeITAG"
};