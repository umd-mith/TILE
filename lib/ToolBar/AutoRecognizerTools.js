var AutoRecognizerTools=Monomyth.Class.extend({
	init:function(args){
		this.loc=args.loc;
	}
});

var TileAutoRecognizerTools=AutoRecognizerTools.extend({
	init:function(args){
		this.$super(args);
		this.loc.append($.ajax({
			url:'lib/ToolBar/AutoRecognizerTools.html',
			data:'GET',
			dataType:'html',
			async:false
		}).responseText);
		this.DOM=$("#ARControls");
		this.rgbDiv=$("#backgroundimage");
		this.rgbValue=[0,0,0];
		
		this.showBox=$("#setRegion");
		this.showBox.click(function(e){
			$(this).trigger("showBox");
		});
		
		this.convertBW=$("#convertBW");
		this.convertBW.bind("click",{obj:this},this.convertBlackWhite);
		
		this.autoRec=$("#autoRecognize");
		this.autoRec.click(function(e){
		
			$(this).trigger("beginOCR");
		});
		
		this.showLine=$("#showLines");
		this.showLine.click(function(e){
			$(this).trigger("layerRectangles");
		});
		
		$("body").bind("showBox",{obj:this},this.displayBox);
		this.setSliders();
	},
	setSliders:function(){
		this.redSlide=$("#red").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["red",ui.value]);
			}
		});
		this.greenSlide=$("#green").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["green",ui.value]);
			}
		});
		this.blueSlide=$("#blue").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["blue",ui.value]);
			}
		});
		this.DOM.bind("slideChange",{obj:this},this.changeColorFromSlider);
	},
	changeColorFromSlider:function(e,color,val){
		var obj=e.data.obj;
		switch(color){
			case "red":
				obj.rgbValue[0]=parseInt(val,10);
				break;
			case "green":
				obj.rgbValue[1]=parseInt(val,10);
				break;
			case "blue":
				obj.rgbValue[2]=parseInt(val,10);
				break;
		}
		var rgb=obj.rgbValue[0]+","+obj.rgbValue[1]+","+obj.rgbValue[2];
		obj.rgbDiv.text(rgb);
		obj.rgbDiv.css("background-color","rgb("+rgb+")");
		if($("#selectionbox")){
			obj.DOM.trigger("ColorChange",[rgb]);
		}
	},
	displayBox:function(e){
		var obj=e.data.obj;
		if($("#selectionbox").length==0){
			var box=new SelectorBox({
				loc:obj.loc
			});
			box.DOM.attr("id","selectionbox");
			box.makeDrag();
		}
	},
	convertBlackWhite:function(e){
		var obj=e.data.obj;
		if($("#selectionbox").position()){
			var txt=obj.rgbDiv.text();
			var box=$("#selectionbox");
			var values={w:box.width(),
				h:box.height(),
				ox:box.position().left,
				oy:box.position().top
			};
			obj.DOM.trigger("RegionSet",[values]);
			obj.DOM.trigger("ColorChange",[txt]);
		}
	}
});


var TestAutoRecognizerTools=AutoRecognizerTools.extend({
	init:function(args){
		this.$super(args);
		
		this.DOM=$("#ARControls");
		this.rgbDiv=$("#backgroundimage");
		this.rgbValue=[0,0,0];
		
		this.showBox=$("#setRegion");
		this.showBox.click(function(e){
			$(this).trigger("showBox");
		});
		
		this.convertBW=$("#convertBW");
		this.convertBW.bind("click",{obj:this},this.convertBlackWhite);
		
		this.autoRec=$("#autoRecognize");
		this.autoRec.click(function(e){
			$(this).trigger("beginOCR");
		});
		
		this.showLine=$("#showLines");
		this.showLine.click(function(e){
			$(this).trigger("layerRectangles");
		});
		
		$("body").bind("showBox",{obj:this},this.displayBox);
		this.setSliders();
	},
	setSliders:function(){
		this.redSlide=$("#red").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["red",ui.value]);
			}
		});
		this.greenSlide=$("#green").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["green",ui.value]);
			}
		});
		this.blueSlide=$("#blue").slider({
			min:0,
			max:255,
			stop:function(e,ui){
				$(this).trigger("slideChange",["blue",ui.value]);
			}
		});
		this.DOM.bind("slideChange",{obj:this},this.changeColorFromSlider);
	},
	changeColorFromSlider:function(e,color,val){
		var obj=e.data.obj;
		switch(color){
			case "red":
				obj.rgbValue[0]=parseInt(val,10);
				break;
			case "green":
				obj.rgbValue[1]=parseInt(val,10);
				break;
			case "blue":
				obj.rgbValue[2]=parseInt(val,10);
				break;
		}
		var rgb=obj.rgbValue[0]+","+obj.rgbValue[1]+","+obj.rgbValue[2];
		obj.rgbDiv.text(rgb);
		obj.rgbDiv.css("background-color","rgb("+rgb+")");
		if($("#selectionbox")){
			obj.DOM.trigger("ColorChange",[rgb]);
		}
	},
	displayBox:function(e){
		var obj=e.data.obj;
		if($("#selectionbox").length==0){
			var box=new SelectorBox({
				loc:obj.loc
			});
			box.DOM.attr("id","selectionbox");
			box.makeDrag();
		}
	},
	convertBlackWhite:function(e){
		var obj=e.data.obj;
		if($("#selectionbox").position()){
			var txt=obj.rgbDiv.text();
			var box=$("#selectionbox");
			var values={w:box.width(),
				h:box.height(),
				ox:box.position().left,
				oy:box.position().top
			};
			obj.DOM.trigger("RegionSet",[values]);
			obj.DOM.trigger("ColorChange",[txt]);
		}
	}
});