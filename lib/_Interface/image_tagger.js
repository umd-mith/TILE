//Image Tagger 
//Plugin-Prototype for TILE
//grantd


//Global Constants 
//Shape Constants
var SHAPE_ATTRS={"stroke-width": "1px", "stroke": "#a12fae"};

(function($){
	
	
	//use this instead of 'this' - not good to reference 'this' directly?
	var ITag=this;
	/////constructor for ITag - loads all elements for ImageTagger
	var _Itag=function(args){
		this.loc=args.loc;
		this._base=args.base;
		this.schemaFile=null;
		var self=this;
		this.JSONlist=(args.json||null);
		//called once the VectorDrawer makes its first build
		var createShapeToolBar=function(e){
			var obj=e.data.obj;
			$("body").unbind("VDCanvasDONE",obj.createShapeToolBar); //remove the bind - done only once
			
			//prepare the toolbar area
			$("#"+obj.loc+" > .az.inner > .toolbar").attr("id","raphshapebar_");
			//load the second toolbar - shapes, etc.
			obj.ShapeToolBar=new TILEShapeToolBar({
				loc:"raphshapebar_",
				htmlready:true
			});

			//load schema tags if haven't done so already (i.e. user loads JSON first)
		//	obj.jsonReader.readSchemaFromFile(obj.schemaFile);

			//load the image scroller (at the bottom)
			//load the scroller
			
			//obj.Scroller=new TileAnimatedScroller({htmlready:true});//tell scroller it doesn't need to load HTML
			//scroller events
			//$("body").bind("switchImage",{obj:obj},obj.switchToImage);
			//obj.Scroller.loadImages(obj.raphael.getUrlList());

		};
		var ingestImages=function(e){
			var obj=e.data.obj;
			if(!obj.schemaFile){
				
				//send image file data to canvas
				obj.raphael.addUrl(URL_LIST);
				// obj.schemaFile=file;
				$("body:first").trigger("imageAdded");
			}
		};
	
		//global bind for when the VectorDrawer in raphaelImage is completed
		$("body").bind("VDCanvasDONE",{obj:this},createShapeToolBar);
		//received from ImportDialog box
		if(!this.JSONlist)	$("body").bind("loadImageList",{obj:this},ingestImages);
		//$("body").bind("loadJSONList",{obj:this},this.ingestJSON);
		//trigger from Automated Scroller
		$("body").bind("switchImage",{obj:this},this.switchImageHandler);
		$("body").bind("newImageAdded",{obj:this},this.setMultiURL);
		$("body").bind("showImageList",{obj:this},this.showImageList);
		//this.jsonReader=new jsonReader({});
		//get JSON html data
		$.ajax({
			dataType:'json',
			url:'http://localhost:8888/TILE/trunk/lib/JSONHTML/imagetagger.json',
			success:function(j){
				//j is json data
				self.setHTML(j);
			}
		});
	};
	
	_Itag.prototype={
		setHTML:function(html){
			//html is JSON data
			var self=this;
			//pre-load the initial html content into loc area - needs .az.inner
			//to be visible
			if(!html) throw 'Did not pass html content to the Itag';
			self.html=html;
			$("#"+self.loc).append(self.html.imagetagger);
			//setup the raphael div
			//self.DOM=$("#az_log > .az.inner");
			var raphdiv=$("#"+this.loc+" > .az.inner > .workspace").attr("id","raphworkspace_");
			//set height&width dimensions
		//	raphdiv.height(raphdiv.closest(".az.content").height()-raphdiv.closest(".toolbar").height()).width(raphdiv.closest(".az.content").width());
			this.raphael=new RaphaelImage({
				loc:"raphworkspace_",
				maxZoom:5,
				minZoom:1,
				url:[],
				canvasAreaId:"raphael"
			});
			
			this.imageLoaded=true;
			this.imagesON=true;

			self.imageList=new ImageList({
				html:self.html.imageList,
				loc:self.loc
			});
			
			if(self.JSONlist){
				self.raphael.addUrl(self.JSONlist);
			
				$("body").trigger("imageAdded");
			}
		},
		ingestJSON:function(e,list){
			var self=e.data.obj;
			self.JSONlist=list;
		},
		setMultiURL:function(e,path){
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
					//.replace(/\n+\s+/g,"").split(/,/);
		
					listarray = JSON.parse(list);
					
					
				//	var listarray=[];
					var self=obj;
					/*jQuery.each(list,function(i,val){
						if(val){//getting rid of undefined types - BUG
							listarray.push({
								uri:self._base+val.replace(/^[\n\r]+/g,"")
							});
						}
					});*/
					
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
					
					//$("body").trigger("openNewImage");
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
					// jQuery.each(list,function(i,val){
					// 					if(val){//getting rid of undefined types - BUG
					// 						listarray.push({
					// 							uri:self._base+val.replace(/^[\n\r]+/g,"")
					// 						});
					// 					}
					// 				});
					
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
		switchImageHandler:function(e,url){
			var obj=e.data.obj;
			//find pagenumber related to URL
			obj.raphael.goToPage(url);
		},
		showImageList:function(e){
			var obj = e.data.obj;
			obj.imageList.show(obj.raphael.url);
			
		},
		
		/**
		Clear images
		**/
		_restart:function(){
			var self=this;
			//self.DOM.show();
		
			
			$("body:first").trigger("closeDownVD",[false]);
			
		},
		_closeDown:function(){
			var self=this;
			
			$("body:first").trigger("closeDownVD",[true]);
		},
		_turnOffListeners:function(){
			var self=this;
			self.raphael.disable();
		}
	};
	ITag._Itag=_Itag;

	
	var ImageList=Monomyth.Class.extend({
		init:function(args){
			var self=this;
			self.loc=args.loc;
			self.html=args.html;
			//$(self.html).appendTo($("#"+self.loc));
			//self.DOM=$(".az.inner.textImageList").hide();
		},
		show:function(data){
			var self=this;
			
			// if($("#azcontentarea > div.az.inner.textImageList").length){
			// 				$("#azcontentarea > div.az.inner.textImageList").remove();
			// 				$("#azcontentarea > div.az").show();
			// 				return;
			// 			}
			//var data = obj.raphael.getUrlList();
			if ($("#textImageList").length > 0) {
				$("#textImageList").remove();
			}
			
			$("#"+self.loc+" > div.az").hide();
			$(self.html).appendTo($("#"+self.loc));
			
			for (var i=0;i<data.length;i++){
				 $("<li><a href='"+data[i].uri+"'>"+data[i].title+"<\/a></li>").appendTo(".az.inner.textImageList > .list");	
			}
			
			$(".az.inner.textImageList > .list > li > a").mouseover(function(e){
				
				uri = ($(this).attr("href"));
				$(".az.inner.textImageList > .image").html("<img src='"+uri+"' width=100>");
			}).click(function(e){
				e.preventDefault();
				uri = ($(this).attr("href"));
				//change the image we're looking at in canvas				
				$("body").trigger("switchImage",[uri]);
				//go back to canvas
				$("#"+self.loc+" > .az.inner.textImageList").remove();
				$("#"+self.loc+" > div.az").show();
				
			});
			//$("body").bind("showImageList",{obj:self},self.back);
			$(".az.inner.textImageList > .toolbar > ul.menuitem > li > a > span.imgView").click(function(e){
				e.preventDefault();
				//go back without changing the image 
				$("#"+self.loc+" > .az.inner.textImageList").remove();
				$("#"+self.loc+" > div.az").show();
			});
			
			// $("#ilBack").click(function(e){
			// 				
			// 				
			// 				$("#azcontentarea > div.az").show();
			// 			});
		},
		back:function(e){
			var self=e.data.obj;
			$("#"+self.loc+" > .az.inner.textImageList").remove();
			$("#"+self.loc+" > div.az").show();
			$("body").unbind("showImageList",self.back);
		}
	});
	
	//ShapeToolBar
	/**Secondary toolbar for the TILE interface - holds 
	buttons for shape commands
	All,Current,None view settings
	Zoom Controls
	Next/Prev Page  
	**/

	var TILEShapeToolBar=SideToolBar.extend({
		init:function(args){
			this.$super(args);
			// if(!args.rules) throw "No rules passed to the tagging toolbar";
			// 		this.rules=args.rules;
			// 	
			
			// if(!args.htmlready){	
			// 				this.DOM.append($.ajax({
			// 					async:false,
			// 					url:'lib/ToolBar/SideToolBar.html',
			// 					type:'GET',
			// 					dataType:'html'
			// 				}).responseText);
			// 			} else {
			// 				
			// 			}
			
			//new image dialog
			this.showNewImgB=$("#raphshapebar_ > ul.menuitem > li > #addImg").click(function(e){
				e.preventDefault();
				$(this).trigger("openNewImage");
			});
			
			//shape display selectors
			this.showAllS=$("#showAllShapes").click(function(e){
				e.preventDefault();
				if($(this).hasClass("inactive")){
					$(this).trigger("shapeSelect",['all']);
					$(this).removeClass("inactive");
					$("#showNoShapes").addClass('inactive');
					$("#showCurrentShape").addClass('inactive');

				}
			});
			this.showNoS=$("#showNoShapes").click(function(e){
				e.preventDefault();
				if($(this).hasClass("inactive")){
					$(this).trigger("shapeSelect",['none']);
					$(this).removeClass("inactive");

					$("#showAllShapes").addClass('inactive');
					$("#showCurrentShape").addClass('inactive');
				}
			});
			this.showCurrS=$("#showCurrentShape").click(function(e){
				e.preventDefault();
				if($(this).hasClass("inactive")){
					$(this).trigger("shapeSelect",['current']);
					$(this).removeClass("inactive");
					$("#showNoShapes").addClass('inactive');
					$("#showAllShapes").addClass('inactive');
					$(this).trigger("_showCurrentShape");
				}
			});
			//Define Area elements
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
			//select tool only for when user wants to select shapes
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
			//set up shape area
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
			$("#listView").click(function(e){
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
			$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			//local listener
			this.DOM.bind("changeShapeType",{obj:this},function(e,type){
				var obj=e.data.obj;
				obj.shapeType=type;
			});
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
		initTagRules:function(e,rules){
			var obj=e.data.obj;
			obj.rules=rules;
			//obj.setTagChoices(obj.rules);
		},
		setTagChoices:function(rules){
			
			for(top in rules.topLevelTags){
				var uid=rules.topLevelTags[top];
				
				for(t in rules.tags){
					if(rules.tags[t].uid==uid){
						var tag=rules.tags[t];
						var el=$("<option id=\""+uid+"\">"+tag.name+"</option>").click(function(e){
								$(this).trigger("loadNewTag",[$(this).attr("id")]);
						}).appendTo(this._tagChoices);
						
						break;
					}
				}
			}
			
		},
		//used for opening and closing the ColorPicker plugin
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
		onCPSubmit:function(hsb,hex,rgb){
			$('#colorSelectorBkgd').css('background-color', '#' + hex);
			$('body').trigger("NEWSHAPECOLOR",[hex]);
		},
		activateShapeBar:function(e){
			//user has no shape committed to the tag, turn on shape choices and turn off
			//the delete button 
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
					this.shapeType="poly";}
				this.elli.addClass("inactive");
				if(this.elli.hasClass("active")){
					this.elli.removeClass("active");
					this.shapeType="elli";
				}
				$("#colorSelector2").addClass("inactive");
			}
		},
		shapeSet:function(e){
			var obj=e.data.obj;
			obj.delShape.removeClass("inactive");
			if(!obj.rect.hasClass("inactive")) obj.deactivateShapeBar();
		},
		shapeUnSet:function(e){
			var obj=e.data.obj;
			if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
			if(obj.rect.hasClass("inactive")) obj.activateShapeBar();
		},
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
	**/

	var RaphaelImage=Image.extend({
		init:function(args){
			this.$super(args);
			this.loc=$("#"+args.loc);
			this.loc.append($("<div id=\"raphael\"><img id=\"srcImageForCanvas\" src=\"\"/></div>"));
			
			this.DOM=$("#raphael").css({'z-index':'1000'});
			//this.DOM.width(this.DOM.parent().width()).height(this.DOM.parent().height());
			this.srcImage=$("#srcImageForCanvas");
			this.canvasAreaId=args.canvasAreaId;
			//master array
			this.manifest=[];
			this.curUrl=null;
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
			
		},
		// @url can be a single string or an array of string values
		//url is {array} with each element being in this format:
		//{uri:{String}}
		addUrl:function(url){
			if(url.shapes) this.startShapes=url.shapes;
			if(url.images) url=url.images;
			if((typeof url=="object")&&(url!=null)){
				//is an array - process array
				for(u in url){
					//if not already present in array, add image to url list
					//and to the master array
					var cu=url[u].uri;
					var title = url[u].title;
					
					if((cu.length>1)&&(jQuery.inArray(cu,this.url)<0)){
						//var cleanurl=url[u].uri.replace(/^[A-Za-z0-9]+|[\t\r]+/,"");
						this.url.push({"title": title, "uri": cu});
						//Master Array ---
						//tags: array of tags for this uri
						//n: index in this.url list
						this.manifest[cu]={
							"uri":cu,
							"shapes":[]
						};
						if(this.startShapes){
							for(g in this.startShapes){
								if(this.startShapes[g].uri==cu){
									this.manifest[cu].shapes=this.startShapes[g].shapes;
								}
							}
						}
					//	if(URL_LIST) URL_LIST.push(url[u]);
					}
					this.pageNum=(this.url.length-1);
				}

			}
		},
		getUrlList:function(){
			var data=[];
	
			for(d=0;d<this.url.length;d++){
				
				data[d]=this.url[d].uri;
			}
			return data;
		},
		getCatalog: function(){
			var data=[];
			
			for(d=0;d<this.url.length;d++){
				
				data[d]=this.url[d].uri;
			}
			return data;
		},
		closeDownCanvas:function(){
			var self=this;
			self.DOM.animate({"opacity":0.01},200,function(){
				self.DOM.css({"z-index":0});
			});
		},
		//NEW: using _base to add as prefix to each filename
		setUpCanvas:function(url,max,min){
			var self=this;
			
			
			var pic_real_width;
			var pic_real_height;
			
			$("#srcImageForCanvas").load(function() {
				
   				// Remove attributes in case img-element has set width and height
			    $("#srcImageForCanvas").removeAttr("width")
			           .removeAttr("height")
			           .css({ width: "", height: "" }); // Remove css dimensions as well

			    pic_real_width = $("#srcImageForCanvas")[0].width;
			    pic_real_height = $("#srcImageForCanvas")[0].height;
				var src = $("#srcImageForCanvas").attr("src");
				
				$("#srcImageForCanvas").width(pic_real_width);
				$("#srcImageForCanvas").height(pic_real_height);
				if(self.loc.scrollTop()==0){
					self.loc.scrollTop(0);
					self.loc.scrollLeft(0);
				}
				
				// self.DOM.parent().height(pic_real_height);
				// 				self.DOM.height(pic_real_height);
				// 				self.DOM.width(pic_real_width);
				self.setPageInfo(self.curUrl);
			});
			//change the url of srcImageForCanvas
			self.srcImage.attr("src",url);
			self.srcImage.attr("src","");
			self.curUrl=url;
			//assign url a second time (first time through clears cache)
			self.srcImage.attr("src",self.curUrl);
			
			
		},
		setPageInfo:function(url){
			if((this.curUrl==url)&&(this.manifest[url])){
				
				if(!this.drawTool){
					//set up drawing canvas
					this.setUpDrawTool();
				} 
				//erase shapes from session and load current ones 
				this.drawTool.clearShapes();
				this.drawTool.importShapes(JSON.stringify(this.manifest[url].shapes));
				}
		},
		setUpDrawTool:function(){
			var self=this;
			//creates the VectorDrawer canvas and all associated triggers for using
			//said VectorDrawer canvas.  
		
			self.drawTool=new VectorDrawer({"overElm":$("#"+self.loc.attr('id')+" > #raphael"),"initScale":1});
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
			// $("body").bind("shapeDrawn",{obj:self},function(e){
			// 	 			var self=e.data.obj;
			// 				self.drawTool.hideShapes();
			// 	 		});
			
			$("body").bind("closeDownVD",{obj:this},this.closeSVGHandle);
			$("body").bind("loadShapes",{obj:this},this._loadShapesHandle);
			$("body").bind("NEWSHAPECOLOR",{obj:this},this._newColorHandle);
			//set it up
			self.drawTool._drawMode='r';
			
			// if(self.startShapes){
			// 									//import shapes for this image
			// 									self._loadImgShapes();
			// 								}
		},
		_loadImgShapes:function(){
			var self=this;
			//load all shapes into drawtool
		
			if(self.startShapes){
				for(g in self.startShapes){
					//var s=JSON.stringify(self.startShapes[g].shapes);
					
				}
				self.startShapes=null;
			}
		},
		//whatever the current drawn shape is, change
		// that shapes color
		_newColorHandle:function(e,cp){
			var self=e.data.obj;
			self.drawTool.setPenColor("#"+cp);
		},
		closeSVGHandle:function(e,s){
			var self=e.data.obj;
			if(s){
				$(".vd-container").css("z-index","0");
			} else if(!s) {
				$(".vd-container").css("z-index","1032");
				
			}
		},
		_loadShapesHandle:function(e,json){
			var self=e.data.obj;
			self.drawTool.importShapes(JSON.stringify(json)); //send to drawTool
		},
		zoomHandle:function(e,n){
			var self=e.data.obj;
			if(self.drawTool&&($("#srcImageForCanvas").width()!=0)){
				//svg scale() function has to be called after 
				//RaphaelImage is done resizing container elements
				if(n>0){
				
					$("#srcImageForCanvas").width(1.25*parseFloat($("#srcImageForCanvas").width()));
					$("#srcImageForCanvas").height(1.25*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(1.25*parseFloat($(".vd-container").width()));
					$(".vd-container").height(1.25*parseFloat($(".vd-container").height()));
						self.drawTool.scale(1.25); //zooming in
				} else if(n<0){
					
					$("#srcImageForCanvas").width(0.75*parseFloat($("#srcImageForCanvas").width()));
					$("#srcImageForCanvas").height(0.75*parseFloat($("#srcImageForCanvas").height()));
					$(".vd-container").width(0.75*parseFloat($(".vd-container").width()));
					$(".vd-container").height(0.75*parseFloat($(".vd-container").height()));
					self.drawTool.scale(0.75); //zooming out
					
				}
			
				
			} else {
				$("body").unbind("zoom",self.zoomHandle);
			}
		},
		_restart:function(){
			var self=this;
			$("body").bind("zoom",{obj:self},self.zoomHandle);
		},
		//destroys the current Image object session and starts the process over
		_startOver:function(){
			if(this.drawTool) this.drawTool._killSession();
			this.drawTool=null;
			this.image.remove();
			this.image=null;
			//reset main variables
			this.manifest=[];
			this.url=[];
			this.startShapes=[];
			this.pageNum=0;
			this.srcImage.attr("src",'');
		},
		//erase all shapes and data from the current URL 
		_resetCurrImage:function(){
			if(this.curUrl&&(this.manifest[this.curUrl])){
				this.drawTool._reset_CurrUrl();
			}
		},
		_eraseAllShapes:function(){
			this.drawTool._reset_All();
		},
		//changes the pages - called by turnPage Custom Event
		//page order wraps around when reaching end/beginning
		showImg:function(e,val){
			var obj=e.data.obj;
			//if greater than 0, turn page 1 forward
			//less than 0, turn page 1 back
			if((val>0)){
				obj.pageNum++;
				
				if(obj.drawTool){
					obj.manifest[obj.curUrl].shapes=obj.drawTool.exportShapes();
				}
				
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum].uri);
				} else {
					//ran out of pages, or not available, send to 
					//beginning
					obj.pageNum=0;
					obj.setUpCanvas(obj.url[obj.pageNum].uri);
				}
			} else if((val<0)) {
				obj.pageNum--;
				
				if(obj.drawTool){
					obj.manifest[obj.curUrl].shapes=obj.drawTool.exportShapes();
				}
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum].uri);
				} else {
					//ran out of pages, or page not available,
					//go to end (wraparound)
					obj.pageNum=(obj.url.length-1);
					obj.setUpCanvas(obj.url[obj.pageNum].uri);
				}
			}

		},
		goToPage:function(n){
		
				this.setUpCanvas(n);
		
		},
		showCurrentImage:function(e){
			var obj=e.data.obj;
			if(obj.url[obj.pageNum].uri){
				var file=obj.url[obj.pageNum].uri;
				if(/[^.jpg|.tif|.png]/.test(file)){
					obj.setUpCanvas(file);

				} else {
					alert("The file: "+file+" returned an error.");
				}
			}
		},
		figureSizeInfo:function(min,max){
			//determine the zoom levels
			this.zoomLevels=[];
			this.zoomMin=min;
			this.zoomMax=max;
			this.zoomLevel=this.zoomMin;
		},
		getSizeInfo:function(){
			return jQuery.merge([],this.size);
		},
		imageMouseOver:function(e){
			var obj=e.data.obj;
			var t=obj.canvasObj.path("M"+(e.pageX+obj.DOM.scrollLeft())+" "+(e.pageY+obj.DOM.scrollTop()));

		},
		changeShapeType:function(e,type){
			var obj=e.data.obj;
			obj.shapeType=type;
		},
		setDrawMode:function(e,id){
			//activated by setCoordRegion event
			var obj=e.data.obj;

			obj.drawMode=true;
			$("body").unbind("setCoordRegion",obj.setDrawMode);
			//set up shape data for this tag
			if(obj.currShape==null) obj.currShape=id;
			if(obj.tagData[obj.currShape]){
				if(obj.tagData[obj.currShape].shape) obj.tagData[obj.currShape].shape.destroy();
			} else {
				obj.tagData[obj.currShape]={shape:null,index:obj.tagData.length};
			}
			//when user mouse's up in the svg image region, then a shape is drawn
			$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
			//$(document).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
		},
		/**
		Create or change shape data
		Called from addTag, toggleTagState
		**/
		changeShapeData:function(e,id,tag){
			var obj=e.data.obj;
			//keeps track of tags
			//check if already cataloged

			if(!obj.manifest[obj.curUrl]){
				return false;
			}
			if(obj.manifest[obj.curUrl].tags){
				obj.curTag=tag;

				//if a new tag, create a new tag in manifest array for page
				var test=jQuery.grep(obj.manifest[obj.curUrl].tags,function(el,i){
					return (tag.htmlindex==el.tagEl.htmlindex);
				});
				if(test.length==0){
					//new tag, create tag object
					//tagEl: TileTag Obj
					//shape: shape obj
					//n: index int
					var d=new Date();
					obj.manifest[obj.curUrl].tags.push({
						tagEl:tag,
						shape:tag.shape,
						n:(d.getTime()*(obj.manifest[obj.curUrl].tags.length-1))
					});
					//alert(tag.htmlindex+"   new tag: "+obj.manifest[obj.curUrl].tags[(obj.manifest[obj.curUrl].tags.length-1)].tagEl.htmlindex);
					//set listener for shape - NOW: turning on/off the DrawerTool
					if(!tag.shape) {
						obj.DOM.trigger("changeShapeType",["rect"]);
						//if(!tag.shape) $(obj.image.node).bind("mouseup",{obj:obj},obj.drawer.handleMouseCanvasClick);
					} else {
						obj.DOM.trigger("changeShapeType",["select"]);
					}
				} else {
					//already entered, make sure there is a shape 
					if(!tag.shape){
						//turn on/off the drawerTool
						//obj.drawTool.toggle('on');
						//$(obj.image.node).bind("mouseup",{obj:obj},obj.handleMouseCanvasClick);
					} else {
						//obj.drawTool.toggle('off');
					}
				}
			}
		},
		disable:function(){
			//hide DOM and disable listeners
			this.drawTool.toggle('off');
			// this.DOM.hide();
			// 			if(this.image) this.image.remove();
			// 			this.image=null;
			// 			$("body").unbind("turnPage",this.showImg);
			// 			$("body").unbind("imageAdded",this.showCurrentImage);
			// 			$("body").unbind("setCoordRegion",this.activateShapes);
			// 			$("body").unbind("drawrectangle",this.drawRectangle);
			// 			$("body").unbind("drawellipse",this.drawEllipse);
			// 			$("body").unbind("drawpolygon",this.drawPolygon);
			// 			$("body").unbind("zoom",this.zoom);
		},
		enable:function(){
			this.drawTool.toggle('on');
			// this.DOM.show();
			// 			$("body").bind("turnPage",{obj:this},this.showImg);
			// 			$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
			// 			$("body").bind("setCoordRegion",{obj:this},this.activateShapes);
			// 			$("body").bind("drawrectangle",{obj:this},this.drawRectangle);
			// 			$("body").bind("drawellipse",{obj:this},this.drawEllipse);
			// 			$("body").bind("drawpolygon",{obj:this},this.drawPolygon);
			// 			$("body").bind("zoom",{obj:this},this.zoom);
		},
		bundleData:function(){
			//get all tags and other data into an associative array

			var date=new Date();
			var imgs=[];
			var tags=[];

			for(p in this.manifest){
				var record=this.manifest[p];
				var i={"uid":(date.getTime()+"_"+record.n),"uri":p,"tags":[]};
				imgs.push(i);
			}

			var shps=this.drawTool.bundleData();

			var json={"uid":date.toUTCString().replace(/[:|,]+/i,""),"schema":"","Images":imgs,"Tags":tags,"Shapes":shps};
			return json;
		}

	});//END RaphaelImage
	
	ITag.RaphaelImage=RaphaelImage;

	ITag.TILEShapeToolBar=TILEShapeToolBar;
	//ITag.TileAnimatedScroller=TileAnimatedScroller;
	
})(jQuery);
//Object to be passed to the TILE interface to be 
//added as a plugin
var IT={
	name:"imagetagger",
	start:function(id,base,json){
		if(!id) id="azcontentarea"; //defaults to TILE page
		this.itagger=new _Itag({loc:id,base:base,json:(json)?{"images":json.images,"shapes":(json.shapes||null)}:null});
	},
	restart:function(){
		$(".az.main > #az_log > .az.inner:eq(0)").show();
		this.itagger._restart();
		
	},
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
		var raph=this.itagger.raphael;
		j["shapes"]=[];
		for(i in raph.manifest){
			if(raph.manifest[i].uri==$("#srcImageForCanvas").attr("src")){
				//most recent image - get most recent data
				raph.manifest[i].shapes=raph.drawTool.exportShapes();
			}
			j["shapes"].push(raph.manifest[i]);
			// var cu=raph.manifest[i].uri;
			// 		shps.push({"uri":cu,"shapes":raph.manifest[i].shapes});
		}
		
		//add to passed JSON
		// j["shapes"]=raph.manifest;
		return j;
	},
	constructed:false,
	done:"closeOutITag"
};