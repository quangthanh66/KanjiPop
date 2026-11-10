from pathlib import Path
p=Path('work/kanji-pop-site/dist/n5-engine.js');s=p.read_text(encoding='utf-8')
a=s.index(' function layoutFor(');b=s.index(' function fresh(',a)
s=s[:a]+''' function layoutFor(level,mode='mobile'){
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
''' + s[b:]
s=s.replace('version:8','version:9').replace('for(const id of l.pool)if(active.length','for(const id of [...l.pool,...C.ids])if(active.length')
a=s.index('  if(s.cols===3)');b=s.index('  return s;',a)
s=s[:a]+"  s.board=arrange(s,tiles,s.blanks);\n"+s[b:]
a=s.index(' function upgrade(');b=s.index(' const complete=',a)
s=s[:a]+''' function upgrade(state,mode='mobile'){
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
''' + s[b:]
s=s.replace('const available=level.pool.filter','const available=C.ids.filter')
s=s.replace('s.version!==8','s.version!==9').replace("!['mobile','desktop','legacy'].includes(s.mode)","!['mobile','desktop'].includes(s.mode)")
s=s.replace("const shape=s.mode==='legacy'?{cols:3,rows:l.rows,blanks:1}:layoutFor(s.level,s.mode);","const shape=layoutFor(s.level,s.mode);")
s=s.replace('s.found.every(id=>l.pool.includes(id))','s.found.every(id=>C.ids.includes(id))').replace('l.pool.includes(t.recipe)','C.ids.includes(t.recipe)')
p.write_text(s,encoding='utf-8')
p=Path('work/kanji-pop-site/dist/n5-game.js');s=p.read_text(encoding='utf-8')
s=s.replace('E.upgrade(saved.state)','E.upgrade(saved.state,deviceMode())').replace('.map(E.upgrade)','.map(s=>E.upgrade(s,deviceMode()))')
s=s.replace('Bàn lớn dần · Mobile tối đa 4×5 từ màn 6 · PC tối đa 5×6 từ màn 8.','Mọi màn: Mobile 4×5 · PC 5×6 · 2 ô trống.')
s=s.replace('<strong>Bàn lớn dần:</strong> từ 3×3 lên 4×5 trên mobile (màn 6), hoặc 5×6 trên PC (màn 8).','<strong>Bàn cố định ở mọi màn:</strong> 4×5 trên mobile, 5×6 trên PC, luôn có 2 ô trống. Các cặp bổ sung lấy từ bộ 24 chữ, mỗi chữ chỉ có một cặp trên bàn.')
s=s.replace("'Đã mở thẻ của màn này':'Một lượt ôn tập'","'Đã mở thẻ của màn này':'Khám phá thêm ngoài mục tiêu màn'")
s=s.replace('Ghép chữ ôn được điểm nhưng không thay thế thẻ còn thiếu.','Ghép các cặp bổ sung vẫn được điểm và thẻ album, nhưng không thay thế mục tiêu còn thiếu.')
p.write_text(s,encoding='utf-8')
