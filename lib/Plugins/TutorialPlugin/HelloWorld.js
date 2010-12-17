// HelloWorld object 
// by Grant Dickie
// Illustrates how a plugin works within the TILE interface
// 
// A plugin is made up of two parts: the code that runs the plugin and the wrapper that
// works with porting the code into the TILE interface, specifically, making the code work
// with the TILE PluginController

// In this case, HelloWorldObj is the code that works indepently of TILE or any other interface. HW is
// the wrapper that will take the event calls and/or output from HelloWorldObj and feed them into PluginController
// in tile1.0.js

HelloWorldObj=function(){
	// code for the HelloWorldObj has no
	// real connection to the TILE interface code - 
	// this part should be all stand-alone
	this.text="hello world!";
	this.count=0;
};
HelloWorldObj.prototype={
	saySomething:function(){
		var self=this;
		
		var elem=$("<div id=\"\" class=\"line\">"+(((self.count%2)>0)?"Hello World!":"My Plugin Did Something!")+"</div>");
		self.count++;
		alert(elem);
		// $("body:first").trigger("callOut",[elem]);
	}
	
	
};


// Plugin Wrapper for HelloWorldObj
HW={
	id:"HW1000",
	// we're going to use these as event calls
	activeCall:"activeHW1000",
	deleteCall:"deleteHW1000",
	outputCall:"outputHW1000",
	_close:"closeHW1000",
	start:function(){
		var self=this;
		// this function will set up everything we need to run HelloWorldObj in TILE
		self.helloworld=new HelloWorldObj();
		self.linksArray=[];
		// Start functions could do anything needed to make your code work with TILE. This includes
		// making a button that will activate your plugin and make it ready to ingest data. We'll do 
		// that here:
		$("#az_log > .az.inner > .toolbar").append("<div class=\"menuitem\"><ul><li><a id=\"helpPlugin\" class=\"button\">HelloWorld</a></li></ul></div>");
		// This click event will fire an activeCall, making your plugin set as activeTool
		// in PluginController
		$("#helpPlugin").click(function(){
			// in order to be set as activeTool, we need to pass this tool's ID
			$("body:first").trigger(self.activeCall,[self.id]);
			alert("Clicked on the ActiveCall for HelloWorld - HelloWorld is now Active. When you click a transcript line, a Hello World message appears");
			$(".line").bind("mousedown",{obj:self},self.mouseDownHandler);
		
		});
		
		// Here we are attaching a listener that will wait until 
	},
	mouseDownHandler:function(e){
		var self=e.data.obj;
		self.helloworld.saySomething();
	},
	restart:function(){
	},
	close:function(){
		// This function is run duringg PluginController's initTools function. It must
		// be included because all plugins are created, then closed. This function could
		// replace DOM elements back to the way they were if you changed something in start, 
		// or it could just do the minimum: fire the _close event call
		$("body:first").trigger(this._close);

	},
	unActive:function(){
		// After activeCall is called, pluginController will turn this
		// plugin off whenever another plugin makes an activeCall. 
		
		// Action: remove the mousedown listener from lines
		$(".line").unbind("mousedown",self.mouseDownHandler);
	},
	inputData:function(ref,data){
		// Receives the data from PluginController and makes a link
		// between the outside plugin's ref Object and this plugins 
		// data Object
		alert("Connecting "+JSON.stringify(ref)+"  to HelloWorld's "+JSON.stringify(data));
		// At this point, your code can link the ref object to the item referenced in data 
		self.linksArray.push(ref);
	},
	removeData:function(ref,data){
		// This does the reverse of inputData and takes away the reference.
		// Removes the object referenced in ref from the object referenced
		// within data
		alert("Removing "+JSON.stringify(ref)+" from "+JSON.stringify(data));
	},
	bundleData:function(json){
		// Takes the passed JSON session data from PluginController, and 
		// we add the data that we have collected in linksArray
		alert("Now taking the data collected in HW wrapper: "+JSON.stringify(self.linksArray)+" and adding it to the JSON session");
	}
};