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
		
		this.choiceTag=$("#tagChoice");
		this.choiceTagList=$("#tagChoiceList");
		this.choices=[];
		this.setUpChoices();
		this.attachARControls();
		
		this.docData=[];
		
		$("body").bind("addATag",{obj:this},this.displayChoices);
		$("body").bind("optchosen",{obj:this},this.addTag);
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
	addTag:function(e,id){
		var obj=e.data.obj;
		if(obj.imageLoaded){
			//add a new tag to the tab1 area
			obj.choiceTag.hide();
			if(id){
				var val=obj.choices[id];
			} else {
				//pick first of options
				var options=$("#tagChoiceList > option");
				var val=$(options[0]).text();
			}
			var tag=new TileTag({loc:obj.taggingArea.attr("id"),title:val});
			obj.docData[obj.currPage].tags.push(tag);
		}
	},
	displayChoices:function(e){
		var obj=e.data.obj;
		if(obj.imageLoaded){
			obj.choiceTag.show();
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
	setNewPageData:function(e,n){
		var obj=e.data.obj;
		if(!obj.docData[n]){
			//create new node in array
			var pageData={
				tags:[],
				index:obj.docData.length
			};
			
			obj.docData[n]=pageData;
			//remove all Tag DOM nodes from tab
			obj.removeTags();
		} else {
			//remove all Tag DOM nodes from tab
			obj.removeTags();
			obj.reloadTags(obj.docData[n]);
		}
		obj.currPage=n;
		
	},
	reloadTags:function(data){
		var tags=data.tags;
		for(t=0;t<tags.length;t++){
			var tag=tags[t];
			obj.taggingArea.append(tag.DOM);
		}
	},	
	removeTags:function(){
		$(".tag").remove();
	}
});