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
		this.curLine = null;
		this.curUrl=null;
		
		//global bind for when a shape is drawn in VectorDrawer
		$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
		//global bind for when user clicks to delete a shape item in ActiveBox
		$("body").bind("deleteItem",{obj:this},this._deleteItemHandle);
		//global bind for when a shape is changed in VectorDrawer (dragged/resized)
		$("body").bind("shapeChanged",{obj:this},this._updateItemHandle);
		
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		// Fills in the Transcript box with transcript lines, 
		// as received from the JSON data put into lineArray
		_drawText: function(){
			var self=this;
			//if(!self.lineArray["links"]) self.lineArray["links"]=[];
			for (var i = 0; i < this.lineArray.length; i++) {
				var randD=new Date(); 
				var uid = "TILE_Transcript_" + i;
			
				if(!this.lineArray[i]) continue;
				//this.lineArray[i]=eval("("+this.lineArray[i]+")");
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
			
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo(self.loc).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10); 
					
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
					if ($(this).hasClass("line_selected")){
						//line is being de-selected
						$(this).removeClass("line_selected");	
						self._lineDeSelected(index);
					} else{
						$(".line_selected").removeClass("line_selected");
						
						$(this).addClass("line_selected");
						self._lineSelected(index);
					}
				});
			}
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
				if(self.curUrl) self.manifest[self.curUrl].lines=self.lineArray;
				//new manifest area being created
				if(!self.manifest[url]) {
					self.manifest[url]={
						"lines":[],
						"url":url
					};
				}
				self.curUrl=url;
			}
			self.lineArray=data;
			self.manifest[self.curUrl].lines=self.lineArray;
			self.loc.empty();
			self._drawText();
		},
		//called when shapeDrawn is triggered
		// e : {Event}
		// data : {Object} JSON data for VectorDrawer shape(s)
		_shapeDrawnHandle:function(e,data){
			var self=e.data.obj;
			if(self.lineArray[self.curLine]==null){
				//delete shape - no line selected
				$("body:first").trigger("VD_REMOVESHAPE",[data.id]);
				return;
			}
			
			self.lineArray[self.curLine].shapes.push(data);
			self._lineSelected(self.curLine);
			//$("body:first").trigger("UpdateLine",JSON.stringify(this.lineArray[index]));
		},
		//called when a user clicks to delete an item in ActiveBox
		// e : {Event}
		// id : {String} ID representing shape or object being deleted
		_deleteItemHandle:function(e,id){
			var self=e.data.obj;
			//first need to find the shape
 			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				$("body:first").trigger("VD_REMOVESHAPE",[id]);
				return;
			}
			for(s in self.lineArray[self.curLine].shapes){
				if(self.lineArray[self.curLine].shapes[s].id==id){
					//found shape
					$("body:first").trigger("VD_REMOVESHAPE",[id]);
					self.lineArray[self.curLine].shapes[s]=null;
					self.lineArray[self.curLine].shapes=$.grep(self.lineArray[self.curLine].shapes,function(o){
						return ($(o)!=null);
					});
				}
			}
			
			
		},
		//called when a user changes something on an item attached to a line 
		//right now only works for shapes
		// e : {Event}
		// shapes : {Object} Array of JSON objects representing VectorDrawer Shapes
		_updateItemHandle:function(e,shapes){
			var self=e.data.obj;
			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				$("body:first").trigger("VD_REMOVESHAPE",[shape.id]);
				return;
			}
			self.lineArray[self.curLine].shapes=shapes;
			$("body:first").trigger("TranscriptLineSelected",JSON.stringify(self.lineArray[self.curLine]));
		},
		//called when a line object is selected
		//users can select on or multiple lines
		// index : {Integer} represents index in lineArray
		_lineSelected:function(index){
			var self=this;
		 
			if(self.lineArray[index]) {
				self.curLine=index;
				//clear all shapes
				$("body:first").trigger("clearShapes");
				//load any shapes from curLine
				if(self.lineArray[self.curLine].shapes.length>0){
					$("body:first").trigger("loadShapes",[self.lineArray[self.curLine].shapes]);
				}
				$("body:first").trigger("TranscriptLineSelected",JSON.stringify(self.lineArray[index]));
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
		// 
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
	}
	);})(jQuery, Raphael, _);
