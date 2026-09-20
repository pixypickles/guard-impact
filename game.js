document.addEventListener("contextmenu",e=>e.preventDefault(),{passive:false});
document.addEventListener("selectstart",e=>e.preventDefault(),{passive:false});
document.addEventListener("dragstart",e=>e.preventDefault(),{passive:false});
const c=document.querySelector("#game"),x=c.getContext("2d");
const $=s=>document.querySelector(s); let W,H,last=0,msgT=1.5;
function resize(){W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);W=innerWidth;H=innerHeight} addEventListener("resize",resize);resize();
const P={x:.18,hp:100,m:0,guard:"mid",aim:"mid",atk:null,face:1,step:0,flash:0}, E={x:.82,hp:100,m:0,guard:"mid",aim:"mid",atk:null,face:-1,step:0,flash:0};
let over=false, hold={small:0,heavy:0}, taps={left:0,right:0};
function say(t){$("#msg").textContent=t;msgT=1.1}
function attack(a,type,charged=false){
 if(over||a.atk)return;
 let special=charged&&a.m>=100;
 if(special)a.m=0;
 a.atk={t:0,type,special,hit:false,height:a.aim||a.guard||"mid"};
}
function releaseAttack(type){let d=performance.now()-(hold[type]||performance.now());hold[type]=0;attack(P,type,d>380)}
function guardSet(a,g){a.guard=g}
function step(a,dir){a.step=dir*.055}
function input(act,down){
 if(over&&down){reset();return}
 if(act==="up"&&down){P.aim="high";guardSet(P,"high");P.just=.11}
 if(act==="down"&&down){P.aim="mid";guardSet(P,"mid");P.just=.11}
 if((act==="left"||act==="right")&&down){let now=performance.now(); if(now-taps[act]<280)step(P,act==="left"?-1:1);taps[act]=now}
 if((act==="small"||act==="heavy")){if(down)hold[act]=performance.now();else releaseAttack(act)}
}
document.querySelectorAll("button").forEach(b=>{
 let a=b.dataset.act;
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add("pressed");input(a,true)});
 b.addEventListener("pointerup",e=>{b.classList.remove("pressed");input(a,false)});
 b.addEventListener("pointercancel",e=>{b.classList.remove("pressed");if(a==="small"||a==="heavy")hold[a]=0});
});
addEventListener("keydown",e=>{if(e.repeat)return;let m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down",z:"guard",x:"small",c:"heavy"};if(m[e.key])input(m[e.key],true)});
addEventListener("keyup",e=>{let m={ArrowLeft:"left",ArrowRight:"right",ArrowUp:"up",ArrowDown:"down",z:"guard",x:"small",c:"heavy"};if(m[e.key])input(m[e.key],false)});
function resolve(a,b){
 let q=a.atk;if(!q||q.hit)return;
 let impact=q.special?.58:q.type==="small"?.28:.42;
 if(q.t<impact)return;q.hit=true;
 let dist=Math.abs(a.x-b.x), range=q.special?.34:q.type==="small"?.25:.29;
 if(dist>range)return;
 let nowGuard=b.guard===q.height;
 let just=(b.just||0)>.0;
 if(q.special){
   if(just){b.m=Math.min(100,b.m+30);say("JUST GUARD!");b.flash=1;return}
   b.hp-=32;say("必殺！");
 }else if(nowGuard){
   b.m=Math.min(100,b.m+(q.type==="small"?13:22));b.flash=.6;say("ガード");
 }else{
   b.hp-=q.type==="small"?9:16;b.flash=1;say(q.height==="high"?"上段 HIT":"中段 HIT");
 }
 if(b.hp<=0){b.hp=0;over=true;say(a===P?"勝利！ TAPで再戦":"敗北… TAPで再戦")}
}
let cpu=0;
function ai(dt){
 cpu-=dt;if(cpu>0||over)return;cpu=.22+Math.random()*.5;
 let d=Math.abs(P.x-E.x);
 if(P.atk&&Math.random()<.68){E.guard=P.atk.height;if(P.atk.special&&Math.random()<.42)E.just=.11}
 else if(d>.43)step(E,-1);
 else if(d<.36)step(E,1); else if(Math.random()<.16)step(E,Math.random()<.5?-1:1);
 else {let charged=E.m>=100&&Math.random()<.38;E.aim=Math.random()<.5?"high":"mid";attack(E,Math.random()<.58?"small":"heavy",charged)}
}
function update(a,dt){
 if(a.step){a.x+=a.step;a.step*=.72;if(Math.abs(a.step)<.002)a.step=0}
 a.x=Math.max(.12,Math.min(.88,a.x));a.flash=Math.max(0,a.flash-dt*3);a.just=Math.max(0,(a.just||0)-dt);
 if(a.atk){a.atk.t+=dt;let dur=a.atk.special?.95:a.atk.type==="small"?.55:.75;if(a.atk.t>dur)a.atk=null}
}
function drawFighter(a,enemy=false){
 let px=a.x*W, ground=H*.60, s=Math.min(W,H)/520;
 x.save();x.translate(px,ground);x.scale(a.face*s,s);
 if(a.flash)x.globalAlpha=.55+.45*Math.sin(performance.now()/35);
 // shadow
 x.fillStyle="#21181088";x.beginPath();x.ellipse(0,10,58,13,0,0,Math.PI*2);x.fill();
 // legs / boots
 x.fillStyle=enemy?"#3e342b":"#2d3337";x.fillRect(-22,-65,15,67);x.fillRect(8,-65,15,67);
 // lamellar skirt
 x.fillStyle=enemy?"#8a6233":"#6f2e27";for(let i=-2;i<=2;i++)x.fillRect(i*13-6,-105,11,48);
 // torso armor
 x.fillStyle=enemy?"#6d593d":"#38464b";x.beginPath();x.moveTo(-38,-170);x.lineTo(35,-170);x.lineTo(29,-95);x.lineTo(-30,-95);x.closePath();x.fill();
 x.strokeStyle="#c29b57";x.lineWidth=4;for(let yy=-158;yy<-105;yy+=14){x.beginPath();x.moveTo(-31,yy);x.lineTo(29,yy);x.stroke()}
 // shoulder plates
 x.fillStyle=enemy?"#6d593d":"#303a3e";x.fillRect(-53,-165,22,42);x.fillRect(31,-165,22,42);
 // head + helmet
 x.fillStyle="#c79467";x.beginPath();x.arc(0,-194,19,0,Math.PI*2);x.fill();x.fillStyle="#211810";x.beginPath();x.arc(10,-196,2.7,0,Math.PI*2);x.fill();
 x.fillStyle=enemy?"#665033":"#2d3639";x.beginPath();x.arc(0,-202,24,Math.PI,Math.PI*2);x.fill();x.fillRect(-24,-203,48,10);
 x.strokeStyle="#a82f25";x.lineWidth=7;x.beginPath();x.moveTo(0,-224);x.lineTo(-7,-250);x.stroke();
 // sword arm
 // 肩を支点にする。小攻撃の中段は突き、大攻撃の中段は肩から円弧を描く横薙ぎ。
 let atk=a.atk;
 const shoulderX=30, shoulderY=-150;
 let handX=shoulderX+34, handY=shoulderY+8, bladeAng=.20;

 if(atk){
   let impact=atk.special?.58:atk.type==="small"?.28:.42;
   let k=Math.min(1,atk.t/impact);
   let swing=1-Math.pow(1-k,2);

   if(atk.height==="high"){
     // 上段: 肩を支点に頭上へ振りかぶって振り下ろす
     let armAng=-1.35 + swing*1.55;
     let armLen=46;
     handX=shoulderX+Math.cos(armAng)*armLen;
     handY=shoulderY+Math.sin(armAng)*armLen;
     bladeAng=armAng;
   }else if(atk.type==="small"){
     // 中段・小: 肩から腕を伸ばす素早い突き
     let ext=30+swing*34;
     handX=shoulderX+ext;
     handY=shoulderY+18;
     bladeAng=0;
   }else{
     // 中段・大 / 必殺:
     // 肩を中心に腕全体を回し、剣先が円弧を描く横薙ぎ。
     // 横から見た2D表現なので、前半は腕を引き、そこから前へ大きく振り抜く。
     let armAng=-2.55 + swing*2.65;
     let armLen=50;
     handX=shoulderX+Math.cos(armAng)*armLen;
     handY=shoulderY+Math.sin(armAng)*armLen;
     // 剣は前腕の延長線上。突きのような平行移動にはしない。
     bladeAng=armAng;
   }
 }

 // upper arm: always connects torso shoulder to the hand
 x.strokeStyle="#b98b64";x.lineWidth=12;x.lineCap="round";
 x.beginPath();x.moveTo(shoulderX,shoulderY);x.lineTo(handX,handY);x.stroke();

 // hand + sword
 x.save();x.translate(handX,handY);x.rotate(bladeAng);
 x.strokeStyle="#b98b64";x.lineWidth=11;x.beginPath();x.moveTo(-8,0);x.lineTo(10,0);x.stroke();
 x.strokeStyle="#8d6b39";x.lineWidth=10;x.beginPath();x.moveTo(10,-10);x.lineTo(10,10);x.stroke();
 x.strokeStyle="#e5dfca";x.lineWidth=7;x.beginPath();x.moveTo(14,0);x.lineTo(92,0);x.stroke();
 x.restore();
 x.lineCap="butt";
 // shield
 let sy=a.guard==="high"?-182:-126;x.fillStyle=enemy?"#7a5734":"#7a3028";x.strokeStyle="#d0a55d";x.lineWidth=5;x.beginPath();x.ellipse(-32,sy,31,43,0,0,Math.PI*2);x.fill();x.stroke();x.beginPath();x.arc(-32,sy,8,0,Math.PI*2);x.fillStyle="#d0a55d";x.fill();
 x.restore();
}
function loop(t){
 let dt=Math.min(.033,(t-last)/1000||0);last=t;update(P,dt);update(E,dt);ai(dt);resolve(P,E);resolve(E,P);
 if(msgT>0){msgT-=dt;if(msgT<=0&&!over)$("#msg").textContent=""}
 x.clearRect(0,0,W,H);
 let g=x.createLinearGradient(0,0,0,H*.62);g.addColorStop(0,"#8e7650");g.addColorStop(1,"#c3a36b");x.fillStyle=g;x.fillRect(0,0,W,H*.62);
 x.fillStyle="#57452f";x.fillRect(0,H*.58,W,H*.42);
 // distant battlements
 x.fillStyle="#66543c";for(let i=0;i<W;i+=90){x.fillRect(i,H*.43,70,H*.15);x.fillRect(i,H*.40,18,H*.04);x.fillRect(i+45,H*.40,18,H*.04)}
 drawFighter(P);drawFighter(E,true);
 $("#php").style.width=P.hp+"%";$("#ehp").style.width=E.hp+"%";$("#pm").style.width=P.m+"%";$("#em").style.width=E.m+"%";
 requestAnimationFrame(loop)
}
function reset(){Object.assign(P,{x:.18,hp:100,m:0,guard:"mid",aim:"mid",atk:null,step:0});Object.assign(E,{x:.82,hp:100,m:0,guard:"mid",aim:"mid",atk:null,step:0});over=false;say("再戦！")}
say("盾閃　開始");requestAnimationFrame(loop);
