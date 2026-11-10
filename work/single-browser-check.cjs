const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const paths=JSON.parse(fs.readFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/single-solutions.json','utf8'));
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const p=await b.newPage({viewport:{width:390,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const resp=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(resp.status(),200);
  await p.locator('#tiles button').first().waitFor();
  const snapshot=()=>p.evaluate(()=>Array.from({length:16},(_,i)=>document.querySelector(`#tiles [data-at="${i}"]`)?.dataset.symbol??null));
  const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  const initial=await snapshot();
  assert.equal(await p.locator('[data-dir="right"]').isDisabled(),true);
  await p.locator('#tiles [data-at="0"]').click();
  assert.equal(await p.locator('#moves').innerText(),'0');assert.equal(await p.locator('#tiles [data-at="0"]').getAttribute('aria-pressed'),'true');
  assert.equal(await p.locator('[data-dir="left"]').isDisabled(),true);
  await p.locator('[data-dir="right"]').click();await idle();
  let after=await snapshot();assert.equal(after[0],null);assert.equal(after[1],'木');for(let i=2;i<16;i++)assert.equal(after[i],initial[i]);
  assert.equal(await p.locator('#spawn-after').innerText(),'2');
  assert.equal(await p.locator('#tiles [data-at="1"]').getAttribute('aria-pressed'),'true');
  await p.locator('[data-dir="right"]').click();await idle();assert.equal(await p.locator('#kp-points').innerText(),'100');assert.equal(await p.locator('#spawn-after').innerText(),'1');assert.equal(await p.locator('[data-dir="right"]').isDisabled(),true);
  await p.locator('#undo').click();assert.deepEqual(await snapshot(),after);assert.equal(await p.locator('#spawn-after').innerText(),'2');
  await p.locator('#restart').click();
  const tile=await p.locator('#tiles [data-at="0"]').boundingBox();await p.mouse.move(tile.x+tile.width/2,tile.y+tile.height/2);await p.mouse.down();await p.mouse.move(tile.x+tile.width*2.6,tile.y+tile.height/2,{steps:8});await p.mouse.up();await idle();
  assert.deepEqual(await snapshot(),after,'A long swipe still moves exactly one cell');
  await p.reload();assert.deepEqual(await snapshot(),after);
  await p.locator('#restart').click();await p.locator('#help').click();assert.match(await p.locator('[role="dialog"]').innerText(),/đúng một ô/);await p.locator('[data-action="resume"]').click();
  await p.setViewportSize({width:320,height:900});await p.locator('#tiles [data-at="0"]').click();assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),320);
  await p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/single-mobile-check.png',fullPage:true});
  await p.emulateMedia({reducedMotion:'reduce'});await p.reload();
  for(let level=0;level<3;level++){
   for(const {at,dir} of paths[level]){await p.locator(`#tiles [data-at="${at}"]`).click();await p.locator(`[data-dir="${dir}"]`).click();await idle();}
   await p.locator('[data-action="next"]').waitFor();await p.locator('[data-action="next"]').click();
  }
  assert.equal(await p.locator('#kp-level-no').innerText(),'01');
  await p.evaluate(()=>{const state=KanjiSlide.fresh(),old=KanjiSlide.clone(state);state.board=Array(16).fill('日');localStorage.setItem('kanji-pop-single-v4',JSON.stringify({state,history:[old],undos:1}));});
  await p.reload();await p.locator('[data-action="undo"]').click();assert.equal(await p.locator('#undo-count').innerText(),'0');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',checks:['local HTTP','select only','single cell movement','other tiles fixed','merge','spawn countdown','exact undo','long pointer swipe one cell','reload','help','320px','three wins','deadlock'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
