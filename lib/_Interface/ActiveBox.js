/***
* Active Box;
***/

// Takes any generic JSON object and supplies HTML for that object

// ActiveBox({loc: {String}}) : Constructor : takes an object args as argument with: 
// 								loc: string for HTML id of div to attach DOM to
// 
// Functions
// _addItem(data) : takes argument data, which is JSON data, and attaches data to DOM area
						// (creates HTML)
// getObjData(obj) : internal function; used within _addItem()
// clearArea : Clears out the ActiveBox of any HTML objects


(function($){
	var rootNS=this;
	rootNS.ActiveBox=ActiveBox;
	// Constructor
	// args {Object} contains:
	// 				loc - {String} represents ID for parent DOM element
	function ActiveBox(args){
		var self=this;
		self.loc=args.loc;
		self.html=$("<div class=\"az inner\"><span id=\"activeBox_min\" class=\"btnIconLarge\"></span><ul id=\"addInfoArea\" class=\"infoItem\"></ul></div>");
		$("#"+self.loc).append(self.html);
		self.DOM=$("#"+self.loc+" > .az.inner");
		self.addInfoArea=$("#"+self.loc+" > .az.inner > #addInfoArea");
		self.minButton=$("#"+self.loc+" > .az.inner > #activeBox_min");
		self.minButton.click(function(e){
			if($(this).parent().parent().hasClass("closed")){
				$(this).parent().parent().removeClass("closed");
				$("#az_log").removeClass("max");
				// $("#az_log").css({"height":"50%"});
				// $(this).parent().parent().css({"height":"100%","top":"50%"});
			} else {
				$(this).parent().parent().addClass("closed");
				$("#az_log").addClass("max");
				// $(this).parent().parent().css({"height":"10%","top":""});
				// $("#az_log").css({"height":"100%"});
			}
		});
		
		// global bind for adding data to existing info
		// $("body").bind("appendABData",{obj:self},self._addItem);
	}
	ActiveBox.prototype={};
	$.extend(ActiveBox.prototype,{
		// add a generic JSON item to the infoBox
		// data {String} - JSON string that contains data relating to Object that is loaded.
		// 					function goes through and recursively adds items in Object using 
		// 					"key" --> "value" pairs
		_addItem:function(data){
			if(!data) return;
			var data=eval('('+data+')');//when JSON passed in event, must be re-evaluated
			var self=this;
			self.addInfoArea.empty();
			
			
			for(o in data){
				if(typeof data[o]!='string'){
					var el=$("<li><span class=\"infoDisplay\">"+o+":<br/> "+self.getObjData(data[o])+"</span></li>");
					
					self.addInfoArea.append(el);
					
				} else {
					var el=$("<li><span class=\"infoDisplay\">"+o+": "+data[o]+"</span></li>");
					self.addInfoArea.append(el);
				}
			}
			//see if this is an object that can be deleted (i.e. it has an id)
			$(".deleteKey").click(function(e){
				var id=$(this).attr("id").replace("delete","");
				$("body:first").trigger("deleteItem",[id]);
				
				$(this).parent().remove();
			});
			$(".approveKey").click(function(e){
				var id=$(this).attr("id").replace("approve","");
				$("body:first").trigger("approveItem",[id]);
				$(this).parent().remove();
			});
			$(".infoItemMin").click(function(e){
				if($(this).parent().hasClass("closed")){
					$(this).parent().removeClass("closed");
					
				} else {
				
					$(this).parent().addClass("closed");
				
				}
			});
			
		},
		//recursive function for finding an object's data and returning
		// string that displays data. Used in _addItem()
		// obj {Object} - Generic object. Every key --> value pair is recursively
		// 						searched through in this object.
		getObjData:function(obj){
			var self=this;
			// security test - not malicious
			if(/js$|JS$|php$|PHP$|html$|htm$/.test()){
				return;
			}
			
			stg="";
			
			for(o in obj){
				
				if(obj[o]&&(typeof obj[o]=='object')){
					if(obj[o]["id"]){
						// decide whether this is an approved or non-approved id
						if(obj[o]["id"].substring(0,1)=="D"){
							stg+="<li class=\"infoItem\"><span id=\"minInfo\" class=\"infoItemMin btnIconLarge open\"></span><br/><span id=\"approve"+obj[o]["id"]+"\" class=\"approveKey button\">APPROVE</span><br/><span id=\"delete"+obj[o]["id"]+"\" class=\"deleteKey button\">DELETE</span><br/>"+self.getObjData(obj[o])+"</li>";
						} else {
							
							stg+="<li class=\"infoItem\"><span id=\"minInfo\" class=\"infoItemMin btnIconLarge open\"></span><br/><span id=\"delete"+obj[o]["id"]+"\" class=\"deleteKey button\">DELETE</span><br/>"+obj[o]["id"]+"</li>";
						}				
					} else if(/_/.test(obj[o])){
						stg+="<span class=\"infoDisplay\">"+obj[o]+"</span><br/>";
					} 
				} else {
					if(/<([A-Za-z][A-Za-z0-9]*)/.test(obj[o])){
						// HTML characters present - attach without a wrapper
						stg=obj[o]+"<br/>"+stg;
					} else if(/^[D_]/.test(obj[o])){
						// temp line
						stg+="<li class=\"infoItem\"><span id=\"minInfo\" class=\"infoItemMin btnIconLarge open\"></span><br/><span id=\"approve"+obj[o]+"\" class=\"approveKey button\">APPROVE</span><br/><span id=\"delete"+obj[o]+"\" class=\"deleteKey button\">DELETE</span><br/>"+obj[o]+"</li>";				
					} else if(/_/.test(obj[o])){
						stg+="<li class=\"infoItem\"><span id=\"minInfo\" class=\"infoItemMin btnIconLarge open\"></span><br/><span id=\"delete"+obj[o]+"\" class=\"deleteKey button\">DELETE</span><br/>"+obj[o]+"</li>";
					} else {
						stg+="<span class=\"infoDisplay\">"+o+": "+obj[o]+"</span><br/>";
					}
				}
			}
			
			return stg;
		},
		// Append extra data to the already displayed data
		// e.g. shapes, selections, tags
		// e : {Event}
		// data : {Object}
		_appendDataHandle:function(e,data){
			var self=e.data.obj;
			// security test - not malicious
			if(/.js|.JS|.php|.PHP|.html|.htm|.[HTML]+|.[HTM]+/.test()){
				return;
			}
			
			self.addInfoArea.append(self.getObjData(data));
			
		},
		// Simply clears the active Box DOM area
		clearArea:function(){
			var self=this;
			self.addInfoArea.empty();
		}
	});
	
	
})(jQuery);