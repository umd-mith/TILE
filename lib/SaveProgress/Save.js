// Save 
// 
// Object for creating and saving progress in TILE


var Save=Monomyth.Class.extend({
	init:function(args){
		this.saveurl="lib/SaveProgress/SaveProgress.php";
		this.iframe=null;
		this.filePrompt=$("<form enctype=\"multipart/form-data\" action=\""+this.saveurl+"\" method=\"POST\"><input name=\"uploadfile\" type=\"file\"/></form>");
		this.loc=$("#"+args.loc);
	},
	userPrompt:function(info){
		var params="";
		for(i in info){
			params+=(params.length>0)?"%"+i+"::"+info[i]:i+"::"+info[i];
		}
		
		this.iframe=$("<iframe src=\""+(this.saveurl+"?urls="+params)+"\"><p>Your shitty browser doesn't support iframes</p></iframe>");
		this.loc.append(this.iframe);
	}
});

