/***
* Active Box;
***/

// Takes any generic JSON object and supplies HTML for that object

// ActiveBox(args) : Constructor : takes an object args as argument with: 
// 								loc: string for HTML id of div to attach DOM to
// 
// Functions
// _addItem(data) : takes argument data, which is JSON data, and attaches data to DOM area
						// (creates HTML)
// getObjData(obj) : internal function; used within _addItem()


(function($){
	var rootNS=this;
	rootNS.ActiveBox=ActiveBox;
	function ActiveBox(args){
		var self=this;
		self.loc=args.loc;
		self.html=$("<div class=\"az inner\"><ul id=\"addInfoArea\" class=\"infoItem\"></ul></div>");
		$("#"+self.loc).append(self.html);
		self.DOM=$("#"+self.loc+" > .az.inner");
		self.addInfoArea=$("#"+self.loc+" > .az.inner > #addInfoArea");
	}
	ActiveBox.prototype={};
	$.extend(ActiveBox.prototype,{
		//add a generic JSON item to the infoBox
		_addItem:function(data){
			if(!data) return;
			var data=eval('('+data+')');//when JSON passed in event, must be re-evaluated
			var self=this;
			self.addInfoArea.empty();
			for(o in data){
				if(typeof data[o]!='string'){
					var el=$("<li><span class=\"infoDisplay\">"+o+":<br/> "+self.getObjData(data[o])+"</span></li>");
					// for(p in data[o]){
					// 						el.append(""+p+" "+data[o][p]+"<br/>");
					// 					}
					self.addInfoArea.append(el);
					//see if this is an object that can be deleted (i.e. it has an id)
					$(".deleteKey").click(function(e){
						var id=$(this).attr("id").replace("delete","");
						$("body:first").trigger("deleteItem",[id]);
						$(this).parent().remove();
					});
				} else {
					var el=$("<li><span class=\"infoDisplay\">"+o+": "+data[o]+"</span></li>");
					self.addInfoArea.append(el);
				}
			}
		},
		//recursive function for finding an object's data and returning
		// string that displays data
		getObjData:function(obj){
			var self=this;
			stg="";
			for(o in obj){
				if(typeof obj[o]=='object'){
					if("id" in obj[o]){
						stg+="<li class=\"infoItem\"><span id=\"delete"+obj[o]["id"]+"\" class=\"deleteKey\">DELETE</span><br/>"+self.getObjData(obj[o])+"</li>";
						
					} else {
						stg+="<span class=\"infoDisplay\">"+self.getObjData(obj[o])+"</span><br/>";
					}
				} else {
					stg+="<span class=\"infoDisplay\">"+o+": "+obj[o]+"</span><br/>";
				}
			}
			
			return stg;
		}
	});
	
	
})(jQuery);