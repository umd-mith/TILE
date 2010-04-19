/**
* Tag
* Object to recording metadata about a bound object in the 
* stage area of the interface
*
**/

var Tag=Monomyth.Class.extend({
	init:function(args){
		this.loc=$("#"+args.loc);
		var d=new Date();
		
		this.htmlindex=(args.htmlindex)?args.htmlindex:$(".tag").length+"_"+d.getTime();
		this.name=this.htmlindex+"_name";
		this.loc.append($.ajax({
			url:'lib/Tag/Tag.php?id='+this.htmlindex,
			type:'text',
			async:false
		}).responseText);
		this.DOM=$("#tag_"+this.htmlindex);
		this.title="Undefined"+this.htmlindex;
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		
		//should have tagrules to populate the tag options element
		if(!args.tagRules) throw "No tagging rules sent to the Tag {Object}";
		this.tagRules=args.tagRules;
		this.shapeId=(args.shapeId)?args.shapeId:null;
		
		this.items=[];
		this.attrs=[];
		this._display=true;
		this._edit=true;
		this.titleEl=$("#tagtitle_"+this.htmlindex);
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.htmlindex,obj]);
		});
		
		this.titleElText=$("#tagtitle_"+this.htmlindex+" > span");
		this.titleElText.hide();
		
		this.titleInputArea=$("#tagTitleInput_"+this.htmlindex);
		this.titleInputArea.val(this.title);
		
	 	this.tagChoice=$("#tagChoice_"+this.htmlindex);
	 		
		 this.tagChoiceList=$("#tagChoiceList_"+this.htmlindex);
		
		this.tagDel=$("#tagdel_"+this.htmlindex);
		this.tagDel.bind("click",{obj:this},this.deleteTag);
		this.attrBody=$("#tagAtr_"+this.htmlindex);
		
		this.editB=$("#tagedit_"+this.htmlindex);
				
		this.editB.bind("click",{obj:this},this.doneEdit);
		
		this.setTitleChoices();
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		//constructed, notify other objects this is the active element
		this.DOM.trigger("tagOpen",[this.htmlindex,this]);
		this.DOM.trigger("activateShapeBar");
		this.DOM.trigger("deactivateShapeDelete");
		//global listeners
		$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
		
		if(this.shapeId){
			
		}
	},
	//SET BY JSON {Object}
	setTitleChoices:function(){
		//set by tagRules (see init constructor)
		//set up selection for first-level tags
		
		
		//get topleveltags
		for(id in this.tagRules.topLevelTags){
			var n=this.tagRules.topLevelTags[id];
			for(tg in this.tagRules.tags){
				var T=this.tagRules.tags[tg];
				if(T.uid==n){
					var o=$("<option></option>").val(T.name).attr("id",function(){
						var d=new Date();
						return "opt_"+d.getTime();
					}).text(T.name);
					this.tagChoiceList.append(o);
					this.items[o.attr('id')]={html:o,title:o.val(),rules:{optional:T.optional,valueType:T.valueType,childNodes:T.childNodes}};
					o.click(function(e){
						$(this).trigger("titleOptionClicked",[$(this).attr("id")]);
					});
					if(!this._rules) {
						this._rules=this.items[o.attr("id")].rules;
					}
				}
			}
		}
		//this.setTagAttr();
	},
	titleOptionClickHandle:function(e,id){
		var obj=e.data.obj;
		if(id!=null){
			//user has defined what title they want
		//	obj.title=obj.items[id].title;
			obj._rules=obj.items[id].rules;			
			obj.setTagAttr();
		} 
	},
	setTitle:function(){
		this.title=this.titleInputArea.val().replace(/\n+\s+\t/g,"%");
		this.titleInputArea.removeClass("edit").addClass("locked");
		// this.tagChoice.hide();
		
		this.titleElText.text(this.title);
		this.titleElText.show();
	},
	setTagAttr:function(){
		if(this.attrs.length>0){
			$.each(this.attrs,function(i,a){
				a.destroy();
			});
		}
		if(this._rules){
			this.attrs=[];
			var a=new NameValue({
				loc:this.attrBody,
				id:this.attrBody.attr("id"),
				rules:this._rules
			});
			this.attrs.push(a);
		}
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
			$("body").unbind("deleteCurrentShape",obj.deleteShape);
			//if no shape, then must retrieve shape (if exists)
		 	if(obj.mainRegion){
				//get shape data and update coord text
				obj.mainRegion.listenOff();
			} else {
				$("body").unbind('shapeCommit',obj.ingestCoordData);
			}
		} else if(obj.titleEl.hasClass("open")){
			//being turned back on (opening the box)
			obj.titleInputArea.removeClass("locked").addClass("edit").val(obj.titleElText.text());
			obj.editB.show();
			obj.attrBody.show();
			obj.titleElText.hide();
			obj.tagChoice.show();
			if(obj.mainRegion&&obj._display){
				obj.mainRegion.listenOn();
				obj.DOM.trigger("deactivateShapeBar");
				if(obj._edit) obj.DOM.trigger("activateShapeDelete");
				$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
			} else if(obj._display){
				if(obj._edit) obj.DOM.trigger("activateShapeBar");
				//obj.DOM.trigger("activateShapeBar");
				$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
			} else {
				obj.DOM.trigger("deactivateShapeDelete");
				obj.DOM.trigger("deactivateShapeBar");
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
			$("body").unbind("deleteCurrentShape",this.deleteShape);
			//$("body").unbind("shapeRemoved",this.shapeRemoved);
			if(this.mainRegion){
				this.mainRegion.listenOff();
			} else {
				$("body").unbind("shapeCommit",this.ingestCoordData);
			}
		}
	},
	//show nothing until reset - opposite is displayOn() function
	displayOff:function(){
		this._display=false;
		if(this.titleEl.hasClass("open")){
			this.trigger("toggleTagState",[this.DOM.attr('id'),this]);
		}
	},
	//opposite is displayOff() function
	displayOn:function(){
		this._display=true;
		if(this.titleEl.hasClass("open")){
			this.DOM.trigger("toggleTagState",[this.DOM.attr('id'),this]);
		}
	},
	//for showing up all the shapes at once - tag doesn't open
	showcase:function(){
		//if display is off, then it is now on
		this._display=true;
		if(this.mainRegion){
			this.mainRegion.showcase();
		}
	},
	deleteTag:function(e){
		if(e){
			var obj=e.data.obj;
			obj.DOM.trigger("tagDeleted",[obj.htmlindex,obj]);
			obj.mainRegion.destroy(obj.shape.index);
			obj.mainRegion=null;
			obj.shape=null;
			obj.DOM.remove();
		} else {
			this.DOM.trigger("tagDeleted",[this.htmlindex,this]);
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
		obj._edit=true;
		$.each(obj.attrs,function(i,a){
			a.edit();
		});
		if(obj.mainRegion){
			obj.mainRegion.anchorOff();
			obj.DOM.trigger("activateShapeDelete");
		} else {
			obj.DOM.trigger("activateShapeBar",[obj.index]);
			obj.DOM.trigger("deactivateShapeDelete");
		}
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
	},
	reloadListeners:function(){
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.index,obj]);
		});
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		
	},
	doneEdit:function(e){
		//shape and all other data are now locked
		var obj=e.data.obj;
		obj.editB.removeClass("unlock");
		obj.editB.addClass("lock");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		
		obj.DOM.trigger("turnOffShapeBar");
		obj._edit=false;
		$.each(obj.attrs,function(i,a){
			a.save();
		});
		if(obj.mainRegion){
			obj.mainRegion.anchorOn();
		}
	},
	//NEW: load shape based solely on its ID
	//NOT passed a shape object, just uses this.shapeId
	loadJSONShape:function(){
		if(this.mainRegion) this.mainRegion.destroy();
		
		this.mainRegion=new TagRegion({
			loc:this.attrBody,
			name:"mainRegion"+this.htmlindex,
			shapeId:this.shapeId
		});
	},
	//NEW: VectorDrawer Object sends out the coord data
	//wrapped in json-like object
	//Old: @shape,@coords
	//NEW: @shape: Associative array of shape attributes
	ingestCoordData:function(e,shape){
		var obj=e.data.obj;
		if(!obj.mainRegion){
			obj.shapeId=shape.id;
	
			obj.mainRegion=new TagRegion({
				loc:obj.attrBody,
				shape:shape,
				name:"mainRegion"+obj.htmlindex,
				shapeId:obj.shapeId
			});
			$("body").unbind("shapeCommit",obj.ingestCoordData);
			$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
			obj.DOM.trigger("activateShapeDelete");
			//new shape is added
			obj.DOM.trigger("shapeAdded",[obj,shape]);
		}
	},
	deleteShape:function(e){
		var obj=e.data.obj;
		if(obj.mainRegion.destroy()){
			obj.shapeId=null;
			obj.mainRegion=null;
			$("body").unbind("deleteCurrentShape",obj.deleteShape);
			$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
			obj.DOM.trigger("deactivateShapeDelete");
		}
	},
	removeTag:function(){
		this.closeTagState();
		this.DOM.remove();
	},
	bundleData:function(){
		//return part of JSON object
		var j=[];
		var jsontag={"uid":this.htmlindex,"name":this.name,"shapeId:":(this.mainRegion)?this.mainRegion.shape.id:null};
		// var jsontag="{";
		// 		jsontag+="uid:"+this.htmlindex+",name:"+this.name+",shapeId:"+this.mainRegion.id+"}";
		j[0]=jsontag;
		j[1]=(this.mainRegion)?this.mainRegion.bundleData():null;
		return j;
	}
	
});