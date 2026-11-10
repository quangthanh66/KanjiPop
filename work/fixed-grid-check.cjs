const E=require('./kanji-pop-site/dist/n5-engine.js'),assert=require('node:assert/strict'),fs=require('node:fs');
const results=[];let checks=0,maxHint=0;
for(const mode of ['mobile','desktop']){
 const all=new Set();
 for(const l of E.C.levels){
  let s=E.fresh(l.id,1234+l.id,mode),steps=0,hintMs=0;assert(E.valid(s));assert.equal(s.cols,mode==='desktop'?5:4);assert.equal(s.rows,mode==='desktop'?6:5);assert.equal(s.blanks,2);
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
// Old 3x3 runs, pending reveals and undo snapshots expand without losing counters.
function oldState(){let s=E.fresh(0,1234,'desktop');const tiles=s.board.filter(t=>t&&t.pair<4).sort((a,b)=>a.id-b.id);s.board=[2,0,4,6,null,1,3,5,7].map(i=>i===null?null:tiles[i]);s.cols=3;s.rows=3;s.blanks=1;s.version=8;return s;}
for(const pending of [false,true]){let old=oldState();if(pending)old=E.move(old,5,'left').state;assert.equal(Boolean(old.pending),pending);const s=E.upgrade(old);assert(E.valid(s));assert.equal(s.board.length,30);assert.equal(s.moves,old.moves);assert.equal(s.score,old.score);assert.deepEqual(s.found,old.found);assert.equal(s.pending?.recipe,old.pending?.recipe);if(pending)assert(E.valid(E.resume(s)));}
let v7=oldState();v7.version=7;delete v7.cols;delete v7.blanks;delete v7.mode;const m=E.upgrade(v7,'mobile');assert(E.valid(m));assert.equal(m.board.length,20);
// Existing full-size saves retain exact positions and pending refill plans.
let big=E.fresh(7,1241,'desktop');big.version=8;const migrated=E.upgrade(big);assert(E.valid(migrated));assert.deepEqual(migrated.board,big.board);
const report={status:'PASS',checks,ambiguous,refills,maxHintMs:Math.round(maxHint),results};fs.writeFileSync('work/fixed-grid-check-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks,ambiguous,refills,maxHintMs:report.maxHintMs}));
