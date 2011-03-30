// AutoLoad

// by Grant Dickie
// MITH 2011

var AutoLoad={
	id:"Auto1000101",
	start:function(mode){
		var self=this;
		// get data from config file
		$.ajax({
			url:'./plugins/AutoLoad/autoLoadConfig.php',
			dataType:'text',
			type:'GET',
			success:function(data){
				// check if engine has data
				var json=TILE.engine.getJSON();
				if(!json){
					if(__v) console.log("data from autoLoad: "+typeof(data)+'  '+data);
					TILE.engine.parseJSON(data);
				}
			}
			
		}); 
		
		
	}
	
	
	
};