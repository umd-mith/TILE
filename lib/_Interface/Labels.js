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
	console.log("setting up labels: "+args.data.labels);
	self.labelData=(args.data)?args.data.labels:null;
	self.loadLabels(self.labelData);
	// hide the activeBox
	$("#az_activeBox > .az.inner:eq(0)").hide();
};
Label.prototype={
	loadLabels:function(data){
		var self=this;
		// each label receives an li tag that has a click
		// event attached
		// Click event fires off sendLblData custom event
		for(d in data){
			$("<li id=\"lbl_"+data[d].id+"\">"+data[d].name+"</li>").click(function(){
				// get id for label
				var id=$(this).attr('id').replace("lbl_","");
				// send data
				$("body:first").trigger("sendLblData",[{name:$(this).text(),id:id}]);
			}).appendTo(self.labelList);
		}
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
	}
};

