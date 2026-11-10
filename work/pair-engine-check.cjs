const E=require('./kanji-pop-site/dist/pair-engine.js'),assert=require('node:assert/strict'),fs=require('node:fs');
const fresh=E.fresh();assert.equal(fresh.board.filter(Boolean).length,12);
for(const dir of E.directions){const s=E.fresh();s.board=Array(16).fill(null);s.board[5]=fresh.board[0];s.board[E.destination(5,dir)]=fresh.board[1];const r=E.move(s,5,dir);assert.equal(r.match.pair,0);assert.equal(r.match.gravity,['left','right'].includes(dir)?'down':'left');assert.equal(r.state.board.filter(Boolean).length,0);}
let r=E.move(fresh,0,'right');assert.equal(r.state.board.filter(Boolean).length,10);assert.equal(r.state.score,100);assert.equal(r.state.pending,0);assert.equal(r.state.found.length,1);
for(let c=0;c<4;c++){let seen=false;for(let row=0;row<4;row++){const v=r.state.board[row*4+c];if(v)seen=true;else assert.equal(seen,false,'No gap below surviving tiles');}}
let s=E.fresh();s.board=Array(16).fill(null);s.board[4]=fresh.board[0];s.board[8]=fresh.board[1];s.board[3]=fresh.board[2];s.board[7]=fresh.board[3];s.board[11]=fresh.board[4];
r=E.move(s,4,'down');assert.equal(r.match.gravity,'left');assert.equal(r.state.board[0].id,2);assert.equal(r.state.board[4].id,4);assert.equal(r.state.board[8].id,6);
s=E.fresh();s.board[1]=s.board.find(t=>t?.id===5);assert.equal(s.board[0].part,s.board[1].part);assert.equal(E.move(s,0,'right').changed,false,'Same glyph different color cannot merge');
assert.equal(E.move(fresh,0,'left').changed,false);assert.equal(E.move(fresh,null,'right').changed,false);
const solutions=[];
for(let level=0;level<3;level++){
 let beam=[{state:E.fresh(level),path:[]}],win;
 for(let depth=0;depth<100&&!win;depth++){
  const next=[],seen=new Set();
  for(const item of beam){for(let at=0;at<16;at++){if(!item.state.board[at])continue;for(const dir of E.directions){const r=E.move(item.state,at,dir);if(!r.changed)continue;const p=[...item.path,{at,dir}];if(E.done(r.state)){win=p;break;}
   r.state.pending=null;const key=r.state.board.map(t=>t?.id??'-').join(',');if(seen.has(key))continue;seen.add(key);
   let distance=0;for(let pair=0;pair<6;pair++){const a=r.state.board.findIndex(t=>t?.id===pair*2),b=r.state.board.findIndex(t=>t?.id===pair*2+1);if(a>=0&&b>=0)distance+=Math.abs(Math.floor(a/4)-Math.floor(b/4))+Math.abs(a%4-b%4);}
   next.push({state:r.state,path:p,value:r.state.found.length*60-distance*3});
  }if(win)break;}if(win)break;}
  next.sort((a,b)=>b.value-a.value);beam=next.slice(0,120);
 }
 assert.ok(win,'Solvable board '+level);solutions.push(win);
 let state=E.fresh(level);for(const m of win){const r=E.move(state,m.at,m.dir);assert.equal(r.state.board.filter(Boolean).length,state.board.filter(Boolean).length-(r.match?2:0));const ids=r.state.board.filter(Boolean).map(t=>t.id);assert.equal(new Set(ids).size,ids.length);r.state.pending=null;state=r.state;}
}
fs.writeFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/pair-solutions.json',JSON.stringify(solutions));
console.log(JSON.stringify({status:'PASS',checks:['matching all four directions','same glyph different color blocked','horizontal downward gravity','vertical leftward gravity','no new blocks','tile conservation','all levels solvable'],solutionLengths:solutions.map(p=>p.length)}));
