/**
 * Basic Image Object
 * 
 * Contains URL for where the image is (or an array of urls)
 * 
 */
var TileImage=Monomyth.Class.extend({
	init:function(args){

		//url is actually an array of image values
		this.url=(typeof args.url=="object")?args.url:[args.url];
		
		if(args.loc){
			this.loc=args.loc;
			//set to specified width and height
			if(args.width) this.DOM.width(args.width);
			if(args.height) this.DOM.height(args.height);
		}
	
	}
});

/**
 * Image object that creates a canvas
 * and loads URL of image inside it
 * 
 * Possible functionality:
 * Can load a series of urls (array-based series) 
 */

 var CanvasImage=TileImage.extend({
 	init: function(args){
 		this.$super(args);
 		this.loc = $(this.loc);
 		
 		this.srcImage = $("#srcImageForCanvas");
 		
 		this.loc.append($("<div id=\"canvasHTML\"><canvas id=\"canvas\"></canvas></div>"));
 		this.DOM = $("#canvasHTML");
 		
 		this.canvas = $("#canvas");
 		//need real DOM element, not jQuery object
			this.canvasEl = this.canvas[0];
			this.imageEl = this.srcImage[0];
			this.pageNum = 0;
			this.url = [];
			this.nh = 0;
			this.nw = 0;
			
			
			
			
		},
		
		showCurrentImage: function(e){
			var obj = e.data.obj;
			if (obj.url[obj.pageNum]) {
				var file = obj.url[obj.pageNum];
				if (/[^.jpg|.tif|.png]/.test(file)) {
					obj.setUpCanvas(file);
				}
				else {
					alert("The file: " + file + " returned an error.");
				}
			}
		},
		
		setUpCanvas: function(url){
			var self = this;
			this.srcImage.attr("src", url).load(function(e){
				debug(e.data);
			
				self.canvas[0].width = self.srcImage[0].width;
				self.canvas[0].height = self.srcImage[0].height;
				
				var testimage = $.ajax({
					url: url,
					async: false,
					dataType: 'text'
				}).responseText;
				if (testimage.length) {
					self.context = self.canvasEl.getContext('2d');
					//set up first zoom level
					self.nh = (800 / self.srcImage[0].width) * self.srcImage[0].height;
					self.nw = 800;
					self.srcImage.width(self.nw);
					self.srcImage.height(self.nh);
					self.canvas.attr("width", self.nw);
					self.canvas.attr("height", self.nh);
					self.context.drawImage(self.imageEl, 0, 0, self.nw, self.nh);
					self.loc.width(self.canvas.width());
					self.loc.height(self.canvas.height());
					self.srcImage.trigger("newPageLoaded", [self.pageNum]);
				}
			});
			
			
		}
	});