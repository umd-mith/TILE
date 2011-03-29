// views.js
// Plugin that features a view of the JSON session variable in the TILE source 
// author: Grant Dickie
// copyright MITH 2011

var Views=function(){
	var self=this;
	var html="<div id=\"views\" class=\"az inner views\"><div style=\"position:absolute;top:0px;\"><div class=\"menuitem\"><ul><li><a id=\"gobacktotile\" class=\"btnIconLarge\">Back</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewSvg\" class=\"btnIconLarge\">SVG</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewText\" class=\"btnIconLarge\">TEXT</a></li></ul></div>"+
	"</div><div id=\"body\" style=\"margin-top:10px;\"><div id=\"list_view_json\"></div><div id=\"raphael_view_json\"></div></div></div>";
	// insert after az_header
	$(html).appendTo("#azcontentarea");
	$("#views").hide();
	

	
	$("#viewSvg").live('mousedown click',function(){
		$("#list_view_json").hide();
		$("#raphael_view_json").show();
		
	});
	
	$("#viewText").live("click",function(){
		$("#raphael_view_json").hide();
		$("#list_view_json").show();
		
	});
	
	// activate Raphael canvas for list_view_json 
	// width, height = 780
	self.canvas=new Raphael($("#raphael_view_json")[0],780,780);
	
	
	$("head").append("<style type=\"text/css\">.az.inner.views #body{position:absolute;left:15px;top:45px;overflow:scroll;} #raphael_view_json{overflow:auto;height:800px;width:700px;} #list_view_json{height:70%;} .boldObj{font-size:20px;} .simpleObj{border:1px solid green; padding:2px;} #greenLayer{border:solid 2px #f0f0f0;} #redLayer{border:red solid 3px;}</style>");
};

Views.prototype={
	// creates HTML format of data
	parseJson:function(json){
		var self=this;
		
		var dispArray=function(arr,l){
			var html="<div class=\'listItem\'>";
			if((arr==null)||(arr=='undefined')) return;
			for(var index in arr){
				if((arr[index]==null)||(arr[index]=='undefined')) continue;
				if((typeof(arr[index])=='object')&&($.isArray(arr[index]))){
					// turn up level
					l++;
					
					html+=dispArr(arr[index],l);
				} else if(typeof(arr[index])=='object'){
					l++;
					html+=dispObj(arr[index],l);
				} else {
				
					html+="<span class=\"simpleObj\"><strong>"+index+"</strong><br/>"+arr[index]+"</span><br/>";
				}
				
			}
			return (html+"</div>");
		};
		
		var dispObj=function(o,l){
			var html='<div class="listItem">';
			for(var prop in o){
				if(!o[prop]) continue;
				if((typeof(o[prop])=='object')||($.isArray(o[prop]))){
					// array - use display array function
				
					
					// adjust margin-left
					var lft=(l*10)+15;
					// turn up level
					l++;
					var id="redlayer";
					if(o[prop][0]&&(o[prop][0]['id'])){
						id=o[prop][0]['id'];
					}
					
					// set html level with indents set to lft
					html+="<div id=\"greenLayer\" style=\"margin-left:"+lft+"px;\">"+prop+":<br/><div id=\""+id+"\" class=\"object\">"+dispArray(o[prop],l)+"</div></div>";
				} else if(typeof(o[prop])=='object') {
					l++;
					html+=dispObj(o[prop],l);
					
				} else {
					// non-complex object
					html+="<span class=\"simpleObj\"><strong>"+prop+"</strong><br/>"+o[prop]+"</span><br/>";
				}
			}
			return (html+"</div>");
		};
		if(typeof(json)!='object') return;
		// generate html from json
		var fin="<div class=\"listItem\">"+dispObj(json,1)+"</div>";
		return fin;
	},

	// Take json Object argument and craft an SVG drawing out of it
	createSVG:function(json){
		var self=this;
		var bigcollection=self.canvas.set();
		var txtEls=[];
		var shpEls=[];
		var lblEls=[];
		var refs=[];
		var toplevel=/pages|labels/;
		
		for(var prop in json){
			if(toplevel.test(prop)){
				if(!json[prop]) continue;
				for(var n in json[prop]){
					if(!json[prop][n]) continue;
					if(json[prop][n]['shapes']){
						if(!refs['shapes']){
							refs['shapes']=[];
						}
						for(var shape in json[prop][n]['shapes']){
							
							switch(json[prop][n]['shapes'][shape].type){
								case 'rect':
									// self.canvas.rect(json[prop][n]['shapes'][shape].posInfo);
									
									self.canvas.rect(json[prop][n]['shapes'][shape].posInfo.x,json[prop][n]['shapes'][shape].posInfo.y,json[prop][n]['shapes'][shape].posInfo.width,json[prop][n]['shapes'][shape].posInfo.height);
									break;
								case 'elli':
									self.canvas.ellipse(json[prop][n]['shapes'][shape].posInfo.x,json[prop][n]['shapes'][shape].posInfo.y,json[prop][n]['shapes'][shape].posInfo.rx,json[prop][n]['shapes'][shape].posInfo.ry);
									break;
							}
							refs[json[prop][n]['shapes'][shape].id]={id:json[prop][n]['shapes'][shape].id,x:json[prop][n]['shapes'][shape].posInfo.x,y:json[prop][n]['shapes'][shape].posInfo.y};
							shpEls.push(json[prop][n]['shapes'][shape]);
						}
					}
					if(json[prop][n]['lines']){
						for(var line in json[prop][n]['lines']){
							if(!json[prop][n]['lines'][line]) continue;
							var y=((txtEls.length*20)+40);
							var txt=self.canvas.text(100,y,json[prop][n]['lines'][line].text);
							txtEls.push({id:json[prop][n]['lines'][line].id,x:100,y:y,shapes:json[prop][n]['lines'][line].shapes});
							// check for references from this line to other objects
							if(json[prop][n]['lines'][line].shapes){
								txt.attr({'fill':"red",'font-size':'18px'});
								// place text of id next to line
								for(var v in json[prop][n]['lines'][line].shapes){
									if(!json[prop][n]['lines'][line].shapes) continue;
									var x=self.canvas.text(100,y,json[prop][n]['lines'][line].shapes[v]);
									x.attr({'fill':'blue'});
								}
							}
							refs[json[prop][n]['lines'][line].id]={id:json[prop][n]['lines'][line].id,x:100,y:y};
						}
					}
					
					if(json[prop][n]['name']){
						// label - set in another column
						var txt=self.canvas.text(550,((lblEls.length*40)+40),json[prop][n]['name']);
						txt.attr({'fill':'blue','font-size':'24px'});
						lblEls.push(n);
						refs[json[prop][n].id]={id:json[prop][n].id,x:550,y:((lblEls.length*40)+40)};
					}
				}
			}
		}
		
			// Check for links and draw lines between each object that is linked to 
			// another object
			
			
			// for(var x in txtEls){
			// 			
			// 				for(var prop in txtEls[x]){
			// 					if(prop=='shapes'){
			// 						for(var v in shpEls){
			// 							for(var shp in textEls[x][prop]){
			// 								if(shpEls[v].id==txtEls[x].shapes[shp]){
			// 									// draw line between coords
			// 									var sx=(shpEls[v].posInfo.x)?shpEls[v].posInfo.x:0;
			// 									var sy=(shpEls[v].posInfo.y)?shpEls[v].posInfo.y:0;
			// 									// create path string
			// 									var pString="M"+txtEls[x].x+" "+txtEls[x].y+"L"+sx+" "+sy;
			// 									// put on canvas
			// 									self.canvas.path(pString);
			// 						
			// 								}
			// 							}
			// 						}
			// 					} 
			// 			}
			// 		
			// 		}
		
		
	}
};

var V={
	// The start function that's called when TILE_ENGINE initializes
	start:function(engine){
		var self=this;
		self.v=new Views(engine);
		// Set up button object to send to TILE
		var button={
			id:'getViews',
			display:'Source',
			type:'global',
			category:'mode',
			helptext:'View your data in HTML or SVG format'
		};
		// Create a button in TILE 
		self.el=engine.addToolBarButton(button);
		if(!self.el) return;
		self.el.elem.live('click',function(e){
			e.preventDefault();
			// makes our button turn green in the 
			// top menu
			self.el.makeActive();
			
			// hide the header and the main body
			$(".ui-dialog").hide();
			// display our plugin
			$("#azcontentarea > .az.inner").hide();
			$("#views").show();
			$("#raphael_view_json").hide();
			$("#list_view_json").show();
			
		});
		// set up action for the back button
		$("#gobacktotile").live('mousedown click',function(){
			$("#views").hide();
			$("#azcontentarea > .az.inner").hide();
			$("#azcontentarea > .az.inner:eq(0)").show();
			self.el.unActive();
		});
		// initialize the HTML for this JSON
		var data=engine.getJSON(true);
		$("#list_view_json").empty();
		$("#list_view_json").append(self.v.parseJson(data));
		
		// setup the global TILE event listeners
		// for whenever a user uses the nextPage, prevPage, changePage or parseJSON commands
		$("body").live("newPage newJSON",{obj:self},self.newJSONHandle);
		// for whenever data is added, edited or deleted in the TILE JSON
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		// for whenever an object becomes active in TILE
		$("body").live("newActive",{obj:self},self.newActiveHandle);
	
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	newJSONHandle:function(e,o){
		var self=e.data.obj;
		// erase previous HTML
		$("#list_view_json").empty();
		
		// JSON is loaded - reset the HTML
		var data=o.engine.getJSON(true);
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	dataAddedHandle:function(e,o){
		var self=e.data.obj;		
		// new data has been created, edited, or deleted from
		// the central JSON core.
		// Views is going to update the parsed data it has
		// stored.
		var data=o.engine.getJSON(true);
		// erase previous HTML
		$("#list_view_json").empty();
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
		
		// bold the activeItems
		for(var prop in o.activeItems){
			if($("#greenlayer > #"+o.activeItems[prop].id).length){
				$("#greenlayer > #"+o.activeItems[prop].id).addClass('boldObj');
			}
		}
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	newActiveHandle:function(e,o){
		// reset the HTML and then bold the activeItems
		var self=e.data.obj;
		// JSON is loaded - reset the HTML
		var data=o.engine.getJSON(true);
		// erase previous HTML
		$("#list_view_json").empty();
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
		
		$("#greenlayer > .object").removeClass("boldObj");
		
		// bold the activeItems
		for(var prop in o.activeItems){
			if($("#"+o.activeItems[prop].id+".object").length){
				if(__v) console.log('found '+o.activeItems[prop].id);
				$("#"+o.activeItems[prop].id+".object").addClass('boldObj');
			}
		}
		
	}
};