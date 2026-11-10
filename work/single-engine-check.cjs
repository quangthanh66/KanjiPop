const assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('./kanji-pop-site/dist/slide-engine.js');
let s=E.fresh();
assert.equal(E.step(s,'right',null).changed,false);
assert.equal(E.step(s,'left',0).changed,false);
assert.equal(E.step(s,'right',3).changed,false);
assert.equal(E.step(s,'right',2).changed,false);
let r=E.step(s,'right',0);assert.equal(r.changed,true);assert.equal(r.plan.motions.length,1);assert.equal(r.state.board[0],null);assert.equal(r.state.board[1],'木');assert.equal(r.spawn,null);
for(let i=2;i<16;i++)assert.equal(r.state.board[i],s.board[i]);
r=E.step(r.state,'right',1);assert.equal(r.state.collected.林,1);assert.equal(r.state.board[1],null);assert.equal(r.state.board[2],null);assert.equal(r.spawn,null);
r=E.step(r.state,'up',4);assert.ok(r.spawn);assert.equal(r.state.spawnClock,0);assert.equal(r.state.spawnIndex,1);
let empty=E.fresh();empty.board=Array(16).fill(null);empty.board[0]='日';empty.board[1]='月';assert.ok(E.step(empty,'right',0).spawn,'Prevent an empty unwinnable board');
assert.equal(E.hasMoves(Array(16).fill('日')),false);
let seed=23;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed%n;};
for(let k=0;k<80;k++){
 s=E.fresh();s.board=Array.from({length:16},()=>[null,'木','亻','日','月'][rand(5)]);
 for(let at=0;at<16;at++)for(const d of E.directions){r=E.step(s,d,at);assert.equal(r.plan.motions.length,r.changed?1:0);if(!r.changed){assert.deepEqual(s,r.state);continue;}const to=r.plan.motions[0].to;assert.equal(Math.abs(Math.floor(at/4)-Math.floor(to/4))+Math.abs(at%4-to%4),1);for(let i=0;i<16;i++)if(i!==at&&i!==to&&i!==r.spawn?.at)assert.equal(r.state.board[i],s.board[i]);}
}
const solutions=[];
for(let level=0;level<3;level++){
 let beam=[{state:E.fresh(level),path:[]}],win;
 for(let depth=0;depth<80&&!win;depth++){
  const next=[],seen=new Set();
  for(const item of beam){for(let at=0;at<16;at++){if(!item.state.board[at])continue;for(const dir of E.directions){const out=E.step(item.state,dir,at);if(!out.changed||out.stuck)continue;const path=[...item.path,{at,dir}];if(out.won){win=path;break;}
   const s=out.state,key=JSON.stringify([s.board,E.recipes.map(r=>Math.min(s.collected[r.char],E.levels[level].targets[r.char])),s.spawnIndex,s.spawnClock,s.seed]);if(seen.has(key))continue;seen.add(key);
   const progress=E.recipes.reduce((n,r)=>n+Math.min(s.collected[r.char],E.levels[level].targets[r.char]),0);
   let distance=0;for(const rec of E.recipes){if(s.collected[rec.char]>=E.levels[level].targets[rec.char])continue;let best=8;for(let a=0;a<16;a++)for(let b=a+1;b<16;b++)if(s.board[a]&&s.board[b]&&E.recipe(s.board[a],s.board[b])?.char===rec.char)best=Math.min(best,Math.abs(Math.floor(a/4)-Math.floor(b/4))+Math.abs(a%4-b%4));distance+=best;}
   next.push({state:s,path,value:progress*60-distance*3+s.board.filter(x=>x===null).length});
  }if(win)break;}if(win)break;}
  next.sort((a,b)=>b.value-a.value);beam=next.slice(0,100);
 }
 assert.ok(win,'Level '+level+' is solvable');solutions.push(win);
}
fs.writeFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/single-solutions.json',JSON.stringify(solutions));
console.log(JSON.stringify({status:'PASS',checks:'one tile one cell, blocked and edge moves, spawn timing, empty board, 5120 transitions, all levels solvable',solutionLengths:solutions.map(x=>x.length)}));
