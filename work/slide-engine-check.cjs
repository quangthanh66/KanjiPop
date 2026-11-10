const assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('./kanji-pop-site/dist/slide-engine.js');
const blank=()=>Array(16).fill(null);
let b=blank();b[0]='木';b[1]='木';b[2]='亻';
let r=E.slide(b,'left');assert.equal(r.merges.length,1);assert.equal(r.merges[0].char,'林');assert.equal(r.board[1],'亻');
b=blank();b[0]='日';b[1]='月';b[2]='日';b[3]='月';assert.equal(E.slide(b,'left').merges.length,2);
b=blank();b[0]='木';assert.equal(E.slide(b,'left').changed,false);
let s=E.fresh();s.board=b;r=E.step(s,'left');assert.deepEqual(r.state,s);assert.equal(r.spawn,null);
assert.equal(E.hasMoves(Array(16).fill('日')),false);
for(const direction of E.directions){b=blank();b[0]='日';b[15]='月';r=E.slide(b,direction);assert.equal(r.board.filter(Boolean).length,2);}
let seed=76543;function random(n){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;}
for(let i=0;i<400;i++){
 s=E.fresh();s.board=Array.from({length:16},()=>[null,'木','亻','日','月'][random(5)]);
 for(const d of E.directions){r=E.step(s,d);assert.equal(r.state.board.length,16);assert.equal(r.state.board.filter(Boolean).length,s.board.filter(Boolean).length-r.plan.merges.length*2+(r.spawn?1:0));assert.equal(new Set(r.plan.motions.map(m=>m.from)).size,s.board.filter(Boolean).length);}
}
const solutions=[];
for(let level=0;level<3;level++){
 let beam=[{state:E.fresh(level),path:[]}],win;
 for(let depth=0;depth<65&&!win;depth++){
  const next=[],seen=new Set();
  for(const item of beam){for(const dir of E.directions){const out=E.step(item.state,dir);if(!out.changed||out.stuck)continue;const path=[...item.path,dir];if(out.won){win=path;break;}
   const s=out.state,key=JSON.stringify([s.board,s.collected,s.spawnIndex,s.seed]);if(seen.has(key))continue;seen.add(key);
   const progress=E.recipes.reduce((n,r)=>n+Math.min(s.collected[r.char],E.levels[level].targets[r.char]),0);
   next.push({state:s,path,value:progress*60+s.board.filter(x=>x===null).length*2});
  }if(win)break;}
  next.sort((a,b)=>b.value-a.value);beam=next.slice(0,160);
 }
 assert.ok(win,'Level '+level+' must be solvable');solutions.push(win);
}
fs.writeFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/slide-solutions.json',JSON.stringify(solutions));
console.log(JSON.stringify({status:'PASS',checks:'merge rules, no chain merges, no-op, deadlock, 1600 state invariants, all levels solvable',solutionLengths:solutions.map(x=>x.length)}));
