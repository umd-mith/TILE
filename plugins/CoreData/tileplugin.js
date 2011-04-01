// Creates a link between Coredata.php and fellow libraries for importing and exporting into TILE

var CoreData={
	name:"CoreData",
	start:function(mode){
		var self=this;
		
		// add formats to the known formats
		// Call the findFileFormats script
		// store to later add to save and load dialogs
		TILE.formats+=$.ajax({
			url:'ImportExportScripts/findFileFormats.php',
			type:'GET',
			async:false
		}).responseText;
		
	}
	
	
};

TILE.engine.registerPlugin(CoreData);