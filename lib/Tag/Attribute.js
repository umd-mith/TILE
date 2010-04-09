// Attribute Object
// Contains HTML for adding to a Tag object
// Also has name-value objects for particular data

var Attribute=Monomyth.Class.extend({
	init:function(args){
		this.id="tagAttr"+$(".tagtype").length+"_"+args.id;
		this.loc=args.loc;
		this.loc.append($("<li id=\""+this.id+"\" class=\"tagtype\">"+args.name+": <span></span></li>"));
		this.DOM=$("#"+this.id+"");
		this.output=$("#"+this.id+" > span");
		this.valueType=args.valueType;
		this.optional=args.optional;
		//TODO: make separate 
		switch(this.valueType){
			case 0:
				this.textField=$("<input type=\"text\" value=\"\"></input>");
				this.DOM.append(this.textField);
				break; 
			case 1:
				this.textField=$("<input type=\"text\" value=\"\"></input>");
				this.DOM.append(this.textField);
				break;
			default:
				this.textField=$("#"+this.id+" > input"); 
				break;
			//	this.textField.hide();
		}
		
	},
	activate:function(){
		this.DOM.show();
	},
	deactivate:function(){
		this.DOM.hide();
	},
	edit:function(){
		this.output.text("");
		this.textField.show();
	},
	save:function(){
		this.output.text(this.textField.val());
		this.textField.hide();
	},
	destroy:function(){
		this.DOM.remove();
	}
});