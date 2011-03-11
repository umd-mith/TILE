// loadJSON1.0.js
// Loads JSON session files into TILE

// New: 3/1/2011
// Adding functionality to load SimpleModel data

(function($){
	var loadJSON=this;
	
	// Load Tags Dialog
	// For loading JSON session data back into the TILE interface

	var LoadTags=function(args){
		// Constructor: (Same as Dialog)  {loc: {String} id for where to put DOM, html: {String} JSON string representing html for this Dialog}
			var self=this;
			// Constructor:
			// 
			// @param: 
			// Obj: variables:
			// 	loc: {String} DOM object to be attached to
			if((!args.loc)) {throw "Not enough arguments passed to Dialog";}
			self.loc=args.loc;
			//set up JSON html
			var html='<div id="LTlight" class="white_content"><div id="loadTagsDialog" class="dialog">'+
			'<div class="header"><h2 class="title">Load Session</h2><h2>'+
			'<a href="#" id="loadTagsClose" class="btnIconLarge close">Close</a></h2><div class="clear">'+
			'</div></div><div class="body"><div class="option"><h3>Load Session From File (.json, .html)</h3>'+
			'<form id="loadTagsForm" action="./PHP/importTags.php" method="post" enctype="multipart/form-data">'+
			'<label for="file">Filename:</label><input id="importTagsFileName" type="file" name="fileTags" value="" />'+
			'<br /><input id="importTagsSubmit" type="submit" class="button" name="submitTags" value="Submit" />'+
			
			'</form><h3>Load a session from a URL (.json, .html, or use a PHP script to interpret an XML file or other format)</h3>'+
			'<h4>Or pick one of these options: </h4>'+
			'<input id="faust" type="radio" class="chooseFile" name="groupChoice" value="http://mith.umd.edu/tile/trunk/importWidgets/importExternalFiles.php?file=faust.json">Faust Online Data</input>'+
			'<input id="montfort" type="radio" class="chooseFile" name="groupChoice" value="http://mith.umd.edu/tile/trunk/importWidgets/importExternalFiles.php?file=http://ginko.uni-graz.at/cgi-bin/tile/montfort.cgi">Montfort Online Data</input>'+
			'<form id="loadURLForm" action="" method="GET"><label for="importurl">Input from URL:</label><input id="importURL" type="text" name="importurl"/><br/><input id="submitURL" class="button" type="submit" value="Load URL"/></form>'+
			
			'</div><div class="clear"></div></div></div></div><div id="LTfade" class="black_overlay"></div>';
			$(html).appendTo(self.loc);
			self.index=($("#dialog").length+self.loc.width());
			// this.loc.append($.ajax({
			// 				async:false,
			// 				url:'lib/Dialog/DialogLoadTags.html',
			// 				dataType:'html'
			// 			}).responseText);
			this.DOM=$("#loadTagsDialog");
			this.closeB=$("#loadTagsClose");
			this.closeB.click(function(e){
				$(this).trigger("closeLoadTags");
			});
			this.light=$("#LTlight");
			this.fade=$("#LTfade");
			
			this.submitB=$("#importTagsSubmit");
			// this.submitB.live('click',{obj:this},this.submitFile);
			this.submitURL=$("#loadURLForm > #submitURL");
			this.submitURL.live('click',{obj:this},this.loadURL);
			
			$("#loadTagsDialog > .body > .option > .chooseFile").live('click',function(e){
				if(__v) console.log($(this).val());
				// set the URL value to exporting in simple model form
				$("#importURL").val($(this).val());
			});
			
			// this.submitB.bind("click",{obj:this},this.submitHandle);	
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openExport",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.display);
			$("body").bind("closeLoadTags",{obj:this},this.close);
		};
	LoadTags.prototype={
		// display the load tags dialog - called by openLoadTags trigger
		// e : {Event}
		display:function(e){
			var obj=e.data.obj;
			obj.light.show();
			obj.DOM.show();
			obj.fade.show();
		},
		// hide dialog box - called by closeLoadTags, openImport, openNewImage, openExport
		// e : {Event}
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		},
		submitFile:function(e){
			e.preventDefault();
			var self=e.data.obj;
			
		},
		loadURL:function(e){
			e.preventDefault();
			var self=e.data.obj;
			var url=$("#loadURLForm > #importURL").val();
			
			if((url.length<1)||(!(/http\:\/\//.test(url)))) return;
			
			var txt=$.ajax({
				url:url,
				dataType:'json',
				async:false
				// success:function(json){
				// 					
				// 					if(__v) console.log("reached json");
				// 					if(!json) return;
				// 					$("body:first").trigger("LoadedURLJsonReady",[json]);
				// 					// get rid of Load dialog
				// 					self.light.hide();
				// 					self.DOM.hide();
				// 					self.fade.hide();
				// 				}
			}).responseText;
			if(__v) console.log("json returned: "+txt);
			$("body:first").trigger("LoadedURLJsonReady",[JSON.parse(txt)]);
	
		}
	};
	
	// accessible globally
	loadJSON.LoadTags=LoadTags;
	
})(jQuery);

// wrapper for TILE
var LoadDialog={
	id:'loadjsontile',
	start:function(engine){
		var self=this;
		
		
		self.dialog=new LoadTags({loc:$("body")});
		
		// generate button to insert in tile toolbar
		var button={
			id:'loadJSON',
			helptext:'Load a new session',
			display:'Load',
			type:'global',
			category:'data'
			
		};
		// add button
		var el=engine.addDialogButton(button);
		// add click event to return el
		if(!el) return;
		el.elem.live('click',function(e){
			// show dialog box
			e.preventDefault();
			self.dialog.light.show();
			self.dialog.DOM.show();
			self.dialog.fade.show();
		});
		
		$("body").live("LoadedURLJsonReady",function(e,json){
			if(__v) console.log("NEW JSON LOADED: "+json);
			engine.parseJSON(json);
		});
		
		
	}
	
};

