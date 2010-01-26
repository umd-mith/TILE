<?php
if($handle=opendir("../../../XML")){
	while($f=readdir($handle)){
		echo (!(is_dir($f)))?$f."\n":"";
	}
}


?>
