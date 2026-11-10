const E=require('./kanji-pop-site/dist/n5-engine.js'),assert=require('node:assert/strict'),fs=require('node:fs');
const results=[];let checks=0,maxHint=0;
for(const mode of ['mobile','desktop']){
 const all=new Set();
 for(const l of E.C.levels){
  let s=E.fresh(l.id,1234+l.id,mode),steps=0,hintMs=0;assert(E.valid(s));
  while(s.status!=='won'&&steps<500){
   const t=performance.now(),h=E.hint(s),elapsed=performance.now()-t;hintMs+=elapsed;maxHint=Math.max(maxHint,elapsed);assert(h,mode+' level '+l.id+' no hint');
   const r=E.move(s,h.at,h.dir);assert(r.changed);assert(E.valid(r.state));checks++;s=r.state;steps++;
   if(s.pending){all.add(s.pending.recipe);s=E.resume(s);assert(E.valid(s));}
  }
  assert.equal(s.status,'won',mode+' level '+l.id);for(const id of l.targets)assert(s.found.includes(id));
  const result={mode,level:l.id+1,cols:s.cols,rows:s.rows,steps,hintMs:Math.round(hintMs)};results.push(result);console.log(JSON.stringify(result));
 }
 assert.equal(all.size,24);
}
// Random transitions check every layout and nonmatching invalid directions.
let seed=19239;const random=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
let ambiguous=0,refills=0;
for(const mode of ['mobile','desktop'])for(const l of E.C.levels)for(let run=0;run<3;run++){
 let s=E.fresh(l.id,random(1000000),mode);assert(E.valid(s));
 for(let j=0;j<100;j++){
  const moves=s.board.flatMap((tile,at)=>tile?E.legalDirections(s,at).map(dir=>({at,dir})):[]);assert(moves.length);
  for(let i=0;i<s.board.length;i++)if(E.legalDirections(s,i).length>1){ambiguous++;assert.equal(E.directionToBlank(s,i),null);}
  const m=moves[random(moves.length)],before=JSON.stringify(s),r=E.move(s,m.at,m.dir);assert.equal(JSON.stringify(s),before);assert(r.changed);assert(E.valid(r.state));checks++;s=r.state;
  if(s.pending){s=E.resume(s);refills++;assert(E.valid(s));}
  if(s.status==='won')break;
  assert.equal(s.board.filter(t=>t===null).length,s.blanks);
 }
}
// Legacy migration preserves pending plans and exact board data.
let legacy=E.fresh(0,1234);legacy.version=7;delete legacy.cols;delete legacy.blanks;delete legacy.mode;
let upgraded=E.upgrade(legacy);assert(E.valid(upgraded));assert.deepEqual(upgraded.board,legacy.board);
let pending=E.move(upgraded,5,'left').state;assert(pending.pending);pending.version=7;delete pending.cols;delete pending.blanks;delete pending.mode;
upgraded=E.upgrade(pending);assert(E.valid(upgraded));assert.deepEqual(upgraded.pending,pending.pending);assert(E.valid(E.resume(upgraded)));
const report={status:'PASS',checks,ambiguous,refills,maxHintMs:Math.round(maxHint),results};fs.writeFileSync('work/grid-check-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks,ambiguous,refills,maxHintMs:report.maxHintMs}));
