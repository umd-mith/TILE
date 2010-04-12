/****
*  Animated Scroller
* 
* by: grantd
*
*
*
**/
var AnimatedScroller=Monomyth.Class.extend({
	init:function(args){
		var h=$($.ajax({
			url:"lib/ScrollingImages/AnimatedScroller.html",
			async:false,
			dataType:'html'
		}).responseText);
		h.appendTo($("body"));
		this.DOM=$("#scroller");
		this.Handle=$("#scrollerHandle > a");
		this.ScrollOuter=$("#tileScroll_outer");
		this.scroller=$("#tileScroll_imagescroller");
		this.viewer=$("#tileScroll_viewer");
		this.container=$("#tileScroll_container");
	}
});

var TileAnimatedScroller=AnimatedScroller.extend({
	init:function(args){
		this.$super(args);
		// var h=$($.ajax({
		// 			url:"lib/ScrollingImages/AnimatedScroller.html",
		// 			async:false,
		// 			dataType:'html'
		// 		}).responseText);
		// 		h.appendTo($("body"));
		// 		this.DOM=$("#scroller");
		// 		this.Handle=$("#scrollerHandle > a");
		// 		this.ScrollOuter=$("#tileScroll_outer");
		// 		this.scroller=$("#tileScroll_imagescroller");
		// 		this.viewer=$("#tileScroll_viewer");
		// 		this.container=$("#tileScroll_container");
		//set sizes
		this.ScrollOuter.width(this.DOM.width()-275);
		this.viewer.width(this.DOM.width());
		this.container.width(this.DOM.width());
		this.container.height(this.DOM.height()-this.Handle.height());
		this.duration=0;
		this.speed=0;
		this.leftPos=0;
		this.rightPos=0;
		this.lClicks=1;
		this.rClicks=1;
		//controls
		this.ltrB=$("#ltr");
		this.rtlB=$("#rtl");
		this.ltrB.bind("click",{obj:this},this.moveLeftRight);
		this.rtlB.bind("click",{obj:this},this.moveRightLeft);
		this.Handle.bind("click",{obj:this},this.minimize);
	},
	minimize:function(e){
		var obj=e.data.obj;
		obj.Handle.toggleClass("open");
		obj.Handle.toggleClass("closed");
		var h=(obj.DOM.height()>25)?25:120;
		obj.DOM.height(h);
	},
	loadImages:function(data){
		for(d=0;d<data.length;d++){
			if(data[d]){
				var e=$("<div class=\"tileScroll_item\"></div>").attr("id",function(e){
					return "container_"+$(".tileScroll_item").length;
				});
			
				var img=$("<img></img>").attr("src",data[d]);
				
				img.appendTo(e);
				this.container.append(e);
				//adjust width and height of img element
				var w=(img[0].width*this.container.height())/img[0].height;
				var h=this.container.height();
				img[0].width=w;
				img[0].height=h;
				e.click(function(e){
					$(this).trigger("switchImage",[parseInt($(this).attr("id").replace(/container_/,""),10)]);
				});
			}
		}
		//re adjust the width of the image container
		this.container.width($(".tileScroll_item").length*170);
		//re adjust speed and duration
		this.duration = $(".tileScroll_item").length*1000;
		this.speed=(parseInt(this.container.width(),10))+parseInt(this.viewer.width(),10) / this.duration;
	},
	moveLeftRight:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		//total distance
		var d=parseInt(obj.container.width(),10)+parseInt(obj.viewer.width(),10);
		//remaining distance
		var dl=d-(parseInt(obj.container.css('left'),10)+parseInt(obj.container.width(),10));
		obj.duration=dl/obj.speed;
		obj.animateContainer(obj.duration,"ltr");
	},
	moveRightLeft:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		//total distance
		var d=parseInt(obj.container.width(),10)+parseInt(obj.viewer.width(),10);
		//remaining distance
		var dl=d-(parseInt(obj.viewer.width(),10)+parseInt(obj.container.css('left'),10));
		obj.duration=dl/obj.speed;
		obj.animateContainer(obj.duration,"rtl");
	},
	animateContainer:function(time,dir){
		
		//which way to go - left to right (ltr) or right to left (rtl)
		if(dir=="rtl"){
			//check direction
			if(this.container.hasClass("ltr")){
				this.rightPos=this.leftPos;
			}
			
			//add class
			this.container.removeClass("ltr").addClass("rtl");
			if(this.rightPos>(-1*this.viewer.width())){
				//update right left position
				this.rightPos-=$(".tileScroll_item").width();
				this.leftPos=this.rightPos;
				//animate
				this.container.animate({left:this.rightPos + "px"},800,"linear",function(){
					//alert("value set to left: "+$("div#tileScroll_imagescroller").width());
					//reset container's position
					//$(this).css({left:$("div#tileScroll_imagescroller").width(),right:""});
					//CODE FROM WEB : omitted
				});	
			} else {
				this.rClicks=1;
				this.rightPos=0;
			}
			
		} else {
			//check direction
			if(this.container.hasClass("rtl")){
				this.leftPos=this.rightPos;
			}
			//add class
			this.container.removeClass("rtl").addClass("ltr");
			if(this.leftPos<this.viewer.width()){
				
				//update left right position
				this.leftPos+=$(".tileScroll_item").width();
				this.rightPos+=this.leftPos;
				
				//animate
				this.container.animate({left:this.leftPos+"px"},800,"linear",function(){
					//alert("value set to left: "+(0 - $("div#tileScroll_container").width()));
					//$(this).css({left:(0 - $("div#tileScroll_container").width())});
				});
			} else{
				this.leftPos=0;
				this.lClicks=1;
			}
		}
	}
});