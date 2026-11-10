const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs');
const paths=JSON.parse(fs.readFileSync('C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/slide-solutions.json','utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const page=await browser.newPage({viewport:{width:390,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const response=await page.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(response.status(),200);
  await page.locator('.board-tile').first().waitFor();
  await page.locator('.board-tile').first().click({force:true});assert.equal(await page.locator('#moves').innerText(),'0');
  const first=await page.locator('#tiles').innerText();
  await page.locator('[data-dir="left"]').click();await page.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  assert.equal(await page.locator('#moves').innerText(),'1');assert.ok(Number(await page.locator('#kp-points').innerText())>=100);
  const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-slide-v3')).state);
  await page.locator('#undo').click();assert.equal(await page.locator('#tiles').innerText(),first);assert.equal(await page.locator('#moves').innerText(),'0');assert.equal(await page.locator('#undo-count').innerText(),'2');
  await page.locator('[data-dir="left"]').click();await page.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-slide-v3')).state),after);
  await page.reload();assert.equal(await page.locator('#moves').innerText(),'1');assert.equal(await page.locator('#undo-count').innerText(),'2');
  await page.locator('#help').click();assert.equal(await page.locator('[role="dialog"]').isVisible(),true);await page.locator('[data-action="resume"]').click();
  await page.locator('#restart').click();const rect=await page.locator('#slide-board').boundingBox();await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height*.5);await page.mouse.down();await page.mouse.move(rect.x+rect.width*.2,rect.y+rect.height*.5,{steps:6});await page.mouse.up();await page.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');assert.equal(await page.locator('#moves').innerText(),'1');
  await page.setViewportSize({width:320,height:900});await page.locator('#restart').click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),320);
  await page.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/slide-mobile-check.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();
  for(let level=0;level<3;level++){
   for(const dir of paths[level]){await page.locator(`[data-dir="${dir}"]`).click();await page.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');}
   await page.locator('[data-action="next"]').waitFor();assert.match(await page.locator('[role="dialog"]').innerText(),/THU THẬP ĐỦ/);
   await page.locator('[data-action="next"]').click();
  }
  assert.equal(await page.locator('#kp-level-no').innerText(),'01');
  await page.evaluate(()=>{const state=KanjiSlide.fresh(),old=KanjiSlide.clone(state);state.board=Array(16).fill('日');localStorage.setItem('kanji-pop-slide-v3',JSON.stringify({state,history:[old],undos:1}));});
  await page.reload();await page.locator('[data-action="undo"]').waitFor();assert.match(await page.locator('[role="dialog"]').innerText(),/BÀN ĐÃ ĐẦY/);await page.locator('[data-action="undo"]').click();assert.equal(await page.locator('#undo-count').innerText(),'0');assert.equal(await page.locator('#undo').isDisabled(),true);
  await page.locator('#restart').click();assert.equal(await page.locator('#undo-count').innerText(),'3');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',checks:['localhost HTTP','tile tap does not solve','animated merge','exact deterministic undo','save and reload','rules modal','pointer swipe','320px layout','all three wins','deadlock recovery','undo budget'],errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
