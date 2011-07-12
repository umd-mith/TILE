/*
* AutoLoad
*
* @author Grant Dickie
* 
* Wrapper for TILE engine to automatically load
* in JSON data in case there is not already data
* loaded
*/
var AutoLoad={
	id:"Auto1000101",
	name:'AutoLoad',
	/* 
	* start()
	* @constructor
	* @params mode {Object} - Mode object passed to method
	*/
	start:function(mode){
		var self=this;
		// get data from config file
		// and set the TILE.preLoad variable
		// to results
		TILE.preLoad=$.ajax({
			url:'./plugins/AutoLoad/autoLoadConfig.php',
			dataType:'text',
			type:'GET',
			async:false
			
		}).responseText;
		
	}
	
	
	
};

// register the plugin with TILE
TILE.engine.registerPlugin(AutoLoad);