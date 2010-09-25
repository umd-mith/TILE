/*
	jQuery-GetPath v0.01, by Dave Cardwell. (2007-04-27)
	
	http://davecardwell.co.uk/javascript/jquery/plugins/jquery-getpath/
	
	Copyright (c)2007 Dave Cardwell. All rights reserved.
	Released under the MIT License.
	
	
	Usage:
	var path = $('#foo').getPath();
*/

jQuery.fn.extend({
	getPath1: function( path ) {
		// The first time this function is called, path won't be defined.
		if ( typeof path == 'undefined' ) path = '';

		// If this element is <html> we've reached the end of the path.
		if ( this.is('html') )
			return 'html' + path;

		// Add the element name.
		var cur = this.get(0).nodeName.toLowerCase();

		// Determine the IDs and path.
		var id    = this.attr('id'),
		    class = this.attr('class');

		/*
		console.log(this + ' ID >> ' + id);
		console.log(this + ' Class >> ' + class);
		console.log(typeof id);
		*/
		
		// Add the #id if there is one.
		if ( (typeof id != 'undefined') && id != '' )
			cur += '#' + id;

		// Add any classes.
		if ( (typeof class != 'undefined') && class != '' )
			cur += '.' + class.split(/[\s\n]+/).join('.');

		// Recurse up the DOM.
		return this.parent().getPath1( ' > ' + cur + path );
	}
});

// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element

(function( $ ){

	$.fn.getPath2 = function () {
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
		if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
		path = name + (path ? ' > ' + path : '');
	
		node = parent;
	}
	
	return path;
	};
})( jQuery );

