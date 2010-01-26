/**
 * Class for organizing and sorting the output data from 
 * the OCR Line images
 * 
 * Other objects need to make sure that there are already
 * lines present on the image before proceeding
 * 
 * Each output element contains four major measurement 
 * points that can be output in any way:
 * upperleft
 * uppertop
 * lowerleft
 * lowertop
 * 
 * NOTE: Right now only works when passed a data element
 * of type OpenLayers.Layer.Markers.markers
 */

var Output=function(args){
	this.data=(args.data)?args.data:null; //must be an array
	this.processedData="";
	this.src=null;
	this.imgw=null;
	this.imgh=null;
	this.outFile=null;
	
	this.outputDiv=$($.ajax({async:false,url:"chrome/lib/Output/OutputHTML.php",dataType:"text"}).responseText);
	$("#"+args.attachId).append(this.outputDiv);
	this.iframe=$("#outputDivIFrame");
}
Output.prototype={
	getData:function(data){
		if(data) this.data=data; 
		//turn data into output elements
		//this.processedData=data.src;
		this.processedData="";
		this.src=data.src;
		this.imgw=(data.imgw)?data.imgw:null;
		this.imgh=(data.imgh)?data.imgh:null;
		this.outFile=(data.outFile)?data.outFile:null;
		//this.processedData=(data.imgw&&data.imgh)?"\n"+data.imgw+"::"+data.imgh:"\nnosize";
		for(d=0;d<this.data.lines.length;d++){
			
				var box = $("#" + this.data.lines[d].div.id);
			if (box.css("left")) {
				var ul = parseInt(box.css("left"));
				var ut = parseInt(box.css("top"));
				var ll = ul + parseInt(box.width());
				var lt = ut + parseInt(box.height());
				this.processedData +=(this.processedData.length>0)? "_" + ul + "::" + ut + "::" + ll + "::" + lt:
				ul + "::" + ut + "::" + ll + "::" + lt;
			}
		}
		
		this.callPHP();
	},
	callPHP:function(){
		//use given PHP file URL to access user's data
		if (this.processedData.length == 0) {
			throw "Data not loaded";
			return false;
		}
		//send the DOM element to the script page
		//use IFrame src attribute to do so 
		var params="?html="+this.processedData+"&src="+this.src+"&sx="+this.imgw
		+"&sy="+this.imgh+"&os="+this.outFile;
		this.iframe.attr("src","chrome/lib/Output/outputScript.php"+params);
		/*
$.post("chrome/lib/Output/outputScript.php",{
			html:this.processedData,
			src:this.src,
			sx:this.imgw,
			sy:this.imgh,
			os:this.outFile
		},function(data){process(data);},"script");
*/
		
	}
}


