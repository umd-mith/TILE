// AutoLoad

// by Grant Dickie
// MITH 2011

var AutoLoad={
	id:"Auto1000101",
	name:'AutoLoad',
	start:function(mode){
		var self=this;
		// get data from config file
		$.ajax({
			url:'./plugins/AutoLoad/autoLoadConfig.php',
			dataType:'text',
			type:'GET',
			success:function(data){
				// check if engine has data
				
				setTimeout(function(data){
					var json=TILE.engine.getJSON();
					
					if(!json){
						if(/^http/.test(data)){
								
								// call URL to get JSON
								$.ajax({
									url:data,
									type:'GET',
									dataType:'json',
									success:function(json){
										TILE.engine.parseJSON(json);
									}
								});


						} else {
							TILE.engine.parseJSON(data);
						}
					}
					
				},1,data);
				
			}
			
		}); 
		
		
	}
	
	
	
};
// register the plugin with TILE
TILE.engine.registerPlugin(AutoLoad);