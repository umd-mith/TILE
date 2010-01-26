/**
 * Loads XML 
 * 
 * Files MUST be: TEI-XML compliant
 * 
 * @param {Object} args
 */

var loadXML=function(args){
	this.file=args.file;
	this.imgprefix=args.imgprefix;
	this.surfaces=[];
	this.pages=[];
	this.words=[];
	this.xml=null;
	this.pbtags=null;
	this.div2tags=null;
}
loadXML.prototype={
	startNewFile:function(file){
		this.file=file;
		this.pages=[];
		this.words=[];
		this.xml=null;
	},
	getPages:function(){
		this.xml=$.ajax({
			url:this.file,
			dataType:"xml",
			async:false
		}).responseXML;
		var regex=new RegExp('[.xml]+');
		if(regex.exec(this.file)){
			this.readTEI();
		}
		return this.pages;
	},
	readTEI:function(){
		//crawl through XML and find pages from
		//TEI surface tags
		
		if (this.xml) {
	
			this.surfaces = this.xml.getElementsByTagName("surface");
			for (p = 0; p < this.surfaces.length; p++) {
				var page = this.surfaces.item(p);
				if (page) {
					var id = page.getAttribute("xml:id");
					var name = page.getElementsByTagName("desc").item(0).firstChild.nodeValue
					
					var imgurl = page.getElementsByTagName("graphic").item(0).getAttribute("url");
				
					url = this.imgprefix + imgurl;
					url =url.replace(/.tiff/g,".jpg");
						
					this.pages[this.pages.length] = {
						id: id,
						//url: this.imgprefix+imgurl,
						url: url,
						index: p,
						name: name
					};
					
				}
			}
		}
	},
	
	outputPages:function(){
		
	},
	getAllTextNodes:function(){
		
	},
	getWords:function(type,pagenum){
		switch (type.toLowerCase()) {
			case 'tei':
				var textList=[];
				$(this.xml).find('sp').each(function(){
					var ret=$(this).textNodes();
					textList.push(ret);
				});
				//alert('textlist: '+textList.length);
				for(i=0;i<textList.length;i++){
					var el=textList[i];
					if (el.length > 0) {
						for (x = 0; x < el.length; x++) {
							var n=el[x];
							if (n.text()) {
								this.words.push(n.text());
							} else if(n.nodeValue){
								this.words.push(n.nodeValue);
							}
						}
					}
				}
				
				break;
		}
		return this.words;
	},
	getWords_Old:function(type,pagenum){
		this.words=[]; //reset
		switch(type.toLowerCase()){
			case 'tei':	
				if(!this.pbtags) this.getTEIPb();
				if(!this.div2tags) this.getTEIDiv();
				var tags=null;
				//get divs for this page
				divs=this.getTEIPageSegment(pagenum);
				
				for(x=0;x<divs.length;x++){
					var pbel=divs[x];
					var id=pbel.getAttribute('xml:id');
					//get JQ element
					
					var tnodes=divjq.textNodes();
					//alert(tnodes.length);
					/*if(pbel.v){
						var vnodes=pbel.v.childNodes;
						//iteratively go through each node and any text nodes in there
						for(i=0;i<vnodes.length;i++){
							var el=vnodes.item(i);
							setTimeout(function(obj,el){
								obj.findTEIKids(el);	
							},1,this,el);
						}
						vnodes=pbel.r.childNodes;
						//iteratively go through each node and any text nodes in there
						for(i=0;i<vnodes.length;i++){
							var el=vnodes.item(i);
							setTimeout(function(obj,el){
								obj.findTEIKids(el);	
							},1,this,el);
						}
					} else {
						var pbkids=pbel.childNodes;
						
						//iteratively go through each node and any text nodes in there
						for(i=0;i<pbkids.length;i++){
							var el=pbkids.item(i);
							setTimeout(function(obj,el){
								obj.findTEIKids(el);	
							},1,this,el);
						}
					}*/
				}
				
				break;
		}
		
		return this.words;
	},
	getTEIPb:function(){
		if(this.xml){
			this.pbtags=[];
			var pbtags=this.xml.getElementsByTagName("pb");
			for(p=0;p<pbtags.length;p++){
				var el=pbtags.item(p);
				var id=el.getAttribute('xml:id');
				if(id.lastIndexOf('a')>9){
					el={v:pbtags.item(p),r:pbtags.item((p+1))};
					p++;
				} 
				this.pbtags.push(el);
			}
		}
	},
	getTEIDiv:function(){
		/**get all div2 elements from the document**/
		if(this.xml){
			this.div2tags=[];
			this.div2tags=this.xml.getElementsByTagName("div2");
		}
	},
	getTEIPageSegment:function(pagenum){
		//output: array object with div tags
		//that include the pb tags for the pages
		//desired
		if(this.div2tags&&this.pbtags){
			var pb=this.pbtags[pagenum];
			var maindivs=[];
			if(pb.v){
				var idv=pb.v.getAttribute('xml:id');
				var idr=pb.r.getAttribute('xml:id');
				var include,stop=false;
				for(d=0;d<this.div2tags.length;d++){
					//find div with both tags in it
					// or find set of divs
					var div=this.div2tags.item(d);
					var dpb=div.getElementsByTagName("pb");
					if(dpb.length>0){
						for(x=0;x<dpb.length;x++){
							if(dpb.item(x).getAttribute("xml:id")==idv){
								include=true;
							} else if(dpb.item(x).getAttribute("xml:id")==idr){
								maindivs.push(div);
								//alert("returning result (pagesegment):  "+idv+", "+idr+", pagenum: "+pagenum+", "+maindivs.length);
			
								stop=true;
								break;
							} 
						}
					}
					if(stop) break;
					if(include){
						maindivs.push(div);
					}
					
				}
			} else {
				var id=pb.getAttribute('xml:id');
				var include,stop=false;
				for(d=0;d<this.div2tags.length;d++){
					var div=this.div2tags.item(d);
					var dpb=div.getElementsByTagName("pb");
					if(dpb.length>0){
						for(x=0;x<dpb.length;x++){
							if(dpb.item(x).getAttribute("xml:id")==idv){
								
								include=true;
							} else if(dpb.item(x).getAttribute("xml:id")==idr){
								maindivs.push(div);
								//alert("returning result (pagesegment):  "+id+", "+pagenum+", "+maindivs.length);
			
								stop=true;
								break;
							} 
						}
					}
					if(stop) break;
					if(include){
						maindivs.push(div);
					}
				
				}
				
			}
			return maindivs;
		}
	},
	findTEIKids:function(el){
		if(el.childNodes&&(el.nodeName!="#text")){
			for(i=0;i<el.childNodes.length;i++){
				var kid=el.childNodes.item(i);
				setTimeout(function(obj,el){
					obj.findTEIKids(el);
				},1,this,kid);
			}
			
		} else if(el.nodeName=="#text"){
			if(el.nodeValue!="") this.words.push(el.nodeValue);
			if(el.childNodes.length);
			if(el.childNodes){
				for(c=0;c<el.childNodes.length;c++){
					this.words.push(el.childNodes[c].nodeValue);
					
				}
			}
			
		}
	}
	
}
