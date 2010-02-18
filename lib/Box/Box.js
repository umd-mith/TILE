/**
 * Non-OpenLayers, totally HTML format Box div
 * 
 * Taken directly from PlainBox in ImageBoxer
 */

var Box=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("<div></div>");
		this.DOM.addClass("boxer_plainbox");
		
		this.userOptions=$("<div></div>");
		this.userOptions.addClass("boxer_plainbox_useroptions");
		
		this.DOM.append(this.userOptions);
		
		
		this.closeButton=$("<span>X</span>");
		this.closeButton.addClass("boxer_plainbox_close");
		this.userOptions.append(this.closeButton);
		this.closeButton.bind("click",{obj:this},this.hideSelf);
	},
	makeDrag:function(){
		//store latest css data in case the user resizes box outside of window
		this.DOM.data("lastLeft",this.DOM.css("left"));
		this.DOM.data("lastTop",this.DOM.css("top"));
		this.DOM.draggable({
			start:function(e,ui){
				if (ui.position) {
					if ((ui.position.top > 0)&&(ui.position.left>0)) {
						$(this).data("lastLeft", $(this).css("left"));
						$(this).data("lastTop", $(this).css("top"));
					}
				}
			},
			stop:function(e,ui){
				if((ui.position.top>0)&&(ui.position.left>0)){
					$(this).data("lastLeft",$(this).css("left"));
					$(this).data("lastTop",$(this).css("top"));
				}
			}
		});
		this.DOM.resizable({
			handles:'all',
			start:function(e,ui){
				if((ui.position.top<0)||(ui.position.left<0)){
					$(this).css("left",$(this).data("lastLeft"));
					$(this).css("top",$(this).data("lastTop"));
				} else {
					$(this).data("lastLeft",$(this).css("left"));
					$(this).data("lastTop",$(this).css("top"));
				}
			},
			stop:function(e,ui){
				if((ui.position.top<0)||(ui.position.left<0)){
					$(this).css("left",$(this).data("lastLeft"));
					$(this).css("top",$(this).data("lastTop"));
				} else {
					$(this).data("lastLeft",$(this).css("left"));
					$(this).data("lastTop",$(this).css("top"));
				}
		}});
		
	},
	zoom:function(e,val){
		
		var obj=e.data.obj;
		
		switch(val){
			case 1:
				//change location
				var left=parseInt(obj.DOM.css("left"),10)*args.val;
				obj.DOM.css("left",left+"px");
				var top=parseInt(obj.DOM.css("top"),10)*args.val;
				obj.DOM.css("top",top+"px");
				
				//change size
				obj.DOM.width((obj.DOM.width()*args.val));
				obj.DOM.height((obj.DOM.height()*args.val));
				break;
			case 0:
				//change location
				var left=parseInt(obj.DOM.css("left"),10)/args.val;
				obj.DOM.css("left",left+"px");
				var top=parseInt(obj.DOM.css("top"),10)/args.val;
				obj.DOM.css("top",top+"px");
				//change size
				obj.DOM.width((obj.DOM.width()/args.val));
				obj.DOM.height((obj.DOM.height()/args.val));
				break;	
		}
		
	},
	hideSelf:function(e){
		e.stopPropagation();
		e.data.obj.DOM.hide();
	},
	getValues:function(){
		if(this.DOM){
			return {
				x:parseInt(this.DOM.css('left'),10),
				y:parseInt(this.DOM.css('top'),10),
				ox:this.DOM.offset().left,
				oy:this.DOM.offset().top,
				w:this.DOM.width(),
				h:this.DOM.height()
			};
		}
	}
});

/**
Selector Box 

specifically for placing bounding box on Canvas

grantd
**/

var SelectorBox=Box.extend({
	init:function(args){
		this.$super(args);
		this.userOptions.show();
		this.changeButton=$("<span class=\"boxer_select_ocr\">Convert to BW</span>");
		this.userOptions.append(this.changeButton);
		this.changeButton.bind("click",{obj:this},this.setColorRegion);
		$("body").bind("ImageDoneWorking",{obj:this},function(e,off){
			//get rid of box on canvas
			var obj=e.data.obj;
			if(off) obj.DOM.hide();
		});
		//$("body").bind("zoom",{obj:this},this.zoom);
	},
	setColorRegion:function(e){
		var obj=e.data.obj;
		var values=obj.getValues();
		obj.DOM.trigger("RegionSet",[values]);
	}
});

/**Blob box **/

var BlobBox=Box.extend({
	init:function(args){
		this.$super(args);
	
		this.imageObj=args.imageObj;
		
		this.DOM.attr("id",function(e){
			return "BlobbyBoxey_"+$(".blobbox").length;
		});
		
		//change CSS style
		this.DOM.removeClass("boxer_plainbox");
		this.DOM.addClass("blobbox");
		
		//add Options
		this.resizeOn=false;
		this.dragOn=false;
		/**
		this.editResize=$("<span>Resize</span>");
		this.editResize.addClass("boxer_blob_resize");
		this.resizeOn=false;
		this.editResize.bind("click",{obj:this},this.setResize);
		
		this.editMove=$("<span>Move</span>");
		this.editMove.addClass("boxer_blob_drag");
		this.dragOn=false;
		this.editMove.bind("click",{obj:this},this.setDrag);
		this.editResize.appendTo(this.userOptions);
		this.editMove.appendTo(this.userOptions);
		**/
		this.DOM.width(args.width);
		this.DOM.height(args.height);
		this.DOM.css("left",args.left+'px');
		this.DOM.css("top",args.top+'px');
		this.DOM.appendTo(args.loc);
		this.optionsON=false;
			
		this.DOM.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			/**if(obj.optionsON){
				obj.userOptions.hide();
				obj.optionsON=false;
			} else {
				obj.userOptions.show();
				obj.optionsON=true;
			}**/
		//	obj.setResize(e);
			obj.setDrag(e);
		});
	
	},
	zoomCanvas:function(e,val){
		var obj=e.data.obj;
		var zoom=obj.imageObj.getZoomLevel();
		if((val>0)&&(zoom<5)){
			//zoom in
			var left=parseInt(obj.DOM.css("left"),10)*2;
			var top=parseInt(obj.DOM.css("top"),10)*2;
			
			obj.DOM.css("left",left+"px");
			obj.DOM.css("top",top+"px");
			obj.DOM.width(obj.DOM.width()*2);
			obj.DOM.height(obj.DOM.height()*2);
		} else if(zoom>0){
			//zoom out
			var left=parseInt(obj.DOM.css("left"),10)/2;
			var top=parseInt(obj.DOM.css("top"),10)/2;
			obj.DOM.css("left",left+"px");
			obj.DOM.css("top",top+"px");
			obj.DOM.width(obj.DOM.width()/2);
			obj.DOM.height(obj.DOM.height()/2);
		}
		
	},
	setResize:function(e){
		var obj=e.data.obj;
		if(!obj.resize){
			obj.DOM.resizable({
				handles:"all"
			});
			obj.DOM.resizable("disable");
			obj.resize=true;
		}
		if(obj.resizeOn){
			obj.DOM.resizable("disable");
			obj.resizeOn=false;
		} else {
			obj.DOM.resizable('enable');
			obj.resizeOn=true;
		}
		
	},
	setDrag:function(e){
		var obj=e.data.obj;
		if(!obj.drag){
			obj.DOM.draggable({
				handles:"all"
			});
			obj.DOM.draggable("disable");
			obj.drag=true;
		}
		if(obj.dragOn){
			obj.DOM.draggable("disable");
			obj.dragOn=false;
		} else {
			obj.DOM.draggable('enable');
			obj.dragOn=true;
		}
	}
});