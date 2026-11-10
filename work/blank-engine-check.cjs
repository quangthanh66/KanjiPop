const assert=require('node:assert/strict');
const E=require('./kanji-pop-site/dist/pair-engine.js');
const adjacent=(board)=>board.some((t,i)=>t&&E.neighbors(i).some(j=>board[j]?.pair===t.pair));
let seed=321;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
let totalMatches=0;const contactDirections=new Set();
for(let game=0;game<100;game++){
 let s=E.fresh(game),matches=0;
 assert(E.valid(s));assert.equal(s.board.filter(Boolean).length,14);assert(!adjacent(s.board));
 for(let turn=0;turn<500;turn++){
  const legal=s.board.flatMap((t,at)=>t?E.directions.filter(dir=>E.destination(at,dir)>=0&&s.board[E.destination(at,dir)]===null).map(dir=>({at,dir})):[]);
  assert(legal.length>=2);const {at,dir}=legal[Math.floor(random()*legal.length)];
  const before=E.clone(s),r=E.move(s,at,dir);assert(r.changed);assert.deepEqual(s,before);assert.equal(r.state.moves,s.moves+1);
  if(r.match){
   matches++;totalMatches++;
   const [a,b]=r.match.cells;contactDirections.add(E.directions.find(d=>E.destination(a,d)===b));
   assert.equal(r.state.board.filter(Boolean).length,12);assert.equal(r.state.score,s.score+100);
   assert.equal(r.state.pending.spawn.length,2);assert(E.valid(r.state));
   const newIds=r.state.pending.spawn.map(x=>x.tile.id);
   s=E.resume(r.state);assert.equal(s.board[at],null);
   for(let i=0;i<E.SIZE;i++)if(i!==at&&!r.match.cells.includes(i))assert.deepEqual(s.board[i],before.board[i]);
   for(const n of newIds)assert(s.board.some(t=>t?.id===n));
   assert.deepEqual(E.resume(s),s);
  }else{s=r.state;assert.equal(s.score,before.score);assert.equal(s.board[at],null);assert.deepEqual(s.board[r.to],before.board[at]);}
  assert(E.valid(s));assert.equal(s.board.filter(t=>t===null).length,1);assert(!adjacent(s.board));
  for(let i=0;i<E.SIZE;i++)if(s.board[i])for(const dir of E.directions){const target=E.destination(i,dir);if(target<0||s.board[target])assert(!E.move(s,i,dir).changed);}
 }
 assert(matches>0);
}
assert.equal(contactDirections.size,4);
const s=E.fresh(10);assert(!E.move(s,null,'up').changed);assert(!E.move(s,4,'up').changed);
const bad=E.clone(s);bad.board[0].part='錯';assert(!E.valid(bad));
console.log(JSON.stringify({status:'PASS',games:100,moves:50000,totalMatches,contactDirections:[...contactDirections],checks:['one blank after every refill','only slide into adjacent blank','no accidental adjacent spawn','any same-color pair is valid','stationary survivors','stable unique IDs','save validation','all four contact directions']}));
