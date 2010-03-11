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
		this.scrollList=$("#scrollerlist");
		
		this.maxImgHeight=this.DOM.innerHeight();
		
		//local listeners
		this.DOM.bind("minimizeScroller",{obj:this},this.minimize);
		this.DOM.bind("scrollerThumbClicked",{obj:this},this.scrollThumbClick);
		//global listeners
		//$("body").bind("multiFileListImported",{obj:this},this.loadImages);
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
		//jQuery.merge(this.items,data);
		for(el in data){
		
			//attach main portion of the thumbnail
			var li=$("<li></li>");
			li.attr("id",function(e){
				return "scrollIMG_"+$("#scrollerlist > li").length;
			});
			
			//attach attributes of the thumbnail
			for(x in data[el]){
				if(/http:\/\//.test(data[el][x])){
					var img=$("<img src=\""+data[el][x]+"\"/>");
					if(!this.maxImgHeight) {this.maxImgHeight=img.css("height");}
					li.append(img);
					var w=(img[0].width*this.maxImgHeight)/img[0].height;
					img[0].width=w;
					img[0].height=this.maxImgHeight;
				} else {
					li.append($("<span>"+x+": "+data[el][x]+"</span>"));
				}
			}
			this.scrollList.append(li);
			//add to the items list
			this.items[li.attr("id")]={html:li,values:data[el]};
			li.click(function(e){
				$(this).trigger("scrollerThumbClicked",[$(this).attr("id")]);
			});
		}
	},
	scrollThumbClick:function(e,id){
		var obj=e.data.obj;
		//find the element
		var item=obj.items[id];
		obj.DOM.trigger("switchImage",[item.values]);
	},
	minimize:function(e){
		var obj=e.data.obj;
		var h=(obj.DOM.height()>25)?25:120;
		obj.DOM.height(h);
	}
});