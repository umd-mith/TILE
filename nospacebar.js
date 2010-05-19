//grantd

//Developing method to disconnect spacebar from disrupting the Raphael canvas

(function($){
	$(document).keydown(function(e){
		if(e.keyCode==32){
			e.preventDefault();
			e.stopPropagation();
		}
	});
	$(document).keypress(function(e){
		if(e.keyCode==32){
			e.preventDefault();
			e.stopPropagation();
		}
	});
	$(document).keyup(function(e){
		if(e.keyCode==32){
			e.preventDefault();
			e.stopPropagation();
		}
	});
	
	
})(jQuery);