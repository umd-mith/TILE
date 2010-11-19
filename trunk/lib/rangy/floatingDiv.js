(function($){
	rootNS = this;
	
	FloatingDiv = function(){
		var self = this;
		this._color = "#FDFF00";
		this._labels = [];
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
			
			var htmlString;
			
			htmlString = '<fieldset class="label_formFieldSet">' +
			'<ol class="label_formOL">' +
			'<li class="label_formLI cloneMe" id="formField1">' +
				'<span class="label_formLabel">Label:</span>' +
				'<input id="formLabel1" name="Label1" type="text" class="tagComplete" />' +
				' &nbsp; <img src="icons/add.png" title="Add up to 5 Labels" name="Add up to 5 Labels" id="btnAddLabel">' +
				'<img style="margin-left: 1px; visibility: hidden;" src="icons/delete.png" title="Delete last label" name="Delete last label" id="btnDeleteLabel">' +
				'&nbsp; <span style="font-size: 0.7em;" class="addRemove">(Add/Delete Labels)</span><br />' +
			'</li>' +
			'</ol>' +
			'<input type="submit" class="submit" value="Apply" id="submitFloatingDiv">' +
			'<input name="hlID" type="hidden" id="TILEid" value="" />'+		
			'<input name="hlHEX" type="hidden" id="TILEcolor" value="" />' +			
			'</fieldset>' +
			'<br />';
				


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
				
			this.addAutoComplete('li#formField1 input.tagComplete', labels);				
				
		},
		
		
		createDialog:function(myID) {
		
			// get id from object
			var elem = '#'+myID+'_floatingDiv';
			
			//create dialog from passed element with passed title
			$(elem).dialog({
				autoOpen: true,
				bgiframe: true,
				resizable: false,
				title: 'TILE Dialog',
				position: 'top',
				persist: false,
				width: 350,
				closeOnEscape: true,
				close: function(event, ui) { 
					$(elem).dialog('destroy');
					$(elem).empty().remove();
					return null;
				} 				
			});	
		},	
		

		addAutoComplete: function(elem, labels) {
		
			$(elem).autocomplete({
				 source: labels
			});
						
			return false;	
		},
		
		
		addColorSelector: function(myID, o) {
			var self = this;
			var htmlString;
			
			htmlString = '<span class="floatingColorPicker">Highlight Color: &nbsp; <div id="floatingPenColor"><div style="background-color: #FDFF00;"></div></div></span>';
		
			$('<div></div>')
				.attr({ 
					'id':myID+'_colorSelect', 
					'name':'TILE Color Selector', 
					'class':'addColor'
				})
				.html(htmlString)
				.appendTo('#'+myID+'_floatingDiv'+' fieldset');
			
	
			var currColor = $('span.'+o.id).css('background-color');
			currColor = this._rgb2hex(currColor);
			
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
						$('span.'+o.id).css('background-color', '#'+hex);
						$('#floatingPenColor div').css('backgroundColor', '#' + hex);
						self.addColorToForm(hex);	
					}
				});			
		
			
		},
		
		addColorToForm:function(hexcolor){
			// add the new selected color to hidden form field
			$('input#TILEcolor').val('#'+hexcolor);
			return true;

		},
		
		addIDToForm:function(o){
			// From now on, highlight in Color
			$('input#TILEid').val(o.id);
			return true;
		},
		
		addLabelsToObject:function(o) {
			var self = this;
			// loop through form field vals and assign to _labels obj
				
			$('li.cloneMe').each(function(i) {
				var n = i+1;
				alert(n + ': ' + $('input#formLabel'+n).val());
				self._labels[i] = $('input#formLabel'+n).val();
			});
			
			o.labels = self._labels;
			
			return o;	
		}
		
	});
	
	rootNS.FloatingDiv = FloatingDiv;
})(jQuery);


// Floating Div Plugin Code
// Functions:
// start()
// restart()
// bundleData()
// close()
// Variables:
// _close
// json

/*
var FD={
	id:"FD1000",
	outputCall:"fdOutputCall101",
	activeCall:"sprTSActivate**",
	start:function(e,json,layout){
		var self=this;
		self.textsel=new FloatingDiv();
		self.manifest=[];
		self.activeSel="";
		self.curLink=null;
		if(json){
			for(j in json){
				self.manifest[j]=[];
				if(json[j].selections) self.manifest[j]=json[j].selections;
			}
		}
		
		// set up the tool buttons and insert into 
		// TILE interface
		// append html
		$("<div class=\"menuitem\"><ul><li><input type=\"button\" value=\"Highlight\" id=\"getHLite\" class=\"button\"/></li></ul></div>").appendTo($("#transcript_toolbar"));
		// getText button
		self.getHLite=$("#getHLite").bind('click',function(e){
			e.stopPropagation();
			// make active and stop all listeners of other objects
			$("body:first").trigger(self.activeCall,[self.id]);
			$(document).mouseup(function(e){
				$(document).unbind("mouseup");
				var url=$("#srcImageForCanvas").attr('src');
				// de-select all transcript lines
				$(".line_selected").removeClass("line_selected");
				// clear all other highlights - will come back if they are saved
				// into the manifest
				$("span[class^=anno]").each(function(){
					$(this).children(".button").remove();
					$(this).children("div").remove();
				});

				self.textsel.clearSelections();

				var sel=self.textsel.getSelectedText();
				if(sel==null) return;
				// make sure it's not highlighting the whole page
				if(!(/div\#TILE\_Transcript\_/.test(sel.StartParent))){
					return;
				}

				// show on screen
				self.textsel.addSelection(sel);
				if(!self.manifest[url]) self.manifest[url]=[];
				self.manifest[url].push(sel);
				// find span tag and attach buttons
				self.attachButtons(sel.id);

				// make active
					self.activeSel=sel.id;
				// attach any current divs for references
				self._attachLinkDiv(self.curLink);
				$("body:first").trigger(self.outputCall,[{id:sel.id,type:"selections",attachHandle:"."+sel.id+":eq("+($("."+sel.id).length-1)+")",tool:self.id}]);

				$("body > .colorpicker").css({"z-index":"9999"});
				
			});
			
		});
	
		// bind addLink
		// $("body").bind("addLink",{obj:self},self.addLinkHandle);
		// global bind for when a user clicks on object that loads items
		$("body").bind("loadItems",{obj:self},self._loadItemsHandle);
	},
	attachButtons:function(id){
		var self=this;
		
		// $("span[class^=anno]").each(function(i,o){
		// 			var id=$(o).attr('class');
			// find span tag and attach buttons
		if($("span."+id).length>1){
			$("<span id=\"select_"+id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id+":eq("+($("span."+id).length-1)+")"));
		} else {
			$("<span id=\"select_"+id+"\" class=\"button\">Select</span><span id=\"deleteHLite"+id+"\" class=\"button\">Delete</span>").appendTo($("span."+id));
		}
		
		
		
		// selector
		$("#select_"+id).click(function(e){
			e.stopImmediatePropagation();
			$(".line_selected").removeClass("line_selected");
			$("span[title='highlight']").removeClass("active");
			$("span."+id).addClass("active");
			self.activeSel=id;
		});
		$("#deleteHLite"+id).click(function(e){
			$(this).parent().removeClass("active");
			var id=$(this).parent().attr('class');
			var url=$("#srcImageForCanvas").attr('src');
			for(sh in self.manifest[url]){
				if(self.manifest[url][sh].id==id){
					self.manifest[url][sh];
					self.manifest[url][sh]=null;
					if(self.manifest[url].length>1){
						var ac=self.manifest[url].slice(0,sh);
						var bc=self.manifest[url].slice((sh+1));
						self.manifest[url]=ac.concat(bc);
					} else {
						self.manifest[url].length=0;
					}
					break;
				}
			}
			$("span."+id+" > div").remove();
			$("span."+id+" > .button").remove();
			self.textsel.removeHighlightMarkers();
			$("body:first").trigger(self.deleteCall,[{id:id,type:"selections",tool:self.id}]);
			// self.textsel.importSelections(self.manifest[url]);

		});
	
		// attach any current divs for references
		self._attachLinkDiv(self.curLink);
		$("body > .colorpicker").css({"z-index":"9999"});
	},
	// e : {Event}
	// ref : {Object} reference object that has two properties:
	//      id: {String} id of  reference
	//      type: {String} type of reference
	addLinkHandle:function(e,ref){
		if((ref.type=='lines')||(ref.type=='selections')) return;
		var self=e.data.obj;
		var url=$("#srcImageForCanvas").attr('src');
		if(!self.manifest[url]) self.manifest[url]=[];
		// put in manifest
		for(m in self.manifest[url]){
			if(self.manifest[url][m].id==self.activeSel){
				if(self.manifest[url][m][ref.type]){
					if($.inArray(ref.id,self.manifest[url][m][ref.type])<0){
						self.curLink=ref;
						// add to array
						self.manifest[url][m][ref.type].push(ref.id);
						self._attachLinkDiv(ref);
						$("body:first").trigger("addLink",[{id:self.manifest[url][m].id,type:'selections'}]);
						
					}
				} else {
					self.curLink=ref;
					self.manifest[url][m][ref.type]=[ref.id];
					self._attachLinkDiv(ref);
					$("body:first").trigger("addLink",[{id:self.manifest[url][m].id,type:'selections'}]);
				}
				
				break;
			}
		}
	},
	// attaches a span tag that displays reference
	_attachLinkDiv:function(ref){
		if((!ref)||(ref=="")) return;
		var self=this;
		var t=ref.type;
		// generate DOM buttons to add onto the highlight
		$("<span class=\"button\">"+ref.type+": "+ref.id+"<span id=\"del"+self.activeSel+ref.id+"\" class=\"button\">X</span></span>").appendTo($("span."+self.activeSel));
		$("#del"+self.activeSel+ref.id).click(function(e){
			e.stopImmediatePropagation();
			var url=$("#srcImageForCanvas").attr('src');
			var n=$.inArray(ref.id,self.manifest[url][t]);
			if(n<0) return;
			if(self.manifest[url][t].length>1){
				var ac=self.manifest[url][t].slice(0,n);
				var bc=self.manifest[url][t].slice((n+1));
				self.manifest[url][t]=ac.concat(bc);
			} else {
				self.manifest[url][t]=[];
			}
			if(self.curLink.id==ref.id) self.curLink=null;
			$(this).parent().remove();
			$(".line_selected").removeClass("line_selected");
			return;
		});
	},
	// e : {event}
	// data : {Object}
	_loadItemsHandle:function(e,data){
		var self=e.data.obj;
		$("span[class^='anno']").each(function(e){
			$(this).children(".button").remove();
			$(this).children("div").remove();
		});
		self.textsel.removeHighlightMarkers();
		
		if(!data||(data.length==0)) return;
		var url=$("#srcImageForCanvas").attr('src');
		var vd=[];
		for(x in self.manifest[url]){
			// if(__v) console.log("self.manifest[url]["+x+"]="+self.manifest[url][x].id);
			if($.inArray(self.manifest[url][x].id,data)>=0){
				vd.push(self.manifest[url][x]);
			}
		}
		if(vd.length==0) return;
		// if(__v) console.log("loading highlights from: "+vd);
		self.textsel.importSelections(vd);
		// attach buttons
		for(var v in vd){
			self.attachButtons(vd[v].id);
		}
		
	},
	unActive:function(){
		var self=this;
		$("span[class^='anno']").each(function(i,o){
			$(o).children("div").remove();
			$(o).children("span").remove();
			$(o).remove();
		});
	},
	restart:function(){
		
	},
	close:function(){
		var self=this;
		$("body:first").trigger(self._close);
	},
	// Insert the highlight data into the global json object
	// json: {Object} Global JSON object that has page URL's as key
	bundleData:function(json){
		var self=this;
		for(url in self.manifest){
			for(j in json){
				if(j==url){
					json[j].selections=self.manifest[url];
				}
			}
		}
		return json;
	},
	_close:"CloseSelector",
	json:null
};
*/
