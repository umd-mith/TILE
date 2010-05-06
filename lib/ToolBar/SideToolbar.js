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
		
		//shape display selectors
		this.showAllS=$("#showAllShapes").click(function(e){
			e.preventDefault();
			if($(this).hasClass("inactive")){
				$(this).trigger("shapeSelect",['all']);
				$(this).removeClass("inactive");
				$("#showNoShapes").addClass('inactive');
				$("#showCurrentShape").addClass('inactive');
			}
		});
		this.showNoS=$("#showNoShapes").click(function(e){
			e.preventDefault();
			if($(this).hasClass("inactive")){
				$(this).trigger("shapeSelect",['none']);
				$(this).removeClass("inactive");
				
				$("#showAllShapes").addClass('inactive');
				$("#showCurrentShape").addClass('inactive');
			}
		});
		this.showCurrS=$("#showCurrentShape").click(function(e){
			e.preventDefault();
			if($(this).hasClass("inactive")){
				$(this).trigger("shapeSelect",['current']);
				$(this).removeClass("inactive");
				$("#showNoShapes").addClass('inactive');
				$("#showAllShapes").addClass('inactive');
			}
		});
		//Define Area elements
		this.rect=$("#rect");
		this.rect.click(function(e){
			if((!$(this).hasClass("inactive"))&&(!$(this).hasClass("active"))){
				$(this).addClass("active");
				$("#poly").removeClass("active");
				$("#elli").removeClass("active");
				
				$(this).trigger("changeShapeType",['rect']);
			}
		});
		this.poly=$("#poly");
		this.poly.click(function(e){
			if((!$(this).hasClass("inactive"))&&(!$(this).hasClass("active"))){
				$(this).addClass("active");
				$("#rect").removeClass("active");
				$("#elli").removeClass("active");
				
				$(this).trigger("changeShapeType",['poly']);
			}
		});
		this.elli=$("#elli");
		this.elli.click(function(e){
			if((!$(this).hasClass("inactive"))&&(!$(this).hasClass("active"))){
				$(this).addClass("active");
				$("#rect").removeClass("active");
				$("#poly").removeClass("active");
			
				$(this).trigger("changeShapeType",['elli']);
			}
		});
		//set up shape area
		this.shapeType="rect";
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
		$("body").bind("activateShapeDelete",{obj:this},this.shapeSet);
		$("body").bind("deactivateShapeDelete",{obj:this},this.shapeUnSet);
		$("body").bind("turnOffShapeBar",{obj:this},this.turnOffShapeBar);
		//local listener
		this.DOM.bind("changeShapeType",{obj:this},function(e,type){
			var obj=e.data.obj;
			obj.shapeType=type;
		});
	},
	//creates ColorPicker from plugin code
	setUpColorPicker:function(){
		//html elements
		
		this.colorWidgetB=$("#customWidget");
		//NEW: attaching to SVG element
		this.colorSelect=$("#colorSelector2");
		this.colorPicker=$("#colorpickerHolder2");
		
		//this.colorPicker=$("<div id=\"colorpickerHolder2\"></div>").insertBefore($("svg"));
		
		
		this.CP=this.colorPicker.ColorPicker({
			flat: true,
			color: '#000000',
			onSubmit: this.onCPSubmit
		});
		$('#colorSelectorBkgd').css('background-color', '#000000');
		this.clickColorSubmit=$(".colorpicker_submit");
		this.clickColorSubmit.bind("click",{obj:this},this.closeWidgetClick);
		
		//listeners
		this.widt=false;//toggles on/off mode of colorpicker
		//widt=false=closed
		//widt=true=open
		this.colorWidgetB.bind("click",{obj:this},this.customWidgetClick);
		this.colorWidgetB.trigger("sideBarDone");
		
	},
	//used for opening and closing the ColorPicker plugin
	customWidgetClick:function(e){
		var obj=e.data.obj;
		if(!obj.widt&&(!obj.colorSelect.hasClass("inactive"))){
			$('#colorpickerHolder2').stop().animate({height: obj.widt ? 0 : 173}, 500);
			obj.widt = !obj.widt;
			$(this).trigger("closeDownVD",[obj.widt]);
		}
	},
	closeWidgetClick:function(e){
		e.stopPropagation();
		var obj=e.data.obj;
		$('#colorpickerHolder2').stop().animate({height:0}, 500);
		obj.widt=false;
		obj.DOM.trigger("closeDownVD",[obj.widt]);
		//reset canvas drawer
		obj.DOM.trigger("changeShapeType",[obj.shapeType]);
		// if(!obj.rect.hasClass("inactive")){
		// 		obj.colorPicker.trigger("changeShapeType",['rect']);
		// 	} else if(!obj.poly.hasClass("inactive")){
		// 		obj.colorPicker.trigger("changeShapeType",['poly']);
		// 	} else if(!obj.elli.hasClass("inactive")){
		// 		obj.colorPicker.trigger("changeShapeType",['elli']);
		// 	}
	},
	onCPSubmit:function(hsb,hex,rgb){
		$('#colorSelectorBkgd').css('background-color', '#' + hex);
		$('body').trigger("NEWSHAPECOLOR",[hex]);
	},
	activateShapeBar:function(e){
		//user has no shape committed to the tag, turn on shape choices and turn off
		//the delete button 
		if(e){
			var obj=e.data.obj;
			
			obj.rect.removeClass("inactive");
			
			obj.poly.removeClass("inactive");
			obj.elli.removeClass("inactive");
			switch(obj.shapeType){
				case 'rect':
					obj.rect.addClass('active');
					break;
				case 'elli':
					obj.elli.addClass("active");
					break;
				case 'poly':
					obj.poly.addClass("active");
					break;
			}
			obj.DOM.trigger("changeShapeType",[obj.shapeType]);
			$("#colorSelector2").removeClass("inactive");
			if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
		} else {
	
			this.rect.removeClass("inactive");
			this.poly.removeClass("inactive");
			this.elli.removeClass("inactive");
			switch(this.shapeType){
				case 'rect':
					this.rect.addClass('active');
					break;
				case 'elli':
					this.elli.addClass("active");
					break;
				case 'poly':
					this.poly.addClass("active");
					break;
			}
			this.DOM.trigger("changeShapeType",[this.shapeType]);
			$("#colorSelector2").removeClass("inactive");
			if(!this.delShape.hasClass("inactive")) this.delShape.addClass("inactive");
		}
	},
	deactivateShapeBar:function(e){
		if(e){
			var obj=e.data.obj;
			//attach listener for imageLoaded
			
		//	if(obj.rect.hasClass("active")){obj.rect.removeClass("active");obj.shapeType="rect";}
			obj.rect.removeClass("active").addClass("inactive");
		//	if(obj.poly.hasClass("active")){obj.poly.removeClass("active");obj.shapeType="poly";}
			obj.poly.removeClass("active").addClass("inactive");
		//	if(obj.elli.hasClass("active")){obj.elli.removeClass("active");obj.shapeType="elli";}
			obj.elli.removeClass("active").addClass("inactive");
			$("#colorSelector2").addClass("inactive");
		} else {
			
			//attach listener for imageLoaded
			this.rect.addClass("inactive");
			if(this.rect.hasClass("active")){
				this.rect.removeClass("active");
				this.shapeType="rect";
			}
			this.poly.addClass("inactive");
			if(this.poly.hasClass("active")){
				this.poly.removeClass("active");
				this.shapeType="poly";}
			this.elli.addClass("inactive");
			if(this.elli.hasClass("active")){
				this.elli.removeClass("active");
				this.shapeType="elli";
			}
			$("#colorSelector2").addClass("inactive");
		}
	},
	shapeSet:function(e){
		var obj=e.data.obj;
		obj.delShape.removeClass("inactive");
		if(!obj.rect.hasClass("inactive")) obj.deactivateShapeBar();
	},
	shapeUnSet:function(e){
		var obj=e.data.obj;
		if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
		if(obj.rect.hasClass("inactive")) obj.activateShapeBar();
	},
	turnOffShapeBar:function(e){
		var obj=e.data.obj;
		if(!obj.delShape.hasClass("inactive")) obj.delShape.addClass("inactive");
		if(!obj.rect.hasClass("inactive")) obj.deactivateShapeBar();
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