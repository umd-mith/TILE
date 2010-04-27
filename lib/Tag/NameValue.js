var NameValue=Monomyth.Class.extend({
	init:function(args){
		if((!args.rules)||(!args.loc)) throw "Error in creating name-value pair";
		//this.name=args.name;
		this.rules=args.rules;
		this.loc=args.loc;
		
	}
});

/**
Name-value object to be used specifically with TILE interface

Top-Level Object that generates more, sub-level name-value pairs from
Rules .childNodes array
**/
var TileNameValue=NameValue.extend({
	init:function(args){
		this.$super(args);
		var d=new Date();
		this.htmlId=d.getTime()+"_nv";
		//this.rules has to be JSON SCHEMA structure as defined by TILE specs
		this.DOM=$("<div></div>").attr("id",this.htmlId).addClass("nameValue").appendTo(this.loc);
		this.select=$("<select></select>").appendTo(this.DOM);
		this.valueEl=null;
		this.items=[];
		//set up enum list of tag names
		//rules.tags: list of top-level tags
		this.setUpTopLevel();
		
	},
	setUpTopLevel:function(){
		for(t in this.rules.topLevelTags){
			var uid=this.rules.topLevelTags[t];
			var T=null;
			for(g in this.rules.tags){
				if(this.rules.tags[g].uid==uid){
					T=this.rules.tags[g];
					break;
				}
			}
			if(T){
				var id=$("#"+this.DOM.attr("id")+" > option").length+"_"+this.DOM.attr("id");
				var o=$("<option></option>").attr("id",id).val(uid).text(T.name).appendTo(this.select);
				o.click(function(){
					$(this).trigger("nameSelect",[$(this).val()]);
				});
			}
		}
		//attach listener for when the select element gets changed - DOESNT GET TRIGGER
		// this.DOM.change(function(){
		// 			$(this).trigger("nameSelect",[$(this).val()]);
		// 		});
		 this.select.bind("nameSelect",{obj:this},this.nameSelectHandle);
	},
	//picks up nameSelect trigger from option element
	nameSelectHandle:function(e,uid){
		var obj=e.data.obj;
		//get rid of any possible previous selections
		if(obj.valueEl){
			obj.valueEl.remove();
		}
		for(item in obj.items){
			obj.items[item].destroy();
		}
		var T=null;
		for(g in obj.rules.tags){
			if(obj.rules.tags[g].uid==uid){
				T=obj.rules.tags[g];
				break;
			}
		}
		if(T){
			//switch for displaying the correct value type
			switch(T.valueType){
				case 0:
					//do nothing - null value
					break;
				case 1:
					obj.valueEl=$("<input type=\"text\"></input>").attr("id",function(){
						return $(".nameValue").length+"_input";
					}).val("");
					obj.DOM.append(obj.valueEl);
					break;
				case 2: 
				//reference to a url or other tag
					obj.valueEl=$("<input type=\"text\"></input>").attr("id",function(){
						return $(".nameValue").length+"_input";
					}).val("").appendTo(obj.DOM);
					obj.valueEl.bind("blur",{obj:obj},obj.evalRef);
					break;
				default:
					//enum type - set up select tag 
					for(en in obj.rules.enums){
						if(T.valueType==obj.rules.enums[en].uid){
							var em=obj.rules.enums[en];
							// create select tag then run through JSON values for enum value
							obj.valueEl=$("<select></select>").attr("id",function(){
								return $(".nameValue").length+"_input";
							});
							for(d in em.values){
								//each em.value gets a option tag
								var s=$("<option></option>").val(em.values[d]).appendTo(obj.valueEl);
							}
						}
					}
			}
			if(T.childNodes){
				var a=new NVItem({
					loc:obj.DOM,
					options:T.childNodes,
					tagRules:obj.rules
				});
				obj.items.push(a);
			}
		}
	},
	evalRef:function(e){
		//analyze to see if val() refers to a URI or to another Tag's uid
		var obj=e.data.obj;
		if(obj.valueEl){
			var c=obj.valueEl.text();
			var ut=/http:|.html|.htm|.php|.shtml/;
			
			if(ut.test(c)){
				
			}
		}
	},
	bundleData:function(){
		var bdJSON={};
		for(i in this.items){
			var it=this.items[i];
			
		}
	}
	
});
//Sub-level version of Name-Value object above
var NVItem=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
		this.rules=args.tagRules;
		this.options=args.options;
		//create select element and insert after the args.loc jQuery object
		this.DOM=$("<select></select>").attr("id","select_"+$(".nameValue").length).insertAfter(this.loc);
		
		if(this.options){
			this.setUpNames();
		}
	},
	setUpNames:function(){
		for(o in this.options){
			var id=$("#"+this.DOM.attr("id")+" > option").length+"_"+this.DOM.attr("id");
			var opt=$("<option></option>").appendTo(this.DOM);
			for(t in this.rules.tags){
				var T=this.rules.tags[t];
				if(this.options[o]==T.uid){
					opt.val(T.uid).text(T.name);
					break;
				}
			}
		}
		//set up listener for when an option is chosen
		this.DOM.change(function(){
			$(this).trigger("nvItemClick",[$(this).val()]);
		});
	},
	destroy:function(){
		this.DOM.remove();
	}
	
});