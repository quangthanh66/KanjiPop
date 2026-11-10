const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  const r=await p.goto('http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});assert.equal(r.status(),200);await p.locator('.level-node').first().waitFor();
  const idle=()=>p.waitForFunction(()=>document.getElementById('kanji-pop').getAttribute('aria-busy')==='false');
  const shot=name=>p.screenshot({path:'C:/Users/Admin/Documents/Codex/2026-10-23/c-c/work/responsive-'+name+'.png',fullPage:true});
  const measure=()=>p.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,root:document.getElementById('kanji-pop').getBoundingClientRect().width}));
  const metrics=[];
  for(const [width,height] of [[1440,900],[1366,768],[1024,768],[390,844],[375,667],[320,568]]){
   await p.setViewportSize({width,height});await p.waitForTimeout(90);const m=await measure();assert.equal(m.scrollWidth,width);if(width>=900)assert.equal(m.root,width);metrics.push({view:'map',...m});
   if(width===1440)await shot('desktop-map');if(width===390)await shot('mobile-map');
  }
  await p.setViewportSize({width:1440,height:900});await p.locator('[data-main="0"]').click();assert(await p.locator('.desktop-guide').isVisible());
  await p.locator('#tiles [data-at="5"]').click();await p.locator('.reveal-char').waitFor();assert.equal(await p.locator('.reveal-char').innerText(),'休');await p.locator('[data-action="continue"]').click();await idle();
  await p.locator('#undo').click();assert.equal(await p.locator('#moves').innerText(),'0');
  // Use a valid unlocked level-three fixture to inspect the taller board without replaying unchanged gameplay.
  await p.evaluate(()=>{const C=KanjiCourse;localStorage.setItem('kanji-pop-n5-v1',JSON.stringify({course:C.id,state:KanjiN5.fresh(2,1236),profile:{collected:C.ids.slice(0,6),results:{0:{stars:3,moves:12},1:{stars:3,moves:7}}},history:[],undos:3,view:'play',sound:false}));});await p.reload();await p.locator('#tiles button').first().waitFor();
  const boardBefore=await p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-n5-v1')).state.board);
  for(const [width,height] of [[1440,900],[1366,768],[1024,768],[900,700],[768,1024],[390,844],[375,667],[320,568]]){
   await p.setViewportSize({width,height});await p.waitForTimeout(100);const m=await measure();assert.equal(m.scrollWidth,width);metrics.push({view:'play',...m});
   const tiles=await p.locator('#tiles button').evaluateAll(ts=>ts.map(t=>({x:t.getBoundingClientRect().x,y:t.getBoundingClientRect().y,w:t.getBoundingClientRect().width,h:t.getBoundingClientRect().height})));
   assert.equal(tiles.length,14);assert(tiles.every(t=>t.w>=44&&t.h>=44));
   for(let i=0;i<tiles.length;i++)for(let j=i+1;j<tiles.length;j++){const a=tiles[i],b=tiles[j];assert(a.x+a.w<=b.x+.1||b.x+b.w<=a.x+.1||a.y+a.h<=b.y+.1||b.y+b.h<=a.y+.1);}
   if(width>=900){const summary=await p.locator('.play-summary').boundingBox(),stage=await p.locator('.play-stage').boundingBox();assert(summary.x+summary.width<stage.x);}
   if(width===1440)await shot('desktop-play');if(width===390)await shot('mobile-play');if(width===375)await shot('small-mobile-play');
  }
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-n5-v1')).state.board),boardBefore);
  await p.setViewportSize({width:390,height:844});await p.locator('#hint').click();await idle();await p.locator('.hinted').click();await idle();if(await p.locator('[data-action="continue"]').count()){await p.locator('[data-action="continue"]').click();await idle();}assert.equal(await p.locator('#moves').innerText(),'1');
  await p.locator('#nav-album').click();assert.equal(await p.locator('.album-card').count(),24);
  for(const [width,height] of [[1440,900],[1024,768],[390,844],[320,568]]){
   await p.setViewportSize({width,height});await p.waitForTimeout(80);const m=await measure();assert.equal(m.scrollWidth,width);metrics.push({view:'album',...m});if(width===1440)await shot('desktop-album');
  }
  await p.locator('[data-card="休"]').click();const modal=await p.locator('.kp-modal').boundingBox();assert(modal.x>=0&&modal.x+modal.width<=320);await p.locator('[data-action="close"]').click();
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'PASS',metrics,checks:['full-width desktop','side-by-side gameplay','compact mobile','no horizontal scroll','44px minimum tiles','no tile overlaps','stable board after resize','mouse move and reveal','undo','hint interaction after resize','album and modal'],errors}));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
