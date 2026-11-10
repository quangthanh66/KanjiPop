/* Hybrid clear crystal: generated transparent crystal sprites with shared palette lighting.
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
 const spriteFiles=['diamond','triangle','hexagon','round','square','pentagon','point'];
 function render(pair,id){
  const index=assignment[pair%assignment.length],cut=cuts[index],uid='gem-hybrid-'+(++serial),o=cut.outer;
  const phase=-((pair*1.37+String(id).split('').reduce((n,c)=>n+c.charCodeAt(0),0)*.17)%8);
  const t=cut.table,gleam=[(o[0][0]+t[0][0])/2,(o[0][1]+t[0][1])/2],other=Math.floor(o.length*.6),shine=[(o[other][0]+t[other][0])/2,(o[other][1]+t[other][1])/2];
  const star=([x,y])=>'M'+x+' '+(y-3.2)+'l.7 2.5 2.5 .7-2.5 .7-.7 2.5-.7-2.5-2.5-.7 2.5-.7Z';
  return '<svg class="jewel-art" data-material="hybrid-clear-crystal" style="--crystal-phase:'+phase.toFixed(2)+'s" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><defs>'+
   '<filter id="'+uid+'-tint" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feComponentTransfer in="SourceGraphic" result="light"><feFuncR type="linear" slope="1.18" intercept=".04"/><feFuncG type="linear" slope="1.18" intercept=".04"/><feFuncB type="linear" slope="1.18" intercept=".04"/></feComponentTransfer><feFlood flood-color="var(--tile-mid)" result="tint"/><feBlend in="light" in2="tint" mode="luminosity" result="colored"/><feComposite in="colored" in2="SourceGraphic" operator="in"/></filter>'+
   '<linearGradient id="'+uid+'-sheen"><stop stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="'+uid+'-rim"><polygon points="'+pts(o)+'" fill="white"/><polygon points="'+pts(t)+'" fill="black"/></mask></defs>'+
   '<image class="crystal-sprite" href="gem-hybrid/'+spriteFiles[index]+'.webp" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"'+(pair%assignment.length===3?'':' filter="url(#'+uid+'-tint)"')+'/>'+
   '<g mask="url(#'+uid+'-rim)"><path class="crystal-sheen" d="M-36 0H-19L41 100H24Z" fill="url(#'+uid+'-sheen)"/></g><path class="jewel-glint" d="'+star(gleam)+'" fill="#fff"/><path class="jewel-glint jewel-glint-secondary" d="'+star(shine)+'" fill="#e5ffff"/></svg>';
 }
 // Animate light along the actual facet contour, never rotate the contour itself.
 const focusKinds=['diamond','triangle','hexagon','round','square','pentagon','point'];
 // Elements follow recipe palette identity, independently of the gemstone cut.
 const focusElements=['thunder','magic','nature','magic','water','fire','water','fire','magic','water','nature','earth','ice','magic','ice','nature','fire','water','magic','magic','ice','magic','nature','magic'];
 function focus(pair){
  const index=assignment[pair%assignment.length];
  return '<canvas class="objective-fx" data-vfx="hybrid" data-pair="'+pair+'" data-focus-cut="'+focusKinds[index]+'" data-focus-element="'+focusElements[pair%focusElements.length]+'" aria-hidden="true"></canvas>';
 }
 window.KanjiGemArt={cuts,assignment,render,focus,elementFor:pair=>focusElements[pair%focusElements.length],cutFor:pair=>cuts[assignment[pair%assignment.length]]};
})();
