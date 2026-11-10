from pathlib import Path
p=Path('work/kanji-pop-site/dist/n5-engine.js')
s=p.read_text(encoding='utf-8-sig')
s=s.replace('function destination(at,dir,rows=5){if(!Number.isInteger(at)||at<0||at>=rows*3||!directions.includes(dir))return -1;const r=Math.floor(at/3),c=at%3;if(dir===\'left\'&&!c||dir===\'right\'&&c===2||dir===\'up\'&&!r||dir===\'down\'&&r===rows-1)return -1;return at+{left:-1,right:1,up:-3,down:3}[dir];}', 'function destination(at,dir,rows=5,cols=3){if(!Number.isInteger(at)||at<0||at>=rows*cols||!directions.includes(dir))return -1;const r=Math.floor(at/cols),c=at%cols;if(dir===\'left\'&&!c||dir===\'right\'&&c===cols-1||dir===\'up\'&&!r||dir===\'down\'&&r===rows-1)return -1;return at+{left:-1,right:1,up:-cols,down:cols}[dir];}')
s=s.replace('const neighbors=(at,rows)=>directions.map(d=>destination(at,d,rows)).filter(i=>i>=0);','const neighbors=(at,rows,cols=3)=>directions.map(d=>destination(at,d,rows,cols)).filter(i=>i>=0);')
s=s.replace('const distance=(a,b)=>Math.abs(a%3-b%3)+Math.abs(Math.floor(a/3)-Math.floor(b/3));','const distance=(a,b,cols=3)=>Math.abs(a%cols-b%cols)+Math.abs(Math.floor(a/cols)-Math.floor(b/cols));')
s=s.replace('const hasContact=(board,rows)=>board.some((p,i)=>p&&neighbors(i,rows).some(j=>board[j]?.pair===p.pair));','const hasContact=(board,rows,cols=3)=>board.some((p,i)=>p&&neighbors(i,rows,cols).some(j=>board[j]?.pair===p.pair));')
start=s.index(' function fresh(')
end=s.index(' const complete=',start)
s=s[:start]+''' // Board dimensions are chosen only when a run begins, never during a resize.
 function layoutFor(level,mode='mobile'){
  const count=C.levels[level].pool.length;
  if(count<5)return {cols:3,rows:3,blanks:1};
  if(count<7)return {cols:4,rows:3,blanks:2};
  if(count<9)return {cols:4,rows:4,blanks:2};
  if(mode==='desktop'&&count>=14)return {cols:5,rows:6,blanks:2};
  return mode==='desktop'?{cols:5,rows:4,blanks:2}:{cols:4,rows:5,blanks:2};
 }
 function fresh(level=0,seed=(Math.random()*4294967296)>>>0,mode='mobile'){
  const l=C.levels[level];if(!l||!['desktop','mobile'].includes(mode))throw new Error('Unknown level or layout');
  const shape=layoutFor(level,mode),s={version:8,course:C.id,level,...shape,mode,board:[],found:[],recent:[],moves:0,matches:0,score:0,nextId:0,seed:seed>>>0,pending:null,status:'playing'};
  const count=(s.rows*s.cols-s.blanks)/2,active=[...l.targets.slice(0,count)];
  for(const id of l.pool)if(active.length<count&&!active.includes(id))active.push(id);
  const tiles=active.flatMap((id,i)=>makePair(s,id,i));
  if(s.cols===3){const layout=[2,0,4,6,null,1,3,5,7];s.board=layout.map(i=>i===null?null:tiles[i]);}
  else{
   // Start with a guaranteed separated layout, then vary it with seeded shuffles.
   const fallback=[...tiles.filter(t=>t.side===0),...Array(s.blanks).fill(null),...tiles.filter(t=>t.side===1)];
   s.board=fallback;
   for(let attempt=0;attempt<150;attempt++){
    const b=fallback.slice();for(let i=b.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[b[i],b[j]]=[b[j],b[i]];}
    if(!hasContact(b,s.rows,s.cols)){s.board=b;break;}
   }
  }
  return s;
 }
 const legalDirections=(s,at)=>s.board[at]?directions.filter(d=>{const i=destination(at,d,s.rows,s.cols);return i>=0&&s.board[i]===null;}):[];
 // Never silently choose among multiple empty destinations.
 const directionToBlank=(s,at)=>{const dirs=legalDirections(s,at);return dirs.length===1?dirs[0]:null;};
 function upgrade(state){
  if(!state||state.version!==7)return state;
  const s=clone(state);s.version=8;s.cols=3;s.blanks=1;s.mode='legacy';return s;
 }
''' +s[end:]
s=s.replace('function separatedHoles(board){','function separatedHoles(board,cols){').replace('distance(holes[a],holes[b])','distance(holes[a],holes[b],cols)')
s=s.replace('separatedHoles(x.board)','separatedHoles(x.board,s.cols)').replace('separatedHoles(b.board)','separatedHoles(b.board,s.cols)').replace('separatedHoles(a.board)','separatedHoles(a.board,s.cols)').replace('separatedHoles(chosen.board)','separatedHoles(chosen.board,s.cols)')
s=s.replace('neighbors(to,s.rows)','neighbors(to,s.rows,s.cols)').replace('hasContact(board,s.rows)','hasContact(board,s.rows,s.cols)').replace('destination(at,dir,s.rows)','destination(at,dir,s.rows,s.cols)').replace('neighbors(m.from,s.rows)','neighbors(m.from,s.rows,s.cols)').replace('hasContact(b,s.rows)','hasContact(b,s.rows,s.cols)')
start=s.index(' function hint(s){')
end=s.index(' function valid(s){',start)
s=s[:start]+''' function hint(s){
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
    if(seen.size>=12000)return fallback||guidedHint(s,targets);
   }
   frontier=next;
  }
  return fallback||guidedHint(s,targets);
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
''' +s[end:]
s=s.replace("if(!l||s.version!==7||s.course!==C.id||s.rows!==l.rows||!Array.isArray(s.board)||s.board.length!==s.rows*3||!['playing','won'].includes(s.status))return false;", "if(!l||s.version!==8||s.course!==C.id||!['mobile','desktop','legacy'].includes(s.mode)||!Array.isArray(s.board)||!['playing','won'].includes(s.status))return false;\n   const shape=s.mode==='legacy'?{cols:3,rows:l.rows,blanks:1}:layoutFor(s.level,s.mode);\n   if(s.cols!==shape.cols||s.rows!==shape.rows||s.blanks!==shape.blanks||s.board.length!==s.rows*s.cols)return false;")
s=s.replace('t.pair<(s.rows*3-1)/2','t.pair<(s.rows*s.cols-s.blanks)/2').replace("check(s.board,s.pending||s.status==='won'?3:1)","check(s.board,s.blanks+(s.pending||s.status==='won'?2:0))").replace('!check(plan.board,1)','!check(plan.board,s.blanks)')
s=s.replace('fresh,directionToBlank,complete','fresh,layoutFor,upgrade,legalDirections,directionToBlank,complete')
p.write_text(s,encoding='utf-8')
