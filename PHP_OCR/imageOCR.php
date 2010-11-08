<?php
ini_set("memory_limit","64M");
class imageOCR{
	private $image;
	private $threshold=4000000;
	private $top=220;
	private $left=300;
	private $bottom=1800;
	private $right=1450;
	private $minDotsPerRow=25;
	private $minLineHeight=20;
	private $numCols=1;
	private $numRows=1;
	private $width=0;
	private $height=0;
	private $scalewidth=null;
	private $scaleheight=null;
	public function showImage(){
		imagejpeg($this->image);
	}
	public function configureOCR($args){
		$this->threshold=isset($args['thresh'])?$args['thresh']:$this->threshold;
		$this->top=isset($args['top'])?$args['top']:$this->top;
		$this->left=isset($args['left'])?$args['left']:$this->left;
		$this->bottom=isset($args['bottom'])?$args['bottom']:$this->bottom;
		$this->right=isset($args['right'])?$args['right']:$this->right;
		$this->minDotsPerRow=isset($args['mindots'])?$args['mindots']:$this->minDotsPerRow;
		$this->minLineHeight=isset($args['minline'])?$args['minline']:$this->minLineHeight;
		$this->numCols=isset($args['cols'])?$args['cols']:$this->numCols;
		$this->numRows=isset($args['rows'])?$args['rows']:$this->numRows;
		$this->scalewidth=isset($args['scalewidth'])?$args['scalewidth']:null;
		$this->scaleheight=isset($args['scaleheight'])?$args['scaleheight']:null;
	}
	
	public function displayLines(){
		if($this->image){
			
			$this->change_color();
			
			$lines=$this->getLines();
			$scale=(isset($this->scalewidth)&&isset($this->scaleheight))?true:false;
			for($i=0;$i<count($lines);$i++){
				$val=($scale)?(($lines[$i]/$this->height)*$this->scaleheight):$lines[$i];
				
				echo ($i<(count($lines)-1))?$val."%":$val;
			}
		}
	}
	
	protected function testColor(){
		header("Content-Type: image/png");
		imagepng($this->image);
		imagedestroy($this->image);	
	}
	
	public function close(){
		//destroy image and all variables
		imagedestroy($this->image);
		$this->threshold=null;
		$this->top=null;
		$this->left=null;
		$this->bottom=null;
		$this->right=null;
		$this->minDotsPerRow=null;
		$this->minLineHeight=null;
		$this->numCols=null;
		$this->numRows=null;
		$this->width=null;
		$this->height=null;
	}
	public function LoadImg($imgname,$thresh,$region){
		 //get image dimensions
		$this->threshold = $thresh; 
		$this->top=$region["top"];
		$this->left=$region["left"];
		$this->right=$region["right"];
		$this->bottom=$region["bottom"];
		$info=getimagesize($imgname);
		$this->mime=$info['mime'];
		$this->width=$info[0];
		$this->height=$info[1];
		
		//calculate necessary memory
		/*
$required_mem=Round($this->width*$this->height*$info['bits'])+100000;
		$new_limit=memory_get_usage()+$required_mem;
		
*/
		/* Attempt to open */
		switch($this->mime){
			case 'image/png':
				$this->image = imagecreatefrompng($imgname);
				break;
			case 'image/jpeg':
				$this->image=imagecreatefromjpeg($imgname);
				break;
			case 'image/bmp':
				$this->image=imagecreatefromwbmp($imgname);
				break;
			case 'image/gif':
				$this->image=imagecreatefromgif($imgname);
				break;
		}
	
	    if (!$this->image) { /* See if it failed */
	        $this->image  = imagecreatetruecolor(150, 30); /* Create a black image */
	        $bgc = imagecolorallocate($this->image, 255, 255, 255);
	        $tc  = imagecolorallocate($this->image, 0, 0, 0);
	        imagefilledrectangle($this->image, 0, 0, 150, 30, $bgc);
	        /* Output an errmsg */
	        imagestring($this->image, 1, 5, 5, "Error loading $imgname", $tc);
	    }
	  
		
	}	
	
	public function change_color()
		{
			
			$red = hexdec(substr($this->threshold,0,2));
			$green = hexdec(substr($this->threshold,2,2));
			$blue = hexdec(substr($this->threshold,4,2));
			$this->threshold=imagecolorexact($this->image,$red,$green,$blue);
			
		    $image_width = imagesx($this->image);
		    $image_height = imagesy($this->image);
		    // iterate through x axis
			$lastpixel = 0;
			$inLine = 0;
		    $hrlines =  array();
			$hrlines[] = $this->top;
			if(isset($this->scalewidth)&&isset($this->scaleheight)){
				$n=($this->top/$this->scaleheight)*$this->height;
				$this->top=$n;
				$n=($this->bottom/$this->scaleheight)*$this->height;
				$this->bottom=$n;
				$n=($this->left/$this->scalewidth)*$this->width;
				$this->left=$n;
				$n=($this->right/$this->scalewidth)*$this->width;
				$this->right=$n;
				if($this->bottom>$this->height) $this->bottom=$this->height;
				if($this->top<0) $this->top=0;
				if($this->right>$this->width) $this->right=$this->width;
				if($this->left<0) $this->left=0;
			}
			
			//echo (($this->bottom/$this->scaleheight)*$this->height)."<br/><br/>";
			//echo $this->scaleheight."<br/>".$this->scalewidth."<br/>";
			//echo $this->height."  ".$this->width."<br/>".$this->top."<br/>".$this->bottom."<br/><br/>".$this->left."<br/>".$this->right."<br/><br/>";
			
			
		for ($y = $this->top; $y < $this->bottom; $y++) {
				$blackdots = 0;
		        // iterate through y axis
		        for ($x = $this->left; $x < $this->right; $x++) {
		            // look at current pixel
		           $pixel_color = imagecolorat($this->image, $x, $y);
					
					// test threshold 8500000
		            if (($pixel_color <= $this->threshold) && ($pixel_color >= 0)) {
		      			imagesetpixel($this->image, $x, $y, imagecolorexact($this->image,0,0,0));
		            }
					else{
						imagesetpixel($this->image, $x, $y, imagecolorexact($this->image,255,255,255));
					}
					
		        }	
		    }


			
			
			
			//return $image;
		}
	private function getLines(){
		$image_width = imagesx($this->image);
	    $image_height = imagesy($this->image);
		$width = $this->right-$this->left;
		$boxes = array();
		
	    // iterate through x axis
		$lastpixel = 0;
		$inLine = 0;
		
	    $hrlines =  array();
		$hrlines[] = $this->top;
		for ($y = $this->top; $y < $this->bottom; $y++) {
			$blackdots = 0;
		
		 
	        // iterate through y axis
	        for ($x = $this->left; $x < $this->right; $x++) {
	            // look at current pixel
	            $pixel_color = imagecolorat($this->image, $x, $y);
				// test threshold 8500000
	            if ($pixel_color == 0) {
	               $blackdots = $blackdots+1;
	            }
	        }
			$avg = $blackdots/$this->width;
			//$this->minDotsPerRow = 25;
			//echo "*$avg*\n";
			// line space usually 25
			if (($inLine==0)&&($blackdots>=$this->minDotsPerRow)){
					
				$inLine = 1;
			}
			else if (($inLine==1)&&($blackdots<$this->minDotsPerRow)){
	
				$lastHr =count($hrlines) - 1;	
				if (($y-$hrlines[$lastHr])>$this->minLineHeight){
					imageline($this->image,$this->left,$y,$this->right,$y,0);
					$hrlines[]=$y;
					$inLine = 0;
				}
			}
	    }
		return $hrlines;
	}
	
	private function getWords($image,$hrlines,$left,$right,$colsPerSpace,$minDotsPerCol, $ratioW, $ratioH, $getOrgL, $getOrgT){
		$boxes =array();
		for ($i=1;$i<count($hrlines);$i++){
			$inWord = 0;
			$blanklines=0;
			$vtlines = array();
			$vtlines[] = $this->left;
			
			for ($x = $this->left; $x < $this->right; $x++) {
				$blackdots = 0;	
				for($y=$hrlines[($i-1)];$y<$hrlines[$i];$y++){
				
		     	$pixel_color = imagecolorat($this->image, $x, $y);
	            		  if ($pixel_color == 0) {
	              			 $blackdots = $blackdots+1;
							 $lastBlackDot = $x;
	            		}
				}
			
				if ($blackdots<$this->minDotsPerCol){
					$blanklines = $blanklines+1;
					//colsPerSpace originially 5
					if (($inWord==1)&&($blanklines>$colsPerSpace)){
						
						imageline($this->image,$x,$hrlines[($i-1)],$x,$hrlines[$i],0);
						$vtlines[]=$x;
						$blanklines = 0;
						$inWord = 0;
					}
				
				}
				else{
					$inWord =1;
					$blanklines=0;
				}
						}
			for ($j=1;$j<count($vtlines);$j++){
				$box = array((($vtlines[($j-1)]/$ratioH)-$getOrgL),(($hrlines[($i-1)]/$ratioW)-$getOrgT),($vtlines[$j]/$ratioH),($hrlines[$i]/$ratioW));
				
				$boxes[] = $box;
				
			}
				}
		
		return $boxes;
	}
}






?>