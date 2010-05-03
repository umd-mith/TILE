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
		this.TL=[];
		this.tagRules=null;
		//local binds
		this.taggingArea.bind("tagOpen",{obj:this},this.setOpenTag);
		this.taggingArea.bind("toggleTagState",{obj:this},this.setOpenTag);
		this.taggingArea.bind("addATag",{obj:this},this.addTag);
		this.taggingArea.bind("tagDeleted",{obj:this},this.tagDeletedHandle);
		
		//local binds
		this.DOM.bind("changeOrder",{obj:this},this.changeTagOrder);
		
		//global binds
		$("body").bind("imageAdded",{obj:this},function(e){
			var obj=e.data.obj;
			obj.imageLoaded=true;
		});
		$("body").bind("newPageLoaded",{obj:this},this.setNewPageData);
		$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
		$("body").bind("deleteCurrentShape",{obj:this},this.deleteShapeHandle);
		$("body").bind("shapeSelect",{obj:this},this.shapeDisplayHandle);
		
		//make tagHolder into a sortable list (see JQuery UI)
		this.createSortable();
	},
	createSortable:function(){
		//using jQuery sortable command
		this.tagHolder.sortable({
			items:'li',
			handle:'a.moveTag',
			scroll:true,
			containment:'parent', //contained within this.tagHolder > ul
			stop:function(e,ui){
				if ($(ui.item)) {
					$(this).trigger("changeOrder", [ui]);
				}
			}
		});
	},
	changeTagOrder:function(e,ui){
		var obj=e.data.obj;
		//update larger tag list
		//create array if none exists
		if(!obj.TL[obj.curUrl]) obj.TL[obj.curUrl]=[];
		//store the UI toArray list of id's into the array - sorted later in bundleData
		obj.TL[obj.curUrl]=obj.tagHolder.sortable('toArray');
		
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
			//create new sortable
			
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
		if(!obj.manifest[obj.curUrl][tag.uid]){
			obj.manifest[obj.curUrl][tag.uid]={tagEl:tag,shapeId:tag.shapeId,n:obj.manifest[obj.curUrl].length};
		}
		obj.curTag=obj.manifest[obj.curUrl][tag.uid].tagEl;
		//update the TL list
		var d=[];
		$("#"+obj.tagHolder.attr('id')+" > li").each(function(){
			d.push($(this).attr('id'));
		});
		obj.TL[obj.curUrl]=d;
	},
	switchTag:function(e,i,tag){
		var obj=e.data.obj;
		if(!obj.curTag) obj.curTag=tag;
		if(tag.htmlindex!=obj.curTag.htmlindex){
			obj.curTag.closeTagState();
			obj.curTag=tag;
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
		//hide DOM elements that are in tagHolder
		$("#"+obj.tagHolder.attr('id')+" > .tag").hide();
		// if(obj.manifest[obj.curUrl]){
		// 		var u=obj.manifest[obj.curUrl];
		// 		for(tag in u){
		// 			if(u[tag].tagEl){
		// 				u[tag].tagEl.hide();
		// 			}
		// 		}
		// 	}
		//reset shapebar
		obj.DOM.trigger("turnOffShapeBar");
		if(url){
			obj.curUrl=url;
			if(!obj.TL[obj.curUrl]) obj.TL[obj.curUrl]=[];
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
				data[d].tagEl.DOM.show();
				//this.tagHolder.append(data[d].tagEl.DOM);
				this.tags.push(data[d].tagEl);
				data[d].tagEl.reloadListeners();
				data[d].tagEl.closeTagState();
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
				var cd=new TileTag({loc:this.tagHolder.attr("id"),htmlindex:tg.uid,title:tg.name,tagRules:this.tagRules,shapeId:tg.shapeId});
				this.manifest[data[d].uri][tg.uid]={tagEl:cd};
				//hide the jQuery object	
				this.manifest[data[d].uri][tg.uid].tagEl.DOM.hide();
			}
		}
		this.curUrl=curUrl;
		this.tags=[];
		if(this.manifest[this.curUrl]){
			for(d in this.manifest[this.curUrl]){
				if(this.manifest[this.curUrl][d].tagEl) {
					this.manifest[this.curUrl][d].tagEl.DOM.show();
					//this.tagHolder.append(this.manifest[this.curUrl][d].tagEl.DOM);
					this.tags.push(this.manifest[this.curUrl][d].tagEl);
					this.manifest[this.curUrl][d].tagEl.reloadListeners();
					this.manifest[this.curUrl][d].tagEl.closeTagState();
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
		//hide DOM elements that are in tagHolder
		$("#"+this.tagHolder.attr('id')+" > .tag").hide();
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
				//	t.toggle();
					t.closeTagState();
				});
				break;
			case 'none':
				$.each(obj.tags,function(i,t){
					t.closeTagState();
				});
				break;
			case 'current':
				$.each(obj.tags,function(i,t){
					t.closeTagState();
				});
				if(obj.curTag) obj.curTag.displayOn();
				break;
		}
	},
	bundleData:function(){
		var tbjson=[];
		//compress manifest into a JSON structure
		for(u in this.manifest){
			var curl={url:u,tags:[]};
			//go through stored order of tags
			for(s in this.TL[u]){
				if(this.manifest[u][this.TL[u][s]]&&this.manifest[u][this.TL[u][s]].tagEl){
					var x=this.manifest[u][this.TL[u][s]].tagEl;
					curl.tags.push({'url':u,'uid':x.htmlindex,'name':x.title,'value':'null','shapeId':x.shapeId});
				}
			}
			tbjson.push(curl);
		}
		return tbjson;
	}
});