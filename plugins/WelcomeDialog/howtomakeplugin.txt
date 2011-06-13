<div>
<h2>Creating a Plugin in TILE</h2>
Some things you should (preferably) know or have a firm grasp on before reading this:

* HTML

<a href="http://www.w3schools.com/html/default.asp">http://www.w3schools.com/html/default.asp</a>

* Javascript

<a href="http://www.w3schools.com/js/default.asp">http://www.w3schools.com/js/default.asp</a>

* jQuery framework

<a href="http://www.jquery.com/">http://www.jquery.com</a>

* W3C Events

<a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html">http://www.w3.org/TR/DOM-Level-2-Events/events.html</a>

* jQuery Event Object

This tutorial will be going step by step through pieces of code, and it will reference concepts and ideas related to the above topics. So be forewarned.

Facts about Plugins:

* Current Examples of Plugins:
<ul>
	<li>Transcript</li>
	<li>Image Tagger</li>
	<li>Auto Line Recognizer</li>
	<li>Labels</li>
	<li>Text Selections</li>
	<li>Auto Loading Data</li>
	<li>Exporting to TEI XML or plain XML 1.0</li>
	<li>Importing Data</li>
</ul>
<div>* Plugins have two basic modes: Active and Unactive. It’s up to the developers what ‘active’ and ‘unactive’ means. For example, Auto Line Recognizer will change the HTML of the main page when it is active, whereas Transcript doesn’t do anything when it is active or unactive - except highlight/un-highlight the transcript line a user clicked on. Finally, Image Tagger is always active until a tool such as Auto Line Recognizer turns it off.</div>
<div>* Plugins can have the option of saving to the JSON session data. It is up to the creator of a plugin to decide where the best spot for storing JSON data is located. To store data into the JSON session you have to create and use the bundleData method in your plugin wrapper</div>
<div>* Best practices for storing data into JSON:</div>
<ul>Create an array inside your plugin wrapper (or use something that is already located inside the plugin) that contains a manifest of the data produced by your plugin. This means that if your plugin creates shapes, you’d want a shapeManifest object (not necessarily of that name) that contains an associative array of the shape objects created by the user.

When exporting data into the JSON, or when editing and deleting links made between what’s in your manifest and what’s in another plugin’s manifest, you would then go to your shapeManifest, find the shape using and ID or some other key, then manipulate the data or erase it accordingly.</ul>
</div>
<div>

BASICS: HELLO WORLD PLUGIN

To illustrate the concept of writing a plugin for TILE, we'll take a look at how the Hello World plugin is set up - step by step:

First, let’s take a look at the actual code object that is created in our script:
<pre style="padding-left: 15px;">HelloWorldObj=function(){</pre>
<pre style="padding-left: 30px;">// code for the HelloWorldObj has no
// real connection to the TILE interface code -
// this part should be all stand-alone
this.text="hello world!";
this.count=0;</pre>
<pre style="padding-left: 15px;">};</pre>
<pre>   HelloWorldObj.prototype={
      saySomething:function(loc){
        var self=this;
        // Attach a random HTML element to the passed loc
        var elem=$("&lt;div id=\"\" class=\"line\"&gt;"+(((self.count%2)&gt;0)?"Hello World!":"My Plugin Did Something!")+"&lt;/div&gt;").appendTo(loc);
        self.count++;
   }

};
</pre>
So, HelloWorld is a pretty straight-forward plugin that initializes some text to be alerted to the user. Important to note is that TILE does NOT read this script data. It has no knowledge (unless you make it aware in the plugin wrapper) of what’s going on up here. This has its advantages, since you can theoretically separate the code you have written outside of the wrapper from the wrapper itself. The wrapper is thus using objects and methods outside of its scope, thus making those objects and methods private and protected from the rest of TILE.

Now lets take a look at the wrapper and it’s functions:
<pre>// Start of HelloWorld Plugin Wrapper
    var HW={
</pre>
This small snippet is important to note. The name of the plugin wrapper is what is fed into TILE in its constructor. So if we started TILE with only this  plugin, the TILE_ENGINE constructor would look like:
<pre>    // only including wrapper for HelloWorld (i.e. HW)
    var engine=new TILE_ENGINE({toolSet:[HW]});
</pre>
Inside the wrapper is the start function, called after the TILE_ENGINE is initialized:
<pre style="padding-left: 15px;">start:function(engine){
    var self=this;

     // first, we initialize the Object constructor. Note that the constructor comes from data
     // this function will set up everything we need to run HelloWorldObj in TILE
     self.helloworld=new HelloWorldObj();
}
</pre>
When TILE is loaded, it calls the start function for every plugin wrapper that is loaded into TILE. So we include the call to HelloWorldObj here in order to start up our object. This is an incredibly simple version of our plugin - why not make it more complicated? Let's do that by adding a button to the interface to give our plugin some more flair. The API function for adding buttons is:

addToolBarButton(button {Object})

Where <em>button</em> is the object we are going to create ourselves and feed to the API function. Here's the new start method, complete with a button to add to the interface using addToolBarButton:
<pre>    start:function(engine){
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
     // by default, the button is an &lt;a&gt; element, so we need to cancel the default
     // action for a reference element
     e.preventDefault();

     // now we're going to manipulate the DOM elements of the interface.
     // TILE has a standard layout, so we can do this by looking at the
     // index.html which is included in the distributed code

     // hide canvas area
     $("#azcontentarea &gt; .az.inner").hide();
     // add a new section to the content area (area to right of screen)
     $("#azcontentarea").append('&lt;div class="az inner helloworld"&gt;&lt;div class="header"&gt;&lt;/div&gt;&lt;div class="body"&gt;&lt;div id="GoBack" class="button"&gt;&lt;    /div&gt;&lt;p id="attachHelloHere" style="helloworld inner"&gt;Hello!&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;');
     // use helloworld app to add something
     self.helloworld.saySomething($("#attachHelloHere"));
     // Now we set up the button so that the interface goes back
     $(".az.inner.helloworld &gt; .body &gt; #GoBack").live('click',function(e){
     // hide all content in the canvas area
     $("#azcontentarea &gt; .az.inner").hide();
     // show the top canvas element
     $("#azcontentarea &gt; .az.inner:eq(0)").show();
  });

 });
}
</pre>
When the plugin is loaded into TILE, it will add a HelloWorld! Button to the Misc section of the globalbuttons area. The HTML will look like this:
<pre>   &lt;div&gt;
       &lt;div&gt;&lt;div&gt;&lt;a title="Automatically recognizes lines" href="" id="A14"&gt;Auto Line Recognizer&lt;/a&gt;&lt;/div&gt;&lt;div&gt;&lt;a title="Annotate an image using shapes and attach metadata to shapes and transcript lines" href="" id="Z4"&gt;Image Annotation&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;
       &lt;div&gt;
       &lt;div&gt;&lt;a title="Discard all changes and start over" href="" id="restartall"&gt;Start Over&lt;/a&gt;&lt;/div&gt;
       &lt;div&gt;&lt;a title="Save the current session" href="" id="save_tags"&gt;Save&lt;/a&gt;&lt;/div&gt;&lt;div&gt;&lt;a title="Load a new session" href="" id="J189"&gt;Load&lt;/a&gt;&lt;/div&gt;&lt;div&gt;&lt;a title="Export your data as XML" href="" id="K179"&gt;Export Data&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;
       &lt;div&gt;

       &lt;div&gt;&lt;a href="http://mith.umd.edu/tile/documentation" title="Go to the TILE documentation page" id="tilehelp"&gt;Documentation&lt;/a&gt;&lt;/div&gt;

       &lt;div&gt;&lt;span&gt;version 0.9&lt;/span&gt;&lt;/div&gt;&lt;div&gt;&lt;a title="This is a HelloWorld tutorial application" href="" id="K213"&gt;Hello World!&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;

  &lt;/div&gt;
</pre>
Because we specified 'misc' in the button object passed to TILE, TILE placed the button in the miscitems category. Now when users click on the button that says HelloWorld!, the actions we specify occur. Of course, we don't have to use that functionality. Something could happen when the user mouses over the button - or only when they double click. An area in the canvas isn't all that has to happen - maybe something else could occur, such as a dialog box opening up. The possibilities are endless!

CREATING AND EDITING

Now we can mess around with creating and editing content, using the TILE API commands for inputting and managing TILE data. These commands are listed in the section TILE API under Editing.

For TILE, objects that are going to be output in the JSON session go through the TILE_ENGINE object, here referenced as <em>engine</em>. Before we get started using engine to create, manipulate, and link together objects, a quick word about the TILE JSON object. Engine contains the necessary private functions to edit the TILE JSON, and as a developer, you interact with the JSON through the public API methods listed in the TILE API. This means using a controlled vocabulary of sorts to talk to the core of TILE: the JSON session. In addition, each object passed using the input and output methods needs to have its own controlled language. This is to ensure that the object is placed in the right location inside of the TILE JSON. Let's take a look at how this is expressed in the HelloWorld plugin:
<pre style="padding-left: 15px;">passedObject: {

	// id: String - unique identifier for this object - should match the ID (if any) of your object

	id: "unit1",

	// type: String - this name is used as the name of the array your object is stored in the JSON when referenced by another object.

	type: "hellounits",

	// jsonName: String - name that the full object should be stored under within the JSON - the two options are to put the same value as type here or to use the global URL variable TILEPAGE if your object

	// should be stored at the page level

	jsonName: TILEPAGE,

	// obj: Object - the actual object that will be stored under jsonName in the TILE JSON session data

	obj: {id:"hello1",text:"Hello World!"}

};
</pre>
Taking the above object and using <em>engine.insertData</em>, engine will place our HelloWorld object within the JSON like this:
<pre style="padding-left: 15px;">// TILE JSON snippet

	// ...

	// page with url matching TILEPAGE

	{ url: "3.jpg", info: "infoonpage", lines: [{id:"l12",text:"lorum ipsum facto",info:"l&gt;div&gt;p"},{id:"l13",text:"lorum ipsum facto",info:"l&gt;div2&gt;p"}],

	// our object reference goes in its own array inside the page. The array name is specified by the type variable

	hellounits: [{id:"hello1",text:"Hello World!"}]

	// ...
</pre>
So now we want to perform the above operation in our HelloWorld plugin. To do this, we will create a HelloWorld object, initialize it in the TILE JSON, and attach the TILE metadata dialog box to the object. First let's start with creating our HelloWorld object, which is pretty simple and only has two variables: id and text:
<pre>    // first we create a new button in the attached HTML:
    // add a new section to the content area (area to right of screen)
    $("#azcontentarea").append('&lt;div&gt;&lt;div&gt;&lt;div&gt;&lt;a id="generateHello"&gt;Create TILE Object&lt;/a&gt;&lt;/div&gt;&lt;/div&gt;&lt;div&gt;&lt;p id="attachHelloHere" style="helloworld inner"&gt;Hello!&lt;/p&gt;&lt;/div&gt;&lt;/div&gt;&lt;/div&gt;');
     // use helloworld app to add something
     self.helloworld.saySomething($("#attachHelloHere"));

     // attach listener to the generate content button
     $("#generateHello").bind('click',function(e){
         e.preventDefault();

        // get the object
        var obj=self.helloworld.genObj();
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

  });
</pre>
We follow the same pattern for all objects: generate the object within our own code, wrap the object in a TILE wrapper, then send off to the engine to be processed. After this is done, we can delete or manage the object as we see fit.

LINKING HELLOWORLD OBJECT TO ANOTHER OBJECT

Let's assume that we want to attach our HelloWorld object to a completely different object somewhere in the TILE universe. We can only assume that A.) There are other objects in the TILE interface and B.) These objects will have the same wrapper as the one we wrapped our object in, only with different values for the variables. There is an easy way of doing this and a hard way. First, the hard way: we use the <em>engine.linkObjects</em> method to link together two objects found within the entire TILE JSON, like so:

This is useful if you know what two objects you are linking together, that is, their <em>type</em> and <em>jsonName</em> values. However, most of the time we don't know this information. So instead we pick the simpler method, which is to attach our object to whatever TILE says is the currently active object. An object becomes an active object when its plugin calls <em>engine.setActiveObj(obj)</em> with <em>obj</em> being the plugins' own object it wants future data to be attached to:
<pre style="padding-left: 15px;">// Create object
var obj = {id:'l_1',text:"HelloWorld!"};

// wrap in TILE wrapper
var sendObj={id:obj.id,type:'hellounits',jsonName:TILEPAGE,obj:obj};

// make the active object in TILE - now any future data will be appended to this object in the
// TILE JSON session
engine.setActiveObject(sendObj);
</pre>
Let's not stop there. HelloWorld should have the best of both worlds: being attached to the active object and having a dialog box open up that allows users to link more data to the HelloWorld object.
<pre style="padding-left: 15px;">// attach with the current active object (if one is set)
engine.linkWithActiveObj(sendObj);

// attach the metadata dialog, which allows user to link more data
// to our object
// first, we need to establish where the dialog should go (default is body tag)
var handle="#azcontentarea &gt; .az.inner.helloworld &gt; .header";
// call the engine to attach the dialog
engine.attachMetadataDialog(sendObj,handle);
</pre>
Now, the data is linked with the active object (or not, if no active object is set), and it has a Metadata Box attached to it, so users can link more data to our HelloWorld object.

DELETING OBJECTS

<p>We will want to delete our HelloWorld object from the global JSON data. To do this, we need to use the <em>engine.deleteObj</em> method. This method is special, since it can take either one or two arguments and perform two different actions: A.) It takes one object, deletes that object from the JSON and any references made to that object, or B.) it takes two objects as arguments and deletes the reference of object 2 from object 1. See the TILE API section for more details.</p>
<p>
In our case, we want to delete the HelloWorld object completely, so we use <em>engine.deleteObj</em> with only one parameter. This will delete our HelloWorld object and all of its links ONLY from the TILE JSON - we would have to delete it internally in our own plugin for it to be deleted within our plugin. In this scenario, we create a button that will delete the HelloWorld object.</p>
<pre style="padding-left: 15px;">      $("#deleteHello").bind('click',function(e){
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
</pre>

EVENT HANDLING

<p>Data is created and put into TILE using the insertData, linkObjects, linkWithActiveObj methods in the API. Data can also be deleted and removed from the TILE session using deleteObj. HelloWorld doesn't exist alone in this behavior, however: there are many plugins like HelloWorld in TILE that may be running simultaneously. Likewise, they will be running commands to create, edit, and delete metadata. Our application may want to interact with this newly created data, because for HelloWorld, this data might be interesting.</p>
<p>Enter TILE events and event handlers. By events, we mean Javascript events that are triggered by DOM elements, namely the <em>body</em> tag. Every time an event is called by a TILE event, special data is passed that includes a copy of the <em>TILE_ENGINE</em> object and all of the currently active objects. Event handlers are the scripts that plugin developers write to handle the data passed when these events are called.</p>
<p><strong>New plugin: Views</strong></p>
<p>In order to better demonstrate what is going on with events, lets use a plugin that better utilizes the event calls and uses event handlers. Our HelloWorld application only does so much. It only creates and deletes data from the JSON and it is not really interested in interacting with other plugins. <em>Views</em> (located in lib/Plugins/Views/views.js) is a plugin that takes whatever the current snapshot of the TILE data is and displays it in HTML. It does this by grabbing the current state of the TILE JSON using the TILE API functions, then reacts to changes in the data via the events that TILE outputs. In the following sections we'll list an event fired by TILE, explain it, and then show an example of how Views would write a handler for this event.</p>
<p><strong>First, a look at Views</strong></p>
<p>The following is the plugin wrapper for the Views plugin. Take a look specifically at the section of code that attaches the global TILE events to the plugin's event handlers.</p>
<pre style="padding-left:15px;">
var V={
	// The start function that's called when TILE_ENGINE initializes
	start:function(engine){
		var self=this;
		self.v=new Views(engine);
		// Set up button object to send to TILE
		var button={
			id:'getViews',
			display:'Source',
			type:'global',
			category:'mode',
			helptext:'View your data in HTML or SVG format'
		};
		// Create a button in TILE 
		self.el=engine.addToolBarButton(button);
		if(!self.el) return;
		self.el.elem.live('click',function(e){
			e.preventDefault();
			// makes our button turn green in the 
			// top menu
			self.el.makeActive();
			
			// hide the header and the main body
			$(".ui-dialog").hide();
			// display our plugin
			$("#azcontentarea > .az.inner").hide();
			$("#views").show();
			$("#raphael_view_json").hide();
			$("#list_view_json").show();
			
		});
		// set up action for the back button
		$("#gobacktotile").live('mousedown click',function(){
			$("#views").hide();
			$("#azcontentarea > .az.inner").hide();
			$("#azcontentarea > .az.inner:eq(0)").show();
			self.el.unActive();
		});
		// initialize the HTML for this JSON
		var data=engine.getJSON(true);
		$("#list_view_json").empty();
		$("#list_view_json").append(self.v.parseJson(data));
		
	
		// SETTING UP THE TILE EVENTS HERE //
		// setup the global TILE event listeners
		// for whenever a user uses the nextPage, prevPage, changePage or parseJSON commands
		$("body").live("newPage newJSON",{obj:self},self.newJSONHandle);
		// for whenever data is added, edited or deleted in the TILE JSON
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		// for whenever an object becomes active in TILE
		$("body").live("newActive",{obj:self},self.newActiveHandle);
		// FINISHED SETTING UP EVENTS //
	
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	newJSONHandle:function(e,o){
		var self=e.data.obj;
		// erase previous HTML
		$("#list_view_json").empty();
		
		// JSON is loaded - reset the HTML
		var data=o.engine.getJSON(true);
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	dataAddedHandle:function(e,o){
		var self=e.data.obj;		
		// new data has been created, edited, or deleted from
		// the central JSON core.
		// Views is going to update the parsed data it has
		// stored.
		var data=o.engine.getJSON(true);
		// erase previous HTML
		$("#list_view_json").empty();
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
		
		// bold the activeItems
		for(var prop in o.activeItems){
			if($("#greenlayer > #"+o.activeItems[prop].id).length){
				$("#greenlayer > #"+o.activeItems[prop].id).addClass('boldObj');
			}
		}
	},
	// Gets passed
	// o.engine : {object}
	// o.activeItems : {Array}
	newActiveHandle:function(e,o){
		// reset the HTML and then bold the activeItems
		var self=e.data.obj;
		// JSON is loaded - reset the HTML
		var data=o.engine.getJSON(true);
		// erase previous HTML
		$("#list_view_json").empty();
		// now the views object will parse the data into both HTML and SVG
		$("#list_view_json").append(self.v.parseJson(data));
		
		$("#greenlayer > .object").removeClass("boldObj");
		
		// bold the activeItems
		for(var prop in o.activeItems){
			if($("#"+o.activeItems[prop].id+".object").length){
				$("#"+o.activeItems[prop].id+".object").addClass('boldObj');
			}
		}
		
	}
};
</pre>
<p><strong>newJSON</strong></p>
<p>The newJSON event is triggered whenever a new JSON session is loaded using the <em>parseJSON</em> method in the TILE API. This means that when a user loads a new set of data into TILE, it will replace any set that TILE was previously working on, and it will reset all memory. If we want our plugins to react to this change, we need to set them up with handlers for this event.</p>
<p>In the case of Views, we do want to react to this event. So when the event is triggered, this code catches the event and uses the passed <em>engine</em> and <em>activeItems</em> parameters to change the filtered data:</p>
<pre style="padding-left:15px;">
// Gets passed
// o.engine : {object}
// o.activeItems : {Array}
newJSONHandle:function(e,o){
	var self=e.data.obj;
	// erase previous HTML
	$("#list_view_json").empty();
	
	// JSON is loaded - reset the HTML
	var data=o.engine.getJSON(true);
	// now the views object will parse the data into both HTML and SVG
	$("#list_view_json").append(self.v.parseJson(data));
}
</pre>
<p><strong>newPage</strong></p>
<p>Some plugins make use of the API functions <em>nextPage</em>, <em>prevPage</em>, and <em>changePage</em> to iterate through the <em>pages</em> array in the TILE JSON. Each of these functions triggers the <strong>newPage</strong> event. For those plugins that pay attention to which page their on (e.g. Image-tagging tools that need to paginate, transcript tools that have to change the text to what the current page data shows), this event is important. In most cases, TILE plugins that are packaged with the current release of TILE have <strong>newPage</strong> and <strong>newJSON</strong> bound to the same handler. This is because similar actions may be taken for both events, i.e., both events signify a marginal to large change in the data.</p>
<p>For Views, the event is bound with <strong>newJSON</strong>, since all it cares about is that the data has changed somehow - it doesn't store any record of previous data that has to be wiped clean.</p>
<pre style="padding-left:15px;">
// Gets passed
// o.engine : {object}
// o.activeItems : {Array}
newJSONHandle:function(e,o){
	var self=e.data.obj;
	// erase previous HTML
	$("#list_view_json").empty();
	
	// JSON is loaded - reset the HTML
	var data=o.engine.getJSON(true);
	// now the views object will parse the data into both HTML and SVG
	$("#list_view_json").append(self.v.parseJson(data));
}
</pre>

<p><strong>dataAdded</strong></p>
<p>When objects are added, edited, or deleted in the TILE JSON session using any of the appropriate TILE API methods, the <strong>dataAdded</strong> event is called. Views reacts to this event by updating what is currently being viewed on the page.</p>
<pre style="padding-left:15px;">
// Gets passed
// o.engine : {object}
// o.activeItems : {Array}
dataAddedHandle:function(e,o){
	var self=e.data.obj;		
	// new data has been created, edited, or deleted from
	// the central JSON core.
	// Views is going to update the parsed data it has
	// stored.
	var data=o.engine.getJSON(true);
	// erase previous HTML
	$("#list_view_json").empty();
	// now the views object will parse the data into both HTML and SVG
	$("#list_view_json").append(self.v.parseJson(data));
	
	// bold the activeItems
	for(var prop in o.activeItems){
		if($("#greenlayer > #"+o.activeItems[prop].id).length){
			$("#greenlayer > #"+o.activeItems[prop].id).addClass('boldObj');
		}
	}
}
</pre>

<p><strong>newActive</strong></p>
<p>Whenever an object is set to be active, it is registered in the TILE core and announced via the <strong>newActive</strong> event. This means that other plugins will have to de-activate any active objects that they have registered, or perhaps attach data to the active object. The active object and all of its references are included in the passed parameter <em>activeItems</em>.</p>
<p>In the case of Views, we want to attach a special class to the HTML element(s) representing the currently active object(s). So when newPage is triggered, our code goes through the array of activeItems, highlighting each matching DOM element.</p>
<pre style="padding-left:15px;">
// Gets passed
// o.engine : {object}
// o.activeItems : {Array}
newActiveHandle:function(e,o){
	// reset the HTML and then bold the activeItems
	var self=e.data.obj;
	// JSON is loaded - reset the HTML
	var data=o.engine.getJSON(true);
	// erase previous HTML
	$("#list_view_json").empty();
	// now the views object will parse the data into both HTML and SVG
	$("#list_view_json").append(self.v.parseJson(data));
	
	$("#greenlayer > .object").removeClass("boldObj");
	
	// bold the activeItems
	for(var prop in o.activeItems){
		if($("#"+o.activeItems[prop].id+".object").length){
			$("#"+o.activeItems[prop].id+".object").addClass('boldObj');
		}
	}
	
}
</pre>
</div>