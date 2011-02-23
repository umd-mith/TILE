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
		$("body").live("dataAdded newJSON",{obj:self},self.dataAddedHandle);
		
	},
	dataAddedHandle:function(e,o){
		var self=e.data.obj;
		
		// get full JSON data
		var data=o.engine.getJSON();
		
		self.displayPageData(data);
	},
	// go page by page and display each page's dataset
	displayPageData:function(data){
		var self=this;
		var html='<div class="dashboard_table">';
		
		// sort pages array
		for(var page in data.pages){
			var lblHTML=self.findLabels(data.pages[page],data.labels);
			var shpHTML=self.findShapes(data.pages[page]);
			
			html+='<div id="page'+page+'" class="pageData"><p>****Page '+data.pages[page].url+'****</p><div id="labels'+page+'">'+
			lblHTML+'</div><div id="shapes'+page+'">'+
			shpHTML+'</div></div>';
			if(__v) console.log(html);
		}
		html+="</div>";
		// append to body
		$("#dashboard_main").empty().append(html);
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


