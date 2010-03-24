// Save 
// 
// Object for creating and saving progress in TILE


var Save=Monomyth.Class.extend({
	init:function(args){
		this.saveurl="lib/SaveProgress/SaveProgress.php";
		this.iframe=null;
		this.filePrompt=$("<form id=\"uploadDataFORM\" action=\""+this.saveurl+"\" method=\"POST\" class=\"submitFormHidden\"><input id=\"uploadData\" name=\"uploadData\" type=\"text\"/></form>");
		this.loc=$("#"+args.loc);
	},
	userPrompt:function(info){
		var params="";
		var json=this.convertJSON(info);
		this.loc.append(this.filePrompt);
		$("#uploadData").val(json);
		
		//attach PHP receiver script
		this.iframe=$("<iframe src=\""+(this.saveurl)+"\"><p>Your browser doesn't support iframes</p></iframe>");
		this.loc.append(this.iframe);
		//listen for user click to get rid of form
		$(document).bind("click",{obj:this},this.removeUpload);
		
		//submit POST data
		$("#uploadDataFORM")[0].submit();
		
	},
	convertJSON:function(data){
		//convert an associative array of string pairs into an json object
		var json="{";
		
		for(d in data){
			var namevalue="\""+d+"\":"+data[d];
			json+=namevalue+",";
		}
		json+="}";
		return json;
	},
	removeUpload:function(e){
		var obj=e.data.obj;
		$("#uploadDataFORM").remove();
	}
});

