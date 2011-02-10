// Labels
// Provides a taxonomy for all TILE transcript lines and shape areas
// 
// 
// NOTES:
// * Uses 'addLink' Custom Event to send out data to other objects


var Label=function(args){
	var self=this;
	// attach DOM to the ActiveBox area
	$("#az_LabelBox").append("<div id=\"labelList\" class=\"az\"></div></div>");
	// attach toolbar items
	$("#addLabelToolbar").append("<div class=\"menuitem\"><ul><li><input id=\"addLabelText\" class=\"\" type=\"text\" value=\"\" /></li></ul></div><div class=\"menuitem\"><ul><li><a id=\"clearTextArea\" class=\"button\">Clear</a></li></ul></div>");
	self.DOM=$("#az_LabelBox");
	self.clearTextArea=$("#clearTextArea");
	self.addLabelText=$("#addLabelText");
	self.labelList=$("#labelList");
	// self.helpIcon=new HelpBox({"iconId":"addLblHelp","text":"Displays all labels. Typing in the box to the left will narrow down the labels shown. Clicking Clear will reset the filtering."});
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
	$("body").bind("labelClick",{obj:self},self.lblSelected);
	
	// self.labelData=(args.data)?args.data.labels:null;
	// 	if(self.labelData){self.loadLabels(self.labelData);}
	
	
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
			if(!data[d]) continue;
			// get rid of duplicates
			if($("#lbl_"+data[d].id).length){
				
				continue;
			}
			var lbl=data[d].obj;
			
			$("<div id=\"lbl_"+lbl.id+"\" class=\"labelItem\">"+lbl.name+"</div>").appendTo(self.labelList);
			$("div#lbl_"+lbl.id).bind("click",function(e){
				if(__v) console.log("hey you clicked on a label "+$(this).attr('id'));
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				$(".labelItem").removeClass("active");
				$(this).addClass("active");
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				if(__v) console.log(id+'  sending out data: ');
				$("body:first").trigger("labelClick",[{name:$(this).text(),id:id}]);
			});
			self.manifest.push(data[d]);
			self.checkIds.push(data[d].id);
		}
	
	},
	lblSelected:function(e,data){
		if(__v) console.log(e);
		var self=e.data.obj;
		// deactivate other labels and activate this label
		// $(".labelItem").removeClass("active");
		self.addLabelText.val($("#lbl_"+data.id).text());
		// var url=$("#srcImageForCanvas").attr('src');
		// $("#lbl_"+data.id).addClass("active");
		
		self.curId=data.id;
		
		// show all references associated with this object
		for(x in self.manifest){
			
			if(self.manifest[x].id==self.curId){
				if(!self.manifest[x].refs) self.manifest[x].refs=[];
				if(__v) console.log("selected label: "+self.manifest[x].id+"  and refs: "+self.manifest[x].refs);
				$("body:first").trigger("labelSelected",[self.manifest[x]]);
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
			self.checkIds.push(id);
			$("<div id=\"lbl_"+id+"\" class=\"labelItem\">"+txt+"</div>").appendTo(self.labelList);
			$("#lbl_"+id).bind("click",function(e){
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				$(".labelItem").removeClass("active");
				$(this).addClass("active");
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				if(__v) console.log(id+'  sending out data: ');
				$("body:first").trigger("labelClick",[{name:$(this).text(),id:id}]);
			});
			self.manifest.push(rec);
			
		}
		// $(".labelItem").removeClass("active");
		// $("#lbl_"+id).addClass("active");
		// fire event for applying metadata
		// $("body:first").trigger("addLink",[{type:'labels',id:id}]);
		
	},
	// Function that answers the addLink Custom Event call
	// e : {Event}
	// ref : {Object} : Referenced object, contains:  id: {String}, type: {String}
	// label : {Object} : label object to attach ref to
	_addLinkHandle:function(ref,label){
		if(__v) console.log("label received this: "+ref);
		if(ref.type=="labels") return;
		var self=this;
		// put focus on labels if no transcript line is selected
		if(!$(".line_selected").length){ 
			self.addLabelText[0].focus();
			
		};
		
		if(($.inArray(label.id,self.checkIds)<0)){ 
			
			self.manifest.push({id:label.id,display:label.name,name:(label.name)?label.name:"Area of interest",refs:[]});
			if(__v) console.log("Labels adding new label to manifest: "+JSON.stringify(self.manifest[self.manifest.length-1]));
			self.checkIds.push(label.id);
			$("<div id=\"lbl_"+label.id+"\" class=\"labelItem\">"+label.name+"</div>").click(function(e){
				if($(this).hasClass("active")) {
					$(this).removeClass("active");
					return;
				}
				$(".labelItem").removeClass("active");
				$(this).addClass("active");
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// $("body:first").trigger("labelSelected",[{type:"labels",id:id}]);
				if(__v) console.log(id+'  sending out data: ');
				$("body:first").trigger("labelClick",[{name:$(this).text(),id:id}]);
			}).appendTo(self.labelList);
			// $("#lbl_"+id).addClass("active");
			
		} else {
			id=label.id.replace("lbl_","");
		}
		
	
		// deactivate active state
		// $(".labelItem.active").removeClass("active");
		for(x in self.manifest){
			if(self.manifest[x].id==label.id){
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
	_deleteLinkHandle:function(ref,lbl){
		
 		if(ref.type=='labels') return;
		var self=this;
		if(!lbl){
			// delete from every instance
			for(x in self.manifest){
				if(self.manifest[x]){
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
				}
			}
			
		}
		
		
		// if($(".labelItem.active").length==0) return;
		// var id=$(".labelItem.active").attr('id').replace("lbl_","");
		for(x in self.manifest){
			if(self.manifest[x].id==lbl){
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
		// get rid of null pointers
		var cleanManifest=[];
		for(var l in self.manifest){
			if(self.manifest[l]) cleanManifest.push(self.manifest[l]);
		}
		self.manifest=cleanManifest;
		return cleanManifest;
	}
	
};

// Plugin object that is fed into TILE_ENGINE 1.0
var LB={
	id:"LB1000",
	activeCall:"labelsActive",
	outputCall:"labelsOutput",
	// Initialize the Label Box (Lower-left) and 
	// prepare data to sent to PluginController
	start:function(engine){
		var self=this;
		self.lbls=[];
		
		var json=engine.getJSON();
		// manipulate DOM space
		$("#az_activeBox > .az.inner").attr('id',"az_LabelBox");
		$("#az_activeBox > .az.inner > .toolbar").attr("id","addLabelToolbar");
		
		// create new label instance
		self.LBL=new Label({data:json});
		$("body").bind("labelSelected",function(e,obj){
			// send obj to the engine
			var lbl={id:obj.id,type:'labels',jsonName:'labels',obj:obj};
			engine.setActiveObj(lbl);
		});
		
		// data being sent to the pluginController must include
		// the ID for this tool
		// These are items that will be eventually loaded into the 
		// FloatingDiv
		for(var x in json.labels){
			var lbl={id:json.labels[x].id,type:'labels',jsonName:'labels',obj:json.labels[x]};
			self.lbls[lbl.id]=lbl;
		}
		if(self.lbls.length) {
			engine.insertTags(self.lbls);
			self.LBL.loadLabels(self.lbls);
		}
		
		// insert title into plugin area
		$("#addLabelToolbar > .pluginTitle").text("Labels");
		// attach global listeners
		$("body").live("newJSON newPage",{obj:self},self.newJSONHandle);
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		$("body").live("newActive",{obj:self},self.activeObjHandle);
	},
	newJSONHandle:function(e,o){
		var self=e.data.obj;
		if(e.type=='newPage'){
			// clear the label area
			$("#labelList").empty();
		}
		$(".labelItem").removeClass('active');
		var data=o.engine.getJSON();

		if(!data.labels) return;
		var vd=[];
		var newLbls=[];
		// parse labels
		for(var d in data.labels){
			if(!self.lbls[data.labels[d].id]){
				self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
				newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
			}
			
		}
		vd=self.findLabelsOnPage(data);
		
		// for(var d in self.lbls){
		// 		vd.push(self.lbls[d]);
		// 	}
		self.LBL.loadLabels(vd);
		if(newLbls.length){
			o.engine.insertTags(newLbls);
		}
	},
	dataAddedHandle:function(e,o){
		var self=e.data.obj;
		var data=o.engine.getJSON();
		
		// deactivate labels
		// $(".labelItem").removeClass('active');
		// check if any labels were added
		var vd=[];
		var newLbls=[];
		// parse labels
		for(var d in data.labels){
			if(!self.lbls[data.labels[d].id]){
				self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
				newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
			}
		}
		vd=self.findLabelsOnPage(data);
		self.LBL.loadLabels(vd);
		if(newLbls.length){
			o.engine.insertTags(newLbls);
		}
	},
	activeObjHandle:function(e,o){
		var self=e.data.obj;
		var data=o.engine.getJSON();
		
		// deactivate labels
		$(".labelItem").removeClass('active');
		// check if any labels were added
		var vd=[];
		var newLbls=[];
		// parse labels
		for(var d in data.labels){
			// add any labels added to JSON that don't exist in manifest
			if(!self.lbls[data.labels[d].id]){
				self.lbls[data.labels[d].id]={id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]};
				newLbls.push({id:data.labels[d].id,type:'labels',jsonName:'labels',obj:data.labels[d]});
			}
		}
		
		vd=self.findLabelsOnPage(data);
		
		for(var item in o.activeItems){
			if(self.lbls[o.activeItems[item].id]){
				$("#lbl_"+o.activeItems[item].id).addClass('active');
			}
		}
		
		self.LBL.loadLabels(vd);
		if(newLbls.length){
			o.engine.insertTags(self.lbls);
		}
	},
	// finds labels referenced in engine JSON
	// returns array of active labels
	findLabelsOnPage:function(data){
		var self=this;
		var vd=[];
		// find the labels referenced on this page
		for(var p in data.pages){
			if(data.pages[p].url==TILEPAGE){
				// current page - find label refs
				var page=data.pages[p];
				for(var prop in page){
					// if prop is a list of items, go through them
					if((!(/url|lines|info/i.test(prop)))&&($.isArray(page[prop]))){
						for(var item in page[prop]){
							if((page[prop][item]['labels'])&&($.isArray(page[prop][item]['labels']))){
								for(var lbl in page[prop][item]['labels']){
									
									if(self.lbls[page[prop][item]['labels'][lbl]]){
										if(__v) console.log("found label on page "+page[prop].url+"  "+page[prop][item]['labels'][lbl]);
										vd.push(self.lbls[page[prop][item]['labels'][lbl]]);
									}
								}
							}
						}
					}
				}
				break;
			}
		}
		return vd;
	},
	loadJSON:function(engine){
		var self=this;
		
		$(".labelItem").removeClass('active');
		var data=engine.getJSON();
		
		// engine.insertTags(self.metaData);
		
		self.LBL.loadLabels(data.labels);
	},
	unActive:function(){
		var self=this;
		$(".labelItem").removeClass("active");
	},
	restart:function(){
		var self=this;
		// hide the activeBox
		// $("#az_activeBox").parent().hide();
		// self.LBL.DOM.show();
	},
	_lblClickHandle:function(e,refs){
		var self=e.data.obj;
		// send reference out to tile-engine
		// $("body:first").trigger(self.activeCall,[self.id]);
		
		$(".line_selected").removeClass("line_selected");
		$("body:first").trigger("loadItems",[refs]);
		
	},
	// receive data
	// attach labels to object and save data, if not already stored 
	inputData:function(data){
		var self=this;
		
		self.LBL._addLinkHandle(data.ref,data.obj);
		// if(data.attachHandle){
		// 			var lbl=$(".labelItem.active").text();
		// 			if(__v) console.log("number of labeled items on document: "+$(data.attachHandle).length); 
		// 			if($("#delete_"+data.id).length) return;
		// 		
		// 			if(($(data.attachHandle).length)&&($("#delete_"+data.id).length==0)){
		// 				if(__v) console.log("attaching span tags to selBB: "+$(data.attachHandle)+"  id: "+data.id); 
		// 				$(data.attachHandle).append($("<div class=\"button\">label: "+lbl+"</div><span id=\"delete_"+data.id+"\" class=\"button\">X</span>"));
		// 				$("#delete_"+data.id).click(function(e){
		// 				
		// 					// delete the link 
		// 					$("body:first").trigger("deleteLink",[{id:data.id,type:data.type}]);
		// 					$(this).parent().remove();
		// 				});
		// 			}
		// 		}
		return true;
	},
	removeData:function(data,lbl){
		var self=this;
		self.LBL._deleteLinkHandle(data,lbl);
	},
	getLink:function(){
		var self=this;
		var lbl=$(".labelItem.active");
		// if no label available, return false
		if(!lbl) return false;
		// if already linked, then return false
		if($("#delete_"+lbl.attr('id')).length) return false;
		
		// return link value
		return {"id":lbl.attr('id'),"display":lbl.text(),type:"labels",tool:self.id};
		
	},
	_close:"lblClosed",
	close:function(){
		var self=this;
		
		$("body:first").trigger(self._close);
	},
	bundleData:function(json){
		var self=this;
		// clean up data from Labels object
		var data=self.LBL.sortOutputData();
		if(__v){
			console.log("Labels is fed json: ");
			console.log(JSON.stringify(json));
			console.log("labels in json: "+JSON.stringify(json['labels']));
			console.log("LABELS OUTPUT DATA: "+JSON.stringify(data));
		}
		// copy labels manifest data and feed it into global JSON
	
		if(!json.labels) {
			var xtemp=$.extend(true,{},json);
			$.extend(xtemp,{'labels':[]});
			json=xtemp;
		}
		for(var l in data){
			if(__v) console.log("Label: "+JSON.stringify(data[l]));
			json.labels.push(data[l]);
		}
		if(__v) console.log("LABELS REPLACED json.labels: "+JSON.stringify(json));
		
		return json;
		
	}
};

