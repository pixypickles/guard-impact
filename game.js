document.addEventListener("contextmenu",e=>e.preventDefault(),{passive:false});
document.addEventListener("selectstart",e=>e.preventDefault(),{passive:false});
document.addEventListener("dragstart",e=>e.preventDefault(),{passive:false});
const c=document.querySelector("#game"),x=c.getContext("2d");
const $=s=>document.querySelector(s); let W,H,last=0,msgT=1.5;
function resize(){W=c.width=innerWidth*devicePixelRatio;H=c.height=innerHeight*devicePixelRatio;x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);W=innerWidth;H=innerHeight} addEventListener("resize",resize);resize();
const P={x:.18,hp:100,m:0,guard:"mid",aim:"mid",atk:null,face:1,step:0,flash:0,stun:0,weapon:"shield",guardKick:0}, E={x:.82,hp:100,m:0,guard:"mid",aim:"mid",atk:null,face:-1,step:0,flash:0,stun:0,weapon:"katana",riposte:0,guardKick:0,guardPose:0};
let over=false, hold={small:0,heavy:0}, taps={left:0,right:0};
function say(t){$("#msg").textContent=t;msgT=1.1}
function attack(a,type,charged=false){
 if(over||a.atk||(a.stun||0)>0)return;
 let special=charged&&a.m>=100;
 if(special)a.m=0;
 a.atk={t:0,type,special,hit:false,height:a.aim||a.guard||"mid",speed:a.weapon==="katana"?.85:1};
}
function releaseAttack(type){let d=performance.now()-(hold[type]||performance.now());hold[type]=0;attack(P,type,d>380)}
function guardSet(a,g){a.guard=g}
function step(a,dir){if((a.stun||0)>0)return;a.step=dir*.055}
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
let sparks=[];
let impacts=[];
let hitStop=0,shake=0;
function hitImpact(b,height,strong=false){
 let s=Math.min(W,H)/520,px=b.x*W-b.face*44*s,py=H*.60-(height==="high"?150:112)*s;
 impacts.push({x:px,y:py,t:0,life:strong?.24:.18,strong});
 let n=strong?13:8;
 for(let i=0;i<n;i++){let aa=Math.random()*Math.PI*2,sp=45+Math.random()*(strong?115:80);
  impacts.push({particle:true,x:px,y:py,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,t:0,life:.12+Math.random()*.12});}
}
function drawImpacts(dt){
 for(let i=impacts.length-1;i>=0;i--){let p=impacts[i];p.t+=dt;if(p.t>=p.life){impacts.splice(i,1);continue}
  let k=1-p.t/p.life;x.save();x.globalAlpha=k;
  if(p.particle){p.x+=p.vx*dt;p.y+=p.vy*dt;x.strokeStyle="#aef5ff";x.lineWidth=3*k+1;
   x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx*.018,p.y-p.vy*.018);x.stroke();}
  else{let r=(p.strong?28:20)*(p.t/p.life)+4;x.strokeStyle="#e9fdff";x.lineWidth=(p.strong?6:4)*k+1;
   x.beginPath();x.arc(p.x,p.y,r,0,Math.PI*2);x.stroke();}x.restore();}
}
function sparkGuard(b,height,strong=false){
 let s=Math.min(W,H)/520;
 // 火花も防御者の中心ではなく、攻撃者側の前面へ出す。
 let px=b.x*W+b.face*(b.weapon==="katana"?-43:-49)*s;
 let py=H*.60-(height==="high"?155:125)*s;
 let n=strong?18:11;
 for(let i=0;i<n;i++){
  let aa=Math.random()*Math.PI*2,sp=(strong?120:80)+Math.random()*90;
  sparks.push({x:px,y:py,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp-35,t:0,life:.18+Math.random()*.17,z:1.5+Math.random()*2.5});
 }
}
function drawSparks(dt){
 for(let i=sparks.length-1;i>=0;i--){
  let p=sparks[i];p.t+=dt;
  if(p.t>=p.life){sparks.splice(i,1);continue}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=260*dt;
  let k=1-p.t/p.life;
  x.save();x.globalAlpha=k;x.strokeStyle=p.t<p.life*.45?"#eaffff":"#55dcff";x.lineWidth=p.z*k+1;
  x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);x.stroke();x.restore();
 }
}
function blastToWall(f,dir,strong=false){
 let target=dir>0?.865:.135;
 f.blast={from:f.x,to:target,t:0,dur:strong?.20:.26};
 f.stun=Math.max(f.stun||0,strong?.52:.38);f.atk=null;
}
function contactShock(strong=false){
 hitStop=Math.max(hitStop||0,strong?.065:.045);
 shake=Math.max(shake||0,strong?11:7);
}
function interruptHeavy(defender,attack){
 if(attack.type==="small" && defender.atk && defender.atk.type==="heavy"){
   defender.atk=null;defender.stun=Math.max(defender.stun||0,.24);
   defender.step=-defender.face*.010;return true;
 }
 return false;
}
function resolve(a,b){
 let q=a.atk;if(!q||q.hit)return;
 let speed=q.speed||1;
 let impact=(q.special?.58:q.type==="small"?.28:.42)*speed;
 if(q.t<impact)return;q.hit=true;
 // 当たり判定はキャラ中心ではなく「相手の身体の手前側」で取る。
 // 攻撃者から見て相手の前面ぶんを差し引き、武器が身体の奥へ入る前に接触する。
 let centerDist=Math.abs(a.x-b.x);
 // 手前側の身体面を重要視。中心よりかなり前で武器接触を拾う。
 let bodyFront=b.weapon==="katana"?.072:.078;
 let dist=Math.max(0,centerDist-bodyFront);
 let range=q.special?.385:q.type==="small"?.305:.345;
 if(dist>range)return;
 let nowGuard=b.guard===q.height;
 let just=(b.just||0)>0;

 // 刀キャラ: 刀を両手で構え、同じ高さの通常攻撃は自動受け。
 // 完全防御ではなく少量の削りダメージを受ける。
 if(b.weapon==="katana" && !q.special && nowGuard && (b.guardPose||0)>0){
   if(just){
     // ジャストガードは受け流し斬り。攻撃を弾き、そのまま即反撃。
     sparkGuard(b,q.height,true);b.guardKick=.16;b.guardPose=.24;q.deflected=true;q.deflectT=.20;contactShock(true);blastToWall(a,-a.face,true);
     b.flash=1;b.riposte=.28;
     b.m=Math.min(100,b.m+24);
     hitImpact(a,q.height,q.type!=="small");a.guardKick=.09;
     a.hp-=q.type==="small"?9:14;
     say("受け流し斬り！");
     if(a.hp<=0){a.hp=0;over=true;say(b===P?"勝利！ TAPで再戦":"敗北… TAPで再戦")}
     return;
   }
   let chip=q.type==="small"?.5:1;
   sparkGuard(b,q.height,false);contactShock(q.type!=="small");b.guardKick=.14;b.guardPose=.20;q.deflected=true;q.deflectT=.16;
   blastToWall(a,-a.face,q.type!=="small");b.hp-=chip;b.flash=.35;
   b.m=Math.min(100,b.m+(q.type==="small"?10:17));
   say("刀受け -"+chip);
 }else if(q.special){
   // ガード不能は刀の自動受けも貫通。ジャストだけ防げる。
   if(just){
     if(b.weapon==="katana"){
       sparkGuard(b,q.height,true);b.guardKick=.16;b.guardPose=.26;q.deflected=true;q.deflectT=.24;contactShock(true);blastToWall(a,-a.face,true);b.riposte=.32;
       b.m=Math.min(100,b.m+30);
       hitImpact(a,q.height,true);a.guardKick=.11;
       a.hp-=16;b.flash=1;say("受け流し斬り！");
     }else{
       sparkGuard(b,q.height,true);b.guardKick=.16;q.deflected=true;q.deflectT=.24;b.m=Math.min(100,b.m+30);contactShock(true);blastToWall(a,-a.face,true);b.flash=1;say("JUST GUARD! よろけ！");
     }
     return;
   }
   hitImpact(b,q.height,true);contactShock(true);blastToWall(b,a.face,true);b.guardKick=.16;
   b.hp-=32;b.flash=1;say("ガード不能・直撃！");
 }else if(nowGuard){
   if(just){
     sparkGuard(b,q.height,true);b.guardKick=.16;q.deflected=true;q.deflectT=.20;b.m=Math.min(100,b.m+24);contactShock(true);blastToWall(a,-a.face,true);b.flash=1;say("JUST GUARD! よろけ！");
     return;
   }
   sparkGuard(b,q.height,false);contactShock(q.type!=="small");b.guardKick=.14;q.deflected=true;q.deflectT=.16;
   b.m=Math.min(100,b.m+(q.type==="small"?13:22));b.flash=.6;blastToWall(a,-a.face,q.type!=="small");say("反発！");
 }else{
   let interrupted=interruptHeavy(b,q);
   hitImpact(b,q.height,true);contactShock(q.type!=="small");blastToWall(b,a.face,q.type!=="small");b.guardKick=.14;
   b.hp-=q.type==="small"?9:16;b.flash=1;
   say(interrupted?"一閃！ 大攻撃を吹き飛ばした！":(q.height==="high"?"上段 直撃！":"中段 直撃！"));
 }
 if(b.hp<=0){b.hp=0;over=true;say(a===P?"勝利！ TAPで再戦":"敗北… TAPで再戦")}
}
let cpu=0;
function ai(dt){
 cpu-=dt;if(cpu>0||over||E.stun>0)return;cpu=.22+Math.random()*.5;
 let d=Math.abs(P.x-E.x);
 if(P.atk){
   // オートガード廃止。CPUが防御を選んだ時だけ刀を攻撃線へ合わせる。
   if(Math.random()<.34){
     E.guard=P.atk.height;
     E.guardPose=Math.max(E.guardPose||0,P.atk.height==="high"?.28:.22);
     if(Math.random()<(P.atk.special?.24:.14))E.just=.11;
   }
 }
 else if(d>.43)step(E,-1);
 else if(d<.36)step(E,1); else if(Math.random()<.16)step(E,Math.random()<.5?-1:1);
 else {let charged=E.m>=100&&Math.random()<.38;E.aim=Math.random()<.5?"high":"mid";attack(E,Math.random()<.58?"small":"heavy",charged)}
}
function update(a,dt){
 if(a.blast){a.blast.t+=dt;let p=Math.min(1,a.blast.t/a.blast.dur),e=1-Math.pow(1-p,3);
  a.x=a.blast.from+(a.blast.to-a.blast.from)*e;if(p>=1)a.blast=null;}
 a.stun=Math.max(0,(a.stun||0)-dt);a.riposte=Math.max(0,(a.riposte||0)-dt);
 a.guardPose=Math.max(0,(a.guardPose||0)-dt);
 let oldGK=a.guardKick||0;a.guardKick=Math.max(0,oldGK-dt);
 if(oldGK>0)a.x-=a.face*dt*.018;
 if(a.step&&!a.blast){a.x+=a.step;a.step*=.72;if(Math.abs(a.step)<.002)a.step=0}
 if(a.stun>0){a.atk=null}
 if(a.atk){
   a.atk.t+=dt;
   if(a.atk.deflectT!=null){a.atk.deflectT-=dt;if(a.atk.deflectT<=0)a.atk=null}
   if(!a.atk){a.x=Math.max(.12,Math.min(.88,a.x));return}
   let dur=(a.atk.special?.95:a.atk.type==="small"?.55:.75)*(a.atk.speed||1);
   if(a.atk.type!=="small"){
     // 大攻撃の前半で相手方向へ実際に一歩進む
     let target=.035, prev=a.atk.lungeDone||0;
     let phase=Math.min(1,a.atk.t/(dur*.42));
     let wanted=target*(1-Math.pow(1-phase,2));
     a.x+=a.face*(wanted-prev);
     a.atk.lungeDone=wanted;
   }
   if(a.atk.t>dur)a.atk=null;
 }
 a.x=Math.max(.12,Math.min(.88,a.x));a.flash=Math.max(0,a.flash-dt*3);a.just=Math.max(0,(a.just||0)-dt);
}
function techTrim(kind){
 let kat=kind==="katana", c1=kat?"#73ff39":"#00f6ff", c2=kat?"#ff2bd6":"#ffe43b";
 x.save();x.globalAlpha=.98;x.lineCap="round";
 // glowing lamellar bands
 x.shadowColor=c1;x.shadowBlur=15;x.strokeStyle=c1;x.lineWidth=3;
 x.beginPath();x.moveTo(-29,-158);x.lineTo(28,-158);x.moveTo(-30,-143);x.lineTo(29,-143);x.moveTo(-29,-128);x.lineTo(28,-128);x.stroke();
 // angular chest circuitry / ancient armor motif
 x.shadowColor=c2;x.shadowBlur=12;x.strokeStyle=c2;x.lineWidth=2.5;
 x.beginPath();x.moveTo(-28,-112);x.lineTo(-12,-123);x.lineTo(0,-114);x.lineTo(13,-124);x.lineTo(28,-112);x.stroke();
 // shoulder edge glows
 x.shadowColor=c1;x.shadowBlur=12;x.strokeStyle=c1;x.lineWidth=3;
 x.beginPath();x.moveTo(-50,-163);x.lineTo(-50,-126);x.moveTo(49,-163);x.lineTo(49,-126);x.stroke();
 x.shadowBlur=0;x.restore();
}
function neonHelmet(kind){
 let kat=kind==="katana", c1=kat?"#73ff39":"#00f6ff", c2=kat?"#ff2bd6":"#ffe43b";
 x.save();x.globalAlpha=.95;x.lineCap="round";
 x.shadowColor=c1;x.shadowBlur=14;x.strokeStyle=c1;x.lineWidth=3;
 x.beginPath();x.arc(0,-202,24,Math.PI,Math.PI*2);x.stroke();
 x.beginPath();x.moveTo(-21,-202);x.lineTo(21,-202);x.stroke();
 x.shadowColor=c2;x.shadowBlur=12;x.strokeStyle=c2;x.lineWidth=3;
 x.beginPath();x.moveTo(0,-224);x.lineTo(kind==="katana"?6:-7,-250);x.stroke();
 x.shadowBlur=0;x.restore();
}
let weaponTrails=[];
function addWeaponTrail(a,x1,y1,x2,y2,kind,strong=false,screen=false){
 if(!a.atk)return;
 weaponTrails.push({a,x1,y1,x2,y2,kind,strong,screen,t:0,life:strong?.17:.12});
 if(weaponTrails.length>28)weaponTrails.shift();
}
function updateWeaponTrails(dt){
 for(let i=weaponTrails.length-1;i>=0;i--){let p=weaponTrails[i];p.t+=dt;if(p.t>=p.life)weaponTrails.splice(i,1);}
}
function drawWeaponTrails(){
 x.save();x.lineCap="round";
 for(const p of weaponTrails){
  let k=1-p.t/p.life,s=Math.min(W,H)/520,ox=p.screen?0:p.a.x*W,oy=p.screen?0:H*.60;
  x.globalAlpha=k*(p.strong?.52:.34);
  x.strokeStyle=p.kind==="katana"?"#7cff3a":"#71efff";
  x.shadowColor=p.kind==="katana"?"#32ff00":"#00eaff";x.shadowBlur=p.strong?24:15;
  x.lineWidth=(p.strong?12:7)*k+2;
  x.beginPath();x.moveTo(ox+p.x1*s,oy+p.y1*s);x.lineTo(ox+p.x2*s,oy+p.y2*s);x.stroke();
 }
 x.restore();
}
function drawKatana(a,enemy,px,ground,s){
 if(shake>0)px+=Math.sin(performance.now()*.12)*shake*.45;
 let atk=a.atk, heavyPose=0;
 if(atk&&atk.type!=="small"){
   let dur=(atk.special?.95:.75)*(atk.speed||1);
   heavyPose=Math.sin(Math.min(1,atk.t/dur)*Math.PI);
 }
 let gk=Math.min(1,(a.guardKick||0)/.16);
 x.save();x.translate(px-a.face*gk*7*s,ground+heavyPose*9*s+gk*2*s);x.scale(a.face*s,s);
 if(gk>0)x.rotate(-.055*gk);
 if(a.stun>0){x.rotate(-.12);x.translate(-7,2)}
 // shadow
 x.fillStyle="#0a0d1588";x.beginPath();x.ellipse(0,10,55,12,0,0,Math.PI*2);x.fill();
 // legs / lighter armor
 // 刀兵の脚：腰から自然に出し、膝を曲げて前後に開く。
 x.strokeStyle="#26104d";x.shadowColor="#ff2bd6";x.shadowBlur=7;x.lineCap="round";
 let kh=heavyPose*9, ks=heavyPose*13;
 x.lineWidth=14;
 x.beginPath();x.moveTo(-12,-64+kh);x.lineTo(-23-ks*.45,-36+kh);x.lineTo(-31-ks*.65,-2);x.stroke();
 x.beginPath();x.moveTo(12,-64+kh);x.lineTo(26+ks,-36+kh);x.lineTo(35+ks*1.55,-2);x.stroke();
 x.lineWidth=11;
 x.beginPath();x.moveTo(-31-ks*.55,-2);x.lineTo(-43-ks*.6,2);x.stroke();
 x.beginPath();x.moveTo(35+ks*1.4,-2);x.lineTo(48+ks*1.5,2);x.stroke();
 x.lineCap="butt";x.shadowBlur=0;
 x.fillStyle="#ff5a1f";for(let i=-2;i<=2;i++)x.fillRect(i*12-5,-104,10,46);
 x.fillStyle="#35104f";x.beginPath();x.moveTo(-34,-168);x.lineTo(33,-168);x.lineTo(28,-98);x.lineTo(-28,-98);x.closePath();x.fill();
 x.strokeStyle="#73ff39";x.shadowColor="#73ff39";x.shadowBlur=8;x.lineWidth=4;for(let yy=-156;yy<-108;yy+=14){x.beginPath();x.moveTo(-28,yy);x.lineTo(27,yy);x.stroke()}
 x.shadowBlur=0;techTrim("katana");
 // head/helmet + visible eye dot
 x.fillStyle="#c79467";x.beginPath();x.arc(0,-193,19,0,Math.PI*2);x.fill();
 x.fillStyle="#1d1713";x.beginPath();x.arc(11,-188,3.8,0,Math.PI*2);x.fill();
 x.fillStyle="#5a146e";x.beginPath();x.arc(0,-201,23,Math.PI,Math.PI*2);x.fill();x.fillRect(-23,-202,46,9);
 x.strokeStyle="#a82f25";x.lineWidth=6;x.beginPath();x.moveTo(0,-223);x.lineTo(6,-246);x.stroke();
 neonHelmet("katana");

 // 両手持ち。通常構えは中段、上段入力/AI時は高く構える。
 let h1x=35,h1y=-143,h2x=18,h2y=-132,ang=-.08;
 if(a.riposte>0){
   // ジャスト受け流し斬り: 素早く前へ切り返す
   let p=1-a.riposte/.32;
   ang=-.85+p*1.05;h1x=38+p*24;h1y=-148+p*10;h2x=h1x-18;h2y=h1y+8;
 }else if(atk){
   let impact=(atk.special?.58:atk.type==="small"?.28:.42)*(atk.speed||1);
   let p=Math.min(1,atk.t/impact),sw=1-Math.pow(1-p,2);
   if(atk.height==="high"){ang=-1.18+sw*1.38;h1x=32+sw*24;h1y=-158+sw*18}
   else if(atk.type==="small"){ang=-.12;h1x=35+sw*35;h1y=-140}
   else {ang=.42-sw*.68;h1x=34+sw*34;h1y=-132}
   h2x=h1x-18;h2y=h1y+9;
 }else if(a.guard==="high"){ang=-.55;h1y=-154;h2y=-139}

 // 刀受け中は「受けている」と一目で分かる専用姿勢。
 // 腕を身体の近くへ畳み、両手を胸元へ寄せ、刃をほぼ真上に立てる。
 let gp=Math.min(1,(a.guardPose||0)/(a.guard==="high"?.34:.25));
 if(gp>0){
   // 上段は頭へ届く前に、頭の前方で刀を立てて攻撃線を遮る。
   ang=a.guard==="high"?-1.38:-1.48;
   h1x=a.guard==="high"?24:19;h1y=a.guard==="high"?-164:-137;
   h2x=a.guard==="high"?10:7; h2y=a.guard==="high"?-149:-125;
 }
 if(atk&&atk.deflected){let r=Math.max(0,(atk.deflectT||0)/.24);ang-=.20*r;h1x-=4*r;h2x-=3*r;}

 // both arms to the two hands
 x.strokeStyle="#ff8a5c";x.shadowColor="#ff2bd6";x.shadowBlur=5;x.lineWidth=11;x.lineCap="round";
 x.beginPath();x.moveTo(29,-153);x.lineTo(h1x,h1y);x.stroke();
 x.beginPath();x.moveTo(-25,-151);x.lineTo(h2x,h2y);x.stroke();

 // katana handle + blade
 x.save();x.translate(h1x,h1y);x.rotate(ang);
 x.shadowBlur=0;x.strokeStyle="#120d1e";x.lineWidth=10;x.beginPath();x.moveTo(-25,0);x.lineTo(8,0);x.stroke();
 x.strokeStyle="#ffe43b";x.shadowColor="#ffe43b";x.shadowBlur=10;x.lineWidth=9;x.beginPath();x.moveTo(8,-10);x.lineTo(8,10);x.stroke();
 if(atk&&atk.special){x.shadowBlur=16;x.shadowColor="#ff3b18";x.strokeStyle="#ff7840";x.lineWidth=9;x.beginPath();x.moveTo(13,0);x.shadowColor=atk&&atk.special?"#ff285d":"#4be8ff";x.shadowBlur=atk&&atk.special?24:15;
 x.lineTo(122,0);x.stroke();x.shadowBlur=0;x.shadowBlur=0}
 if(atk){
  // 現在のCanvasは刀身を描くためのtranslate/scale/rotateがすべて適用済み。
  // その変換をそのまま使い、刀身の実画面座標を取得する。
  let tm=x.getTransform();
  let tp1=new DOMPoint(13,0).matrixTransform(tm);
  let tp2=new DOMPoint(122,0).matrixTransform(tm);
  addWeaponTrail(a,tp1.x,tp1.y,tp2.x,tp2.y,"katana",atk.type!=="small"||atk.special,true);
 }
 x.strokeStyle=(atk&&atk.special)?"#fff2a8":"#aaff66";x.shadowColor=(atk&&atk.special)?"#ff285d":"#39ff14";x.shadowBlur=(atk&&atk.special)?26:22;x.lineWidth=6;x.beginPath();x.moveTo(13,0);x.shadowColor=atk&&atk.special?"#ff285d":"#4be8ff";x.shadowBlur=atk&&atk.special?24:15;
 x.lineTo(122,0);x.stroke();x.shadowBlur=0;
 x.restore();
 x.lineCap="butt";
 x.restore();
}
function drawFighter(a,enemy=false){
 let px=a.x*W+(shake>0?Math.sin(performance.now()*.12+(enemy?1.7:0))*shake*.45:0), ground=H*.60, s=Math.min(W,H)/520;
 if(a.weapon==="katana"){drawKatana(a,enemy,px,ground,s);return;}
 // 大攻撃（上段・中段共通）は一歩踏み込み、少し腰を落とす。
 // 小攻撃ではこの姿勢変化を行わない。
 let heavyPose=0;
 if(a.atk && a.atk.type!=="small"){
   let dur=a.atk.special?.95:.75;
   let p=Math.min(1,a.atk.t/dur);
   // 前半で踏み込み、攻撃後半で自然に戻る
   heavyPose=Math.sin(p*Math.PI);
 }
 // 踏み込みは実際のX座標で相手方向へ移動する。描画では腰だけ落とす。
 let crouch=heavyPose*10;
 let gk=Math.min(1,(a.guardKick||0)/.16);
 x.save();x.translate(px-a.face*gk*7*s,ground+crouch*s+gk*2*s);x.scale(a.face*s,s);
 if(gk>0)x.rotate(-.055*gk);
 if(a.stun>0){
   // ジャストガードを受けた側は後ろへのけぞる
   let wobble=Math.sin(a.stun*34)*.035;
   x.rotate(-.13+wobble);
   x.translate(-8,2);
 }
 if(a.flash)x.globalAlpha=.55+.45*Math.sin(performance.now()/35);
 // shadow
 x.fillStyle="#0a0d1588";x.beginPath();x.ellipse(0,10,58,13,0,0,Math.PI*2);x.fill();
 // legs / boots
 // 通常時も大攻撃時も同じ「関節のある脚」を使う。
 // 大攻撃ではこの姿勢のまま膝を深く曲げ、前脚を相手側へさらに出す。
 x.strokeStyle=enemy?"#4a153e":"#102d59";x.shadowColor=enemy?"#ff2bd6":"#00f6ff";x.shadowBlur=6;
 x.lineCap="round";
 let legDrop=heavyPose*7;
 let backKneeX=-23-heavyPose*5;
 let backFootX=-31-heavyPose*7;
 let frontKneeX=27+heavyPose*14;
 let frontFootX=34+heavyPose*22;
 x.lineWidth=15;
 x.beginPath();x.moveTo(-13,-64+legDrop);x.lineTo(backKneeX,-35+legDrop);x.lineTo(backFootX,-2);x.stroke();
 x.beginPath();x.moveTo(13,-64+legDrop);x.lineTo(frontKneeX,-36+legDrop);x.lineTo(frontFootX,-2);x.stroke();
 x.lineWidth=12;
 x.beginPath();x.moveTo(backFootX,-2);x.lineTo(backFootX-12,2);x.stroke();
 x.beginPath();x.moveTo(frontFootX,-2);x.lineTo(frontFootX+13,2);x.stroke();
 x.lineCap="butt";x.shadowBlur=0;
 // lamellar skirt
 x.fillStyle=enemy?"#ff5a1f":"#b51cff";for(let i=-2;i<=2;i++)x.fillRect(i*13-6,-105,11,48);
 // torso armor
 x.fillStyle=enemy?"#6b174f":"#123b68";x.beginPath();x.moveTo(-38,-170);x.lineTo(35,-170);x.lineTo(29,-95);x.lineTo(-30,-95);x.closePath();x.fill();
 x.strokeStyle="#ffe43b";x.shadowColor="#ffe43b";x.shadowBlur=7;x.lineWidth=4;for(let yy=-158;yy<-105;yy+=14){x.beginPath();x.moveTo(-31,yy);x.lineTo(29,yy);x.stroke()}
 // shoulder plates
 x.fillStyle=enemy?"#8a195c":"#164d7d";x.fillRect(-53,-165,22,42);x.fillRect(31,-165,22,42);
 x.shadowBlur=0;techTrim("shield");
 // head + helmet
 x.fillStyle="#c79467";x.beginPath();x.arc(0,-194,19,0,Math.PI*2);x.fill();x.fillStyle="#211810";x.beginPath();x.arc(11,-188,3.8,0,Math.PI*2);x.fill();
 x.fillStyle=enemy?"#71154f":"#173b69";x.beginPath();x.arc(0,-202,24,Math.PI,Math.PI*2);x.fill();x.fillRect(-24,-203,48,10);
 x.strokeStyle="#a82f25";x.lineWidth=7;x.beginPath();x.moveTo(0,-224);x.lineTo(-7,-250);x.stroke();
 neonHelmet("shield");
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
     // 横回転は画面XY上で回さない。Y座標を胸下の高さに完全固定し、
     // 「左向き→手前→右向き→手前→左向き」を刀身の横方向と長さで表現する。
     const p=swing;
     handY=shoulderY+26; // 足元へ絶対に落ちない中段の高さ
     bladeAng=0;         // 刀身は常に画面上で水平
     if(p<.26){
       handX=shoulderX+20;
     }else if(p<.70){
       const q=(p-.26)/.44;
       handX=shoulderX+20+50*(1-Math.pow(1-q,2));
     }else{
       const q=(p-.70)/.30;
       handX=shoulderX+70-52*q;
     }
   }
 }

 // upper arm: always connects torso shoulder to the hand
 x.strokeStyle="#b98b64";x.lineWidth=12;x.lineCap="round";
 x.beginPath();x.moveTo(shoulderX,shoulderY);x.lineTo(handX,handY);x.stroke();

 // hand + sword
 if(atk&&atk.deflected){let r=Math.max(0,(atk.deflectT||0)/.24);bladeAng-=.52*r;handX-=8*r;}
 x.save();x.translate(handX,handY);x.rotate(bladeAng);
 let bladeLen=92;
 let bladeDir=1;
 if(atk && atk.height==="mid" && atk.type!=="small"){
   let impact=atk.special?.58:.42;
   let p=Math.min(1,atk.t/impact);
   // 擬似的な水平回転。cosの符号が刃の左右、絶対値が見かけの長さ。
   // 0:左、0.5:右、1:左。途中の手前向きだけ短くなる。
   let yaw;
   if(p<.26) yaw=Math.PI;
   else if(p<.70) yaw=Math.PI*(1-(p-.26)/.44);
   else yaw=Math.PI*((p-.70)/.30);
   let cs=Math.cos(yaw);
   bladeDir=cs>=0?1:-1;
   bladeLen=22+86*Math.abs(cs);
 }
 x.strokeStyle="#b98b64";x.lineWidth=11;x.beginPath();x.moveTo(-8,0);x.lineTo(10,0);x.stroke();
 x.strokeStyle="#8d6b39";x.lineWidth=10;x.beginPath();x.moveTo(10,-10);x.lineTo(10,10);x.stroke();
 // ガード不能技は刀身を赤橙色に発光させ、通常攻撃と見分けやすくする。
 if(atk&&atk.special){
   x.save();x.shadowBlur=18;x.shadowColor="#ff3b18";x.strokeStyle="#ff6a24";x.lineWidth=10;x.beginPath();
   if(bladeDir>0){x.moveTo(14,0);x.lineTo(14+bladeLen,0);}
   else{x.moveTo(-14,0);x.lineTo(-14-bladeLen,0);}
   x.stroke();x.restore();
 }
 if(atk){
   let st=bladeDir>0?14:-14,en=bladeDir>0?14+bladeLen:-14-bladeLen;
   addWeaponTrail(a,handX+Math.cos(bladeAng)*st,handY+Math.sin(bladeAng)*st,
     handX+Math.cos(bladeAng)*en,handY+Math.sin(bladeAng)*en,"shield",atk.type!=="small"||atk.special,false);
 }
 x.shadowColor=(atk&&atk.special)?"#ff285d":"#00f6ff";x.shadowBlur=(atk&&atk.special)?26:20;x.strokeStyle=(atk&&atk.special)?"#fff0a8":"#b8ffff";x.lineWidth=7;x.beginPath();
 if(bladeDir>0){x.moveTo(14,0);x.lineTo(14+bladeLen,0);}
 else{x.moveTo(-14,0);x.lineTo(-14-bladeLen,0);}
 x.stroke();
 x.restore();
 x.lineCap="butt";
 // shield
 let sy=a.guard==="high"?-182:-126;x.save();x.fillStyle=enemy?"#6b124f":"#4b147f";x.strokeStyle="#00f6ff";x.shadowColor="#00f6ff";x.shadowBlur=18;x.lineWidth=6;x.beginPath();x.ellipse(-32,sy,31,43,0,0,Math.PI*2);x.fill();x.stroke();x.shadowColor="#ffe43b";x.shadowBlur=14;x.beginPath();x.arc(-32,sy,9,0,Math.PI*2);x.fillStyle="#ffe43b";x.fill();x.restore();
 x.restore();
}
function loop(t){
 let realDt=Math.min(.033,(t-last)/1000||0);last=t;
 let dt=realDt;
 if(hitStop>0){hitStop=Math.max(0,hitStop-realDt);dt=0}
 // 画面揺れはゲーム時間ではなく実時間で減衰させ、必ず停止させる。
 shake=Math.max(0,shake-realDt*90);
 if(shake<.12)shake=0;
 update(P,dt);update(E,dt);
 updateWeaponTrails(realDt);
 // キャラ同士の当たり判定。プレイヤーは常に左、CPUは常に右。
 // 接触したら互いを押し戻し、すれ違い・位置の入れ替わりを禁止する。
 const minGap=.215;
 if(E.x-P.x<minGap){
   const mid=(P.x+E.x)/2;
   P.x=mid-minGap/2;
   E.x=mid+minGap/2;
   P.step=Math.min(0,P.step);
   E.step=Math.max(0,E.step);
 }
 ai(dt);
 if(P.atk&&E.atk&&P.atk.type!==E.atk.type){
   if(P.atk.type==="small"){resolve(P,E);resolve(E,P)}
   else{resolve(E,P);resolve(P,E)}
 }else{resolve(P,E);resolve(E,P);}
 if(msgT>0){msgT-=dt;if(msgT<=0&&!over)$("#msg").textContent=""}
 x.clearRect(0,0,W,H);
 let g=x.createLinearGradient(0,0,0,H*.62);g.addColorStop(0,"#301a5b");g.addColorStop(1,"#d24b7f");x.fillStyle=g;x.fillRect(0,0,W,H*.62);
 x.fillStyle="#17162b";x.fillRect(0,H*.58,W,H*.42);
 // distant battlements
 x.fillStyle="#28213d";for(let i=0;i<W;i+=90){x.fillRect(i,H*.43,70,H*.15);x.fillRect(i,H*.40,18,H*.04);x.fillRect(i+45,H*.40,18,H*.04)}
 drawWeaponTrails();
 drawFighter(P);drawFighter(E,true);drawSparks(dt);drawImpacts(dt);
 $("#php").style.width=P.hp+"%";$("#ehp").style.width=E.hp+"%";$("#pm").style.width=P.m+"%";$("#em").style.width=E.m+"%";
 requestAnimationFrame(loop)
}
function reset(){Object.assign(P,{x:.18,hp:100,m:0,guard:"mid",aim:"mid",atk:null,step:0,stun:0,weapon:"shield",guardKick:0});Object.assign(E,{x:.82,hp:100,m:0,guard:"mid",aim:"mid",atk:null,step:0,stun:0,weapon:"katana",riposte:0,guardKick:0,guardPose:0});over=false;sparks.length=0;weaponTrails.length=0;impacts.length=0;say("再戦！")}
say("盾閃　開始");requestAnimationFrame(loop);
