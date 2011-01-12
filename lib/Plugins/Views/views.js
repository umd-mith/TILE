// views.js
// Plugin that features a view of the JSON session variable in the TILE source 
// author: Grant Dickie
// copyright MITH 2011

var Views=function(){
	var self=this;
	var html="<div id=\"views\" class=\"az log\"><div style=\"position:absolute;top:0px;\"><div class=\"menuitem\"><ul><li><a id=\"gobacktotile\" class=\"btnIconLarge\">Back</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewSvg\" class=\"btnIconLarge\">SVG</a></li></ul></div>"+
	"<div class=\"menuitem\"><ul><li><a id=\"viewText\" class=\"btnIconLarge\">TEXT</a></li></ul></div>"+
	"</div><div id=\"body\" style=\"margin-top:10px;\"><div id=\"list_view_json\"></div><div id=\"raphael_view_json\"></div></div></div>";
	// insert after az_header
	$(html).insertAfter(".az.header");
	$("#views").hide();
	
	html='<div class="menuitem"><ul><li><a id="getViews" class="btnIconLarge">Source</a></li></ul></div>';
	$(html).insertBefore("#transcript_toolbar > #ddown");
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
	
	
	$("head").append("<style type=\"text/css\">#body{position:absolute;left:15px;top:45px;} #raphael_view_json{overflow:auto;height:800px;width:700px;} #list_view_json{overflow:auto;height:680px;} .simpleObj{border:1px solid green; padding:2px;} #greenLayer{background:#f0f0f0;} #redLayer{background:#444DDD;border:black solid 3px;}</style>");
};

Views.prototype={
	parseJson:function(json){
		var self=this;
		
		var dispArray=function(arr){
			var html="<div class=\'listItem\'>";
			
			for(var index in arr){
				if((typeof(arr[index])=='object')&&($.isArray(arr[index]))){
					html+=dispArr(arr[index]);
				} else if(typeof(arr[index])=='object'){
					html+=dispObj(arr[index]);
				} else {
					html+='<span class=\"simpleObj\">'+arr[index]+'</span>';
				}
				
			}
			return (html+"</div>");
		};
		
		var dispObj=function(o){
			var html='<div class="listItem">';
			for(var prop in o){
				if((typeof(o[prop])=='object')||($.isArray(o[prop]))){
					// array - use display array function
					html+="<div id=\"greenLayer\">"+prop+":<br/><div id=\"redLayer\">"+dispArray(o[prop])+"</div></div>";
				} else if(typeof(o[prop])=='object') {
					dispObj(o[prop]);
					
				} else {
					// non-complex object
					html+="<span class=\"simpleObj\">"+o[prop]+"</span>";
				}
			}
			return (html+"</div>");
		};
		if(typeof(json)!='object') return;
		// generate html from json
		var fin="<div class=\"listItem\">"+dispObj(json)+"</div>";
		return fin;
	},
	// Take json Object argument and craft an SVG drawing out of it
	createSVG:function(json){
		var self=this;
		var bigcollection=self.canvas.set();
		var txtEls=[];
		var shpEls=[];
		
		
		var toplevel=/pages|labels/;
		
		for(var prop in json){
			if(toplevel.test(prop)){
				if(!json[prop]) continue;
				for(var n in json[prop]){
					if(!json[prop][n]) continue;
					if(json[prop][n]['lines']){
						for(var line in json[prop][n]['lines']){
							if(!json[prop][n]['lines'][line]) continue;
							var txt=self.canvas.text(100,((txtEls.length*20)+40),json[prop][n]['lines'][line].text);
							txtEls.push(line);
							if(json[prop][n]['lines'][line].shapes){
								txt.attr({'fill':"red",'font-size':'14px'});
							}
						}
					}
					if(json[prop][n]['shapes']){
						for(var shape in json[prop][n]['shapes']){
							if(!json[prop][n]['shapes'][shape]) continue;
							switch(json[prop][n]['shapes'][shape].type){
								case 'rect':
									self.canvas.rect(json[prop][n]['shapes'][shape].posInfo);
									// self.canvas.rect(json[prop][n]['shapes'][shape].posInfo.x,json[prop][n]['shapes'][shape].posInfo.y,json[prop][n]['shapes'][shape].posInfo.width,json[prop][n]['shapes'][shape].posInfo.height);
									break;
								case 'elli':
									self.canvas.ellipse(json[prop][n]['shapes'][shape].posInfo);
									break;
							}
						}
					}
				}
			}
		}
		
	}
};

var V={
	start:function(){
		var v=new Views();
		
		
		$("#getViews").click(function(){
			// hide the header and the main body
			$(".ui-dialog").hide();
			$(".az.header").hide();
			$(".az.main.twocol").hide();
			$("#views").show();
			$("#raphael_view_json").hide();
			var data=engine.getJSON();
			$("#list_view_json").append(v.parseJson(data));
		});
	
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