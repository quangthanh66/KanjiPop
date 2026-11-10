(function(host){
 'use strict';
 const COLS=3,ROWS=5,SIZE=COLS*ROWS;
 // These are visual component recipes, not claims about historical etymology.
 // Every tile of a color uses the same component, so ANY two of that color work.
 const recipes=[
  {id:'forest',parts:['木','木'],kanji:'林',meaning:'Rừng cây',word:'林',reading:'はやし',translation:'Rừng cây',note:'Trong 林, hai thành phần 木 đứng cạnh nhau.',mark:'●'},
  {id:'flame',parts:['火','火'],kanji:'炎',meaning:'Ngọn lửa',word:'炎',reading:'ほのお',translation:'Ngọn lửa',note:'Trong 炎, hai thành phần 火 xếp trên dưới.',mark:'◆'},
  {id:'friend',parts:['月','月'],kanji:'朋',meaning:'Bạn bè',word:'朋',reading:'とも',translation:'Bạn, người bạn',note:'Hình dạng chữ 朋 gồm hai phần 月 cạnh nhau.',mark:'★'},
  {id:'many',parts:['夕','夕'],kanji:'多',meaning:'Nhiều',word:'多い',reading:'おおい',translation:'Nhiều',note:'Trong 多, hai thành phần 夕 xếp trên dưới.',mark:'♥'},
  {id:'prosper',parts:['日','日'],kanji:'昌',meaning:'Thịnh vượng',word:'昌',reading:'ショウ',translation:'Âm On: shō · thịnh vượng, hưng thịnh',note:'Trong 昌, hai thành phần 日 xếp trên dưới.',mark:'✦'},
  {id:'jade',parts:['土','土'],kanji:'圭',meaning:'Ngọc khuê',word:'圭',reading:'ケイ',translation:'Âm On: kei · một loại ngọc nghi lễ cổ',note:'Hình dạng chữ 圭 gồm hai phần 土 xếp trên dưới.',mark:'■'}
 ];
 const layout=[0,1,2,3,null,1,4,2,5,1,5,3,2,4,0];
 const directions=['left','right','up','down'],clone=x=>JSON.parse(JSON.stringify(x));
 function destination(at,dir){
  if(!Number.isInteger(at)||at<0||at>=SIZE||!directions.includes(dir))return -1;
  const r=Math.floor(at/COLS),c=at%COLS;
  if(dir==='left'&&!c||dir==='right'&&c===COLS-1||dir==='up'&&!r||dir==='down'&&r===ROWS-1)return -1;
  return at+{left:-1,right:1,up:-COLS,down:COLS}[dir];
 }
 const neighbors=at=>directions.map(d=>destination(at,d)).filter(i=>i>=0);
 const hasContact=board=>board.some((p,i)=>p&&neighbors(i).some(j=>board[j]?.pair===p.pair));
 function random(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
 function fresh(seed=(Math.random()*4294967296)>>>0){
  const s={version:6,board:[],matches:0,discovered:[],moves:0,score:0,pending:null,nextId:14,seed:seed>>>0};
  const colors=recipes.map((_,i)=>i);
  for(let i=colors.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[colors[i],colors[j]]=[colors[j],colors[i]];}
  // Keep the opening match familiar: the two central wood tiles make 林.
  const wood=colors.indexOf(0);[colors[1],colors[wood]]=[colors[wood],colors[1]];
  let id=0;s.board=layout.map(p=>p===null?null:{id:id++,pair:colors[p],part:recipes[colors[p]].parts[0]});return s;
 }
 function directionToBlank(s,at){return directions.find(d=>{const i=destination(at,d);return i>=0&&s.board[i]===null;})||null;}
 // Fill exactly the two cleared cells; the sliding tile's former cell stays empty.
 // At most three occupied neighbors constrain each hole, leaving safe color choices.
 function planRefill(s,cells){
  const counts=recipes.map((_,p)=>s.board.filter(t=>t?.pair===p).length),options=[];
  for(let a=0;a<recipes.length;a++)for(let b=0;b<recipes.length;b++){
   if(a===b)continue;
   if(neighbors(cells[0]).some(i=>s.board[i]?.pair===a)||neighbors(cells[1]).some(i=>s.board[i]?.pair===b))continue;
   const after=counts.slice();after[a]++;after[b]++;
   // Prefer colors with a companion and a balanced population, then vary equally good options.
   const cost=after.reduce((sum,n)=>sum+n*n+(n===1?10:0),0)+random(s)*3;
   options.push({colors:[a,b],cost});
  }
  options.sort((a,b)=>a.cost-b.cost);
  if(!options.length)throw new Error('No safe refill');
  return cells.map((at,i)=>{const pair=options[0].colors[i];return {at,tile:{id:s.nextId++,pair,part:recipes[pair].parts[0]}};});
 }
 function move(state,at,dir){
  const s=clone(state),to=destination(at,dir),piece=state.board[at];
  const no=reason=>({changed:false,state:s,reason,match:null});
  if(state.pending!==null)return no('popup');
  if(!piece)return no('select');if(to<0)return no('edge');
  if(state.board[to]!==null)return no('occupied');
  s.moves++;s.board[at]=null;s.board[to]=piece;
  const partner=neighbors(to).find(i=>s.board[i]?.pair===piece.pair);
  if(partner===undefined)return {changed:true,state:s,from:at,to,selected:to,match:null};
  const mate=s.board[partner];s.board[to]=null;s.board[partner]=null;
  s.matches++;s.score+=100;if(!s.discovered.includes(piece.pair))s.discovered.push(piece.pair);
  s.pending={pair:piece.pair,spawn:planRefill(s,[to,partner])};
  return {changed:true,state:s,from:at,to,selected:null,match:{pair:piece.pair,cells:[to,partner],ids:[piece.id,mate.id]}};
 }
 function resume(state){const s=clone(state);if(!s.pending)return s;for(const {at,tile} of s.pending.spawn)s.board[at]=tile;s.pending=null;return s;}
 function valid(s){
  if(!s||s.version!==6||!Array.isArray(s.board)||s.board.length!==SIZE||!Array.isArray(s.discovered))return false;
  if(![s.moves,s.score,s.matches,s.nextId,s.seed].every(n=>Number.isSafeInteger(n)&&n>=0)||s.seed>4294967295||s.score!==s.matches*100||s.moves<s.matches||s.nextId!==14+s.matches*2)return false;
  if(new Set(s.discovered).size!==s.discovered.length||!s.discovered.every(p=>Number.isInteger(p)&&recipes[p])||s.discovered.length>s.matches)return false;
  if(s.pending!==null&&(!s.pending||!recipes[s.pending.pair]||!s.discovered.includes(s.pending.pair)||!Array.isArray(s.pending.spawn)||s.pending.spawn.length!==2))return false;
  const spawn=s.pending?.spawn||[];
  if(spawn.some(x=>!x||!Number.isInteger(x.at)||x.at<0||x.at>=SIZE||s.board[x.at]!==null)||new Set(spawn.map(x=>x.at)).size!==spawn.length)return false;
  const tiles=[...s.board.filter(t=>t!==null),...spawn.map(x=>x.tile)];
  if(tiles.length!==14||!tiles.every(t=>t&&Number.isInteger(t.id)&&t.id>=0&&t.id<s.nextId&&Number.isInteger(t.pair)&&recipes[t.pair]&&t.part===recipes[t.pair].parts[0])||new Set(tiles.map(t=>t.id)).size!==14)return false;
  return !hasContact(resume(s).board);
 }
 host.KanjiPairs={recipes,COLS,ROWS,SIZE,directions,clone,fresh,destination,neighbors,directionToBlank,hasContact,move,resume,valid};
 if(typeof module!=='undefined')module.exports=host.KanjiPairs;
})(globalThis);

