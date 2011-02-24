// Transcript.js
// 
// copyright MITH by dreside and gdickie
// 
// Displays transcript lines that are decoded from JSON data
// Functions:
// 
// _drawText : displays the text that is contained in the lineArray variable
// _addLines(data,{optional} url) : takes a JSON-based array (data) and optional parameter url (if this data belongs
// 	to a new image) and changes the text display
// _shapeDrawnHandle : handler for the VectorDrawer shapeDrawn event. adds the drawn shape to the currently selected line
// _deleteItemHandle : handler for the deleteItem event from ActiveBox
// _updateItemHandle : handler for the shapeChanged event from VectorDrawer
// _lineSelected(index) : takes the argument index and sets the current line to the lineArray index matching index
// _lineDeSelected(index) : the opposite of _lineSelected
// exportLines : returns the lineArray
// bundleData(manifest) : takes argument manifest, which is the manifest for TILE_ENGINE, modifies/updates the TILE_ENGINE
// 							manifest data, then sends modified manifest back. 
	
(function ($, R, _) {
	var rootNS = this;
	
	rootNS.Transcript = Transcript;
	// Constructor
	// Takes {Object} args
	/*
	 * args:
	 * 	text = newLine delimited text file
	 *  loc = element to receive transcript Editor 
	 */
	function Transcript(args){
	
		var self = this;
		
		this.lineArray = args.text;//{"text":(args.text||[]),"info":[],"shapes":[]};
		if(__v) console.log("object loaded in Transcript: "+JSON.stringify(this.lineArray));
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		this.manifest=[];
		// if(this.lineArray) {
		// 			this._drawText();
		// 			
		// 		}
		this.knownIds=[];
		// parse together all JSON data for the entire session
		// here
		if(this.lineArray){
			for(url in this.lineArray){	
				if(!(/jpg$|JPG$|gif$|GIF$|png$|PNG$/.test(url))) continue;
				if(!self.manifest[url]) self.manifest[url]=[];
				for(var l in this.lineArray[url].lines){
					var line=$.extend(true,{},this.lineArray[url].lines[l]);
					self.manifest[url][l]=line;
					if(!self.manifest[url][l].id){
						
						var id="line_"+Math.floor(Math.random()*560);
						while($.inArray(id,self.knownIds)>=0){
							id="line_"+Math.floor(Math.random()*560);
						}
						self.knownIds.push(id);
						self.manifest[url][l].id=id;
					}
				}
				// if(__v) console.log("self.manifest["+url+"]  "+JSON.stringify(self.manifest[url]));
				
			}
			self.lineArray=self.manifest[$("#srcImageForCanvas").attr('src')];
			
		}
		this.curLine=0;
		this.curUrl=null;
		
		//global bind for when a shape is changed in VectorDrawer (dragged/resized)
		// $("body").bind("shapesUpdate",{obj:this},this._updateItemHandle);
		// global bind for when all lines need to be updated
		// $("body").bind("updateAllShapes",{obj:this},this._updateAllItemsHandle);
		// global bind when items are loaded 
		// $("body").bind("addLink",{obj:this},this._addLinkHandle);
		// global bind when items are deleted
		// $("body").bind("deleteLink",{obj:this},this._deleteLinkHandle);
		// global bind for newPageLoaded
		// $("body").bind("newPageLoaded",{obj:this},this._newPageLoadedHandle);
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		_newPageLoadedHandle:function(e,url){
			var self=e.data.obj;
			self._changeLines(url);
		},
		_insertLines:function(data){
			var self=this;
		
			
			
			self.lineArray=data;
			
			// if(typeof(data)=='object'){
			// 			for(var prop in data){
			// 				self.manifest[prop]=data[prop];
			// 			}
			// 			self.lineArray=self.manifest[$("#srcImageForCanvas").attr('src')];
			// 			
			// 		} else {
			// 			self.manifest=data;
			// 			self.lineArray=self.manifest[$("#srcImageForCanvas").attr('src')];
			// 		}
		},
		_changeLines:function(url){
			var self=this;
			// has url been passed?
			if(url&&(self.curUrl!=url)){
				self.manifest[self.curUrl]=self.lineArray;
				self.curUrl=url;
				
				// if(self.curUrl) self.manifest[self.curUrl]=self.lineArray;
				// 					//new manifest area being created
				// 					if(!self.manifest[url]) {
				// 						self.manifest[url]={
				// 							"lines":[],
				// 							"url":url
				// 						};
				// 						// check to make sure that new data have ids
				// 						for(d in data){
				// 							if(!data[d].id){
				// 								var id="";
				// 								id="line_"+Math.floor(Math.random()*560);
				// 								while($.inArray(id,self.knownIds)>=0){
				// 									id="line_"+Math.floor(Math.random()*560);
				// 								}
				// 								self.knownIds.push(id);
				// 								data[d].id=id;
				// 							}
				// 						}
				// 						
				// 					}
			}
			// if(!data) return;
			
			self.lineArray=self.manifest[self.curUrl];
			
			// reset curLine
			self.curLine=0;
			// check for auto-recognized lines      
			// self._setAutoLines();
			// self.manifest[self.curUrl]=self.lineArray;
			self.loc.empty();
			self._drawText();
		},
		// Takes new JSON data and applies this to 
		// the lineArray and manifest variables
		// data : {Object} JSON data that is to be fed
		// url : {String} Optional url to be given - if given, a new manifest
						// object is created and fed into the manifest array
		_addLines:function(data,url){
			var self=this;
			// has url been passed?
			if(url&&(self.curUrl!=url)){
				self.manifest[self.curUrl]=self.lineArray;
				self.curUrl=url;
				
				// if(self.curUrl) self.manifest[self.curUrl]=self.lineArray;
				// 					//new manifest area being created
				// 					if(!self.manifest[url]) {
				// 						self.manifest[url]={
				// 							"lines":[],
				// 							"url":url
				// 						};
				// 						// check to make sure that new data have ids
				// 						for(d in data){
				// 							if(!data[d].id){
				// 								var id="";
				// 								id="line_"+Math.floor(Math.random()*560);
				// 								while($.inArray(id,self.knownIds)>=0){
				// 									id="line_"+Math.floor(Math.random()*560);
				// 								}
				// 								self.knownIds.push(id);
				// 								data[d].id=id;
				// 							}
				// 						}
				// 						
				// 					}
			}
			if(__v) console.log("data in transcript: "+JSON.stringify(data));
			if((!(data))||(!($.isArray(data)))) return;
			// parse out the data
			for(var d in data){
				if(data[d]){
					if(__v) console.log("data[d].id = "+data[d].id);
					// find id in manifest
					for(var x in self.manifest[self.curUrl]){
						if(self.manifest[self.curUrl][x].id==data[d].id){
							self.manifest[self.curUrl][x]=data[d];
							break;
						}
					}
				}
			}
			
			
			self.lineArray=self.manifest[self.curUrl];
			
			// reset curLine
			self.curLine=0;
			// check for auto-recognized lines
			// self._setAutoLines();
			// self.manifest[self.curUrl]=self.lineArray;
			self.loc.empty();
			self._drawText();			
		},
		// Fills in the Transcript box with transcript lines, 
		// as received from the JSON data put into lineArray
		_drawText: function(){
			var self=this;
			
			for (var i in self.lineArray) {
				if(!this.lineArray[i]) continue;
				if(__v) console.log('drwing text '+JSON.stringify(self.lineArray[i]));
				var uid = this.lineArray[i].id;
			
				//this.lineArray[i]=eval("("+this.lineArray[i]+")");
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
			
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo($("#logbar_list")).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10); 
					
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
					if ($(this).hasClass("line_selected")){
						// de-select the line
						// var id=$(".line_selected").attr('id').replace("TILE_Transcript_","");
						$(".line_selected").removeClass("line_selected");
						$(this).trigger("lineDeselected");
					} else{
						$(".line_selected").removeClass("line_selected");
						// 						var n=$(this).attr('id').indexOf("_");
						// 						
						// 						var index=parseInt($(this).attr('id').substring(0,n),10);
						$(this).addClass("line_selected");
						$(this).trigger("TranscriptLineSelected",[$(this).attr('id')]);
						// self._lineSelected($(this).attr('id'));
					}
				});
				var n=i;
				// attach data for index value 
				$("#"+uid).data("index",n);
				// attach references 
				
				// for(r in self.lineArray[i]){
				// 				if(!(/\bid\b|\binfo\b|\btext\b/.test(r))){
				// 					if(self.lineArray[i][r]=="") continue;
				// 					self._addLinkDiv(self.lineArray[i].id,{id:self.lineArray[i][r],type:r});
				// 				}
				// 			}
			}
			// check if the page has no transcript lines associated with it
			if($("#"+self.loc.attr('id')+" > .line").length==0){
				// no lines 
				self.loc.append($("<div class=\"line\">No Transcript Lines Were Found For This Image</div>"));
			}
			
		},
		// Warning: can cause recursion since lblSelected fires the bound event
		_loadItemsHandle:function(e,data){
			var self=e.data.obj;
			if(!self.lineArray) return;
			$(".line_selected").removeClass("line_selected");
			for(s in self.lineArray){
				if($.inArray(self.lineArray[s].id,data)>=0){
					$("#TILE_Transcript_"+self.lineArray[s].id).addClass("line_selected");
				}
				
				
			}
		},
		_addLinkHandle:function(ref,line){
			if(ref.type=='lines') return;
			// if(!$(".line_selected").length) return;
			var self=this;
			for(x in self.lineArray){
				if(self.lineArray[x].id==line.id){
					self.curLine=x;
					break;
				}
			}
			
			
			if(self.curLine==null) return;
			// deactivate self
			// $(".line_selected").removeClass("line_selected");
			
			if(self.lineArray[self.curLine][ref.type]){
				for(x in self.lineArray[self.curLine][ref.type]){
					var item=self.lineArray[self.curLine][ref.type][x];
					if(item&&(item.id==ref.id)){
						
						return;
						break;
					}
				}
			} else {
				self.lineArray[self.curLine][ref.type]=[];
			}
			if(__v) console.log("transcript line "+self.lineArray[self.curLine].id+" receiving link: "+ref.type+" "+ref.id);
			self.lineArray[self.curLine][ref.type].push(ref);
			// self._addLinkDiv(self.lineArray[self.curLine].id,ref);
			// $("#TILE_Transcript_"+self.lineArray[self.curLine].id).append($("<div id=\""+ref.id+"\" class=\"button\">"+ref.type+": "+ref.id+"</div><span id=\"delete_"+ref.id+"\" class=\"button\">X</span>"));
			// 			$("#TILE_Transcript_"+self.lineArray[self.curLine].id+" > #delete_"+ref.id).click(function(e){
			// 				e.stopPropagation();
			// 				
			// 				$("body:first").trigger("deleteLink",[{id:ref.id,type:ref.type}]);
			// 				$(this).remove();
			// 				$("#"+ref.id).remove();
			// 			});
		
		},
		_addLinkDiv:function(id,ref){
			if(ref==null) return;
			var self=this;
			
			$("#Transcript_Line_"+id).append();
			$("#TILE_Transcript_"+id).append($("<div id=\""+ref.id+"\" class=\"button\">"+ref.type+": "+ref.id+"</div><span id=\"delete_"+ref.id+"\" class=\"button\">X</span>"));
			$("#TILE_Transcript_"+id+" > #delete_"+ref.id).click(function(e){
				e.stopPropagation();
				
				$("body:first").trigger("removeTransLink",[{id:ref.id,type:ref.type,parentObj:id,parentType:"lines"}]);
				$(this).remove();
				$("#"+ref.id).remove();
			});
		},
		// ref : {Object} - [id: {String}, type: {String}]
		// line : {String}
		_deleteLinkHandle:function(ref,line){
			
			if(ref.type=="lines") return;
			// if(!$(".line_selected").length) return;
			var self=this;
			if(!line){
				//  delete from every instance
					for(var n in self.lineArray){
						if(self.lineArray[n][ref.type]){
							for(var x in self.lineArray[n][ref.type]){
								var item=self.lineArray[n][ref.type][x];

								if(item&&(item.id==ref.id)){
									// delete the referenced item
									if(self.lineArray[n][ref.type].length>1){
										// var ac=self.lineArray[n][ref.type].slice(0,x);
										// 							var bc=self.lineArray[n][ref.type].slice((x+1));
										// 							self.lineArray[n][ref.type]=ac.concat(bc);
										var narray=[];
										for(sh in self.lineArray[n][ref.type]){
											if(self.lineArray[n][ref.type][sh].id!=ref.id){
												narray.push(self.lineArray[n][ref.type][sh]);
											}
										}
										self.lineArray[n][ref.type]=narray;
									} else {
										self.lineArray[n][ref.type]=[];

									}
									// $("#"+ref.id).remove();
									// $("#delete_"+ref.id).remove();
									break;
								}
							}
						} else {
							continue;
						}	
					}
			
			
			} else {
				// delete only from the line referenced
				
				for(x in self.lineArray){
					if(self.lineArray[x].id==line){
						self.curLine=x;
						break;
					}
				}
				// self.curLine=parseInt($(".line_selected").attr('id').substring(0,($(".line_selected").attr('id').indexOf("_"))),10);
				if(self.curLine==null) return;
		
				if(self.lineArray[self.curLine][ref.type]){
					for(x in self.lineArray[self.curLine][ref.type]){
						var item=self.lineArray[self.curLine][ref.type][x];
					
						if(item&&(item.id==ref.id)){
							// delete the referenced item
							if(self.lineArray[self.curLine][ref.type].length>1){
								// var ac=self.lineArray[self.curLine][ref.type].slice(0,x);
								// 							var bc=self.lineArray[self.curLine][ref.type].slice((x+1));
								// 							self.lineArray[self.curLine][ref.type]=ac.concat(bc);
								var narray=[];
								for(sh in self.lineArray[self.curLine][ref.type]){
									if(self.lineArray[self.curLine][ref.type][sh].id!=ref.id){
										narray.push(self.lineArray[self.curLine][ref.type][sh]);
									}
								}
								self.lineArray[self.curLine][ref.type]=narray;
							} else {
								self.lineArray[self.curLine][ref.type]=[];
							
							}
							break;
						}
					}
				} else {
					return;
				}
			}
			return;
			
		},
		//called when a user changes something on an item attached to a line 
		//right now only works for shapes
		// e : {Event}
		// shapes : {Object} Array of JSON objects representing VectorDrawer Shapes
		_updateItemHandle:function(e,shapes){
			var self=e.data.obj;
			if(!$(".line_selected").length) return;
			$(".line_selected").removeClass("line_selected");
			$("#TILE_Transcript_"+self.curLine).addClass("line_selected");
			
			
			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				for(v in shapes){
					var shape=shapes[v];
					$("body:first").trigger("VD_REMOVESHAPE",[shape]);
				}
				return;
			}
		
			self.lineArray[self.curLine].shapes=shapes;
		
			$("body:first").trigger("TranscriptLineSelected",self.lineArray[self.curLine].id);
		},
		// Updates all lines with given data
		// 
		_updateAllItemsHandle:function(e,data){
			var self=e.data.obj;
			if(data.shapes){
				
				for(sh in data.shapes){
					var id=data.shapes[sh].old;
					for(l in self.lineArray){
						var p=$.inArray(id,self.lineArray[l].shapes);
						if(p>=0){
							self.lineArray[l].shapes[p]=data.shapes[sh].curr;
						}
					}
				}
			}
			
		},
		//called when a line object is selected
		//users can select on or multiple lines
		// id : {String} represents id in lineArray
		_lineSelected:function(id){
			var self=this;
			var index=null;
			for(x in self.lineArray){
				if(id==self.lineArray[x].id){
					index=x;
					break;
				}
			}
			if(self.lineArray[index]) {
				//clear all shapes
				$("body:first").trigger("clearShapes");
				// change curLine
				self.curLine=index;
				//load any shapes from curLine
				if(!self.lineArray[self.curLine].shapes) self.lineArray[self.curLine].shapes=[];
				// if(self.lineArray[self.curLine].shapes.length>0){
					// prepare shapes 
					var shps=[];
					if(__v) console.log('self.lineArray['+self.curLine+'].shapes: '+$.isArray(self.lineArray[self.curLine].shapes));
					if(__v) console.log(JSON.stringify(self.lineArray[self.curLine].shapes));
					for(var s in self.lineArray[self.curLine].shapes){
						if(!self.lineArray[self.curLine].shapes[s]) continue;
						shps.push(self.lineArray[self.curLine].shapes[s]);
					}
				$("body:first").trigger("loadItems",[shps]);
				// }
				$("body:first").trigger("TranscriptLineSelected",[id]);
				// $("body:first").trigger("addLink",[{id:self.lineArray[self.curLine].id,type:"lines"}]);
			} else {
				// hopefully won't reach this
				return;
			}
			
		},
		// called when a line Object is no longer active - resets ActiveBox
		// index : {Integer} represents index in lineArray
		_lineDeSelected:function(index){
			var self=this;
			self.curLine=null;
			$("body:first").trigger("TranscriptLineSelected",[null]);
		},
		// Returns the current lineArray - not full manifest
		// return: lineArray : {Object}
		exportLines:function(){
			var self=this;
			return self.lineArray;
		},
		// Returns full manifest of lineArrays
		//getting manifest from TILE_ENGINE
		// manifest : {Object} passed manifest object from TILE_ENGINE
		bundleData:function(manifest){
			var self=this;
			//take manifest and merge with Transcript manifest
			for(url in manifest){
				if(self.manifest[url]){
					
					// if(__v) console.log("bundleData in Transcript: TR.manifest[url]: "+JSON.stringify(self.manifest[url]));
					
					manifest[url].lines=self.manifest[url];
					// if(__v) console.log("bundleData in Transcript: manifest[url]: "+JSON.stringify(manifest[url].lines));
				}
			}		
			return manifest;
		}
		
	}
	
	);})(jQuery, Raphael, _);

	// Plugin Wrapper
	
	var Trans={
		id:"Transcript1000",
		start:function(engine){
			var self=this;
			
			
			var clickTrans=function(e){
				e.preventDefault();
				if($(this).hasClass('active')) return;
				
				$(".menuitem > ul > li > .btnIconLarge").removeClass('active');
				$(this).addClass('active');
				self.restart();
			};
			
			// var text=data.lines;
			self.transcript=new Transcript({text:[],loc:'logbar_list'});
			// insert the HTML into the interface
			var html='<div id="tile_toolbar" class="toolbar"><div class="menuitem pluginTitle">Transcript Lines</div></div><div id="logbar_list" class="az"></div>';
			engine.insertModeHTML(html,'log','Image Annotation');
			// insert button
			engine.insertModeButtons('<div class="menuitem"><ul><li><a id="L579" class="btnIconLarge getTrans" title="Activate Transcript Mode">Activate Transcript Mode</a></li></ul></div>','log','Image Annotation');
			
			// if no other active buttons, then this one is active
			if(!$("#tile_toolbar > .menuitem > ul > li > a").hasClass('active')){
				$("#L579").addClass('active');
			}
			
			$("#L579").live('click',clickTrans);
			
			// self.linkManifest=[];
			// 		// set up linkManifest
			// 		for(var url in data){
			// 			self.linkManifest[url]=[];
			// 		}
			
			// trnsClick handler
			var _trnsClickHandle=function(e,id){
				var obj={id:id,type:'lines',jsonName:TILEPAGE,display:$("#"+id).text().substring(0,10),obj:{id:id,type:'lines'}};
				engine.setActiveObj(obj);
			};
			
			
			$("body").live("TranscriptLineSelected",{obj:self},_trnsClickHandle);
			// listens for when a user de-selects a line
			$("body").bind("lineDeselected",{obj:self},function(e,obj){
				// send a blank array - thus deleting all items on canvas
				$("body:first").trigger("loadItems",[[]]);
			});
			$("body").bind("removeTransLink",{obj:self},function(e,data){
				data.parentTool=self.id;
				
				// find link in manifest
				var url=TILEPAGE;
				for(var x in self.linkManifest[url][data.parentObj]){
					if(data.id==self.linkManifest[url][data.parentObj][x].id){
						data.tool=self.linkManifest[url][data.parentObj][x].tool;
					}
				}
				
				$("body:first").trigger(self.deleteCall,[data]);
			});
			
			
			
			
			
			// insert title into plugin area
			$("#tile_toolbar > .pluginTitle").text("Transcript Lines");
			
			// bind ENGINE events
			$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
			$("body").live("newActive",{obj:self},self.newActiveHandle);
			$("body").live("newJSON newPage",{obj:self},self.newJSONHandle);
			// $("body").live("newPage",{obj:self},self.newJSONHandle);
			
			// check to see if data already loaded
			var data=engine.getJSON(true);
			if(data){
				var text=[];
				if(data&&(data.lines)){
					// parse out data
					for(var line in data.lines){
						if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
						text.push(data.lines[line]);
					}
				}
				self.transcript.loc.empty();
				// insert new page into Transcript
				self.transcript._insertLines(text);

				self.transcript._drawText();
			}
		},
		dataAddedHandle:function(e,o){
			var self=e.data.obj;
			
			
		},
		newActiveHandle:function(e,o){
			var self=e.data.obj;
			
			// all lines deactivated
			$(".line_selected").removeClass("line_selected");
			// check to see if activeItems contain ID for 
			// lines
			for(var prop in o.activeItems){
				
				if((!o.activeItems[prop])||(o.activeItems[prop]=='undefined')||(!o.activeItems[prop].id)) continue;
				if(__v) console.log("transcript activeItem "+prop+": #"+JSON.stringify(o.activeItems[prop]));
				if(/line/.test(o.activeItems[prop].id)){
					
					if(__v) console.log("active handle in transcript: #"+o.activeItems[prop].id);
					// line in DOM;
					// set line as active 
					$("#"+o.activeItems[prop].id).addClass('line_selected');
				}
			}
			
			
		},
		newJSONHandle:function(e,o){
			var self=e.data.obj;
			// get current page
			var data=o.engine.getJSON(true);
			var text=[];
			if(data&&(data.lines)){
				// parse out data
				for(var line in data.lines){
					if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
					text.push(data.lines[line]);
				}
			}
			$("#az_log > #az_transcript_area > #logbar_list").empty();
			// insert new page into Transcript
			self.transcript._insertLines(text);

			self.transcript._drawText();

			for(var a in o.activeItems){
				var id=o.activeItems[a].id;
				if($("#"+id+".line").length){
					$("#"+id+".line").addClass('line_selected');
				}
			}
			
		},
		// being passed a copy of the engine
		loadJSON:function(engine,activeItems){
			var self=this;
			// get current page
			var data=engine.getJSON(true);
			if(__v) console.log("new transcript data: "+JSON.stringify(data));
			var text=[];
			if(data&&(data.lines)){
				// parse out data
				for(var line in data.lines){
					if((!(data.lines[line]))||(typeof(data.lines[line])=='undefined')) continue;
					text.push(data.lines[line]);
				}
			}
			self.transcript.loc.empty();
			// insert new page into Transcript
			self.transcript._insertLines(text);
			
			self.transcript._drawText();
			
			for(var a in activeItems){
				var id=activeItems[a].id;
				if($("#"+id+".line").length){
					$("#"+id+".line").addClass('line_selected');
				}
			}
			
		},
		unActive:function(){
			var self=this;
			// $("#transcript_toolbar > p").remove();
			// $("#transcript_toolbar").append("<p>Double Click Here to Activate Lines Again.</p>");
			// remove span tags
			$(".line").children("span").remove();
			self.transcript.loc.empty();
			self.transcript._drawText();
			$(".line").each(function(i,o){
				// $(o).children("span").children(".button").hide();
				$(o).unbind("mousedown");
				$(o).unbind("mouseover");
				
				
			}).removeClass("line_selected");
		},
		_trnsClickHandle:function(e,id){
			var self=e.data.obj;
			$("body:first").trigger(self.activeCall,[self.id,{id:id,type:'lines',jsonName:$("#srcImageForCanvas").attr('src'),display:$("#"+id).text().substring(0,10),obj:{id:id,type:'lines'}}]);
			
		},
		getLink:function(){
			var self=this;
			// get selected line, if none selected, stop
			if(!($(".line_selected").length)) return false;
			
			var line=$(".line_selected").attr("id");
			var txt=$("#"+line).text().substring(0,10)+"...";
			// return the currently selected line
			return {"type":"lines","id":line,jsonName:$("#srcImageForCanvas").attr('src'),display:txt,obj:{id:line,type:'lines'}};
		},
		inputData:function(data){
			var self=this;
			
			var url=$("#srcImageForCanvas").attr('src');
		
			if(!self.linkManifest[url]) self.linkManifest[url]=[];
			if(data.lines){
				// adding an array of lines
				self.transcript._addLines(data.lines);
				return;
			} else if($(".line_selected").length){
				if(!self.linkManifest[url][data.obj.id]){
					self.linkManifest[url][data.obj.id]=[data.ref];
				} else {
					for(var x in self.linkManifest[url][data.obj.id]){
						if(data.ref.id==self.linkManifest[url][data.obj.id][x].id){
							return;
							break;
						}
					}
					self.linkManifest[url][data.obj.id].push(data.ref);
				}
				if(__v) console.log("transcript adding new link: "+JSON.stringify(data.ref));
				self.transcript._addLinkHandle(data.ref,data.obj);
				return true;
			} else {
				return;
			}
		},
		removeData:function(data,line){
			var self=this;
			if(__v) console.log("removeData Transcript data: "+JSON.stringify(data)+", line: "+line);
			if(data.type=='lines') return;
			if(line.id) line=line.id;
			self.transcript._deleteLinkHandle(data,line);
		},
		restart:function(){
			var self=this;
			$(".line").unbind();
			self.transcript.loc.empty();
			self.transcript._drawText();
			
			if(!$("#getTrans").hasClass('active')) $("#getTrans").addClass('active');
			
			// $("body:first").trigger(self.activeCall,[self.id]);
		},
		close:function(){
			var self=this;
			// $("body:first").trigger(self._close);
		},
		bundleData:function(json){
			var self=this;
			// Make a copy of the passed JSON
			var jcopy=$.extend(true,{},json);
					
			json=self.transcript.bundleData(jcopy);
			return json;
		}
	};