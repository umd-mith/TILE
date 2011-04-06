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
	
	dataLinkedHandle:function(e,args){
		var self=e.data.obj;
		if(self.content.length==0) return;
		var o1=null;
		var o2=null;
		for(var x in args){
			// see if its a shape
			if(args[x].type){
				var obj=args[x];
				var shape=obj.obj;
				switch(obj.type.toLowerCase()){
					case 'shapes':
						var $surface=self.$xml.find('surface');
						var found=false;
						$surface.find('zone').each(function(i,o){
							if($(o).attr('xml:id')==obj.id){
								if(o1){ 
									o2=$(o);
								} else {
									o1=$(o);
								}
							}
						});
						// if(!found){
						// 							
						// 							$surface.append('<zone xml:id="'+shape.id+'" rendition="" ulx="'+shape.posInfo.x+'" uly="'+shape.posInfo.y+'" lrx="'+(shape.posInfo.x+shape.posInfo.width)+'" lry="'+(shape.posInfo.y+shape.posInfo.height)+'"></zone>');
						// 						}
						break;
					case 'selections':
						break;
					case 'labels':
						break;
				}
			}
		}
		if(o1&&o2){
			// insert references into each other's elements
			
		} else {
			return;
		}
	
	}
};

TILE.engine.registerPlugin(CoreData);