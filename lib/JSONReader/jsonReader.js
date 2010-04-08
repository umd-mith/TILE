// jsonReader
var _JSON=null;
var jsonReader=Monomyth.Class.extend({
	init:function(args){
		this.data=args;
		this.schemaFile=null;
		$("body").bind("schemaLoaded",{obj:this},this.ingestSchemaData);
	},
	ingestSchemaData:function(e){
		var obj=e.data.obj;
		if(!obj.schemaFile){
			obj.schemaFile=schema;
			//get the JSON data
			//url,data,function
			$.getJSON(obj.schemaFile,function(d){
				_JSON=[];
				//go through tag objects and create array of tags
				//and their rules
				_JSON.tags=[];
				$.each(d.tags,function(i,tag){
					_JSON.tags.push(tag);
				});
				
				$("body").trigger("tagRulesSet",[_JSON.tags]);
			});
		}
	},
	getImages:function(){
		
	},
	getTags:function(){
		
	},
	getRules:function(){
		
	}
});