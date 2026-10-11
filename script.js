(function(){
var $=function(i){return document.getElementById(i)};
var P=[
{n:"Güneş",col:"#ffb347",a:0,T:0,d:"Sistemin tek yıldızı. Işığı Dünya'ya 8 dakika 20 saniyede ulaşır.",v:[["Çap","1.391.000 km (109 Dünya)"],["Kütle","333.000 Dünya"],["Yüzey","yaklaşık 5.500 °C"],["Çekirdek","yaklaşık 15 milyon °C"],["Yaş","4,6 milyar yıl"]]},
{n:"Merkür",col:"#b7aea3",pr:3.2,a:.62,T:88,e:.38,d:"En küçük ve Güneş'e en yakın gezegen. Atmosferi neredeyse yok, gündüz ile gece arasındaki fark çok büyük. Yüzeyi kraterlerle kaplı.",v:[["Güneş'e uzaklık","57,9 milyon km"],["Çap","4.879 km"],["Yıl","88 gün"],["Gün","58,6 Dünya günü"],["Uydu","0"],["Sıcaklık","−180 ile 430 °C"]]},
{n:"Venüs",col:"#e8c27a",pr:4.6,a:.85,T:225,e:.95,d:"En sıcak gezegen. Yoğun CO₂ atmosferi güçlü sera etkisi yaratır, yüzey basıncı Dünya'nınkinin yaklaşık 90 katı. Ters yönde döner.",v:[["Güneş'e uzaklık","108 milyon km"],["Çap","12.104 km"],["Yıl","225 gün"],["Gün","243 Dünya günü (ters)"],["Uydu","0"],["Sıcaklık","yaklaşık 465 °C"]]},
{n:"Dünya",col:"#4a90e2",pr:5,a:1,T:365.25,e:1,d:"Bilinen tek yaşam taşıyan gezegen. Yüzeyinin yaklaşık %71'i su. Manyetik alanı ve atmosferi yüzeyi korur.",v:[["Güneş'e uzaklık","149,6 milyon km (1 AB)"],["Çap","12.742 km"],["Yıl","365,25 gün"],["Gün","24 saat"],["Uydu","1 (Ay)"],["Ortalama sıcaklık","yaklaşık 15 °C"]]},
{n:"Mars",col:"#d1572a",pr:3.8,a:1.23,T:687,e:.53,d:"Kızıl Gezegen. Güneş Sistemi'nin en yüksek yanardağı Olympus Mons (yaklaşık 22 km) burada. Geçmişte sıvı su aktığına dair güçlü kanıtlar var.",v:[["Güneş'e uzaklık","227,9 milyon km"],["Çap","6.779 km"],["Yıl","687 gün"],["Gün","24 saat 37 dk"],["Uydu","2 (Phobos, Deimos)"],["Ortalama sıcaklık","yaklaşık −63 °C"]]},
{n:"Jüpiter",col:"#d9b38c",pr:10,a:2.28,T:4333,e:11.2,d:"En büyük gezegen. Büyük Kırmızı Leke, yüzyıllardır süren dev bir fırtına. Gaz devi, katı yüzeyi yok.",v:[["Güneş'e uzaklık","778 milyon km"],["Çap","139.820 km"],["Yıl","11,9 Dünya yılı"],["Gün","yaklaşık 9,9 saat"],["Uydu","95'ten fazla"],["Bulut tepesi","yaklaşık −110 °C"]]},
{n:"Satürn",col:"#e6d19a",pr:8.5,a:3.09,T:10759,e:9.45,ring:1,d:"Halkalarıyla ünlü gaz devi. Halkalar çoğunlukla su buzundan, genişlikleri yüz binlerce km ama çoğu yerde kalınlıkları onlarca metre. Yoğunluğu sudan düşük.",v:[["Güneş'e uzaklık","1.434 milyon km"],["Çap","116.460 km"],["Yıl","29,5 Dünya yılı"],["Gün","yaklaşık 10,7 saat"],["Uydu","270'ten fazla"],["Bulut tepesi","yaklaşık −140 °C"]]},
{n:"Uranüs",col:"#7fd4d9",pr:6,a:4.38,T:30687,e:4,d:"Buz devi. Ekseni yaklaşık 98° yatık, adeta yan yatarak döner. Soluk halkaları ve 28 uydusu var.",v:[["Güneş'e uzaklık","2.871 milyon km"],["Çap","50.724 km"],["Yıl","84 Dünya yılı"],["Gün","yaklaşık 17,2 saat (ters)"],["Uydu","28"],["Sıcaklık","yaklaşık −195 °C"]]},
{n:"Neptün",col:"#4b6cf0",pr:6,a:5.48,T:60190,e:3.9,d:"En uzak gezegen. Rüzgârları sistemin en hızlısı, saatte 2.000 km'yi aşabiliyor. 1846'da önce hesapla öngörüldü, sonra teleskopla bulundu.",v:[["Güneş'e uzaklık","4.495 milyon km"],["Çap","49.244 km"],["Yıl","164,8 Dünya yılı"],["Gün","yaklaşık 16,1 saat"],["Uydu","16"],["Sıcaklık","yaklaşık −200 °C"]]}
];
var sel=3,speed=120,paused=false,days=0,mo=matchMedia("(prefers-reduced-motion:reduce)").matches;
var pk=$("picker");
function show(i){sel=i;var p=P[i];document.documentElement.style.setProperty("--ac",p.col);
$("pname").textContent=p.n;$("pdesc").textContent=p.d;
$("pdata").innerHTML=p.v.map(function(x){return"<dt>"+x[0]+"</dt><dd>"+x[1]+"</dd>"}).join("");
[].forEach.call(pk.children,function(b,j){b.setAttribute("aria-pressed",j===i)})}
P.forEach(function(p,i){p.ang=Math.random()*6.283;var b=document.createElement("button");b.textContent=p.n;b.onclick=function(){show(i)};pk.appendChild(b)});
show(3);
document.querySelectorAll("[data-sp]").forEach(function(b){b.onclick=function(){speed=+b.dataset.sp;paused=false;sync()}});
$("pp").onclick=function(){paused=!paused;sync()};
function sync(){$("pp").setAttribute("aria-pressed",paused);$("pp").textContent=paused?"Devam":"Duraklat";document.querySelectorAll("[data-sp]").forEach(function(b){b.setAttribute("aria-pressed",!paused&&+b.dataset.sp===speed)})}
sync();

var cv=$("orr"),c=cv.getContext("2d"),W,H,U,CX,CY,belt=[];
for(var k=0;k<260;k++)belt.push({a:1.55+Math.random()*.4,t:Math.random()*6.283,s:Math.random()*.9+.5,r:Math.random()*.9+.3});
function size(){var d=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);CX=W/2;CY=H/2;U=(Math.min(W,H)/2-16)/5.7}
var gu=U,gx=0,gy=0,z=1,cam=[0,0],off=[0,0],focus=false,lw=0,last=0,
RH=[600,1408,-5832,24,24.6,9.9,10.7,-17.2,16.1],
FC=[["rgba(200,70,10,.6)","rgba(255,230,140,.6)"],["rgba(90,84,78,.55)","rgba(210,200,190,.35)"],["rgba(255,235,190,.5)","rgba(190,130,60,.4)"],["rgba(63,155,74,.9)","rgba(255,255,255,.75)"],["rgba(110,45,20,.55)","rgba(240,210,190,.5)"],["rgba(150,80,50,.55)","rgba(245,230,205,.5)"],["rgba(190,150,95,.5)","rgba(250,240,205,.5)"],["rgba(150,225,230,.4)","rgba(60,150,160,.4)"],["rgba(20,40,150,.55)","rgba(190,210,255,.5)"]];
P.forEach(function(p,i){var s=i*7919+13;function R(){s=(s*16807)%2147483647;return s/2147483647}
p.spin=0;p.rd=4;p.rate=(RH[i]<0?-1:1)*Math.min(1.2,Math.max(.05,12/Math.abs(RH[i])));p.feat=[];
for(var k=0;k<16;k++)p.feat.push({la:(R()-.5)*2.3,lo:R()*6.283,s:.12+R()*.2,c:FC[i][k%2]});
p.bands=i===5||i===6});
function pos(p){var r=p.a*gu;return[gx+Math.cos(p.ang)*r,gy+Math.sin(p.ang)*r]}
function hexA(h,a){var n=parseInt(h.slice(1),16);return"rgba("+(n>>16)+","+(n>>8&255)+","+(n&255)+","+a+")"}
function feats(q,r,p){p.feat.forEach(function(f){var lo=f.lo+p.spin,cl=Math.cos(lo);if(cl<=0)return;c.fillStyle=f.c;c.beginPath();c.ellipse(q[0]+r*Math.cos(f.la)*Math.sin(lo),q[1]-r*Math.sin(f.la),f.s*r*cl,f.s*r*.9,0,0,6.283);c.fill()})}
function globe(q,r,p,dx,dy){c.fillStyle=p.col;c.beginPath();c.arc(q[0],q[1],r,0,6.283);c.fill();c.save();c.clip();
if(p.bands){for(var j=0;j<9;j+=2){c.fillStyle="rgba(120,70,40,.25)";c.fillRect(q[0]-r,q[1]-r+j*r*2/9,r*2,r*2/9)}}
feats(q,r,p);
var g=c.createRadialGradient(q[0]-dx*r*.5,q[1]-dy*r*.5,r*.15,q[0]-dx*r*.2,q[1]-dy*r*.2,r*1.5);
g.addColorStop(0,"rgba(255,255,255,.12)");g.addColorStop(.5,"rgba(0,0,0,.1)");g.addColorStop(1,"rgba(0,0,0,.85)");
c.fillStyle=g;c.fillRect(q[0]-r,q[1]-r,r*2,r*2);c.restore()}
function rg(q,r,front){var a=front?0:Math.PI,b=front?Math.PI:6.283;
c.strokeStyle="rgba(230,205,150,.75)";c.lineWidth=Math.max(1.5,r*.3);c.beginPath();c.ellipse(q[0],q[1],r*1.9,r*.6,-.4,a,b);c.stroke();
c.strokeStyle="rgba(190,160,110,.6)";c.lineWidth=Math.max(1,r*.12);c.beginPath();c.ellipse(q[0],q[1],r*1.5,r*.48,-.4,a,b);c.stroke()}
function fly(f){focus=f;var tg=f?(sel?pos(P[sel]):[gx,gy]):[W/2,H/2];off=[cam[0]-tg[0],cam[1]-tg[1]];$("all").setAttribute("aria-pressed",!f)}
var _show=show;show=function(i,nz){_show(i);if(!nz)fly(true)};
$("all").onclick=function(){fly(false)};
function draw(ts){var dt=Math.min((ts-last)/1000,.1);last=ts;
if(W!==lw){lw=W;cam=[W/2,H/2];off=[0,0]}
if(!mo){if(!paused){days+=speed*dt;P.forEach(function(p){if(p.T)p.ang+=6.283*speed*dt/p.T})}P.forEach(function(p){p.spin+=p.rate*dt})}
gu=U*.55;gx=W*.68;gy=CY;
var sr=U*.22*(1+.025*Math.sin(ts/600)),sc=Math.min(1,U/48)*.8,m=Math.min(W,H);
P[0].rd=sr;P.forEach(function(p){if(p.a)p.rd=p.pr*Math.max(sc,.5)});
var tg=focus?(sel?pos(P[sel]):[gx,gy]):[W/2,H/2],k=Math.exp(-(mo?60:5)*dt);
off[0]*=k;off[1]*=k;cam=[tg[0]+off[0],tg[1]+off[1]];
var zt=focus?Math.min(.22*m/P[sel].rd,Math.max(1,.5*m/(Math.hypot(off[0],off[1])+1))):1;
z=Math.exp(Math.log(z)+(Math.log(zt)-Math.log(z))*(1-Math.exp(-(mo?60:4)*dt)));
c.clearRect(0,0,W,H);c.save();c.translate(W/2,H/2);c.scale(z,z);c.translate(-cam[0],-cam[1]);
var dr=U*1.1/365,tm=gx/dr,sq=Math.sqrt(z),g;
P.forEach(function(p,i){if(!p.a)return;var r=p.a*gu,n=Math.min(700,Math.max(14,Math.ceil(tm/p.T*24))),gr=c.createLinearGradient(gx,0,0,0);
gr.addColorStop(0,hexA(p.col,i===sel?.95:.5));gr.addColorStop(1,hexA(p.col,0));
c.strokeStyle=gr;c.lineWidth=(i===sel?2.2:1.2)/sq;c.beginPath();
for(var j=0;j<=n;j++){var t=tm*j/n,an=p.ang-6.283*t/p.T,X=gx+Math.cos(an)*r-dr*t,Y=gy+Math.sin(an)*r;j?c.lineTo(X,Y):c.moveTo(X,Y)}c.stroke()});
g=c.createLinearGradient(gx,0,0,0);g.addColorStop(0,"rgba(255,190,80,.55)");g.addColorStop(1,"rgba(255,190,80,0)");
c.strokeStyle=g;c.lineWidth=2/sq;c.beginPath();c.moveTo(gx,gy);c.lineTo(0,gy);c.stroke();
g=c.createRadialGradient(gx,gy,sr*.2,gx,gy,sr*4.5);
g.addColorStop(0,"rgba(255,200,90,.55)");g.addColorStop(.25,"rgba(255,140,40,.2)");g.addColorStop(1,"rgba(255,120,40,0)");
c.fillStyle=g;c.beginPath();c.arc(gx,gy,sr*4.5,0,6.283);c.fill();
g=c.createRadialGradient(gx-sr*.3,gy-sr*.3,sr*.1,gx,gy,sr);g.addColorStop(0,"#fff6c8");g.addColorStop(.5,"#ffb347");g.addColorStop(1,"#e8590c");
c.fillStyle=g;c.beginPath();c.arc(gx,gy,sr,0,6.283);c.fill();
if(sr*z>7){c.save();c.beginPath();c.arc(gx,gy,sr,0,6.283);c.clip();feats([gx,gy],sr,P[0]);c.restore()}
if(sel===0&&z<3){c.strokeStyle="#ffb347";c.lineWidth=2/z;c.beginPath();c.arc(gx,gy,sr+7/z,0,6.283);c.stroke()}
P.forEach(function(p,i){if(!p.a)return;var q=pos(p),r=p.rd,dx=Math.cos(p.ang),dy=Math.sin(p.ang);
if(p.ring)rg(q,r,0);
if(r*z>7)globe(q,r,p,dx,dy);else{var gr=c.createRadialGradient(q[0]-dx*r*.5,q[1]-dy*r*.5,r*.1,q[0],q[1],r*1.1);gr.addColorStop(0,"#fff");gr.addColorStop(.25,p.col);gr.addColorStop(1,"#05060c");
c.fillStyle=gr;c.beginPath();c.arc(q[0],q[1],r,0,6.283);c.fill()}
if(p.ring)rg(q,r,1);
if(i===sel&&z<3){c.strokeStyle=p.col;c.lineWidth=2/z;c.beginPath();c.arc(q[0],q[1],r+6/z,0,6.283);c.stroke()}});
c.restore();
if(z<2&&W>560){c.font="13px Instrument Sans,sans-serif";c.textAlign="center";c.fillStyle="rgba(220,226,255,.7)";P.forEach(function(p,i){if(!p.a||i===sel)return;var q=pos(p);c.fillText(p.n,W/2+(q[0]-cam[0])*z,H/2+(q[1]-cam[1])*z-p.rd*z-7)})}
var s=P[sel];c.textAlign="left";c.fillStyle=s.col;c.font="800 26px Fraunces,Georgia,serif";c.fillText(s.n,14,32);
c.fillStyle="rgba(220,226,255,.8)";c.font="13px Instrument Sans,sans-serif";c.fillText(s.v[0][0]+": "+s.v[0][1],14,52);c.fillText(s.v[1][0]+": "+s.v[1][1],14,70);
c.fillStyle="rgba(220,226,255,.5)";c.textAlign="center";c.fillText("‹  sağa / sola kaydır  ›",W/2,H-10);
var y=days/365.25;$("clock").textContent=y<1?Math.round(days)+" gün geçti":y.toFixed(1).replace(".",",")+" Dünya yılı geçti";
requestAnimationFrame(draw)}
function pick(e){var rc=cv.getBoundingClientRect(),mx=e.clientX-rc.left,my=e.clientY-rc.top,best=-1,bd=34;
P.forEach(function(p,i){var q=p.a?pos(p):[gx,gy],d=Math.max(0,Math.hypot(W/2+(q[0]-cam[0])*z-mx,H/2+(q[1]-cam[1])*z-my)-p.rd*z);if(d<bd){bd=d;best=i}});if(best>=0)show(best)}
function go(d){show((sel+d+P.length)%P.length)}
var tx=0,ty=0,lt=0;
function endG(x,y,e){var dx=x-tx,dy=y-ty;if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.2)go(dx<0?1:-1);else if(Math.abs(dx)<12&&Math.abs(dy)<12)pick(e)}
cv.addEventListener("touchstart",function(e){var t=e.touches[0];tx=t.clientX;ty=t.clientY},{passive:true});
cv.addEventListener("touchend",function(e){var t=e.changedTouches[0];lt=Date.now();endG(t.clientX,t.clientY,t)},{passive:true});
cv.addEventListener("mousedown",function(e){if(Date.now()-lt<800)return;tx=e.clientX;ty=e.clientY});
cv.addEventListener("mouseup",function(e){if(Date.now()-lt<800)return;endG(e.clientX,e.clientY,e)});
cv.tabIndex=0;
cv.addEventListener("keydown",function(e){if(e.key==="ArrowRight")go(1);else if(e.key==="ArrowLeft")go(-1);else return;e.preventDefault()});
addEventListener("resize",size);size();requestAnimationFrame(draw);

var B=P.slice(1).map(function(p){return'<div class="row"><span>'+p.n+'</span><div class="bar"><i style="background:'+p.col+'" data-w="'+(p.e/11.2*100)+'"></i></div><span>'+String(p.e).replace(".",",")+"×</span></div>"}).join("");
$("bars").innerHTML=B;
function grow(){document.querySelectorAll("#bars i").forEach(function(e,k){setTimeout(function(){e.style.width=e.dataset.w+"%"},k*100)})}
if("IntersectionObserver" in window){new IntersectionObserver(function(en,o){if(en[0].isIntersecting){grow();o.disconnect()}},{threshold:.2}).observe($("bars"))}else grow();

var lb=$("lb"),lbi=lb.querySelector("img"),lbp=lb.querySelector("p"),from=null;
document.querySelectorAll(".zb").forEach(function(b){b.onclick=function(){var im=b.querySelector("img");lbi.src=im.src;lbi.alt=im.alt;lbp.textContent=b.parentNode.querySelector("figcaption").textContent;lb.hidden=false;from=b;$("lbx").focus()}});
function cl(){lb.hidden=true;if(from)from.focus()}
lb.onclick=function(e){if(e.target!==lbi)cl()};
addEventListener("keydown",function(e){if(e.key==="Escape"&&!lb.hidden)cl()});
function hs(x,y,z){var h=Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(z|0,1274126177)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function vn(x,y,z){var xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z),xf=x-xi,yf=y-yi,zf=z-zi;
xf=xf*xf*(3-2*xf);yf=yf*yf*(3-2*yf);zf=zf*zf*(3-2*zf);
function L(a,b,t){return a+(b-a)*t}
return L(L(L(hs(xi,yi,zi),hs(xi+1,yi,zi),xf),L(hs(xi,yi+1,zi),hs(xi+1,yi+1,zi),xf),yf),L(L(hs(xi,yi,zi+1),hs(xi+1,yi,zi+1),xf),L(hs(xi,yi+1,zi+1),hs(xi+1,yi+1,zi+1),xf),yf),zf)}
function fb(x,y,z,o){var s=0,a=.5;for(var i=0;i<o;i++){s+=a*vn(x,y,z);x*=2.03;y*=2.03;z*=2.03;a*=.5}return s*1.6}
function mx(a,b,t){t=t<0?0:t>1?1:t;return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]}
var TW=384,TH=192;
function mk(i){var d=new Uint8ClampedArray(TW*TH*4);
for(var v=0;v<TH;v++){var la=(v/TH-.5)*3.1416,cl=Math.cos(la),Y=Math.sin(la);
for(var u=0;u<TW;u++){var lo=u/TW*6.2832,X=cl*Math.cos(lo),Z=cl*Math.sin(lo),c,n;
switch(i){
case 0:n=fb(X*7,Y*7,Z*7,3);c=mx([210,80,10],[255,228,125],(n-.4)*2.2);break;
case 1:n=fb(X*5,Y*5,Z*5,3);c=mx([62,58,54],[185,175,165],n*1.1+Math.abs(fb(X*10,Y*10,Z*10,2)-.5)*.5-.15);break;
case 2:n=fb(X*2.4,Y*6,Z*2.4,3);c=mx([196,140,64],[252,230,170],n*1.2-.1);break;
case 3:n=fb(X*2.2+3,Y*2.2,Z*2.2,4);
if(n>.84)c=mx([46,118,48],[168,138,84],(n-.84)*3);else c=mx([8,34,112],[34,104,205],n*1.2-.3);
c=mx(c,[240,246,252],(Math.abs(Y)-.84)*14);
n=fb(X*3.5+9,Y*5,Z*3.5,3);c=mx(c,[255,255,255],(n-.85)*2.4);break;
case 4:n=fb(X*3,Y*3,Z*3,4);c=mx([150,68,34],[206,124,72],n*1.2);n=fb(X*2+7,Y*2,Z*2,3);if(n>.85)c=mx(c,[70,36,28],(n-.85)*4);c=mx(c,[245,240,235],(Math.abs(Y)-.9)*12);break;
case 5:case 6:n=fb(X*3,Y*.5,Z*3,3);var bd=Math.sin(la*(i===5?11:9)+n*(i===5?3:2))*.5+.5;
c=i===5?mx([150,92,58],[242,222,192],bd):mx([205,172,112],[246,232,192],bd*.8+.1);
n=fb(X*6,Y*1.5,Z*6,2);c=mx(c,[255,245,225],(n-.6)*1.2);
if(i===5){var dx=Math.atan2(Math.sin(lo-1),Math.cos(lo-1)),dy=la+.33,e=dx*dx/.08+dy*dy/.012;if(e<1)c=mx(c,[188,64,36],(1-e)*1.4)}break;
case 7:n=fb(X*1.5,Y*3,Z*1.5,3);c=mx([104,196,204],[168,234,238],n*1.1+Math.sin(la*6)*.1);break;
default:n=fb(X*2,Y*3,Z*2,3);c=mx([26,56,184],[70,112,244],Math.sin(la*7+n*3)*.35+.5);n=fb(X*5,Y*1.2,Z*5,3);if(n>.95)c=mx(c,[225,235,255],(n-.95)*3)}
var k=(v*TW+u)*4;d[k]=c[0];d[k+1]=c[1];d[k+2]=c[2];d[k+3]=255}}
return d}
var GS=300,gc=$("gl"),gg=gc.getContext("2d"),oc=document.createElement("canvas");oc.width=oc.height=GS;
var ox=oc.getContext("2d"),img=ox.createImageData(GS,GS),gp=3,rot=0,tilt=.3,iv=0,drag=false,lx=0,ly=0,gl0=0,vis=true;
var _s2=show;show=function(i,nz){_s2(i,nz);gp=i};
function ringD(front){var R=GS*.23,c0=GS/2,s=Math.max(.03,Math.abs(Math.sin(tilt))),a0=(tilt>=0)===front?0:Math.PI;
for(var k=0;k<5;k++){var a=R*(1.4+k*.17);gg.strokeStyle="rgba(235,215,170,"+(.6-k*.07)+")";gg.lineWidth=R*.13;gg.beginPath();gg.ellipse(c0,c0,a,a*s,0,a0,a0+Math.PI);gg.stroke()}}
function gdraw(ts){requestAnimationFrame(gdraw);if(!vis)return;var dt=Math.min((ts-gl0)/1000,.1);gl0=ts;
var p=P[gp];if(!p.tex)p.tex=mk(gp);if(!p.rgb){var h=parseInt(p.col.slice(1),16);p.rgb=[h>>16,h>>8&255,h&255]}
if(!drag&&!mo){iv*=Math.exp(-2.5*dt);rot+=(iv+p.rate*.6)*dt}
var T=p.tex,d=img.data,R=GS*(gp===6?.23:.36),c0=GS/2,ce=Math.cos(tilt),se=Math.sin(tilt),cr=Math.cos(rot),sn=Math.sin(rot),a=Math.max(0,Math.floor(c0-R-2)),b=Math.min(GS,Math.ceil(c0+R+2)),sun=gp===0;
d.fill(0);
for(var y=a;y<b;y++)for(var x=a;x<b;x++){var nx=(x-c0+.5)/R,ny=(c0-y-.5)/R,r2=nx*nx+ny*ny;if(r2>1)continue;
var al=Math.min(1,(1-Math.sqrt(r2))*R+.5),nz=Math.sqrt(1-r2),y1=ny*ce+nz*se,z1=nz*ce-ny*se,x2=nx*cr-z1*sn,z2=nx*sn+z1*cr,
tu=(((Math.atan2(z2,x2)/6.2832)+1)%1)*TW|0,tv=(Math.asin(y1>1?1:y1<-1?-1:y1)/3.1416+.5)*TH|0;
if(tv>=TH)tv=TH-1;var t=(tv*TW+tu)*4,s,rm=0;
if(sun){s=.62+.55*Math.pow(nz,.6)}else{var df=-.55*nx+.5*ny+.67*nz;df=df>0?df:0;s=.05+.95*Math.pow(df,.85);rm=Math.pow(1-nz,3)*df*.9}
var o=(y*GS+x)*4;d[o]=T[t]*s+p.rgb[0]*rm;d[o+1]=T[t+1]*s+p.rgb[1]*rm;d[o+2]=T[t+2]*s+p.rgb[2]*rm;d[o+3]=al*255}
ox.putImageData(img,0,0);gg.clearRect(0,0,GS,GS);
if(sun){var g=gg.createRadialGradient(c0,c0,R*.9,c0,c0,GS*.5);g.addColorStop(0,"rgba(255,170,60,.55)");g.addColorStop(1,"rgba(255,120,40,0)");gg.fillStyle=g;gg.fillRect(0,0,GS,GS)}
if(gp===6)ringD(false);gg.drawImage(oc,0,0);if(gp===6)ringD(true)}
gc.addEventListener("pointerdown",function(e){drag=true;lx=e.clientX;ly=e.clientY;iv=0;if(gc.setPointerCapture)gc.setPointerCapture(e.pointerId)});
gc.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;rot+=dx*.012;tilt=Math.max(-1.2,Math.min(1.2,tilt+dy*.008));iv=Math.max(-8,Math.min(8,dx*.72))});
["pointerup","pointercancel"].forEach(function(n){gc.addEventListener(n,function(){drag=false})});
if("IntersectionObserver" in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting},{rootMargin:"120px"}).observe(gc);
requestAnimationFrame(gdraw);
if(!mo){document.querySelectorAll(".card,.stats div,.zb").forEach(function(e){
e.addEventListener("pointermove",function(ev){var r=e.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width-.5,py=(ev.clientY-r.top)/r.height-.5;e.style.setProperty("--mx",(px+.5)*100+"%");e.style.setProperty("--my",(py+.5)*100+"%");e.style.transform="perspective(700px) rotateX("+(-py*12).toFixed(1)+"deg) rotateY("+(px*14).toFixed(1)+"deg) translateZ(10px)"});
["pointerleave","pointerup","pointercancel"].forEach(function(n){e.addEventListener(n,function(){e.style.transform=""})})});
var hd=document.querySelector("header"),h1=document.querySelector("h1");
hd.addEventListener("pointermove",function(ev){var r=hd.getBoundingClientRect();h1.style.setProperty("--ry",((ev.clientX-r.left)/r.width-.5)*16+"deg");h1.style.setProperty("--rx",-((ev.clientY-r.top)/r.height-.5)*10+"deg")});
hd.addEventListener("pointerleave",function(){h1.style.setProperty("--ry","0deg");h1.style.setProperty("--rx","0deg")});
if("IntersectionObserver" in window){try{var de=document.documentElement;de.classList.add("js");
var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){var e=x.target;io.unobserve(e);e.classList.add("in");setTimeout(function(){e.classList.remove("rv","in");e.style.transitionDelay=""},1400)}})},{threshold:.08});
document.querySelectorAll("section>h2,section>p,.card,details,.time div,.split,.stage").forEach(function(e,i){e.classList.add("rv");e.style.transitionDelay=(i%5)*70+"ms";io.observe(e)})}catch(er){document.documentElement.classList.remove("js")}}}
var fine=matchMedia("(hover:hover) and (pointer:fine)").matches&&!mo;
function fmt(s){var h=Math.floor(s/3600),m=Math.floor(s%3600/60),c=Math.floor(s%60);return h?h+" sa "+Math.round(s%3600/60)+" dk":m?m+" dk "+c+" sn":c+" sn"}
var pre=$("pre"),pc=$("pc"),tp=0;
if(!mo){(function pf(ts){if(!tp)tp=ts;var p=Math.min(1,(ts-tp)/1500),s=Math.round(499*(1-Math.pow(1-p,3)));pc.textContent=Math.floor(s/60)+":"+("0"+s%60).slice(-2);if(p<1)requestAnimationFrame(pf)})(0);requestAnimationFrame(function f(ts){if(!tp)tp=ts});
pre.onclick=function(){pre.style.display="none";document.documentElement.classList.add("sk")}}
var he=document.querySelector("h1");
if(he&&!mo){var ht=he.textContent;he.setAttribute("aria-label",ht);var li=0;he.innerHTML=ht.split(" ").map(function(w){return'<span style="white-space:nowrap">'+w.split("").map(function(ch){return'<span class="ltr" aria-hidden="true" style="--i:'+(li++)+'">'+ch+"</span>"}).join("")+"</span>"}).join(" ")}
var pg=$("prog"),mq=document.querySelector(".mq"),ly=0,vt=0;
addEventListener("scroll",function(){var y=window.pageYOffset||0,m=Math.max(1,document.documentElement.scrollHeight-innerHeight);pg.style.setProperty("--p",Math.min(1,y/m));
if(mq&&!mo){mq.style.setProperty("--v",Math.max(-6,Math.min(6,(y-ly)*.06))+"deg");clearTimeout(vt);vt=setTimeout(function(){mq.style.setProperty("--v","0deg")},140)}ly=y},{passive:true});
if("IntersectionObserver" in window){var lk=document.querySelectorAll("nav a"),no=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting)lk.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")==="#"+x.target.id)})})},{rootMargin:"-45% 0px -50% 0px"});
document.querySelectorAll("section[id]").forEach(function(s){no.observe(s)})}
if(fine){var cu=document.createElement("div");cu.id="cur";document.body.appendChild(cu);var cx=0,cy=0,qx=0,qy=0;
addEventListener("pointermove",function(e){qx=e.clientX;qy=e.clientY;cu.style.opacity=1;cu.classList.toggle("big",!!(e.target.closest&&e.target.closest("a,button,.zb,#orr,#gl")))},{passive:true});
(function f(){cx+=(qx-cx)*.18;cy+=(qy-cy)*.18;cu.style.transform="translate("+cx+"px,"+cy+"px)";requestAnimationFrame(f)})();
document.querySelectorAll("nav a,.picker button,.ctl button,#go,#top").forEach(function(e){
e.addEventListener("pointermove",function(ev){var r=e.getBoundingClientRect();e.style.transform="translate("+((ev.clientX-r.left-r.width/2)*.3).toFixed(1)+"px,"+((ev.clientY-r.top-r.height/2)*.4).toFixed(1)+"px)"});
e.addEventListener("pointerleave",function(){e.style.transform=""})})}
var RT=[193,360,499,760,2595,4783,9577,14994],rl=$("lanes"),r0=null,rr=false;
rl.innerHTML=RT.map(function(s,i){var p=P[i+1];return'<div class="ln"><span>'+p.n+'</span><div class="bar"><i id="lf'+i+'" style="background:'+p.col+'"></i></div><b id="lt'+i+'">'+fmt(s)+"</b></div>"}).join("");
function rf(ts){if(r0===null)r0=ts;var e=mo?14994:(ts-r0)/1000*(14994/9),dn=true;
RT.forEach(function(s,i){var f=Math.min(1,e/s);$("lf"+i).style.width=f*100+"%";$("lt"+i).classList.toggle("ok",f>=1);if(f<1)dn=false});
$("rt").textContent=fmt(Math.min(e,14994));if(!dn)requestAnimationFrame(rf);else rr=false}
$("go").onclick=function(){if(rr)return;rr=true;r0=null;requestAnimationFrame(rf)};
function scr(el,t){if(mo){el.textContent=t;return}var n=0,cs="ABCDEFGHIJKLMNOPRSTUVYZ0123456789";(function f(){el.textContent=t.split("").map(function(c,i){return i<n||c===" "?c:cs[Math.random()*cs.length|0]}).join("");if(n<t.length){n+=.5;setTimeout(f,35)}else el.textContent=t})()}
var _s3=show;show=function(i,nz){_s3(i,nz);scr($("pname"),P[i].n);$("sr").textContent=P[i].n+" seçildi"};
$("top").onclick=function(){scrollTo({top:0,behavior:mo?"auto":"smooth"})};
var sk=$("sky"),x=sk.getContext("2d"),st=[],SW,SH;
function rs(){SW=sk.width=innerWidth;SH=sk.height=innerHeight;st=[];for(var i=0;i<Math.min(260,SW*SH/5200);i++){var d=Math.random();st.push({x:Math.random()*SW,y:Math.random()*SH,d:d,r:d*1.2+.2,t:Math.random()*6.3,v:Math.random()*.02+.005})}}
function ds(){x.clearRect(0,0,SW,SH);var sy=window.pageYOffset||0;st.forEach(function(s){s.t+=s.v;var y=((s.y-sy*s.d*.3)%SH+SH)%SH;x.fillStyle="rgba(233,236,255,"+((.25+.5*s.d)*(.7+.3*Math.sin(s.t))).toFixed(2)+")";x.beginPath();x.arc(s.x,y,s.r,0,6.283);x.fill()});if(!mo)requestAnimationFrame(ds)}
addEventListener("resize",function(){rs();if(mo)ds()});rs();ds();
})();
