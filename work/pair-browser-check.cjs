const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const solutions=JSON.parse(fs.readFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/pair-solutions.json','utf8'));
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const p=await b.newPage({viewport:{width:390,height:850}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const resp=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(resp.status(),200);await p.locator('#tiles button').first().waitFor();
  assert.equal(await p.locator('.direction-pad,#goals,.goal-list').count(),0);
  const snapshot=()=>p.evaluate(()=>Array.from({length:16},(_,i)=>document.querySelector(`#tiles [data-at="${i}"]`)?.dataset.id??null));
  const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  const initial=await snapshot();
  const backgrounds=await p.locator('#tiles [data-pair="1"]').evaluateAll(ts=>ts.map(t=>getComputedStyle(t).backgroundImage));assert.equal(backgrounds[0],backgrounds[1]);
  await p.locator('#tiles [data-at="2"]').click();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('#moves').innerText(),'0');assert.deepEqual(await snapshot(),initial);
  await p.locator('#tiles [data-at="0"]').click();await p.keyboard.press('ArrowRight');await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'林');assert.match(await p.locator('.reveal-word').innerText(),/はやし/);assert.equal(await p.locator('#tiles button').count(),10);
  let state=await p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-pairs-v5')).state);for(let c=0;c<4;c++){let occupied=false;for(let row=0;row<4;row++){if(state.board[row*4+c])occupied=true;else assert.equal(occupied,false);}}
  await p.reload();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'林');await p.locator('[data-action="continue"]').click();
  await p.locator('#undo').click();assert.deepEqual(await snapshot(),initial);assert.equal(await p.locator('#pair-count').innerText(),'0');
  const t=await p.locator('#tiles [data-at="4"]').boundingBox();await p.mouse.move(t.x+t.width/2,t.y+t.height/2);await p.mouse.down();await p.mouse.move(t.x+t.width/2,t.y+t.height*1.6,{steps:8});await p.mouse.up();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'好');
  state=await p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-pairs-v5')).state);for(let row=0;row<4;row++){let empty=false;for(let c=0;c<4;c++){if(!state.board[row*4+c])empty=true;else assert.equal(empty,false);}}
  await p.setViewportSize({width:320,height:820});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),320);
  const modal=await p.locator('.reveal-modal').boundingBox(),screen=await p.locator('#kanji-pop').boundingBox();assert.ok(modal.x>=screen.x&&modal.x+modal.width<=screen.x+screen.width);assert.ok(modal.y>=screen.y&&modal.y+modal.height<=screen.y+screen.height);
  await p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/pair-reveal-check.png',fullPage:true});
  await p.locator('[data-action="continue"]').click();await p.locator('#restart').click();await p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/pair-board-check.png',fullPage:true});
  await p.emulateMedia({reducedMotion:'reduce'});await p.reload();
  for(let level=0;level<3;level++){
   for(const {at,dir} of solutions[level]){
    await p.locator(`#tiles [data-at="${at}"]`).click();await p.keyboard.press({left:'ArrowLeft',right:'ArrowRight',up:'ArrowUp',down:'ArrowDown'}[dir]);await idle();
    if(await p.locator('[data-action="continue"]').count())await p.locator('[data-action="continue"]').click();
   }
   await p.locator('[data-action="next"]').waitFor();assert.equal(await p.locator('#tiles button').count(),0);await p.locator('[data-action="next"]').click();
  }
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',checks:['removed controls and goals','colors match recipe pairs','different color blocked','horizontal clear and downward fall','vertical swipe and left compaction','popup content and persistence','exact undo','320px popup fits','all levels completed'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
