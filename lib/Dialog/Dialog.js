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
			dataType:'text',
			url:'lib/Dialog/importdialog.php?id='+this.index,
			type:'GET'
		}).responseText);
		this.DOM=$(".impD_"+this.index);
		this.closeB=$("#impDClose_"+this.index);
		this.closeB.click(function(e){
			$(this).trigger("closeImpD");
		});
		
		this.schemaFileInput=$("#file_single"+this.index);
		this.schemaFileFormSubmit=$("#submit_single"+this.index);
		this.schemaFileFormSubmit.bind("click",{obj:this},this.handleSchemaForm);
		
		this.multiFileInput=$("#file_multi"+this.index);
		this.multiFileFormSubmit=$("#submit_multi"+this.index);
		this.multiFileFormSubmit.bind("click",{obj:this},this.handleMultiForm);
		
		$("body").bind("closeImpD",{obj:this},this.close);
		$("body").bind("openImport",{obj:this},this.display);
	},
	display:function(e){
		var obj=e.data.obj;
		obj.DOM.show();
	},
	close:function(e){
		var obj=e.data.obj;
		obj.DOM.hide();
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
		if(/http:\/\//.test(file)){
			obj.DOM.trigger("multiFileListImported",[file]);
		} else {
			//show warning: not a valid URI
		}
	}
});