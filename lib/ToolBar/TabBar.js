var TabBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("#"+args.loc);
		this.DOM.append($.ajax({
			async:false,
			url:'lib/ToolBar/TabBar.html',
			type:'GET',
			dataType:'html'
		}).responseText);
	}
});

var TileTabBar=TabBar.extend({
	init:function(args){
		this.$super(args);
		this.imageLoaded=false;
		this.curTag=null;
		//massive manifest file for all tags
		this.manifest=[];
		
		//for generating random index values for tags
		this.dateRand=new Date();
		
		//tab1 handles all tags and tagging attributes
		this.tab1=$("#TABONE");
	
		this.protoTab=$("#tabs");
		this.protoTab.tabs({
			select:function(e,ui){
				switch(ui.index){
					case 0:
						$(this).trigger('tagging');
						break;
					case 1:
						$(this).trigger('autorecognize');
						break;
				}
			}
		});
		
		this.taggingArea=$("#tabs-1");
		
		this.addTagB=$("#addTag");
		this.addTagB.click(function(e){
			$(this).trigger("addATag");
		});
		
		this.tagHolder=$("#tagHolder");
		//this.attachARControls();
		this.tags=[];
		this.tagRules=null;
		//local binds
		this.taggingArea.bind("tagOpen",{obj:this},this.setOpenTag);
		this.taggingArea.bind("toggleTagState",{obj:this},this.setOpenTag);
		this.taggingArea.bind("addATag",{obj:this},this.addTag);
		this.taggingArea.bind("tagDeleted",{obj:this},this.tagDeletedHandle);
		
		//global binds
		$("body").bind("imageAdded",{obj:this},function(e){
			var obj=e.data.obj;
			obj.imageLoaded=true;
		});
		$("body").bind("newPageLoaded",{obj:this},this.setNewPageData);
		$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
		$("body").bind("deleteCurrentShape",{obj:this},this.deleteShapeHandle);
		$("body").bind("shapeSelect",{obj:this},this.shapeDisplayHandle);
		
	},
	//NEW: ingest the tag rules for each tag in @tagrules
	initTagRules:function(e,tagrules,p){
		var obj=e.data.obj;
		
		obj.tagRules=tagrules;
		// for(t in tagrules){
		// 			var r=tagrules[t];
		// 			for(i in r){
		// 				//each i represents a given rule attr
		// 				//i[r] is the value of the attr
		// 				
		// 			}
		// 		}
	},
	attachARControls:function(){
		this.arcontrols=new TileAutoRecognizerTools({
			loc:this.recognizeArea
		});
		//set back to tagging tab
		this.protoTab.tabs('select',0);
	},
	addTag:function(e){
		var obj=e.data.obj;
		if(obj.imageLoaded&&obj.tagRules){
			
			if(obj.curTag) obj.curTag.closeTagState();
			//add a new tag to the tab1 area
			
			var tag=new TileTag({loc:obj.tagHolder.attr("id"),tagRules:obj.tagRules});
			
		}
	},
	//received once a tag is completed constructor call - 
	//add to manifest
	setOpenTag:function(e,i,tag){
		var obj=e.data.obj;
		
		if(!obj.curTag) obj.curTag=tag;
		if(tag.htmlindex!=obj.curTag.htmlindex){
			obj.curTag.closeTagState();
			obj.curTag=tag;
		}
		if(!obj.curUrl) return;
		//if new tag, set up mini-manifest
		if(!obj.manifest[obj.curUrl][tag.htmlindex]){
			obj.manifest[obj.curUrl][tag.htmlindex]={tagEl:tag,shapeId:tag.shapeId,n:obj.manifest[obj.curUrl].length};
		}
		obj.curTag=obj.manifest[obj.curUrl][tag.htmlindex].tagEl;
		
		// var check=$.grep(obj.manifest[obj.curUrl],function(o,i){
		// 			return (o.htmlindex==tag.htmlindex);
		// 		});
		// 		if(check.length>0){
		// 			obj.curTag=
		// 		}
	},
	switchTag:function(e,i,tag){
		var obj=e.data.obj;
		if(!obj.curTag) obj.curTag=tag;
		if(tag.htmlindex!=obj.curTag.htmlindex){
			obj.curTag.closeTagState();
			obj.curTag=tag;
			// for(p=0;p<obj.tags.length;p++){
			// 				var t=obj.tags[p];
			// 				if(t.htmlindex!=tag.htmlindex){
			// 					t.closeTagState();
			// 				}
			// 			}
		}
	},
	tagDeletedHandle:function(e,i,tag){
		var obj=e.data.obj;
		if(obj.imageLoaded){
			if(obj.manifest[obj.curUrl][i]){
				obj.manifest[obj.curUrl][i]=null;
			}
		}
	},
	deleteShapeHandle:function(e){
		var obj=e.data.obj;
		if(obj.curTag) obj.curTag.deleteShape();
	},
	//called from newPageData trigger
	//@data refers to the array of tag elements
	setNewPageData:function(e,data,url){
		var obj=e.data.obj;
		obj.tags=[];
		//changing pages, reset shapebar
		//first clear out all tags
		if(obj.manifest[obj.curUrl]){
			var u=obj.manifest[obj.curUrl];
			for(tag in u){
				
				if(u[tag].tagEl){
					u[tag].tagEl.removeTag();
				}
			}
		}
		//reset shapebar
		obj.DOM.trigger("turnOffShapeBar");
		if(url){
			obj.curUrl=url;
			if(!obj.manifest[obj.curUrl]){
				//make new manifest section for this page
				obj.manifest[obj.curUrl]=[];
			} else {
				//reload tags 
				obj.reloadTags(obj.manifest[obj.curUrl]);
			}
		}
	},
	reloadTags:function(data){
		//@data: associative array with page data
		for(d in data){
			if(data[d].tagEl) {
				this.tagHolder.append(data[d].tagEl.DOM);
				this.tags.push(data[d].tagEl);
				data[d].tagEl.reloadListeners();
			}
		}
	},	
	loadJSONTags:function(data,curUrl){
		this.manifest=[];
		//set up all tags and remove them
		for(d in data){
			//clear manifest array of tags
			this.manifest[data[d].uri]=[];
			for(t in data[d].tags){
				var tg=data[d].tags[t];
				var cd=new TileTag({loc:this.tagHolder.attr("id"),htmlindex:tg.uid,tagRules:this.tagRules,shapeId:tg.shapeId});
				this.manifest[data[d].uri][tg.uid]={tagEl:cd};
				this.manifest[data[d].uri][tg.uid].tagEl.removeTag();
			}
		}
		this.curUrl=curUrl;
		this.tags=[];
		if(this.manifest[this.curUrl]){
			for(d in this.manifest[this.curUrl]){
				if(this.manifest[this.curUrl][d].tagEl) {
					this.tagHolder.append(this.manifest[this.curUrl][d].tagEl.DOM);
					this.tags.push(this.manifest[this.curUrl][d].tagEl);
					this.manifest[this.curUrl][d].tagEl.reloadListeners();
				}
			}
		}
	},
	removeTags:function(){
		//make sure to close all listeners
		if(this.curTag) {
			this.curTag.closeTagState();
			this.curTag=null;
		}
		//remove DOM elements from tagHolder
		$("#"+this.tagHolder.attr('id')+" > .tag").remove();
		//reset the array - new set of tags will be loaded
		this.tags=[];
	},
	clearCurrentTags:function(){
		this.removeTags();
		this.DOM.trigger("turnOffShapeBar");
	},
	shapeDisplayHandle:function(e,d){
		var obj=e.data.obj;
		switch(d){
			case 'all':
				$.each(obj.tags,function(i,t){
					t.showcase();
				});
				break;
			case 'none':
				$.each(obj.tags,function(i,t){
					t.displayOff();
				});
				break;
			case 'current':
				$.each(obj.tags,function(i,t){
					t.displayOn();
				});
				obj.curTag.displayOn();
				break;
		}
	},
	bundleData:function(){
		var tbjson=[];
		//compress manifest into a JSON structure
		for(u in this.manifest){
			for(s in this.manifest[u]){
				if(this.manifest[u][s]&&this.manifest[u][s].tagEl){
					var x=this.manifest[u][s].tagEl;
					tbjson.push({'uid':x.htmlindex,'name':x.name,'value':'null','shapeId':x.shapeId});
				}
			}
		}
		return tbjson;
	}
});