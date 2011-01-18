///TILE 1.0
// Authors: Doug Reside (dreside), 
// Grant Dickie (grantd), 
// Tim Bowman

// Base Code for all of the main TILE interface objects
// Objects:
// Floating Div
// HelpBox
// Dialog
// ImportDialog
// ExportDialog
// TILE_ENGINE
// PluginController

//TILE_ENGINE: {Object} main engine for running the LogBar and Layout of TILE interface
// Usage:
// 
// new TILE_ENGINE({toolSet:[Array],defaultTool:String});
// toolSet (Array) :: An array of plugin wrappers, each wrapper having the specified properties and methods. These will be 
//                    fed into PluginController
// 
// defaultTool (String) :: ID of the default tool to use (Shows up first after TILE is loaded)
// 
// 
// global variables
var TILEPAGE=null;

(function($){
	var TILE=this;

	// Private variables used within TILE_ENGINE
	// that can be accessed only in the TILE() 
	// local level
	var pluginControl=null; // instance of plugincontroller
	var json=null; // Global JSON session
	var _tileBar=null;
	// local variable for ENGINE, which is fed to 
	// plugins on start()
	var ENGINE=null;
	// used to import data into TILE
	var importDialog=null;
	var curPage=null;
	
	// private methods go here
	var deepcopy=function(oldObject){
		var tempClone = {};

        if(typeof(oldObject) == 'object'){
           for (var prop in oldObject){
               // for array use private method getCloneOfArray
               if((typeof(oldObject[prop]) == 'object') && ($.isArray(oldObject[prop]))){
                   tempClone[prop] = cloneArray(oldObject[prop]);
				}
               // for object make recursive call to getCloneOfObject
               else if (typeof(oldObject[prop]) == 'object'){
                   tempClone[prop] = deepcopy(oldObject[prop]);
			}
               // normal (non-object type) members
               else {
                   tempClone[prop] = oldObject[prop];
				}
			}
		}
       return tempClone;

	};
	
	var cloneArray=function(oldArray){
		var tempClone = [];

        for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++)
            if (typeof(oldArray[arrIndex]) == 'object')
                tempClone.push(deepcopy(oldArray[arrIndex]));
            else
                tempClone.push(oldArray[arrIndex]);

        return tempClone;

	};
	
	/**
	Floating Dialog Box
	author: Tim Bowman
	
	Usage: 
	new FloatingDiv();
	**/
	FloatingDiv = function(){
		var self = this;
		this._color = "#FDFF00";
		this._labels = [];
		this._curLink=null;
		self.defaultColor="000000";
	};
	FloatingDiv.constructor = FloatingDiv;
	FloatingDiv.prototype = {};
	
	$.extend(FloatingDiv.prototype, {
		// Convert RGB color value to hexidecimal: Returns: Hexidecimal number format '#'+number
		// rgb : {String} RGB value in (xxx,xxx,xxx) format
		_rgb2hex: function(rgb) {
			
			// from http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				function hex(x) {
					return ("0" + parseInt(x,10).toString(16)).slice(-2);
				}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
		// stores local variables and initializes HTML
		// Does not attach HTML
		// myID : {String}
		// labels : {Object} - array of label data to store in FloatingDiv
		init: function(myID, labels) {
			// remove any dups
			$('#'+myID).empty().remove();		
			var self=this;
			var htmlString;
			
			htmlString = '<fieldset class="label_formFieldSet">' +
			'<ol class="label_formOL">' +
			'<li class="label_formLI cloneMe" id="formField1">' +
				'<span class="label_formLabel">Label:</span>' +
				'<input id="formLabel1" name="Label1" type="text" class="tagComplete" />' +
				' &nbsp; <img src="skins/columns/floatingDivIcons/add.png" title="Add up to 5 Labels" name="Add up to 5 Labels" id="btnAddLabel">' +
				'<img style="margin-left: 1px; visibility: hidden;" src="skins/columns/floatingDivIcons/delete.png" title="Delete last label" name="Delete last label" id="btnDeleteLabel">' +
				'&nbsp; <span style="" class="addRemove">(Add/Remove Label Fields)</span><br />' +
			'</li>' +
			'</ol>' +
			'<input type="submit" class="submit" value="Apply" id="submitFloatingDiv">' +
			'<input name="hlID" type="hidden" id="TILEid" value="" />'+		
			'<input name="hlHEX" type="hidden" id="TILEcolor" value="" />' +			
			'</fieldset>' +
			'<br />'+
			'<fieldset><ol class="label_formOL">'+
			'<li class="label_formLI">'+
			'<span class="label_formLabel">Data already attached: </span><br/><div id="labelList" class="az"></div>'+
			'</ol></fieldset>';
				
			$('<form></form>')
				.attr({ 
					'id':myID+'_floatingDiv', 
					'name':'TILE Label', 
					'class':'addLabelForm',
					'method':'post'
				})
				.html(htmlString)
				.appendTo('body')
				.hide();	
			$("#"+myID+'_floatingDiv').live("dblclick",function(e){
				e.stopPropagation();
				return false;
			});
						
			// set up label array
			if(labels){
				for(var l in labels){
				
					this._labels[labels[l].name]=labels[l];
					// make sure it has refs array
					if(!this._labels[labels[l].name].refs){
						this._labels[labels[l].name].refs=[];
					}
				}
			}
			this.addAutoComplete('li#formField1 input.tagComplete', self._labels);	
			// INSERTING BUTTON BEHAVIORS //
			// FLOATING DIV DIALOG //
			// on form submit in floating div
			$('input#submitFloatingDiv').live('click', function(e) {
				e.preventDefault();
				self.sendLabels();
				return false;
			});
			// button click for adding more label fields
			$('img#btnAddLabel').live('click', function() {
				var num, newNum, newElem, eStuff;
				// get number of fields
				num	= $('li.cloneMe').length;
				newNum	= (num + 1);

				// create the new element via clone(), and manipulate it's ID using newNum value
				newElem = $('#formField'+num).clone().attr('id', 'formField' + newNum);
				// manipulate the name/id values of the input inside the new element
				newElem.find('input:first').attr('id', 'formLabel'+newNum).attr('name', 'Label'+newNum);
				newElem.find('img').remove();
				newElem.find('.addRemove').remove();

				// insert the new element after the last "duplicatable" input field
				$('li#formField'+num).after(newElem);

				// make things invisible and visible	
				$('#btnDeleteLabel').css('visibility','visible');

				// only allow up to 5 labels
				if (newNum == 5) { $('#btnAddLabel').css('visibility','hidden'); } 
				
				// add Autocomplete to the new Element	
				self.addAutoComplete('li#formField'+newNum+' input.tagComplete', self._labels);
			});

			// button click for deleting label fields
			$('img#btnDeleteLabel').live('click', function() {
				var num;

				num	= $('li.cloneMe').length;
				$('#formField' + num).empty().remove();
				// if only one element remains, disable the "remove" button
				if (num-1 == 1) {
					$('#btnDeleteLabel').css('visibility','hidden');
					$('#btnAddLabel').css('visibility','visible');	
					// $('.addRemove').css('visibility','visible');		
				}
			});
			
			// set up listener for deleting items in attachDataList
			$(".button.shape.delete.formLink").live("click",function(e){
				var id=$(this).parent().attr('id');
				
				self.deleteLinkHandle(id);
				
			});
		},
		// Attaches HTML to DOM
		// myID : {String}
		createDialog:function(myID) {
			var self=this;
			// get id from object
			var elem = '#'+myID+'_floatingDiv';
			
			//create dialog from passed element with passed title
			$(elem).dialog({
				autoOpen: true,
				bgiframe: true,
				resizable: false,
				title: 'Attach Metadata to Object',
				position: 'top',
				persist: false,
				width: 450,
				closeOnEscape: true,
				close: function(event, ui) {
					$(elem).hide();
					return null;
				} 				
			});	
			// overhaul the close function for dialog
			$("a.ui-dialog-titlebar-close").unbind('click');
			$("a.ui-dialog-titlebar-close").live('click',function(e){
				$(".ui-dialog").hide();
			});
			// get list for metadata and adjust size from default CSS
			this._attachDataList=$("#"+myID+"_floatingDiv > fieldset > ol > li > #labelList");
			this._attachDataList.css({"position":"relative","height":"100px"});
			self.addColorSelector(myID,self.defaultColor);
		},	
		// insert new labels/tags and restart 
		// the metadata list and autocomplete
		// lbls : {Object array}
		insertNewLabels:function(lbls){
			var self=this;
			
			// collate with the current _labels
			// go through passed data and extract names, too
			var autoCompleteLbls=[];
			for(var x in lbls){
				if(!lbls[x]||!lbls[x].id) continue;
				if(!lbls[x].name){
					lbls[x].name=(lbls[x].display)?lbls[x].display:lbls[x].id;	
				} 
				if(self._labels[lbls[x].name]){
					continue;
				}
				self._labels.push(lbls[x]);
				autoCompleteLbls.push(lbls[x].name);
			}
			
			if(__v) console.log("_labels in insertNewLabels: "+JSON.stringify(self._labels));
			// get rid of existing autocompletes
			
			$("li > input.tagComplete.ui-autocomplete-input").autocomplete('destroy');
			
			
			if(__v) console.log("autocomplete gets: "+autoCompleteLbls);
			// create new autocompletes with new tags
			$("li > input.tagComplete").autocomplete({
				source:autoCompleteLbls
			});
			
		},
		// Creates jQuery autoComplete object and attaches it 
		// to passed element
		// elem : {Object} - passed jQuery element 
		// labels : {Object} - array of data that represents automplete data - needs to be parsed
		addAutoComplete: function(elem, labels) {
			var self=this;
			// go through passed data and extract names
			var autoCompleteLbls=[];
			for(var l in labels){
				autoCompleteLbls.push(l);
			}
			
			$(elem).autocomplete({
				 source: autoCompleteLbls
			});
						
			return false;	
		},
		// Creates colorpicker object and attaches to FloatingDiv 
		// myID : {String}
		// o : {String} - hexidecimal value (without the #)
		addColorSelector: function(myID, o) {
			var self = this;
			var htmlString;
			
			htmlString = '<span id="floatingColorPicker">Change Object Color: &nbsp; <div id="floatingPenColor"><div style="background-color: #FDFF00;"></div></div></span>';
		
			$('<div></div>')
				.attr({ 
					'id':myID+'_colorSelect', 
					'name':'TILE Color Selector', 
					'class':'addColor'
				})
				.html(htmlString)
				.appendTo('#'+myID+'_floatingDiv'+' > fieldset:eq(0)');
			
	
			var currColor="#"+o;
			// currColor = this._rgb2hex(currColor);
			
			$('#floatingPenColor').ColorPicker({			
				color: currColor,
				onShow: function (colpkr) {
					$(colpkr).fadeIn(500);
					return false;
				},
				onHide: function (colpkr) {
					$(colpkr).fadeOut(500);
					return false;
				},
				onChange: function (hsb, hex, rgb) {
					// $('span.'+o.id).css('background-color', '#'+hex);
					$('#floatingPenColor div').css('backgroundColor', '#' + hex);
					$("body:first").trigger("colorChanged",[hex,self._curLink]);
				}
			});	
		},
		// o : {Object} - has tool id, object id, object type
		setInputObject:function(o,refs){
			var self=this;
			if(!o) return;
			self._curLink=o;
			// reset the attachDataList
			self._attachDataList.empty();
			var html="";
			// if refs passed, add each one to curLink's refs
			if(refs){
				var sh=null;
				for(var r in refs){
					for(var x in self._labels){
						if(self._labels[x].id==refs[r].id){
							if(!self._labels[x].refs) {
								self._labels[x].refs=[];
								self._labels[x].refs.push(self._curLink.id);
								sh=true;
							} else if($.inArray(self._curLink.id,self._labels[x].refs)<0){
								self._labels[x].refs.push(self._curLink.id);
								sh=true;
							}
							break;
						}
					}
					if(!sh){
						var key=refs[r].id;
						// didn't find it in labels - need to add new (invisible label)
						self._labels[key]=refs[r];
						if(__v) console.log(JSON.stringify(self._labels[key]));
						if(!(self._labels[key].refs)) self._labels[key].refs=[];
						self._labels[key].refs=[self._curLink.id];
					}
				}
			}
			// check to see if curlink object's id is in any referenced 
			// label arrays
			for(var a in self._labels){
				
				if($.inArray(self._curLink.id,self._labels[a].refs)>=0){
					html+="<div id=\""+self._labels[a].id+"\" class=\"labelItem\">"+self._labels[a].display+"<span id=\"del_"+self._labels[a].id+"\" class=\"button shape delete formLink\">X</span></div>";
					
				}
				
				
			}
		
			self._attachDataList.append(html);
		},
		// Finds all labels that the user references. 
		// Puts parsed data into array and passes it out using
		// event call floatDivOutput
		// 
		sendLabels:function(){
			var self=this;
			if(!self._curLink) return;
			var lbls=[];
		
			// loop through form field vals and assign to _labels obj

			$('li.cloneMe').each(function(i) {
				var n = i+1;
				lbls[i] = $('input#formLabel'+n).val();
			});
			var refs=[];
			var html="";
			for(var x in lbls){
				if(!lbls[x]) continue;
				if(!self._labels[lbls[x]]){
					var id="l_"+(Math.floor(Math.random()*560));
					
					self._labels[lbls[x]]={id:id,name:lbls[x],type:'labels',tool:"LB1000",refs:[]};
					// create a new autoComplete that includes new labels
					$("input.tagComplete").autocomplete('destroy');
					var lblnms=[];
					for(var name in self._labels){
						lblnms.push(self._labels[name].name);
					}
					$("input.tagComplete").autocomplete({
						source:lblnms
					});
				}
				
				html+="<div id=\""+self._labels[lbls[x]].id+"\" class=\"labelItem\">"+lbls[x]+"<span id=\"del_"+self._labels[lbls[x]].id+"\" class=\"button shape delete formLink\">X</span></div>";
				
				
				var sendref=$.extend(true,{},self._labels[lbls[x]]);
				sendref.display=lbls[x];
				refs.push(sendref);
				self._labels[lbls[x]].refs.push(self._curLink.id);
				
			}
			// attach references to the attachList
			self._attachDataList.append(html);
			// call custom event
			$("body:first").trigger("floatDivOutput",[{link:self._curLink,refs:refs}]);
			
		},
		// Take passed id, find the data it references,
		// then delete from current linked object
		// id : {String},
		
		deleteLinkHandle:function(id){
			var self=this;
			// remove the matched metadata item from
			// the current inputObject
			if(!self._curLink) return;
			var lb=null;
			for(var i in self._labels){
				if(self._labels[i].id==id){
					lb=self._labels[i];
					break;
				}
			}
			if(lb===null) return;
			$("#labelList > #"+lb.id).remove();
			var n=$.inArray(self._curLink.id,lb.refs);
			if(n===0){
				lb.refs=[];
			} else if(n>0){
				var ac=[];
				$.each(lb.refs,function(i,o){
					if(self._curLink.id!=o){
						ac.push(o);
					}
				});
			
				lb.refs=ac;
			}
			$.extend(lb,{parentTool:self._curLink.tool,parentObj:self._curLink.id,parentType:self._curLink.type});
			
			$("body:first").trigger("deleteMetaLink",[lb]);
		}
		
	});
	
	// TILE.FloatingDiv = FloatingDiv;
	

	


	// NOTE: not using Monomyth
	var HelpBox=function(args){
		var self=this;
		var id=Math.floor(Math.random()*255);
		while($("#helpbox_"+id).length){
			id=Math.floor(Math.random()*255);
		}
		
		$("<div id=\"helpbox_"+id+"\" class=\"helpbox\"><span class=\"helpbox header\">Help</ul></span><span id=\"helptext_"+id+"\" class=\"helpbox text\"></span></div>").appendTo("body");
		self.DOM=$("#helpbox_"+id);
		self.DOM.hide();
		self.txtArea=$("#helptext_"+id);
		// insert user text
		self.txtArea.text(args.text);
		self.helpIcon=$("#"+args.iconId);
		// set up listeners for the helpIcon
		self.helpIcon.live('mouseover',function(e){
			setTimeout(function(self){
				// show the dialog
				var x=e.pageX;
				var y=e.pageY;

				self.DOM.css({"left":x+'px',"top":y+'px'});
				self.DOM.show();
				setTimeout(function(self){
					self.DOM.hide();
				},10000,self);
			},10,self);
		
		});
		self.helpIcon.live('mouseout',function(e){
			// hide the dialog
			self.DOM.hide();
		});
	};
	HelpBox.prototype={
		appear:function(e){
			var self=this;
			var x=e.pageX;
			var y=e.pageY;
		
			self.DOM.css({"left":x+'px',"top":y+'px'});
			self.DOM.show();
		},
		hide:function(e){
			self.DOM.hide();
		}
	};
	
	TILE.HelpBox=HelpBox;
	
	/**
	Dialog Boxes: Import, New Image, Load Tags
	**/
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
			'</div><div class="body"><div class="selectOptions"><h3>Import Image List from File</h3><form id="importDataFormMulti" action="" method="post"enctype="multipart/form-data">'+
			'<label for="file">Filename:</label><input id="importDataFormInputMulti" type="text" name="file" id="file" value="" />'+
			'<span id="ImportDialogHelp1" class="helpIcon">?</span><br/><label>Test Data:</label><br/>'+
			'<input id="hamLoad" class="form_Choice" type="radio" value="Hamlet"  name="importchoice" /> Hamlet 1611 Quarto<br/>'+
			'<input id="pemLoad" class="form_Choice" type="radio" name="importchoice" /> Pembroke 25<br/>'+
			'<input id="swineburne1" class="form_Choice" type="radio"  name="importchoice" /> Swinburne Cleopatra<br/><input id="importDataFormSubmitMulti" title="Submit the Import Path." type="submit" class="button" name="submit" value="Submit" />'+
			'</form><p class="version">version 0.80</p></div><div class="description"><h3>Introduction to TILE</h3>'+
			'<p>A collaborative project among the Maryland Institute for Technology in the Humanities (Doug Reside) and the'+
			' Indiana University Bloomington (Dot Porter, John A. Walsh), the Text-Image Linking Environment (TILE) is a project for developing '+
			'a new web-based, modular, collaborative image markup tool for both manual and semi-automated linking between encoded text and images'+
			' of text, and image annotation.</p><p><a href="http://mith.info/tile">Read more &#62;</a></p></div><div class="clear"></div>'+
			'</div></div></div><div id="fade" class="black_overlay"></div>';
			$(html).appendTo(self.loc);
			self.index=($("#dialog").length+self.loc.width());

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
			var obj=e.data.obj;
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

	// TILE.ImportDialog=ImportDialog;

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
			if((!args.loc)||(!args.html)) {throw "Not enough arguments passed to Dialog";}
			self.loc=args.loc;
			//set up JSON html
			self.html=args.html;
			$(self.html).appendTo(self.loc);
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
		// submitHandle:function(e){
		// 			e.preventDefault();
		// 			var self=e.data.obj;
		// 			
		// 			// get input file
		// 			var url=$("#importTagsFileName").val();
		// 			// make AJAX call
		// 			$.ajax({
		// 				url:url,
		// 				dataType:"text",
		// 				success:function(json){
		// 					$("body:first").trigger("prevJSONLoaded",[json]);
		// 				}
		// 			});
		// 		},
		// hide dialog box - called by closeLoadTags, openImport, openNewImage, openExport
		// e : {Event}
		close:function(e){
			var obj=e.data.obj;
			obj.light.hide();
			obj.DOM.hide();
			obj.fade.hide();
		}
	};

	// TILE.LoadTags=LoadTags;

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
		if((!args.loc)||(!args.html)) {throw "Not enough arguments passed to Dialog";}
		self.loc=args.loc;
		//set up JSON html
		self.html=args.html;
		$(self.html).appendTo(self.loc);
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
			if(!self.json) return;
			// get src script from user
			// var srcscript=self.fileI.val();
			// attach a script element to the page with src
			// set to the file specified by the user
			var sel=$("<script type='text/javascript' src='importWidgets/exportJSONXML.js'></script>");
			// attach to header
			$("head").append(sel);
			// bind DONE event to the body tag
			$("body").bind("exportStrDone",{obj:self},self._expStrDoneHandle);
			
			self.srcXML.val(self.json.sourceFile.replace(".xml",""));
			// stringify if not already a string
			if(typeof self.json != "string") self.json=JSON.stringify(self.json);
			
			//perform a set timeout with function from js script
			setTimeout(function(self,sel){
				exportToTEI(self.json);
				sel.remove();
			},250,self,sel);
		}
	};



	/**Main Engine **/
	// Sets up the TILE toolbar (upper left-hand corner) with the 
	// tool selection drop-down, buttons for saving and exporting 
	// data
	// 
	// Objects: 
	// PluginController

	var TILE_ENGINE=function(args){
			// set local ENGINE variable so that PluginController + other local
			// methods can access this
			ENGINE=this;
		
		
			//get HTML from PHP script and attach to passed container
			this.loc=(args.attach)?args.attach:$("body");
			var self=this;
			// toolSet=(args.toolSet)?args.toolSet:[];
			json=null;
			self.manifest=null;
			self.curUrl=null;
			
			// set up plugin controller and listeners for plugin controller
			pluginControl=new PluginController({toolSet:args.toolSet,defaultTool:args.defaultTool});
			
			// listens for when plugin controller finishes loading JSON data 
			// from plugins
			// TODO: get rid of this?
			// $("body").bind("toolSetUpDone",{obj:self},function(e){
			// 				var self=e.data.obj;
			// 				self.setUp();
			// 				// $.ajax({
			// 				// 					url:"lib/JSONHTML/dialogs.json",
			// 				// 					dataType:"json",
			// 				// 					success:function(x){
			// 				// 						self.dialogJSON=x;
			// 				// 						// self.addDialogBoxes();
			// 				// 						
			// 				// 					}
			// 				// 				});
			// 			});
			// check if there is json data 
			self.checkJSON();
	};
	TILE_ENGINE.prototype={
		// Called to see if there is a JSON object stored in the PHP session() 
		checkJSON:function(){
			var self=this;
			var file=$.ajax({
				url:'PHP/isJSON.php',
				dataType:"text",
				async:false
			}).responseText;
			if(file){
				json=JSON.parse(file);
			}
			self.getBase();
		},
		//Calls TILECONSTANTS.json file and gets base, possible json data
		getBase:function(){
			
			//check JSON file to configure main path
			var self=this;
			$.ajax({url:'tilevars.php',dataType:'json',success:function(d){
				//d refers to the JSON data
				self._importDefault=d.pemLoad;
				self._exportDefault=d.exportDefault;
				self.preLoads=d;
				self.DOM=$("body");
				self.schemaFile=null;
				self.preLoadData=null;
			
				self.toolJSON={};
				// set up HTML and callbacks for main code
				self.setUp();
				// $.ajax({
				// 					dataType:"json",
				// 					url:"./lib/JSONHTML/columns.json",
				// 					success:function(d){
				// 						//d represents JSON data
				// 
				// 						self.DOM=$("body");
				// 						self.schemaFile=null;
				// 						self.preLoadData=null;
				// 						self.mainJSON=d;
				// 						self.toolJSON={};
				// 						
				// 						// go through and parse together all tool json data
				// 						// pluginControl.setUpToolData();
				// 						self.setUp();
				// 					}
				// 				});
			},
			error:function(d,x,e){
				if(__v) console.log("Failed to load TILECONSTANTS.json "+e);
				
			},
			async:false});
		},
		//called after getBase(); creating main TILE interface objects and
		//setting up the HTML
		// d : {Object} - contains columns.json data
		setUp:function(){
			var self=this;
			
			
			
			//create log - goes towards left area
			// this._log=new Transcript({loc:"logbar_list",text:null});
			// this._activeBox=new ActiveBox({loc:"az_activeBox"});
			// importDialog=new ImportDialog({loc:$("body")});
			
			_tileBar=new TileToolBar({loc:"tile_toolbar"});
		
			//global bind for when the ImportDialog sends the user-input file
			// $("body").bind("schemaFileImported",{obj:this},function(e,file){
			// 				self.getSchema(file);
			// 			});
			
			//for when user clicks on save
			$("body").bind("saveAllSettings",{obj:this},this._saveSettingsHandle);
			
			//global bind for when a new page is loaded
			$("body").bind("newPageLoaded",{obj:this},this._newPageHandle);
			// global bind for when user wants to export the JSON session as XML
			$("body").bind("exportDataToXML",{obj:this},this._exportToXMLHandle);
			//global bind for when user selects a new tool from LogBar
			$("body").bind("toolSelected",{obj:self},function(e,name){
				// close down the default tool, open up new tool
				pluginControl.switchTool(name,self.manifest);
			});
			// global bind for when user draws shape in VectorDrawer
			// $("body").bind("receiveShapeObj",{obj:this},this._shapeDrawnHandle);
			//if json data not already loaded, then open up ImportDialog automatically
			// to prompt user
		
			
		
			//if there's a json object already loaded,set up the manifest 
			
			// array to pass to tools
			if(self.json){
				self._parseOutJSON();
			}
			
			// initTools for all plugins - calls start() functions
			// for all plugin wrappers
			pluginControl.initTools();
		},
		// adds a toolbar button to TileToolBar
		addToolBarButton:function(button){
			// send to _tileBar
			if(__v) console.log("showing button: "+JSON.stringify(button));
			_tileBar.addButton(button);
		},
		/**Get Schema**/
		//taken from setMultiFileImport Custom Event call from ImportDialog
		// users supply a filename in ImportDialog that is then used here 
		// as @file
		// file : {String}
		getSchema:function(file){
			var obj=this;
			//We are just getting the file with images
			// and the transcripts
			obj.imageFile=file;
			while(/\&/.test(obj.imageFile)){
				obj.imageFile=obj.imageFile.replace('\&','_AND_');
				
			}
			
			// set JSON and run parsing
			var d=$.ajax({
				url:"PHP/parseRemoteJSON.php?file="+obj.imageFile,
				dataType:'text',
				async:false,
				error:function(d,x,e){
					if(__v) console.log("Failed to perform Ajax call  "+e);
				}
			}).responseText;
			
			
			// parse if it's a string
			json=(typeof d=='object')?d:eval("("+d+")");
			obj._parseOutJSON();
			pluginControl.setJSON();
		},
		// Put data into the JSON session
		insertData:function(data){
			var self=this;
			pluginControl.addDataToJSON(data);
		},
		// sets a particular object as an active object.
		// All future data sent to insertData gets inserted
		// in this object's jsonName array
		setActiveObj:function(obj){
			pluginControl._setActiveObj(obj);
		},
		// deletes an item or reference from the JSON session
		deleteObj:function(obj){
			var self=this;
			// use plugincontrol
			pluginControl.deleteLink(obj);
		},
		// change to the next/previous page in json
		changePage:function(val){
			var self=this;
			// -1: prev, 1: next
			if(val>0){
				// next
				var n=null;
				for(var prop in json.pages){
					if(!json.pages[prop]) continue;
					if(n){
						// set page and move out
						// of loop
						curPage=json.pages[prop].url;
						break;
					}
					if(json.pages[prop].url==curPage){
						// move it to next prop
						n=true;
					}
				}
			} else {
				// back
				var prev=null;
				for(var prop in json.pages){
					if(!json.pages[prop]) continue;
					
					if(json.pages[prop].url==curPage){
						// set the curPage to the previous
						// one found and break out of loop
						// If none found, break out of loop
						// only
						if(!prev) break;
						curPage=prev;
						break;
					}
					prev=json.pages[prop].url;
				}
				
			}
			TILEPAGE=curPage; // updating global variable
			// update JSON for plugins
			pluginControl.setJSON();
		},
		// Method that supports adding tags to the 
		//  Metadata tags div (FloatingDiv)
		// arr : {Object Array}
		insertTags:function(arr){
			var self=this;
			pluginControl.setTags(arr);
			
		},
		// Performs the task of parsing out the JSON structure passed
		// either in SESSION or through importDialog
		// Converts the JSON into the .manifest array for other objects
		// to use
		_parseOutJSON:function(){
			var self=this;
			if(!json) return;
			
			self.manifest={};
			// IMPORTANT: ASSUMES THAT ALL OBJECTS COMING INTO TILE HAVE UNIQUE
			// IDS ATTACHED TO THEM
			var dt=new Date();
			var tlines=[];
			
			
			//format for duplicates
			//organize manifest by url
			for(var key in json.pages){
				var url=json.pages[key].url;
				if(!curPage){ 
					// set local and global variables
					curPage=url;
					TILEPAGE=curPage;
					}
				self.manifest[url]=json.pages[key];
			
			}
			
			for(var key in json){
				if(/sourceFile/.test(key)|| (/pages/.test(key)) || (/^http/.test(key))) continue;
				
				self.manifest[key]=json[key];
			
			}
			
			//send to toolbar
			_tileBar.setChoices(pluginControl.toolSet);
		
			// pluginControl.initTools(self.manifest);
		},
		//sets up the HTML and functions for the Dialog boxes
		addDialogBoxes:function(){
			var self=this;
			//load dialog boxes
			this.importDialog=new ImportDialog({
				loc:$("body"),
				html:this.dialogJSON.dialogimport,
				auto:this._importDefault,
				choices:self._importChoices
			});
			this.loadTagsDialog=new LoadTags({
				loc:$("body"),
				html:this.dialogJSON.dialogloadtags
			});
			// //new Image Dialog
			// 			this.nImgD=new NewImageDialog({loc:"body",html:this.dialogJSON.dialogaddimage});
			// 			
			//export Data Dialog
			this.expD=new ExportDialog({loc:"body",html:this.dialogJSON.dialogexport,defaultExport:this._exportDefault});
			
			if(!self.json){
				//display importDialog to user - no json already given
				// JSON needs to be supplied in ImportDialog
				$("body").trigger("openImport");
			}
		},
		// Called by newPageLoaded Custom Event
		// e : {Event}
		// url : {String} represents new url of srcImageForCanvas
		// for loading/creating data in the TILE_ENGINE master manifest file
		_newPageHandle:function(e,url){
			if(__v) console.log("new page handle in tile1.0 reached");
			var self=e.data.obj;
			//current url passed
			//get index in json
			var page=null;
			//check manifest for next transcript lines
			if(self.manifest[url]){
				self.curUrl=url;
				if(!self.manifest[url].lines) self.manifest[url].lines=[];
				// self._log._addLines(self.manifest[url].lines,url);
				// self._activeBox.clearArea();
			}
		},
		// Called after saveAllSettings Custom Event is fired
		// e : {Event}
		_saveSettingsHandle:function(e){
			var self=e.data.obj;
				
			// go through each tool and use the bundleData function
			// for that tool - returns modified manifest each time
			
			if(!self.manifest) return;
			// if(__v) console.log("SAVE SETTINGS CLICKED, PASSING MANIFEST: "+JSON.stringify(self.manifest));
			self.manifest=pluginControl.getPluginData(self.manifest);
			// for(t in self.toolSet){
			// 				self.manifest=self.toolSet[t].bundleData(self.manifest);
			// 			}
			// self.manifest[self.curUrl].lines=self._log.exportLines();
			// self.manifest=self.curTool.bundleData(self.manifest);
			
			// if(!self.save) self.save=new Save({loc:"azglobalmenu"});
			var exfest=[];
			var curl=null;

		
		
			//merge manifest data with json data
			for(var m in self.manifest){
				// initialize all variables that don't exist in the json
				
				if(/^http|\/|\./.test(m)){
					for(var p in json['pages']){
						// page p
						if(json['pages'][p].url==m){
							
							var temp=$.extend(true,{},self.manifest[m]);
							// if(!self.json[m][p]) self.json[m][p]=[];
							json['pages'][p]=temp;
							
							break;
						}
					}
					
				} else if((!(/pages/.test(m)))&&(!(/^http|\/|\./.test(m)))){
					json[m]=[];
					if(__v) console.log("processing non-page item: "+m);
					if(__v) console.log("non-page m: "+JSON.stringify(self.manifest[m]));
					// var temp=$.extend(true,{},self.manifest[m]);
					for(var o in self.manifest[m]){
						json[m].push(self.manifest[m][o]);
					}
					
				}
			}
			if(__v) console.log("FINAL JSON SENT TO userPrompt for Save: "+JSON.stringify(json));
			self.savePrompt(json);
		},
		// Handles the exportDataToXML Event call
		// e : {Event}
		_exportToXMLHandle:function(e){
			var self=e.data.obj;
			// hide the metadata box
			$(".ui-dialog").hide();
			// get all relevant session data 
			// and output to exportDialog
			// for(t in self.toolSet){
			// 			self.manifest=self.toolSet[t].bundleData(self.manifest);
			// 		}
			// self.manifest[self.curUrl].lines=self._log.exportLines();
			
			self.manifest=pluginControl.getPluginData(self.manifest);
			var exfest=[];
			var curl=null;
			
			//merge manifest data with json data
			for(var m in self.manifest){
				// initialize all variables that don't exist in the json
				
				if(/^http|\/|\./.test(m)){
					
					for(var p in json['pages']){
						// page p
						if(json['pages'][p].url==m){
							if(__v) console.log("inserting url "+m+" into "+JSON.stringify(json['pages'][p]));
							var temp=$.extend(true,{},self.manifest[m]);
							// if(!self.json[m][p]) self.json[m][p]=[];
							json['pages'][p]=temp;
							if(__v) console.log("self.json[pages]"+p+"  now: "+JSON.stringify(json['pages'][p]));
							break;
						}
					}
				} else if((!(/^http|\/|\./.test(m)))&&(!(/pages/.test(m)))){
					if(!json[m]) json[m]=[];
					if(__v) console.log("processing non-page item: "+m);
					if(__v) console.log("non-page m: "+JSON.stringify(self.manifest[m]));
					for(var o in self.manifest[m]){
						json[m].push(self.manifest[m][o]);
					}
					
				}
			}
			if(__v) console.log("FINAL JSON SENT TO userPrompt in ExportXML: "+JSON.stringify(json));
			// send the JSON object to exportDialog
			$("body:first").trigger("openExport",json);
		},
		savePrompt:function(json){
			$("#uploadData").val(JSON.stringify(json));
			//submit POST data
			$("#inv_SaveProgress_Form")[0].submit();
			// clear form
			$("#uploadData").val('');
		},
		// public function that handles output of JSON
		getJSON:function(opt){
			// generate a copy of the JSON variable and output it
			var self=this;
			if(!json) return false;
			// var jsoncopy=deepcopy(json);
			var jsoncopy=false;
			if(opt){
				for(var x in json.pages){
					if(json.pages[x].url==curPage){
						// copy only the current page
						jsoncopy=deepcopy(json.pages[x]);
					}
				}
			} else {
				// copy the full json view
				jsoncopy=deepcopy(json);
			}
			
			
			return jsoncopy;
			
			
		}
	};
	
	TILE.TILE_ENGINE=TILE_ENGINE;

	// ----------------- //
	//  PluginController //
	// ----------------- //
	// Internal Object that controls plugins
	
	PluginController=function(args){
		var self=this;
		if(!args) return;
		// array for holding tool objects
		self.toolSet=[];
		for(var i in args.toolSet){
			self.toolSet[args.toolSet[i].id]=args.toolSet[i];
		}
		// manifest for holding objects created in session and previous sessions
		self.manifest={};
		// array for holding reference data
		self.linkArray=[];
		// lookup array for refs
		self.refArray=[];
		
		// array for holding tool JSON data
		self.toolJSON=[];
		self.startTool=args.toolSet[0].id;
		self.defaultTool=args.defaultTool;
		for(x in self.toolSet){
			self.manifest[self.toolSet[x].id]=[];
		}
		self.activeTool=null;
		
		// set up the floating box
		self.floatDiv=new FloatingDiv();
		// get initial metadata
		var metaData=[];
		self.floatDiv.init('tilefloat',metaData); 
		self.floatDiv.createDialog('tilefloat');
		$("#tilefloat_floatingDiv").parent().hide();
		// $("body").bind("floatDivAppear",{obj:self},self._attachFloatDiv);
		$("body").bind("floatDivOutput",{obj:self},self._floatDivOutputHandle);
		
		// make sure that the floatingDiv goes away when loading a new page
		$("body").live("newPageLoaded",function(e){
			$(".ui-dialog").hide();
		});
		$("body").live("colorChanged",function(e,color,link){
			// color : {String} hexidecimal units
			// pass on change in color as an object change
			// Any listening objects can pick up on this event
			if(!(/#/.test(color))) color="#"+color;
			$("body:first").trigger("ObjectChange",[{type:"color",value:color,obj:link}]);
		});
		$("body").live("deleteMetaLink",{obj:self},self._deleteLinkHandle);
	}; 
	PluginController.prototype={
		setUpToolData:function(){
			var self=this;
			var toolIds=[];
			for(s in self.toolSet){
				// initialize the manifest for this id
				self.manifest[s]=[];
				toolIds.push(s);
			}
			
			// now go through array of files and download all data into toolJSON{}
			function recLoad(i){
				if(i>=toolIds.length) {
					// now set up dialogs
					//get dialog JSON data
					$("body:first").trigger("toolSetUpDone");
				
					return;
				}
				// attach possible event calls from plugin
				if(self.toolSet[toolIds[i]].output){
					$("body").bind(self.toolSet[toolIds[i]].output,{obj:self},self._toolOutputHandle);
				}
				
				// go through each tool and check if it has a JSON
				// file parameter, if so, save data 
				
				if(self.toolSet[toolIds[i]].json&&(self.toolSet[toolIds[i]].json.length)){
					if(!(/json$|JSON$/.test(self.toolSet[toolIds[i]].json))){
						i++;
						recLoad(i);
					} else {
						$.ajax({
							url:"lib/JSONHTML/"+self.toolSet[toolIds[i]].json,
							dataType:"json",
							success:function(d){
								self.toolJSON[self.toolSet[toolIds[i]].name]=d;
								i++;
								recLoad(i);
							}
						});
					}
				} else {
					// no file given - continue
					i++;
					recLoad(i);
				}
				
			}
			
			recLoad(0);
		},
		switchTool:function(name,json){
			
			var self=this;
			$("body").bind(self.toolSet[self.startTool]._close,function(){

				$("body").unbind(self.toolSet[self.startTool]._close);
				$(".ui-dialog").hide();
				self.setUpTool(name,json);
			});

			self.toolSet[self.startTool].close();
		},
		// sets up the initial tool that is stored in the toolSet array
		// toolname : {String} - index for tool represented by the name of that tool
		// data : {Object} (optional) - array of arguments to pass to a tool's constructor
		setUpTool:function(toolname,json){
			
			var self=this;
			toolname=toolname.toLowerCase();
			// console.log('calling setuptool with: '+toolname+"  and "+obj.curTool);
			if(self.curTool&&(self.curTool.name==toolname)) return;
			
			var nextTool=null;
			for(tool in self.toolSet){
				if(!self.toolSet[tool].name) continue;
				if(self.toolSet[tool].name.toLowerCase()==toolname){
					nextTool=self.toolSet[tool];
				}
			}
			if(!nextTool) throw "Error setting up tool "+toolname;
			if(!self.curTool){
				// no previous tool selected
				self.curTool=nextTool;
			}
			// update the json
			json=self.getPluginData(json);
		
			// wait for when current tool calls final close function
			// close function doesn't pass data
			$("body").bind(self.curTool._close,{obj:self},function(e,toolData){
				$("body").unbind(self.curTool._close);
				$("body:first").trigger("switchBarMode",[self.toolSet[self.defaultTool].name]);
				self.curTool=null;
				var n=$("#srcImageForCanvas").attr("src").indexOf('=');
				var url=$("#srcImageForCanvas").attr("src").substring((n+1));
				// if(__v) console.log("setting up the start tool in PC: "+url+" "+JSON.stringify(json));
				var m=(json)?json[url]:toolData;
				
				self.toolSet[self.startTool].restart(toolData);
			});
			var m=(json)?json[$("#srcImageForCanvas").attr("src")]:null;
			// console.log('restarting '+obj.curTool.name);
			self.curTool.restart(m);
		},
		initTools:function(){
			var self=this;
			// self.manifest=json;
			// Set up the imagetagger here, after setting up all of the dialog boxes that can load
			// JSON data for the imagetagger and any other tools
			
			if(self.toolSet){
				
				var toolIds=[];
				for(s in self.toolSet){
					toolIds.push(s);
				}
				// set up linkArray with json data
				for(var a in json){
					if(!self.linkArray[a]) self.linkArray[a]=[];
					self.linkArray[a]=json[a];
					
				}
				var metaData=[];
				// set up all tools/plugins to load their dependencies
				function recTool(t){
					if(t>=toolIds.length) {
						// Go back to imagetagger by default?
						// May be changed to user's preferences
						$("body").unbind(self.toolSet[toolIds[(t-1)]]._close);
						self.curTool=null;
						
						self.toolSet[self.startTool].start(ENGINE);
						
						return;
					}
					var ct=self.toolSet[toolIds[t]];
					// Running the tool plugin constructor
					ct.start(ENGINE);
					// if(ct.activeCall){
					// 						$("body").bind(ct.activeCall,{obj:self},self._setActiveTool);
					// 					}
					// 					if(ct.outputCall){
					// 						$("body").bind(ct.outputCall,{obj:self},self._toolOutputHandle);
					// 					}
					// 					if(ct.deleteCall){
					// 						$("body").bind(ct.deleteCall,{obj:self},self._deleteLinkHandle);
					// 					}
					
					// if(ct.metaData) $.merge(metaData,ct.metaData);
					// self.activeTool=ct;
					if(ct.close){
						ct.close();
					}
					if(t>=toolIds.length) return;
					t++;
					recTool(t);
				}
			}
			recTool(0);
			
			// set up listener for loadItems
			$("body").bind("loadItems",function(e){
				$(".ui-dialog").hide();
			});
			
		},
		// inserts new tags into FloatingDiv
		setTags:function(arr){
			var self=this;
			if(__v) console.log('arr in setTags: '+JSON.stringify(arr));
			self.floatDiv.insertNewLabels(arr);
		},
		// set new json using loadJSON in all plugins
		setJSON:function(){
			var self=this;
			for(var s in self.toolSet){
				if(self.toolSet[s].loadJSON){
					self.toolSet[s].loadJSON(ENGINE);
				}
			}
		},
		_setActiveObj:function(_newActiveObj){
			var self=this;
			$(".ui-dialog").hide();
			
			// for(i in self.toolSet){
			// 				if((self.toolSet[i].id)&&(self.toolSet[i].id==id)){
			// 					self.activeTool=self.toolSet[i];
			// 				} else {
			// 					if(self.toolSet[i].unActive) self.toolSet[i].unActive();
			// 				}
			// 			}
			self.activeObj=_newActiveObj;
		},
		// Called after a tool has fired it's 'outputCall' Custom Event
		// Also include the objects and references in respective arrays
		// e : {Event}
		// data : {Object} (optional arguments to pass after completing tool .close() method)
		_toolOutputHandle:function(e,data){
			var self=e.data.obj;
			// make sure tool is active and not referencing itself
			// if((!(self.activeTool))||(self.activeTool.id==data.tool)){
			// 				// self.activeTool=self.defaultTool;
			// 				// attach the floatingDiv if attachHandle is included
			// 				
			// 				if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data);
			// 				// see if object exists and needs updating
			// 				
			// 				
			// 				return;
			// 			} else 
			if(!(self.activeObj)){
				if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data);
				return;
			}
			
			// have activeTool, pass the object or array of objects
			// to parseLink to be set in the linkArray (session data)
			
			if($.isArray(data.obj)){
				for(var o in data.obj){
					self.parseLink(data.obj[o],self.activeObj);
				}
			} else {
				self.parseLink(data,self.activeObj);
			}
		
			if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data,self.refArray[data.id]);
			// FUNCTION STOPS
			return;
			
			////////////////////////////
			// not being used :
			// if(data.inputTool&&data.payload){
			// 			if(self.toolSet[data.inputTool]){
			// 				self.toolSet[data.inputTool].inputData(data.payload);
			// 				for(var p in data.payload){
			// 					if(data.payload[p].level=='global'){
			// 						if(self.linkArray[data.payload[p].type]){
			// 							// replace previous data or push new data on stack
			// 							
			// 						}
			// 					} else if(data.payload[p].level=='page'){
			// 						
			// 					}
			// 				}
			// 			}
			// 			return;
			// 		}
			// 		if(data.parentTool=='none'){
			// 			// attach the floatingDiv if attachHandle is included
			// 			
			// 			if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data);
			// 			return;
			// 		}
			// 		// make sure tool is active and not referencing itself
			// 		if(((!self.activeTool)||(self.activeTool.id==data.tool))){
			// 			// self.activeTool=self.defaultTool;
			// 			// attach the floatingDiv if attachHandle is included
			// 			
			// 			if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data);
			// 			// see if object exists and needs updating
			// 			
			// 			
			// 			return;
			// 		};
			// 		
			// 		
			// 		
			// 		// if(!self.activeTool.inputData) return;
			// 		
			// 		if(self.activeTool.inputData){
			// 			// store data of link into manifest
			// 			if(!self.manifest[self.activeTool.id]) self.manifest[self.activeTool.id]=[];
			// 			// if($.inArray(data.id,self.manifest[self.activeTool.id])>0) self.manifest[self.activeTool.id].push(data.id);
			// 			
			// 			// get the link from this activeTool and return to output tool
			// 			var link=self.activeTool.getLink();
			// 			// var n=self.activeTool.inputData({ref:data,obj:link});
			// 			
			// 			// if(link&&(self.toolSet[data.tool].inputData)) {
			// 			// 					self.toolSet[data.tool].inputData({ref:link,obj:data});
			// 			// 				}
			// 			
			// 			// parse link
			// 			self.parseLink(data,link);
			// 			
			// 			
			// 			// current tool can not attach the link to itself - cancel the link process
			// 			// if passed object has handle, attach floatingDiv
			// 			if(data.attachHandle){
			// 				
			// 				self._attachFloatDiv(data.attachHandle,data,[link]);
			// 				
			// 			}
			// 			return true;
			// 		}  else {
			// 			if(data.attachHandle){
			// 				self._attachFloatDiv(data.attachHandle,data);
			// 			}
			// 			return true;
			// 			
			// 		}
			// 		return false;
		},
		// Attaches the FloatingDiv object to given #id
		_attachFloatDiv:function(id,link,refs){
			var self=this;
		
			// id represents element to attach to
			if(id==null) return;
			var pos=$(id).offset();
			if(!pos) return;
			var left=(pos.left+$(id).width()+10);
			if((left+$(".ui-dialog").width())>$(document).width()){
				left=(pos.left-$(".ui-dialog").width()-10);
			}
			$("#tilefloat_floatingDiv").parent().css("left",left+'px');
			$("#tilefloat_floatingDiv").parent().css("top",pos.top+'px');
			$("#tilefloat_floatingDiv").parent().show();
			self.floatDiv.setInputObject(link,refs);
		},
		// Takes output from FloatingDiv and parses it out.
		// Attaches refs to appropriate tool
		_floatDivOutputHandle:function(e,o){
			var self=e.data.obj;
			if(!o) return;
			self.activeObj=o.link;
			for(var i in o.refs){
				if(!o.refs[i]) continue;
				self.parseLink(self.activeObj,o.refs[i]);
				// if(self.toolSet[o.refs[i].tool]&&self.toolSet[o.refs[i].tool].inputData){
				// 				
				// 					// self.toolSet[o.refs[i].tool].inputData({ref:o.link,obj:o.refs[i]});
				// 					// also attach to linked item
				// 					// self.toolSet[o.link.tool].inputData({ref:o.refs[i],obj:o.link});
				// 					// if($.inArray(o.link.id,self.manifest[o.refs[i].tool])>0) self.manifest[o.refs[i].tool].push(o.link.id);
				// 				}
			}
		},
		// simplified version of toolOutput and floatDivOutput
		addDataToJSON:function(data){
			var self=this;
			
			// if there is an activeObj, use parseLink
			if(self.activeObj&&(self.activeObj.id!=data.id)&&(self.activeObj.type!=data.type)){
				// two different objects we're dealing with, send them to parseLink
				self.parseLink(data,self.activeObj);
			} else {
				// just insert the object into json
				// 
				// check for which level to store in 
				if(data.type==data.jsonName){
					// being stored at same level as pages
					if(!json[data.jsonName]){
						json[data.jsonName]=[];
					}
					var copy=deepcopy(data.obj);
					json[data.jsonName].push(copy);
				} else {
					// being stored at page level
					// find URL
					for(var page in json.pages){
						if(json.pages[page].url==data.jsonName){
							if(!json.pages[page][data.jsonName]){
								// create new array on stack
								json.pages[page][data.jsonName]=[];
							}
							var copy=deepcopy(data.obj);
							json.pages[page][data.jsonName].push(copy);
							break;
						}
					}
				}
				self.activeObj=data.obj;
			}
			// Attach the data handle
			if(data.attachHandle){
				self._attachFloatDiv(data.attachHandle,data,self.refArray[data.id]);
			}
			
		},
		// takes data obj1 and obj2 and generates link
		// and stores the objects into the manifest array 
		// if they haven't already been stored there
		parseLink:function(obj1,obj2){
			var self=this;
			if((obj1!=null)&&(obj2!=null)){
				
				
				// check to see if each object is on the global or page level
				// Then insert into the larger JSON session array
				// GLOBAL: Anything not a URL
				// PAGE : a URI
				if(/http\:|\.[jgpt]*/i.test(obj1.jsonName)){
					var url=obj1.jsonName;
					// create new arrays if not already instantiated
					// if(!(self.linkArray[url])) self.linkArray[url]=[];
					
					
					// if(!(self.linkArray[url][obj1.type])) self.linkArray[url][obj1.type]=[];
					var found=-1;
					var page=null;
					// found is true (i.e. >0) only if object has already been inserted in 
					// json 
					for(var p in json.pages){
						// find correct json page
						if(json.pages[p].url==url){
							// store reference of page
							page=p;
							if(json.pages[p][obj1.type]){
								for(var item in  json.pages[p][obj1.type]){
									if(json.pages[p][obj1.type][item].id==obj1.id){
										found=p;
									}
								}
							} else {
								// create the array in json stack
								json.pages[p][obj1.type]=[];
							}
							
							break;
						}
					}
					
					
					
					// storing as an object first, then storing the link
					if(found<0){
						json.pages[page][obj1.type].push(deepcopy(obj1.obj));
						
						// self.linkArray[url][obj1.type].push(obj1.obj);
						found=json.pages[page][obj1.type].length-1;
					}
					// make sure there is array in stack for obj2
					if(!json.pages[page][obj1.type][found][obj2.type]){
						json.pages[page][obj1.type][found][obj2.type]=[];
					}
					
					// if(!(self.linkArray[url][obj1.type][found][obj2.type])){
					// 						
					// 						self.linkArray[url][obj1.type][found][obj2.type]=[];
					// 					}
					
					// creating the link between obj1 as object and obj2 as ID reference -
					// not copying entire obj2 into ob2 array in obj1 stack
					if($.inArray(obj2.id,json.pages[page][obj1.type][found][obj2.type])){
						
						$.merge(json.pages[page][obj1.type][found][obj2.type],[obj2.id]);
						// put data reference in a short-look-up list
						if(!self.refArray[obj1.id]){
							self.refArray[obj1.id]=[];
						}
						self.refArray[obj1.id].push({"id":obj2.id,"type":obj2.type,"jsonName":obj2.jsonName,"display":obj2.display});
						if(__v) console.log('self.refArray: '+JSON.stringify(self.refArray[obj1.id]));
					}					
					
				} else {
					
					var found=-1;
					// find obj1.type in json - if there
					if(!json[obj1.type]){
						// push array onto stack
						json[obj1.type]=[];
					} else {
						for(var p in json[obj1.type]){
							if(json[obj1.type][p].id==obj1.id){
								found=p;
							}
						}
					}
					
					// for(var p in self.linkArray[obj1.type]){
					// 					if(self.linkArray[obj1.type][p].id==obj1.id){
					// 						
					// 						self.linkArray[obj1.type][p][obj1.type].push(obj2.id);
					// 						
					// 						found=p;
					// 						break;
					// 					}
					// 				}
					if(found<0){
						self.linkArray[obj1.type].push(deepcopy(obj1.obj));
						found=self.linkArray[obj1.type].length-1;
						// self.linkArray[obj1.type][self.linkArray[obj1.type].length-1][obj2.type]=[obj2.id];
						
					}
					if(!(json[obj1.type][found][obj2.type])){
						json[obj1.type][found][obj2.type]=[];
					}
					if($.inArray(obj1.id,json[obj1.type][found][obj2.type])<0){
					
						$.merge(json[obj1.type][found][obj2.type],[obj2.id]);
						// put data reference in a short-look-up list
						if(!self.refArray[obj1.id]){
							self.refArray[obj1.id]=[];
						}
						self.refArray[obj1.id].push({"id":obj2.id,"type":obj2.type,"jsonName":obj2.jsonName,"display":obj2.display});
						if(__v) console.log('self.refArray: '+JSON.stringify(self.refArray[obj1.id]));
					}
				
				}
				// Repeat steps for obj2
				
				if(/http\:|\.[jgpt]*/i.test(obj2.jsonName)){
					var url=obj2.jsonName;
					// create new arrays if not already instantiated
					// > if(!(self.linkArray[url])) self.linkArray[url]=[];
					// > 					if(!(self.linkArray[url][obj2.type])) self.linkArray[url][obj2.type]=[];
					
					
					var found=-1;
					var page=null;
					// found is true (>0) only if object has already been inserted in 
					// json
					for(var p in json.pages){
						// find correct json page
						if(json.pages[p].url==url){
							// store reference of page
							page=p;
							if(json.pages[p][obj2.type]){
								for(var item in  json.pages[p][obj1.type]){
									if(json.pages[p][obj2.type][item].id==obj1.id){
										found=p;
									}
								}
							} else {
								// create the array in json stack
								json.pages[p][obj2.type]=[];
							}
							
							break;
						}
					}
					
										// 
										// for(var p in self.linkArray[url][obj2.type]){
										// 	if(self.linkArray[url][obj2.type][p].id==obj2.id){
										// 		
										// 		found=p;
										// 		break;
										// 	}
										// }
					// storing as an object first, then storing the link
					if(found<0){
						json.pages[page][obj2.type].push(deepcopy(obj2.obj));
						found=json.pages[page][obj2.type].length-1;
					}
					if(!(json.pages[page][obj2.type][found][obj1.type])){
						json.pages[page][obj2.type][found][obj1.type]=[];
					}
					// creating the link between obj1 as object and obj2 as ID reference
					if($.inArray(obj2.id,json.pages[page][obj2.type][found][obj1.type])){
						$.merge(json.pages[page][obj2.type][found][obj1.type],[obj1.id]);
						// put data reference in a short-look-up list
						if(!self.refArray[obj2.id]){
							self.refArray[obj2.id]=[];
						}
						self.refArray[obj2.id].push({"id":obj1.id,"type":obj1.type,"jsonName":obj1.jsonName,"display":obj1.display});
						if(__v) console.log('self.refArray: '+JSON.stringify(self.refArray[obj1.id]));
					}	
				} else {
					
					var found=-1;
					// only found (i.e. >0) if found in json
					if(json[obj2.type]){
						for(var p in json[obj2.type]){
							if(json[obj2.type][p].id==obj2.id){
						
								found=p;
								break;
							}
						}
					}
					if(found<0){
						json[obj2.type].push(deepcopy(obj2.obj));
						found=json[obj2.type].length-1;
						// self.linkArray[obj2.type][self.linkArray[obj2.type].length-1][obj2.type]=[obj2.id];
						
					}
					if(!(self.linkArray[obj2.type][found][obj1.type])){
						json[obj2.type][found][obj1.type]=[];
					}
					if($.inArray(obj2.id,json[obj2.type][found][obj1.type])<0){
						$.merge(json[obj2.type][found][obj1.type],[obj2.id]);
						// put data reference in a short-look-up list
						if(!self.refArray[obj2.id]){
							self.refArray[obj2.id]=[];
						}
						self.refArray[obj2.id].push({"id":obj1.id,"type":obj1.type,"jsonName":obj1.jsonName,"display":obj1.display});
						if(__v) console.log('self.refArray: '+JSON.stringify(self.refArray[obj1.id]));
					}
				}
				
			}
				
				
			
		},	
		// ref : {Object} - id: {String}, type: {String}, tool: {String} ID, parentTool: {String} ID,
		// 			parentObj: {String}, parentType: {String}
		// NEW: ref only has - id: {String}, type: {String}, level: {String}
		_deleteLinkHandle:function(e,ref1,ref2){
			var self=e.data.obj;
			// hide the floatingDiv - currently deleted item is now active
			if(!(ref2)){
				// Deleting an item completely from the linkArray - object
				//  and all references
				if(ref1.type==ref1.jsonName){
					// create new array and copy all items
					// except for deleted one into it
					var nJson=[];
					for(var x in json[ref1.type]){
						if(!(json[ref1.type][x].id==ref1.id)){
							nJson.push(json[ref1.type][x]);
						}
					}
					json[ref1.type]=nJson;
					
				} else if(json[ref1.jsonName][ref1.type]){
					var nJson=[];
					for(var x in json[ref1.jsonName][ref1.type]){
						if(!(json[ref1.jsonName][ref1.type][x].id==ref1.id)){
							nJson.push(json[ref1.jsonName][ref1.type][x]);
						}
					}
					json[ref1.jsonName][ref1.type]=nJson;
				}
				self.refArray[ref1.id]=[];
			} else {
				// deleting ref2.id from references in ref1
				if(ref1.type==ref1.jsonName){
					// at global level
					for(var x in json[ref1.type]){
						if(ref1.id==json[ref1.type][x]){
							var n=$.inArray(ref2.id,json[ref1.type][x][ref2.type]);
							if(n>=0){
								var nJson=[];
								for(var ll in json[ref1.type][x][ref2.type]){
									if(json[ref1.type][x][ref2.type][ll].id!=ref2.id){
										nJson.push(json[ref1.type][x][ref2.type][ll]);
									}
								}
								json[ref1.type][x][ref2.type]=nJson;
								// correct refArray
								nJson=[];
								for(var ll in self.refArray[ref1.id]){
									if(ref2.id!=self.refArray[ref1.id][ll].id){
										nJson.push(self.refArray[ref1.id][ll]);
									}
								}
								self.refArray[ref1.id]=nJson;
							}
							break;
						}
					}
				} else {
					for(var x in json[ref1.jsonName][ref1.type]){
						if(ref1.id==json[ref1.jsonName][ref1.type][x]){
							var n=$.inArray(ref2.id,self.linkArray[ref1.jsonName][ref1.type][x][ref2.type]);
							if(n>=0){
								var nJson=[];
								for(var ll in json[ref1.jsonName][ref1.type][x][ref2.type]){
									if(json[ref1.jsonName][ref1.type][x][ref2.type][ll].id!=ref2.id){
										nJson.push(self.linkArray[ref1.jsonName][ref1.type][x][ref2.type][ll]);
									}
								}
								json[ref1.jsonName][ref1.type][x][ref2.type]=nJson;
								// correct refArray
								nJson=[];
								for(var ll in self.refArray[ref1.id]){
									if(ref2.id!=self.refArray[ref1.id][ll].id){
										nJson.push(self.refArray[ref1.id][ll]);
									}
								}
								self.refArray[ref1.id]=nJson;
							}
							break;
						}
					}
				}
				// Do the same for ref2's reference of ref1
				if(ref2.type==ref2.jsonName){
					// at global level
					for(var x in json[ref2.type]){
						if(ref1.id==json[ref2.type][x]){
							var n=$.inArray(ref1.id,json[ref2.type][x][ref1.type]);
							if(n>=0){
								var nJson=[];
								for(var ll in json[ref2.type][x][ref1.type]){
									if(json[ref2.type][x][ref1.type][ll].id!=ref2.id){
										nJson.push(json[ref2.type][x][ref1.type][ll]);
									}
								}
								json[ref2.type][x][ref1.type]=nJson;
								// correct refArray
								nJson=[];
								for(var ll in self.refArray[ref2.id]){
									if(ref1.id!=self.refArray[ref2.id][ll].id){
										nJson.push(self.refArray[ref2.id][ll]);
									}
								}
								self.refArray[ref2.id]=nJson;
							}
							break;
						}
					}
				} else {
					for(var x in json[ref2.jsonName][ref2.type]){
						if(ref1.id==json[ref2.jsonName][ref2.type][x]){
							var n=$.inArray(ref2.id,json[ref2.jsonName][ref2.type][x][ref1.type]);
							if(n>=0){
								var nJson=[];
								for(var ll in json[ref2.jsonName][ref2.type][x][ref1.type]){
									if(json[ref2.jsonName][ref2.type][x][ref1.type][ll].id!=ref2.id){
										nJson.push(json[ref2.jsonName][ref2.type][x][ref1.type][ll]);
									}
								}
								json[ref2.jsonName][ref2.type][x][ref1.type]=nJson;
								// correct refArray
								nJson=[];
								for(var ll in self.refArray[ref2.id]){
									if(ref1.id!=self.refArray[ref2.id][ll].id){
										nJson.push(self.refArray[ref2.id][ll]);
									}
								}
								self.refArray[ref2.id]=nJson;
							}
							break;
						}
					}
				}
				
			}

		},
		// Uses the manifest array and linkArray to generate
		// the final JSON session data
		getPluginData:function(passManifest){
			var self=this;
			// create manifest arrays out of the objects
			// stored in self.manifest
			for(var x in self.linkArray){
				
				// check to see if objects in this array are 
				// page-level or global-level
				if(/http\:|\.[jpgt]*/.test(x)){
					// store inside url
					for(var p in passManifest.pages){
						if(passManifest.pages[p].url==x){
							// found page, now insert data
							for(var ll in self.linkArray[x]){
								if(!(passManifest.pages[p][ll])){
									passManifest.pages[p][ll]=self.linkArray[x][ll];
									continue;
								}
								// already in passManifest, add new data
								for(var i in self.linkArray[x][ll]){
									passManifest[x][ll].push(self.linkArray[x][ll][i]);
								}
							}
							
						}
					}
					
				} else {
					if(!(passManifest[x])){
						
						passManifest[x]=self.linkArray[x];
						continue;
					}
					// already exists in session; add to data
					for(var ll in self.linkArray[x]){
						passManifest[x].push(self.linkArray[x][ll]);
					}
				}
			}
			
			// create a manifest array out of each link
			for(var x in self.linkArray){
				// if URI, save to pages, 
				// if not, save to global array space
				if(/http\:|\.png|\.j|\.g|\.t/i.test(x)){
					// saving to page-level
					for(var p in passManifest.pages){
						if(passManifest.pages[p].url==x){
							// add items from this link to the manifest
							for(var ll in self.linkArray[x]){
								if(passManifest.pages[p][ll]){
									passManifest.pages[p][ll]=self.linkArray[x][ll];
									continue;
								}
								// add new references to the main session array
								for(var item in self.linkArray[x][ll]){
									if(($.inArray(self.linkArray[x][ll][item],passManifest.pages[p][ll]))<0){
										passManifest.pages[p][ll].push(self.linkArray[x][ll][item]);
									}
								}
							}
						}
					}
				} else {
					if(!(passManifest[x])){
						// array doesn't exist yet in main session
						// create new array 
						passManifest[x]=[];
						// copy elements
						for(var ll in self.linkArray[x]){
							passManifest[x].push(self.linkArray[x][ll]);
						}
						// move on to the next item in linkArray
						continue;
					}
					// item already exists; check for existing data
					// and append new items
					for(var ll in self.linkArray[x]){
						if(($.inArray(self.linkArray[x][ll]))<0){
							
						}
					}
				}
			}
			
			// for(i in self.toolSet){
			// 				if(self.toolSet[i].bundleData){
			// 					passManifest=self.toolSet[i].bundleData(passManifest);
			// 				}
			// 			}
			return passManifest;
		}
	};
	
	//TileToolBar
	// Used to handle Tool selection menu, Loading JSON session data, Saving JSON session Data
	TileToolBar=function(args){
		// Constructor
		// Use: {
		// 	loc: {String} id for parent DOM
		// }
			//getting HTML that is already loaded - no need to attach anything
			var self=this;
			self.loc=args.loc;
			// HTML that's inserted into ID location
			var html='<div class="menuitem"><ul><li><a id="save_tags" href="" class="button" title="Save the current session">Save</a></li></ul></div>'+
			'<div id="ddown"><div class="menuitem ddown"><p>Tools:</p><select class="menu_body"></select></div>';
			$("#"+self.loc).append(html);
			
			self.LoadB=$("#"+self.loc+" > .menuitem > ul > li > #load_tags");
			self.SaveB=$("#"+self.loc+" > .menuitem > ul > li > #save_tags");
			self.ExpB=$("#"+self.loc+" > .menuitem > ul > li > #exp_xml");
			self.ToolSelect=$("#"+self.loc+" > #ddown > .menuitem.ddown > select");
			self.ToolSelect.change(function(e){
				var choice=self.ToolSelect.children("option:selected");
				$(this).trigger("toolSelected",[choice.text().toLowerCase()]);
			});
			//set up loading and saving windows
			self.LoadB.click(function(e){
				e.preventDefault();
				// hide the metadata box
				$(".ui-dialog").hide();
				$(this).trigger("openLoadTags");
			});
			self.SaveB.click(function(e){
				e.preventDefault();
				// hide the metadata box
				$(".ui-dialog").hide();
				$(this).trigger("saveAllSettings");
			});
			//button that activates the export Dialog
			self.ExpB.click(function(e){
				e.preventDefault();
				// hide the metadata box
				$(".ui-dialog").hide();
				$("body:first").trigger("exportDataToXML");
			});
			
			$("body").bind("switchBarMode",{obj:self},self.setChoice);
		};
		
	TileToolBar.prototype={
		// Load in ToolSelect menu
		// data : JSON object of tools and their objects
		setChoices:function(data){
			var self=this;
			self.ToolSelect.children("option").remove();
			for(d in data){
				if(data[d].name){
					var el=$("<option>"+data[d].name+"</option>");
					self.ToolSelect.append(el);
				}
			}
		},
		// When a tool is selected, call this function to make sure
		// that the toolname is actually selected in the <select> element
		// name : {String} toolname
		setChoice:function(e,name){
			var self=e.data.obj;
			self.ToolSelect.children("option").each(function(i,o){
				if(name==$(o).text().toLowerCase().replace(" ","")){
					$(o)[0].selected=true;
				} else {
					$(o)[0].selected=false;
				}
			});
		},
		// passed object with elements for button
		// id: button ID
		// 
		addButton:function(button){
			var self=this;
			// if button already exists, don't attach
			if($("#"+button.id).length) return;
			// if has a display, set to class button,
			// no display, btnIconLarge
			var stil=(button.display)?"button":"btnIconLarge";
			var disp=(button.display)?button.display:button.helptext;
			var html='<div class="menuitem"><ul><li><a id="'+button.id+'" href="" class="'+stil+'" title="'+button.helptext+'">'+disp+'</a></li></ul></div>';
		
			// attach button to HTML
			$("#"+self.loc).append(html);
			
			
			// attach button callback
			var callbacks=["click","mousedown","mouseover","mouseout"];
			for(var b in button){
				// check and see if user added an acceptable callback
				if($.inArray(b,callbacks)>=0){
					// attach callback
					if(__v) console.log("eval "+button[b]);
					$("#"+button.id).live(b,button[b]);
				}
			}
			
			
		}
	};
	
	
})(jQuery);