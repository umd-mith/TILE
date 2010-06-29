//Saving Progress 1.0

//grantd
//Required: Monomyth, jQuery

(function($){
	var SP=this;
	
	// Save 
	// 
	// Object for creating and saving progress in TILE
	var Save=Monomyth.Class.extend({
		init:function(args){
			this.saveurl="PHP/forceJSON.php";
			this.iframe=null;
			this.filePrompt=$("<form id=\"uploadDataFORM\" action=\""+this.saveurl+"\" method=\"POST\" class=\"submitFormHidden\"><input id=\"uploadData\" name=\"uploadData\" type=\"text\"/></form>");
			this.loc=$("#"+args.loc);
		},
		userPrompt:function(json){
			var params="";
			//var json=this.convertJSON(info);
			this.loc.append(this.filePrompt);
			
			$("#uploadData").val(JSON.stringify(json));

			//attach PHP receiver script
			this.iframe=$("<iframe src=\""+(this.saveurl)+"\"><p>Your browser doesn't support iframes</p></iframe>");
			this.loc.append(this.iframe);
			//listen for user click to get rid of form
			$(document).bind("click",{obj:this},this.removeUpload);

			//submit POST data
			$("#uploadDataFORM")[0].submit();

		},
		convertJSON:function(data){
			//convert an associative array of string pairs into an json object
			var json="{";

			for(d in data){
				var namevalue="\""+d+"\":"+data[d];
				json+=namevalue+",";
			}
			json+="}";
			return json;
		},
		removeUpload:function(e){
			var obj=e.data.obj;
			$("#uploadDataFORM").remove();
		}
	});
	SP.Save=Save;
	// jsonReader
	var _SCHEMA=null;
	var jsonReader=Monomyth.Class.extend({
		init:function(args){
			this.data=args;
			this.schemaFile=null;
			//global listeners
			$("body").bind("schemaLoaded",{obj:this},this.ingestSchemaData); //-listens to ImportDialog
		},
		readSchemaFromFile:function(filepath){
			var self=this;
			self.schemaFile=filepath;
			$.ajax({
				url:filepath,
				async:false,
				dataType:'json',
				success:function(d){
					//d is JSON data from schema
				
					$("body").trigger("tagRulesSet",[d]);
					
				}
			});
		},
		read:function(jsonstr){
			//take {String} jsonstr and parse into JSON object
			//var j=jsonstr.replace(/'/g,"\"");
			//this._json=JSON.parse(j);
			this._json=jsonstr;
			if(!(/.json/gi.test(this._json.schema))) {
				return false;
			}
			this.ingestSchemaData({schema:this._json.schema,Images:this.getImages()});
			//this.cleanURIs();
			//return {schema:this._json.schema,Images:this.getImages()};
		},
		ingestSchemaData:function(p){
		
			if(!this.schemaFile){
				this.schemaFile=p.schema;
				//get the JSON data
				//url,data,function
				$.getJSON(this.schemaFile,function(d){
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
		//perform REgex procedure on all uris in the Images array
		cleanURIs:function(){
			if(this._json.Images){
				for(im in this._json.Images){
					this._json.Images[im].uri=this._json.Images[im].uri.replace(/^[\r\c\t]+|[\r\c\t]/g,"");
				}
			}
		},
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
							if(TG.shapeId){
								var s=this.getShapes(TG.shapeId,this._json.Images[i].uri);
								if(s) shps.push(s);
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
				var T={};
				$.each(this._json.Tags,function(i,t){
					if(t.uid==uid){
						T=t;
					}
				});
			}
			return T;
		},
		getShapes:function(id,url){
			var o=null;
			for(sh in this._json.Shapes){
				var s=this._json.Shapes[sh];
				if(s.uid==id){
					o=s;
					// o.id=s.uid;
					// 				o.con=s.type;
					// 				for(a in s.points){
					// 					o[a]=s.points[a];
					// 				}
					break;
				}
			}
			if(o) o.uri=url;
			return o;
		}
	});
	SP.jsonReader=jsonReader;
})(jQuery);