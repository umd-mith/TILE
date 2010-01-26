function extend(childclass,parentclass){
	childclass.prototype.__proto__=parentclass.prototype;
}
