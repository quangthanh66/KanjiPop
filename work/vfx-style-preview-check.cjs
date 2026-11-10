const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const [width,height] of [[1440,1100],[390,844],[320,700]]){
  const p=await b.newPage({viewport:{width,height}}),errors=[],remote=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765/')&&!r.url().startsWith('data:'))remote.push(r.url());});
  await p.goto('http://127.0.0.1:8765/vfx-style-preview.html');await p.waitForFunction(()=>window.KanjiVfxStudy?.state.assetReady);await p.evaluate(()=>document.fonts.ready);
  assert.deepEqual(await p.evaluate(()=>KanjiVfxStudy.state.visible),width>760?[0,1,2,3,4]:[4]);
  assert.equal(await p.locator('.demo-board').count(),5);assert.equal(await p.locator('.target').count(),5);
  const boards=await p.locator('.demo-board').evaluateAll(es=>es.map(e=>[...e.querySelectorAll('.demo-cell')].map(c=>c.dataset.id||'blank').join(',')));assert.equal(new Set(boards).size,1,'same board across all variants');
  const before=await p.evaluate(()=>KanjiVfxStudy.state.time);await p.waitForTimeout(350);assert(await p.evaluate(()=>KanjiVfxStudy.state.time)>before);
  await p.locator('#play-toggle').click();const stopped=await p.evaluate(()=>KanjiVfxStudy.state.time);await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.time),stopped);
  await p.locator('#speed').selectOption('0.5');assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.speed),.5);
  await p.screenshot({path:__dirname+'/vfx-study-'+width+'.png',fullPage:true});
  await p.locator('#zoom-toggle').click();assert(await p.evaluate(()=>KanjiVfxStudy.state.zoom));
  for(let i=0;i<5;i++){
   if(width<=760)await p.locator('[data-tab="'+i+'"]').click();
   const canvas=p.locator('[data-variant="'+i+'"] canvas');const pixels=await canvas.evaluate(el=>{const d=el.getContext('2d').getImageData(0,0,el.width,el.height).data;let count=0;for(let j=3;j<d.length;j+=4)if(d[j]>20)count++;return count;});assert(pixels>50,'visible VFX '+i);
   if(width<=760)await p.screenshot({path:__dirname+'/vfx-study-zoom-'+width+'-'+i+'.png',fullPage:true});
  }
  if(width>760)await p.screenshot({path:__dirname+'/vfx-study-zoom-desktop.png',fullPage:true});
  await p.locator('#zoom-toggle').click();for(let i=0;i<4;i++)await p.locator('#position-toggle').click();assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.positionIndex),4);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal scroll');
  await p.evaluate(()=>localStorage.setItem('kanji-pop-n5-v1','preserve-existing-game-progress'));
  if(width<=760)await p.locator('[data-tab="4"]').click();await p.locator('[data-choose="4"]').click();assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.chosen),4);await p.reload();await p.waitForFunction(()=>window.KanjiVfxStudy?.state.assetReady);assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.chosen),4);assert.equal(await p.evaluate(()=>localStorage.getItem('kanji-pop-n5-v1')),'preserve-existing-game-progress');
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);console.log(width,'same board, 5 visible VFX, playback/slow/pause, zoom, corners, choice persisted, gameplay untouched, local-only PASS');await p.close();
 }
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:8765/vfx-style-preview.html');await p.waitForFunction(()=>window.KanjiVfxStudy?.state.assetReady);assert(await p.evaluate(()=>KanjiVfxStudy.state.paused));assert.equal(await p.evaluate(()=>KanjiVfxStudy.state.time),0);console.log('reduced motion: paused by default PASS');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
