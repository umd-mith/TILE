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
		this.body=$("#scollerContainer");
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
		this.carousel=null;
		//load in mop slider plugin
		//this.scrollList.mopSlider({'w':this.body.width(), 'h':(this.DOM.height()-this.scrollHandle.height()-28), 'sldW':500, 'btnW':200, 'indi':"Scroll", 'shuffle':'n', 'type':'paper', 'auto':'n'});
		//have to adjust the mopSlider CSS to reflect fixed area
		//this.fixedPositionFix();
	},

	// receives images from engineinit
	// @data: Object containing information on image set
	loadImages:function(data){
		
		for(d=0;d<data.length;d++){
			//attach main portion of the thumbnail
			var li=$("<div></div>");
			li.attr("id",function(e){
				return "scrollIMG_"+$("#scrollerlist > div").length;
			});
			if(/http:\/\//.test(data[d])){
				var img=$("<img src=\""+data[d]+"\"/>");
				if(!this.maxImgHeight) {this.maxImgHeight=img.css("height");}
				li.append(img);
				var w=(img[0].width*this.maxImgHeight)/img[0].height;
				img[0].width=w;
				img[0].height=this.maxImgHeight;
			}
			this.scrollList.append(li);
			//add to the items list
			this.items[li.attr("id")]={html:li.attr("id"),values:data[d]};
			li.click(function(e){
				$(this).trigger("scrollerThumbClicked",[$(this).attr("id")]);
			});
		}
		this.createNewSlider();
		
		// for(el in data){
		// 		
		// 			//attach main portion of the thumbnail
		// 			var li=$("<div></div>");
		// 			li.attr("id",function(e){
		// 				return "scrollIMG_"+$("#scrollerlist > div").length;
		// 			});
		// 			
		// 			//attach attributes of the thumbnail
		// 			for(x in data[el]){
		// 				if(/http:\/\//.test(data[el][x])){
		// 					var img=$("<img src=\""+data[el][x]+"\"/>");
		// 					if(!this.maxImgHeight) {this.maxImgHeight=img.css("height");}
		// 					li.append(img);
		// 					var w=(img[0].width*this.maxImgHeight)/img[0].height;
		// 					img[0].width=w;
		// 					img[0].height=this.maxImgHeight;
		// 				} else {
		// 					li.append($("<span>"+x+": "+data[el][x]+"</span>"));
		// 				}
		// 			}
		// 			var left=parseInt($(".holder").css("left"),10)*-1;
		// 			
		// 			//li.attr("style","margin-top: 36px; margin-left: 20px; float: left; position: relative;");
		// 			//li.attr("style","margin-left: 0px; float: left; display:inline; position: relative;");
		// 			this.scrollList.append(li);
		// 			//add to the items list
		// 			this.items[li.attr("id")]={html:li,values:data[el]};
		// 			li.click(function(e){
		// 				$(this).trigger("scrollerThumbClicked",[$(this).attr("id")]);
		// 			});
		// 		}
		
		
	},
	createNewSlider:function(){
		this.scrollList.css("width","");
		this.scrollList.css("display","inline");
		
		this.scrollList.mopSlider({'w':this.DOM.width(), 'h':(this.DOM.height()-this.scrollHandle.height()-28), 'itemMgn':10,'sldW':(this.DOM.width()/2), 'btnW':100, 'indi':"Scroll", 'shuffle':'n', 'type':'paper', 'auto':'n'});
		this.fixedPositionFix();	
	},
	fixedPositionFix:function(){
		var left=parseInt(this.DOM.css("left"),10);
		$(".sliderCase").css("left","20px");
		$(".holder").css("left","20px");
		$("#scrollerList").css("left","0px");
		//this.scrollList.css("left","-20px");
	},
	scrollThumbClick:function(e,id){
		var obj=e.data.obj;
		//find the element
		var item=obj.items[id];
		obj.DOM.trigger("switchImage",[item.values]);
	},
	minimize:function(e){
		var obj=e.data.obj;
		$("#"+obj.scrollHandle.attr("id")+" > a").toggleClass("open");
			$("#"+obj.scrollHandle.attr("id")+" > a").toggleClass("closed");
		var h=(obj.DOM.height()>25)?25:120;
		obj.DOM.height(h);
	}
});