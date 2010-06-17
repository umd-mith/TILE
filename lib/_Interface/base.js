//base.js
//All of the base files for creating a framework for TILE


//REQUIRED: Monomyth.js, jQuery.js, jQuery UI + all related CSS files
(function($){
	var ROOT_BASE=this;
	/**
	 * Basic Image Object
	 * 
	 * Contains URL for where the image is (or an array of urls)
	 * 
	 */
	var Image=Monomyth.Class.extend({
		init:function(args){
			//create UID
			var d=new Date();
			this.uid="image_"+d.getTime("hours");
			
			//url is actually an array of image values
			this.url=(typeof args.url=="object")?args.url:[args.url];

			if(args.loc){
				this.loc=args.loc;
				//set to specified width and height
				if(args.width) this.DOM.width(args.width);
				if(args.height) this.DOM.height(args.height);
			}
			this.zoomMin=(args.minZoom)?args.minZoom:1;
			this.zoomMax=(args.maxZoom)?args.maxZoom:5;
			this.zoomLevel=this.zoomMin;
		},
		//return a copy of the zoomLevel
		getZoomLevel:function(){var z=this.zoomLevel;return z;},
		activate:function(){
			this.DOM.show();
		},
		deactivate:function(){
			this.DOM.hide();
		}
	});
	
	ROOT_BASE.Image=Image;
	//Tags and Tag Data
	var Tag=Monomyth.Class.extend({
		init:function(args){
			this.loc=$("#"+args.loc);
			var d=new Date();
			this.html=args.html;
			this.uid=(args.htmlindex)?args.htmlindex:$(".tag").length+"_"+d.getTime();
			this.name=this.htmlindex+"_name";
			$(this.html).appendTo(this.loc);
			// this.loc.append($.ajax({
			// 				url:'lib/Tag/Tag.php?id='+this.htmlindex,
			// 				type:'text',
			// 				async:false
			// 			}).responseText);
			//this.uid="tag_"+this.htmlindex;
		//	this.DOM=$("#tag_"+this.htmlindex);
			this.name=(args.title)?args.title:"Undefined";
		}
	});
	
	ROOT_BASE.Tag=Tag;
	
	var NameValue=Monomyth.Class.extend({
		init:function(args){
			if((!args.rules)||(!args.loc)) throw "Error in creating name-value pair";
			//this.name=args.name;
			this.rules=args.rules;
			this.loc=args.loc;

		}
	});
	
	ROOT_BASE.NameValue=NameValue;
	
	/***
	Region Object

	Stores data related to a Tag's region

	**/

	// @params
	// name: String
	// shape: SVGRect,SVGEllipse,SVGPolygon
	var Region=Monomyth.Class.extend({
		init:function(args){
			if(!args.shape) throw "Error: Region created without a shape object";
			this.name=args.name;
			this.shape=args.shape;
		},
		destroy:function(){
			this.shape.destroy();

		}
	});
	
	
	ROOT_BASE.Region=Region;
	
	
	//TOOLBARS
	
	/**
	Log Toolbar:
	
		Toolbar that contains objects that reflect a log of what is going on in main
		tagging/workspace area. 
		
		//receives html in form of text
	**/
	var Log=Monomyth.Class.extend({
		init:function(args){
			if(!args.html) throw "no JSON data passed to Log{}"; 
			this.html=args.html;
			this.DOM=$("#az_log");
			$(this.html.log).appendTo(this.DOM);
			
		}
	});
	
	
	ROOT_BASE.Log=Log;
	
	/**
	Log Item
	
		Object that handles one instance of a logged event in the main workspace area
		
		Can be given an ID in order to 'copy' another object - can do this using
		uid: {string} parameter
	**/
	var LogItem=Monomyth.Class.extend({
		init:function(args){
			if(!args.html&&!args.loc) throw "no JSON data passed to LogItem{}";
			this.loc=args.loc;
			this.html=args.html;
			$(this.html).appendTo($("#"+this.loc));
			var d=new Date();
			this.uid=(args.uid)?args.uid:"logitem_"+d.getTime('milliseconds');
			//optional tag type attribute
			if(args.type){
				this._type=args.type;
			}
		}
	});
	
	
	ROOT_BASE.LogItem=LogItem;
	
	/**
	
	**/
	
	
	/**
	SideToolbar

	For handling color recognition, tagging


	loc: ID for the element to attach to
	**/

	var SideToolBar=Monomyth.Class.extend({
		init:function(args){
			this.DOM=$("#"+args.loc);
			//attach PHP-fed HTML into location
			// this.DOM.append($.ajax({
			// 							async:false,
			// 							url:'lib/ToolBar/SideToolBar.php',
			// 							type:'GET'
			// 						}).responseText);

			/**
			this.DOM=$("<div class=\"SideToolBar\"></div>");
			this.DOM.attr("id",function(e){
				return "sidebar"+$(".sidetoolbar").length;
			});
			this.DOM.appendTo(args.loc);
			this.loc=args.loc;**/

		},
		activate:function(){
			this.DOM.show();
		},
		deactive:function(){
			this.DOM.hide();
		}
	});
	
	ROOT_BASE.SideToolBar=SideToolBar;
	
	//TopToolBar
	//UPDATE 5/27/10: re-formatted to not use HTML from PHP
	var TopToolBar=Monomyth.Class.extend({
		init:function(args){
			this.position=args.position;
			//attach all the php-fed HTML into the DOM object passed
			//args.loc.append($.ajax({async:false,url:"lib/ToolBar/TopToolBar.php",type:"text"}).responseText);
			this.DOM=$("#"+args.loc);

		},
		deactivate:function(){
			this.DOM.hide();
		},
		activate:function(){
			this.DOM.show();
		}
	});
	
	ROOT_BASE.TopToolBar=TopToolBar;
	
	//TabBar
	var TabBar=Monomyth.Class.extend({
		init:function(args){
			this.DOM=$("#"+args.loc);
			this.DOM.append($.ajax({
				async:false,
				url:'lib/ToolBar/TabBar.html',
				type:'GET',
				dataType:'html'
			}).responseText);
		}
	});
	
	ROOT_BASE.TabBar=TabBar;
	
	// Dialog Script
	// 
	// Creating several objects to display dialog boxes
	// 
	// Developed for TILE project, 2010
	// Grant Dickie

	// 
	// @param: 
	// Obj: variables:
	// 	loc: DOM object to be attached to

	var Dialog=Monomyth.Class.extend({
		init:function(args){
			if((!args.loc)||(!args.html)) throw "Not enough arguments passed to Dialog";
			this.loc=args.loc;
			//set up JSON html
			this.html=args.html;
			$(this.html).appendTo(this.loc);
		}
	});
	
	ROOT_BASE.Dialog=Dialog;
	
	var DrawTool=Monomyth.Class.extend({
		init:function(args){
			//canvas we're drawing on
			this.mainCanvas=args.svgCanvas;
			//zoom elements
			this.maxZoom=args.zoomMax?args.zoomMax:5;
			this.minZoom=args.zoomMin?args.zoomMin:1;
			this.zoomLevel=this.minZoom;
		},
		figureSizeInfo:function(min,max){
			this.maxZoom=max;
			this.minZoom=min;
			this.zoomLevel=min;
		}
	});
	
	ROOT_BASE.DrawTool=DrawTool;
	
	//ANIMATED SCROLLBAR
	/****
	*  Animated Scroller
	* 
	* by: grantd
	*
	*
	*
	**/
	var AnimatedScroller=Monomyth.Class.extend({
		init:function(args){
			if(!args.htmlready){
				var h=$($.ajax({
					url:"lib/ScrollingImages/AnimatedScroller.html",
					async:false,
					dataType:'html'
				}).responseText);
				h.appendTo($("#"+args.loc));
				this.DOM=$("#scroller");
				this.Handle=$("#scrollerHandle > a");
				this.ScrollOuter=$("#tileScroll_outer");
				this.scroller=$("#tileScroll_imagescroller");
				this.viewer=$("#tileScroll_viewer");
				this.container=$("#tileScroll_container");
			}
		}
	});
	
	
	ROOT_BASE.AnimatedScroller=AnimatedScroller;
		/*
	 * Image List
	 */
	var ImageList = Monomyth.Class.extend({
		init:function(args){
			this.imageUris=[];
			this.curImage="";
			
		},
		loadImages:function(data){
			for(d=0;d<data.length;d++){
				this.addImage(data[d]);
			}
		},
		addImage:function(uri){
			this.imageUris.push(uri);
		},
		removeImage: function(uri){
		
		}
	});
	ROOT_BASE.ImageList=ImageList;
})(jQuery);

