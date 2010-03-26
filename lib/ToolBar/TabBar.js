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
		this.attachARControls();
		
		this.tags=[];
		
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
		if(obj.imageLoaded){
			
			if(obj.curTag) obj.curTag.closeTagState();
			//add a new tag to the tab1 area
			var tag=new TileTag({loc:obj.tagHolder.attr("id"),index:obj.dateRand.getTime()});
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
		if(obj.curTag&&(obj.curTag.htmlindex!=tag.htmlindex)) obj.curTag.closeTagState();
		if(obj.docData[obj.currPage]&&obj.docData[obj.currPage].tags){
			//id refers to the index in docData[n]
			obj.curTag=tag;
			obj.docData[obj.currPage].tags[i]=tag;
		}
		
	},
	switchTag:function(e,i,tag){
		var obj=e.data.obj;
		if(obj.curTag&&(obj.curTag.htmlindex!=tag.htmlindex)) obj.curTag.closeTagState();
		if(obj.docData[obj.currPage]&&obj.docData[obj.currPage].tags){
			//id refers to the index in docData[n]
			obj.curTag=tag;
			obj.docData[obj.currPage].tags[i]=tag;
			
		}
		
	},
	setUpChoices:function(){
		var options=$("#tagChoiceList > option");
		
		for(o=0;o<options.length;o++){
			var opt=options[o];
			this.choices[$(opt).attr("id")]=$(opt).text();
			$(opt).click(function(e){
				$(this).trigger("optchosen",[$(this).attr("id")]);
			});
		}
	},
	//called from newPageData trigger
	//@data refers to the array of tag elements
	setNewPageData:function(e,data){
		var obj=e.data.obj;
		if(typeof data != "string"&&data!=null){
			obj.removeTags();
			obj.reloadTags(data);
		} else {
			obj.removeTags();
		}
		// if(!obj.docData[n]){
		// 			//create new node in array
		// 			var pageData={
		// 				tags:[],
		// 				index:obj.docData.length
		// 			};
		// 			
		// 			obj.docData[n]=pageData;
		// 			//remove all Tag DOM nodes from tab
		// 			obj.removeTags();
		// 		} else {
		// 			//remove all Tag DOM nodes from tab
		// 			obj.removeTags();
		// 			obj.reloadTags(obj.docData[n]);
		// 		}
		// 		obj.currPage=n;
		
	},
	reloadTags:function(data){
		for(d in data){
			if(data[d].tagEl) this.taggingArea.append(data[d].tagEl.DOM);
		}
	},	
	removeTags:function(){
		if(this.curTag) {this.curTag.closeTagState();
		this.curTag=null;
		}
		$(".tag").remove();
	}
});