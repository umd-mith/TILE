(function($){
var ImportD=this;
//ImportDialog 1.0
/**
Called by openImport CustomEvent
**/
// Handles receiving JSON data input by the user
// sends data to TILE_ENGINE to be loaded as JSON
var ImportDialog=function(args){
	
		
	// Constructor
	// args same as Dialog()
		var self=this;
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		if((!args.loc)) throw "Not enough arguments passed to Dialog";
		self.loc=args.loc;
		//set up JSON html
		var html='<div id="light" class="white_content"><div id="dialogImport" class="dialog"><div class="header"><h2 class="title">Welcome</h2><div class="clear"></div>'+
		'</div><div class="body"><div class="description"><h3>Introduction to TILE</h3>'+
		'<p>A collaborative project among the Maryland Institute for Technology in the Humanities (Doug Reside) and the'+
		' Indiana University Bloomington (Dot Porter, John A. Walsh), the Text-Image Linking Environment (TILE) is a project for developing '+
		'a new web-based, modular, collaborative image markup tool for both manual and semi-automated linking between encoded text and images'+
		' of text, and image annotation. <a href="http://mith.umd.edu/tile">Read more &#62;</a></p><p><a id="continueButton" class="button">Continue ></a></p><p class="version">0.9</p></div><div class="clear"></div>'+
		'</div></div></div><div id="fade" class="black_overlay"></div>';
		$(html).appendTo(self.loc);
		self.index=($("#dialog").length+self.loc.width());

		$("#continueButton").live('click',function(e){
			e.preventDefault();
			$("#light").remove();
			$("#fade").remove();
		});

		self.autoChoices=args.choices;
		self.autoFill=args.auto;
		//lightbox content
		self.light=$("#light");
		self.fade=$("#fade");
		self.DOM=$("#dialogImport");
		self.closeB=$("#importDataClose");
		self.closeB.click(function(e){
			$(self).trigger("closeImpD");
		});
		// handle Form input for JSON data from user
		self.multiFileInput=$("#importDataFormInputMulti");
		self.multiFileInput.val(self.autoFill);
		self.multiFileFormSubmit=$("#importDataFormSubmitMulti");
		self.multiFileFormSubmit.bind("click",{obj:self},self.handleMultiForm);
		// attach helpboxes
		self.hb1=new HelpBox({"iconId":"ImportDialogHelp1","text":"Enter a path to your data. The default is a sample data set using an XML file. Model your path on the sample, or enter the direct path to a JS or JSON file. See TILE's Help section for more information."});			
		// this.hb2=new HelpBox({"iconId":"ImportDialogHelp2","text":"Clicking this button..."});
		$("body").bind("openNewImage",{obj:self},this.close);
		$("body").bind("closeImpD",{obj:self},this.close);
		$("body").bind("openLoadTags",{obj:self},this.close);
		$("body").bind("openExport",{obj:self},this.close);
		$("body").bind("openImport",{obj:self},this.display);
		
		// TEMPORARY SELECTION TOOL
		$("#hamLoad").click(function(e){
			$("#importDataFormInputMulti").val(self.autoChoices['hamLoad']);
		});
		$("#pemLoad").click(function(e){
			$("#importDataFormInputMulti").val(self.autoChoices['pemLoad']);
		});
		$("#swineburne1").click(function(e){
			$("#importDataFormInputMulti").val(self.autoChoices['jsLoad']);
		});
		$("#swineburne").click(function(e){
			$("#importDataFormInputMulti").val(self.autoChoices['swineburne']);
		});
		
	};
ImportDialog.prototype={
	// shows the dialog box - called remotely by openImport Custom Event
	// e : {Event}
	display:function(e){
		var obj=e.data.obj;
		obj.fade.show();
		obj.DOM.show();
		obj.light.show();
	},
	// called by openNewImage, closeImpD, openLoadTags, openExport Custom Events
	// e : {Event}
	close:function(e){
		var obj=(e)?e.data.obj:this;
		obj.light.hide();
		obj.DOM.hide();
		obj.fade.hide();
	},
	// finds the transcript/image file that the user 
	// has input and sends it off in a CustomEvent trigger
	// schemaFileImported
	handleMultiForm:function(e){
		e.preventDefault();
		var obj=e.data.obj;
		
		
		var file=obj.multiFileInput.val();
		//var schema=obj.schemaFileInput.attr("value");
		if(file.length){
			if(/http:\/\//.test(file)){
				// show loading 
				$("#dialogImport > .body > .selectOptions").html("<img src=\"skins/columns/images/tileload.gif\" />");
				
				//trigger an event that sends both the schema and the list of files to listener
				obj.DOM.trigger("schemaFileImported",[file]);
			} 
		}
	}
};

ImportD.ImportDialog=ImportDialog;

})(jQuery);

// Wrapper that activates the importDialog and sends to 
var importdialog_tile={
	id:'importdialog_tile',
	start:function(mode){
		var self=this;
		
		var choices=TILE.engine.preLoads;
		self.dialog=new ImportDialog({loc:$("body"),choices:choices,auto:TILE.engine._importDefault});
		$("body").live("schemaFileImported",{obj:self},function(e,file){
			self.dialog.close();
			// send to engine
			engine.parseJSON(file);
			// close dialog
			
		});
		
		// shows when TILE starts up - set as opening dialog
		var data=TILE.engine.getJSON();
		if(!data){
			// open dialog
			$("body:first").trigger("openImport");
		}
		
		
	}
	// no close or loadJSON functions
};


