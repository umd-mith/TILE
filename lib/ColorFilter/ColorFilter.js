var ColorFilter=Monomyth.Class.extend({
	init:function(args){

	}
});

var TileColorFilter=ColorFilter.extend({
init:function(args){
		this.$super(args);
		
		/*
		 * args:
		 * 		DOM: DOM id of container
		 * 		red: DOM id of div for red slider
		 * 		green: DOM id of div for greeen slider
		 * 		blue:  DOM id of div for blue slider
		 * 		colorBox: DOM id of div showing color 		
		 * 		
		 */

		this.DOM = $("#"+args.DOM);
		var red = args.red;

		var green = args.green;
		var blue = args.blue;
		var colorBox = args.colorBox;
		this.rgbDiv = $("#"+colorBox);
		this.rgbValue=[127,127,127];
		
		this.redSlide=$("#"+red).slider({
			min:0,
			max:255,
			value: 127,
			stop:function(e,ui){
				$(this).trigger("slideChange",["red",ui.value]);
			}
		});
		this.greenSlide=$("#"+green).slider({
			min:0,
			max:255,
			value: 127,
			stop:function(e,ui){
				$(this).trigger("slideChange",["green",ui.value]);
			}
		});
		this.blueSlide=$("#"+blue).slider({
			min:0,
			max:255,
			value: 127,
			stop:function(e,ui){
				debug(ui.value);
				$(this).trigger("slideChange",["blue",ui.value]);
			}
		});
		this.DOM.bind("slideChange",{obj:this},this.changeColorFromSlider);
		rgb = this.rgbValue.toString();
		this.rgbDiv.text(rgb);
		this.rgbDiv.css("background-color","rgb("+rgb+")");
		this.DOM.trigger("ColorChange",[rgb]);
	},
	changeColorFromSlider:function(e,color,val){
		
		var obj=e.data.obj;
		debug("color "+color);
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
		obj.DOM.trigger("ColorChange",[rgb]);
		
	}
	});