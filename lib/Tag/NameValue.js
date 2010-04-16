var NameValue=Monomyth.Class.extend({
	init:function(args){
		if((!args.name)||(!args.rules)||(!args.loc)) throw "Error in creating name-value pair";
		this.name=args.name;
		this.rules=args.rules;
		this.loc=args.loc;
	}
	
});

/**
Name-value object to be used specifically with TILE interface
**/
var TileNameValue=NameValue.extend({
	init:function(args){
		this.$super(args);
	
		this.DOM="";
		switch(this.rules.valueType){
			case 0:
			//string value
				this.DOM=$("<input id=\"\" class=\"nameValue\"></input>").attr("id",function(e){
					return "namevalue_"+$(".nameValue").length;
				});
				
				this.loc.append(this.DOM);
				break;
			case 1: 
			//URI value
				break;
			case 2:
				break;
		}
	}
	
});