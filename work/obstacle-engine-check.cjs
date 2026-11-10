const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),E=require('./kanji-pop-site/dist/n5-engine.js'),O=require('./kanji-pop-site/dist/n5-legacy-v9.js');const cx={window:{}};vm.runInNewContext(fs.readFileSync('work/course-plans-before40.js','utf8'),cx);const nc={window:{}};vm.runInNewContext(fs.readFileSync('work/kanji-pop-site/dist/course-plans.js','utf8'),nc);let migrated=0,moves=0,spawns=0;
function check(s){assert(E.valid(s));assert.equal(s.board.length,40);assert.equal(s.board.filter(x=>x===false).length,3);assert.equal(s.board.filter(x=>x===null).length,1+(s.pending||s.status==='won'?2:0));for(const at of s.blocked){assert.equal(s.board[at],false);for(const dir of E.directions)assert(!E.move(s,at,dir).changed);}assert.deepEqual(E.reorient(E.reorient(s,s.mode==='mobile'?'desktop':'mobile'),s.mode),s);}
for(const mode of ['mobile','desktop']){
 const sample=E.fresh(0,1234,mode),open=sample.board.flatMap((t,i)=>t!==false?[i]:[]);
 for(const removed of [-1,...open]){const allowed=open.filter(i=>i!==removed),seen=new Set([allowed[0]]),q=[allowed[0]];for(let i=0;i<q.length;i++)for(const n of E.neighbors(q[i],sample.rows,sample.cols))if(allowed.includes(n)&&!seen.has(n)){seen.add(n);q.push(n);}assert.equal(seen.size,allowed.length,'connected even after removing any one open cell');}
 for(let level=0;level<15;level++){
  for(let seed=0;seed<12;seed++){const s=E.fresh(level,seed,mode);check(s);for(const id of new Set(s.board.filter(Boolean).map(t=>t.pair))){const p=s.board.flatMap((t,i)=>t?.pair===id?[i]:[]);assert(E.walkDistance(s,...p)>=5);}}
  let old=O.fresh(level,cx.window.KanjiCoursePlans.modes[mode][level].seed,mode);
  function migration(){const s=E.upgrade(old);check(s);for(const key of ['found','moves','matches','score','status'])assert.deepEqual(s[key],old[key]);assert.deepEqual(E.upgrade(s),s);if(s.pending){assert.equal(s.pending.recipe,old.pending.recipe);check(E.resume(s));}migrated++;}
  migration();for(const h of cx.window.KanjiCoursePlans.modes[mode][level].route){old=O.move(old,h.at,h.dir).state;if(old.pending){migration();old=O.resume(old);migration();}}
  const plan=nc.window.KanjiCoursePlans.modes[mode][level];let s=E.fresh(level,plan.seed,mode);for(const h of plan.route){const r=E.move(s,h.at,h.dir);assert(r.changed);s=r.state;check(s);moves++;if(s.pending){if(!s.pending.complete){const p=s.pending.plan;assert(E.walkDistance(s,p.spawn[0].at,p.spawn[1].at)>=5);assert(p.spawn.every(x=>!s.blocked.includes(x.at)));spawns++;}s=E.resume(s);check(s);}}assert(E.complete(s));
 }
}
console.log({migrated,moves,spawns,initialBoards:360,all30Levels:'solvable',topology:'connected; no articulation points',obstacles:'fixed'});
