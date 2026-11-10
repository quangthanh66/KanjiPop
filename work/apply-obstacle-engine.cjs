const fs=require('fs'),base='work/kanji-pop-site/dist/';
const old=fs.readFileSync('work/n5-engine-before40.cjs','utf8');fs.writeFileSync(base+'n5-legacy-v9.js',old.replaceAll('host.KanjiN5','host.KanjiN5Legacy'));
let s=fs.readFileSync(base+'n5-engine.js','utf8');
s=s.replace("return mode==='desktop'?{cols:7,rows:5,blanks:1}:{cols:5,rows:7,blanks:1};","return mode==='desktop'?{cols:8,rows:5,blanks:1,blocked:[17,12,30]}:{cols:5,rows:8,blanks:1,blocked:[7,21,33]};");
s=s.replace(' function reorient(state,mode){',` const distanceCache=new Map();
 function walkDistance(s,a,b){
  if(s.blocked.includes(a)||s.blocked.includes(b))return Infinity;
  const key=s.rows+','+s.cols+':'+s.blocked.slice().sort((a,b)=>a-b).join(',');let all=distanceCache.get(key);
  if(!all){all=[];for(let start=0;start<s.rows*s.cols;start++){const d=Array(s.rows*s.cols).fill(Infinity),queue=[start];if(!s.blocked.includes(start)){d[start]=0;for(let q=0;q<queue.length;q++)for(const n of neighbors(queue[q],s.rows,s.cols))if(!s.blocked.includes(n)&&d[n]===Infinity){d[n]=d[queue[q]]+1;queue.push(n);}}all[start]=d;}distanceCache.set(key,all);}
  return all[a]?.[b]??Infinity;
 }
 function reorient(state,mode){`);
const arrangeStart=s.indexOf(' function arrange('),arrangeEnd=s.indexOf(' function fresh(',arrangeStart);
s=s.slice(0,arrangeStart)+` function arrange(s,tiles,blanks){
  const groups=Array.from(new Set(tiles.map(t=>t.pair))).map(id=>tiles.filter(t=>t.pair===id));
  for(let attempt=0;attempt<100;attempt++){
   const open=Array.from({length:s.rows*s.cols},(_,i)=>i).filter(i=>!s.blocked.includes(i));
   for(let i=open.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[open[i],open[j]]=[open[j],open[i]];}
   const pairs=[];let budget=30000;
   function match(rest){if(!rest.length)return true;if(--budget<0)return false;
    let a=rest[0],choices=null;for(const cell of rest){const options=rest.filter(b=>b!==cell&&walkDistance(s,cell,b)>=5);if(!choices||options.length<choices.length){a=cell;choices=options;}}
    if(!choices.length)return false;
    for(const b of choices){pairs.push([a,b]);if(match(rest.filter(i=>i!==a&&i!==b)))return true;pairs.pop();}return false;
   }
   if(match(open.slice(blanks))){const board=Array(s.rows*s.cols).fill(null);for(const at of s.blocked)board[at]=false;groups.forEach((g,i)=>{board[pairs[i][0]]=g[0];board[pairs[i][1]]=g[1];});return board;}
  }
  throw Error('Could not place separated pairs around obstacles');
 }
`+s.slice(arrangeEnd);
s=s.replace('version:9,course','version:10,course').replaceAll('(s.rows*s.cols-s.blanks)/2','(s.rows*s.cols-s.blanks-s.blocked.length)/2');
const start=s.indexOf(' function migrateDesktopV9('),end=s.indexOf(' const complete=',start);
s=s.slice(0,start)+` function upgrade(state,mode='mobile'){
  if(state?.version===10)return valid(state)?repairRefill(clone(state)):state;
  try{
   const legacy=host.KanjiN5Legacy||(typeof require!=='undefined'?require('./n5-legacy-v9.js'):null);
   if(!legacy)return state;const old=legacy.upgrade(state,mode);if(!legacy.valid(old))return state;
   const s=clone(old),l=C.levels[s.level];Object.assign(s,layoutFor(s.level,s.mode));s.version=10;delete s.benchmark;
   const tiles=s.board.filter(Boolean),active=new Set(tiles.map(t=>t.recipe)),used=new Set(tiles.map(t=>t.pair));
   const missing=Boolean(s.pending||s.status==='won'),capacity=(s.rows*s.cols-s.blanks-s.blocked.length)/2;
   const slot=missing?(Number.isInteger(s.pending?.pair)?s.pending.pair:Array.from({length:C.ids.length},(_,i)=>i).find(i=>!used.has(i))):null;
   if(missing)used.add(slot);
   for(const id of [...l.targets,...l.pool,...C.ids]){if(tiles.length>=(capacity-(missing?1:0))*2)break;if(active.has(id))continue;const pair=Array.from({length:C.ids.length},(_,i)=>i).find(i=>!used.has(i));tiles.push(...makePair(s,id,pair));active.add(id);used.add(pair);}
   s.board=arrange(s,tiles,s.blanks+(missing?2:0));
   if(s.pending&&!s.pending.complete){s.pending.pair=slot;s.pending.plan=refillPlan(s,slot,s.board.flatMap((t,i)=>t===null?[i]:[]));}
   return valid(s)?s:state;
  }catch{return state;}
 }
`+s.slice(end);
// Obstacles are false; only null cells are empty and only objects are movable.
s=s.replace('distance(...cells,s.cols)','walkDistance(s,...cells)').replaceAll('distance(a,b,s.cols)>=5','walkDistance(s,a,b)>=5');
s=s.replace('if(a!==b&&walkDistance(s,a,b)>=5)','if(a!==b&&s.board[b]!==false&&walkDistance(s,a,b)>=5)');
s=s.replace('all=Array.from({length:s.board.length},(_,i)=>i),candidates=[]','all=Array.from({length:s.board.length},(_,i)=>i).filter(i=>s.board[i]!==false),candidates=[]');
s=s.replace('const groups=Array.from(new Set(s.board.filter(Boolean).map(t=>t.pair))).map(id=>s.board.filter(t=>t?.pair===id)),board=Array(s.board.length).fill(null);','const groups=Array.from(new Set(s.board.filter(Boolean).map(t=>t.pair))).map(id=>s.board.filter(t=>t?.pair===id)),board=Array(s.board.length).fill(null);for(const at of s.blocked)board[at]=false;');
s=s.replace('if(n.holes.includes(at))continue;','if(n.holes.includes(at)||s.board[at]===false)continue;');
s=s.replace('function valid(s,legacyMobile=false)','function valid(s)').replace('s.version!==9','s.version!==10');
s=s.replace("const shape=legacyMobile&&s.mode==='mobile'?{cols:4,rows:5,blanks:2}:layoutFor(s.level,s.mode);","const shape=layoutFor(s.level,s.mode);if(!Array.isArray(s.blocked)||JSON.stringify(s.blocked)!==JSON.stringify(shape.blocked))return false;");
s=s.replace('if(board.filter(t=>t===null).length!==blanks)return false;','if(board.length!==s.rows*s.cols||board.some((t,i)=>(t===false)!==s.blocked.includes(i))||board.filter(t=>t===null).length!==blanks)return false;');
s=s.replace('const source=b.slice();b.fill(null);const used=new Set();','const source=b.slice();b.fill(null);for(const at of s.blocked)b[at]=false;const used=new Set();');
s=s.replace('m.to>=b.length||b[m.to])','m.to>=b.length||b[m.to]!==null)');
s=s.replaceAll('distance(plan.spawn[0].at,plan.spawn[1].at,s.cols)<5','walkDistance(s,plan.spawn[0].at,plan.spawn[1].at)<5');
s=s.replace('neighbors,distance,hasContact','neighbors,distance,walkDistance,hasContact');
fs.writeFileSync(base+'n5-engine.js',s);
let h=fs.readFileSync(base+'index.html','utf8').replace('<script src="n5-engine.js">','<script src="n5-legacy-v9.js"></script><script src="n5-engine.js">');fs.writeFileSync(base+'index.html',h);
