from pathlib import Path
p=Path('work/refill-before-engine.cjs');s=p.read_text(encoding='utf-8').replace("require('./n5-data.js')","require('./kanji-pop-site/dist/n5-data.js')");p.write_text(s,encoding='utf-8')
p=Path('work/kanji-pop-site/dist/n5-engine.js');s=p.read_text(encoding='utf-8')
s=s.replace("  if(!state||![7,8].includes(state.version))return state;", "  if(state?.version===9){if(!valid(state))return state;return repairRefill(clone(state));}\n  if(!state||![7,8].includes(state.version))return state;")
s=s.replace('   if(same)return s;','   if(same)return repairRefill(s);')
a=s.index(' function separatedHoles(');b=s.index(' function move(',a)
s=s[:a]+''' function repairRefill(s){
  if(s.pending&&!s.pending.complete&&s.pending.plan?.refillRule!==2){
   const slot=s.pending.plan.spawn[0].tile.pair;s.pending.plan=refillPlan(s,slot);
  }
  return s;
 }
 function refillPlan(s,pair){
  const recipe=chooseRecipe(s),initial={board:clone(s.board),motions:[]};
  const oldHoles=new Set(s.board.flatMap((t,i)=>t===null?[i]:[]));
  function placements(node){
   const holes=node.board.flatMap((t,i)=>t===null?[i]:[]),options=[];
   for(let a=0;a<holes.length;a++)for(let b=a+1;b<holes.length;b++){
    const cells=[holes[a],holes[b]],d=distance(...cells,s.cols),newCells=cells.filter(i=>!oldHoles.has(i)).length;
    if(d>=3&&newCells)options.push({node,cells,newCells,d});
   }
   return options.sort((a,b)=>b.newCells-a.newCells||b.d-a.d)[0];
  }
  // A refill must move surviving tiles and use at least one newly freed cell.
  // Prefer two new cells, so the replacement cannot recreate the cleared pocket.
  let chosen=null,backup=null,frontier=[initial],seen=new Set([s.board.map(t=>t?.id??'_').join(',')]);
  for(let depth=0;depth<=3;depth++){
   const candidates=frontier.map(placements).filter(Boolean).sort((a,b)=>b.newCells-a.newCells||b.d-a.d);
   if(candidates[0]?.newCells===2){chosen=candidates[0];break;}
   if(!backup&&candidates.length)backup=candidates[0];
   if(depth===3)break;const next=[];
   for(const node of frontier)for(let to=0;to<node.board.length;to++)if(node.board[to]===null)for(const from of neighbors(to,s.rows,s.cols)){
    const t=node.board[from];if(!t)continue;const board=node.board.slice();board[to]=t;board[from]=null;
    if(hasContact(board,s.rows,s.cols))continue;const key=board.map(t=>t?.id??'_').join(',');if(seen.has(key))continue;seen.add(key);
    next.push({board,motions:[...node.motions,{id:t.id,from,to}]});
   }
   frontier=next;
  }
  chosen ||= backup;
  let reflow=null;
  if(!chosen){
   // Rare blocked pocket: visibly rearrange survivors instead of restoring a farm loop.
   // Every tile keeps its identity; only its position changes.
   const tiles=s.board.filter(Boolean),board=Array(s.board.length).fill(null);
   const cells=Array.from({length:board.length},(_,i)=>i).filter(i=>!oldHoles.has(i));
   let ends;
   for(const a of cells){const b=cells.find(b=>distance(a,b,s.cols)>=3);if(b!==undefined){ends=[a,b];break;}}
   const holes=[...ends,...Array.from(oldHoles).slice(0,2)],available=board.map((_,i)=>i).filter(i=>!holes.includes(i));
   // Put each pair on opposite parity of this ordering, with a shuffled search first.
   let placed=null;
   for(let attempt=0;attempt<500;attempt++){
    const order=tiles.slice();for(let i=order.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[order[i],order[j]]=[order[j],order[i]];}
    const b=board.slice();available.forEach((at,i)=>b[at]=order[i]);if(!hasContact(b,s.rows,s.cols)){placed=b;break;}
   }
   if(!placed){
    // Exact backtracking is only needed if the bounded shuffle cannot place the pairs.
    const pairs=Array.from(new Set(tiles.map(t=>t.pair))).map(p=>tiles.filter(t=>t.pair===p));
    function fill(rest){if(!rest.length)return true;const a=rest[0],pair=pairs[(available.length-rest.length)/2];for(let j=1;j<rest.length;j++)if(distance(a,rest[j],s.cols)>1){const b=rest[j];board[a]=pair[0];board[b]=pair[1];if(fill(rest.slice(1).filter(i=>i!==b)))return true;board[a]=board[b]=null;}return false;}
    fill(available);placed=board;
   }
   reflow=placed.flatMap((t,to)=>t?[{id:t.id,from:s.board.findIndex(x=>x?.id===t.id),to}]:[]);
   chosen={node:{board:placed,motions:[]},cells:ends};
  }
  const tiles=makePair(s,recipe,pair),spawn=chosen.cells.map((at,i)=>({at,tile:tiles[i]})),board=clone(chosen.node.board);
  for(const x of spawn)board[x.at]=x.tile;
  return {refillRule:2,recipe,motions:chosen.node.motions,...(reflow?{reflow}:{}),spawn,board};
 }
''' +s[b:]
s=s.replace('const available=C.ids.filter(id=>!active.has(id))','const available=C.ids.filter(id=>!active.has(id)&&id!==s.pending?.recipe)')
old='''    for(const x of plan.spawn){if(b[x.at]!==null||x.tile.recipe!==plan.recipe)return false;b[x.at]=x.tile;}'''
new='''    if(plan.reflow){
     if(plan.motions.length||!Array.isArray(plan.reflow)||plan.reflow.length!==b.filter(Boolean).length)return false;
     const source=b.slice();b.fill(null);const used=new Set();
     for(const m of plan.reflow){if(source[m.from]?.id!==m.id||used.has(m.id)||!Number.isInteger(m.to)||m.to<0||m.to>=b.length||b[m.to])return false;used.add(m.id);b[m.to]=source[m.from];}
     if(hasContact(b,s.rows,s.cols))return false;
    }
    if(plan.refillRule===2&&(plan.recipe===s.pending.recipe||distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<3||!plan.spawn.some(x=>s.board[x.at])))return false;
    for(const x of plan.spawn){if(b[x.at]!==null||x.tile.recipe!==plan.recipe)return false;b[x.at]=x.tile;}'''
assert old in s;s=s.replace(old,new);p.write_text(s,encoding='utf-8')
p=Path('work/kanji-pop-site/dist/n5-game.js');s=p.read_text(encoding='utf-8')
s=s.replace("    ","    ")
s=s.replace("  state=E.resume(state);selected=null;render();save();for(const {tile} of pending.plan.spawn)","  if(pending.plan.reflow){for(const m of pending.plan.reflow){const t=$(`#tiles [data-id=\"${m.id}\"]`);if(t)position(t,m.to);}say('Đổi vị trí các khối để mở đường mới.');await delay(300);}\n  state=E.resume(state);selected=null;render();save();for(const {tile} of pending.plan.spawn)")
s=s.replace("Bàn sẽ dồn nhẹ để đón một cặp mới", "Bàn sẽ đổi vị trí để cặp mới không lặp lại thế cũ")
p.write_text(s,encoding='utf-8')
