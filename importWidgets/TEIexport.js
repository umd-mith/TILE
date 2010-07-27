/**
 * @author dreside
 */
function goodbye(){
 alert("goodbye");	
}

function exportToTEI(JSON_str){

	var JSONobj = JSON.parse(JSON_str);
	str="george";
	src = JSONobj["sourceFile"];
	if (src==null) {
		alert("nulkl");
		
	}
	else{
		if ((JSONobj["pages"]!=null)&&(JSONobj["pages"].length>0)){
		
			alert(src);
		$.ajax({url: src, success: function(xml){
			//JSONobj["pages"].length
			alert("wooo");
			var f = $(xml).find("facsimile").eq(0);
		
			for (var i=0;i<JSONobj["pages"].length;i++){
				
			 var page = JSONobj["pages"][i];
			 var fac = page["info"]["facs"];
			 
	
			 var surface = f.find("surface[xml|id='"+fac+"']");
			
			 for (var j=0;j<page["lines"].length;j++){
			 	var ln = page["lines"][j];
				shapes = ln["shapes"];
				if (shapes != null) {
					alert(shapes.length);
					for (var k = 0; k < shapes.length; k++) {
						// replave with bounding box soon
						if (shapes[k]["type"] == "rect") {
							var pos = shapes[k]["posInfo"];
							var id = shapes[k]["id"];
							var zone = "<zone xml:id=\"" + id + "\" ulx=\"" + pos["x"] + "\" uly=\"" + pos["y"] + "\" lrx=\"" + parseFloat(pos["x"]) + parseFloat(pos["width"]) + "\" lry=\"" + parseFloat(pos["y"]) + parseFloat(pos["height"]) + "\"/>";
							
							$(surface).eq(0)[0].appendChild($(zone)[0]);
							var path = ln["info"];
							alert("da first: "+path);
							offset = path.indexOf("[")+1;
						
							len = path.indexOf("]");
						
					
							num = parseInt(path.substring(offset,len));
							alert("bang");
							alert("This num "+num);
							lb = $(xml).find("lb").eq(num);
							lb.attr("facs",id);
							
							str = (new XMLSerializer()).serializeToString($(xml).find("lb").eq(0)[0]);
 							
						}
					}
				}
			 }
			  
			
			 //alert(surface.find("surface").eq(0).attr("xml:id"));
			// .find("surface[xml\\:id="+fac+"]:first");
			 
			// alert(surface.parent().html());
			// var lines = page["lines"]
			}
			
			//alert(num);
		}
	
	});


}
}
alert("very end");
alert(str);
dude=str;
return str;
}

