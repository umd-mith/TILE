// loadJSON1.0.js
// Loads JSON session files into TILE

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
			'</div></div><div class="body"><div class="option"><h3>Load Session From File</h3>'+
			'<form id="loadTagsForm" action="PHP/importTags.php" method="post" enctype="multipart/form-data">'+
			'<label for="file">Filename:</label><input id="importTagsFileName" type="file" name="fileTags" value="" />'+
			'<br /><input id="importTagsSubmit" type="submit" class="button" name="submitTags" value="Submit" />'+
			'</form></div><div class="clear"></div></div></div></div><div id="LTfade" class="black_overlay"></div>';
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
		}
	};
	// accessible globally
	loadJSON.LoadTags=LoadTags;
	
})(jQuery);

// wrapper for TILE
var LoadJSONTILE={
	id:'loadjsontile',
	start:function(engine){
		var self=this;
		self.dialog=new LoadTags({loc:$("body")});
		
		// generate button to insert in tile toolbar
		var button={
			id:'loadJSON',
			display:'Load',
			click:function(e){
				e.preventDefault();
				self.dialog.light.show();
				self.dialog.DOM.show();
				self.dialog.fade.show();
				// $("body:first").trigger("openLoadTags");
			}
		};
		// add button
		engine.addToolBarButton(button);
		
	}
	
};

