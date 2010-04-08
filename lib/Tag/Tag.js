/**
* Tag
* Object to recording metadata about a bound object in the 
* stage area of the interface
*
**/

var Tag=Monomyth.Class.extend({
	init:function(args){
		this.loc=$("#"+args.loc);
		this.index=args.index;
		
		this.htmlindex=$(".tag").length+"_"+this.index;
		this.name=this.htmlindex+"_name";
		this.loc.append($.ajax({
			url:'lib/Tag/Tag.php?id='+this.htmlindex,
			type:'text',
			async:false
		}).responseText);
		this.DOM=$("#tag_"+this.htmlindex);
		this.title=null;
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		//should have tagrules to populate the tag options element
		if(!args.tagRules) throw "No tagging rules sent to the Tag {Object}";
		this.tagRules=args.tagRules;
		this.shape=null;
		
		this.items=[];
		
		this.titleEl=$("#tagtitle_"+this.htmlindex);
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.index,obj]);
		});
		
		this.titleElText=$("#tagtitle_"+this.htmlindex+" > span");
		this.titleElText.hide();
		
		this.tagChoice=$("#tagChoice_"+this.htmlindex);
		
		this.tagChoiceList=$("#tagChoiceList_"+this.htmlindex);
		this.setTitleChoices();
		
		this.tagDel=$("#tagdel_"+this.htmlindex);
		this.tagDel.bind("click",{obj:this},this.deleteTag);
		this.attrBody=$("#tagAtr_"+this.htmlindex);
		
		this.editB=$("#tagedit_"+this.htmlindex);
				
		this.editB.bind("click",{obj:this},this.doneEdit);
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		//constructed, notify other objects this is the active element
		this.DOM.trigger("tagOpen",[this.index,this]);
		this.DOM.trigger("activateShapeBar");
		this.DOM.trigger("deactivateShapeDelete");
		//global listeners
		$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
	},
	//SET BY JSON {Object}
	setTitleChoices:function(){
		//set by tagRules (see init constructor)
		for(r in this.tagRules){
			var o=$("<option></option>").val(this.tagRules[r].name).attr("id",function(){
				var d=new Date();
				return "opt_"+d.getTime();
			}).text(this.tagRules[r].name);
			this.tagChoiceList.append(o);
		}
		//OLD: pre-loaded method
		// var options=$("#"+this.tagChoiceList.attr("id")+" > option");
		// 		this.items=[];
		// 		for(i=0;i<options.length;i++){
		// 			var item=$(options[i]);
		// 			this.items[item.attr("id")]={html:item,title:item.val()};
		// 			item.click(function(e){
		// 				$(this).trigger("titleOptionClicked",[$(this).attr("id")]);
		// 			});
		// 			if(!this.title) this.title=item.val();
		// 		}
		
	},
	titleOptionClickHandle:function(e,id){
		var obj=e.data.obj;
		if(id!=null){
			//user has defined what title they want
			obj.title=obj.items[id].title;
		} 
	},
	setTitle:function(){
		this.tagChoice.hide();
		this.titleElText.text(this.title);
		this.titleElText.show();
	},
	toggleTagState:function(e,id,tag){
		var obj=e.data.obj;
		obj.titleEl.toggleClass("open");
		obj.titleEl.toggleClass("closed");
		if(obj.titleEl.hasClass("closed")){
			//being turned off (collapsing box)
			obj.editB.hide();
			obj.attrBody.hide();
			obj.setTitle();
		//	obj.DOM.trigger('deactivateShapeDelete');
			//obj.DOM.trigger("deactivateShapeBar");
			//
			// 
			// $("body").unbind("shapeRemoved",obj.shapeRemoved);
			$("body").unbind("deleteCurrentShape",obj.deleteShape);
			//if no shape, then must retrieve shape (if exists)
		 	if(obj.mainRegion){
				//get shape data and update coord text
				obj.mainRegion.listenOff();
				
			} 
		} else if(obj.titleEl.hasClass("open")){
			//being turned back on (opening the box)
			obj.editB.show();
			obj.attrBody.show();
			obj.titleElText.hide();
			obj.tagChoice.show();
		
			if(obj.mainRegion){
				obj.mainRegion.listenOn();
				obj.DOM.trigger("deactivateShapeBar");
				obj.DOM.trigger("activateShapeDelete");
				$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
			} else {
				obj.DOM.trigger("deactivateShapeDelete");
				obj.DOM.trigger("activateShapeBar");
				$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
			}
		}
	},
	//closes the tag state when another tag is opened
	//called externally
	closeTagState:function(){	
		if(this.titleEl.hasClass("open")){
			this.titleEl.removeClass("open");
			if(!this.titleEl.hasClass("closed")) this.titleEl.addClass("closed");
			this.editB.hide();
			this.attrBody.hide();
			this.setTitle();
			//this.DOM.trigger('deactivateShapeDelete');
			//this.DOM.trigger("deactivateShapeBar");	
			$("body").unbind("deletCurrentShape",this.deleteShape);
			//$("body").unbind("shapeRemoved",this.shapeRemoved);
			if(this.mainRegion){
				this.mainRegion.listenOff();
			
			} else {
				$("body").unbind("shapeCommit",this.ingestCoordData);
			}
		}
	},
	deleteTag:function(e){
		if(e){
			var obj=e.data.obj;
			obj.DOM.trigger("tagDeleted",[obj.index,obj]);
			obj.mainRegion.destroy(obj.shape.index);
			obj.mainRegion=null;
			obj.shape=null;
			obj.DOM.remove();
		} else {
			this.DOM.trigger("tagDeleted",[this.index,this]);
			this.mainRegion.destroy(this.shape.index);
			this.mainRegion=null;
			this.shape=null;
			this.DOM.remove();
		}
	},
	editTag:function(e){
		var obj=e.data.obj;
	
		obj.editB.removeClass("lock");
		obj.editB.addClass("unlock");
		obj.editB.unbind("click");
		if(obj.shape){
			obj.shape.releaseAnchor();
		} else {
			obj.DOM.trigger("activateShapeBar",[obj.index]);
		}
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
	},
	reloadListeners:function(img,svg){
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.index,obj]);
		});
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		if(this.mainRegion){
			this.mainRegion.reloadShape(img,svg);
		}
	},
	doneEdit:function(e){
		//shape and all other data are now locked
		var obj=e.data.obj;
		obj.editB.removeClass("unlock");
		obj.editB.addClass("lock");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		obj.DOM.trigger("deactivateShapeBar");
		
		if(obj.mainRegion){
			obj.mainRegion.anchorOn();
		}
	},
	//NEW: VectorDrawer Object sends out the coord data
	//wrapped in json-like object
	//Old: @shape,@coords
	//NEW: @shape: Associative array of shape attributes
	ingestCoordData:function(e,shape){
		var obj=e.data.obj;
		obj.shape=shape.cur;
	
		obj.mainRegion=new TagRegion({
			loc:obj.attrBody,
			shape:shape,
			name:"mainRegion"+obj.htmlindex,
			htmlID:obj.htmlindex,
			initCoords:shape.args
		});
		$("body").unbind("shapeCommit",obj.ingestCoordData);
		$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
		obj.DOM.trigger("deactivateShapeBar");
		//new shape is added
		obj.DOM.trigger("shapeAdded",[obj,shape]);
	},
	deleteShape:function(e){
		var obj=e.data.obj;
		if(obj.mainRegion.destroy(obj.shape.index)){
			obj.shape=null;
			obj.mainRegion=null;
			$("body").unbind("deleteCurrentShape",obj.deleteShape);
			$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
			obj.DOM.trigger("deactivateShapeDelete");
		}
	},
	fillTagTitleSelect:function(){
		//set by tagRules (see init constructor)
		$.each(this.tagRules,function(i,r){
			var o=$("<option></option>").val(r.name).attr("id",function(){
				var d=new Date();
				return "opt_"+d.getTime();
			}).text(r.name);
			this.titleSelect.append(o);
			
		});
		// this.titleSelect.children("option").each(function(ind,el){
		// 			$(el).click(function(e){
		// 				$(this).trigger("changeTitleDone",[$(this).text()]);
		// 			});
		// 		});
	},
	bundleData:function(){
		//return part of JSON object
		var j=[];
		var jsontag="{";
		jsontag+="uid:"+this.htmlindex+",name:"+this.name+",shapeId:"+this.mainRegion.id+"}";
		j[0]=jsontag;
		j[1]=(obj.mainRegion)?obj.mainRegion.bundleData():null;
	
		return j;
	}
	
});