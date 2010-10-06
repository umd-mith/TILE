// Labels
// Provides a taxonomy for all TILE transcript lines and shape areas
// 
// 
// NOTES:
// * Uses 'addLink' Custom Event to send out data to other objects


var Label=function(args){
	var self=this;
	// attach DOM to the ActiveBox area
	$("#az_activeBox").append("<div id=\"az_LabelBox\" class=\"az inner\"><div id=\"addLabelToolbar\" class=\"toolbar\"><div class=\"menuitem\"><ul><li><input id=\"addLabelText\" class=\"\" type=\"text\" value=\"\" /></li></ul></div><div class=\"menuitem\"><ul><li><a id=\"addLabelButton\" class=\"button\">Add Label</a></li></ul><span id=\"addLblHelp\" class=\"helpIcon\">?</span></div></div><div id=\"labelList\" class=\"az\"></div></div>");
	self.DOM=$("#az_LabelBox");
	self.addLabelButton=$("#addLabelButton");
	self.addLabelText=$("#addLabelText");
	self.labelList=$("#labelList");
	self.helpIcon=new HelpBox({"iconId":"addLblHelp","text":"Click on this button to add a label to the currently selected Object."});
	
	// attach essential listeners
	self.addLabelButton.click(function(e){
		self._addLabelClickHandle();
		
		
	});
	// essential global listeners
	$("body").bind("addLink",{obj:self},self._addLinkHandle);
	
	
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
			$("<div id=\"lbl_"+data[d].id+"\" class=\"labelItem\">"+data[d].name+"</div>").click(function(){
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				
				self.lblSelected({name:$(this).text(),id:id,refs:(data[d].refs)?data[d].refs:[]});
			}).appendTo(self.labelList);
		}
		self.manifest=data;
	},
	lblSelected:function(data){
		var self=this;
		// deactivate other labels and activate this label
		$(".labelItem").removeClass("active");
		self.addLabelText.val($("#lbl_"+data.id).text());
		
		$("#lbl_"+data.id).addClass("active");
		
		self.curId=data.id;
		$("body:first").trigger("labelSelected",[self.curId]);
		// show all references associated with this object
		for(x in self.manifest){
			if(self.manifest[x].id==self.curId){
				if(!self.manifest[x].refs) self.manifest[x].refs=[];
				$("body:first").trigger("loadItems",[self.manifest[x].refs]);
			}
		}
		
		
		
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
			
			var rec={
				id:id,
				name:txt,
				refs:[]
			};
			
		};
		
		// fire event for applying metadata
		$("body:first").trigger("addLink",[{type:'label',id:id}]);
		
	},
	// Function that answers the addLink Custom Event call
	// e : {Event}
	// ref : {Object} : id: {String}, type: {String}
	_addLinkHandle:function(e,ref){
		if(ref.type=="label") return;
		var self=e.data.obj;
		
		if(!$(".line_selected").length){ 
			self.addLabelText[0].focus();
			
		};
		
		if(!$(".labelItem.active").length) return;
		
		var id=$(".labelItem.active").attr("id").replace("lbl_","");
		// deactivate active state
		$(".labelItem.active").removeClass("active");
		for(x in self.manifest){
			if(self.manifest[x].id==id){
				// see if it has refs
				if(self.manifest[x][ref.type]){
					for(it in self.manifest[x][ref.type]){
						if(self.manifest[x][ref.type][it]==ref.id){
							// already in ref array, cancel operation
							return;
							break;
						}
					}
				} else {
					self.manifest[x][ref.type]=[];
				}
				self.manifest[x][ref.type].push(ref.id);
				
				break;
			}
		}
	},
	// addReference:function(e,data){
	// 		e.stopImmediatePropagation();
	// 		
	// 		var self=e.data.obj;
	// 		if(!self.curId) return;
	// 		if(typeof data=='string') data=JSON.parse(data);
	// 		for(x in self.manifest){
	// 			// find the current label
	// 			if(self.curId==self.manifest[x].id){
	// 				if(!self.manifest[x].refs) self.manifest[x].refs=[];
	// 				var item=data[data.length-1];
	// 				// for(d in data){
	// 				
	// 				if((/[0-9]*_/.test(item))&&($.inArray(item,self.manifest[x].refs)<0)){
	// 					// add data to the reference section of label
	// 					self.manifest[x].refs.push(item);
	// 					$("#lbl_"+self.curId).append("<p>"+item+"</p>");
	// 				}
	// 				// }
	// 				
	// 				break;
	// 			}
	// 		}
	// 		
	// 		
	// 		
	// 	},
	sortOutputData:function(){
		var self=this;
		return self.manifest;
	}
	
};

// Plugin object that is fed into TILE_ENGINE 1.0
var LB={
	start:function(x,json){
		var self=this;
	
		// create new label instance
		self.LBL=new Label({data:json});
	},
	restart:function(){
		var self=this;
		// hide the activeBox
		$("#az_activeBox").parent().hide();
		self.LBL.DOM.show();
	},
	_close:"lblClosed",
	close:function(){
		var self=this;
		// self.LBL.DOM.hide();
		// $("#az_activeBox > .az.inner:eq(0)").show();
		
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

