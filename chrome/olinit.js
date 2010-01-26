function olinit(){

	var panel = new OLPanel({
		url:"chrome/lib/Panel/Panel.php",
		imgurl:"ham-1603-22275x-bli-c01-011.png",
		locid:'page',
		title: "Enter image and XML/Text locations first (see sidebar to the left), then click Load",

	});
}
$(document).ready(olinit);
