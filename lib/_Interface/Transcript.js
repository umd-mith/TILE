(function ($, R, _) {
	var rootNS = this;
	rootNS.Transcript = Transcript;
	function Transcript(args){
		/*
		 * args:
		 * 	text = newLine delimited text file
		 *  loc = element to receive transcript Editor 
		 */
		var self = this;
		
		this.lineArray = args.text;//{"text":(args.text||[]),"info":[],"shapes":[]};
		this.loc = $("#"+args.loc);
		this.infoBox = $("#"+args.infoBox);
		if(this.lineArray) this._drawText();
		this.curLine = null;
		//global bind for when a shape is drawn in VectorDrawer
		$("body").bind("shapeDrawn",{obj:this},this._shapeDrawnHandle);
		//global bind for when user clicks to delete a shape item in ActiveBox
		$("body").bind("deleteItem",{obj:this},this._deleteItemHandle);
	}
	Transcript.prototype={};
	$.extend(Transcript.prototype, {
		_drawText: function(){
			var self=this;
			for (var i = 0; i < this.lineArray.length; i++) {
				var randD=new Date(); 
				var uid = "TILE_Transcript_" + i;
			
				if(!this.lineArray[i]) continue;
				//this.lineArray[i]=eval("("+this.lineArray[i]+")");
				if (!(this.lineArray[i].shapes)){
					this.lineArray[i].shapes=[];
				}
				if(!(this.lineArray[i].info)){
					this.lineArray[i].info=[];
				}
				$("<div id='" + uid + "' class='line'>" + this.lineArray[i].text + "</div>").appendTo(self.loc).mouseover(function(e){
			
					$(this).addClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10); 
					
				}).mouseout(function(e){
					$(this).removeClass("trans_line_hover");
				}).mousedown(function(e){
					$(this).removeClass("trans_line_hover");
					var index = parseInt($(this).attr("id").substring($(this).attr("id").lastIndexOf("_")+1),10);
					if ($(this).hasClass("line_selected")){
						//line is being de-selected
						$(this).removeClass("line_selected");	
						self._lineDeSelected(index);
					} else{
						$(".line_selected").removeClass("line_selected");
						
						$(this).addClass("line_selected");
						 
					
						self._lineSelected(index);
					}
				});
			}
		},
		_addLines:function(data){
			var self=this;
			self.lineArray=data;
			self.loc.empty();
			self._drawText();
		},
		//called when shapeDrawn is triggered
		_shapeDrawnHandle:function(e,data){
			var self=e.data.obj;
			if(self.lineArray[self.curLine]==null){
				//delete shape - no line selected
				$("body:first").trigger("VD_REMOVESHAPE",[data.id]);
				return;
			}
			self.lineArray[self.curLine].shapes.push(data);
			self._lineSelected(self.curLine);
			//$("body:first").trigger("UpdateLine",JSON.stringify(this.lineArray[index]));
		},
		//called when a user clicks to delete an item in ActiveBox
		_deleteItemHandle:function(e,id){
			var self=e.data.obj;
			//first need to find the shape
 			if(!self.lineArray[self.curLine]){
				//we hopefully don't get here
				$("body:first").trigger("VD_REMOVESHAPE",[id]);
				
			}
			for(s in self.lineArray[self.curLine].shapes){
				if(self.lineArray[self.curLine].shapes[s].id==id){
					//found shape
					$("body:first").trigger("VD_REMOVESHAPE",[id]);
				}
			}
			
			
		},
		//called when a line object is selected
		//users can select on or multiple lines
		 _lineSelected:function(index){
			var self=this;
		 	//	vd.clearShapes();
				if(index!=self.curLine) {
					self.curLine=index;
					
					//clear all shapes
					$("body:first").trigger("clearShapes");
					//load any shapes from curLine
					if(self.lineArray[self.curLine].shapes){
						$("body:first").trigger("loadShapes",[self.lineArray[self.curLine].shapes]);
					}
				
				}
				$("body:first").trigger("TranscriptLineSelected",JSON.stringify(this.lineArray[index]));
			
		 			
				//-----

			//	vd.importShapes(JSON.stringify(this.lineArray[index].shapes));
		 },
		_lineDeSelected:function(index){
			var self=this;
			self.curLine=null;
			$("body:first").trigger("TranscriptLineSelected",[null]);
		}
	}
	);})(jQuery, Raphael, _);
