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
	
	
	
	
};
HelloWorldObj.prototype={
	saySomething:function(){
		$("body:first").trigger("callOut",[this.text]);
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
		// this function will set up everything we need to run HelloWorldObj in TILE
		var helloworld=new HelloWorldObj();
		// Start functions could do anything needed to make your code work with TILE. This includes
		// making a button that will activate your plugin and make it ready to ingest data. We'll do 
		// that here:
		$(".az_log > .az.inner > .toolbar").append("<div class=\"menuitem\"></div>");
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
	inputData:function(){
		
	},
	removeData:function(){
		
	}
};