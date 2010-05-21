var lineBox=Monomyth.Class.extend({
	init:function(args){
		self=this;
		this.DOM=$("<div></div>");
		var id = $(".lineBox").length;
		id="lineBox_"+id;
		this.DOM.attr("id",id);

		this.DOM.addClass("lineBox");
		
		//add Options
		this.resizeOn=false;
		this.dragOn=false;
		this.DOM.width(args.width);
		this.DOM.height(args.height);
		this.DOM.css("left",args.left+'px');
		this.DOM.css("top",args.top+'px');
		this.DOM.appendTo(args.loc);
		this.optionsON=false;
		$("#"+id).bind("mouseover",function(e){
			$(this).addClass("lineBoxSelect");
		});
		$("#"+id).bind("mouseout",function(e){
			$(this).removeClass("lineBoxSelect");
		});
		$("#"+id).bind("click",function(e){
			var id = $(this).attr("id");
			self.select(id);
		});
	},
	select:function(id){

		
		$(".lineBox").css({"display":"none"});
		$("#"+id).css({"display":"block"});
		$("#"+id).draggable();
		$("#"+id).resizable();
		$("#"+id).trigger("lineClicked",[id]);
	}
	});
