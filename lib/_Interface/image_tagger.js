//Image Tagger 
//Plugin-Prototype for TILE
//grantd


(function($){
	//use this instead of 'this' - not good to reference 'this' directly?
	var ITag=this;
	/////constructor for ITag - loads all elements for ImageTagger
	var _Itag=function(args){
		this.loc=args.loc;
		this._base=args.base;
		this.schemaFile=null;
		//pre-load the initial html content into loc area - needs .az.inner
		//to be visible
		if(!args.html) throw 'Did not pass html content to the Itag';
		$("#"+this.loc).append(args.html);
		
		var self=this;
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
			obj.jsonReader.readSchemaFromFile(obj.schemaFile);

			//load the image scroller (at the bottom)
			//load the scroller
			
			obj.Scroller=new TileAnimatedScroller({htmlready:true});//tell scroller it doesn't need to load HTML
			//scroller events
			//$("body").bind("switchImage",{obj:obj},obj.switchToImage);
			obj.Scroller.loadImages(obj.raphael.getUrlList());

		};
		var ingestSchema=function(e,file){
			var obj=e.data.obj;
			if(!obj.schemaFile){
				//send image file data to canvas
				obj.setMultiURL(null,file);
				obj.schemaFile=file;
			}
		};
		//global bind for when the VectorDrawer in raphaelImage is completed
		$("body").bind("VDCanvasDONE",{obj:this},createShapeToolBar);
		//received from ImportDialog box
		$("body").bind("schemaFileImported",{obj:this},ingestSchema);
		//trigger from Automated Scroller
		$("body").bind("switchImage",{obj:this},this.switchImageHandler);
		$("body").bind("newImageAdded",{obj:this},this.setMultiURL);
		this.jsonReader=new jsonReader({});
		//setup the raphael div
		$("#"+this.loc+" > .az.inner > .workspace").attr("id","raphworkspace_");
		this.raphael=new RaphaelImage({
			loc:"raphworkspace_",
			maxZoom:5,
			minZoom:1,
			url:[],
			canvasAreaId:"raphael"
		});
		this.imageLoaded=true;
		this.imagesON=true;
	};
	
	_Itag.prototype={
		setMultiURL:function(e,path){
			if(e){
				var obj=e.data.obj;
				$("body").trigger("closeImpD");
				if(/.jpg|.JPG|.gif|.GIF|.png|.PNG|.tif|.TIF/.test(path)){
					obj.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					obj.Scroller.loadImages([path]);
					$("body").trigger("imageAdded");
				} else if(/.txt/.test(path)){
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
					if(obj.Scroller) obj.Scroller.loadImages(obj.raphael.getUrlList());
					$("body").trigger("imageAdded");
				} else {
					$("body").trigger("openNewImage");
				}
			} else {
				var self=this;
				$("body").trigger("closeImpD");
				if(/.jpg|.JPG|.gif|.GIF|.png|.PNG|.tif|.TIF/.test(path)){
					self.raphael.addUrl([{title:'unknown',uri:path,desc:'none'}]);
					thselfis.Scroller.loadImages([path]);
					$("body").trigger("imageAdded");
				} else if(/.txt/.test(path)){
					var list=$.ajax({
						url:path,
						async:false,
						dataType:'text'
					}).responseText.replace(/\n+\s+/g,"").split(/,/);
					var listarray=[];
					
					jQuery.each(list,function(i,val){
						if(val){//getting rid of undefined types - BUG
							listarray.push({
								uri:self._base+val.replace(/^[\n\r]+/g,"")
							});
						}
					});

					self.raphael.addUrl(listarray);
				//	this.canvasImage.addUrl(listarray);
					//update the scroller bar
					if(self.Scroller) self.Scroller.loadImages(self.raphael.getUrlList());
					$("body").trigger("imageAdded");
				} else {
					$("body").trigger("openNewImage");
				}
			}
		},
		switchImageHandler:function(e,url){
			var obj=e.data.obj;
			//find pagenumber related to URL
			obj.raphael.goToPage(url);
		},
		/**
		Clear images
		**/
		restart:function(){
			var self=this;
			self.raphael._StartOver();
			self.scroller._unloadImages();
		}
	};
	ITag._Itag=_Itag;
	/**
	AnimatedScrollBar**/
	
	var TileAnimatedScroller=AnimatedScroller.extend({
		init:function(args){
			this.$super(args);
			if(args.htmlready){
				//html already attached via JSON data
				//find the elements
				this.DOM=$("#scroller");
				this.Handle=$("#scrollerHandle > a");
				this.ScrollOuter=$("#tileScroll_outer");
				this.scroller=$("#tileScroll_imagescroller");
				this.viewer=$("#tileScroll_viewer");
				this.container=$("#tileScroll_container");
			}
			//set sizes
			this.ScrollOuter.width(this.DOM.width()-275);
			this.viewer.width(this.DOM.width());
			this.container.width(this.DOM.width());
			this.container.height(this.DOM.height()-this.Handle.height());
			this.duration=0;
			this.speed=0;
			this.leftPos=0;
			this.rightPos=0;
			this.lClicks=1;
			this.rClicks=1;
			//controls
			this.ltrB=$("#ltr");
			this.rtlB=$("#rtl");
			this.ltrB.bind("click",{obj:this},this.moveLeftRight);
			this.rtlB.bind("click",{obj:this},this.moveRightLeft);
			this.Handle.bind("click",{obj:this},this.minimize);
			if($("svg").length>0){
				//bind completion of new canvas to createCanvasBounds event
				$("body").bind("VDCanvasDONE",{obj:this},this.setCanvasBounds);
				//handles triggering for when mouse goes over edge of scroller while in svg mode
				$("svg").mousemove(function(e){
					var x=e.pageX;
						var y=e.pageY;
						if((x>=$("#scroller").position().left)&&(y>=$("#scroller").position().top)){
							$(this).trigger("closeDownVD",[true]);
							$("#scroller").mouseout(function(e){
								$(this).trigger('closeDownVD',[false]);
								$("#scroller").unbind("mouseout");
							});
						}
				});	
			}
			this.scrollSpeed=(args.scrollSpeed)?args.scrollSpeed:630;
			this.createDraggable();

			$("body").bind("newPageLoaded",{obj:this},this.changeFocus);
		},
		minimize:function(e){
			var obj=e.data.obj;
			obj.Handle.toggleClass("open");
			obj.Handle.toggleClass("closed");
			var h=(obj.DOM.height()>25)?25:120;
			obj.DOM.height(h);
		},
		setCanvasBounds:function(e){
		//set where the mouseout and mouseover events get called
			$("svg").mousemove(function(e){
				var x=e.pageX;
				var y=e.pageY;
				if((x>=$("#scroller").position().left)&&(y>=$("#scroller").position().top)){
					$(this).trigger("closeDownVD",[true]);
					$("#scroller").mouseout(function(e){
						$(this).trigger('closeDownVD',[false]);
						$("#scroller").unbind("mouseout");
					});
				}
			});
		},
		loadImages:function(data){
			for(d=0;d<data.length;d++){
				if(data[d]){
					var e=$("<div class=\"tileScroll_item\"></div>").attr("id",function(e){
						return "container_"+$(".tileScroll_item").length;
					});// .load(function(e){
					// 					//adjust the elements in the container over so they are more centered/in user's view
					// 					var w=$("#tileScroll_container > div:last-child").position().left;
					// 					$("#tileScroll_container").css("left",(0-w)+"px"); //set position in css
					// 				});
					var self=this;
					var img=$("<img></img>").attr("src",data[d]).load(function(e){
						$(this).unbind();
						//adjust width and height of img element
						var w=($(this)[0].width*(self.container.height()-30))/$(this)[0].height;
						var h=self.container.height();
						$(this)[0].width=w;
						$(this)[0].height=h;
					}).appendTo(e);
					this.container.append(e);
					e.click(function(e){
						$(this).trigger("switchImage",[$("#"+$(this).attr("id")+" > img").attr("src")]);
						$(".tileScroll_item > img").removeClass("active");
						$("#"+$(this).attr("id")+" > img").addClass("active");
					});
					if(!$(".tileScroll_item > img").hasClass('active')){
						$("#"+e.attr("id")+" > img").addClass("active");
					}

				}


			}
		},
		//for restarting the session ; clear out the images cache
		_unloadImages:function(){
			$(".tileScroll_item").remove();
		},
		testURL:function(url){
			var t=$.ajax({url:url,async:false,dataType:'text'}).responseText;
			return t;
		},
		//Triggered by newPageLoaded event
		changeFocus:function(e,tags,url,obj){
			var obj=e.data.obj;
			$(".tileScroll_item > img").removeClass("active");
			$(".tileScroll_item > img").each(function(){
				if($(this).attr('src')==url) {
					$(this).addClass('active');
					//adjust so it's at the center
					var l=$("#tileScroll_container").position().left;
					var il=$(this).position().left;
					var n=0;
					if(il<0){
						while(il<0){
							n+10;
						}
						$("#tileScroll_container").css("left",(l+n)+'px');
					}

					// if($(this).position().left>0){
					// 					$("#tileScroll_container").css("left",($("#tileScroll_container").position().left-($(this).position().left-$("#tileScroll_container")))+"px");
					// 				} else {
					// 					$("#tileScroll_container").css("left",($("#tileScroll_container").position().left-($(this).position().left-$("#tileScroll_container")))+"px");
					// 				}
				}
			});
			//$(".tileScroll_item > img[src='"+url+"']").addClass('active');


		},
		createDraggable:function(){
			this.container.draggable({axis:'x'});
			this.DOM.bind("dragstop",{obj:this},this.adjustDrag);
		},
		adjustDrag:function(e){
			var obj=e.data.obj;
			obj.leftPos=obj.rightPos=parseInt(obj.container.css("left"),10);

		},
		moveLeftRight:function(e){
			e.preventDefault();
			var obj=e.data.obj;
			//total distance
			var d=parseInt(obj.container.width(),10)+parseInt(obj.viewer.width(),10);
			//remaining distance
			var dl=d-(parseInt(obj.container.css('left'),10)+parseInt(obj.container.width(),10));
			obj.duration=dl/obj.speed;
			obj.animateContainer(obj.duration,"ltr");
		},
		moveRightLeft:function(e){
			e.preventDefault();
			var obj=e.data.obj;
			//total distance
			var d=parseInt(obj.container.width(),10)+parseInt(obj.viewer.width(),10);
			//remaining distance
			var dl=d-(parseInt(obj.viewer.width(),10)+parseInt(obj.container.css('left'),10));
			obj.duration=dl/obj.speed;
			obj.animateContainer(obj.duration,"rtl");
		},
		animateContainer:function(time,dir){

			//which way to go - left to right (ltr) or right to left (rtl)
			if(dir=="rtl"){
				//check direction
				if(this.container.hasClass("ltr")){
					this.rightPos=this.leftPos;
				}

				//add class
				this.container.removeClass("ltr").addClass("rtl");
				if(this.rightPos>(-1*(this.container.width()-this.container.offset().left))){
					//update right left position
					this.rightPos-=($(".tileScroll_item").width()*2);
					this.leftPos=this.rightPos;
					//animate
					this.container.animate({left:this.rightPos + "px"},this.scrollSpeed,"linear");	
				} else {
					//now the images are on 'the other side' of the bar - all the way to the right
					//creating a wrap-around effect
					this.container.css({left:(this.viewer.width()+($(".tileScroll_item").length*$(".tileScroll_item").width()))+"px"});
					this.rightPos=0;
				}

			} else {
				//check direction
				if(this.container.hasClass("rtl")){
					this.leftPos=this.rightPos;
				}
				//add class
				this.container.removeClass("rtl").addClass("ltr");
				if(this.leftPos<(this.viewer.width()-this.viewer.offset().left)){

					//update left right position
					this.leftPos+=($(".tileScroll_item").width()*2);
					this.rightPos+=this.leftPos;

					//animate
					this.container.animate({left:this.leftPos+"px"},this.scrollSpeed,"linear",function(){
						if(parseInt($("#tileScroll_container").css("left"),10)>($("#tileScroll_viewer").width()-$("#tileScroll_viewer").offset().left)){
							alert('over');
						}
					});
				} else{
					//now the images are on 'the other side' of the bar - all the way to the left
					//creating a wrap-around effect
					this.container.css({left:((0-this.container.width())+"px")});
					this.leftPos=0;
				}
			}
		},
		_resetContainer:function(){
			//empty container
			this.container.empty();
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
				$(this).trigger("zoom",[1]);
			});
			this.zoomOut=$("#zoomOut");
			this.zoomOut.click(function(e){
				$(this).trigger("zoom",[-1]);
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
			this.colorPicker=$("#colorpickerHolder2");

			//this.colorPicker=$("<div id=\"colorpickerHolder2\"></div>").insertBefore($("svg"));


			this.CP=this.colorPicker.ColorPicker({
				flat: true,
				color: '#a12fae',
				onSubmit: this.onCPSubmit
			});
			$('#colorSelectorBkgd').css('background-color', '#a12fae');
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
	RaphaelDrawerTool
	**/
	//TILE DRAWER TOOL - requires VectorDrawer
	var RaphaelDrawTool=DrawTool.extend({
		init:function(args){
			this.$super(args);
			this.initScale=args.initScale;
			this.startsize=args.startsize;
			this.cSrc=this.mainCanvas.attr("src");
			this.cContain=args.canvasContainer;
			//change shape type for sidetoolbar
			//$("body").bind("changeShapeType",{obj:this},this.switchMode);
			
			//creating vector drawer - mode is controlled by VD
			//MUST BE A RAPHAEL CANVAS OBJECT - raphael.org
			this.drawer=new TILEDRAW({
				initDrawMode:'s', initScale:this.initScale, initObjs:[], overElm:this.mainCanvas, auxClass:{},startsize:this.startsize,auxContainer:this.cContain
			});
			
			//controls zooming for entire drawing canvas
			$("body").bind("zoom",{obj:this},this.zoom);
			this.active=true;
			if(args.startshapes&&(args.startshapes.length>0)){
				this.shapesToLoad=args.startshapes;
				this.loadJSONShapes();
			}
		},
		toggle:function(mode){

			if(this.drawer&&this.active){
				switch(mode){
					case 'on':
						this.drawer._installOneShotHandlers();
						//$("body").bind("shapeCommit",{obj:this},this.shapeCommitHandle);
						break;
					case 'off':
						this.drawer._uninstallHandlers();
						//$("body").unbind("shapeCommit",this.shapeCommitHandle);
						break;
				}

			}
		},
		//gets call from Region Object
		drawerRemoveShapeHandle:function(e,id){
			var obj=e.data.obj;
			if(obj.drawer){
				obj.drawer.destroySingleShape(id);
				//reset drawer
				obj.drawer._installOneShotHandlers();
			}
		},
		loadJSONShapes:function(){
			//load the shapesToLoad variable into the VD drawer
			this.drawer.loadMasterObjList(this.shapesToLoad);
		},
		switchMode:function(e,type){
			if(e){
				var obj=e.data.obj;
				switch(type){
					case "rect":
						obj.drawer.drawMode('r');
						break;
					case "elli":
						obj.drawer.drawMode('e');
						break;
					case "poly":
						obj.drawer.drawMode('p');
						break;
					case 'select':
						obj.drawer.drawMode('s');
						break;
					default:
						return false;
						break;
				}
			}else if(type=="select"){
				this.drawer.drawMode('s');
			}
		},
		switchImage:function(url){
			if(this.drawer){
				//unload all current shapes
			//	this.mainCanvas.trigger("prevPageShapes",[this.drawer.savable(),this.cSrc]);
				this.cSrc=url;
				//this.mainCanvas=img;
				this.drawer.changeOverElm({
					scale:(this.zoomLevel/this.maxZoom),
					startsize:[($("#srcImageForCanvas")[0].width),($("#srcImageForCanvas")[0].height)],
					url:url
				});
			}
		},
		zoom:function(e,val){
			var obj=e.data.obj;
			if((val>0)&&(obj.zoomLevel<obj.maxZoom)){
				obj.zoomLevel++;
				//var scale=obj.mainCanvas.width()/obj.storedWidth;
				obj.drawer.scale((obj.zoomLevel/obj.maxZoom));
			} else if((val<0)&&(obj.zoomLevel>obj.minZoom)){
				obj.zoomLevel--;
				obj.drawer.scale((obj.zoomLevel/obj.maxZoom));
			}
		},
		//gather together all relevant shape data into a json-like string
		bundleData:function(){
			var jshps=[];
			var pval=["scale","x","y","width","height","cx","cy","rx","ry","points","color"];
			for(u in this.drawer._manifest){
				for(sh in this.drawer._manifest[u]){
					if(this.drawer._manifest[u][sh]){
						var x=this.drawer._manifest[u][sh];
						var xargs={"scale":1};
						$.map(pval,function(o,i){
							if(o in x){
								xargs[o]=x[o];	
							}
						});
						jshps.push({'uid':x.id,'type':x.con,'points':xargs});
					}
				}
			}
			return jshps;
		},
		//called by Image when clear page tags is initiated
		_reset_CurrUrl:function(){
			this.drawer._reset_CurrUrl(); //function called in VD
		},
		_reset_All:function(){
			this.drawer._reset_All();
		},
		_killSession:function(){
			this.drawer._end();
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
			this.DOM=$("#raphael").css({'z-index':'1000','position':'relative'});
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
			this.startShapes=[];
			//global listeners
			$("body").bind("RaphaelImageReady",{obj:this},this.finishCanvas);
			$("body").bind("turnPage",{obj:this},this.showImg);
			$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
			//$("body").bind("shapeColorSubmit",{obj:this},this.changeShapeColor);
			$("body").bind("prevPageShapes",{obj:this},this.updateManifestShapes);
			$("body").bind("zoom",{obj:this},this.zoomHandle);
		},
		// @url can be a single string or an array of string values
		//url is {array} with each element being in this format:
		//{uri:{String}}
		addUrl:function(url){
			if((typeof url=="object")&&(url!=null)){
				//is an array - process array
				for(u in url){
					//if not already present in array, add image to url list
					//and to the master array
					var cu=url[u].uri;
					if((cu.length>1)&&(jQuery.inArray(cu,this.url)<0)){
						//var cleanurl=url[u].uri.replace(/^[A-Za-z0-9]+|[\t\r]+/,"");
						this.url.push(cu);
						//Master Array ---
						//tags: array of tags for this uri
						//n: index in this.url list
						this.manifest[cu]={
							n:(this.url.length-1),
							zoomLevel:this.zoomLevel,
							scale:false
						};
					}
					if(url[u].shapes){
						this.startShapes.push(url[u].shapes);
					}

					this.pageNum=(this.url.length-1);
				}

			}
		},
		getUrlList:function(){
			var data=[];
			for(d=0;d<this.url.length;d++){
				data[d]=this.url[d];
			}
			return data;
		},
		//NEW: using _base to add as prefix to each filename
		setUpCanvas:function(url,max,min){
			//create new image element
			this.srcImage.attr("src",url);
			//adjust width and height of raphael div
			this.DOM.css({width:this.srcImage.width(),height:$("#scroller").position().top});

			if(!this.image){
				//image not loaded yet, need to set up onload() function to call rest of 
				//canvas process
				var imgID=this.dateRand.getTime()+"_"+this.pageNum;
				var self=this;
				this.image=$("<img id=\""+imgID+"\" src=\""+url+"\"></img>").load(function(e){
					self.curUrl=url;
					//remove this handler, image already loaded
					self.image.unbind();
					self.DOM.trigger("RaphaelImageReady",[max,min]);

				}).appendTo(this.DOM).hide();
			} else {
				//image already loaded, don't need to wait for onload()
				this.image.hide();
				this.curUrl=url;
				this.DOM.trigger("RaphaelImageReady",[max,min]);
			}
		},
		finishCanvas:function(e,max,min){
			var obj=e.data.obj;
			if(obj.loc.scrollTop()==0){
				obj.loc.scrollTop(0);
				obj.loc.scrollLeft(0);
			}
			//new: user defines max and min in call to setupcanvas?
			if(max&&min){
				//configure zoom variables
				obj.figureSizeInfo(1,5);
			}

			obj.setPageInfo(obj.curUrl);
		},
		setPageInfo:function(url){
			if((this.curUrl==url)&&(this.manifest[url])){
				if(!this.manifest[this.curUrl].scale){
					//figure out first size attribute
					//OLD: use proportional scaling
					//NEW: use more mathematical scaling
					if(this.zoomLevel==0) this.zoomLevel=1;
					var scaleh=this.srcImage[0].height*(this.zoomLevel/this.zoomMax);
					var scalew=this.srcImage[0].width*(this.zoomLevel/this.zoomMax);
					this.manifest[this.curUrl].scale=[scalew,scaleh];
					this.manifest[this.curUrl].zoomLevel=this.zoomLevel;
					this.image.width(this.manifest[this.curUrl].scale[0]);
					this.image.height(this.manifest[this.curUrl].scale[1]);
					this.image.show();
				} else {
					this.zoomLevel=this.manifest[url].zoomLevel;
					this.image.width(this.srcImage[0].height*(this.zoomLevel/this.zoomMax));
					this.image.height(this.srcImage[0].width*(this.zoomLevel/this.zoomMax));
					this.image.show();
				}

				if(!this.drawTool){
					//set up drawing canvas
					
					this.drawTool=new RaphaelDrawTool({
						svgCanvas:$("#"+this.image.attr("id")),
						initScale:(this.zoomLevel/this.zoomMax),
						startsize:[this.srcImage[0].width,this.srcImage[0].height],
						startshapes:this.startShapes,
						canvasContainer:this.canvasAreaId
					});
				} else {
					this.drawTool.switchImage(this.curUrl);
				}

				this.srcImage.trigger("newPageLoaded",[this.manifest[this.curUrl].tags,this.curUrl,this.canvasObj]);
			}
		},
		zoomHandle:function(e,n){
			var self=e.data.obj;
			if(self.drawTool){
				//adjust the size of the raphael DOM box
				
				self.DOM.css({"height":$("#scroller").position().top});
				
			}
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
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum]);
				} else {
					//ran out of pages, or not available, send to 
					//beginning
					obj.pageNum=0;
					obj.setUpCanvas(obj.url[obj.pageNum]);
				}
			} else if((val<0)) {
				obj.pageNum--;
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum]);
				} else {
					//ran out of pages, or page not available,
					//go to end (wraparound)
					obj.pageNum=(obj.url.length-1);
					obj.setUpCanvas(obj.url[obj.pageNum]);
				}
			}

		},
		goToPage:function(n){

			this.pageNum=$.inArray(n,this.url);
			if(this.pageNum>-1){
				this.setUpCanvas(this.url[this.pageNum]);
			}
		},
		showCurrentImage:function(e){
			var obj=e.data.obj;
			if(obj.url[obj.pageNum]){
				var file=obj.url[obj.pageNum];
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
			this.DOM.hide();
			if(this.image) this.image.remove();
			this.image=null;
			$("body").unbind("turnPage",this.showImg);
			$("body").unbind("imageAdded",this.showCurrentImage);
			$("body").unbind("setCoordRegion",this.activateShapes);
			$("body").unbind("drawrectangle",this.drawRectangle);
			$("body").unbind("drawellipse",this.drawEllipse);
			$("body").unbind("drawpolygon",this.drawPolygon);
			$("body").unbind("zoom",this.zoom);
		},
		enable:function(){
			this.DOM.show();
			$("body").bind("turnPage",{obj:this},this.showImg);
			$("body").bind("imageAdded",{obj:this},this.showCurrentImage);
			$("body").bind("setCoordRegion",{obj:this},this.activateShapes);
			$("body").bind("drawrectangle",{obj:this},this.drawRectangle);
			$("body").bind("drawellipse",{obj:this},this.drawEllipse);
			$("body").bind("drawpolygon",{obj:this},this.drawPolygon);
			$("body").bind("zoom",{obj:this},this.zoom);
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
	ITag.RaphaelDrawTool=RaphaelDrawTool;
	ITag.TILEShapeToolBar=TILEShapeToolBar;
	ITag.TileAnimatedScroller=TileAnimatedScroller;
	
})(jQuery);