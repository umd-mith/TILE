var TabBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=args.loc;
		this.DOM.append($.ajax({
			async:false,
			url:'lib/ToolBar/TabBar.php',
			type:'text'
		}).responseText);
	}
});

var TileTabBar=TabBar.extend({
	init:function(args){
		this.$super(args);
		this.tab1=$("#tabs-1");
		this.tab2=$("#tabs-2");
	}
});