// AutoRecognizer : A plugin tool for the TILE interface
// developed for MITH and TILE by Doug Reside and Grant Dickie
//
// Recognize lines in any given image. Takes a given image url, puts it into an SVG canvas,
// then proceeds to convert the image to black and white and analyze the amount of black pixels to
// determine their concentration and figures out where lines and words are located. Then draws div boxes
// around the areas thought to be lines.
// Objects:
// TileOCR - main engine that creates everything
// CanvasImage
// Shape
// RegionBox
// RegionRule
// lineBox
// AutoRecognizer
// CanvasAutoRecognizer
// Plugs into the tile1.0.js interface. This is done by providing a smaller object, AR, that includes several required functions for a
// plugin in TILE to have. For more information, see below, where the constructor AR is located.

(function ($) {
	
    var AutoR = this;
	AutoR.scale = 1;
	AutoR.imgw = 0;
	AutoR.imgh = 0;
	AutoR.darkText = true;
	AutoR.autoData = [];
	AutoR.recognizedShapes = [];
	AutoR.activeLineNums = [];
	AutoR.predefinedShapes = [];
	
    var alrcontainer = "#azcontentarea > .az.inner.autolinerecognizer";

    // LOAD SCREEN
    // take away the load screen
    var removeImgScreen = function(e) {
        $("#ALR_IMG_LOAD").remove();
        $("#ALR_IMG_BACK").remove();

        // $("body").unbind("closeALRLoad",removeScreen);
    };

    // create load screen to block users clicking on
    // DOM elements while data loads
    var loadImgScreen = function() {
        // attach HTML
        $('<div id="ALR_IMG_LOAD" class="white_content"><div id="ALRLOADIMGDIALOG" class="dialog"><div class="header">Loading Image Canvas</div><div class="body"><p>Loading the image into the canvas, please be patient.</p></div></div></div><div id="ALRBACK" class="black_overlay"></div>').appendTo("body");
        // default CSS is 'display: none' - have to show elements
        $("#ALR_IMG_LOAD").show();
        $("#ALR_IMG_BACK").show();
        $("#ALRLOADIMGDIALOG").show();
    };


    /**
		TileOCR - creates the setup and tools 
		to use the autoRecognizer
		
		Author: Grant Dickie
		MITH 2010
		
		//relies on CanvasAutoRecognizer toolset
		var v = new TileOCR({loc:{String}})
		
		
		args.loc {String} - id for where toolbar is located
		args.transcript {Object} - JSON object containing lines for this url
		
	**/
    var TileOCR = function(args) {
        // Constructor
        //finds it's own location if not given one
        var self = this;
        var d = new Date();
        self.uid = d.getTime("milliseconds") + "_ar";

        // self.loc=(args.loc)?  $("#"+args.loc):$("div.az.tool:empty");
        // self.html=args.layout.autorec;
       
		self.logHTML='<div id="autoreclog" class="az tool autolinerecognizer"><div id="autorecarea" class="az inner autolinerecognizer">'+
		'<div class="autorec_toolbar"><div class="toolbar">Auto Line Recognizer</div>'+
		'<div id="content" class="az"><div class="step"><div class="instructions">Step One: Align the red box over the area of text to recognize</div></div><div class="step"><div class="instructions">Step Two: Select if this image of text has:</div>'+
		'<div><p><input type="radio" id="darkonlight" name="threshChoice" disabled="disabled" />Dark text on a light background</p>'+
		'<p><input type="radio" id="lightondark" name="threshChoice" disabled="disabled" />Light text on a dark(er) background</p></div></div>'+
		'<div class="step"><div class="instructions">'+
        '<p>Step Three: Select transcript lines that you want to recognize</p>' +
        '</div><div id="transcript"></div><div id="transcript_controls">' +
        '<a id="selectAll" class="button inactive">Select All</a> | <a id="selectNone" class="button inactive">Select None</a></div>'+
		'<div class="step"><br/><a id="autorec_recognize" class="button inactive">Perform Line Recognition</a></div>'+
		'</div></div><div id="shapesLoaded" class="az"><div class="step"><div class="instructions">Erase shapes and start over</div><a id="showRegionBox" class="button">Start</a></div></div>';
		
        //use this later to put in CanvasImage object
        self.canvasHTML = '<div id="canvasHTML" class="workspace autolinerecognizer"><div class="toolbar"></div><div id="html5area"><canvas id="canvas"/></div><div id="raphaelarea"><img id="imageRaphaelPreview" /></div><img id="hiddenCanvasSource" src="" style="visibility:hidden;"/></div>';
   
        self.transcript = (args.transcript) ? args.transcript : null;
        self.lineManifest = [];
        self.activeLines = [];
        self.curRegion = 0;
        self.url = [];
		self.predefCount = 0;
        // set up html
        // self._setUp();
    };
    TileOCR.prototype = {
		// Sets the AutoR property for predifined shapes
		// This property is used in the initial stage of the Auto Recognition
		// when the pre-made shapes are set 
		// Filters out the shapes that are already in AutoR.recognizedShapes
		setPredefinedShapes : function (shapes) {
			var self=this;
			
			AutoR.predefinedShapes = [];
			self.predefCount = 0;
			// if(AutoR.recognizedShapes.length){
			// 			// filter out the array
			// 			$.each(shapes, function (ix, shape) {
			// 				var id=shape.id;
			// 				var found=false;
			// 				$.each(AutoR.recognizedShapes, function (iy, line) {
			// 					if(id==line.id){
			// 						found=true;
			// 					}
			// 				});
			// 				
			// 				if(!found){
			// 					self.predefCount++;
			// 					AutoR.predefinedShapes.push(shape);
			// 				}
			// 				
			// 			});
			// 		} else {
				AutoR.predefinedShapes = [];
				self.predefCount = 0;
				$.each(shapes, function (i, o) {
					AutoR.predefinedShapes.push(o);
					self.predefCount++;
				});
				
			// }
		},
        // Setting up the HTML for AutoRecognizer
        // Replaces both the Transcript and ActiveBox areas to the left and
        // replaces canvas area
        // jsonhtml : {Object} JSON object containing strings for autorecognizer HTML
        // 						elements
        _setUp: function() {
            //set up rest of autorecognizer
            var self = this;
            // self.html=jsonhtml.autorec;

            self.DOM = $("div.autorec_toolbar").attr('id', self.uid + "_main");
            
			$("#darkonlight").live('click',function(e){
				
				AutoR.darkText=true;
			});
			
			$("#darkonlight").attr('checked','checked');
			
			$("#lightondark").live('click',function(e){
				
				AutoR.darkText=false;
			});
			
			$("#shapesLoaded").hide();
			
			// makes the RegionBox appear
			$("#showRegionBox").click(function (e) {
				e.preventDefault();
				
				self.CANVAS.setUpCanvas();
				self.startAutoRecognition();
			});
			
            self.transcriptArea = $("#" + self.DOM.attr('id') + " > #content > .step > #transcript");

            //get buttons
            self.closeB = $("#" + self.DOM.attr("id") + " > .toolbar > div.menuitem > span").click(function(e) {
                e.preventDefault();
                self._outputData();
            });
           
            self.recognizeB = $("#autorec_recognize");
            self.doneB = $("#" + self.DOM.attr('id') + " > #content > div > #done").click(function(e) {
                e.preventDefault();
                self._outputData();
            });

          
            self.selectAll = $("#" + self.DOM.attr('id') + " > #content > .step > #transcript_controls > #selectAll");
            self.selectNone = $("#" + self.DOM.attr('id') + " > #content > .step > #transcript_controls > #selectNone");
            self.selectAll.click(function(e) {
                e.preventDefault();
                self.transcriptArea.children("div").removeClass("selected").addClass("selected");
				for(var a in self.activeLines){
					self.activeLines[a].active=true;
				}

            });
            self.selectNone.click(function(e) {
                e.preventDefault();
                self.transcriptArea.children("div").removeClass("selected");
				for(var a in self.activeLines){
					self.activeLines[a].active=false;
				}
            });
			
			
			
            //swap out other canvas/image area data for CanvasImage
            self.swapCanvas();
            // load in the transcript
            self._loadTranscript();
            
			// TWO SCENARIOS FOR USING ALR: 
			// 1. USER HAS PRE-DRAWN SHAPES AND THE PREVIEWCANVAS SHOWS THESE
			// 2. USER HAS NO PRE-DRAWN SHAPES
			if(self.predefCount>0){
				// initially set up SVG canvas to show shapes
				// already drawn
				// Attaching listener for when HTML5 canvas is 
				// finished loading and setting the correct AutoR.scale
				// value
				$("body").bind("HTML5CANVASDONE", function (e) {
					$(this).unbind("HTML5CANVASDONE");
					self.CANVAS.hide();
					self.shapePreview.show();
					self.shapePreview.loadShapes(AutoR.predefinedShapes);
					
					$("#content").hide();
					$("#shapesLoaded").show();
				});
			} else {
				// Otherwise, if no shapes drawn, go straight to setting up HTML5 canvas
				$("body").bind("HTML5CANVASDONE", function (e) {
				
					$(this).unbind("HTML5CANVASDONE");
					
					self.startAutoRecognition();
				});
			}
			
			// set up the image in the canvas
            self.CANVAS.setUpCanvas();
        },
		// Hides the Raphael Canvas area and 
		startAutoRecognition:function (){
			var self = this;
			self.shapePreview.hide();
			self.CANVAS.show();
			// if previously recognized shapes still present, delete them
			if(AutoR.recognizedShapes.length){
				// copy array
				var args=[];
				$.each(AutoR.recognizedShapes, function (i, o) {
					args.push(o);
				});

				// send out
				$("body:first").trigger("deleteRecognizedShapes",[args]);
				AutoR.recognizedShapes=[];
			}
			$(".autorec_toolbar > #shapesLoaded").hide();
			$(".autorec_toolbar > #content").show();
			
			$("#darkonlight").attr('disabled','');
			$("#lightondark").attr('disabled','');
			
			$("#transcript_controls > a").removeClass("inactive");
			
			$("#autorec_recognize").removeClass("inactive");
			
			$("#regionBox").show();
			
			if(!self.regionBox) self.regionBox = $("#regionBox");
			
			self.CANVAS._resetCanvasImage();
			
			// self.CANVAS.setUpCanvas();
			self.guessRegionBoxDims();
			
		},
        // Sets up CanvasArea - replaces CanvasArea from previous tool
        // and replaces with this Tools' CanvasImage
        swapCanvas: function() {
            var self = this;
           
			//make canvas
			self.CANVAS = new CanvasImage({

			});

			self.shapePreview=new ShapePreviewCanvas();

			//create region box and put over newly created canvas
			self.regionBox = new RegionBox({

			});
			//create canvas auto recognizer to use regionBox above and
			//handle all color conversion/analysis
			self.CAR = new CanvasAutoRecognizer({
				canvas: self.CANVAS.canvas,
				canvasImage: self.srcImage,
				imageEl: "hiddenCanvasSource",
				regionID: "regionBox"
			});

			self.recognizeB.click(function(e) {
				e.preventDefault();
				self._recognize();
			});
			//set global listeners
			//when user changes settings on colorfilter, need to reset canvas region
			$("body").bind("ColorChange", {
				obj: self
			},self.ColorChangeHandle);
			//when canvas has loaded image, need to load the transcript
			//regionBox dragging/resizing listeners
			//call changeColor each time the box is dragged/resized
			$("body").live("regionMovedDone",
			function(e) {
				self.CANVAS._resetCanvasImage();
				self.CAR.thresholdConversion();
				
			});
			$("body").live("regionResizeDone",
				function(e) {

				self.CANVAS._resetCanvasImage();
				self.CAR.thresholdConversion();

			});

			$("#transcript > .trLine").live('click',function(e){
			var t=parseInt($(this).attr('id'),10);
			if ($(this).hasClass("selected")) {
				$(this).removeClass("selected");

				self.deselectActiveLine(t);
			} else {
				$(this).addClass("selected");
				self.setActiveLine(t);
			}

		});


        },
        // Once the setUp is run, and the AR has been hidden, call this function
        // from AR.restart()
        // transcript {Object} - JSON data containing lines for this session
        _restart: function(transcript) {
			$("#shapesLoaded").hide();
			$(".autorec_toolbar > #content").show();
		
			AutoR.recognizedShapes = [];
            //already constructed, re-attach listeners and show DOM
            var self = this;
			
            if (self.CANVAS) {
                // self.regionBox=new RegionBox({loc:"#azcontentarea"});
                $("#regionBox").hide();
                self.CAR.Region = $("#regionBox");

                // $(".az.main > .az.log").removeClass("log").addClass("tool");
                var n = '-=' + $(".az.main > .az.tool").width();
                $(".az.main > .az.tool").animate({
                    opacity: 0.25,
                    left: n
                },
                10,
                function(e) {
                    $("#az_log > .az.inner:eq(0)").hide();
                    $("#az_log > .az.inner:eq(1)").show();
                    $(alrcontainer).show();
					
					// TWO SCENARIOS FOR USING ALR: 
					// 1. USER HAS PRE-DRAWN SHAPES AND THE PREVIEWCANVAS SHOWS THESE
					// 2. USER HAS NO PRE-DRAWN SHAPES
					if(self.predefCount>0){
						// initially set up SVG canvas to show shapes
						// already drawn
						// Attaching listener for when HTML5 canvas is 
						// finished loading and setting the correct AutoR.scale
						// value
						$("body").bind("HTML5CANVASDONE", function (e) {
							$(this).unbind("HTML5CANVASDONE");
							self.CANVAS.hide();
							self.shapePreview.show();
							self.shapePreview.loadShapes(AutoR.predefinedShapes);
							$(".autorec_toolbar > #content").hide();
							$("#shapesLoaded").show();
						});
					} else {
						// Otherwise, if no shapes drawn, go straight to setting up HTML5 canvas
						$("body").bind("HTML5CANVASDONE", function (e) {
							$(this).unbind("HTML5CANVASDONE");
							self.CANVAS._resetCanvasImage();
							self.startAutoRecognition();
							
						});
					}
					
                    
                    self.CANVAS._restart(transcript);

                    $(this).animate({
                        opacity: 1,
                        left: 0
                    },10);
                });
                // correct any window size difference
                $("#" + self.CANVAS.uid).width($("#azcontentarea").width());
                $("#" + self.CANVAS.uid).height($("#azcontentarea").height());

                if (transcript) {

                    self.transcript = transcript;
                    
                    self._loadTranscript();
                }
            }
        },
        // Loads the stored transcript array items into the transcript div
        _loadTranscript: function() {
            var self = this;
            var out = "";
            // reset line manifest
            self.lineManifest = [];
            if (self.transcript) {
                self.transcriptArea.empty();
                for (var t in self.transcript.lines) {
                    if (!self.transcript.lines[t]) continue;
                    // push on line stack
                    self.lineManifest.push(self.transcript.lines[t]);
                    //create a selLine object out of transcript item
                    var el = $("<div class='trLine selLine' id='" + t + "'>" + self.transcript.lines[t].text + "</div>");
                    self.transcriptArea.append(el);
                   	
                    // make active
                    self.activeLines.push({line:self.transcript.lines[t],active:true});

                }
                // default mode is that all transcript lines are selected
                self.transcriptArea.children("div").removeClass("selected").addClass("selected");
                // $("#regionBox").show();
            }

        },
        deselectActiveLine: function(n) {
            var self = this;
            
			self.activeLines[n].active=false;

        },
        setActiveLine: function(n) {
            var self = this;

			self.activeLines[n].active=true;
			
        },
        // Called by Mouse Drag, Drop, Move and Resize events
        // Changes the threshold using the CanvasAutoRecognizer Object's
        // thresholdConversion()
        // e : {Event}
        // thresh : {Integer} passed integer for how much threshold to use
        // 					in conversion
        ColorChangeHandle: function(e, thresh) {
            var self = e.data.obj;

            self.CANVAS._resetCanvasImage();
            self.CAR.thresholdConversion();

        },

		/**
		    Calculates where the text might be on the page
		**/
		guessRegionBoxDims: function() {
		    var self = this;
			
		    var dims = self.regionBox._getDims();
		    var context = $("#canvas")[0].getContext('2d');
		    var rl = dims.left,
		        rt = dims.top,
		        rw = dims.width,
		        rh = dims.height;
		    var regionData = context.getImageData(rl, rt, rw, rh);
		    //console.log(regionData);
		    // we want to calculate a kernel over the image that will try to bring out the
		    // areas with text -- then we'll get a bounding box over that area
		    // we want the largest contiguous block
		    //console.log(rl,rt,rw,rh);
		    var pixel = function(x,y) {
			    var idx = (x + rw*y)*4;
			    return [ regionData.data[ idx ], regionData.data[ idx+1 ], regionData.data[ idx+2] ];
			};
			var set_pixel = function(x, y, i) {
				var idx = (x + rw*y)*4;
				regionData[idx] = i;
				regionData[idx+1] = i;
				regionData[idx+2] = i;
			};
			var I = function(x,y) {
				var px = pixel(x,y);
				return (30*px[0] + 59*px[1] + 11*px[2]) / 100; // Y'_601 standard for intensity
			};
			var cols = [], rows = [];
			for(var y = 0; y < rh; y += 1) {
				for(var x = 0; x < rw; x += 1) {
					var i = I(x, y);
					if(!cols[x]) cols[x] = 0;
					cols[x] += i;
					if(!rows[y]) rows[y] = 0;
					rows[y] += i;
				}
			}
			var parts = { h: [], v: []};
			
			var part_h = function(x) {
				var s, e, sum;
				if(parts.h[x]) return parts.h[x];
			    if(x >= 64) {
				    if(x > 127) return 0;
				    s = parseInt(rw * (x - 64) / 64, 10);
				    e = parseInt(rw * (x - 64+1) / 64, 10);
				    sum = 0;
				    for(; s < e; s += 1) {
					    sum += cols[s];
				    }
				    return sum;
			    }
			    else {
					parts.h[x] = part_h(x*2) + part_h(x*2+1);
         			return parts.h[x];
			    }
			};
			var part_v = function(y) {
				var s, e, sum;
				if(parts.v[y]) return parts.v[y];
				if(y >= 64) {
					if(y > 127) return 0;
				    s = parseInt(rh * (y - 64) / 64, 10);
				    e = parseInt(rh * (y - 64+1) / 64, 10);
				    sum = 0;
				    for(; s < e; s += 1) {
					    sum += rows[s];
				    }
				    parts.v[y] = sum;
				    return sum;
			    }
			    else {
				    parts.v[y] = part_v(y*2) + part_v(y*2+1);
         			return parts.v[y];
			    }
			};
			
			var search = function(x, part, sense, light) {
				// we want to look at x and x+1 and see if we can discern where we need to look next
				// part is part_v or part_h
				// sense is -1 or 1 (1 is looking left, -1 for looking right)
				// light is -1 or 1 (1 for light on dark, -1 for dark on light)
				var diff = (part(x) - part(x+1)) * sense * light;
				//console.log(x, diff, part(x), part(x+1));
				if(x > 63) return x;
				if(Math.abs(diff) > (part(x) + part(x+1))/10) {
					if(diff > 0) {
						//console.log("Searching left half");
						return search(2*x, part, sense, light);
					}
					else {
						//console.log("Searching right half");
						return search(2*x+1, part, sense, light);
					}
				}
				else {
					//console.log("Ending search");
					return x;
					// we're close enough
					if(sense * light == 1) {
						return x;
					}
					else {
						return x;
					}
				}
			};
			
			//console.log(parts);
			
			var left = search(2, part_h, -1, 1),
			    right= search(3, part_h, 1, 1),
			    top  = search(2, part_v, -1, 1),
			    bottom=search(3, part_v, 1, 1);
			
			//console.log(left, right, top, bottom);
			var part2pixel = function(p, size, side) {
			    var i = 1, t = p;
			    while(t >= 2) {
				    i *= 2;
				    t /= 2;
				//console.log(i, t);
				}
				p -= i;
				return size * (p + side) / i - side;	
			};
			
			var lx = part2pixel(left, rw, 0),
			    rx = part2pixel(right, rw, 1),
			    ty = part2pixel(top, rh, 0),
			    by = part2pixel(bottom, rh, 1);
			
			//console.log(rl+lx, rt + ty, rx -lx, by-ty);
			self.regionBox.DOM.css({
	            "left": rl + lx,
	            "top": rt + ty
	        });
			self.regionBox.DOM.width(rx - lx);
			self.regionBox.DOM.height(by - ty);
		},


        /**
			Captures the shape/area data and stores it into 
			memory
		**/
        _capture: function() {
            var self = this;

            var dims = self.regionBox._getDims();
            //var rgb = $("#backgroundimage").text();
            
            var _d = new Date();
            //create JSON object that is output after
            self.regionList = {
                "lines": [],
                "shapes": [],
                "links": [],
                "uid": "g" + _d.getTime("seconds"),
                "left": dims.left,
                "top": dims.top,
                "width": dims.width,
                "height": dims.height,
                
                "uri": $("#hiddenCanvasSource").attr('src')
            };

            self.transcriptArea.children(".selected").each(function(i, o) {
                self.regionList["lines"].push(parseInt($(o).attr('id').replace("trLine", ""), 10));
            });
            //signal to user
            self.regionBox._flash();
        },
        // Uses the CanvasAutoRecognizer functions to recognize pockets of black dots
        // in the image. Parses data into JSON, then sends it to outputData
        //
        _recognize: function() {
            var self = this;
            
            if (self.regionBox.DOM.css("display") == 'none') return;

            self._capture();

            var url = $("#hiddenCanvasSource").attr('src');
            if (self.regionList) {
                //add to this region's images
                //	self.regionList[self.curRegion].images.push($("#hiddenCanvasSource").attr('src'));
                numOfLines = self.activeLines.length;
                // bucket = self.CAR.createLineBreaks(numOfLines);
               
				// Get line values
				bucket=self.CAR.getLines();
 			
				// Retrieve dimensions of the red bounding box
				_REG=self.regionBox._getDims();
                // Permanent Left value for all lines
                var left = _REG.left;
				// Correction value for Auto Recognizer CSS vs. Image Tagger CSS
                var tbarcorrect = ($("#canvasHTML > .toolbar").innerHeight() + 5);
                // correct the bounding box top value
                _REG.top -= tbarcorrect;

                // Top value of the bounding box - this is where measurement for lines starts at
                var alphaTop = _REG.top;

                $(".selLine").removeClass("selLine").addClass("recLine");
                //find proportion of canvas image
                var imgdims = self.CANVAS._getPerc();
                var ldata = [];
                //for sending to the logbar
                var sids = [];
				
				var linecount=0;
				
				
				// Goes through each value of the bucket and 
				// creates top and height values. Then constucts the 
				// shape object that is fed back into TILE.
				// Uses same left and width attribute for all lines.
                for (var i = 1; i <= bucket.length; i+=2) {
				
                    // add the value of the line to the
                    var top = alphaTop + bucket[i-1];
					var bottom=alphaTop + bucket[i];
				
                    // Calculate for average height of line
                    var height = bottom-top;
					top += height-1;
					height *= 2;
					
					if(i == bucket.length) {
						bottom += 2;
						height += 2;
					}
				
                    
                    //creating a similar JSON structure to that of the
                    //VectorDrawer structure for loading in shapes
                    // First generate random ID for shape
					var id = Math.floor(Math.random() * 365);
                    while ($.inArray(id, sids) >= 0) {
                        id = Math.floor(Math.random() * 365);
                    }
                    sids.push(id);
                    //change the uid of the lineBox that goes with this
                    // $("#lineBox_" + i).attr('id', "lineBox_" + id + "_shape");

                    //update assoc. transcript tag
					if(!self.activeLines[linecount].active){
						while(self.activeLines[linecount]&&(self.activeLines[linecount].active == false)){
							linecount++;
						}
						if(!(self.activeLines[linecount])||(self.activeLines[linecount].active == false)) break;
					}
					
                    if (self.activeLines[linecount]) {
                        // if(!self.transcript.lines[i].shapes) self.transcript.lines[i].shapes=[];
                        // if(!self.transcript.shapes) self.transcript.shape[];
                        //add data to the session's JSON object.
						
						var posInfo = {"x": (left),"y": (top),"width": (_REG.width),"height": (height)};
						
						$.each(posInfo, function (i, val) {
							var dx=(val * 1)/AutoR.scale;
							posInfo[i] = dx;
							
						});
						
                        ldata.push({shape:{
                            "id": id + "_shape",
                            "type": "rect",
                            "_scale": 1,
                            "color": "#000000",
                            "posInfo": posInfo
                        },
						line:self.activeLines[linecount].line	
						});
						linecount++;
                    }
				
                }
                self.regionBox.DOM.hide();
                //hide regionBox
				
				
				
                // set recognized images variable and
				// send to shapePreview
				// AutoR.recognizedShapes=ldata;
				var shapes=[];
				for(var x in ldata){
					
					shapes.push(ldata[x].shape);
				}
				AutoR.recognizedShapes=shapes;
				self.predefCount = 0;
				// erase all predefined shapes
				$("body:first").trigger("deleteRecognizedShapes",[AutoR.predefinedShapes]);	
				
				AutoR.autoData=ldata;
				
				self.shapePreview.show();
				self.CANVAS.hide();
				//output data and close autoRecognizer
                self._outputData();
				
				self.shapePreview.loadShapes(AutoR.recognizedShapes);
				
				// switch over toolbar
				$(".autorec_toolbar > #content").hide();
				$(".autorec_toolbar > #shapesLoaded").show();
				
            }
        },
        // Takes the parsed JSON data from recognize() and
        // sends it out using 'outputAutoRecData'
        //
        _outputData: function() {
            var self = this;
            var url = TILE.url;
            if (url) {
                $("#hiddenCanvasSource").attr("src", url.substring((url.indexOf('=') + 1)));
            }
            // output all data found
            if (AutoR.autoData) {
                $("body:first").trigger("outputLines", [AutoR.autoData]);
            } else {
                $("body:first").trigger("closeALR");
            }
        }
    };

    AutoR.TileOCR = TileOCR;


    /**
	 * Image object that creates a canvas
	 * and loads URL of image inside it
	 * 
	 * Possible functionality:
	 * Can load a series of urls (array-based series) 
	
		Usage:
			new CanvasImage({loc:{jQuery Object}})
	 */
    var CanvasImage = function(args) {
        // Constructor
        var self = this;
        //create UID
        var d = new Date();
        this.uid = "image_" + d.getTime("hours");

        //url is actually an array of image values
        this.url = (typeof args.url == "object") ? args.url: [args.url];

        // this.loc = $("#azcontentarea");
        //        if (this.loc) {
        //            //set to specified width and height
        //            if (args.width) this.DOM.width(args.width);
        //            if (args.height) this.DOM.height(args.height);
        //        }
        //grab source image
        this.srcImage = $("#hiddenCanvasSource");
        // attach html
        // this.loc.append($());
        // global bind to window to make sure that canvas area is correctly synched w/
        // window size
        $(window).resize(function(e) {

            if ($("#" + self.uid).length) {
                $("#" + self.uid).width($("#azcontentarea").width());
                $("#" + self.uid).height($("#azcontentarea").height() - $("#azcontentarea > .az.inner > .toolbar").innerHeight());
            }
        });

        this.DOM = $("#canvasHTML");

        this.DOM.width($("#azcontentarea").width());
        this.DOM.height(this.DOM.closest(".az.content").height() - this.DOM.closest(".toolbar").height());

        // set up listeners for zoom buttons
        // $(alrcontainer + " > .toolbar > ul > li > a#zoomIn").live('click',
        //         function(e) {
        //             e.preventDefault();
        //             // fire zoom trigger for AR
        //             $("body:first").trigger("zoomAR", [1]);
        //         });
        //         $(alrcontainer + " > .toolbar > ul > li > a#zoomOut").live('click',
        //         function(e) {
        //             e.preventDefault();
        //             // fire zoom trigger for AR
        //             $("body:first").trigger("zoomAR", [ - 1]);
        //         });
        
        this.canvas = $("#" + this.DOM.attr('id') + " > #html5area > #canvas");
        //need real DOM element, not jQuery object
        this.canvasEl = this.canvas[0];
        this.imageEl = this.srcImage[0];
        this.pageNum = 0;
        this.url = [];
        this.nh = 0;
        this.nw = 0;
        this._scale = 1;

        this._loadPage = $("<div class=\"loadPage\" style=\"width:100%;height:100%;\"><img src=\"skins/columns/images/tileload.gif\" /></div>");

        //whatever is currently in srcImage, load that
        //this.setUpCanvas(this.srcImage.attr("src"));
        $("body").bind("zoomAR", {
            obj: this
        },
        this.zoomHandle);
        //$("body").bind("closeOutAutoRec",{obj:this},this._closeOut);

        //stop listening to events after user loads lines
        $("body").bind("linesAdded_", {
            obj: this
        },
        function(e) {
            var self = e.data.obj;
            self.canvas.css("pointer-events", "none");
        });
        // $("body").bind("SecurityError1000",function(e){
        // 				e.stopPropagation();
        // 				self.setUpCanvas($("#hiddenCanvasSource").attr('src'));
        // 				return;
        // 			});
    };
    CanvasImage.prototype = {
		show:function(){
			var self=this;
			$("#html5area").show();
			// self.setUpCanvas();
			$("#regionBox").show();
		},
		hide:function(){
			var self=this;
			$("#html5area").hide();
			$("#regionBox").hide();
		},
        zoomHandle: function(e, v) {
            var self = e.data.obj;
            //v is either greater than 0 or less than 0
            self.canvas[0].width = self.canvas.width();
            if (v > 0) {
                //zoom in
                var w = self.canvas.width() * 1.25;
                var h = self.canvas.height() * 1.25;
                self.canvas[0].width = w;
                self.canvas[0].height = h;
                self._scale *= 1.25;
                TILE.scale *= 1.25;
            } else if (v < 0) {
                //zoom out
                var w = self.canvas.width() * 0.75;
                var h = self.canvas.height() * 0.75;
                self.canvas[0].width = w;
                self.canvas[0].height = h;
                self._scale *= 0.75;
                TILE.scale *= 0.75;

            }
            // reset regionBox
            if ($("#regionBox").length) {
                // minimize to prevent lag or thresholdConversion
                // from getting called on NaN values
                var w = ($("#regionBox").width() * TILE.scale < 50) ? 50: ($("#regionBox").width() * TILE.scale);
                var h = ($("#regionBox").height() * TILE.scale < 50) ? 50: ($("#regionBox").height() * TILE.scale);

                var l = $("#regionBox").position().left * TILE.scale;
                // set top value a little lower than top of .az.inner
                var t = 0;
                $("#regionBox").width(w);
                $("#regionBox").height(h);
                $("#regionBox").css("left", l + 'px');
                $("#regionBox").css("top", t + 'px');
            }

            var nw = $("#hiddenCanvasSource")[0].width * self._scale;
            var nh = $("#hiddenCanvasSource")[0].height * self._scale;
            $("#hiddenCanvasSource").width(nw);
            self.context.drawImage(self.imageEl, 0, 0, ($("#hiddenCanvasSource")[0].width * self._scale), ($("#hiddenCanvasSource")[0].height * self._scale));
        },
		// Used for HTML Webkit browsers
		// Similar to setUpCanvas
		altSetUpCanvas: function () {
			var self = this;
			
			 // $("#hiddenCanvasSource").hide();
	         self.canvas[0].width = 0;
            // self._loadPage.appendTo(self.DOM);
            if (TILE.url == '') return;

            loadImgScreen();

			var loadHTML5 = function () {
				AutoR.scale=1;
				var ow = $("#hiddenCanvasSource")[0].width;
                var oh = $("#hiddenCanvasSource")[0].height;
			
				// set height and width of canvas area to parent div
				$("#canvasHTML").width($(".az.inner.autolinerecognizer").width());
				$("#canvasHTML").height($(".az.inner.autolinerecognizer").height());
				
                // if the current width/height too big for the window, size down
                if ((ow > $("#canvasHTML").width()) || ($("#canvasHTML").height() < oh)) {
					while((ow > $("#canvasHTML").width())||($("#canvasHTML").height() < oh)){
						ow*=0.9;
						oh*=0.9;
						AutoR.scale*=0.9;
					}
                }

				// set global variables
				AutoR.imgw=ow;
				AutoR.imgh=oh;
			

                var real_width = $("#hiddenCanvasSource")[0].width;
                var real_height = $("#hiddenCanvasSource")[0].height;

                self.curUrl = $("#hiddenCanvasSource").attr("src");


                self.canvas[0].width = real_width;
                self.canvas[0].height = real_height;


                // if (($("#regionBox").width() > real_width) || ($("#regionBox").height() > real_height)) {
                //                    $("#regionBox").width(real_width - (real_width / 4));
                //                    $("#regionBox").height(real_height - (real_height / 4));
                //                }
                // 				var regionBoxTop = $("#canvasHTML > .toolbar").innerHeight();
                // 
                // 				$("#regionBox").css({"top":regionBoxTop+'px',"left":"0px"});
                self.canvas.attr("width", self.canvas[0].width);
                self.canvas.attr("height", self.canvas[0].height);
				
				
				setTimeout(function () {
					self.context = self.canvasEl.getContext('2d');
	                self.context.drawImage($("#hiddenCanvasSource")[0], 0, 0, ow, oh);
	                $("#" + self.uid).width($("#azcontentarea").width());
	                $("#" + self.uid).height($("#azcontentarea").height() - $("#azcontentarea > .az.inner > .toolbar").innerHeight());
					
	                // $("#regionBox").width((ow - 20));
	                // 	                $("#regionBox").height((oh - 20));
					
	                // show the region box after the image has loaded
	                removeImgScreen();
					
					$("body:first").trigger("HTML5CANVASDONE");
				},10);
                
			};
			
			var cleanURL = '';
            // test for remote image and that the url isn't already inserted with the 'PHP'
            if ((/file::/.test(TILE.url) == false) && (/PHP\//.test(TILE.url) == false)) {
                var rootUri = window.location.href;
                rootUri = rootUri.substring(0, rootUri.lastIndexOf("/"));
                cleanURL = rootUri + "/" + TILE.engine.serverRemoteImgUrl + "?uimg=" + TILE.url;
            } else {
                cleanURL = TILE.url;
            }
			
			$("#hiddenCanvasSource").attr('src',cleanURL);
			
			var checkLoad = function(el, callback) {
				if(el.width() > 0 && el.height() > 0){
					callback();
				} else {
					setTimeout(function () {
						checkLoad(el, callback);
					},100);
				}

			};
			
			checkLoad($("#hiddenCanvasSource"), loadHTML5);
			
			
			
		},
        // Takes a url and sets up the  HTML5 Canvas to this
        // url
        // url {String} : url to set canvas to
        // ------------------------------------------------------
        // IF AN IMAGE IS REMOTELY LOCATED, USE THE PHP SCRIPT TO
        // LOAD INTO THE CANVAS
        // ------------------------------------------------------
        setUpCanvas: function(url) {
            var self = this;
			
            self.canvas[0].width = 0;
            if (TILE.url == '') return;
            
			// use alternate function for webkit browsers
			if($.browser.webkit){
				self.altSetUpCanvas();
				return;
			}
			
			loadImgScreen();
            $("#hiddenCanvasSource").load(function(e) {
				AutoR.scale=1;
				var ow = $("#hiddenCanvasSource")[0].width;
                var oh = $("#hiddenCanvasSource")[0].height;
			
				// set height and width of canvas area to parent div
				$("#canvasHTML").width($(".az.inner.autolinerecognizer").width());
				$("#canvasHTML").height($(".az.inner.autolinerecognizer").height());
				
                // if the current width/height too big for the window, size down
                if ((ow > $("#canvasHTML").width()) || ($("#canvasHTML").height() < oh)) {
					while((ow > $("#canvasHTML").width())||($("#canvasHTML").height() < oh)){
						ow*=0.9;
						oh*=0.9;
						AutoR.scale*=0.9;
					}
                }

				// set global variables
				AutoR.imgw=ow;
				AutoR.imgh=oh;
			

                var real_width = $("#hiddenCanvasSource")[0].width;
                var real_height = $("#hiddenCanvasSource")[0].height;

                self.curUrl = $("#hiddenCanvasSource").attr("src");


                self.canvas[0].width = real_width;
                self.canvas[0].height = real_height;


                // if (($("#regionBox").width() > real_width) || ($("#regionBox").height() > real_height)) {
                //                    $("#regionBox").width(real_width - (real_width / 4));
                //                    $("#regionBox").height(real_height - (real_height / 4));
                //                }
                // 				var regionBoxTop = $("#canvasHTML > .toolbar").innerHeight();
                // 
                // 				$("#regionBox").css({"top":regionBoxTop+'px',"left":"0px"});
                self.canvas.attr("width", self.canvas[0].width);
                self.canvas.attr("height", self.canvas[0].height);
			
                self.context = self.canvasEl.getContext('2d');
                self.context.drawImage($("#hiddenCanvasSource")[0], 0, 0, ow, oh);
                $("#" + self.uid).width($("#azcontentarea").width());
                $("#" + self.uid).height($("#azcontentarea").height() - $("#azcontentarea > .az.inner > .toolbar").innerHeight());
                $(this).unbind("load");
                // show the region box after the image has loaded
                removeImgScreen();
				$("body:first").trigger("HTML5CANVASDONE");
            });
            var cleanURL = '';
            // test for remote image and that the url isn't already inserted with the 'PHP'
            if ((/file::/.test(TILE.url) == false) && (/PHP\//.test(TILE.url) == false)) {
                var rootUri = window.location.href;
                rootUri = rootUri.substring(0, rootUri.lastIndexOf("/"));
                cleanURL = rootUri + "/" + TILE.engine.serverRemoteImgUrl + "?uimg=" + TILE.url;
            } else {
                cleanURL = TILE.url;
            }
            $("#hiddenCanvasSource").attr('src', cleanURL);
        },
        //Close Out for CanvasImage
        // hides the container DOM
        _closeOut: function() {
            var self = this;
            $("body").unbind("zoomAR", self.zoomHandle);
            self.DOM.hide();
        },
        // Shows the container DOM and calls setUpCanvas for
        // current image
        _restart: function(data) {
            var self = this;
            self.DOM.show();
            $("body").bind("zoomAR", {
                obj: self
            },
            self.zoomHandle);
			self._resetCanvasImage();
            self.setUpCanvas(TILE.url);

        },
        // Re-draws the canvas
        _resetCanvasImage: function() {
            var self = this;
			
            self.context.drawImage($("#hiddenCanvasSource")[0], 0, 0, AutoR.imgw, AutoR.imgh);
        },
        //get percentage/proportional value of canvas container to canvas
        _getPerc: function() {
            var self = this;
            //Relative Point: the main container of canvas (this.DOM)
            var rp = self.DOM.position();
            var dp = self.canvas.position();
            var l = (dp.left - rp.left);
            var t = (dp.top - rp.top);
            var w = self.canvas.width();
            var h = self.canvas.height();

            return {
                l: l,
                t: t,
                w: w,
                h: h
            };
        }
    };


var ShapePreviewCanvas = function () {
	var self=this;
	// set up image
	$("#imageRaphaelPreview").attr('src',TILE.url);
	// set up the raphael canvas
	self.canvas=new VectorDrawer({"overElm":"#imageRaphaelPreview","initScale":AutoR.scale});
	// set drawMode permenantly to select
	self.canvas._drawMode='s';
	// hide the canvas
	$("#raphaelarea").hide();
	// global bind for when a shape is selected
	$("body").bind("shapeActive",{obj:self},self.shapeActiveHandle);
};
ShapePreviewCanvas.prototype = {  
	show:function(){
		$("#raphaelarea").show();
	},
	hide:function(){
		$("#raphaelarea").hide();
	},
	loadShapes:function(shapes){
		var self=this;
		if(!self.canvas) return;
		var srcImg=$("#hiddenCanvasSource")[0];
		
		self.canvas.clearShapes();
		
		$("#imageRaphaelPreview").attr('src','');
		
		// loads the image then uses callback function
		// to measure width and height of image at scale of 1
		// measures to AutoR.scale and sets up images
		var onLoadImg = function (){
			
			// adjust image to scale
			var w=srcImg.width;
			var h=srcImg.height;
			$("#raphaelarea > .vd-container").width(w);
			$("#raphaelarea > .vd-container").height(h);
	
			var dx=(w*AutoR.scale)/1;
			var dy=(h*AutoR.scale)/1;
	
			$("#imageRaphaelPreview").width(dx);
			$("#imageRaphaelPreview").height(dy);
			// also adjust the svg canvas - vectordrawer doesn't
			// do this automatically
			$("#raphaelarea > .vd-container > *").width(dx);
			$("#raphaelarea > .vd-container > *").height(dy);
			
			// offset the top value from toolbar
			var toff = $("#canvasHTML > .toolbar").innerHeight();
			$("#raphaelarea > .vd-container").css("top",toff+'px');
			
			self.canvas.setScale(AutoR.scale);
			
			// changing the scaling for all shapes
			$.each(shapes, function (ix, shape) {
				if(shape){
					$.each(shape.posInfo, function (iy, info) {
						var dx = (info * AutoR.scale) / shape._scale;
						shape.posInfo[iy] = dx;
					});
					shape._scale = AutoR.scale;
				}
			});
			self.canvas.importShapes(shapes);
		};
		
		
		$("#imageRaphaelPreview").attr('src',TILE.url);
		
		var checkLoad = function(el, callback) {
			if(el.width() > 0 && el.height() > 0){
				callback();
			} else {
				setTimeout(function () {
					checkLoad(el, callback);
				},100);
			}
			
		};
		
		checkLoad($("#imageRaphaelPreview"), onLoadImg);
	},
	shapeActiveHandle:function(e,id){
		var self=e.data.obj;
		if($("#canvasHTML:hidden").length) return;
		if(!self.canvas) return;
		var foundID=$(shape.node).attr('id');

		// select shape, which will draw selBB area
		self.drawTool.selectShape(foundID);
	}
};


    /**
		RegionBox
		
		Author: Grant D.
		
		Taking the HTML from other functions and making it into a single function
		**/
    var RegionBox = function (args) {
        // Constructor
        if (!$(alrcontainer).length) throw "RegionBox cannot be inserted at this point";
        var self = this;
        
        self.DOM = $("<div id=\"regionBox\" class=\"boxer_plainbox\"></div>");
        self.DOM.appendTo($("#html5area"));
        

        //draggable and resizable
        self.DOM.draggable({
            start: function(e, ui) {

                $("body:first").trigger("regionMoveStart");
            },
            stop: function(e, ui) {
                $("#regionBox").css({
                    "top": ui.position.top,
                    "left": ui.position.left
                });
                $("body:first").trigger("regionMovedDone");
            }
        });
        self.DOM.resizable({
            handles: 'se',
            stop: function(e, ui) {

                $("#regionBox").css({
                    "top": ui.position.top,
                    "left": ui.position.left,
                    "width": ui.size.width,
                    "height": ui.size.height
                });
                $("body:first").trigger("regionResizeDone");
            }
        });
        
    };
    RegionBox.prototype = {
        //flashes the box on and off
        _flash: function() {
            var self = this;
            self.DOM.css({
                "background-color": "red"
            });
            self.DOM.animate({
                "opacity": 0
            },
            250,
            function() {
                self.DOM.css({
                    "background-color": "transparent",
                    "opacity": 1
                });

            });
        },
        // Toggles the container DOM either on or off
        // Called by 'showBox' event
        // e : {Event}
        _onOff: function(e) {

            if ($("#regionBox").is(":visible")) {
                $("#regionBox").hide();
            } else {
                $("#regionBox").show();
            }
        },
        //returns the dimensions needed for a region:
        // left
        // 			top
        // 			width
        // 			height
        _getDims: function() {
            var self = this;
            var pos = self.DOM.position();
            // var totWidth = self.DOM.parent().width();
            // 		    var totHeight = self.DOM.parent().height();
            var left = pos.left;
            var top = pos.top;
            var width = $("#regionBox").width();
            var height = $("#regionBox").height();
            //only need left,top,width,height
            return {
                left: left,
                top: top,
                width: width,
                height: height
            };
        },
        // Take passed scale and change left, top, width, and height using this scale
        // scale : {Integer}
        _adjustSize: function(scale) {
            var self = this;
            self.DOM.css({
                "left": (self.DOM.position().left * scale),
                "top": (self.DOM.position().top * scale),
                "width": (self.DOM.width() * scale),
                "height": (self.DOM.height() * scale)
            });
        },
        // Hide the container DOM - called by closeOutAutoRec
        // e : {Event}
        _closeOut: function(e) {
            var self = e.data.obj;
            self.DOM.hide();
        }
    };


    //SHAPE
    /**
		Shape 

		Created by: dreside

		Object that houses a collection of dot coordinates taken from an HTML canvas
		element.
		Stores x,y coordinates and organizes dots from their left-right, bottom-top positions


		**/
    var Shape = function(args) {
        // Constructor
        this.coords = [];
        this.index = args.index;
        this.Top = args.initialTop;
        this.Right = 0;
        this.Left = args.initialLeft;
        this.Bottom = 0;
        this.hMid = 0;
        // horizontal midpoint
        this.vMid = 0;
        // vertical midpoint
        this.foundOnRow = parseInt(args.foundOnRow.substring(1), 10);

    };
    Shape.prototype = {
        // Add an xy value, which is processed into the Shape object's
        // coords array
        // xy : {Object} - array of x and y pair
        add: function(xy) {
            //add new xy value to coords array
            this.coords.push(xy);
            var x = parseInt(xy.x.substring(1), 10);
            var y = parseInt(xy.y.substring(1), 10);
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
        compare: function(shape, criteria) {
            return (this[criteria] < shape[criteria]);
        }
    };


   

    //REGION RULE
    // Object representing an array of values
    // related to a region of an image to recognize
    var RegionRule = function(args) {
        // Constructor
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


    };

    

    // Parent Class
    // AutoRecognizer
    //
    // All AutoRecognizer Objects contain data and shape arrays
    var AutoRecognizer = function(args) {
        // Constructor
        this.data = [];
        this.shapes = [];

        // Sub-Classes extend functionality
    };

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
			
			Usage: 
			new CanvasAutoRecognizer({regionID:{String},dotMin:{Integer},dotMax:{Integer}});
			
			regionID {String} - ID for RegionBox
			dotMin {Integer} - minimum dots per line
			dotMax {Integer} - maximum dots per line
			**/

    var CanvasAutoRecognizer = function(args) {
        // Constructor
        this.data = [];
        this.shapes = [];
        // args:
        // Region: Region of image
        this.dots = [];
        this.numOfLines = 40;
        //$("#numOfLines")[0].value;
        this.minLineHeight = 5;
        this.canvasImage = args.obj;
        this.canvas = args.canvas;
        this.Region = $("#" + args.regionID);
        this.regionData = null;
        this.bdrows = [];
        // Array of total black dots in each row
        this.bdcols = [];
        // Array of total black dots in each column
        this.maxes = [];
        // Array of row #s that represent peaks of dots
        this.mins = [];
        // Array of row #s that represent troughs of dots
        this.dotMatrix = [];
        this.dotMin = (args.dotMin) ? args.dotMin: 5;
        this.dotMax = (args.dotMax) ? args.dotMax: 1000;
        this.bkGrnd = "(0,0,0)";
        this.imageEl = $("#" + args.imageEl);
        this.context = this.canvas[0].getContext('2d');
        this.selAverage = "CCCCCC";
    };
    CanvasAutoRecognizer.prototype = {
        // Conversion of region of image to black and white
        // threshold {Integer} - threshold for BW conversion
		//
		// at the end, this.line_pairs will be an array of row numbers
		// if we have a dark text on light background, then the first number will be the beginning
		//   of the first line, the second will be the end of the first line, the third will be
		//   the beginning of the second line, the fourth will be the end of the second line, etc.
		// if we have light text on a dark background, then the first number will likely be the end of
		//   the first line, the second will be the beginning of the second line, the third will be
		//   the end of the second line, etc. (basically, we're offset by one and need to insert
		//   the first row at the beginning of the array)

        thresholdConversion: function() {
            var threshold = $("#backgroundimage").text();

            this.dotMatrix = [];

            this.Region = $("#regionBox");
            this.context = $("#canvas")[0].getContext('2d');
            if (this.Region) {

                this.dots = [];
                //resets main dot matrix
                //divide the rbg color value into parts
                data = threshold.split(',');

                var selred = parseInt(data[0], 10);
                var selgreen = parseInt(data[1], 10);
                var selblue = parseInt(data[2], 10);
                threshold = (selred + selgreen + selblue) / 3;

                var rl = parseInt(this.Region.position().left, 10);
                var rt = parseInt(((this.Region.position().top) - $("#canvasHTML > .toolbar").innerHeight()), 10);

                var rw = parseInt(this.Region.css('width'), 10);
                var rh = parseInt(this.Region.css('height'), 10);

                // test to make sure region is within the bounds

                if ((rl < 0) || (rt < 0) || (rw < 0) || (rh < 0)) return;

                //get canvas imageData
                if (!this.regionData) {
                    try {
                       
                        this.regionData = this.context.getImageData(rl, rt, rw, rh);
                    } catch(e) {
                        // problem with getting data - handle by upgrading our security clearance
                        // netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                        // this.regionData=this.context.getImageData(rl, rt, rw, rh);
                        // $("body:first").trigger("SecurityError1000");
                        return;
                    }
                } else {
                    //create a blank slate - somehow 'createImageData' doesn't work in this case
                    //var zoomData=this.canvasImage.getZoomLevel();
                    this.context.drawImage(this.imageEl[0], 0, 0, (AutoR.imgw), (AutoR.imgh));
                    //find new regionData from same or different coordinates (if user set new coordinates with 'convertBW' button)
                    try {
                        this.regionData = this.context.getImageData(rl, rt, rw, rh);
                    } catch(e) {
                        // problem with getting data - handle by upgrading our security clearance
                        // netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                        // this.regionData=this.context.getImageData(rl, rt, rw, rh);
                        // New Solution: re-draw the canvas and return function - makes the area not appear
                        // in black and white, but the user can still click 'Go' and get data
                        this.regionData = null;
                        this.context.drawImage(this.imageEl[0], 0, 0, AutoR.imgw, AutoR.imgh);
                        return;
                        // this.thresholdConversion(threshold);
                        // $("body:first").trigger("SecurityError1000");
                        // return;
                    }
                }

                var total = 0;
				this.bdrows_diff = [];
				this.bdrows_diff2 = [];
				var row_min, row_max;
                //CREATING this.dots array matrix
                //GOING HORIZONTAL TO VERTICAL
                for (var j = 0; j < rh; j++) {
                    this.bdrows[j] = 0;
					row_min = 255;
					row_max = 0;
                    for (var i = 0; i < rw; i++) {
                        this.bdcols[i] = 0;
                        var index = (i + j * rw) * 4;
                        var red = this.regionData.data[index];
                        var green = this.regionData.data[index + 1];
                        var blue = this.regionData.data[index + 2];
                        var alpha = this.regionData.data[index + 3];
                        var average = (30*red + 59*green + 11*blue) / 100; // Y'_601 standard for intensity
						if(!AutoR.darkText) {
							average = 255 - average;
						}
                        adiff = Math.abs(average - threshold);
                        if (! (this.dotMatrix[j])) {
                            this.dotMatrix[j] = [];
                        }
                        this.dotMatrix[j][i] = average;

						if(average < row_min) row_min = average;
						if(average > row_max) row_max = average;

						// Convert image to grey-level based on intensity
						this.regionData.data[index] = average;
						this.regionData.data[index+1] = average;
						this.regionData.data[index+2] = average;
						this.regionData.data[index+3] = alpha;

						this.bdcols[i] += average;
						this.bdrows[j] += average;
                    }

					if(j>0) {
						if(Math.abs(row_max - row_min) < 5) {
							this.bdrows_diff[j-1] = 0;
						}
						else
							this.bdrows_diff[j-1] = (this.bdrows[j] - this.bdrows[j-1])/(rw);
						if(j>1) {
							this.bdrows_diff2[j-2] = (this.bdrows_diff[j-1] - this.bdrows_diff[j-2]);
							this.bdrows_diff2[j-2] = parseInt(this.bdrows_diff[j-2],10);
						}
					}
                }

				 				//console.log(this.bdrows_diff2);
 				this.line_pairs = [];
				var in_line = false;
				var line_acc = 0;
				var line_fuzzy = 0;
				var j = 0;
				for(var i = 0; i < rh-2; i++) {
 					line_fuzzy += 1;
 					if(in_line) {
 						if(Math.abs(this.bdrows_diff2[i]) > 2) {
 				  			line_acc += this.bdrows_diff2[i];
 							if(2*line_acc > -line_fuzzy) {
 								this.line_pairs[j] = i;
 								j += 1;
 								in_line = false;
 								line_acc = 0;
 								line_fuzzy = 0;
 							}
 						}
 					}
 					else {
 						if(Math.abs(this.bdrows_diff2[i]) > 2) {
 							line_acc += this.bdrows_diff2[i];
 							if(2*line_acc < line_fuzzy) {
 								this.line_pairs[j] = i;
 								j += 1;
 								in_line = true;
 								line_acc = 0;
 								line_fuzzy = 0;
 							}
 						}
 					}
 				}
 				if(in_line) {
 					this.line_pairs[j] = rh-1;
					j += 1;
 				}
				this.line_pairs[j] = rh;
 				//console.log(this.line_pairs);

                //convert area to black and white using putImageData
                this.context.putImageData(this.regionData, rl, rt);

            }
        },
		// Return bucket of line values. If none present, call thresholdConversion
		getLines:function(){
			var self=this;
			
			if(!self.line_pairs||(self.line_pairs.length==0)){
				
				self.thresholdConversion();
				if(__v) console.log('line_pairs  '+self.line_pairs);
				return self.line_pairs;
			} else {
				return self.line_pairs;
			}
		},
        // Takes dotMatrix array and figures out median
        // threshold
        medianThreshold: function() {

            var newMatrix = [];
            for (var i = 0; i < this.dotMatrix.length; i++) {
                newMatrix[i] = [];
                newMatrix[i][0] = this.dotMatrix[i][0];
            }
            for (var i = 0; i < this.dotMatrix[0].length; i++) {
                newMatrix[0][i] = this.dotMatrix[0][i];
            }

            for (var y = 1; y < this.dotMatrix.length - 1; y++) {
                newMatrix[y] = [];
                for (x = 1; x < this.dotMatrix[y].length - 1; x++) {

                    //var surrounding=[];
                    var white = 0;
                    var black = 0;

                    for (var i = -1; i < 2; i++) {
                        for (var j = -1; j < 2; j++) {
                            if (this.dotMatrix[(i + y)][(j + x)] < this.selAverage) {
                                black++;
                            }
                            else {
                                white++;
                            }
                            //surrounding.push(this.dotMatrix[(i+y)][(j+x)]);

                        }
                    }

                    if (black > 2) {
                        newMatrix[y][x] = 1;
                        // white
                    }
                    else {
                        newMatrix[y][x] = 0;
                        //black
                    }
                }
            }

            this.paintFromDotMatrix(newMatrix);
        },
        // Take the image and turn each pixel either
        // white or black, depending on results from medianThreshold
        // matrix {Object} - Array representing black and white pixels (from medianThreshold)
        paintFromDotMatrix: function(matrix) {

            for (j = 0; j < matrix.length; j++) {
                if (! (matrix[j])) {
                    matrix[j] = [];
                }
                for (i = 0; i < matrix[j].length; i++) {
                    if (! (matrix[j][i])) {
                        matrix[j][i] = 0;
                    }
                    var index = (i + j * this.Region.w) * 4;



                    if (matrix[j][i] == 1) {

                        //turn black
                        this.regionData.data[index] = 255;
                        this.regionData.data[index + 1] = 0;
                        this.regionData.data[index + 2] = 0;
                        //  this.regionData.data[index+3]=alpha;
                        //add to large array
                        if ((this.dots["D" + j] == null)) {
                            this.dots["D" + j] = [];
                        }
                        this.bdcols["C" + i]++;
                        this.bdrows["R" + j]++;

                        this.dots["D" + j]["D" + i] = 0;
                        //$("#testnotes").append("<p>D"+j+" D"+i+" inserted into dots :: "+" this.dots[D"+j+"][D"+i+"]="+this.dots["D"+j]["D"+i]);
                        //total++;
                    }
                    else {
                        //turn white
                        this.regionData.data[index] = 255;
                        this.regionData.data[index + 1] = 255;
                        this.regionData.data[index + 2] = 255;
                        //  this.regionData.data[index+3]=alpha;
                    }
                }
                this.context.putImageData(this.regionData, this.Region.ox, this.Region.oy);
            }
        },
        //take shapes and cancel out the ones with coords fewer
        //than this.dotMin
        noiseCanceler: function() {
            MIN = this.dotMin;

            var temp = jQuery.grep(this.shapes,
            function(el, i) {

                return ((el) && (el.coords.length > MIN));
            });
            this.shapes = temp;
            //update shape indexes
            jQuery.each(this.shapes,
            function(i, el) {
                el.index = i;
            });


        },
        // Creates the linebreak array
        // attach {Object} - DOM element to attach to
        convertShapesToLines: function(attach) {

            if ((this.shapes.length > 0) && this.Region) {
                //create linebreak array
                //this.sortShapes("foundOnRow");
                this.createLineBreaks();

            }
        },
        //create a smaller object that houses all of the
        //recognizer data for this particular instance
        //narrow down region to its original size
        storeData: function() {

            var zoom = this.canvasImage.getZoomLevel();
            var ox = this.Region.ox / (Math.pow(2, zoom));
            var oy = this.Region.oy / (Math.pow(2, zoom));
            var w = this.Region.w / (Math.pow(2, zoom));
            var h = this.Region.h / (Math.pow(2, zoom));


            this.data = {
                region: {
                    ox: ox,
                    oy: oy,
                    w: w,
                    h: h
                }
            };

        },
        //
        adjustBlobBoxes: function() {
            var data = this.canvasImage.getZoomLevel();
            var blobs = $(".blobbox");
            if (blobs.length > 0) {
                if ((data.zoomLevel > 0) && (data.zoomLevel < 5)) {
                    for (b = 0; b < blobs.length; b++) {
                        var blob = $(blobs[b]);
                        var left = ((parseInt(blob.css("left"), 10)) * data.size[0]) / data.psize[0];
                        var top = ((parseInt(blob.css("top"), 10)) * data.size[1]) / data.psize[1];
                        var w = (blob.width() * data.size[0]) / data.psize[0];
                        var h = (blob.height() * data.size[1]) / data.psize[1];
                        blob.width(w);
                        blob.height(h);
                        blob.css("left", left + 'px');
                        blob.css("top", top + 'px');
                    }
                }
            }
        },
        sortShapes: function(sortAttribute) {
            //debug("sortShapes");
            // DLR: From myBubbleSort function @ http://www.irt.org/articles/js054/index.htm
            for (var i = 0; i < (this.shapes.length - 1); i++)
            for (var j = i + 1; j < this.shapes.length; j++)
            ////debug("sorting "+i+","+j);
            if (this.shapes[j][sortAttribute] < this.shapes[i][sortAttribute]) {
                var dummy = this.shapes[i];
                this.shapes[i] = this.shapes[j];
                this.shapes[j] = dummy;
            }
        },
        createLineBreaks: function(numOfLines) {
            //creates linebreaks array from shapes array
            linebreaks = [];
            lineinfo = [];
            lineinfoSize = 0;
            maxes = [];
            mins = [];
            /* Experimental stuff*/
            var OrderByDots = [];
            var OrderByRows = [];
            i = 0;
            // Create iterative array
            for (var n in this.bdrows) {
                OrderByDots[i] = {
                    row: n,
                    num: this.bdrows[n]
                };
                OrderByRows.push(parseInt(this.bdrows[n], 10));
                i++;
            }

            for (var i = 0; i < (OrderByDots.length - 1); i++) {
                for (var j = i + 1; j < OrderByDots.length; j++) {
                    if (OrderByDots[j]["num"] < OrderByDots[i]["num"]) {
                        var dummy = OrderByDots[i];
                        OrderByDots[i] = OrderByDots[j];
                        OrderByDots[j] = dummy;
                    }
                }
            }
            var lastRow = 0;
            var bucket = [];
            var i = 0;
            var median = OrderByDots[Math.floor(OrderByRows.length / 2)].num;
            while ((bucket.length < numOfLines) && (i < OrderByDots.length)) {
                var r = parseInt(OrderByDots[i]["row"].substring(1), 10);
                var j = 0;
                while ((j < bucket.length) && (Math.abs(r - bucket[j]) > this.minLineHeight)) {
                    j++;
                }
                if (j == bucket.length) {
                    var blackLines = 0;
                    var lastFew = r;
                    if (r > 6) {
                        lastFew = 6;
                    }

                    for (var k = (r - lastFew); k < r; k++) {

                        if (OrderByRows[k] > median) {
                            blackLines++;
                        }
                    }

                    if (blackLines > 2)
                    {

                        bucket.push(r);
                    }


                }
                i++;
            }
            return bucket;
        }
    };

})(jQuery);


// Plugin for TILE_ENGINE
// AutoRecognizer - AR plugin
// Contains properties and functions that follow the TILE interface plugin protocol
//
var AR = {
    id: "AR1000",
    // Calls constructor for AutoRecognizer and passes
    // variables
    // id {String} - ID for parent DOM
    // data {Object} - JSON data with transcript lines
    // layout {String} : HTML layout in string format
    start: function(mode) {
        var self = this;
        // If AR object not yet set, create new one
        if (!self.__AR__) {
            var json = TILE.engine.getJSON(true);
			var shapes = self.findShapesInJSON(json);
            self.__AR__ = new TileOCR({
                loc: "az_log",
                transcript: json
            });
            // create a new mode with a callback function
            self.tileMode = mode;
			
			self.__AR__.setPredefinedShapes(shapes);
			
            // attach html to the interface
            // sidbar - left side
            TILE.engine.insertModeHTML(this.__AR__.logHTML, 'main', self.tileMode.name);
            // canvas area - right side
            TILE.engine.insertModeHTML(this.__AR__.canvasHTML, 'rightarea', self.tileMode.name);
            // alter some classnames
            $("#az_log > .az.inner.autolinerecognizer > .toolbar").removeClass("toolbar").addClass("autorec_toolbar");


            $("body").bind("modeActive",function(e, name) {
                if (/recognizer/i.test(name)) {
                    var json = TILE.engine.getJSON(true);
                    $("#autoreclog").css("z-index", "5");
					var shapes=self.findShapesInJSON(json);
					if(__v) console.log('found shapesInJSON: '+JSON.stringify(shapes));
					self.__AR__.setPredefinedShapes(shapes);
					
                    self.__AR__._restart(json);
                } else {
                    $("#autoreclog").css("z-index", "0");
                }

            });
            
			

            // construct auto Rec
            self.__AR__._setUp();

            // un-hide elements
            // $("#az_activeBox").show();
            //             $(".az.main.twocol").show();
            //             $("#azcontentarea > .az.inner").hide();
            //             $("#azcontentarea > .az.inner:eq(0)").show();
            //             $("#az_log").removeClass('tool').addClass('log');
            //             $("#az_log > #az_transcript_area").show();
			
			$("body").live("closeALR",function(e){
				 // HIDE AR ELEMENTS IN DOM
	               // close down any other az_log areas
                $("#az_log > .az.inner").hide();
                self.tileMode.setUnActive();
                $("#autoreclog").css("z-index", "0");
			});
			
			$("body").live("deleteRecognizedShapes",{obj:self},self.deleteRSHandle);
			
			// Picks up shapes that were recognized in _recognize
            $("body").live("outputLines", {
                obj: self
            },
			// Callback for when user clicks Perform Line Recognition
            function(e, data) {
                // INSERT DATA
                if (!data) return;
                // send to engine
                // first go through and parse each data element
                var vd = [];
                

                // LOAD SCREEN
                // take away the load screen
                function removeScreen() {
                    $("#ALR_LOAD").remove();
                    $("#ALRBACK").remove();

                    $("body").unbind("closeALRLoad", removeScreen);
                };

                // create load screen to block users clicking on
                // DOM elements while data loads
                function loadScreen() {
                    // attach HTML
                    $('<div id="ALR_LOAD" class="white_content"><div id="ALRLOADDIALOG" class="dialog"><div class="header">Loading...</div><div class="body"><p>TILE is loading your data back into the main system.</p></div></div></div><div id="ALRBACK" class="black_overlay"></div>').appendTo("body");
                    // default CSS is 'display: none' - have to show elements
                    $("#ALR_LOAD").show();
                    $("#ALRBACK").show();
                    $("#ALRLOADDIALOG").show();
                    // setup listener for removing from DOM
                    $("body").bind("closeALRLoad", removeScreen);
                };

                // CAUSES MASSIVE LAG TIME IN MOST BROWSERS
                function addLine(line, shape) {
                    if (line && shape) {
						
                        TILE.engine.insertData(shape);
                        TILE.engine.linkObjects(line, shape);
                    }
                };

                // start loadScreen
                loadScreen();
                var done = false;
                
				var linecount=0;
                // go through array, make each related line
                // active, then attach shape
                for (var prop in data) {
					
                    // set up line var
                    var lineObj = {
                        id: data[prop].line.id,
                        type: 'lines',
                        jsonName: TILE.url,
                        obj: data[prop].line
                    };
					
					// set up shape
					var shapeObj={
						id:data[prop].shape.id,
						type:'shapes',
						jsonName:TILE.url,
						obj:data[prop].shape
					};
					
					linecount++;
					
                    setTimeout(function(line, shape) {
                        addLine(line, shape);
                        // if done, then trigger the load screen to be removed
                        
                    },15, lineObj, shapeObj);
					removeScreen();
					
                }

				 
				
            });
			
			$("body").live("deleteALRLines",function(e,shapes){
				
				for(var prop in shapes){
					TILE.engine.deleteObj(shapes[prop]);
				}
			
			});
			

        }
    },
	// locate shapes within the TILE JSON data and 
	// load into PreviewCanvas
	findShapesInJSON:function(json){
		var self=this;
		// only get JSON for this page
		var sIDs=[];
		$.each(json.lines, function (i, line) {
			if(line&&(line.shapes)){
				$.each(line.shapes, function (ix, id) {
					if($.inArray(sIDs, id)<0){
						sIDs.push(id);
					}
				});
				
			}
		});
		
		// go through IDs to find shapes
		var shapes=[];
		if(sIDs.length>0){
			$.each(json.shapes, function (i, shape) {
				if(shape&&($.inArray(shape.id, sIDs)>=0)){
					shapes.push(shape);
				}
			});
		}
		
		return shapes;
	},
	deleteRSHandle : function (e, shapes) {
		var self = e.data.obj;
		$.each(shapes, function (i, shape) {
			var o = shape;
			if(!o.jsonName){
				o = {
					id: o.id,
					type : 'shapes',
					jsonName : TILE.url,
					obj : shape
				};
			}
			TILE.engine.deleteObj(o);
			
		});
		
	},
    name: "AutoLineRecognizer"
};


// register the wrapper with TILE
TILE.engine.registerPlugin(AR);