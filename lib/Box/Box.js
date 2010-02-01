/**
 * Non-OpenLayers, totally HTML format Box div
 * 
 * Taken directly from PlainBox in ImageBoxer
 */

var Box=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("<div></div>");
		this.DOM.addClass("boxer_plainbox");
		$("body").bind("zoom",{obj:this},this.zoom);
		
		this.closeButton=$("<span>X</span>");
		this.closeButton.addClass("boxer_plainbox_close");
		$("body").bind("ImageDoneWorking",{obj:this},function(e){
			//get rid of box on canvas
			
		});
		this.DOM.append(this.closeButton);
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
			handles:'n,e,s,w',
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
	zoom:function(e,args){
		e.stopPropagation();
		var obj=e.data.obj;
		
		switch(args.direction){
			case "up":
				//change location
				var left=parseInt(obj.DOM.css("left"))*args.val;
				obj.DOM.css("left",left+"px");
				var top=parseInt(obj.DOM.css("top"))*args.val;
				obj.DOM.css("top",top+"px");
				
				//change size
				obj.DOM.width((obj.DOM.width()*args.val));
				obj.DOM.height((obj.DOM.height()*args.val));
				break;
			case "down":
				//change location
				var left=parseInt(obj.DOM.css("left"))/args.val;
				obj.DOM.css("left",left+"px");
				var top=parseInt(obj.DOM.css("top"))/args.val;
				obj.DOM.css("top",top+"px");
				//change size
				obj.DOM.width((obj.DOM.width()/args.val));
				obj.DOM.height((obj.DOM.height()/args.val));
				break;	
		}
		
		return false;
	},
	hideSelf:function(e){
		e.stopPropagation();
		e.data.obj.DOM.hide();
	},
	getValues:function(){
		if(this.DOM){
			return {
				x:parseInt(this.DOM.css('left')),
				y:parseInt(this.DOM.css('top')),
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
		this.changeButton=$("<span>Convert to BW</span>");
		this.DOM.append(this.changeButton);
		this.changeButton.bind("click",{obj:this},this.setColorRegion);
		
	},
	setColorRegion:function(e){
		var obj=e.data.obj;
		var values=obj.getValues();
		obj.DOM.trigger("RegionSet",[values]);
	}
});