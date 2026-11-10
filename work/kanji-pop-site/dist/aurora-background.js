/* Aurora curtains and gently drifting stars. No gameplay input or state changes. */
(()=>{
 'use strict';
 const root=document.getElementById('kanji-pop'),canvas=root?.querySelector('canvas.aurora-field');
 if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const sky=document.createElement('canvas'),skyCtx=sky.getContext('2d');
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let w=0,h=0,frame=0,last=0,phase=0,visible=true,light=false;
 let seed=9127;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const stars=Array.from({length:90},()=>({x:random(),y:random(),r:.45+random()*.65,depth:.3+random()*.7,alpha:.2+random()*.4,phase:random()*Math.PI*2}));
 function curtain(layer){
  const cw=sky.width,ch=sky.height,count=cw,step=1,t=phase;
  for(let i=-1;i<=count;i++){
   const x=i*step,u=i/count;
   const wave=Math.sin(u*5.8+t*.14+layer*2.2);
   const base=ch*((layer?.76:.35)+wave*.095+Math.sin(u*11-t*.09)*.025);
   const height=ch*(layer?.34:.40)*(1+.16*Math.sin(u*8+t*.18));
   const folds=.68+.20*Math.sin(u*35+t*.27)+.12*Math.sin(u*76-t*.16);
   const envelope=.55+.45*Math.pow(Math.sin(Math.PI*(u*.78+.12)),2);
   const alpha=(layer?.18:.29)*folds*envelope;
   const g=skyCtx.createLinearGradient(x,base-height,x,base+ch*.045);
   g.addColorStop(0,'rgba(50,140,190,0)');
   g.addColorStop(.3,layer?'rgba(126,104,228,.035)':'rgba(51,174,185,.025)');
   g.addColorStop(.7,layer?'rgba(110,119,235,'+alpha*.5+')':'rgba(59,221,188,'+alpha*.6+')');
   g.addColorStop(.91,layer?'rgba(108,160,245,'+alpha+')':'rgba(105,247,204,'+alpha+')');
   g.addColorStop(1,'rgba(58,186,196,0)');
   skyCtx.fillStyle=g;skyCtx.fillRect(x,base-height,step,height+ch*.045);
  }
 }
 function draw(){
  if(!w||!h)return;
  ctx.clearRect(0,0,w,h);
  skyCtx.clearRect(0,0,sky.width,sky.height);curtain(1);curtain(0);
  ctx.drawImage(sky,0,0,w,h);
  const count=light?50:stars.length;
  for(let i=0;i<count;i++){
   const star=stars[i],x=((star.x+phase*.001*star.depth)%1)*w,y=((star.y-phase*.0006*star.depth)%1+1)%1*h;
   const a=star.alpha*(.85+.15*Math.sin(phase*.36+star.phase));
   ctx.fillStyle='rgba(214,243,255,'+a+')';ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
   if(i%13===0){const g=ctx.createRadialGradient(x,y,0,x,y,3);g.addColorStop(0,'rgba(178,224,255,'+a*.22+')');g.addColorStop(1,'rgba(178,224,255,0)');ctx.fillStyle=g;ctx.fillRect(x-3,y-3,6,6);}
  }
 }
 function running(){return !motion.matches&&!document.hidden&&visible&&root.dataset.view==='play';}
 function tick(now){
  frame=0;if(!running()){last=0;return;}
  const interval=1000/(light?20:30);
  if(!last||now-last>=interval){phase+=last?Math.min((now-last)/1000,.1):0;last=now;draw();}
  frame=requestAnimationFrame(tick);
 }
 function sync(){
  light=root.dataset.quality==='light'||root.dataset.markerQuality==='light';
  if(!running()){cancelAnimationFrame(frame);frame=0;last=0;draw();}
  else if(!frame){last=0;frame=requestAnimationFrame(tick);}
 }
 function resize(){
  const r=canvas.getBoundingClientRect();if(!r.width||!r.height){sync();return;}
  w=r.width;h=r.height;sky.width=Math.ceil(w*.5);sky.height=Math.ceil(h*.5);
  const dpr=Math.min(devicePixelRatio||1,light?1:1.5);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);

  draw();sync();
 }
 new ResizeObserver(resize).observe(canvas);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-view','data-quality','data-marker-quality']});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
 motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 resize();
})();
