(function($,rangy){
	rootNS = this;
	TextSelection = function(){
		var self = this;
		this._color = "#666666";
		this._selections = [];
	}
	TextSelector.constructor = VectorDrawer;
	TextSelector.prototype = {};
	$.extend(TextSelector.prototype, {
		
		getSelectedText:function(){
				var selObj = new Array();

				//var range = rangy.createRange();
				var sel = rangy.getSelection();
				var startChildren = _getChildNumber(sel.anchorNode);
				var endChildren = _getChildNumber(sel.focusNode);
				
				selObj = {
					'StartParent' : sel.anchorNode.parentNode.id,
					'StartOffset' : sel.anchorOffset,
					'StartChild' : startChildren,
					'EndParent' : sel.focusNode.parentNode.id,
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
			for (var i=0;i<this._selections).length;i++){
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
				var childNo=this._getChildNum(node);
				
				path=">"+node.nodeName+":eq("+childNo+")";
				while(node.parentNode()){
					node = node.parentNode();
					if (node.id){
						return "#"+node.id+path;
					}
					else{
						var childNo=this._getChildNum(node);
						path=">"+node.nodeName+":eq("+childNo+")";
					}
				}
				return node.nodeName+":eq(0)"+path;
			}
			
		},
		_getChildNum: function(node){
		
			return num;			
		},
		changeSelectionColor:function(selId,color){
			// get selection object from this._selections
			// by selId.  For now, I've created a fake one.
			
			 tmp ={ 
			   "StartParent": "one",
			   "StartOffset": "2"
			   "StartChild": "0",
		   	   "EndParent": "three",
			   "EndOffset": "3",
			   "EndChild": "2"
			  }; 
			  
			//
			endPoint = $(tmp.startPath);
			
			
		},
		changeHighlightColor:function(color){
			this._color = color;
		},
		removeSelectionColor:function(selId){
			
		},
		addSelection:(selObj){
			
		},
		removeSelection(selId){
			
		},
		exportSelections(){
			
		},
		importSelections(){
			
		},
		clearSelection(){
			
		},
		hideSelections(){
			
		}
	});
	rootNS.TextSelection = TextSelection;
})(jQuery,rangy)
