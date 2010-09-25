(function($,rangy){
	rootNS = this;
	TextSelector = function(){
		var self = this;
		this._color = "#666666";
		this._selections = [];
	}
	TextSelector.constructor = TextSelector;
	TextSelector.prototype = {};
	$.extend(TextSelector.prototype, {
		
		getSelectedText:function(){
				var self = this;
				var selObj = new Array();
				
				//var range = rangy.createRange();
				var sel = rangy.getSelection();
				var startChildren = self._getChildNumber(sel.anchorNode);
				var endChildren = self._getChildNumber(sel.focusNode);
				
				selObj = {
					'id': "uniqueId", // replace me 
					'StartParent' : $(sel.anchorNode.parentNode).getPath(),
					//.parentNode.id,
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
				//	 "EndParent": "Id of focus parent",
				//   "EndOffset": "focus offset",
				//   "EndChild": "child in focus Node" 

				return selObj;
			 	
		},
		_getIndexOfId: function(selId){
			for (var i=0;i<this._selections.length;i++){
				if (this._selections[i].id=selId){
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
                	/*$.each(children, function(index, value) {
						
                		if(children.eq(index)[0].isSameNode(obj)) {
							alert("gotcha "+index);
                			return index;	
                		}
                	});
                	return null;
                }
                return null;	*/		
		},
		changeSelectionColor:function(selId,color){
			// get selection object from this._selections
			// by selId.  For now, I've created a fake one.
				
			
		},
		changePenColor:function(color){
			// From now on, highlight in Color
			this._color = color;
		},
	
		addSelection: function(selObj){
			// adds a selection object to this._selections
			// and adds highlight span (each with a class
  			// name unique to this selection).  CSS should 
			// turn the background-color of this class to 
			// this._color  
		},
		removeSelection: function(selId){
			// removes selection object from array
			// and drops all highlight spans  
		},
		exportSelections: function(){
			// returns JSON object of this._selections
		},
		importSelections: function(JSONobj){
			/* assigns a JSON object of selections (like that 
			   returned by exportSelections) to this._selections
			   Then add colors to each */
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
		},
		addHighlightMarkers: function(){
			/*
			 * adds highlight markers for all selections in 
			 * this._selections
			 */
		}
	});
	rootNS.TextSelector = TextSelector;
})(jQuery,rangy)
