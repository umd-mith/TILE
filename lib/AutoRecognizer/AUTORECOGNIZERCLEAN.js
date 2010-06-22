(function(){
	// Test Data -- delete later
	var imageList = [{
	    uri: "../../Images/ham.jpg",
	    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
	}, {
	    uri: "../../Images/hamTitle.jpg",
	    transcript: ["word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word", "word"]
	}, {
	    uri: "../../Images/mss.jpg",
	    transcript: ["line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line", "line"]
	}];

	// Global variables
	var curMove = 0;
	//  Region 
	var regionList = [];
	// Data storage
	var lineData = [];
	var curImage = 0;
	var curPageState = 0;
	/*
	 Page states: 0= Setting box for default
	 1= Setting default color
	 threshold
	 2= Adjusting box
	 3= Adjusting color
	 4= Adjusting lines
	 */
	function sortNumber(a,b){
		return (a-b);	
	}

	function nextRegion(current){

		if (current == regionList.length) {

			current = 0;
			curRegion = 0;
			curImage++;
		}

		curImage = parseInt(curImage) + parseInt(regionList[current].move);


		imgsrc = imageList[curImage].uri;

		if (imgsrc != $("#srcImageForCanvas").attr("src")) {


		$("srcImageForCanvas").attr("src", imgsrc);

		CANVAS.setUpCanvas(imgsrc);
	}






				cf.setValue(regionList[current].rgb);

				positionRegion(regionList[current]);
				threshold = $("#backgroundimage").text();
				car.thresholdConversion(threshold);
			   	tr = imageList[current].transcript;	
				out = "";
		for (var j=0;j<tr.length;j++){
			out+="<div class='trLine' id='trLine"+j+"'>"+tr[j]+"</div>";
		}


	   $("#transcript").html(out);
	   $(".trLine").addClass("selLine");	



	   $(".trLine").bind("mousedown",function(){
	   		 ($(this).toggleClass("selLine"));


	   		$(".trLine").bind("mouseover",function(){
				($(this).toggleClass("selLine"));
			});	
	   });
	   $(".trLine").bind("mouseup",function(){
	   	$(".trLine").unbind("mouseover");
	   });

	   $("#transcript").css({display: "block"});        
	        // deal with move direction then...

	        threshold = $("#backgroundimage").text();
	        car.thresholdConversion(threshold);



	}
	function positionRegion(rData){

	    var cw = $("#canvas").width(); //canvas width
	    var ch = $("#canvas").height(); //canvas height
	    var rb = $("#regionBox");

	    rb.width((parseFloat(rData.width) * cw));
	    rb.height((parseFloat(rData.height) * ch));
	    rb.css({
	        top: (parseFloat(rData.top) * ch) + "px",
	        left: (parseFloat(rData.left) * cw) + "px"
	    });
	    debug(rb.css());
	}
	function expandTranscript(){
		var newWidth = $("#transcript").width()*2;
		var newHeight = $("#transcript").height()*2;
		$("#sidebar").css({
			"z-index":"100",
			"overflow": "visible"

		});
		$("#transcript").css({
			"width": newWidth,
			"height": newHeight,
			"z-index": "100"
		});

		$("#transcript").unbind("click");
		 $("#transcript").bind("mouseout",function(e){
		 	if (e.target.id == "transcript") {
				collapseTranscript();
			}
		 });


	}
	function collapseTranscript(){
			var newWidth = $("#transcript").width()/2;
		var newHeight = $("#transcript").height()/2;
		$("#transcript").css({
			width: newWidth,
			height: newHeight
		});
			$("#sidebar").css({
			"z-index":"1",
			"overflow": "auto"

		});
			$("#transcript").unbind("mouseout");
		 $("#transcript").bind("click",function(e){

			expandTranscript();

		 });
	}
	function changeState(stateVal){
	    state = pageStates[stateVal];
	    $("#sidebarContent").html(state.sidebar);
	    state.callback();

	}

	function showBoundingBox(){
	    $("#regionBox").css("display", "block");
	}

	var regionList = [];

	function storeRegion(){
	    var pos = $("#regionBox").draggable().position();
	    //var size = $("#regionBox").resizable("option","size");
	    var totWidth = $("#regionBox").parent().width();
	    var totHeight = $("#regionBox").parent().height();
	    var left = pos.left / totWidth;
	    var top = pos.top / totHeight;
	    var width = $("#regionBox").width() / totWidth;
	    var height = $("#regionBox").height() / totHeight;
	    var rgb = $("#backgroundimage").text();

	    regionList.push({
	        move: curMove,
	        left: left,
	        top: top,
	        width: width,
	        height: height,
	        rgb: rgb
	    });
	    $("#regionBox").css({
	        "background-color": "red"
	    });
	    $("#regionBox").animate({
	        "opacity": 0,
	    }, 250, function(){
	        $("#regionBox").css({
	            "background-color": "transparent",
	            "opacity": 1,
	        });

	    });
		var curLineId = "cl"+(regionList.length-1); 
	    var curList = $("#regionListBox").html() + "<div id='"+curLineId+"'><div class='deleteLine button'>x</div>" + curMove + "," + left + "," + top + "," + width + "," +
	    height +
	    "," +
	    rgb +
	    "</div>";


	    $("#regionListBox").html(curList);
		 $(".deleteLine").bind("click",function(){
		 		var clIndex = parseInt($(this).parent().attr("id").substring(2));
				regionList[clIndex]=false;
				$(this).parent().remove();

		});
	}

	function loadImages(path){

	 	$("srcImageForCanvas").attr("src",imageList[0].uri);
	    CANVAS.setUpCanvas(imageList[0].uri);



	}

	$(document).ready(function(){
	    var container = $("#workspace");
	    CANVAS = new CanvasImage({
	        loc: container
	    });
	    $("#regionBox").resizable();
	    $("#regionBox").draggable({
	        containment: 'parent'
	    });


	    cf = new TileColorFilter({
	        DOM: "colorPanel",
	        red: "red",
	        green: "green",
	        blue: "blue",
	        colorBox: "backgroundimage"
	    });
	    changeState(0);
	    //colorPicker = new TileColorFilter({DOM: "colorPanel",red: "red",green: "green",blue: "blue",rgbDiv: "backgroundimage"});

	});

	function recognize(){
		numOfLines = $(".selLine").length;
	            bucket = car.createLineBreaks(numOfLines);
				bucket.sort(sortNumber);
				curLinesArray = [];
				var left = ($("#regionBox").position().left);
	            var rtop = ($("#regionBox").position().top);    
	            var lastTop = parseInt(rtop);
				$(".selLine").removeClass("selLine").addClass("recLine");	

				for (var i = 0; i < bucket.length; i++) {


	                var top = rtop+bucket[i];
					var height = parseInt(top)-parseInt(lastTop);
					// Blob box is in Box.js.  Figure out what imageObj is and
					// get rid of it.
					debug("top: "+top+" lastTop: "+lastTop+" height: "+height);
	                bb = new lineBox({
	                    width: $("#regionBox").width(),
	                    height: height,
	                    left: left,
	                    top: lastTop,
	                    loc: $("#workspace")
	                });

					lastTop = top;
					jsel = ".recLine:eq("+(i)+")";
					debug("jsel: "+jsel);
					$(jsel).attr("id","recLine"+(i)).bind("click",{lineBox: bb},function(e){
						var lb = e.data.lineBox;
						var id = lb.DOM.attr("id");
						e.data.lineBox.select(id);
					});


	            }
				$("body").bind("lineClicked",function(e,data){

						var num = data.substring(8);
						var id = "recLine"+num;


							$(".recLine").css({"background-color": "#ddaaaa"});
							$("#"+id).css({
								"background-color": "purple"
							});

					});
				$('#recognize').replaceWith("<div id='save'>Save</div>");
					$('#save').bind("click",function(){
						lineData.push({
	                    img: $("srcImageForCanvas").attr("src"),
						left: left,
						rtop: top,
						lines: bucket
	                });
					$('#save').replaceWith("<div id='recognize'>Recognize</div>");
					 $(".lineBox").remove();
					 curRegion++;
					 nextRegion(curRegion);
					});
	}
	
	/**
	 * Basic Image Object
	 * 
	 * Contains URL for where the image is (or an array of urls)
	 * 
	 */
	var TileImage=Monomyth.Class.extend({
		init:function(args){

			//url is actually an array of image values
			this.url=(typeof args.url=="object")?args.url:[args.url];

			if(args.loc){
				this.loc=args.loc;
				//set to specified width and height
				if(args.width) this.DOM.width(args.width);
				if(args.height) this.DOM.height(args.height);
			}

		}
	});

	/**
	 * Image object that creates a canvas
	 * and loads URL of image inside it
	 * 
	 * Possible functionality:
	 * Can load a series of urls (array-based series) 
	 */

	 var CanvasImage=TileImage.extend({
	 	init: function(args){
	 		this.$super(args);
	 		this.loc = $(this.loc);

	 		this.srcImage = $("#srcImageForCanvas");

	 		this.loc.append($("<div id=\"canvasHTML\"><canvas id=\"canvas\"></canvas></div>"));
	 		this.DOM = $("#canvasHTML");

	 		this.canvas = $("#canvas");
	 		//need real DOM element, not jQuery object
				this.canvasEl = this.canvas[0];
				this.imageEl = this.srcImage[0];
				this.pageNum = 0;
				this.url = [];
				this.nh = 0;
				this.nw = 0;




			},

			showCurrentImage: function(e){
				var obj = e.data.obj;
				if (obj.url[obj.pageNum]) {
					var file = obj.url[obj.pageNum];
					if (/[^.jpg|.tif|.png]/.test(file)) {
						obj.setUpCanvas(file);
					}
					else {
						alert("The file: " + file + " returned an error.");
					}
				}
			},

			setUpCanvas: function(url){
				var self = this;
				this.srcImage.attr("src", url).load(function(e){
					debug(e.data);

					self.canvas[0].width = self.srcImage[0].width;
					self.canvas[0].height = self.srcImage[0].height;

					var testimage = $.ajax({
						url: url,
						async: false,
						dataType: 'text'
					}).responseText;
					if (testimage.length) {
						self.context = self.canvasEl.getContext('2d');
						//set up first zoom level
						self.nh = (800 / self.srcImage[0].width) * self.srcImage[0].height;
						self.nw = 800;
						self.srcImage.width(self.nw);
						self.srcImage.height(self.nh);
						self.canvas.attr("width", self.nw);
						self.canvas.attr("height", self.nh);
						self.context.drawImage(self.imageEl, 0, 0, self.nw, self.nh);
						self.loc.width(self.canvas.width());
						self.loc.height(self.canvas.height());
						self.srcImage.trigger("newPageLoaded", [self.pageNum]);
					}
				});


			}
		});
		
		//BOX Objects
		/**
		 * Non-OpenLayers, totally HTML format Box div
		 * 
		 * Taken directly from PlainBox in ImageBoxer
		 */

		var Box=Monomyth.Class.extend({
			init:function(args){
				this.DOM=$("<div></div>");
				this.DOM.addClass("boxer_plainbox");

				this.userOptions=$("<div></div>");
				this.userOptions.addClass("boxer_plainbox_useroptions");

				this.DOM.append(this.userOptions);


				this.closeButton=$("<span>X</span>");
				this.closeButton.addClass("boxer_plainbox_close");
				this.userOptions.append(this.closeButton);
				this.closeButton.bind("click",{obj:this},this.hideSelf);
			},
			makeDrag:function(){
				//store latest css data in case the user resizes box outside of window
				this.DOM.data("lastLeft",this.DOM.css("left"));
				this.DOM.data("lastTop",this.DOM.css("top"));
				this.DOM.draggable({
					start:function(e,ui){
						if (ui.position) {
							if ((ui.position.top > 0)&&(ui.position.left>0)) {
								$(this).data("lastLeft", $(this).css("left"));
								$(this).data("lastTop", $(this).css("top"));
							}
						}
					},
					stop:function(e,ui){
						if((ui.position.top>0)&&(ui.position.left>0)){
							$(this).data("lastLeft",$(this).css("left"));
							$(this).data("lastTop",$(this).css("top"));
						}
					}
				});
				this.DOM.resizable({
					handles:'all',
					start:function(e,ui){
						if((ui.position.top<0)||(ui.position.left<0)){
							$(this).css("left",$(this).data("lastLeft"));
							$(this).css("top",$(this).data("lastTop"));
						} else {
							$(this).data("lastLeft",$(this).css("left"));
							$(this).data("lastTop",$(this).css("top"));
						}
					},
					stop:function(e,ui){
						if((ui.position.top<0)||(ui.position.left<0)){
							$(this).css("left",$(this).data("lastLeft"));
							$(this).css("top",$(this).data("lastTop"));
						} else {
							$(this).data("lastLeft",$(this).css("left"));
							$(this).data("lastTop",$(this).css("top"));
						}
				}});

			},
			zoom:function(e,val){

				var obj=e.data.obj;

				switch(val){
					case 1:
						//change location
						var left=parseInt(obj.DOM.css("left"),10)*args.val;
						obj.DOM.css("left",left+"px");
						var top=parseInt(obj.DOM.css("top"),10)*args.val;
						obj.DOM.css("top",top+"px");

						//change size
						obj.DOM.width((obj.DOM.width()*args.val));
						obj.DOM.height((obj.DOM.height()*args.val));
						break;
					case 0:
						//change location
						var left=parseInt(obj.DOM.css("left"),10)/args.val;
						obj.DOM.css("left",left+"px");
						var top=parseInt(obj.DOM.css("top"),10)/args.val;
						obj.DOM.css("top",top+"px");
						//change size
						obj.DOM.width((obj.DOM.width()/args.val));
						obj.DOM.height((obj.DOM.height()/args.val));
						break;	
				}

			},
			hideSelf:function(e){
				e.stopPropagation();
				e.data.obj.DOM.hide();
			},
			getValues:function(){
				if(this.DOM){
					return {
						x:parseInt(this.DOM.css('left'),10),
						y:parseInt(this.DOM.css('top'),10),
						ox:this.DOM.offset().left,
						oy:this.DOM.offset().top,
						w:this.DOM.width(),
						h:this.DOM.height()
					};
				}
			}
		});

		/**
		Selector Box 

		specifically for placing bounding box on Canvas

		grantd
		**/

		var SelectorBox=Box.extend({
			init:function(args){
				this.$super(args);
				this.userOptions.show();
				//this.changeButton=$("<span class=\"boxer_select_ocr\">Convert to BW</span>");
				// this.userOptions.append(this.changeButton);
				// 		this.changeButton.bind("click",{obj:this},this.setColorRegion);
				$("body").bind("ImageDoneWorking",{obj:this},function(e,off){
					//get rid of box on canvas
					var obj=e.data.obj;
					if(off) obj.DOM.hide();
				});

				args.loc.append(this.DOM);
				//$("body").bind("zoom",{obj:this},this.zoom);
			},
			setColorRegion:function(e){
				var obj=e.data.obj;
				var values=obj.getValues();
				obj.DOM.trigger("RegionSet",[values]);
			}
		});

		/**Blob box **/

		var BlobBox=Box.extend({
			init:function(args){
				this.$super(args);

				//this.imageObj=args.imageObj;

				this.DOM.attr("id",function(e){
					return "BlobbyBoxey_"+$(".blobbox").length;
				});

				//change CSS style
				this.DOM.removeClass("boxer_plainbox");
				this.DOM.addClass("blobbox");

				//add Options
				this.resizeOn=false;
				this.dragOn=false;

				this.editB=$("<span>Edit</span>");
				this.editB.bind("click",{obj:this},this.edit);
				this.editB.appendTo(this.userOptions);
				/**
				this.editResize=$("<span>Resize</span>");
				this.editResize.addClass("boxer_blob_resize");
				this.resizeOn=false;
				this.editResize.bind("click",{obj:this},this.setResize);

				this.editMove=$("<span>Move</span>");
				this.editMove.addClass("boxer_blob_drag");
				this.dragOn=false;
				this.editMove.bind("click",{obj:this},this.setDrag);
				this.editResize.appendTo(this.userOptions);
				this.editMove.appendTo(this.userOptions);
				**/
				this.DOM.width(args.width);
				this.DOM.height(args.height);
				this.DOM.css("left",args.left+'px');
				this.DOM.css("top",args.top+'px');
				this.DOM.appendTo(args.loc);
				this.optionsON=false;

				//this.DOM.bind("click",{obj:this},function(e){
					//var obj=e.data.obj;
					/**if(obj.optionsON){
						obj.userOptions.hide();
						obj.optionsON=false;
					} else {
						obj.userOptions.show();
						obj.optionsON=true;
					}**/
				//	obj.setResize(e);
					//obj.setDrag(e);
			//	});

			},
			zoomCanvas:function(e,val){
				var obj=e.data.obj;
				var data=obj.imageObj.getZoomLevel();
				var zoom=data.zoomLevel;

				if((val>0)&&(zoom>0)){
					//zoom in
					var left=parseInt(obj.DOM.css("left"),10)*2;
					var top=parseInt(obj.DOM.css("top"),10)*2;
					obj.DOM.css("left",left+"px");
					obj.DOM.css("top",top+"px");
					obj.DOM.width(obj.DOM.width()*2);
					obj.DOM.height(obj.DOM.height()*2);
				} else if(zoom<5){
					//zoom out
					var left=parseInt(obj.DOM.css("left"),10)/2;
					var top=parseInt(obj.DOM.css("top"),10)/2;
					obj.DOM.css("left",left+"px");
					obj.DOM.css("top",top+"px");
					obj.DOM.width(obj.DOM.width()/2);
					obj.DOM.height(obj.DOM.height()/2);
				}

			},
			setResize:function(e){
				var obj=e.data.obj;
				if(!obj.resize){
					obj.DOM.resizable({
						handles:"all"
					});
					obj.DOM.resizable("disable");
					obj.resize=true;
				}
				if(obj.resizeOn){
					obj.DOM.resizable("disable");
					obj.resizeOn=false;
				} else {
					obj.DOM.resizable('enable');
					obj.resizeOn=true;
				}

			},
			setDrag:function(){
				if(!obj.drag){
					obj.DOM.draggable({
						handles:"all"
					});
					obj.DOM.draggable("disable");
					obj.drag=true;
				}
			},
			// setDrag:function(e){
			// 		var obj=e.data.obj;
			// 		if(!obj.drag){
			// 			obj.DOM.draggable({
			// 				handles:"all"
			// 			});
			// 			obj.DOM.draggable("disable");
			// 			obj.drag=true;
			// 		}
			// 		if(obj.dragOn){
			// 			obj.DOM.draggable("disable");
			// 			obj.dragOn=false;
			// 		} else {
			// 			obj.DOM.draggable('enable');
			// 			obj.dragOn=true;
			// 		}
			// 	},
			edit:function(e){
				var obj=e.data.obj;
				$(".blobbox.active").draggable('disable');
				$(".blobbox.active").removeClass("active");

				obj.DOM.addClass("active");

				obj.editB.text("Done");
				obj.editB.unbind("click",obj.edit);
				obj.editB.bind("click",{obj:obj},obj.doneEdit);
				obj.DOM.draggable('enable');
			},
			doneEdit:function(e){
				var obj=e.data.obj;

				obj.DOM.removeClass("active");
				obj.editB.text("Edit");
				obj.editB.unbind("click",obj.doneEdit);
				obj.editB.bind("click",{obj:obj},obj.edit);
				obj.DOM.draggable('disable');
			}
		});
		
		//SHAPE
		/**
		Shape 

		Created by: dreside

		Object that houses a collection of dot coordinates taken from an HTML canvas
		element.
		Stores x,y coordinates and organizes dots from their left-right, bottom-top positions


		**/



		var Shape = Monomyth.Class.extend({
			init:function(args){
				this.coords=[];
				this.index=args.index;
				this.Top=args.initialTop;
				this.Right=0;
				this.Left=args.initialLeft;
				this.Bottom=0;
				this.hMid = 0; // horizontal midpoint
				this.vMid = 0; // vertical midpoint
				this.foundOnRow = parseInt(args.foundOnRow.substring(1));

			},
			add: function(xy){
				//add new xy value to coords array
				this.coords.push(xy);
				var x =parseInt(xy.x.substring(1),10); 
				var y =parseInt(xy.y.substring(1),10); 
				//check to make sure greatest left,top,right,bottom points
				//are updated
				if (x < this.Left) {
					this.Left = x;
				}
				if (x > this.Right) {
					this.Right = x;
				}
				if (y > this.Bottom) {
					this.Bottom = y;
				}
				if (y < this.Top) {
					this.Top = y;
				}


			},

			// @param
			// 	shape: Another Shape object to compare this one to
			// returns true of false
			compare:function(shape,criteria){
				return (this[criteria]<shape[criteria]);
			}
		});
		
		//COLORFILTER
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
				this.red = args.red;

				this.green = args.green;
				this.blue = args.blue;
				var colorBox = args.colorBox;
				this.rgbDiv = $("#"+colorBox);
				this.rgbValue=[127,127,127];

				this.redSlide=$("#"+this.red).slider({
					min:0,
					max:255,
					value: 127,
					stop:function(e,ui){
						$(this).trigger("slideChange",["red",ui.value]);
					}
				});
				this.greenSlide=$("#"+this.green).slider({
					min:0,
					max:255,
					value: 127,
					stop:function(e,ui){
						$(this).trigger("slideChange",["green",ui.value]);
					}
				});
				this.blueSlide=$("#"+this.blue).slider({
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
			setValue: function(rgb){
				this.rgbDiv.text(rgb);
				this.rgbDiv.css("background-color","rgb("+rgb+")");
				colors = rgb.split(",");


				$("#"+this.red).slider("option","value",colors[0]);
				$("#"+this.green).slider("option","value",colors[1]);
				$("#"+this.blue).slider("option","value",colors[2]);
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
			
		//REGION RULE
		var RegionRule=Monomyth.Class.extend({
			init:function(args){
				/*
				 * args:
				 * 		move: Enum type [stay|next|prev] which directs whether to change the page
				 * 		top: % from top of image
				 * 		left: %
				 * 		height: %
				 * 		width: %
				 * 		
				 */
				this.move = args.move;
				this.top = args.top; 
				this.left = args.left;
				this.height = args.height;
				this.width = args.width;

			}
		});
		
		var lineBox=Monomyth.Class.extend({
			init:function(args){
				self=this;
				this.DOM=$("<div></div>");
				var id = $(".lineBox").length;
				id="lineBox_"+id;
				this.DOM.attr("id",id);

				this.DOM.addClass("lineBox");

				//add Options
				this.resizeOn=false;
				this.dragOn=false;
				this.DOM.width(args.width);
				this.DOM.height(args.height);
				this.DOM.css("left",args.left+'px');
				this.DOM.css("top",args.top+'px');
				this.DOM.appendTo(args.loc);
				this.optionsON=false;
				$("#"+id).bind("mouseover",function(e){
					$(this).addClass("lineBoxSelect");
				});
				$("#"+id).bind("mouseout",function(e){
					$(this).removeClass("lineBoxSelect");
				});
				$("#"+id).bind("click",function(e){
					var id = $(this).attr("id");
					self.select(id);
				});
			},
			select:function(id){


				$(".lineBox").css({"display":"none"});
				$("#"+id).css({"display":"block"});
				$("#"+id).draggable();
				$("#"+id).resizable();
				$("#"+id).trigger("lineClicked",[id]);
			}
			});
		
		///////////Page States
		/**
		 * @author dreside
		 * Page States
		 */

		 pageStates = [// 0:  Defining boundary boxes
		{

		    "sidebar": "<div id='loadButton' class='nextButton'>Load</div>",

		    "callback": function(){
		        $('#loadButton').bind("click", function(){
		       		loadImages("");

		            $('#nextButton').unbind("click");
		            changeState(1);
		        });
		    }
		}, // 1:  Setting default color	
		{
		    "sidebar": "<div class='sbMessage'>Adjust the color settings so that only the text is visible</div>" +

		    "<div class='nextButton' id='captureButton'>Capture</div><div class='prevButton' id='prevButton'>Prev</div><div class='nextButton' id='nextButton'>Next</div><div id='done'>Done</div>" +
		    "<div id='regionListBox'></div>",
		    "callback": function(){
		        showBoundingBox();

		        $("#colorSection").css({
		            display: "block"
		        });
		        $("#regionBox").resizable().bind("resizestop", function(){
		            threshold = $("#backgroundimage").text();
		            car.thresholdConversion(threshold);
		        });
		        $("#regionBox").draggable().bind("dragstop", function(){
		            threshold = $("#backgroundimage").text();
		            car.thresholdConversion(threshold);
		        });
				$("#nextButton").bind("click",function(){

					curImage = parseInt(curImage)+1;
					curMove++;

					imgsrc = imageList[curImage].uri;	

					$("srcImageForCanvas").attr("src",imgsrc);



					CANVAS.setUpCanvas(imgsrc);


				});
					$("#prevButton").bind("click",function(){

					curImage = parseInt(curImage)-1;
					curMove--;

					imgsrc = imageList[curImage].uri;	

					$("srcImageForCanvas").attr("src",imgsrc);
					CANVAS.setUpCanvas(imgsrc);


				});
		        $("#captureButton").bind("click", function(){

		            storeRegion();


		        });
		        car = new CanvasAutoRecognizer({
		            imageEl: "srcImageForCanvas",
		            regionID: "regionBox"
		        });
		        $("body").bind("ColorChange", function(e, threshold){

		            car.thresholdConversion(threshold);
		        });
		        $("#done").bind("click", function(){
		        imgsrc = imageList[0].uri;	
					regionList = _.compact(regionList);	
					$("srcImageForCanvas").attr("src",imgsrc);
					CANVAS.setUpCanvas(imgsrc);
		            changeState(2);

		        });
		    }
		}, //State 2: Running recognizer
		{

		    "sidebar": "<div class='sbMessage'>Adjust the red box then click &quot;Recognize&quot;</div>" +
		    "<div id='nextButton' class='button'>Skip</div><div id='recognize' class='button'>Recognize</div>",

		    "callback": function(){
					$("#nextButton").bind("click",function(){
					 curRegion++;
						 nextRegion(curRegion);
				})
		        $('#recognize').bind("click", function(){
					recognize();

		        });
		        curRegion = 0;
		        curImage = 0;
		        nextRegion(0);	


		    }
		}];
		
	
})();