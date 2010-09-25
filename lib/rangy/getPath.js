/*
	jQuery-GetPath v0.01, by Dave Cardwell. (2007-04-27)
	
	http://davecardwell.co.uk/javascript/jquery/plugins/jquery-getpath/
	
	Copyright (c)2007 Dave Cardwell. All rights reserved.
	Released under the MIT License.
	
	
	Usage:
	var path = $('#foo').getPath();
*/


// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element
// JavaScript Document

// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element

(function( $ ){

	$.fn.getPath = function () {
	if (this.length != 1) throw 'Requires one element.';
	
	var path, node = this;
	 //console.log(node.length);
	
	while (node.length) {
		var realNode = node[0], name = realNode.localName;
		//console.log(realNode.localName);
		if (!name) break;
	
		name = name.toLowerCase();
		if (realNode.id) {
			// As soon as an id is found, there's no need to specify more.
			return name + '#' + realNode.id + (path ? ' > ' + path : '');
		} else if (realNode.className) {
			name += '.' + realNode.className.split(/\s+/).join('.');
		}
	
		var parent = node.parent(), siblings = parent.children(name);
		if (siblings.length > 1) name += ':nth-child(' + (siblings.index(node) + 1) + ')';
		path = name + (path ? ' > ' + path : '');
	
		node = parent;
	}
	
	return path;
	};
})( jQuery );