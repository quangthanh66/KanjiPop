const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const context=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const r=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);
  await p.locator('.level-node').first().waitFor();
  const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-n5-v1')).state);
  const fixture=async(level,mode)=>{await p.evaluate(({level,mode})=>{const C=KanjiCourse,results={};for(let i=0;i<level;i++)results[i]={stars:3,moves:12};localStorage.setItem('kanji-pop-n5-v1',JSON.stringify({course:C.id,state:KanjiN5.fresh(level,1234+level,mode),profile:{collected:C.ids,results},history:[],undos:3,view:'play',sound:false}));},{level,mode});await p.reload();await p.locator('#tiles button').first().waitFor();};
  const shot=name=>p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/grid-'+name+'.png',fullPage:true});
  const metrics=[];
  for(const mode of ['desktop','mobile']){
   await fixture(mode==='desktop'?7:5,mode);const initial=await state();
   for(const [width,height] of (mode==='desktop'?[[1440,900],[1366,768],[900,700],[390,844],[320,568]]:[[390,844],[375,667],[320,568],[1440,900]])){
    await p.setViewportSize({width,height});await p.waitForTimeout(120);
    const metric=await p.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,root:document.getElementById('kanji-pop').getBoundingClientRect().width,tiles:[...document.querySelectorAll('#tiles button')].map(t=>{const r=t.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})}));
    assert.equal(metric.scrollWidth,width);if(width>=900)assert.equal(metric.root,width);assert.equal(metric.tiles.length,mode==='desktop'?28:18);
    assert(metric.tiles.every(t=>t.w>=44&&t.h>=44),JSON.stringify({mode,width,tiles:metric.tiles}));
    for(let i=0;i<metric.tiles.length;i++)for(let j=i+1;j<metric.tiles.length;j++){const a=metric.tiles[i],b=metric.tiles[j];assert(a.x+a.w<=b.x+.1||b.x+b.w<=a.x+.1||a.y+a.h<=b.y+.1||b.y+b.h<=a.y+.1);}
    const after=await state();assert.deepEqual(after,initial);assert.equal(await p.locator('.board-cell.empty').count(),2);
    metrics.push({mode,width,height,scrollHeight:metric.scrollHeight,minTile:Math.min(...metric.tiles.map(t=>Math.min(t.w,t.h)))});
    if(mode==='desktop'&&width===1440)await shot('desktop');if(mode==='mobile'&&width===390)await shot('mobile');if(mode==='mobile'&&width===375)await shot('small-mobile');
   }
  }
  // At a new run the current viewport chooses the shape; resizing alone does not.
  await p.locator('#restart').click();assert.equal((await state()).cols,5);assert.equal((await state()).rows,4);
  await p.setViewportSize({width:390,height:844});await p.locator('#restart').click();assert.equal((await state()).cols,4);assert.equal((await state()).rows,5);
  // Find a deterministic valid state with a tile adjacent to two empty cells.
  await p.evaluate(()=>{const saved=JSON.parse(localStorage.getItem('kanji-pop-n5-v1'));for(let seed=1;seed<10000;seed++){const s=KanjiN5.fresh(5,seed,'mobile');if(s.board.some((t,i)=>t&&KanjiN5.legalDirections(s,i).length===2)){saved.state=s;saved.history=[];localStorage.setItem('kanji-pop-n5-v1',JSON.stringify(saved));break;}}});await p.reload();await p.locator('#tiles button').first().waitFor();
  const choice=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kanji-pop-n5-v1')).state;const at=s.board.findIndex((t,i)=>t&&KanjiN5.legalDirections(s,i).length===2);return {at,dirs:KanjiN5.legalDirections(s,at),dests:KanjiN5.legalDirections(s,at).map(d=>KanjiN5.destination(at,d,s.rows,s.cols))};});assert(choice.at>=0);
  const before=await state();await p.locator(`#tiles [data-at="${choice.at}"]`).click();await idle();assert.deepEqual(await state(),before);assert.equal(await p.locator('.board-cell.destination').count(),2);
  await shot('choose-blank');await p.locator(`[data-empty="${choice.dests[1]}"]`).click();await idle();assert.equal((await state()).moves,1);
  const expected=await p.evaluate(({before,choice})=>KanjiN5.move(before,choice.at,choice.dirs[1]).state,{before,choice});assert.deepEqual((await state()).board,expected.board);
  if(await p.locator('[data-action="continue"]').count()){await p.locator('[data-action="continue"]').click();await idle();}
  await p.locator('#undo').click();assert.deepEqual((await state()).board,before.board);
  // Keyboard preserves explicit direction and undo after a match/refill.
  await p.locator(`#tiles [data-at="${choice.at}"]`).focus();await p.keyboard.press('Arrow'+{left:'Left',right:'Right',up:'Up',down:'Down'}[choice.dirs[0]]);await idle();assert.equal((await state()).moves,1);
  if(await p.locator('[data-action="continue"]').count()){await p.locator('[data-action="continue"]').click();await idle();}
  await p.locator('#undo').click();
  // Hints identify both tile and destination, including ambiguous moves.
  await p.locator('#hint').click();await idle();assert.equal(await p.locator('.hinted').count(),1);assert.equal(await p.locator('.hint-target').count(),1);await p.locator('.hint-target').click();await idle();assert.equal((await state()).moves,1);
  // Migrate a genuine old-schema pending reveal and history without losing progress.
  await p.evaluate(()=>{const C=KanjiCourse,E=KanjiN5;let old=E.fresh(0,1234);old.version=7;delete old.cols;delete old.blanks;delete old.mode;let pending=E.move(E.upgrade(old),5,'left').state;pending.version=7;delete pending.cols;delete pending.blanks;delete pending.mode;localStorage.setItem('kanji-pop-n5-v1',JSON.stringify({course:C.id,state:pending,history:[old],profile:{collected:['休'],results:{}},undos:3,view:'play',sound:false}));});await p.reload();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'休');assert.equal((await state()).mode,'legacy');
  await p.locator('[data-action="continue"]').click();await idle();assert.equal(await p.locator('.board-cell.empty').count(),1);await p.locator('#undo').click();assert.equal((await state()).moves,0);assert.equal((await state()).cols,3);
  await p.locator('#nav-album').click();assert.equal(await p.locator('.album-card:not(:disabled)').count(),1);
  assert.deepEqual(errors,[]);const report={status:'PASS',metrics,checks:['desktop 5x6','mobile 4x5','no overflow or overlaps','minimum 44px targets','resize preserves run','new run chooses viewport','ambiguous tap does not move','explicit blank destination','keyboard direction','hint destination','undo','legacy pending and history migration','album preserved'],errors};fs.writeFileSync('work/grid-browser-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
