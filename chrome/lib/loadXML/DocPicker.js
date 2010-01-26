/***
 * Drop down list of Documents to choose from
 * 
 * PULLS DIRECTLY FROM img2xml/XML/
 */

var DocPicker=function(id){
	this.id=id;
	this.DOM=$("#"+this.id+"_docpicker");
	this.select=$("<select id=\""+this.id+"_select\"></select>");
	this.DOM.append(this.select);
	
	this.init();
}
DocPicker.prototype={
	init:function(){
		var list=$.ajax({
			async:false,
			url:"chrome/lib/loadXML/DocPicker.php",
			dataType:"text"
		}).responseText;
		list=list.split("\n");
		for(l=0;l<list.length;l++){
			if (list[l] != "") {
				var option = $("<option></option>");
				option.attr("value", list[l]);
				option.text(list[l]);
				option.attr("id", list[l]);
				this.select.append(option);
				this.selected=list[l];
			}
		}
		this.select.bind("click",{obj:this},this.startLoad);
		
	},
	startLoad:function(e){
		var obj=e.data.obj;
		
		obj.DOM.trigger("startload",[obj.selected]);
	}
	
}

