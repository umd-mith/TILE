(function($,rangy){
	rootNS = this;
	TextSelector = function(){
		var self = this;
		this._color = "#FDFF00";
		this._selections = [];
	}
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
				}
	
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
					return ("0" + parseInt(x).toString(16)).slice(-2);
				}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
		
		_addColorSelector: function(selId) {
			// add the color selector to each highlight
			// add onclick behavior to show
			var self = this;
			var selectorHTML = '<div id="colorSelector" style="display:inline-block;"><div style="display: inline-block; background-color: rgb(210, 212, 0);"></div></div>';
			
			$('span.'+selId).first().append(selectorHTML);
			
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
				var pageTop = parseInt(win.pageYOffset);
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
})(jQuery,rangy)
