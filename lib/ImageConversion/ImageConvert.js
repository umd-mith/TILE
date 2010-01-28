/*
 * Collection of Image Conversion tools
 */

var ImageConvert=Monomyth.Class.extend({
	init:function(args){
		this.url=args.url;
		
	},
	grayscale:function(imageData, myCanvas, bPlaceImage){
  // This function cannot be called if the image is not rom the same domain.
  // You'll get security error if you do.
//	alert("start loop "+imageData.height+" "+imageData.width);
  // This loop gets every pixels on the image and 
    for (j=0; j<imageData.height; j++)
    {
      for (i=0; i<imageData.width; i++)
      {
         var index=(i*4)*imageData.width+(j*4);
         var red=imageData.data[index];	  
         var green=imageData.data[index+1];
         var blue=imageData.data[index+2];	  
         var alpha=imageData.data[index+3];	 
  //       var average=(red+green+blue)/3; 	  
   	     imageData.data[index]=average;	  
         imageData.data[index+1]=average;
         imageData.data[index+2]=average;
         imageData.data[index+3]=alpha;	  	  
       }

     }
	 	
	myCanvas.getContext('2d').putImageData(imageData,0,0);
  	
	return myCanvas.toDataURL();

  },
	colorWidget:function(){
  	
  },
  changeColor:function(seldata){
	canvas = $("#canvas")[0];
	
	var context = document.getElementById('canvas').getContext('2d');
	
	data = seldata.split(",");
	data[0] = data[0].substring(data[0].indexOf("(")+1);
	data[2] = data[2].substring(0,data[2].indexOf(")"));
	var selred=parseInt(data[0]);	  
     var selgreen=parseInt(data[1]);
     var selblue=parseInt(data[2]);	
	
 	// seldata = data;
     var selAverage=(selred+selgreen+selblue)/3;
	 
	 bb = $("#boundaryBox");
	
	 if (bb.size()>0) {
	 	t = parseInt(bb.css("top"));
	 	l = parseInt(bb.css("left"));
	 	w = parseInt(bb.css("width"));
	 	h = parseInt(bb.css("height"));
	 	
	 	bb.remove();
		bb = null;
	 	$("#tlNode").remove();
		 imageData = context.getImageData(l, t, w, h);
		 
		  pageBlock = {
		  		iData: imageData,
	 			imgDataArray: imageData.data,
			 	left: l,
	 			top: t
			 };
	 }
	 else{
	 //When the user has already entered the bounding box one time
	 //need to revert page data to previous setting
	 	 /* imageData = pageBlock.iData;
		  l = pageBlock.left;
		  t = pageBlock.top;
		  w = i.width;
		  h = i.height;
		  alert("** "+h);*/
		  //revertData();
	 }

	
	// alert(h+"  "+canvas.height);
	 total = 0;
	// alert("width: "+imageData.width + " height: "+imageData.height);
	for (var j=0; j<w; j++){
	    for (var i=0; i<h; i++){
	        // var index=(i*4)*imageData.width+(j*4);
			var index = (j +i*w)*4;
			var red=imageData.data[index];	  
			var green=imageData.data[index+1];
			var blue=imageData.data[index+2];	  
			var alpha=imageData.data[index+3];	 
			var average=(red+green+blue)/3;
			adiff = Math.abs(average-selAverage);
			
			if (average>selAverage){
				imageData.data[index]=255;	  
				imageData.data[index+1]=255;
				imageData.data[index+2]=255;
				imageData.data[index+3]=alpha;
			}	
			else{
				imageData.data[index]=0;	  
				imageData.data[index+1]=0;
				imageData.data[index+2]=0;
				imageData.data[index+3]=alpha;
			} 
		}
		total++;
	}
	//alert("total: "+total);
	canvas.getContext('2d').putImageData(imageData,l,t);
	}
});
