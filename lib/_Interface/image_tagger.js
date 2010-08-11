// Image Tagger : A plugin tool for TILE
// developed by grantd 
// Takes a JSON object representing the pages in a particular session, puts each
// url in a SVG Canvas and applies the VectorDrawer program to that image

// Objects:
// ITag (Main engine)
// ImageList
// TILEShapeToolBar
// RaphaelImage


//Shape Constants
var SHAPE_ATTRS={"stroke-width": "1px", "stroke": "#a12fae"};

(function($){
	//use this instead of 'this' - not good to reference 'this' directly?
	var ITag=this;
	/////constructor for ITag - loads all elements for ImageTagger
	// init(args) : takes args, which contains: {
		// loc: string representing ID of DOM object to attach to
		// base : string representing HTTP location of images
		// json : optional JSON object to pass as main source of images
			
		// }

	var _Itag=function(args){
		this.loc=args.loc;
		this._base=args.base;
		this.schemaFile=null;
		var self=this;
		this.JSONlist=(args.json||null);
		
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
		$.ajax({
			dataType:'json',
			url:'lib/JSONHTML/imagetagger.json',
			success:function(j){
				//j is json data
				self.setHTML(j);
			}
		});
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
		setHTML:function(html){
			//html is JSON data
			var self=this;
			//pre-load the initial html content into loc area - needs .az.inner
			//to be visible
			if(!html) throw 'Did not pass html content to the Itag';
			self.html=html;
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
		// called once the plugin has been constructed by TILE_ENGINE,
		// then is being called again (re-attaches listeners and 
		// re-attaches DOM objects)
		_restart:function(){
			var self=this;
			//self.DOM.show();
			//reset the toolbar
			$("#pgNext").click(function(e){
				e.preventDefault();
				$(this).trigger("turnPage",[1]);
			});
			$("#pgPrev").click(function(e){
				e.preventDefault();
				$(this).trigger("turnPage",[-1]);
			});
			$("#listView").parent().click(function(e){
				e.preventDefault();
				$(this).trigger("showImageList");
			});
			$("body:first").trigger("closeDownVD",[false]);
			if(self.raphael) self.raphael._restart();
			$("#az_activeBox").show();
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
			$(".az.inner.textImageList > .toolbar > ul.menuitem > li > ul > a > span.imgView").click(function(e){
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
			
			//Define Area elements
			//Rectangle
			this.rect=$("#rect");
			this.rect.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#poly").removeClass("active");
					$("#elli").removeClass("active");
					$("#pointer").removeClass("active");
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
			$("body").bind("activateShapeDelete",{obj:this},this.shapeSet);
			$("body").bind("deactivateShapeDelete",{obj:this},this.shapeUnSet);
			$("body").bind("turnOffShapeBar",{obj:this},this.turnOffShapeBar);
			//$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			//local listener
			this.DOM.bind("changeShapeType",{obj:this},function(e,type){
				var obj=e.data.obj;
				obj.shapeType=type;
			});
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
			//global listeners
			$("body").bind("RaphaelImageReady",{obj:this},this.finishCanvas);
			$("body").bind("turnPage",{obj:this},this.showImg);
			$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
			$("body").bind("prevPageShapes",{obj:this},this.updateManifestShapes);
			// global bind to window to make sure that canvas area is correctly synched w/ 
			// window size
			$(window).resize(function(e){
				if($("#raphworkspace_").length){
					// adjust width
				
					$("#raphworkspace_").width($("#azcontentarea > .az.inner").innerWidth());
					diff=$("#azcontentarea > .az.inner > .toolbar").innerHeight();
					$("#raphworkspace_").height($("#azcontentarea > .az.inner").innerHeight()-diff);
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
					var cu=(url[u].uri||url[u].url);
					var lines=(url[u].lines)?url[u].lines:[];
					if((cu.length>1)){
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
		//NEW: using _base to add as prefix to each filename
		// finds the real width and height of the given URL and
		// sets the canvas area and other surrounding divs to this
		// proportion
		// url : {String}
		// 
		setUpCanvas:function(url){
			var self=this;
			$("#srcImageForCanvas").load(function(e){
				
				// $("#srcImageForCanvas").width($("#srcImageForCanvas")[0].width);
				// $("#srcImageForCanvas").height($("#srcImageForCanvas")[0].height);
				
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
				// if(__v)  console.log("vdcontainer:first is : "+$("#srcImageForCanvas")[0].width+"  by "+$("#srcImageForCanvas")[0].height);
				if(self.manifest[url]){
						self.manifest[url].origWidth=$("#srcImageForCanvas")[0].width;
						self.manifest[url].origHeight=$("#srcImageForCanvas")[0].height;
				}
				self._imgScale = 1;
				
				if(self.curUrl!=url) self.curUrl=url;
				
				$("body:first").trigger("newPageLoaded",[url]);
				$(this).unbind("load");
				
			}).attr("src",url);	
		},
		//creates the VectorDrawer tool and sets up necessary 
		// listeners
		setUpDrawTool:function(){
			var self=this;
			//creates the VectorDrawer canvas and all associated triggers for using
			//said VectorDrawer canvas.  
	
			// RaphaelImage acts as a wrapper for the VectorDrawer class; no functions inside of VectorDrawer
			// are invoked directly outside of RaphaelImage
			self.drawTool=new VectorDrawer({"overElm":$("#"+self.loc.attr('id')+" > #raphael"),"initScale":self._imgScale});
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
			$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
			$("body").bind("closeDownVD",{obj:this},this.closeSVGHandle);
			$("body").bind("loadShapes",{obj:this},this._loadShapesHandle);
			$("body").bind("NEWSHAPECOLOR",{obj:this},this._newColorHandle);
			$("body").bind("shapeChanged",{obj:this},this._shapeChangeHandle);
			//set it up
			self.drawTool._drawMode='r';
			
			// adjust width
			$("#raphworkspace_").width($("#azcontentarea > .az.inner").innerWidth());
			diff=$("#azcontentarea > .az.inner > .toolbar").innerHeight();
			$("#raphworkspace_").height($("#azcontentarea > .az.inner").innerHeight()-diff);
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
		_shapeChangeHandle:function(e){
			var self=e.data.obj;
			var vd=self.drawTool.exportShapes();
			
			$("body:first").trigger("shapesUpdate",[vd]);
		},
		// Called by the receiveShapeObj event
		// e : {Event}
		// shpObj : {Object} - array of shape values
		_shapeDrawnHandle:function(e,shpObj){
			var self=e.data.obj;
			// just export all the shapes out and load into transcript line
			var vd=self.drawTool.exportShapes();
			
			// take shape data and pass to the transcript tag
			$("body:first").trigger("receiveShapeObj",[vd]);
		},
		// uses a VectorDrawer function for loading shapes
		// from a JSON string
		// Called by loadShapes event
		// e : {Event}
		// json : {Object} JSON object with shape data
		_loadShapesHandle:function(e,json){
			var self=e.data.obj;
			// for(s in json){
			// 				// possible that user loaded shape data from autorec/JSON, then 
			// 				// changed the scale before loading shape(s)
			// 				if((json[s]._scale!=self._imgScale)){
			// 					// x,y,cx,cy values need to be corrected
			// 					// figure differences for x and y
			// 					// var corx=parseFloat(($("#srcImageForCanvas")[0].width*self._imgScale)/$("#srcImageForCanvas")[0].width);
			// 					// var cory=parseFloat(($("#srcImageForCanvas")[0].height*self._imgScale)/$("#srcImageForCanvas")[0].height);
			// 					json[s]._scale=self._imgScale;
			// 					var xval=["x","cx","width","rx"];
			// 					var yval=["y","cy","height","ry"];
			// 					$.each(json[s].posInfo,function(i,o){
			// 						if($.inArray(i,xval)>-1){
			// 							json[s].posInfo[i]*=self._imgScale;
			// 						} else if($.inArray(i,yval)>-1){
			// 							json[s].posInfo[i]*=self._imgScale;
			// 						}
			// 					});
			// 				}
			// 			}
			// 			if(__v)  console.log("raphael loading shapes:  "+JSON.stringify(json));
			self.drawTool.importShapes(JSON.stringify(json));
	
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
					$("#srcImageForCanvas").width(1.25*parseFloat($("#srcImageForCanvas").width()));
					//$("#srcImageForCanvas").height(1.25*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(1.25*parseFloat($(".vd-container").width()));
					$(".vd-container").height(1.25*parseFloat($(".vd-container").height()));
					//zooming in
					self.drawTool.scale(1.25); 
					
					self._imgScale*=1.25;
				} else if(n<0){
					$("#srcImageForCanvas").width(0.75*parseFloat($("#srcImageForCanvas").width()));
					//$("#srcImageForCanvas").height(0.75*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(0.75*parseFloat($(".vd-container").width()));
					$(".vd-container").height(0.75*parseFloat($(".vd-container").height()));
					//zooming out
					self.drawTool.scale(0.75); 
					
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
		_restart:function(){
			var self=this;
			
			self.setUpCanvas($("#srcImageForCanvas").attr('src'));
			$("body").bind("zoom",{obj:self},self.zoomHandle);
			//self.drawTool.scale(self._imgScale);
			//$("body").bind("zoom",{obj:self},self.zoomHandle);
			if(__v) // console.log("restarting raphael: "+self._imgScale);
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
			return self.manifest;
		}

	});//END RaphaelImage
	
	ITag.RaphaelImage=RaphaelImage;

	ITag.TILEShapeToolBar=TILEShapeToolBar;
	//ITag.TileAnimatedScroller=TileAnimatedScroller;
	
})(jQuery);


// Object to be passed to the TILE interface to be 
// added as a plugin
// Functions follow a standard protocol that should be followed
// so that any particular plugin can work with the TILE interface
//
var IT={
	// name: {string} used as an array key for the TILE toolSet array
	name:"imagetagger",
	// start(id,base,json): creates the imagetagger. Takes id (string representing
	// DOM location of tagger), base (string representing location of images - provided by TILE), and json
	//  (either null or JSON object representing TILE JSON data)
	start:function(id,base,json){
		if(!id) id="azcontentarea"; //defaults to TILE page
		this.itagger=new _Itag({loc:id,base:base,json:(json)?json:null});
	},
	// Used once the tool has been called once in TILE_ENGINE
	// reveals the canvas area and calls ImageTagger _restart()
	// json : {Object} url-keyed data array for images
	// args : {Object} (optional)
	restart:function(json,args){
		$("#az_log > .az.inner:eq(0)").show();
		$(".toolbar > ul > li > #pgPrev").show();
		$(".toolbar > ul > li > #pgNext").show();
		$(".toolbar > ul > li > #pointer").show();
		$(".toolbar > ul > li > a > #listView").parent().show();
		$(".toolbar > ul > li > #rect").parent().parent().show();
		this.itagger._restart();
		$("#raphworkspace_").width($("#azcontentarea").width());
		$("#raphworkspace_").height($("#azcontentarea").height());
		
	},
	// Called in order to hide DOM container of image tagger area 
	close:function(){
		var self=this;
		var mv='-='+$(".az.main > #az_log").width();
	
		$(".az.main > #az_log").animate({left:mv,opacity:0.25},400,function(e){
			//$(".az.main > #az_log").children().hide();
			self.itagger._closeDown();
			$(".az.main > #az_log > .az.inner:eq(0)").hide();
			$(".az.main > #az_log").removeClass("log").addClass("tool");
			$(".az.main > #az_log").animate({opacity:1,left:0},200);
			
			
		});
	},
	//return JSON of all plugin data for this session
	bundleData:function(j){
		var itagData=this.itagger.bundleData();
		for(o in itagData){
			if(o in j){
				j[o]=itagData[o];
			}
		}
		return j;
	},
	// Boolean that is set to true once the tool is created
	constructed:false,
	// string that represents the trigger event that is called
	// once close is complete
	done:"closeOutITag"
};