/***
* Active Box;
***/
(function($){
	var rootNS=this;
	rootNS.ActiveBox=ActiveBox;
	function ActiveBox(args){
		var self=this;
		self.loc=args.loc;
		self.html=$("<div class=\"az inner\"><ul id=\"addInfoArea\"></ul></div>");
		$("#"+self.loc).append(self.html);
		self.DOM=$("#"+self.loc+" > .az.inner");
		self.addInfoArea=$("#"+self.loc+" > .az.inner > #addInfoArea");
	}
	ActiveBox.prototype={};
	$.extend(ActiveBox.prototype,{
		//add a generic JSON item to the infoBox
		_addItem:function(data){
			var data=eval('('+data+')');//when JSON passed in event, must be re-evaluated
			var self=this;
			self.addInfoArea.empty();
			for(o in data){
				if(typeof data[o]!='string'){
					var el=$("<li>"+o+":<br/> "+self.getObjData(data[o])+"</li>");
					// for(p in data[o]){
					// 						el.append(""+p+" "+data[o][p]+"<br/>");
					// 					}
					self.addInfoArea.append(el);
				} else {
					var el=$("<li>"+o+": "+data[o]+"</li>");
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
					stg+=self.getObjData(obj[o]);
				} else {
					stg+=o+": "+obj[o]+"<br/>";
				}
			}
			
			return stg;
		}
	});
	
	
})(jQuery);