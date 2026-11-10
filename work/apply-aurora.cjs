const fs=require('fs'),base='work/kanji-pop-site/dist/';
let old=fs.readFileSync(base+'silk-background.js','utf8'),tail=old.slice(old.indexOf(' function running()'));
tail=tail.replace('  gradient=ctx.createLinearGradient(0,0,w*.15,h);\n  gradient.addColorStop(0,\'#45dac7\');gradient.addColorStop(.3,\'#65e1d5\');gradient.addColorStop(.59,\'#7d8eea\');gradient.addColorStop(.78,\'#698bd9\');gradient.addColorStop(1,\'#40d8c6\');','');
const head=`/* Aurora curtains and gently drifting stars. No gameplay input or state changes. */
(()=>{
 'use strict';
 const root=document.getElementById('kanji-pop'),canvas=root?.querySelector('canvas.aurora-field');
 if(!canvas)return;
 const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 let w=0,h=0,frame=0,last=0,phase=0,visible=true,light=false;
 let seed=9127;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const stars=Array.from({length:90},()=>({x:random(),y:random(),r:.45+random()*.65,depth:.3+random()*.7,alpha:.2+random()*.4,phase:random()*Math.PI*2}));
 function curtain(layer){
  const count=light?90:160,step=w/count,t=phase;
  for(let i=-1;i<=count;i++){
   const x=i*step,u=i/count;
   const wave=Math.sin(u*5.8+t*.14+layer*2.2);
   const base=h*((layer?.76:.35)+wave*.095+Math.sin(u*11-t*.09)*.025);
   const height=h*(layer?.34:.40)*(1+.16*Math.sin(u*8+t*.18));
   const folds=.68+.20*Math.sin(u*35+t*.27)+.12*Math.sin(u*76-t*.16);
   const envelope=.55+.45*Math.pow(Math.sin(Math.PI*(u*.78+.12)),2);
   const alpha=(layer?.18:.29)*folds*envelope;
   const g=ctx.createLinearGradient(x,base-height,x,base+h*.045);
   g.addColorStop(0,'rgba(50,140,190,0)');
   g.addColorStop(.3,layer?'rgba(126,104,228,.035)':'rgba(51,174,185,.025)');
   g.addColorStop(.7,layer?'rgba(110,119,235,'+alpha*.5+')':'rgba(59,221,188,'+alpha*.6+')');
   g.addColorStop(.91,layer?'rgba(108,160,245,'+alpha+')':'rgba(105,247,204,'+alpha+')');
   g.addColorStop(1,'rgba(58,186,196,0)');
   ctx.fillStyle=g;ctx.fillRect(x,base-height,step+1,height+h*.045);
  }
 }
 function draw(){
  if(!w||!h)return;
  ctx.clearRect(0,0,w,h);
  curtain(1);curtain(0);
  const count=light?50:stars.length;
  for(let i=0;i<count;i++){
   const star=stars[i],x=((star.x+phase*.001*star.depth)%1)*w,y=((star.y-phase*.0006*star.depth)%1+1)%1*h;
   const a=star.alpha*(.85+.15*Math.sin(phase*.36+star.phase));
   ctx.fillStyle='rgba(214,243,255,'+a+')';ctx.beginPath();ctx.arc(x,y,star.r,0,Math.PI*2);ctx.fill();
   if(i%13===0){const g=ctx.createRadialGradient(x,y,0,x,y,3);g.addColorStop(0,'rgba(178,224,255,'+a*.22+')');g.addColorStop(1,'rgba(178,224,255,0)');ctx.fillStyle=g;ctx.fillRect(x-3,y-3,6,6);}
  }
 }
`;
fs.writeFileSync(base+'aurora-background.js',head+tail);
let html=fs.readFileSync(base+'index.html','utf8').replace('class="silk-ribbon"','class="aurora-field"').replace('src="silk-background.js"','src="aurora-background.js"');fs.writeFileSync(base+'index.html',html);
let css=fs.readFileSync(base+'gem-art.css','utf8').replace('/* Option 3: one continuous silk ribbon, morphing rather than sliding a still image. */','/* Soft aurora curtains with a gently drifting star field. */').replace('radial-gradient(ellipse at 45% 45%,#143d56,#0b3b4b 65%,#145b68)','radial-gradient(ellipse at 45% 45%,#14374f,#0b2c43 65%,#164657)').replaceAll('silk-atmosphere','aurora-atmosphere').replace('.silk-ribbon{','.aurora-field{').replace(';filter:blur(2px)','');fs.writeFileSync(base+'gem-art.css',css);
let test=fs.readFileSync('work/silk-background-check.cjs','utf8').replaceAll('silk-ribbon','aurora-field').replaceAll('silk-soft-','aurora-').replace('canvas motion, stable layout','aurora/star motion, stable layout');fs.writeFileSync('work/aurora-background-check.cjs',test);
