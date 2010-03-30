/**
SideToolbar

For handling color recognition, tagging


loc: ID for the element to attach to
**/

var SideToolBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("#"+args.loc);
		//attach PHP-fed HTML into location
		// this.DOM.append($.ajax({
		// 							async:false,
		// 							url:'lib/ToolBar/SideToolBar.php',
		// 							type:'GET'
		// 						}).responseText);
	
		/**
		this.DOM=$("<div class=\"SideToolBar\"></div>");
		this.DOM.attr("id",function(e){
			return "sidebar"+$(".sidetoolbar").length;
		});
		this.DOM.appendTo(args.loc);
		this.loc=args.loc;**/
		
	},
	activate:function(){
		this.DOM.show();
	},
	deactive:function(){
		this.DOM.hide();
	}
});

/**Secondary toolbar for the TILE interface - holds 
buttons for shape commands 
**/

var TILEShapeToolBar=SideToolBar.extend({
	init:function(args){
		this.$super(args);
		this.DOM.append($.ajax({
			async:false,
			url:'lib/ToolBar/SideToolBar.html',
			type:'GET',
			dataType:'html'
		}).responseText);
		//Define Area elements
		this.rect=$("#rect");
		this.rect.click(function(e){
			if(!$(this).hasClass("inactive")){
				$(this).trigger("changeShapeType",['rect']);
			}
		});
		this.poly=$("#poly");
		this.poly.click(function(e){
			if(!$(this).hasClass("inactive")){
				$(this).trigger("changeShapeType",['poly']);
			}
		});
		this.elli=$("#elli");
		this.elli.click(function(e){
			if(!$(this).hasClass("inactive")){
				$(this).trigger("changeShapeType",['elli']);
			}
		});
		
		//Delete Shape Area
		this.delShape=$("#areaDel");
		this.delShape.click(function(e){
			if(!$(this).hasClass("inactive")){
				$(this).trigger("deleteCurrentShape");
			}
		});
		
		//Zoom area situation
		this.zoomIn=$("#zoomIn");
		this.zoomIn.click(function(e){
		
			$(this).trigger("zoom",[1]);
		});
		this.zoomOut=$("#zoomOut");
		this.zoomOut.click(function(e){
			$(this).trigger("zoom",[-1]);
		});
		
		//Page changers
		this.pageNext=$("#pgNext");
		this.pageNext.click(function(e){
			$(this).trigger("turnPage",[1]);
		});
		this.pagePrev=$("#pgPrev");
		this.pagePrev.click(function(e){
			$(this).trigger("turnPage",[-1]);
		});
		
		this.setUpColorPicker();
		
		//attach listener for imageLoaded
		$("body").bind("activateShapeBar",{obj:this},this.activateShapeBar);
		$("body").bind("deactivateShapeBar",{obj:this},this.deactivateShapeBar);
		
		$("body").bind("coordDataSent",{obj:this},this.shapeSet);
		$("body").bind("activateShapeDelete",{obj:this},this.shapeSet);
		$("body").bind("deactivateShapeDelete",{obj:this},this.shapeUnSet);
		//local listener
		this.DOM.bind("deleteCurrentShape",{obj:this},this.shapeUnSet);
	},
	setUpColorPicker:function(){
		//html elements
		this.colorWidgetB=$("#customWidget");
		this.colorSelect=$("#colorSelector2");
		this.colorPicker=$("#colorpickerHolder2");
		this.CP=this.colorPicker.ColorPicker({
			flat: true,
			color: '#FF0000',
			onSubmit: this.onCPSubmit
		});
		this.clickColorSubmit=$(".colorpicker_submit");
		this.clickColorSubmit.bind("click",{obj:this},this.closeWidgetClick);
		
		//listeners
		this.widt=false;
		this.colorWidgetB.bind("click",{obj:this},this.customWidgetClick);
		
	},
	customWidgetClick:function(e){
		var obj=e.data.obj;
		if(!obj.widt){
			$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
			obj.widt = !obj.widt;
		}
	},
	closeWidgetClick:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		$('#colorpickerHolder2').stop().animate({height:0}, 500);
		obj.widt=false;
		
	},
	onCPSubmit:function(hsb,hex,rgb){
		$('#colorSelectorBkgd').css('background-color', '#' + hex);
		$('#colorSelectorBkgd').trigger("shapeColorSubmit",[hex]);
	},
	activateShapeBar:function(e){
		if(e){
			var obj=e.data.obj;
		
			obj.rect.removeClass("inactive");
			obj.poly.removeClass("inactive");
			obj.elli.removeClass("inactive");
		} else {
	
			this.rect.removeClass("inactive");
			this.poly.removeClass("inactive");
			this.elli.removeClass("inactive");
		}
	},
	deactivateShapeBar:function(e){
		if(e){
			var obj=e.data.obj;
			//attach listener for imageLoaded
			obj.rect.addClass("inactive");
			obj.poly.addClass("inactive");
			obj.elli.addClass("inactive");
		} else {
			//attach listener for imageLoaded
			this.rect.addClass("inactive");
			this.poly.addClass("inactive");
			this.elli.addClass("inactive");
		}
	},
	shapeSet:function(e){
		var obj=e.data.obj;
		obj.delShape.removeClass("inactive");
		if(!obj.rect.hasClass("inactive")) obj.deactivateShapeBar();
		
		if(e=="coordDataSent") $("body").unbind("coordDataSent",obj.shapeSet);
	},
	shapeUnSet:function(e){
		var obj=e.data.obj;
		if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
		if(obj.rect.hasClass("inactive")) obj.activateShapeBar();
	}
});

/**
AutoRecognizerSideToolBar

**/

var AutoRecognizerSideToolBar=SideToolBar.extend({
	init:function(args){
		this.$super(args);
		this.DOM.html($.ajax({
			async:false,
			url:'lib/ToolBar/SideToolBar.php',
			dataType:'text'
		}).responseText);
		
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
		
		//set up color sliders
		this.setColorSliders();
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
	toggleEyedropper:function(e){
		var obj=e.data.obj;
		if(!obj.eyedropperOn){
			//bind listener to Image mouseover
			$("body").bind("hexValues",{obj:obj},obj.colorPickerSet);
			obj.eyedropperOn=true;
		} else {
			//unbind listener from Image mouseover
			$("body").unbind("hexValues",this.colorPickerSet);
			obj.eyedropperOn=false;
		}
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
	}
});