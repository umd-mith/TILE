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
		
		self.content=[];
		
		$("body").bind('contentCreated',function(e,content){
			
			self.content=$(content);
			if(__v){
				self.content.find('pages').each(function(){
					console.log('page: '+$(this).attr('id'));
				});
				
			}
			
		});
		
	},
	dataAddedHandle:function(e){
		var self=e.data.obj;
	},
	// args can be an array of objects or 
	// one object
	dataCreatedHandle:function(e,args){
		var self=e.data.obj;
		
		
		
	},
	dataLinkedHandle:function(e,obj1,obj2){
		var self=e.data.obj;
	}
	
	
};

TILE.engine.registerPlugin(CoreData);