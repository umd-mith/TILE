/**
* WelcomeDialog
* @author Grant Dickie
* @copyright MITH 2011
*/

(function(){
	var WD=this;
	/**
	* WelcomeDialog 
	* @constructor
	* @params: 
	* Obj: variables:
	* 	loc: {String} DOM object to be attached to
	*/
	var WelcomeDialog=function(args){
		
			var self=this;
			if((!args.loc)) throw "Not enough arguments passed to Dialog";
			self.loc=args.loc;
			//set up JSON html
			var html='<div id="light" class="white_content"><div id="welcomeDialog" class="dialog"><div class="header">'+
			'<h2 class="title">Welcome to the TILE Sandbox</h2><div class="clear"></div>'+
			'</div><div class="body"><div class="description">'+
			'<p>The <a href="http://mith.umd.edu/tile">Text-Image Linking Environment (TILE)</a> is a tool for creating and editing image-based '+
			'electronic editions and digital archives of humanities texts. The TILE sandbox is a MITH-hosted version of TILE allowing users to try'+
			' the tool before installing their own copy. Preloaded in TILE is an edition of Algernon Swinburne\'s poetry. We encourage you to try'+
			' our image markup tool, test a semi-automated line recognizer that tags regions of text within an image, and begin to explore how TILE works.</p>'+
			'<p>This 1.0 release of TILE features:'+ 
			'<p><a class="point" id="importHover">* importing and exporting transcript lines and images of text</a><br/>'+ 
			'<a class="point" id="imageHover">* an image markup tool</a><br/>'+ 
			'<a class="point" id="ALRHover">* a semi-automated line recognizer</a><br/>'+ 
			'</p>'+
			'<p><a id="continueButton" class="button">Continue ></a></p></div><div class="clear"></div>'+
			'</div></div></div><div id="fade" class="black_overlay"></div>';
			$(html).appendTo(self.loc);
			self.index=($("#dialog").length+self.loc.width());
		
			// flash the a elements to get people to click on them
			$("#welcomeDialog > .body > .description > p > #importHover").animate({color:"green","left":"+=50px"},1000,function(){
				$("#welcomeDialog > .body > .description > p > #importHover").css({color:"#000","left":"-=50px"});
				// animation complete - reset importHover and move to next
				$("#welcomeDialog > .body > .description > p > #imageHover").animate({color:'green'},1000,function(){
					$("#welcomeDialog > .body > .description > p > #imageHover").css({color:'#000'});
					// animation complete - back to normal
					$("#welcomeDialog > .body > .description > p > #ALRHover").animate({color:'green'},1000,function(){
						// finally - return to normal
						$("#welcomeDialog > .body > .description > p > #ALRHover").css({color:'#000'});
					});
				});
			});
		
			$("#continueButton").live('click',function(e){
				e.preventDefault();
				$("#light").remove();
				$("#fade").remove();
			});
			// attach events for hover items
		
			$("#importHover").live('click',function(e){
				e.preventDefault();
			
				$("#importShot").show();
				// remove from DOM
				$("#light").remove();
				$("#fade").remove();
				// activate the Load Dialog 
				$("#azglobalmenu > .globalbuttons > .dataitems > .menuitem > a:contains('Load')").trigger('click');
			
			});
			// $("#importHover").live('mouseout',function(e){
			// 			$("#importShot").hide();
			// 		});
			$("#imageHover").live('click',function(e){
				e.preventDefault();
				$("#imageShot").show();
				// imagetagger already active, simply remove the dialog from
				// the screen
				$("#light").remove();
				$("#fade").remove();
			});
			// $("#imageHover").live('mouseout',function(e){
			// 			$("#imageShot").hide();
			// 		});
			$("#ALRHover").live('click',function(e){
				e.preventDefault();
				$("#ALRShot").show();
				// remove from DOM
				$("#light").remove();
				$("#fade").remove();
				// activate the ALR
				$("#azglobalmenu > .globalbuttons > .modeitems > .menuitem > a:contains('Auto Line Recognizer')").trigger('click');
			});
			
			//lightbox content
			self.light=$("#light");
			self.fade=$("#fade");
			self.DOM=$("#welcomeDialog");
		
	};
	
	
	WD.dialogOfWelcome=WelcomeDialog;
})();

/**
* WelcomeDialog 
* Wrapper for the TILE.engine object to load in plugin
* 
* start() method is the constructor
*/
var WelcomeDialog={
	id:"WD1090910",
	name:'WelcomeDialog',
	/**
	* start()
	* @constructor
	* @params mode {Object} - Mode object passed when TILE.engine calls start()
	*/
	start:function(mode){
		var self=this;
		self.dialog=new dialogOfWelcome({loc:$("body")});
		
		// show dialog at beginning - user clicks continue
		// and dialog goes away
		
		if(!TILE.engine.getJSON()){
			$("#light").show();
			$("#fade").show();
			$("#welcomeDialog").show();
		}
		
	}
	
};
// register the plugin with TILE
TILE.engine.registerPlugin(WelcomeDialog);