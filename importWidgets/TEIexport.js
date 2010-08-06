// exportToTEI
// Takes a JSON string and outputs a marked-up version of the original included sourceFile
// as an xml serialized string. Outputs using Custom Event exportStrDone

/**
 * @author dreside
 */

function exportToTEI(JSON_str){
	
	var JSONobj = JSON.parse(JSON_str);
	var str="";
	src = JSONobj["sourceFile"];
	// if(console) console.log("exportToTEI src: "+src);
	if (src==null) {
		return;
	} else if ((JSONobj["pages"]!=null)&&(JSONobj["pages"].length>0)){
		
		
		$.ajax({url: src, 
			success: function(xml){
			// if(console) console.log('inside the success');
			var f = $(xml).find("facsimile").eq(0);
			
			for (var i=0;i<JSONobj["pages"].length;i++){
				
			 	var page = JSONobj["pages"][i];
				 var fac = page["info"]["facs"];
				 var surface = f.find("surface[xml|id='"+fac+"']");
				// if(console) console.log("page: "+page+ " Lines: "+page["lines"].length);
				 for (var j=0;j<page["lines"].length;j++){
				 	var ln = page["lines"][j];
					shapes = ln["shapes"];
					if (shapes != null) {
						for (var k = 0; k < shapes.length; k++) {
							// replave with bounding box soon
							if (shapes[k]["type"] == "rect") {
								var pos = shapes[k]["posInfo"];
								var id = shapes[k]["id"];
								
								var zone = "<zone xml:id=\"" + id + "\" ulx=\"" + pos["x"] + "\" uly=\"" + pos["y"] + "\" lrx=\"" + parseFloat(pos["x"]) + parseFloat(pos["width"]) + "\" lry=\"" + parseFloat(pos["y"]) + parseFloat(pos["height"]) + "\"/>";
								
								$(surface).eq(0)[0].appendChild($(zone)[0]);
							
								var path = ln["info"];
								offset = path.indexOf("[")+1;
						
								len = path.indexOf("]");
						
					
								num = parseInt(path.substring(offset,len),10);
							
								lb = $(xml).find("lb").eq(num);
								lb.attr("facs",id);
							
								str = (new XMLSerializer()).serializeToString($(xml)[0]);
	 							//export out through a jQuery trigger
								// if(console) console.log("str is: "+str);
							}
						
						}
					}
				 }
			  
			}
			if(str.length==0){
				str = (new XMLSerializer()).serializeToString($(xml)[0]);	
			} 
			// Export out the finished string through a trigger
			$("body:first").trigger("exportStrDone",[str]);
		}
	});	
}
	
	//return str;
}

