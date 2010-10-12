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
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		this.manifest=[];
		if(this.lineArray) {
			this._drawText();
			
		}
		this.curLine =0;
		this.curUrl=null;
		this.knownIds=[];
		
		//global bind for when a shape is changed in VectorDrawer (dragged/resized)
		// $("body").bind("shapesUpdate",{obj:this},this._updateItemHandle);
		// global bind for when all lines need to be updated
		// $("body").bind("updateAllShapes",{obj:this},this._updateAllItemsHandle);
		// global bind when items are loaded 
		$("body").bind("addLink",{obj:this},this._addLinkHandle);
		// global bind when items are deleted
		$("body").bind("deleteLink",{obj:this},this._deleteLinkHandle);
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		
		// Takes new JSON data and applies this to 
		// the lineArray and manifest variables
		// data : {Object} JSON data that is to be fed
		// url : {String} Optional url to be given - if given, a new manifest
						// object is created and fed into the manifest array
		_addLines:function(data,url){
			var self=this;
			// has url been passed?
			if(url&&(self.curUrl!=url)){
				if(self.curUrl) self.manifest[self.curUrl].lines=self.lineArray;
				//new manifest area being created
				if(!self.manifest[url]) {
					self.manifest[url]={
						"lines":[],
						"url":url
					};
					// check to make sure that new data have ids
					for(d in data){
						if(!data[d].id){
							var id="";
							id="line_"+Math.floor(Math.random()*560);
							while($.inArray(id,self.knownIds)>=0){
								id="line_"+Math.floor(Math.random()*560);
							}
							self.knownIds.push(id);
							data[d].id=id;
						}
					}
					
				}
				self.curUrl=url;
			}
			if(console) console.log("addLines receives data: "+data);
			if(!data) return;
			
			self.lineArray=data;
			
			// reset curLine
			self.curLine=0;
			// check for auto-recognized lines
			// self._setAutoLines();
			self.manifest[self.curUrl].lines=self.lineArray;
			self.loc.empty();
			self._drawText();			
		},
		// Fills in the Transcript box with transcript lines, 
		// as received from the JSON data put into lineArray
		_drawText: function(){
			var self=this;
			//if(!self.lineArray["links"]) self.lineArray["links"]=[];
			for (var i = 0; i < this.lineArray.length; i++) {
				if(!this.lineArray[i]) continue;
				
				var uid = "TILE_Transcript_" + this.lineArray[i].id;
			
				//this.lineArray[i]=eval("("+this.lineArray[i]+")");
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
			
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo(self.loc).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10); 
					
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
					if ($(this).hasClass("line_selected")){
						// de-select the line
						var id=$(".line_selected").attr('id').replace("TILE_Transcript_","");
						$(".line_selected").removeClass("line_selected");
						
						
					} else{
						$(".line_selected").removeClass("line_selected");
						var index=$(this).data("index");
						$(this).addClass("line_selected");
						self._lineSelected(index);
					}
				});
				// attach data for index value 
				$("#"+uid).data("index",i);
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
		_addLinkHandle:function(e,ref){
			if(ref.type=='lines') return;
			if(!$(".line_selected").length) return;
			var self=e.data.obj;
			if(self.curLine==null) return;
			
			// deactivate self
			// $(".line_selected").removeClass("line_selected");
			
			if(self.lineArray[self.curLine][ref.type]){
				for(x in self.lineArray[self.curLine][ref.type]){
					var item=self.lineArray[self.curLine][ref.type][x];
					if(item.id&&(item.id==ref.id)){
						return;
						break;
					}
				}
			} else {
				self.lineArray[self.curLine][ref.type]=[];
			}
			self.lineArray[self.curLine][ref.type].push(ref.id);
			$("#TILE_Transcript_"+self.lineArray[self.curLine].id).append($("<div id=\""+ref.id+"\" class=\"button\">"+ref.type+": "+ref.id+"</div><span id=\"delete_"+ref.id+"\" class=\"button\">X</span>"));
			$("#TILE_Transcript_"+self.lineArray[self.curLine].id+" > #delete_"+ref.id).click(function(e){
				e.stopPropagation();
				
				$("body:first").trigger("deleteLink",[{id:ref.id,type:ref.type}]);
				$(this).remove();
				$("#"+ref.id).remove();
			});
		
		},
		_deleteLinkHandle:function(e,ref){
			if(ref.type=="lines") return;
			if(console) console.log('goto deleteLink: '+ref.type+" "+e.data.obj.curLine);
			// if(!$(".line_selected").length) return;
			var self=e.data.obj;
			if(self.curLine==null) return;
			if(self.lineArray[self.curLine][ref.type]){
				for(x in self.lineArray[self.curLine][ref.type]){
					var item=self.lineArray[self.curLine][ref.type][x];
					if(item&&(item==ref.id)){
						// delete the referenced item
						if(self.lineArray[self.curLine][ref.type].length>1){
							var ac=self.lineArray[self.curLine][ref.type].slice(0,x);
							var bc=self.lineArray[self.curLine][ref.type].slice((x+1));
							self.lineArray[self.curLine][ref.type]=ac.concat(bc);
						} else {
							self.lineArray[self.curLine][ref.type]=[];
						}
						break;
					}
				}
			} else {
				return;
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
		
			// var sendObj={"text":self.lineArray[self.curLine].text,"info":self.lineArray[self.curLine].info};
			$("body:first").trigger("TranscriptLineSelected",JSON.stringify(self.lineArray[self.curLine]));
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
		// index : {Integer} represents index in lineArray
		_lineSelected:function(index){
			var self=this;
		 	
			if(self.lineArray[index]) {
				if(console) console.log("lineArray selected: "+index+" and it has: "+self.lineArray[index].shapes);
				//clear all shapes
				$("body:first").trigger("clearShapes");
				// change curLine
				self.curLine=index;
				//load any shapes from curLine
				if(!self.lineArray[self.curLine].shapes) self.lineArray[self.curLine].shapes=[];
				// if(self.lineArray[self.curLine].shapes.length>0){
				$("body:first").trigger("loadItems",[self.lineArray[self.curLine].shapes]);
				// }
				$("body:first").trigger("addLink",[{id:self.lineArray[self.curLine].id,type:"lines"}]);
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
					manifest[url].lines=self.manifest[url].lines;
				}
			}		
			return manifest;
		}
		// _setAutoLines:function(){
		// 			var self=this;
		// 			
		// 			if((self.manifest[self.curUrl].autoLines)&&(self.manifest[self.curUrl].autoLines.length>0)){
		// 				// lines already inserted
		// 				for(l in self.lineArray){
		// 					var count=0;
		// 					var lastLine=null;
		// 					for(sh in self.lineArray[l].shapes){
		// 					
		// 						if(self.lineArray[l].shapes[sh].id.substring(0,1)=="D"){
		// 							count++;
		// 						
		// 							if((count>1)&&lastLine){
		// 								var ac=self.lineArray[l].shapes.slice(0,lastLine);
		// 								var bc=self.lineArray[l].shapes.slice(lastLine+1);
		// 								self.lineArray[l].shapes=ac.concat(bc);
		// 								
		// 							}
		// 						}
		// 						lastLine=parseInt(sh,10);
		// 					}
		// 				}
		// 			}
		// 			// make sure there is an existing autoLines
		// 			if(!self.manifest[self.curUrl].autoLines) self.manifest[self.curUrl].autoLines=[];
		// 			
		// 			// go through linearray and put all autoLines
		// 			// as copies into manifest.autoLines
		// 			for(l in self.lineArray){
		// 				
		// 				for(sh in self.lineArray[l].shapes){
		// 					if(self.lineArray[l].shapes[sh].id.substring(0,1)=='D'){
		// 						self.manifest[self.curUrl].autoLines[l]=(self.lineArray[l].shapes[sh]);
		// 						
		// 					}
		// 				}
		// 			
		// 			}
		// 			
		// 		},
		// 		//called when shapeDrawn is triggered
		// 		// e : {Event}
		// 		// data : {Object} JSON data array for VectorDrawer shape(s)
		// 		_shapeDrawnHandle:function(e,data){
		// 			var self=e.data.obj;
		// 			if(self.lineArray[self.curLine]==null){
		// 					
		// 				if(self.lineArray.length>0){
		// 					// automatically select the first transcript line in the 
		// 					// list and apply this shape to that line
		// 					self.curLine=0;
		// 					$(".line_selected").removeClass("line_selected");
		// 					$("#TILE_Transcript_0").addClass("line_selected");
		// 					
		// 				} else {
		// 					// no lines available - delete shape and skip
		// 					for(d in data){
		// 						$("body:first").trigger("VD_REMOVESHAPE",[data[d].id]);
		// 					}
		// 					return;
		// 				}
		// 			
		// 				// var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
		// 			}
		// 			self.lineArray[self.curLine].shapes=[];
		// 			for(d in data){
		// 				// just add the ids - may need to find better method for this later
		// 				self.lineArray[self.curLine].shapes.push({'id':data[d].id});
		// 			}
		// 		
		// 			self._lineSelected(self.curLine);
		// 			//$("body:first").trigger("UpdateLine",JSON.stringify(this.lineArray[index]));
		// 		},
		// 		// User clicks on APPROVE button, then approveItem gets fired
		// 		// This handles that situation
		// 		// e : {Event}
		// 		// id : {String} UID of Object to delete
		// 		_approveItemHandle:function(e,id){
		// 			var self=e.data.obj;
		// 			if(self.manifest[self.curUrl].autoLines){
		// 				
		// 				for(x in self.manifest[self.curUrl].autoLines){
		// 					if(self.manifest[self.curUrl].autoLines[x]&&(self.manifest[self.curUrl].autoLines[x].id==id)){
		// 						self.manifest[self.curUrl].autoLines[x]=null;
		// 						for(sh in self.lineArray[x].shapes){
		// 							if(self.lineArray[x].shapes[sh].id.substring(0,1)=="D"){
		// 								self.lineArray[x].shapes[sh].color="#000000";
		// 								self.lineArray[x].shapes[sh].id=self.lineArray[x].shapes[sh].id.replace("D_","");
		// 							}
		// 						}
		// 						break;
		// 					}
		// 				}
		// 			}
		// 			//clear all shapes
		// 			// $("body:first").trigger("clearShapes");
		// 			self._setAutoLines();
		// 			
		// 			// self._lineSelected(self.curLine);
		// 		},
		// 		//called when a user clicks to delete an item in ActiveBox
		// 		// e : {Event}
		// 		// id : {String} ID representing shape or object being deleted
		// 		_deleteItemHandle:function(e,id){
		// 			var self=e.data.obj;
		// 			//first need to find the shape
		//  			if(!self.lineArray[self.curLine]){
		// 				//we hopefully don't get here
		// 				$("body:first").trigger("VD_REMOVESHAPE",[id]);
		// 				return;
		// 			}
		// 			if(id.substring(0,1)=="D"){
		// 				self._shiftAutoLines(id);
		// 				return;
		// 			}
		// 			for(s in self.lineArray[self.curLine].shapes){
		// 				if(self.lineArray[self.curLine].shapes[s]&&(self.lineArray[self.curLine].shapes[s].id==id)){
		// 					//found shape
		// 					$("body:first").trigger("VD_REMOVESHAPE",[id]);
		// 					self.lineArray[self.curLine].shapes[s]=null;
		// 					var temp=self.lineArray[self.curLine].shapes;
		// 					self.lineArray[self.curLine].shapes=[];
		// 					for(t in temp){
		// 						if(temp[t]!=null){
		// 							self.lineArray[self.curLine].shapes.push(temp[t]);
		// 						}
		// 					}
		// 				}
		// 			}
		// 			self._lineSelected(self.curLine);
		// 		},
		// _shiftAutoLines:function(id){
		// 			var self=this;
		// 			if(!self.manifest[self.curUrl].autoLines) self.manifest[self.curUrl].autoLines=[];
		// 			
		// 			var check=false;
		// 			var sid=null;
		// 			for(x in self.manifest[self.curUrl].autoLines){
		// 				
		// 				if(self.manifest[self.curUrl].autoLines[x]&&(self.manifest[self.curUrl].autoLines[x].id==id)){
		// 					$("body:first").trigger("VD_REMOVESHAPE",[id]);
		// 					
		// 					var ac=self.manifest[self.curUrl].autoLines.slice(0,x);
		// 					if(self.manifest[self.curUrl].autoLines.length>ac.length){
		// 						var bc=self.manifest[self.curUrl].autoLines.slice(parseInt(x,10)+1);
		// 						self.manifest[self.curUrl].autoLines=ac.concat(bc);
		// 					} else {
		// 						self.manifest[self.curUrl].autoLines=ac; 
		// 					}
		// 					break;
		// 				}
		// 			}
		// 			
		// 			for(l in self.lineArray){
		// 				for(sh in self.lineArray[l].shapes){
		// 					if(self.lineArray[l].shapes[sh].id.substring(0,1)=="D"){
		// 						if(self.manifest[self.curUrl].autoLines[l]){
		// 							self.lineArray[l].shapes[sh]=self.manifest[self.curUrl].autoLines[l];
		// 						} else {
		// 							var ac=self.lineArray[l].shapes.slice(0,sh);
		// 							if(self.lineArray[l].shapes.length>(parseInt(sh,10)+1)){
		// 								var bc=self.lineArray[l].shapes.slice(parseInt(sh,10)+1);
		// 								self.lineArray[l].shapes=ac.concat(bc);
		// 							} else {
		// 								self.lineArray[l].shapes=ac;
		// 							}
		// 						}
		// 					}
		// 				}
		// 			}
		// 			
		// 			self._lineSelected(self.curLine);
		// 		},
		
	}
	);})(jQuery, Raphael, _);
