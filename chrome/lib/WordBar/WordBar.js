/**
 * Captures all the words that are in the TEI XML/text
 * document and displays them in order
 * 
 * To be connected with Lines
 */

var WordBar=function(args){
	this.id=args.id;
	this.words=null;
	
	var url="chrome/lib/WordBar/WordBarHTML.php?id="+this.id;
	this.DOM=$($.ajax({
		async:false,
		url:url,
		dataType:"text"
	}).responseText);
	
	this.ul=$("#"+this.id+"_wordbarList");
	$("body").append(this.DOM);
}
WordBar.prototype={
	insertWords:function(txt){
		//text array is unpacked into
		//the ul
		if($(this.ul.children()).length>0){
			this.ul.html()="";
		}
		//alert(txt.length+'    txt value: '+txt[0]);
		for(t=0;t<txt.length;t++){
			if (txt[t]) {
				setTimeout(function(obj, txt, t){
					
					var el = $("<li id=\"" + t + "\">" + txt + "</li>");
					obj.ul.append(el);
				}, 1, this, txt[t], t);
			}
		}
	}
}
