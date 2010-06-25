///TILE LOGBAR
//TODO: make proper documentation
//TILE_ENGINE: {Object} main engine for running the LogBar and Layout of TILE interface

//Global Constants that other plugins can use 
var URL_LIST=[];

(function($){
	var TILE=this;
	/**Main Engine **/
	//loads in html layout from columns.json, parses JSON and sends to all 
	// other objects 
	// 
	// Creates:
	// 	TileLogBar - _log
	// 	ImageTagger - _Itag
	// Functions
	// 	getBase - checks TILECONSTANTS.json for base http data
	// 	setUp - makes TileLogBar, ImageTagger, sets global binds
	// 	addNewTool - sets a new tool - users must define tool in .js code and proper JSON format
	// saveSettings - starts prompt to save all data in session
	// 	start_New_Session - 
	// 	clear_Image_Tags - clears the log bar of all tags for a particular image
	// 	clear_All_Tags - clears the LogBar completely
		
	var TILE_ENGINE=Monomyth.Class.extend({
		init:function(args){
			//get HTML from PHP script and attach to passed container
			this.loc=(args.attach)?args.attach:$("body");
			var self=this;
			self.toolSet=args.toolSet;
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
			this._log=new TileLogBar({html:this.columnslayout});
			var self=this;
			
			$("body").bind("tagRulesSet",{obj:this},this.TRSetHandle);
			
			//get dialog JSON data
			$.ajax({
				url:"lib/JSONHTML/dialogs.json",
				dataType:"json",
				success:function(x){
					
					self.dialogJSON=x;
					self.addDialogBoxes();
				}
			});
			//important variables
			//finishes the rest of init
			this.toolbarArea=$("#header");
	

			//JSON Reader
			this.jsonReader=new jsonReader({});

			//start ImageTagger

			this._Itag=new _Itag({loc:"azcontentarea",base:this._base,html:d.imagetagger,imageListHTML: d.imageList});
			
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
		},
		TRSetHandle:function(e,c){
			var obj=e.data.obj;
			$("body").unbind("tagRulesSet",obj.TRSetHandle);
			//c is the schema data
			obj._log.setChoices(c);
		},
		addDialogBoxes:function(){
			//load dialog boxes
			this.importDialog=new ImportDialog({
				loc:$("body"),
				html:this.dialogJSON.dialogimport
			});
			//if json data present, set up urls
			if(this.json){
				//parse data
				var p=this.jsonReader.read(this.json);
				if(!p) window.location(".");
				//$("body").bind("tagRulesSet",{obj:this},this.loadJSONImages);
				this.DOM.trigger("schemaLoaded",[p]);
			} else {
				this.DOM.trigger("openImport");
			}
		},
		//responds to custom event - toolSelected
		addNewTool:function(e,toolname){
			var obj=e.data.obj;
			//replace the main log area with whatever 
			$(".az.main > #az_log").children().hide();
			$("#az_log").removeClass("log").addClass("tool");
			
			// if(main.hasClass("twocol")){
			// 				main.removeClass("twocol").addClass("threecol");
			// 			} else if(main.hasClass("threecol")){
			// 				main.removeClass("threecol").addClass("fourcol");
			// 			} else if(main.hasClass('fourcol')){
			// 				//do nothing - reached maximum tools allowed
			// 			}
			//whatever the name of the tool being passed, find 
			//lowercase-non-spaced version of that in the columns.json
			//file
			//Toolmakers need to include JSON-HTML in columns.json for their tool
			toolname=toolname.toLowerCase().replace(" ","");
			// //NEW: accessing autorecognizer tools
			// 		//AUTORECOGNIZER
			// 		$("body").bind("ARStart",{obj:obj},function(e){
			// 			//stop the imagetagger from listening
			// 			$("body").trigger("closeDownVD",[true]);
			// 		});
			if(obj.toolSet){
				for(tool in obj.toolSet){
					if(obj.toolSet[tool].name==toolname){
						if(!obj.toolSet[tool].constructed){
							obj.toolSet[tool].start("az_log"); //give place where it opens into
							obj.toolSet[tool].constructed=true;
							$("body").bind(obj.toolSet[tool].done,{obj:obj,tool:obj.toolSet[tool]},obj._toolDoneHandle);
						} else {
							//tool already constructed, restart tool
							obj.toolSet[tool].restart();
						}
						
						break;
					}
				}
			}
			
			// if(obj.columnslayout[toolname]){
			// 				//select the first empty tool area and fill it with what's in JSON layout
			// 				$("div.az.tool:empty").attr("id",toolname+"_az").append(obj.columnslayout[toolname]);
			// 			}
		},
		_toolDoneHandle:function(e){
			var self=e.data.obj;
			//open the logbar back up
			self._log.DOM.show();
			$("#az_log").removeClass("tool").addClass("log");
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
		//	obj.SideBar.reset_Curr_Manifest();
		//	obj.raphael._resetCurrImage();
		},
		clear_All_Tags:function(e){
			var obj=e.data.obj;
		//	obj.SideBar._resetAllTags();
		//	obj.raphael._eraseAllShapes();
		}
	});
	
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
	//ImportDialog
	/**
	Called by openImport CustomEvent
	
	
	**/
	var ImportDialog=Dialog.extend({
		init:function(args){
			this.$super(args);
			this.index=($("#dialog").length+this.loc.width());
			// this.loc.append($.ajax({
			// 			async:false,
			// 			dataType:'html',
			// 			url:'lib/Dialog/dialogImport.html'
			// 		}).responseText);

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
			// this.loc.append($.ajax({
			// 				async:false,
			// 				url:'lib/Dialog/DialogLoadTags.html',
			// 				dataType:'html'
			// 			}).responseText);
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

			// this.loc.append($.ajax({
			// 				async:false,
			// 				url:'lib/Dialog/dialogNewImg.html',
			// 				dataType:'html'
			// 			}).responseText);
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
	Log Toolbar:
	
		Toolbar that contains objects that reflect a log of what is going on in main
		tagging/workspace area. 
		
		//receives html in form of text
	**/
	var Log=Monomyth.Class.extend({
		init:function(args){
			if(!args.html) throw "no JSON data passed to Log{}"; 
			this.html=args.html;
			this.DOM=$("#az_log");
			$(this.html.log).appendTo(this.DOM);
			
		}
	});
	
	
	/**
	TILE LogBar
	
	Inherits from Log in base.js
	**/
	var TileLogBar=Log.extend({
		init:function(args){
			this.$super(args);
			this.DOM=$("#az_log > .az.inner");
			this.toolbar=$("#az_log > .az.inner > .toolbar");
			
			this.toolSelect=$("#az_log > .az.inner > .toolbar > #ddown > div.menuitem.ddown:nth-child(1) > select");
			
			this.tagSelect=$("#az_log > .az.inner > .toolbar > #ddown > div.menuitem.ddown:nth-child(2) > select");
			var hadjust=(this.toolbar.height()+((this.toolbar.css("border-width")+this.toolbar.css("padding"))*2)+2+127);
			this.logInsertPoint=$("#az_log > .az.inner > #logbar_list").height((this.DOM.height()-hadjust)).css("overflow","auto");
			this.logActiveArea=$("#az_log > .az.inner > #logbar_activearea");
			//group select element - user selects a group to add current active item into
			this.groupSelect=$("#"+this.logActiveArea.attr("id")+" > select");
			var self=this;
			this.doneB=$("#"+this.logActiveArea.attr("id")+" > .activearea_head > div#logbar_done").click(function(e){
				self._createListItem();
			});
			this.deleteB=$("#"+this.logActiveArea.attr("id")+" > .activearea_head > div#logbar_delete").click(function(e){
				 self._deleteListItem();
			});
			
			
			//this.logitemhtml=args.html.logitem;
			this.rules=null;
			this.GroupId=null;
			this.setUpToolBar();
			
			
			//manifest array for all items in log_list
			this.manifest={tags:[],groups:[]};
			this.tagCount=0;
			this.maxTags=6;
			this.showTags=[];
			
			//local listeners
			this.DOM.bind("itemDropped",{obj:this},this.itemDroppedHandle);
			//global listeners
			$("body").bind("shapeCommit",{obj:this},function(e,shape){
				e.data.obj.addShape(shape,null);
			});
			$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
			$("body").bind("setGroup",{obj:this},this.setGroupHandle);
			$("body").bind("logGroupClosed",{obj:this},this.logGroupClosedHandle);
			$("body").bind("logGroupOpen",{obj:this},this.logGroupOpenHandle);
			$("body").bind("tagSelected",{obj:this},this.tagSelectedHandle);
			$("body").bind("saveAllSettings",{obj:this},this._saveP);
		},
		setUpToolBar:function(){
			var self=this;
			//define layout variables for drop down
			// self.heights=[self.toolSelect.height()+75,self.tagSelect.height()+68];
			// 			self.startingHeight=21;
			// 			self.speed=300;
			// 			//make visible
			// 			var tx=(self.toolSelect.position());
			// 			self.toolSelect.css({visibility:"visible","z-index":"1001"}).height(self.startingHeight);
			// 			self.tagSelect.css({visibility:"visible","z-index":"1001"}).height(self.startingHeight);
			// 			// $("#"+self.toolSelect.attr('id')+" > a").css({"z-index":"1000","position":"absolute"});
			// 			//set up the stylized drop  down menu
			// 			this.toolSelect.mouseover(function () {
			// 				$(this).stop().animate({height:self.heights[0]},{queue:false, duration:self.speed});
			// 			});
			// 			this.toolSelect.mouseout(function () {
			// 				$(this).stop().animate({height:self.startingHeight+'px'}, {queue:false, duration:self.speed});
			// 			});
			// 			
			// 			//set up the stylized drop down menu
			// 			self.tagSelect.mouseover(function () {
			// 				$(this).stop().animate({height:self.heights[1]},{queue:false, duration:self.speed});
			// 			});
			// 			self.tagSelect.mouseout(function () {
			// 				$(this).stop().animate({height:self.startingHeight+'px'}, {queue:false, duration:self.speed});
			// 			});
			
			self.loadB=$("#azlogbar_load").click(function(e){
				e.preventDefault();
				$(this).trigger("openLoadTags");
			});
			self.saveB=$("#azlogbar_save").click(function(e){
				e.preventDefault();
				$(this).trigger("saveAllSettings");
			});
			
			self.logInsertPoint.sortable({
				items:'div.tag'
			});
			
			//set up group select item
			self.groupSelect.children().each(function(i,o){
				if(!$(o).attr('id')=='null'){
					$(o).click(function(e){
						//force-initiate the itemDropped call
						$(this).trigger("itemDropped",[$(this).parent().children("div.tag:visible").attr("id"),$(this).val()]);
					});
				}
			});
			
			//self.setChoices();
		},
		setChoices:function(d){
			var self=this;
			self.rules=d;
			var c=[];
			//var c=["Group","Transcript"];//TODO: make default that's changed by user?
			for(di in d.topLevelTags){
				var diu=d.topLevelTags[di];
				for(tag in d.tags){
					if(diu==d.tags[tag].uid){
						c.push({tname:d.tags[tag].name,tid:diu});
					}
				}
			}
			
			
			//attach the addItem listener - listens for changes 
			//in select and adds objects based on type paramater
			$("body").bind("addLogBarItem",{obj:self},self._addItemR);
			//bind a separate local listener to only listen to the menu items being clicked
			this.DOM.bind("addLogBarItem",{obj:this},function(e,t){
				var obj=e.data.obj;
				e.stopPropagation(); //kill this from getting to "body"
				//based on what select returns, make that object appear in log
				if(t!=null){
					switch(t.toLowerCase()){
						case 'group':
							obj.addGroup();
							break;
						case 'tag':
							obj.addTag();
							break;
						case 'transcript':
							obj.addTranscript();
							break;
						case 'shape':
							obj.addBlankShape();
							break;
						default:
							obj.addTag(t);
							break;
					}
				}
			});
			
			$.each(c,function(i,o){
					//var elwrap=$("<option id=\"\">"+o.tname+"</option>").val(o.tid).appendTo(self.tagSelect);
					// var el=null;
					if(o.tname){
						//el=$("<a href=\"\">"+o.tname+"</a>").val(o.tid).appendTo(elwrap);
						var el=$("<option>"+o.tname+"</option>").val(o.tid).appendTo(self.tagSelect);
						el.click(function(e){
							e.preventDefault();
							$(this).trigger("addLogBarItem",[$(this).val()]);
						});
					} else {
						var el=$("<option>"+o+"</option>").val(o).appendTo(self.tagSelect);
						el.click(function(e){
							e.preventDefault();
							$(this).trigger("addLogBarItem",[$(this).val().toLowerCase()]);
						});
					}
					
			});
			//set finalHeight (fH) as data in the tagSelect object
			//self.heights[1]=(self.tagSelect.children().length*30);

			//set ToolChoices
			var bd=["Auto Recognizer"];
		//engine handles when tool is selected - changes layout
			$.each(bd,function(i,o){
				var el=$("<option>"+o+"</option>").val(o).appendTo(self.toolSelect);
				
				el.click(function(e){
					e.preventDefault();
					
					$(this).trigger("toolSelected",[$(this).val().toLowerCase()]);
				});
			});
			//set finalHeight for the toolSelect
			//self.heights[0]=(self.toolSelect.children().length*35);
		},
		/**
		called by CustomEvent from LogBar
		**/
		setGroupHandle:function(e,guid){
			//group has been added to logbar
			var obj=e.data.obj;
			if(obj.GroupId&&obj.manifest.groups[obj.GroupId]){
				obj.manifest.groups[obj.GroupId].setCloseState();
			}
			obj.GroupId=guid;
			
		},
		itemDroppedHandle:function(e,id,gid){
			var obj=e.data.obj;
			//called when a group object adds an item
			if(!gid){
				if(obj.GroupId&&(obj.manifest.groups[obj.GroupId])){
					var s=null;
					var id=id.replace(/copy/,"");
					if(obj.manifest.tags[id]){
						s=obj.manifest.tags[id].o;
					//	obj.manifest.groups[obj.GroupId].o.pushItem(s);
					} else if(obj.manifest.groups[id]) {
						//it's a group in a group
						s=obj.manifest.groups[id].o;
						
					}
					if(s) obj.manifest.groups[obj.GroupId].o.pushItem(s);
				}
			} else {
				//find element
				var item=null;
				for(i in obj.manifest.tags){
					if(i==id){
						item=obj.manifest.tags[i];
						break;
					}
				}
				
				//gid is given-find group and add item to it
				for(g in obj.manifest.groups){
					if(g==gid){
						var s=obj.manifest.groups[g];
						if(!s.manifest[item.uid]) s.o.pushItem(item);
						break;
					}
				}
				
			}
		},
		logGroupClosedHandle:function(e,guid){
			var obj=e.data.obj;
			//change the GroupId
			obj.GroupId=null;
		},
		logGroupOpenHandle:function(e,guid){
			var obj=e.data.obj;
			obj.GroupId=guid;
			for(g in obj.manifest.groups){
				if(obj.manifest.groups[g].o.uid!=guid) obj.manifest.groups[g].o.setCloseState();
			}
			
		},
		tagSelectedHandle:function(e,tid){
			var self=e.data.obj;alert(self.manifest.tags[tid].n);
			if(self.manifest.tags[tid]){
				var t=self.manifest.tags[tid];
				t.o._open();
			}
		},
		/**
		Set as sortable list of objects
		**/
		_draggableDroppable:function(){
			$("#logbar_list").sortable({
				items:"div", //restrict to only tags, transcripts, and shapes
				handle:'span.moveme'
			});
		},
		_addItem:function(obj){
			var self=this;
			if(self.curItem) self._deleteListItem();
			if(obj.n in self.showTags){
				self.logActiveArea.children("div.tag").remove();
				switch(obj.type){
					case 'shape':
					
						obj.o=new TileLogShape({
							uid:obj.uid,
							html:self.html.tagshape,
							loc:self.logActiveArea.attr("id"),
							copyloc:self.logInsertPoint.attr("id"),
							shape:obj.shape,
							etc:(obj.etc||null)
						});
						
						obj.act=obj.o.DOM;
						self.manifest.tags[obj.uid]=obj;
						self.curItem=obj;
						break;
					case 'transcript':
					
						obj.o=new TileTranscriptTag({
							uid:obj.uid,
							html:self.html.tagtranscript,
							loc:self.logActiveArea.attr("id"),
							copyloc:self.logInsertPoint.attr("id"),
							etc:(obj.etc||null)
						});
						obj.act=obj.o.DOM;
						self.manifest.tags[obj.uid]=obj;
						self.curItem=obj;
						break;
					case 'schema':
						obj.o=new TileLogTag({
							uid:obj.uid,
							html:self.html,
							loc:self.logActiveArea.attr('id'),
							copyloc:self.logInsertPoint.attr('id'),
						 	tagRules:self.rules,
							tagId:obj.tagId
						});
						// obj.cur=new TagCopy({
						// 							html:"<div id=\"\" class=\"tag transcript\">"+obj.o.DOM.html()+"</div>",
						// 							loc:self.logInsertPoint.attr("id"),
						// 							uid:obj.uid,
						// 							name:obj.o.name
						// 						});
						obj.act=obj.o.DOM;
						self.manifest.tags[obj.uid]=obj;
						self.curItem=obj;
						break;
					
				}
			}
		},
		_createListItem:function(){
			var self=this;
			if(self.curItem&&(!self.curItem.o._copy)){
				switch(self.curItem.type){
					case 'shape':
						self.curItem.o._copy=new TagCopy({
							html:"<div id=\"\" class=\"tag shape\">"+self.curItem.o.DOM.html()+"</div>",
							shape:self.curItem.shape,
							uid:self.curItem.uid,
							loc:self.logInsertPoint.attr('id'),
							name:self.curItem.o.name
						});
						break;
					case 'transcript':
						self.curItem.o._copy=new TagCopy({
							html:"<div id=\"\" class=\"tag transcript\">"+self.curItem.o.DOM.html()+"</div>",
							uid:self.curItem.uid,
							loc:self.logInsertPoint.attr('id'),
							name:self.curItem.o.name
						});
						break;
					case 'schema':
						self.curItem.o._copy=new TagCopy({
							html:"<div id=\"\" class=\"tag\">"+self.curItem.o.DOM.html()+"</div>",
							uid:self.curItem.uid,
							loc:self.logInsertPoint.attr('id'),
							name:self.curItem.o.name						
						});
						
						break;
				}
				self.curItem=null;
			}
			
			
		},
		//user either deleted or canceled making this tag
		_deleteListItem:function(obj){
			var self=this;
			
			if(!obj) var obj=self.manifest.tags[$("#logbar_activearea > div.tag").attr('id')];
			if(obj){
				self.tagCount--;
				if(obj.type=='shape') $("body").trigger("VD_REMOVESHAPE",[obj.o.shape.id]);
				obj.o.DOM.remove();
				
				if(obj.o._copy) obj.o._copy.DOM.remove();
				//remove from manifest
				self.manifest.tags[obj.uid]=null;
			}
		},
		/**
			Called from body tag using addLogBarItem Custom Event
		
			Loads a tag using JSON
			Items: array of items to add
			Group: (optional) add a group and an optional string to name that group - all items 
			are added to this group
		**/
		_addItemR:function(e,json){
			var self=e.data.obj;
			//get json data and parse into element
			if(json.items){
				//see if all of these belong to a group
				if(json.group){
					self.addGroup(json.group);
				}
				//put all the added items in to one array, then 
				//recursively add items to prevent crashing
				var _keepers=[]; 
				for(j in json.items){
					
					var item=json.items[j];
					//determine type - if any
					//defaults to item name
					//var itemtype=item.name;
				
					if(item.type){
						switch(item.type){
							case "shape":
								//create a shape tag
								$.extend(item,{
									id:item.uid
								});
								//add all possible components to shape
								_keepers.push({
									cur:null,
									o:null,
									type:'shape',
									shape:item,
									group:'g'+j,
									n:self.tagCount
								});
								self.tagCount++;
								break;
							case "transcript":
								//create a transcript tag
								_keepers.push({
									cur:null,
									o:null,
									type:'shape',
									shape:item,
									group:item.group,
									n:self.tagCount
								});
								self.tagCount++;
								//self.addTranscript(item);
								break;
							default:
								break;
						}
					}
				}
				$.merge(self.manifest.tags,_keepers);
				//see if the logList is too full
				if(_keepers.length>self.maxTags){
					//get rid of current tags on list
					self.logInsertPoint.empty();
					//set up showTags
					self.showTags=[];
					for(i=(_keepers.length-(self.maxTags));i<_keepers.length;i++){
						self.showTags.push(_keepers[i].n);
						self._addItem(_keepers[i]);
					}
					
					
					// //add only the last n tags to the list
					// 					self.tagCount=(self.manifest.tags.length-1);
					// 					self.showTags=[];
					// 					for(i=0;i<self.maxTags;i++){
					// 						self.showTags.push(self.manifest.tags[(self.manifest.tags.length-1)-i].n);
					// 					}
					// 					var a=self.manifest.tags.slice((self.tagCount-self.maxTags));
				
					//self._addRecursive(_keepers,0);
			
				 } else {
					self._addRecursive(_keepers,0);
				}
				
			}
			
		},
		/**
		For adding large amounts of tags all at once (e.g. A plugin has dumped a JSON object of tags
		to be input)
		**/
		_addRecursive:function(items,n){
			var self=this;
			if(!items[n]) return;
			// if(self.logInsertPoint.children("div").length>5){
			// 				self.logInsertPoint.empty();
			// 			}
			var obj=items[n];
			switch(obj.type){
				case 'group':
					self.addGroup(obj.id);
					break;
				case 'shape':
					self._overFlowHandle(obj);
					//self.addShape(obj.shape,{group:obj.group});
					break;
				case 'transcript':
					self._overFlowHandle(obj);
					break;
			}
					// 	
					// if(cur.group&&(!self.manifest.groups[cur.group])){
					// 	self.manifest.groups[cur.group]=new TileLogGroup({
					// 		loc:self.logInsertPoint.attr("id"),
					// 		html:self.html.taggroup,
					// 		name:"Group"+cur.group,
					// 		uid:cur.group
					// 	});
					// }
			// if(cur.shape) self.addShape({data:{obj:self}},cur.shape,{list:true,group:cur.group});
			// 			if(cur.transcript) self.addTranscript(cur.transcript,{list:true,group:cur.group});
			n++;
			
			self._addRecursive(items,n);
		},
		_overFlowHandle:function(obj){
			var self=this;
			var next=0;
			var ok=0;
			
			if((self.logInsertPoint.children("div.tag").length+self.logInsertPoint.children("div.group").length)==self.maxTags){
				self.logInsertPoint.empty();
				self.showTags=[];
				for(s in self.manifest.tags){
					if(ok==0){
						next++;
						if(next==(self.tagCount-1)){
							ok=1;
						}
					}else{
						self.showTags.push(self.manifest.tags[s].n);
						self._addItem(self.manifest.tags[s]);
						// if(!self.manifest.tags[s].o){
						// 						self._addItem(self.manifest.tags[s]);
						// 					} else {
						// 						self.manifest.tags[s].cur.appendTo(self.logInsertPoint);
						// 					}
						ok++;
						if(ok==self.maxTags) break;
						//next.push(self.manifest.tags[s].cur._copy.DOM);
					}
				}
			} else {
				self.showTags.push(obj.n);
				self._addItem(obj);
			}
		},
		addTag:function(id){
			var self=this;
			//id refers to a string representing the id in the tag rules
			// var T=null;
			//find matching uid in rules
			for(i in self.rules.tags){
				if(self.rules.tags[i].uid==id){
					T=self.rules.tags[i];
					break;
				}
			}
			// var logtag=new TileLogTag({
			// 			loc:self.logActiveArea.attr('id'),
			// 			copyloc:self.logInsertPoint.attr('id'),
			// 			tagRules:self.rules,
			// 			tagId:id,
			// 			html:self.html
			// 		});
			var _d=new Date();
			var uid="t"+_d.getTime("milliseconds");
			//create empty object - created later in _addItem
			var l={
				o:null,
				uid:uid,
				act:null,
				cur:null,
				type:'schema',
				tagId:id,
				n:self.tagCount
			};
			
			// self.manifest.tags[l.uid]={o:logtag,act:logtag.DOM,cur:logtag._copy.DOM,type:'schema',n:self.tagCount};
			self.manifest.tags[l.uid]=l;
			self.tagCount++;
			//add item or correct loglist space
			self._overFlowHandle(l);
			
		},
		//for when a user is prompted to create a shape - shape is created and user
		//has to adjust its position
		addBlankShape:function(){
			var self=this;
			var _d=new Date();
			//create blank shape object to be passed
			var s={
				con:"rect",
				uid:_d.getTime("milliseconds"),
				x:0,
				y:0,
				width:0.1,
				height:0.1,
				args:[0,0,0.1,0.1],
				uri:$("#srcImageForCanvas").attr("src")
				
			};
			//send shape to drawer
			$("body").trigger("VD_ADDSHAPE",[[s],{}]);
		},
		addShape:function(shape,args){
			var obj=this;
			if(args){
				var gid=args.group;
				
			}
			var l=null;
			//must be a new shape
			if(!obj.manifest.tags["s"+shape.id]){
				// var l=new TileLogShape({
				// 				loc:obj.logActiveArea.attr("id"),
				// 				copyloc:obj.logInsertPoint.attr('id'),
				// 				html:obj.html.tagshape,
				// 				shape:shape
				// 			});
				l={
					uid:"s"+shape.id,cur:null,o:null,act:null,type:'shape',shape:shape,n:obj.tagCount
				};
				
				//add to master manifest
				obj.manifest.tags[shape.id]=l;
				obj.tagCount++;
				if(gid){
					if(!obj.manifest.groups[gid]){
						
						setTimeout(function(obj,l,gid){
							var loc=(obj.GroupId)?(obj.manifest.tags[obj.GroupId].o.dropInsertArea.attr('id')):obj.logInsertPoint.attr('id');
							var b=new TileLogGroup({
								loc:loc,
								html:obj.html.taggroup,
								name:"Group"+gid
							});
							obj.manifest.tags[gid]={o:b,cur:b.DOM,type:'group'};
							if(!obj.GroupId) obj.GroupId=gid;
							b.pushItem(l);
						},1,obj,l,gid);
					
					} else {
						obj.manifest.groups[gid].o.pushItem(l);
					}
				} else if(obj.GroupId&&obj.manifest.groups[obj.GroupId]){
					//obj.manifest.groups[obj.GroupId].shapes.push(l.uid);
					obj.manifest.groups[obj.GroupId].o.pushItem(l); //copy data and events as well
				}
			} else if(gid){
				//already in logbar, just add it to group
				var l=obj.manifest.tags[shape.id].o;
				
				if(!obj.manifest.groups[gid]){
					setTimeout(function(obj,l,gid){
						var b=new TileLogGroup({
							loc:obj.manifest.groups[obj.GroupId].o.dropInsertArea,
							html:obj.html.taggroup,
							name:"Group"+gid
						});
						
						obj.manifest.tags[gid]={o:b,type:'group',cur:b.DOM,tags:[],shapes:[]};
						if(obj.manifest.groups[obj.GroupId]) {
							setTimeout(function(obj,b){
								obj.manifest.groups[obj.GroupId].o.pushItem(b);
							},1,obj,b);
						}
						b.pushItem(l);
					},1,obj,l,gid);
				
				} else {
					setTimeout(function(obj,l,gid){
						obj.manifest.tags[gid].o.pushItem(l);
					},1,obj,l,gid);
				
				}
			}
			//add item or correct loglist space
			obj._overFlowHandle(l);
		},
		//can add an optional name parameter - Group is given this name
		addGroup:function(args){
			if(args){
				var groupname=(args.name||null);
				var guid=(args.uid||null);
			}
			var l=null;
			if(this.rules){
				//close all other groups
				for(g in this.manifest.groups){
					this.manifest.groups[g].o.setCloseState();
				}
				if(groupname) groupname+=$(".groupname > input:contains("+groupname+")").length;
				
				l=new TileLogGroup({
					loc:this.logInsertPoint.attr("id"),
					html:this.html.taggroup,
					name:(groupname||null),
					uid:(guid||null)
				});
				this.GroupId=l.uid;
				//make the JSON data associated with group
				this.manifest.tags[l.uid]={o:l,cur:l.DOM,type:'group',n:self.tagCount};
				
				//add to list of groups in groupselect
				this.groupSelect.append($("<option>"+l.name+"</option>").val(l.uid).click(function(e){
					var p=$(this).closest("div");
					
					//alert($("#"+$(p).attr('id')+" > div:nth-child(2)").attr("id"));
					$(this).trigger("itemDropped",[$(p).children("div:visible").attr("id").substring(1),$(this).val()]);
				}));
			}
			//add item or correct loglist space
			//self._overFlowHandle(l);
		},
		addTranscript:function(item,gid){
			var self=this;
			if(this.rules){
				var _d=new Date();
				var uid="t"+_d.getTime("milliseconds");
				var l={
					o:null,
					act:null,
					cur:null,
					type:'transcript',
					n:self.tagCount,
					uid:uid
				};
				//add to master manifest
				this.manifest.tags[l.uid]=l;
				self.tagCount++;
				// if(gid){
				// 					if(!self.manifest.groups[gid]){
				// 						var b=new TileLogGroup({
				// 							loc:self.manifest.groups[obj.groupId].o.dropInsertArea,
				// 							html:self.html.taggroup,
				// 							name:"Group"+gid,
				// 							n:self.tagCount
				// 						});
				// 						self.tagCount++;
				// 						self.manifest.tags[gid]={o:b,cur:b.DOM,tags:[],shapes:[]};
				// 					} else {
				// 						self.manifest.tags[obj.groupId].o.pushItem(l);
				// 					}
				// 				} else
				// 				if(this.GroupId&&this.manifest.groups[this.GroupId]){
				// 					//this.manifest.tags[this.GroupId].tags.push(l.uid);
				// 					this.manifest.tags[this.GroupId].o.pushItem(l); //copy data and events as well
				// 				}
				//add item or correct loglist space
				self._overFlowHandle(l);
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
			$("body").unbind("tagRulesSet",obj.initTagRules);
			
		},
		restart:function(){
			this.clearLogItems();
			this.rules=null;
		},
		_saveP:function(e){
			e.preventDefault();
			var self=e.data.obj;
			if(!self._saveObj) self._saveObj=new Save({loc:"azglobalmenu"});
			//get all the logbar items' data
			var jsondata=self.bundleData();
			//var saveDiv=$("<iframe id=\"__saveP\" src=\"PHP/forceJSON.php\" style=\"display:none;\"></iframe>").appendTo("body");
			//output as attachment
			self._saveObj.userPrompt(jsondata);
		},
		//wrap all log items (shapes, groups, transcripts, tags) into a JSON object
		bundleData:function(){
			var self=this;
			var j={"tags":[]};
			for(f in self.manifest.tags){
				var obj=self.manifest.tags[f];
				j.tags.push({
					"uid":obj.o.uid,
					"type":obj.type,
					"group":obj.group,
					"etc":obj.o.etc
				});
			}
			return j;
		},
		clearLogItems:function(){
			var self=this;
			$.each(self.manifest,function(i,x){
				$(x.cur).remove();
			});
			//$(".logitem").remove();
		}
	});
	TILE.TileLogBar=TileLogBar;
	
	/**
	Log Item
	
		Object that handles one instance of a logged event in the main workspace area
		
		Can be given an ID in order to 'copy' another object - can do this using
		uid: {string} parameter
	**/
	var LogItem=Monomyth.Class.extend({
		init:function(args){
			if(!args.html) throw "no JSON data passed to LogItem{}";
			this.loc=args.loc;
			this.html=args.html;
			if(this.loc) $(this.html).appendTo($("#"+this.loc));
			var d=new Date();
			this.uid=(args.uid)?args.uid:"logitem_"+d.getTime('milliseconds');
			//optional tag type attribute
			if(args.type){
				this._type=args.type;
			}
		}
	});
	
	TILE.LogItem=LogItem;
	
	var TagCopy=LogItem.extend({
		init:function(args){
			this.$super(args);
			//
			
			var self=this;
			self.uid=args.uid+"copy";
			$("div.tag").each(function(a){
				if(!$(this).attr("id")){
					self.DOM=$(this);
				}
			});
			self.DOM.attr("id",self.uid);
			//disable input elements or any clickable options
			//alert($("#"+this.DOM.attr('id')+" > div.tagname > div.tagmenu > #ddown").attr('id'));
			$("#"+this.DOM.attr('id')+" > div.tagname > div.tagmenu > div:not(.menuitem)").remove();
			$("#"+this.DOM.attr('id')+" > div.tagname > input").remove();
			self.copyName=	$("#"+this.DOM.attr('id')+" > div.tagname > p").text(args.name).show();
			//in case this is a transcript tag
			if($("#"+this.DOM.attr('id')+" > div.tagcontent > p")){
				self.transContent=$("#"+this.DOM.attr('id')+" > div.tagcontent > p").show();
				$("#"+this.DOM.attr('id')+" > div.tagcontent > form").hide();
			}
			//in case this is a shape tag
			self.shapeIcon=$("#"+this.DOM.attr('id')+" > div.tagname > div.tagmenu > div.menuitem > span.btnIconLarge.poly");
			//in case this is a schema-defined tag
			if($("#"+this.DOM.attr('id')+" > div.tagcontent > div.tagattr")){
				$("#"+this.DOM.attr('id')+" > div.tagcontent > div.tagattr > .nameValue > .button").hide();
			}
			
			//universal items
			self.collapseIcon=$("#"+self.DOM.attr('id')+" > div.tagname > a.open.btnIcon").show();
			self.contentArea=$("#"+self.DOM.attr('id')+" > div.tagcontent").show();
			
			var tid=self.uid.replace("copy","");
			//set up listener for when tag copy is selected
			self.DOM.click(function(e){
				//tell logbar to open up this in active window
				$(this).trigger("tagSelected",[tid]);
				//hide all others 
				$("#"+self.loc+" > div.tag > div.tagcontent").hide();
				$("#"+self.loc+" > div.tag > div.tagname > a").removeClass("open").addClass("closed");
				self.collapseIcon.removeClass("closed").addClass("open");
				self.contentArea.show();
			});
			
			//set collapse icon listeners
			self.collapseIcon.click(function(e){
				e.stopPropagation();
				if(self.contentArea.css("display")=="block"){
					self._collapse();
				} else {
					self._uncollapse();
				}
			});
			
			//global listener for when original tag is changed
			$("body").bind("tagUpdate",{obj:self},self.updateCopy);
			
		},
		_draggDrop:function(){
			//all copy tags are in list and therefore draggable and droppable
			var self=this;
			self.DOM.draggable({
				handle:$("#"+self.DOM.attr('id')+" > div.tagname > div.menuitem > span.btnIconLarge.hand"),
				axis:'y',
				revert:true
			});
		},
		_collapse:function(){
			var self=this;
			
			//$("#"+self.DOM.attr('id')+" > div.tagcontent").hide();
			self.collapseIcon.removeClass("open").addClass("closed");
			self.contentArea.hide();
			if(self.transContent){
				self.copyName.text(self.copyName.text()+" "+self.transContent.text().substring(0,100));
			}
			
		},
		_uncollapse:function(){
			var self=this;
			self.contentArea.show();
			self.collapseIcon.removeClass("closed").addClass("open");
		},
		updateCopy:function(e,updates){
			var self=e.data.obj;
			for(o in updates){
				if($("#"+self.DOM.attr('id')+" > "+o).length){
					$("#"+self.DOM.attr('id')+" > "+o).html(updates[o]);
				}
			}
			self.transContent=$("#"+self.DOM.attr('id')+" > div.tagcontent > p");
			//adjust and hide any editable elements
			$("#"+self.DOM.attr('id')+" > div.tagcontent > div.tagattr > .nameValue > .button").hide(); //schema-defined tags
			$("#"+self.DOM.attr('id')+" > div.tagcontent > div.tagattr > .nameValue > select").hide(); //schema-defined tags
		}
		
	});
	
	var TileLogShape=LogItem.extend({
		init:function(args){
			this.$super(args);
			
			//using optional type attr
			this._type='shape';
			
			//is this a clone?
			this.isClone=(args.isClone)||false;
			
			var self=this;
			self.groups=[];
			self.copyloc=args.copyloc;
			self.etc=(args.etc)?args.etc:[];
			
			self.DOM=$("#emptyshape").attr("id",self.uid).addClass("selected");
			// $("div.tag.shape").each(function(a){
			// 				if(!$(this).attr("id")){
			// 					self.DOM=$(this);
			// 					self.DOM.attr("id",self.uid);
			// 				
			// 				}
			// 			});
			//active state - just added, so set class to "selected"
			// $("#"+self.loc+" > .tag").removeClass("selected");
			// 			$("#"+self.loc+" > .tag").hide();
			// 			self.DOM.addClass("selected").show();
			
			//set up the collapse-icon behavior
			self.collapseIcon=$("#"+self.DOM.attr('id')+" > .tagname > a.btnIcon").hide();// click(function(e){
			// 				if($(this).hasClass("open")){
			// 					$(this).removeClass("open").addClass("closed");
			// 					$(this).parent().children("div:not(.tagname)").hide();
			// 				} else {
			// 					$(this).removeClass("closed").addClass("open");
			// 					$(this).parent().children("div:not(.tagname)").show();
			// 				}
			// 			});
			
			self.shapeIcon=$("#"+self.DOM.attr('id')+" > div.tagname > div.tagmenu > div.menuitem > span.btnIconLarge.poly");
			//configure the name for this log item
			self.name="Shape"+$("#"+self.loc+" > .tag.shape").length;
			
			self.shapeName=$("#"+self.DOM.attr('id')+" > div.tagname > p.shapename").attr("id",self.DOM.attr('id')+"_shapeName");
			self.shapeName.text(self.name);
			self.shapeName.css("display","inline-block");
			
			self.inputTitle=$("#"+self.DOM.attr('id')+" > div.tagname > input").attr("id",self.DOM.attr('id')+"_titleInput");
			self.inputTitle.val(self.name);
			self.inputTitle.blur(function(e){
				$(this).trigger("setSInput");
			});
			
			self.doneB=$("#"+self.DOM.attr('id')+" ");
			
			//group select
		//	self.groupSelect=$("#"+self.DOM.attr("id")+" > .tagname > .tagmenu > #ddown > .menuitem.ddown > select");
			
			self.shapeId=args.shape.id;
			self.shape=args.shape;
			self.shapeSpan=$("#"+self.DOM.attr("id")+" > div.tagcontent > ul");
			//fill in elements
			self.shapeName.hide();
			self.handleShapeIcon(); 
		//	self.setEdit();
			self.setShapeObj();
			
			self.clones=[];
			//$("<h4>"+this.name+"</h4>").insertBefore(this.shapeSpan);
			
			//set up listeners
			self.DOM.click(function(e){
				$(".tag.shape").removeClass("selected");
				$(this).addClass("selected");
				self.itemSelectedHandle();
			});
			self.shapeName.click(function(e){
				$(this).parent().children("input").val($(this).text());
				$(this).parent().children("input").show();
				$(this).hide();
			});
			
			//set up custom events 
			//global
			if(!self.isClone) $("body").bind(self.shape.shapeChangeCall,{obj:self},self.shapeChangeHandle);
			//local
			self.DOM.bind("setSInput",{obj:self},self.setName);
			//this._dragg();
			
			self.DOM.trigger("shapeDisplayChange",["a",self.shape.id]);
			
		},
		/**	
			Based on what the shape's type is, pick the right background style for
			the shape icon area 
		**/
		handleShapeIcon:function(){
			switch(this.shape.con){
				case 'rect':
					this.shapeIcon.removeClass('poly').addClass('rect');
					break;
				case 'ellipse':
					this.shapeIcon.removeClass('poly').addClass("elli");
					break;
			}
		},
		_dragg:function(){
			//make the entire DOM draggable - must be dropped into a Group
			if(!this.isClone){
				this.DOM.draggable({
					handle:'#'+this.DOM.attr('id')+' > menuitem > div.btnIconLarge.hand',
					revert:true,
					axis:'y'
				});
			}
		},
		//happens when user selects this shape
		itemSelectedHandle:function(){
			var self=this;
			$("body").trigger("shapeDisplayChange",['a',self.shapeId]);
		},
		setEdit:function(){
			if(this.editSelect){
				var self=this;
				
				
				
				// self.editSelectB.click(function(e){
				// 					$(this).hide();
				// 					$(this).parent().children("select").click();
				// 				});
				// 				self.editSelect.blur(function(e){
				// 					$(this).parent().children("span").show();
				// 				});
				
				//setup function to handle custom even itemMenuSelect call
				self.DOM.bind("itemMenuSelect",{obj:self},self.menuHandle);
				
				
				self.groupSelect.children().each(function(i,n){
					$(this).click(function(e){
						if(self.isClone&&(($(this).text().toLowerCase()=="edit")||($(this).text().toLowerCase()=="delete"))){
							$(this).trigger("itemMenuSelect",[$(this).text()]);
						} else {
							$(this).trigger("itemMenuSelect",[$(this).text()]);
						}
					});
				});
				if(self.isClone){
					self.inputTitle.hide();
					self.shapeName.text(self.inputTitle.val()).show();
					self.editSelect.css({"top":"0px"});
					//change items if a clone
					self.editSelect.children().each(function(i,o){
						if(($(o).text().toLowerCase()!="edit")||($(o).text().toLowerCase()!="delete")){
							$(o).remove();
						}
					});
				
				}
				//when user inputs a name and clicks away, input goes away
				self.inputTitle.blur(function(e){
					$(this).hide();
					$(this).parent().children("p").text($(this).val()).show();
				}).keypress(function(e){
					if(e.keyCode==13){
						$(this).hide();
						$(this).parent().children("p").text($(this).val()).show();
					}
				});
			}
		},
		//user clicked outside of input area
		setName:function(e){
			var obj=e.data.obj;
			obj.shapeName.show().text(obj.inputTitle.val());
			obj.inputTitle.hide();
			
		},
		menuHandle:function(e,m){
			//m refers to which option the user chose
			var obj=e.data.obj;
			switch(m.toLowerCase().replace(" ","")){
				case 'edit':
					obj.editShape();
					break;
				case 'delete':
					obj.delItem();
					break;
				case 'addtogroup':
					break;
			}
		},
		editShape:function(){
			var self=this;
			self.shapeName.hide();
			self.inputTitle.val(self.shapeName.text()).show();
			
		},
		setShapeObj:function(){
			var self=this;
			if(self.shapeSpan.children().length>0) self.shapeSpan.empty();
			$.map(["scale","width","height","x","y","cx","cy","rx","ry","points"],function(v){
				if(v in self.shape){
					self.shapeSpan.append($("<li><span class=\"attrbname\">"+v+"</span>: <span class=\"attrb\">"+self.shape[v]+"</span></li>"));
				}
			});
		},
		//called whenever shapeChangeCall from shape is triggered 
		//supposed to be during resize and dragging of shape
		shapeChangeHandle:function(e,_newShape){
			var obj=e.data.obj;
			//make _newShape the current shape - overwrite old
			obj.shape=_newShape;
			var self=obj;
			//update information in shapeSpan
			
			self.shapeSpan.empty();
			var liarray=[];
			$.map(["scale","width","height","x","y","cx","cy","rx","ry"],function(v){
				if(v in self.shape){
					var d=$("<li><span class=\"attrbname\">"+v+"</span>: <span class=\"attrb\">"+self.shape[v]+"</span></li>");
					liarray.push(d);
					self.shapeSpan.append(d);
					self.etc[v]=self.shape[v];
				}
			});
			
			//update all clones - if any
			for(o in self.clones){
				//if user hasn't edited the clone's shape - then it still
				//should listen to changes in this shape
				if(self.clones[o].isClone){
					var s=self.clones[o];
					s.shapeSpan.empty();
					for(li in liarray){
						s.shapeSpan.append(liarray[li].clone());
					}
				}
			}
			
		
			
			//update copies
			self.DOM.trigger("tagUpdate",[{".tagcontent > ul":$("#"+self.DOM.attr('id')+" > .tagcontent > ul").html()}]);
		},
		// Used to create a 'copy' of this object to be passed
		// 					to a group object
		clone:function(nloc){
			var self=this;
			if($.inArray(nloc,self.groups)>-1){
				return false;
			} 
			self.groups.push(nloc);
			
			//make new id
			var n=$("div[id*="+this.DOM.attr('id')+"copy]").length; //how many other divs are copied?
			var id=this.DOM.attr('id')+"copy"+n;
			
			var self=this;
			//add shape object
			var clone=new TileLogShape({
				uid:id,
				shape:self.shape,
				html:self.html,
				loc:nloc,
				isClone:true
			});
			//$("body").unbind(self.shape.shapeChangeCall);
			//$("body").bind(self.shape.shapeChangeCall,{obj:self},self.shapeChangeHandle);
			//add to clone array
			self.clones.push(clone);
			return clone;
		},
		delItem:function(){
			//notify drawer that this shape is deleted from logbar
			$(this.shape.cur.node).trigger("VD_REMOVESHAPE",[this.shape.id]);
			this.DOM.remove();
		},
		_open:function(){
			var self=this;
			
			$("#"+self.loc+" > .tag").hide().removeClass("selected");
			self.DOM.show().addClass("selected");
			$("body").trigger("shapeDisplayChange",["a",self.shapeId]);
		},
		_close:function(){
			var self=this;
			
		}
	});
	
	var TileLogGroup=LogItem.extend({
		init:function(args){
			this.$super(args);
			var self=this;
			//adjust name/uid if provided by user
			
			self.uid=(args.uid)?args.uid:self.uid;
			self.DOM=$("#emptygroup").attr("id",self.uid);
			
			// $("div.group").each(function(d){
			// 				if($(this).attr("id")==""){
			// 					self.DOM=$(this);
			// 					//self.DOM.removeClass("logitem").addClass("loggroup");
			// 					$(this).attr("id","g"+d);
			// 				}
			// 			});
			
			// if(args.uid) {
			// 				self.uid=args.uid;
			// 				self.DOM.attr("id",self.uid);
			// 			}
			self.name=(args.name||"Group"+$("#"+self.loc+" > .group").length);
			//toggle for display name
			self.nameToggle=$("#"+self.DOM.attr("id")+" > div.groupname > a").click(function(e){
				$(this).trigger("setClose");
			});
			//display for group name
			self.groupNameSpan=$("#"+self.DOM.attr("id")+" > div.groupname > span").text(self.name).hide().click(function(e){
				$(this).hide();
				$(this).parent().children("input").show();
			});
			// this.groupNameSpan.hide();
			//input for making group name
			self.groupNameInput=$("#"+self.DOM.attr("id")+" > div.groupname > input").blur(function(e){
				$(this).hide();
				$(this).parent().children("span").text($(this).val()).show();
			}).keydown(function(e){
				//also handle when user presses 'enter'
				if(e.keyCode==13) {
					$(this).hide();
					$(this).parent().children("span").text($(this).val()).show();
				}
			});
			
			self.collapseIcon=$("#"+self.DOM.attr("id")+" > .groupname > a").click(function(e){
				if($(this).closest("div.group").children(".grouplist:visible").length){
					$(this).closest("div.group").children(".grouplist:visible").hide();
				} else {
					$(this).closest("div.group").children(".grouplist:hidden").show();
					
				}
			});
			
			self.groupNameInput.val(self.groupNameSpan.text());
			self.dropInsertArea=$("#"+self.DOM.attr('id')+" > div.grouplist").attr('id',(self.uid+"gdrop"));
			
			self.manifest=[];
			
			self._dropp();
			//for storing data to be passed on in JSON format
			self.etc={"tags":[]};
			
			//local listeners
			//bind for toggle display edit
			//this.DOM.bind("toggleNameEdit",{obj:this},this.toggleNameEditHandle);
			self.DOM.bind("setClose",{obj:self},self.setClosedState);
			self.DOM.bind("setOpen",{obj:self},self.setOpenState);
			self.DOM.bind("removeItem",{obj:self},self.removeItem);
		},
		_dropp:function(){
			var self=this;
			//also draggable
			self.DOM.draggable({
				axis:'y',
				handle:$("#"+self.DOM.attr("id")+" > .groupname > .menuitem > .btnIconLarge.hand"),
				revert:true
			});
			
			self.DOM.droppable({
				addClasses:false,
				drop:function(e,o){
					e.preventDefault();
					$(this).droppable("disable");
					$(this).trigger("itemDropped",[$(o.draggable).attr('id')]);
					
				}
				//this.addItem
			});
			
			//change initial height so area is more droppable
			//figure out height difference
			$("#"+self.DOM.attr("id")+" > div.groupname").css({"overflow":"none"});
			self.DOM.css("overflow","none").height(120);
			self.dropInsertArea.height(self.DOM.height()-$("#"+self.DOM.attr("id")+" > div.groupname").height());
			
			//this.DOM.height(120).css("overflow","auto");
		},
		//handles event when user clicks on nameToggle 
		toggleNameEditHandle:function(e){
			var obj=e.data.obj;
			obj.groupNameSpan.hide();
			obj.groupNameInput.val(obj.groupNameSpan.text()).show();
		},
		setOpenState:function(e){
			var obj=e.data.obj;
			obj.DOM.height(120).css("overflow","auto");
			
			obj.groupNameInput.val(obj.groupNameSpan.text()).show();
			obj.groupNameSpan.hide(); 
			obj.nameToggle.removeClass("closed").addClass("open");
			//switch out the click command for nameToggle
			obj.nameToggle.unbind("click");
			obj.nameToggle.click(function(e){
				$(this).trigger("setClose");
			});
			//inform logbar which group is open
			obj.DOM.trigger("logGroupOpen",[obj.uid]);
			
			//change initial height so area is more droppable
			//figure out height difference
			$("#"+obj.DOM.attr("id")+" > div.groupname").css({"overflow":"none"});
			var th=0;
			$("#"+obj.DOM.attr("id")+" > div.tag").each(function(i,o){
				th+=$(o).height();
			});
			obj.DOM.css("overflow","none").height(((th==0)?120:th));
			obj.dropInsertArea.height(obj.DOM.height()-$("#"+obj.DOM.attr("id")+" > div.groupname").height());
		
		},
		setCloseState:function(){
			//does the same thing as setClosedState but isn't called by CustomEvent
			this.nameToggle.removeClass("open").addClass("closed");
			this.groupNameSpan.show();
			this.groupNameSpan.text(this.groupNameInput.val());
			this.groupNameInput.hide();
			this.DOM.height($("#"+this.DOM.attr('id')+" > div.groupname").height());
			this.nameToggle.unbind('click'); //switching out the trigger for nameToggle
			this.nameToggle.click(function(e){
				$(this).trigger("setOpen");
			});
		},
		setClosedState:function(e){
			var obj=e.data.obj;
			obj.nameToggle.removeClass("open").addClass("closed");
			obj.groupNameSpan.show();
			obj.groupNameSpan.text(obj.groupNameInput.val());
			obj.groupNameInput.hide();
			obj.DOM.height($("#"+obj.DOM.attr('id')+" > div.groupname").height());
			obj.nameToggle.click(function(e){
				$(this).trigger("setOpenState");
			});
			//change out the click event for nameToggle
			obj.nameToggle.unbind("click");
			obj.nameToggle.click(function(e){
				$(this).trigger("setOpen");
			});
			
			//event called by user and not logbar - notify logbar
			obj.DOM.trigger("logGroupClosed",[obj.uid]);
			
		},
		//called by parent Object - 
		//@item {Object} - whatever tag Object is given to attach to DOM
		pushItem:function(item){
			//push html onto the DOM - if not already present
			// if($("#"+this.DOM.attr('id')+" > #"+(item.DOM.attr('id')+"copy")).length){
			// 			return;
			// 		} else {
				
			var self=this;
			// var check=false;
			// 			var itemid=new RegExp(item.DOM.attr('id'),"g");
			// 			self.DOM.children("div").each(function(i,o){
			// 				var cid=$(o).attr('id');
			// 				if(itemid.test(cid)) check=true;
			// 				
			// 			});
			// 			if(check) return;
			
			//create ID for this cloned copy of the tag
		//	var copy=item.clone(self.dropInsertArea.attr('id'));
			
			if(self.manifest[item.uid]) {
				self.DOM.droppable("enable");
				return;
			}
			var copy=new TagCopy({
				loc:self.dropInsertArea.attr("id"),
				name:item.name,
				html:item.html,
				uid:item.uid
			});
			self.manifest[item.uid]=item;
			self.etc["tags"].push(item.uid);
			self.DOM.droppable("enable");
		},
		removeItem:function(e,id){
			var obj=e.data.obj;
			//remove an item from the group - doesn't effect original
			//TODO: make prompts to user
			
			$("#"+id).remove();
		}
	});
	/**
	TranscriptTag
	**/
	var TileTranscriptTag=LogItem.extend({
		init:function(args){
			this.$super(args);
			var self=this;
			self.copyloc=args.copyloc;
			
			self.groups=[];
			if(args.uid) self.uid=args.uid;
			self.isClone=(args.isClone)||false;
			$("div.tag.transcript").each(function(e){
				if($(this).attr("id")==""){
					self.DOM=$(this).attr("id","t"+self.uid);
				}
			});
			//active state - just added, so set class to "selected"
			$("#"+self.loc+" > .tag").removeClass("selected");
			$("#"+self.loc+" > .tag").hide();
			self.DOM.addClass("selected").show();
			
			//get elements
			self.collapseIcon=$("#"+self.DOM.attr('id')+" > div.tagname > a.btnIcon").hide();// click(function(e){
			// 				if($(this).hasClass("open")){
			// 					$(this).removeClass("open").addClass("closed");
			// 					
			// 					$(this).closest(".tag").children(".tagcontent").hide();
			// 				} else {
			// 					$(this).removeClass("closed").addClass("open");
			// 					$(this).closest(".tag").children(".tagcontent").show();
			// 				}
			// 			});
			this.name="Transcript"+$("#"+self.loc+" > .tag.transcript").length;
			
			
			this.transName=$("#"+this.DOM.attr('id')+" > div.tagname > p.transname").text(this.name).css("display","inline-block").hide();
			
			this.transNameInput=$("#"+this.DOM.attr('id')+" > div.tagname > input").val(this.transName.text()).show();
			this.transDisplay=$("#"+this.DOM.attr('id')+" > div.tagcontent > p.transcript").hide();
			this.menuSelectB=$("#"+this.DOM.attr('id')+" > div.tagname > div.tagmenu > #ddown > div.menuitem.ddown > span").show();
			this.menuSelect=$("#"+this.DOM.attr('id')+" > div.tagname > div.tagmenu > #ddown > div.menuitem.ddown > select").attr("id","ddown_"+this.uid);
			this.txtArea=$("#"+this.DOM.attr('id')+" > div.tagcontent > form > textarea");
			this.txtAreaDoneB=$("#"+this.DOM.attr('id')+" > div.tagcontent > form > input[value='Done']").click(function(e){
				e.preventDefault();
				$(this).trigger("doneTranscript");
			});
			this.txtAreaDeleteB=$("#"+this.DOM.attr('id')+" > div.tagcontent > form > input[value='Delete']").click(function(e){
				e.preventDefault();
				$(this).trigger("deleteTranscript");
			});
			//user can pass pre-set data into this object
			this.etc=(args.etc)?args.etc:{"text":this.txtArea.val()};
		
			//this.setEdit();
			///local listeners
			this.DOM.bind("deleteTranscript",{obj:this},this.eraseTranscript);
			this.DOM.bind("doneTranscript",{obj:this},this.doneTranscriptHandle);
			this.DOM.click(function(e){
				$(this).removeClass("inactive").addClass("active");
			});
			
		},
		_dragg:function(){
			this.DOM.draggable({
				handle:'#'+this.DOM.attr('id')+' > div.menuitem > div.btnIconLarge.hand',
				axis:'y',
				revert:true
			});
		},
		setEdit:function(){
			if(this.menuSelect){
				var self=this;
				//define layout variables for drop down
				// self.heights=[self.menuSelect.height()+8];
				// 				self.startingHeight=21;
				// 				self.speed=300;
				// 				//make visible
				// 				
				// 				self.menuSelect.css({visibility:"visible","z-index":"1000"}).height(self.startingHeight);
				// 				
				// 				//setting up the stylized drop down menu
				// 				self.menuSelect.mouseover(function () {
				// 					$(this).stop().animate({height:self.heights[0]},{queue:false, duration:self.speed});
				// 				});
				// 				self.menuSelect.mouseout(function () {
				// 					$(this).stop().animate({height:self.startingHeight+'px'}, {queue:false, duration:self.speed});
				// 				});
				//setup click function to show menuSelect
				self.menuSelectB.click(function(e){
					$(this).hide();
					self.menuSelect.click();
				});
				
				//setup function to handle custom even itemMenuSelect call
				this.DOM.bind("itemMenuSelect",{obj:this},this.menuHandle);
				
				this.menuSelect.children().each(function(i,n){
					$(this).click(function(e){
						if(i==0) $(this).select();
						$(this).trigger("itemMenuSelect",[$(this).text()]);
					});
				});
				
				//change items if a clone
				if(self.isClone){
					self.menuSelect.children().each(function(i,o){
						if(($(o).text().toLowerCase()!="edit")||($(o).text().toLowerCase()!="delete")){
							$(o).remove();
						}
					});
				}
			}
		},
		menuHandle:function(e,m){
			//m refers to which option the user chose
			var obj=e.data.obj;
			switch(m.toLowerCase().replace(" ","")){
				case 'edit':
					obj.editTranscript();
					break;
				case 'delete':
					obj.delItem();
					break;
				case 'addtogroup':
					break;
			}
		},
		editTranscript:function(){
			//open up text area to edit - limit chars
			//hide the text display area
			this.transDisplay.hide();
			this.txtArea.parent().show();
			this.txtArea.val(this.transDisplay.text());
			this.transName.hide();
			this.transNameInput.val(this.transName.text()).show();
		},
		eraseTranscript:function(e){
			//user clicked on the Delete button from the transcript area
			var obj=e.data.obj;
			
			obj.txtArea.val("");
		},
		doneTranscriptHandle:function(e){
			var obj=e.data.obj;
			//user clicked on the 'done' button in the transcript area
			//hide the transcript editing area and display text from txtarea
			obj.transDisplay.text(obj.txtArea.val()).show();
			obj.txtArea.parent().hide();
			
			obj.transName.text(obj.transNameInput.val()).show();
			obj.transNameInput.hide();
			//now change all of the copies of this transcript that may
			//exist inside groups
			obj.DOM.trigger("tagUpdate",[{".tagcontent":$("#"+obj.DOM.attr('id')+" > .tagcontent").html()}]);
			
			if(!obj._copy){
				obj._copy=new TagCopy({
					html:"<div id=\"\" class=\"tag transcript\">"+obj.DOM.html()+"</div>",
					loc:obj.copyloc,
					uid:obj.uid,
					name:obj.name
				});
			}
			
		},
		clone:function(nloc){
			var self=this;
			if($.inArray(nloc,self.groups)>-1){
				return;
			}
			self.groups.push(nloc);
			//make new id
			var n=$("div[id*="+this.DOM.attr('id')+"copy]").length; //how many other divs are copied?
			var id=this.DOM.attr('id')+"copy"+n;
			//add shape object
			var self=this;
			var clone=new TileTranscriptTag({
				uid:id,
				html:self.html,
				loc:nloc,
				isClone:true
			});
			return clone;
		},
		delItem:function(){
			this.DOM.remove();
		},
		_open:function(){
			var self=this;
			$("#"+self.loc+" > .tag").hide().removeClass("selected");
			self.DOM.addClass("selected").show();
			
		}
	});
	/**
		TileLogTag
		
		same functionality as the TileTag, but uses JSON html 
		and loads same functionality as other LogItems
		parentClass: LogItem (base.js)
	
	**/
	var TileLogTag=LogItem.extend({
		init:function(args){
			var self=this;
			//hack the args.html 
			self.nvhtml=args.html.nvitem;
			args.html=args.html.tilelogtag;
			
			this.$super(args);
			
			
			self.copyloc=args.copyloc;
			self.isClone=(args.isClone)||false;
			self.tagRules=args.tagRules;
			self.tagId=args.tagId;
			//has same HTML as the TranscripTag, only without form
		//	self.shapeId=(args.shapeId)?args.shapeId:null;
			self.json=(args.json)?args.json:null;
			self.values=(args.values)?args.values:null;
			if(args.uid) self.uid=args.uid;
			self.DOM=$("#emptytag").attr('id',"t"+self.uid).addClass("selected");
			//remove all other tags from this area
			$("#"+self.loc+" > div.tag:not(#"+self.DOM.attr('id')+")").hide();
			
			
			//tagname
			self.name=self.tagId+"_"+$(".tag").length;
			self.nameInput=$("#"+self.DOM.attr('id')+" > div.tagname > input").val(self.name);
			self.nameP=$("#"+self.DOM.attr('id')+" > div.tagname > p.tagnamep").text(self.name).hide();
			
			//collapse icon
			self.collapseIcon=$("#"+self.DOM.attr('id')+" > div.tagname > a").hide();
			
			//nameInput changes when blurred or user presses enter
			self.nameInput.val(self.nameP.text()).blur(function(e){
				$(this).hide();
				$(this).parent().children("p").text($(this).val()).show();
			}).keypress(function(e){
				if(e.keyCode==13){
					$(this).hide();
					$(this).parent().children("p").text($(this).val()).show();
				}
			});
			//tagmenu
			self.tagMenu=$("#"+self.DOM.attr("id")+" > div.tagmenu").attr('id',self.uid+'_tagmenu');
			self.setTagMenu();
			//tagcontent
			self.tagContent=$("#"+self.DOM.attr("id")+" > div.tagcontent");
			self.tagAttrInsertArea=$("#"+self.DOM.attr("id")+" > div.tagcontent > div.tagattr").attr('id',self.uid+"_tagattr");
			
			
			self.items=[];
			self.attrs=[];
			self._display=true;
			self._edit=true;
			// self.titleEl=$("#tagtitle_").attr("id","tagtitle_"+self.uid);
			// 			self.titleEl.bind("click",{obj:this},function(e){
			// 				var obj=e.data.obj;
			// 				$(this).trigger("toggleTagState",[obj.htmlindex,obj]);
			// 			});
			// 
			// 			self.titleElText=$("#tagtitle_"+self.htmlindex+" > span");
			// 			self.titleElText.hide();
			// 			self.titleElText.click(function(e){
			// 				$(this).trigger("titleSet");
			// 			});
			// 
			// 			self.titleInputArea=$("#tagTitleInput_").attr("id","tagTitleInput_"+self.uid);
			// 			self.titleInputArea.val(self.title);
			// 			self.titleInputArea.blur(function(e){
			// 				e.preventDefault();
			// 				$(this).trigger("titleSet");
			// 			});
			// 
			// 
			// 			self.tagDel=$("#tagdel_").attr("id","tagdel_"+self.uid);
			// 			self.tagDel.bind("click",{obj:this},self.deleteTag);
			// 			self.attrBody=$("#tagAtr_").attr("id","tagAtr_"+self.uid);
			// 
			// 			self.editB=$("#tagedit_").attr("id","tagedit_"+self.uid);
			// 
			// 			self.editB.bind("click",{obj:this},self.doneEdit);

			self._getNVRules();
			self.setTitleChoices();

		//	self.DOM.bind("toggleTagState",{obj:this},self.toggleTagState);
			self.DOM.bind("titleOptionClicked",{obj:this},self.titleOptionClickHandle);
			self.DOM.bind("titleSet",{obj:this},self.setTitle);
			self.DOM.bind("nvItemChanged",{obj:self},self._updateLogBar);
			//constructed, notify other objects this is the active element
			self.DOM.trigger("tagOpen",[self.htmlindex,this]);
			self.DOM.trigger("activateShapeBar");
			self.DOM.trigger("deactivateShapeDelete");
			//global listeners
			//$("body").bind("shapeCommit",{obj:this},self.ingestCoordData);

			if(self.shapeId&&self.json){
				self.loadJSONShape();
			}
		
		
		},
		setTagMenu:function(){
			var self=this;
			self.menuDDown=$("#"+self.tagMenu.attr('id')+" > #ddown > div.menuitem > ul").attr('id',self.uid+"_ddown");
			if(self.menuDDown){
				// //animation variables set here
				// 				self.startingHeight=21;
				// 				self.speed=300;
				// 				self.endHeight=self.menuDDown.height();
				// 				self.menuDDown.css({"visibility":"visible","z-index":"1000"}).height(self.startingHeight);
				// 				
				// 				//setting up the stylized drop down menu
				// 				self.menuDDown.mouseover(function () {
				// 					$(this).stop().animate({height:self.endHeight},{queue:false, duration:self.speed});
				// 				});
				// 				self.menuDDown.mouseout(function () {
				// 					$(this).stop().animate({height:self.startingHeight+'px'}, {queue:false, duration:self.speed});
				// 				});
				//Make draggable
				self._draggable();
			} else {
				throw "Error";
			}
		},
		_draggable:function(){
			var self=this;
			//snaps back into place when user moves it
			self.DOM.draggable({
				axis:'y',
				revert:true,
				handle:$("#"+self.tagMenu.attr('id')+" > div.menuitem > span.btnIconLarge.hand ")
			});
		},
		//figure out what to pass on to NV item
		_getNVRules:function(){
			var self=this;
		
			if(self.tagRules&&self.tagId){
				for(r in self.tagRules.tags){
					//see if uid matches tagId
					if(self.tagRules.tags[r].uid==self.tagId){
						self.NVRules=self.tagRules.tags[r];
						break;
					}
				}
			}
			//set new name
			self.name=self.NVRules.name;
			self.nameInput.val(self.name+"_"+$(".tag").length);
			self.nameP.text(self.name+"_"+$(".tag").length);
			self.DOM.trigger("tagUpdate",{".tagname":$("#"+self.DOM.attr('id')+" > div.tagname").html()});
		},
		_updateLogBar:function(e,nvid){
			//when an nvitem is added to the attr list, notify copies of tag
			var self=e.data.obj;
			self.DOM.trigger("tagUpdate",[{".tagcontent > .tagattr":$("#"+self.DOM.attr('id')+" > .tagcontent > .tagattr").html()}]);
		},
		//SET BY JSON {Object}
		setTitleChoices:function(){
			var self=this;
			//set by tagRules (see init constructor)
			//set up selection for first-level tags
			//use the NameValue object to do toplevel tags - handles other values
			self.NV=new NVItem({
				loc:self.tagAttrInsertArea.attr('id'),
				tagRules:self.tagRules,
				tagUID:self.tagId,
				json:self.json,
				tagData:self.NVRules,
				html:self.nvhtml
			});
		},
		_open:function(){
			var self=this;

			$("#"+self.loc+" > .tag").hide().removeClass("selected");
			self.DOM.show().addClass("selected");
			$("body").trigger("shapeDisplayChange",["a",self.shapeId]);
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
			this.parentTagId=args.parentTagId;
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
			if(!args.html) throw "Error in constructing NVItem";
			this.loc=$("#"+args.loc);
			this.html=args.html;
			//append html to DOM
			$(this.html).appendTo(this.loc);
			
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
			//NEW: get html from JSON 
			// $($.ajax({
			// 				url:'lib/Tag/NameValueArea.php?id='+this.uid,
			// 				dataType:'html',
			// 				async:false
			// 			}).responseText).insertAfter(this.loc);
			
			//this.nodeValue=args.nv;
			//this.DOM=$("<div class=\"subNameValue\"></div>").attr("id","namevaluepair_"+$(".subNameValue").length).insertAfter(this.loc);
			this.DOM=$("#emptynvitem").attr('id',"nvitem_"+this.uid);
			//adjust DOMs margin based on level
			var n=this.level*15;
			this.DOM.css("margin-left",n+"px");
			//this.DOM.css("background-color",((this.level%2)>0)?ALT_COLORS[0]:ALT_COLORS[1]);
			this.inputArea=$("#"+this.DOM.attr('id')+" > span.nameValue_Input");
			//insert title of tag into the inputArea
			this.inputArea.text(this.tagName);
			//this.changeB=$("#"+this.uid+"_nvInputArea > a").click(function(e){$(this).trigger("NV_StartOver");});
			this.requiredArea=$("#"+this.DOM.attr('id')+" > span.nameValue_RequiredArea").attr('id',this.uid+"_rqa");
			this.optionalArea=$("#"+this.DOM.attr('id')+" > span.nameValue_OptionalArea").attr('id',this.uid+"_opa");
			// this.optSelect=$("#"+this.uid+"_optSelect");
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
								loc:this.requiredArea.attr('id'),
								tagRules:this.rules,
								tagData:tag,
								level:(this.level+1),
								html:this.html
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
						loc:obj.optionalArea.attr('id'),
						tagRules:obj.rules,
						tagData:T,
						level:(obj.level+1),
						html:obj.html
					});
					obj.items.push(el);
					obj.DOM.trigger("nvItemChanged",[obj.uid]);
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
			this.toggleB=$("<span class=\"button\">Add more data...</span>").insertAfter(this.loc);
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
	
	
	TILE.TILE_ENGINE=TILE_ENGINE;
	TILE.Log=Log;
	TILE.TileLogShape=TileLogShape;
	TILE.TileNameValue=TileNameValue;
	TILE.NVItem=NVItem;
	TILE.NVOptionsItem=NVOptionsItem;
	TILE.TileLogTag=TileLogTag;
	TILE.TileLogGroup=TileLogGroup;
	
})(jQuery);