/**
SideToolbar

For handling color recognition, tagging

**/

var SideToolBar=Monomyth.Class.extend({
	init:function(args){
		this.DOM=$("<div class=\"sidetoolbar\"></div>");
		this.DOM.attr("id",function(e){
			return "sidebar"+$(".sidetoolbar").length;
		});
		this.DOM.appendTo(args.loc);
		this.loc=args.loc;
		
	},
	activate:function(){
		this.DOM.show();
	},
	deactive:function(){
		this.DOM.hide();
	}
});


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
		//set up color sliders
		this.setColorSliders();
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
	}
});