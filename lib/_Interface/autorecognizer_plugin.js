(function(){
	var AutoR=this;
	
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

		curImage = parseInt(curImage,10) + parseInt(regionList[current].move,10);


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
	        "opacity": 0
	    }, 250, function(){
	        $("#regionBox").css({
	            "background-color": "transparent",
	            "opacity": 1
	        });

	    });
		var curLineId = "cl"+(regionList.length-1); 
	    var curList = $("#regionListBox").html() + "<div id='"+curLineId+"'><div class='deleteLine'>x</div>" + curMove + "," + left + "," + top + "," + width + "," +
	    height +
	    "," +
	    rgb +
	    "</div>";


	    $("#regionListBox").html(curList);
		 $(".deleteLine").bind("click",function(){
		 		var clIndex = parseInt($(this).parent().attr("id").substring(2),10);
				regionList[clIndex]=false;
				$(this).parent().remove();

		});
	}

	function loadImages(path){

	 	$("srcImageForCanvas").attr("src",imageList[0].uri);
	    CANVAS.setUpCanvas(imageList[0].uri);



	}


	function recognize(){
		numOfLines = $(".selLine").length;
	            bucket = car.createLineBreaks(numOfLines);
				bucket.sort(function(a,b){return (a-b);});
				curLinesArray = [];
				var left = ($("#regionBox").position().left);
	            var rtop = ($("#regionBox").position().top);    
	            var lastTop = parseInt(rtop,10);
				$(".selLine").removeClass("selLine").addClass("recLine");	

				for (var i = 0; i < bucket.length; i++) {


	                var top = rtop+bucket[i];
					var height = parseInt(top,10)-parseInt(lastTop,10);
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
	
	// $(document).ready(function(){
	//     var container = $("#workspace");
	//     CANVAS = new CanvasImage({
	//         loc: container
	//     });
	//     $("#regionBox").resizable();
	//     $("#regionBox").draggable({
	//         containment: 'parent'
	//     });
	// 
	// 
	//     cf = new TileColorFilter({
	//         DOM: "colorPanel",
	//         red: "red",
	//         green: "green",
	//         blue: "blue",
	//         colorBox: "backgroundimage"
	//     });
	//     changeState(0);
	//     //colorPicker = new TileColorFilter({DOM: "colorPanel",red: "red",green: "green",blue: "blue",rgbDiv: "backgroundimage"});
	// 
	// });
	
	/**
		TileOCR - creates the setup and tools 
		to use the autoRecognizer
		
		Author: Grant Dickie
		MITH 2010
		
		//relies on CanvasAutoRecognizer toolset
		
		args.loc = id for where toolbar is located
	**/
	var TileOCR=Monomyth.Class.extend({
		init:function(args){
			//finds it's own location - always an empty toolset
			var self=this;
			var d=new Date();
			self.uid=d.getTime("milliseconds")+"_ar";
			self.canvasArea=$("#azcontentarea > div.az.inner").children("div:not(.toolbar)"); //use this later to put in CanvasImage object
			self.loc=$("div.az.tool:empty");
			if(!self.loc) throw "Error in construction for AutoRecognizer";
			self.regionList=[];
			self.curRegion=0;
			
			$("body").bind("_autoRecJSONReady",{obj:self},self._setUp);
			//load JSON html into the location 
			//JSON schema must be in certain directory?
			$.ajax({
				dataType:'json',
				url:'lib/JSONHTML/autorec.json',
				success:function(d){
					self.loc.trigger("_autoRecJSONReady",[d]);
				}
			});
		},
		_setUp:function(e,jsonhtml){
			//set up rest of autorecognizer
			var self=e.data.obj;
			self.html=jsonhtml.autorec;
			$(self.html).appendTo(self.loc);
			self.DOM=$("div.autorec_toolbar").attr('id',self.uid+"_main");
			//ColorFilter
			self.colorFilterArea=$("#"+self.DOM.attr('id')+" > div.colorSection").attr("id",self.uid+"_CF");
			self.colorFilter=new TileColorFilter({
				DOM:self.colorFilterArea.attr("id"),
				green:"green",
				blue:"blue",
				red:"red",
				colorBox:"backgroundimage"
			});
			self.contentArea=$("#"+self.DOM.attr('id')+" > #content");
			//get areas
			self.regionListBoxDiv=$("#"+self.DOM.attr('id')+" > #content > #_regionListBox");
		
			self.transcriptArea=$("#"+self.DOM.attr('id')+" > #content > #transcript");
		
			//get buttons
			self.showBoxB=$("#"+self.DOM.attr('id')+" > #content > div.btnIconLarge > #showBox");
			self.captureB=$("#"+self.DOM.attr('id')+" > #content > div.btnIconLarge > #captureButton");
			self.nextB=$("#"+self.DOM.attr('id')+" > #content > div.btnIconLarge > #nextButton");
			self.prevB=$("#"+self.DOM.attr('id')+" > #content > div.btnIconLarge > #prevButton");
			self.recognizeB=$("#"+self.DOM.attr('id')+" > #content > div.btnIconLarge > #autorec_recognize");
			self.closeOutB=$("#"+self.DOM.attr('id')+" > #content > span > #clickDone").click(function(e){
				$(this).trigger("closeOutAutoRec");
				$(".az.main.threecol").removeClass("threecol").addClass("twocol");
				if(self.canvasArea) self.canvasArea.show();
				$(this).trigger("_toolDone_");
			});
			
			//swap out other canvas/image area data for CanvasImage
			self.swapCanvas();
	    
		},
		_restart:function(){
			//already constructed, re-attach listeners and show DOM
			var self=this;
			if(self.CANVAS) {
				self.canvasArea.hide();
				self.CANVAS._restart();
			} else {
				// self.CANVAS=new CanvasImage({
				// 					loc:self.canvasArea.parent()
				// 				});
				return;
			}
		},
		swapCanvas:function(){
			var self=this;
			if(self.canvasArea){
				//hide stuff in canvasArea - except for toolbar
				self.canvasArea.hide();
				var container=self.canvasArea.parent();
			
				//make canvas
				self.CANVAS=new CanvasImage({
					loc:container
				});
			
				//create region box and put over newly created canvas
				self.regionBox=new RegionBox({loc:container});
				//create canvas auto recognizer to use regionBox above and
				//handle all color conversion/analysis
				var car = new CanvasAutoRecognizer({
					canvas:self.CANVAS.canvas,
			        canvasImage:self.srcImage,
					imageEl: "srcImageForCanvas",
		            regionID: "regionBox"
		        });
				self.CAR=car;
				//set button listeners
				self.showBoxB.click(function(e){
					e.preventDefault();
					$(this).trigger("showBox");
				});
				self.captureB.click(function(e){
					e.preventDefault();
					self._capture();
				});
				self.recognizeB.click(function(e){
					e.preventDefault();
					self._recognize();
				});
				//set global listeners
				//when user changes settings on colorfilter, need to reset canvas region
				$("body").bind("ColorChange",{obj:self},self.ColorChangeHandle);
				//when canvas has loaded image, need to load the transcript
				$('body').bind("canvasLoaded",{obj:self},self.canvasReadyHandle);
				//regionBox dragging/resizing listeners
				//call changeColor each time the box is dragged/resized
				$("body").bind("resizestop",function(e){
					if(self.regionBox.DOM.is(":visible")){
						self.CANVAS._resetCanvasImage();
						self.CAR.thresholdConversion();
					}
				});
				$("body").bind("dragstop",function(e){
					if(self.regionBox.DOM.is(":visible")){
						self.CANVAS._resetCanvasImage();
						self.CAR.thresholdConversion();
					}
				});
				
			}
		},
		canvasReadyHandle:function(e){
			var self=e.data.obj;
			//canvas has loaded image, now load the assoc. transcript
			//test case: use same one each time
			var t=imageList[0].transcript;
			var out="";
			for(j in t){
				//create a selLine object out of transcript item
				out+="<div class='trLine selLine' id='trLine"+j+"'>"+t[j]+"</div>";
			}
			self.transcriptArea.html(out);
			
		},
		ColorChangeHandle:function(e,thresh){
			var self=e.data.obj;
			if(self.regionBox.DOM.is(":visible")){
				self.CANVAS._resetCanvasImage();
				self.CAR.thresholdConversion();
			}
		},
		/**
			Captures the shape/area data and stores it into 
			memory
		**/
		_capture:function(){
			var self=this;
			// var pos=self.regionBox.draggable().position();
			// 			var totWidth = self.regionBox.parent().width();
			// 		    var totHeight = self.regionBox.parent().height();
			// 		    var left = pos.left / totWidth;
			// 		    var top = pos.top / totHeight;
			// 		    var width = self.regionBox.width() / totWidth;
			// 		    var height = self.regionBox.height() / totHeight;
			var dims=self.regionBox._getDims();
		    //var rgb = $("#backgroundimage").text();
			var rgb=self.colorFilter._RGB();
			
		    self.regionList.push({
		        move: self.curRegion,
		        left: dims.left,
		        top: dims.top,
		        width: dims.width,
		        height: dims.height,
		        rgb: rgb
		    });
			//signal to user
			self.regionBox._flash();
		    
			var curLineId = "cl"+(regionList.length-1); 
		    var curList = self.regionListBoxDiv.html()+"<div id='"+curLineId+"'><div class='deleteLine'>x</div>" +  
			            self.curRegion+","+dims.left+","+dims.top+","+dims.width+","+dims.height+","+rgb+"</div>";
		    self.regionListBoxDiv.html(curList);
			$(".deleteLine").bind("click",function(){
			 	var clIndex = parseInt($(this).parent().attr("id").substring(2),10);
				self.regionList[clIndex]=false;
				$(this).parent().remove();
			});
		},
		_recognize:function(){
			var self=this;
			numOfLines = $(".selLine").length;
		    bucket = self.CAR.createLineBreaks(numOfLines);
			bucket.sort(sortNumber);
			curLinesArray = [];
			var left = (self.regionBox.DOM.position().left);
	        var rtop = (self.regionBox.DOM.position().top);    
	        var lastTop = parseInt(rtop,10);
			$(".selLine").removeClass("selLine").addClass("recLine");
			
			for (var i = 0; i < bucket.length; i++) {
	        	var top = rtop+bucket[i];
				var height = parseInt(top,10)-parseInt(lastTop,10);
				// Blob box is in Box.js.  Figure out what imageObj is and
				// get rid of it.
				
	            var bb = new lineBox({
                   width: self.regionBox.DOM.width(),
                   height: height,
                   left: left,
                   top: lastTop,
                   loc: self.CANVAS.DOM.parent()
               	});
				
				lastTop = top;
				jsel = ".recLine:eq("+(i)+")";
				
				$(jsel).attr("id","recLine"+(i)).bind("click",{lineBox: bb},function(e){
					var lb = e.data.lineBox;
					var id = lb.DOM.attr("id");
					e.data.lineBox.select(id);
				});
	        }
			//done adding lines, notify canvas to turn off pointer events for now
			self.DOM.trigger("linesAdded_");
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
		},
		/**
			output array of values to be fed into other image programs
			*gives percentage values instead of exact ones (no pixels, etc)
			
		**/
		outputProportional:function(){
			var self=this;
			var dims=[];
			
			//Relative Point: Canvas Container
			
			//find proportion of image to lines
			var imgdims=self.CANVAS._getPerc();
			
			$(".recLine").each(function(i,o){
				
			});
		}
	});
	
	AutoR.TileOCR=TileOCR;
	
	
	
	/**
	 * Basic Image Object
	 * 
	 * Contains URL for where the image is (or an array of urls)
	 * //NEW: Located in base.js
	 */
	// var TileImage=Monomyth.Class.extend({
	// 		init:function(args){
	// 
	// 			//url is actually an array of image values
	// 			this.url=(typeof args.url=="object")?args.url:[args.url];
	// 
	// 			if(args.loc){
	// 				this.loc=args.loc;
	// 				//set to specified width and height
	// 				if(args.width) this.DOM.width(args.width);
	// 				if(args.height) this.DOM.height(args.height);
	// 			}
	// 
	// 		}
	// 	});

	/**
	 * Image object that creates a canvas
	 * and loads URL of image inside it
	 * 
	 * Possible functionality:
	 * Can load a series of urls (array-based series) 
	 */
//NEW: extends from base.js Object Image instead of TileImage
	 var CanvasImage=Image.extend({
	 	init: function(args){
	 		this.$super(args);
	 		this.loc = $(this.loc);
			//grab source image 
	 		this.srcImage = $("#srcImageForCanvas");

	 		this.loc.append($("<div id=\"canvasHTML"+this.uid+"\"><canvas id=\"canvas\"></canvas></div>"));
	 		this.DOM = $("#canvasHTML"+this.uid);

	 		this.canvas = $("#"+this.DOM.attr('id')+" > #canvas");
	 		//need real DOM element, not jQuery object
			this.canvasEl = this.canvas[0];
			this.imageEl = this.srcImage[0];
			this.pageNum = 0;
			this.url = [];
			this.nh = 0;
			this.nw = 0;
			//whatever is currently in srcImage, load that
			this.setUpCanvas(this.srcImage.attr("src"));
			$("body").bind("zoom",{obj:this},this.zoomHandle);
			$("body").bind("closeOutAutoRec",{obj:this},this._closeOut);
			//stop listening to events after user loads lines
			$("body").bind("linesAdded_",{obj:this},function(e){
				var self=e.data.obj;
				self.canvas.css("pointer-events","none");
			});
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
		zoomHandle:function(e,v){
			var self=e.data.obj;
			//v is either greater than 0 or less than 0
			if(v>0){
				//zoom in
				self.nw*=2;
				self.nh*=2;
				self.canvas.attr("width",self.nw);
				self.canvas.attr("height",self.nh);
				
			} else if(v<0){
				//zoom out
				self.nw/=2;
				self.nh/=2;
				self.canvas.attr("width",self.nw);
				self.canvas.attr("height",self.nh);
			}
			self.context.drawImage(self.imageEl, 0, 0, self.nw, self.nh);
		},
		setUpCanvas: function(url){
			var self = this;
			this.srcImage.attr("src", url).load(function(e){
			//	debug(e.data);

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
						
						self.srcImage.trigger("canvasLoaded", [self.pageNum]);
					}
				});
			},
			//Close Out for CanvasImage
			//called by Custom Event from TILEOCR
			_closeOut:function(e){
				var self=e.data.obj;
				self.DOM.hide();
				//self.canvas.remove();
				$("body").unbind("zoom",self.zoomHandle);
				$(self.srcImage.unbind("load"));
			},
			_restart:function(){
				var self=this;
				self.DOM.show();
				
				self.setUpCanvas(self.srcImage.attr("src"));
			},
			_resetCanvasImage:function(){
				var self=this;
				self.context.drawImage(self.imageEl, 0, 0, self.nw, self.nh);			
			},
			//get percentage/proportional value of canvas container to canvas
			_getPerc:function(){
				var self=this;
				//Relative Point: the main container of canvas (this.DOM)
				var rp=self.DOM.position();
				var dp=self.canvas.position();
				var l=(dp.left/rp.left);
				var t=(dp.top/rp.top);
				var w=(self.canvas.width()/self.DOM.width());
				var h=(self.canvas.height()/self.DOM.height());
				return {l:l,t:t,w:w,h:h};
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
		
		/**
		RegionBox
		
		Author: Grant D.
		
		Taking the HTML from other functions and making it into a single function
		**/
		var RegionBox=Monomyth.Class.extend({
			init:function(args){
				if(!args.loc) throw "RegionBox cannot be inserted at this point";
				var self=this;
				self.loc=$(args.loc);
				var r=$("<div id=\"regionBox\" class=\"boxer_plainbox\"></div>");
				r.appendTo(self.loc);
				//adjust top/left
				var p=$(args.loc).children("div").children("canvas").position();
				r.css({"left":p.left,"top":p.top});
				
				self.DOM=r;
				//draggable and resizable
				self.DOM.draggable({

				});
				self.DOM.resizable({
					handles:'all'
				});
				//listeners
				$("body").bind("showBox",{obj:self},self._onOff);
				$("body").bind("zoom",{obj:self},self._zoomHandle);
				$("body").bind("closeOutAutoRec",{obj:self},self._closeOut);
			},
			//flash the box on and off
			_flash:function(){
				var self=this;
				self.DOM.css({
			        "background-color": "red"
			    });
			    self.DOM.animate({
			        "opacity": 0
			    }, 250, function(){
			        self.DOM.css({
			            "background-color": "transparent",
			            "opacity": 1
			        });

			    });
			},
			_zoomHandle:function(e,v){
				var self=e.data.obj;
				//v is either gt 0 or lt 0
				if(v>0){
					//zooming in
					var d=self._getBBox();
					self.DOM.css({"left":(d.left*2)+'px',"top":(d.top*2)+'px',"width":(d.width*2),"height":(d.height*2)});
				} else if(v<0){
					var d=self._getBBox();
					self.DOM.css({"left":(d.left/2)+'px',"top":(d.top/2)+'px',"width":(d.width/2),"height":(d.height/2)});
				}
			},
			_onOff:function(e){
				
				if($("#regionBox").is(":visible")){
					$("#regionBox").hide();
				} else {
					$("#regionBox").show();
				}
			},
			//returns array dimension information (without adjusting proportions)
			_getBBox:function(){
				var self=this;
				return {left:parseInt(self.DOM.css("left"),10),top:parseInt(self.DOM.css("top"),10),width:self.DOM.width(),height:self.DOM.height()};
			},
			//returns the dimensions needed for a region:
			// left
			// 			top
			// 			width
			// 			height
			_getDims:function(){
				var self=this;
				var pos=self.DOM.draggable().position();
				var totWidth = self.DOM.parent().width();
			    var totHeight = self.DOM.parent().height();
			    var left = pos.left / totWidth;
			    var top = pos.top / totHeight;
			    var width = self.DOM.width() / totWidth;
			    var height = self.DOM.height() / totHeight;
				//only need left,top,width,height
				return {left:left,top:top,width:width,height:height};
			},
			_closeOut:function(e){
				var self=e.data.obj;
				self.DOM.hide();
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
				this.foundOnRow = parseInt(args.foundOnRow.substring(1),10);

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
				//overwritten by child classes
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
				
				$("body").bind("slideChange",{obj:this},this.changeColorFromSlider);
				
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
				$("body").trigger("ColorChange",[rgb]);

			},
			_RGB:function(){
				var self=this;
				return self.rgbDiv.text();
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
				var self=this;
				self.DOM=$("<div class=\"lineBox\"></div>").attr("id","lineBox_"+$(".lineBox").length);
				self.uid=self.DOM.attr('id');
				//add Options
				self.resizeOn=false;
				self.dragOn=false;
				self.DOM.width(args.width);
				self.DOM.height(args.height);
				self.DOM.css("left",args.left+'px');
				self.DOM.css("top",args.top+'px');
				self.DOM.appendTo(args.loc);
				self.optionsON=false;
				$("#"+self.uid).bind("mouseover",function(e){
					$(this).addClass("lineBoxSelect");
				});
				$("#"+self.uid).bind("mouseout",function(e){
					$(this).removeClass("lineBoxSelect");
				});
				$("#"+self.uid).bind("click",function(e){
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
			},
			_getDims:function(){
				
			}
		});
			
			
			var AutoRecognizer=Monomyth.Class.extend({
				init:function(args){
					this.data=[];
					this.shapes=[];
				}

			});

			/**
			CanvasAutoRecognizer

			Functions:
			init (constructor)
			getRegion - receives values from Image object
			thresholdConversion
			filterDots
			createLineBreaks
			convertShapesToLines
			cleanLineBreaks
			colorLineBreaks

			listens for:
			RegionSet
			**/

			var CanvasAutoRecognizer=AutoRecognizer.extend({
				init:function(args){
					this.$super(args);
					// args:
					// Region: Region of image

					this.dots=[];
					this.numOfLines=40;
					//$("#numOfLines")[0].value;
					this.minLineHeight=5;
					this.canvasImage=args.obj;
					this.canvas=args.canvas;
					this.Region=$("#"+args.regionID);
					this.regionData=null;
					this.bdrows = []; // Array of total black dots in each row
					this.bdcols = []; // Array of total black dots in each column
					this.maxes = []; // Array of row #s that represent peaks of dots
					this.mins = []; // Array of row #s that represent troughs of dots
					this.dotMatrix = [];
					this.dotMin=(args.dotMin)?args.dotMin:5;
					this.dotMax=(args.dotMax)?args.dotMax:1000;
					this.bkGrnd="(0,0,0)";
					this.imageEl=$("#"+args.imageEl);
					this.context=this.canvas[0].getContext('2d');
					this.selAverage="CCCCCC";
				},
				thresholdConversion:function(threshold){
					if(!threshold) threshold=$("#backgroundimage").text();
					this.dotMatrix=[];  
					if(this.Region){
						this.dots=[]; //resets main dot matrix
						//divide the rbg color value into parts

						data=threshold.split(',');

						var selred=parseInt(data[0],10);	  
				     	var selgreen=parseInt(data[1],10);
				     	var selblue=parseInt(data[2],10);	
				     	threshold=(selred+selgreen+selblue)/3;
						var rl = this.Region.position().left-this.canvas.position().left;
						var rt = this.Region.position().top-this.canvas.position().top;
						var rw = this.Region.width();
						var rh = this.Region.height();
						if((rl<0)||(rt<0)||(rw<0)||(rh<0)) return;
						//get canvas imageData
						if(!this.regionData){
							this.regionData=this.context.getImageData(rl, rt, rw, rh); 

						} else {
							//create a blank slate - somehow 'createImageData' doesn't work in this case
							//var zoomData=this.canvasImage.getZoomLevel();
							//BUG: TODO: remove and replace with CanvasImage function
							this.context.drawImage(this.imageEl[0], 0, 0, this.imageEl.width(),this.imageEl.height());
							//find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
							this.regionData=this.context.getImageData(rl, rt, rw, rh); 
						}

					 	var total = 0;
						//CREATING this.dots array matrix
						//GOING HORIZONTAL TO VERTICAL
						for (var j=0; j<rh; j++){
							this.bdrows["R"+j]=0;
						  for (var i=0; i<rw; i++){
							this.bdcols["C"+i]=0;
						     var index=(i +j*rw)*4;
							 var red=this.regionData.data[index];	  
						     var green=this.regionData.data[index+1];
						     var blue=this.regionData.data[index+2];	  
						     var alpha=this.regionData.data[index+3];	 
						     var average=(red+green+blue)/3;
							 adiff = Math.abs(average-threshold);
				 			if (!(this.dotMatrix[j])){
								this.dotMatrix[j]=[];
							}
							this.dotMatrix[j][i]= average;


							if (average>threshold){
								//turn white
						   	 	this.regionData.data[index]=255;	  
							    this.regionData.data[index+1]=255;
							    this.regionData.data[index+2]=255;
							    this.regionData.data[index+3]=alpha;
							}	
							else{
								//turn black
							 	this.regionData.data[index]=0;	  
							    this.regionData.data[index+1]=0;
							    this.regionData.data[index+2]=0;
							    this.regionData.data[index+3]=alpha;
								//add to large array
								if((this.dots["D"+j]==null)){
									this.dots["D"+j]=[];
								}
								this.bdcols["C"+i]++;
								this.bdrows["R"+j]++;

								this.dots["D"+j]["D"+i]=0;
								total++;
							} 

						  }



						}
				 		//convert area to black and white using putImageData
						this.context.putImageData(this.regionData,rl,rt);

					}
				},
				medianThreshold: function(){
					debug("running median");
					var newMatrix = [];
					for (var i=0;i<this.dotMatrix.length;i++){
						newMatrix[i]=[];
						newMatrix[i][0] = this.dotMatrix[i][0];
					}
					for (var i=0;i<this.dotMatrix[0].length;i++){
						newMatrix[0][i] = this.dotMatrix[0][i];
					}
					debug("big median loop");
					for(var y=1;y<this.dotMatrix.length-1;y++){
						newMatrix[y] = [];
						for (x=1;x<this.dotMatrix[y].length-1;x++){

							//var surrounding=[];
							var white = 0;
							var black =0;

							for (var i = -1; i < 2; i++) {
								for (var j = -1; j < 2; j++) {
											if (this.dotMatrix[(i+y)][(j+x)]<this.selAverage){
												black++;
											}
											else{
												white++;
											}
											//surrounding.push(this.dotMatrix[(i+y)][(j+x)]);


								}
							} 
							debug("white "+white+" , black "+black);
							if (black>2){
								newMatrix[y][x]=1; // white
							}
							else{
								newMatrix[y][x]=0; //black
							} 
						}
					}

					this.paintFromDotMatrix(newMatrix);
				},
				paintFromDotMatrix: function(matrix){
					debug("paint from Dot Matrix "+matrix.length);
					for (j=0;j<matrix.length;j++){
						if (!(matrix[j])){
							matrix[j]=[];
						}
						for (i=0;i<matrix[j].length;i++){
							if (!(matrix[j][i])){
								matrix[j][i]=0;
							}
							 var index=(i +j*this.Region.w)*4;



							if (matrix[j][i]==1){

								//turn black
							 	this.regionData.data[index]=255;	  
							    this.regionData.data[index+1]=0;
							    this.regionData.data[index+2]=0;
							  //  this.regionData.data[index+3]=alpha;
								//add to large array
								if((this.dots["D"+j]==null)){
									this.dots["D"+j]=[];
								}
								this.bdcols["C"+i]++;
								this.bdrows["R"+j]++;

								this.dots["D"+j]["D"+i]=0;
								//$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"][D"+i+"]="+this.dots["D"+j]["D"+i]);
								//total++;
							}
								else{ 
									//turn white
						   	 	this.regionData.data[index]=255;	  
							    this.regionData.data[index+1]=255;
							    this.regionData.data[index+2]=255;
							  //  this.regionData.data[index+3]=alpha;
							}	







						}
						this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
					}
				},
				filterDots:function(cancel){
					debug("filterDots");
					//go through the Black Dots matrix and find blobs
					if(this.shapes.length>0){
						$(".blobbox").remove();

					}
					this.shapes=[];

					var shapecount=0;

					for(y in this.dots){
						//$("#testnotes").append("<p>row: "+y+"</p>");
						row=parseInt(y.substring(1),10);

						for(x in this.dots[y]){
							if(this.dots[y][x]>=0){
								var dot=this.dots[y][x]; 
							//	$("#testnotes").append("<p>col: "+x+"</p>");
							if(dot==0){
									//not categorized - need to find it a shape 
									//or create a new shape to put it in

									col=parseInt(x.substring(1),10);

									//go in order: left, right, above, below
									kl="D"+(col-1);
									kr="D"+(col+1);
									ka="D"+(row-1);
									kb="D"+(row+1);
									sides=0;
									// First look at all dots immediately above 

									if (this.dots[ka]){
										if ((this.dots[ka][kl])){
											this.dots[y][x]=this.dots[ka][kl];
											this.shapes[this.dots[y][x]].add({x:x,y:y});
											sides++;

										}
										if ((this.dots[ka][x])){
											this.dots[y][x]=this.dots[ka][x];
											this.shapes[this.dots[y][x]].add({x:x,y:y});
											sides++;
										}
										if ((this.dots[ka][kr])){
											this.dots[y][x]=this.dots[ka][kr];
											this.shapes[this.dots[y][x]].add({x:x,y:y});
											sides++;
										}
									}
									//and also to the left
									if (this.dots[y][kl]){
											this.dots[y][x]=this.dots[y][kl];
											this.shapes[this.dots[y][x]].add({x:x,y:y});
											sides++;

										if (this.dots[kb]) {
											if (this.dots[kb][kl]) {
												this.dots[y][x] = this.dots[kb][kl];
												this.shapes[this.dots[y][x]].add({x:x,y:y});
												sides++;
											}
										}
									}
									if (sides == 0) {
										//new shape 
										shapecount++;
										this.dots[y][x] = shapecount;
										this.shapes[this.dots[y][x]]=new Shape({index:shapecount,initialLeft:this.Region.ox,initialTop:this.Region.h,foundOnRow:y});
										this.shapes[this.dots[y][x]].add({x:x,y:y});

									}
									//Now look to the right and below.

									if (this.dots[ka]){
										if (this.dots[ka][kl]) {
											this.dots[ka][kl] = this.dots[y][x];
											this.shapes[this.dots[y][x]].add({x:kl,y:ka});
										}
									}
									if (this.dots[y][kl]){
										this.dots[y][kl]=this.dots[y][x];
										this.shapes[this.dots[y][x]].add({x:kl,y:y});
									}
									if (this.dots[kb]) {
										if (this.dots[kb][kl]) {
											this.dots[kb][kl] = this.dots[y][x];
											this.shapes[this.dots[y][x]].add({x:kl,y:kb});
										}
									}
								}
							}
						}

						// End of Row

					}
					var iterShapes = [];
					debug("number of shapes before cancel: "+this.shapes.length);
			 		//if(cancel) this.noiseCanceler();	
					//this.medianThreshold();
					debug("number of shapes after cancel: "+this.shapes.length);

					for (n in this.shapes){
						iterShapes.push(this.shapes[n]);
					}
					this.shapes = iterShapes;
					//


				},
				noiseCanceler:function(){
					debug("noiseCanceler");
					//take shapes and cancel out the ones with coords fewer
					//than this.dotMin

						debug("Shapes before denoise: "+this.shapes.length);
					MIN=this.dotMin;

					var temp=jQuery.grep(this.shapes,function(el,i){

						return ((el)&&(el.coords.length>MIN));
					});
					this.shapes=temp;
					//update shape indexes
					jQuery.each(this.shapes,function(i,el){
						el.index=i;
					});
						debug("after: "+this.shapes.length);

				},
				convertShapesToLines:function(attach){
					debug("convertShapesToLines");
					if((this.shapes.length>0)&&this.Region){
						//create linebreak array
						//this.sortShapes("foundOnRow");
						this.createLineBreaks();

					}
				},
				storeData:function(){
					//create a smaller object that houses all of the
					//recognizer data for this particular instance
					//narrow down region to its original size
					var zoom=this.canvasImage.getZoomLevel();
					var ox=this.Region.ox/(Math.pow(2,zoom));
					var oy=this.Region.oy/(Math.pow(2,zoom));
					var w=this.Region.w/(Math.pow(2,zoom));
					var h=this.Region.h/(Math.pow(2,zoom));


					this.data={
						region:{ox:ox,oy:oy,w:w,h:h}
					};

				},
				adjustBlobBoxes:function(){
					var data=this.canvasImage.getZoomLevel();
					var blobs=$(".blobbox");
					if(blobs.length>0){
						if((data.zoomLevel>0)&&(data.zoomLevel<5)){
							for(b=0;b<blobs.length;b++){
								var blob=$(blobs[b]);
								var left=((parseInt(blob.css("left"),10))*data.size[0])/data.psize[0];
								var top=((parseInt(blob.css("top"),10))*data.size[1])/data.psize[1];
								var w=(blob.width()*data.size[0])/data.psize[0];
								var h=(blob.height()*data.size[1])/data.psize[1];
								blob.width(w);
								blob.height(h);
								blob.css("left",left+'px');
								blob.css("top",top+'px');
							}
						}
					}
				},
				sortShapes:function(sortAttribute) {
					debug("sortShapes");
				// DLR: From myBubbleSort function @ http://www.irt.org/articles/js054/index.htm
			    for (var i=0; i<(this.shapes.length-1); i++)
			        for (var j=i+1; j<this.shapes.length; j++)
					    //debug("sorting "+i+","+j);
			            if (this.shapes[j][sortAttribute] < this.shapes[i][sortAttribute]) {
			                var dummy = this.shapes[i];
			                this.shapes[i] = this.shapes[j];
			                this.shapes[j] = dummy;
			            }
				},

				createLineBreaks:function(numOfLines){
					//creates linebreaks array from shapes array
					debug("createLineBreaks");
					linebreaks=[];
					lineinfo = [];
					lineinfoSize = 0;
					maxes = [];
					mins = [];
			/* Experimental stuff*/
					var OrderByDots = [];
					var OrderByRows = [];
					i=0;
					// Create iterative array
					for (var n in this.bdrows){
						OrderByDots[i]={
							row: n,
							num: this.bdrows[n]
						};
						OrderByRows.push(parseInt(this.bdrows[n],10));
						i++;
					}

					for (var i = 0; i < (OrderByDots.length - 1); i++) {
						for (var j = i + 1; j < OrderByDots.length; j++) {
							//debug("sorting "+i+","+j);
							if (OrderByDots[j]["num"] < OrderByDots[i]["num"]) {
								var dummy = OrderByDots[i];
								OrderByDots[i] = OrderByDots[j];
								OrderByDots[j] = dummy;
							}
						}
					}
					var lastRow = 0;
					var bucket = [];
					var i=0;
					debug("medIndex: "+Math.floor(OrderByRows.length/2));
					var median = OrderByDots[Math.floor(OrderByRows.length/2)].num;
					debug("median: "+median);
					while ((bucket.length<numOfLines) && (i<OrderByDots.length)){
						var r = parseInt(OrderByDots[i]["row"].substring(1),10);
						var j = 0;
						while((j<bucket.length) && (Math.abs(r-bucket[j])>this.minLineHeight)){
							j++;
						}
						if (j==bucket.length){
							var blackLines = 0;
							var lastFew = r;
							if (r > 6) {
								lastFew = 6;
							}

								for (var k = (r - lastFew); k < r; k++) {
									//debug("comparing to median: " + OrderByRows[k]);
									if (OrderByRows[k] > median) {
										blackLines++;
									}
								}
								//debug("blacklines: " + blackLines);
								//debug("Next row has : " + OrderByRows[(r + 1)]);
								if ((blackLines > 2) 
								//&& (OrderByRows[(r + 1)] < median)) {
								){
									//debug("PUSHING "+r);
									bucket.push(r);
								}


						}
						i++;
					}
					debug("bucket full");
					//bucket.sort();




					return bucket;
					},
				addLineBreak:function(e){

				},
				colorLineBreaks:function(imageEl){
				debug("colorLineBreaks");

					for(y in this.dots){
						var row=parseInt(y.substring(1),10);
						for(x in this.dots[y]){
							var col=parseInt(x.substring(1),10);
							var shape=this.dots[y][x];
							color = 4;
							if (this.shapes[shape]) {
								var forow = parseInt(this.shapes[shape].foundOnRow,10);

								//if (jQuery.inArray(shape,this.lineBreaks)>0){
								var index = (col + row * this.Region.w) * 4;
								var alpha = this.regionData.data[index + 3];
								//var odd=((forow%2)==0);
								var color = (forow % 3);
							//even, it gets a red value, ODD, gets a GREEN value
							}	
								this.regionData.data[index] = (color == 0) ? 255 : 0;
								this.regionData.data[index + 1] = (color == 1) ? 255 : 0;
								this.regionData.data[index + 2] = (color == 2) ? 255 : 0;
								this.regionData.data[index + 3] = alpha;

							//}
						}
					}
					//change colors
					var	nh = (parseInt(imageEl.height,10)*1000)/parseInt(imageEl.width,10);
					//this.context.drawImage(this.imageEl, 0, 0, 1000,nh);
					this.context.putImageData(this.regionData,this.Region.ox,this.Region.oy);
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
					curImage = parseInt(curImage,10)+1;
					curMove++;
					imgsrc = imageList[curImage].uri;
					$("srcImageForCanvas").attr("src",imgsrc);
					CANVAS.setUpCanvas(imgsrc);
				});
				$("#prevButton").bind("click",function(){
					curImage = parseInt(curImage,10)-1;
					curMove--;
					imgsrc = imageList[curImage].uri;
					$("#srcImageForCanvas").attr("src",imgsrc);
					CANVAS.setUpCanvas(imgsrc);
				});
		        $("#captureButton").bind("click", function(){
		            storeRegion();
		        });
		        var car = new CanvasAutoRecognizer({
		            imageEl: "srcImageForCanvas",
		            regionID: "regionBox"
		        });
		        $("body").bind("ColorChange", function(e, threshold){

		            car.thresholdConversion(threshold);
		        });
		        $("#done").bind("click", function(){
		        imgsrc = imageList[0].uri;	
					regionList = _.compact(regionList);	
					$("#srcImageForCanvas").attr("src",imgsrc);
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
				});
		        $('#recognize').bind("click", function(){
					recognize();

		        });
		        curRegion = 0;
		        curImage = 0;
		        nextRegion(0);	
		    }
		}];
})();

var AR={
	start:function(){
		this.__AR__=new TileOCR();
	},
	name:"autorecognizer",
	restart:function(){
		//already constructed, initiate main engine restart function
		this.__AR__._restart();
	}
};