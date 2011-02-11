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
	saySomething:function(loc){
		var self=this;
		
		var elem=$("<div id=\"\" class=\"line\">"+(((self.count%2)>0)?"Hello World!":"My Plugin Did Something!")+"</div>").appendTo(loc);
		self.count++;
	
		// $("body:first").trigger("callOut",[elem]);
	}
	
	
};


// Plugin Wrapper for HelloWorldObj
HW={
	start:function(engine){
		var self=this;
		// this function will set up everything we need to run HelloWorldObj in TILE
		self.helloworld=new HelloWorldObj();
		self.linksArray=[];
		// Start functions could do anything needed to make your code work with TILE. This includes
		// making a button that will activate your plugin and make it ready to ingest data. We'll do 
		// that here:
		
		// create our button object first...
		var button={
			// what displays when the user hovers over the button
			helptext:"This is a HelloWorld tutorial application",
			// where the button will be placed in the interface - in this case,
			// it will be put in the globalbuttons area next to the TILE logo
			type:'global',
			// Since this is a tutorial plugin, we are placing it in the random or 
			// 'misc' category in the global menu
			category:'misc',
			// This is what will display as the button text
			display:'Hello World!'
		};
		// feed the object into TILE - returns an object
		// with functions and properties
		var el=engine.addToolBarButton(button);
		
		// attach a listener to the returned objects' DOM variable
		el.elem.live('click',function(e){
			// by default, the button is an <a> element, so we need to cancel the default
			// action for a reference element
			e.preventDefault();
			
			// now we're going to manipulate the DOM elements of the interface.
			// TILE has a standard layout, so we can do this by looking at the 
			// index.html which is included in the distributed code
			
			// hide canvas area
			$("#azcontentarea > .az.inner").hide();
			// add a new section to the content area (area to right of screen)
			$("#azcontentarea").append('<div class="az inner helloworld"><div class="header"></div><div class="body"><p id="attachHelloHere" style="helloworld inner">Hello!</p></div></div></div>');
			// use helloworld app to add something
			self.helloworld.saySomething($("#attachHelloHere"));
			
			
		});
		
		// set up global listeners
		$("body").live("newPage newJSON",{obj:self},self.newJSONHandle);
	},
	newJSONHandle:function(e,o){
		
	},
	dataAddedHandle:function(e,o){
		
	},
	newActiveHandle:function(e,o){
		
	}
	
};