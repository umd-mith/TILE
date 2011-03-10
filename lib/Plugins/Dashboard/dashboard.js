// Dashboard Plugin
// author: Grant Dickie

// Makes use of Googles OpenSocial scheme for adding widgets
// Displays global information about the user's current TILE session

var Dashboard={
	start:function(engine){
		var self=this;
		
		// holder for other mode data
		self.modeData={};
		// copy of the core data
		self.data=engine.getJSON();
		
		// create html
		self.html='<div id="dashboard_body" class="body">'+
		'<div class="dashboard_main">'+
		'</div></div>';
		// '<div class="dashboard_sidebar">'+
		// '<h3>Modes:</h3><div id="modeChoose"></div><div class="dash_header"><a id="backToViews">Home</a></div><div id="labels"><h3><a id="seelabels">See Labels</a></h3></div><div id="shapes"><h3><a id="seeshapes">See Shapes</a></h3></div></div>';
		// main page that users begin with
		self.startHTML='';
		
		
		
		// create mode with a callback
		var onActive=function(e){
			$(".dashboard_main").empty();
			self.createPagesTable();
			self.createLinesTable();
			self.createLinkCount();
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
		
		
		// set up close handler
		$(".dashboard_table > a#close").live('click',function(e){
			e.preventDefault();
			
			$(this).parent().remove();
		});
		
		
		
		$("a#seelabels").live('click',function(e){
			e.preventDefault();
			$(".dashboard_main").empty();
			self.displayLabels();
		});
		
		$("a#seeshapes").live('click',function(e){
			e.preventDefault();
			$(".dashboard_main").empty();
			self.displayShapes();
		});
		
		// listener for header button
		$("a#backToViews").live('click',function(e){
			e.preventDefault();
			var h=self.createPagesTable();
			$(".dashboard_main").empty().append(h);	
			h=self.createGlobalItemsHTML();
			$(".dashboard_main").append(h);
		});
		
		// conditionals for clicking on pages
		$("td > #pages > a").live('click',function(e){
			e.preventDefault();
			self.createPageHTML(parseInt($(this).attr('id'),10));
			
		});
		
		// conditional for clicking on item in a pagelist
		$(".page > .itemlist > .item > a").live('click',function(e){
			e.preventDefault();
			var id=$(this).attr('id');
			var type=$(this).parent().parent().attr('id');
			var h=self.createItemHTML(id,type);
			if(__v) console.log(id+", "+type);
			$(".dashboard_main").empty().append(h);
		});
		
		// empty HTML
		$(".dashboard_main").empty();
		// init HTML
		self.createPagesTable();
		self.createLinkCount();
		self.createLinesTable();
		// h=self.createGlobalItemsHTML();
		// 		$(".dashboard_main").append(h);	
		
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
			$('<div class="item" style="padding-left:15px;"><a id="'+self.data.labels[o].id+'" class="labels">'+self.data.labels[o].name+'</a></div>').insertAfter("#labelmodule > h3");
			
		}
		
		$("#labelmodule > .item > .labels").click(function(e){
			e.preventDefault();
		
		
			if($("div#"+$(this).attr('id')).length>0){
				// remove item 
				$('div#'+$(this).attr('id')).remove();
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
		var html='<div id="'+label.id+'" class="labels" style="padding-left:30px;"><h4>Label '+label.name+'</h4><p>ID '+label.id+'</p></div>';
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
		$("#shapesmodule").remove();
		var html='<div id="shapesmodule" class="shapes_module"><a id="close">X</a><h3>Current Shapes:</h3></div>';
		$('.dashboard_main').append(html);
		
		for(var p in self.data.pages){
			// append page data
		
			if(self.data.pages[p].shapes){
				$("#shapesmodule").append('<div id="'+p+'" class="page">'+self.data.pages[p].url+'</div>');
				for(var sh in self.data.pages[p].shapes){
					
					$("#"+p).append($('<div class="shape" style="padding-left:15px;"><a id="'+self.data.pages[p].shapes[sh].id+'">'+self.data.pages[p].shapes[sh].id+'</a></div>'));
				}
			}
		}
		
		$("#shapesmodule > .page > .shape > a").bind('click',function(e){
			e.preventDefault();
			if(__v) console.log($(this).attr('id')+" clicked");
			if($("a > #"+$(this).attr('id')).length){
				$("a > #"+$(this).attr('id')).remove();
			} else {
				// show the shape
				var id=$(this).attr("id");
				var pageurl=$(this).parent().parent(".page").attr('id');
				if(__v) console.log("sending to displayShape: "+id+' '+pageurl);
				self.displayShape(id,pageurl);
			}
		});
		
	
		
	},
	displayShape:function(id,p){
		var self=this;
		
		// find page, then the shape
		var shape=null;
		
		if(self.data.pages[p]){
			// found page
		
			for(var s in self.data.pages[p].shapes){
				if(self.data.pages[p].shapes[s].id==id){
					if(__v) console.log('shape found: '+self.data.pages[p].shapes[s]);
					shape=self.data.pages[p].shapes[s];
					break;
				}
			}
		} else {
			return;
		}
	
		if(!shape) return;
		// create html and append
		var html='<div id="'+shape.id+'" class="shapes" style="padding-left:15px;"><p>Shape '+shape.type+'</p><p>ID '+shape.id+'</p><p>Position Data '+JSON.stringify(shape.posInfo)+'</p>';
		// find links
		for(var x in shape){
			if((!(/posInfo/i.test(x)))&&($.isArray(shape[x]))){
				html+='<div style="padding-left:30px;" class="'+x+'"><h4>Linked with '+x.toUpperCase()+': </h4>';
				for(var prop in shape[x]){
					
					html+='<div class="'+x+'"><a id="'+shape[x][prop]+'">'+shape[x][prop]+'</a></div>';
				}
				html+='</div>';
			}
		}
		html+='</div>';
		$(html).insertAfter("#shapesmodule > .page > .shape > a#"+id);
		
	},
	// display the total # of links
	// made in the core data
	createLinkCount:function(){
		var self=this;
		// LINK: image-text, image-object
		var linktotal=0;
		// links between text-objects
		var textlinks=0;
		// links between labels-text
		var textlabels=0;
		// links between shapes and lines
		var textshapes=0;
		// go through the core data and count distinct links
		for(var o in self.data.pages){
			if(!self.data.pages[o]) continue;
			for(var prop in self.data.pages[o]){
				if((!(/id|info|url/.test(prop)))&&($.isArray(self.data.pages[o][prop]))){
					// is a link array
					// count the items
					if(__v) console.log(prop+' has '+self.data.pages[o][prop].length);
					linktotal+=self.data.pages[o][prop].length;
					if(/lines/.test(prop)){
						// add to lines count
						textlinks+=self.data.pages[o][prop].length;
						// count line links
						var line=self.data.pages[o][prop];
						// shapes
						if(self.data.pages[o][prop]['shapes']){
							textshapes+=self.data.pages[o][prop]['shapes'].length;
						}
						if(self.data.pages[o][prop]['labels']){
							textlabels+=self.data.pages[o][prop]['labels'].length;
						}
					}
				}
			}
		}
		// count global object links
		for(var prop in self.data){
			if((!(/pages/.test(prop)))&&($.isArray(self.data[prop]))){
				// object array
				// count
				for(var item in self.data[prop]){
					if(($.isArray(self.data[prop][item]))&&(!(/info/.test(item)))){
						linktotal+=self.data[prop][item].length;
					}
				}
			}
		}
		
		
		// display HTML
		var html='<div id="linktotal"><h1><p>TOTAL LINKS MADE:</p></h1><h1>'+linktotal+'</h1></div>';
		// text-object links
		html+='<div id="textlinks"><h2>LINKS TO LINES:</h2><h3>'+textlinks+'</h3></div>';
		// labels-text
		html+='<div id="textlabels"><h2>LINES LINKED WITH -'+textlabels+'- LABELS</h2></div>';
		// shapes-text
		html+='<div id="textshapes"><h2>LINES LINKED WITH -'+textshapes+'- SHAPES</h2></div>';
		// insert html
		$(".dashboard_main").prepend(html);
		
	},
	dataChangedHandle:function(e,o){
		var self=e.data.obj;
		
		// get full JSON data
		self.data=o.engine.getJSON();
		// erase html
		$(".dashboard_main").empty();
		// init HTML
	
		self.createLinkCount();

		self.createPagesTable();
		self.createLinesTable();
		// h=self.createGlobalItemsHTML();
		// 	$(".dashboard_main").append(h);	
		
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
		
	},
	// displays everything but pages
	createGlobalItemsHTML:function(){
		var self=this;
		var html='';
		for(var prop in self.data){
			if((!(/sourceFile|pages/i.test(prop)))&&($.isArray(self.data[prop]))){
				// is an array that can be displayed
				html+='<div class="itemlist"><h3>'+prop+'</h3>';
				for(var item in self.data[prop]){
					var disp=null;
					for(var x in self.data[prop][item]){
						if(/name|type|text/.test(x)){
							disp=self.data[prop][item][x];
							break;
						}
					}
					if(!disp) disp=self.data[prop][item].id;
					html+='<div class="item"><a id="'+self.data[prop][item].id+'">'+disp+'</a></div>';
					
				}
				html+='</div>';
			}
		}
		return html;
	},
	// run through the JSON and 
	// create list of pages
	createPagesTable:function(){
		var self=this;
		// collect data
		var columns=[];
		var headers=['pages'];
		// create additional headers based on array names in pages
		for(var p in self.data.pages){
			var url=self.data.pages[p].url.substring(self.data.pages[p].url.lastIndexOf('/'),self.data.pages[p].url.length);
			columns[p]=[url];
			// create a new row
			// var nrow={'pages':self.data.pages[p].url};
			for(var prop in self.data.pages[p]){
				
				if(($.isArray(self.data.pages[p][prop]))&&(!(/info/i.test(prop)))){
					if($.inArray(prop,headers)<0){
						// new header
						headers.push(prop);
					}
					// nrow[prop]=self.data.pages[p][prop].length;
					columns[p].push(self.data.pages[p][prop].length);
				}
			}
			// columns.push(nrow);
			// var nrow='<tr id="'+p+'"><td class="page"><a id="'+p+'">'+self.data.pages[p].url+'</a></td></tr>';
			// 		// append
			// 		$("table.pagelist").append(nrow);
			// 		// html+='<div id="'+p+'" class="page"><p>'+self.data.pages[p].url+'</p><div class="pagedetail">URL: '+self.data.pages[p].url+'</div>';
			// 		// count items and make new headers if arrays found
			// 		for(var prop in self.data.pages[p]){
			// 			if(($.isArray(self.data.pages[p][prop]))&&(!(/info/i.test(prop)))){
			// 				html+='<div class="pagedetail">'+prop+': ('+self.data.pages[p][prop].length+')</div>';
			// 			}
			// 		}
			// 		html+='</div>';
		}
		
		// create Table
		var html='<h2>BREAKDOWN OF LINKS</h2><h3>PAGES</h3><table id="pagedata" class="pagelist"><thead><tr>';
		var rowhtml='';
		// headers
		for(var header in headers){
			html+='<th>'+headers[header]+'</th>';
			rowhtml+='<td><div id="'+headers[header]+'"></div></td>';
		}
		html+='</tr></thead><tbody></tbody></table>';
		$(".dashboard_main").append(html);
		// fill in columns
		// use setimeout to prevent crashing
		// setTimeout(function(columns){
		// 			for(var row in columns){
		// 				// create new row
		// 				// wrapper for rowhtml
		// 
		// 				$(".dashboard_main > #pagedata > tbody").append('<tr id="page'+row+'">'+rowhtml+'</tr>');
		// 				for(var prop in columns[row]){
		// 					// attach cell data
		// 					if(prop=='pages'){
		// 						$('.pagelist > tbody > #page'+row+' > td > #'+prop).append('<a id="'+row+'">'+columns[row][prop]+'</a>');
		// 					} else {
		// 						$('.pagelist > tbody > #page'+row+' > td > #'+prop).append('<p>'+columns[row][prop]+'</p>');
		// 					}
		// 				}
		// 			}
		// 			
		// 		},11,columns);
		// create into a datatable
		$("#pagedata").dataTable({
			'aaData':columns,
			// show lines in ascending order
			'aaSorting':[[1,'asc']]
		});
		
	},
	// display all lines and links as a datatable
	createLinesTable:function(){
		var self=this;
		
		var columns=[];
		var headers=['lines','pages'];
	
		for(var p in self.data.pages){
			if((!self.data.pages[p])||(!self.data.pages[p]['lines'])) continue;
			var page=self.data.pages[p];
			var url=self.data.pages[p].url.substring(self.data.pages[p].url.lastIndexOf('/'),self.data.pages[p].url.length);
			for(var l in page['lines']){
				var line=page['lines'][l];
				columns.push([line.text,url]);
				// check and see if there any links to this line
				for(var prop in line){
					if(($.isArray(line[prop]))&&(!(/info/.test(prop)))){
						// link array
						columns[(columns.length-1)].push(line[prop].length);
						if($.inArray(prop,headers)<0){
							headers.push(prop);
						}
					}
				}
				
				
			}
			
		}
		
		if($("#linedata").length){
			$("#linedata").remove();
		}
		
		// go through columns array
		// and create html
		var html='<h3>LINES</h3><table id="linedata"><thead><tr>';
		var rowhtml='';
		for(var h in headers){
			// create header 
			html+='<th>'+headers[h]+'</th>';

			rowhtml+='<td id="'+headers[h]+'"></td>';
		}
		html+='</tr></thead><tbody></tbody></table>';
		$(".dashboard_main").append(html);
		// attach row parts - 
		// settimeout to prevent crashing
		// setTimeout(function(columns){
		// 		for(row in columns){
		// 			// create new row
		// 			var nrow='<tr id="line'+row+'">'+rowhtml+'</tr>';
		// 			// attach
		// 			$(".dashboard_main > #linedata > tbody").append(nrow);
		// 			for(var prop in columns[row]){
		// 				var h='<div class="'+prop+'"><a id="'+columns[row][prop]+'">'+columns[row][prop]+'</a></div>';
		// 				$("#linedata > tbody > #line"+row+' > #'+prop).append(h);
		// 			}
		// 		}
		// 	},11,columns);
		$("#linedata").dataTable({
			'aaData':columns
			
		});

		
		
	},
	// display a list of all items linked on a page
	createPageHTML:function(n){
		var self=this;
		
		var html='<div id="'+n+'" class="page"><h3>From: Pages</h3><h3>Page '+n+'</h3>';
		// display all object arrays
		for(var x in self.data.pages[n]){
			if(($.isArray(self.data.pages[n][x]))&&(!(/info/.test(x)))){
				html+='<div id="'+x+'" class="itemlist"><h4>'+x+'</h4>';
				
				
				for(var prop in self.data.pages[n][x]){
					var disp=null;
					for(var proper in self.data.pages[n][x][prop]){
						if(/text|name|type/.test(proper)){
							disp=self.data.pages[n][x][prop][proper];
							break;
						}
					}
					if(!disp) disp=self.data.pages[n][x][prop].id;
					html+='<div class="item"><a id="'+self.data.pages[n][x][prop].id+'">'+disp+'</a></div>';
				}
				html+='</div>';
			}
		}
		html+='</div>';
		$(".dashboard_main").empty().append(html);
	},
	createItemHTML:function(id,type){
		var self=this;
		var item=null;
		// find the item
		if(self.data[type]){
			for(var prop in self.data[type]){
				if(self.data[type][prop].id==id){
					item=self.data[type][prop];
					break;
				}
			}
		} else {
			// find page
			for(var p in self.data.pages){
				if(self.data.pages[p][type]){
					for(var prop in self.data.pages[p][type]){
						if(self.data.pages[p][type][prop].id==id){
							// found item
							item=self.data.pages[p][type][prop];
							break;
						}
					}
				}
				if(item) break;
			}
			
		}
		if(!item) return;
		var html='<div id="'+id+'" class="item">';
		var linklists='';
		for(var m in item){
			if(($.isArray(item[m]))&&(!(/id|type|posInfo/.test(m)))){
				// register as a linklist
				linklists+='<div id="'+m+'" class="linklist"><p>Linked with '+m+': </p>';
				for(var prop in item[m]){
					linklists+='<div class="link"><a id="'+item[m][prop]+'">'+item[m][prop]+'</a></div>';
				}
				linklists+="</div>";
			} else {
				html+='<p>'+m.toUpperCase()+': '+item[m]+'</p>';
			}
		}
		html+=(linklists+'</div>');
		return html;
		
	},
	// show everything of a type
	createTypeHTML:function(type){
		var self=this;
		// parent div has ID of type
		var html='<div id="'+type+'" class="itemlist"><h3>'+type+'</h3>';
		if(self.data[type]){
			// for each item in the list, show that item
			for(var x in self.data[type]){
				if(!self.data[type][x]) continue;
				var disp=null;
				for(var prop in self.data[type][x]){
					if(/text|name|type/.test(prop)){
						disp=self.data[type][x][prop];
						break;
					}
				}
				
				// item links have ID equal to their object's ID
				html+='<div class="item"><a id="'+self.data[type][x].id+'">'+disp+'</a></div>';
			}
		} else {
			
			
			// find in the pages
			for(var x in self.data.pages){
				if(self.data.pages[x][type]){
					html+='<div class=""';
				}
			}
			
		}
		
	}
};


