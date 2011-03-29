// AutoLoad

// by Grant Dickie
// MITH 2011

var AutoLoad={
	id:"Auto1000101",
	start:function(engine){
		var self=this;
		// get data from config file
		$.ajax({
			url:'./lib/Plugins/AutoLoad/autoLoadConfig.php',
			dataType:'text',
			type:'GET',
			success:function(data){
				// check if engine has data
				var json=engine.getJSON();
				if(!json){
					if(__v) console.log("data from autoLoad: "+typeof(data)+'  '+data);
					engine.parseJSON(data);
				}
			}
			
		}); 
		
		
	}
	
	
	
};