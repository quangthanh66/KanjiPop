/* Continuous translucent silk: shaded across its width, with feathered edges.
   Canvas remains behind gameplay; only the background pixels are animated. */
(()=>{
 'use strict';
 const root=document.getElementById('kanji-pop'),canvas=root?.querySelector('canvas.silk-ribbon');
 if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),N=70,lanes=64;
 const xs=new Float32Array(N+1),ys=new Float32Array(N+1),nx=new Float32Array(N+1),ny=new Float32Array(N+1),widths=new Float32Array(N+1);
 let w=0,h=0,gradient,frame=0,last=0,phase=0,visible=true,light=false;
 const gaussian=(x,c,s)=>Math.exp(-(((x-c)/s)**2));
 function draw(){
  if(!w||!h)return;
  ctx.clearRect(0,0,w,h);
  const t=phase;
  for(let i=0;i<=N;i++){
   const v=-.16+1.32*i/N;
   const angle=v*Math.PI*2+.13+Math.sin(t*.29)*.22;
   xs[i]=w*(.40-.43*Math.cos(angle)+Math.sin(v*7-t*.38)*.028);
   ys[i]=h*v;
   const slope=w*(.43*Math.sin(angle)*Math.PI*2+.196*Math.cos(v*7-t*.38))/h;
   const length=Math.hypot(1,slope);nx[i]=1/length;ny[i]=-slope/length;
   widths[i]=w*(.07+.052*(.5+.5*Math.sin(v*5+t*.31)));
  }
  ctx.fillStyle=gradient;
  // Broad translucent halo plus a folded luminous shoulder. No flat opaque fill.
  const count=light?40:lanes;
  for(let j=0;j<count;j++){
   const u=-2.5+5*(j+.5)/count,half=2.56/count;
   const shade=.13*gaussian(u,0,1.05)+.16*gaussian(u,-.39,.43)+.17*gaussian(u,-.73,.15);
   ctx.globalAlpha=shade;
   ctx.beginPath();
   for(let i=0;i<=N;i++){
    const fold=.16*Math.sin(i/N*5+t*.35),offset=(u-half+fold)*widths[i];
    const x=xs[i]+nx[i]*offset,y=ys[i]+ny[i]*offset;
    if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
   }
   for(let i=N;i>=0;i--){
    const offset=(u+half+.16*Math.sin(i/N*5+t*.35))*widths[i];
    ctx.lineTo(xs[i]+nx[i]*offset,ys[i]+ny[i]*offset);
   }
   ctx.closePath();ctx.fill();
  }
  ctx.globalAlpha=1;
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
  w=r.width;h=r.height;
  const dpr=Math.min(devicePixelRatio||1,light?1:1.5);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  gradient=ctx.createLinearGradient(0,0,w*.15,h);
  gradient.addColorStop(0,'#45dac7');gradient.addColorStop(.3,'#65e1d5');gradient.addColorStop(.59,'#7d8eea');gradient.addColorStop(.78,'#698bd9');gradient.addColorStop(1,'#40d8c6');
  draw();sync();
 }
 new ResizeObserver(resize).observe(canvas);
 new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-view','data-quality','data-marker-quality']});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(canvas);
 motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 resize();
})();
