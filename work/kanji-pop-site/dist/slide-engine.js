(function (host) {
 'use strict';
 const recipes=[{parts:['木','木'],char:'林',meaning:'Rừng cây'},{parts:['亻','木'],char:'休',meaning:'Nghỉ ngơi'},{parts:['日','月'],char:'明',meaning:'Sáng'}];
 const directions=['left','right','up','down'];
 const sequence=['木','月','亻','日','木','木','日','亻','月','木','月','日'];
 const levels=[
  {name:'Khu vườn chữ',targets:{林:1,休:1,明:1},board:['木',null,'木','月','亻',null,'日',null,null,'木',null,'日','月',null,'亻',null],seed:1},
  {name:'Đường đi của gỗ',targets:{林:2,休:2,明:1},board:['月','木','日','亻','木',null,'月',null,'日','亻',null,'木',null,'日','木',null],seed:5},
  {name:'Khéo xoay bàn cờ',targets:{林:2,休:2,明:2},board:['日','木','亻','月','月','亻','日','木','木',null,'月','亻',null,'日','木',null],seed:9}
 ];
 const clone=x=>JSON.parse(JSON.stringify(x));
 function recipe(a,b){return recipes.find(r=>(r.parts[0]===a&&r.parts[1]===b)||(r.parts[1]===a&&r.parts[0]===b));}
 function slide(board,dir,selected){
  if(!directions.includes(dir))throw Error('Unknown direction');
  const result=board.slice(),motions=[],merges=[];
  const unchanged=reason=>({board:result,motions,merges,changed:false,selected,reason});
  if(!Number.isInteger(selected)||selected<0||selected>=16||!board[selected])return unchanged('select');
  const row=Math.floor(selected/4),col=selected%4;
  if(dir==='left'&&col===0||dir==='right'&&col===3||dir==='up'&&row===0||dir==='down'&&row===3)return unchanged('edge');
  const to=selected+({left:-1,right:1,up:-4,down:4}[dir]),r=board[to]?recipe(board[selected],board[to]):null;
  if(board[to]&&!r)return unchanged('blocked');
  result[selected]=null;motions.push({from:selected,to,symbol:board[selected]});
  if(r){result[to]=null;merges.push({at:to,char:r.char,meaning:r.meaning});}else result[to]=board[selected];
  return {board:result,motions,merges,changed:true,selected:r?null:to};
 }
 function fresh(level=0){const c=levels[level];return {version:4,level,board:[...c.board],collected:{林:0,休:0,明:0},score:0,moves:0,spawnIndex:0,spawnClock:0,seed:c.seed};}
 function next(s){return sequence[(s.spawnIndex+s.level*3)%sequence.length];}
 function done(s){return recipes.every(r=>s.collected[r.char]>=levels[s.level].targets[r.char]);}
 function hasMoves(board){return board.some((v,i)=>v&&directions.some(dir=>slide(board,dir,i).changed));}
 function step(state,dir,selected){
  const plan=slide(state.board,dir,selected);
  if(!plan.changed)return {changed:false,state:clone(state),plan,spawn:null,won:done(state),stuck:!hasMoves(state.board)};
  const s=clone(state);s.board=plan.board.slice();s.moves++;s.spawnClock++;
  for(const r of plan.merges){s.collected[r.char]++;s.score+=100;}
  let spawn=null;
  if(!done(s)){
   const empty=s.board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
   if(empty.length&&(s.spawnClock>=3||empty.length===16)){const value=next(s);s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;const at=empty[s.seed%empty.length];s.board[at]=value;s.spawnIndex++;s.spawnClock=0;spawn={at,symbol:value};}
  }
  return {changed:true,state:s,plan,spawn,won:done(s),stuck:!done(s)&&!hasMoves(s.board)};
 }
 host.KanjiSlide={recipes,levels,directions,recipe,slide,fresh,next,done,hasMoves,step,clone};
 if(typeof module!=='undefined')module.exports=host.KanjiSlide;
})(globalThis);
