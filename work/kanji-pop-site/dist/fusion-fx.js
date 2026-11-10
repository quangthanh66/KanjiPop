/* Local, bounded canvas effects. No assets or network requests are needed. */
(()=>{
 'use strict';
 const themes=[
  {id:'lightning',name:'SẤM SÉT',colors:['#ffd34f','#fff0a0','#ffffff']},
  {id:'nature',name:'MẦM SỐNG',colors:['#8aff93','#d6ff80','#64edbd']},
  {id:'fire',name:'HỎA DIỆM',colors:['#ff7c38','#ffe67b','#ff4070']},
  {id:'magic',name:'PHÉP THUẬT',colors:['#cb9fff','#ffacdf','#85e9ff']},
  {id:'water',name:'THỦY TRIỀU',colors:['#57cfff','#9dfff2','#d4f5ff']},
  {id:'fireworks',name:'PHÁO HOA',colors:['#ff83bd','#ffe27c','#85f3ff','#b6a0ff','#a2ffb5']},
  {id:'ice',name:'BĂNG TINH',colors:['#c2e9ff','#edfaff','#a7bfdc']},
  {id:'earth',name:'TINH THẠCH',colors:['#e5ac70','#ffdfaa','#c8894e']}
 ];
 const tau=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
 function play({host,center,source,tier=1,sequence=0,reduced=false,quality="full",duration:requestedDuration,themeId=null,pair=null,ingredients=[],cinematic=false,onFrame}){
  if(quality==="light")tier=1;
  // Live matches use the same palette-to-element mapping as the objective marker.
  // Explicit theme selection remains available for previews, but cannot override a pair.
  const element=Number.isInteger(pair)?window.KanjiGemArt.elementFor(pair):null;
  const resolvedTheme=element==='thunder'?'lightning':element||themeId;
  const baseTheme=themes.find(t=>t.id===resolvedTheme)||themes[((sequence%6)+Math.floor(sequence/6)*2)%6];
  const theme={...baseTheme,colors:[...baseTheme.colors]},animationDuration=3500+tier*220,duration=requestedDuration||(cinematic?2200:animationDuration);
  let themeRgb=[203,159,255];
  if(cinematic&&ingredients[0]){const hex=ingredients[0].node.style.getPropertyValue('--tile-mid').trim();if(/^#[\da-f]{6}$/i.test(hex)){themeRgb=hex.slice(1).match(/../g).map(v=>parseInt(v,16));const tint=f=>'#'+themeRgb.map(v=>Math.round(v+(255-v)*f).toString(16).padStart(2,'0')).join('');theme.colors=[hex,tint(.55),tint(.9)];}}
  else if(/^#[\da-f]{6}$/i.test(theme.colors[0]))themeRgb=theme.colors[0].slice(1).match(/../g).map(v=>parseInt(v,16));
  if(reduced)return {duration:0,theme};
  const crafted=cinematic||['lightning','water','magic','fire','nature','ice','earth'].includes(theme.id);
  const overlay=document.createElement('div');overlay.className='fusion-overlay';overlay.setAttribute('aria-hidden','true');
  if(crafted)overlay.dataset.choreography=theme.id;
  const canvas=document.createElement('canvas');canvas.className='fusion-canvas';canvas.dataset.theme=theme.id;overlay.append(canvas);document.body.append(overlay);
  const ctx=canvas.getContext('2d');if(!ctx){overlay.remove();return {duration:0,theme};}
  let w=0,h=0,unit,radius,cx,cy,origin,sourcePoint,resultNode,resultSize=0,resultDestination;
  function layout(){
   w=document.documentElement.clientWidth;h=window.innerHeight;const dpr=Math.min(devicePixelRatio||1,quality==="light"?1:2);
   canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
   const rect=host.getBoundingClientRect();origin={x:rect.left+center.x,y:rect.top+center.y};sourcePoint={x:rect.left+source.x,y:rect.top+source.y};
   unit=Math.min(host.clientWidth/3.7,host.clientHeight/3,w/6,h/6,150);radius=unit*(1.1+tier*.1);
   const marginX=radius*1.7+12,marginY=radius*1.8+12;
   const target=crafted?{x:(origin.x+sourcePoint.x)/2,y:(origin.y+sourcePoint.y)/2}:origin;
   cx=cinematic?w/2:Math.max(marginX,Math.min(w-marginX,target.x));cy=cinematic?h/2:Math.max(marginY,Math.min(h-marginY,target.y));
   overlay.dataset.centerX=cx;overlay.dataset.centerY=cy;overlay.dataset.radius=radius;
   if(resultNode){if(cinematic)measureResult();else{resultNode.style.left=(cx-resultSize/2)+'px';resultNode.style.top=(cy-resultSize/2)+'px';}}
  }
  layout();
  if(crafted)ingredients.forEach(p=>{p.node.className='result-gem fusion-ingredient';p.node.style.width=p.width+'px';p.node.style.height=p.height+'px';p.node.style.animation='none';p.node.style.left='0';p.node.style.top='0';p.node.style.transform=`translate(${p.x-p.width/2}px,${p.y-p.height/2}px)`;overlay.append(p.node);});
  let seed=sequence*1597+tier*127+41;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const baseRadius=radius;
  const particles=Array.from({length:quality==="light"?32:64+tier*24},(_,i)=>({a:rand()*tau,r:.45+rand()*.8,size:1.3+rand()*3,lag:rand()*.38,spin:rand()*tau,color:theme.colors[i%theme.colors.length]}));
  const bolts=Array.from({length:4+tier*2},(_,i)=>{const a=i*tau/(4+tier*2),points=[[0,0]];for(let j=1;j<=7;j++){const r=radius*j/7,offset=(rand()-.5)*unit*.35;points.push([Math.cos(a)*r-Math.sin(a)*offset,Math.sin(a)*r+Math.cos(a)*offset]);}return points;});
  function line(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();}
  function ring(x,y,r,color,width=1,sy=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,r),Math.max(.1,r*sy),0,0,tau);ctx.stroke();}
  function star(x,y,r,color){ctx.fillStyle=color;ctx.beginPath();for(let i=0;i<8;i++){const a=i*tau/8,rr=i%2?r*.25:r;const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}
  function leaf(x,y,size,angle,color){ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-size,0);ctx.quadraticCurveTo(0,-size,size,0);ctx.quadraticCurveTo(0,size,-size,0);ctx.fill();line([[-size*.7,0],[size*.7,0]],'#eaffd6',.7);ctx.restore();}
  function bloom(x,y,size,angle){ctx.save();ctx.translate(x,y);ctx.rotate(angle);for(let i=0;i<5;i++){ctx.rotate(tau/5);ctx.fillStyle=i%2?'#ffd0ee':'#fff0b0';ctx.beginPath();ctx.ellipse(size*.6,0,size*.65,size*.33,0,0,tau);ctx.fill();}star(0,0,size*.35,'#fff');ctx.restore();}
  function crystal(x,y,size,angle,ice=false){
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);
   if(ice){for(let i=0;i<6;i++){ctx.rotate(tau/6);line([[0,0],[0,-size]],theme.colors[0],1.5);line([[-size*.24,-size*.65],[0,-size*.4],[size*.24,-size*.65]],theme.colors[1],1);}}
   else{ctx.fillStyle=theme.colors[0];ctx.beginPath();ctx.moveTo(0,-size);ctx.lineTo(size*.45,-size*.2);ctx.lineTo(size*.3,size*.6);ctx.lineTo(-size*.3,size*.6);ctx.lineTo(-size*.45,-size*.2);ctx.closePath();ctx.fill();line([[0,-size],[0,size*.6]],theme.colors[1],1.3);line([[-size*.45,-size*.2],[0,0],[size*.45,-size*.2]],theme.colors[2],1.1);}
   ctx.restore();
  }
  function flourish(t){
   const age=t-.5;if(age<0)return;const life=clamp(age/.5)*clamp((animationDuration/1000-t)/.7);
   ctx.save();ctx.globalAlpha=life;
   // A second expanding wave and orbiting trails continue beyond the initial burst.
   for(let wave=0;wave<2;wave++){const p=clamp((age-wave*.55)/1.7);if(p<=0||p>=1)continue;ctx.globalAlpha=life*(1-p)*.5;ring(cx,cy,radius*(.2+p*1.12),theme.colors[wave],2+2*(1-p),theme.id==='water'?.65:1);}
   ctx.globalAlpha=life;
   if(theme.id==='magic'){
    for(let orbit=0;orbit<2;orbit++){ctx.save();ctx.translate(cx,cy);ctx.rotate((orbit?-1:1)*t*.4);const r=radius*(1.05+orbit*.19);ctx.setLineDash([4,9]);ring(0,0,r,theme.colors[orbit],1.3);ctx.setLineDash([]);for(let i=0;i<12;i++){const a=i*tau/12;star(Math.cos(a)*r,Math.sin(a)*r,i%3===0?6:3,theme.colors[(i+orbit)%3]);}ctx.restore();}
   }else if(theme.id==='nature'){
    for(let i=0;i<5+tier;i++){const a=i*tau/(5+tier)+.2*Math.sin(t),r=radius*(.55+clamp(age/1.4)*.58),growth=clamp((age-i*.09)/.6);ctx.globalAlpha=life*growth;bloom(cx+Math.cos(a)*r,cy+Math.sin(a)*r,unit*.09*growth,t*.2+a);}
   }else if(theme.id==='fire'||theme.id==='water'){
    for(let strand=0;strand<3+tier;strand++){const points=[];for(let j=0;j<30;j++){const p=j/29,a=p*tau*.78+strand*tau/(3+tier)+(theme.id==='fire'?t:-t)*.8,r=radius*(.3+p*.8);points.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r*(theme.id==='water'?.7:1)]);}ctx.globalAlpha=life*.3;line(points,theme.colors[strand%3],8);ctx.globalAlpha=life*.8;line(points,theme.colors[(strand+1)%3],1.6);const tip=points.at(-1);star(tip[0],tip[1],5,theme.colors[strand%3]);}
   }else if(theme.id==='lightning'){
    for(let i=0;i<3+tier;i++){const a=i*tau/(3+tier)+t*.2,x=cx+Math.cos(a)*radius*1.12,y=cy+Math.sin(a)*radius*1.12;ctx.globalAlpha=life*.8;star(x,y,5,theme.colors[1]);const fork=[[x,y],[x+Math.cos(a+.5)*unit*.13,y+Math.sin(a+.5)*unit*.13],[x+Math.cos(a)*unit*.23,y+Math.sin(a)*unit*.23]];line(fork,theme.colors[0],1.2);}
   }else if(theme.id==='ice'||theme.id==='earth'){
    const ice=theme.id==='ice';
    for(let i=0;i<6+tier;i++){const a=i*tau/(6+tier)+t*.13,r=radius*(.72+clamp(age/1.5)*.4);ctx.globalAlpha=life*.85;crystal(cx+Math.cos(a)*r,cy+Math.sin(a)*r,unit*(ice?.1:.13),a+t*.25,ice);}
   }else{
    for(let j=0;j<2+tier;j++){const launch=clamp((age-j*.2)/.65),a=j*2.4,x=cx+Math.cos(a)*radius*.7,y=cy+Math.sin(a)*radius*.6;ctx.globalAlpha=life*(1-launch);line([[cx,cy+radius*.6],[x,y+(1-launch)*radius*.7]],theme.colors[j%5],2);star(x,y+(1-launch)*radius*.7,5,'#fff3c8');}
   }
   // Fine comet tails make motion legible, with bounded particle counts on mobile.
   for(let i=0;i<14+tier*4;i++){const a=i*tau/(14+tier*4)+age*.35,r=radius*(.45+clamp(age/2.3)*.8),tail=[];for(let j=0;j<7;j++){const angle=a-j*.025;tail.push([cx+Math.cos(angle)*(r-j*1.4),cy+Math.sin(angle)*(r-j*1.4)]);}ctx.globalAlpha=life*.65;line(tail,theme.colors[i%theme.colors.length],1.2);star(tail[0][0],tail[0][1],2.3,'#fff');}
   ctx.restore();
  }
  function drawTheme(t){
   const k=clamp((t-.38)/1.9),fade=clamp((animationDuration/1000-t)/.6);ctx.globalAlpha=fade;
   if(theme.id==='lightning'){
    bolts.forEach((points,i)=>{const onset=.42+i*.075,life=clamp((t-onset)/.16)*clamp((2.25-t)/.7);if(!life)return;ctx.save();ctx.translate(cx,cy);ctx.scale(radius/baseRadius,radius/baseRadius);ctx.globalAlpha=life*fade;const visible=points.slice(0,Math.max(2,Math.ceil(clamp((t-onset)/.3)*points.length)));line(visible,theme.colors[0],7);line(visible,theme.colors[1],3);line(visible,'#fff',1);const tip=visible[Math.floor(visible.length/2)];line([tip,[tip[0]+15,tip[1]-22],[tip[0]+8,tip[1]-38]],theme.colors[1],1.3);ctx.restore();});
    ring(cx,cy,radius*(.25+k*.9),theme.colors[0],2);
   }else if(theme.id==='magic'){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.55);const r=radius*(.55+k*.3);ctx.globalAlpha=fade*clamp(t/.45);ring(0,0,r,theme.colors[0],2);ring(0,0,r*.85,theme.colors[2],1);const points=Array.from({length:7},(_,i)=>[Math.cos(i*tau/3)*r*.76,Math.sin(i*tau/3)*r*.76]);line(points,'#f6caff',1.5);ctx.font=`${Math.max(12,unit*.14)}px serif`;ctx.fillStyle='#e4d6ff';ctx.textAlign='center';['✧','☾','◇','✦','◇','☽','✧','✦'].forEach((rune,i)=>{ctx.save();ctx.rotate(i*tau/8);ctx.fillText(rune,0,-r*1.12);ctx.restore();});ctx.restore();
   }else if(theme.id==='nature'){
    for(let i=0;i<4+tier;i++){const a=i*tau/(4+tier)+t*.1,r=radius*k;ctx.save();ctx.translate(cx,cy);ctx.rotate(a);ctx.strokeStyle='#6be6ae';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(r*.2,-r*.35,r*.8,r*.28,r,0);ctx.stroke();for(let j=1;j<=4;j++){const x=r*j/4;leaf(x,Math.sin(j)*r*.1,unit*.065*k,j%2?-.6:.6,theme.colors[j%3]);}star(r,0,unit*.075*k,'#fff2af');ctx.restore();}
   }else if(theme.id==='fire'){
    for(let i=0;i<7+tier*2;i++){const a=i*tau/(7+tier*2),r=radius*(.35+k*.45),x=cx+Math.cos(a)*r*.65,y=cy+Math.sin(a)*r*.3,flame=unit*(.35+.15*Math.sin(t*4+i))*Math.sin(Math.PI*clamp(t/4));ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(a)*.32);const g=ctx.createLinearGradient(0,0,0,-flame*2);g.addColorStop(0,'#ffe793');g.addColorStop(.4,'#ff943d');g.addColorStop(1,'#ff415900');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-flame*.3,0);ctx.bezierCurveTo(-flame*.7,-flame*.7,flame*.3,-flame,0,-flame*2);ctx.bezierCurveTo(flame*.8,-flame,flame*.5,-flame*.2,flame*.3,0);ctx.fill();ctx.restore();}
   }else if(theme.id==='water'){
    for(let i=0;i<3+tier;i++){const wave=((t*.46+i*.19)%1);ctx.globalAlpha=fade*(1-wave)*.85;ring(cx,cy+unit*.16,radius*wave*1.25,theme.colors[i%3],2.5,.52);}
    ctx.globalAlpha=fade;for(let i=0;i<5+tier;i++){const a=i*tau/(5+tier)-t*.6;const x=cx+Math.cos(a)*radius*k,y=cy+Math.sin(a)*radius*k*.7;ring(x,y,unit*(.04+(i%3)*.015),'#a9faff',1.5);star(x-unit*.02,y-unit*.02,2,'#fff');}
   }else if(theme.id==='ice'){
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.12);
    for(let i=0;i<6;i++){ctx.rotate(tau/6);const r=radius*(.22+k*.86);line([[0,0],[0,-r]],theme.colors[0],2);for(let j=1;j<=3;j++){const y=-r*j/4,b=r*.17;line([[-b,y-b],[0,y],[b,y-b]],theme.colors[1],1.3);}crystal(0,-r,unit*.09,t*.3,true);}
    ctx.restore();ring(cx,cy,radius*(.3+k*.8),theme.colors[2],1);
   }else if(theme.id==='earth'){
    for(let i=0;i<7+tier;i++){const a=i*tau/(7+tier),r=radius*(.15+k*.8);crystal(cx+Math.cos(a)*r,cy+Math.sin(a)*r,unit*(.12+(i%3)*.025)*clamp(t/.7),a+t*.18);}
    for(let j=0;j<2;j++){const p=clamp((t-.4-j*.3)/2);ctx.globalAlpha=fade*(1-p);ring(cx,cy+unit*.15,radius*p*1.2,theme.colors[j],2,.5);}
   }else{
    for(let j=0;j<2+tier;j++){const onset=.45+j*.27,age=t-onset;if(age<0||age>1.8)continue;const bx=cx+Math.cos(j*2.4)*radius*.7,by=cy+Math.sin(j*2.4)*radius*.6;ctx.globalAlpha=fade*clamp((1.8-age)/.8);for(let i=0;i<16+tier*4;i++){const a=i*tau/(16+tier*4),r=unit*age*.65;line([[bx+Math.cos(a)*r*.65,by+Math.sin(a)*r*.65+age*age*unit*.07],[bx+Math.cos(a)*r,by+Math.sin(a)*r+age*age*unit*.07]],theme.colors[(j+i)%theme.colors.length],1.7);star(bx+Math.cos(a)*r,by+Math.sin(a)*r+age*age*unit*.07,2,'#fff');}}
   }
   particles.forEach(p=>{const age=t-.4-p.lag;if(age<0)return;const progress=clamp(age/3.2),dist=radius*p.r*Math.sin(progress*Math.PI/2);let x=cx+Math.cos(p.a)*dist,y=cy+Math.sin(p.a)*dist;ctx.globalAlpha=fade*Math.sin(Math.PI*progress)*.9;if(theme.id==='fire'){y=cy-radius*Math.min(age*.45,1.55)+Math.sin(p.a)*radius*.1;x=cx+Math.cos(p.a)*unit*.6+Math.sin(age*3+p.spin)*10;}if(theme.id==='nature')leaf(x,y,p.size*1.6,t+p.spin,p.color);else if(theme.id==='water'){y+=progress*progress*unit*.4;ring(x,y,p.size,p.color,1.1);}else star(x,y,p.size,p.color);});
  }
  // Three deliberately different motion studies. All positions derive from normalized
  // phase, so short matches, slow frames and resizing keep the same impact beat.
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-Math.pow(1-clamp(x),3);
  function glow(x,y,r,alpha){
   if(alpha<=0||r<=0)return;
   const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,theme.colors[1]+'aa');g.addColorStop(.22,theme.colors[0]+'44');g.addColorStop(1,theme.colors[0]+'00');
   ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
  }
  function softPuff(x,y,r,alpha,color=theme.colors[0],stretch=1,angle=0){
   if(alpha<=0||r<=0)return;
   ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(stretch,1);
   const g=ctx.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,color+'99');g.addColorStop(.28,color+'55');g.addColorStop(.7,color+'16');g.addColorStop(1,color+'00');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();
  }
  // Filled, tapered cross-sections: thickness and translucent folds, not stroked polylines.
  function flowRibbon(points,width,alpha,phase=0){
   if(points.length<3||alpha<=0)return;
   const normals=points.map((pt,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];});
   const widths=points.map((_,i)=>{const u=i/(points.length-1);return width*Math.pow(Math.sin(Math.PI*u),.65)*(.8+.2*Math.sin(u*9+phase));});
   function shape(scale,offset=0){
    const sides=[1,-1].map(sign=>points.map((pt,i)=>[pt[0]+normals[i][0]*widths[i]*(sign*scale+offset),pt[1]+normals[i][1]*widths[i]*(sign*scale+offset)]));
    const outline=sides[0].concat(sides[1].reverse());ctx.beginPath();ctx.moveTo((outline[0][0]+outline.at(-1)[0])/2,(outline[0][1]+outline.at(-1)[1])/2);
    outline.forEach((pt,i)=>{const next=outline[(i+1)%outline.length];ctx.quadraticCurveTo(pt[0],pt[1],(pt[0]+next[0])/2,(pt[1]+next[1])/2);});ctx.closePath();
   }
   const mid=points[Math.floor(points.length/2)],n=normals[Math.floor(points.length/2)];
   const g=ctx.createLinearGradient(mid[0]-n[0]*width,mid[1]-n[1]*width,mid[0]+n[0]*width+.01,mid[1]+n[1]*width+.01);
   g.addColorStop(0,theme.colors[0]+'00');g.addColorStop(.22,theme.colors[0]+'66');g.addColorStop(.55,theme.colors[0]+'cc');g.addColorStop(.8,theme.colors[1]+'cc');g.addColorStop(1,theme.colors[1]+'00');
   ctx.save();ctx.globalAlpha=alpha*.2;ctx.fillStyle=theme.colors[0];shape(1.35);ctx.fill();ctx.globalAlpha=alpha;ctx.fillStyle=g;shape(1);ctx.fill();
   ctx.globalAlpha=alpha*.45;ctx.fillStyle=theme.colors[1];shape(.12,.5);ctx.fill();ctx.restore();
  }
  function strokeEnergy(points,alpha,width=1){
   if(points.length<3){const a=points[0],b=points.at(-1);softPuff(b[0],b[1],width*2.6,alpha,theme.colors[1],2,Math.atan2(b[1]-a[1],b[0]-a[0]));return;}
   for(let i=1;i<points.length-1;i+=quality==='light'?4:2){const a=points[i-1],b=points[i];softPuff(b[0],b[1],width*6,alpha*.7,theme.colors[0],1.4,Math.atan2(b[1]-a[1],b[0]-a[0]));}
   flowRibbon(points,width*1.2,alpha);
   // The hot filament remains the only hard, angular line in the three studies.
   ctx.save();ctx.globalAlpha=alpha*.85;line(points,'#fff9eb',width*.35);ctx.restore();
  }
  function pointAlong(p,j){
   const from=ingredients[j]||[origin,sourcePoint][j],pull=ease(p/.33),side=j?-1:1;
   const bend=Math.sin(pull*Math.PI)*radius*(cinematic?.36:theme.id==='water'?.24:theme.id==='magic'?.13:0)*side;
   return {x:from.x+(cx-from.x)*pull+(cinematic?bend:0),y:from.y+(cy-from.y)*pull+(cinematic?-Math.abs(bend)*.5:bend)};
  }
  function lightningPath(a,b,salt){
   const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
   return Array.from({length:11},(_,i)=>{const u=i/10,k=i===0||i===10?0:Math.sin(i*13.7+salt*4.31)*Math.sin(i*2.8+salt)*Math.min(len*.12,unit*.14);return [a.x+dx*u-dy/len*k,a.y+dy*u+dx/len*k];});
  }
  function drawLightning(p,impact){
   if(p<.36){const a=pointAlong(p,0),b=pointAlong(p,1);const energy=ease(p/.2)*(.65+.35*Math.sin(p*17)**2);strokeEnergy(lightningPath(a,b,Math.floor(p*23)),energy,1.5);glow(a.x,a.y,unit*.18,energy*.6);glow(b.x,b.y,unit*.18,energy*.6);}
   if(impact>=0){
    const life=(1-ease(impact/.29)),travel=out(impact/.16),axis=Math.atan2(sourcePoint.y-origin.y,sourcePoint.x-origin.x);
    for(let j=0;j<2;j++){const a=axis+j*Math.PI+.23,r=radius*(.25+travel*.93),end={x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r};const pts=lightningPath({x:cx,y:cy},end,j+sequence*.1);strokeEnergy(pts,life,2.1);const fork=pts[6],tip={x:fork[0]+Math.cos(a-.65)*unit*.3,y:fork[1]+Math.sin(a-.65)*unit*.3};strokeEnergy(lightningPath({x:fork[0],y:fork[1]},tip,j+3),life*.7,.75);}
    // A handful of hot fragments decelerate, rather than a radial star shower.
    for(let i=0;i<(quality==='light'?5:9+tier);i++){const a=axis+(i%2)*Math.PI+(randFixed(i)-.5)*1.25,r=radius*(.15+out(impact/.36)*(.6+randFixed(i+7)*.55));const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;strokeEnergy([[x-Math.cos(a)*unit*.065,y-Math.sin(a)*unit*.065],[x,y]],(1-ease(impact/.43))*.7,.8);}
   }
  }
  const randFixed=i=>(Math.sin(i*127.1+sequence*3.3)*43758.5453)%1*.5+.5;
  function drawWater(p,impact){
   // Two curved volumes of liquid accelerate into the collision.
   if(p<.38)for(let j=0;j<2;j++){
    const pts=Array.from({length:22},(_,i)=>{const q=Math.max(0,p-.2+i/21*.2),a=pointAlong(q,j);return [a.x,a.y+Math.sin(i/21*Math.PI)*unit*.12*(j?-1:1)];});
    flowRibbon(pts,unit*.105,clamp(p/.05)*(1-ease((p-.32)/.06)),p*5+j);
   }
   if(impact>=0){
    const spread=out(impact/.44),fade=1-ease(impact/.59),r=radius*(.38+spread*.82),surfaceY=cy+unit*.27;
    // Uneven splash sheets curl upward and separate; no perfect ellipse outline.
    for(let sheet=0;sheet<3;sheet++){
     const start=sheet*tau/3+.12,pts=Array.from({length:24},(_,i)=>{const u=i/23,a=start+u*1.8,rr=r*(.95+.06*Math.sin(a*4+impact*7));return [cx+Math.cos(a)*rr,surfaceY+Math.sin(a)*rr*.36-unit*.16*Math.sin(u*Math.PI)*Math.sin(sheet+impact*6)];});
     flowRibbon(pts,unit*(.08+.055*(1-spread)),fade*.85,sheet+impact*4);
    }
    softPuff(cx,surfaceY,r*.7,fade*.22,theme.colors[0],1.45);
    const count=quality==='light'?7:12+tier*2;
    for(let i=0;i<count;i++){const a=(i/count)*tau+.15,velocity=.6+randFixed(i)*.45,flight=clamp(impact/.56),rr=radius*(.22+velocity*out(flight)*.95),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.42-unit*(1.5*flight-1.45*flight*flight),size=unit*(.03+randFixed(i+3)*.025)*(1-flight*.6);ctx.save();ctx.globalAlpha=fade;ctx.translate(x,y);ctx.rotate(Math.cos(a)*.65);const g=ctx.createLinearGradient(-size,0,size,0);g.addColorStop(0,theme.colors[0]+'55');g.addColorStop(.65,theme.colors[0]);g.addColorStop(1,theme.colors[1]);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,size,size*(1.5-flight*.5),0,0,tau);ctx.fill();ctx.restore();}
    // Residual mist dissolves rather than leaving a wireframe ripple.
    softPuff(cx,cy+unit*.3,radius*.65,fade*.18,theme.colors[1],1.6);
   }
  }
  function drawMagic(p,impact){
   // Two translucent energy folds gather into a vortex and peel away at impact.
   const charge=ease(p/.27),collapse=p<.36?1-.32*ease((p-.27)/.09):.68+out(impact/.24)*.5;
   const fade=p<.36?charge:1-ease(impact/.4),r=radius*.72*collapse;
   for(let fold=0;fold<2;fold++){
    const pts=Array.from({length:32},(_,i)=>{const u=i/31,a=fold*Math.PI+u*Math.PI*1.5+p*2.2,rr=r*(.6+u*.55);return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.72+Math.sin(u*Math.PI*2+p*4)*unit*.07];});
    flowRibbon(pts,unit*(.12+.025*Math.sin(p*5+fold)),fade*.8,p*5+fold);
    const tip=pts[24];softPuff(tip[0],tip[1],unit*.24,fade*.5,theme.colors[0]);
   }
   if(p<.36)for(let j=0;j<2;j++){const pts=[];for(let i=0;i<22;i++){const q=Math.max(0,p-.17+i/21*.17),a=pointAlong(q,j);pts.push([a.x,a.y]);}flowRibbon(pts,unit*.065,charge*.55,j+p*5);}
   if(impact>=0){
    const lift=out(impact/.45),life=1-ease(impact/.57);
    for(let j=0;j<(quality==='light'?3:5);j++){const a=j*tau/5+.4+lift*.3,r0=radius*(.3+lift*.72),x=cx+Math.cos(a)*r0,y=cy+Math.sin(a)*r0*.65-unit*lift*.18;softPuff(x,y,unit*(.09+.035*lift),life*.6,theme.colors[j%2],1.6,a);}
   }
  }
  function drawFire(p,impact){
   if(p<.38)for(let j=0;j<2;j++){
    const pts=Array.from({length:22},(_,i)=>{const q=Math.max(0,p-.18+i/21*.18),a=pointAlong(q,j),swirl=Math.sin(i/21*Math.PI*2+p*12)*(j?-1:1)*unit*.09;return [a.x+swirl*.5,a.y-Math.abs(swirl)];});
    flowRibbon(pts,unit*.11,clamp(p/.05)*(1-ease((p-.32)/.06)),p*7+j);
   }
   if(impact>=0){
    const spread=out(impact/.42),fade=1-ease(impact/.62),r=radius*(.34+spread*.86);
    for(let tongue=0;tongue<4;tongue++){
     const start=tongue*tau/4+.25+impact*1.4,pts=Array.from({length:24},(_,i)=>{const u=i/23,a=start+u*1.65,rr=r*(.55+u*.58);return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.78-u*unit*.34];});
     flowRibbon(pts,unit*(.1+.045*(1-spread)),fade*.88,tongue+impact*6);
    }
    const count=quality==='light'?8:14+tier*2;
    for(let i=0;i<count;i++){const a=(i/count)*tau+impact*.9,flight=clamp(impact/.56),rr=radius*(.2+out(flight)*(.55+randFixed(i)*.5)),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.75-unit*flight*.45;softPuff(x,y,unit*(.055+randFixed(i+2)*.03)*(1-flight*.5),fade*.85,theme.colors[i%3],1.5,a);}
   }
  }
  function drawNature(p,impact){
   if(p<.38)for(let j=0;j<2;j++){
    const pts=Array.from({length:22},(_,i)=>{const q=Math.max(0,p-.19+i/21*.19),a=pointAlong(q,j),wave=Math.sin(i/21*Math.PI*1.5+p*8)*unit*.08*(j?-1:1);return [a.x+wave,a.y-wave*.6];});
    flowRibbon(pts,unit*.095,clamp(p/.05)*(1-ease((p-.32)/.06)),p*5+j);
   }
   if(impact>=0){
    const spread=out(impact/.46),fade=1-ease(impact/.62),r=radius*(.32+spread*.82);
    for(let vine=0;vine<3;vine++){
     const start=vine*tau/3+impact*.8,pts=Array.from({length:24},(_,i)=>{const u=i/23,a=start+u*2.1,rr=r*(.45+u*.62);return [cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.82];});
     flowRibbon(pts,unit*(.075+.035*(1-spread)),fade*.8,vine+impact*4);
    }
    const count=quality==='light'?7:12+tier*2;
    for(let i=0;i<count;i++){const a=(i/count)*tau+impact*.55,rr=r*(.48+randFixed(i)*.52),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*.84;ctx.save();ctx.globalAlpha=fade*.9;leaf(x,y,unit*(.045+randFixed(i+4)*.025),a+impact*3,theme.colors[i%3]);if(i%3===0)bloom(x,y,unit*.055,a-impact*2);ctx.restore();}
   }
  }
  function drawCrystalElement(p,impact,ice){
   if(p<.38)for(let j=0;j<2;j++){
    const pts=Array.from({length:20},(_,i)=>{const q=Math.max(0,p-.17+i/19*.17),a=pointAlong(q,j);return [a.x,a.y];});
    strokeEnergy(pts,clamp(p/.05)*(1-ease((p-.32)/.06)),1.25);
   }
   if(impact>=0){
    const spread=out(impact/.42),fade=1-ease(impact/.6),r=radius*(.3+spread*.84),count=quality==='light'?6:10+tier*2;
    for(let i=0;i<count;i++){const a=(i/count)*tau+(ice?impact*.35:-impact*.25),rr=r*(.45+randFixed(i)*.55),x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr*(ice?.86:.74);ctx.save();ctx.globalAlpha=fade*.9;crystal(x,y,unit*(.07+randFixed(i+5)*.04)*(1-spread*.25),a+impact*1.8,ice);ctx.restore();}
   }
  }
  function drawCutRefraction(x,y,size,alpha,spin=0){
   if(alpha<=0||size<=0)return;
   const cut=window.KanjiGemArt?.cutFor?.(Number.isInteger(pair)?pair:0);if(!cut)return;
   ctx.save();ctx.translate(x,y);ctx.rotate(spin);ctx.scale(size/100,size/100);ctx.translate(-50,-50);
   ctx.strokeStyle=theme.colors[1];ctx.lineWidth=1.8;ctx.globalAlpha=alpha*.85;
   ctx.beginPath();cut.outer.forEach((pt,i)=>i?ctx.lineTo(...pt):ctx.moveTo(...pt));ctx.closePath();ctx.stroke();
   ctx.strokeStyle='#ffffff';ctx.lineWidth=1.1;ctx.globalAlpha=alpha*.65;
   ctx.beginPath();cut.table.forEach((pt,i)=>i?ctx.lineTo(...pt):ctx.moveTo(...pt));ctx.closePath();ctx.stroke();
   for(let i=0;i<cut.outer.length;i++){
    const a=cut.outer[i],b=cut.outer[(i+1)%cut.outer.length],d=cut.table[i%cut.table.length],e=cut.table[(i+1)%cut.table.length];
    const g=ctx.createLinearGradient(...d,...a);g.addColorStop(0,theme.colors[0]+'00');g.addColorStop(.6,theme.colors[0]+'55');g.addColorStop(1,theme.colors[2]+'cc');
    ctx.fillStyle=g;ctx.globalAlpha=alpha*(.35+.35*Math.sin(i*1.7+spin*4));
    ctx.beginPath();[a,b,e,d].forEach((pt,idx)=>idx?ctx.lineTo(...pt):ctx.moveTo(...pt));ctx.closePath();ctx.fill();
   }
   ctx.restore();
  }
  function drawCrafted(p){
   const impact=p-.36;
   overlay.dataset.phase=p<.27?'pull':p<.36?'compress':p<.6?'impact':'settle';
   ctx.lineJoin='round';ctx.lineCap='round';
   // A local vignette gives the event contrast without washing out the board.
   const shade=ctx.createRadialGradient(cx,cy,unit*.2,cx,cy,radius*1.5);shade.addColorStop(0,'#04091c66');shade.addColorStop(1,'#04091c00');ctx.globalAlpha=ease(p/.15)*(1-ease((p-.8)/.2));ctx.fillStyle=shade;ctx.fillRect(cx-radius*1.5,cy-radius*1.5,radius*3,radius*3);ctx.globalAlpha=1;
   ctx.save();ctx.globalCompositeOperation='screen';
   const touchMid={x:(origin.x+sourcePoint.x)/2,y:(origin.y+sourcePoint.y)/2};
   if(p<.28){
    const touchFlash=1-ease(p/.28);
    glow(touchMid.x,touchMid.y,unit*(.32+.55*out(p/.24)),touchFlash*.95);
    drawCutRefraction(touchMid.x,touchMid.y,unit*(.68+.85*out(p/.26)),touchFlash*.85,p*3.2);
   }
   if(p<.36){
    const a=pointAlong(p,0),b=pointAlong(p,1),bridgeAlpha=clamp(p/.06)*(1-ease((p-.29)/.07));
    const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2-unit*.08*Math.sin(p*Math.PI/.36);
    const bridgePts=Array.from({length:15},(_,i)=>{const u=i/14,bx=(1-u)*(1-u)*a.x+2*(1-u)*u*midX+u*u*b.x,by=(1-u)*(1-u)*a.y+2*(1-u)*u*midY+u*u*b.y,wobble=Math.sin(u*Math.PI*3+p*24)*unit*.045*Math.sin(u*Math.PI);return [bx+wobble,by-wobble];});
    flowRibbon(bridgePts,unit*.085,bridgeAlpha*.75,p*9);
    glow(a.x,a.y,unit*.22,bridgeAlpha*.7);glow(b.x,b.y,unit*.22,bridgeAlpha*.7);
   }
   const compression=ease((p-.2)/.16)*(1-ease((p-.36)/.14));
   if(compression>0){
    glow(cx,cy,unit*(.34+.28*compression),compression*.95);
    window.KanjiTargetVFX?.paintHybridAura?.(ctx,Number.isInteger(pair)?pair:0,themeRgb,cx,cy,unit*(.85+.45*compression),p*4.2,compression*.9,quality==='light',1.55);
   }
   if(theme.id==='lightning')drawLightning(p,impact);
   else if(theme.id==='water')drawWater(p,impact);
   else if(theme.id==='magic')drawMagic(p,impact);
   else if(theme.id==='fire')drawFire(p,impact);
   else if(theme.id==='nature')drawNature(p,impact);
   else if(theme.id==='ice'||theme.id==='earth')drawCrystalElement(p,impact,theme.id==='ice');
   else if(impact>=0){ctx.save();drawTheme(.4+impact/.64*(animationDuration/1000-.4));ctx.restore();}
   if(impact>=0){
    const burstExpand=out(impact/.38),burstFade=1-ease(impact/.56);
    glow(cx,cy,unit*(.38+out(impact/.09)*.68),(1-ease(impact/.12))*.95);
    drawCutRefraction(cx,cy,unit*(.92+burstExpand*1.35),burstFade*.88,impact*2.4);
    window.KanjiTargetVFX?.paintHybridAura?.(ctx,Number.isInteger(pair)?pair:0,themeRgb,cx,cy,unit*(1.05+burstExpand*.95),1.2+impact*3.6,burstFade*.95,quality==='light',1.6);
   }
   ctx.restore();
   ingredients.forEach((gem,j)=>{const q=pointAlong(p,j),s=1-.72*ease((p-.25)/.11);gem.node.style.transform=`translate(${q.x-gem.width/2}px,${q.y-gem.height/2}px) scale(${s})`;gem.node.style.opacity=String(1-ease((p-.31)/.055));});
   if(resultNode){const t=clamp(impact/.18),scale=t<.65?.4+.68*out(t/.65):1.08-.08*ease((t-.65)/.35);resultNode.style.opacity=String(clamp(impact/.035));resultNode.style.scale=String(scale);if(cinematic&&resultDestination){const settle=1-ease((p-.64)/.3);resultNode.style.translate=`${(cx-resultDestination.x)*settle}px ${(cy-resultDestination.y)*settle}px`;}}
  }
  const start=performance.now();let frame,lastPaint=start;
  function cancel(){cancelAnimationFrame(frame);overlay.remove();if(cinematic&&resultNode){resultNode.style.opacity='1';resultNode.style.scale='1';resultNode.style.translate='none';}}
  function measureResult(){const translate=resultNode.style.translate,scale=resultNode.style.scale;resultNode.style.translate='none';resultNode.style.scale='1';const rect=resultNode.getBoundingClientRect();resultDestination={x:rect.x+rect.width/2,y:rect.y+rect.height/2};resultNode.style.translate=translate;resultNode.style.scale=scale;}
  function placeResult(node){
   if(cinematic){resultNode=node;node.style.animation='none';node.style.opacity='0';node.style.scale='.4';measureResult();node.style.translate=`${cx-resultDestination.x}px ${cy-resultDestination.y}px`;return;}
   const style=getComputedStyle(node);for(const key of ['--tile-top','--tile-mid','--tile-base','--tile-edge','--gem-label-y','--gem-glyph-size'])node.style.setProperty(key,style.getPropertyValue(key));
   if(crafted){node.style.animation='none';node.style.opacity='0';node.style.scale='.4';}
   else if(requestedDuration){node.style.animationDuration='300ms';node.style.animationDelay='100ms';}resultSize=parseFloat(node.style.width)||72;resultNode=node;node.style.transform='none';node.style.left=(cx-resultSize/2)+'px';node.style.top=(cy-resultSize/2)+'px';overlay.append(node);
  }
  function tick(now){if(!canvas.isConnected||!host.isConnected){cancel();return;}if(w!==document.documentElement.clientWidth||h!==window.innerHeight)layout();if(quality==="light"&&now-lastPaint<32&&now-start<duration){frame=requestAnimationFrame(tick);return;}onFrame?.(now-lastPaint);lastPaint=now;const t=(now-start)/duration*animationDuration/1000;ctx.clearRect(0,0,w,h);ctx.save();if(crafted){drawCrafted(clamp((now-start)/duration));ctx.restore();if(now-start<duration)frame=requestAnimationFrame(tick);else cancel();return;}const shade=ctx.createRadialGradient(cx,cy,0,cx,cy,radius*1.5);shade.addColorStop(0,'#02092155');shade.addColorStop(1,'#02092100');ctx.globalAlpha=clamp(t/.5)*clamp((animationDuration/1000-t)/.7);ctx.fillStyle=shade;ctx.fillRect(cx-radius*1.5,cy-radius*1.5,radius*3,radius*3);ctx.globalCompositeOperation='lighter';
   // Two luminous streams pull the ingredients toward the fusion point.
   const charge=clamp(t/.58);if(t<.85){[sourcePoint,origin].forEach((p,j)=>{const sx=p.x,sy=p.y;const x=sx+(cx-sx)*charge,y=sy+(cy-sy)*charge;ctx.globalAlpha=1-clamp((t-.58)/.27);line([[sx,sy],[x,y]],theme.colors[j],2);star(x,y,5+charge*7,'#fff');});}
   const halo=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);halo.addColorStop(0,theme.colors[0]+'66');halo.addColorStop(.5,theme.colors[1]+'18');halo.addColorStop(1,theme.colors[0]+'00');ctx.globalAlpha=clamp(t/.35)*clamp((animationDuration/1000-t)/.7);ctx.fillStyle=halo;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);drawTheme(t);flourish(t);ctx.restore();
   if(now-start<duration)frame=requestAnimationFrame(tick);else cancel();
  }
  frame=requestAnimationFrame(tick);
  return {duration,theme,cancel,placeResult};
 }
 window.KanjiFusion={themes,play};
})();
