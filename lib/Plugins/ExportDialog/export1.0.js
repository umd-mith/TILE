// Export Dialog 1.0
// Author: Grant Dickie
(function($){
	var Exp=this;
	// ExportDialog
	// For exporting JSON session data and transforming into an 
	// XML file/another form of output
	var ExportDialog=function(args){
		// Constructor: {loc: {String} id for the location of parent DOM, html: {String} html string for attached HTML}
		
		var self=this;
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		if((!args.loc)) {throw "Not enough arguments passed to Dialog";}
		self.loc=args.loc;
		//set up JSON html
		var html='<div id="exportLight" class="white_content"><div id="exportDialog" class="dialog"><div class="header">'+
		'<h2 class="title">Export XML</h2><h2><a href="#" id="exportDataClose" class="btnIconLarge close">Close</a></h2>'+
		'<div class="clear"></div></div><div class="body"><div class="option"><form id="exportDataForm" method="POST"'+
		' enctype="multipart/form-data" action=""><label for="file">Path to Script:</label><input id="exportFileToUse" '+
		'type="text" name="file" id="file" value="" /><span id="exportScriptHelp" class="helpIcon">?</span><br /><input '+
		'id="exportData" type="text" name="JSON" style="display:none;"/><input id="srcXML" type="text" name="srcFile" style="display:none;"/>'+
		'<input id="exportSubmit" type="button" class="button" name="sub" value="Submit" /><br/>'+
		'<label for="alternate">Alternatively, click here to export session as a generic XML 1.0 File:</label>'+
		'<input name="alternate" id="exportJSONXML" class="button" type="submit" value="Export to JSON XML"/>'+
		'<span id="exportHelpGenericXML" class="helpIcon"></span></form></div><div class="clear"></div></div></div>'+
		'</div><div id="exportFade" class="black_overlay"></div>';
		$(html).appendTo(self.loc);
		// self.index=($("#dialog").length+self.loc.width());
		this.defaultExport=(args.defaultExport)?args.defaultExport:null;
		
		this.DOM=$("#exportDialog");
		this.light=$("#exportLight");
		this.dark=$("#exportFade");
		this.closeB=$("#exportDataClose");
		this.closeB.click(function(e){
			e.preventDefault();
			$(this).trigger("closeExport");
		});

		this.submitB=$("#exportSubmit");
		this.submitB.bind("click",{obj:this},this._submitButtonHandle);
		
		this.fileI=$("#exportFileToUse");
		if(this.defaultExport) this.fileI.val(this.defaultExport);
		this.expData=$("#exportData"); //this input is hidden
		
		this.srcXML=$("#srcXML");
		
		this.exportJSONXML=$("#exportJSONXML");
		this.exportJSONXML.live('click',function(e){
			e.preventDefault();
			self.exportToJSONXML();
		});
		
		// Help Icons
		this.genHelp=new HelpBox({iconId:"exportHelpGenericXML",text:"Exports an XML file that has no markup library associated with it. This will only output the structure of the TILE JSON in XML format."});
		this.scriptHelp=new HelpBox({iconId:"exportScriptHelp",text:"Exports an XML file using a script of your making. Some default scripts have been provided."});
		this.json=null;
		
		$("body").bind("openExport",{obj:this},this.display);
		$("body").bind("openImport",{obj:this},this.close);
		$("body").bind("openLoadTags",{obj:this},this.close);
		$("body").bind("closeExport",{obj:this},this.close);
	};
	ExportDialog.prototype={
		// display this dialog - called by openExport trigger
		// Passed the JSON object to save
		// e : {Event}
		// njson : {Object} - new JSON object to save
		display:function(e,njson){
			var self=e.data.obj;
			
			self.light.show();
			self.DOM.show();
			self.dark.show();
			// new json object
			self.json=njson;
		},
		// hide dialog box - called by openLoadTags, openNewImage, openImport, closeExport
		// e : {Event}
		close:function(e){
			var self=e.data.obj;
			self.light.hide();
			self.DOM.hide();
			self.dark.hide();
		},
		// Takes the script input by the user as a string, then
		// attaches .js script to the page and performs function
		// e : {Event}
		_submitButtonHandle:function(e){
			e.preventDefault();
			var self=e.data.obj;
			if(!self.json) return;
			//get src script from user
			var srcscript=self.fileI.val();
			// attach a script element to the page with src
			// set to the file specified by the user
			var sel=$("<script type='text/javascript' src='"+srcscript+"'></script>");
			// attach to header
			$("head").append(sel);
			//bind DONE event to the body tag
			$("body").bind("exportStrDone",{obj:self},self._expStrDoneHandle);
			
			self.srcXML.val(self.json.sourceFile.replace(".xml",""));
			// stringify if not already a string
			if(typeof self.json != "string") self.json=JSON.stringify(self.json);
			
			//perform a set timeout with function from js script
			setTimeout(function(self,sel){
				exportToTEI(self.json);
				sel.remove();
			},250,self,sel); 
		},
		//takes user-defined text data and uses it to 
		// export current JSON session as XML
		// e : {Event}
		// str : {String} - represents JSON data in string format
		_expStrDoneHandle:function(e,str){
			var self=e.data.obj;
			$("body").unbind("exportStrDone",self._expStrDoneHandle);
			
			//take file given and use it in ajax call
			//var file=self.fileI.val();
			//attach an iframe to the page; this is set
			//to whatever file is and has POST data sent 
			//to it
			// set the action parameter
			self.expData.val(str);
			$("#exportDataForm").attr("action","importWidgets/exportXML.php");
			$("#exportDataForm")[0].submit();
			// $("iframe").remove();
			$("#exportDataForm").attr("action","");
			$("body:first").trigger("closeExport");
			
			
			// iframe.appendTo($("#azglobalmenu"));
		},
		exportToJSONXML:function(){
			var self=this;
			
			$("body:first").trigger("ExportJSON2XML");
			// if(!self.json) return;
			
			
			//get src script from user
			// var srcscript=self.fileI.val();
			//attach a script element to the page with src
			// set to the file specified by the user
			// var sel=$("<script type='text/javascript' src='importWidgets/exportJSONXML.js'></script>");
			// attach to header
			// $("head").append(sel);
			//bind DONE event to the body tag
			// $("body").bind("exportStrDone",{obj:self},self._expStrDoneHandle);
			// 			
			// 			self.srcXML.val(self.json.sourceFile.replace(".xml",""));
			// 			// stringify if not already a string
			// 			if(typeof self.json != "string") self.json=JSON.stringify(self.json);
			// 			
			//perform a set timeout with function from js script
			// setTimeout(function(self,sel){
			// 				exportToTEI(self.json);
			// 				sel.remove();
			// 			},250,self,sel);
		}
	};
	
	Exp.ExportDialog=ExportDialog;
})(jQuery);


// Wrapper for TILE

var ExportTile={
	id:'Export901898JJJ',
	start:function(engine){
		var self=this;
	
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		
		//set up JSON html
		var html='<div id="exportLight" class="white_content"><div id="exportDialog" class="dialog"><div class="header">'+
		'<h2 class="title">Export XML</h2><h2><a href="#" id="exportDataClose" class="btnIconLarge close">Close</a></h2>'+
		'<div class="clear"></div></div><div class="body"><div class="option"><form id="exportDataForm" method="POST"'+
		' enctype="multipart/form-data" action=""><label for="file">Path to Script:</label><input id="exportFileToUse" '+
		'type="text" name="file" id="file" value="" /><span id="exportScriptHelp" class="helpIcon">?</span><br /><input '+
		'id="exportData" type="text" name="JSON" style="display:none;"/><input id="srcXML" type="text" name="srcFile" style="display:none;"/>'+
		'<input id="exportSubmit" type="button" class="button" name="sub" value="Submit" /><br/>'+
		'<label for="alternate">Alternatively, click here to export session as a generic XML 1.0 File:</label>'+
		'<input name="alternate" id="exportJSONXML" class="button" type="submit" value="Export to JSON XML"/>'+
		'<span id="exportHelpGenericXML" class="helpIcon"></span></form></div><div class="clear"></div></div></div>'+
		'</div><div id="exportFade" class="black_overlay"></div>';
		$(html).appendTo($("body"));
		// self.index=($("#dialog").length+self.loc.width());
		self.defaultExport=engine.defaultExport;
		
		self.DOM=$("#exportDialog");
		self.light=$("#exportLight");
		self.dark=$("#exportFade");
		self.closeB=$("#exportDataClose");
		self.closeB.click(function(e){
			e.preventDefault();
			self.DOM.hide();
			self.light.hide();
			self.dark.hide();
		});

		self.submitB=$("#exportSubmit");
		self.submitB.live('click mousedown',function(e){
			e.preventDefault();
			// get xml from engine
			var xml=engine.getXML();
			var tei=self.transformTEI(xml);
			$("#exportDataForm").attr("action","importWidgets/exportXML.php");
			$("#exportDataForm")[0].submit();
			// $("iframe").remove();
			$("#exportDataForm").attr("action","");
			self.DOM.hide();
			self.light.hide();
			self.dark.hide();
		});
		// self.submitB.bind("click",{obj:this},this._submitButtonHandle);
		
		self.fileI=$("#exportFileToUse");
		if(self.defaultExport) this.fileI.val(this.defaultExport);
		self.expData=$("#exportData"); //this input is hidden
		
		self.srcXML=$("#srcXML");
		
		self.exportJSONXML=$("#exportJSONXML");
		self.exportJSONXML.live('click',function(e){
			e.preventDefault();
			var xml=json2xml(engine.getJSON());
			$("#exportDataForm").attr("action","importWidgets/exportXML.php");
			$("#exportDataForm")[0].submit();
			// $("iframe").remove();
			$("#exportDataForm").attr("action","");
			self.DOM.hide();
			self.light.hide();
			self.dark.hide();
		});
		
		// Help Icons
		self.genHelp=new HelpBox({iconId:"exportHelpGenericXML",text:"Exports an XML file that has no markup library associated with it. This will only output the structure of the TILE JSON in XML format."});
		self.scriptHelp=new HelpBox({iconId:"exportScriptHelp",text:"Exports an XML file using a script of your making. Some default scripts have been provided."});
		self.json=engine.getJSON();
		
		
		
		// self.dialog=new ExportDialog({'loc':$("body")});
		// 		self.dialog.json=engine.getJSON();
		
		var button={
			id:'exportDataButton',
			display:'Export Data',
			data:self,
			click:function(e){
				e.preventDefault();
				var dialog=e.data.obj;
				// get current json and display
				// export dialog
				dialog.json=engine.getJSON();
				dialog.light.show();
				dialog.DOM.show();
				dialog.dark.show();
			}
		};
		engine.addToolBarButton(button);
		
	},
	loadJSON:function(engine){
		var self=this;
		
		// self.dialog.json=engine.getJSON();
		
	},
	transformTEI:function(xml){
		var self=this;
		var output='<?xml version="1.0" encoding="UTF-8"?>\n<TEI xmlns="http://www.tei-c.org/ns/1.0">';
		$(xml).find("tile").each(function(){
			output+='<teiHeader></teiHeader><body><text>';
		});
		$(xml).find("page").each(function(){
			output+="<div1></div1>";
		});
		output+="</text></body>";
		return output;
	},
	useScript:function(json){
		var self=this;
		//get src script from user
		var srcscript=self.fileI.val();
		// attach a script element to the page with src
		// set to the file specified by the user
		var sel=$("<script type='text/javascript' src='"+srcscript+"'></script>");
		// attach to header
		$("head").append(sel);
		//bind DONE event to the body tag
		$("body").bind("exportStrDone",{obj:self},self._expStrDoneHandle);
		
		self.srcXML.val(self.json.sourceFile.replace(".xml",""));
		// stringify if not already a string
		if(typeof self.json != "string") self.json=JSON.stringify(self.json);
		
		//perform a set timeout with function from js script
		setTimeout(function(self,sel){
			exportToTEI(json);
			sel.remove();
		},250,self,sel);
	}
	
	
};