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
			if((!(/url|info/.test(prop)))&&($.isArray(data[prop]))){
				for(var item in data[prop]){
					var itemHTML=self.displayItem(data[prop][item]);
					html+=itemHTML;
				}
			}
		}
		html+="</div>";
		// append to body
		return html;
	},
	displayItem:function(obj){
		var self=this;
		var html='<div class="listItem"><a class="displayItem" id="'+obj.type+'|'+obj.id+'">';
		
		for(var prop in obj){
			if(!($.isArray(obj[prop]))){
				html+=obj[prop]+' ';
			}
		}
		html+="</a></div>";
		return html;
		
	}
};


