/**
* Tag
* Object to recording metadata about a bound object in the 
* stage area of the interface
*
**/

var Tag=Monomyth.Class.extend({
	init:function(args){
		this.loc=$("#"+args.loc);
		this.index=$(".tag").length;
		this.loc.append($.ajax({
			url:'lib/Tag/Tag.php?id='+this.index,
			type:'text',
			async:false
		}).responseText);
		this.DOM=$("#tag_"+this.index);
		this.title=args.title;
	}
});

var TileTag=Tag.extend({
	init:function(args){
		this.$super(args);
		this.titleEl=$("#tagtitle_"+this.index);
		this.titleEl.click(function(e){
			$(this).toggleClass("open");
			$(this).toggleClass("closed");
		});
		this.titleSelect=$("#tagtitleselect_"+this.index);
		this.titleSelect.hide();
		//this.fillTagTitleSelect();
		this.editB=$("#tagedit_"+this.index);
		this.objText=$("#tagobjvalue"+this.index);
		this.coordText=$("#tagcoordsvalue"+this.index);
		
		this.titleEl.text(this.title);
		
		this.editB.click(function(e){
			$(this).trigger("editTag");
		});
		this.DOM.bind("editTag",{obj:this},this.editTag);
	},
	editTag:function(e){
		var obj=e.data.obj;
		obj.titleEl.hide();
		obj.titleSelect.show();
		
	},
	changeTitle:function(e){
		var obj=e.data.obj;
		obj.titleEl.hide();
		obj.titleSelect.show();
		
	},
	changeTitleDone:function(e,title){
		var obj=e.data.obj;
		obj.title=title;
		obj.titleEl.text(obj.title);
		obj.titleSelect.hide();
		obj.titleEl.show();
	},
	fillTagTitleSelect:function(){
		//just grap the test elements
		//later, will be dynamically set
		this.titleSelect.children("option").each(function(ind,el){
			$(el).click(function(e){
				
				$(this).trigger("changeTitleDone",[$(this).text()]);
			});
		});
	}
	
});