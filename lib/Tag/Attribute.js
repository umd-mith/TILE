// Attribute Object
// Contains HTML for adding to a Tag object
// Also has name-value objects for particular data

var Attribute=Monomyth.Class.extend({
	init:function(args){
		this.id="tagAttr"+$(".tagtype").length+"_"+args.id;
		this.loc=args.loc;
		this.loc.append($("<li id=\""+this.id+"\" class=\"tagtype\">"+args.name+": <span></span><input class=\"tagObjInput\" type=\"text\"></li>"));
		this.DOM=$("#"+this.id+"");
		this.output=$("#"+this.id+" > span");
		this.textField=$("#"+this.id+" > input"); 
		this.textField.hide();
	},
	activate:function(){
		this.DOM.show();
	},
	deactivate:function(){
		this.DOM.hide();
	},
	edit:function(){
		this.textField.show();
	},
	save:function(){
		this.textField.hide();
	}
});