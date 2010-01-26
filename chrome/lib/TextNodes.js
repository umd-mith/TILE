/**
 * Iteratively goes through any DOM and finds
 * all of the text nodes within that DOM
 * 
 * Returns: array of textnodes
 * 
 * Borrowed from somewhere on the internet
 */

$.fn.textNodes = function() {
   var ret = [];
   $.each(this[0].childNodes, function() {
	   if ( this.nodeType == 3 || $.nodeName(this, "br") )
	   		ret.push( $(this) );
	   else $.each(this.childNodes, arguments.callee);
   });
   return $(ret);
}