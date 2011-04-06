TILE: Text-Image Linking Environment
====================================

The Text-Image Linking Environment (TILE) is a web-based tool for creating and editing image-based electronic editions and digital archives of humanities texts. More information is available on the [TILE website](http://mith.umd.edu/tile).

--------------

TILE API
----
A summary of the most-recent TILE API is included below. [API documentation](http://mith.umd.edu/tile/documentation/tile-api/) is also provided on the TILE website and reflects code shipped in the latest release; the API documented below may change with future commits.

### INITIALIZING ENGINE

**insertPlugin**(plugin {String})
Takes the plugin wrapper obj and passes it off to PluginController, which initiates the plugin into the interface. The plugin will not be attached to any Mode or state of the interface and will therefore be active the entire session. This is useful for plugins that are 'empty' plugins, or only work as backend plugins that save data or react to events.

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

Credits
----
TILE is a collaboration between the [Maryland Institute for Technology in the Humanities](http://mith.umd.edu/) and Indiana University, and has been supported by an NEH Preservation and Access grant. The TILE team includes Tim Bowman, Grant Dickie, Dave Lester, Dot Porter, Doug Reside, Jim Smith, and John Walsh.