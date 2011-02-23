// Dashboard Plugin
// author: Grant Dickie

// Makes use of Googles OpenSocial scheme for adding widgets
// Displays global information about the user's current TILE session

var Dashboard={
	start:function(engine){
		var self=this;
		
		// create html
		self.html='<div class="header"></div><div id="dashboard_main" class="body"></div>';
		
		// create new mode for opensocial
		engine.insertModeHTML(self.html,'contentarea','Dashboard');
		
		// set up global listeners
		$("body").live("dataAdded newJSON",{obj:self},self.dataChangedHandle);
		
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
					if(/http\:|\.[jpggiftifpng]/i.test(id)){
						// on a page - get item from a page
						self.displayPageItems(type,id);
						
					} else if(self.data[type]) {
						self.displayItems(type);
					}
					break;
			}
			
			
		});
		
	},
	dataChangedHandle:function(e,o){
		var self=e.data.obj;
		
		// get full JSON data
		self.data=o.engine.getJSON();
		self.getOverview();
		// self.displayPageData(data);
	},
	// create initial view that Dashboard has
	getOverview:function(){
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
		$("#dashboard_main").empty().append(html);
		
		// attach counts of items
		for(var item in itemCount){
			$("#dashboard_main").append('<div class="dashboard_footer"><p><a id="'+item+'">'+item+' ('+itemCount[item]+')</a></p></div>');
			$(".dashboard_footer > p > #"+item).bind('click',function(e){
				e.preventDefault();
				if(__v) console.log('clicked on '+item);
				self.displayItems(item);
			});
		}
		
		
		
		
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
			// go through pages
			for(var p in self.data.pages){
				var page=self.data.pages[p];
				if(!page[type]) continue;
				for(var prop in page[type]){
					if(!page[type][prop].id) continue;
					var text=(page[type][prop].text)?page[type][prop].text:page[type][prop].id;
					var itemHtml='<div id="listItem"><a id="'+type+'|'+page[type][prop].id+'" class="displayItem">'+text+'</a></div>';
					html+=itemHtml;
				}
			}
			
			
		}
		html+='</div>';
		$("#dashboard_main").empty().append(html);
	},
	displayPageItems:function(type,url){
		var self=this;
		var page=null;
		
		var html='<div class="dashboard_table"><h3>'+type+'</h3>';
		for(var p in self.data.pages){
			if(self.data.pages[p].url==url){
				page=self.data.pages[p];
			}
		}
		
		if(!page) return;
		
		
		
		
	},
	getData:function(id,type,jsonName){
		var self=this;
		
		
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
		var pageHTML=self.displayPageData(page);
		$("#dashboard_main").empty().append(pageHTML);
		
		
	},
	// go page by page and display each page's dataset
	displayPageData:function(data){
		var self=this;
		var html='<div class="dashboard_table">';
		
		// sort pages array
		for(var prop in data){
			if(!(/url|info/.test(prop))){
				
			}
		}
		html+="</div>";
		// append to body
		return html;
	},
	// widget for showing label data
	findLabels:function(page,labels){
		var self=this;
		var html='<div class="dashboard_list"><p><strong>****Labels Used****</strong></p><br/>';
		for(var prop in page){
			// if prop is a list of items, go through them
			if((!(/url|lines|info/i.test(prop)))&&($.isArray(page[prop]))){
				for(var item in page[prop]){
					if((page[prop][item]['labels'])&&($.isArray(page[prop][item]['labels']))){
						for(var lbl in page[prop][item]['labels']){
							var id=page[prop][item]['labels'][lbl];
							// find in global array
							for(var x in labels){
								if(labels[x].id==id){
									html+='<div id="'+id+'" class="innerItem">'+labels[x].name+'</div>';
									break;
								}
							}
						}
					}
				}
			}
		}
		html+="</div>";
		return html;
	},
	findShapes:function(page){
		var self=this;
		
		
		var html='<div class="dashboard_list"><p><strong>****Shapes Drawn****</strong></p><br/>';
		
		if((page==null)||(!(page.shapes))) {	
			html+="<p>-->No shapes made yet</p><--</div>";
		
			return html;
		}
		
		for(var prop in page.shapes){
			if(!page.shapes[prop]) continue;
			html+='<div id="'+prop+'">'+page.shapes[prop].id;
			for(item in page.shapes[prop]){
				if(!(/id|type|name|posInfo|color/.test(item))){
					html+='<div class="innerItem">'+item+': '+JSON.stringify(page.shapes[prop][item])+'</div>';
				}
			}
			html+="</div>";
		}
		html+='</div>';
		return html;
	}
};


