const assert=require('assert/strict'),fs=require('fs'),vm=require('vm'),E=require('./kanji-pop-site/dist/n5-engine.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/kanji-pop-site/dist/course-plans.js','utf8'),ctx);
let runs=0,steps=0,refills=0;
for(const [mode,levels] of Object.entries(ctx.window.KanjiCoursePlans.modes))for(const [level,p] of levels.entries()){
 let s=E.fresh(level,p.seed,mode);
 for(const h of p.route){const old=E.targetAnchor(s),r=E.move(s,h.at,h.dir);assert(r.changed);s=r.state;assert(E.valid(s));steps++;
  if(!r.match)assert.equal(E.targetAnchor(s)?.id,old?.id);
  if(s.pending){if(!s.pending.complete){const plan=s.pending.plan;assert(E.distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)>=5);assert(!E.hasContact(plan.board,s.rows,s.cols));refills++;}s=E.resume(s);assert(E.valid(s));}
  if(!E.complete(s))assert(E.targetAnchor(s),'next objective must exist');
 }
 assert(E.complete(s));runs++;
}
// Both newly freed cells are central: neither has any cell five steps away.
let s=E.fresh(0,1234,'mobile'),tiles=s.board.filter(Boolean),pair=tiles.filter(t=>t.recipe===E.currentTarget(s)),rest=tiles.filter(t=>t.recipe!==pair[0].recipe),seed=42;
for(let attempt=0;attempt<1000;attempt++){
 const a=rest.slice();for(let i=a.length-1;i;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]];}
 s.board=Array(20).fill(null);s.board[5]=pair[0];s.board[10]=pair[1];for(let i=0;i<20;i++)if(![0,5,9,10].includes(i))s.board[i]=a.pop();if(E.valid(s))break;
}
assert(E.valid(s));const r=E.move(s,5,'down');assert(r.match);assert(E.valid(r.state));assert.deepEqual(r.state.pending.plan.freed,[9,10]);assert(!r.state.pending.plan.spawn.some(x=>[9,10].includes(x.at)));assert(E.valid(E.resume(r.state)));
console.log({runs,steps,refills,centralRefill:'passed',stableAnchor:'passed'});
