// Creates a link between Coredata.php and fellow libraries for importing and exporting into TILE

(function(){
	var root=this;
	
	// COREDATA
	// Base class that has methods
	// for creating and editing base 
	// containers of data
	var CoreData=function(args){
		if(!args.content) return;
		
		var self=this;
		self.content=args.content;
		self.containers=[];
		
	};
	CoreData.prototype={
		// step through content and tease out the
		// containers
		parseContent:function(){
			// to be overwritten by child classes
		},
		// main function for saving data into. Decides
		// which function to use
		saveData:function(obj){
			var self=this;
			
			switch(obj.type.toLowerCase()){
				case 'shapes':
					self.saveShape(obj);
					break;
				case 'lines':
					self.saveLines(obj);
					break;
				case 'selections':
					self.saveSelection(obj);
					break;
				case 'labels':
					self.saveLabel(obj);
					break;
				default:
					return;
					break;
			};
		},
		saveShape:function(obj){
			
		},
		saveLine:function(obj){
			
		},
		saveSelection:function(obj){
			
		},
		saveLabel:function(obj){
			
		},
		// Takes containers and outputs 
		// JSON object 
		to_json:function(){
			var self=this;
			
			var json=TILE.engine.getJSON();
			var data={'content':self.content,'tile':json};
			
			// output
			return data;
			
		}
	};
	
	var streamXMLData=function(args){
		var self=new CoreData(args);
		self.xml=null;
	};
	
	// Used as base class for saving XML during client session
	streamXMLData.prototype=$.extend(CoreData.prototype,{
		// creates a DOMDocument out of the content
		parseContent:function(){
			var self=this;
			if(self.content){
				// create XMLDocument
				self.xml=$.parseXML(self.content);
				// separate into lines, shapes, labels
				
			}
		}
		
	}); 
	
	var teiWriter=function(args){
		var self=new streamXMLData(args);
		
	};	
	
	// Uses base XML class to read TEI documents
	teiWriter.prototype=$.extend(streamXMLData.prototype,{
		
	});
	
	// register public properties/methods
	root.teiWriter=teiWriter;
	
})();


var CoreData={
	name:"CoreData",
	start:function(mode){
		var self=this;
		
		// add formats to the known formats
		// Call the findFileFormats script
		// store to later add to save and load dialogs
		var str=$.ajax({
			url:'plugins/CoreData/findFileFormats.php',
			type:'GET',
			async:false
		}).responseText;
		
		// send to tile engine
		TILE.engine.addImportExportFormats(str);
		
		// create appropriate parser
		self.parser=null;
		if(TILE.content){
			
			if(/xmlns\=(\"|\')http\:\/\/www\.tei\-c\.org/.test(TILE.content)){
				// handler for TEI XML
				self.parser=new teiWriter({content:TILE.content});
			}
		}
		
	
		// handler for when a new session is loaded
		$("body").bind("newJSON",{obj:self},self.newJSONHandle);
		
		// handler for data creation (dataAdded)
		// $("body").live("dataAdded",{obj:self},self.dataAddedHandle);
		// catches the additional 'content' variable from Coredata.php
		// $("body").bind('contentCreated',function(e,content){
		
		
				
		// });
		// handlers for dataDeleted and dataUpdated
		
	},
	newJSONHandle:function(e){
		var self=e.data.obj;
		
		// create appropriate parser
		self.parser=null;
		if(TILE.content){
			if(/xmlns\=(\"|\')http\:\/\/www\.tei\-c\.org/.test(TILE.content)){
				// handler for TEI XML
				self.parser=new teiWriter({content:TILE.content});
			}
		}
		
	},
	dataAddedHandle:function(e,obj){
		var self=e.data.obj;
		if(!self.xmlDoc) return;
		
		shape=obj.obj;
		switch(obj.type.toLowerCase()){
			case 'shapes':
				var zones=self.xmlDoc.getElementsByTagName('surface')[0].childNodes;
				if(__v) console.log('ZONES: '+zones);
				var found=false;
				for(var c=0;c<zones.length;c++){
					if(zones[c].getAttribute('xml:id')==shape.id){
						found=true;
					}
				}
				// $(surface).find('zone').each(function(i,o){
				// 					if($(o).attr('xml:id')==obj.id){
				// 						found=true;
				// 					}
				// 				});
				if(!found){
					var el=self.xmlDoc.createElement('zone');
					el.setAttributeNS('http://www.tei-c.org/ns/1.0','xml:id',shape.id);
					el.setAttribute('rendition','');
					el.setAttribute('ulx',shape.posInfo.x);
					el.setAttribute('uly',shape.posInfo.y);
					el.setAttribute('lrx',(shape.posInfo.x+shape.posInfo.width));
					el.setAttribute('lry',(shape.posInfo.y+shape.posInfo.height));
					self.xmlDoc.getElementsByTagName('surface')[0].appendChild(el);

					// $(self.xmlDoc).find('surface').append('<zone xml:id="'+shape.id+'" rendition="" ulx="'+shape.posInfo.x+'" uly="'+shape.posInfo.y+'" lrx="'+(shape.posInfo.x+shape.posInfo.width)+'" lry="'+(shape.posInfo.y+shape.posInfo.height)+'"></zone>');
					
					// creates: '<zone xml:id="'+shape.id+'" rendition="" ulx="'+shape.posInfo.x+'" uly="'+shape.posInfo.y+'" lrx="'+(shape.posInfo.x+shape.posInfo.width)+'" lry="'+(shape.posInfo.y+shape.posInfo.height)+'"></zone>'
					if(__v){
						console.log("Resulting XML");
						var n=new XMLSerializer();
						console.log(n.serializeToString(self.xmlDoc));
					}
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
		if(!self.xmlDoc) return;
		var o1=null;
		var o2=null;
		for(var x in args){
			// see if its a shape
			if(args[x].type){
				var obj=args[x];
				var shape=obj.obj;
				switch(obj.type.toLowerCase()){
					case 'shapes':
						var zones=self.xmlDoc.getElementsByTagName('surface')[0].childNodes;
						var found=false;
						for(var x=0;x<zones.length;x++){
							if(zones[x].getAttributeNS('http://www.tei-c.org/ns/1.0','xml:id')==shape.id){
								if(o1){ 
									o2=$(zones[x]);
								} else {
									o1=$(zones[x]);
								}
							}
						}
						// $(surface).find('zone').each(function(i,o){
						// 							if($(o).attr('xml:id')==obj.id){
						// 								if(o1){ 
						// 									o2=$(o);
						// 								} else {
						// 									o1=$(o);
						// 								}
						// 							}
						// 						});
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
			// Do this by appending <ref target="xml:id"></ref> elements
			var o1ref='<ref target="'+o1.attr('xml:id')+'">'+args[0].type+'</ref>';
			o2.append(o1ref);
			var o2ref='<ref target="'+o2.attr('xml:id')+'">'+args[1].type+'</ref>';
			o1.append(o2ref);
		} else {
			return;
		}
	
	},
	dataDeletedHandle:function(e,obj){
		var self=this;
		
		switch(obj.type.toLowerCase()){
			case 'shapes':
				var $surface=self.$xml.find('surface');
				var found=false;
				$surface.find('zone').each(function(i,o){
					if($(o).attr('xml:id')==obj.id){
						// delete item
						$(o).remove();
					}
				});
				break;
			case 'lines':
				break;
			case 'selections':
				break;
			case 'labels':
				break;
		}
		
	},
	dataUpdatedHandle:function(e,obj){
		var self=this;
		
		
		
	},
	// Takes a given node and returns a string
	// representing the XPath to place in a TEI
	// Pointer element
	createPointerXPath:function(node){
		var self=this;
		if(!node) return;
		// count parents
		var pointer='';
		var up=$(node).parent();
		pointer+='/'+up[0].nodeName;
		while(up.parent()){
			up=up.parent();
			pointer='/'+up[0].nodeName+pointer;
		}
		return pointer;
	},
	// Take the XML that has been edited and output
	outputXML:function(){
		
	}
};

TILE.engine.registerPlugin(CoreData);