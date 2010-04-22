// jsonReader
var _SCHEMA=null;
var jsonReader=Monomyth.Class.extend({
	init:function(args){
		this.data=args;
		this.schemaFile=null;
		//global listeners
		$("body").bind("schemaLoaded",{obj:this},this.ingestSchemaData); //-listens to ImportDialog
	},
	read:function(jsonstr){
		//take {String} jsonstr and parse into JSON object
		var j=jsonstr.replace(/'/g,"\"");
		this._json=JSON.parse(j);
		
		return {schema:this._json.schema,Images:this.getImages()};
	},
	ingestSchemaData:function(e,p){
		var obj=e.data.obj;
		if(!obj.schemaFile){
			obj.schemaFile=p.schema;
			//get the JSON data
			//url,data,function
			$.getJSON(obj.schemaFile,function(d){
				_SCHEMA=[];
				// //go through tag objects and create array of tags
				// 				//and their rules
				// 				_SCHEMA.tags=[];
				// 				$.each(d.tags,function(i,tag){
				// 					_SCHEMA.tags.push(tag);
				// 				});
				
				$("body").trigger("tagRulesSet",[d,p]);
			});
		}
	},
	//OLD: return images and their associated tags 
	// getImages:function(){
	// 		if(this._json&&this._json.Images){
	// 			var u=[];
	// 			$.each(this._json.Images,function(i,v){
	// 				u.push(v.uri);
	// 			});
	// 			return u;
	// 		} else {
	// 			return null;
	// 		}
	// 	},
	//NEW: return image list, with attached Tags Objects
	//Returns: {Assoc. Array} URI:{Tags...}
	getImages:function(){
		if(this._json&&this._json.Images&&this._json.Tags){
			var u=[];
			for(i in this._json.Images){
				var tgs=[];
				var shps=[];
				if(this._json.Images[i].tags.length>0){
					for(t in this._json.Images[i].tags){
						//get Tag object from Tags array
						var TG=this.getTags(this._json.Images[i].tags[t]);
						tgs.push(TG);
						if(TG.shapeId!="null"){
							shps.push(this.getShapes(TG.shapeId));
						}
					}
				}
				u.push({uri:this._json.Images[i].uri,tags:tgs,shapes:shps});
			}
			
			return u;
		} else {
			return null;
		}	
	},
	//GIVEN @uid - find the matching Tag[n].UID in Tags array
	getTags:function(uid){
		//find tag within the tags array
		if(this._json){
			var T=null;
			$.each(this._json.Tags,function(i,t){
				if(t.uid==uid){
					T=t;
				}
			});
		}
		return T;
	},
	getShapes:function(id){
		var o=[];
		for(sh in this._json.Shapes){
			var s=this._json.Shapes[sh];
			if(s.uid==id){
				o.id=s.uid;
				o.con=s.type;
				for(a in s.points){
					o[a]=s.points[a];
				}
				break;
			}
		}
		return o;
	}
});