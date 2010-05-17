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
		this.uid=d.getTime();
		this.htmlId=d.getTime()+"_nv";
		//this.rules has to be JSON SCHEMA structure as defined by TILE specs
		this.DOM=$("<div></div>").attr("id",this.htmlId).addClass("nameValue").appendTo(this.loc);
		this.select=$("<select></select>").appendTo(this.DOM);
		this.changeB=$("<a>Change</a>").appendTo(this.DOM).click(function(e){$(this).trigger("NV_StartOver");}).hide();
		
		
		this.topTag=null;
		this.items=[];
		//set up enum list of tag names
		//rules.tags: list of top-level tags
		this.setUpTopLevel();
		if(args.values){
			this.loadPreChoice(args.values);
		}
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
		this.select.bind("nameSelect",{obj:this},this.nameSelectHandle);
		this.loc.bind("NV_StartOver",{obj:this},this.startOverHandle);
		//this.loc.bind("nvItemClick",{obj:this},this.handleItemClick);
	},
	//values from JSON tag object have been added in constructor
	//use args[0].values to reload the topTag 
	loadPreChoice:function(args){
		var T=null;
		// /alert(args[0].uid+'  '+args[0].values);
		for(x in args[0].values){
			var nv=args[0].values[x];
			for(g in this.rules.tags){
		
				if(nv.tagUid==this.rules.tags[g].uid){
					T=this.rules.tags[g];
					break;
				}
			}
			if(T){
				this.select.hide();
				this.changeB.show();
				this.topTag=new NVItem({
					loc:this.DOM,
					tagData:T,
					tagRules:this.rules,
					preLoad:nv,
					level:0
				});
				
			}
		}
	
	},
	startOverHandle:function(e){
		var obj=e.data.obj;
		//get rid of current top-level area completely 
		if(obj.topTag){
			obj.topTag.destroy();
			obj.topTag=null;
			//hide change button and open up select element
			obj.changeB.hide();
			obj.select.show();
		}
		
	},
	_noEdit:function(){
		//tell topTag to hide editable items
		if(this.topTag) this.topTag._noEdit();
		this.changeB.hide();
	},
	_startEdit:function(){
		//user can now edit choices
		this.changeB.show();
		//cascade command down
		if(this.topTag) this.topTag._startEdit();
	},
	//picks up nameSelect trigger from option element
	nameSelectHandle:function(e,uid){
		var obj=e.data.obj;
		//Top-Level tag is selected, erase all items that are in items array
		//so as to get rid of any possible previous selections
		for(item in obj.items){
			obj.items[item].destroy();
		}
		
		obj.items=[];
		//hide the select element and open up change element
		obj.select.hide();
		obj.changeB.show();
		//find the tag that is the chosen top-level tag
		var T=null;
		for(g in obj.rules.tags){
			if(obj.rules.tags[g].uid==uid){
				T=obj.rules.tags[g];
				//set up the Top-Level NVItem - handles all the other NVItems
				var ni=new NVItem({
					loc:obj.DOM,
					tagData:T,
					tagRules:obj.rules,
					level:0
				});
				obj.topTag=ni;
				
				break;
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
		var bdJSON={'uid':this.uid,'values':[]};
		if(this.topTag){
			//bdJSON.type=this.topTag.valueType;
			bdJSON.values.push(this.topTag.bundleData());
			// for(i in this.items){
			// 				var it=this.items[i].bundleData;
			// 				bdJSON.values.push(it);
			// 			}
		}else{
			bdJSON.value='null';
		}
		return bdJSON;
	}
	
});

var ALT_COLORS=["#CCC","#DDD"];

var NVItem=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
		this.rules=args.tagRules;
		this.preLoad=args.preLoad;
		this.tagData=args.tagData;
		this.tagUID=args.tagData.uid;
		this.level=(args.level)?args.level:0;
		//generate random unique ID
		var d=new Date();
		this.uid=d.getTime();
		this.tagName=this.tagData.name;
		//get HTML from external page
		$($.ajax({
			url:'lib/Tag/NameValueArea.php?id='+this.uid,
			dataType:'html',
			async:false
		}).responseText).insertAfter(this.loc);
		
		//this.nodeValue=args.nv;
		//this.DOM=$("<div class=\"subNameValue\"></div>").attr("id","namevaluepair_"+$(".subNameValue").length).insertAfter(this.loc);
		this.DOM=$("#"+this.uid+"_nameValue");
		//adjust DOMs margin based on level
		var n=this.level*15;
		this.DOM.css("margin-left",n+"px");
		this.DOM.css("background-color",((this.level%2)>0)?ALT_COLORS[0]:ALT_COLORS[1]);
		this.inputArea=$("#"+this.uid+"_nvInputArea");
		//insert title of tag into the inputArea
		$("#"+this.uid+"_nvInputArea > p").text(this.tagName);
		//this.changeB=$("#"+this.uid+"_nvInputArea > a").click(function(e){$(this).trigger("NV_StartOver");});
		this.requiredArea=$("#"+this.uid+"_required");
		this.optionalArea=$("#"+this.uid+"_optional");
		this.optSelect=$("#"+this.uid+"_optSelect");
		this.valueEl=null;
		
		this.items=[];
		this.setUpInput();
		if(this.preLoad){
			this.setUpPrevious();
		} else if(this.tagData.childNodes){
			this.setUpChildren();
		}
		
	},
	setUpInput:function(){
		
		//switch for displaying the correct value type
		switch(this.tagData.valueType){
			case 0:
				//do nothing - null value
				this.valueEl=$("<p>No value</p>").appendTo(this.inputArea);
				break;
			case 1:
				this.valueEl=$("<input type=\"text\"></input>").attr("id",this.DOM.attr('id')+"_input").val("").appendTo(this.inputArea);
				// this.DOM.append(this.valueEl);
				break;
			case 2: 
				//reference to a url or other tag
				this.valueEl=$("<input type=\"text\"></input>").attr("id",this.DOM.attr("id")+"_input").val("").appendTo(this.inputArea);
				//this.valueEl.bind("blur",{obj:this},this.evalRef);
				break;
			default:
				//enum type - set up select tag
				for(en in this.rules.enums){
					if(this.tagData.valueType==this.rules.enums[en].uid){
						var em=this.rules.enums[en];
						//alert('value el is an enum');
						// create select tag then run through JSON values for enum value
						this.valueEl=$("<select></select>").attr("id",this.DOM.attr('id')+"_input");
						
							
							for(d in em.values){
								//each em.value gets a option tag
								$("<option></option>").val(em.values[d]).text(em.values[d]).appendTo(this.valueEl);
							}
						
						this.valueEl.appendTo(this.inputArea);
						//end for loop
						break;
					}
				 }
			}
	},
	setUpChildren:function(){
		var optnodes=[];
		for(t in this.tagData.childNodes){
			var uid=this.tagData.childNodes[t];
			
			for(g in this.rules.tags){
				if((uid==this.rules.tags[g].uid)){
					if(this.rules.tags[g].optional=="false"){
						var tag=this.rules.tags[g];
						var el=new NVItem({
							loc:this.requiredArea,
							tagRules:this.rules,
							tagData:tag,
							level:(this.level+1)
						});
						this.items.push(el);
					} else {
						optnodes.push(this.rules.tags[g].uid);
					}
				}
			}
		}
		if(optnodes.length>0){
			this.optChoice=new NVOptionsItem({
				loc:this.optionalArea,
				options:optnodes,
				tagRules:this.rules
			});
		}
		//bind nvItemClick listener to DOM
		this.DOM.bind("nvItemClick",{obj:this},this.handleItemClick);
	},
	//Optional tag selected from option element 
	//adds an optional tag to the stack - called by nvItemClick
	handleItemClick:function(e,uid){
		e.stopPropagation(); //want to stop this from going up DOM tree
		var obj=e.data.obj;
		for(r in obj.rules.tags){
			if(uid==obj.rules.tags[r].uid){//found 
				var T=obj.rules.tags[r];
				var el=new NVItem({
					loc:obj.optChoice.DOM,
					tagRules:obj.rules,
					tagData:T,
					level:(obj.level+1)
				});
				obj.items.push(el);
				break; //stop loop
			}
		}
	},
	//take previously bundled data and re-create previous state
	setUpPrevious:function(){
		if(this.preLoad){
			//first, set up any previously set input value
			this.valueEl.val(this.preLoad.value);
			if(this.preLoad.values){
				for(x=0;x<this.preLoad.values.length;x++){
					var cur=this.preLoad.values[x];
					for(g in this.rules.tags){
						if(cur.tagUid==this.rules.tags[g].uid){
							var tag=this.rules.tags[g];
							var el=new NVItem({
								loc:this.requiredArea,
								tagRules:this.rules,
								tagData:tag,
								preLoad:cur.values,
								level:(this.level+1)
							});
							this.items.push(el);
						
							if(cur.value) el.valueEl.val(cur.value);
						}
					}
				}
			}
		}
	},
	//RECURSIVE FUNCTION
	bundleData:function(){
		
		//return JSON-like string of all items
		var _Json={"uid":this.uid,"tagUid":this.tagUID,"name":this.tagData.tagName,"type":this.tagData.valueType,"value":this.valueEl.val().replace(/[\n\r\t]+/g,""),"values":[]};
		for(i in this.items){
			var it=this.items[i].bundleData();
			_Json.values.push(it);
		}
		return _Json;
	},
	destroy:function(){
		for(i in this.items){
			this.items[i].destroy();
		}
		this.valueEl.remove();
		this.DOM.remove();
	},
	_noEdit:function(){
		//hide editable elements from user
		if(this.valueEl){	
			$("#"+this.uid+"_nvInputArea > p").text(this.tagName+": "+this.valueEl.val());
			this.valueEl.hide();
		}
		//cascade command down to other items
		var s=this;
		for(i=0;i<this.items.length;i++){
			
			setTimeout(function(T){
				T._noEdit();
			},1,this.items[i]);
		}
	},
	_startEdit:function(){
		//show editable elements for user
		if(this.valueEl){
			$("#"+this.uid+"_nvInputArea > p").text(this.tagName);
			this.valueEl.show();
		}
		//cascade command down to other items
		var s=this;
		for(i=0;i<this.items.length;i++){
			setTimeout(function(T){
				T._startEdit();	
			},1,this.items[i]);
		}
	}
});

//Sub-level version of Name-Value object above
var NVOptionsItem=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
		this.rules=args.tagRules;
		this.options=args.options;
		//create select element and insert after the args.loc jQuery object
		this.DOM=$("<select class=\"name_value_Option\"></select>").attr("id","select_"+$(".nameValue").length).insertAfter(this.loc).hide();
		//make toggle button to show/hide the DOM
		this.toggleB=$("<span>Add more data...</span>").insertAfter(this.loc);
		this.toggleB.bind("click",{obj:this},this.toggleDisplay);
		this.w=false;
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
			//set up listener for when an option is chosen
			opt.click(function(e){ 
				$(this).trigger("nvItemClick",[$(this).val()]);
			});
		}
	},
	toggleDisplay:function(e){
		var obj=e.data.obj;
		if(!obj.w){
			obj.DOM.show('fast');
			obj.w=true;
		} else {
			obj.DOM.hide('fast');
			obj.w=false;
		}
		
	},
	destroy:function(){
		this.DOM.remove();
	}
});