TILE: Text-Image Linking Environment
====================================

The Text-Image Linking Environment (TILE) is a web-based tool for creating and editing image-based electronic editions and digital archives of humanities texts. More information is available on the [TILE website](http://mith.umd.edu/tile).

--------------

Local Installation
----
1. Unpack the TILE root directory into your working directory. Your installation should look like this:

index.html
lib/
plugins/
README.md
skins/
tile.js

2. If you do not have a local Web Server running, you can get one from one of these locations:

* MacOS: MAMP - [URL](http://www.mamp.info/en/index.html)

* Windows: WampServer - [URL](http://www.wampserver.com/en/)

* Linux/Ubuntu: The best way to install a server on a Linux machine to install it manually. Here's a tutorial - [Linux](http://wiki.debian.org/LaMp) | [Ubuntu](https://help.ubuntu.com/community/ApacheMySQLPHP) 

3. Activate your local server software and run tile from the active site directory. 

4. Navigate to the index.html page of your root directory for TILE. TILE should be running and loading the default data. To change what it is loading, you can configure the plugins/AutoLoad/autoLoadConfig.php. 

5. The plugins that come loaded with the TILE release can be customized. This can be done by commenting out or adding the *insertMode*, *insertModeHTML*, and *insertPlugin* calls to TILE.engine. For more information, consult the online tutorial [here](http://mith.umd.edu/tile/documentation/user/local-installation/).

TILE API
----
A summary of the most-recent TILE API is included below. [API documentation](http://mith.umd.edu/tile/documentation/tile-api/) is also provided on the TILE website and reflects code shipped in the latest release; the API documented below may change with future commits.

### Global Properties

The base global property is the Object array **TILE**, which contains:
* TILE.engine {Object} - A copy of the TILE_ENGINE instance.
* TILE.url {String} - The current URL 
* TILE.preLoad {String/Object} - URL or Object that represents JSON that will be pre-loaded into TILE. Needs to be set before **activate** is called.
* TILE.scale {Integer} - Current scale for all images in TILE. 
* TILE.experimental {Boolean} - If true, turns on the experimental features for TILE. 


### INITIALIZING ENGINE

**insertPlugin**(plugin {String})
Inserts the script of the plugin with name *plugin* into the HEAD element. *plugin* MUST match the name of the folder in the /plugins folder found in the root TILE installation directory. Example: /plugin/ImageTagger means *plugin* equals 'ImageTagger'.

**insertMode**(name {String})
Creates a new Mode named name, or set of plugins that are organized in the interface. Each Mode has a unique name, which is represented by a button at the top of the interface. Returns: the Mode object.

#####Difference between a Mode and a Plugin: A *Mode* is a collection of *plugins* that all get activated at the same time.#####

**insertModePlugin**(name {String}, plugin {String})
Inserts the plugin named *plugin* into the Mode with matching name *name*. Do not use **insertPlugin** to insert your plugin, then follow up by using **insertModePlugin**, this inserts the plugin twice (One inside a Mode and one outside of a Mode) and can cause errors. 

**registerPlugin**(pw {Object})
*pw* refers to the wrapper of your plugin. Once your script is loaded using the **insertPlugin**, and **insertModePlugin**, and **activate** is called, the TILE.engine will run through its array of plugin *src* values and attach each one to *head*. After this is done, it is up to your plugin to use the **registerPlugin** method call to send its wrapper with the necessary *start()* function to TILE.engine. 

#####Note on providing plugin names: Whatever name you give is used to figure out where in the **plugins/** folder that plugin is located. For example, passing *ImageTagger* will result in *plugins/ImageTagger/tileplugin.js*. It's assumed that there is a **tileplugin.js** file in that folder that contains the necessary functions to register your plugin.#####

**activate**(name {String})
Starts the TILE engine once all of the desired modes and plugins have been inserted using **insertMode**, **insertPlugin**, and **insertModePlugin**. If *name* is given, finds the matching Mode with that name and activates it first, after loading all of the src files.

### ADDING HTML

**addImportExportFormats**(str {String}) **DEPRECATED**
Attaches HTML in string format *str* to the Load and Save dialog drop-downs.

**addToolBarButton**(button {Object})
Attaches a button to the interface, based on the criteria passed. Returns a button object.

**insertTags**(tags {Object array})
Adds tags to the Attach Metadata dialog

**insertModeHTML**(html {String}, section {String}, name {String})
Takes the string of HTML code html and inserts it into the pre-defined section of the interface section, which is part of the Mode object with name *name*.

**insertModeButtons**(html {String}, section {String}, name {String})
Takes the string of HTML code html and inserts it into the pre-defined toolbar section of the interface section, which is part of the Mode object with name *name*.

### INPUT AND OUTPUT

**parseJSON**(file {String} or file {Object})
Completely resets the JSON session for TILE and either performs an AJAX operation to retrieve JSON from the URL passed in String file, or loads data from an Object

**insertData**(data {Object})
Takes data and parses it into the TILE JSON session.

**updateData**(obj {Object})
Takes the passed parameter, finds it in the coredata JSON session, then replaces any old data with new data.

**getJSON**(page {Boolean})
Gives a deep copy of the core JSON structure that has all current data.

**getXML**(opt {Boolean})
Gives a deepcopy of the JSON, but in XML format

### LINKING DATA

**linkWithActiveObj**(obj1 {Object})
Takes the passed object (see format below) and either attaches it to the active object in PluginController, or if no active object is set, does nothing.

**linkObjects**(obj1 {Object}, obj2 {Object})
Link passed objects together. Neither is set to the active object in PluginController. Each will be added to the JSON if either or both are not already included.

### EDITING DATA

**setActiveObj**(obj {Object})
Sets a particular object as an active object in PluginController.

**attachMetadataDialog**(obj {Object}, handle {String})
Places the Metadata Dialog near the area specified by handle and sets the passed obj as the item to add metadata to.

**deleteObj**(obj {Object})
Deletes an item or reference from the JSON session

### PAGE CHANGING

**nextPage**()
Progresses the TILE JSON pointer to the next page URL and calls the newPage event

**prevPage**()
Takes the TILE JSON pointer to the previous page URL and calls the newPage event

**changePage**(val {Integer})
Changes to the Nth position in the URL stack – based on what value the integer passed is (Does not accept negative integers or integers that go beyond the array of pages)

Events
------

**newActive**(obj {Object})
Fired when a new object is set to active in the TILE core - passes the TILE Object that is now active.

**newJSON**
Fired when a new JSON object is loaded into TILE and set as the core JSON data.

**newPage**
Fired when nextPage(), prevPage(), or changePage() have been called.

**dataAdded**
Fired when new data is inserted into the TILE core through TILE.engine.insertData()

**dataUpdated**
Fired when data is changed or replaced within the TILE core JSON. Passes the TILE Object that has been changed.

**dataDeleted**
Fired when data is removed from the TILE core JSON. Passes the TILE Object that has been removed.

Release Notes for Version 1.0
=====

General 
----
* Interface added for tagging and annotating manuscript images (Image Annotation)
* Interface added for automatically tagging lines using basic image analysis tools (Auto Line Recognizer)
* Dialog tools for loading and saving data 
* Support for TEI P5 formatted XML data
* Support for XML in Alto metadata scheme
* Improved visuals for attaching metadata to transcript lines
* Fixed label attachment bugs 
* Improvements to the Auto Line Recognizer (ALR)
* Improved workflow and accuracy using gray-image detection for ALR
* New documentation for the [TILE User Guide](http://mith.umd.edu/tile/documentation/user)

Library Updates
----
* jQuery 1.6.2 update

UI
----
* ALR instructions made to be clearer
* Changed version message area

For Developers
----
* New comments - following JSDoc standards
* activate works without passing *Mode* {String} variable
* Changed workflow for adding and developing plugins. More online: [Plugin Tutorial](http://mith.umd.edu/tile/documentation/plugin)
* Added following to API since 0.10:
	* [insertPlugin](http://mith.umd.edu/tile/documentation/tile-api/insertpluginplugin-string)
	* [insertMode](http://mith.umd.edu/tile/documentation/tile-api/insertmodename-string)
	* [insertModePlugin](http://mith.umd.edu/tile/documentation/tile-api/insertmodehtmlhtml-string-section-string-name-string)
	* [registerPlugin](http://mith.umd.edu/tile/documentation/tile-api/registerpluginpw-object)
	* [activate](http://mith.umd.edu/tile/documentation/tile-api/1202-2)
	* [addToolBarButton](http://mith.umd.edu/tile/documentation/tile-api/addtoolbarbuttonbutton-object)
	* [insertTags](http://mith.umd.edu/tile/documentation/tile-api/inserttagstags-array)
	* [insertModeHTML](http://mith.umd.edu/tile/documentation/tile-api/insertmodebuttonshtml-string-section-string-name-string)
	* [parseJSON](http://mith.umd.edu/tile/documentation/tile-api/parsejsonfile-string-or-file-object)
	* [insertData](http://mith.umd.edu/tile/documentation/tile-api/insertdatadata-object)
	* [updateData](http://mith.umd.edu/tile/documentation/tile-api/updatedataobj-object)
	* [getJSON](http://mith.umd.edu/tile/documentation/tile-api/getjsonpage-boolean)
	* [getXML](http://mith.umd.edu/tile/documentation/tile-api/getxmlopt-boolean)
	* [linkWithActiveObj](http://mith.umd.edu/tile/documentation/tile-api/linkwithactiveobjobj1-object)
	* [linkObjects](http://mith.umd.edu/tile/documentation/tile-api/linkobjectsobj1-object-obj2-object)
	* [setActiveObj](http://mith.umd.edu/tile/documentation/tile-api/setactiveobjobj-object)
	* [attachMetadataDialog](http://mith.umd.edu/tile/documentation/tile-api/setactiveobjobj-object)
	* [deleteObj](http://mith.umd.edu/tile/documentation/tile-api/deleteobjobj-object)
	* [nextPage](http://mith.umd.edu/tile/documentation/tile-api/nextpage)
	* [prevPage](http://mith.umd.edu/tile/documentation/tile-api/prevpage)
	* [changePage](http://mith.umd.edu/tile/documentation/tile-api/changepageval-integer)
* Added events for data editing that happens in the core JSON:
	* newActive *(Sends TILE Object obj)*
	* newJSON
	* dataAdded *(Sends TILE Object obj)*
	* dataLinked *(Sends array of two TILE Objects obj1, obj2)*
	* dataUpdated *(Sends TILE Object obj)*
	* dataDeleted *(Sends TILE Object obj)*

Credits
----
TILE is a collaboration between the [Maryland Institute for Technology in the Humanities](http://mith.umd.edu/) and Indiana University, and has been supported by an NEH Preservation and Access grant. The TILE team includes Tim Bowman, Grant Dickie, Dave Lester, Dot Porter, Doug Reside, Jim Smith, and John Walsh.