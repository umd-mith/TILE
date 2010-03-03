var TabBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("#"+args.loc);
		this.DOM.append($.ajax({
			async:false,
			url:'lib/ToolBar/TabBar.php',
			type:'GET'
		}).responseText);
	}
});

var TileTabBar=TabBar.extend({
	init:function(args){
		this.$super(args);
		//tab1 handles all tags and tagging attributes
		this.tab1=$("#tabs-1");
		this.tab2=$("#tabs-2");
		this.protoTab=$("#tabs");
		this.protoTab.tabs();
		
		this.addTagB=$("#addTag");
		this.addTagB.click(function(e){
			$(this).trigger("addATag");
		});
		$("body").bind("addATag",{obj:this},this.addTag);
		this.tags=[];
	},
	addTag:function(e){
		var obj=e.data.obj;
		//add a new tag to the tab1 area
	
		var tag=new TileTag({loc:obj.tab1.attr("id")});
	}
});