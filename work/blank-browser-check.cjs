const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
 const context=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const r=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);
 await p.evaluate(()=>{localStorage.removeItem('kanji-pop-pairs-v6');});await p.reload();
 await p.locator('#tiles button').first().waitFor();
 const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
 const snapshot=()=>p.locator('#tiles button').evaluateAll(ts=>ts.map(t=>[t.dataset.at,t.dataset.id,t.dataset.pair,t.textContent]));
 const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-pairs-v6')).state);
 assert.equal(await p.locator('#tiles button').count(),14);assert.equal(await p.locator('.board-cell.empty').count(),1);assert.equal(await p.locator('.direction-pad,#goals,.goal-list').count(),0);
 const initial=await snapshot();
 await p.locator('#tiles [data-at="0"]').tap();assert.deepEqual(await snapshot(),initial);assert.equal(await p.locator('#moves').innerText(),'0');
 // A simple tap slides one adjacent tile. The first move here causes contact, not overlap.
 const pair=Number(await p.locator('#tiles [data-at="5"]').getAttribute('data-pair'));
 const kanji=await p.evaluate(pair=>KanjiPairs.recipes[pair].kanji,pair);
 await p.locator('#tiles [data-at="5"]').tap();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),kanji);
 assert.equal(await p.locator('#tiles button').count(),12);assert.equal(await p.locator('#kp-points').innerText(),'100');assert.equal(await p.locator('#moves').innerText(),'1');
 const pending=await state();assert(pending.pending);assert.equal(pending.pending.spawn.length,2);
 await p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/blank-reveal-check.png',fullPage:true});
 await p.reload();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),kanji);
 await p.locator('[data-action="continue"]').tap();await idle();assert.equal(await p.locator('#tiles button').count(),14);assert.equal(await p.locator('.board-cell.empty').count(),1);assert.equal(await p.locator('#free-spaces').innerText(),'1');
 const filled=await state();assert.equal(filled.board[5],null);assert.equal(filled.pending,null);
 for(const x of pending.pending.spawn)assert.deepEqual(filled.board[x.at],x.tile);
 await p.locator('#undo').tap();assert.deepEqual(await snapshot(),initial);assert.equal(await p.locator('#kp-points').innerText(),'0');
 // Swipe a tile vertically into the blank without making a match.
 const box=await p.locator('#tiles [data-at="7"]').boundingBox();
 await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2,box.y-box.height/2,{steps:6});await p.mouse.up();await idle();
 assert.equal(await p.locator('#moves').innerText(),'1');assert.equal((await state()).board[7],null);assert.equal(await p.locator('.reveal-char').count(),0);
 // Keyboard: focusing is not moving. Space activates once.
 await p.locator('#tiles [data-at="4"]').focus();await p.keyboard.press('Space');await idle();assert.equal(await p.locator('#moves').innerText(),'2');
 // Repeated continuous play; each click is a real mobile tap on a legal neighboring tile.
 await p.emulateMedia({reducedMotion:'reduce'});await p.reload();
 for(let n=0;n<60;n++){
  const legal=await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('kanji-pop-pairs-v6')).state;return s.board.flatMap((t,i)=>t&&KanjiPairs.directionToBlank(s,i)?[i]:[]);});
  await p.locator(`#tiles [data-at="${legal[(n*7+Math.floor(n/4))%legal.length]}"]`).tap();await idle();
  if(await p.locator('.reveal-char').count()){await p.locator('[data-action="continue"]').tap();await idle();}
  assert.equal(await p.locator('#tiles button').count(),14);assert.equal(await p.locator('.board-cell.empty').count(),1);
 }
 assert((await state()).matches>2);
 for(const width of [320,390,430]){
  await p.setViewportSize({width,height:844});await p.waitForTimeout(100);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
  const board=await p.locator('#slide-board').boundingBox(),main=await p.locator('#kanji-pop').boundingBox();assert(board.x>=main.x&&board.x+board.width<=main.x+main.width);
  const tile=await p.locator('#tiles button').first().boundingBox();assert(tile.width>=44&&tile.height>=44);
 }
 await p.setViewportSize({width:390,height:844});await p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/blank-board-check.png',fullPage:true});
 await p.locator('#help').tap();assert.match(await p.locator('.rules').innerText(),/1 ô trống/);await p.locator('[data-action="resume"]').tap();
 await p.locator('#restart').tap();assert.equal(await p.locator('#kp-points').innerText(),'0');assert.equal(await p.locator('#tiles button').count(),14);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',checks:['HTTP 200','mobile tap adjacent only','automatic contact reveal','pending popup survives reload','refill exactly two cells','one blank','exact undo','vertical swipe','keyboard Space','60 continuous turns','320/390/430px fit','removed controls','help and restart'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
