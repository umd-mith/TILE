// Labels
// Provides a taxonomy for all TILE transcript lines and shape areas
// 
// 
// NOTES:
// * Uses 'addLink' Custom Event to send out data to other objects


var Label=function(args){
	var self=this;
	// attach DOM to the ActiveBox area
	$("#az_activeBox").append("<div id=\"az_LabelBox\" class=\"az inner\"><div id=\"addLabelToolbar\" class=\"toolbar\"><div class=\"menuitem\"><ul><li><input id=\"addLabelText\" class=\"\" type=\"text\" value=\"\" /></li></ul></div><div class=\"menuitem\"><ul><li><a id=\"clearTextArea\" class=\"button\">Clear</a></li></ul><span id=\"addLblHelp\" class=\"helpIcon\">?</span></div></div><div id=\"labelList\" class=\"az\"></div></div>");
	self.DOM=$("#az_LabelBox");
	self.clearTextArea=$("#clearTextArea");
	self.addLabelText=$("#addLabelText");
	self.labelList=$("#labelList");
	self.helpIcon=new HelpBox({"iconId":"addLblHelp","text":"Displays all labels. Typing in the box to the left will narrow down the labels shown. Clicking Clear will reset the filtering."});
	self.manifest=[];
	self.checkIds=[];
	self.clearTextArea.click(function(e){
		
		self.addLabelText.val("");		
		self._textTypeHandle();
	
	});
	self.addLabelText.keypress(function(e){
		// wait a second and see what we're typing
		setTimeout(function(){
			self._textTypeHandle();
		},650);
		
	});
	$("#az_LabelBox > .toolbar > .menuitem > ul").bind("blur",function(e){
		if(__v) console.log("focusout");
		self._textLoseFocusHandle();
	});
	// essential global listeners
	// $("body").bind("addLink",{obj:self},self._addLinkHandle);
	
	
	self.labelData=(args.data)?args.data.labels:null;
	self.loadLabels(self.labelData);
	
	
};
Label.prototype={
	// Loads labels from JSON data
	// New labels are added in bundleData() and sortOutput()
	loadLabels:function(data){
		var self=this;
		// each label receives an li tag that has a click
		// event attached
		// Click event fires off sendLblData custom event
		for(d in data){
			// get rid of duplicates
			if($("#lbl_"+data[d].id).length){
				
				continue;
			}
			var lbl=data[d];
			
			$("<div id=\"lbl_"+lbl.id+"\" class=\"labelItem\">"+lbl.name+"</div>").click(function(){
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				self.lblSelected({name:$(this).text(),id:id,refs:(lbl.refs)?lbl.refs:[]});
			}).appendTo(self.labelList);
			self.manifest.push(data[d]);
			self.checkIds.push(data[d].id);
		}
	
	},
	lblSelected:function(data){
		var self=this;
		// deactivate other labels and activate this label
		$(".labelItem").removeClass("active");
		self.addLabelText.val($("#lbl_"+data.id).text());
		// var url=$("#srcImageForCanvas").attr('src');
		$("#lbl_"+data.id).addClass("active");
		
		self.curId=data.id;
		
		// show all references associated with this object
		for(x in self.manifest){
			
			if(self.manifest[x].id==self.curId){
				if(!self.manifest[x].refs) self.manifest[x].refs=[];
				if(__v) console.log("selected label: "+self.manifest[x].id+"  and refs: "+self.manifest[x].refs);
				$("body:first").trigger("labelSelected",[self.manifest[x].refs]);
				break;
			}
		}
		
		
		
	},
	_textTypeHandle:function(){
		var self=this;
		var txt=self.addLabelText.val();
		if(txt.length>0){
		var regex=new RegExp("^"+txt);
		self.labelList.children("div").each(function(i,o){
			if(!regex.test($(o).text())){
				$(o).hide();
			} else {
				$(o).show();
			}
		});
		} else {
			self.labelList.children('div').each(function(i,o){
				$(o).show();
			});
		}
	},
	_textLoseFocusHandle:function(){
		var self=this;
		self.labelList.children("div").each(function(i,o){
			$(o).show();
		});
	},
	_addLabelClickHandle:function(){
		var self=this;
		// find item
		var id=null;
		var txt=self.addLabelText.val();
		for(x in self.manifest){
			if(self.manifest[x].name==txt){
				id=self.manifest[x].id;
				break;
			}
		}
		if(!id) {
			// new user-generated label 
			// create manifest record
			id=Math.floor(Math.random()*560);
			while($.inArray(id,self.checkIds)>=0){
				id=Math.floor(Math.random()*560);
			}
			
			var rec={
				id:id,
				name:txt,
				refs:[]
			};
			$("<div id=\"lbl_"+id+"\" class=\"labelItem\">"+txt+"</div>").click(function(){
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");

				self.lblSelected({name:$(this).text(),id:id,refs:[]});
			}).appendTo(self.labelList);
			self.manifest.push(rec);
			
		};
		$(".labelItem").removeClass("active");
		$("#lbl_"+id).addClass("active");
		if(__v) console.log("found label: "+$("#lbl_"+id));
		// fire event for applying metadata
		// $("body:first").trigger("addLink",[{type:'labels',id:id}]);
		
	},
	// Function that answers the addLink Custom Event call
	// e : {Event}
	// ref : {Object} : id: {String}, type: {String}
	_addLinkHandle:function(ref){
		if(__v) console.log("label received this: "+ref);
		if(ref.type=="labels") return;
		var self=this;
		// put focus on labels if no transcript line is selected
		if(!$(".line_selected").length){ 
			self.addLabelText[0].focus();
			
		};
		var id="";
		if(!$(".labelItem.active").length){ 
			id="UnknownLBL";
			if($.inArray(id,self.checkIds)<0){
				self.manifest[self.manifest.length-1]={id:"UnknownLBL",name:"Area of interest",refs:[]};
				self.checkIds.push(id);
				$("<div id=\"lbl_"+id+"\" class=\"labelItem\">Area of Interest</div>").click(function(){
					if($(this).hasClass("active")) {
						$(this).removeClass("active");
						return;
					}
					// get id for label
					var id=$(this).attr('id').replace("lbl_","");
					// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
					self.lblSelected({name:$(this).text(),id:id});
				}).appendTo(self.labelList);
				$("#lbl_"+id).addClass("active");
			}
			
			
		} else {
			id=$(".labelItem.active").attr("id").replace("lbl_","");
		}
		
	
		// deactivate active state
		// $(".labelItem.active").removeClass("active");
		for(x in self.manifest){
			if(self.manifest[x].id==id){
				// see if it has refs
				if(self.manifest[x].refs){
					if($.inArray(ref.id,self.manifest[x].refs)>=0){
						return;
					}
					// for(it in self.manifest[x][ref.type]){
					// 						if(self.manifest[x][ref.type][it]==ref.id){
					// 							// already in ref array, cancel operation
					// 							return;
					// 							break;
					// 						}
					// 					}
				} else {
					self.manifest[x].refs=[];
				}
				self.manifest[x].refs.push(ref.id);
				if(__v) console.log("label "+self.manifest[x].id+" has ref: "+self.manifest[x].refs);
				break;
			}
		}
	},
	_deleteLinkHandle:function(ref){
		
 		if(ref.type=='labels') return;
		var self=this;
		if($(".labelItem.active").length==0) return;
		var id=$(".labelItem.active").attr('id').replace("lbl_","");
		for(x in self.manifest){
			if(self.manifest[x].id==id){
				if(__v) console.log("manifest has: "+self.manifest[x].id+"  "+self.manifest[x].refs+" need to find: "+ref.id);
				for(r in self.manifest[x].refs){
					if(self.manifest[x].refs[r]==ref.id){
						
						// re-parse the ref array
						if(self.manifest[x].refs.length>1){
							var ac=self.manifest[x].refs.slice(0,r);
							var bc=self.manifest[x].refs.slice((r+1));
							self.manifest[x].refs=ac.concat(bc);
							
						} else {
							self.manifest[x].refs=[];
							if(__v) console.log("deleted ref "+self.manifest[x].refs);
						}
					}
				}
				break;
			}
		}
		
	},
	sortOutputData:function(){
		var self=this;
		return self.manifest;
	}
	
};

// Plugin object that is fed into TILE_ENGINE 1.0
var LB={
	id:"LB1000",
	activeCall:"labelsActive",
	outputCall:"labelsOutput",
	start:function(x,json){
		var self=this;
	
		// create new label instance
		self.LBL=new Label({data:json});
		$("body").bind("labelSelected",{obj:self},self._lblClickHandle);
	},
	unActive:function(){
		var self=this;
		$(".labelItem.active").removeClass("active");
	},
	restart:function(){
		var self=this;
		// hide the activeBox
		$("#az_activeBox").parent().hide();
		self.LBL.DOM.show();
	},
	_lblClickHandle:function(e,refs){
		var self=e.data.obj;
		// send reference out to tile-engine
		// $("body:first").trigger(self.activeCall,[self.id]);
		
		$("body:first").trigger("loadItems",[refs]);
		
	},
	// receive data
	// attach labels to object and save data, if not already stored 
	inputData:function(data){
		var self=this;
		
		self.LBL._addLinkHandle(data);
		if(data.attachHandle){
			var lbl=$(".labelItem.active").text();
			if(__v) console.log("number of labeled items on document: "+$(data.attachHandle).length); 
			if($("#delete_"+data.id).length) return;
		
			if(($(data.attachHandle).length)&&($("#delete_"+data.id).length==0)){
				if(__v) console.log("attaching span tags to selBB: "+$(data.attachHandle)+"  id: "+data.id); 
				$(data.attachHandle).append($("<div class=\"button\">label: "+lbl+"</div><span id=\"delete_"+data.id+"\" class=\"button\">X</span>"));
				$("#delete_"+data.id).click(function(e){
				
					// delete the link 
					$("body:first").trigger("deleteLink",[{id:data.id,type:data.type}]);
					$(this).parent().remove();
				});
			}
		}
		return true;
	},
	removeData:function(data){
		var self=this;
		self.LBL._deleteLinkHandle(data);
	},
	_close:"lblClosed",
	close:function(){
		var self=this;
		
		$("body:first").trigger(self._close);
	},
	bundleData:function(json){
		var self=this;
		var data=self.LBL.sortOutputData();
		var temp=$.merge(true,{},data);
		json.labels=data;
		// for(l in json.labels){
		// 		for(d in data){
		// 			if(data[d].id==json.labels[l].id){
		// 				json.labels[l]=data[d];
		// 			}
		// 		}
		// 	}
		return json;
		
	}
};

