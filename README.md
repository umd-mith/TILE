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

Main site
----
[Tile Blog](http://mith.umd.edu/tile)  

[Trunk](http://mith.umd.edu/tile/trunk)  

[Sandbox](http://mith.umd.edu/tile/sandbox)  


API
----

> ##lib/

  >> main/
	
>>> tile1.0.js

This file includes the TILE Interface and all of its necessary components. Developers who wish to write plugins should be able to use any of the following objects, except for TILE_ENGINE, which is used to run plugins.

FloatingDiv
Constructor: new FloatingDiv();
    _rgb2hex(rgb : {String}) -

Takes a rgb value (nnn,nnn,nnn) and returns a hexidecimal color value:             #nnnnnn
    init(myID:{String},labels:{Array}) -

Creates the FloatingDiv HTML and attaches it to the element with ID myID. Labels is an array of the metadata to be used in for the autoComplete and to be attached to passed objects
    createDialog(myID:{String}) -

Initializes the jQuery Dialog plugin on the HTML created in init.
    addAutoComplete(elem:{Object}, labels:{Array}) -

adds a jQuery AutoComplete object to the passed elem. Attaches the metadata listed in labels to the autocomplete.

addColorSelector(myID:{String}, o:{String}) -

Attaches ColorSelector plugin to the element with ID myID. Sets o as the base color (o must be in hexidecimal format).

setInputObject(o:{Object},refs:{Array}) -

o represents the TILE object that is passed. It must have an ID for it’s tool, an ID for the object passed (shape, label, etc.), and the type of object (‘labels’,’shapes’,etc.). Makes o the current link to attach metadata to and attaches any metadata already attached in the metadata listing.

sendLabels -

Finds all labels that the user references. Puts parsed data into array and passes it out using the floatDivOutput event call.

deleteLinkHandle(id:{String}) -

Take passed id, find the data it references, then pass this data to the PluginController through deleteMetaLink event call

Events
Triggers:
floatDivOutput
   Passes:
       * link - currently active link as set by setInputObject
       * ref - referenced object to attach to link

deleteMetaLink
   Passes:
      * {Object} containing:
           ** id: {String}
           ** type: {String}
           ** tool: {String} - tool ID that the object of id and type belongs to
           ** parentTool: {String} - tool ID of the tool that linked this object to itself
           ** parentObj: {Object} - parent object from the tool of ID parentTool
           ** parentType: {String} - type of object from tool of ID parentTool
   
colorChanged
   Passes:
       * hexidecimal color value
       * currently active link to apply change to


HelpBox

Usage:

new HelpBox({text:{String},iconId:{String}});

* text {String} - text to display when the mouse hovers over the icon

* iconId {String} - element ID of the icon to attach HelpBox functions to

appear -

Called by mouseover. Causes the DOM to show

hide -

Called by mouseout. Causes the DOM to hide

ImportDialog
Constructor:
new ImportDialog({loc: {String}, html: {String}, auto: {String}});

Arguments:

* loc {String} - ID of element to attach DOM to

* html {String} - HTML to create and attach to loc
    * auto - {String} What to put as default in the "File input" area

    display({e: {Event}) -

Displays the container DOM
    close({e: {Event}}) -

Hides the container DOM
    handleMultiForm(e: {Event}) -

finds the transcript/image file that the user has input and  sends it off in a CustomEvent trigger

Events
Triggers:
                       schemaFileImported
    Passes:
        * file {String} - name of file to be processed for JSON

  
LoadTags
Constructor: LoadTags({loc: {String}, html: {String}})

Arguments:

* loc {String} - ID of element to attach DOM to

* html {String} - HTML to create and attach to loc
  
    display({e: {Event}) - Displays the container DOM

    close({e: {Event}}) - Hides the container DOM
**NOTE: The LoadTags object contains an HTML form that handles all the POST request to the PHP script loadJSON.php, which in turn re-directs the user back to TILE with a SESSION variable ‘json’   

Events
Listens for:
openLoadTags
Shows the DOM

openImport, openExport, closeLoadTags
Hides the DOM

ExportDialog
Constructor: LoadTags({loc: {String}, html: {String}, defaultExport:{String}})

Arguments:

* loc {String} - ID of element to attach DOM to

* html {String} - HTML to create and attach to loc

* defaultExport {String} - default path to use as the export XML script

display({e: {Event}, njson {Object}) -

Displays the container DOM and sets the json to be eventually output (After user clicks on the choice to use a script or export the generic JSON XML)

    close({e: {Event}}) -

Hides the container DOM

    _submitButtonHandle(e: {Event}) -

Overrides the ‘submit’ event for the HTML form in the export dialog box.
   
    _exportStrDoneHandle(e {Event}, str {String}) -

Internal function. Takes the passed str value and sets it as the form path to be processed.

    exportToJSONXML() -

Called when the user clicks on “Export JSON”. This will convert the json data passed in display() to a generic XML format that represents the output JSON structure.
Events
Listens For:
openExport
Shows the dialog box DOM

openImport, openLoadTags, closeExport
Hides the dialog box DOM

Triggers
exportStrDone
Fired inside of any Export script that a user may write, and by the default JSON XML script that comes with TILE. Fires only when the JSON is done being parsed into XML.   

TILE_ENGINE

   Constructor: new TILE_ENGINE({toolSet:[Array],defaultTool:String});
    Sets up the TILE toolbar (upper left-hand corner) with the
       tool selection drop-down, buttons for saving and exporting
       data
  Arguments:   

* toolSet {Array} -

An array of plugin wrappers, each wrapper having the specified properties and methods. These will be fed into PluginController

       * defaultTool {String} -

ID of the default tool to use (Shows up first after TILE is loaded)

Functions
    checkJSON -

Called to see if there is a JSON object stored in the PHP session(). Uses PHP/isJSON.php
    getBase -

Calls TILECONSTANTS.php file and gets the base URI for this interface.

    setUp -

Called after getBase(). Creates main TILE interface objects and attaches listeners and objects to the existing HTML in index.html

    getSchema({Event} e, {String} file) -

Called by Custom Event "schemaFileImport". Passed a string 'file', which is then used in an AJAX call to retrieve the JSON data. JSON data should follow TILE specifications and include all relevant page data, lines, and optionally stored shapes and other plugin data

_parseOutJSON -

Called during setUp. Takes the passed JSON data and parses it into a working manifest array for TILE_ENGINE, which is then fed to PluginController to be used as the tool’s source data for lines, stored shapes, etc.

    addDialogBoxes -

Called during setUp(). Takes dialogs.json data and loads this into the interface. Sets up New Image Dialog, Export Dialog, Load Dialog, Save Dialog

    _newPageHandle({Event} e, {String} url) -  

Called by Custom Event "newPageLoaded". If a url is passed, it will set a new manifest record for that url and change the transcript lines in the transcript line area.

    saveSettingsHandle({Event} e) -

Called by "SaveAllSettings" Event. Starts prompt to save the current manifest of data as a JSON object

   

exportToXMLHandle(e {Event}) -

Called by "exportToXML". Takes JSON data that is stored in TILE_ENGINE and PluginController, parses it, then sends off to savePrompt to save to the user.
   

savePrompt(json {Object}) -

Used by saveSettingsHandle and exportToXMLHandle to prompt the user to save the HTML/XML data
 
Events
Listens for:
newPageLoaded -
When called, uses newPageLoadedHandle to process the passed data.

schemaFileImported -
Runs getSchema from passed data. Must be passed a {String} that has the filepath with the JSON data.

saveAllSettings -
Triggered by TileToolBar’s save button. This calls saveSettingsHandle.

exportDataToXML -
Triggered by the ExportDialog’s submit button. Calls exportToXMLHandle.

toolSelected -
Called by TileToolBar. Calls PluginController’s switchTool method.


PluginController

Used to control all of the plugins for a given TILE session. Plugins are fed through TILE_ENGINE to PluginController and each plugin has its standard start(), restart(), close() methods called. Then controls the data that is output and input in each plugin.

Constructor: PluginController({toolSet:{Array},defaultTool:{String}});

* toolSet {Array} - array of tool wrapper objects. Each one has to be under the specifications defined by TILE.

* defaultTool {String} - ID of the tool to start the interface with. This tool shows up once the interface and javascript fully load.

setUpToolData -
Takes the input toolSet and walks through each plugin wrapper, calling the wrapper's start(), close(), then restart().

switchTool(name {String}, json {Object}) -
Finds the name of the tool in toolSet and starts that tool with the passed JSON data

setUpTool(toolname {String},json {Object})-
Updates the passed JSON data, then runs the restart() function for the tool that has name toolname

initTools(json {Object}) -
Takes the passed JSON data and runs start() and close() on all plugin wrappers. This sets up any JSON data that is referenced by a plugin

_setActiveTool(e {Event},id {String},_newActiveObj {Object}) -
Called by any plugins 'activeCall' event. Makes the tool with ID 'id' the active tool and sets _newActiveObj as PluginController’s activeObj, which it checks for in _toolOutputHandle

_toolOutputHandle(e {Event}, data {Object}) -
Called by any plugins' 'outputCall' event. Takes the passed data (a link from the tool triggering outputCall), then either attaches it to the activeObj using parseLink, or if no activeObj is present, it will attach the FloatingDiv to the object passed in data.  

parseLink(obj1 {Object}, obj2 {Object}) -
Takes obj1 and inserts the ID of obj2 into it’s JSON array in the JSON session data. Does the reverse for obj2 as well.

_attachFloatDiv(id {String}, link {Object}, refs {Array}) -
Called by PluginController to attach the FloatingDiv to the object link that has an element with ID 'id'. Passes the floatDiv an array of refs that are attached to the object link.

_floatDivOutputHandle(e {Event}, o {Object}) -
Called by the event 'floatDivOutput'. Takes the Object o () and attaches link for the object and its reference. Also makes the o Object the PluginController’s activeObj.

_deleteLinkHandle(e {Event}, ref1 {Object}, ref2 (Optional) {Object}) -
Called by the event 'deleteMetaLink' from FloatingDiv - deletes the ref ID and TYPE from the manifest in PluginController.

getPluginData(passManifest {Object}) -
Takes the passManifest object from TILE_ENGINE, and updates the JSON data contained within the PluginController’s linkArray variable.

Events
Listens for:
newPageLoaded -
Hides the “Attach Metadata” dialog box.

colorChanged -
Takes the passed data color {String} and link {Object} and fires new event: ObjectChanged

floatDivOutput -
Takes passed data and feeds it to floatDivOutputHandle

loadItems -
Hides the Attach Metadata dialog box

deleteMetaLink -
Takes passed data and feeds it to deleteLinkHandle Event.

Fires:
toolSetUpDone -
Called when all loaded plugins have finished setting up intitial JSON data and other variables.

switchBarMode -
Passes: {String} - name of the tool to set the toolbar menu to

TileToolBar
Constructor: TileToolBar({loc:{String}})
   * loc {String} - Represents ID of parent DOM
  
    setChoices(data: {Object}) -

Populates the Tools select menu. Takes JSON object data and sets each option tag to the name of the particular tool.
    setChoice(name: {String}) -

When a user selects a tool, jQuery doesn't change the .selected property on that option tag. So this does this manually. Sets option with 'name' as the selected option tag.
Events
Fires:
openLoadTags -
Opens the LoadTags dialog

saveAllSettings -
Starts the process of saving JSON session data

exportDataToXML -
Starts the process of outputting JSON session data as XML

Listens for:

switchBarMode (name: {String}) -
Gets passed the string name, which is the name for the tool to set on top in the Select Tool drop-down.