// views.js
// Plugin that features a view of the JSON session variable in the TILE source 
// author: Grant Dickie
// copyright MITH 2011

var Views=function(){
	var self=this;
	var html="<div id=\"views\" class=\"az_log\"><div id=\"body\" class=\"az\"><div class=\"toolbar\"><ul><li><a id=\"gobacktotile\" class=\"btnIconLarge\">Back</a></li></ul></div><div id=\"list_view_json\"></div></div></div>";
	$("body").append(html);
	$("#views").hide();
	html='<div class="menuitem"><ul><li><a id="getViews" class="btnIconLarge">Source</a></li></ul></div>';
	$(html).insertBefore("#transcript_toolbar > #ddown");
	$("#gobacktotile").click(function(){
		$("#views").hide();
		$(".az.main.twocol").show();
	});
	$("head").append("<style>#greenLayer{background:#f0f0f0;} #redLayer{background:#444DDD;border:black solid 3px;}</style>");
};

Views.prototype={
	parseJson:function(json){
		var self=this;
		
		var dispArray=function(arr){
			var html="<div class=\'listItem\'>";
			
			for(index=0;index<arr.length;index++){
				if((typeof(arr[index])=='object')&&($.isArray(arr[index]))){
					html+=dispArr(arr[index]);
				} else if(typeof(arr[index])=='object'){
					html+=dispObj(arr[index]);
				} else {
					html+='<br/><a>'+arr[index]+'</a>';
				}
				
			}
			return (html+"</div>");
		};
		
		var dispObj=function(o){
			var html='<div class="listItem">';
			for(var prop in o){
				if((typeof(o[prop])=='object')||($.isArray(o[prop]))){
					// array - use display array function
					html+="<div id=\"greenLayer\"><div id=\"redLayer\">"+JSON.stringify(o[prop])+"</div></div>";
				} else {
					// non-complex object
					html+="<span>"+o[prop]+"</span>";
				}
			}
			return (html+"</div>");
		};
		if(typeof(json)!='object') return;
		// generate html from json
		var fin="<div class=\"listItem\">"+dispObj(json)+"</div>";
		return fin;
	}
	
};

var V={
	start:function(){
		var v=new Views();
		
		
		$("#getViews").click(function(){
			$(".az.main.twocol").hide();
			$("#views").show();
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