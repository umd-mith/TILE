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
					'StartParent' : self._getPathToNode(sel.anchorNode),
					//.parentNode.id,
					'StartOffset' : sel.anchorOffset,
					'StartChild' : startChildren,
					'EndParent' : self._getPathToNode(sel.focusNode),
					'EndOffset' : sel.focusOffset,
					'EndChild' : endChildren
				}
	
				// Returns selection object 
				// of the following type:
				// { "StartParent": "Id of anchor parent",
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
			alert(node)
			if (node.id){
				return "#"+node.id;
			}
			else{
				var childNo=this._getChildNumber(node);
				
				path=">"+node.nodeName+":eq("+childNo+")";
				while(node.parentNode){
					node = node.parentNode;
					if (node.id){
						return "#"+node.id+path;
					}
					else{
						var childNo=this._getChildNumber(node);
						path=">"+node.nodeName+":eq("+childNo+")";
					}
				}
				return node.nodeName+":eq(0)"+path;
			}
			
		},
		_getChildNumber: function(obj){
		          if ($(obj).parent()) {
                	var children = $(obj).parent().children();
                	var num;
                	
                	$.each(children, function(index, value) {
                		if(children[index][0].isSameNode(obj)) {
                			num = index;	
                		}
                	});
                	return num;
                }
                return null;			
		},
		changeSelectionColor:function(selId,color){
			// get selection object from this._selections
			// by selId.  For now, I've created a fake one.
			
			 tmp ={ 
			   "StartParent": "one",
			   "StartOffset": "2",
			   "StartChild": "0",
		   	   "EndParent": "three",
			   "EndOffset": "3",
			   "EndChild": "2"
			  }; 
			  
			//
			endPoint = $(tmp.startPath);
			
			
		},
		changePenColor:function(color){
			// From now on, highlight in Color
			this._color = color;
		},
	
		addSelection: function(selObj){
			
		},
		removeSelection: function(selId){
			
		},
		exportSelections: function(){
			
		},
		importSelections: function(){
			
		},
		clearSelection: function(){
			
		},
		removeHighlightMarkers: function(){
			
		},
		addHighlightMarkers: function(){
			
		}
	});
	rootNS.TextSelector = TextSelector;
})(jQuery,rangy)
