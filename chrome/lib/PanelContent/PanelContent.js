var PanelContent=function(args){
	if(!args.panelid) throw "No id passed";
	this.panelid=args.panelid;
	this.init();
}
PanelContent.prototype={
	init:function(){
		var id="#"+this.panelid;
		this.DOM=$(id+"_content");
		this.body=$(id+"_contentBody");
		
	},
	setContent:function(){
		
	},
	adjustResize:function(width,height){
		
	}
}
