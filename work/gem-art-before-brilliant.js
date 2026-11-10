/* Cosmic crystal A: original procedural rim facets and a calm, high-contrast core.
   Keep pair-to-cut and pair-to-palette identity stable across board and reveals. */
(()=>{
 'use strict';
 const cuts=[
  {name:'kim cương vàng',outer:[[50,5],[95,50],[50,95],[5,50]],table:[[50,25],[74,50],[50,75],[26,50]],labelY:50},
  {name:'tam giác pha lê',outer:[[50,5],[95,91],[5,91]],table:[[50,33],[72,77],[28,77]],labelY:65},
  {name:'lục giác emerald',outer:[[28,8],[72,8],[94,49],[73,90],[27,90],[6,49]],table:[[34,25],[66,25],[76,49],[66,72],[34,72],[24,49]],labelY:49},
  {name:'brilliant tròn',outer:[[50,5],[73,11],[89,27],[96,50],[89,73],[73,89],[50,95],[27,89],[11,73],[4,50],[11,27],[27,11]],table:[[50,25],[63,28],[72,37],[76,50],[72,63],[63,72],[50,75],[37,72],[28,63],[24,50],[28,37],[37,28]],labelY:50},
  {name:'ruby vuông vát cạnh',outer:[[19,8],[81,8],[92,19],[92,81],[81,92],[19,92],[8,81],[8,19]],table:[[28,24],[72,24],[76,28],[76,72],[72,76],[28,76],[24,72],[24,28]],labelY:50},
  {name:'topaz ngũ giác',outer:[[50,4],[94,34],[82,89],[18,89],[6,34]],table:[[50,24],[72,42],[66,69],[34,69],[28,42]],labelY:49},
  {name:'sapphire giọt nhọn',outer:[[27,7],[73,7],[94,33],[50,96],[6,33]],table:[[35,23],[65,23],[72,36],[50,67],[28,36]],labelY:43}
 ];
 // Similar palette hues receive different silhouettes, including the three blues.
 const assignment=[0,1,2,4,3,5,6,4,1,0,2,5,3,2,6,0,5,4,3,6,2,1,5,0];
 const pts=a=>a.map(p=>p.join(',')).join(' ');
 let serial=0;
 function render(pair,id){
  const cut=cuts[assignment[pair%assignment.length]],uid='crystal-a-'+pair+'-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'')+'-'+(++serial),o=cut.outer;
  // Widen the quiet reading face without changing the outer silhouette or label center.
  const t=cut.table.map(([x,y])=>[+(50+(x-50)*1.16).toFixed(2),+(cut.labelY+(y-cut.labelY)*1.16).toFixed(2)]);
  let faces='';
  for(let i=0;i<o.length;i++){
   const n=(i+1)%o.length,mid=[(o[i][0]+o[n][0])/2,(o[i][1]+o[n][1])/2];
   const light=Math.max(-1,Math.min(1,((50-mid[0])*.5+(50-mid[1])*.9)/42));
   const fill=light>0?'#f3ffff':'#06142d',alpha=(light>0?.12+light*.32:.03+Math.abs(light)*.11).toFixed(2);
   faces+=`<polygon class="crystal-rim-face" points="${pts([o[i],o[n],t[n],t[i]])}" fill="${fill}" fill-opacity="${alpha}"/><polygon points="${pts([o[i],t[n],t[i]])}" fill="#e8ffff" fill-opacity="${i%2===0?.14:.04}"/><path d="M${o[i].join(' ')}L${t[i].join(' ')}" stroke="#eaffff" stroke-opacity=".3" stroke-width=".55"/>`;
  }
  const gleam=[(o[0][0]+t[0][0])/2,(o[0][1]+t[0][1])/2];
  const other=o[Math.floor(o.length*.6)],shine=[(other[0]+t[Math.floor(o.length*.6)][0])/2,(other[1]+t[Math.floor(o.length*.6)][1])/2];
  const phase=-((pair*1.37+String(id).split('').reduce((n,c)=>n+c.charCodeAt(0),0)*.17)%8);
  const star=(x,y)=>`M${x} ${y-4.2}l1 3.2 3.2 1-3.2 1-1 3.2-1-3.2-3.2-1 3.2-1Z`;
  return `<svg class="jewel-art" data-material="cosmic-crystal-a" style="--crystal-phase:${phase.toFixed(2)}s" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs>
   <linearGradient id="${uid}-body" x1=".12" y1="0" x2=".85" y2="1"><stop stop-color="var(--tile-top)"/><stop offset=".4" stop-color="var(--tile-mid)"/><stop offset=".75" stop-color="var(--tile-base)"/><stop offset="1" stop-color="var(--tile-top)"/></linearGradient>
   <linearGradient id="${uid}-core" x1=".15" y1="0" x2=".8" y2="1"><stop stop-color="var(--tile-mid)"/><stop offset=".6" stop-color="var(--tile-base)"/><stop offset="1" stop-color="var(--tile-base)"/></linearGradient>
   <linearGradient id="${uid}-glass" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f5ffff" stop-opacity=".56"/><stop offset=".28" stop-color="#e6ffff" stop-opacity=".13"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#c4ffff" stop-opacity=".38"/></linearGradient>
   <linearGradient id="${uid}-sheen"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
   <clipPath id="${uid}-clip"><polygon points="${pts(o)}"/></clipPath><mask id="${uid}-rim"><polygon points="${pts(o)}" fill="white"/><polygon points="${pts(t)}" fill="black"/></mask>
  </defs><polygon class="crystal-outline" points="${pts(o)}" fill="url(#${uid}-body)" fill-opacity=".72" stroke="var(--tile-top)" stroke-opacity=".8" stroke-width="1" stroke-linejoin="round"/>
  <g clip-path="url(#${uid}-clip)">${faces}<polygon class="crystal-core" points="${pts(t)}" fill="url(#${uid}-core)" fill-opacity=".72" stroke="var(--tile-top)" stroke-width=".85" stroke-opacity=".65"/><polygon points="${pts(o)}" fill="url(#${uid}-glass)"/>
   <g mask="url(#${uid}-rim)"><path d="M-4 41 70-5H86L4 55ZM25 105 100 55V63L38 105Z" fill="#efffff" fill-opacity=".32"/><path class="crystal-sheen" d="M-36 0H-19L41 100H24Z" fill="url(#${uid}-sheen)"/></g>
   <path d="M${t[t.length-1].join(' ')}L${t[0].join(' ')}L${t[1].join(' ')}" fill="none" stroke="#f5ffff" stroke-opacity=".82" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
   <path d="M${o[o.length-1].join(' ')}L${o[0].join(' ')}L${o[1].join(' ')}" fill="none" stroke="#f5ffff" stroke-opacity=".7" stroke-width="1.05" stroke-linejoin="round"/>
   <path class="jewel-glint" d="${star(...gleam)}" fill="#fff"/><path class="jewel-glint jewel-glint-secondary" d="${star(...shine)}" fill="#e5ffff"/>
  </g></svg>`;
 }
 // Animate light along the actual facet contour, never rotate the contour itself.
 const focusKinds=['diamond','triangle','hexagon','round','square','pentagon','point'];
 function focus(pair){
  const index=assignment[pair%assignment.length],cut=cuts[index],o=cut.outer;
  const contour='M'+o.map(p=>p.join(' ')).join('L')+'Z';
  const uid='focus-spectrum-'+(++serial),colors=['#50f5ff','#ff6ee4','#ffe879','#b799ff'];
  const outer='M'+o.map(([x,y])=>[50+(x-50)*1.09,50+(y-50)*1.09].join(' ')).join('L')+'Z';
  const vertices=o.map(([x,y],i)=>`<g transform="translate(${x} ${y})" style="--spark-color:${colors[i%4]};--spark-delay:${-(i/o.length)*4.8}s"><circle class="focus-flare" r="5.5"/><path class="focus-spark" d="M0-6.2 1.25-1.25 6.2 0 1.25 1.25 0 6.2-1.25 1.25-6.2 0-1.25-1.25Z"/></g>`).join('');
  // Bounded particles radiate from the perimeter, leaving the entire reading face clear.
  const dust=Array.from({length:24},(_,i)=>{const f=i/24*o.length,k=Math.floor(f),t=f-k,a=o[k],b=o[(k+1)%o.length],x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t,l=Math.hypot(x-50,y-50),dx=(x-50)/l,dy=(y-50)/l;return `<g transform="translate(${(x+dx*3).toFixed(2)} ${(y+dy*3).toFixed(2)})"><path class="focus-mote" style="--spark-color:${colors[i%4]};--spark-delay:${-i*.23}s;--drift-x:${(dx*6).toFixed(2)}px;--drift-y:${(dy*6).toFixed(2)}px" d="${i%3===0?'M0-2.4 .6-.6 2.4 0 .6 .6 0 2.4-.6 .6-2.4 0-.6-.6Z':'M-1-1H1V1H-1Z'}"/></g>`;}).join('');
  const accents=o.map(([x,y],i)=>{const b=o[(i+1)%o.length],mx=(x+b[0])/2,my=(y+b[1])/2;return `<g transform="translate(${50+(mx-50)*1.1} ${50+(my-50)*1.1}) rotate(${Math.atan2(b[1]-y,b[0]-x)*180/Math.PI})"><path class="focus-rune" style="--spark-color:${colors[(i+1)%4]};--spark-delay:${-i*.5}s" d="M-4 0H-1M1 0H4M0-1.8 1.8 0 0 1.8-1.8 0Z"/></g>`;}).join('');
  return `<svg class="objective-fx" data-focus-cut="${focusKinds[index]}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs><linearGradient id="${uid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#46f5ff"/><stop offset=".32" stop-color="#a899ff"/><stop offset=".62" stop-color="#ff6edd"/><stop offset="1" stop-color="#ffe77e"/></linearGradient></defs><path class="focus-aura" style="stroke:url(#${uid})" d="${contour}"/><path class="focus-corona" style="stroke:url(#${uid})" pathLength="100" d="${outer}"/><path class="focus-contrast" d="${contour}"/><path class="focus-outline" style="stroke:url(#${uid})" d="${contour}"/><path class="focus-trail" pathLength="100" d="${contour}"/><path class="focus-echo" pathLength="100" d="${contour}"/><path class="focus-prism" pathLength="100" d="${contour}"/><path class="focus-comet-head" pathLength="100" d="${contour}"/><g class="focus-accents">${accents}</g><g class="focus-vertices">${vertices}</g><g class="focus-dust-field">${dust}</g></svg>`;
 }
 window.KanjiGemArt={cuts,assignment,render,focus,cutFor:pair=>cuts[assignment[pair%assignment.length]]};
})();
