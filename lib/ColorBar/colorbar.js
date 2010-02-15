var ColorBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("<div id=\"colorbar\"></div>");
		this.DOM.addClass("ColorBar");
		args.loc.append(this.DOM);
		this.DOM.html($.ajax({async:false,url:"lib/ColorBar/ColorBar.php",type:"text"}).responseText);
		this.bkg=$("#bkg");
		//set initial background settings
		this.bkg.text('rgb(0,0,0)');
		this.bkg.css("background-color","rgb(0,0,0)");
		this.ul=$("#colorbar_colorlist");
		
		this.setBox=$("#colorbar_SETUPBOX");
		this.setBox.bind("click",{obj:this},function(e){
			$(this).trigger("makeBox");
		});
		
		this.ocr=$("#colorbar_OCR");
		this.ocr.bind("click",{obj:this},function(e){
			$(this).trigger("beginOCR");
		});
		
		//for testing
		this.rects=$("#colorbar_test_rects");
		this.rects.bind("click",{obj:this},function(e){
		
			$(this).trigger("layerRectangles");
		});
		
		this.curHex=0;
		this.hexSet=false;
		this.colorSet=[];
		//set up color sliders
		this.setColorSliders();
		//set up zoom controls - will be added to future toolbox object
		this.setZoom();
		$("body").bind("hexValues",{obj:this},this.colorPickerSet);
		$("body").bind("setHexValue",{obj:this},this.setHexValue);
		$("body").bind("regionloaded",{obj:this},this.regionLoaded);
		this.DOM.bind("colorSlideSet",{obj:this},this.colorHexSet);
	},
	setColorSliders:function(){
		if(!(this.redSlide&&this.greenSlide&&this.blueSlide)){
			this.redSlide=$("#colorbar_slider_red");
			this.redSlide.slider({
				max:255,
				min:0,
				stop:function(e,ui){
					if(ui.value){
						$(this).trigger("colorSlideSet",[parseInt(ui.value,10)]);
					}
				}
			});
			this.greenSlide=$("#colorbar_slider_green");
			this.greenSlide.slider({
				max:255,
				min:0,
				stop:function(e,ui){
					if(ui.value){
						$(this).trigger("colorSlideSet",[parseInt(ui.value,10)]);
					}
				}
			});
			this.blueSlide=$("#colorbar_slider_blue");
			this.blueSlide.slider({
				max:255,
				min:0,
				stop:function(e,ui){
					if(ui.value){
						$(this).trigger("colorSlideSet",[parseInt(ui.value,10)]);	
					}
				}
			});
			$("body").bind("ImageWorking",{obj:this},function(e){
				var obj=e.data.obj;
				obj.blueSlide.slider('disable');
				obj.redSlide.slider('disable');
				obj.greenSlide.slider('disable');
				
			});
			$("body").bind("ImageDoneWorking",{obj:this},function(e){
				var obj=e.data.obj;
				obj.blueSlide.slider('enable');
				obj.redSlide.slider('enable');
				obj.greenSlide.slider('enable');
			});
		}
	},
	setZoom:function(){
		this.zoomin=$("#colorbar_ZOOMin");
		this.zoomout=$("#colorbar_ZOOMout");
		this.zoomin.click(function(e){
			$(this).trigger("zoom",[1]);
		});
		this.zoomout.click(function(e){
			$(this).trigger("zoom",[0]);
		});
	},
	colorHexSet:function(e){
		var obj=e.data.obj;
		//add them up
		var red=parseInt(obj.redSlide.slider('value'),10);
		var green=parseInt(obj.greenSlide.slider('value'),10);
		var blue=parseInt(obj.blueSlide.slider('value'),10);
		var hexstring=red+","+green+","+blue;
		obj.updateBkg(hexstring);
		//send to the Image to transform bounding area
		obj.DOM.trigger("ColorChange",[hexstring]);
		return false;
	},

	colorPickerSet:function(e,hex,setsliders){
		var obj=e.data.obj;	
		var rx=/[A-Fa-f]/;
		var red1=(rx.test(hex.substring(0,1)))?((hex.substring(0,1).charCodeAt())):parseInt(hex.substring(0,1),10)*16;
		var red2=(rx.test(hex.substring(1,2)))?((hex.substring(1,2).charCodeAt())):parseInt(hex.substring(1,2),10)*16;
		
		var green1=(rx.test(hex.substring(2,3)))?((hex.substring(2,3).charCodeAt())):parseInt(hex.substring(2,3),10)*16;
		var green2=(rx.test(hex.substring(3,4)))?((hex.substring(3,4).charCodeAt())):parseInt(hex.substring(3,4),10)*16;
		
		var blue1=(rx.test(hex.substring(4,5)))?((hex.substring(4,5).charCodeAt())):parseInt(hex.substring(4,5),10)*16;
		var blue2=(rx.test(hex.substring(5)))?((hex.substring(5).charCodeAt())):parseInt(hex.substring(5),10)*16;
		if(setsliders){
			obj.redSlide.slider('option','value',(red1+red2));
			obj.greenSlide.slider('option','value',(green1+green2));
			obj.blueSlide.slider('option','value',(blue1+blue2));
			obj.blueSlide.trigger("colorSlideSet",[0]);//update the region
		}
		obj.updateBkg((red1+red2)+","+(green1+green2)+","+(blue1+blue2));
	},
	updateBkg:function(hex){
		
		//set hex sliders to 'sample pixel' values
		if((hex!=this.curHex)){
			this.curHex=hex;
			//change background div properties
			var hexrgb="rgb("+hex+")";
			this.bkg.css("background-color",hexrgb);
			this.bkg.text(hexrgb);
		}
	},
	setHexValue:function(e,hex){
		var obj=e.data.obj;
		obj.hexSet=true;
		obj.curHex=hex;
	},
	regionLoaded:function(e){
		var obj=e.data.obj;
		//triggered by call from CanvasImage
		if(obj.curHex) {
			obj.DOM.trigger("ColorChange",[obj.curHex]);
		} else {
			//send it null values (start values)
			obj.updateBkg("0,0,0");
			obj.DOM.trigger("ColorChange",[obj.curHex]);
		}
	}
});