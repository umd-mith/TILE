Panel=function(args){
	this.locid='#'+args.locid;
	this.id=(Math.random(1,100)*100);
	this.id=this.id.toFixed(0);
	this.id="panel"+this.id;
	this.title=(args.title)?args.title:"Panel";
	this.options=args;
	
	this.DOM=$("<div id="+this.id+" class=\"panelContainer\"></div>");
	this.DOM.addClass("panel");
	//this.DOM.bind("panelReady",this.setHTML);
	this.content=null;
	//this.DOM.bind("click",{obj:this},this.setContent);
	$(this.locid).append(this.DOM);
	
	this.DOM.html($.ajax({
		async: false,
		url: args.url+"?id="+this.id+"&title="+this.title,
		dataType: "text"
	}).responseText);
	
}
Panel.prototype={
	contentReady:function(){
		alert(this.DOM.html());
	},
	setDrag:function(){
		var drag=new DD({id:this.DOM.id,handle:this.header.id});
	},
	setContent:function(){
		
	},
	close:function(obj){
		$(obj.DOM).empty();
	}
	
}
