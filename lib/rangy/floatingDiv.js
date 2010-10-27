(function($){
	rootNS = this;
	
	FloatingDiv = function(){
		var self = this;
		this._color = "#FDFF00";
		this._selections = [];
	};
	FloatingDiv.constructor = FloatingDiv;
	FloatingDiv.prototype = {};
	
	$.extend(FloatingDiv.prototype, {
		
		
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
		
		
		
		
		
		init: function(myID) {
			// remove any dups
			$('#'.myID).empty().remove();		
			
			var htmlString;
			
			htmlString = '<fieldset>' +
			'<ol class="formOL">' +
			'<li class="formLI cloneMe">' +
				'<span class="formLabel">Label:</span>' +
				'<input id="formLabel1" name="Label1" type="text" class="tagComplete" />' +
				' &nbsp; <img src="images/add.png" title="Add up to 5 Labels" name="Add up to 5 Labels" id="btnAddLabel">' +
				'<img style="margin-left: 1px; visibility: hidden;" src="images/delete.png" title="Delete last label" name="Delete last label" id="btnDeleteLabel">' +
				'&nbsp; <span style="font-size: 0.7em;">(Add/Delete Labels)</span>' +
			'</li>' +
			'</ol>' +
			'</fieldset>' +
			'<br />' +
			'<input name="highLightID" type="hidden" id="highlightID" value="" />'+		
			'<input name="Color" type="hidden" id="CINATnoteColor" value="" />' +		

			$('<form></form>')
				.attr({ 
					'id':myID, 
					'name':'TILE Label', 
					'class':'addLabelForm'
				})
				.html(htmlString)
				.appendTo('body')
				.hide();	
		},
		
		
		createDialog:function(myID) {
			var self = this;
			
			// get id from object
			var elem = '#'.myID;
			
			//create dialog from passed element with passed title
			$(elem).dialog({
				autoOpen: false,
				bgiframe: true,
				resizable: false,
				title: name,
				position: 'top',
				persist: false,
				width: 350,
				closeOnEscape: true,
				beforeclose: function(event, ui) { 
					// listener?
				},
				close: function(event, ui) { 
					$(elem).dialog('destroy');
					$(elem).empty().remove();
					return null;
				}				
			})	
		},	
		

		addAutoComplete: function(elem, labels) {
			var self = this;
			
			$CINATjq(elem).autocomplete({
		
				source: function(req, add){
		
						//pass request to server
						$CINATjq.getJSON(myUrl + "?callback=?", req, function(data) {
		
							//create array for response objects
							var tags = [];
		
							//process response
							$CINATjq.each(data, function(i, val){
								tags.push(val.title);
							});

						//pass array to callback
						add(tags);
					});
				}			
			});
						
			return false;	
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
	
		
		
	});
	
	rootNS.FloatingDiv = FloatingDiv;
})(jQuery);


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
//   "EndChild": "child in focus Node",
// 	 "color": "hex color"
// }



