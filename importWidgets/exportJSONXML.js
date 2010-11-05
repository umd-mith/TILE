// Script for exporting JSON structure from JSON -> Generic XML 1.0


/**
 * @author: Grant Dickie
* Modified from TEIexport.js from Doug Reside
 */

function exportToTEI(JSON_str){
	
	var JSONobj = JSON.parse(JSON_str);
	var str="";
	src = JSONobj["sourceFile"];
	// if(__v) console.log("exportToTEI src: "+src);
	if ((JSONobj["pages"]!=null)&&(JSONobj["pages"].length>0)){
		var xml="<?xml version=\"1.0\"?>\n<sourceFile>"+(JSONobj['sourceFile'])?JSONobj['sourceFile']:"None given"+"</sourceFile>\n<pages>";
		
		function recursiveAddData(str,obj){
			for(var part in obj){
				str+="<"+part+">";
				if(typeof obj[part]=='object'){
					str=recursiveAddData(str,obj[part]);
				} else {
					str+=obj[part];
				}
				
				
				str+="</"+part+">\n";
			}
		}
		// now we retrieve the pages
		// Each page receives one XML tag
		for(var p in JSONobj["pages"]){
			xml+="<page url=\""+JSONobj["pages"][p]["url"]+"\" info=\""+JSON.stringify(JSONobj["pages"][p]["info"])+"\">\n";
			for(var l in JSONobj["pages"][p]["lines"]){
				var line=JSONobj["pages"][p]["lines"];
				xml+="<line id=\""+(line["id"])?line["id"]:"null"+"\">\n<text>"+line["text"]+"</text>\n<info>"+line["info"]+"</info>\n";
				for(var extraLineData in line){
					if(/info|text|id/.test(extraLineData)) continue;
					// create tag for the extra line data (shapes, selections, things made by a plugin)
					xml+="<"+extraLineData+">\n";
					for(var part in line[extraLineData]){
						xml+="<el"+part+">\n";
						
					}
					xml+="</"+extraLineData+">\n";
				}
			}
			// get other data 
			for(var ext in JSONobj["pages"][p]){
				if(/id|info|url|lines/.test(ext)) continue;
				xml+="<"+ext+">";
				if(typeof JSONobj["pages"][p][ext]=='object'){
					recursiveAddData(xml,JSONobj["pages"][p][ext]);
				} else {
					xml+=JSONobj["pages"][p][ext];
				}
				xml+="</"+ext+">";
			}
			xml+="</page>";
		}
		
		
		// $.ajax({url: src, 
		// 			success: function(xml){
		// 			var f = $(xml).find("facsimile").eq(0);
		// 			
		// 			for (var i=0;i<JSONobj["pages"].length;i++){
		// 				
		// 			 	var page = JSONobj["pages"][i];
		// 				 var fac = page["info"]["facs"];
		// 				 var surface = f.find("surface[xml|id='"+fac+"']");
		// 				 for (var j=0;j<page["lines"].length;j++){
		// 				 	var ln = page["lines"][j];
		// 					shapes = ln["shapes"];
		// 					if (shapes != null) {
		// 						for (var k = 0; k < shapes.length; k++) {
		// 							// replave with bounding box soon
		// 							if (shapes[k]["type"] == "rect") {
		// 								var pos = shapes[k]["posInfo"];
		// 								var id = shapes[k]["id"];
		// 								
		// 								var zone = "<zone xml:id=\"" + id + "\" ulx=\"" + pos["x"] + "\" uly=\"" + pos["y"] + "\" lrx=\"" + parseFloat(pos["x"]) + parseFloat(pos["width"]) + "\" lry=\"" + parseFloat(pos["y"]) + parseFloat(pos["height"]) + "\"/>";
		// 								
		// 								$(surface).eq(0)[0].appendChild($(zone)[0]);
		// 							
		// 								var path = ln["info"];
		// 								offset = path.indexOf("[")+1;
		// 						
		// 								len = path.indexOf("]");
		// 						
		// 					
		// 								num = parseInt(path.substring(offset,len),10);
		// 							
		// 								lb = $(xml).find("lb").eq(num);
		// 								lb.attr("facs",id);
		// 							
		// 								str = (new XMLSerializer()).serializeToString($(xml)[0]);
		// 	 							//export out through a jQuery trigger
		// 								// if(__v) console.log("str is: "+str);
		// 							}
		// 						
		// 						}
		// 					}
		// 				 }
		// 			  
		// 			}
		
			// if(str.length==0){
			// 	str = (new XMLSerializer()).serializeToString($(xml)[0]);	
			// } 
			// Export out the finished string through a trigger
			$("body:first").trigger("exportStrDone",[xml]);
		
}
	
	//return str;
}

