(function(host){
 'use strict';
 const C=host.KanjiCourse||(typeof require!=='undefined'?require('./kanji-pop-site/dist/n5-data.js'):null),COLS=3;
 const directions=['left','right','up','down'],clone=x=>JSON.parse(JSON.stringify(x));
 function destination(at,dir,rows=5,cols=3){if(!Number.isInteger(at)||at<0||at>=rows*cols||!directions.includes(dir))return -1;const r=Math.floor(at/cols),c=at%cols;if(dir==='left'&&!c||dir==='right'&&c===cols-1||dir==='up'&&!r||dir==='down'&&r===rows-1)return -1;return at+{left:-1,right:1,up:-cols,down:cols}[dir];}
 const neighbors=(at,rows,cols=3)=>directions.map(d=>destination(at,d,rows,cols)).filter(i=>i>=0);
 const distance=(a,b,cols=3)=>Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols));
 const hasContact=(board,rows,cols=3)=>board.some((p,i)=>p&&neighbors(i,rows,cols).some(j=>board[j]?.pair===p.pair));
 const random=s=>{s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;};
 function makePair(s,recipe,pair){return [0,1].map(side=>({id:s.nextId++,recipe,pair,side,part:C.recipes[recipe].parts[side]}));}
 // Board dimensions are chosen only when a run begins, never during a resize.
 function layoutFor(level,mode='mobile'){
  return mode==='desktop'?{cols:5,rows:6,blanks:2}:{cols:4,rows:5,blanks:2};
 }
 function arrange(s,tiles,blanks){
  const fallback=[...tiles.filter(t=>t.side===0),...Array(blanks).fill(null),...tiles.filter(t=>t.side===1)];
  for(let attempt=0;attempt<150;attempt++){
   const b=fallback.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[b[i],b[j]]=[b[j],b[i]];}
   if(!hasContact(b,s.rows,s.cols))return b;
  }
  return fallback;
 }
 function fresh(level=0,seed=(Math.random()*4294967296)>>>0,mode='mobile'){
  const l=C.levels[level];if(!l||!['desktop','mobile'].includes(mode))throw new Error('Unknown level or layout');
  const shape=layoutFor(level,mode),s={version:9,course:C.id,level,...shape,mode,board:[],found:[],recent:[],moves:0,matches:0,score:0,nextId:0,seed:seed>>>0,pending:null,status:'playing'};
  const count=(s.rows*s.cols-s.blanks)/2,active=[...l.targets.slice(0,count)];
  for(const id of [...l.pool,...C.ids])if(active.length<count&&!active.includes(id))active.push(id);
  const tiles=active.flatMap((id,i)=>makePair(s,id,i));
  s.board=arrange(s,tiles,s.blanks);
  return s;
 }
 const legalDirections=(s,at)=>s.board[at]?directions.filter(d=>{const i=destination(at,d,s.rows,s.cols);return i>=0&&s.board[i]===null;}):[];
 // Never silently choose among multiple empty destinations.
 const directionToBlank=(s,at)=>{const dirs=legalDirections(s,at);return dirs.length===1?dirs[0]:null;};
 function upgrade(state,mode='mobile'){
  if(!state||![7,8].includes(state.version))return state;
  try{
   const s=clone(state),l=C.levels[s.level];if(!l||!Array.isArray(s.board))return state;
   s.mode=['desktop','mobile'].includes(s.mode)?s.mode:mode;
   const shape=layoutFor(s.level,s.mode),same=s.cols===shape.cols&&s.rows===shape.rows&&s.blanks===2;
   s.version=9;Object.assign(s,shape);
   if(same)return s;
   const tiles=s.board.filter(Boolean),active=new Set(tiles.map(t=>t.recipe)),used=new Set(tiles.map(t=>t.pair));
   const missing=Boolean(s.pending||s.status==='won'),capacity=(s.rows*s.cols-s.blanks)/2;
   const refillSlot=missing?Array.from({length:capacity},(_,i)=>i).find(i=>!used.has(i)):null;
   if(missing)used.add(refillSlot);
   for(const id of [...l.targets,...l.pool,...C.ids]){
    if(tiles.length>=(capacity-(missing?1:0))*2)break;if(active.has(id))continue;
    const slot=Array.from({length:capacity},(_,i)=>i).find(i=>!used.has(i));
    tiles.push(...makePair(s,id,slot));active.add(id);used.add(slot);
   }
   s.board=arrange(s,tiles,s.blanks+(missing?2:0));
   if(s.pending&&!s.pending.complete)s.pending.plan=refillPlan(s,refillSlot);
   return s;
  }catch{return state;}
 }
 const complete=s=>C.levels[s.level].targets.every(id=>s.found.includes(id));
 function chooseRecipe(s){
  const level=C.levels[s.level],active=new Set(s.board.filter(Boolean).map(t=>t.recipe));
  const needed=level.targets.filter(id=>!s.found.includes(id)&&!active.has(id));
  if(needed.length)return needed[0];
  const available=C.ids.filter(id=>!active.has(id)),parts=s.board.filter(Boolean).map(t=>t.part);
  const options=available.map(id=>({id,rank:(s.recent.includes(id)?100+s.recent.indexOf(id)*10:0)+C.recipes[id].parts.filter(p=>parts.includes(p)).length*3+random(s)}));
  options.sort((a,b)=>a.rank-b.rank);return options[0].id;
 }
 function separatedHoles(board,cols){const holes=board.flatMap((t,i)=>t===null?[i]:[]);let best=null;for(let a=0;a<holes.length;a++)for(let b=a+1;b<holes.length;b++){const d=distance(holes[a],holes[b],cols);if(!best||d>best.d)best={cells:[holes[a],holes[b]],d};}return best;}
 function refillPlan(s,pair){
  const recipe=chooseRecipe(s),initial={board:clone(s.board),motions:[]};
  let chosen=initial,frontier=[initial],seen=new Set([s.board.map(t=>t?.id??'_').join(',')]);
  // Shift at most three neighbors into the cleared space to separate the new pair.
  // Every automatic shift is a visible one-cell slide and may not cause a match.
  for(let depth=0;depth<=3;depth++){
   const candidates=frontier.filter(x=>separatedHoles(x.board,s.cols).d>=3);
   if(candidates.length){candidates.sort((a,b)=>separatedHoles(b.board,s.cols).d-separatedHoles(a.board,s.cols).d);chosen=candidates[0];break;}
   if(depth===3)break;const next=[];
   for(const node of frontier)for(let to=0;to<node.board.length;to++)if(node.board[to]===null)for(const from of neighbors(to,s.rows,s.cols)){
    const t=node.board[from];if(!t)continue;const board=node.board.slice();board[to]=t;board[from]=null;
    if(hasContact(board,s.rows,s.cols))continue;const key=board.map(t=>t?.id??'_').join(',');if(seen.has(key))continue;seen.add(key);
    next.push({board,motions:[...node.motions,{id:t.id,from,to}]});
   }
   frontier=next;
  }
  const cells=separatedHoles(chosen.board,s.cols).cells,tiles=makePair(s,recipe,pair),spawn=cells.map((at,i)=>({at,tile:tiles[i]})),board=clone(chosen.board);
  for(const x of spawn)board[x.at]=x.tile;
  return {recipe,motions:chosen.motions,spawn,board};
 }
 function move(state,at,dir){
  const s=clone(state),to=destination(at,dir,s.rows,s.cols),piece=s.board[at],no=reason=>({changed:false,state:s,reason,match:null});
  if(s.pending||s.status!=='playing')return no('popup');if(!piece)return no('select');if(to<0)return no('edge');if(s.board[to]!==null)return no('occupied');
  s.board[at]=null;s.board[to]=piece;s.moves++;
  const mateAt=neighbors(to,s.rows,s.cols).find(i=>s.board[i]?.pair===piece.pair);
  if(mateAt===undefined)return {changed:true,state:s,from:at,to,selected:to,match:null};
  const mate=s.board[mateAt];s.board[to]=null;s.board[mateAt]=null;s.matches++;s.score+=100;
  if(!s.found.includes(piece.recipe))s.found.push(piece.recipe);
  s.recent=[...s.recent.filter(id=>id!==piece.recipe),piece.recipe].slice(-4);
  s.pending={recipe:piece.recipe,complete:complete(s),plan:null};if(!s.pending.complete)s.pending.plan=refillPlan(s,piece.pair);
  return {changed:true,state:s,from:at,to,selected:null,match:{recipe:piece.recipe,ids:[piece.id,mate.id],cells:[to,mateAt]}};
 }
 function resume(state){const s=clone(state);if(!s.pending)return s;if(s.pending.complete)s.status='won';else s.board=s.pending.plan.board;s.pending=null;return s;}
 function hint(s){
  if(s.pending||s.status!=='playing')return null;
  const targets=C.levels[s.level].targets.filter(id=>!s.found.includes(id));
  let frontier=[{board:s.board,first:null}],seen=new Set([s.board.map(t=>t?.id??'_').join(',')]),fallback=null;
  // Hard bounds keep hint searches responsive with two blanks and up to 28 tiles.
  for(let depth=0;depth<14&&frontier.length;depth++){
   const next=[];
   for(const n of frontier)for(let blank=0;blank<n.board.length;blank++)if(n.board[blank]===null)for(const at of neighbors(blank,s.rows,s.cols)){
    const tile=n.board[at];if(!tile)continue;
    const board=n.board.slice();board[blank]=tile;board[at]=null;
    const first=n.first||{at,dir:directions.find(d=>destination(at,d,s.rows,s.cols)===blank)},match=neighbors(blank,s.rows,s.cols).some(i=>board[i]?.pair===tile.pair);
    if(match){if(targets.includes(tile.recipe))return first;if(!fallback)fallback=first;continue;}
    const key=board.map(t=>t?.id??'_').join(',');if(!seen.has(key)){seen.add(key);next.push({board,first});}
    if(seen.size>=12000)return guidedHint(s,targets)||fallback;
   }
   frontier=next;
  }
  return guidedHint(s,targets)||fallback;
 }
 function guidedHint(s,targets){
  // Plan just the two target positions and the blanks. Other tiles are anonymous.
  // This provides a legal route even when a target needs more moves than full BFS can inspect.
  const groups=targets.map(id=>s.board.flatMap((t,i)=>t?.recipe===id?[i]:[])).filter(a=>a.length===2).sort((a,b)=>distance(...a,s.cols)-distance(...b,s.cols));
  for(const pair of groups){
   const start={a:pair[0],b:pair[1],holes:s.board.flatMap((t,i)=>t===null?[i]:[]),first:null};
   const encode=n=>[Math.min(n.a,n.b),Math.max(n.a,n.b),...n.holes.slice().sort((a,b)=>a-b)].join(',');
   let frontier=[start],seen=new Set([encode(start)]);
   for(let depth=0;depth<40&&frontier.length;depth++){
    const next=[];
    for(const n of frontier)for(const blank of n.holes)for(const at of neighbors(blank,s.rows,s.cols)){
     if(n.holes.includes(at))continue;
     const m={a:n.a===at?blank:n.a,b:n.b===at?blank:n.b,holes:n.holes.map(i=>i===blank?at:i),first:n.first||{at,dir:directions.find(d=>destination(at,d,s.rows,s.cols)===blank)}};
     if(distance(m.a,m.b,s.cols)===1)return m.first;
     const key=encode(m);if(!seen.has(key)){seen.add(key);next.push(m);}
     if(seen.size>=40000)break;
    }
    if(seen.size>=40000)break;frontier=next;
   }
  }
  return null;
 }
 function valid(s){
  try{
   const l=C.levels[s?.level];if(!l||s.version!==9||s.course!==C.id||!['mobile','desktop'].includes(s.mode)||!Array.isArray(s.board)||!['playing','won'].includes(s.status))return false;
   const shape=layoutFor(s.level,s.mode);
   if(s.cols!==shape.cols||s.rows!==shape.rows||s.blanks!==shape.blanks||s.board.length!==s.rows*s.cols)return false;
   if(![s.moves,s.matches,s.score,s.nextId,s.seed].every(n=>Number.isSafeInteger(n)&&n>=0)||s.seed>4294967295||s.score!==s.matches*100||s.moves<s.matches)return false;
   if(!Array.isArray(s.found)||new Set(s.found).size!==s.found.length||!s.found.every(id=>C.ids.includes(id))||s.found.length>s.matches||!Array.isArray(s.recent)||s.recent.length>4||!s.recent.every(id=>s.found.includes(id)))return false;
   if(s.pending!==null&&(!s.pending||!s.found.includes(s.pending.recipe)||s.pending.complete!==complete(s)))return false;
   if(s.status==='won'&&(!complete(s)||s.pending))return false;
   const check=(board,blanks)=>{
    if(board.filter(t=>t===null).length!==blanks)return false;
    const ts=board.filter(Boolean);if(new Set(ts.map(t=>t.id)).size!==ts.length)return false;
    if(!ts.every(t=>Number.isInteger(t.id)&&t.id>=0&&t.id<s.nextId&&Number.isInteger(t.pair)&&t.pair>=0&&t.pair<(s.rows*s.cols-s.blanks)/2&&[0,1].includes(t.side)&&C.ids.includes(t.recipe)&&t.part===C.recipes[t.recipe].parts[t.side]))return false;
    const groups=new Map();for(const t of ts){if(!groups.has(t.pair))groups.set(t.pair,[]);groups.get(t.pair).push(t);}
    const recipes=[];for(const group of groups.values()){if(group.length!==2||group[0].recipe!==group[1].recipe||group[0].side===group[1].side)return false;recipes.push(group[0].recipe);}
    return new Set(recipes).size===recipes.length&&!hasContact(board,s.rows,s.cols);
   };
   if(!check(s.board,s.blanks+(s.pending||s.status==='won'?2:0)))return false;
   if(s.pending&&!s.pending.complete){
    const plan=s.pending.plan;if(!plan||!Array.isArray(plan.motions)||plan.motions.length>3||!Array.isArray(plan.spawn)||plan.spawn.length!==2||!check(plan.board,s.blanks))return false;
    const b=clone(s.board);
    for(const m of plan.motions){if(b[m.from]?.id!==m.id||b[m.to]!==null||!neighbors(m.from,s.rows,s.cols).includes(m.to))return false;b[m.to]=b[m.from];b[m.from]=null;if(hasContact(b,s.rows,s.cols))return false;}
    for(const x of plan.spawn){if(b[x.at]!==null||x.tile.recipe!==plan.recipe)return false;b[x.at]=x.tile;}
    if(JSON.stringify(b)!==JSON.stringify(plan.board))return false;
   }
   return true;
  }catch{return false;}
 }
 host.KanjiN5={C,COLS,directions,clone,destination,neighbors,distance,hasContact,fresh,layoutFor,upgrade,legalDirections,directionToBlank,complete,move,resume,hint,valid};if(typeof module!=='undefined')module.exports=host.KanjiN5;
})(globalThis);

