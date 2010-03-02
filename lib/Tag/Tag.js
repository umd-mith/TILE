/**
* Tag
* Object to recording metadata about a bound object in the 
* stage area of the interface
*
**/

var Tag=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
		this.index=$(".tag").length;
		this.loc.append($.ajax({
			url:'lib/Tag/Tag.php?id='+this.index,
			type:'text',
			async:false
		}).responseText);
		this.DOM=$("#tag_"+this.index);
		this.title=args.title;
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		this.editB=$("#tagedit_"+this.index);
		this.objText=$("#tagobjvalue");
		this.coordText=$("#tagcoordsvalue");
		
	}
	
});