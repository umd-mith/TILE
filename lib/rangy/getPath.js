// http://stackoverflow.com/questions/2068272/getting-a-jquery-selector-for-an-element
// http://paste.blixt.org/297640

/*
Modified to use :nth-child instead of :eq() for CSS3
Also added spaces between > identifiers

tdbowman
*/

(function( $ ){

	$.fn.getPath = function () {
	if (this.length != 1) throw 'Requires one element.';
	
	var path, node = this;
	
	while (node.length) {
		var realNode = node[0], name = realNode.localName;
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
