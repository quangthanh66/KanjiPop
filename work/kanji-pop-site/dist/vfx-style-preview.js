/* Isolated comparison: no production save, target-marker or game-loop changes. */
(()=>{
 'use strict';
 const root=document.querySelector('#kanji-pop'),container=document.querySelector('#comparisons');
 const descriptions=[
  {title:'Năng lượng lỏng',sub:'Dòng chảy · Mềm và liên tục',text:'Dải năng lượng thay đổi độ dày, cuộn nhẹ ở đầu và tan ở đuôi. Chuyển động ôm hình đá, không tạo một khung sáng cứng.'},
  {title:'Ma thuật bằng sprite',sub:'Chất liệu · Khói sáng có chiều sâu',text:'Chất liệu ma thuật được vẽ riêng, chạy thành dòng quanh đá. Có các lớp khói mỏng, sợi sáng và chuyển động xoáy nhỏ.'},
  {title:'Năng lượng trong lõi',sub:'Khúc xạ · Ánh sáng dưới mặt cắt',text:'Năng lượng chạy bên trong, phản chiếu qua các mặt cắt rồi thoát thành bụi sáng. Ít che bàn chơi, giữ viên đá trong trẻo.'},
  {title:'Sprite + năng lượng lõi',sub:'Kết hợp · Luồng ma thuật dày hơn',text:'Khói ma thuật dày hơn 1,6 lần ôm quanh đá, kết hợp năng lượng chạy trong lõi và phản chiếu qua các mặt cắt. Hai lớp chuyển động cùng nhịp.'},
  {title:'Kết hợp cả ba lớp',sub:'Thêm dòng năng lượng lỏng mảnh',text:'Giữ sprite dày và ánh sáng trong lõi của mẫu 04, thêm một dòng năng lượng lỏng mảnh chạy dọc mép đá. Ba lớp cùng nhịp, cùng tông tím.',recommend:true}
 ];
 const palette=['#f4b400','#9855e8','#62b82c','#ed5c9d','#24bfaf','#f18422','#4f8feb','#e83a40','#c04ccf','#39bce0','#39a965','#b87c3d','#9ba4b1','#695ee0','#829ca4','#b4c92a','#e96a43','#416be0','#ba78ae','#d84b78','#647d8e','#bd2767','#80b34a','#a65cba'];
 const snapshot=KanjiN5.fresh(4,824157,'mobile').board,targetId=snapshot.find(t=>t?.pair===1&&t.side===0).id;
 const initialTarget=snapshot.findIndex(t=>t?.id===targetId);[snapshot[17],snapshot[initialTarget]]=[snapshot[initialTarget],snapshot[17]];
 const cut=KanjiGemArt.cutFor(1),views=[],positions=[17,0,4,30,34];
 const requestedSample=Number(new URLSearchParams(location.search).get('sample'));
 let positionIndex=0,active=requestedSample>=1&&requestedSample<=descriptions.length?requestedSample-1:4,chosen=null,paused=matchMedia('(prefers-reduced-motion:reduce)').matches,speed=1,zoom=false,time=0,raf=0,last=0,lastPaint=0,frames=[],assetReady=false;
 const blendedFrame=document.createElement('canvas');blendedFrame.width=256;blendedFrame.height=128;const blendCtx=blendedFrame.getContext('2d');
 try{const stored=Number(localStorage.getItem('kanji-pop-vfx-study-choice-v1'));if(localStorage.getItem('kanji-pop-vfx-study-choice-v1')!==null&&stored>=0&&stored<descriptions.length)chosen=stored;}catch{}
 const NS='http://www.w3.org/2000/svg';
 function makeTrack(points){
  const svg=document.createElementNS(NS,'svg'),path=document.createElementNS(NS,'path');
  svg.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';svg.setAttribute('aria-hidden','true');
  const mix=(a,b,f)=>a.map((v,i)=>v+(b[i]-v)*f),entry=i=>mix(points[i],points[(i+points.length-1)%points.length],.15),exit=i=>mix(points[i],points[(i+1)%points.length],.15);
  path.setAttribute('d','M'+exit(0).join(' ')+points.map((_,j)=>{const i=(j+1)%points.length;return 'L'+entry(i).join(' ')+'Q'+points[i].join(' ')+' '+exit(i).join(' ');}).join('')+'Z');svg.append(path);document.body.append(svg);
  const length=path.getTotalLength(),samples=Array.from({length:512},(_,i)=>{const p=path.getPointAtLength(i/512*length),a=path.getPointAtLength((i/512*length+.3)%length),dx=a.x-p.x,dy=a.y-p.y,l=Math.hypot(dx,dy);return {x:p.x,y:p.y,dx:dx/l,dy:dy/l,nx:dy/l,ny:-dx/l};});svg.remove();
  return {length,at(u){u=((u%1)+1)%1;const p=u*512,i=Math.floor(p),f=p-i,a=samples[i],b=samples[(i+1)%512],out={};for(const k of Object.keys(a))out[k]=a[k]+(b[k]-a[k])*f;return out;}};
 }
 const track=makeTrack(cut.outer.map(([x,y])=>[50+(x-50)*1.015,50+(y-50)*1.015]));
 function rgba(a){return 'rgba(181,123,255,'+a+')';}
 function polygon(ctx,pts){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();}
 function light(ctx,x,y,r,alpha=1){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(238,218,255,'+(.65*alpha)+')');g.addColorStop(.2,'rgba(175,104,255,'+(.5*alpha)+')');g.addColorStop(1,'rgba(115,44,225,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
 function fluid(ctx,t,widthScale=1){
  ctx.globalCompositeOperation='screen';
  for(let stream=0;stream<2;stream++){
   const head=t/4.7+stream*.51,len=.42;
   for(let layer=0;layer<4;layer++){
    const left=[],right=[];
    for(let j=0;j<=58;j++){
     const f=j/58,p=track.at(head-len+f*len),w=Math.pow(Math.sin(Math.PI*f),.65)*(layer===0?6.5:3.5-layer*.6)*widthScale,wave=(Math.sin(f*12-t*2.1+layer*.9)*1.25+Math.sin(f*27+t*1.3)*.45)*widthScale;
     const shift=wave+layer*.35;left.push([p.x+p.nx*(shift+w),p.y+p.ny*(shift+w)]);right.push([p.x+p.nx*(shift-w),p.y+p.ny*(shift-w)]);
    }
    const a=track.at(head-len),b=track.at(head),g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,'rgba(110,43,215,0)');g.addColorStop(.35,rgba(layer===0?.18:.35));g.addColorStop(.78,layer===0?'rgba(136,62,236,.35)':'rgba(215,172,255,.8)');g.addColorStop(1,'rgba(224,194,255,0)');ctx.fillStyle=g;ctx.shadowColor='#9c4bf2';ctx.shadowBlur=layer===0?5:1;polygon(ctx,[...left,...right.reverse()]);ctx.fill();
   }
   ctx.shadowBlur=0;const h=track.at(head-.06);light(ctx,h.x,h.y,7,.65);
  }
 }
 function buildFrames(img){
  const size=img.width/4;frames=Array.from({length:16},(_,i)=>{
   const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d');x.drawImage(img,(i%4)*size,Math.floor(i/4)*size,size,size,0,0,256,128);
   x.globalCompositeOperation='destination-in';const fade=x.createLinearGradient(0,0,256,0);fade.addColorStop(0,'transparent');fade.addColorStop(.12,'white');fade.addColorStop(.84,'white');fade.addColorStop(1,'transparent');x.fillStyle=fade;x.fillRect(0,0,256,128);return c;
  });
 }
 // Inverse texture mapping avoids the bright seams produced by overlapping strip draws.
 const surfaceSize=280,surfaceSpan=164,surfaceInset=32;
 const spriteSurface=document.createElement('canvas');spriteSurface.width=spriteSurface.height=surfaceSize;const spriteCtx=spriteSurface.getContext('2d'),spritePixels=spriteCtx.createImageData(surfaceSize,surfaceSize),spriteMap=[];
 {
  const segments=Array.from({length:256},(_,i)=>({a:track.at(i/256),b:track.at((i+1)/256)}));
  for(let y=0;y<surfaceSize;y++)for(let x=0;x<surfaceSize;x++){
   const px=x/(surfaceSize-1)*surfaceSpan-surfaceInset,py=y/(surfaceSize-1)*surfaceSpan-surfaceInset;let best=Infinity,u=0,v=0;
   segments.forEach(({a,b},j)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,f=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l)),xx=px-a.x-f*dx,yy=py-a.y-f*dy,d=xx*xx+yy*yy;
    if(d<best){best=d;u=(j+f)/256;v=(xx*a.nx+yy*a.ny);}
   });
   if(best<surfaceInset*surfaceInset)spriteMap.push({index:(y*surfaceSize+x)*4,u,distance:v});
  }
 }
 function sprite(ctx,t,thickness=1){
  if(!assetReady)return;
  const sequence=t*11,frame=Math.floor(sequence)%16,next=(frame+1)%16,mix=sequence%1;
  blendCtx.clearRect(0,0,256,128);blendCtx.globalCompositeOperation='lighter';blendCtx.globalAlpha=1-mix;blendCtx.drawImage(frames[frame],0,0);blendCtx.globalAlpha=mix;blendCtx.drawImage(frames[next],0,0);blendCtx.globalAlpha=1;
  const tex=blendCtx.getImageData(0,0,256,128).data,out=spritePixels.data;out.fill(0);
  for(const point of spriteMap){
   const textureY=64-point.distance*3.2/thickness;if(textureY<0||textureY>127)continue;
   let alpha=0,red=0,green=0,blue=0;
   for(let stream=0;stream<2;stream++){
    const head=t/5.8+stream*.5,f=(((point.u-head+.54)%1)+1)%1/.54;if(f>1)continue;
    const tx=f*255,ty=textureY,ix=Math.floor(tx),iy=Math.floor(ty),fx=tx-ix,fy=ty-iy;
    for(let yy=0;yy<2;yy++)for(let xx=0;xx<2;xx++){
     const k=(Math.min(127,iy+yy)*256+Math.min(255,ix+xx))*4,w=(xx?fx:1-fx)*(yy?fy:1-fy),a=tex[k+3]/255*w;
     alpha+=a;red+=tex[k]*a;green+=tex[k+1]*a;blue+=tex[k+2]*a;
    }
   }
   if(alpha>0){const k=point.index;out[k]=red/alpha;out[k+1]=green/alpha;out[k+2]=blue/alpha;out[k+3]=Math.min(1,alpha)*255;}
  }
  spriteCtx.putImageData(spritePixels,0,0);ctx.globalCompositeOperation='screen';ctx.drawImage(spriteSurface,-surfaceInset,-surfaceInset,surfaceSpan,surfaceSpan);
 }
 function core(ctx,t){
  ctx.save();polygon(ctx,cut.outer);ctx.clip();ctx.globalCompositeOperation='screen';
  for(let i=0;i<3;i++){
   const p=track.at(t/6.2+i/3),x=50+(p.x-50)*.65,y=50+(p.y-50)*.65;light(ctx,x,y,17,1.2);
  }
  for(let i=0;i<cut.outer.length;i++){
   const a=cut.outer[i],b=cut.outer[(i+1)%cut.outer.length],c=cut.table[(i+1)%cut.table.length],d=cut.table[i],phase=(t/6.2-i/cut.outer.length+2)%1,energy=Math.pow(Math.max(0,Math.cos(phase*Math.PI*2)),9);
   const g=ctx.createLinearGradient(d[0],d[1],a[0],a[1]);g.addColorStop(0,'rgba(124,55,230,0)');g.addColorStop(.65,'rgba(165,105,255,'+(.05+energy*.32)+')');g.addColorStop(1,'rgba(243,218,255,'+(energy*.85)+')');ctx.fillStyle=g;polygon(ctx,[a,b,c,d]);ctx.fill();
   if(energy>.1){ctx.strokeStyle='rgba(232,206,255,'+(energy*.7)+')';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(d[0],d[1]);ctx.quadraticCurveTo((a[0]+d[0])/2+Math.sin(t+i)*2,(a[1]+d[1])/2,a[0],a[1]);ctx.stroke();}
  }
  ctx.restore();
 }
 function particles(ctx,t,mode){
  ctx.globalCompositeOperation='screen';const amount=mode===2?10:18;
  for(let i=0;i<amount;i++){
   const life=(t/(mode===2?2.7:2.1)+i*.618)%1,p=track.at(t/(mode===1?5.8:4.7)-i*.019),drift=(mode===2?4:7)*life;
   const x=p.x+p.nx*drift+Math.sin(i*2.4+life*4)*.5,y=p.y+p.ny*drift-life*3,alpha=Math.sin(Math.PI*life)*(.55+(i%3)*.15);
   ctx.fillStyle='rgba(225,193,255,'+alpha+')';ctx.beginPath();ctx.arc(x,y,i%5===0?.85:.4,0,Math.PI*2);ctx.fill();
  }
 }
 function draw(view){
  if(!view.geometry||view.card.offsetParent===null)return;
  const {w,h,dpr,x,y,size}=view.geometry,c=view.ctx;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.save();c.translate(x,y);c.scale(size/100,size/100);
  if(view.index===0)fluid(c,time);else if(view.index===1)sprite(c,time);else if(view.index===2)core(c,time);else{
   core(c,time*6.2/5.8);sprite(c,time,1.6);
   if(view.index===4){c.save();c.globalAlpha=.8;fluid(c,time*4.7/5.8,.5);c.restore();}
  }
  particles(c,time,view.index>=3?1:view.index);c.restore();
 }
 function layout(view){
  if(view.card.offsetParent===null)return;
  const b=view.board.getBoundingClientRect(),t=view.board.querySelector('.target').getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  const width=Math.round(b.width*dpr),height=Math.round(b.height*dpr);if(view.canvas.width!==width||view.canvas.height!==height){view.canvas.width=width;view.canvas.height=height;}
  view.geometry={w:b.width,h:b.height,dpr,x:t.left-b.left,y:t.top-b.top,size:t.width};
  view.board.querySelectorAll('.demo-cell').forEach(el=>el.style.setProperty('--gem-glyph-size',Math.max(14,(zoom?t.width:el.clientWidth)*.28)+'px'));draw(view);
 }
 function makeBoard(view){
  view.board.replaceChildren();const copy=snapshot.slice(),to=positions[positionIndex],from=copy.findIndex(t=>t?.id===targetId);[copy[to],copy[from]]=[copy[from],copy[to]];
  copy.forEach((tile,at)=>{
   const cell=document.createElement('div');cell.className='demo-cell'+(!tile?' blank':tile.id===targetId?' target':'');cell.dataset.at=at;
   if(tile){cell.dataset.id=tile.id;cell.dataset.pair=tile.pair;cell.style.setProperty('--tile-mid',palette[tile.pair]);cell.style.setProperty('--gem-label-y',KanjiGemArt.cutFor(tile.pair).labelY+'%');cell.innerHTML=KanjiGemArt.render(tile.pair,'study-'+view.index+'-'+tile.id)+'<span class="tile-glyph" lang="ja">'+tile.part+'</span>';cell.setAttribute('aria-label',tile.part+(tile.id===targetId?' · Viên mục tiêu ma thuật':''));}
   else cell.textContent='TRỐNG';view.board.append(cell);
  });
  view.board.append(view.canvas);layout(view);
 }
 descriptions.forEach((d,index)=>{
  const card=document.createElement('article');card.className='variant'+(index===active?' active':'');card.dataset.variant=index;card.innerHTML='<header class="variant-heading"><span class="variant-number">0'+(index+1)+'</span><div><h2>'+d.title+'</h2><p class="variant-subtitle">'+d.sub+'</p></div>'+(d.recommend?'<span class="recommended">MẪU MỚI</span>':'')+'</header><div class="phone"><div class="demo-hud"><span class="demo-logo">KANJIDLE</span><span class="demo-level">MÀN THỬ</span></div><div class="demo-mission"><span>Tìm cặp cùng màu và hình</span><span class="demo-route">? ? ?</span></div><div class="demo-board" role="img" aria-label="Bàn mobile 5 cột 7 hàng · '+d.title+'"></div><div class="phone-footer"><span>MA THUẬT · ĐÁ TÍM</span><span>5 × 7</span></div></div><p class="variant-description">'+d.text+'</p><button class="choose-button" data-choose="'+index+'" aria-pressed="false">Chọn mẫu 0'+(index+1)+'</button>';container.append(card);
  const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');const view={card,board:card.querySelector('.demo-board'),canvas,ctx:canvas.getContext('2d'),index};views.push(view);makeBoard(view);
 });
 function choice(index,save=true){chosen=index;views.forEach(v=>{const yes=v.index===chosen;v.card.classList.toggle('chosen',yes);const b=v.card.querySelector('.choose-button');b.setAttribute('aria-pressed',String(yes));b.textContent=(yes?'Đã chọn mẫu 0':'Chọn mẫu 0')+(v.index+1);});document.querySelector('#selection-status').textContent='Bạn chọn mẫu 0'+(index+1)+' · '+descriptions[index].title+'. Có thể đổi lựa chọn sau khi xem thêm.';if(save)try{localStorage.setItem('kanji-pop-vfx-study-choice-v1',String(index));}catch{document.querySelector('#selection-status').textContent+=' Trình duyệt không lưu được lựa chọn.';}}
 document.querySelectorAll('[data-choose]').forEach(b=>b.onclick=()=>choice(Number(b.dataset.choose)));if(chosen!==null)choice(chosen,false);
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.tab)===active)));
 function revealActiveTab(){const nav=document.querySelector('.variant-tabs'),tab=nav.querySelector('[data-tab="'+active+'"]');if(nav.offsetParent!==null)nav.scrollLeft+=tab.getBoundingClientRect().left-nav.getBoundingClientRect().left-(nav.clientWidth-tab.clientWidth)/2;}
 requestAnimationFrame(revealActiveTab);
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{active=Number(b.dataset.tab);document.querySelectorAll('[data-tab]').forEach(el=>el.setAttribute('aria-pressed',String(Number(el.dataset.tab)===active)));views.forEach(v=>v.card.classList.toggle('active',v.index===active));requestAnimationFrame(()=>{views.forEach(layout);revealActiveTab();});});
 function updateStatus(){const b=document.querySelector('#play-toggle');b.textContent=paused?'Tiếp tục':'Tạm dừng';b.setAttribute('aria-pressed',String(paused));document.querySelector('#motion-status').textContent=(paused?'Đã tạm dừng':'Đang phát '+(speed===.5?'chậm 0,5×':'đồng thời'))+' · Chỉ viên mục tiêu có hiệu ứng';}
 function tick(now){raf=0;if(document.hidden||paused)return;const dt=last?Math.min((now-last)/1000,.08):0;last=now;time+=dt*speed;if(now-lastPaint>1000/30){views.forEach(draw);lastPaint=now;}raf=requestAnimationFrame(tick);}
 function start(){last=0;if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(tick);}
 document.querySelector('#play-toggle').onclick=()=>{paused=!paused;if(paused){cancelAnimationFrame(raf);raf=0;}else start();updateStatus();};
 document.querySelector('#restart-preview').onclick=()=>{time=0;last=0;views.forEach(draw);};
 document.querySelector('#speed').onchange=e=>{speed=Number(e.target.value);updateStatus();};
 document.querySelector('#zoom-toggle').onclick=e=>{zoom=!zoom;root.classList.toggle('zoomed',zoom);e.currentTarget.setAttribute('aria-pressed',String(zoom));e.currentTarget.textContent=zoom?'Kích thước chơi':'Xem gần';views.forEach(layout);};
 document.querySelector('#position-toggle').onclick=()=>{positionIndex=(positionIndex+1)%positions.length;views.forEach(makeBoard);};
 const ro=new ResizeObserver(()=>views.forEach(layout));views.forEach(v=>ro.observe(v.board));window.addEventListener('resize',()=>views.forEach(layout));document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else start();});
 const atlas=new Image();atlas.onload=()=>{buildFrames(atlas);assetReady=true;views.forEach(draw);};atlas.onerror=()=>{views[1].card.querySelector('.variant-description').textContent='Không tải được chất liệu sprite. Hãy tải lại trang để thử lại.';};atlas.src='vfx-study-assets/magic-ribbon-atlas.webp';
 updateStatus();document.fonts.ready.then(()=>views.forEach(layout));start();
 // Read-only debug state for repeatable preview QA; no hook into gameplay saves.
 window.KanjiVfxStudy={get state(){return {time,paused,speed,active,zoom,positionIndex,assetReady,chosen,visible:views.filter(v=>v.card.offsetParent!==null).map(v=>v.index)};}};
})();
