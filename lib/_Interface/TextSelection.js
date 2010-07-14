// JavaScript Document

var CINATgetSelection = {
	
	
	init: function() {
		
		var userSelection, userRange;
		
		if (window.getSelection) {
			userSelection = window.getSelection();
		} else if (document.selection) { // should come last; Opera!
			userSelection = document.selection.createRange();
		}
		//create range object
		userRange = this.getRangeObject(userSelection);	
		
		return {
			userSelection: userSelection, 
			userRange: userRange
		};
	},
	
	getRangeObject: function(selectionObject) {
		// From http://www.quirksmode.org/dom/range_intro.html
		if (selectionObject.anchorNode) {
			return selectionObject
		}
		else {
			if (selectionObject.getRangeAt) 
				return selectionObject.getRangeAt(0);
			else { // Safari!
			
				var range = document.selection.createRange();
			/*	if (range.setStart()) {
					range.setStart(selectionObject.anchorNode, selectionObject.anchorOffset);
					range.setEnd(selectionObject.focusNode, selectionObject.focusOffset);
				}*/
				return range;
			}
		}	
	},
	
	getChildNumber: function(obj){
		if (obj.parentNode) {
			par = obj.parentNode;
			var x = 0;
			for (var i in par) {
				if (par[i].isSameNode(obj)) {
					return x;
				}
				x++;
			}
			
		}
		return null;
	},
	
	getRangeOffsetIE: function(r) {
		//from http://stackoverflow.com/questions/164147/character-offset-in-an-internet-explorer-textrange
		r.collapse(false);
		
		var end = Math.abs( r.duplicate().moveEnd('character', -1000000) );
		
		// find the anchor element's offset
		var range = r.duplicate();
		r.collapse(false);
		
		var parentElm = range.parentElement();
		var children = parentElm.getElementsByTagName('*');
		//var children = parentElm.childNodes;
		
		for (var i = children.length - 1; i >= 0; i--) {
			range.moveToElementText( children[i] );
			if ( range.inRange(r) ) {
			  parentElm = children[i];
			  break;
			}
		} // end for loop
		
		range.moveToElementText(parentElm);
		var offsetInParent = end - Math.abs( range.moveStart('character', -1000000) );
		// The above is the offset in the parentElem.  Now to get the offset in the textnode
		if (children.length == 0) {
			return [offsetInParent,0,parentElm.firstChild];
		} else {
			children = parentElm.childNodes;
			var counter = 0;
			var textNode = null;
			for (i = 0; i < children.length; i++) {
				var txt;
				if (children[i].nodeType == 3) {
					txt = children[i].nodeValue;
					counter = counter + txt.length;
				} else {
					counter=counter+3;
				}
			
				if (counter >= offsetInParent) {
					textNode = children[i];
					childNo = i;
				
					counter = counter-textNode.nodeValue.length;	
					break;
				}
			} // end for loop
		
			var off = offsetInParent - counter;
			return [off,childNo,textNode];
		}
	},
	
	getChildAtOffset: function(offset,parNode) {
		var children = parNode.childNodes;
		var counter=0;
		for (i=0;i<children.length;i++){
			
			if (children.item(i).innerText) {
				
				
				counter = counter + children.item(i).innerText.length;
				}
			else if(children.item(i).nodeValue.length){
				counter = counter + children.item(i).nodeValue.length;
			
			}
			
			if (counter>=offset){
				return [children.item(i),i];
			}
		}
		return null;	
	},
	
	getRangeValue: function(obj){
		var startNode, endNode, startValue, endValue, text,childNo;
		
		if (obj.userSelection.anchorNode) {
			startNode = obj.userSelection.anchorNode;
			endNode = obj.userSelection.focusNode;
			
			startValue = obj.userSelection.anchorOffset;
			endValue = obj.userSelection.focusOffset; 
			text = obj.userSelection;
			
			childNo = 0;
			var parNode = endNode.parentNode;
			for (var i = 0; i < parNode.childNodes.length; i++) {
				if (parNode.childNodes[i].isSameNode(endNode)) {
					break;
				}
			}
		
			childNo = i;
		} else {
	
			startNode = null;
			startValue = 0;
			// endValue = obj.userSelection.endOffset;
			text = obj.userSelection.text;
			obj.userSelection.collapse(false);
			var vals =  this.getRangeOffsetIE(obj.userSelection);
			endValue = vals[0];
			childNo = vals[1];
			endNode = vals[2];
		}
		
		return {
			startNode: startNode,
			endNode: endNode,
			startValue: startValue,
			endValue: endValue,
			childNo: childNo,
			text: text,
			parNode: parNode
		};
	}
}


