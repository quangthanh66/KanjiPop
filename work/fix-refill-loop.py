from pathlib import Path
p=Path('work/kanji-pop-site/dist/n5-engine.js');s=p.read_text(encoding='utf-8')
s=s.replace("  const available=C.ids.filter(id=>!active.has(id)),parts=s.board.filter(Boolean).map(t=>t.part);", "  const pool=C.ids.filter(id=>!active.has(id)),available=pool.filter(id=>!s.recent.includes(id)),parts=s.board.filter(Boolean).map(t=>t.part);\n  if(!available.length)available.push(...pool);")
s=s.replace("function refillPlan(s,pair){", "function refillPlan(s,pair,avoid=[]){")
s=s.replace("  let chosen=initial,frontier=[initial],seen=new Set([s.board.map(t=>t?.id??'_').join(',')]);", "  let chosen=initial,frontier=[initial],safeFallback=initial,seen=new Set([s.board.map(t=>t?.id??'_').join(',')]);")
s=s.replace("   const candidates=frontier.filter(x=>separatedHoles(x.board,s.cols).d>=3);\n   if(candidates.length){candidates.sort((a,b)=>separatedHoles(b.board,s.cols).d-separatedHoles(a.board,s.cols).d);chosen=candidates[0];break;}", "   const candidates=frontier.filter(x=>separatedHoles(x.board,s.cols).d>=3);\n   if(candidates.length){if(depth===0)safeFallback=candidates[0];const fresh=candidates.filter(x=>{const holes=separatedHoles(x.board,s.cols).cells;return holes.some(i=>!avoid.includes(i));});if(fresh.length){fresh.sort((a,b)=>separatedHoles(b.board,s.cols).d-separatedHoles(a.board,s.cols).d);chosen=fresh[0];break;}if(depth===3){chosen=safeFallback;break;}}")
s=s.replace("  const cells=separatedHoles(chosen.board,s.cols).cells,tiles=makePair", "  if(chosen===initial)chosen=safeFallback;\n  const cells=separatedHoles(chosen.board,s.cols).cells,tiles=makePair")
s=s.replace("refillPlan(s,piece.pair);", "refillPlan(s,piece.pair,[to,mateAt]);")
p.write_text(s,encoding='utf-8')
