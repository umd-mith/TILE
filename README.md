TILE API
========

copyright MITH
--------------

Grant Dickie  
Dave Lester  
Dot Porter  
John Walsh  
Tim Bowman  
Doug Reside  

About
----
TILE is an editing framework for working with digital texts and scholarly editions. It uses JSON to represent and edit manuscript data. To learn more, visit the [main site](http://mith.umd.edu/tile).

Main site
----
[Tile Blog](http://mith.umd.edu/tile)  

[Trunk](http://mith.umd.edu/tile/trunk)  

[Sandbox](http://mith.umd.edu/tile/sandbox)  


[API](http://mith.umd.edu/tile/documentation/tile-api/)
----

ADDING HTML

addToolBarButton(button {Object})
Attaches a button to the interface, based on the criteria passed. Returns a button object.

insertTags(tags {Object array})
Adds tags to the Attach Metadata dialog

insertMode(name {String}, callback {Function})
Creates a new Mode named name, or set of plugins that are organized in the interface. Each Mode has a unique name, which is represented by a button at the top of the interface.

insertModeHTML(html {String}, section {String}, name {String})
Takes the string of HTML code html and inserts it into the pre-defined section of the interface section, which is part of the Mode object with name *name*.

insertPlugin(obj {Object})
Takes the plugin wrapper obj and passes it off to PluginController, which initiates the plugin into the interface.

insertModeButtons(html {String}, section {String}, name {String})
Takes the string of HTML code html and inserts it into the pre-defined toolbar section of the interface section, which is part of the Mode object with name *name*.

INPUT AND OUTPUT

parseJSON(file {String} or file {Object})
Completely resets the JSON session for TILE and either performs an AJAX operation to retrieve JSON from the URL passed in String file, or loads data from an Object

insertData(data {Object})
Takes data and parses it into the TILE JSON session.

getJSON(page {Boolean})
Gives a deep copy of the core JSON structure that has all current data.

getXML(opt {Boolean})
Gives a deepcopy of the JSON, but in XML format

LINKING DATA

linkWithActiveObj(obj1 {Object})
Takes the passed object (see format below) and either attaches it to the active object in PluginController, or if no active object is set, does nothing.

linkObjects(obj1 {Object}, obj2 {Object})
Link passed objects together. Neither is set to the active object in PluginController. Each will be added to the JSON if either or both are not already included.

EDITING DATA

setActiveObj(obj {Object})
Sets a particular object as an active object in PluginController.

attachMetadataDialog(obj {Object}, handle {String})
Places the Metadata Dialog near the area specified by handle and sets the passed obj as the item to add metadata to.

deleteObj(obj {Object})
Deletes an item or reference from the JSON session

PAGE CHANGING

nextPage()
Progresses the TILE JSON pointer to the next page URL and calls the newPage event

prevPage()
Takes the TILE JSON pointer to the previous page URL and calls the newPage event

changePage(val {Integer})
Changes to the Nth position in the URL stack – based on what value the integer passed is (Does not accept negative integers or integers that go beyond the array of pages)
