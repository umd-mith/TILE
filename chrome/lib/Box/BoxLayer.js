var BoxLayer = function(args){


	//this.center = (args.center) ? args.center : new OpenLayers.LonLat(0, 0);
	//this.bounds=new OpenLayers.Bounds(0, 155, 0, 155);
	//this.box = new OpenLayers.Marker.Box(this.bounds, "red", 0);
	
	this.boxClickEvent="boxClickEvent";
	this.box = null;
	this.mapcontainerid=args.containerid;
	this.mapcontainer=null;//for offsetting points
	this.ml,this.mt=null;
	this.mapbounds=args.mapbounds;
	this.layerbounds=null;
	
}
BoxLayer.prototype={
	boxMove:function(bounds){
		
	},
	placeBox:function(){

		if (!this.box) {

			
	
			var mapdiv = $(this.mapcontainerid); 
	
			this.box = $("<div id='boundaryBox'></div>").appendTo(mapdiv);			
	
			this.createDragResizeBox(this.box);
			//this.box.hide();
		}
		this.box.show("slow");
		/*
if (this.layer.markers.length == 0) {
			
			this.layer.addMarker(this.box);
			
		} else {
			this.removeBox();
			this.layer.addMarker(this.box);
		}
*/
	},
	createDragResizeBox:function(box){
		
		box.css("position","absolute");
		box.css("left",137);
			box.css("top",118);
		box.css("width",250);
		box.css("height",450);
		box.css("z-index","1001");
		box.css("background-color","red");
		box.fadeTo("fast",0.45);
		box.bind("mousedown",{obj:this},function(e){
			
			e.data.obj.box.trigger("boxClickEvent",{mode:false});
		});
		box.bind("adjustBox",{obj:this},this.adjustBoxBounds);
		box.bind("boxDragged",{obj:this},this.boxWasDragged);
		//Make the box draggable and resizable
		box.draggable({
			start:function(e){//turn off map dragging
				e.stopPropagation();
				$(".ui-draggable").trigger("boxClickEvent",{mode:false});
				
			},
			drag:function(e){//turn off map dragging
				e.stopPropagation();
				$(".ui-draggable").trigger("boxClickEvent",{mode:false});
				
			},
			stop:function(e,ui){//turn on map dragging
				e.stopPropagation();
				$(".ui-draggable").trigger("boxClickEvent",{mode:true});
				$(".ui-draggable").trigger("boxDragged",[ui]);
				
			}
		}); 
		box.resizable({ghost:true,
		//set up the callbacks for resizing (changes proportions)
				stop:function(e,ui){
					//triggers bound event
					$(".ui-resizable").trigger("adjustBox",[ui]);
				}
		});
	},
	removeBox:function(){
		this.box.hide();
		//this.layer.removeMarker(this.box);
	},
	boxWasDragged:function(e,ui){
		//same as with adjustBoxBounds, except
		//only or dragging
		//cant trust ui object - measures helper element
		var obj=e.data.obj;
		if((!obj.ml)||(!obj.mt)){
			obj.mapcontainer=$(obj.mapcontainerid);
			var mappos=obj.mapcontainer.position();
			obj.ml=mappos.left;
			obj.mt=mappos.top;
		}
		//use jquery position to find position
		var pos=obj.box.position();
		
		var tl=Math.abs(pos.left);
		var tt=Math.abs(pos.top)-Math.abs(obj.mt); 
		var w=parseInt(obj.box.width());
		var h=parseInt(obj.box.height());
		//Change bounds to reflect new position and/or size
		//var ll = obj.layer.map.getLonLatFromPixel(new OpenLayers.Pixel(tl,(tt+h))); 
      //  var ur = obj.layer.map.getLonLatFromPixel(new OpenLayers.Pixel((tl+w),(tt))); 
                        
		//obj.bounds=new OpenLayers.Bounds(ll.lon,ll.lat,ur.lon,ur.lat);
		
		//obj.box.bounds=obj.bounds;
	},
	adjustBoxBounds:function(e,ui){
		var obj=e.data.obj;
		if((!obj.ml)||(!obj.mt)){
			obj.mapcontainer=$(obj.mapcontainerid);
			var mappos=obj.mapcontainer.position();
			obj.ml=mappos.left;
			obj.mt=mappos.top;
		}
		//ui contains top/left data for position and size
		var pos=obj.box.position();
		var tl=Math.abs(pos.left);
		var tt=Math.abs(pos.top); 
		//var tl=Math.abs(ui.position.left);
		//var tt=Math.abs(ui.position.top); 
		var w,h=null;
		if (ui.size) {
			w = ui.size.width;
			h = ui.size.height;
		} else {
			//if(!obj.box) obj.box=$("#"+obj.box.div.id);
			w=parseInt(obj.box.width());
			h=parseInt(obj.box.height());
		}
		//Change bounds to reflect new position and/or size
		//var ll = obj.layer.map.getLonLatFromPixel(new OpenLayers.Pixel(tl, (tt+h))); 
       // var ur = obj.layer.map.getLonLatFromPixel(new OpenLayers.Pixel((tl+w), (tt))); 
                        
		//obj.bounds=new OpenLayers.Bounds(ll.lon,ll.lat,ur.lon,ur.lat);
		
		obj.box.bounds=obj.bounds;
	},
	//called by map
	setBounds:function(center,imgsize){
		if (this.box) {
			this.box.trigger('adjustBox', [{
				position: this.box.position()
			}]);
		}
		/*
if (this.center) {
			var oldcenter = this.center;
			this.center = center;//update map extents
			//alert(oldbounds+"  them neu bounds: "+this.mapbounds);
			//compare two bounds and update the box boundaries
			//alert("in: "+this.box.bounds);
			if (this.box && (this.box.css("display") != "none")) {
				var xy = this.box.position();
				
				var xyll=this.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(xy.left,xy.top));
				var whll=this.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(this.box.width(),this.box.height()));
				//var l = (this.box.bounds.left / oldcenter.lon) * this.center.lon;
				var l=xyll.lon;
				var b=xyll.lat+whll.lat;
				var r=xyll.lon+whll.lon;
				var t=xyll.lat;
				
				//var b = (this.box.bounds.bottom / oldcenter.lat) * this.center.lat;
				//var r = (this.box.bounds.right / oldcenter.lon) * this.center.lon;
				//var t = (this.box.bounds.top / oldcenter.lat) * this.center.lat;
				var bb = new OpenLayers.Bounds(l, b, r, t);
				//alert("out:  "+bb);
				this.box.bounds = bb;
			}
		}
		else {
			this.center = center;
		}
*/

	},
	getBounds:function(){
		if (this.layer.markers == 0) {
			alert("Put a box on the map first");
			return false;
		}
		else {
			while (this.layer.markers > 1) {
				//too many boxes - only keep the most recent one
				var box = this.layer.markers.shift();//get an older one
				box.destroy(); //remove it
			}
			if (!this.box) {
				this.box = this.layer.markers[0];
			}
			var bounds=this.box.bounds;
			var res=this.layer.map.getResolution();
			if((!this.ml)||(!this.mt)){
				this.mapcontainer=$(this.mapcontainerid);
				var mappos=this.mapcontainer.position();
				this.ml=mappos.left;
				this.mt=mappos.top;
			}
			
			//get values in pixel format
			var pos=this.box.position();
			var w=this.box.width();
			var h=this.box.height();
			
			return {
				x:Math.abs(pos.left),
				y:Math.abs(pos.top),
				w:w,
				h:h
			};
		}
	},
	boxClicked:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		obj.box.trigger("boxClickEvent",{mode:false});
	}
}

