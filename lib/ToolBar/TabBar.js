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
		
		//for generating random index values for tags
		this.dateRand=new Date();
		
		//tab1 handles all tags and tagging attributes
		this.tab1=$("#TABONE");
		this.tab2=$("#TABTWO");
		
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
		this.recognizeArea=$("#tabs-2");
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
		this.taggingArea.bind("toggleTagState",{obj:this},this.switchTag);
		this.taggingArea.bind("addATag",{obj:this},this.addTag);
		this.taggingArea.bind("tagDeleted",{obj:this},this.tagDeletedHandle);
		//global binds
		$("body").bind("imageAdded",{obj:this},function(e){
			var obj=e.data.obj;
			obj.imageLoaded=true;
		});
		$("body").bind("newPageLoaded",{obj:this},this.setNewPageData);
		$("body").bind("tagRulesSet",{obj:this},this.initTagRules);
		
		$("body").bind("shapeSelect",{obj:this},this.shapeDisplayHandle);
		
	},
	//NEW: ingest the tag rules for each tag in @tagrules
	initTagRules:function(e,tagrules){
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
			
			var tag=new TileTag({loc:obj.tagHolder.attr("id"),index:obj.dateRand.getTime(),tagRules:obj.tagRules});
			obj.tags.push(tag);
		}
	},
	tagDeletedHandle:function(e,i,tag){
		var obj=e.data.obj;
		if(obj.imageLoaded){
			jQuery.grep();
		}
	},
	setOpenTag:function(e,i,tag){
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
	//called from newPageData trigger
	//@data refers to the array of tag elements
	setNewPageData:function(e,data,img,svg){
		var obj=e.data.obj;
		//changing pages, reset shapebar
		obj.DOM.trigger("turnOffShapeBar");
		if(typeof data != "string"&&data!=null){
			obj.removeTags();
			obj.reloadTags(data,img,svg);
		} else {
			obj.removeTags();
		}
	},
	reloadTags:function(data,img,svg){
		//@data: associative array with page data
		for(d in data){
			if(data[d].tagEl) {
				this.tagHolder.append(data[d].tagEl.DOM);
				this.tags.push(data[d].tagEl);
				data[d].tagEl.reloadListeners(img,svg);
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
	}
});