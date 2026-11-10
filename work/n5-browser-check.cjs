const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),solutions=JSON.parse(fs.readFileSync('work/n5-solutions.json','utf8'));
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const r=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);await p.evaluate(()=>localStorage.removeItem('kanji-pop-n5-v1'));await p.reload();
  const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  const saved=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-n5-v1')));
  const shot=name=>p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/n5-'+name+'.png',fullPage:true});
  assert.equal(await p.locator('.level-node').count(),15);assert.equal(await p.locator('.level-node:disabled').count(),14);await shot('map');
  await p.locator('[data-main="0"]').tap();assert.equal(await p.locator('#tiles button').count(),8);assert.equal(await p.locator('.board-cell.empty').count(),1);await shot('play');
  const before=(await saved()).state;
  await p.locator('#tiles [data-at="0"]').tap();assert.equal(await p.locator('#moves').innerText(),'0');
  await p.locator('#tiles [data-at="5"]').tap();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'休');assert.equal((await saved()).profile.collected.length,1);await shot('reveal');
  await p.reload();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'休');await p.locator('[data-action="continue"]').tap();await idle();assert.equal(await p.locator('#tiles button').count(),8);assert.equal(await p.locator('.board-cell.empty').count(),1);
  await p.locator('#undo').tap();assert.deepEqual((await saved()).state,before);assert.equal((await saved()).profile.collected.length,1);assert.equal(await p.locator('#mission-count').innerText(),'0/4');
  await p.locator('#hint').tap();await idle();assert.equal(await p.locator('.hinted').count(),1);assert.equal(await p.locator('#moves').innerText(),'0');
  await p.locator('#nav-album').tap();assert.equal(await p.locator('.album-card:not(:disabled)').count(),1);await p.locator('[data-card="休"]').tap();assert.equal(await p.locator('.reveal-char').innerText(),'休');await p.locator('[data-action="close"]').tap();
  await p.locator('#nav-play').tap();await p.locator('#restart').tap();
  // Complete all 15 levels using actual mobile taps along independently solved paths.
  for(let level=0;level<15;level++){
   for(const step of solutions[level]){
    await p.locator(`#tiles [data-at="${step.at}"]`).tap();await idle();
    if(await p.locator('[data-action="continue"]').count()){await p.locator('[data-action="continue"]').tap();await idle();}
   }
   await p.locator('.win-stars').waitFor();const s=await saved();assert(s.profile.results[level]);assert.equal(s.state.status,'won');
   console.log('Completed level '+(level+1)+'; album '+s.profile.collected.length+'/24');
   if(level===0){await shot('win');await p.reload();await p.locator('.win-stars').waitFor();}
   if(level<14)await p.locator('[data-action="next"]').tap();
  }
  assert.equal((await saved()).profile.collected.length,24);assert.equal(Object.keys((await saved()).profile.results).length,15);await shot('complete');
  await p.locator('[data-action="album"]').tap();assert.equal(await p.locator('.album-card:not(:disabled)').count(),24);await shot('album');
  await p.locator('[data-card="友"]').tap();assert.equal(await p.locator('.reveal-formula svg').count(),1);await p.locator('[data-action="close"]').tap();
  await p.locator('#nav-map').tap();assert.equal(await p.locator('.level-node:disabled').count(),0);assert.equal(await p.locator('.level-node.finished').count(),15);
  // Replay preserves the course album and completed levels.
  await p.locator('[data-level="2"]').tap();assert.equal(await p.locator('#tiles button').count(),14);assert.equal((await saved()).profile.collected.length,24);
  for(const width of [320,390,430]){
   await p.setViewportSize({width,height:844});await p.waitForTimeout(70);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth),width);
   const ts=await p.locator('#tiles button').first().boundingBox();assert(ts.width>=44&&ts.height>=44);
   await p.locator('#help').tap();const modal=await p.locator('.kp-modal').boundingBox();assert(modal.x>=0&&modal.x+modal.width<=width&&modal.height<=794);await p.locator('[data-action="close"]').tap();
  }
  await p.setViewportSize({width:390,height:844});await shot('tall-board');await p.locator('#nav-map').tap();
  await p.locator('[data-about]').tap();assert.match(await p.locator('.source-list').innerText(),/24 chữ/);assert.equal(await p.locator('.source-list a').count(),3);await p.locator('[data-action="close"]').tap();
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',coverage:24,levels:15,checks:['HTTP 200','level locks','mobile tap','reveal persistence','exact undo and album retention','hint','all levels completed through UI','win reload','24 readable album cards','rare component SVG','replay','responsive 320/390/430','source disclosure'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
