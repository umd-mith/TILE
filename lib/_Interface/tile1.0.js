///TILE 1.0
// Authors: Doug Reside (dreside), 
// 			Grant Dickie (grantd) 

// Base Code for all of the main TILE interface objects
// this must be included after Monomyth.js, necessary jQuery files, and related CSS files

// Image
// SideToolBar
// Dialog
// ImportDialog
// ExportDialog
// LoadTags
// NewImageDialog
// FloatingDiv
//TILE_ENGINE: {Object} main engine for running the LogBar and Layout of TILE interface
// TileToolBar

//Global Constants that other plugins can use 
var URL_LIST=[];

(function($){
	var TILE=this;
	
	/**
	Floating Dialog Box
	author: Tim Bowman
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
		
		_rgb2hex: function(rgb) {
			
			// from http://stackoverflow.com/questions/638948/background-color-hex-to-javascript-variable-jquery
			rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
				function hex(x) {
					return ("0" + parseInt(x,10).toString(16)).slice(-2);
				}
			return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
		},
			
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
				'&nbsp; <span style="font-size: 0.7em;" class="addRemove">(Add/Delete Labels)</span><br />' +
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
			for(var l in labels){
				this._labels[labels[l].name]=labels[l];
			}
			
			this.addAutoComplete('li#formField1 input.tagComplete', self._labels);	
			// INSERTING BUTTON BEHAVIORS //
			// FLOATING DIV DIALOG //
			// on form submit in floating div
			$('input#submitFloatingDiv').live('click', function(e) {
				 e.preventDefault();

 				 // var objID = (textsel._getIndexOfId($('input#TILEid').val()));
				 // _sel.color = $('input#TILEcolor').val();	// add new color to selection object
				 // _sel = floatingDiv.addLabelsToObject(_sel); // add labels to selection object
				 self.sendLabels();
				 
				 // $('.ui-dialog').hide(); // close dialog on submit button press
				
		 		 return false;
			});
			
			
			
			// button click for adding more label fields
			$('img#btnAddLabel').live('click', function() {
				var num, newNum, newElem, eStuff;
				// get number of fields
				num	= $('li.cloneMe').length;
				newNum	= new Number(num + 1);

				// create the new element via clone(), and manipulate it's ID using newNum value
				newElem = $('#formField'+num).clone().attr('id', 'formField' + newNum);
				if(__v) console.log("#formField"+num+":  "+$("#formField"+num).length);
				// manipulate the name/id values of the input inside the new element
				newElem.find('input:first').attr('id', 'formLabel'+newNum).attr('name', 'Label'+newNum);
				newElem.find('img').remove();
				newElem.find('.addRemove').remove();

				// insert the new element after the last "duplicatable" input field
				$('li#formField'+num).after(newElem);

				// make things invisible and visible	
				$('#btnDeleteLabel').css('visibility','visible');
				$('.addRemove').css('visibility','hidden');

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
					$('.addRemove').css('visibility','visible');		
				}
			});
			
			// set up listener for deleting items in attachDataList
			$(".button.shape.delete.formLink").live("click",function(e){
				var id=$(this).parent().attr('id');
				self.deleteLinkHandle(id);
			});
			
			
		},
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
				width: 350,
				closeOnEscape: true,
				close: function(event, ui) { 
					// $(elem).dialog('destroy');
					// $(elem).empty().remove();
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
			// self.addColorSelector(myID,self.defaultColor);
		},	
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
					self.addColorToForm(hex);
				}
			});	
		},
		
		addColorToForm:function(hexcolor){
			var self=this;
			// add the new selected color to hidden form field
			// $('input#TILEcolor').val('#'+hexcolor);
			// output the color in Event call - universal and picked up by 
			// any listening objects
			$("body:first").trigger("colorChanged",[hexcolor,self._curLink]);
			return true;
		},
		
		addIDToForm:function(o){
			// From now on, highlight in Color
			$('input#TILEid').val(o.id);
			return true;
		},
		// o : {Object} - has tool id, object id, object type
		setInputObject:function(o){
			var self=this;
			if(!o) return;
			if(__v) console.log("input object for floating div set: "+o.id);
			self._curLink=o;
			// reset the attachDataList
			self._attachDataList.empty();
			
		},
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
					
					self._labels[lbls[x]]={id:id,name:lbls[x],type:'labels',tool:"LB1000"};
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
				
				html+="<div id=\""+self._labels[lbls[x]].id+"\" class=\"labelItem\">"+lbls[x]+"<span id=\"del_"+id+"\" class=\"button shape delete formLink\">X</span></div>";
				
				
				var sendref=$.extend(true,{},self._labels[lbls[x]]);
				sendref.display=lbls[x];
				refs.push(sendref);
				
				
			}
			// attach references to the attachList
			self._attachDataList.append(html);
			// call custom event
			$("body:first").trigger("floatDivOutput",[{link:self._curLink,refs:refs}]);
			
		},
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
			if(lb==null) return;
			$.extend(lb,{parentTool:self._curLink.tool,parentObj:self._curLink.id,parentType:self._curLink.type});
			$("body:first").trigger("deleteMetaLink",[lb]);
		},
		addLabelsToObject:function(o) {
			var self = this;
			// loop through form field vals and assign to _labels obj
			
			$('li.cloneMe').each(function(i) {
				var n = i+1;
				self._labels[i] = $('input#formLabel'+n).val();
			});
			
			o.labels = self._labels;
			
			return o;	
		}
		
	});
	
	TILE.FloatingDiv = FloatingDiv;
	
	
	/**
	 * Basic Image Object
	 * 
	 * Contains URL for where the image is (or an array of urls)
	 * Contains zoomMin and zoomMax, zoomLevel - may be used for 
	configuring zooming
	 */
	var TILEImage=Monomyth.Class.extend({
		// Constructor
		init:function(args){
			//create UID
			var d=new Date();
			this.uid="image_"+d.getTime("hours");
			
			//url is actually an array of image values
			this.url=(typeof args.url=="object")?args.url:[args.url];

			if(args.loc){
				this.loc=args.loc;
				//set to specified width and height
				if(args.width) this.DOM.width(args.width);
				if(args.height) this.DOM.height(args.height);
			}
			this.zoomMin=(args.minZoom)?args.minZoom:1;
			this.zoomMax=(args.maxZoom)?args.maxZoom:5;
			this.zoomLevel=this.zoomMin;
		},
		//return a copy of the zoomLevel
		getZoomLevel:function(){var z=this.zoomLevel;return z;},
		//show the DOM elements contained by this object
		activate:function(){
			this.DOM.show();
		},
		//hide the DOM elements contained by this object
		deactivate:function(){
			this.DOM.hide();
		}
	});
	
	TILE.TILEImage=TILEImage;
	
	/**
	SideToolbar

		For handling secondary functions
		attaches DOM to DOM tree

		loc: ID for the element to attach to
	**/

	var SideToolBar=Monomyth.Class.extend({
		init:function(args){
			this.DOM=$("#"+args.loc);
			//attach PHP-fed HTML into location
			// this.DOM.append($.ajax({
			// 							async:false,
			// 							url:'lib/ToolBar/SideToolBar.php',
			// 							type:'GET'
			// 						}).responseText);

			/**
			this.DOM=$("<div class=\"SideToolBar\"></div>");
			this.DOM.attr("id",function(e){
				return "sidebar"+$(".sidetoolbar").length;
			});
			this.DOM.appendTo(args.loc);
			this.loc=args.loc;**/

		},
		activate:function(){
			this.DOM.show();
		},
		deactive:function(){
			this.DOM.hide();
		}
	});
	
	TILE.SideToolBar=SideToolBar;
	
	
	// Dialog Script
	// 
	// Creating several objects to display dialog boxes
	// 
	// Developed for TILE project, 2010
	// Grant Dickie

	

	var Dialog=Monomyth.Class.extend({
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		init:function(args){
			if((!args.loc)||(!args.html)) throw "Not enough arguments passed to Dialog";
			this.loc=args.loc;
			//set up JSON html
			this.html=args.html;
			$(this.html).appendTo(this.loc);
		}
	});
	
	TILE.Dialog=Dialog;
	
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
	//ImportDialog
	/**
	Called by openImport CustomEvent
	**/
	// Handles receiving JSON data input by the user
	// sends data to TILE_ENGINE to be loaded as JSON
	var ImportDialog=Dialog.extend({
		// Constructor
		// args same as Dialog()
		init:function(args){
			
			this.$super(args);
			var self=this;
			this.index=($("#dialog").length+this.loc.width());

			this.autoChoices=args.choices;
			this.autoFill=args.auto;
			//lightbox content
			this.light=$("#light");
			this.fade=$("#fade");
			this.DOM=$("#dialogImport");
			this.closeB=$("#importDataClose");
			this.closeB.click(function(e){
				$(this).trigger("closeImpD");
			});
			// handle Form input for JSON data from user
			this.multiFileInput=$("#importDataFormInputMulti");
			this.multiFileInput.val(this.autoFill);
			this.multiFileFormSubmit=$("#importDataFormSubmitMulti");
			this.multiFileFormSubmit.bind("click",{obj:this},this.handleMultiForm);
			// attach helpboxes
			this.hb1=new HelpBox({"iconId":"ImportDialogHelp1","text":"Enter a path to your data. The default is a sample data set using an XML file. Model your path on the sample, or enter the direct path to a JS or JSON file. See TILE's Help section for more information."});			
			// this.hb2=new HelpBox({"iconId":"ImportDialogHelp2","text":"Clicking this button..."});
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("closeImpD",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("openExport",{obj:this},this.close);
			$("body").bind("openImport",{obj:this},this.display);
			
			// TEMPORARY SELECTION TOOL
			$("#hamLoad").click(function(e){
				$("#importDataFormInputMulti").val(self.autoChoices['hamLoad']);
			});
			$("#pemLoad").click(function(e){
				$("#importDataFormInputMulti").val(self.autoChoices['pemLoad']);
			});
			$("#swineburne").click(function(e){
				$("#importDataFormInputMulti").val(self.autoChoices['swineburne']);
			});
			
		},
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
					
					// obj.DOM.trigger("schemaLoaded",[{schema:schema}]);
					// 					obj.DOM.trigger("multiFileListImported",[file]);
				} else {
					//show warning: not a valid URI
				}
			}
		}
	});

	TILE.ImportDialog=ImportDialog;

	// Load Tags Dialog
	// For loading JSON session data back into the TILE interface

	var LoadTags=Dialog.extend({
		// Constructor: (Same as Dialog)  {loc: {String} id for where to put DOM, html: {String} JSON string representing html for this Dialog}
		init:function(args){
			this.$super(args);
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
		},
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
	});

	TILE.LoadTags=LoadTags;

	// ExportDialog
	// For exporting JSON session data and transforming into an 
	// XML file/another form of output
	var ExportDialog=Dialog.extend({
		// Constructor: {loc: {String} id for the location of parent DOM, html: {String} html string for attached HTML}
		init:function(args){
			this.$super(args);
			var self=this;
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
			
			this.json=null;
			
			$("body").bind("openExport",{obj:this},this.display);
			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openNewImage",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("closeExport",{obj:this},this.close);
		},
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
			//attach a script element to the page with src
			// set to the file specified by the user
			var sel=$("<script type=\"text/javascript\" src=\""+srcscript+"\"></script>");
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
			//get src script from user
			// var srcscript=self.fileI.val();
			//attach a script element to the page with src
			// set to the file specified by the user
			var sel=$("<script type=\"text/javascript\" src=\"importWidgets/exportJSONXML.js\"></script>");
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
		}
	});

	// New Image Dialog Box
	// for putting a new image into the URL and manifest lists
	// NOTE: may be deprecated in future TILE code
	var NewImageDialog=Dialog.extend({
		// Constructor: Same as Dialog
		init:function(args){
			this.$super(args);

			// this.loc.append($.ajax({
			// 				async:false,
			// 				url:'lib/Dialog/dialogNewImg.html',
			// 				dataType:'html'
			// 			}).responseText);
			this.DOM=$("#dialogNewImg");

			this.closeB=$("#newImgClose");
			this.closeB.click(function(e){
				$(this).trigger("closeNewImage");
			});
			this.uriInput=$("#newImgURIInput");

			this.submitB=$("#newImgSubmit");
			this.submitB.bind("click",{obj:this},this.handleImageForm);

			$("body").bind("openImport",{obj:this},this.close);
			$("body").bind("openLoadTags",{obj:this},this.close);
			$("body").bind("openNewImage",{obj:this},this.display);
			$("body").bind("closeNewImage",{obj:this},this.close);
		},
		display:function(e){
			var obj=e.data.obj;
			obj.DOM.show();
			obj.DOM.css({"z-index":"1001"});
		},
		close:function(e){
			var obj=e.data.obj;
			obj.DOM.hide();
		},
		handleImageForm:function(e){

			var obj=e.data.obj;
			if(obj.uriInput.val().length>0){
				obj.DOM.trigger("newImageAdded",[obj.uriInput.val()]);
				obj.uriInput.attr("value","");
				obj.DOM.trigger("closeNewImage");
			}
		}
	});
	TILE.NewImageDialog=NewImageDialog;

	/**Main Engine **/
	//loads in html layout from columns.json, parses JSON and sends to all 
	// other objects 
	// 
	//
	// Functions
	// 	getBase - checks TILECONSTANTS.json for base http data
	// 	setUp - makes Transcript, ActiveBox, sets global binds
	// 	addNewTool - sets a new tool - users must define tool in .js code and proper JSON format
	// saveSettings - starts prompt to save all data in session
		
	var TILE_ENGINE=Monomyth.Class.extend({
		init:function(args){
			//get HTML from PHP script and attach to passed container
			this.loc=(args.attach)?args.attach:$("body");
			var self=this;
			self.toolSet=(args.toolSet)?args.toolSet:[];
			self.json=null;
			self.manifest=null;
			self.curUrl=null;
			// self.defaultTool=(args.defaultTool)?args.defaultTool:"imagetagger";
			// set up plugin controller and listeners for plugin controller
			self.pluginControl=new PluginController({toolSet:self.toolSet,defaultTool:args.defaultTool});
			
			// listens for when plugin controller finishes loading JSON data 
			// from plugins
			// TODO: get rid of this?
			$("body").bind("toolSetUpDone",{obj:self},function(e){
				var self=e.data.obj;
				$.ajax({
					url:"lib/JSONHTML/dialogs.json",
					dataType:"json",
					success:function(x){
						self.dialogJSON=x;
						self.addDialogBoxes();
						self.setUp();
					}
				});
			});
			//check if there is json data 
			self.checkJSON();
		},
		// Called to see if there is a JSON object stored in the PHP session() 
		checkJSON:function(){
			var self=this;
			var file=$.ajax({
				url:'PHP/isJSON.php',
				dataType:"text",
				async:false
			}).responseText;
			if(file){
				self.json=JSON.parse(file);
			}
			self.getBase();
		},
		//Calls TILECONSTANTS.json file and gets base, possible json data
		getBase:function(){
			//check JSON file to configure main path
			var self=this;
			$.ajax({url:'tilevars.php',dataType:'json',success:function(d){
				//d refers to the JSON data
				// self._importDefault=(__v)?"http://localhost:8888/TILE/trunk/html/swinburneJSON.json":d.hamLoad;
				if(__v) console.log('returned from tilevars.php: '+d);
				self._importDefault=d.pemLoad;
				self._exportDefault=d.exportDefault;
				self._importChoices=d;
				$.ajax({
					dataType:"json",
					url:"./lib/JSONHTML/columns.json",
					success:function(d){
						//d represents JSON data

						self.DOM=$("body");
						self.schemaFile=null;
						self.preLoadData=null;
						self.mainJSON=d;
						self.toolJSON={};
						
						// go through and parse together all tool json data
						self.pluginControl.setUpToolData();
						
					}
				});
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
			
			//store JSON html data - has everything for layout
			if(!self.mainJSON) return;
			
			//create log - goes towards left area
			// this._log=new Transcript({loc:"logbar_list",text:null});
			// this._activeBox=new ActiveBox({loc:"az_activeBox"});
			this._transcriptBar=new TileToolBar({loc:"transcript_toolbar"});
		
			//important variables
			//finishes the rest of init
			this.toolbarArea=$("#header");

			//global bind for when the ImportDialog sends the user-input file
			$("body").bind("schemaFileImported",{obj:this},this.getSchema);
			
			//global bind for when data is ready to be passed as JSON to user
			// $("body").bind("JSONreadyToSave",{obj:this},this._saveToUser);
			//global bind for when user clicks on transcript object
			// $("body").bind("TranscriptLineSelected",{obj:this},this._transcriptSelectHandle);
			//for when user clicks on save
			$("body").bind("saveAllSettings",{obj:this},this._saveSettingsHandle);
			
			//global bind for when a new page is loaded
			$("body").bind("newPageLoaded",{obj:this},this._newPageHandle);
			// global bind for when user wants to export the JSON session as XML
			$("body").bind("exportDataToXML",{obj:this},this._exportToXMLHandle);
			//global bind for when user selects a new tool from LogBar
			$("body").bind("toolSelected",{obj:self},function(e,name){
				// close down the default tool, open up new tool
				self.pluginControl.switchTool(name,self.manifest);
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
		},
		/**Get Schema**/
		//taken from setMultiFileImport Custom Event call from ImportDialog
		// users supply a filename in ImportDialog that is then used here 
		// as @file
		// e : {Event}
		// file : {String}
		getSchema:function(e,file){
			var obj=e.data.obj;
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
			obj.json=(typeof d=='object')?d:eval("("+d+")");
			obj._parseOutJSON();
			$("body:first").trigger("closeImpD");
			// } else {
			// 			
			// 				//make ajax call to @file parameter
			// 				$.ajax({
			// 					url:obj.imageFile,
			// 					async:false,
			// 					dataType:'json',
			// 					success:function(d,s){
			// 						if(__v) console.log("status: "+s);
			// 						//d refers to JSON object retrieved from imageFile
			// 						if(!obj.json) {
			// 							obj.json=eval('('+d+')');
			// 							
			// 							obj._parseOutJSON();
			// 						}
			// 						$("body:first").trigger("closeImpD");
			// 					},
			// 					error:function(d,x,e){
			// 					 if(__v) console.log("Failed to perform any AJAX  "+e);
			// 					}
			// 				});
			// 			}
		},
		// Performs the task of parsing out the JSON structure passed
		// either in SESSION or through importDialog
		// Converts the JSON into the .manifest array for other objects
		// to use
		_parseOutJSON:function(){
			var self=this;
			if(!self.json) return;
			
			self.manifest={};
		
			var dt=new Date();
			var tlines=[];
			//format for duplicates
			//organize manifest by url
			for(key in self.json.pages){
				if(!self.manifest[self.json.pages[key].url]){
					self.manifest[self.json.pages[key].url]=$.extend(true,{},self.json.pages[key]);
				} else {
					//duplicate url - 
					
					$.each(self.manifest[self.json.pages[key].url].info,function(i,o){
						if(i in self.json.pages[key].info){
							if($.isArray(o)&&($.inArray(self.json.pages[key].info[i],o)<0)){
								o.push(self.json.pages[key].info[i]);
							} else {
								//make this item into an array
								var pre=o;
								o=[pre];
								o.push(self.json.pages[key].info[i]);
							}
						}
					});
					for(lin in self.json.pages[key].lines){
						self.manifest[self.json.pages[key].url].lines.push(self.json.pages[key].lines[lin]);
					}
					
					// console.log("loading schema: "+key+": "+obj.json.pages[key].lines.length);
					// $.merge(self.manifest[self.json.pages[key].url].lines,self.json.pages[key].lines);
					// console.log("after merge: "+key+": "+obj.json.pages[key].lines.length);
				}
			}
			for(key in self.json){
				if(/sourceFile/.test(key)) continue;
				self.manifest[key]=self.json[key];
			}
			//send to toolbar
			self._transcriptBar.setChoices(self.toolSet);
			
			self.pluginControl.initTools(self.manifest);
			
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
			//new Image Dialog
			this.nImgD=new NewImageDialog({loc:"body",html:this.dialogJSON.dialogaddimage});
			
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
			self.manifest=self.pluginControl.getPluginData(self.manifest);
			// for(t in self.toolSet){
			// 				self.manifest=self.toolSet[t].bundleData(self.manifest);
			// 			}
			// self.manifest[self.curUrl].lines=self._log.exportLines();
			// self.manifest=self.curTool.bundleData(self.manifest);
			
			if(!self.save) self.save=new Save({loc:"azglobalmenu"});
			var exfest=[];
			var curl=null;

		
		
			//merge manifest data with json data
			for(var m in self.manifest){
				// initialize all variables that don't exist in the json
				if(!self.json[m]) self.json[m]=[];
				if(m=='pages'){
					for(var p in self.manifest[m]){
						// page p
						var temp=$.extend(true,{},self.manifest[m][p]);
						if(!self.json[m][p]) self.json[m][p]=[];
						self.json['pages'][p]=temp;
					}
				} else if(!(/http/.test(m))){
					if(__v) {
						console.log("M EQUALS: ");
						console.log(m);
						console.log(JSON.stringify(self.manifest[m]));
						console.log("----------");
					}
					var temp=$.extend(true,{},self.manifest[m]);
					if(__v){
						console.log("temp: ");
						console.log(JSON.stringify(temp));
					}
					self.json[m]=temp;
					
				}
			}
			if(__v) console.log("FINAL JSON SENT TO userPrompt: "+JSON.stringify(self.json));
			self.save.userPrompt(self.json);
		},
		// Handles the exportDataToXML Event call
		// e : {Event}
		_exportToXMLHandle:function(e){
			var self=e.data.obj;
			// get all relevant session data 
			// and output to exportDialog
			// for(t in self.toolSet){
			// 			self.manifest=self.toolSet[t].bundleData(self.manifest);
			// 		}
			// self.manifest[self.curUrl].lines=self._log.exportLines();
			
			self.manifest=self.pluginControl.getPluginData(self.manifest);
			var exfest=[];
			var curl=null;
		
			//merge manifest data with json data
			for(var m in self.manifest){
				// initialize all variables that don't exist in the json
				if(!self.json[m]) self.json[m]=[];
				if(m=='pages'){
					for(var p in self.manifest[m]){
						// page p
						var temp=$.extend(true,{},self.manifest[m][p]);
						if(!self.json[m][p]) self.json[m][p]=[];
						self.json[m][p]=temp;
					}
				} else {
					var temp=$.extend(true,{},self.manifest[m]);
					self.json[m]=temp;
					
				}
			}
			// send the JSON object to exportDialog
			$("body:first").trigger("openExport",self.json);
		}
	});
	
	TILE.TILE_ENGINE=TILE_ENGINE;


	// Internal Object that controls plugins
	// a.k.a. "DaddyInTheSky"
	
	PluginController=function(args){
		var self=this;
		if(!args) return;
		self.toolSet=[];
		for(i in args.toolSet){
			self.toolSet[args.toolSet[i].id]=args.toolSet[i];
		}
		self.manifest={};
		self.toolJSON=[];
		self.startTool=args.toolSet[0].id;
		self.defaultTool=args.defaultTool;
		for(x in self.toolSet){
			self.manifest[self.toolSet[x].id]=[];
		}
		self.activeTool=null;
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
			
		
			// wait for when current tool calls final close function
			// close function doesn't pass data
			$("body").bind(self.curTool._close,{obj:self},function(toolData){
				$("body").unbind(self.curTool._close);
				$("body:first").trigger("switchBarMode",[self.defaultTool.name]);
				self.curTool=null;
				var n=$("#srcImageForCanvas").attr("src").indexOf('=');
				var url=$("#srcImageForCanvas").attr("src").substring((n+1));
				
				
				
				// if(__v) console.log("setting up the start tool in PC: "+url+" "+JSON.stringify(json));
				var m=(json)?json[url]:toolData;
				if(__v){
					console.log("_close in tile1.0 receives:");
					console.log(JSON.stringify(toolData));
				}
				self.toolSet[self.startTool].restart(toolData);
			});
			var m=(json)?json[$("#srcImageForCanvas").attr("src")]:null;
			// console.log('restarting '+obj.curTool.name);
			self.curTool.restart(m);
		},
		initTools:function(json){
			var self=this;
			// Set up the imagetagger here, after setting up all of the dialog boxes that can load
			// JSON data for the imagetagger and any other tools
			if(self.toolSet){
				var toolIds=[];
				for(s in self.toolSet){
					toolIds.push(s);
				}
				
				var boxData=[];
				// set up all tools/plugins to load their dependencies
				function recTool(t){
					if(t>=toolIds.length) {
						// Go back to imagetagger by default?
						// May be changed to user's preferences
						// self.curTool=self.toolSet[0];
						$("body").unbind(self.toolSet[toolIds[(t-1)]]._close);
						self.toolSet[toolIds[(t-1)]].close();
						self.curTool=null;
						
						var m=(json)?json[$("#srcImageForCanvas").attr("src")]:null;
					
						self.toolSet[self.startTool].restart(m);
						// set up the floating box
						self.floatDiv=new FloatingDiv();
						self.floatDiv.init('tilefloat',boxData); 
						self.floatDiv.createDialog('tilefloat');
						$("#tilefloat_floatingDiv").parent().hide();
						// $("body").bind("floatDivAppear",{obj:self},self._attachFloatDiv);
						$("body").bind("floatDivOutput",{obj:self},self._floatDivOutputHandle);
						return;
					}
					var ct=self.toolSet[toolIds[t]];
					$("body").bind(ct._close,function(e){
						$("body").unbind(ct._close);
						if(t>=toolIds.length) return;
						t++;
						recTool(t);
					});
				
					ct.start(null,(json)?json:null,(self.toolJSON[ct.name])?self.toolJSON[ct.name]:null);
					if(ct.activeCall){
						$("body").bind(ct.activeCall,{obj:self},self._setActiveTool);
					}
					if(ct.outputCall){
						$("body").bind(ct.outputCall,{obj:self},self._toolOutputHandle);
					}
					if(ct.deleteCall){
						$("body").bind(ct.deleteCall,{obj:self},self._deleteLinkHandle);
					}
					
					if(ct.boxData) $.merge(boxData,ct.boxData);
					// self.activeTool=ct;
					ct.close();
					
				}
			}
			recTool(0);
		},
		_setActiveTool:function(e,id){
			var self=e.data.obj;
			$(".ui-dialog").hide();
			
			// if(self.activeTool&&(self.activeTool.id==id)) return;
			for(i in self.toolSet){
				if((self.toolSet[i].id)&&(self.toolSet[i].id==id)){
					self.activeTool=self.toolSet[i];
				} else {
					if(self.toolSet[i].unActive) self.toolSet[i].unActive();
				}
			}
			if(!self.activeTool) return;
		},
		// Called after a tool has fired it's 'done' Custom Event
		// e : {Event}
		// data : {Object} (optional arguments to pass after completing tool .close() method)
		_toolOutputHandle:function(e,data){
			var self=e.data.obj;
			// make sure tool is active and not referencing itself
			if(((!self.activeTool)||(self.activeTool.id==data.tool))&&(!data.parentTool)){
				// self.activeTool=self.defaultTool;
				// attach the floatingDiv if attachHandle is included
				
				if(data.attachHandle) self._attachFloatDiv(data.attachHandle,data);
				// see if object exists and needs updating
				// for(var t in self.manifest){
				// 				if($.inArray(data.id,self.manifest[t])>=0){
				// 					self.toolSet[t].inputData(data);
				// 				}
				// 			}
				
				return;
			};
			
			
			
			// if(!self.activeTool.inputData) return;
			
			if(self.activeTool.inputData){
				
				// store data of link into manifest
				
				if(!self.manifest[self.activeTool.id]) self.manifest[self.activeTool.id]=[];
				if($.inArray(data.id,self.manifest[self.activeTool.id])>0) self.manifest[self.activeTool.id].push(data.id);
				
				// get the link from this activeTool and return to output tool
				var link=self.activeTool.getLink();
				var n=self.activeTool.inputData({ref:data,obj:link});
				if((!n)||(n==false)) {
					// current tool can not attach the link to itself - cancel the link process
					// if passed object has handle, attach floatingDiv
					if(data.attachHandle){
						self._attachFloatDiv(data.attachHandle,data);
						
					}
					return false;
				}
				if(link&&(self.toolSet[data.tool].inputData)) self.toolSet[data.tool].inputData({ref:link,obj:data});
				if(data.attachHandle){
					self._attachFloatDiv(data.attachHandle,data);
				}
				return true;
			}  else {
				if(data.attachHandle){
					self._attachFloatDiv(data.attachHandle,data);
				}
				return true;
				
			}
			return false;
		},
		// Attaches the FloatingDiv object to given #id
		_attachFloatDiv:function(id,link){
			var self=this;
		
			// id represents element to attach to
			if(id==null) return;
			var pos=$(id).offset();
			if(!pos) return;
			$("#tilefloat_floatingDiv").parent().css("left",(pos.left+$(id).width()+10)+'px');
			$("#tilefloat_floatingDiv").parent().css("top",pos.top+'px');
			$("#tilefloat_floatingDiv").parent().show();
			// self.floatDiv.addIDToForm(id);
			self.floatDiv.setInputObject(link);
		},
		// Takes output from FloatingDiv and parses it out.
		// Attaches refs to appropriate tool
		_floatDivOutputHandle:function(e,o){
			var self=e.data.obj;
			if(!o) return;
			for(var i in o.refs){
				if(!o.refs[i]) continue;
				if(self.toolSet[o.refs[i].tool]&&self.toolSet[o.refs[i].tool].inputData){
					if(__v) console.log("attaching "+o.link.id+" "+o.link.type+" to: "+o.refs[i].tool+"  "+o.refs[i].type);
					self.toolSet[o.refs[i].tool].inputData({ref:o.link,obj:o.refs[i]});
					// also attach to linked item
					self.toolSet[o.link.tool].inputData({ref:o.refs[i],obj:o.link});
					if($.inArray(o.link.id,self.manifest[o.refs[i].tool])>0) self.manifest[o.refs[i].tool].push(o.link.id);
					// if($.inArray(o.refs[i].id,self.manifest[o.link.tool])>0) self.manifest[o.refs[i].tool].push(o.link.id);
				}
			}
			
			
		},
		// ref : {Object} - id: {String}, type: {String}, tool: {String} ID, parentTool: {String} ID,
		// 			parentObj: {String}, parentType: {String}
		_deleteLinkHandle:function(e,ref){
			var self=e.data.obj;
			if(__v) console.log("deleteLinkHandle ref: "+ref.type);
			// hide the floatingDiv - currently deleted item is now active
			$("#tilefloat_floatingDiv").parent().hide();
			if(ref.parentTool=='none'){
				// delete the object being sent
				self.toolSet[ref.tool].deleteSelf(ref);
				
				// delete all references as well
				for(var n in self.manifest){
					
					var x=$.inArray(ref.id,self.manifest[n]);
					if(x>=0){
						if(__v) console.log("deleting "+ref.id+" from tool "+n);
						var ac=self.manifest[n].slice(0,x);
						var bc=self.manifest[n].slice((x+1));
						self.manifest[n]=ac.concat(bc);
						self.toolSet[n].removeData(ref);
					}
				}
				return;
			}
			if(__v) console.log(ref.parentTool+" removing "+ref.id);
			// erase from parent object that created the link
			self.toolSet[ref.parentTool].removeData({id:ref.id,type:ref.type},ref.parentObj);
			// erase from the object being linked
			self.toolSet[ref.tool].removeData({id:ref.parentObj,type:ref.parentType},ref.id);
			var n=$.inArray(ref.id,self.manifest[ref.parentTool]);
			if(n>=0){
				if(__v) console.log("deleting "+ref.id+" from tool "+ref.parentTool);
				var ac=self.manifest[ref.parentTool].slice(0,n);
				var bc=self.manifest[ref.parentTool].slice((n+1));
				self.manifest[ref.parentTool]=ac.concat(bc);
			}
			
			
			
		},
		getPluginData:function(passManifest){
			var self=this;
			for(i in self.toolSet){
				if(self.toolSet[i].bundleData){
					passManifest=self.toolSet[i].bundleData(passManifest);
				}
			}
			return passManifest;
		}
	};
	
	//TileToolBar
	// Used to handle Tool selection menu, Loading JSON session data, Saving JSON session Data
	TileToolBar=Monomyth.Class.extend({
		// Constructor
		// Use: {
		// 	loc: {String} id for parent DOM
		// }
		init:function(args){
			//getting HTML that is already loaded - no need to attach anything
			var self=this;
			self.loc=args.loc;
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
				$(this).trigger("openLoadTags");
			});
			self.SaveB.click(function(e){
				e.preventDefault();
				$(this).trigger("saveAllSettings");
			});
			//button that activates the export Dialog
			self.ExpB.click(function(e){
				e.preventDefault();
				$("body:first").trigger("exportDataToXML");
			});
			
			$("body").bind("switchBarMode",{obj:self},self.setChoice);
		},
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
		}
	});
	
	
})(jQuery);