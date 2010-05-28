///TILE LOGBAR
//TODO: make proper documentation
//code just for the log bar and related objects (tile_base getting too crowded)
//Using this code and not tile_base.js


(function($){
	var TILE=this;
	/**Main Engine **/
	//loads in html layout, sends to all other objects 
	//creates objects
	var TILE_ENGINE=Monomyth.Class.extend({
		init:function(args){
			//get HTML from PHP script and attach to passed container
			this.loc=(args.attach)?args.attach:$("body");
			var self=this;
			$.ajax({
				dataType:"json",
				url:"./lib/JSONHTML/columns.json",
				success:function(d){
					//d represents JSON data
					$(d.body).appendTo($("body"));
					self.DOM=$("body");
					//this.startURL=args.URL;
					self.getBase();
					//self.json=(args.json)?args.json:false;
					self.schemaFile=null;
					self.preLoadData=null;
					//global bind for sidebar completion event to loadCanvas()
					self.setUp(d);
				}
			});

		},
		getBase:function(){
			//check JSON file to configure main path
			var self=this;
			$.ajax({url:'TILECONSTANTS.json',dataType:'json',success:function(d){
				//d refers to the JSON data
				self._base=d.base;
			},async:false});

		},
		/**Get Schema**/
		//taken from setMultiFileImport Custom Event call from ImportDialog
		getSchema:function(e,file,schema){
			var obj=e.data.obj;
			obj.schemaFile=schema;
			obj.jsonReader.readSchemaFromFile(obj.schemaFile);
		},
		setUp:function(d){
			//store JSON html data - has everything for layout
			this.columnslayout=d;

			//create log - goes towards left area
			this._log=new TileLogBar({html:d.log,logitemhtml:d.logitem});


			//important variables
			//this.imageLoaded=false;

			//finishes the rest of init
			this.toolbarArea=$("#header");
			// this.ToolBar=new TILETopToolBar({
			// 			loc:this.toolbarArea,
			// 			position:'top'
			// 		});

			 //load new tags - opened by TopToolBar
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

			//start ImageTagger

			this._Itag=new _Itag({loc:"azcontentarea",base:this._base,html:d.imagetagger});
			$("body").bind("schemaFileImported",{obj:this},this.getSchema);

			$("body").bind("saveAllSettings",{obj:this},this.saveSettings);		
			//TODO:create restartALL procedure
			$("body").bind("restartAll",{obj:this},this.start_New_Session);
			//global bind for clearing all tags on current image
			$("body").bind("clearPage",{obj:this},this.clear_Image_Tags);
			//global bind for clearing all tags on every image
			$("body").bind("clearSession",{obj:this},this.clear_All_Tags);
			//global bind for when user selects a new tool from LogBar
			$("body").bind("toolSelected",{obj:this},this.addNewTool);


			//if json data present, set up urls
			if(this.json){
				//parse data
				var p=this.jsonReader.read(this.json);
				if(!p) window.location(".");
				$("body").bind("tagRulesSet",{obj:this},this.loadJSONImages);
				this.DOM.trigger("schemaLoaded",[p]);
			} else {
				this.DOM.trigger("openImport");
			}
		},
			//responds to custom event - toolSelected
			addNewTool:function(e,toolname){
				var obj=e.data.obj;
				//handle which layout we're in now
				var main=$(".az.main");
				if(main.hasClass("twocol")){
					main.removeClass("twocol").addClass("threecol");
				} else if(main.hasClass("threecol")){
					main.removeClass("threecol").addClass("fourcol");
				} else if(main.hasClass('fourcol')){
					//do nothing - reached maximum tools allowed
				}
				//whatever the name of the tool being passed, find 
				//lowercase-non-spaced version of that in the columns.json
				//file
				//Toolmakers need to include JSON-HTML in columns.json for their tool
				toolname=toolname.toLowerCase().replace(" ","");
				if(obj.columnslayout[toolname]){
					//select the first empty tool area and fill it with what's in JSON layout
					$(".az.tool:empty").attr("id",toolname+"_az").append(obj.columnslayout[toolname]);
				}
			},
			saveSettings:function(e){
				var obj=e.data.obj;
			},
			start_New_Session:function(e){
				var obj=e.data.obj;
				//restart the entire session
				//erases images, tags, shapes
				obj._Itag.restart();
				obj._log.restart();
				//if(obj.Scroller) obj.Scroller._resetContainer();
				//if(obj.SideBar) obj.SideBar._resetAllTags();
				//open up import dialog 
				obj.DOM.trigger("openImport");
			},
			//clear only the shapes and tags drawn on the current image
			clear_Image_Tags:function(e){
				var obj=e.data.obj;
				obj.SideBar.reset_Curr_Manifest();
				obj.raphael._resetCurrImage();
			},
			clear_All_Tags:function(e){
				var obj=e.data.obj;
				obj.SideBar._resetAllTags();
				obj.raphael._eraseAllShapes();
			}
	});
	
	TILE.TILE_ENGINE=TILE_ENGINE;
	
	
	//TILE TOOLBARS
	
	//TILETopToolBar
	//handles all commands for opening new images,
	//importing tags, saving tags, resetting tag sessions
	//UPDATE: re-formatted for new columns layout
	var TILETopToolBar=TopToolBar.extend({
		init:function(args){
			this.$super(args);
			this.savePrompt=new Save({loc:this.DOM.attr("id")});
			this.saveB=$("#save");
			this.saveB.click(function(e){
				$(this).trigger("saveAllSettings");
			});
			this.restartAllB=$("#restartall").click(function(e){
				$(this).trigger("restartAll");
			});
			
			// this.newImageB=$("#newimage");
			// 			this.newImageB.click(function(e){
			// 				$(this).trigger("openNewImage");
			// 				$(this).trigger("closeDownVD",[true]);
			// 			});
			// 
			// 
			// 			this.importB=$("#import");
			// 			this.importB.click(function(e){
			// 				$(this).trigger("openLoadTags");
			// 			});
			// 			//Saving Progress
			// 			this.savePrompt=new Save({loc:this.DOM.attr("id")});
			// 			this.saveB=$("#save");
			// 			this.saveB.click(function(e){
			// 				$(this).trigger("saveAllSettings");
			// 			});
			$("body").bind("dataReadyToSave",{obj:this},this.saveSettings);
			//this.moreSelect=$("#moreselect");
		//	this.setUpMore();
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
			this.DOM=$("#az_log > .az.inner");
			this.toolbar=$("#az_log > .az.inner > toolbar");
			
			this.tagSelect=$("#az_tagchoices");
			this.toolSelect=$("#aztools_select");
			this.logInsertPoint=$("#logbar_list");
			this.logitemhtml=args.logitemhtml;
			this.rules=null;
			this.setUpToolBar();
			//global listeners
			$("body").bind("shapeCommit",{obj:this},this.addShape);
			
			$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			//$("body").bind("loadNewTag",{obj:this},this.addTag);
		},
		setUpToolBar:function(){
			this.loadB=$("#azlogbar_load").click(function(e){
				e.preventDefault();
				$(this).trigger("openLoadTags");
			});
			this.saveB=$("#azlogbar_save").click(function(e){
				e.preventDefault();
				$(this).trigger("saveAllSettings");
			});
			
			this.setChoices();
		},
		setChoices:function(){
			var c=["Group","Tag"]; //TODO: make default that's changed by user?
			var self=this;
			//attach the addItem listener - listens for changes 
			//in select and adds objects based on type paramater
			this.DOM.bind("addItem",{obj:this},function(e,t){
				var obj=e.data.obj;
				//based on what select returns, make that object appear in log
				if(t!=null){
					switch(t){
						case 'group':
							obj.addGroup();
							break;
						case 'tag':
							obj.addTag();
							break;
					}
				}
			});
			
			$.each(c,function(i,o){
				var el=$("<option>"+o+"</option>").val(o).click(function(e){
					$(this).trigger("addItem",[$(this).val().toLowerCase()]);
				}).appendTo(self.tagSelect);
			});
			
			
			//set ToolChoices
			var d=["Auto Recognizer"];
		//engine handles when tool is selected - changes layout
			$.each(d,function(i,o){
				var el=$("<option>"+o+"</option>").val(o).click(function(e){
					$(this).trigger("toolSelected",[$(this).val().toLowerCase()]);
				}).appendTo(self.toolSelect);
			});
		},
		addShape:function(e,shape){
			var obj=e.data.obj;

			var l=new TileLogShape({
				loc:obj.logInsertPoint.attr("id"),
				html:obj.logitemhtml,
				shape:shape
			});
			
		},
		//handler for tags sent to the log
		addTag:function(){
			
			if(this.rules){
				var l=new TileTag({
					loc:this.logInsertPoint.attr("id"),
					tagRules:this.rules
				});
			}
		},
		addGroup:function(){
			
			if(this.rules){
				var l=new TileLogGroup({
					loc:this.logInsertPoint.attr("id")
				});
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
		restart:function(){
			this.clearLogItems();
			this.rules=null;
		},
		clearLogItems:function(){
			$(".logitem").remove();
		}
	});
	TILE.TileLogBar=TileLogBar;
	
	var TileLogShape=LogItem.extend({
		init:function(args){
			this.$super(args);
			var self=this;
			//UID is directly related to the Log Item's SHAPE UID
			this.uid=args.shape.id;
			
			$("div.logitem").each(function(a){
				if(!$(this).attr("id")){
					self.DOM=$(this);
					self.DOM.attr("id","logitem_"+$(this).parent().attr("id")+a);
					$.data(self.DOM,"uid",self.uid);
				}
			});
			debug('shapelog: '+this.DOM.attr("id"));
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
	
	var TileLogGroup=LogItem.extend({
		init:function(args){
			this.$super(args);
			var self=this;
			$("div.logitem").each(function(d){
				if($(this).attr("id")==""){
					self.DOM=$(this);
					$(this).attr("id","loggroupuid_"+d);
				}
			});
			//input for making group name
			this.groupNameInput=null;
			//display for group name
			this.groupNameEl=null;
		},
		toggleNameEdit:function(e){
			
		},
		setOpenState:function(){
			
		},
		setClosedState:function(){
			
		},
		addItem:function(e,o){
			//o refers to the item 
			var obj=e.data.obj;
			//copy all of the tag HTML into ul area
			
			
		}
	});
	/**
	TranscriptTag
	**/
	var TileTranscriptTag=Tag.extend({
		init:function(args){
			this.$super(args);
			
		},
		editTranscript:function(){
			//open up text area to edit - limit chars
		}
	});
	
	
	
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
			//$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);

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
					//$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
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

				// if(this.mainRegion){
				// 				this.mainRegion.listenOff();
				// 			} else {
				// 				//$("body").unbind("shapeCommit",this.ingestCoordData);
				// 			}
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
	TILE.TileLogShape=TileLogShape;
	TILE.TileNameValue=TileNameValue;
	TILE.NVItem=NVItem;
	TILE.NVOptionsItem=NVOptionsItem;
	TILE.TileTag=TileTag;
	TILE.TileLogGroup=TileLogGroup;
	
})(jQuery);