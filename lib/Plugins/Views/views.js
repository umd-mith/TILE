// views.js
// Plugin that features a view of the JSON session variable in the TILE source 
// author: Grant Dickie
// copyright MITH 2011

var Views=function(engine){
	var self=this;
	var html="<div id=\"views\" class=\"az log\"><div style=\"position:absolute;top:0px;\"><div class=\"menuitem\"><ul><li><a id=\"gobacktotile\" class=\"btnIconLarge\">Back</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewSvg\" class=\"btnIconLarge\">SVG</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewText\" class=\"btnIconLarge\">TEXT</a></li></ul></div>"+
	"</div><div id=\"body\" style=\"margin-top:10px;\"><div id=\"list_view_json\"></div><div id=\"raphael_view_json\"></div></div></div>";
	// insert after az_header
	$(html).insertAfter(".az.header");
	$("#views").hide();
	
	// html='<div class="menuitem"><ul><li><a id="getViews" class="btnIconLarge">Source</a></li></ul></div>';
	
	
	// $(html).insertBefore("#transcript_toolbar > #ddown");
	
	
	$("#gobacktotile").live('mousedown click',function(){
		$("#views").hide();
		$(".az.header").show();
		$(".az.main.twocol").show();
	});
	$("#viewSvg").live('mousedown click',function(){
		$("#list_view_json").hide();
		$("#raphael_view_json").show();
		var data=engine.getJSON();
		self.canvas.clear();
		self.createSVG(data);
	});
	
	$("#viewText").live("click",function(){
		$("#raphael_view_json").hide();
		$("#list_view_json").show();
		$("#list_view_json").empty();
		var data=engine.getJSON();
		$("#list_view_json").append(self.parseJson(data));
	});
	// activate Raphael canvas for list_view_json 
	// width, height = 780
	self.canvas=new Raphael($("#raphael_view_json")[0],780,780);
	
	
	$("head").append("<style type=\"text/css\">#body{position:absolute;left:15px;top:45px;} #raphael_view_json{overflow:auto;height:800px;width:700px;} #list_view_json{overflow:auto;height:680px;} .simpleObj{border:1px solid green; padding:2px;} #greenLayer{border:solid 2px #f0f0f0;} #redLayer{border:red solid 3px;}</style>");
};

Views.prototype={
	parseJson:function(json){
		var self=this;
		var dispArray=function(arr,l){
			var html="<div class=\'listItem\'>";
			
			for(var index in arr){
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
					// set html level with indents set to lft
					html+="<div id=\"greenLayer\" style=\"margin-left:"+lft+"px;\">"+prop+":<br/><div id=\"redLayer\">"+dispArray(o[prop],l)+"</div></div>";
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
		
		var toplevel=/pages|labels/;
		
		for(var prop in json){
			if(toplevel.test(prop)){
				if(!json[prop]) continue;
				for(var n in json[prop]){
					if(!json[prop][n]) continue;
					if(json[prop][n]['shapes']){
						for(var shape in json[prop][n]['shapes']){
							if(!json[prop][n]['shapes'][shape]) continue;
							switch(json[prop][n]['shapes'][shape].type){
								case 'rect':
									// self.canvas.rect(json[prop][n]['shapes'][shape].posInfo);
									
									self.canvas.rect(json[prop][n]['shapes'][shape].posInfo.x,json[prop][n]['shapes'][shape].posInfo.y,json[prop][n]['shapes'][shape].posInfo.width,json[prop][n]['shapes'][shape].posInfo.height);
									break;
								case 'elli':
									self.canvas.ellipse(json[prop][n]['shapes'][shape].posInfo.x,json[prop][n]['shapes'][shape].posInfo.y,json[prop][n]['shapes'][shape].posInfo.rx,json[prop][n]['shapes'][shape].posInfo.ry);
									break;
							}
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
						}
					}
					
					if(json[prop][n]['name']){
						// label - set in another column
						var txt=self.canvas.text(550,((lblEls.length*40)+40),json[prop][n]['name']);
						txt.attr({'fill':'blue','font-size':'24px'});
						lblEls.push(n);
						
					}
				}
			}
		}
		
		// Check for links and draw lines between each object that is linked to 
		// another object
		for(var x in txtEls){
			if(txtEls[x].shapes){
				for(var shp in txtEls[x].shapes){
					for(var v in shpEls){
						if(shpEls[v].id==txtEls[x].shapes[shp]){
							// draw line between coords
							var sx=(shpEls[v].posInfo.x)?shpEls[v].posInfo.x:0;
							var sy=(shpEls[v].posInfo.y)?shpEls[v].posInfo.y:0;
							// create path string
							var pString="M"+txtEls[x].x+" "+txtEls[x].y+"L"+sx+" "+sy;
							// put on canvas
							self.canvas.path(pString);
							
						}
					}

				}
			}
		}
		
		
	}
};

var V={
	start:function(engine){
		var v=new Views(engine);
		var button={
			id:'getViews',
			display:'Source',
			data:v,
			click:function(e){
				e.preventDefault();
				
				var v=e.data.obj;
				// hide the header and the main body
				$(".ui-dialog").hide();
				$(".az.header").hide();
				$(".az.main.twocol").hide();
				$("#views").show();
				$("#raphael_view_json").hide();
				var data=engine.getJSON();
				$("#list_view_json").append(v.parseJson(data));
			}
		};
		engine.addToolBarButton(button);
		
		// $("#getViews").click(function(){
		// 			// hide the header and the main body
		// 			$(".ui-dialog").hide();
		// 			$(".az.header").hide();
		// 			$(".az.main.twocol").hide();
		// 			$("#views").show();
		// 			$("#raphael_view_json").hide();
		// 			var data=engine.getJSON();
		// 			$("#list_view_json").append(v.parseJson(data));
		// 		});
	
	},
	restart:function(){
		
	},
	close:function(){
		var self=this;
		// do nothing
		$("body:first").trigger(self._close);
	},
	_close:'close909011208912'
};