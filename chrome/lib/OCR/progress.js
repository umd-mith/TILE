/**
 * Displays progress of current OCR process
 */

 var progress=function(args){
 	this.id=args.id;
 	/*
this.id=(Math.random(1,100)*100);
	this.id=this.id.toFixed(0);
	this.id="progress"+this.id;
*/
 	this.DOM=$("#"+this.id);
	this.value=0;
	this.DOM.progressbar({value:this.value});//start at zero
	//have to set css properties overriden by ui-progressbar
	this.DOM.css("height","1em");
	$("body").bind("setProgress",{obj:this},this.setValue);
	this.displayText=$("#progressBarText");
 }
 progress.prototype={
 	setValue:function(e,val,done){
		var obj=e.data.obj;
		obj.DOM=$("#"+obj.id);
		if(obj.displayText.text()!="Working..."){
			obj.displayText.text("Working...");
		}
		obj.value=val;
		obj.DOM.progressbar('option','value',obj.value);
		if (done) {
			obj.displayText.text("Done!");
			setTimeout(function(obj){
				obj.hide();
				obj.DOM.progressbar('option','value',0);
				obj.value=0;
				obj.displayText.text("");
				obj.show();
			},65,obj);
		}
	},
	hide:function(){
		this.DOM=$("#"+this.id);
		this.DOM.fadeTo("slow",0.01); 
	},
	show:function(){
		this.DOM=$("#"+this.id);
		this.DOM.fadeTo("slow",1.0);
	}
 }
