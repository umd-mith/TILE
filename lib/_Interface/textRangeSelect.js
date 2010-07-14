Selection = function(win){

    this.userSelection = null; //for Mozilla, opera
    this.userRange = null; //for IE

	
	this.win =win ;
	this.doc = win.document;
}
Selection.prototype.SelectText=function(element) {
	// modified from http://stackoverflow.com/questions/985272/jquery-selecting-text-in-an-element-akin-to-highlighting-with-your-mouse
    var text = this.doc.getElementById(element);
    if ($.browser.msie) {
        var range = this.doc.body.createTextRange();
        range.moveToElementText(text);
        range.select();
    } else if ($.browser.mozilla || $.browser.opera) {
        var selection = this.win.getSelection();
        var range = this.doc.createRange();
        range.selectNodeContents(text);
        selection.removeAllRanges();
        selection.addRange(range);
    } else if ($.browser.safari) {
        var selection = this.win.getSelection();
        selection.setBaseAndExtent(text, 0, text, 1);
    }
}
Selection.prototype.getRangeObject = function(selectionObject){
    // From http://www.quirksmode.org/dom/range_intro.html
	if (selectionObject.anchorNode) {
		return selectionObject
	}
	else {
		if (selectionObject.getRangeAt) 
			return selectionObject.getRangeAt(0);
		else { // Safari!	
			var range = this.doc.selection.createRange();
			return range;
		}
	}
}


/***
 * Initializes the range/selection
 * depending on the browser
 *
 *
 * @param {Object} obj (Selection Object)
 *
 */
Selection.prototype.init = function(){

    if (this.win.getSelection) {
	
        this.userSelection = this.win.getSelection();
    }
    else 
        if (this.doc.selection) { // should come last; Opera!
        	
            this.userSelection = this.doc.selection.createRange();
			
        }

    //create range object
    this.userRange = this.getRangeObject(this.userSelection);
    
}

/***
 * Returns an array with information
 * on range values and range nodes
 *
 * Params:
 * Selection Object 'obj'
 */
Selection.prototype.getRangeOffsetIE=function(r,start){
	//r = textRange
	//start = boolean, true = find start of range, false = find end of range
	//from http://stackoverflow.com/questions/164147/character-offset-in-an-internet-explorer-textrange
  r.collapse(start);
  var end = Math.abs( r.duplicate().moveEnd('character', -1000000) );
  // find the anchor element's offset
  var range = r.duplicate();
  r.collapse( start );
  var parentElm = range.parentElement();
  
  var children = parentElm.getElementsByTagName('*');
   //var children = parentElm.childNodes;
  
  for (var i = children.length - 1; i >= 0; i--) {
  	
    range.moveToElementText( children[i] );
    if ( range.inRange(r) ) {
      parentElm = children[i];
      break;
    }
  }
  range.moveToElementText( parentElm );
  var offsetInParent = end - Math.abs( range.moveStart('character', -1000000) );
  // The above is the offset in the parentElem.  Now to get the offset in the textnode
  if (children.length == 0) {
  	return [offsetInParent,0,parentElm.firstChild];
  }
  else {
  	children = parentElm.childNodes;
  	var counter = 0;
	var textNode = null;
  	for (i = 0; i < children.length; i++) {
  		var txt;
  		if (children[i].nodeType == 3) {
  			txt = children[i].nodeValue;
			counter = counter + txt.length;
  		}
  		else {
  		
			counter=counter+3;
  		}
  	
  		if (counter >= offsetInParent) {
			textNode = children[i];
	
			childNo = i;
		
			counter = counter-textNode.nodeValue.length;	
			break;
			
			
			
  	
  		}
  	}
	
	var off = offsetInParent - counter;
	return [off,childNo,parentElm];
	
  
  }
  
  
  
}
Selection.prototype.getChildAtOffset=function(offset,parNode){
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
}
Selection.prototype.insertAtSel=function(node){
	
}
Selection.prototype.getRangeValue = function(){
	obj = this;
    var startNode, endNode, startValue, endValue, text,childNo;
    
    if (obj.userSelection.anchorNode) {
    
        startNode = obj.userSelection.anchorNode;
        endNode = obj.userSelection.focusNode;
	
        startValue = obj.userSelection.anchorOffset;
        endValue = obj.userSelection.focusOffset;
		text = obj.userSelection.toString();
		startChildNo=0;
		endChildNo = 0;
		var parNode = endNode.parentNode;
			for (var i = 0; i < parNode.childNodes.length; i++) {
				if (parNode.childNodes[i].isSameNode(startNode)) {
				
					startChildNo=i;
				}
				if (parNode.childNodes[i].isSameNode(endNode)) {
					endChildNo=i
					break;
				}
			}
			
    }
    else {
    	
	
        startNode = null;
      
		//alert(endNode.nodeName);
		
        startValue = 0;
       // endValue = obj.userSelection.endOffset;
		 text = obj.userSelection.text;
		 	obj.userSelection.collapse(false);
		var vals =  this.getRangeOffsetIE(obj, true);
	startValue = vals[0];
	startChildNo = vals[1];
	startNode = vals[2];
	var vals =  this.getRangeOffsetIE(obj, false);
    endValue = vals[0];
	endChildNo = vals[1];
	endNode = vals[2];
    }
    
    
   
    
    
    return {
    
        startNode: startNode,
        endNode: endNode,
        startValue: startValue,
        endValue: endValue,
        startChildNo: startChildNo,
		endChildNo: endChildNo,
        text: text
    };
}
function getChildNumber(obj){
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
}




