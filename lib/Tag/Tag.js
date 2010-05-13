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
		this.uid="tag_"+this.htmlindex;
		this.DOM=$("#tag_"+this.htmlindex);
		this.title=(args.title)?args.title:"Undefined";
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		
		//should have tagrules to populate the tag options element
		if(!args.tagRules) throw "No tagging rules sent to the Tag {Object}";
		this.tagRules=args.tagRules;
		this.shapeId=(args.shapeId)?args.shapeId:null;
		this.json=(args.json)?args.json:null;
		this.values=(args.values)?args.values:null;
		this.moveMe=$("#"+this.htmlindex+"_moveMe");
		
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
		this.titleElText.click(function(e){
			$(this).trigger("titleSet");
		});
		
		this.titleInputArea=$("#tagTitleInput_"+this.htmlindex);
		this.titleInputArea.val(this.title);
		this.titleInputArea.blur(function(e){
			e.preventDefault();
			$(this).trigger("titleSet");
		});
		
		
		this.tagDel=$("#tagdel_"+this.htmlindex);
		this.tagDel.bind("click",{obj:this},this.deleteTag);
		this.attrBody=$("#tagAtr_"+this.htmlindex);
		
		this.editB=$("#tagedit_"+this.htmlindex);
				
		this.editB.bind("click",{obj:this},this.doneEdit);
		
		
		this.setTitleChoices();
		
	//	this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		this.DOM.bind("titleSet",{obj:this},this.setTitle);
		//constructed, notify other objects this is the active element
		this.DOM.trigger("tagOpen",[this.htmlindex,this]);
		this.DOM.trigger("activateShapeBar");
		this.DOM.trigger("deactivateShapeDelete");
		//global listeners
		$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
		
		if(this.shapeId&&this.json){
			this.loadJSONShape();
		}
		
	},
	//SET BY JSON {Object}
	setTitleChoices:function(){
		//set by tagRules (see init constructor)
		//set up selection for first-level tags
		//use the NameValue object to do toplevel tags - handles other values
		this.NV=new TileNameValue({
			loc:this.attrBody,
			rules:this.tagRules,
			json:this.json,
			values:this.values
		});
	},
	//NEW: load shape based solely on its ID
	//NOT passed a shape object, just uses this.shapeId
	loadJSONShape:function(){
		if(this.mainRegion) this.mainRegion.destroy();
		//create shape object from stored JSON data
		//match up data first
		var shape=null;
		
		for(o in this.json){
			if(this.json[o].shapes){
				for(sh in this.json[o].shapes){
					if(this.json[o].shapes[sh].uid==this.shapeId){
						shape=this.json[o].shapes[sh].points;
						break;
					}
				}
				
			}
		}
		
		if(!shape) shape=this.shapeId;
		this.mainRegion=new TagRegion({
			loc:this.attrBody,
			name:"mainRegion"+this.htmlindex,
			shapeId:this.shapeId,
			shape:shape
		});
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
	//can be triggered by setTitle or called externally
	setTitle:function(e){
		if(e){
			var obj=e.data.obj;
			//check if titleInput is hidden or not - if class set to locked, hidden
			if(obj.titleInputArea.hasClass("locked")){
				obj.titleElText.hide();
				//open input area and set value to stored title
				obj.titleInputArea.removeClass("locked").addClass("edit");
				obj.titleInputArea.val(obj.title);
			} else {
				obj.title=obj.titleInputArea.val().replace(/\n+\s+\t/g,"%");
		
				obj.titleInputArea.removeClass("edit").addClass("locked");
				// this.tagChoice.hide();
		
				obj.titleElText.text(obj.title);
				obj.titleElText.show();
			}
		} else {
			this.title=this.titleInputArea.val().replace(/\n+\s+\t/g,"%");
		
			this.titleInputArea.removeClass("edit").addClass("locked");
			// this.tagChoice.hide();
		
			this.titleElText.text(this.title);
			this.titleElText.show();
		}
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
	// toggleTagState:function(e,id,tag){
	// 	var obj=e.data.obj;
	// 	obj.titleEl.toggleClass("open");
	// 	obj.titleEl.toggleClass("closed");
	// 	if(obj.titleEl.hasClass("closed")){
	// 		//being turned off (collapsing box)
	// 		obj.editB.hide();
	// 		obj.attrBody.hide();
	// 		obj.setTitle();
	// 	
	// 		//if no shape, then must retrieve shape (if exists)
	// 	 	if(obj.mainRegion){
	// 			//get shape data and update coord text
	// 			obj.mainRegion.listenOff();
	// 		} else {
	// 			$("body").unbind('shapeCommit',obj.ingestCoordData);
	// 		}
	// 		obj.DOM.trigger("turnOffShapeBar");
	// 		
	// 	} else if(obj.titleEl.hasClass("open")){
	// 		//being turned back on (opening the box)
	// 		obj.titleInputArea.removeClass("locked").addClass("edit").val(obj.titleElText.text());
	// 		obj.editB.show();
	// 		obj.attrBody.show();
	// 		obj.titleElText.hide();
	// 		if(obj.mainRegion&&obj._display){
	// 			obj.mainRegion.listenOn();
	// 			//obj.DOM.trigger("deactivateShapeBar");
	// 			obj.DOM.trigger("activateShapeDelete");
	// 			//$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
	// 		} else if(obj._display){
	// 			if(obj._edit) {obj.DOM.trigger("activateShapeBar");}
	// 			//obj.DOM.trigger("activateShapeBar");
	// 			$("body").bind("shapeCommit",{obj:obj},obj.ingestCoordData);
	// 		} else {
	// 			obj.DOM.trigger("turnOffShapeBar");
	// 		}
	// 	}
	// },
	openTagState:function(){
		if(this.titleEl.hasClass("closed")){
			this.titleEl.removeClass('closed').addClass('open');
			
			//being turned back on (opening the box)
			this.titleInputArea.removeClass("locked").addClass("edit").val(this.titleElText.text());
			this.editB.show();
			this.attrBody.show();
			this.titleElText.hide();
			if(this.mainRegion&&this._display){
				this.mainRegion.listenOn();
				//obj.DOM.trigger("deactivateShapeBar");
				this.DOM.trigger("activateShapeDelete");
				//$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
			} else if(this._display){
				if(this._edit) {
					this.DOM.trigger("activateShapeBar");
				} else {
					this.DOM.trigger("turnOffShapeBar");
				}
				//obj.DOM.trigger("activateShapeBar");
				$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
			} else {
				this.DOM.trigger("turnOffShapeBar");
			}
			
		}
	},
	//closes the tag state when another tag is opened
	//called externally
	closeTagState:function(){	
		if(this.titleEl.hasClass("open")){
			
			this.titleEl.removeClass("open").addClass('closed');
			//if(!this.titleEl.hasClass("closed")) this.titleEl.addClass("closed");
			this.editB.hide();
			this.attrBody.hide();
			this.setTitle();
			$("body").unbind("deleteCurrentShape",this.deleteShape);
			
			if(this.mainRegion){
				this.mainRegion.listenOff();
			} else {
				$("body").unbind("shapeCommit",this.ingestCoordData);
			}
			this.DOM.trigger("turnOffShapeBar");
		}
	},
	toggleState:function(){
		if(this.titleEl.hasClass("open")){
			this.closeTagState();
		} else if(this.titleEl.hasClass("closed")) {
			this.openTagState();
		}
	},
	newPage:function(){
		//hide the DOM until the next page is loaded
		this.closeTagState();
		this.DOM.hide();
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
		if(!this.titleEl.hasClass("open")){
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
			if(obj.mainRegion) {
				obj.mainRegion.destroy();
				obj.mainRegion=null;
			}
			obj.DOM.trigger("tagDeleted",[obj.htmlindex,obj]);
			obj.DOM.remove();
		
		} else {
		
			this.mainRegion.destroy();
			this.mainRegion=null;
			this.DOM.trigger("tagDeleted",[this.htmlindex,this]);
			this.DOM.remove();
		}
	},
	//fired when user clicks lock in 'lock' mode
	editTag:function(e){
		var obj=e.data.obj;
		//display lock in 'unlock' mode
		obj.editB.removeClass("lock");
		obj.editB.addClass("unlock");
		obj.editB.unbind("click");
		obj._edit=true;
		//display NameValue data as editable
		if(obj.NV) obj.NV._startEdit(); //recursive function
		if(obj.mainRegion){
			obj.mainRegion.anchorOff();
			obj.DOM.trigger("activateShapeDelete");
		} else {
			obj.DOM.trigger("activateShapeBar",[obj.index]);
			obj.DOM.trigger("deactivateShapeDelete");
		}
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
	},
	//fired when the user first clicks on the 'lock'
	//afterward, fired after editB is clicked in 'unlock' mode
	doneEdit:function(e){
		//shape and all other data are now locked
		var obj=e.data.obj;
		//display 'lock' mode
		obj.editB.removeClass("unlock");
		obj.editB.addClass("lock");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		if(obj.NV) obj.NV._noEdit();
		obj.DOM.trigger("turnOffShapeBar");
		obj._edit=false;
		$.each(obj.attrs,function(i,a){
			a.save();
		});
		if(obj.mainRegion){
			obj.mainRegion.anchorOn();
		}
	},
	reloadListeners:function(){
		// this.titleEl.bind("click",{obj:this},function(e){
		// 		var obj=e.data.obj;
		// 		$(this).trigger("toggleTagState",[obj.index,obj]);
		// 	});
		
		//this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
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
		//	$("body").bind("deleteCurrentShape",{obj:obj},obj.deleteShape);
			obj.DOM.trigger("activateShapeDelete");
		}
	},
	//OLD: called by trigger deleteCurrentShape
	//NEW: TabBar handles all deletes
	deleteShape:function(e){
		
		if(this.mainRegion){
			this.mainRegion.destroy();
			this.shapeId=null;
			this.mainRegion=null;
			//$("body").unbind("deleteCurrentShape",this.deleteShape);
			$("body").bind("shapeCommit",{obj:this},this.ingestCoordData);
			this.DOM.trigger("deactivateShapeDelete");
		}
	},
	removeTag:function(){
		this.closeTagState();
		this.DOM.remove();
	},
	bundleData:function(){
		//return part of JSON object
		//only returning values from (each) nameValue pair
		//var jsontag={"uid":this.htmlindex,"name":this.title,"shapeId:":(this.mainRegion)?this.mainRegion.shapeId:null};
		var jsontag=[]; //TabBar already gathers other information on tag - just need to recursively return
		//namevalue data 
		if(this.NV){
			
			jsontag.push(this.NV.bundleData()); //bundleData for NameValue Obj called
			
		}
		
		// var jsontag="{";
		// 		jsontag+="uid:"+this.htmlindex+",name:"+this.name+",shapeId:"+this.mainRegion.id+"}";
	
		//j[1]=(this.mainRegion)?this.mainRegion.bundleData():null;
		return jsontag;
	}
	
});