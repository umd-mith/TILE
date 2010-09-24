(function($){
	rootNS = this;
	TextSelection = function(){
		var self = this;
		this._selections = [];
	}
	TextSelector.constructor = VectorDrawer;
	TextSelector.prototype = {};
	$.extend(TextSelector.prototype, {
		
		getSelectedText(){
		
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
		
		
	});
	
})(jQuery)
