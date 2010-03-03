/**
* ScrollingImages
*
*Scrolling DIV for displaying series of images
*
*
* attaches to the BODY tag
**/


var ScrollingImages=Monomyth.Class.extend({
	init:function(args){
		if($("#scroller").length>0) return false;
		this.loc=$("body");
		this.index=$("#scroller").length;
		
		this.loc.append($.ajax({
			url:'lib/ScrollingImages/ScrollingImages.php?id='+this.index,
			async:false,
			type:'GET'
		}).responseText);
		this.DOM=$("#scroller");
		this.handle=$("#handle_"+this.index);
	}
});

var TileScrollingImages=ScrollingImages.extend({
	init:function(args){
		this.$super(args);
	},
	loadImages:function(){
		
	}
});