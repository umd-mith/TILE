//inherits from Panel.js

var OLPanel=function(args){
Panel.call(this,args);
	if(!args.imgurl) throw "No Image Url Given";

	this.imgurl=args.imgurl;
	this.sidebar=new Sidebar();
	this.wordbar=null;
	this.progress=new progress({id:"progressBar"});
	this.setContent(); 


}
OLPanel.prototype={
	setContent:function(){
	
		this.sidebar.setValues([{name:'dots',value:25},{name:'line',value:20},{name:'thresh',value:8000000}])
		
		//---------- Sidebar on click handlers --------------
		
		$("body").bind("addbox",{obj:this},function(e){
			e.data.obj.addBox();
		});
		$("body").bind("insertABox",{obj:this},function(e){
			
			e.data.obj.insertBox();
		});
		$("body").bind("beginOCR",{obj:this},function(e,values){
			
			e.data.obj.initOCR(values);
		});
		$("body").bind("clearAll",{obj:this},function(e){
			
			e.data.obj.clearMap();
		});
		$("body").bind("setOutput",{obj:this},function(e,val){
			e.data.obj.sendToOutput(val);
		});
		$("body").bind("wordsReady",{obj:this},function(e,val){
			e.data.obj.sendToWordBar(val);
		});
		if(!this.wordbar){
			this.wordbar=new WordBar({id:this.id});
		}
		this.pheader=$("#"+this.id+"_header");
		this.pcontrols=$("#"+this.id+"_controls");
		this.qInfo=$("#"+this.id+"_quartoinfo");
	
		$("body").bind("setTitle",{obj:this},function(e,title){
			
			e.data.obj.qInfo.text(title);
		});
		
		// =======  Header click events ===========
		//DocPicker.js
	
		this.pageLoad=$("#"+this.id+"_pageLoad");
		this.pageLoad.bind("click",{obj:this},this.loadDoc);
		
		//Output Div
		this.outDiv=new Output({attachId:this.id});
		this.outputStart=$("#"+this.id+"_outputStart");
		this.outputStart.bind("click",{obj:this},this.sendToOutput);
		
		this.pageControls=$("#"+this.id+"_pageControls");
		this.pageNext=$("#"+this.id+"_pageNext");
		this.pageBack=$("#"+this.id+"_pageBack");
		this.pageNext.bind('click',{obj:this},this.nextPage);
		this.pageBack.bind('click',{obj:this},this.backPage);
		
		
		this.zoomIn=$("#"+this.id+"_zoomIn");
		this.zoomIn.bind("click",{obj:this,val:1},this.callZoom);
		this.zoomOut=$("#"+this.id+"_zoomOut");
		this.zoomOut.bind("click",{obj:this,val:0},this.callZoom);
		
		this.footer=$("#"+this.id+"_footer");
		this.content = new ImageContent({panelid:this.id,url:this.imgurl,triggerDiv:this.footer,urlprefix:"Images/"});
		//this.content=new OLPanelContent({panelid:this.id,url:this.imgurl,triggerDiv:this.footer,urlprefix:"Images/"});
	},
	loadDoc:function(e){
	
		var obj=e.data.obj;
		var paths=obj.sidebar.getPaths();
		if(!(paths.xml)) {
			throw "No paths selected";
			return;
		}
		obj.content.getPages(paths);
	},
	nextPage:function(e){
	//	setTimeout(function(obj){
			e.data.obj.content.changePage(1);
		//	},2,e.data.obj);
	},
	backPage:function(e){
		setTimeout(function(obj){
			obj.content.changePage(0);
		},2,e.data.obj);
	},
	callZoom:function(e){
		var obj=e.data.obj;
		var val=e.data.val;
		obj.content.zoomify(val);
	},
	sendToOutput:function(val){
		var data=this.content.getLinesData();
		if((val.length<1)||(val=="")) val=null;
		data.outFile=val;
		this.outDiv.getData(data);
	},
	sendToWordBar:function(words){
		this.wordbar.insertWords(words);
	},
	insertBox:function(){
		this.content.addBox();
	},
	initOCR:function(sidebarvalues){
		this.progress.show();
		//var sidebarvalues=this.sidebar.getValues();
		this.footer.trigger("setProgress",[15,false]);
		this.content.imageOCR(sidebarvalues);
	},
	setProgressBar:function(e,val,done){
		var obj=e.data.obj;
		obj.progress.setValue(val);
		if(done) obj.progress.hide();
	},
	addBox:function(){
		this.content.addLine();
	},
	clearMap:function(e){
		
		this.content.clearMap();
	}
}
extend(OLPanel,Panel);

