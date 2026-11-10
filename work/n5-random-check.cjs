const assert=require('node:assert/strict'),E=require('./kanji-pop-site/dist/n5-engine.js');
let seed=98765;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let matches=0,shifts=0,directions=new Set();
for(const l of E.C.levels)for(let run=0;run<8;run++){
 let s=E.fresh(l.id,run+5);assert(E.valid(s));
 for(let n=0;n<200&&s.status==='playing';n++){
  const blank=s.board.indexOf(null),at=E.neighbors(blank,s.rows)[Math.floor(rnd()*E.neighbors(blank,s.rows).length)],dir=E.directionToBlank(s,at),before=E.clone(s),r=E.move(s,at,dir);assert(r.changed);assert.deepEqual(s,before);assert(E.valid(r.state));s=r.state;
  for(let i=0;i<before.board.length;i++)if(before.board[i])for(const d of E.directions){const to=E.destination(i,d,s.rows);if(to<0||before.board[to])assert(!E.move(before,i,d).changed);}
  if(s.pending){matches++;directions.add(E.directions.find(d=>E.destination(r.match.cells[0],d,s.rows)===r.match.cells[1]));shifts+=s.pending.plan?.motions.length||0;
   if(s.pending.plan)assert(E.distance(...s.pending.plan.spawn.map(x=>x.at))>=2);
   s=E.resume(s);assert(E.valid(s));
  }
  if(s.status==='playing'){assert.equal(s.board.filter(x=>x===null).length,1);const groups=new Map();for(const t of s.board.filter(Boolean)){if(!groups.has(t.recipe))groups.set(t.recipe,[]);groups.get(t.recipe).push(t);}
   assert.equal(groups.size,(s.rows*3-1)/2);for(const tiles of groups.values()){assert.equal(tiles.length,2);assert.equal(tiles[0].pair,tiles[1].pair);assert.notEqual(tiles[0].side,tiles[1].side);}
   assert(!E.hasContact(s.board,s.rows));
  }
 }
}
assert.equal(directions.size,4);assert.equal(new Set(E.C.levels.flatMap(l=>l.newChars)).size,24);assert.equal(E.C.levels.flatMap(l=>l.newChars).length,24);
const bad=E.fresh();bad.board[0].side=4;assert(!E.valid(bad));
console.log(JSON.stringify({status:'PASS',runs:120,matches,shifts,directions:[...directions],checks:['unique target recipe per color','exactly two complementary parts','one blank','safe short refill motion','no contact at spawn','required coverage','blocked moves','input state immutable','validation']}));
