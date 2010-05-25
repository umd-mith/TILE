(function($){
	var TILE=this;
	
	var TileTag=Tag.extend({
		init:function(args){
			this.$super(args);

			//should have tagrules to populate the tag options element
			if(!args.tagRules) throw "No tagging rules sent to the Tag {Object}";
			this.tagRules=args.tagRules;
			this.shapeId=(args.shapeId)?args.shapeId:null;
			this.json=(args.json)?args.json:null;
			this.values=(args.values)?args.values:null;
			this.moveMe=$("#"+this.htmlindex+"_moveMe");

			this.items=[];
			this.attrs=[];
			this._display=true;
			this._edit=true;
			this.titleEl=$("#tagtitle_"+this.htmlindex);
			this.titleEl.bind("click",{obj:this},function(e){
				var obj=e.data.obj;
				$(this).trigger("toggleTagState",[obj.htmlindex,obj]);
			});

			this.titleElText=$("#tagtitle_"+this.htmlindex+" > span");
			this.titleElText.hide();
			this.titleElText.click(function(e){
				$(this).trigger("titleSet");
			});

			this.titleInputArea=$("#tagTitleInput_"+this.htmlindex);
			this.titleInputArea.val(this.title);
			this.titleInputArea.blur(function(e){
				e.preventDefault();
				$(this).trigger("titleSet");
			});


			this.tagDel=$("#tagdel_"+this.htmlindex);
			this.tagDel.bind("click",{obj:this},this.deleteTag);
			this.attrBody=$("#tagAtr_"+this.htmlindex);

			this.editB=$("#tagedit_"+this.htmlindex);

			this.editB.bind("click",{obj:this},this.doneEdit);


			this.setTitleChoices();

		//	this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
			this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
			this.DOM.bind("titleSet",{obj:this},this.setTitle);
			//constructed, notify other objects this is the active element
			this.DOM.trigger("tagOpen",[this.htmlindex,this]);
			this.DOM.trigger("activateShapeBar");
			this.DOM.trigger("deactivateShapeDelete");
			//global listeners
			$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);

			if(this.shapeId&&this.json){
				this.loadJSONShape();
			}

		},
		//SET BY JSON {Object}
		setTitleChoices:function(){
			//set by tagRules (see init constructor)
			//set up selection for first-level tags
			//use the NameValue object to do toplevel tags - handles other values
			this.NV=new TileNameValue({
				loc:this.attrBody,
				rules:this.tagRules,
				json:this.json,
				values:this.values
			});
		},
		//NEW: load shape based solely on its ID
		//NOT passed a shape object, just uses this.shapeId
		loadJSONShape:function(){
			if(this.mainRegion) this.mainRegion.destroy();
			//create shape object from stored JSON data
			//match up data first
			var shape=null;

			for(o in this.json){
				if(this.json[o].shapes){
					for(sh in this.json[o].shapes){
						if(this.json[o].shapes[sh].uid==this.shapeId){
							shape=this.json[o].shapes[sh].points;
							break;
						}
					}

				}
			}

			if(!shape) shape=this.shapeId;
			this.mainRegion=new TagRegion({
				loc:this.attrBody,
				name:"mainRegion"+this.htmlindex,
				shapeId:this.shapeId,
				shape:shape
			});
		},
		titleOptionClickHandle:function(e,id){
			var obj=e.data.obj;
			if(id!=null){
				//user has defined what title they want
			//	obj.title=obj.items[id].title;
				obj._rules=obj.items[id].rules;			
				obj.setTagAttr();
			} 
		},
		//can be triggered by setTitle or called externally
		setTitle:function(e){
			if(e){
				var obj=e.data.obj;
				//check if titleInput is hidden or not - if class set to locked, hidden
				if(obj.titleInputArea.hasClass("locked")){
					obj.titleElText.hide();
					//open input area and set value to stored title
					obj.titleInputArea.removeClass("locked").addClass("edit");
					obj.titleInputArea.val(obj.title);
				} else {
					obj.title=obj.titleInputArea.val().replace(/\n+\s+\t/g,"%");

					obj.titleInputArea.removeClass("edit").addClass("locked");
					// this.tagChoice.hide();

					obj.titleElText.text(obj.title);
					obj.titleElText.show();
				}
			} else {
				this.title=this.titleInputArea.val().replace(/\n+\s+\t/g,"%");

				this.titleInputArea.removeClass("edit").addClass("locked");
				// this.tagChoice.hide();

				this.titleElText.text(this.title);
				this.titleElText.show();
			}
		},
		setTagAttr:function(){
			if(this.attrs.length>0){
				$.each(this.attrs,function(i,a){
					a.destroy();
				});
			}
			if(this._rules){
				this.attrs=[];
				var a=new NameValue({
					loc:this.attrBody,
					id:this.attrBody.attr("id"),
					rules:this._rules
				});
				this.attrs.push(a);
			}
		},
		// toggleTagState:function(e,id,tag){
		// 	var obj=e.data.obj;
		// 	obj.titleEl.toggleClass("open");
		// 	obj.titleEl.toggleClass("closed");
		// 	if(obj.titleEl.hasClass("closed")){
		// 		//being turned off (collapsing box)
		// 		obj.editB.hide();
		// 		obj.attrBody.hide();
		// 		obj.setTitle();
		// 	
		// 		//if no shape, then must retrieve shape (if exists)
		// 	 	if(obj.mainRegion){
		// 			//get shape data and update coord text
		// 			obj.mainRegion.listenOff();
		// 		} else {
		// 			$("body").unbind('shapeCommit',obj.ingestCoordData);
		// 		}
		// 		obj.DOM.trigger("turnOffShapeBar");
		// 		
		// 	} else if(obj.titleEl.hasClass("open")){
		// 		//being turned back on (opening the box)
		// 		obj.titleInputArea.removeClass("locked").addClass("edit").val(obj.titleElText.text());
		// 		obj.editB.show();
		// 		obj.attrBody.show();
		// 		obj.titleElText.hide();
		// 		if(obj.mainRegion&&obj._display){
		// 			obj.mainRegion.listenOn();
		// 			//obj.DOM.trigger("deactivateShapeBar");
		// 			obj.DOM.trigger("activateShapeDelete");
		// 			//$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
		// 		} else if(obj._display){
		// 			if(obj._edit) {obj.DOM.trigger("activateShapeBar");}
		// 			//obj.DOM.trigger("activateShapeBar");
		// 			$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
		// 		} else {
		// 			obj.DOM.trigger("turnOffShapeBar");
		// 		}
		// 	}
		// },
		openTagState:function(){
			if(this.titleEl.hasClass("closed")){
				this.titleEl.removeClass('closed').addClass('open');

				//being turned back on (opening the box)
				this.titleInputArea.removeClass("locked").addClass("edit").val(this.titleElText.text());
				this.editB.show();
				this.attrBody.show();
				this.titleElText.hide();
				if(this.mainRegion&&this._display){
					this.mainRegion.listenOn();
					//obj.DOM.trigger("deactivateShapeBar");
					this.DOM.trigger("activateShapeDelete");
					//$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
				} else if(this._display){
					if(this._edit) {
						this.DOM.trigger("activateShapeBar");
					} else {
						this.DOM.trigger("turnOffShapeBar");
					}
					//obj.DOM.trigger("activateShapeBar");
					$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
				} else {
					this.DOM.trigger("turnOffShapeBar");
				}

			}
		},
		//closes the tag state when another tag is opened
		//called externally
		closeTagState:function(){	
			if(this.titleEl.hasClass("open")){

				this.titleEl.removeClass("open").addClass('closed');
				//if(!this.titleEl.hasClass("closed")) this.titleEl.addClass("closed");
				this.editB.hide();
				this.attrBody.hide();
				this.setTitle();
				$("body").unbind("deleteCurrentShape",this.deleteShape);

				if(this.mainRegion){
					this.mainRegion.listenOff();
				} else {
					$("body").unbind("shapeCommit",this.ingestCoordData);
				}
				this.DOM.trigger("turnOffShapeBar");
			}
		},
		toggleState:function(){
			if(this.titleEl.hasClass("open")){
				this.closeTagState();
			} else if(this.titleEl.hasClass("closed")) {
				this.openTagState();
			}
		},
		newPage:function(){
			//hide the DOM until the next page is loaded
			this.closeTagState();
			this.DOM.hide();
		},
		//show nothing until reset - opposite is displayOn() function
		displayOff:function(){
			this._display=false;
			if(this.titleEl.hasClass("open")){
				this.trigger("toggleTagState",[this.DOM.attr('id'),this]);
			}
		},
		//opposite is displayOff() function
		displayOn:function(){
			this._display=true;
			if(!this.titleEl.hasClass("open")){
				this.DOM.trigger("toggleTagState",[this.DOM.attr('id'),this]);

			}
		},
		//for showing up all the shapes at once - tag doesn't open
		showcase:function(){
			//if display is off, then it is now on
			this._display=true;
			if(this.mainRegion){
				this.mainRegion.showcase();
			}
		},
		deleteTag:function(e){
			if(e){
				var obj=e.data.obj;
				if(obj.mainRegion) {
					obj.mainRegion.destroy();
					obj.mainRegion=null;
				}
				obj.DOM.trigger("tagDeleted",[obj.htmlindex,obj]);
				obj.DOM.remove();

			} else {

				this.mainRegion.destroy();
				this.mainRegion=null;
				this.DOM.trigger("tagDeleted",[this.htmlindex,this]);
				this.DOM.remove();
			}
		},
		//fired when user clicks lock in 'lock' mode
		editTag:function(e){
			var obj=e.data.obj;
			//display lock in 'unlock' mode
			obj.editB.removeClass("lock");
			obj.editB.addClass("unlock");
			obj.editB.unbind("click");
			obj._edit=true;
			//display NameValue data as editable
			if(obj.NV) obj.NV._startEdit(); //recursive function
			if(obj.mainRegion){
				obj.mainRegion.anchorOff();
				obj.DOM.trigger("activateShapeDelete");
			} else {
				obj.DOM.trigger("activateShapeBar",[obj.index]);
				obj.DOM.trigger("deactivateShapeDelete");
			}
			obj.editB.bind("click",{obj:obj},obj.doneEdit);
		},
		//fired when the user first clicks on the 'lock'
		//afterward, fired after editB is clicked in 'unlock' mode
		doneEdit:function(e){
			//shape and all other data are now locked
			var obj=e.data.obj;
			//display 'lock' mode
			obj.editB.removeClass("unlock");
			obj.editB.addClass("lock");
			obj.editB.unbind("click");
			obj.editB.bind("click",{obj:obj},obj.editTag);
			if(obj.NV) obj.NV._noEdit();
			obj.DOM.trigger("turnOffShapeBar");
			obj._edit=false;
			$.each(obj.attrs,function(i,a){
				a.save();
			});
			if(obj.mainRegion){
				obj.mainRegion.anchorOn();
			}
		},
		reloadListeners:function(){
			// this.titleEl.bind("click",{obj:this},function(e){
			// 		var obj=e.data.obj;
			// 		$(this).trigger("toggleTagState",[obj.index,obj]);
			// 	});

			//this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
			this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		},

		//NEW: VectorDrawer Object sends out the coord data
		//wrapped in json-like object
		//Old: @shape,@coords
		//NEW: @shape: Associative array of shape attributes
		ingestCoordData:function(e,shape){
			var obj=e.data.obj;
			if(!obj.mainRegion){
				obj.shapeId=shape.id;

				obj.mainRegion=new TagRegion({
					loc:obj.attrBody,
					shape:shape,
					name:"mainRegion"+obj.htmlindex,
					shapeId:obj.shapeId
				});
				$("body").unbind("shapeCommit",obj.ingestCoordData);
			//	$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
				obj.DOM.trigger("activateShapeDelete");
			}
		},
		//OLD: called by trigger deleteCurrentShape
		//NEW: TabBar handles all deletes
		deleteShape:function(e){

			if(this.mainRegion){
				this.mainRegion.destroy();
				this.shapeId=null;
				this.mainRegion=null;
				//$("body").unbind("deleteCurrentShape",this.deleteShape);
				$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
				this.DOM.trigger("deactivateShapeDelete");
			}
		},
		removeTag:function(){
			this.closeTagState();
			this.DOM.remove();
		},
		bundleData:function(){
			//return part of JSON object
			//only returning values from (each) nameValue pair
			//var jsontag={"uid":this.htmlindex,"name":this.title,"shapeId:":(this.mainRegion)?this.mainRegion.shapeId:null};
			var jsontag=[]; //TabBar already gathers other information on tag - just need to recursively return
			//namevalue data 
			if(this.NV){

				jsontag.push(this.NV.bundleData()); //bundleData for NameValue Obj called

			}

			// var jsontag="{";
			// 		jsontag+="uid:"+this.htmlindex+",name:"+this.name+",shapeId:"+this.mainRegion.id+"}";

			//j[1]=(this.mainRegion)?this.mainRegion.bundleData():null;
			return jsontag;
		}

	});
	
	TILE.TileTag=TileTag;
	
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
			this.DOM=$("#raphael").css('z-index','1000');
			this.srcImage=$("#srcImageForCanvas");
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
			this.DOM.css({width:this.srcImage.width(),height:this.srcImage.height()});

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
						canvasContainer:this.DOM.attr("id")
					});
				} else {
					this.drawTool.switchImage(this.curUrl);
				}

				this.srcImage.trigger("newPageLoaded",[this.manifest[this.curUrl].tags,this.curUrl,this.canvasObj]);
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
		//changes the pages
		showImg:function(e,val){
			var obj=e.data.obj;
			if((val>0)){
				obj.pageNum++;
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum]);
				} else {
					obj.pageNum--;
				}
			} else if((val<0)) {
				obj.pageNum--;
				if(obj.url[obj.pageNum]){
					obj.setUpCanvas(obj.url[obj.pageNum]);
				} else {
					obj.pageNum++;
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
	
	TILE.RaphaelImage=RaphaelImage;
	
	/**
	Name-value object to be used specifically with TILE interface

	Top-Level Object that generates more, sub-level name-value pairs from
	Rules .childNodes array
	**/
	var TileNameValue=NameValue.extend({
		init:function(args){
			this.$super(args);
			var d=new Date();
			this.uid=d.getTime();
			this.htmlId=d.getTime()+"_nv";
			//this.rules has to be JSON SCHEMA structure as defined by TILE specs
			this.DOM=$("<div></div>").attr("id",this.htmlId).addClass("nameValue").appendTo(this.loc);
			this.select=$("<select></select>").appendTo(this.DOM);
			this.changeB=$("<a>Change</a>").appendTo(this.DOM).click(function(e){$(this).trigger("NV_StartOver");}).hide();


			this.topTag=null;
			this.items=[];
			//set up enum list of tag names
			//rules.tags: list of top-level tags
			this.setUpTopLevel();
			if(args.values){
				this.loadPreChoice(args.values);
			}
		},
		setUpTopLevel:function(){
			for(t in this.rules.topLevelTags){
				var uid=this.rules.topLevelTags[t];
				var T=null;
				for(g in this.rules.tags){
					if(this.rules.tags[g].uid==uid){
						T=this.rules.tags[g];
						break;
					}
				}
				if(T){
					var id=$("#"+this.DOM.attr("id")+" > option").length+"_"+this.DOM.attr("id");
					var o=$("<option></option>").attr("id",id).val(uid).text(T.name).appendTo(this.select);
					o.click(function(){
						$(this).trigger("nameSelect",[$(this).val()]);
					});
				}
			}
			this.select.bind("nameSelect",{obj:this},this.nameSelectHandle);
			this.loc.bind("NV_StartOver",{obj:this},this.startOverHandle);
			//this.loc.bind("nvItemClick",{obj:this},this.handleItemClick);
		},
		//values from JSON tag object have been added in constructor
		//use args[0].values to reload the topTag 
		loadPreChoice:function(args){
			var T=null;
			// /alert(args[0].uid+'  '+args[0].values);
			for(x in args[0].values){
				var nv=args[0].values[x];
				for(g in this.rules.tags){

					if(nv.tagUid==this.rules.tags[g].uid){
						T=this.rules.tags[g];
						break;
					}
				}
				if(T){
					this.select.hide();
					this.changeB.show();
					this.topTag=new NVItem({
						loc:this.DOM,
						tagData:T,
						tagRules:this.rules,
						preLoad:nv,
						level:0
					});

				}
			}

		},
		startOverHandle:function(e){
			var obj=e.data.obj;
			//get rid of current top-level area completely 
			if(obj.topTag){
				obj.topTag.destroy();
				obj.topTag=null;
				//hide change button and open up select element
				obj.changeB.hide();
				obj.select.show();
			}

		},
		_noEdit:function(){
			//tell topTag to hide editable items
			if(this.topTag) this.topTag._noEdit();
			this.changeB.hide();
		},
		_startEdit:function(){
			//user can now edit choices
			this.changeB.show();
			//cascade command down
			if(this.topTag) this.topTag._startEdit();
		},
		//picks up nameSelect trigger from option element
		nameSelectHandle:function(e,uid){
			var obj=e.data.obj;
			//Top-Level tag is selected, erase all items that are in items array
			//so as to get rid of any possible previous selections
			for(item in obj.items){
				obj.items[item].destroy();
			}

			obj.items=[];
			//hide the select element and open up change element
			obj.select.hide();
			obj.changeB.show();
			//find the tag that is the chosen top-level tag
			var T=null;
			for(g in obj.rules.tags){
				if(obj.rules.tags[g].uid==uid){
					T=obj.rules.tags[g];
					//set up the Top-Level NVItem - handles all the other NVItems
					var ni=new NVItem({
						loc:obj.DOM,
						tagData:T,
						tagRules:obj.rules,
						level:0
					});
					obj.topTag=ni;

					break;
				}
			}
		},
		evalRef:function(e){
			//analyze to see if val() refers to a URI or to another Tag's uid
			var obj=e.data.obj;
			if(obj.valueEl){
				var c=obj.valueEl.text();
				var ut=/http:|.html|.htm|.php|.shtml/;

				if(ut.test(c)){

				}
			}
		},
		bundleData:function(){
			var bdJSON={'uid':this.uid,'values':[]};
			if(this.topTag){
				//bdJSON.type=this.topTag.valueType;
				bdJSON.values.push(this.topTag.bundleData());
				// for(i in this.items){
				// 				var it=this.items[i].bundleData;
				// 				bdJSON.values.push(it);
				// 			}
			}else{
				bdJSON.value='null';
			}
			return bdJSON;
		}

	});
	
	TILE.TileNameValue=TileNameValue;
	

	var ALT_COLORS=["#CCC","#DDD"];

	var NVItem=Monomyth.Class.extend({
		init:function(args){
			this.loc=args.loc;
			this.rules=args.tagRules;
			this.preLoad=args.preLoad;
			this.tagData=args.tagData;
			this.tagUID=args.tagData.uid;
			this.level=(args.level)?args.level:0;
			//generate random unique ID
			var d=new Date();
			this.uid=d.getTime();
			this.tagName=this.tagData.name;
			//get HTML from external page
			$($.ajax({
				url:'lib/Tag/NameValueArea.php?id='+this.uid,
				dataType:'html',
				async:false
			}).responseText).insertAfter(this.loc);

			//this.nodeValue=args.nv;
			//this.DOM=$("<div class=\"subNameValue\"></div>").attr("id","namevaluepair_"+$(".subNameValue").length).insertAfter(this.loc);
			this.DOM=$("#"+this.uid+"_nameValue");
			//adjust DOMs margin based on level
			var n=this.level*15;
			this.DOM.css("margin-left",n+"px");
			this.DOM.css("background-color",((this.level%2)>0)?ALT_COLORS[0]:ALT_COLORS[1]);
			this.inputArea=$("#"+this.uid+"_nvInputArea");
			//insert title of tag into the inputArea
			$("#"+this.uid+"_nvInputArea > p").text(this.tagName);
			//this.changeB=$("#"+this.uid+"_nvInputArea > a").click(function(e){$(this).trigger("NV_StartOver");});
			this.requiredArea=$("#"+this.uid+"_required");
			this.optionalArea=$("#"+this.uid+"_optional");
			this.optSelect=$("#"+this.uid+"_optSelect");
			this.valueEl=null;

			this.items=[];
			this.setUpInput();
			if(this.preLoad){
				this.setUpPrevious();
			} else if(this.tagData.childNodes){
				this.setUpChildren();
			}

		},
		setUpInput:function(){

			//switch for displaying the correct value type
			switch(this.tagData.valueType){
				case 0:
					//do nothing - null value
					this.valueEl=$("<p>No value</p>").appendTo(this.inputArea);
					break;
				case 1:
					this.valueEl=$("<input type=\"text\"></input>").attr("id",this.DOM.attr('id')+"_input").val("").appendTo(this.inputArea);
					// this.DOM.append(this.valueEl);
					break;
				case 2: 
					//reference to a url or other tag
					this.valueEl=$("<input type=\"text\"></input>").attr("id",this.DOM.attr("id")+"_input").val("").appendTo(this.inputArea);
					//this.valueEl.bind("blur",{obj:this},this.evalRef);
					break;
				default:
					//enum type - set up select tag
					for(en in this.rules.enums){
						if(this.tagData.valueType==this.rules.enums[en].uid){
							var em=this.rules.enums[en];
							//alert('value el is an enum');
							// create select tag then run through JSON values for enum value
							this.valueEl=$("<select></select>").attr("id",this.DOM.attr('id')+"_input");


								for(d in em.values){
									//each em.value gets a option tag
									$("<option></option>").val(em.values[d]).text(em.values[d]).appendTo(this.valueEl);
								}

							this.valueEl.appendTo(this.inputArea);
							//end for loop
							break;
						}
					 }
				}
		},
		setUpChildren:function(){
			var optnodes=[];
			for(t in this.tagData.childNodes){
				var uid=this.tagData.childNodes[t];

				for(g in this.rules.tags){
					if((uid==this.rules.tags[g].uid)){
						if(this.rules.tags[g].optional=="false"){
							var tag=this.rules.tags[g];
							var el=new NVItem({
								loc:this.requiredArea,
								tagRules:this.rules,
								tagData:tag,
								level:(this.level+1)
							});
							this.items.push(el);
						} else {
							optnodes.push(this.rules.tags[g].uid);
						}
					}
				}
			}
			if(optnodes.length>0){
				this.optChoice=new NVOptionsItem({
					loc:this.optionalArea,
					options:optnodes,
					tagRules:this.rules
				});
			}
			//bind nvItemClick listener to DOM
			this.DOM.bind("nvItemClick",{obj:this},this.handleItemClick);
		},
		//Optional tag selected from option element 
		//adds an optional tag to the stack - called by nvItemClick
		handleItemClick:function(e,uid){
			e.stopPropagation(); //want to stop this from going up DOM tree
			var obj=e.data.obj;
			for(r in obj.rules.tags){
				if(uid==obj.rules.tags[r].uid){//found 
					var T=obj.rules.tags[r];
					var el=new NVItem({
						loc:obj.optChoice.DOM,
						tagRules:obj.rules,
						tagData:T,
						level:(obj.level+1)
					});
					obj.items.push(el);
					break; //stop loop
				}
			}
		},
		//take previously bundled data and re-create previous state
		setUpPrevious:function(){
			if(this.preLoad){
				//first, set up any previously set input value
				this.valueEl.val(this.preLoad.value);
				if(this.preLoad.values){
					for(x=0;x<this.preLoad.values.length;x++){
						var cur=this.preLoad.values[x];
						for(g in this.rules.tags){
							if(cur.tagUid==this.rules.tags[g].uid){
								var tag=this.rules.tags[g];
								var el=new NVItem({
									loc:this.requiredArea,
									tagRules:this.rules,
									tagData:tag,
									preLoad:cur.values,
									level:(this.level+1)
								});
								this.items.push(el);

								if(cur.value) el.valueEl.val(cur.value);
							}
						}
					}
				}
			}
		},
		//RECURSIVE FUNCTION
		bundleData:function(){

			//return JSON-like string of all items
			var _Json={"uid":this.uid,"tagUid":this.tagUID,"name":this.tagData.tagName,"type":this.tagData.valueType,"value":this.valueEl.val().replace(/[\n\r\t]+/g,""),"values":[]};
			for(i in this.items){
				var it=this.items[i].bundleData();
				_Json.values.push(it);
			}
			return _Json;
		},
		destroy:function(){
			for(i in this.items){
				this.items[i].destroy();
			}
			this.valueEl.remove();
			this.DOM.remove();
		},
		_noEdit:function(){
			//hide editable elements from user
			if(this.valueEl){	
				$("#"+this.uid+"_nvInputArea > p").text(this.tagName+": "+this.valueEl.val());
				this.valueEl.hide();
			}
			//cascade command down to other items
			var s=this;
			for(i=0;i<this.items.length;i++){

				setTimeout(function(T){
					T._noEdit();
				},1,this.items[i]);
			}
		},
		_startEdit:function(){
			//show editable elements for user
			if(this.valueEl){
				$("#"+this.uid+"_nvInputArea > p").text(this.tagName);
				this.valueEl.show();
			}
			//cascade command down to other items
			var s=this;
			for(i=0;i<this.items.length;i++){
				setTimeout(function(T){
					T._startEdit();	
				},1,this.items[i]);
			}
		}
	});
	
	TILE.NVItem=NVItem;
	
	//Sub-level version of Name-Value object above
	var NVOptionsItem=Monomyth.Class.extend({
		init:function(args){
			this.loc=args.loc;
			this.rules=args.tagRules;
			this.options=args.options;
			//create select element and insert after the args.loc jQuery object
			this.DOM=$("<select class=\"name_value_Option\"></select>").attr("id","select_"+$(".nameValue").length).insertAfter(this.loc).hide();
			//make toggle button to show/hide the DOM
			this.toggleB=$("<span>Add more data...</span>").insertAfter(this.loc);
			this.toggleB.bind("click",{obj:this},this.toggleDisplay);
			this.w=false;
			if(this.options){
				this.setUpNames();
			}
		},
		setUpNames:function(){
			for(o in this.options){
				var id=$("#"+this.DOM.attr("id")+" > option").length+"_"+this.DOM.attr("id");
				var opt=$("<option></option>").appendTo(this.DOM);
				for(t in this.rules.tags){
					var T=this.rules.tags[t];
					if(this.options[o]==T.uid){
						opt.val(T.uid).text(T.name);
						break;
					}
				}
				//set up listener for when an option is chosen
				opt.click(function(e){ 
					$(this).trigger("nvItemClick",[$(this).val()]);
				});
			}
		},
		toggleDisplay:function(e){
			var obj=e.data.obj;
			if(!obj.w){
				obj.DOM.show('fast');
				obj.w=true;
			} else {
				obj.DOM.hide('fast');
				obj.w=false;
			}

		},
		destroy:function(){
			this.DOM.remove();
		}
	});
	TILE.NVOptionsItem=NVOptionsItem;
	//TILE REGION 
	var TagRegion=Region.extend({
		init:function(args){
			this.$super(args);
			this.shapeId=args.shapeId;

			this.anchor=false;

			var html="<li id=\"tagcoordslabel_"+this.shapeId+"\" class=\"tagtype\">Region Data:</li><li id=\"tagcoordsvalue_"+this.shapeId+"\" class=\"tagvalue\"><span id=\"tagcoordstextoutput_"+this.shapeId+"\">None</span></li>";
			args.loc.append(html);
			this.coordLabel=$("#tagcoordslabel_"+this.shapeId);
			this.coordValue=$("#tagcoordsvalue_"+this.shapeId);
			this.textOutput=$("#tagcoordstextoutput_"+this.shapeId);

			$("body").bind("shapeCoordUpdate"+this.shapeId,{obj:this},this.captureShapeData);

			if(this.shape.args||this.shape.scale) this.updateCoordText(this.shape);
		},
		captureShapeData:function(e,data){
			var obj=e.data.obj;
			if(!obj.anchor){
				obj.updateCoordText(data);
			}
		},
		updateCoordText:function(shape){
			//TODO:make separate shape outputs, instead of one universal output

			var txt=$("<ul></ul>");
			var m=[];
			if(!shape.con) {
				shape.con=(shape.path)?'path':(shape.x)?'rect':(shape.cx)?'ellipse':null;
			}
			switch(shape.con){
				case 'rect':
					m=$.map(["scale","width","height","x","y"],function(v){
						if(v in shape){
							txt.append($("<li>"+v+": "+shape[v]+"</li>"));
						}
					});
					break;
				case 'ellipse':
					m=$.map(["scale","cx","cy","rx","ry"],function(v){
						if(v in shape){
							txt.append($("<li>"+v+": "+shape[v]+"</li>"));
						}
					});
					break;
				case 'path':
					m=$.map(["scale","displayArgs"],function(v){
						if(v in shape){
							txt.append($("<li>"+v+": "+shape[v]+"</li>"));
						}
					});
					break;	
			}	
			this.textOutput.html(txt);
		},
		destroy:function(){	
			//this.coordLabel.trigger("drawerRemoveShape",[this.shape.id]);
			$("body").trigger("VD_REMOVESHAPE",[this.shapeId]);
			this.coordLabel.remove();
			this.coordValue.remove();

			//return true;
		},
		listenOff:function(){
			//hide shape and turn off listeners

			$("body").trigger("shapeDisplayChange",["d",this.shapeId]);
			$('body').unbind("shapeCoordUpdate"+this.shapeId,this.captureShapeData);
		},
		listenOn:function(){
			//show shape and turn on listeners
			$("body").trigger("shapeDisplayChange",["a",this.shapeId]);
			$('body').bind("shapeCoordUpdate"+this.shapeId,{obj:this},this.captureShapeData);
		},
		showcase:function(){
			// this.shape.activate();
			// 		$('body').unbind(this.shape.shapeChangeCall);
		},
		anchorOn:function(){
			this.anchor=true;
			$("body").trigger("shapeDisplayChange",["sa",this.shapeId]);
		},
		anchorOff:function(){
			this.anchor=false;
			$("body").trigger("shapeDisplayChange",["ra",this.shapeId]);
		},
		bundleData:function(){
			//produce json string of shape info
			var jsonreg={"uid":this.shape.id,"type":this.shape.con,"points":{"cx":null,"cy":null,"x":null,"y":null,"rx":null,"ry":null,"width":null,"height":null,"scale":null}};
			// var jsonreg="{";
			// 		jsonreg+="uid:"+this.shape.index+",type:"+this.shape.con+",points:[";
			var S=this.shape;
			var ps=["cx","cy","x","y","rx","ry","width","height","scale"];
			var points={};
			for(v in S){
				if($.inArray(v,ps)>-1){
					points[v]=S[v];
				}
			}
			jsonreg.points=points;
			//alert("jsonreg.points: "+jsonreg.points+" scale: "+jsonreg.points.scale+"  "+jsonreg.points.x);
			return jsonreg;
		}
	});
	
	
	TILE.TagRegion=TagRegion;
	
	//TILE TOOLBARS
	
	//TILETopToolBar
	//handles all commands for opening new images,
	//importing tags, saving tags, resetting tag sessions
	var TILETopToolBar=TopToolBar.extend({
		init:function(args){
			this.$super(args);
			this.newImageB=$("#newimage");
			this.newImageB.click(function(e){
				$(this).trigger("openNewImage");
				$(this).trigger("closeDownVD",[true]);
			});


			this.importB=$("#import");
			this.importB.click(function(e){
				$(this).trigger("openLoadTags");
			});
			//Saving Progress
			this.savePrompt=new Save({loc:this.DOM.attr("id")});
			this.saveB=$("#save");
			this.saveB.click(function(e){
				$(this).trigger("saveAllSettings");
			});
			$("body").bind("dataReadyToSave",{obj:this},this.saveSettings);
			//this.moreSelect=$("#moreselect");
			this.setUpMore();
		},
		setUpMore:function(){
			$("#moreselect > option").each(function(i,el){
				$(el).click(function(e){
					$(this).trigger("moreOptionClick",[$(this).val()]);
				});
			});
			this.DOM.bind("moreOptionClick",{obj:this},this.handleMoreClick);
		},
		handleMoreClick:function(e,val){
			var obj=e.data.obj;
			switch(val){
				case "clearSession":
					obj.DOM.trigger("clearSession");
					break;
				case "clearPage":
					obj.DOM.trigger("clearPage");
					break;
				case "restart":
					obj.DOM.trigger("restartAll");
					break;
				case "help":
					obj.DOM.trigger("showHelp");
					break;
			};
		},
		saveSettings:function(e,info){
			var obj=e.data.obj;

			obj.savePrompt.userPrompt(info);
		}
	});
	TILE.TILETopToolBar=TILETopToolBar;
	/**Secondary toolbar for the TILE interface - holds 
	buttons for shape commands 
	**/

	var TILEShapeToolBar=SideToolBar.extend({
		init:function(args){
			this.$super(args);
			// if(!args.rules) throw "No rules passed to the tagging toolbar";
			// 		this.rules=args.rules;
			// 		
			this.DOM.append($.ajax({
				async:false,
				url:'lib/ToolBar/SideToolBar.html',
				type:'GET',
				dataType:'html'
			}).responseText);
			
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
					$("#sel").removeClass("active");
					$(this).trigger("changeShapeType",['r']);
				}
			});
			this.poly=$("#poly");
			this.poly.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#rect").removeClass("active");
					$("#elli").removeClass("active");
					$("#sel").removeClass("active");
					$(this).trigger("changeShapeType",['p']);
				}
			});
			this.elli=$("#elli");
			this.elli.click(function(e){
				if(!($(this).hasClass("active"))){
					$(this).addClass("active");
					$("#rect").removeClass("active");
					$("#poly").removeClass("active");
					$("#sel").removeClass("active");
					$(this).trigger("changeShapeType",['e']);
				}
			});
			this.sel=$("#sel");
			this.sel.click(function(e){
				if(!(this).hasClass("active")){
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
			obj.setTagChoices(obj.rules);
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
	
	TILE.TILEShapeToolBar=TILEShapeToolBar;
	
	var TileTabBar=TabBar.extend({
		init:function(args){
			this.$super(args);
			this.imageLoaded=false;
			this.curTag=null;
			//massive manifest file for all tags
			this.manifest=[];

			//for generating random index values for tags
			this.dateRand=new Date();

			//tab1 handles all tags and tagging attributes
			this.tab1=$("#TABONE");

			this.protoTab=$("#tabs");
			this.protoTab.tabs({
				select:function(e,ui){
					switch(ui.index){
						case 0:
							$(this).trigger('tagging');
							break;
						case 1:
							$(this).trigger('autorecognize');
							break;
					}
				}
			});

			this.taggingArea=$("#tabs-1");

			this.addTagB=$("#addTag");
			this.addTagB.click(function(e){
				$(this).trigger("addATag");
			});

			this.tagHolder=$("#tagHolder");
			//this.attachARControls();
			this.tags=[];
			this.TL=[];
			this.tagRules=null;
			//local binds
			//this.taggingArea.bind("tagOpen",{obj:this},this.setOpenTag);
			this.taggingArea.bind("toggleTagState",{obj:this},this.setOpenTag);
			this.taggingArea.bind("addATag",{obj:this},this.addTag);

			//local binds
			this.DOM.bind("changeOrder",{obj:this},this.changeTagOrder);

			//global binds
			$("body").bind("imageAdded",{obj:this},function(e){
				var obj=e.data.obj;
				obj.imageLoaded=true;
			});
			$("body").bind("tagDeleted",{obj:this},this.tagDeletedHandle);

			$("body").bind("newPageLoaded",{obj:this},this.setNewPageData);
			$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			$("body").bind("deleteCurrentShape",{obj:this},this.deleteShapeHandle);
			$("body").bind("shapeSelect",{obj:this},this.shapeDisplayHandle);
			$("body").bind("_showCurrentShape",{obj:this},function(e){
				var obj=e.data.obj;

				if(obj.curTag) obj.curTag.openTagState();
			});
			//make tagHolder into a sortable list (see JQuery UI)
			this.createSortable();
		},
		createSortable:function(){
			//using jQuery sortable command
			this.tagHolder.sortable({
				items:'li',
				handle:'a.moveTag',
				scroll:true,
				// containment:'parent', //contained within this.tagHolder > ul
				stop:function(e,ui){
					if ($(ui.item)) {
						$(this).trigger("changeOrder", [ui]);
					}
				}
			});
		},
		changeTagOrder:function(e,ui){
			var obj=e.data.obj;
			//update larger tag list
			//create array if none exists
			if(!obj.TL[obj.curUrl]) obj.TL[obj.curUrl]=[];
			//store the UI toArray list of id's into the array - sorted later in bundleData
			obj.TL[obj.curUrl]=obj.tagHolder.sortable('toArray');

		},
		//NEW: ingest the tag rules for each tag in @tagrules
		initTagRules:function(e,tagrules,p){
			var obj=e.data.obj;

			obj.tagRules=tagrules;
			// for(t in tagrules){
			// 			var r=tagrules[t];
			// 			for(i in r){
			// 				//each i represents a given rule attr
			// 				//i[r] is the value of the attr
			// 				
			// 			}
			// 		}
		},
		attachARControls:function(){
			this.arcontrols=new TileAutoRecognizerTools({
				loc:this.recognizeArea
			});
			//set back to tagging tab
			this.protoTab.tabs('select',0);
		},
		addTag:function(e){
			var obj=e.data.obj;
			if(obj.imageLoaded&&obj.tagRules){

				if(obj.curTag) obj.curTag.closeTagState();
				//add a new tag to the tab1 area

				var tag=new TileTag({loc:obj.tagHolder.attr("id"),tagRules:obj.tagRules});
				//hide all other shapes currently on campus
				obj.curTag=tag; //change current tag
				//if new tag, set up mini-manifest
				if(!obj.manifest[obj.curUrl][tag.uid]){
					obj.manifest[obj.curUrl][tag.uid]={tagEl:tag,shapeId:tag.shapeId,n:obj.manifest[obj.curUrl].length};
				}
				obj.curTag=obj.manifest[obj.curUrl][tag.uid].tagEl;

				//update the TL list
				// var d=[];
				// 			$("#"+obj.tagHolder.attr('id')+" > li").each(function(){
				// 				d.push($(this).attr('id'));
				// 			});
				// 			obj.TL[obj.curUrl]=d;
			}
		},
		//received once a tag is completed constructor call - 
		//add to manifest
		setOpenTag:function(e,i,tag){
			var obj=e.data.obj;

			if(!obj.curTag) obj.curTag=tag;
			if(tag.htmlindex!=obj.curTag.htmlindex){
				obj.curTag.closeTagState();
				obj.curTag=tag;
				//open the new curTag
				obj.curTag.openTagState();

			} else {
				obj.curTag.toggleState();
			}
			//in case manifest not set somehow, break program
			if(!obj.curUrl) return;
		},
		switchTag:function(e,i,tag){
			var obj=e.data.obj;
			if(!obj.curTag) obj.curTag=tag;
			if(tag.htmlindex!=obj.curTag.htmlindex){
				obj.curTag.closeTagState();
				obj.curTag=tag;
			}
		},
		tagDeletedHandle:function(e,i,tag){
			var obj=e.data.obj;
			if(obj.imageLoaded&&obj.curUrl){
				if(obj.manifest[obj.curUrl][tag.uid]){
					obj.manifest[obj.curUrl][tag.uid]=null;

				}
				// if(obj.TL[obj.curUrl]){
				// 				for(s in obj.TL[obj.curUrl]){
				// 					if(obj.TL[obj.curUrl][s]==i){
				// 						obj.TL[obj.curUrl][s]=null;
				// 						break;
				// 					}
				// 				}
				// 			}
			//	alert('now the tag is: '+obj.manifest[obj.curUrl][i]+'   '+obj.TL[obj.curUrl][i]);
			}
			obj.DOM.trigger("turnOffShapeBar");
		},
		deleteShapeHandle:function(e){
			var obj=e.data.obj;
			if(obj.curTag) obj.curTag.deleteShape();
		},
		//called from newPageData trigger
		//@data refers to the array of tag elements
		setNewPageData:function(e,data,url){
			var obj=e.data.obj;
			obj.tags=[];
			//changing pages, reset shapebar
			//first clear out all tags
			//hide DOM elements that are in tagHolder
			//$("#"+obj.tagHolder.attr('id')+" > .tag").hide();
			 if(obj.manifest[obj.curUrl]){
			 	var u=obj.manifest[obj.curUrl];
			 	for(tag in u){
					if(u[tag]&&u[tag].tagEl){
						u[tag].tagEl.newPage();
					}
		 		}
		 	}
			//reset shapebar
			obj.DOM.trigger("turnOffShapeBar");

			if(url){
				obj.curUrl=url;
				if(!obj.TL[obj.curUrl]) obj.TL[obj.curUrl]=[];
				if(!obj.manifest[obj.curUrl]){
					//make new manifest section for this page
					obj.manifest[obj.curUrl]=[];
				} else {
					//reload tags 
					obj.reloadTags(obj.manifest[obj.curUrl]);
				}

			}
		},
		reloadTags:function(data){
			//@data: associative array with page data

			for(d in data){
				if(data[d]&&data[d].tagEl) {
					data[d].tagEl.DOM.show();
					//this.tagHolder.append(data[d].tagEl.DOM);
					this.tags.push(data[d].tagEl);
					data[d].tagEl.reloadListeners();
					data[d].tagEl.closeTagState();
				}
			}
		},	
		loadJSONTags:function(data,curUrl){
			this.manifest=[];

			//set up all tags and remove them
			for(j in data){
				if(data[j].uri.length>1){
					//clear manifest array of tags
					this.manifest[""+data[j].uri]=[];

					for(t in data[j].tags){
						var tg=data[j].tags[t];
						//passing in full JSON tag object
						var cd=new TileTag({loc:this.tagHolder.attr("id"),htmlindex:tg.uid,title:tg.name,
						values:tg.values,json:data,tagRules:this.tagRules,shapeId:tg.shapeId});

						this.manifest[""+data[j].uri][tg.uid]={tagEl:cd};

						//hide the jQuery object and turn off its listeners
						this.manifest[""+data[j].uri][tg.uid].tagEl.closeTagState();
						this.manifest[""+data[j].uri][tg.uid].tagEl.DOM.hide();

					}

				}
			}
			this.curUrl=curUrl;
			this.tags=[];
			if(this.manifest[this.curUrl]){
				for(d in this.manifest[this.curUrl]){
					if(this.manifest[this.curUrl][d].tagEl) {
						this.manifest[this.curUrl][d].tagEl.DOM.show();
						this.tags.push(this.manifest[this.curUrl][d].tagEl);
						this.manifest[this.curUrl][d].tagEl.reloadListeners();
						this.manifest[this.curUrl][d].tagEl.closeTagState();
					}
				}
			}
		},
		removeTags:function(){
			//make sure to close all listeners
			if(this.curTag) {
				this.curTag.closeTagState();
				this.curTag=null;
			}
			//hide DOM elements that are in tagHolder
			$("#"+this.tagHolder.attr('id')+" > .tag").hide();
			//reset the array - new set of tags will be loaded
			this.tags=[];
		},
		clearCurrentTags:function(){
			this.removeTags();
			this.DOM.trigger("turnOffShapeBar");
		},
		shapeDisplayHandle:function(e,d){
			var obj=e.data.obj;
			switch(d){
				case 'all':
					$.each(obj.tags,function(i,t){
					//	t.toggle();
						t.closeTagState();
					});
					break;
				case 'none':
					$.each(obj.tags,function(i,t){
						t.closeTagState();
					});
					break;
				case 'current':
					$.each(obj.tags,function(i,t){
						t.closeTagState();
					});


					break;
			}
		},
		bundleData:function(){
			var tbjson=[];
			//compress manifest into a JSON structure
			for(u in this.manifest){
				var curl={url:u,tags:[]};
				//go through stored order of tags

				for(s in this.manifest[u]){
					if(this.manifest[u][s]&&this.manifest[u][s].tagEl){
						var x=this.manifest[u][s].tagEl;
						curl.tags.push({'url':u,'uid':x.htmlindex,'name':x.title,'values':x.bundleData(),'shapeId':x.shapeId});
					}
				}
				tbjson.push(curl);
			}
			return tbjson;
		},
		reset_Curr_Manifest:function(){
			if(this.curUrl&&(this.manifest[this.curUrl])){
				for(tg in this.manifest[this.curUrl]){
					if(this.manifest[this.curUrl][tg]){
						var tag=this.manifest[this.curUrl][tg];
						if(tag.tagEl){
							tag.tagEl.DOM.remove();
							tag=null;
						}
					}
				}
				this.manifest[this.curUrl]=[];
			}
			this.DOM.trigger("turnOffShapeBar");
		},
		_resetAllTags:function(){
			for(u in this.manifest){
				var x=this.manifest[u];
				//go through tags stored in this url
				for(tg in x){
					if(x[tg]){
						var tag=x[tg];
						if(tag.tagEl){
							tag.tagEl.DOM.remove();
						}
					}
				}
			}
			this.manifest=[];
			this.DOM.trigger("turnOffShapeBar");
		}
	});
	
	TILE.TileTabBar=TileTabBar;
	
	/**
	Dialog Boxes: Import, New Image, Load Tags
	**/
	
	var ImportDialog=Dialog.extend({
		init:function(args){
			this.$super(args);
			this.index=($("#dialog").length+this.loc.width());
			this.loc.append($.ajax({
				async:false,
				dataType:'html',
				url:'lib/Dialog/dialogImport.html'
			}).responseText);

			//lightbox content
			this.light=$("#light");
			this.fade=$("#fade");
			this.DOM=$("#dialogImport");
			this.closeB=$("#importDataClose");
			this.closeB.click(function(e){
				$(this).trigger("closeImpD");
			});

			this.schemaFileInput=$("#importDataFormInputSingle");
			this.schemaFileFormSubmit=$("#importDataFormSubmitSingle");
			//this.schemaFileFormSubmit.bind("click",{obj:this},this.handleSchemaForm);

			this.multiFileInput=$("#importDataFormInputMulti");
			this.multiFileFormSubmit=$("#importDataFormSubmitMulti");
			this.multiFileFormSubmit.bind("click",{obj:this},this.handleMultiForm);
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("closeImpD",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.display);
		},
		display:function(e){
			var obj=e.data.obj;
			obj.fade.show();
			obj.DOM.show();
			obj.light.show();
		},
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		},
		handleSchemaForm:function(e){
			e.preventDefault();
			var obj=e.data.obj;
			var file=obj.schemaFileInput.text();
			if(/http:\/\//.test(file)){
				obj.DOM.trigger("schemaFileImported",[file]);
			} else {
				//show warning: not a valid URI
			}
		},
		handleMultiForm:function(e){
			e.preventDefault();
			var obj=e.data.obj;
			var file=obj.multiFileInput.attr("value");
			var schema=obj.schemaFileInput.attr("value");
			if(file.length&&schema.length){
				if(/http:\/\//.test(file)){
					//trigger an event that sends both the schema and the list of files to listener
					obj.DOM.trigger("schemaFileImported",[file,schema]);
					// obj.DOM.trigger("schemaLoaded",[{schema:schema}]);
					// 					obj.DOM.trigger("multiFileListImported",[file]);
				} else {
					//show warning: not a valid URI
				}
			}
		}
	});
TILE.ImportDialog=ImportDialog;
	var LoadTags=Dialog.extend({
		init:function(args){
			this.$super(args);
			this.loc.append($.ajax({
				async:false,
				url:'lib/Dialog/DialogLoadTags.html',
				dataType:'html'
			}).responseText);
			this.DOM=$("#loadTagsDialog");
			this.closeB=$("#loadTagsClose");
			this.closeB.click(function(e){
				$(this).trigger("closeLoadTags");
			});
			this.light=$("#LTlight");
			this.fade=$("#LTfade");

			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.display);
			$("body").bind("closeLoadTags",{obj:this},this.close);
		},
		display:function(e){
			var obj=e.data.obj;
			obj.light.show();
			obj.DOM.show();
			obj.fade.show();
		},
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		}
	});

TILE.LoadTags=LoadTags;
	// New Image Box


	var NewImageDialog=Dialog.extend({
		init:function(args){
			this.$super(args);

			this.loc.append($.ajax({
				async:false,
				url:'lib/Dialog/dialogNewImg.html',
				dataType:'html'
			}).responseText);
			this.DOM=$("#dialogNewImg");

			this.closeB=$("#newImgClose");
			this.closeB.click(function(e){
				$(this).trigger("closeNewImage");
			});
			this.uriInput=$("#newImgURIInput");

			this.submitB=$("#newImgSubmit");
			this.submitB.bind("click",{obj:this},this.handleImageForm);

			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("openNewImage",{obj:this},this.display);
			$("body").bind("closeNewImage",{obj:this},this.close);
		},
		display:function(e){
			var obj=e.data.obj;
			obj.DOM.show();
		},
		close:function(e){
			var obj=e.data.obj;
			obj.DOM.hide();
		},
		handleImageForm:function(e){

			var obj=e.data.obj;
			if(obj.uriInput.val().length>0){
				obj.DOM.trigger("newImageAdded",[obj.uriInput.val()]);
				obj.uriInput.attr("value","");
				obj.DOM.trigger("closeNewImage");
			}
		}
	});
	TILE.NewImageDialog=NewImageDialog;
	
	/**
	TILE LogBar
	
	Inherits from Log in base.js
	**/
	var TileLogBar=Log.extend({
		init:function(args){
			this.$super(args);
			this.DOM=$(".log_body");
			this.list=$(".log_body > #logitemlist");
			this.logitemhtml=args.logitemhtml;
			this.rules=null;
			
			//global listeners
			$("body").bind("shapeCommit",{obj:this},this.addShape);
			$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			$("body").bind("loadNewTag",{obj:this},this.addTag);
		},
		addShape:function(e,shape){
			var obj=e.data.obj;
		
			var l=new TileLogShape({
				loc:obj.list,
				html:obj.logitemhtml,
				shape:shape
			});
			
		},
		//handler for tags sent to the log
		addTag:function(e,uid){
			var obj=e.data.obj;
			if(obj.rules){
				var l=new TileTag({
					loc:obj.list.attr("id"),
					tagRules:obj.rules
					
				});
				// var l=new TileLogTag({
				// 					loc:obj.list,
				// 					html:obj.logitemhtml,
				// 					rules:obj.rules,
				// 					uid:uid
				// 				});
			}
		},
		initTagRules:function(e,rules){
			var obj=e.data.obj;
			//store rules - if already present, erase all log items and start over
			//TODO: finalize this action
			if(obj.rules){
				obj.clearLogItems();
				
			}
			obj.rules=rules;
			
		},
		clearLogItems:function(){
			$(".logitem").remove();
		}
	});
	TILE.TileLogBar=TileLogBar;
	var TileLogTag=LogItem.extend({
		init:function(args){
			this.$super(args);
			//Tag UID - find in rules
			this.uid=args.uid;
			this.rules=args.rules;
			this.tagdata=this.getSelfData();
			var self=this;
			$("div.logitem").each(function(a){
				if(!$(this).attr("id")){
					self.DOM=$(this);
					self.DOM.attr("id","logitem_"+$(this).parent().attr("id")+a);
					$.data(self.DOM,"uid",self.uid);
				}
			});
			this.dataArea=$("#"+this.DOM.attr("id")+" > span");
			this.dataArea.append($("<p>"+this.tagdata.name+"</p>"));
		},
		getSelfData:function(){
			var d=null;
			for(r in this.rules.tags){
				if(this.rules.tags[r].uid==this.uid){
					d=this.rules.tags[r];
					break;
				}
			}
			return d;
		}
	});
	
	TILE.TileLogTag=TileLogTag;
	
	var TileLogShape=LogItem.extend({
		init:function(args){
			this.$super(args);
			var self=this;
			//UID is directly related to the Log Item's SHAPE UID
			this.uid=args.shape.uid;
			$("div.logitem").each(function(a){
				if(!$(this).attr("id")){
					self.DOM=$(this);
					self.DOM.attr("id","logitem_"+$(this).parent().attr("id")+a);
					$.data(self.DOM,"uid",self.uid);
				}
			});
			
			
			this.shape=args.shape;
			this.shapeSpan=$("#"+this.DOM.attr("id")+" > span");
			this.setShapeObj();
			
			this.delSpan=$("#"+this.DOM.attr("id")+" > span.logitem_delete");
			//configure the name for this log item
			this.name="LogItem"+$("div.logitem").length;
			$("<h4>"+this.name+"</h4>").insertBefore(this.shapeSpan);
			
			//set up listeners
			this.DOM.click(function(e){
				$(this).trigger("showItem",[]);
			});
			//set up custom events 
			//global
			
			//local
		},
		setShapeObj:function(){
			var self=this;
			$.map(["scale","width","height","x","y"],function(v){
				if(v in self.shape){
					self.shapeSpan.append($("<li>"+v+": "+self.shape[v]+"</li>"));
				}
			});
		}
	});
	
	TILE.TileLogShape=TileLogShape;
	
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
			this.drawer=new tile_vd('s',this.initScale,[],this.startsize,this.mainCanvas,null,this.cContain);
			
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
		switchMode:function(e,type){alert(type);
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
	
	
	TILE.RaphaelDrawTool=RaphaelDrawTool;
	
	var TileAnimatedScroller=AnimatedScroller.extend({
		init:function(args){
			this.$super(args);
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
						var w=($(this)[0].width*self.container.height())/$(this)[0].height;
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
})(jQuery);