/* Approved study 05: material sprite + refractive core + thin flowing energy.
   One active target; lazy atlases, bounded tint cache, cached contour maps. */
(()=>{
 'use strict';
 const profiles={magic:{cycle:5.8,wave:1,life:2.1},thunder:{cycle:4.6,wave:1.7,life:1.3},water:{cycle:6.4,wave:1.3,life:2.7},fire:{cycle:4.9,wave:1.6,life:1.7},nature:{cycle:6.8,wave:.8,life:3},earth:{cycle:7.2,wave:.65,life:2.8},ice:{cycle:6.1,wave:.6,life:2.5}};
 const NS='http://www.w3.org/2000/svg',atlases=new Map(),tints=new Map(),fusionTints=new Map(),geometries=new Map(),instances=new Map(),fusionInstances=new Map(),directSurfaces=new Map(),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const root=document.querySelector('#kanji-pop'),TW=128,TH=64,SPAN=164,INSET=32;
 let raf=0,lastPaint=0,time=0,last=0,paintCount=0,lastCost=0;
 const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t),mod=x=>((x%1)+1)%1;
 function polygon(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();}
 function trackFor(cut){
  const points=cut.outer.map(([x,y])=>[50+(x-50)*1.015,50+(y-50)*1.015]),svg=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  const entry=i=>mix(points[i],points[(i+points.length-1)%points.length],.15),exit=i=>mix(points[i],points[(i+1)%points.length],.15);
  path.setAttribute('d','M'+exit(0).join(' ')+points.map((_,j)=>{const i=(j+1)%points.length;return 'L'+entry(i).join(' ')+'Q'+points[i].join(' ')+' '+exit(i).join(' ');}).join('')+'Z');svg.append(path);document.body.append(svg);
  const length=path.getTotalLength(),samples=Array.from({length:512},(_,i)=>{const p=path.getPointAtLength(i/512*length),a=path.getPointAtLength((i/512*length+.3)%length),dx=a.x-p.x,dy=a.y-p.y,l=Math.hypot(dx,dy);return {x:p.x,y:p.y,dx:dx/l,dy:dy/l,nx:dy/l,ny:-dx/l};});svg.remove();
  return {at(u){const p=mod(u)*512,i=Math.floor(p),f=p-i,a=samples[i],b=samples[(i+1)%512],o={};for(const k in a)o[k]=a[k]+(b[k]-a[k])*f;return o;}};
 }
 function geometry(pair,light){
  const key=KanjiGemArt.assignment[pair]+'-'+light;if(geometries.has(key))return geometries.get(key);
  const cut=KanjiGemArt.cutFor(pair),track=trackFor(cut),size=light?112:176,map=[],segments=Array.from({length:128},(_,i)=>({a:track.at(i/128),b:track.at((i+1)/128)}));
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const px=x/(size-1)*SPAN-INSET,py=y/(size-1)*SPAN-INSET;let best=Infinity,u=0,v=0;
   for(let j=0;j<segments.length;j++){const {a,b}=segments[j],dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,f=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l)),xx=px-a.x-f*dx,yy=py-a.y-f*dy,d=xx*xx+yy*yy;if(d<best){best=d;u=(j+f)/128;v=xx*a.nx+yy*a.ny;}}
   if(best<24*24)map.push({index:(y*size+x)*4,u,v});
  }
  const g={cut,track,size,map};geometries.set(key,g);return g;
 }
 function loadAtlas(element){
  if(atlases.has(element))return atlases.get(element);
  const promise=new Promise(resolve=>{const img=new Image();img.onload=()=>{
   const cell=img.width/4,frames=Array.from({length:16},(_,i)=>{const c=canvas(TW,TH),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,i%4*cell,Math.floor(i/4)*cell,cell,cell,0,0,TW,TH);ctx.globalCompositeOperation='destination-in';
    for(const axis of [0,1]){const f=ctx.createLinearGradient(0,0,axis?0:TW,axis?TH:0);f.addColorStop(0,'transparent');f.addColorStop(.12,'white');f.addColorStop(.84,'white');f.addColorStop(1,'transparent');ctx.fillStyle=f;ctx.fillRect(0,0,TW,TH);}return ctx.getImageData(0,0,TW,TH).data;});resolve(frames);
  };img.onerror=()=>resolve(null);img.src=element==='magic'?'vfx-study-assets/magic-ribbon-atlas.webp':'target-vfx-assets/'+element+'.webp';});atlases.set(element,promise);return promise;
 }
 async function tinted(element,rgb,cache=tints){
  const key=element+rgb.join(',');if(cache.has(key)){const v=cache.get(key);cache.delete(key);cache.set(key,v);return v;}
  const source=await loadAtlas(element);if(!source)return null;
  const result=source.map(p=>{const out=new Uint8ClampedArray(p.length);for(let k=0;k<p.length;k+=4){const l=Math.max(p[k],p[k+1],p[k+2])/255,white=Math.pow(l,7)*.52;for(let j=0;j<3;j++)out[k+j]=Math.min(255,(rgb[j]*(1-white)+255*white)*(.55+l*.6));out[k+3]=p[k+3];}return out;});
  cache.set(key,result);while(cache.size>4)cache.delete(cache.keys().next().value);return result;
 }
 function color(el){const value=getComputedStyle(el).getPropertyValue('--tile-mid').trim(),c=canvas(1,1),ctx=c.getContext('2d');ctx.fillStyle=value||'#9855e8';ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data).slice(0,3);}
 function rgba(v,alpha,white=0){return 'rgba('+v.rgb.map(n=>Math.round(n+(255-n)*white)).join(',')+','+alpha+')';}
 function light(c,v,x,y,r,alpha=1){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(v,.65*alpha,.8));g.addColorStop(.2,rgba(v,.5*alpha,.2));g.addColorStop(1,rgba(v,0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 function core(c,v,t){
  const {cut,track}=v.g,phase=t/v.profile.cycle,boost=v.boost||1;c.save();polygon(c,cut.outer);c.clip();c.globalCompositeOperation='screen';
  for(let i=0;i<3;i++){const p=track.at(phase+i/3);light(c,v,50+(p.x-50)*.65,50+(p.y-50)*.65,17,1.2*boost);}
  for(let i=0;i<cut.outer.length;i++){const a=cut.outer[i],b=cut.outer[(i+1)%cut.outer.length],d=cut.table[i%cut.table.length],e=cut.table[(i+1)%cut.table.length],energy=Math.min(1,Math.pow(Math.max(0,Math.cos((phase-i/cut.outer.length)*Math.PI*2)),boost>1?5:9)*boost),g=c.createLinearGradient(...d,...a);g.addColorStop(0,rgba(v,0));g.addColorStop(.65,rgba(v,Math.min(1,.05+energy*.32),.2));g.addColorStop(1,rgba(v,Math.min(1,energy*.85),.8));c.fillStyle=g;polygon(c,[a,b,e,d]);c.fill();
   if(energy>.1){c.strokeStyle=rgba(v,Math.min(1,energy*.7),.7);c.lineWidth=.65*boost;c.beginPath();c.moveTo(...d);c.quadraticCurveTo((a[0]+d[0])/2+Math.sin(t+i)*2,(a[1]+d[1])/2,...a);c.stroke();}}
  c.restore();
 }
 function fluid(c,v,t){
  c.globalCompositeOperation='screen';const phase=t/v.profile.cycle,boost=v.boost||1;
  for(let stream=0;stream<2;stream++){const head=phase+stream*.51,len=.42*(boost>1?1.15:1);
   for(let layer=0;layer<4;layer++){const left=[],right=[];for(let j=0;j<=48;j++){const f=j/48,p=v.g.track.at(head-len+f*len),w=Math.pow(Math.sin(Math.PI*f),.65)*(layer===0?6.5:3.5-layer*.6)*.5*(boost>1?1.25:1),wave=(Math.sin(f*12-t*2.1+layer*.9)*1.25+Math.sin(f*27+t*1.3)*.45)*.5*v.profile.wave,shift=wave+layer*.35;
     left.push([p.x+p.nx*(shift+w),p.y+p.ny*(shift+w)]);right.push([p.x+p.nx*(shift-w),p.y+p.ny*(shift-w)]);}
    const a=v.g.track.at(head-len),b=v.g.track.at(head),g=c.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,rgba(v,0));g.addColorStop(.35,rgba(v,Math.min(1,(layer===0?.144:.28)*boost)));g.addColorStop(.78,rgba(v,Math.min(1,(layer===0?.28:.64)*boost),layer===0?0:.6));g.addColorStop(1,rgba(v,0,.7));c.fillStyle=g;c.shadowColor=rgba(v,.7);c.shadowBlur=v.light?0:layer===0?5:1;polygon(c,[...left,...right.reverse()]);c.fill();}
   c.shadowBlur=0;const h=v.g.track.at(head-.06);light(c,v,h.x,h.y,7*boost,Math.min(1,.52*boost));
  }
 }
 function sprite(c,v,t){
  if(!v.frames)return;
  const seq=t*11,frame=Math.floor(seq)%16,mix=seq%1,a=v.frames[frame],b=v.frames[(frame+1)%16],tex=v.texture,out=v.pixels.data,boost=v.boost||1;
  for(let k=0;k<tex.length;k++)tex[k]=a[k]*(1-mix)+b[k]*mix;out.fill(0);
  // Half-resolution atlas: scale the study's 3.2 texels/unit by 0.5;
  // divide by its approved 1.6x thickness to preserve the same plume width.
  const texelsPerUnit=3.2*(TH/128),thickness=1.6*(boost>1?1.18:1);
  for(const p of v.g.map){const ty=TH/2-p.v*texelsPerUnit/thickness;if(ty<0||ty>TH-1)continue;let alpha=0,r=0,g=0,bl=0;
   for(let stream=0;stream<2;stream++){const f=mod(p.u-t/v.profile.cycle-stream*.5+.54)/.54;if(f>1)continue;const tx=f*(TW-1),ix=Math.floor(tx),iy=Math.floor(ty),fx=tx-ix,fy=ty-iy;
    for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){const k=(Math.min(TH-1,iy+yy)*TW+Math.min(TW-1,ix+xx))*4,w=(xx?fx:1-fx)*(yy?fy:1-fy),aa=tex[k+3]/255*w*boost;alpha+=aa;r+=tex[k]*aa;g+=tex[k+1]*aa;bl+=tex[k+2]*aa;}}
   if(alpha>0){const k=p.index;out[k]=r/alpha;out[k+1]=g/alpha;out[k+2]=bl/alpha;out[k+3]=Math.min(1,alpha)*255;}}
  v.sctx.putImageData(v.pixels,0,0);c.globalCompositeOperation='screen';c.drawImage(v.surface,-INSET,-INSET,SPAN,SPAN);
 }
 function particles(c,v,t){
  c.globalCompositeOperation='screen';const count=v.light?8:18,boost=v.boost||1;
  for(let i=0;i<count;i++){const life=mod(t/v.profile.life+i*.618),p=v.g.track.at(t/v.profile.cycle-i*.019),drift=7*life*boost,x=p.x+p.nx*drift,y=p.y+p.ny*drift-life*(v.element==='fire'?8:3),a=Math.min(1,Math.sin(Math.PI*life)*(.55+i%3*.15)*boost);c.save();c.translate(x,y);c.rotate(t+i);c.fillStyle=rgba(v,a,.65);c.strokeStyle=rgba(v,a,.7);c.lineWidth=.5;c.beginPath();
   if(v.element==='nature'){c.moveTo(-1.8,0);c.quadraticCurveTo(0,-2,2,0);c.quadraticCurveTo(0,2,-1.8,0);c.fill();}
   else if(v.element==='ice'||v.element==='earth'){polygon(c,[[0,-1.6],[.8,0],[0,1.5],[-.8,0]]);c.fill();}
   else if(v.element==='water'){c.ellipse(0,0,.6,1.2,0,0,Math.PI*2);c.stroke();}
   else if(v.element==='thunder'){c.moveTo(-2,1);c.lineTo(0,-1);c.lineTo(0,1);c.lineTo(2,-1);c.stroke();}
   else{c.arc(0,0,i%5===0?.85:.4,0,Math.PI*2);c.fill();}c.restore();
  }
 }
 function quality(){return root?.dataset.markerQuality==='light'||root?.dataset.quality==='light';}
 function active(v){return v.el.isConnected&&v.el.offsetParent!==null&&!document.hidden&&(v.fusion||!(root?.querySelector('#modal:not([hidden])')));}
 function draw(v,t){
  const begin=performance.now(),lightMode=quality();if(v.light!==lightMode){v.light=lightMode;v.g=geometry(v.pair,lightMode);v.surface.width=v.surface.height=v.g.size;v.pixels=v.sctx.createImageData(v.g.size,v.g.size);}
  const parent=v.el.parentElement,size=(parent?.clientWidth||parent?.getBoundingClientRect().width||80),dpr=Math.min(devicePixelRatio||1,v.light?1.5:2),px=Math.max(32,Math.ceil(size*SPAN/100*dpr));if(v.el.width!==px){v.el.width=v.el.height=px;}
  const c=v.ctx,speed=v.speed||1;c.setTransform(px/SPAN,0,0,px/SPAN,0,0);c.clearRect(0,0,SPAN,SPAN);c.save();c.translate(INSET,INSET);core(c,v,t*speed);sprite(c,v,t*speed);fluid(c,v,t*speed);particles(c,v,t*speed);c.restore();v.paints++;if(!v.fusion){lastCost=performance.now()-begin;paintCount++;}
 }
 function paintHybridAura(ctx,pair,rgb,x,y,size,t,alpha=1,lightMode=quality(),boost=1.35){
  if(!Number.isInteger(pair)||alpha<=0||size<=0)return;
  const element=KanjiGemArt.elementFor(pair),g=geometry(pair,lightMode),key=pair+'-'+lightMode;
  let ds=directSurfaces.get(key);
  if(!ds){const surface=canvas(g.size,g.size),sctx=surface.getContext('2d');ds={surface,sctx,pixels:sctx.createImageData(g.size,g.size),texture:new Uint8ClampedArray(TW*TH*4),frames:null};directSurfaces.set(key,ds);tinted(element,rgb,fusionTints).then(f=>{ds.frames=f;});}
  const fKey=element+rgb.join(',');if(fusionTints.has(fKey))ds.frames=fusionTints.get(fKey);else if(tints.has(fKey))ds.frames=tints.get(fKey);
  const v={pair,element,profile:profiles[element],rgb,g,light:lightMode,surface:ds.surface,sctx:ds.sctx,pixels:ds.pixels,texture:ds.texture,frames:ds.frames,boost};
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x-size/2,y-size/2);ctx.scale(size/100,size/100);
  core(ctx,v,t);sprite(ctx,v,t);fluid(ctx,v,t);particles(ctx,v,t);
  ctx.restore();
 }
 function sync(){
  for(const [el] of instances)if(!el.isConnected){instances.delete(el);}
  for(const [el] of fusionInstances)if(!el.isConnected){fusionInstances.delete(el);}
  document.querySelectorAll('canvas.objective-fx[data-vfx="hybrid"]').forEach(el=>{if(instances.has(el))return;const pair=Number(el.dataset.pair),element=KanjiGemArt.elementFor(pair),lightMode=quality(),g=geometry(pair,lightMode),surface=canvas(g.size,g.size),sctx=surface.getContext('2d'),v={el,pair,element,profile:profiles[element],rgb:color(el),g,light:lightMode,ctx:el.getContext('2d'),surface,sctx,pixels:sctx.createImageData(g.size,g.size),texture:new Uint8ClampedArray(TW*TH*4),frames:null,paints:0,fusion:false,boost:1,speed:1};instances.set(el,v);
   draw(v,reduced.matches?1.25:time);tinted(element,v.rgb,tints).then(frames=>{if(!instances.has(el))return;v.frames=frames;el.dataset.asset=frames?'ready':'fallback';if(active(v))draw(v,reduced.matches?1.25:time);start();});
  });
  document.querySelectorAll('canvas.fusion-gem-fx').forEach(el=>{if(fusionInstances.has(el))return;const pair=Number(el.dataset.pair),element=KanjiGemArt.elementFor(pair),lightMode=quality(),g=geometry(pair,lightMode),surface=canvas(g.size,g.size),sctx=surface.getContext('2d'),mode=el.dataset.boost||'flight',boost=mode==='contact'?1.55:mode==='flight'?1.45:1.25,speed=mode==='contact'?1.85:mode==='flight'?1.65:1.22,v={el,pair,element,profile:profiles[element],rgb:color(el),g,light:lightMode,ctx:el.getContext('2d'),surface,sctx,pixels:sctx.createImageData(g.size,g.size),texture:new Uint8ClampedArray(TW*TH*4),frames:null,paints:0,fusion:true,boost,speed};fusionInstances.set(el,v);
   draw(v,reduced.matches?1.25:time);tinted(element,v.rgb,fusionTints).then(frames=>{if(!fusionInstances.has(el))return;v.frames=frames;el.dataset.asset=frames?'ready':'fallback';if(active(v))draw(v,reduced.matches?1.25:time);start();});
  });
  if(reduced.matches){for(const v of [...instances.values(),...fusionInstances.values()])if(active(v))draw(v,1.25);cancelAnimationFrame(raf);raf=0;}else start();
 }
 function tick(now){raf=0;const visible=[...instances.values(),...fusionInstances.values()].filter(active);if(!visible.length||reduced.matches){last=0;return;}time+=last?Math.min((now-last)/1000,.1):0;last=now;if(now-lastPaint>=1000/(quality()?24:30)){visible.forEach(v=>draw(v,time));lastPaint=now;}raf=requestAnimationFrame(tick);}
 function start(){if(!raf&&!reduced.matches&&[...instances.values(),...fusionInstances.values()].some(active))raf=requestAnimationFrame(tick);}
 const observer=new MutationObserver(sync);if(root)observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','data-view','data-quality','data-marker-quality']});
 observer.observe(document.body,{childList:true});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else sync();});reduced.addEventListener('change',sync);window.addEventListener('resize',sync);
 window.KanjiTargetVFX={sync,paintHybridAura,get state(){return {instances:instances.size,active:[...instances.values()].filter(active).length,fusionActive:[...fusionInstances.values()].filter(active).length,animated:!!raf,reduced:reduced.matches,paintCount,lastCost,geometryCache:geometries.size,tintCache:tints.size,markers:[...instances.values()].map(v=>({pair:v.pair,element:v.element,rgb:v.rgb,asset:!!v.frames,paints:v.paints,cut:v.el.dataset.focusCut,light:v.light}))};}};
 sync();
})();
