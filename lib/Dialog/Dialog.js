// Dialog Script
// 
// Creating several objects to display dialog boxes
// 
// Developed for TILE project, 2010
// Grant Dickie

// 
// @param: 
// Obj: variables:
// 	loc: DOM object to be attached to

var Dialog=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
	}
});


var ImportDialog=Dialog.extend({
	init:function(args){
		this.$super(args);
		this.index=($("#dialog").length+this.loc.width());
		this.loc.append($.ajax({
			async:false,
			dataType:'html',
			url:'lib/Dialog/dialogImport.html'
		}).responseText);
		
		//lightbox content
		this.light=$("#light");
		this.fade=$("#fade");
		this.DOM=$("#dialogImport");
		this.closeB=$("#importDataClose");
		this.closeB.click(function(e){
			$(this).trigger("closeImpD");
		});
		
		this.schemaFileInput=$("#importDataFormInputSingle");
		this.schemaFileFormSubmit=$("#importDataFormSubmitSingle");
		//this.schemaFileFormSubmit.bind("click",{obj:this},this.handleSchemaForm);
		
		this.multiFileInput=$("#importDataFormInputMulti");
		this.multiFileFormSubmit=$("#importDataFormSubmitMulti");
		this.multiFileFormSubmit.bind("click",{obj:this},this.handleMultiForm);
		$("body").bind("openNewImage",{obj:this},this.close);
		$("body").bind("closeImpD",{obj:this},this.close);
		$("body").bind("openImport",{obj:this},this.display);
	},
	display:function(e){
		var obj=e.data.obj;
		obj.fade.show();
		obj.DOM.show();
		obj.light.show();
	
	},
	close:function(e){
		var obj=e.data.obj;
		obj.light.hide();
		obj.DOM.hide();
		obj.fade.hide();
	},
	handleSchemaForm:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		var file=obj.schemaFileInput.text();
		if(/http:\/\//.test(file)){
			obj.DOM.trigger("schemaFileImported",[file]);
		} else {
			//show warning: not a valid URI
		}
	},
	handleMultiForm:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		var file=obj.multiFileInput.attr("value");
		var schema=obj.schemaFileInput.attr("value");
		if(file.length&&schema.length){
			if(/http:\/\//.test(file)){
				obj.DOM.trigger("schemaLoaded",[schema]);
				obj.DOM.trigger("multiFileListImported",[file]);
			} else {
				//show warning: not a valid URI
			}
		}
	}
});

// New Image Box


var NewImageDialog=Dialog.extend({
	init:function(args){
		this.$super(args);
		
		this.loc.append($.ajax({
			async:false,
			url:'lib/Dialog/dialogNewImg.html',
			dataType:'html'
		}).responseText);
		this.DOM=$("#dialogNewImg");
		
		this.closeB=$("#newImgClose");
		this.closeB.click(function(e){
			$(this).trigger("closeNewImage");
		});
		this.uriInput=$("#newImgURIInput");
	
		this.submitB=$("#newImgSubmit");
		this.submitB.bind("click",{obj:this},this.handleImageForm);
		
		$("body").bind("openImport",{obj:this},this.close);
		$("body").bind("openNewImage",{obj:this},this.display);
		$("body").bind("closeNewImage",{obj:this},this.close);
	},
	display:function(e){
		var obj=e.data.obj;
		obj.DOM.show();
	},
	close:function(e){
		var obj=e.data.obj;
		obj.DOM.hide();
	},
	handleImageForm:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		var data={uri:obj.uriInput.attr("value")};
		obj.uriInput.attr("value","");
		obj.DOM.trigger("newImageAdded",[data]);
		obj.DOM.trigger("closeNewImage");
	}
});