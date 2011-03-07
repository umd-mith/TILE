// Dashboard Plugin
// author: Grant Dickie

// Makes use of Googles OpenSocial scheme for adding widgets
// Displays global information about the user's current TILE session

var Dashboard={
	start:function(engine){
		var self=this;
		
		// holder for other mode data
		self.modeData={};
		
		// create html
		self.html='<div class="dash_header"><a id="backToViews">Home</a></div><div id="dashboard_body" class="body">'+
		'<div class="dashboard_main"><div id="startPageDashboard" class="dashboard_list"><h3><a id="seeJSON">JSON View</a>'+
		'</h3><br/><p>View the Core Data as a list.</p></div><div id="jsonView"></div></div><div class="dashboard_sidebar">'+
		'<h3>Modes:</h3><div id="modeChoose"></div><div id="labels"><h3><a id="seelabels">See Labels</a></h3></div><div id="shapes"><h3><a id="seeshapes">See Shapes</a></h3></div></div></div>';
		// main page that users begin with
		self.startHTML='';
		
		
		
		// create mode with a callback
		var onActive=function(e){
			$("#jsonView").empty();
			$("#startPageDashboard").show();
		
		};
		
		engine.insertMode('Dashboard',onActive);
	
		// create new mode for opensocial
		engine.insertModeHTML(self.html,'contentarea','Dashboard');
		
		
		// attempt to load current modes
		$(".globalbuttons > .modeitems > .menuitem > a").each(function(i,o){
			if($(o).text()!='Dashboard'){
				$("#modeChoose").append('<a id="mode'+$(o).attr('id')+'" class="goToMode">'+$(o).text()+'</a><br/>');
				$("#mode"+$(o).attr('id')).bind('click',function(e){
					e.preventDefault();
					// activate the mode's button
					$(o).trigger('click');
				});
			}
		});
		
		
		// set up global listeners
		$("body").live("dataAdded newJSON",{obj:self},self.dataChangedHandle);
		// HOOK FOR OTHER PLUGINS TO DISPLAY DATA
		// $("body").live("displayOnDashboard",{obj:self},self.displayOnDashboardHandle);
		// listener for mode
		$("a.dashModeItem").live("click",function(e){
			e.preventDefault();
			if(self.modeData[$(this).attr('id')]){
				self.displayMode(self.modeData[$(this).attr('id')]);
			}
		});
		
		
		
		
		// set up listener for the JSON view module
		$("a#seeJSON").live('click',function(e){
			e.preventDefault();
			// hide the startPage
			$("#startPageDashboard").hide();
			self.displayOverview();
		
		});
		
		$("a#seelabels").live('click',function(e){
			e.preventDefault();
			$("#startPageDashboard").hide();
			self.displayLabels();
		});
		
		$("a#seeshapes").live('click',function(e){
			e.preventDefault();
			$("#startPageDashboard").hide();
			self.displayShapes();
		});
		
		// listener for header button
		$("a#backToViews").live('click',function(e){
			e.preventDefault();
			$("#jsonView").empty();
			$("#startPageDashboard").show();
		});
		
		// set up listener for displayItems
		$(".listItem > a.displayItem").live('click',function(e){
			e.preventDefault();
			var data=$(this).attr('id').split('|');
			
			var type=data[0];
			var id=data[1];
			if(__v) console.log('clicked  '+type+' '+id);
			switch(type){
				case 'page':
					self.getPage(id);
					break;
				default:
					if(data[2]!=null){
						// data[2] is the third optional parameter - a URL
						// on a page - get item from a page
						self.displayPageItem(type,id,data[2]);
						
					} else if(self.data[type]) {
						self.displayItems(type);
					} else {
						
					}
					break;
			}
			
			
		});
		
	
		
	},
	displayLabels:function(){
		var self=this;
		var html='<div id="labelmodule" class="dashboard_table"><h3>Current Labels:</h3></div>';
	
		if($(".dashboard_main > #labelmodule").length){
			$("#labelmodule").remove();
		}
		$(".dashboard_main").append(html);
		
		if(!self.data.labels) return html;
		for(var o in self.data.labels){
			if(!self.data.labels[o]||!self.data.labels[o].id) continue;
			$('<div class="item" style="padding-left:15px;"><a id="'+self.data.labels[o].id+'" class="label">'+self.data.labels[o].name+'</a></div>').insertAfter("#labelmodule > h3");
			
		}
		
		$("#labelmodule > .item > .label").click(function(e){
			e.preventDefault();
			if($("#labelmodule > .item > #"+$(this).attr('id')+' > #'+$(this).attr('id')).length){
				// remove item 
				$("#labelmodule > .item > #"+$(this).attr('id')+' > #'+$(this).attr('id')).remove();
			} else {
				self.displayLabel($(this).attr('id'));
			}
		});
	},
	displayLabel:function(id){
		var self=this;
		var label=null;
		if(!self.data.labels) return;
		for(var o in self.data.labels){
			if(self.data.labels[o]&&(self.data.labels[o].id==id)){
				label=self.data.labels[o];
				break;
			}
		}
		
		// display as HTML
		var html='<div id="'+label.id+'" class="label" style="padding-left:30px;"><h4>Label '+label.name+'</h4><p>ID '+label.id+'</p></div>';
		$(html).insertAfter("#labelmodule > .item > #"+label.id);
		for(var a in label){
			if($.isArray(label[a])){
				var h='<div class="list"><p>Linked with: '+a.toUpperCase()+':</p>';
				for(var prop in label[a]){
					h+='<div class="'+a+'">'+label[a]+'</div>';
				}
				h+='</div>';
				$(h).insertAfter('#labelmodule > .item > #'+label.id+' > #'+label.id+' > p');
			}
		}
	},
	displayShapes:function(){
		var self=this;
		var html='<div id="shapesmodule" class="shapes_module"><h3>Current Shapes:</h3></div>';
		$('.dashboard_main').append(html);
		
		for(var p in self.data.pages){
			if(self.data.pages[p].shapes){
				for(var sh in self.data.pages[p].shapes)
			}
		}
		return html;
	},
	displayShape:function(){
		
	},
	// give an object to display
	// all of its links in an 
	// UL 
	displayLinks:function(){
		
	},
	dataChangedHandle:function(e,o){
		var self=e.data.obj;
		
		// get full JSON data
		self.data=o.engine.getJSON();
		
	},
	displayOnDashboardHandle:function(e,o){
		// receive data from other plugins
		var self=e.data.obj;
		if(!o.mode) return;
		
		// o must have a mode 
		
		self.modeData[o.mode]=o;
			if(__v) console.log('o: '+JSON.stringify(o));
	
		// add to the modules section of the start page
		// or replace current html
		if($("#dashboard_body > .dashboard_sidebar > #"+o.mode).length){
			$("#dashboard_body > .dashboard_sidebar > #"+o.mode).empty().append(o.html);
		} else {
			// create new module section
			var section='<div id="'+o.mode+'">'+o.html+'</div>';
			$("#dashboard_body > .dashboard_sidebar").append(section);
		}
		
		
		
	},
	// create initial view that Dashboard has
	displayOverview:function(){
		var self=this;
		var html='<div class="dashboard_table"><h3>Pages</h3>';
		
		var itemCount=[];
		// go through data and show all page urls
		for(var prop in self.data.pages){
			html+='<div class="listItem"><a id="page|'+self.data.pages[prop].url+'" class="displayItem">'+self.data.pages[prop].url+'</a></div>';
			
			for(var item in self.data.pages[prop]){
				if(!(/info|url|id/.test(item))){
					if(!itemCount[item]) itemCount[item]=0;
					for(var x in self.data.pages[prop][item]){
						itemCount[item]++;
					}
				}
			}
			
		}
		
		// closing dashboard_table
		html+='</div>';
		$("#jsonView").empty().append(html);
		
		// attach counts of items
		for(var item in itemCount){
			$("#jsonView").append('<div class="dashboard_footer"><p><a id="'+item+'">'+item+' ('+itemCount[item]+')</a></p></div>');
			$(".dashboard_footer > p > #"+item).bind('click',function(e){
				e.preventDefault();
				if(__v) console.log('clicked on '+item);
				self.displayItems(item);
			});
		}
		
		
		
		
	},
	displayMode:function(mode){
		var self=this;
		
		var shell='<div class="dashboard_table"><h3>'+mode.mode+'</h3>'+mode.html+'</div>';
		$("#jsonView").empty().append(shell);
	},
	displayItems:function(type){
		var self=this;
		var html='<div class="dashboard_table"><h3>'+type+'</h3>';
		if(self.data[type]){
			for(var prop in self.data[type]){
				if(!self.data[type][prop]) continue;
				var text=page[type][prop].id;
				var itemHtml='<div id="listItem"><a id="'+type+'|'+page[type][prop].id+'" class="displayItem">'+text+'</a></div>';
				html+=itemHTML;
			}
			
			
		} else {
			if(__v) console.log('displaying item '+type);
			// go through pages
			for(var p in self.data.pages){
				var page=self.data.pages[p];
				if(!page[type]) continue;
				for(var prop in page[type]){
					if(!page[type][prop].id) continue;
					var text="";
					for(var t in page[type][prop]){
						if((!(/id|info|url/.test(t)))&&(!($.isArray(page[type][prop][t])))){
							// string item - display as text
							text+=page[type][prop][t]+' ';
						}
					}
					
					var itemHtml='<div id="listItem"><a id="'+type+'|'+page[type][prop].id+'|'+page.url+'" class="displayItem">'+text+'</a></div>';
					html+=itemHtml;
				}
			}
			
			
		}
		html+='</div>';
		$("#jsonView").empty().append(html);
	},
	// returns html displaying the given item in
	// page with matching url
	displayPageItem:function(id,type,url){
		var self=this;
		var page=null;
		// find the page
		for(var p in self.data.pages){
			if(self.data.pages[p].url==url){
				page=self.data.pages[p];
				break;
			}
		}
		
		// if no page, stop
		if(!page) return;
		
		// find the id in array type
		if(!page[type]) return;
		var html='<div class="dashboard_table">';
		
		
		for(var item in page[type]){
			
			if(page[type][item].id==id){
				html+='<h3>'+type+' '+page[type][item].id+'</h3><p>';
				for(var x in page[type][item]){
					if((!(/id|type|info/.test(x)))&&(!($.isArray(page[type][item][x])))){
						html+=page[type][item][x]+', ';
					}
				}
				html+='</p>';
				// go through arrays of other items
				for(var y in page[type][item]){
					if($.isArray(page[type][item][y])){
						html+='<div class="dashboard_list"><p>'+y+'</p>';
						for(var a in page[type][item][y]){
							html+='<div class="listItem"><a id="'+type+'|'+page[type][item][y].id+'|'+url+'" class="displayItem">'+JSON.stringify(page[type][item][y])+'</a></div>';
						}
					}
				}
				
				
			}
		}
		$("#jsonView").empty().append(html);
	},
	getPage:function(url){
		var self=this;
		var page=null;
		// find the page
		for(var page in self.data.pages){
			if(self.data.pages[page].url==url){
				page=self.data.pages[page];
				break;
			}
		}
		if(!page) return;
	
		
		if(__v) console.log('found page '+page.url);
		var pageHTML=self.displayPage(page);
		$("#jsonView").empty().append(pageHTML);
		
		
	},
	// go page by page and display each page's dataset
	displayPage:function(data){
		var self=this;
		var html='<div class="dashboard_table"><h3><a id="getOverview">See all Pages</a></h3><h3>Page</h3><p>';
		// display info on page
		html+=data.url+'</p><p>'+JSON.stringify(data.info)+'</p>';
		
		// sort pages array
		for(var prop in data){
			if((!(/url|info/.test(prop)))&&($.isArray(data[prop]))){
				html+='<div class="dashboard_list">';
				for(var item in data[prop]){
					var itemHTML=self.displayItem(prop,data[prop][item],data.url);
					html+=itemHTML;
				}
				html+='</div>';
			}
		}
		html+="</div>";
		// append to body
		return html;
	},
	displayItem:function(type,obj,url){
		var self=this;
		if(url){
			var html='<div class="listItem"><a class="displayItem" id="'+type+'|'+obj.id+'|'+url+'">';
		} else {
			var html='<div class="listItem"><a class="displayItem" id="'+type+'|'+obj.id+'">';
		}
		
		for(var prop in obj){
			if(!($.isArray(obj[prop]))){
				html+=obj[prop]+' ';
			}
		}
		html+="</a></div>";
		return html;
		
	}
};


