//Main function that starts the interface for columns


var EngineC=Monomyth.Class.extend({
	init:function(args){
		//get HTML from PHP script and attach to passed container
		this.loc=(args.attach)?args.attach:$("body");
		var self=this;
		$.ajax({
			dataType:"json",
			url:"./lib/JSONHTML/columns.json",
			success:function(d){
				//d represents JSON data
				$(d.body).appendTo($("body"));
				self.DOM=$("body");
				//this.startURL=args.URL;
				self.getBase();
				//self.json=(args.json)?args.json:false;
				self.schemaFile=null;
				self.preLoadData=null;
				//global bind for sidebar completion event to loadCanvas()
			//	$("body").bind("sideBarDone",{obj:this},this.loadCanvas);

				self.setUp(d);
			}
		});
		
	},
	getBase:function(){
		//check JSON file to configure main path
		var self=this;
		$.getJSON('TILECONSTANTS.json',function(d){
			//d refers to the JSON data
			self._base=d.base;
		});
		
	},
	setUp:function(d){
		//create log - goes towards left area
		this._log=new Log({html:d.log});
	}
	
});