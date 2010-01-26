/***
 * Sidebar for setting the controls of 
 * threshold, minDotsPerRow, minLineHeight
 */

 
var Sidebar=function(){
	this.addBoxEvent=new jQuery.Event("addbox");
	
	this.DOM=$(this.init());
	$("body").append(this.DOM);
	this.DOM=$("#sidebar");
	this.body=$("#sidebody");
	this.list=$("#sidelist");
	
	this.imgPath=$("#s_imgfolder");
	this.xmlPath=$("#s_xmltext");
	
	this.minDots=$("#s_dotsperrow");
	this.minLine=$("#s_minlineheight");
	this.threshold=$("#s_threshold");
	this.addBox=$("#s_addbox");
	this.addBox.bind("click",{obj:this},this.notifyAddBoxClick);

	this.showBox=$("#s_showbox");
	this.showBox.bind("click",{obj:this},this.boxAppear);
	
	this.initOCR=$("#s_init");
	this.initOCR.bind("click",{obj:this},this.beginOCR);
	
	this.startOver=$("#s_startover");
	this.startOver.bind("click",{obj:this},this.clearAll);
	
	this.output=$("#s_output");
	this.output.bind("click",{obj:this},this.setOutput);
	
	//this.outFile=$("#s_outfile");
	

}
Sidebar.prototype={
	init:function(){
		return $.ajax({
			async:false,
			dataType:"text",
			url:"chrome/lib/Sidebar/Sidebar.php"
		}).responseText;
	},
	getPaths:function(){
		this.saveProgress(["xmlpath","imgpath"]);
		return {xml:(this.xmlPath.attr("value")=="")?null:this.xmlPath.attr("value"),imgpath:(this.imgPath.attr("value")=="")?null:this.imgPath.attr("value")};
	},
	setValues:function(args){
		for(i=0;i<args.length;i++){
			var type=args[i].name;
			switch(type){
				case 'dots':
					this.minDots.attr("value",args[i].value);
					break;
				case 'line':
					this.minLine.attr("value",args[i].value);
					break;
				case 'thresh':
					this.threshold.attr("value",args[i].value);
					break;
			}
		}
	},
	/**Returns associative array with values from sidebar**/
	getValues:function(){
		
		return {"mindots":this.minDots.attr("value"),"line":this.minLine.attr("value"),
		"thresh":this.threshold.attr("value")
		};
	},
	/**Send a signal to other objects that AddBox is clicked**/
	notifyAddBoxClick:function(e){
		$(this).trigger("addbox");
	},
	boxAppear:function(e){
	
		$(this).trigger("insertABox");
	},
	beginOCR:function(e){
		var values=e.data.obj.getValues();
		$(this).trigger("beginOCR",[values]);
		
	},
	clearAll:function(e){
		$(this).trigger("clearAll");
	},
	setOutput:function(e){
		
		$(this).trigger("setOutput",[null]);
	},
	saveProgress:function(args){
		var params="?values=";
		//go through what is to be saved
		//append to params
		for(i=0;i<args.length;i++){
			var type=args[i];
			switch(type){
				case "threshold":
					params+=(params.length>1)?"_threshold::"+this.threshold.attr("value"):"threshold::"+this.threshold.attr("value");
					break;
				case "dots":
					params+=(params.length>1)?"_dots::"+this.minDots.attr("value"):"dots::"+this.minDots.attr("value");
					break;
				case "lines":
					params+=(params.length>1)?"_lines::"+this.minLines.attr("value"):"lines::"+this.minLines.attr("value");
					break;
				case "xmlpath":
					params+=(params.length>1)?"_xmlfile::"+this.xmlPath.attr("value"):"xmlfile::"+this.xmlPath.attr("value");
					break;
				case "imgpath":
					params+=(params.length>1)?"_imgfolder::"+this.imgPath.attr("value"):"imgfolder::"+this.imgPath.attr("value");
					break;
			}
		}
		var url="chrome/lib/State/setState.php"+params;
		//make ajax call to save script
		$.ajax({
			url:url,
			async:false
		});
		
	},
}
