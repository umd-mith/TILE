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
	},
	// creates a HelloWorld object and returns it
	genObj:function(){
		var self=this;
		var randstr="hajklfhadskljfgueumcnnuyiuya";
		var n=(Math.random()*(randstr.length-1));
		var id=randstr[n]+(n*5);
		var obj={id:id,text:"HelloWorld!"};
		return obj;
	}
	
	
};


// Plugin Wrapper for HelloWorldObj
HW={
	start:function(engine){
		var self=this;
		// this function will set up everything we need to run HelloWorldObj in TILE
		self.helloworld=new HelloWorldObj();
		self.linksArray=[];
		self.obj=null;
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
			$("#azcontentarea").append('<div class="az inner helloworld"><div class="header"><div class="menuitem"><a id="generateHello">Create TILE Object</a></div></div><div class="body"><p id="attachHelloHere" style="helloworld inner">Hello!</p></div></div></div>');
			// use helloworld app to add something
			self.helloworld.saySomething($("#attachHelloHere"));
			
			// attach listener to the generate content button
			$("#generateHello").bind('click',function(e){
				e.preventDefault();
				// we only store one object at a time - if already set,
				// cancel
				if(self.obj) return;
				// get the object 
				var obj=self.helloworld.genObj();
				// set the
				
				// put the object in a wrapper
				var sendObj={
					// Unique id 
					id:obj.id,
					// What the array will be named if referenced by another object
					type:'hellounits',
					// We are using the page-level jsonName so it will be stored within this page
					jsonName:TILEPAGE,
					obj:obj
				};
				
				
				// Send off to the engine
				engine.insertData(sendObj);
				
				// attach with the current active object (if one is set)
				engine.linkWithActiveObj(sendObj);
				
				// attach the metadata dialog, which allows user to link more data
				// to our object
				// first, we need to establish where the dialog should go (default is body tag)
				var handle="#azcontentarea > .az.inner.helloworld > .header";
				// call the engine to attach the dialog
				engine.attachMetadataDialog(sendObj,handle);
			});
			
			$("#deleteHello").bind('click',function(e){
				e.preventDefault();
				if(!self.obj) return;
				// create a wrapper for our current object
				var sendObj={
					// Unique id 
					id:self.obj.id,
					// What the array will be named if referenced by another object
					type:'hellounits',
					// We are using the page-level jsonName so it will be stored within this page
					jsonName:TILEPAGE,
					obj:self.obj
				};
				
				// delete the current object
				engine.deleteObj(self.obj);
				
				
			});
			
			
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