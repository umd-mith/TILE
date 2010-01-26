/**
 * Generate an OpenLayers Layer that holds data for 
 * Lines in the document image
 * 
 * Creates another OpenLayers.Layer.Boxes Layer
 */

var Lines=function(args){
	this.name=(args.name)?args.name:"Lines";
	this.layer=new OpenLayers.Layer.Boxes(this.name);
	this.lines=[];
	this.linecount=0;
	this.leftmax=null;
	this.rightmax=null;
	this.bottommax=null;
	this.topmax=null;
	this.lineheight=null;
	
	//global listener
	$("body").bind("removeLine",{obj:this},this.removeLineFromScreen);
	
	//bind listener to the layer div
	$(".olLayerDiv").bind("linebounds",{obj:this},this.changeLineBounds);
	//bind click events
	$(".ui-draggable").live("mousedown",function(e){
		$(this).trigger("boxClickEvent",{mode:false});
	});
}
Lines.prototype={
	clearLines:function(){
		if(this.layer.markers.length>0){
			while(this.layer.markers.length>0){ 
				//automatically erases and bumps
				//the count of markers[] down
				this.layer.removeMarker(this.layer.markers[0]);
			}
		}
	},
	setLines:function(dims,linearray){
		//set boundaries
		this.leftmax=dims.x;
		this.rightmax=(dims.x+dims.w);
		this.topmax=dims.y;
		this.bottommax=(dims.y+dims.h);
		this.lineheight=parseInt(dims.minLineHeight);
		//for each line y-value, set a line at leftmax, y-value
		//break up array ('%')
		this.lines=linearray.split('%');
		this.linecount=0;
		setTimeout(function(obj){
			obj.recursiveAddLine();
		},100,this);
	},
	recursiveAddLine:function(){
		var line=parseInt(this.lines[this.linecount]);
		if((line!=null)&&(line!="")){
			var bbounds=new OpenLayers.Bounds();
			var h=line+this.lineheight;
			if (h) {
				bbounds.extend(this.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(this.leftmax, line)));
				bbounds.extend(this.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(this.rightmax, h)));
				var box = new OpenLayers.Marker.Box(bbounds, "red", 2);
				this.layer.addMarker(box);
				
				this.activateBox(box);
			}
		}
		if(this.linecount<this.lines.length){
			this.linecount++;
			setTimeout(function(obj){
				obj.recursiveAddLine();
			},100,this);
		} else{
			this.lines=[];
			$("body").trigger("setProgress",[100,true]);
			//put all of the boxes in order
			setTimeout(function(obj){
				obj.putMarkersInOrder();
			},1,this);
		}
	},
	removeLineFromScreen:function(e,boxel){
		var obj=e.data.obj;
		var box=null;
		for(i=0;i<obj.layer.markers.length;i++){
			if(boxel.attr("id")==obj.layer.markers[i].div.id){
				box=obj.layer.markers[i];
				break;
			}
		}
		obj.layer.removeMarker(box);
		box.destroy();
	},
	putMarkersInOrder:function(){
		var order=[];
		var m=this.layer.markers;
		for(i=0;i<m.length;i++){
			if(order.length==0){
				order.push(m[i]);
			} else {
				var last=parseInt($("#"+order[(order.length-1)].div.id).css("top"));
				var next=parseInt($("#"+m[i].div.id).css("top"));
				if(last>next){
					var l=order.pop();
					order.push(m[i]);
					order.push(l);
				} else{
					order.push(m[i]);
				}
			}
		}
		this.ordered=order;
	},
	getAllData:function(){
		//order the markers in order of 
		//top-most to bottom-most
		this.putMarkersInOrder();
		return this.ordered;
	},
	setBounds:function(bounds){
		if (this.mapbounds) {
			var oldbounds = this.mapbounds;
			this.mapbounds = bounds;//update map extents
			//compare two bounds and update line bounds
			for (i = 0; i < this.layer.markers; i++) {
				var line = this.layer.markers[i];
				var l = (line.bounds.left / oldbounds.left) * this.mapbounds.left;
				var b = (line.bounds.bottom / oldbounds.bottom) * this.mapbounds.bottom;
				var r = (line.bounds.right / oldbounds.right) * this.mapbounds.right;
				var t = (line.bounds.top / oldbounds.top) * this.mapbounds.top;
				var bb = new OpenLayers.Bounds(l, b, r, t);
				line.bounds = bb;
			}
		}
	},
	activateBox:function(box){
		if(box){
			//get actual div and convert it
			var boxel=$("#"+box.div.id);
			this.DDResizeBox(boxel);
		}
	},
	activateBoxes:function(){
		var boxes=this.layer.markers;
		
		for(b=0;b<boxes.length;b++){
			var box=boxes[b];
			if(box){
				//get actual div and convert it
				var boxel=$("#"+box.div.id);
				this.DDResizeBox(boxel);
			}
		}
	},
	DDResizeBox:function(boxel){
		boxel.draggable({
			start:function(e,ui){
				$('.ui-draggable').trigger("boxClickEvent",{mode:false});
			},
			drag:function(e,ui){
				$('.ui-draggable').trigger("boxClickEvent",{mode:false});
			},
			stop:function(e,ui){
				$('.ui-draggable').trigger("boxClickEvent",{mode:true});
				setTimeout(function(obj,ui){
					$('.ui-draggable').trigger("linebounds",[ui,obj]);
				},3,this,ui);
					
					
			}
		});
		boxel.resizable({
			stop:function(e,ui){
				setTimeout(function(obj,ui){
					$('.ui-draggable').trigger("linebounds",[ui,obj]);
					},3,this,ui);
			}
		});
		
		//add a remove button
		var remove=$("<a id=\""+boxel.attr("id")+"_remove\" class=\"lineRemove\">X</a>");
		boxel.append(remove);
		remove.bind("click",function(e){
			$(this).trigger("removeLine",[$(this).parent()]);
		});
	},
	changeLineBounds:function(e,ui,boxel){
		var obj=e.data.obj;
		var box=null;
		//find box
		for(b=0;b<obj.layer.markers.length;b++){
			if(obj.layer.markers[b].div.id==boxel.id){
				box=obj.layer.markers[b];break;
			}
		}
		if(!box) throw "No box found";
		var pos=$("#"+boxel.id).position();
		var left=Math.abs(pos.left);
		var top=Math.abs(pos.top);
		var width=$("#"+boxel.id).width();
		var height=$("#"+boxel.id).height();
		var bounds=new OpenLayers.Bounds();
		bounds.extend(obj.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(left,top)));
		bounds.extend(obj.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel((left+width),(top+height))));
		box.bounds=bounds;
	},
	addNextLine:function(){
		
		var lastbounds=null;
		if(this.layer.markers.length>0){
			var box=this.layer.markers[this.layer.markers.length-1];
			lastbounds=box.bounds
			
			var boxel=$("#"+box.div.id);
			
			//var h=(this.lineheight)?this.layer.getLonLatFromViewPortPx(new OpenLayers.Pixel(0,this.lineheight)).lat:500;
			var left=lastbounds.left;
			//var top=clonlat.lat+(parseInt(lastbounds.getHeight())/2)+(parseInt(lastbounds.getHeight()));
			var top=lastbounds.bottom;
		
			var nextbounds=lastbounds.add(left,top);
			//alert('lastbounds: '+lastbounds+'  nextbounds: '+nextbounds);
			var line=new OpenLayers.Marker.Box(nextbounds,"red",2);
			this.layer.addMarker(line);
			this.activateBox(line);
			setTimeout(function(obj){
				obj.putMarkersInOrder();
			},1,this);
		} else {
			box=new OpenLayers.Marker.Box(new OpenLayers.Bounds(0,3000,600,0));
			this.layer.addMarker(box);
			this.activateBoxes();
			return;
		}
		
		
	}
	
}
