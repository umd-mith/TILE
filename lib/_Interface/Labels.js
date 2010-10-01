// Labels
// Provides a taxonomy for all TILE transcript lines and shape areas
// 
// 
// 


var Label=function(args){
	var self=this;
	// attach the DOM html to the activeBox
	$("#az_activeBox").append("<div id=\"az_label_box\" class=\"az inner\"><span id=\"activeBox_min\" class=\"btnIconLarge\"></span><span id=\"hideLbl\" class=\"button\">Hide</span><ul id=\"label_list\" class=\"infoItem\"></ul></div>");
	self.DOM=$("#az_label_box");
	self.minButton=$("#activeBox_min");
	self.labelList=$("#label_list");
	self.hideLbl=$("#hideLbl").click(function(){
		$("#az_label_box").hide();
		$("#az_activeBox > .az.inner:eq(0)").show();
	});
	// add button to the activebox
	$("<span id=\"lbl_Button\" class=\"button\">Labels</span>").insertBefore($("#az_activeBox > .az.inner:eq(0) > ul"));
	self.lblButton=$("#lbl_Button").click(function(){
		// hide the activeBox
		$("#az_activeBox > .az.inner:eq(0)").hide();
		self.DOM.show();
	});
	self.labelData=(args.data)?args.data.labels:null;
	self.loadLabels(self.labelData);
	// hide the activeBox
	$("#az_activeBox > .az.inner:eq(0)").hide();
	$("body").bind("shapeDrawn",{obj:self},self.addReference);
};
Label.prototype={
	loadLabels:function(data){
		var self=this;
		// each label receives an li tag that has a click
		// event attached
		// Click event fires off sendLblData custom event
		for(d in data){
			$("<li id=\"lbl_"+data[d].id+"\" class=\"labelItem\">"+data[d].name+"</li>").click(function(){
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// send data
				// $("body:first").trigger("sendLblData",[{name:$(this).text(),id:id}]);
				self.lblSelected({name:$(this).text(),id:id});
			}).appendTo(self.labelList);
		}
		self.manifest=data;
	},
	lblSelected:function(data){
		var self=this;
		$(".labelItem").removeClass("active");
		$("lbl_"+data.id).addClass("active");
		
		self.curId=data.id;
	},
	addReference:function(e,data){
		var self=e.data.obj;
		if(!self.curId) return;
		e.stopPropagation();
		
		for(x in self.manifest){
			// find the current label
			if(self.curId==self.manifest[x].id){
				if(!self.manifest[x].refs) self.manifest[x].refs=[];
				for(d in data){
					// add data to the reference section of label
					self.manifest[x].refs.push(data[d]);
					$("#lbl_"+self.curId).append("<p>"+data[d]+"</p>");
				}
				
				break;
			}
		}
		
		
		
	},
	sortOutputData:function(){
		var self=this;
		return self.manifest;
	}
	
};

// Plugin object that is fed into TILE_ENGINE 1.0
var LB={
	start:function(x,json){
		var self=this;
	
		// create new label instance
		self.LBL=new Label({data:json});
	},
	restart:function(){
		var self=this;
		// hide the activeBox
		$("#az_activeBox").parent().hide();
		self.LBL.DOM.show();
	},
	_close:"lblClosed",
	close:function(){
		var self=this;
		self.LBL.DOM.hide();
		$("#az_activeBox > .az.inner:eq(0)").show();
		
		$("body:first").trigger(self._close);
	},
	bundleData:function(json){
		var self=this;
		var data=self.LBL.sortOutputData();
		var temp=$.merge(true,{},data);
		json.labels=data;
		// for(l in json.labels){
		// 		for(d in data){
		// 			if(data[d].id==json.labels[l].id){
		// 				json.labels[l]=data[d];
		// 			}
		// 		}
		// 	}
		return json;
		
	}
};

