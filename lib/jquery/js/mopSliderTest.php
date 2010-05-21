<?php


?>

<html>
<head>
	
	<script type="text/javascript" src="jquery-1.3.2.min.js"></script> 
	<script type="text/javascript" src="jquery-ui-1.7.2.custom.min.js"></script>
	<script type="text/javascript" src="jquery.pngFix.pack.js"></script> 
	<script type="text/javascript" src="mopslider/mopSlider-2.5.js"></script> 
	<script type="text/javascript">
		$(function(){
			
			$("#scrollerlist").mopSlider({'w':700, 'h':172, 'sldW':500, 'btnW':200, 'indi':"MopSlider 2.5", 'shuffle':'n', 'type':'paper', 'auto':'n'});
		
			$("#clickMe").click(function(e){
			
				var css=$("#scrollerlist").children("div").attr('style');
				var left=parseInt($(".holder").css("left"),10)*-1;
				var el=$("<div class=\"scrollItem\">HI</div>");
				el.attr("style",css);
				el.click(function(e){
					alert($(this)+" clicked");
				});
				el.css('left',left+'px');
				$(".holder").append(el);
				
			});
		});
	</script>
	<style>
		.scrollItem{
			width:100px;
			height:100px;
			background-color:#FF0000;
		}
	</style>
	</head>
<body>
	<button id="clickMe">Click To Add Element</button>
	
	<div id="scroller">
		<div id="scrollerHandle" class="handle"><a href="#" class="open"><span class="button">Images</span></a></div>	
		
		<div id="scrollerContainer">
			<div id="scrollerlist">
				<div class="scrollItem">Stuff</div>
				</div>
			
			<div class="clear"></div>
		</div>
	</div>
	
	</body>

</html>