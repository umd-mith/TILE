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
		//do not perform construction if scroller already present
		if($("#scroller").length>0) return false;
		this.loc=$("body");
		
		this.loc.append($.ajax({
			url:'lib/ScrollingImages/ScrollingImages.html',
			async:false,
			dataType:'html'
		}).responseText);
		this.DOM=$("#scroller");
		this.scrollHandle=$("#scrollerHandle");
		this.scrollHandle.click(function(e){
			$(this).trigger("minimizeScroller");
		});
		this.scrollList=$("#scrollerList");
		
		this.DOM.bind("minimizeScroller",{obj:this},this.minimize);
	}
});

var TileScrollingImages=ScrollingImages.extend({
	init:function(args){
		this.$super(args);
		this.items=[];
	},
	// receives images from engineinit
	// @data: Object containing information on image set
	loadImages:function(data){
		jQuery.merge(this.items,data);
		
	},
	addImages:function(data){
		jQuery.merge(this.items,data);
	},
	minimize:function(e){
		var obj=e.data.obj;
		var h=(obj.DOM.height()>25)?25:120;
		obj.DOM.height(h);
	}
});