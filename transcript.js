(function ($, R, _) {
	var rootNS = this;
	rootNS.Transcript = Transcript;
	function Transcript(args){
	/*
	 * args:
	 * 	text = newLine delimited text file
	 *  loc = element to receive transcript Editor 
	 */
		self = this;
		
		this.lineArray = args.text;
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		this._drawText();
		this.curLine = null;
	}
	$.extend(Transcript.prototype, {
	
	
	
		_drawText: function(){
		
			for (var i = 0; i < this.lineArray.length; i++) {
				var randD=new Date(); 
				var uid = "TILE_Transcript_" + i;
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo(self.loc).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1)); 
					//self._lineSelected(index);
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					if ($(this).hasClass("line_selected")){
						$(this).removeClass("line_selected");	
						self.curLine = null;
					}
					else{
						$(".line_selected").removeClass("line_selected");
						
						$(this).addClass("line_selected");
						var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1)); 
						self.curLine=index;
						self._lineSelected(index);
					}
				});
			}
			$("body").bind("shapeDrawn",function(e,data){
				alert(self.curLine);
				if (self.curLine!=null){
					alert("added");
					self.lineArray[self.curLine].shapes.push(data);
				}
				
			});
			
		},
		
	 _lineSelected:function(index){
	 		vd.clearShapes();
	 		$("body").trigger("TranscriptLineSelected",JSON.stringify(this.lineArray[index]));
			this.curLine = index;		
			//-----

			vd.importShapes(JSON.stringify(this.lineArray[index].shapes));
	 }
	}
		);
	})(jQuery, Raphael, _);
	