/*
* mopSliderTimo 2.5.0
 * By Hiroki Miura (http://www.mopstudio.jp)
 * Copyright (c) 2009 mopStudio
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
 * November 17, 2009
 */
 
var autoS=[],indiS=[],mopSldWS=[],intervalS=[],itemMgnS=[],moveS=[];
var animS=[],preTurnS=[],turnS=[],nextMovS=[],nextMovBkS=[],nextNumS=[],nextNumBkS=[];
var sclNumS=[],sldNumS=[];
var posiS=[],posiBkS=[];
var chkNumS=[],chkNumBkS=[];
var mpSldMoS=[];
var boxWS=[],sldWS=[],btnWS=[];
var wchDgS=[];
var btnPastS=[],boxPastS=[],btnPosiS=[],boxPosiS=[],btnMvNumSS=[],boxMvNumSS=[]; 
var finalCountS=[];
var mpSldCount=0,mpSldNoS=[];
var itemNumS=[];
var sclMaxS=[];

jQuery.fn.extend({
	mopSlider:function(stt){
		var ua=navigator.userAgent,browser,os,ie67=false;
		var px="px"
		var btnPosi,boxPosi,btnPast,boxPast,wchDg="";
		var btnMvNum,btnMoveTo,boxMvNum,boxMoveTo;
		var timeCheck1,timeCheck2,dragCheck1,dragCheck2,finalTime1,finalTime2;
		var mpSldNm;
		var sclMax,sclNum,caseW,itemNum,sldNum,chkNum,movNum;
		var mpSldMo;
		var boxW,itemMgnAll;
		var finalCount=0;
		var indication=stt.indi
		var mopSldW=stt.w;
		var mopSldH=stt.h;
		var sldW=stt.sldW;
		var btnW=stt.btnW;
		var itemMgn=stt.itemMgn;
		var shuffle=stt.shuffle;
		var mpSldNo=stt.no;
		var mopSldTyp=stt.type;
		var auto=stt.auto;
		var move=stt.move;
		var interval=stt.interval;
		var anim,turn="go",preTurn="go";
		var posi,posiBk;
		var nextMov=[],nextMovBk=[];
		var nextNum=0,nextNumBk=0;
		var sclW=0,sclWbk=0;
		/*path to image*/
		var btnLeft=new Image();
		var btnLeftF=new Image();
		var btnRight=new Image();
		var btnRightF=new Image();
		var btnCenter=new Image();
		var btnChange=new Image();
		var btnChangeNn=new Image();
		var btnChangeF=new Image();
		var bkImg=new Image();
		var sldcLeftImg=new Image();
		var sldcRightImg=new Image();
		var sldBkLeft=new Image();
		var sldBkCenter=new Image();
		var sldBkRight=new Image();
		
		var mopSldSrc=function(mopSldTyp){
			if(mopSldTyp=="paper"){
				btnLeft.src="lib/jquery/js/mopslider/sliderBtnLtW.png";
				btnLeftF.src="lib/jquery/js/mopslider/sliderBtnLtW_f.png";
				btnRight.src="lib/jquery/js/mopslider/sliderBtnRtW.png";
				btnRightF.src="lib/jquery/js/mopslider/sliderBtnRtW_f.png";
				btnCenter.src="lib/jquery/js/mopslider/sliderBtnW.png";
				btnChange.src="lib/jquery/js/mopslider/sliderBkRtRtW.png";
				btnChangeNn.src="lib/jquery/js/mopslider/sliderBkRtRtNnW.png";
				btnChangeF.src="lib/jquery/js/mopslider/sliderBkRtRtW_f.png";
				bkImg.src="lib/jquery/js/mopslider/paperBk.gif";
				sldcLeftImg.src="lib/jquery/js/mopslider/sliderBkLtLtW.png";
				sldBkLeft.src="lib/jquery/js/mopslider/sliderBkLtW.png";
				sldBkCenter.src="lib/jquery/js/mopslider/sliderBkW.png";
				sldBkRight.src="lib/jquery/js/mopslider/sliderBkRtW.png";
			}else if(mopSldTyp=="black"){
				btnLeft.src="mopSlider/sliderBtnLt.png";
				btnLeftF.src="mopSlider/sliderBtnLt_f.png";
				btnRight.src="mopSlider/sliderBtnRt.png";
				btnRightF.src="mopSlider/sliderBtnRt_f.png";
				btnCenter.src="mopSlider/sliderBtn.png";
				btnChange.src="mopSlider/sliderBkRtRt.png";
				btnChangeNn.src="mopSlider/sliderBkRtRtNn.png";
				btnChangeF.src="mopSlider/sliderBkRtRt_f.png";
				bkImg.src="mopSlider/monoBk.gif";
				sldcLeftImg.src="mopSlider/sliderBkLtLt.png";
				sldBkLeft.src="mopSlider/sliderBkLt.png";
				sldBkCenter.src="mopSlider/sliderBk.png";
				sldBkRight.src="mopSlider/sliderBkRt.png";
			}
		}
		mopSldSrc(mopSldTyp);
		if(stt.auto==null){auto='n'};
		if(stt.move==null){move=1000};
		if(stt.interval==null){interval=2000};
		if(stt.itemMgn==null){itemMgn=20};
		if(stt.shuffle==null){shuffle='n'};
		mpSldCount+=1;
		var num=mpSldCount;
		mpSldNo=num;
		mpSldNoS.push(mpSldNo);
		mpSldNm="#mopSlider"+mpSldNo;
		var noSharp=mpSldNm.split("#")[1];
		$(mpSldNm).hide();
		var arr=jQuery.makeArray($(this).children());
		Array.prototype.shuffle = function() {
			var i = this.length;
			while(i){
				var j = Math.floor(Math.random()*i);
				var t = this[--i];
				this[i] = this[j];
				this[j] = t;
			};
			return this;
		};
		if((shuffle=='y')||(shuffle==1)){
			arr.shuffle();
			$(arr).appendTo(this);
		};
		if(ua.indexOf("Mac",0)>=0){os="mac";}else if(ua.indexOf("Win",0)>=0){os="win";};
		if(ua.indexOf("MSIE 6")>-1){browser="ie6";};
		if(ua.indexOf("MSIE 7")>-1){browser="ie7";};
		if((browser=="ie6")||(browser=="ie7")){ie67=true;};
		$(this).css({position:"absolute",overflow: "hidden",left: "0px",display: "block"});
		itemNum=$(this).children().length;
		itemNumS.push(itemNum);
		var allW=0;
		var num=0;
		for (i=1; i<(itemNum+1); i++){
			var itemW=eval($(this).children().eq(num).css("width").split("px")[0]);
			nextMov.push(itemW);
			var itemH=eval($(this).children().eq(num).css("height").split("px")[0]);
			var mgn=(mopSldH-itemH)/2;
			$(this).children().eq(num).css({marginTop:mgn+px});
			num+=1;
			allW+=itemW;
		};
		var lengthNum=nextMov.length;
		for (i=1; i<(nextMov.length); i++){
			var pushW=nextMov[lengthNum-1];
			nextMovBk.push(pushW);
			lengthNum-=1;
		};
		itemMgnAll=itemMgn*itemNum;
		boxW=allW+itemMgnAll+itemMgn;
		$(this).wrap('<div id="mopSlider"><div id="'+noSharp+'"><div class="holder"></div></div></div>');
		$(this).parent().after(
		'<div class="sliderCase">'+
			'<div class="sliderCaseLeft"></div>'+
			'<div class="sliderCaseRight"></div>'+
			'<div class="slider">'+
				'<div class="sldLeft"></div>'+
				'<div class="sldCenter"></div>'+
				'<div class="sldRight"></div>'+
				'<div class="sliderBtn">'+
					'<div class="sldBtnLeft"></div>'+
					'<div class="sldBtnCenter"><div class="indi"></div></div>'+
					'<div class="sldBtnRight"></div>'+
				'</div>'+
			'</div>'+
		'</div>'+
		'<div class="leftTop"><div class="leftTopIn"></div></div>'+
		'<div class="rightTop"><div class="rightTopIn"></div></div>'+
		'<div class="leftBottom"><div class="leftBottomIn"></div></div>'+
		'<div class="rightBottom"><div class="rightBottomIn"></div></div>'+
		'<div class="logo"><div class="logoIn"></div></div>'
		);
		$(mpSldNm+" .sliderCase").css({height:"22px",position:"relative",top:"0px"});
		$(mpSldNm+" .sliderCaseLeft").css({height:"22px",width:"25px",position:"absolute",top:"0px",left:"0px",backgroundImage:"url("+sldcLeftImg.src+")",backgroundRepeat:"no-repeat"});
		if((auto=="nn")||(auto=="yn")){
			$(mpSldNm+" .sliderCaseRight").css({height:"22px",width:"25px",position:"absolute",top:"0px",right:"0px",backgroundImage:"url("+btnChangeNn.src+")",cursor:"",backgroundRepeat:"no-repeat"});
		}else{
			$(mpSldNm+" .sliderCaseRight").css({height:"22px",width:"25px",position:"absolute",top:"0px",right:"0px",backgroundImage:"url("+btnChange.src+")",cursor:"pointer",backgroundRepeat:"no-repeat"});
		}
		$(mpSldNm+" .slider").css({height:"22px",position:"relative",top:"0px",left:"25px"});
		$(mpSldNm+" .sldLeft").css({left:"0px",position:"absolute",height:"22px",width:"20px",backgroundImage:"url("+sldBkLeft.src+")",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .sldCenter").css({left:"20px",width:sldW-40+px,position:"absolute",height:"22px",backgroundImage:"url("+sldBkCenter.src+")",backgroundRepeat:"repeat-x"});
		$(mpSldNm+" .sldRight").css({right:"0px",position:"absolute",height:"22px",width:"20px",backgroundImage:"url("+sldBkRight.src+")",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .sliderBtn").css({position:"absolute",height:"22px",left:"0px",cursor:"default"});
		$(mpSldNm+" .sldBtnLeft").css({left:"0px",position:"absolute",height:"22px",width:"20px",backgroundImage:"url("+btnLeft.src+")",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .sldBtnCenter").css({left:"20px",width:btnW-40+px,position:"absolute",height:"22px",backgroundImage:"url("+btnCenter.src+")",backgroundRepeat:"repeat-x"});
		$(mpSldNm+" .sldBtnRight").css({right:"0px",position:"absolute",height:"22px",width:"20px",backgroundImage:"url("+btnRight.src+")",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .indi").css({paddingTop:"5px",fontSize: "10px",textAlign:"center",fontFamily:"Arial, Helvetica, sans-serif",letterSpacing:"0.05em",color:"#2b313e"});
		$(mpSldNm).css({width:mopSldW+px,height:mopSldH+28+px});
		$(mpSldNm).css({position:"relative",overflow:"hidden",margin:"0 auto 0 auto",backgroundImage:"url("+bkImg.src+")"});
		if(mopSldTyp=="black"){
			$(mpSldNm).css({backgroundColor:"#484848",backgroundRepeat:"repeat-x",backgroundPosition:"bottom"});
		}
		$(mpSldNm+" .leftTop").css({height:"10px",width:"10px",position:"absolute",top:"0px",left:"0px"});
		$(mpSldNm+" .leftTopIn").css({height:"10px",width:"10px",backgroundImage:"url(mopSlider/sliderCrnLtTp.png)",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .rightTop").css({height:"10px",width:"10px",position:"absolute",top:"0px",right:"0px"});
		$(mpSldNm+" .rightTopIn").css({height:"10px",width:"10px",backgroundImage:"url(mopSlider/sliderCrnRtTp.png)",backgroundRepeat:"no-repeat"});
		$(mpSldNm+" .leftBottom").css({height:"10px",width:"10px",position:"absolute",bottom:"0px",left:"0px"});
		$(mpSldNm+" .leftBottomIn").css({height:"10px",width:"10px",backgroundImage:"url(mopSlider/sliderCrnLtBtm.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom"});
		$(mpSldNm+" .rightBottom").css({height:"10px",width:"10px",position:"absolute",bottom:"0px",right:"0px"});
		$(mpSldNm+" .rightBottomIn").css({height:"10px",width:"10px",backgroundImage:"url(mopSlider/sliderCrnRtBtm.png)",backgroundRepeat:"no-repeat",backgroundPosition:"bottom"});
		$(mpSldNm+" .logo").css({height:"50px",width:"80px",position:"absolute",top:"0px",left:"0px"});
		$(mpSldNm+" .logoIn").css({height:"50px",width:"80px",backgroundImage:"url(mopSlider/logo.png)",backgroundRepeat:"no-repeat"});
		if(os=="mac"){$(mpSldNm+" .indi").css({letterSpacing:"0.1em"})};/*foe mac*/
		sclMax=boxW-mopSldW;
		sclNum=sclMax*0.01;/*0 to100 (box)*/
		sldNum=(sldW-btnW)*0.01;/*0 to100 (slider)*/
		var lastLength,lastLengthBk;
		for (i=1; i<(nextMov.length+1); i++){
			var lenchCheck=i-1;
			sclW+=nextMov[lenchCheck]+itemMgn;
			if(sclW>=sclMax){
				lastLength=lenchCheck;
				break;
			}
		}
		for (i=1; i<(nextMovBk.length+1); i++){
			var lenchCheckBk=i-1;
			sclWbk+=nextMovBk[lenchCheckBk]+itemMgn;
			if(sclWbk>=sclMax){
				lastLengthBk=lenchCheckBk;
				break;
			}
		}
		var lastMov=eval(nextMov[lastLength]+itemMgn);
		var amari=sclW-sclMax;
		chkNum=sclMax-lastMov+amari;
		var lastMovBk=eval(nextMovBk[lastLengthBk]+itemMgn);
		var amariBk=sclWbk-sclMax;
		chkNumBk=lastMovBk-amariBk;
		nextMov[lastLength]-=amari;
		nextMovBk[lastLengthBk]-=amariBk;
		var holderWidth=(mopSldW+sclMax*2);
		$(mpSldNm+" .holder").css({width:holderWidth+"px",height:mopSldH+px,position:"relative",left:-(sclMax)+px,cursor:'move'});
		//$(mpSldNm+" .holder").css({width:holderWidth+"px",height:mopSldH+px,position:"relative",left:0+px,cursor:'move'});
		$(mpSldNm+" .holder").children().css({width:boxW+px,left:-(sclMax)+px});
		$(mpSldNm+" .holder").children().children().css({marginLeft:itemMgn+"px",float:"left",position:"relative"});
		$(mpSldNm+" .sliderCase").css({width:sldW+50+px});
		var sldCaseW=eval($(mpSldNm+" .sliderCase").css("width").split("px")[0]);
		var sliderLeftMgn=(mopSldW-sldCaseW)/2;
		$(mpSldNm+" .sliderCase").css({left:sliderLeftMgn+px});
		$(mpSldNm+" .slider").css({width:sldW+px});
		$(mpSldNm+" .sliderBtn").css({width:btnW+px});
		$(this).pngFix();
		$("#mopSlider .sliderCase,#mopSlider .leftTop,#mopSlider .rightTop").pngFix();
		$("#mopSlider .leftBottom,#mopSlider .rightBottom,#mopSlider .logo").pngFix();
		$(mpSldNm+" .indi").html(indication);
		if(auto=='y'){anim="y";}else if(auto=='n'){anim="n";}else if(auto=='nn'){anim="nn";}else if(auto=='yn'){anim="y";}
		animS.push(anim);
		autoS.push(auto);
		indiS.push(indication);
		nextMovS.push(nextMov); nextMovBkS.push(nextMovBk);
		preTurnS.push(preTurn); turnS.push(turn);
		sclNumS.push(sclNum); sldNumS.push(sldNum);
		chkNumS.push(chkNum); chkNumBkS.push(chkNumBk);
		mpSldMoS.push(mpSldMo);
		boxWS.push(boxW); mopSldWS.push(mopSldW);
		nextNumS.push(nextNum); nextNumBkS.push(nextNumBk);
		sldWS.push(sldW); btnWS.push(btnW);
		wchDgS.push(wchDg);
		btnPastS.push(btnPast); boxPastS.push(boxPast);
		btnPosiS.push(btnPosi); boxPosiS.push(boxPosi);
		finalCountS.push(finalCount);
		btnMvNumSS.push(finalCount); boxMvNumSS.push(finalCount);
		intervalS.push(interval);
		itemMgnS.push(itemMgn);
		sclMaxS.push(sclMax);
		moveS.push(move);
		$(mpSldNm).show();
		$(mpSldNm+" .sliderBtn").draggable({
			axis:"x",
			containment:"parent",
			start:function(){
				for (i=1; i<(mpSldNoS.length+1); i++){
					var j=i-1;
					if(mpSldNo==i){
						wchDgS[j]="btn";
					}
				}
				btnMvNum=0;
				dragCheck1=setInterval("mpSldF.dragCheckItv('"+mpSldNo+"','"+mpSldNm+"')",20);
				timeCheck1=setInterval("mpSldF.timeCheckItv('"+mpSldNo+"','"+mpSldNm+"')",50);
			},
			drag:function(){},
			stop:function(){
				clearInterval(dragCheck1);
				mpSldF.finalMove(mpSldNo,mpSldNm);
			}
		});
		$(mpSldNm+" .holder").children().draggable({
			axis:"x",
			containment:"parent",
			start:function(){
				for (i=1; i<(mpSldNoS.length+1); i++){
					var j=i-1;
					if(mpSldNo==i){
						wchDgS[j]="holder";
					}
				}
				boxMvNum=0;
				dragCheck1=setInterval("mpSldF.dragCheckItv('"+mpSldNo+"','"+mpSldNm+"')",20);
				timeCheck1=setInterval("mpSldF.timeCheckItv('"+mpSldNo+"','"+mpSldNm+"')",50);
			},
			drag:function(){},
			stop:function(){
				clearInterval(dragCheck1);
				mpSldF.finalMove(mpSldNo,mpSldNm);
			}
		});
		$("#mopSlider .sliderBtn").mousedown(
			function(){
				clearInterval(timeCheck1);
				clearInterval(finalTime1);
			}
		);
		$("#mopSlider .holder").children().mousedown(
			function(){
				clearInterval(timeCheck1);
				clearInterval(finalTime1);
			}
		);
		var movCheck=function(mpSldNo,mpSldNm){
			var j=mpSldNo-1;
			sldNum=sldNumS[j];
			var boxPosiPx=$(mpSldNm+" .holder").children().css("left");
			boxPosi=eval(boxPosiPx.split("px")[0]);
			var boxPosi0=-(boxPosi-sclMaxS[j]);
			var boxNum=-(boxPosi0/sclNumS[j]);
			if(((boxPosi0)>(chkNumS[j]))&&(preTurnS[j]=="go")){
				preTurnS[j]="bk";
			}else if(((boxPosi0)<(chkNumBkS[j]))&&(preTurnS[j]=="bk")){
				preTurnS[j]="go";
			};
			$(mpSldNm+" .sliderBtn").css({left:-(boxNum*sldNumS[j])+px});
		}
		var turnCheck=function(mpSldNo){
			var j=mpSldNo-1;
			if(preTurnS[j]=="bk"){
				turnS[j]="bk";
				mpSldF.goInit(mpSldNo);
			}else if(preTurnS[j]=="go"){
				turnS[j]="go";
				mpSldF.bkInit(mpSldNo);
			};
		}
		mpSldF={
			dragCheckItv:function(mpSldNo,mpSldNm){
				var sldNum100;
				var boxPosi0;
				var boxNum;
				var j=mpSldNo-1;
				btnPosiS[j]=eval($(mpSldNm+" .sliderBtn").css("left").split("px")[0]);
				boxPosiS[j]=eval($(mpSldNm+" .holder").children().css("left").split("px")[0]);
				sldNum100=btnPosiS[j]/sldNumS[j];
				boxPosi0=-(boxPosiS[j]-sclMaxS[j]);
				boxNum=-(boxPosi0/sclNumS[j]);
				if(wchDgS[j]=="btn"){
					$(mpSldNm+" .holder").children().css({left:Math.floor(-(sldNum100*sclNumS[j])+sclMaxS[j])+px});
				}else if(wchDgS[j]=="holder"){
					$(mpSldNm+" .sliderBtn").css({left:-(boxNum*sldNumS[j])+px});
				};
				$(".mopCheck").html(boxNum+" "+sldNum100);
			},
			move:function(mpSldNo,mpSldNm){
				var j=mpSldNo-1;
				if(itemNumS[j]!=1){
					turnCheck(mpSldNo);
				}
				if(animS[j]=="y"){
					if(turnS[j]=="go"){
						if(itemNumS[j]==1){
							turnS[j]="bk";
						}
						$(mpSldNm+" .holder").children().animate({left:-posiS[j]+sclMaxS[j]+px},
							{duration:moveS[j],easing:'swing',
								step:function(){movCheck(mpSldNo,mpSldNm)},
								complete:function(){
									if(itemNumS[j]!=1){
										nextNumS[j]+=1;
										posiS[j]+=((nextMovS[j][nextNumS[j]])+itemMgnS[j]);
									}
								}
							}	
						);
					}else if(turnS[j]=="bk"){
						if(itemNumS[j]==1){
							turnS[j]="go";
						}
						$(mpSldNm+" .holder").children().animate({left:posiBkS[j]+px},
							{duration:moveS[j],easing:'swing',
								step:function(){movCheck(mpSldNo,mpSldNm)},
								complete:function(){
									if(itemNumS[j]!=1){
										nextNumBkS[j]+=1;
										posiBkS[j]+=((nextMovBkS[j][nextNumBkS[j]])+itemMgnS[j]);
									}
								}
							}
						);
					}
				}
				mpSldMoS[j]=setTimeout("mpSldF.move('"+mpSldNo+"','"+mpSldNm+"')",intervalS[j]+moveS[j]);
			},
			goInit:function(mpSldNo){
				var j=mpSldNo-1;
				nextNumS[j]=0;
				posiS[j]=(nextMovS[j][nextNumS[j]]+itemMgnS[j]);
			},
			bkInit:function(mpSldNo){
				var j=mpSldNo-1;
				nextNumBkS[j]=0;
				if(itemNumS[j]!=1){
					posiBkS[j]=(nextMovBkS[j][nextNumBkS[j]]+itemMgnS[j]);
				}else{
					posiBkS[j]=(nextMovS[j][nextNumS[j]]+itemMgnS[j]);
				}
			},
			manualAct:function(mpSldNo,mpSldNm,mopSldTyp){
				$(mpSldNm+" .holder").children().stop();
				var j=mpSldNo-1;
				clearInterval(mpSldMoS[j]);
				animS[j]='n'
				$(mpSldNm+" .indi").html(indiS[j]);
				if(autoS[j]!='yn'){
					mopSldSrc(mopSldTyp);
					if(browser!="ie6"){
						$(mpSldNm+" .sldBtnLeft").css({backgroundImage:"url("+btnLeft.src+")"});
						$(mpSldNm+" .sldBtnRight").css({backgroundImage:"url("+btnRight.src+")"});
						$(mpSldNm+" .sliderCaseRight").css({backgroundImage:"url("+btnChange.src+")"});
					}
				}
				$(mpSldNm+" .holder").children().css({cursor:"move"});
			},
			autoAct:function(mpSldNo,mpSldNm,mopSldTyp,chkNum,chkNumBk){
				for (i=1; i<(mpSldNoS.length+1); i++){
					var j=i-1;
					if(mpSldNo==i){
						sclMax=boxWS[j]-mopSldWS[j];
						animS[j]='y';
						turnS[j]="go";
						clearInterval(mpSldMoS[j]);
					}
				}
				$(mpSldNm+" .holder").children().css({cursor:""});
				mpSldF.goInit(mpSldNo);
				mpSldF.bkInit(mpSldNo);
				mpSldF.auto(mpSldNo,mpSldNm,mopSldTyp);
				if(eval($(mpSldNm+" .sliderBtn").css("left").split("px")[0])<10){
					moveSS=100;
				}else{
					moveSS=moveS[j]
				}
				$(mpSldNm+" .holder").children().animate({left:sclMax+px},
					{duration:moveSS,easing:'swing',
						step:function(){
							movCheck(mpSldNo,mpSldNm,boxW,mopSldW);
						},
						complete:function(){
							for (i=1; i<(mpSldNoS.length+1); i++){
								var j=i-1;
								if(mpSldNo==i){
									mpSldMoS[j]=setTimeout("mpSldF.move('"+mpSldNo+"','"+mpSldNm+"')",intervalS[j]);
								}
							}
						}
					}
				);
			},
			auto:function(mpSldNo,mpSldNm,mopSldTyp){
				mopSldSrc(mopSldTyp);
				$(mpSldNm+" .indi").html("Auto");
				var j=mpSldNo-1;
				if(autoS[j]!="yn"){
					if(browser!="ie6"){
						$(mpSldNm+" .sldBtnLeft").css({backgroundImage:"url("+btnLeftF.src+")"});
						$(mpSldNm+" .sldBtnRight").css({backgroundImage:"url("+btnRightF.src+")"});
						$(mpSldNm+" .sliderCaseRight").css({backgroundImage:"url("+btnChangeF.src+")"});
					}
				}
			},
			timeCheckItv:function(mpSldNo,mpSldNm){
				var j=mpSldNo-1;
				btnPastS[j]=btnPosiS[j];
				boxPastS[j]=boxPosiS[j];
			},
			finalMove:function(mpSldNo,mpSldNm){
				var j=mpSldNo-1;
				finalCountS[j]=0;
				if((btnPosiS[j]!=undefined)&&(btnPastS[j]!=undefined)){
					btnMvNumSS[j]=btnPosiS[j]-btnPastS[j];
					boxMvNumSS[j]=boxPosiS[j]-boxPastS[j];
				}
				finalTime1=setInterval("mpSldF.finalTimeItv('"+mpSldNo+"','"+mpSldNm+"')",50);
			},
			finalTimeItv:function(mpSldNo,mpSldNm){
				var j=mpSldNo-1;
				finalCountS[j]+=1;
				if(finalCountS[j]==1){
					btnMvNum=btnMvNumSS[j];
					boxMvNum=boxMvNumSS[j];
					mpSldNmTemp=mpSldNm;
				}
				btnPosiS[j]=eval($(mpSldNmTemp+" .sliderBtn").css("left").split("px")[0]);
				boxPosiS[j]=eval($(mpSldNmTemp+" .holder").children().css("left").split("px")[0]);
				if(wchDgS[j]=="btn"){
					if((btnMvNum<0.1)&&(btnMvNum>-0.1)){
						btnMvNum=0;
					}else{
						if(browser=="ie6"){
							btnMvNum=btnMvNum/1.75;
						}else{
							btnMvNum=btnMvNum/1.5;
						}
					}
					btnMoveTo=btnMvNum+btnPosiS[j];
					if(btnMoveTo>(sldWS[j]-btnWS[j])){
						btnMoveTo=sldWS[j]-btnWS[j];
					}else if(btnMoveTo<0){
						btnMoveTo=0;
					};
					$(mpSldNmTemp+" .sliderBtn").css({left:btnMoveTo+px});
					btnPastS[j]=btnMoveTo;
					if(btnMvNum==0){
						clearInterval(finalTime1);
					}
					mpSldF.checkFinal(mpSldNo,mpSldNm);
				}
				else if(wchDgS[j]=="holder"){
					if((boxMvNum<1)&&(boxMvNum>-1)){
						boxMvNum=0;
					}else{
						if(browser=="ie6"){
							boxMvNum=boxMvNum/1.75;
						}else{
							boxMvNum=boxMvNum/1.5;
						}
					}
					boxMoveTo=boxMvNum+boxPosiS[j];
					if(boxMoveTo>sclMaxS[j]){
						boxMoveTo=sclMaxS[j];
					}else if(boxMoveTo<0){
						boxMoveTo=0;
					};
					$(mpSldNmTemp+" .holder").children().css({left:boxMoveTo+px});
					/*set boxPast*/
					boxPastS[j]=boxMoveTo;
					if(boxMvNum==0){
						clearInterval(finalTime1);
					}
					mpSldF.checkFinal(mpSldNo,mpSldNm);
				}
			},
			checkFinal:function(mpSldNo,mpSldNm){
				var sldNum100;
				var boxPosi0;
				var boxNum;
				var j=mpSldNo-1;
				btnPosiS[j]=eval($(mpSldNm+" .sliderBtn").css("left").split("px")[0]);
				boxPosiS[j]=eval($(mpSldNm+" .holder").children().css("left").split("px")[0]);
				sldNum100=btnPosiS[j]/sldNumS[j];
				boxPosi0=-(boxPosiS[j]-sclMaxS[j]);
				boxNum=-(boxPosi0/sclNumS[j]);
				if(wchDgS[j]=="btn"){
					$(mpSldNm+" .holder").children().css({left:Math.floor(-(sldNum100*sclNumS[j])+sclMaxS[j])+px});
				}else if(wchDgS[j]=="holder"){
					$(mpSldNm+" .sliderBtn").css({left:-(boxNum*sldNumS[j])+px});
				};
			}
		}
		/*end mpSldF*/
		$(mpSldNm+" .sliderCaseRight").click(
			function(){
				for (i=1; i<(mpSldNoS.length+1); i++){
					var j=i-1;
					if(mpSldNo==i){
						if(autoS[j]!="yn"){
							if(animS[j]=="y"){
								mpSldF.manualAct(mpSldNo,mpSldNm,mopSldTyp);
							}else if(animS[j]=="n"){
								mpSldF.autoAct(mpSldNo,mpSldNm,mopSldTyp,chkNum,chkNumBk);
								clearInterval(mpSldMoS[j]);
							}
						}
					}
				}
			}
		);
		var clickToManual=function(){
			for (i=1; i<(mpSldNoS.length+1); i++){
				var j=i-1;
				if(mpSldNo==i){
					if(animS[j]=="y"){
						mpSldF.manualAct(mpSldNo,mpSldNm,mopSldTyp);
					}
				}
			}
		}
		$(mpSldNm+" .holder").children().mousedown(function(){clickToManual();});
		$(mpSldNm+" .sliderBtn").mousedown(function(){clickToManual();});
		animGo=function(mpSldNo,mpSldNm,mopSldTyp){
			var j=mpSldNo-1;
			if(animS[j]=="y"){
				if(animS[j]=="y"){
					mpSldF.auto(mpSldNo,mpSldNm,mopSldTyp);
				}
					mpSldMoS[j]=setTimeout("mpSldF.move('"+mpSldNo+"','"+mpSldNm+"')",intervalS[j]);
			}else if(animS[j]=="n"){
				mpSldF.manualAct(mpSldNo,mpSldNm,mopSldTyp);
			}
		}
		setTimeout("animGo('"+mpSldNo+"','"+mpSldNm+"','"+mopSldTyp+"')",500);
		mpSldF.goInit(mpSldNo);
		mpSldF.bkInit(mpSldNo);
	}
});