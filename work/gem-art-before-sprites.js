/* Cosmic brilliant B: original layered bevels, directional facet lighting and internal caustics.
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
  const cut=cuts[assignment[pair%assignment.length]],uid='crystal-b-'+pair+'-'+String(id).replace(/[^a-zA-Z0-9_-]/g,'')+'-'+(++serial),o=cut.outer;
  const t=cut.table.map(([x,y])=>[+(50+(x-50)*1.12).toFixed(2),+(cut.labelY+(y-cut.labelY)*1.12).toFixed(2)]);
  const mix=(a,b,f)=>a.map((v,k)=>+(v+(b[k]-v)*f).toFixed(2));
  const rim=o.map((v,i)=>mix(v,t[i],.18));
  const poly=(p,fill,opacity=1,cls='')=>'<polygon class="'+cls+'" points="'+pts(p)+'" fill="'+fill+'" fill-opacity="'+opacity+'"/>';
  let facets='',bevel='',seams='';
  for(let i=0;i<o.length;i++){
   const n=(i+1)%o.length,m=mix(rim[i],rim[n],.5),c=mix(t[i],t[n],.5);
   const light=Math.max(-1,Math.min(1,((50-m[0])*.65+(50-m[1])*.85)/43));
   const lit=light>.08,face=lit?'url(#'+uid+'-facet-light)':'url(#'+uid+'-facet-dark)';
   facets+=poly([rim[i],m,c,t[i]],face,lit?.35+light*.45:.38+Math.abs(light)*.45,'crystal-rim-face');
   facets+=poly([m,rim[n],t[n],c],i%3===0?'var(--tile-mid)':lit?'#eaffff':'#020824',i%3===0?.65:lit?.13+light*.2:.22+Math.abs(light)*.2);
   facets+=poly([m,t[n],c],lit?'#ffffff':'var(--tile-top)',lit?.5:.2);
   bevel+=poly([o[i],o[n],rim[n],rim[i]],lit?'#f5ffff':'var(--tile-edge)',lit?.48+light*.42:.9);
   seams+='<path d="M'+rim[i].join(' ')+'L'+t[i].join(' ')+'" stroke="'+(lit?'#edffff':'#050d26')+'" stroke-opacity="'+(lit?.4:.35)+'" stroke-width=".45"/>';
  }
  const phase=-((pair*1.37+String(id).split('').reduce((n,c)=>n+c.charCodeAt(0),0)*.17)%8);
  const sparkle=mix(o[0],t[0],.3),other=Math.floor(o.length*.6),sparkle2=mix(o[other],t[other],.22);
  const star=([x,y],size)=>'M'+x+' '+(y-size)+'q.4 '+(size-.4)+' '+size+' '+size+'q-'+(size-.4)+' .4 -'+size+' '+size+'q-.4 -'+(size-.4)+' -'+size+' -'+size+'q'+(size-.4)+' -.4 '+size+' -'+size+'Z';
  return '<svg class="jewel-art" data-material="cosmic-brilliant-b" style="--crystal-phase:'+phase.toFixed(2)+'s" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs>'+
   '<linearGradient id="'+uid+'-body" x1=".15" y1="0" x2=".7" y2="1"><stop stop-color="var(--tile-top)"/><stop offset=".24" stop-color="var(--tile-mid)"/><stop offset=".68" stop-color="var(--tile-base)"/><stop offset="1" stop-color="var(--tile-edge)"/></linearGradient>'+
   '<radialGradient id="'+uid+'-core" cx=".3" cy=".18" r=".98"><stop stop-color="var(--tile-top)"/><stop offset=".28" stop-color="var(--tile-mid)"/><stop offset=".72" stop-color="var(--tile-base)"/><stop offset="1" stop-color="var(--tile-edge)"/></radialGradient>'+
   '<linearGradient id="'+uid+'-facet-light" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fff"/><stop offset=".36" stop-color="#d9ffff"/><stop offset="1" stop-color="var(--tile-mid)" stop-opacity=".1"/></linearGradient>'+
   '<linearGradient id="'+uid+'-facet-dark" x1="0" y1="0" x2="1" y2="1"><stop stop-color="var(--tile-base)" stop-opacity=".2"/><stop offset=".58" stop-color="#02051f" stop-opacity=".85"/><stop offset="1" stop-color="var(--tile-top)"/></linearGradient>'+
   '<linearGradient id="'+uid+'-reflection" x1=".2" y1="0" x2=".7" y2="1"><stop stop-color="#fff" stop-opacity=".85"/><stop offset=".18" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#dfffff" stop-opacity="0"/></linearGradient>'+
   '<radialGradient id="'+uid+'-caustic" cx=".62" cy=".92" r=".62"><stop stop-color="#f4ffff" stop-opacity=".65"/><stop offset=".35" stop-color="var(--tile-top)" stop-opacity=".55"/><stop offset="1" stop-color="var(--tile-mid)" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="'+uid+'-sheen"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset=".52" stop-color="#fff" stop-opacity=".95"/><stop offset=".6" stop-color="#d4ffff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'+
   '<clipPath id="'+uid+'-clip"><polygon points="'+pts(o)+'"/></clipPath><clipPath id="'+uid+'-table"><polygon points="'+pts(t)+'"/></clipPath><mask id="'+uid+'-rim"><polygon points="'+pts(o)+'" fill="white"/><polygon points="'+pts(t)+'" fill="black"/></mask></defs>'+
   '<polygon class="crystal-outline" points="'+pts(o)+'" fill="url(#'+uid+'-body)" stroke="var(--tile-edge)" stroke-width="1.2" stroke-linejoin="round"/>'+
   '<g clip-path="url(#'+uid+'-clip)">'+facets+seams+bevel+
   '<polygon class="crystal-core" points="'+pts(t)+'" fill="url(#'+uid+'-core)" stroke="var(--tile-mid)" stroke-width=".45"/>'+
   '<g clip-path="url(#'+uid+'-table)"><polygon points="'+pts(t)+'" fill="url(#'+uid+'-caustic)"/><path d="M9 31 73 14 90 27 22 44Z" fill="url(#'+uid+'-reflection)"/><path d="M18 76 82 63 76 68 28 80Z" fill="var(--tile-top)" fill-opacity=".23"/><path d="M22 28Q50 12 78 29" fill="none" stroke="#f4ffff" stroke-opacity=".25" stroke-width=".6"/></g>'+
   '<g mask="url(#'+uid+'-rim)"><path d="M-4 37 69-6H77L0 44ZM31 105 100 62V65L37 105Z" fill="#efffff" fill-opacity=".7"/><path class="crystal-sheen" d="M-36 0H-14L46 100H24Z" fill="url(#'+uid+'-sheen)"/></g>'+
   '<path d="M'+t[t.length-1].join(' ')+'L'+t[0].join(' ')+'L'+t[1].join(' ')+'" fill="none" stroke="#f5ffff" stroke-opacity=".65" stroke-width=".65" stroke-linejoin="round"/>'+
   '<path d="M'+o[o.length-1].join(' ')+'L'+o[0].join(' ')+'L'+o[1].join(' ')+'" fill="none" stroke="#f5ffff" stroke-opacity=".9" stroke-width=".65" stroke-linejoin="round"/>'+
   '<path class="jewel-glint" d="'+star(sparkle,3.5)+'" fill="#fff"/><path class="jewel-glint jewel-glint-secondary" d="'+star(sparkle2,2.5)+'" fill="#e5ffff"/></g></svg>';
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
