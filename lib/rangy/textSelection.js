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
		setSelection:function(selObj){
			// Takes object like that exported
			// by getSelectedText
			
		},
		changeSelectionColor:function(selId,color){
			
		},
		changeHighlightColor:function(color){
			this._color = color;
		},
		removeSelectionColor:function(selId){
			
		},
		addSelection:(selId){
			
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
