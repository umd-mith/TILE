///TILE 1.0
// Authors: Doug Reside (dreside), 
// Grant Dickie (grantd), 
// Tim Bowman,
// Jim Smith

// Copyright 2009-2011 MITH

/*
 For more information or to inquire about the TILE interface and what it can do
 for your project, see http://mith.umd.edu/tile or visit the forums at 
 http://mith.umd.edu/tile/forums
*/


// Base Code for all of the main TILE interface objects
// Objects:
// Floating Div
// Dialog
// ImportDialog
// ExportDialog
// TILE_ENGINE
// PluginController



// GLOBAL VARIABLES
// Keep track of Image scale

// Large, global variable that 
// stores data for other plugins 
var TILE=[];
TILE.experimental=false;
TILE.activeItems=[];
TILE.url='';
// ENGINE allows access to global API
TILE.engine={};
TILE.formats='';
TILE.preLoad=null;
TILE.scale=1;

(function($){
	var tile=this;

	// Private variables used within TILE_ENGINE
	// that can be accessed only in the TILE() 
	// local level
	var pluginControl=null; // instance of plugincontroller
	var json=null; // Global JSON session
	var _tileBar=null;
	// Error box
	var errorbox=null;
	
	
	// used to import data into TILE
	var importDialog=null;
	var curPage=null;

	// stores layouts of different modes
	var pluginModes=[];
	// array of all plugins
	var plugins=[];
	
	// Load Screen
	var showLoad=function(){
		
		$("#loadlight").show();
		$("#loadDialogSplash").show();
		$("#loadblack").show();
	};
	
	var removeLoad=function(){
		$("#loadblack").fadeTo(1200,0.1,function(){
			$("#loadblack").hide();
			$("#loadlight").hide();
			$("#loadDialogSplash").hide();
		});	
	};
	
	var mouseWait=function(){
		// change the document mouse style to wait
		document.body.style.cursor='wait';
	};
	
	var mouseNormal=function(){
		// change the mouse body style back
		setTimeout(function(){
			document.body.style.cursor='default';
			
		},800);
	};
	
	// private methods go here
	var deepcopy=function(oldObject){
		var tempClone = {};
		if((oldObject==null)||(oldObject=='undefined')) return tempClone;
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

        for (var arrIndex = 0; arrIndex <= oldArray.length; arrIndex++){
            if (typeof(oldArray[arrIndex]) == 'object'){
                tempClone.push(deepcopy(oldArray[arrIndex]));
			} else if((oldArray[arrIndex]!=null)&&(oldArray[arrIndex]!='undefined')){
                tempClone.push(oldArray[arrIndex]);
			}
		}
        return tempClone;

	};
	
	// Called to see if there is a JSON object stored in the PHP session() 
	// OR: in a GET request 
	var	checkJSON=function(){
		// set up load screen html, which 
		// will show up to protect more events
		// from firing when data is loading
		$('<div id="loadlight" class="white_content"><div id="loadDialogSplash" class="dialog"><div class="body"></div></div></div><div id="loadblack" class="black_overlay"></div>').appendTo($("body"));
		// have black overlay eat all mouse events
		$("#loadDark").live('mousedown click mouseup mouseout',function(e){
			e.stopPropagation();
			return;
		});
		
		// start load screen
		showLoad();
		
		var self=this;
		var file=null;
		// check to see if something is pre-loaded
		
		if(TILE.preLoad){
			if(typeof(TILE.preLoad) == 'object'){
				file=TILE.preLoad;
			} else {
				file=$.ajax({
					url:TILE.preLoad,
					dataType:'json',
					type:'GET',
					success:function(result){
						json=result;
						setUp();
						
					}
					
				});
				return;
			}
		} else {
			json=$.ajax({
				url:TILE.engine.serverStateUrl,
				accepts: "application/json",
				dataType:"text",
				async:false
			}).responseText;
			
			setUp();
			return;
		}
		
		if(file){
			json=file;
			setUp();
			return;
			// TILE.engine.parseJSON(file);
		} else if((window.location.href.search(/\?json\=/i))>=0){
				// grab the GET parameter only - 
				// user defines this by putting ?json= followed
				// by the URI of their JSON/XML/TXT file
				var n=window.location.href.search(/\?json\=/i);
				
				var str=window.location.href.slice((n+6));
				// send to the PHP dev library for importing files
				$.ajax({
					url:('plugins/CoreData/importExternalFiles.php?file='+str),
					dataType:'text',
					// set up status codes for false returns/500 etc.
					statusCode:{
						404: function(){
							// do nothing
						},
						415:function(){
							alert("File not supported currently by TILE. Loading default data.");
							
						},
						500:function(){
							alert("Error parsing data. Loading default data.");
							// do nothing
						}
					},
					success:function(txt){
						json=txt;
						setUp();
						// TILE.engine.parseJSON(txt);
						// remove the welcome dialog in case it's present
						if($("#light").length){
							$("#light").remove();
							$("#dark").remove();
						}
					}
				});
				
			} 
		
	};
	//called after getBase(); creating main TILE interface objects and
	//setting up the HTML
	// d : {Object} - contains columns.json data
	var setUp=function(){
		var self=this;
		// set initial formats
		TILE.formats=_tileBar.formatstr;
		// take away load screen
		removeLoad();
		
		if(json){	
			TILE.engine.parseJSON(json);
		
		}
		
	};
	
	/*
		Error Dialog Box
		Displays errors about experimental features. Experimental features and this dialog
		are unlocked by setting TILE.experimental to true
	
	*/
	var ErrorBox = function(){
		var self=this;
		
		var html='<div id="errorlightbox" class="white_content">'+
			'<div id="errormessagebox" class="dialog">'+
			'	<div class="header"><h2 class="">Error Report</h2><h2><a id="errorReportClose" class="btnIconLarge close" href="#"></a></h2></div>'+		
			'	<div class="body"><div class="option"><h3>To report this error, copy and paste the text in the red box and send it to jdickie@mail.umd.edu</h3>'+
			'<div id="error_message" class="rederrorbox"><p></p></div>'+
			'</div></div>'+
			'</div></div>'+
		'<div id="errorfadebox" class="black_overlay"></div>';
		
		$("body").append(html);
		
		$("#errorReportClose").click(function(){
			$("#errorlightbox").hide();
			$("#errorfadebox").hide();
		});
		
	};
	ErrorBox.constructor=ErrorBox;
	ErrorBox.prototype={
		displayError:function(text){
			// show text in rederrorbox div
			$("#error_message > p").text(text);
			$("#errorlightbox").show();
			$("#errorfadebox").show();
		}
	};
	
	
	/**
	Floating Dialog Box
	author: Tim Bowman
	
	Usage: 
	new FloatingDiv();
	**/
	var FloatingDiv = function(){
		var self = this;
		this._color = "#FDFF00";
		this._labels = [];
		this._curLink=null;
		// simple array for all of the names of the
		// labels to look up duplicates
		this.labelNames=[];
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
				' &nbsp; <img src="skins/default/floatingDivIcons/add.png" title="Add up to 5 Labels" name="Add up to 5 Labels" id="btnAddLabel">' +
				'<img style="margin-left: 1px; visibility: hidden;" src="skins/default/floatingDivIcons/delete.png" title="Delete last label" name="Delete last label" id="btnDeleteLabel">' +
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
			'<span class="label_formLabel">Data already attached: </span><br/><div id="labelListFloat" class="az"></div>'+
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
						
			$("#liformField1 input.tagComplete").autocomplete({
				source:self.labelNames
			});
			// this.addAutoComplete('li#formField1 input.tagComplete', self._labels);	
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
				$("input#formLabel"+newNum).autocomplete({source:self.labelNames});
				// self.addAutoComplete();
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
			// this._attachDataList=$("#"+myID+"_floatingDiv > fieldset > ol > li > #labelList");
			$("#labelListFloat").css({"position":"relative","height":"100px"});
			self.addColorSelector(myID,self.defaultColor);
		},	
		// insert new labels/tags and restart 
		// the metadata list and autocomplete
		// lbls : {Object array}
		insertNewLabels:function(lbls){
			var self=this;
			
			// collate with the current _labels
			// go through passed data and extract names, too
		
			for(var x in lbls){
				
				if(!lbls[x]||!lbls[x].obj) continue;
				
				
				if(!lbls[x].name){
					lbls[x].name=(lbls[x].obj.name)?lbls[x].obj.name:lbls[x].id;	
				} 
				if($.inArray(lbls[x].name,self.labelNames)>=0) continue;
				
				var f=null;
				for(var l in self._labels){
					if(l==lbls[x].name){
						f=true;
						break;
					}
				}
				if(f) continue;
				
			
				// Insert complete TILE object (id, type, jsonName, obj, and now name) into
				// the stack
				self._labels[lbls[x].id]=lbls[x];
				
				
			}
			// get rid of existing autocompletes
			
			$("li > input.tagComplete.ui-autocomplete-input").autocomplete('destroy');
			// create new autocompletes with new tags
			$("li > input.tagComplete").autocomplete({
				source:self.labelNames
			});
			
		},
		// Creates jQuery autoComplete object and attaches it 
		// to passed element
		// elem : {Object} - passed jQuery element 
		// labels : {Object} - array of data that represents automplete data - needs to be parsed
		addAutoComplete: function() {
			var self=this;
			// go through passed data and extract names
			if($("li > input.tagComplete.ui-autocomplete-input").length){
				$("li > input.tagComplete.ui-autocomplete-input").autocomplete('destroy');
			}
			// start over
			$("li > input.tagComplete").autocomplete({
				 source: self.labelNames
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
				livePreview:true,
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
			// set the passed TILE object as the
			// linked object for this dialog
			self._curLink=o;
			// reset the attachDataList
			$("#labelListFloat").empty();
			var html="";
			// store refs in here
			var lbls=[];
			
			// if refs passed, add each one to curLink's refs
			if(refs){
				var sh=null;
				for(var r in refs){
					if(refs[r].id==o.id) continue;
					for(var x in self._labels){
						
						if(self._labels[x].id==refs[r].id){
							lbls.push(self._labels[x]);
							sh=true;
							break;
						}
					}
					if(!sh){
						// insert new label
						var key=refs[r].id;
						// didn't find it in labels - need to add new (invisible label)
					
						self._labels[key]=refs[r].obj;
						
						lbls.push(self._labels[key]);
					}
				}
			}
			
			// attach references
			for(var prop in lbls){
				
				var name="";
				if(lbls[prop].obj&&lbls[prop].obj.name){
					name=lbls[prop].obj.name;
				} else if($("#"+lbls[prop].id).length){
					name=$("#"+lbls[prop].id).text().substring(0,10)+"...";
				} else {
					name=lbls[prop].type+':'+lbls[prop].id;
				}
			
				html+="<div id=\""+lbls[prop].id+"\" class=\"labelItem\">"+name+"<span id=\"del_"+lbls[prop].id+"\" class=\"button shape delete formLink\">Delete</span></div>";
				
			}
			// attach to the float div list
			$("#labelListFloat").append(html);
		
			// reset autocomplete
			self.addAutoComplete();
		
			// change colorpicker
			if(!self._curLink.obj.color) return;
			$('#floatingPenColor > div').css('backgroundColor',self._curLink.obj.color);
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
				var l=$('input#formLabel'+n).val();
				if($.inArray(l,lbls)<0){
					lbls[i] = $('input#formLabel'+n).val();
				}
			});
			var refs=[];
			var html="";
			for(var x in lbls){
				if((!lbls[x])||(lbls[x]=='undefined')) continue;
				
				var el=null;
				if($.inArray(lbls[x],self.labelNames)<0){
					// User typed in something that is not in the array
					// Create new label
					var id="l_"+(Math.floor(Math.random()*560));
					var name=(lbls[x].display)?lbls[x].display:lbls[x];
					el={id:id,type:'labels',jsonName:'labels',name:lbls[x],obj:{id:id,name:lbls[x]}};
					self._labels[id]=el;
					
					// add name to stack
					self.labelNames.push(lbls[x]);
					// ADD NEW LABEL TO THE JSON
					TILE.engine.insertData(el);
				} else {
					// find in stack
					for(var prop in self._labels){
						if(self._labels[prop].name==lbls[x]){
							el=self._labels[prop];
							break;
						}
					}
				}
				// shouldn't happen, but just in case
				if(!el) continue;
				// create HTML to be added to the list of labels attached to curLink
				html+="<div id=\""+el.id+"\" class=\"labelItem\">"+el.name+"<span id=\"del_"+el.id+"\" class=\"button shape delete formLink\">Delete</span></div>";
				// attach to global page list only if there isn't already label there
				if($("#labelList > #"+el.id).length==0){
					// 	none attach - attach this element
					$("#labelList").append("<div id=\""+el.id+"\" class=\"labelItem\">"+el.name+"</div>");
				}
				// push onto stack to be sent to ENGINE
				refs.push(el);
			}
			// attach references to the attachList
			$("#labelListFloat").append(html);
			
			for(var r in refs){
				if(!refs[r]) continue;
				setTimeout(function(s,r){
					TILE.engine.linkObjects(s,r);
				},1,self._curLink,refs[r]);
				
			}
			
			// update autocomplete
			// create a new autoComplete that includes new labels
			if($("li > input.tagComplete.ui-autocomplete-input").length){
				$("li > input.tagComplete.ui-autocomplete-input").autocomplete('destroy');
			}
			$("input.tagComplete").autocomplete({
				source:self.labelNames
			});
			// $("body:first").trigger("floatDivOutput",[{link:self._curLink,refs:refs}]);
			
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
			$("#labelListFloat > #"+lb.id).remove();
			// var n=$.inArray(self._curLink.id,lb.refs);
			// 			if(n===0){
			// 				lb.refs=[];
			// 			} else if(n>0){
			// 				var ac=[];
			// 				$.each(lb.refs,function(i,o){
			// 					if(self._curLink.id!=o){
			// 						ac.push(o);
			// 					}
			// 				});
			// 			
			// 				lb.refs=ac;
			// 			}
			// 			$.extend(lb,{parentTool:self._curLink.tool,parentObj:self._curLink.id,parentType:self._curLink.type});
			if(__v) console.log('deleting '+JSON.stringify(lb)+'  from  '+JSON.stringify(self._curLink));
			TILE.engine.deleteObj(self._curLink,lb);
			// also need to do reverse in order for link to be severed
			TILE.engine.deleteObj(lb,self._curLink);
			
			
			// $("body:first").trigger("deleteMetaLink",[lb]);
		}
		
	});
	

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
	
	tile.HelpBox=HelpBox;

	/**Main Engine **/
	// Author: Grant Dickie
	
	// Sets up the TILE toolbar (upper left-hand corner) with the 
	// tool selection drop-down, buttons for saving and exporting 
	// data
	// 
	// Objects: 
	// PluginController
	
	/*
	Basic Usage

	*/
	// TILE_ENGINE: {Object} main engine for running the LogBar and Layout of TILE interface
	// Returns: TILE_ENGINE instance {Object}
	// This instance has access to all of the TILE API functions, properties, and events
	
	// **NOTE: currently TILE_ENGINE does not read anything from the Object that is fed as a parameter. This 
	// may be changed in future versions of TILE to change the style, placement, or behavior of the Engine.
	//
	// Use it in your HTML:
	// 
	// <script type="text/javascript">
	// 		var tile=new TILE_ENGINE({});
	// 		
			// Using the insertMode method to 
			// add a interface mode
	// 		tile.insertMode('Mode1');
	
			// attach a plugin to Mode1
	// 		tile.insertModePlugin('Mode1','Image Tagger');
	// 		
			// start up TILE
	// 		tile.activate();
	// 		
	// </script>
	// OR put the code in a .js file and add to the header
	
	// ///////
	// Events
	// ////////
	// 
	// newJSON
	// newPage
	// 	newActive - passes TILE object 
	// 	dataAdded - passes TILE object
	// 	dataUpdated - passes TILE object
	// 	dataLinked - passes array of TILE objects
	// 	dataDeleted - passes TILE object 
	// 	
	
	
	var TILE_ENGINE=function(args){
		// set local ENGINE variable so that PluginController + other local
		// methods can access this
		TILE.engine=this;
		
		//get HTML from PHP script and attach to passed container
		this.loc=(args.attach)?args.attach:$("body");
		var self=this;

		// toolSet=(args.toolSet)?args.toolSet:[];
		// Options that can be fed into the constructor to switch off PHP 
		// and use only Javascript
		urls = (args.urls ? args.urls : {});
		// URL used to check whether saved data already loaded
		self.serverStateUrl = (urls.state ? urls.state : "plugins/Session/isJSON.php");
		// 
		self.serverRemoteStateUrl = (urls.remoteState ? urls.remoteState : "plugins/CoreData/parseRemoteJSON.php");
		// Images filtered through PHP to prevent cross-domain issues
		self.serverRemoteImgUrl = (urls.remoteImg ? urls.remoteImg : "plugins/Session/RemoteImgRedirect.php");

		// plugins array
		self.plugins=[];
		// array of plugins with key being
		// plugin name, value mode its in
		self.modeplugins=[];
		
		json=null;
		self.manifest=null;
		self.curUrl=null;
		
		//create log - goes towards left area
		_tileBar=new TileToolBar({loc:"tile_toolbar"});
		// set up plugin controller and listeners for plugin controller
		pluginControl=new PluginController();
		// set up error box
		errorbox=new ErrorBox();
	};
	TILE_ENGINE.prototype={
		// activates the engine - called after loading all 
		// plugins into the array through insertPlugin
		// or insertModePlugin
		activate:function(mode){
			var self=this;
			// optional: pass mode to determine
			// which mode of name 'mode' gets 
			// activated first
			
			// start up load screen again
			showLoad();
			
			// go through plugins array and attach the 
			// src elements
			
			setTimeout(function(self){
				var count=0;
			 	var recLoad=function(){
					count++;
					if(count==self.plugins.length){
						// check if there is json data 
						checkJSON();
						
						// see if user defined a mode
						if(mode){
							// find matching mode and
							// open that mode up
							for(var y in pluginModes){
								if(pluginModes[y].name==mode){
									pluginModes[y].setActive();
									break;
								}
							}
							
							
							removeLoad();
						}
					} else {
						$.getScript(self.plugins[count],recLoad);
					}
				};
				$.getScript(self.plugins[count],recLoad);
				
				
			},1,self);
		},
		showErrorReport:function(text){
			errorbox.displayError(text);
		},
		// adds a string of HTML to the drop-downs in 
		// save and load dialogs
		addImportExportFormats:function(str){
			var self=this;
			
			_tileBar.addFormats(str);
			
		},
		// Called to see if there is a JSON object stored in the PHP session() 
		// adds a toolbar button to TileToolBar
		addDialogButton:function(button){
			// send to _tileBar
			var jobj=_tileBar.addButton(button);
			return jobj;
		},
		// adds a plugin to the main set 
		// of plugins in TILE
		insertPlugin:function(name){
			var self=this;
			// obj is plugin wrapper
		
			// figure out src path
			var src='plugins/'+name+'/tileplugin.js';
			self.plugins.push(src);
		},
		// takes a description for a mode
		// and creates a new mode object
		insertMode:function(name,active,unactive){
			var self=this;
			
			// search for name in array of modes
			for(var prop in pluginModes){
				if(pluginModes[prop].name==name){
					return;
				}
			}
			// no plugin mode already set - create new
			var mode=new Mode(name,active,unactive);
			pluginModes.push(mode);
			return mode;
		},
		// add a plugin to a specific mode - 
		// waits until the mode is called to run
		// start() on plugin
		insertModePlugin:function(mode,plugin){
			var self=this;
			var obj=null;
			// find mode in current modes
			for(var prop in pluginModes){
				if(pluginModes[prop].name==mode){
					obj=pluginModes[prop];
					break;
				}
			}
			if(!obj){
				// create and insert into array
				obj=new Mode(mode);
				pluginModes.push(obj);
			}
			
			// figure out src path
			var src='plugins/'+plugin+'/tileplugin.js';
			self.plugins.push(src);
			// var script='<script src="'+src+'" type="text/javascript"></script>';
			// 		// attach script to header
			// 		$("head").append(script);
			
			// obj.appendPlugin(plugin);
			// insert into modeplugins array
			self.modeplugins[plugin]=obj.name;
			
		},
		// either appends html to Mode object of name or 
		// creates a new mode and inserts html in that mode
		insertModeHTML:function(html,section,name){
			var self=this;
			var mode=null;
			// search for name in array of modes
			for(var prop in pluginModes){
				if(pluginModes[prop].name==name){
					mode=pluginModes[prop];
					break;
				}
			}
			// if no mode found, create new
			if(!mode){ 
				mode=new Mode(name);
				pluginModes.push(mode);
			}
			
			mode.appendPluginHTML(html,section);
			
		},
		// insert toolbar buttons to a specific 
		// plugin in a specific mode
		insertModeButtons:function(html,section,name){
			var self=this;
			var mode=null;
			// if mode not yet intialised, return 
			for(var prop in pluginModes){
				if(pluginModes[prop].name==name){
					mode=pluginModes[prop];
					break;
				}
			}
			
			if(!mode) return;
			
			// add button html
			mode.appendButtonHTML(html,section);
			
			
		},
		// adds the plugin wrapper to the 
		// internal array 
		registerPlugin:function(pw){
			var self=this;
			
			// if part of a mode, add to 
			// that mode 
			// If not, activate the plugin immediately
			if(self.modeplugins[pw.name]){
				// has stored mode name
				// in array - find matching
				// mode with that name
				for(var x in pluginModes){
					if(pluginModes[x].name==self.modeplugins[pw.name]){
						// will start when mode is active
						pluginModes[x].appendPlugin(pw);
						break;
					}
				}
			} else {
				// no mode - just start the plugin
				pw.start();
			}
		},
		/**Get Schema**/
		//taken from setMultiFileImport Custom Event call from ImportDialog
		// users supply a filename in ImportDialog that is then used here 
		// If file is given, then TILE makes an AJAX call to that file. Otherwise,
		// it parses the current json
		// file : {String}
		parseJSON:function(file){
			var self=this;
			
			pluginControl._reset();
			
			showLoad();
			
			if((typeof(file)!='object')&&(/^[http\:\/\/]/.test(file))){
				//We are just getting the file with images
				// and the transcripts
				self.imageFile=file;
				while(/\&/.test(self.imageFile)){
					self.imageFile=self.imageFile.replace('\&','_AND_');
				}
			
				// set JSON and run parsing
				var d=$.ajax({
					url:TILE.engine.serverRemoteStateUrl+"?file="+self.imageFile,
					dataType:'text',
					async:false,
					error:function(d,x,e){
						if(__v) console.log("Failed to perform Ajax call  "+e);
					}
				}).responseText;
				// parse if it's a string
				json=(typeof d=='object')?d:JSON.parse(d);
			} else if((typeof(file)!='object')){
				// parse JSON as string
				json=JSON.parse(file);
				
			} else {
				if(file['tile']){
					// Coming from CoreData.php
					// Object has content and tile parameters
					json=deepcopy(file['tile']);
					
					// use the content in global variable 
					TILE.content=file['content'];
					// $("body:first").trigger("contentCreated",[file['content']]);
					
				} else {
					// simple - just a JSON object that we
					// use
					json=deepcopy(file);
				}
				if(curPage){
					TILE.activeItems=[];
					curPage=null;
					TILE.url=null;
				}
			}
			
			if(!json) return;
			
			// set initial global variables
			setTimeout(function(){
				for(var key in json.pages){
					var url=json.pages[key].url;
					if(!TILE.url){ 
						// set local and global variables
						curPage=url;
						TILE.url=curPage;
						break;
					}
				}
				// notify plugins that there is a JSON
				// loaded
				$("body:first").trigger("newJSON");
				removeLoad();
			},3);
		},
		// Put data into the JSON session
		insertData:function(data){
			var self=this;
			// if an array, use separate method
			if($.isArray(data)){
				for(var x in data){
					pluginControl.addDataToJSON(data[x]);
				}
			} else {
				pluginControl.addDataToJSON(data);
			}
		},
		// Take the passed obj Object with minimal variables
		// id and type, and update what is currently in the JSON
		// coredata
		updateData:function(obj){
			if(obj.id&&obj.type){
				var self=this;
				
				pluginControl.updateDataInJSON(obj);
				
			}
		},
		// Take passed Object reference obj1 and link it
		// with the current activeObj
		linkWithActiveObj:function(obj1){
			var self=this;
			return pluginControl.linkWithActiveObj(obj1);
			
		},
		// Specifically link two particular objects together
		linkObjects:function(obj1,obj2){
			var self=this;
			pluginControl.linkObjects(obj1,obj2);
		},
		// sets a particular object as an active object.
		// All future data sent to insertData gets inserted
		// in this object's jsonName array
		setActiveObj:function(obj){
			
			pluginControl._setActiveObj(obj);
		},
		attachMetadataDialog:function(obj,handle){
			var self=this;
			pluginControl._attachFloatDiv(obj,handle);
		},
		// deletes an item or reference from the JSON session
		deleteObj:function(obj1,obj2){
			var self=this;
			
			// use plugincontrol
			if(!obj2){
				pluginControl.deleteFromJSON(obj1);
			} else {
				pluginControl.deleteRefFromObj(obj1,obj2);
			}
		},
		nextPage:function(){
			var self=this;
			// show load dialog
			mouseWait();
			// use the setTimout method to allow
			// the loadscreen html to show up
			setTimeout(function(){
				// next
				var n=null;
				for(var prop in json.pages){
					if(!json.pages[prop]) continue;
					if(n){
						// make sure it's not the same page 
						// (For recto/verso images)
						if(curPage==json.pages[prop].url) continue;
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

				TILE.url=curPage;
				pluginControl.newPage();

				// notify plugins of change
				$("body:first").trigger("newPage");
				// done, remove load dialog
				mouseNormal();
			},10);
			
		},
		prevPage:function(){
			var self=this;
			// back
			var prev=null;
			// show load dialog
			mouseWait();
			// use the setTimout method to allow
			// the loadscreen html to show up
			setTimeout(function(){
				for(var prop in json.pages){
					if(!json.pages[prop]) continue;
				
					if(json.pages[prop].url==curPage){
						// make sure it's not the same page 
						// (For recto/verso images)
						if(prev==json.pages[prop].url) continue;
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
			
			
				TILE.url=curPage;
				pluginControl.newPage();
			
				// notify plugins of change
				$("body:first").trigger("newPage");
				// done, remove load dialog
				mouseNormal();
			},10);
		},
		// change to the position val in the page Array 
		changePage:function(val){
			var self=this;
			// show load dialog
			mouseWait();
			// use the setTimout method to allow
			// the loadscreen html to show up
			setTimeout(function(){
				// val can either be a URL or an Integer
				if(typeof(val)=='integer'){
					// find val-th page within the array of pages
					if(json.pages.length<=val){
						for(var p in json.pages){
							if(p==val){
								while(json.pages[p].url==TILE.url){
									p++;
								}
							
								TILE.url=json.pages[p].url;
								curPage=json.pages[p].url;
								break;
							}
						}
					}
				} else if(/http|\.[pngtifgifjpg]/i.test(val)){
					// URL given - find in pages
					for(var p in json.pages){
						if(json.pages[p].url==val){
							TILE.url=json.pages[p].url;
							curPage=json.pages[p].url;
							break;
						}
					}
				}
			
				pluginControl.newPage();
			
				// notify plugins of change
				$("body:first").trigger("newPage");
				// done, remove load dialog
				mouseNormal();
			},10);
		},
		// Method that supports adding tags to the 
		//  Metadata tags div (FloatingDiv)
		// arr : {Object Array}
		insertTags:function(arr){
			var self=this;
			pluginControl.setTags(arr);
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
				
					// var temp=$.extend(true,{},self.manifest[m]);
					for(var o in self.manifest[m]){
						json[m].push(self.manifest[m][o]);
					}
					
				}
			}
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
							var temp=$.extend(true,{},self.manifest[m]);
							// if(!self.json[m][p]) self.json[m][p]=[];
							json['pages'][p]=temp;
							break;
						}
					}
				} else if((!(/^http|\/|\./.test(m)))&&(!(/pages/.test(m)))){
					if(!json[m]) json[m]=[];
					
					for(var o in self.manifest[m]){
						json[m].push(self.manifest[m][o]);
					}
					
				}
			}
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
					if(json.pages[x].url==TILE.url){
						// copy only the current page
						jsoncopy=deepcopy(json.pages[x]);
					}
				}
			} else {
				// copy the full json view
				jsoncopy=deepcopy(json);
			}
			return jsoncopy;
		},
		// Outputs the JSON data in XML format
		// Opt : {Boolean}
		getXML:function(opt){
			var self=this;
			if(!json) return false;
			var jsoncopy=null;
			// if opt set true, only copy current
			// page we're on
			if(opt){
				for(var x in json.pages){
					if(json.pages[x].url==TILE.url){
						// copy only the current page
						jsoncopy=deepcopy(json.pages[x]);
					}
				}
			} else {
				// copy the full json view
				jsoncopy=deepcopy(json);
			}
			// pass the copy on to the XML parser
			// use json2xml
			var xml=json2xml(jsoncopy);
			return "<tile>"+xml+"</tile>";
		}
	};
	// TILE ENGINE IS MADE A PUBLIC API TOOL - CAN 
	// BE ACCESSED OUTSIDE OF LOCAL SCOPE
	tile.TILE_ENGINE=TILE_ENGINE;

	// ----------------- //
	// Mode //
	// ----------------- //
	// A set of plugin content items that are turned on/off at the same time
	// and has a mode button to represent that feature
	// Names can NOT have URIs or periods
	var Mode=function(name,active,unactive){
		var self=this;
		if(/http\:\/\/|\./.test(name)){
			return;
		}
		self.name=name;
		self.content=[];
		
		// set optional callback functions
		self.activeCall=self.name.substring(0,3)+'IsActive';
		self.unActiveCall=self.name.substring(0,3)+'IsUnActive';
		
		// array of plugins
		self.parr=[];
		// trigger for constructed/not
		self.setup=false;
		
		// attach button to global html
		self.button=_tileBar.addButton({
			type:'global',
			category:'mode',
			display:self.name,
			helptext:"Switch to "+self.name+" workspace"
		});
		self.button.elem.live('click',function(e){
			e.preventDefault();
			self.setActive();
			$("body:first").trigger("modeActive",[self.name]);
		});
		
		// listener for when new page is set
		$("body").live("newPage",{obj:self},self.newPageHandle);
		
	};
	Mode.prototype={
		// appends all types of HTML to the main interface
		appendHTML:function(html,section,area){
			var self=this;
			// change name to fit style
			var styleName=self.name.toLowerCase().replace(/ /g,'');
			// area defines if its a toolbar addon or 
			//  a content area add-on
			
			// section defines where on the screen
			// html goes
			switch(section){
				case 'rightarea':
					if(area=='toolbar'){
						// make sure that the toolbar shell is created
						if($("#azcontentarea > .az.inner."+styleName).length){
							if($("#azcontentarea > .az.inner."+styleName+" .toolbar").length){
								$("#azcontentarea > .az.inner."+styleName+" .toolbar").append(html);
 							} else {
								var toolWrapper='<div class="toolbar">'+html+'</div>';
								$(toolWrapper).prepend("#azcontentarea > .az.inner."+styleName);
								$("#azcontentarea > .az.inner."+styleName).prepend(toolWrapper);
							}
						}
						if($("#azcontentarea > .az.inner."+styleName+" > .toolbar > .menuitem.pluginTitle").length==0){
							// make a title for the plugin
							$("#azcontentarea > .az.inner."+styleName+" > .toolbar").prepend('<ul class="menuitem pluginTitle">'+self.name+'</ul>');
						}
					} else {
						// attach to azcontentarea
						// if shell already attached - append
						// to current shell
						if($("#azcontentarea > .az.inner."+styleName).length){
							// append to the shell
							$("#azcontentarea > .az.inner."+styleName).append(html);
						
						} else {
							// create outer shell
							var shell='<div class="az inner '+styleName+'">'+html+'</div>';
							$("#azcontentarea").append(shell);
						}
					}	
					
					break;
				case 'topleft':
					// goes in the log area - things that are logs
					// can be items that paginate with the core data
					// like transcript lines or selections or shapes
					if(area=='toolbar'){
						// make sure that the toolbar shell is created
						if($("#az_log > .az.inner."+styleName).length){
							if($("#az_log > .az.inner."+styleName+" .toolbar").length){
								$("#az_log > .az.inner."+styleName+" .toolbar").append(html);
 							} else {
								// create outer shell that includes innerHTML html
								var toolWrapper='<div class="toolbar">'+html+'</div>';
								$("#az_log > .az.inner."+styleName).prepend(toolWrapper);
								
							}
						}
						if($("#az_log > .az.inner."+styleName+" > .toolbar > .menuitem.pluginTitle").length==0){
							// make a title for the plugin
							$("#az_log > .az.inner."+styleName+" > .toolbar").prepend('<ul class="menuitem pluginTitle">'+self.name+'</ul>');
						}
					} else {
						// if shell already attached - append
						// to current shell
						if($("#az_log > .az.inner."+styleName).length){
							// append to the shell
							$("#az_log > .az.inner."+styleName).append(html);
						
						
						} else {
							
							// create outer shell that includes innerHTML html
							var shell='<div class="az inner '+styleName+'">'+html+'</div>';
							$("#az_log").append(shell);
							
							
						}
					}
					break;
				case 'bottomleft':
					// goes in the active area - i.e. items that persist 
					// across page items
					if(area=='toolbar'){
						// make sure that the toolbar shell is created
						if($("#az_activeBox > .az.inner."+styleName).length){
							if($("#az_activeBox > .az.inner."+styleName+" .toolbar").length){
								$("#az_activeBox > .az.inner."+styleName+" .toolbar").append(html);
 							} else {
								var toolWrapper='<div class="toolbar">'+html+'</div>';
								$("#az_activeBox > .az.inner."+styleName).prepend(toolWrapper);
								
							}
						}
						if($("#az_activeBox > .az.inner."+styleName+" > .toolbar > .menuitem.pluginTitle").length==0){
							// make a title for the plugin
							$("#az_activeBox > .az.inner."+styleName+" > .toolbar").prepend('<ul class="menuitem pluginTitle">'+self.name+'</ul>');
						}
					} else {
						// if shell already attached - append
						// to current shell
						if($("#az_activeBox > .az.inner."+styleName).length){
							// append to the shell
							$("#az_activeBox > .az.inner."+styleName).append(html);
						
						
						} else {
							// create outer shell
							var shell='<div class="az inner '+styleName+'">'+html+'</div>';
							$("#az_activeBox").append(shell);
						}
					}
					break;
				case 'main':
					// insert at the az main twocol area (overrides above areas)
					if($(".az.main.twocol > ."+styleName).length){
						$(".az.main.twocol > ."+styleName).append(html);
					} else {
						$(".az.main.twocol").append(html);
					}
					break;
				default:
				// do nothing
				break;
			}
			
			// if not active, hide items
			if(!$(".az.globalmenu > .globalbuttons > .modeitems > div > a:contains("+self.name+")").hasClass("active")){
				// hide
				$("."+styleName).hide();
			}
			
		},
		// append a button HTML
		// returns the button 
		appendButtonHTML:function(html,section){
			var self=this;
			self.appendHTML(html,section,'toolbar');
		
			
		},
		appendPlugin:function(plugin){
			var self=this;
			
			self.parr.push(plugin);
		},
		appendPluginHTML:function(html,section){
			var self=this;
			if(!html) return;
			self.appendHTML(html,section,'body');
		},
		// shows html for all 
		// plugins in set
		setActive:function(){
			var self=this;
			var styleName=self.name.toLowerCase().replace(/ /g,'');
			if(!self.setUp){
				// set up the plugins in array
				for(var x in self.parr){
					self.parr[x].start(this);
				}
				
			}
			// hide dialog(s)
			$(".ui-dialog").hide();
			
			// hide other modes
			$(".az.main.twocol > div > .az.inner").hide();
			// show ours
			$(".az.main.twocol > ."+styleName).show();
			$(".az.main.twocol > div > .az.inner."+styleName).show();
			
			// deactivate other buttons
			$(".az.globalmenu > .globalbuttons > .modeitems > div a").removeClass('active');
			// show button as active
			$(".az.globalmenu > .globalbuttons > .modeitems > div > a:contains("+self.name+")").addClass("active");
		
			// alert attached plugins 
			if(!self.setUp){
				self.setUp=true;
			} else {
				// restart all listening elements
				$("body > div").trigger(self.activeCall);
			}
		},
		// special function 
		setUnActive:function(){
			var self=this;
			var styleName=self.name.toLowerCase().replace(/ /g,'');
			
			// hide this mode
			$(".az.main.twocol > div > .az.inner."+styleName).hide();
			// trigger last in mode series to activate
			$(".globalbuttons > .modeitems > .menuitem > a:last").trigger('click');
			
			$("body:first").trigger(self.unActiveCall);
		},
		// reset values/HTML if there is a new page
		newPageHandle:function(e){
			var self=e.data.obj;
			// check to see if active
			if($(".az.globalmenu > .globalbuttons > .modeitems > div > a:contains("+self.name+")").hasClass("active")){
				// active - reset as active
				self.setActive();
			}
			
		}
	};
	
	
	// ----------------- //
	//  PluginController //
	// ----------------- //
	// Internal Object that controls plugins
	
	var PluginController=function(args){
		var self=this;
		
		// array for holding tool objects
		self.toolSet=[];
	
		// manifest for holding objects created in session and previous sessions
		self.manifest={};
		// array for holding reference data
		self.linkArray=[];
		// lookup array for refs
		self.refArray=[];
		
		// array for holding tool JSON data
		self.toolJSON=[];
		
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
		
		$("body").live("colorChanged",function(e,color,link){
			// color : {String} hexidecimal units
			// pass on change in color as an object change
			// Any listening objects can pick up on this event
			if(!(/#/.test(color))) color="#"+color;
			if(link){
				// get the object from JSON
				var obj=self.findRealObj(link.id,link.type);
				
				// change its color
				obj.color=color;
				
				$("body:first").trigger("dataUpdated",[{"id":obj.id,"type":link.type,"obj":obj}]);
			}
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
		_reset:function(){
			var self=this;
			self.activeObj=null;
		},
		// Takes the plugin wrapper obj and 
		// sets its start() method
		initTool:function(obj){
			var self=this;
			// make sure the wrapper is standard
			if(!obj.start){
				throw "Error: plugin wrapper passed that doesn't contain a start method.";
			}
			// call the wrapper's start method
			obj.start();
			
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
	
				// set up all tools/plugins to load their dependencies
				function recTool(t){
					if(t>=toolIds.length) {
						// Go back to imagetagger by default?
						// May be changed to user's preferences
						// $("body").unbind(self.toolSet[toolIds[(t-1)]]._close);
						self.curTool=null;
						
						self.toolSet[self.startTool].start();
						// fix up transcript bar area
						$("#az_log > *").hide();
						
						$("#az_log > div:eq(0)").show();

						$("#azcontentarea > div:not(.az.inner:eq(0))").hide();
						$("#azcontentarea > .az.inner:eq(0)").show();
						$("#azcontentarea > .az.inner:eq(0) > *").show();
						return;
					}
					var ct=self.toolSet[toolIds[t]];
				
					// Running the tool plugin constructor
					ct.start();
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
					// if(ct.close){
					// 						ct.close();
					// 					}
					if(t>=toolIds.length) return;
					t++;
					recTool(t);
				}
			}
			recTool(0);
			
			// set up listener for loadItems
		},
		createNewLayout:function(design){
			var self=this;
			
			// create new layout
		},
		// inserts new tags into FloatingDiv
		setTags:function(arr){
			var self=this;
			self.floatDiv.insertNewLabels(arr);
		},
		// resets the activeItems global variable and activeObj local variable 
		// and hides dialogs each time a new page is loaded into TILE
		newPage:function(){
			var self=this;
			TILE.activeItems=[];
			self.activeObj=null;
			// make  sure metadata dialog is hidden
			$(".ui-dialog").hide();
		},
		_setActiveObj:function(_newActiveObj){
			var self=this;
			$(".ui-dialog").hide();
			$(".shpButtonHolder").remove();
			if(!_newActiveObj){
				self.activeObj=null;
				// set blank object as active (reset)
				$("body:first").trigger('newActive',[{id:'none',type:'none'}]);
				return;
			}
			var refs=[];
			if(self.activeObj&&(self.activeObj.id==_newActiveObj.id)) return;
			
			self.activeObj=null;
			// reset activeItems
			TILE.activeItems=[];
			// find object in JSON
			// assign that object to activeObj
			if(_newActiveObj.type!=_newActiveObj.jsonName){
				for(var prop in json.pages){
					if(json.pages[prop].url==_newActiveObj.jsonName){
						// found page
						var page=json.pages[prop];
						if(!page[_newActiveObj.type]){
							// array doesn't exist yet - insert data 
							// and use the object as activeObj
							page[_newActiveObj.type]=[_newActiveObj.obj];
							self.activeObj=_newActiveObj;
							TILE.activeItems.push(self.activeObj.obj);
						} else {
							// already an array in session - check to see
							// if there is a matching ID
							for(var item in page[_newActiveObj.type]){
								if(_newActiveObj.id==page[_newActiveObj.type][item].id){
									// copy into object
									_newActiveObj.obj=deepcopy(page[_newActiveObj.type][item]);
									
									self.activeObj=_newActiveObj;
									TILE.activeItems.push(self.activeObj.obj);
									break;
								}
							}
							if(!self.activeObj){
								// insert into array
								page[_newActiveObj.type].push(_newActiveObj.obj);
								self.activeObj=_newActiveObj;
								TILE.activeItems.push(self.activeObj.obj);
							} 
						}
					}
					
				}
			} else {
				// on global level
				if(!json[_newActiveObj.jsonName]){
					json[_newActiveObj.jsonName]=[_newActiveObj.obj];
					self.activeObj=_newActiveObj;
					TILE.activeItems.push(self.activeObj.obj);
				} else {
					// found array - check for the matching ID
					for(var item in json[_newActiveObj.jsonName]){
						if(json[_newActiveObj.jsonName][item].id==_newActiveObj.id){
							_newActiveObj.obj=deepcopy(json[_newActiveObj.jsonName][item]);
							self.activeObj=_newActiveObj;
							TILE.activeItems.push(self.activeObj.obj);
							break;
						}
					}
					if(!self.activeObj){
						json[_newActiveObj.jsonName].push(_newActiveObj.obj);
						self.activeObj=_newActiveObj;
						TILE.activeItems.push(self.activeObj.obj);
					}
				
					
				}
				
			}
			if(!self.activeObj) return;
			
			// set activeItems
			for(var prop in self.activeObj.obj){
				if($.isArray(self.activeObj.obj[prop])){
					// load items as refs
					for(var id in self.activeObj.obj[prop]){
						
						var n=self.findObj(self.activeObj.obj[prop][id],prop);
						// insert into activeItems
						if(n&&(n!='undefined')) {TILE.activeItems.push(n);}
						
					}
				}
			}
			// notify plugins of new active object
			$("body:first").trigger("newActive",[self.findTileObj(self.activeObj.id,self.activeObj.type)]);
		},
		// insert data into the JSON without making it activeObj
		putData:function(data){
			var self=this;
			if(!data) return;
			if(!data.jsonName) data.jsonName=data.type;
			// if type is url, put in page
			// otherwise in global area
			if(data.jsonName!=data.type){
				// page element
				var page=null;
				for(var v in json.pages){
					if(json.pages[v].url==data.jsonName){
						page=json.pages[v];
					}
				}
				if(!page) return;
				
				if(!page[data.type]){
					page[data.type]=[];
				}
				page[data.type].push(data.obj);
				
			} else {
				if(!json[data.type]){
					json[data.type]=[];
				}
				json[data.type].push(data.obj);
			}
			
			
		},
		// similar to putData, but in this case
		// takes an existing object in JSON and 
		// updates/replaces it's ID
		replaceData:function(data){
			var self=this;
			if(!data) return;
			if(!data.jsonName) data.jsonName=data.type;
			// find Object and replace it
			// get reference to old version
			if(!json[data.type]){
				// URL - find in current page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==TILE.url){
						// found page
						page=json.pages[p];
						break;
					}
				}
				if((!page)||(!page[data.type])) return obj;
				for(var item in page[data.type]){
					if(id==page[data.type][item].id){
						page[data.type][item]=data;
					}
				}
			} else {
				if(!json[data.type]) return obj;
				for(var item in json[data.type]){
					if(id==json[data.type][item].id){
						json[data.type][item]=data;
						break;
					}
				}
				
			}
			
		},
		// returns actual instance, not a deepcopy
		findRealObj:function(id,type){
			var self=this;
			var obj=null;
			if(!json[type]){
				// URL - find in current page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==TILE.url){
						// found page
						page=json.pages[p];
						break;
					}
				}
				if((!page)||(!page[type])) return obj;
				for(var item in page[type]){
					if(id==page[type][item].id){
						obj=page[type][item];
					}
				}
			} else {
				if(!json[type]) return obj;
				for(var item in json[type]){
					if(id==json[type][item].id){
						obj=json[type][item];
						break;
					}
				}
				
			}
			return obj;
		},
		// searches json for matching id
		findObj:function(id,type,jsonName){
			var self=this;
			var obj=null;
			if(!json[type]){
				// URL - find in current page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==TILE.url){
						// found page
						page=json.pages[p];
						break;
					}
				}
				if((!page)||(!page[type])) return obj;
				for(var item in page[type]){
					if(id==page[type][item].id){
						obj=deepcopy(page[type][item]);
					}
				}
			} else {
				if(!json[type]) return obj;
				for(var item in json[type]){
					if(id==json[type][item].id){
						obj=deepcopy(json[type][item]);
						break;
					}
				}
				
			}
			return obj;
		},
		// returns object in TILE format
		findTileObj:function(id,type){
			var self=this;
			var obj=null;
			if(!json[type]){
				// URL - find in current page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==TILE.url){
						// found page
						page=json.pages[p];
						break;
					}
				}
				if((!page)||(!page[type])) return null;
				for(var item in page[type]){
					if(id==page[type][item].id){
						var o=deepcopy(page[type][item]);
						obj={id:id,type:type,jsonName:page.url,obj:o};
						break;
					}
				}
			} else {
				if(!json[type]) return null;
				for(var item in json[type]){
					if(id==json[type][item].id){
						var o=deepcopy(json[type][item]);
						obj={id:id,type:type,jsonName:type,obj:o};
						break;
					}
				}
				
			}
			return obj;
		},
		// Attaches the FloatingDiv object to given #id
		_attachFloatDiv:function(data,handle){
			var self=this;
			// find the data reference
			if(!data.id||!data.jsonName) return;
			var ref=null;
			// handle represents element to attach to
			data=self.findTileObj(data.id,data.type);
			if(!data) return;
			
			if(!handle) handle="body";
			var pos='';
			// Safari Webkit measures things differently
			if($.browser.safari){
				var x=parseInt($(handle).css('marginLeft'),10);
				var y=parseInt($(handle).css('marginTop'),10);
				pos={'left':x,'top':y};
			} else {
				pos=$(handle).offset();
			}
			
			
			if(!pos) return;
			var left=(pos.left+$(handle).width()+10);
			var top=(pos.top+$(handle).height()+10);
			if((left+$(".ui-dialog").width())>$(document).width()){
				left=(pos.left-$(".ui-dialog").width()-10);
			}
			if((top+$(".ui-dialog").height())>$(document).height()){
				top=(pos.top-$(".ui-dialog").height()-10);
			}
			if(top<$(document).height()){
				top=25;
			}
			$("#tilefloat_floatingDiv").parent().css("left",left+'px');
			$("#tilefloat_floatingDiv").parent().css("top",top+'px');
			$("#tilefloat_floatingDiv").parent().show();
			// find any reference arrays in the JSON object 
			// then find matching IDs in JSON
			var refs=[];
			for(var d in data.obj){
				if(data.obj[d]&&($.isArray(data.obj[d]))){
					for(var prop in data.obj[d]){
						if(!data.obj[d]) continue;
						var n=self.findTileObj(data.obj[d][prop],d);
						if(n) refs.push(n);
					}
				}
			}
			
			self.floatDiv.setInputObject(data,refs);
			$(".ui-dialog").show();
		},
		// Takes output from FloatingDiv and parses it out.
		// Attaches refs to appropriate tool
		_floatDivOutputHandle:function(e,o){
			var self=e.data.obj;
			if(!o) return;
			self.activeObj=o.link;
			for(var i in o.refs){
				if(!o.refs[i]) continue;
				var newo=self.parseLink(self.activeObj,o.refs[i]);
				if(newo) $("body:first").trigger("dataLinked",[newo]);
			}
		},
		// link two objects together without
		// changing the activeObj
		linkObjects:function(obj1,obj2){
			if((!obj1)||(!obj2)) return;
			mouseWait();
			var self=this;
			setTimeout(function(){
				var o1=self.findTileObj(obj1.id,obj1.type);
				if(!o1){

					self.putData(obj1);
					
					o1=self.findTileObj(obj1.id,obj1.type);
				}
				var o2=self.findTileObj(obj2.id,obj2.type);
				if(!o2){
					self.putData(obj2);
					o2=self.findTileObj(obj2.id,obj2.type);
				}
				// create link
				var newo=self.parseLink(o1,o2);
				// if(!newo){
				// 					TILE.engine.displayError('Problem occured: Line 2249 :: '+JSON.stringify(o1));
				// 				}
				o1=newo[0];
				o2=newo[1];
				// o1=self.findObj(o1.id,o1.type);
				// o2=self.findObj(o2.id,o2.type);

				// update activeItems and notify data change
				self.updateActiveItems(newo);
				// var found=null;
				// 				for(var v in TILE.activeItems){
				// 					if(TILE.activeItems[v].id==o2.id){
				// 						found=true;
				// 					}
				// 				}
				// 				if(!found) TILE.activeItems.push(o2);
				// 				found=null;
				// 				for(var v in TILE.activeItems){
				// 					if(TILE.activeItems[v].id==o1.id){
				// 						found=true;
				// 					}
				// 				}
				// 				if(!found) TILE.activeItems.push(o1);
				
				// notify plugins of change
				$("body:first").trigger("dataLinked",[newo]);
				mouseNormal();
				
			},10);
		},
		linkWithActiveObj:function(obj1){
			var self=this;
			
			if(!self.activeObj) return false; // no activeObj, cancel
			if(obj1.id==self.activeObj.id) return false;
			
			var o=self.findTileObj(obj1.id,obj1.type);
			if(!o){
				mouseWait();
				// show progress bar
				
				// insert into JSON and then 
				// get object
				self.putData(obj1);
				o=self.findRealObj(obj1.id,obj1.type);
				obj1.obj=o;
				mouseNormal();
			}
			var newo=self.linkObjects(self.activeObj,obj1);
			$("body:first").trigger("dataLinked",[newo]);
			return true;
		},
		// simplified version of toolOutput and floatDivOutput
		addDataToJSON:function(data){
			if((!data)||(data=='')) return;
			var self=this;
			mouseWait();
			showLoad();
			// update activeItems
			var obj=self.findObj(data.id,data.type);
			if(!obj){
				// not in json yet - need to insert it
				self.putData(data);
				obj=self.findObj(data.id,data.type);
			} else {
				// replace the data with what is passed
				// by this call (update/post new data)
				// self.replaceData(data);
				// quit
				return;
			}
			// update the activeItems
			// self.updateActiveItems([obj]);
			
			// notify plugins of change
			if(!obj.obj){
				obj=self.findTileObj(data.id,data.type);
			}
			
			$("body:first").trigger("dataAdded",[deepcopy(obj)]);
			mouseNormal();
			removeLoad();
			// quit
			return;
			
			
		},
		// Take passed object reference, find it in JSON
		// If found, update found record
		updateDataInJSON:function(obj){
			var self=this;
			// tileObj=self.findRealObj(obj.id,obj.type);
			var id=obj.id;
			var type=obj.type;
			if(!json[type]){
				// URL - find in current page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==TILE.url){
						// found page
						page=json.pages[p];
						break;
					}
				}
				if((!page)||(!page[type])) return obj;
				for(var item in page[type]){
					if(id==page[type][item].id){
						page[type][item]=obj.obj;
					}
				}
			} else {
				if(!json[type]) return obj;
				for(var item in json[type]){
					if(id==json[type][item].id){
						json[type][item]=obj.obj;
						break;
					}
				}
				
			}
			
			// tileObj=deepcopy()
			// 			for(var x in tileObj){
			// 				if((obj[x])&&($.isArray(tileObj[x]))){
			// 					// change the array data
			// 					tileObj[x]=obj[x];
			// 				}
			// 			}
			// done updating real object, get TILE copy
			var copy=self.findTileObj(obj.id,obj.type);
			$("body:first").trigger("dataUpdated",[copy]);
			
		},
		// takes into account new items that are 
		// active or added to data
		updateActiveItems:function(args){
			var self=this;
			
			// go through array
			for(var i in args){
				if((!args[i])||(!args[i].id)) continue;
				var f=false;
				for(var v in TILE.activeItems){
					
					if(TILE.activeItems[v].id==args[i].id){
						f=true;
						break;
					} 
					
				}
				if(!f){
					TILE.activeItems.push(args[i]);
				}
			}
			
		},
		// takes data obj1 and obj2 and generates link
		// and stores the objects into the manifest array 
		// if they haven't already been stored there
		parseLink:function(obj1,obj2){
			var self=this;
			if((obj1!=null)&&(obj2!=null)){
				var robj1, robj2=null;
				showLoad();
				// check to see if each object is on the global or page level
				// Then insert into the larger JSON session array
				// GLOBAL: Anything not a URL
				// PAGE : a URI
				if(/http\:|\.[jgpt]*/i.test(obj1.jsonName)){
					var url=obj1.jsonName;
					// create new arrays if not already instantiated
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
										found=item;
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
						robj1={"id":obj1.id,"type":obj1.type,"jsonName":page,"obj":deepcopy(json.pages[page][obj1.type][found])};
						
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
						json[obj1.type].push(deepcopy(obj1.obj));
						found=json[obj1.type].length-1;
						// self.linkArray[obj1.type][self.linkArray[obj1.type].length-1][obj2.type]=[obj2.id];
						
					}
					if(!(json[obj1.type][found][obj2.type])){
						json[obj1.type][found][obj2.type]=[];
					}
					if($.inArray(obj2.id,json[obj1.type][found][obj2.type])<0){
					
						$.merge(json[obj1.type][found][obj2.type],[obj2.id]);
						robj1={"id":obj1.id,"type":obj1.type,"jsonName":obj1.type,"obj":deepcopy(json[obj1.type][found])};
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
								for(var item in json.pages[p][obj2.type]){
									if(json.pages[p][obj2.type][item].id==obj2.id){
										found=item;
									}
								}
							} else {
								// create the array in json stack
								json.pages[p][obj2.type]=[];
							}
							
							break;
						}
					}
					
								
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
						robj2={"id":obj2.id,"type":obj2.type,"jsonName":page,"obj":deepcopy(json.pages[page][obj2.type][found])};
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
					} else {
						json[obj2.type]=[];
					}
					if(found<0){
						json[obj2.type].push(deepcopy(obj2.obj));
						found=json[obj2.type].length-1;
					}
					if(!(json[obj2.type][found][obj1.type])){
						json[obj2.type][found][obj1.type]=[];
					}
					if($.inArray(obj1.id,json[obj2.type][found][obj1.type])<0){
						$.merge(json[obj2.type][found][obj1.type],[obj1.id]);
						robj2={"id":obj2.id,"type":obj2.type,"jsonName":obj2.type,"obj":deepcopy(json[obj2.type][found])};
					}
				}
				removeLoad();
				return [robj1,robj2];
			} else {
				return null;
			}
			
			
		},	
		// Completely erase obj from the TILE json
		deleteFromJSON:function(obj){
			var self=this;
			if((!obj)||(!obj.type)||(!obj.id)) return obj;
			if((!obj.jsonName)||(!obj.obj)){
				obj=self.findTileObj(obj.id,obj.type);
			}
			
			// delete all references
			for(var item in obj.obj){
				if($.isArray(obj.obj[item])){
					for(var prop in obj.obj[item]){
						
						var o={id:obj.obj[item][prop],type:item};
						
						
						self.deleteRefFromObj(o,obj);
					}
				}
				
			}
			
			// must be a TILE standard format JSON object
			// with id, jsonName, type
			if(!json[obj.type]){
				// on page level
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==obj.jsonName){
						page=json.pages[p];
					}
				}
				if(!page) return;
				if(!page[obj.type]) return;
				var ag=[];
				for(var prop in page[obj.type]){
					if(page[obj.type][prop].id!=obj.id){
						ag.push(page[obj.type][prop]);
					}
				}
				page[obj.type]=ag;
			} else if(json[obj.type]) {
				// on global level
				var ag=[];
				for(var prop in json[obj.type]){
					if(json[obj.type][prop].id!=obj.id){
						ag.push(json[obj.type][prop]);
					}
				}
				json[obj.type]=ag;
			}
			
			
			
			
			// Notify delete
			$("body:first").trigger("dataDeleted",[obj]);
			// delete from activeItems
			// var ag=[];
			// 		for(var prop in TILE.activeItems){
			// 			if(TILE.activeItems[prop].id!=obj.id){
			// 				ag.push(TILE.activeItems[prop]);
			// 			}
			// 		}
			// 		TILE.activeItems=ag;
			// 		
			// 		
		},
		deleteRefFromObj:function(obj,ref){
			var self=this;
			if((!obj)||(!obj.type)||(!obj.id)||(!ref)||(!ref.type)||(!ref.id)) return;
			
			// get TILE standard versions of objects
			obj=self.findTileObj(obj.id,obj.type);
			ref=self.findTileObj(ref.id,ref.type);
			
			if((!ref)||(!obj)) return;
			// get rid of ref.id from obj[ref.type]
			if(json[obj.jsonName]){
				// find on global level
				for(var item in json[obj.jsonName]){
					if(json[obj.jsonName][item].id==obj.id){
						// item found - erase from stack of reference IDs
						if(json[obj.jsonName][item][ref.type]){
							// delete ID from stack
							var ag=[];
							for(var a in json[obj.jsonName][item][ref.type]){
								if(ref.id!=json[obj.jsonName][item][ref.type][a]){
									ag.push(json[obj.jsonName][item][ref.type][a]);
								}
							}
							json[obj.jsonName][item][ref.type]=ag;
						}
					}
				}
			} else {
				// on the page level
				// find page
				var page=null;
				for(var p in json.pages){
					if(json.pages[p].url==obj.jsonName){
						page=json.pages[p];
						break;
					}
				}
				if(!page) return;
				if(!page[obj.type]) return;
				// find in page
				for(var item in page[obj.type]){
					if(page[obj.type][item].id==obj.id){
						if(page[obj.type][item][ref.type]){
							// delete ID
							var ag=[];
							for(var a in page[obj.type][item][ref.type]){
								if(ref.id!=page[obj.type][item][ref.type][a]){
									ag.push(page[obj.type][item][ref.type][a]);
								}
							}
							page[obj.type][item][ref.type]=ag;
						}
					}
				}
			}
			obj=self.findTileObj(obj.id,obj.type);
		$("body:first").trigger('dataUpdated',[obj]);
		}
	};
	
	
	var SaveDialog=function(){
		var self=this;
		self.html='<div id="savedialogwhitespace" class="white_content"><div id="savedialog" class="dialog"><div class="header">'+
		'<h2>Save Data <a href="#" id="savedialogclose" class="btnIconLarge close"></a></div><div class="body"><div class="option">'+
		'<label>Save File As:</label>'+
		'<br/><input id="save_filename" name="uploadFileName" type="text" placeholder="myfile.format" style="width:90%" />'+
		'<label>Pick a format by selecting one of the options below: </label><br/>'+
		'<input id="save_session_json" value="Save As JSON" type="button" class="button" />'+
		'<input id="save_session_format" value="Save As Original Format" type="button" class="button"/>'+
		'<input id="cancelSaveDialog" type="button" class="button" value="Cancel"/></div>'+
		'</div></div></div>'+
		'<div id="darkForSaveDialog" class="black_overlay"></div>';
		// attach
		$("body").append(self.html);
		// make invisible
		$("#savedialog").show();
		$("#savedialogwhitespace").hide();
		$("#darkForSaveDialog").hide();
		// cancel button
		// stores all formats and their src destination
		self.srcArray=[];
		// changes based on which format is selected
		self.saveUrl='';
		self.exportScript='plugins/CoreData/exportDataScript.php';
		// set invisible form to this
		$("#inv_SaveProgress_Form").attr("action",self.exportScript);
		
		
		// close button event handler
		$("#savedialog > .header > h2 > #savedialogclose").click(function(e){
			e.preventDefault();
			$("#savedialogwhitespace").hide();
			$("#darkForSaveDialog").hide();
		});
		
		$("#cancelSaveDialog").click(function(e){
			e.preventDefault();
			$("#savedialogwhitespace").hide();
			$("#darkForSaveDialog").hide();
		});
		
		// set up call to the PHP server
		$("#savedialog > .body > .option > #save_session_json").click(function(e){
			e.preventDefault();
				// use hidden form fields
			$("#inv_SaveProgress_Form > #uploadData").val(JSON.stringify(deepcopy(json)));
			
			$("#inv_SaveProgress_Form > #uploadFileName").val($("#savedialog > .body > .option > #save_filename").val());
			$("#inv_SaveProgress_Form > #uploadData2").val('');
			$("#inv_SaveProgress_Form").submit();
			
			// hide dialog
			$("#savedialogwhitespace").hide();
			$("#darkForSaveDialog").hide();
		});
		
		// set up listener for saving to original file format
		$("#savedialog > .body > .option > #save_session_format").click(function(e){
			e.preventDefault();
			if(!TILE.content) {
				// save as json
					// use hidden form fields
				$("#inv_SaveProgress_Form > #uploadData").val(JSON.stringify(deepcopy(json)));

				$("#inv_SaveProgress_Form > #uploadFileName").val($("#savedialog > .body > .option > #save_filename").val());
				$("#inv_SaveProgress_Form > #uploadData2").val('');
				$("#inv_SaveProgress_Form").submit();

				// hide dialog
				$("#savedialogwhitespace").hide();
				$("#darkForSaveDialog").hide();
				return;
			}
			
			var jsonstring=JSON.stringify(TILE.engine.getJSON());
			var filename=$("#savedialog > .body > .option > #save_filename").val();
			
			// send to import script
			// update
			$("#inv_SaveProgress_Form > #uploadData").val(JSON.stringify(deepcopy(json)));
			$("#inv_SaveProgress_Form > #uploadData2").val(TILE.content);
			$("#inv_SaveProgress_Form > #uploadFileName").val($("#savedialog > .body > .option > #save_filename").val());
		
			// submit
			$("#inv_SaveProgress_Form").submit();
			
			$("#savedialogwhitespace").hide();
			$("#darkForSaveDialog").hide();
		});
		
	};
	SaveDialog.prototype={
		addFormats:function(str){
			var self=this;
			$("#save_format").append(str);
		},
		appendFeature:function(format,src){
			var self=this;
			format=format.toLowerCase();
			// create new option
			var opt='<option id="'+format+'" class="saveformat">'+format.toUpperCase()+'</option>';
			// add to the select element
			$("#save_format").append(opt);
			// add to array
			self.srcArray[format]=src;
		}
	};
	
	// Load  Dialog
	// For loading JSON session data back into the TILE interface

	var LoadDialog=function(args){
		// Constructor: (Same as Dialog)  {loc: {String} id for where to put DOM, html: {String} JSON string representing html for this Dialog}
		var self=this;
		// Constructor:
		// 
		// @param: 
		// Obj: variables:
		// 	loc: {String} DOM object to be attached to
		if((!args.loc)) {throw "Not enough arguments passed to Dialog";}
		self.loc=args.loc;
		self.importScript="plugins/CoreData/importDataScript.php";
		//set up JSON html
		var html='<div id="LTlight" class="white_content"><div id="loadTagsDialog" class="dialog">'+
		'<div class="header"><h2 class="title">Load Data</h2><h2>'+
		'<a href="#" id="loadTagsClose" class="btnIconLarge close">Close</a></h2><div class="clear">'+
		'</div></div><div class="body"><div class="option"><h3>Load from a file on your local machine:/URL<br/>(See dropdown for supported Filetypes - .json supported by default)</h3>'+
		'<div id="warningmessage" class="serverstatus">There was an error processing your data. Please check that you have a supported filetype and that your settings are correct.<br/><a href="http://bit.ly/lgWPBD">--> Help <--</a></div>'+
		'<input id="selectFileUpload" type="radio" value="file" name="uploadChoice" /><span>Upload from your computer</span>'+
		'<form id="loadFromFile" action="'+self.importScript+'" method="post" enctype="multipart/form-data">'+
		'<label for="file">Filename:</label><br/><input id="localFileUpload" type="file" placeholder="Use the browse button to enter a file from your computer ->" name="fileUploadName" size="70" value="" />'+
		'<br/><select id="fileFormatFileLocal" name="importformat"></select>'+
		'<br/><input id="loadFile" value="Submit" type="submit" class="button" /></form><div id="hiddenFormField" style="visibility:hidden"></div><br/>'+
		'<input id="selectURLUpload" type="radio" name="uploadChoice" value="Upload a file from a URL" /><span>Upload from a URL</span><form id="uploadURL" action="">'+
		'<br/><label>Enter URL Here: </label><input id="filepathDisplay" type="text" class="long" value="" placeholder="Such as: http://www.example.com/path/to/my/data.xml" />'+
		'<br /><select id="fileFormatFileURL" name="fileformat"></select>'+
		'<br/><input id="loadURL" type="submit" class="button" name="submitTags" value="Submit" /></form>'+
		'</div><div class="clear"></div></div></div></div><div id="LTfade" class="black_overlay"></div>';
		$(html).appendTo(self.loc);
		self.index=($("#dialog").length+self.loc.width());
	
		this.DOM=$("#loadTagsDialog");
		this.closeB=$("#loadTagsClose");
		this.closeB.click(function(e){
			$(this).trigger("closeLoadTags");
		});
		this.light=$("#LTlight");
		this.fade=$("#LTfade");
		
		this.submitB=$("#uploadURL > #loadURL");
		this.submitB.live('click',{obj:this},this.submitFileHandle);
		
		$("#loadTagsDialog > .body > .option > #selectFileUpload").live('click',function(e){
			$("#uploadURL").addClass("fade");
			$("#loadFromFile").removeClass("fade");
			$("#loadFromFile > input").attr('disabled','');
			$("#uploadURL > input").attr('disabled','true');
		
		});
		
		$("#loadTagsDialog > .body > .option > #selectURLUpload").live('click',function(e){
			$("#uploadURL").removeClass("fade");
			$("#loadFromFile").addClass("fade");
			$("#loadFromFile > input").attr('disabled','true');
			$("#uploadURL > input").attr('disabled','');
		});
		
		// change the file upload submit method from default
		// $("#loadTagsDialog > .body > .option > #loadFromFile").submit(function(e){
		// 		
		// 		$(this)[0].target='import_iframe';
		// 		
		// 	});
		// 	
		// 	// attach onload function to the iframe
		// 	$("#import_iframe").load(function(e){
		// 		// get JSON text
		// 		var str=frames['import_iframe'].document.getElementsByTagName("body")[0].getElementsByTagName("pre")[0].innerHTML;
		// 		if(__v) console.log('str loaded into import iframe: '+str);
		// 		TILE.engine.parseJSON(JSON.parse(str));
		// 		$("#LTlight").hide();
		// 		$("#LTfade").hide();
		// 		
		// 	});
		
		$("#loadTagsDialog > .body > .option > #selectFileUpload").trigger('click');
		
		// $("#loadTagsDialog > .body > .option > .chooseFile").live('click',function(e){
		// 			// set the URL value to exporting in simple model form
		// 			$("#importURL").val($(this).val());
		// 		});
		// 		
		// 		// convert form into the fileUpload jQuery plugin
		// 		  
		
		$("#loadFromFile").ajaxForm(function(data,stats){
			// check to make sure data is accurate
			try {
				data=data.replace(/^<pre.*?>|<\/pre>$/ig,'');
			
				data=$.parseJSON(data);
			}
			catch(e) {
				// error -- unable to parse JSON
				$("#warningmessage").show();
			}
			if(typeof(data) == "undefined"){
				// error returned - alert user to try again
				$("#warningmessage").show();
				
			} else {
				// take the returned JSON and load it into TILE
				TILE.engine.parseJSON(data);
				// hide dialog
				$("#warningmessage").hide();
				$("#LTlight").hide();
				$("#LTfade").hide();
			}
		});
		
		
		// $("#loadFromFile").ajaxForm({
		// 			dataType:'json',
		// 			target:"#warningmessage",
		// 			replaceTarget:false,
		// 			success:function(data,stats){
		// 				// take the returned JSON and load it into TILE
		// 				TILE.engine.parseJSON(data);
		// 				// hide dialog
		// 				$("#LTlight").hide();
		// 				$("#LTfade").hide();
		// 			}
		// 		});
		// $("#loadFromFile").submit(function(e){
		// 			e.preventDefault();
		// 			
		// 			$(this).ajaxSubmit({
		// 				dataType:'json',
		// 				target:".warningmessage",
		// 				success:function(data){
		// 					
		// 					if(data=="ERROR") alert('error');
		// 					// take the returned JSON and load it into TILE
		// 					TILE.engine.parseJSON(data);
		// 					// hide dialog
		// 					$("#LTlight").hide();
		// 					$("#LTfade").hide();
		// 				},
		// 				statusCode:{
		// 					500:function(){
		// 						// attach warning message to the warning area of the dialog
		// 						$(".body > .option > .warningmessage").empty().append("Error with loading document. Check to make sure you have the correct path/filetype.");
		// 					}
		// 				}
		// 			});
		// 			return false;
		// 		});
		
		
		// $("#loadFromFile").fileUploadUI({
		// 			url:self.importScript,
		// 			requestHeaders:[{name:'Accept',value:'application/json,text/javascript'}],
		// 			onLoad:function(e,file,ind,xhr,handler){
		// 				// onload function for when upload is finished
		// 				var str=xhr.responseText;
		// 				if(__v) console.log('str loaded into import iframe: '+str);
		// 				TILE.engine.parseJSON(JSON.parse(xhr.responseText));
		// 				$("#LTlight").hide();
		// 				$("#LTfade").hide();
		// 			},
		// 			beforeSend:function(e,file,ind,xhr,handler,callback){
		// 				
		// 				// going to stop program from automatically submitting on zone drop
		// 				$("#loadFile").click(function(e){
		// 					callback();
		// 					return false;
		// 				});
		// 			}
		// 		});
		
		$("body").bind("openNewImage",{obj:this},this.close);
		$("body").bind("openImport",{obj:this},this.close);
		$("body").bind("openExport",{obj:this},this.close);
		$("body").bind("openLoadTags",{obj:this},this.display);
		$("body").bind("closeLoadTags",{obj:this},this.close);
	};
	LoadDialog.prototype={
		// takes and html string and appends to 
		// the select element
		addFormats:function(str){
			var self=this;
		
			$("#fileFormatFileURL").append(str);
			$("#fileFormatFileLocal").append(str);
		},
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
		// takes a string representing a file format and converts it 
		// into the conventional PHP script name
		convertFormatToFilename:function(str,file){
			
			return str;
			
		},
		submitFileHandle:function(e){
			e.preventDefault();
			var self=e.data.obj;
			// figure out which file format to use
			var ff=$("#fileFormatFileURL > option:selected").val();
			var fname=$("#fileFormatFileURL > option:selected").text();
			var file=$("#filepathDisplay").val();
			
			// handle the submit call to PHP
			$.ajax({
				// TODO: CHANGE THIS TO DYNAMIC SETTINGS
				url:'plugins/CoreData/importDataScript.php',
				cache:false,
				data:({filepath:file,format:fname}),
				type:'POST',
				dataType:'json',
				success:function(data){			
					// take results and feed into engine
					TILE.engine.parseJSON(data);
					self.light.hide();
					self.DOM.hide();
					self.fade.hide();
				}
			});
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
			var html='<div class="menuitem"><a id="save_data" href="" class="button" title="Save the current session">Save</a></div>'+
			'<div class="menuitem"><a id="load_data" href="" class="button" title="Load from a File or URL">Load</a></div>';
			// +'<div id="ddown"><div class="menuitem ddown"><p>Tools:</p><select class="menu_body"></select></div>';
			// $("#"+self.loc).append(html);
			
			self.modeList=[];
			
			// attach save button to azglobalmenu
			$("#azglobalmenu > .globalbuttons > .dataitems").append(html);
			self.SaveB=$("#save_data");
			self.saveDialog=null;
			
			// HANDLES SAVING JSON DATA
			self.SaveB.click(function(e){
				e.preventDefault();
				// hide the metadata box
				$(".ui-dialog").hide();
				// create new dialog if not ready
				if(!self.saveDialog){
					self.saveDialog=new SaveDialog();
					self.saveDialog.addFormats(TILE.formats);
				}
				$("#savedialogwhitespace").show();
				$("#darkForSaveDialog").show();
				
				// $(".ui-dialog").hide();
				// 				if(!TILE.engine) return;
				// 				// get JSON data
				// 				var json=TILE.engine.getJSON();
				// 				// insert text version of data into 
				// 				// upload form text box
				// 				$("#uploadData").val(JSON.stringify(json));
				// 				// fire upload form
				// 				$("#inv_SaveProgress_Form")[0].submit();
				// 				// erase data
				// 				$("#uploadData").val('');
			});
			
			// load dialog
			self.LoadB=$("#load_data");
			self.loadDialog=null;
			
			self.LoadB.click(function(e){
				e.preventDefault();
				// hide the metadata box
				$(".ui-dialog").hide();
				// create new dialog if not ready
				if(!self.loadDialog){
					self.loadDialog=new LoadDialog({loc:$("body")});
					
					self.loadDialog.addFormats(self.formatstr);
				}
				
				self.loadDialog.light.show();
				self.loadDialog.DOM.show();
				self.loadDialog.fade.show();
				
			});
			
			// listen for when mode buttons become unactive
			$("body").bind("bModeUnactive",function(e,id){
				
				if(!self.modeList[0]) return;
				// set back to default
				$("#"+self.modeList[0]).addClass("active");
			});
			
			// add to the file formats select element
			self.formatstr='<option id="json" value="json">JSON</option>';
			
			
			
		};
		
	TileToolBar.prototype={
		// Add file formats to the Load and Save
		// drop-downs
		addFormats:function(str){
			var self=this;
			
			self.formatstr+=str;
			// add to Dialogs
			if(self.loadDialog) self.loadDialog.addFormats(str);
			if(self.saveDialog) self.saveDialog.addFormats(str);
			
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
		},
		// passed object with elements for button
		// button: {Object}
		// 
		addButton:function(button){
			var self=this;
			if(!button) return null;
			var obj=null;
			// collect current ids from toolbar
			var ids=[];
			
			$("#tile_toolbar > .menuitem > ul > li > a").each(function(i,el){
				if($(el).attr('id')){
					ids.push($(el).attr('id'));
				}
			});
			$("#azglobalmenu > div").each(function(i,el){
				if($(el).attr('id')){
					ids.push($(el).attr('id'));
				}
			});
			var str="A B V N M A L K J I Q I U I O P U Z K J L K A K J";
			var strArgs=str.split(' ');
			var n=Math.floor(Math.random()*(strArgs.length-1));
			var newId=strArgs[n]+Math.floor(Math.random()*600);
			while($.inArray(newId,ids)>=0){
				n=Math.floor(Math.random()*(strArgs.length-1));
				newId=strArgs[n]+Math.floor(Math.random()*600);
			}
			
			
			// if button already exists, don't attach
			// if($("#"+button.id).length) return;
			// if has a display, set to class button,
			// no display, btnIconLarge
			var stil=(button.display)?"button":"btnIconLarge";
			var disp=(button.display)?button.display:button.helptext;
			
			var jObj=null;
			// place in correct area
			switch(button.type.toLowerCase()){
				case 'global':
					var html='<div class="menuitem"><a id="'+newId+'" href="" class="'+stil+'" title="'+button.helptext+'">'+disp+'</a></div>';
					// insert next to the logo
					if(button.category){
						// break it down by category
						switch(button.category.toLowerCase()){
							case 'mode':
								// add id to modelist
								self.modeList.push(newId);
								
								$("#azglobalmenu > .globalbuttons > .modeitems").prepend(html);
								
								// set up button object
								// give the element makeActive and unActive functions
								jObj={elem:$("#"+newId),
								makeActive:function(){
									if($("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a#"+newId).length==0) return;
									$("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a").removeClass('active');
									$("#"+newId).addClass('active');
									$("body:first").trigger("bModeActive",[newId]);
								},
								// sets the button class as unactive
								// also notifies toolbar that button is unactive
								unActive:function(){
									if($("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a#"+newId).length==0) return;
									$("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a").removeClass('active');
									// $("#"+newId).addClass('active');
									$("body:first").trigger("bModeUnactive",[newId]);
								}};
								
								// if no other mode items present, make this one the default active mode
								if(!$("#azglobalmenu > .globalbuttons > .modeitems > div > a").hasClass("active")){
									$("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a#"+newId).addClass("active");
								}
								
								break;
							case 'data':
								$("#azglobalmenu > .globalbuttons > .dataitems").append(html);
								// set up button object
								jObj={elem:$("#"+newId)};
								
								break;
							case 'misc':
								$("#azglobalmenu > .globalbuttons > .misc").append(html);
								// set up button object
								jObj={elem:$("#"+newId)};
								break;
							default: 
								// no definition - put in misc category
								$("#azglobalmenu > .globalbuttons > .misc").append(html);
								// set up button object
								jObj={elem:$("#"+newId)};
								
								break;
						}
					
					}
					
					break;
				case 'mode':
					var html='<div class="menuitem"><ul><li><a id="'+newId+'" href="" class="'+stil+'" title="'+button.helptext+'">'+disp+'</a></li></ul></div>';
					// inserted inside the toolbar of a plugin
					$("#tile_toolbar").append(html);
					// set up button object
					jObj={elem:$("#"+newId)};
					break;
				default:
					var html='<div class="menuitem"><a id="'+newId+'" href="" class="'+stil+'" title="'+button.helptext+'">'+disp+'</a></div>';
					// insert next to the logo
					$("#azglobalmenu > .globalbuttons").append(html);
					// set up button object
					jObj={elem:$("#"+newId)};
					break;
			}
			
			
			if(self.modeList[0]){
				$("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > ul > li > a").removeClass('active');
				$("#"+self.modeList[0]).addClass('active');
			}
			
			return jObj;
			
		}
	};
})(jQuery);