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
		this.shape=null;
		this.editShape=false;
		this.items=[];
		
		this.titleEl=$("#tagtitle_"+this.htmlindex);
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.index]);
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
		// this.objValueDisplay=$("#tagobjInputLabel1_"+this.htmlindex);
		// 		this.objInput=$("#tagObjInput_"+this.htmlindex);
	//	this.coordText=$("#tagcoordstextoutput_"+this.htmlindex);
		
		// this.coordSet=$("#tagCoords_"+this.htmlindex);
		// 		this.coordSet.bind("click",{obj:this},function(e){
		// 			var obj=e.data.obj;
		// 			$(this).trigger("setCoordRegion",[obj.index]);
		// 			obj.editShape=true;
		// 		});
				
		//this.titleEl.text(this.title);
		this.editB.bind("click",{obj:this},this.doneEdit);
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		this.DOM.bind("titleOptionClicked",{obj:this},this.titleOptionClickHandle);
		//$("body").bind("tagOpen",{obj:this},this.closeTagState);
		//constructed, notify other objects this is the active element
		this.DOM.trigger("tagOpen",[this.index,this]);
		this.DOM.trigger("setCoordRegion");
		
		//global listeners
		$("body").bind("coordDataSent",{obj:this},this.ingestCoordData);
		$("body").bind("shapeRemoved",{obj:this},this.shapeRemoved);
	},
	setTitleChoices:function(){
		var options=$("#"+this.tagChoiceList.attr("id")+" > option");
		this.items=[];
		for(i=0;i<options.length;i++){
			var item=$(options[i]);
			this.items[item.attr("id")]={html:item,title:item.val()};
			item.click(function(e){
				$(this).trigger("titleOptionClicked",[$(this).attr("id")]);
			});
			if(!this.title) this.title=item.val();
		}
		
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
	toggleTagState:function(e,id){
		var obj=e.data.obj;
		obj.titleEl.toggleClass("open");
		obj.titleEl.toggleClass("closed");
		if(obj.titleEl.hasClass("closed")){
			obj.editB.hide();
			obj.attrBody.hide();
			obj.setTitle();
			obj.DOM.trigger('deactivateShapeDelete');
			obj.DOM.trigger("deactivateShapeBar");
			
			//if no shape, then must retrieve shape (if exists)
			if(!obj.shape){
				//global listener
				
				obj.DOM.trigger("requestCoordData",[obj.index]);
			} else if(obj.editShape){
				//get shape data and update coord text
				obj.updateCoordText(obj.shape.getData());
				obj.shape.deactivate();
				obj.editShape=false;
			}
		} else {
			obj.editB.show();
			obj.attrBody.show();
			obj.titleElText.hide();
			obj.tagChoice.show();
			//notify other objects that this tag is opened
			obj.DOM.trigger("tagOpen",[obj.index]);
			if(obj.shape) {
				obj.shape.activate();
			}else{
				obj.DOM.trigger("setCoordRegion");
			}
		}
	},
	//closes the tag state when another tag is opened
	closeTagState:function(){	
		this.titleEl.removeClass("open");
		if(!this.titleEl.hasClass("closed")) this.titleEl.addClass("closed");
		this.editB.hide();
		this.attrBody.hide();
		this.setTitle();
		this.DOM.trigger('deactivateShapeDelete');
		this.DOM.trigger("deactivateShapeBar");
		$("body").unbind("coordDataSent",this.ingestCoordData);
	},
	deleteTag:function(e){
		var obj=e.data.obj;
		obj.DOM.trigger("tagDeleted",[this.index]);
		if(obj.shape) obj.shape=null;
		obj.DOM.remove();
	},
	editTag:function(e){
		var obj=e.data.obj;
		obj.editB.text("Lock");
		obj.editB.unbind("click");
		if(obj.shape){
			obj.shape.releaseAnchor();
		} else {
			obj.DOM.trigger("setCoordRegion",[obj.index]);
		}
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
	},
	doneEdit:function(e){
		var obj=e.data.obj;
		obj.editB.text("Unlock");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		obj.DOM.trigger("deactivateShapeBar");
		//fobj.objValueDisplay.text(obj.objInput.val());
		//if no shape, then must retrieve shape (if exists)
		if(obj.shape){
			
			// //global listener
			// 			$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
			// 			obj.DOM.trigger("requestCoordData",[obj.index]);
			// 		} else if(obj.editShape){
			// 			//get shape data and update coord text
			// 			obj.updateCoordText(obj.shape.getData());
			// 			obj.editShape=false;
		}
	},
	ingestCoordData:function(e,shape,coords){
		var obj=e.data.obj;
		if(!obj.shape){
			obj.shape=shape;
			obj.mainRegion=new TagRegion({
				loc:obj.attrBody,
				shape:obj.shape,
				name:"mainRegion"+obj.htmlindex,
				htmlID:obj.htmlindex,
				initCoords:coords
			});
			$("body").unbind("coordDataSent",obj.ingestCoordData);
			//obj.updateCoordText(coords);
			obj.DOM.trigger("deactivateShapeBar");
		}
	},
	shapeRemoved:function(e,i){
		var obj=e.data.obj;
		if(obj.mainRegion.destroy(i)){
			obj.shape=null;
			$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
			obj.DOM.trigger("deactivateShapeDelete");
		}
	},
	fillTagTitleSelect:function(){
		//just grap the test elements
		//later, will be dynamically set
		this.titleSelect.children("option").each(function(ind,el){
			$(el).click(function(e){
				$(this).trigger("changeTitleDone",[$(this).text()]);
			});
		});
	}
	
});