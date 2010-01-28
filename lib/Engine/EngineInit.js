/**
 * Contains the document.ready function for initiating 
 * all scripts
 * @param {Object} args
 */

var EngineInit=Monomyth.Class.extend({
	init:function(args){
		//Document Ready
		$(function(){
				/* $("#redSlider").slider();
		  $("#blueSlider").slider();
		    $("#greenSlider").slider();
			   $("#allSlider").slider();*/
			var img = new Image();
			img.src = 'http://localhost:8888/TILE/Images/ham.jpg';
			img.onload= function(){
			myImg = this;
			loadImage(this)};
		});
	}
});
