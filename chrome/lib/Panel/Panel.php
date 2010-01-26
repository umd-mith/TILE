<?php
/**
 * Used in Panel.js to initialize base HTML
 */

if(isset($_GET['id'])&&isset($_GET['title'])){
	$prefix=htmlspecialchars($_GET['id'],ENT_NOQUOTES, "UTF-8");
	$title=htmlspecialchars($_GET['title'],ENT_QUOTES, "UTF-8");
}
else{
	$prefix="Load file";
	$title="Enter image and XML/Text locations first (see sidebar to the left), then click Load";
}
?>

            <div id="<?php echo $prefix."_header" ?>" class="hd">
                        <div id="<?php echo $prefix."_quartoinfo" ?>" class="quartoInfo">
                            <span class="textLabelSpan"></span>
                            <a class="quartoInfoHeader"><?php echo stripslashes($title) ?></a>
                            <span id="<?php echo $prefix."_close" ?>" class="window_close" />
                        </div>
                        <div id="<?php echo $prefix."_controls" ?>" class="controls">
                                <div class="pageControls">

                                <a id="<?php echo $prefix."_pageBack" ?>" class="pageBack"><<</a>
 
                                </a>
                                <a id="<?php echo $prefix."_pageNext" ?>" class="pageNext">>></a>
                            	<a id="<?php echo $prefix."_pageLoad" ?>" class="pageLoad">Load</a>
							</div>
                            <div id="<?php echo $prefix."_zoomControls" ?>" class="zoomControls">
                                <span class="textLabelSpan">Zoom</span>
                                <a id="<?php echo $prefix."_zoomIn" ?>" class="zoomIn">+</a>
                                <a id="<?php echo $prefix."_zoomOut" ?>" class="zoomOut">-</a>
                            </div>	
							<div id="progressBarDiv" >
								<div id="progressBar" class="progressBar"></div>
								<div id="progressBarText" class="progressBarText"></div>
							</div>
							
                            <div class="clear"></div>
                 	</div>
            </div>
            <div id="<?php echo $prefix."_content" ?>" class="panelBody">
                <div id="<?php echo $prefix."_contentBody" ?>" class="panelBodyContents clearfix">
                        
                      
                        <div id="<?php echo $prefix."_mapdiv"?>" class="mapDiv">
                        
                        </div>
                        <div id="<?php echo $prefix."_pagetext"?>" class="leaf">
                            
                        </div>
                        
                        <div class="clear"></div>
                        
                 </div>
            </div>
            <div id="<?php echo $prefix."_footer" ?>" class="ft"></div>
         
		 
