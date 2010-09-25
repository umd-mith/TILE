///TILE 1.0
// Authors: Doug Reside (dreside), 
// 			Grant Dickie (grantd) 

// Base Code for all of the main TILE interface objects
// this must be included after Monomyth.js, necessary jQuery files, and related CSS files

// Image
// SideToolBar
// Dialog
// ImportDialog
// ExportDialog
// LoadTags
// NewImageDialog
//TILE_ENGINE: {Object} main engine for running the LogBar and Layout of TILE interface
// TileToolBar

//Global Constants that other plugins can use 
var URL_LIST=[];

(function($){
	var TILE=this;
	/**
	 * Basic Image Object
	 * 
	 * Contains URL for where the image is (or an array of urls)
	 * Contains zoomMin and zoomMax, zoomLevel - may be used for 
	configuring zooming
	 */
	var TILEImage=Monomyth.Class.extend({
		// Constructor
		init:function(args){
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
			this.zoomMin=(args.minZoom)?args.minZoom:1;
			this.zoomMax=(args.maxZoom)?args.maxZoom:5;
			this.zoomLevel=this.zoomMin;
		},
		//return a copy of the zoomLevel
		getZoomLevel:function(){var z=this.zoomLevel;return z;},
		//show the DOM elements contained by this object
		activate:function(){
			this.DOM.show();
		},
		//hide the DOM elements contained by this object
		deactivate:function(){
			this.DOM.hide();
		}
	});
	
	TILE.TILEImage=TILEImage;
	
	/**
	SideToolbar

		For handling secondary functions
		attaches DOM to DOM tree

		loc: ID for the element to attach to
	**/

	var SideToolBar=Monomyth.Class.extend({
		init:function(args){
			this.DOM=$("#"+args.loc);
			//attach PHP-fed HTML into location
			// this.DOM.append($.ajax({
			// 							async:false,
			// 							url:'lib/ToolBar/SideToolBar.php',
			// 							type:'GET'
			// 						}).responseText);

			/**
			this.DOM=$("<div class=\"SideToolBar\"></div>");
			this.DOM.attr("id",function(e){
				return "sidebar"+$(".sidetoolbar").length;
			});
			this.DOM.appendTo(args.loc);
			this.loc=args.loc;**/

		},
		activate:function(){
			this.DOM.show();
		},
		deactive:function(){
			this.DOM.hide();
		}
	});
	
	TILE.SideToolBar=SideToolBar;
	
	
	// Dialog Script
	// 
	// Creating several objects to display dialog boxes
	// 
	// Developed for TILE project, 2010
	// Grant Dickie

	

	var Dialog=Monomyth.Class.extend({
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		init:function(args){
			if((!args.loc)||(!args.html)) throw "Not enough arguments passed to Dialog";
			this.loc=args.loc;
			//set up JSON html
			this.html=args.html;
			$(this.html).appendTo(this.loc);
		}
	});
	
	TILE.Dialog=Dialog;
	
	/**
	Dialog Boxes: Import, New Image, Load Tags
	**/
	//ImportDialog
	/**
	Called by openImport CustomEvent
	**/
	// Handles receiving JSON data input by the user
	// sends data to TILE_ENGINE to be loaded as JSON
	var ImportDialog=Dialog.extend({
		// Constructor
		// args same as Dialog()
		init:function(args){
			this.$super(args);
			this.index=($("#dialog").length+this.loc.width());

			this.autoFill=args.auto;
			//lightbox content
			this.light=$("#light");
			this.fade=$("#fade");
			this.DOM=$("#dialogImport");
			this.closeB=$("#importDataClose");
			this.closeB.click(function(e){
				$(this).trigger("closeImpD");
			});
			// handle Form input for JSON data from user
			this.multiFileInput=$("#importDataFormInputMulti").val(this.autoFill);
			this.multiFileFormSubmit=$("#importDataFormSubmitMulti");
			this.multiFileFormSubmit.bind("click",{obj:this},this.handleMultiForm);
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("closeImpD",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("openExport",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.display);
		},
		// shows the dialog box - called remotely by openImport Custom Event
		// e : {Event}
		display:function(e){
			var obj=e.data.obj;
			obj.fade.show();
			obj.DOM.show();
			obj.light.show();
		},
		// called by openNewImage, closeImpD, openLoadTags, openExport Custom Events
		// e : {Event}
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		},
		// finds the transcript/image file that the user 
		// has input and sends it off in a CustomEvent trigger
		// schemaFileImported
		handleMultiForm:function(e){
			e.preventDefault();
			var obj=e.data.obj;
			var file=obj.multiFileInput.val();
			//var schema=obj.schemaFileInput.attr("value");
			if(file.length){
				if(/http:\/\//.test(file)){
					//trigger an event that sends both the schema and the list of files to listener
					console.log("file tests out ok  "+file);
					obj.DOM.trigger("schemaFileImported",[file]);
					// obj.DOM.trigger("schemaLoaded",[{schema:schema}]);
					// 					obj.DOM.trigger("multiFileListImported",[file]);
				} else {
					//show warning: not a valid URI
				}
			}
		}
	});

	TILE.ImportDialog=ImportDialog;

	// Load Tags Dialog
	// For loading JSON session data back into the TILE interface

	var LoadTags=Dialog.extend({
		// Constructor: (Same as Dialog)  {loc: {String} id for where to put DOM, html: {String} JSON string representing html for this Dialog}
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
			
			this.submitB=$("#importTagsSubmit");
			// this.submitB.bind("click",{obj:this},this.submitHandle);	
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openExport",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.display);
			$("body").bind("closeLoadTags",{obj:this},this.close);
		},
		// display the load tags dialog - called by openLoadTags trigger
		// e : {Event}
		display:function(e){
			var obj=e.data.obj;
			obj.light.show();
			obj.DOM.show();
			obj.fade.show();
		},
		// submitHandle:function(e){
		// 			e.preventDefault();
		// 			var self=e.data.obj;
		// 			
		// 			// get input file
		// 			var url=$("#importTagsFileName").val();
		// 			// make AJAX call
		// 			$.ajax({
		// 				url:url,
		// 				dataType:"text",
		// 				success:function(json){
		// 					$("body:first").trigger("prevJSONLoaded",[json]);
		// 				}
		// 			});
		// 		},
		// hide dialog box - called by closeLoadTags, openImport, openNewImage, openExport
		// e : {Event}
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		}
	});

	TILE.LoadTags=LoadTags;

	// ExportDialog
	// For exporting JSON session data and transforming into an 
	// XML file/another form of output
	var ExportDialog=Dialog.extend({
		// Constructor: {loc: {String} id for the location of parent DOM, html: {String} html string for attached HTML}
		init:function(args){
			this.$super(args);
			this.defaultExport=(args.defaultExport)?args.defaultExport:null;
			
			this.DOM=$("#exportDialog");
			this.light=$("#exportLight");
			this.dark=$("#exportFade");
			this.closeB=$("#exportDataClose");
			this.closeB.click(function(e){
				e.preventDefault();
				$(this).trigger("closeExport");
			});

			this.submitB=$("#exportSubmit");
			this.submitB.bind("click",{obj:this},this._submitButtonHandle);
			
			this.fileI=$("#exportFileToUse");
			if(this.defaultExport) this.fileI.val(this.defaultExport);
			this.expData=$("#exportData"); //this input is hidden
			
			this.srcXML=$("#srcXML");
			
			this.json=null;
			
			$("body").bind("openExport",{obj:this},this.display);
			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("closeExport",{obj:this},this.close);
		},
		// display this dialog - called by openExport trigger
		// Passed the JSON object to save
		// e : {Event}
		// njson : {Object} - new JSON object to save
		display:function(e,njson){
			var self=e.data.obj;
			self.light.show();
			self.DOM.show();
			self.dark.show();
			// new json object
			self.json=njson;
		
		
		},
		// hide dialog box - called by openLoadTags, openNewImage, openImport, closeExport
		// e : {Event}
		close:function(e){
			var self=e.data.obj;
			self.light.hide();
			self.DOM.hide();
			self.dark.hide();
		},
		// Takes the script input by the user as a string, then
		// attaches .js script to the page and performs function
		// e : {Event}
		_submitButtonHandle:function(e){
			e.preventDefault();
			var self=e.data.obj;
			if(!self.json) return;
			//get src script from user
			var srcscript=self.fileI.val();
			//attach a script element to the page with src
			// set to the file specified by the user
			var sel=$("<script type=\"text/javascript\" src=\""+srcscript+"\"></script>");
			// attach to header
			$("head").append(sel);
			//bind DONE event to the body tag
			$("body").bind("exportStrDone",{obj:self},self._expStrDoneHandle);
			
			self.srcXML.val(self.json.sourceFile.replace(".xml",""));
			// stringify if not already a string
			if(typeof self.json != "string") self.json=JSON.stringify(self.json);
			
			//perform a set timeout with function from js script
			setTimeout(function(self,sel){
				exportToTEI(self.json);
				sel.remove();
			},250,self,sel); 
		},
		//takes user-defined text data and uses it to 
		// export current JSON session as XML
		// e : {Event}
		// str : {String} - represents JSON data in string format
		_expStrDoneHandle:function(e,str){
			var self=e.data.obj;
			$("body").unbind("exportStrDone",self._expStrDoneHandle);
			
			//take file given and use it in ajax call
			//var file=self.fileI.val();
			//attach an iframe to the page; this is set
			//to whatever file is and has POST data sent 
			//to it
			// var iframe=$("<iframe src=\"importWidgets/exportXML.php\"></iframe>").load(function(e){
				// make a post request to attached script with jquery
			
				
				// $.ajax({
				// 					type:'POST',
				// 					url:"./importWidgets/exportXML.php",
				// 					data:({JSON:self.expData.val()}),
				// 					dataType:'text',
				// 					success:function(d){
				// 						if(__v)  console.log("this was a success  "+d);
				// 
				// 						// $("iframe").remove();
				// 					}
				// 				});
			// });
			// set the action parameter
			self.expData.val(str);
			$("#exportDataForm").attr("action","importWidgets/exportXML.php");
			$("#exportDataForm")[0].submit();
			// $("iframe").remove();
			$("#exportDataForm").attr("action","");
			$("body:first").trigger("closeExport");
			
			
			// iframe.appendTo($("#azglobalmenu"));
		}
	});

	// New Image Dialog Box
	// for putting a new image into the URL and manifest lists
	// NOTE: may be deprecated in future TILE code
	var NewImageDialog=Dialog.extend({
		// Constructor: Same as Dialog
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
			obj.DOM.css({"z-index":"1001"});
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

	/**Main Engine **/
	//loads in html layout from columns.json, parses JSON and sends to all 
	// other objects 
	// 
	//
	// Functions
	// 	getBase - checks TILECONSTANTS.json for base http data
	// 	setUp - makes Transcript, ActiveBox, sets global binds
	// 	addNewTool - sets a new tool - users must define tool in .js code and proper JSON format
	// saveSettings - starts prompt to save all data in session
		
	var TILE_ENGINE=Monomyth.Class.extend({
		init:function(args){
			//get HTML from PHP script and attach to passed container
			this.loc=(args.attach)?args.attach:$("body");
			var self=this;
			self.toolSet=args.toolSet;
			self.json=null;
			self.manifest=null;
			self.curUrl=null;
			//check if there is json data 
			self.checkJSON();
		},
		// Called to see if there is a JSON object stored in the PHP session() 
		checkJSON:function(){
			var self=this;
			var file=$.ajax({
				url:'PHP/isJSON.php',
				dataType:"text",
				async:false
			}).responseText;
			if(file){
				self.json=JSON.parse(file);
			}
			self.getBase();
		},
		//Calls TILECONSTANTS.json file and gets base, possible json data
		getBase:function(){
			//check JSON file to configure main path
			var self=this;
			$.ajax({url:'TILECONSTANTS.json',dataType:'json',success:function(d){
				//d refers to the JSON data
				
				self._importDefault=d.pemLoad;
				self._exportDefault=d.exportDefault;
				$.ajax({
					dataType:"json",
					url:"./lib/JSONHTML/columns.json",
					success:function(d){
						//d represents JSON data
						// $(d.body).appendTo($("body"));

						self.DOM=$("body");
						self.schemaFile=null;
						self.preLoadData=null;
						//global bind for sidebar completion event to loadCanvas()
						self.setUp(d);
					}
				});
			},async:false});
		},
		//called after getBase(); creating main TILE interface objects and
		//setting up the HTML
		setUp:function(d){
			var self=this;
			
			//store JSON html data - has everything for layout
			this.columnslayout=d;
			//create log - goes towards left area
			//this._log=new TileLogBar({html:this.columnslayout,json:this.json});
			this._log=new Transcript({loc:"logbar_list",text:null});
			this._activeBox=new ActiveBox({loc:"az_activeBox"});
			this._transcriptBar=new TileToolBar({loc:"transcript_toolbar"});
		
			//important variables
			//finishes the rest of init
			this.toolbarArea=$("#header");

			//global bind for when the ImportDialog sends the user-input file
			$("body").bind("schemaFileImported",{obj:this},this.getSchema);
			//global bind for when user selects a new tool from LogBar
			$("body").bind("toolSelected",{obj:this},function(e,name){
				self.setUpTool(name);
			});
			//global bind for when data is ready to be passed as JSON to user
			$("body").bind("JSONreadyToSave",{obj:this},this._saveToUser);
			//global bind for when user clicks on transcript object
			$("body").bind("TranscriptLineSelected",{obj:this},this._transcriptSelectHandle);
			//for when user clicks on save
			$("body").bind("saveAllSettings",{obj:this},this._saveSettingsHandle);
			//global bind for when a new page is loaded
			$("body").bind("newPageLoaded",{obj:this},this._newPageHandle);
			// global bind for when user wants to export the JSON session as XML
			$("body").bind("exportDataToXML",{obj:this},this._exportToXMLHandle);
			// global bind for when user draws shape in VectorDrawer
			// $("body").bind("receiveShapeObj",{obj:this},this._shapeDrawnHandle);
			//if json data not already loaded, then open up ImportDialog automatically
			// to prompt user
		
			//if there's a json object already loaded,set up the manifest 
			
			// array to pass to tools
			if(self.json){
				self.manifest={};
				// format for duplicates
				// organize manifest by url
				for(key in self.json.pages){
					if(!self.manifest[self.json.pages[key].url]){
						self.manifest[self.json.pages[key].url]=$.extend(true,{},self.json.pages[key]);
					} else {
						//duplicate url - 
						$.each(self.manifest[self.json.pages[key].url].info,function(i,o){
							if(i in self.json.pages[key].info){
								if($.isArray(o)&&($.inArray(self.json.pages[key].info[i],o)<0)){
									o.push(self.json.pages[key].info[i]);
								} else {
									//make this item into an array
									var pre=o;
									o=[pre];
									o.push(self.json.pages[key].info[i]);
								}
							}
						});
						$.merge(self.manifest[self.json.pages[key].url].lines,self.json.pages[key].lines);
					}
				}	
			}
			//get dialog JSON data
			$.ajax({
				url:"lib/JSONHTML/dialogs.json",
				dataType:"json",
				success:function(x){
					self.dialogJSON=x;
					self.addDialogBoxes();
				}
			});
			
		},
		/**Get Schema**/
		//taken from setMultiFileImport Custom Event call from ImportDialog
		// users supply a filename in ImportDialog that is then used here 
		// as @file
		// e : {Event}
		// file : {String}
		getSchema:function(e,file){
			var obj=e.data.obj;
			//We are just getting the file with images
			// and the transcripts
			obj.imageFile=file;
			//make ajax call to @file parameter
			$.ajax({
				url:obj.imageFile,
				dataType:'text',
				success:function(d){
					//d refers to JSON object retrieved from imageFile
					
					if(!obj.json) {
						obj.json=eval('('+d+')');
						obj.manifest={};
					
					}
					var dt=new Date();
					var tlines=[];
					//format for duplicates
					//organize manifest by url
					for(key in obj.json.pages){
						
						if(!obj.manifest[obj.json.pages[key].url]){
							obj.manifest[obj.json.pages[key].url]=$.extend(true,{},obj.json.pages[key]);
						} else {
							//duplicate url - 
							$.each(obj.manifest[obj.json.pages[key].url].info,function(i,o){
								if(i in obj.json.pages[key].info){
									if($.isArray(o)&&($.inArray(obj.json.pages[key].info[i],o)<0)){
										o.push(obj.json.pages[key].info[i]);
									} else {
										//make this item into an array
										var pre=o;
										o=[pre];
										o.push(obj.json.pages[key].info[i]);
									}
								}
							});
							// console.log("loading schema: "+key+": "+obj.json.pages[key].lines.length);
							$.merge(obj.manifest[obj.json.pages[key].url].lines,obj.json.pages[key].lines);
							// console.log("after merge: "+key+": "+obj.json.pages[key].lines.length);
						}
					}
					$("body:first").trigger("loadImageList",[obj.manifest]);
					$("body:first").trigger("closeImpD");
				}
			});
		},
		//sets up the HTML and functions for the Dialog boxes
		addDialogBoxes:function(){
			var self=this;
			//load dialog boxes
			this.importDialog=new ImportDialog({
				loc:$("body"),
				html:this.dialogJSON.dialogimport,
				auto:this._importDefault
			});
			this.loadTagsDialog=new LoadTags({
				loc:$("body"),
				html:this.dialogJSON.dialogloadtags
			});
			//new Image Dialog
			this.nImgD=new NewImageDialog({loc:"body",html:this.dialogJSON.dialogaddimage});
		
			//export Data Dialog
			this.expD=new ExportDialog({loc:"body",html:this.dialogJSON.dialogexport,defaultExport:this._exportDefault});
			// Set up the imagetagger here, after setting up all of the dialog boxes that can load
			// JSON data for the imagetagger and any other tools
			if(this.toolSet){
				//send to toolbar
				this._transcriptBar.setChoices(this.toolSet);
				// sending imagetagger the optional args array
				this.setUpTool("imagetagger",{scale:1});
			}
			if(!self.json){
				//display importDialog to user - no json already given
				// JSON needs to be supplied in ImportDialog
				$("body:first").trigger("openImport");
			}
		},
		// sets up the initial tool that is stored in the toolSet array
		// toolname : {String} - index for tool represented by the name of that tool
		// args : {Object} (optional) - array of arguments to pass to a tool's constructor
		setUpTool:function(toolname,args){
			var obj=this;
			toolname=toolname.toLowerCase().replace(" ","");
			if(obj.curTool&&(obj.curTool.name==toolname)) return;
			if(obj.toolSet){
				if(obj.curTool) obj.curTool.close(); //closes the current tool
				obj._transcriptBar.setChoice(toolname);
				
				for(tool in obj.toolSet){
					if(obj.toolSet[tool].name==toolname){
						if(!obj.toolSet[tool].constructed){
							// send the tool's start function any and all reliable data
							var m=(obj.manifest)?obj.manifest:null;
							obj.toolSet[tool].start(null,(obj.manifest)?obj.manifest:null,(args)?args:null); //give place where it opens into
							obj.toolSet[tool].constructed=true;
							obj.curTool=obj.toolSet[tool];
							$("body").bind(obj.toolSet[tool].done,{obj:obj,tool:obj.toolSet[tool]},obj._toolDoneHandle);
							// if(!self.curUrl) self.curUrl=$("#srcImageForCanvas").attr('src');
						} else {
							//tool already constructed, restart tool
							obj.curTool=obj.toolSet[tool];
							var m=(obj.json)?obj.manifest[$("#srcImageForCanvas").attr("src")]:null;
							obj.curTool.restart(m,(args)?args:null);
						}
					}
				}
				
				
				// for(tool in obj.toolSet){
				// 					if(obj.toolSet[tool].name==toolname){
				// 						if(obj.curTool){
				// 							//select in toolSelect
				// 							obj._transcriptBar.setChoice(toolname);
				// 							$("body").bind(obj.curTool._close,function(){
				// 								$(this).unbind(obj.curTool._close);
				// 								if(!obj.toolSet[tool].constructed){
				// 									// send the tool's start function any and all reliable data
				// 									var m=(obj.manifest)?obj.manifest:null;
				// 									obj.toolSet[tool].start(null,(obj.manifest)?obj.manifest:null,(args)?args:null); //give place where it opens into
				// 									obj.toolSet[tool].constructed=true;
				// 									obj.curTool=obj.toolSet[tool];
				// 									$("body").bind(obj.toolSet[tool].done,{obj:obj,tool:obj.toolSet[tool]},obj._toolDoneHandle);
				// 									if(!self.curUrl) self.curUrl=$("#srcImageForCanvas").attr('src');
				// 								} else {
				// 									//tool already constructed, restart tool
				// 									obj.curTool=obj.toolSet[tool];
				// 									var m=(obj.json)?obj.manifest[$("#srcImageForCanvas").attr("src").substring($("#srcImageForCanvas").attr("src").indexOf('http'))]:null;
				// 									obj.curTool.restart(m,(args)?args:null);
				// 								}
				// 							});
				// 							obj.curTool.close(); //closes the current tool
				// 						} else {
				// 							obj._transcriptBar.setChoice(toolname);
				// 							if(!obj.toolSet[tool].constructed){
				// 								// send the tool's start function any and all reliable data
				// 								var m=(obj.manifest)?obj.manifest:null;
				// 								obj.toolSet[tool].start(null,(obj.manifest)?obj.manifest:null,(args)?args:null); //give place where it opens into
				// 								obj.toolSet[tool].constructed=true;
				// 								obj.curTool=obj.toolSet[tool];
				// 								$("body").bind(obj.toolSet[tool].done,{obj:obj,tool:obj.toolSet[tool]},obj._toolDoneHandle);
				// 								if(!self.curUrl) self.curUrl=$("#srcImageForCanvas").attr('src');
				// 							} else {
				// 								//tool already constructed, restart tool
				// 								obj.curTool=obj.toolSet[tool];
				// 								var m=(obj.json)?obj.manifest[$("#srcImageForCanvas").attr("src").substring($("#srcImageForCanvas").attr("src").indexOf('http'))]:null;
				// 								obj.curTool.restart(m,(args)?args:null);
				// 							}
				// 						}
				// 						break;
				// 					}
				// 				}
				
			}
			
			
			
		},
		// Called by newPageLoaded Custom Event
		// e : {Event}
		// url : {String} represents new url of srcImageForCanvas
		// for loading/creating data in the TILE_ENGINE master manifest file
		_newPageHandle:function(e,url){
			
			var self=e.data.obj;
			// update current
			if(self.curUrl&&self.manifest[self.curUrl]){
				self.manifest[self.curUrl].lines=self._log.exportLines();
			}
			
			//current url passed
			//get index in json
			var page=null;
			//check manifest for next transcript lines
			if(self.manifest[url]){
				self.curUrl=url;
				if(!self.manifest[url].lines) self.manifest[url].lines=[];
				self._log._addLines(self.manifest[url].lines,url);
				self._activeBox.clearArea();
			}
		},
		// Called after a tool has fired it's 'done' Custom Event
		// e : {Event}
		// args : {Object} (optional arguments to pass after completing tool .close() method)
		_toolDoneHandle:function(e,args){
			var self=e.data.obj;
			
			
			// self.curTool=null;
			// correct src of srcImageForCanvas, if needed
			if($("#srcImageForCanvas").attr('src').indexOf('http')>0){
				var url=$("#srcImageForCanvas").attr('src').substring($("#srcImageForCanvas").attr('src').indexOf('http'));
				$("#srcImageForCanvas").attr('src',url);
			}
			//return the TILE interface to image tagging mode
			if(args){
				if(args.data){
					self.manifest[self.curUrl]=args.data;
					self._log._addLines(self.manifest[self.curUrl].lines,self.curUrl);
					self._activeBox.clearArea();
				}	
				self.setUpTool("imagetagger",args);
			} else {
				self.setUpTool("imagetagger");
			}
		},
		// Called after VectorDrawer fires the shapeDrawn custom event
		// e : {Event}
		// shape : {Object} - JSON data representing the shape data
		_shapeDrawnHandle:function(e,shape){
			var self=e.data.obj;
			// add delete button
			// $.extend(shape,{
			// 			"button1":"<span id=\"delete"+shape.id+"\" class=\"deleteKey button\">DELETE</span>"
			// 		});
			self._log.addShape(shape);
		},
		// Called after transcript object fires TranscriptLineSelect Custom Event
		// e : {Event}
		// data : {Object} JSON object representing data related to transcript line
		// data can include shapes
		_transcriptSelectHandle:function(e,data){
			var self=e.data.obj;
			self._activeBox._addItem(data);
		},
		// Called after saveAllSettings Custom Event is fired
		// e : {Event}
		_saveSettingsHandle:function(e){
			var self=e.data.obj;
			// go through each tool and use the bundleData function
			// for that tool - returns modified manifest each time
			for(t in self.toolSet){
				self.manifest=self.toolSet[t].bundleData(self.manifest);
			}
			self.manifest[self.curUrl].lines=self._log.exportLines();
			// self.manifest=self.curTool.bundleData(self.manifest);
			
			if(!self.save) self.save=new Save({loc:"azglobalmenu"});
			var exfest=[];
			var curl=null;
		
			//merge manifest data with json data
			// TODO: should probably make this more generic
			for(p in self.json.pages){
				
				if((curl!=self.json.pages[p].url)&&(self.manifest[self.json.pages[p].url])){
					
					curl=self.json.pages[p].url;
					exfest=[];
					// creates copy of manifest - manifest should be unaltered
					$.merge(exfest,self.manifest[self.json.pages[p].url].lines);
				}
				var shps=[];
				if(self.manifest[self.json.pages[p].url].shapes) $.merge(shps,self.manifest[self.json.pages[p].url].shapes);
				self.json.pages[p].shapes=shps;
				if(self.json.pages[p].lines.length>0){
					for(x=0;x<self.json.pages[p].lines.length;x++){
						if(exfest[x]){
							self.json.pages[p].lines[x]=exfest[x];
						}
						
					}
					
					var aa=exfest.slice((self.json.pages[p].lines.length));
					exfest=aa;
				}
				
			}
			
			self.save.userPrompt(self.json);
		},
		// Handles the exportDataToXML Event call
		// e : {Event}
		_exportToXMLHandle:function(e){
			var self=e.data.obj;
			// get all relevant session data 
			// and output to exportDialog
			for(t in self.toolSet){
				self.manifest=self.toolSet[t].bundleData(self.manifest);
			}
			self.manifest[self.curUrl].lines=self._log.exportLines();
			var exfest=[];
			var curl=null;
		
			//merge manifest data with json data
			for(p in self.json.pages){
				
				if((curl!=self.json.pages[p].url)&&(self.manifest[self.json.pages[p].url])){
					curl=self.json.pages[p].url;
					exfest=[];
					// creates copy of manifest - manifest should be unaltered
					$.merge(exfest,self.manifest[self.json.pages[p].url].lines);
				}
				// add shapes array to final JSON
				var shps=[];
				if(self.manifest[self.json.pages[p].url].shapes) $.merge(shps,self.manifest[self.json.pages[p].url].shapes);
				self.json.pages[p].shapes=shps;
				for(x=0;x<self.json.pages[p].lines.length;x++){
					if(exfest[x]){
						
						self.json.pages[p].lines[x]=exfest[x];
						// NOTE: Should images be reset to scale of 1?
					}
					
				}
				var aa=exfest.slice((self.json.pages[p].lines.length));
				exfest=aa;
				
			}
			// send the JSON object to exportDialog
			$("body:first").trigger("openExport",self.json);
		}
	});
	
	TILE.TILE_ENGINE=TILE_ENGINE;

	//TileToolBar
	// Used to handle Tool selection menu, Loading JSON session data, Saving JSON session Data
	TileToolBar=Monomyth.Class.extend({
		// Constructor
		// Use: {
		// 	loc: {String} id for parent DOM
		// }
		init:function(args){
			//getting HTML that is already loaded - no need to attach anything
			var self=this;
			self.loc=args.loc;
			self.LoadB=$("#"+self.loc+" > .menuitem > ul > li > #load_tags");
			self.SaveB=$("#"+self.loc+" > .menuitem > ul > li > #save_tags");
			self.ExpB=$("#"+self.loc+" > .menuitem > ul > li > #exp_xml");
			self.ToolSelect=$("#"+self.loc+" > #ddown > .menuitem.ddown > select");
			self.ToolSelect.change(function(e){
				var choice=self.ToolSelect.children("option:selected");
				$(this).trigger("toolSelected",[choice.text().toLowerCase()]);
			});
			//set up loading and saving windows
			self.LoadB.click(function(e){
				e.preventDefault();
				$(this).trigger("openLoadTags");
			});
			self.SaveB.click(function(e){
				e.preventDefault();
				$(this).trigger("saveAllSettings");
			});
			//button that activates the export Dialog
			self.ExpB.click(function(e){
				e.preventDefault();
				$("body:first").trigger("exportDataToXML");
			});
		},
		// Load in ToolSelect menu
		// data : JSON object of tools and their objects
		setChoices:function(data){
			var self=this;
			self.ToolSelect.children("option").remove();
			for(d in data){
				if(data[d].name){
					var el=$("<option>"+data[d].name+"</option>");
					self.ToolSelect.append(el);
				}
			}
		},
		// When a tool is selected, call this function to make sure
		// that the toolname is actually selected in the <select> element
		// name : {String} toolname
		setChoice:function(name){
			var self=this;
			self.ToolSelect.children("option").each(function(i,o){
				if(name==$(o).text().toLowerCase().replace(" ","")){
					$(o)[0].selected=true;
				} else {
					$(o)[0].selected=false;
				}
			});
		}
	});
	
	
})(jQuery);