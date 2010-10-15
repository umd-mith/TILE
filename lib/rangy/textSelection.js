(function($,rangy){
	rootNS = this;
	TextSelector = function(){
		var self = this;
		this._color = "#FDFF00";
		this._selections = [];
	};
	TextSelector.constructor = TextSelector;
	TextSelector.prototype = {};
	$.extend(TextSelector.prototype, {
		
		
		_showSelectionObject: function(){
			var self = this;
			return this._selections;
		},	
		
		_checkForID: function(objID){
			for (var i=0;i<this._selections.length;i++){
				if (this._selections[i].id==objID){
					return false;
				}
			}
			return true;
		},			
		
		getSelectedText:function(){
				var self = this;
	
				//var range = rangy.createRange();
				var sel = rangy.getSelection();
				if(!sel.anchorNode) return null;
				var startChildren = self._getChildNumber(sel.anchorNode);
				var endChildren = self._getChildNumber(sel.focusNode);
				
				var startParent = $(sel.anchorNode.parentNode).getPath();
				var endParent = $(sel.focusNode.parentNode).getPath();
				
				var uniqueID = self._getUniqueId({length:8, prefix:"anno_"});
				
					
				selObj = {
					'id': uniqueID,
					'StartParent' : $(sel.anchorNode.parentNode).getPath(),
					'StartOffset' : sel.anchorOffset,
					'StartChild' : startChildren,
					'EndParent' : $(sel.focusNode.parentNode).getPath(),
					'EndOffset' : sel.focusOffset,
					'EndChild' : endChildren,
					'color': this._color
				};
	
				// Returns selection object 
				// of the following type:
				// { 
				//  "id": unique  
				//	"StartParent": "Id of anchor parent",
				//   "StartOffset": "anchor offset"
				//   "StartChild": "child in anchorNode",
				// 
				//	 "EndParent": "Id of focus parent",
				//   "EndOffset": "focus offset",
				//   "EndChild": "child in focus Node" 
				// }

				return selObj;
			 	
		},
		_getUniqueId:  function(o) {
				// http://www.sitepoint.com/forums/showthread.php?t=318819
				// changed a bit to receive prefix and length
				o.prefix = (typeof o.prefix == 'undefined') ? "anote_" : o.prefix;
				o.length = (typeof o.length == 'undefined') ? 8 : o.length;
				
				function getRandomNumber(range)	{
					return Math.floor(Math.random() * range);
				}
				
				function getRandomChar() {
					var chars = "0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ";
					return chars.substr(getRandomNumber(62), 1);
				}
				
				function randomID(length)	{
					var str = "";
					for(var i = 0; i < length; i++) {
						str += getRandomChar();
					}
					return str;
				}
				
				return o.prefix + randomID(o.length); /// returns length of 8

		},
		
		_getIndexOfId: function(selId){
	
			for (var i=0;i<this._selections.length;i++){
				if (this._selections[i].id == selId){
					return i;
				}
			}
			return null;
		},
		
		_getPathToNode: function(node){
			path = "";
			
			if (node.id){
				return "#"+node.id;
			}
			else{
				var childNo=this._getChildNumber(node,node.nodeName);
				
				path=">*:eq("+childNo+")";
				while(node.parentNode){
					node = node.parentNode;
					if (node.id){
						return "#"+node.id+path;
					}
					else{
						var childNo=this._getChildNumber(node,node.nodeName);
						
						if (childNo) {
							path = ">*:eq(" + childNo + ")" + path;
						}
						else{
							return node.nodeName+path;
						}
					}
				}
				return node.nodeName+":"+path;
			}
			
		},

		_getChildNumber: function(obj){
			if (obj.parentNode) {
				var children = obj.parentNode.childNodes;
				var num;
				for (var i = 0; i < children.length; i++) {
					if (children[i].isSameNode(obj)) {
						
						return i;
					}
				}
			}
			
			return null;
		},
		
		_rgb2hex: function(rgb) {
			
			// from http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				function hex(x) {
					return ("0" + parseInt(x,10).toString(16)).slice(-2);
				}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
		
		_addColorSelector: function(selId) {
			// add the color selector to each highlight
			// add onclick behavior to show
			var self = this;
			var selectorHTML = '<div id="colorSelector1" style="display:inline-block;"><div style="display: inline-block; background-color: rgb(210, 212, 0);"></div></div>';
			// can't use .last() or .first()
			if($('span.'+selId).length>1){
				// attach to first
				$('span.'+selId+"eq:("+($('span.'+selId).length-1)+")").append(selectorHTML);
			} else {
				$('span.'+selId).append(selectorHTML);
			}
		
			
			var currColor = $('span.'+selId).css('background-color');
			currColor = this._rgb2hex(currColor);
			
			$('span.'+selId).ColorPicker({			
					color: currColor,
					onShow: function (colpkr) {
						$(colpkr).fadeIn(500);
						return false;
					},
					onHide: function (colpkr) {
						$(colpkr).fadeOut(500);
						return false;
					},
					onChange: function (hsb, hex, rgb) {
						$('span.'+selId).css('background-color', '#'+hex);
						self.changeSelectionColor(selId, hex);
						
						
					}
				});
			
		},
		changeSelectionColor:function(selId,hexcolor){
			// get selection object from this._selections
			// by selId.  
			var self = this;
			self._selections[self._getIndexOfId(selId)].color = '#'+hexcolor;		
				
			
		},
		
		changePenColor:function(color){
			// From now on, highlight in Color
			this._color = color;
			return true;
		},
	
		addSelection: function(JSONobj){
			// adds a selection object to this._selections
			// and adds highlight span (each with a class
  			// name unique to this selection).  CSS should 
			// turn the background-color of this class to 
			// this._color  
			var self = this;
			
			if (this._checkForID(JSONobj.id)) {	
				this._selections[this._selections.length] = JSONobj;  // add the selObj to the _selections holder
				this.addHighlightMarkers(JSONobj);
			
				this._addColorSelector(JSONobj.id); /// add color selector 
			}

			return true;
		},
		removeSelection: function(selId){
			// removes selection object from array
			// and drops all highlight spans  
			
			
		},
		exportSelections: function(){
			// returns JSON object of this._selections
			var self = this;
			
			var encoded = $.toJSON(this._selections);  
			return encoded;
			
			
		},
		importSelections: function(selObj){
			/* assigns a JSON object of selections (like that 
			   returned by exportSelections) to this._selections
			   Then add colors to each */
			   
			var self, win;
							
			self = this;
			win = window;
			
			selObj.reverse();
			// if(console) console.log("import selections receives highlights: "+selObj+" [0]: "+selObj[0]);
			for (var i in selObj) {
				this.addHighlightMarkers(selObj[i]);
				this._addColorSelector(selObj[i].id); /// add color selector 
				//console.log(JSONobj[i]);
			}			
		   
		},
		clearSelections: function(){
			/*  empties this._selections
			 *  and removes all highlight markers
			 */
			this._selections = [];
			this.removeHighlightMarkers();
			return true;
		},
		removeHighlightMarkers: function(){
			/*  
			 *  removes all highlight markers
			 *  but keeps this._selections unchanged
			 *  
			 */		
	 
			/* remove highlights  */
			$('span[class^="anno_"]').each(function() {
				var parentNode = $(this).parent();
			
				$(this).before($(this).html()).remove();
				
				parentNode[0].normalize(); // we have to normalize because the <span> highlights separate the text node!
			});
			
			
			

			 return true;
			 
			 
		},
		addHighlightMarkers: function(JSONobj){
			/*
			 * adds highlight markers for new selections
			 */
			 
			var self, win, addTo, start, end, range, startSide, endSide, ancestor, flag, done, node, tmp;
							
			self = this;
			win = window;
			
			const record = {offsetY:Number.NaN, firstNode:null, lastNode:null};  // record object
			
			// create span wrapper
			const wrap = window.document.createElement("SPAN");
			wrap.style.backgroundColor = JSONobj.color;	
			wrap.className = JSONobj.id;	
			wrap.title = 'highlighter';	
						
			const _createWrapper = function(n) {   // wrapper
				var e = wrap.cloneNode(false);
			
				if(!record.firstNode) { record.firstNode = e; }
				if(record.lastNode) { record.lastNode.nextHighlight = e; }
				record.lastNode = e;
				
				var offset = $(n.parentNode).offset();
				var posTop = offset.top;
				var pageTop = parseInt(win.pageYOffset,10);
				if(!posTop || posTop < pageTop) {
					record.offsetY = pageTop;
				} else {
					if(!(posTop > record.offsetY))record.offsetY = posTop;
				}
				
				return e;
			};				
			
		
			// get jQuery object using CSS path
			start = $(JSONobj.StartParent);
			end = $(JSONobj.EndParent);		
			
			//console.log(start);
			//console.log(end);
						
				/* set range for obj */
				var sNode = start[0].childNodes.item(JSONobj.StartChild);
				var eNode = end[0].childNodes.item(JSONobj.EndChild);
				
				range = document.createRange(); // create new range from selObj
				range.setStart(sNode, JSONobj.StartOffset);
				range.setEnd(eNode, JSONobj.EndOffset);
			
			
			startSide = range.startContainer;
			endSide = range.endContainer;				
			ancestor = range.commonAncestorContainer;
			flag = true;				

			
			if(range.endOffset == 0) {  //text | element
				while(!endSide.previousSibling && endSide.parentNode != ancestor) {
					endSide = endSide.parentNode;
				}
				endSide = endSide.previousSibling;
			} else if(endSide.nodeType == Node.TEXT_NODE) {
				if(range.endOffset < endSide.nodeValue.length) {
					endSide.splitText(range.endOffset);
				}
			} else if(range.endOffset > 0) { // element
				endSide = endSide.childNodes.item(range.endOffset - 1);
			}				
			
			
			if(startSide.nodeType == Node.TEXT_NODE) {
				if(range.startOffset == startSide.nodeValue.length) {
					flag = false;
				} else if(range.startOffset > 0) {
					startSide = startSide.splitText(range.startOffset);
					if(endSide == startSide.previousSibling) { endSide = startSide; }
				}
			} else if(range.startOffset < startSide.childNodes.length) {
				startSide = startSide.childNodes.item(range.startOffset);
			} else {
				flag = false;
			}				
			
			
			range.setStart(range.startContainer, 0);
			range.setEnd(range.startContainer, 0);
			
			done = false;
			node = startSide;
			
			do {
				if(flag && node.nodeType == Node.TEXT_NODE && !((tmp = node.parentNode) instanceof HTMLTableElement || tmp instanceof HTMLTableRowElement || tmp instanceof HTMLTableColElement ||	tmp instanceof HTMLTableSectionElement)) {
					var myWrap = node.previousSibling;
					if(!myWrap || myWrap != record.lastNode) {
						myWrap = _createWrapper(node);
						node.parentNode.insertBefore(myWrap, node);
					}
					
					myWrap.appendChild(node);
					node = myWrap.lastChild;
					flag = false;
				}
			
				if(node == endSide && (!endSide.hasChildNodes() || !flag)) {
					done = true;
				}
			
				if(node instanceof HTMLScriptElement || node instanceof HTMLStyleElement ||	node instanceof HTMLSelectElement) {  //never parse their children
					flag = false;
				}
			
			
				if(flag && node.hasChildNodes()) {
					node = node.firstChild;  //dump("-> firstchild ");
				
				} else if(node.nextSibling != null) {
					node = node.nextSibling;  //dump("-> nextSibling ");
					flag = true;
				
				} else if(node.nextSibling == null) {
					node = node.parentNode;  //dump("-> parent ");
					flag = false;
				}
				//if(node == ancestor.parentNode)dump("\nHALT shouldn't face ancestor");
			} while(!done);	
			
			range.detach(); // detach range			 
			 
		}
	});
	rootNS.TextSelector = TextSelector;
})(jQuery,rangy);

// Text Selection Plugin Code
// Functions:
// start()
// restart()
// bundleData()
// close()
// Variables:
// _close
// json

var TS={
	id:"TS1000",
	start:function(e,json,layout){
		var self=this;
		self.textsel=new TextSelector();
		self.manifest=[];
		self.activeSel="";
		self.curLink=null;
		if(json){
			for(j in json){
				self.manifest[j]=[];
				if(json[j].selections) self.manifest[j]=json[j].selections;
			}
		}
		
		// set up the tool buttons and insert into 
		// TILE interface
		// append html
		$("<div class=\"menuitem\"><ul><li><input type=\"button\" value=\"Highlight\" id=\"getHLite\" class=\"button\"/></li></ul></div>").appendTo($("#transcript_toolbar"));
		// getText button
		self.getHLite=$("#getHLite").bind('click',function(e){
			e.stopPropagation();
			var url=$("#srcImageForCanvas").attr('src');
			// de-select all transcript lines
			$(".line_selected").removeClass("line_selected");
			// clear all other highlights - will come back if they are saved
			// into the manifest
			$("span[class^=anno]").each(function(){
				$(this).children(".button").remove();
				$(this).children("div").remove();
			});
			
			self.textsel.clearSelections();
			
			var sel=self.textsel.getSelectedText();
			if(sel==null) return;
			// make sure it's not highlighting the whole page
			if(!(/div\#TILE\_Transcript\_/.test(sel.StartParent))){
				return;
			}
			
			// show on screen
			self.textsel.addSelection(sel);
			if(!self.manifest[url]) self.manifest[url]=[];
			self.manifest[url].push(sel);
			// find span tag and attach buttons
			self.attachButtons(sel.id);
			// if($("span."+sel.id).length>1){
			// 				$("<span id=\"select_"+sel.id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+sel.id+"\" class=\"button\">Delete</span>").appendTo($("span."+sel.id+":eq("+($("span."+sel.id).length-1)+")"));
			// 			} else {
			// 				$("<span id=\"select_"+sel.id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+sel.id+"\" class=\"button\">Delete</span>").appendTo($("span."+sel.id));
			// 			}
			// 			
			// 			$("span."+sel.id+" > #colorSelector").addClass("btnIconLarge");
			// 			$("span."+sel.id).mouseover(function(e){e.stopPropagation();});
			// 			// selector
			// 			$("#select_"+sel.id).click(function(e){
			// 				e.stopImmediatePropagation();
			// 				$(".line_selected").removeClass("line_selected");
			// 				$("span[title='highlight']").removeClass("active");
			// 				$("span."+sel.id).addClass("active");
			// 				self.activeSel=sel.id;
			// 			});
			// 			$("#deleteHLite"+sel.id).click(function(e){
			// 				$(this).parent().removeClass("active");
			// 				var id=$(this).parent().attr('class');
			// 				var url=$("#srcImageForCanvas").attr('src');
			// 				for(sh in self.manifest[url]){
			// 					if(self.manifest[url][sh].id==id){
			// 						self.manifest[url][sh];
			// 						self.manifest[url][sh]=null;
			// 						if(self.manifest[url].length>1){
			// 							var ac=self.manifest[url].slice(0,sh);
			// 							var bc=self.manifest[url].slice((sh+1));
			// 							self.manifest[url]=ac.concat(bc);
			// 						} else {
			// 							self.manifest[url].length=0;
			// 						}
			// 						break;
			// 					}
			// 				}
			// 				$("span."+sel.id+" > div").remove();
			// 				$("span."+sel.id+" > .button").remove();
			// 				self.textsel.removeHighlightMarkers();
			// 				// self.textsel.importSelections(self.manifest[url]);
			// 				
			// 			});
			// make active
				self.activeSel=sel.id;
			// attach any current divs for references
			self._attachLinkDiv(self.curLink);
			$("body:first").trigger("addLink",[{id:sel.id,type:"selections"}]);
			
			$("body > .colorpicker").css({"z-index":"9999"});
		});
	
		// bind addLink
		$("body").bind("addLink",{obj:self},self.addLinkHandle);
		// global bind for when a user clicks on object that loads items
		$("body").bind("loadItems",{obj:self},self._loadItemsHandle);
	},
	attachButtons:function(id){
		var self=this;
		
		// $("span[class^=anno]").each(function(i,o){
		// 			var id=$(o).attr('class');
			// find span tag and attach buttons
		if($("span."+id).length>1){
			$("<span id=\"select_"+id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id+":eq("+($("span."+id).length-1)+")"));
		} else {
			$("<span id=\"select_"+id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id));
		}
		
		
		
		// selector
		$("#select_"+id).click(function(e){
			e.stopImmediatePropagation();
			$(".line_selected").removeClass("line_selected");
			$("span[title='highlight']").removeClass("active");
			$("span."+id).addClass("active");
			self.activeSel=id;
		});
		$("#deleteHLite"+id).click(function(e){
			$(this).parent().removeClass("active");
			var id=$(this).parent().attr('class');
			var url=$("#srcImageForCanvas").attr('src');
			for(sh in self.manifest[url]){
				if(self.manifest[url][sh].id==id){
					self.manifest[url][sh];
					self.manifest[url][sh]=null;
					if(self.manifest[url].length>1){
						var ac=self.manifest[url].slice(0,sh);
						var bc=self.manifest[url].slice((sh+1));
						self.manifest[url]=ac.concat(bc);
					} else {
						self.manifest[url].length=0;
					}
					break;
				}
			}
			$("span."+id+" > div").remove();
			$("span."+id+" > .button").remove();
			self.textsel.removeHighlightMarkers();
			// self.textsel.importSelections(self.manifest[url]);

		});
	
		// attach any current divs for references
		self._attachLinkDiv(self.curLink);
		
		// });
		
		// $("body:first").trigger("addLink",[{id:self.activeSel,type:"selections"}]);
		$("body > .colorpicker").css({"z-index":"9999"});
	},
	// e : {Event}
	// ref : {Object} reference object that has two properties:
	//      id: {String} id of  reference
	//      type: {String} type of reference
	addLinkHandle:function(e,ref){
		if((ref.type=='lines')||(ref.type=='selections')) return;
		var self=e.data.obj;
		var url=$("#srcImageForCanvas").attr('src');
		if(!self.manifest[url]) self.manifest[url]=[];
		// put in manifest
		for(m in self.manifest[url]){
			if(self.manifest[url][m].id==self.activeSel){
				if(self.manifest[url][m][ref.type]){
					if($.inArray(ref.id,self.manifest[url][m][ref.type])<0){
						self.curLink=ref;
						// add to array
						self.manifest[url][m][ref.type].push(ref.id);
						self._attachLinkDiv(ref);
						$("body:first").trigger("addLink",[{id:self.manifest[url][m].id,type:'selections'}]);
						
					}
				} else {
					self.curLink=ref;
					self.manifest[url][m][ref.type]=[ref.id];
					self._attachLinkDiv(ref);
					$("body:first").trigger("addLink",[{id:self.manifest[url][m].id,type:'selections'}]);
				}
				
				break;
			}
		}
	},
	// attaches a span tag that displays reference
	_attachLinkDiv:function(ref){
		if((!ref)||(ref=="")) return;
		var self=this;
		var t=ref.type;
		// generate DOM buttons to add onto the highlight
		$("<span class=\"button\">"+ref.type+": "+ref.id+"<span id=\"del"+self.activeSel+ref.id+"\" class=\"button\">X</span></span>").appendTo($("span."+self.activeSel));
		$("#del"+self.activeSel+ref.id).click(function(e){
			e.stopImmediatePropagation();
			var url=$("#srcImageForCanvas").attr('src');
			var n=$.inArray(ref.id,self.manifest[url][t]);
			if(n<0) return;
			if(self.manifest[url][t].length>1){
				var ac=self.manifest[url][t].slice(0,n);
				var bc=self.manifest[url][t].slice((n+1));
				self.manifest[url][t]=ac.concat(bc);
			} else {
				self.manifest[url][t]=[];
			}
			if(self.curLink.id==ref.id) self.curLink=null;
			$(this).parent().remove();
			$(".line_selected").removeClass("line_selected");
			return;
		});
	},
	// e : {event}
	// data : {Object}
	_loadItemsHandle:function(e,data){
		var self=e.data.obj;
		$("span[class^='anno']").each(function(e){
			$(this).children(".button").remove();
			$(this).children("div").remove();
		});
		self.textsel.removeHighlightMarkers();
		
		if(!data||(data.length==0)) return;
		var url=$("#srcImageForCanvas").attr('src');
		var vd=[];
		for(x in self.manifest[url]){
			// if(console) console.log("self.manifest[url]["+x+"]="+self.manifest[url][x].id);
			if($.inArray(self.manifest[url][x].id,data)>=0){
				vd.push(self.manifest[url][x]);
			}
		}
		if(vd.length==0) return;
		// if(console) console.log("loading highlights from: "+vd);
		self.textsel.importSelections(vd);
		// attach buttons
		for(var v in vd){
			self.attachButtons(vd[v].id);
		}
		
	},
	restart:function(){
		
	},
	close:function(){
		var self=this;
		$("body:first").trigger(self._close);
	},
	// Insert the highlight data into the global json object
	// json: {Object} Global JSON object that has page URL's as key
	bundleData:function(json){
		var self=this;
		for(url in self.manifest){
			for(j in json){
				if(j==url){
					json[j].selections=self.manifest[url];
				}
			}
		}
	},
	_close:"CloseSelector",
	json:null
};
