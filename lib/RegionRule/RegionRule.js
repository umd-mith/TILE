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
