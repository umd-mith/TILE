// AutoLoad

// by Grant Dickie
// MITH 2011

var AutoLoad={
	id:"Auto1000101",
	name:'AutoLoad',
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