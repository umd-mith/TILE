/***
 * System for talking to the PHP_OCR scripts
 * 
 */

var OCR=function(args){
	this.url=args.url;
	
	this.img=args.img;
	
	this.getPoints();
	
	
}
OCR.prototype={
	getPoints:function(){
		//do Math (MATH?! OH NO!) on image
		this.imgwidth=this.img.css("width");
		this.imgheight=this.img.css("height");
		this.src=this.img.attr("src");
		
	}
}
