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
		this.titleEl=$("#tagtitle_"+this.index);
		this.titleEl.click(function(e){
			$(this).trigger("toggleTagState");
			// $(this).toggleClass("open");
			// 			$(this).toggleClass("closed");
			// 			if($(this).hasClass("closed")){
			// 				
			// 			}
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
		});
				
		// this.editDoneB=$("#tagEditDone_"+this.index);
		// 	this.editDoneB.click(function(e){
		// 		$(this).trigger("doneEdit");
		// 	});
		this.titleEl.text(this.title);
		this.editB.bind("click",{obj:this},this.editTag);
		
		this.DOM.bind("toggleTagState",{obj:this},this.toggleTagState);
		
	},
	toggleTagState:function(e){
		var obj=e.data.obj;
		obj.titleEl.toggleClass("open");
		obj.titleEl.toggleClass("closed");
		if(obj.titleEl.hasClass("closed")){
			obj.editB.hide();
			obj.attrBody.hide();
			//global listener
			$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
			obj.DOM.trigger("requestCoordData",[obj.index]);
		} else {
			obj.editB.show();
			obj.attrBody.show();
			//notify other objects that this tag is opened
			obj.DOM.trigger("tagOpen",[]);
		}
	},
	deleteTag:function(e){
		var obj=e.data.obj;
		obj.DOM.trigger("tagDeleted",[this.index]);
		obj.DOM.remove();
	},
	editTag:function(e){
		var obj=e.data.obj;
	//	obj.objValueDisplay.hide();
	//	obj.objInput.show();
		
		obj.editB.text("Done");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.doneEdit);
	//	obj.editDoneB.show();

		obj.coordSet.toggleClass("closed");
		obj.coordSet.toggleClass("open");
	},
	doneEdit:function(e){
		var obj=e.data.obj;
		
		obj.editB.text("Edit");
		obj.editB.unbind("click");
		obj.editB.bind("click",{obj:obj},obj.editTag);
		//fobj.objValueDisplay.text(obj.objInput.val());
		//global listener
		$("body").bind("coordDataSent",{obj:obj},obj.ingestCoordData);
		obj.DOM.trigger("requestCoordData",[obj.index]);
	//	obj.objInput.hide();
		obj.coordSet.toggleClass("closed");
		obj.coordSet.toggleClass("open");
	},
	ingestCoordData:function(e,coords){
		var obj=e.data.obj;
		$("body").unbind("coordDataSent");
		var txt=$("<ul></ul>");
		for(el in coords){
			txt.append($("<li>"+el+": "+coords[el]+"</li>"));
		}		
		obj.coordText.html(txt);
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