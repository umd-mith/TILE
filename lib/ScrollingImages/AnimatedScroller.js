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
		if($("svg").length>0){
			//bind completion of new canvas to createCanvasBounds event
			$("body").bind("VDCanvasDONE",{obj:this},this.setCanvasBounds);
			//handles triggering for when mouse goes over edge of scroller while in svg mode
			$("svg").mousemove(function(e){
				var x=e.pageX;
					var y=e.pageY;
					if((x>=$("#scroller").position().left)&&(y>=$("#scroller").position().top)){
						$(this).trigger("closeDownVD",[true]);
						$("#scroller").mouseout(function(e){
							$(this).trigger('closeDownVD',[false]);
							$("#scroller").unbind("mouseout");
						});
					}
			});	
		}
		this.scrollSpeed=(args.scrollSpeed)?args.scrollSpeed:630;
		this.createDraggable();
		
		$("body").bind("newPageLoaded",{obj:this},this.changeFocus);
	},
	minimize:function(e){
		var obj=e.data.obj;
		obj.Handle.toggleClass("open");
		obj.Handle.toggleClass("closed");
		var h=(obj.DOM.height()>25)?25:120;
		obj.DOM.height(h);
	},
	setCanvasBounds:function(e){
	//set where the mouseout and mouseover events get called
		$("svg").mousemove(function(e){
			var x=e.pageX;
			var y=e.pageY;
			if((x>=$("#scroller").position().left)&&(y>=$("#scroller").position().top)){
				$(this).trigger("closeDownVD",[true]);
				$("#scroller").mouseout(function(e){
					$(this).trigger('closeDownVD',[false]);
					$("#scroller").unbind("mouseout");
				});
			}
		});
	},
	loadImages:function(data){
		
		for(d=0;d<data.length;d++){
			if(data[d]){
				var e=$("<div class=\"tileScroll_item\"></div>").attr("id",function(e){
					return "container_"+$(".tileScroll_item").length;
				});
				var self=this;
				var img=$("<img></img>").attr("src",data[d]).load(function(e){
					$(this).unbind();
					//adjust width and height of img element
					var w=($(this)[0].width*self.container.height())/$(this)[0].height;
					var h=self.container.height();
					$(this)[0].width=w;
					$(this)[0].height=h;
				}).appendTo(e);
				this.container.append(e);
				e.click(function(e){
					$(this).trigger("switchImage",[(parseInt($(this).attr("id").replace(/container_/,""),10)+1)]);
					$(".tileScroll_item > img").removeClass("active");
					$("#"+$(this).attr("id")+" > img").addClass("active");
				});
				if(!$(".tileScroll_item > img").hasClass('active')){
					$("#"+e.attr("id")+" > img").addClass("active");
				}
			}
		}
		//re adjust the width of the image container
		//this.container.width($(".tileScroll_item").length*170);
		//re adjust speed and duration
		this.duration = $(".tileScroll_item").length*1000;
		this.speed=(parseInt(this.container.width(),10))+parseInt(this.viewer.width(),10) / this.duration;
	
	},
	//for restarting the session ; clear out the images cache
	_unloadImages:function(){
		$(".tileScroll_item").remove();
	},
	testURL:function(url){
		var t=$.ajax({url:url,async:false,dataType:'text'}).responseText;
		return t;
	},
	//Triggered by newPageLoaded event
	changeFocus:function(e,tags,url,obj){
		var obj=e.data.obj;
		$(".tileScroll_item > img").removeClass("active");
		$(".tileScroll_item > img").each(function(){
			if($(this).attr('src')==url) $(this).addClass('active');
		});
		//$(".tileScroll_item > img[src='"+url+"']").addClass('active');
		
		
	},
	createDraggable:function(){
		this.container.draggable({axis:'x',containment:'parent'});
		this.DOM.bind("dragstop",{obj:this},this.adjustDrag);
	},
	adjustDrag:function(e){
		var obj=e.data.obj;
		obj.leftPos=obj.rightPos=parseInt(obj.container.css("left"),10);
	
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
			if(this.rightPos>(-1*(this.container.width()-this.container.offset().left))){
				//update right left position
				this.rightPos-=($(".tileScroll_item").width()*2);
				this.leftPos=this.rightPos;
				//animate
				this.container.animate({left:this.rightPos + "px"},this.scrollSpeed,"linear");	
			} else {
				//now the images are on 'the other side' of the bar - all the way to the right
				//creating a wrap-around effect
				this.container.css({left:(this.viewer.width()+($(".tileScroll_item").length*$(".tileScroll_item").width()))+"px"});
				this.rightPos=0;
			}
			
		} else {
			//check direction
			if(this.container.hasClass("rtl")){
				this.leftPos=this.rightPos;
			}
			//add class
			this.container.removeClass("rtl").addClass("ltr");
			if(this.leftPos<(this.viewer.width()-this.viewer.offset().left)){
				
				//update left right position
				this.leftPos+=($(".tileScroll_item").width()*2);
				this.rightPos+=this.leftPos;
				
				//animate
				this.container.animate({left:this.leftPos+"px"},this.scrollSpeed,"linear",function(){
					if(parseInt($("#tileScroll_container").css("left"),10)>($("#tileScroll_viewer").width()-$("#tileScroll_viewer").offset().left)){
						alert('over');
					}
				});
			} else{
				//now the images are on 'the other side' of the bar - all the way to the left
				//creating a wrap-around effect
				this.container.css({left:((0-this.container.width())+"px")});
				this.leftPos=0;
			}
		}
	},
	_resetContainer:function(){
		//empty container
		this.container.empty();
	}
});