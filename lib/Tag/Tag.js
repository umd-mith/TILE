/**
* Tag
* Object to recording metadata about a bound object in the 
* stage area of the interface
*
**/

var Tag=Monomyth.Class.extend({
	init:function(args){
		this.loc=$("#"+args.loc);
		this.index=$(".tag").length;
		this.loc.append($.ajax({
			url:'lib/Tag/Tag.php?id='+this.index,
			type:'text',
			async:false
		}).responseText);
		this.DOM=$("#tag_"+this.index);
		this.title=args.title;
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		this.shape=null;
		this.editShape=false;
		
		this.titleEl=$("#tagtitle_"+this.index);
		this.titleEl.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("toggleTagState",[obj.index]);
		});
		
		this.titleSelect=$("#tagtitleselect_"+this.index);
		this.titleSelect.hide();
		this.tagDel=$("#tagdel_"+this.index);
		this.tagDel.bind("click",{obj:this},this.deleteTag);
		this.attrBody=$("#tagAtr_"+this.index);
		
		//this.fillTagTitleSelect();
		this.editB=$("#tagedit_"+this.index);
		// this.objValueDisplay=$("#tagobjInputLabel1_"+this.index);
		// 		this.objInput=$("#tagObjInput_"+this.index);
		this.coordText=$("#tagcoordstextoutput_"+this.index);
		
		this.coordSet=$("#tagCoords_"+this.index);
		this.coordSet.bind("click",{obj:this},function(e){
			var obj=e.data.obj;
			$(this).trigger("setCoordRegion",[obj.index]);
			obj.editShape=true;
		});
				
		this.titleEl.text(this.title);
		this.editB.bind("click",{obj:this},this.editTag);
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		//$("body").bind("tagOpen",{obj:this},this.closeTagState);
		//constructed, notify other objects this is the active element
		this.DOM.trigger("tagOpen",[this.index]);
	},
	toggleTagState:function(e,id){
		var obj=e.data.obj;
		obj.titleEl.toggleClass("open");
		obj.titleEl.toggleClass("closed");
		if(obj.titleEl.hasClass("closed")){
			obj.editB.hide();
			obj.attrBody.hide();
			//if no shape, then must retrieve shape (if exists)
			if(!obj.shape){
				//global listener
				$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
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
			//notify other objects that this tag is opened
			obj.DOM.trigger("tagOpen",[obj.index]);
			if(obj.shape) obj.shape.activate();
		}
	},
	//closes the tag state when another tag is opened
	closeTagState:function(){	
		this.titleEl.removeClass("open");
		if(!this.titleEl.hasClass("closed")) this.titleEl.addClass("closed");
		this.editB.hide();
		this.attrBody.hide();
	
	},
	deleteTag:function(e){
		var obj=e.data.obj;
		obj.DOM.trigger("tagDeleted",[this.index]);
		if(obj.shape) obj.shape=null;
		obj.DOM.remove();
	},
	editTag:function(e){
		var obj=e.data.obj;
		obj.editB.text("Done");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
		obj.coordSet.toggleClass("closed");
		obj.coordSet.toggleClass("open");
	},
	doneEdit:function(e){
		var obj=e.data.obj;
		obj.editB.text("Edit");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		//fobj.objValueDisplay.text(obj.objInput.val());
		//if no shape, then must retrieve shape (if exists)
		if(!obj.shape){
			//global listener
			$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
			obj.DOM.trigger("requestCoordData",[obj.index]);
		} else if(obj.editShape){
			//get shape data and update coord text
			obj.updateCoordText(obj.shape.getData());
			obj.editShape=false;
		}
	//	obj.objInput.hide();
		obj.coordSet.toggleClass("closed");
		obj.coordSet.toggleClass("open");
	},
	ingestCoordData:function(e,shape,coords){
		var obj=e.data.obj;
		if(!obj.shape){
			obj.shape=shape;
			$("body").unbind("coordDataSent");
			obj.updateCoordText(coords);
			
		}
	},
	updateCoordText:function(coords){
		var txt=$("<ul></ul>");
		for(el in coords){
			txt.append($("<li>"+el+": "+coords[el]+"</li>"));
		}		
		this.coordText.html(txt);
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