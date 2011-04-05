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
		
		
		$("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		
		$("body").bind('contentCreated',function(e,content){
		
			self.content=$.parseXML(content);
			self.$xml=$( self.content );
		});
		
	},
	dataAddedHandle:function(e,obj){
		var self=e.data.obj;
		if(self.content.length==0) return;
	
		shape=obj.obj;
		switch(obj.type.toLowerCase()){
			case 'lines':
				
				break;
			case 'shapes':
				var $surface=self.$xml.find('surface');
				var found=false;
				$surface.find('zone').each(function(i,o){
					if($(o).attr('xml:id')==obj.id){
						found=true;
					}
				});
				if(!found){
					$surface.append('<zone xml:id="'+shape.id+'" rendition="" ulx="'+shape.posInfo.x+'" uly="'+shape.posInfo.y+'" lrx="'+(shape.posInfo.x+shape.posInfo.width)+'" lry="'+(shape.posInfo.y+shape.posInfo.height)+'"></zone>');
				}
				break;
			case 'selections':
				break;
			case 'labels':
				break;
		}
		
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