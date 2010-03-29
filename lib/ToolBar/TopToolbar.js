var TopToolBar=Monomyth.Class.extend({
	init:function(args){
		this.position=args.position;
		//attach all the php-fed HTML into the DOM object passed
		args.loc.append($.ajax({async:false,url:"lib/ToolBar/TopToolBar.php",type:"text"}).responseText);
		this.DOM=$("#topToolbar");
		
	},
	deactivate:function(){
		this.DOM.hide();
	},
	activate:function(){
		this.DOM.show();
	}
});


var TILETopToolBar=TopToolBar.extend({
	init:function(args){
		this.$super(args);
		this.newImageB=$("#newimage");
		this.newImageB.click(function(e){
			$(this).trigger("openNewImage");
		});
		
		this.importB=$("#import");
		this.importB.click(function(e){
			$(this).trigger("openImport");
		});
		//Saving Progress
		this.savePrompt=new Save({loc:this.DOM.attr("id")});
		this.saveB=$("#save");
		this.saveB.click(function(e){
			$(this).trigger("saveAllSettings");
		});
		$("body").bind("dataReadyToSave",{obj:this},this.saveSettings);
		//this.moreSelect=$("#moreselect");
		this.setUpMore();
		
		// this.helpB=$("#help");
		// 		this.helpB.click(function(e){
		// 			$(this).trigger("showHelp");
		// 		});
	},
	setUpMore:function(){
		$("#moreselect > option").each(function(i,el){
			$(el).click(function(e){
				$(this).trigger("moreOptionClick",[$(this).value()]);
			});
		});
	},
	handleMoreClick:function(e,val){
		var obj=e.data.obj;
		switch(val){
			case "clearSession":
				obj.DOM.trigger("clearSession");
				break;
			case "clearPage":
				obj.DOM.trigger("clearPage");
				break;
			case "restart":
				obj.DOM.trigger("restartAll");
				break;
			case "help":
				obj.DOM.trigger("showHelp");
				break;
		};
	},
	saveSettings:function(e,info){
		var obj=e.data.obj;
		
		obj.savePrompt.userPrompt(info);
	}
});

var FullTopToolBar=TopToolBar.extend({
	init:function(args){
		this.$super(args);
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
		
		this.eyedropper=$("#colorbar_eyedropper");
		this.eyedropperOn=false;
		this.eyedropper.bind("click",{obj:this},this.toggleEyedropper);
		this.curHex=0;
		this.hexSet=false;
		this.colorSet=[];
		
		this.bkg=$("#bkg");
		//set initial background settings
		this.bkg.text('rgb(0,0,0)');
		this.bkg.css("background-color","rgb(0,0,0)");
		
		//Tab Switchers
		this.imageToolsActivate=$("#tab1");
		//this.imageToolsActivate.bind("click",{obj:this},this.setImageToolsActive);
		this.textToolsActivate=$("#tab2");
		//this.textToolsActivate.bind("click",{obj:this},this.setTextToolsActive);
		
		//set up zoom controls - will be added to future toolbox object
		this.setZoom();
		this.setShapeSelectors();
		//set up color sliders
		//this.setColorSliders();
		
		switch(this.position){
			case 'top':
				this.setUpTop();
				break;
			default:
				throw "Error setting up TopToolBar";
		}
		
		$("body").bind("setHexValue",{obj:this},this.setHexValue);
		$("body").bind("regionloaded",{obj:this},this.regionLoaded);
		this.DOM.bind("colorSlideSet",{obj:this},this.colorHexSet);
		
		
	},
	setUpTop:function(){
		$("#colorbar_instructions").hide();
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
	setShapeSelectors:function(){
		this.rectButton=$("#rect");
		this.rectButton.click(function(e){
			$(this).trigger("drawrectangle");
		});
		
		this.elliButton=$("#elli");
		this.elliButton.click(function(e){
			$(this).trigger("drawellipse");
		});
		
		this.polyButton=$("#poly");
		this.polyButton.click(function(e){
			$(this).trigger("drawpolygon");
		});
	}
});

var AutoRecognizerTopToolBar=TopToolBar.extend({
	init:function(args){
		this.$super(args);
		//add style so it is on side
		this.DOM.addClass("ToolBarSide");
		
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
		
		this.eyedropper=$("#colorbar_eyedropper");
		this.eyedropperOn=false;
		this.eyedropper.bind("click",{obj:this},this.toggleEyedropper);
		this.curHex=0;
		this.hexSet=false;
		this.colorSet=[];
		
		this.bkg=$("#bkg");
		//set initial background settings
		this.bkg.text('rgb(0,0,0)');
		this.bkg.css("background-color","rgb(0,0,0)");
		
		//Tab Switchers
		this.imageToolsActivate=$("#tab1");
		//this.imageToolsActivate.bind("click",{obj:this},this.setImageToolsActive);
		this.textToolsActivate=$("#tab2");
		//this.textToolsActivate.bind("click",{obj:this},this.setTextToolsActive);
		
		//set up zoom controls - will be added to future toolbox object
		this.setZoom();
		
		//set up color sliders
		this.setColorSliders();
		
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
	setImageToolsActive:function(e){
		var obj=e.data.obj;
		obj.DOM.trigger("activateImageBar");
	},
	setTextToolsActive:function(e){
		var obj=e.data.obj;
		obj.DOM.trigger("activateTextBar");
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