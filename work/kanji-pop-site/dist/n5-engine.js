(function(host){
 'use strict';
 const C=host.KanjiCourse||(typeof require!=='undefined'?require('./n5-data.js'):null),COLS=3;
 const directions=['left','right','up','down'],clone=x=>JSON.parse(JSON.stringify(x));
 function destination(at,dir,rows=5,cols=3){if(!Number.isInteger(at)||at<0||at>=rows*cols||!directions.includes(dir))return -1;const r=Math.floor(at/cols),c=at%cols;if(dir==='left'&&!c||dir==='right'&&c===cols-1||dir==='up'&&!r||dir==='down'&&r===rows-1)return -1;return at+{left:-1,right:1,up:-cols,down:cols}[dir];}
 const neighbors=(at,rows,cols=3)=>directions.map(d=>destination(at,d,rows,cols)).filter(i=>i>=0);
 const distance=(a,b,cols=3)=>Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols));
 const hasContact=(board,rows,cols=3)=>board.some((p,i)=>p&&neighbors(i,rows,cols).some(j=>board[j]?.pair===p.pair));
 const random=s=>{s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;};
 function makePair(s,recipe,pair){return [0,1].map(side=>({id:s.nextId++,recipe,pair,side,part:C.recipes[recipe].parts[side]}));}
 // The two layouts are transposes, so viewport changes preserve every adjacency.
 function layoutFor(level,mode='mobile'){
  return mode==='desktop'?{cols:7,rows:5,blanks:1}:{cols:5,rows:7,blanks:1};
 }
 function reorient(state,mode){
  if(!['desktop','mobile'].includes(mode)||!valid(state))throw Error('Invalid layout conversion');
  if(state.mode===mode)return clone(state);
  const s=clone(state),shape=layoutFor(s.level,mode),cols=s.cols,rows=s.rows;
  if(shape.cols!==rows||shape.rows!==cols)throw Error('Layouts must be transposes');
  const at=i=>(i%cols)*rows+Math.floor(i/cols);
  const board=b=>{const out=Array(b.length);b.forEach((t,i)=>out[at(i)]=t);return out;};
  s.board=board(s.board);
  const p=s.pending?.plan;
  if(p){p.board=board(p.board);p.spawn=p.spawn.map(x=>({...x,at:at(x.at)}));
   for(const key of ['motions','reflow'])if(p[key])p[key]=p[key].map(m=>({...m,from:at(m.from),to:at(m.to)}));
   if(p.freed)p.freed=p.freed.map(at);
  }
  Object.assign(s,shape,{mode});
  if(!valid(s))throw Error('Layout conversion failed validation');
  return s;
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
  const shape=layoutFor(level,mode),s={version:11,course:C.id,level,...shape,mode,board:[],found:[],recent:[],moves:0,matches:0,score:0,nextId:0,seed:seed>>>0,pending:null,status:'playing'};
  const count=(s.rows*s.cols-s.blanks)/2,active=[...l.targets.slice(0,count)];
  for(const id of [...l.pool,...C.ids])if(active.length<count&&!active.includes(id))active.push(id);
  const tiles=active.flatMap((id,i)=>makePair(s,id,i));
  s.board=arrange(s,tiles,s.blanks);
  return s;
 }
 const legalDirections=(s,at)=>s.board[at]?directions.filter(d=>{const i=destination(at,d,s.rows,s.cols);return i>=0&&s.board[i]===null;}):[];
 // Never silently choose among multiple empty destinations.
 const directionToBlank=(s,at)=>{const dirs=legalDirections(s,at);return dirs.length===1?dirs[0]:null;};
 function migrateDesktopV9(state,shape){
  try{
   const s=clone(state);if(s.mode!=='desktop'||s.cols!==7||s.rows!==5||s.blanks!==3)return state;
   let board;
   if(s.pending&&!s.pending.complete){board=clone(s.pending.plan?.board||[]);if(board.length!==35)return state;s.pending=null;s.status='playing';}
   else board=clone(s.board);
   const expected=shape.blanks+((s.pending||s.status==='won')?2:0),holes=board.flatMap((t,i)=>t===null?[i]:[]);
   if(holes.length!==expected+2)return state;
   let cells=null;for(let i=0;i<holes.length;i++)for(let j=i+1;j<holes.length;j++)if(distance(holes[i],holes[j],shape.cols)>1){cells=[holes[i],holes[j]];break;}if(!cells)return state;
   const active=new Set(board.filter(Boolean).map(t=>t.recipe)),recipe=C.ids.find(id=>!active.has(id)&&id!==s.pending?.recipe);if(!recipe)return state;
   s.cols=shape.cols;s.rows=shape.rows;s.blanks=shape.blanks;
   const pair=makePair(s,recipe,(s.rows*s.cols-s.blanks)/2-1);board[cells[0]]=pair[0];board[cells[1]]=pair[1];s.board=board;
   return valid(s)?repairRefill(s):state;
  }catch{return state;}
 }
 function upgrade(state,mode='mobile'){
  if(state?.version===11)return valid(state)?repairRefill(clone(state)):state;
  if(state?.version===10){
    try{
      const s=clone(state),l=C.levels[s.level];
      s.mode=['desktop','mobile'].includes(s.mode)?s.mode:mode;
      const shape=layoutFor(s.level,s.mode);
      s.version=11;delete s.blocked;delete s.benchmark;
      Object.assign(s,shape);
      const tiles=s.board.filter(t=>t&&t!==false);
      const active=new Set(tiles.map(t=>t.recipe)),used=new Set(tiles.map(t=>t.pair));
      const capacity=(s.rows*s.cols-s.blanks)/2,missing=Boolean(s.pending||s.status==='won');
      while((tiles.length/2)>(capacity-(missing?1:0))){
        const removePair=tiles[tiles.length-1].pair;
        const i1=tiles.findIndex(t=>t.pair===removePair);if(i1>=0)tiles.splice(i1,1);
        const i2=tiles.findIndex(t=>t.pair===removePair);if(i2>=0)tiles.splice(i2,1);
      }
      s.board=arrange(s,tiles,s.blanks+(missing?2:0));
      if(s.pending&&!s.pending.complete){
        const slot=Number.isInteger(s.pending.pair)?s.pending.pair:0;
        s.pending.plan=refillPlan(s,slot,s.board.flatMap((t,i)=>t===null?[i]:[]));
      }
      return valid(s)?s:fresh(s.level,1234,s.mode);
    }catch{return fresh(state.level||0,1234,mode);}
  }
  if(state?.version===9){
   const c=clone(state);c.version=11;if(valid(c))return repairRefill(c);
   // Validate the old geometry before expanding a saved mobile run. Preserve
   // collected targets, counters and pending discoveries through the existing migration.
   if(state.mode==='mobile'&&state.cols===4&&state.rows===5&&state.blanks===2&&valid(state,true))return upgrade({...clone(state),version:8},mode);
   const shape=layoutFor(state.level,state.mode||mode);return migrateDesktopV9(state,shape);
  }
  if(!state||![7,8].includes(state.version))return state;
  try{
   const s=clone(state),l=C.levels[s.level];if(!l||!Array.isArray(s.board))return state;
   s.mode=['desktop','mobile'].includes(s.mode)?s.mode:mode;
   const shape=layoutFor(s.level,s.mode),same=s.cols===shape.cols&&s.rows===shape.rows&&s.blanks===shape.blanks;
   s.version=11;Object.assign(s,shape);
   if(same)return repairRefill(s);
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
   if(s.pending&&!s.pending.complete)s.pending.plan=refillPlan(s,refillSlot,s.board.flatMap((t,i)=>t===null?[i]:[]));
   return s;
  }catch{return state;}
 }
 const complete=s=>C.levels[s.level].targets.every(id=>s.found.includes(id));
 const currentTarget=s=>C.levels[s.level].targets.find(id=>!s.found.includes(id))||null;
 const targetAnchor=s=>s.board.filter(t=>t?.recipe===currentTarget(s)).sort((a,b)=>a.side-b.side||a.id-b.id)[0]||null;
 function chooseRecipe(s){
  const level=C.levels[s.level],active=new Set(s.board.filter(Boolean).map(t=>t.recipe));
  const needed=level.targets.filter(id=>!s.found.includes(id)&&!active.has(id));
  if(needed.length)return needed[0];
  const available=C.ids.filter(id=>!active.has(id)&&id!==s.pending?.recipe),parts=s.board.filter(Boolean).map(t=>t.part);
  const options=available.map(id=>({id,rank:(s.recent.includes(id)?100+s.recent.indexOf(id)*10:0)+C.recipes[id].parts.filter(p=>parts.includes(p)).length*3+random(s)}));
  options.sort((a,b)=>a.rank-b.rank);return options[0].id;
 }
 function repairRefill(s){
  if(s.pending&&!s.pending.complete&&![6,7].includes(s.pending.plan?.refillRule)){
   const slot=Number.isInteger(s.pending.pair)?s.pending.pair:s.pending.plan.spawn[0].tile.pair;s.pending.pair=slot;s.pending.plan=refillPlan(s,slot,s.board.flatMap((t,i)=>t===null?[i]:[]));
  }
  return s;
 }
 function choosePair(s,lastPair){
  const active=new Set(s.board.filter(Boolean).map(t=>t.pair));
  for(let step=1;step<=C.ids.length;step++){const candidate=(lastPair+step)%C.ids.length;if(!active.has(candidate))return candidate;}
  return lastPair;
 }
 function refillPlan(s,pair,avoid=[]){
  const recipe=chooseRecipe(s),spawnPair=choosePair(s,pair),freed=new Set(avoid),initialHoles=new Set(s.board.flatMap((t,i)=>t===null?[i]:[])),initial={board:clone(s.board),motions:[]};
  const protectedIds=new Set(s.board.filter(t=>t?.recipe===currentTarget(s)).map(t=>t.id));
  const disturbance=board=>board.reduce((n,t,i)=>n+(t&&protectedIds.has(t.id)&&s.board[i]?.id!==t.id?1:0),0);
  function placements(node){
   const holes=node.board.flatMap((t,i)=>t===null?[i]:[]),options=[];
   for(let a=0;a<holes.length;a++)for(let b=a+1;b<holes.length;b++){
    const cells=[holes[a],holes[b]],d=distance(...cells,s.cols),freedCount=cells.filter(i=>freed.has(i)).length;if(d>=5)options.push({node,cells,d,freedCount,newCells:cells.filter(i=>!initialHoles.has(i)).length});
   }
   return options.sort((a,b)=>b.freedCount-a.freedCount||b.newCells-a.newCells||b.d-a.d);
  }
  let chosen=null,frontier=[initial],seen=new Set([s.board.map(t=>t?.id??'_').join(',')]);
  for(let depth=0;depth<=20&&frontier.length;depth++){
   const candidates=frontier.flatMap(placements).sort((a,b)=>disturbance(a.node.board)-disturbance(b.node.board)||b.freedCount-a.freedCount||b.newCells-a.newCells||b.d-a.d);
   if(candidates.length){chosen=candidates[0];break;}
   if(depth===20||seen.size>=60000)break;const next=[];
   for(const node of frontier){if(seen.size>=60000)break;for(let to=0;to<node.board.length;to++){if(seen.size>=60000)break;if(node.board[to]!==null)continue;for(const from of neighbors(to,s.rows,s.cols)){
    if(seen.size>=60000)break;const tile=node.board[from];if(!tile)continue;const board=node.board.slice();board[to]=tile;board[from]=null;
    if(hasContact(board,s.rows,s.cols))continue;const key=board.map(t=>t?.id??'_').join(',');if(seen.has(key))continue;seen.add(key);next.push({board,motions:[...node.motions,{id:tile.id,from,to}]});
   }}}
   frontier=next;
  }
  let reflow=null;
  // Before a full rearrangement, try relocating only the piece occupying a distant spawn cell.
  if(!chosen){
   const holes=s.board.flatMap((t,i)=>t===null?[i]:[]),options=[];
   for(const a of initialHoles)for(let b=0;b<s.board.length;b++)if(a!==b&&distance(a,b,s.cols)>=5){
    const cells=[a,b],occupied=cells.filter(i=>s.board[i]),destinations=holes.filter(i=>!cells.includes(i));
    if(occupied.length>1||occupied.length>destinations.length)continue;
    for(const dest of destinations){const board=clone(s.board);if(occupied.length){board[dest]=board[occupied[0]];board[occupied[0]]=null;}
     if(hasContact(board,s.rows,s.cols))continue;
     const moves=board.flatMap((tile,to)=>tile?[{id:tile.id,from:s.board.findIndex(x=>x?.id===tile.id),to}]:[]);
     options.push({board,cells,moves,cost:moves.reduce((n,m)=>n+distance(m.from,m.to,s.cols),0)});
    }
   }
   options.sort((a,b)=>disturbance(a.board)-disturbance(b.board)||a.cost-b.cost);if(options.length){const o=options[0];reflow=o.moves;chosen={node:{board:o.board,motions:[]},cells:o.cells};}
  }
  if(!chosen){
   const holes=s.board.flatMap((t,i)=>t===null?[i]:[]),all=Array.from({length:s.board.length},(_,i)=>i),candidates=[];
   for(let a=0;a<all.length;a++)for(let b=a+1;b<all.length;b++){const cells=[all[a],all[b]],d=distance(...cells,s.cols),freedCount=cells.filter(i=>freed.has(i)).length;if(d>=5)candidates.push({cells,d,freedCount});}
   candidates.sort((a,b)=>b.freedCount-a.freedCount||b.d-a.d);let placed=null,spawnCells=null;
   for(const candidate of candidates){
    const blankCells=holes.filter(i=>!candidate.cells.includes(i)).slice(0,s.blanks);
    if(blankCells.length!==s.blanks)continue;
    const reserved=new Set([...candidate.cells,...blankCells]),available=all.filter(i=>!reserved.has(i));
    const groups=Array.from(new Set(s.board.filter(Boolean).map(t=>t.pair))).map(id=>s.board.filter(t=>t?.pair===id)),board=Array(s.board.length).fill(null);
    function assign(rest,index){
     if(index===groups.length)return rest.length===0;
     if(!rest.length)return false;const a=rest[0],choices=rest.slice(1).sort((x,y)=>distance(y,a,s.cols)-distance(x,a,s.cols));
     for(const b of choices){if(distance(a,b,s.cols)<=1)continue;board[a]=groups[index][0];board[b]=groups[index][1];if(assign(rest.filter(i=>i!==a&&i!==b),index+1))return true;board[a]=board[b]=null;}
     return false;
    }
    if(assign(available,0)){placed=board;spawnCells=candidate.cells;break;}
   }
   if(!placed)throw new Error('Could not arrange refill tiles without an immediate match');
   reflow=placed.flatMap((tile,to)=>tile?[{id:tile.id,from:s.board.findIndex(x=>x?.id===tile.id),to}]:[]);
   chosen={node:{board:placed,motions:[]},cells:spawnCells};
  }
  const tiles=makePair(s,recipe,spawnPair),spawn=chosen.cells.map((at,i)=>({at,tile:tiles[i]})),board=clone(chosen.node.board);
  for(const x of spawn)board[x.at]=x.tile;
  return {refillRule:7,recipe,freed:[...freed],motions:chosen.node.motions,...(reflow?{reflow}:{}),spawn,board};
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
  s.pending={recipe:piece.recipe,pair:piece.pair,complete:complete(s),plan:null};if(!s.pending.complete)s.pending.plan=refillPlan(s,piece.pair,[to,mateAt]);
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
 function valid(s,legacyMobile=false){
  try{
   const l=C.levels[s?.level];if(!l||s.version!==11||s.course!==C.id||!['mobile','desktop'].includes(s.mode)||!Array.isArray(s.board)||!['playing','won'].includes(s.status))return false;
   const shape=legacyMobile&&s.mode==='mobile'?{cols:4,rows:5,blanks:2}:layoutFor(s.level,s.mode);
   if(s.cols!==shape.cols||s.rows!==shape.rows||s.blanks!==shape.blanks||s.board.length!==s.rows*s.cols)return false;
   if(![s.moves,s.matches,s.score,s.nextId,s.seed].every(n=>Number.isSafeInteger(n)&&n>=0)||s.seed>4294967295||s.score!==s.matches*100||s.moves<s.matches)return false;
   if(!Array.isArray(s.found)||new Set(s.found).size!==s.found.length||!s.found.every(id=>C.ids.includes(id))||s.found.length>s.matches||!Array.isArray(s.recent)||s.recent.length>4||!s.recent.every(id=>s.found.includes(id)))return false;
   if(s.pending!==null&&(!s.pending||!s.found.includes(s.pending.recipe)||s.pending.complete!==complete(s)||(s.pending.pair!==undefined&&(!Number.isInteger(s.pending.pair)||s.pending.pair<0||s.pending.pair>=C.ids.length))))return false;
   if(s.status==='won'&&(!complete(s)||s.pending))return false;
   const check=(board,blanks)=>{
    if(board.filter(t=>t===null).length!==blanks)return false;
    const ts=board.filter(Boolean);if(new Set(ts.map(t=>t.id)).size!==ts.length)return false;
   if(!ts.every(t=>Number.isInteger(t.id)&&t.id>=0&&t.id<s.nextId&&Number.isInteger(t.pair)&&t.pair>=0&&t.pair<C.ids.length&&[0,1].includes(t.side)&&C.ids.includes(t.recipe)&&t.part===C.recipes[t.recipe].parts[t.side]))return false;
    const groups=new Map();for(const t of ts){if(!groups.has(t.pair))groups.set(t.pair,[]);groups.get(t.pair).push(t);}
    const recipes=[];for(const group of groups.values()){if(group.length!==2||group[0].recipe!==group[1].recipe||group[0].side===group[1].side)return false;recipes.push(group[0].recipe);}
    return new Set(recipes).size===recipes.length&&!hasContact(board,s.rows,s.cols);
   };
   if(!check(s.board,s.blanks+(s.pending||s.status==='won'?2:0)))return false;
   if(s.pending&&!s.pending.complete){
    const plan=s.pending.plan;if(!plan||!Array.isArray(plan.motions)||plan.motions.length>20||!Array.isArray(plan.spawn)||plan.spawn.length!==2||!check(plan.board,s.blanks))return false;
    const b=clone(s.board);
    for(const m of plan.motions){if(b[m.from]?.id!==m.id||b[m.to]!==null||!neighbors(m.from,s.rows,s.cols).includes(m.to))return false;b[m.to]=b[m.from];b[m.from]=null;if(hasContact(b,s.rows,s.cols))return false;}
    if(plan.reflow){
     if(plan.motions.length||!Array.isArray(plan.reflow)||plan.reflow.length!==b.filter(Boolean).length)return false;
     const source=b.slice();b.fill(null);const used=new Set();
     for(const m of plan.reflow){if(source[m.from]?.id!==m.id||used.has(m.id)||!Number.isInteger(m.to)||m.to<0||m.to>=b.length||b[m.to])return false;used.add(m.id);b[m.to]=source[m.from];}
     if(hasContact(b,s.rows,s.cols))return false;
    }
    if(plan.refillRule===3&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<3||!plan.spawn.some(x=>s.board[x.at])||plan.spawn[0].tile.pair!==plan.spawn[1].tile.pair||(Number.isInteger(s.pending.pair)&&plan.spawn[0].tile.pair===s.pending.pair)))return false;
    if(plan.refillRule===4&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<2||!Array.isArray(plan.freed)||!plan.spawn.some(x=>plan.freed.includes(x.at))||plan.spawn[0].tile.pair!==plan.spawn[1].tile.pair||(Number.isInteger(s.pending.pair)&&plan.spawn[0].tile.pair===s.pending.pair)||plan.motions.length||plan.reflow))return false;
    if(plan.refillRule===5&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<3||!Array.isArray(plan.freed)||!plan.spawn.some(x=>plan.freed.includes(x.at))||plan.spawn[0].tile.pair!==plan.spawn[1].tile.pair||(Number.isInteger(s.pending.pair)&&plan.spawn[0].tile.pair===s.pending.pair)||plan.reflow))return false;
    if(plan.refillRule===6&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<5||!Array.isArray(plan.freed)||!plan.spawn.some(x=>plan.freed.includes(x.at))||plan.spawn[0].tile.pair!==plan.spawn[1].tile.pair||(Number.isInteger(s.pending.pair)&&plan.spawn[0].tile.pair===s.pending.pair)))return false;
    if(plan.refillRule===7&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<5||!Array.isArray(plan.freed)||plan.spawn[0].tile.pair!==plan.spawn[1].tile.pair||(Number.isInteger(s.pending.pair)&&plan.spawn[0].tile.pair===s.pending.pair)))return false;
    for(const x of plan.spawn){if(b[x.at]!==null||x.tile.recipe!==plan.recipe)return false;b[x.at]=x.tile;}
    if(JSON.stringify(b)!==JSON.stringify(plan.board))return false;
   }
   return true;
  }catch{return false;}
 }
 host.KanjiN5={C,COLS,directions,clone,destination,neighbors,distance,walkDistance:(s,a,b)=>distance(a,b,s.cols),hasContact,fresh,layoutFor,reorient,upgrade,legalDirections,directionToBlank,complete,currentTarget,targetAnchor,move,resume,hint,valid};if(typeof module!=='undefined')module.exports=host.KanjiN5;
})(globalThis);

