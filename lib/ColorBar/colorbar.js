var ColorBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("<div id=\"colorbar\"></div>");
		this.DOM.addClass("ColorBar");
		args.loc.append(this.DOM);
		this.DOM.html($.ajax({async:false,url:"lib/ColorBar/ColorBar.php",type:"text"}).responseText);
		this.bkg=$("#bkg");
		this.ul=$("#colorbar_colorlist");
		
		this.ocr=$("#colorbar_OCR");
		this.ocr.bind("click",{obj:this},function(e){
			$(this).trigger("beginOCR");
		});
		
		this.curHex=0;
		this.hexSet=false;
		this.colorSet=[];
		//set up color sliders
		this.setColorSliders();
		//$("body").bind("hexValues",{obj:this},this.updateBkg);
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
						$(this).trigger("colorSlideSet",[parseInt(ui.value)]);
					}
				}
			});
			this.greenSlide=$("#colorbar_slider_green");
			this.greenSlide.slider({
				max:255,
				min:0,
				stop:function(e,ui){
					if(ui.value){
						$(this).trigger("colorSlideSet",[parseInt(ui.value)]);
					}
				}
			});
			this.blueSlide=$("#colorbar_slider_blue");
			this.blueSlide.slider({
				max:255,
				min:0,
				stop:function(e,ui){
					if(ui.value){
						$(this).trigger("colorSlideSet",[parseInt(ui.value)]);	
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
	colorHexSet:function(e){
		var obj=e.data.obj;
		//add them up
		var red=parseInt(obj.redSlide.slider('value'));
		var green=parseInt(obj.greenSlide.slider('value'));
		var blue=parseInt(obj.blueSlide.slider('value'));
		var hexstring=red+","+green+","+blue;
		obj.updateBkg(hexstring);
		//send to the Image to transform bounding area
		obj.DOM.trigger("ColorChange",[hexstring]);
		return false;
	},
	updateBkg:function(hex){
		if((hex!=this.curHex)){
			this.curHex=hex;
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
/*	sortList:function(e,colorSet){
		var obj=e.data.obj;
		obj.ul.empty();
		obj.colorSet=colorSet;
	
		for (var n=0;n<obj.colorSet.length;n++){
			var color = obj.colorSet[n];
			setTimeout(function(obj,color){
				var block = $("<div></div>");
				block.appendTo(obj.ul);
				block.css({
					"background-color": "#"+color,
					"width" : "500px",
					"height" : "20px" 
				});	
				block.dblclick(function(e){
					bg = $(this).css("background-color");
					alert(bg);
					$(this).trigger("ColorChange",[bg]);
				
				});
				
			},1,obj,color);
			
		}
	} */
});