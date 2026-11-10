const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8765/');
 await p.evaluate(()=>{const E=KanjiN5,s=E.fresh(4,1234,'mobile');s.found=['休','男','分'];s.score=500;s.matches=5;s.moves=61;const at=s.board.findIndex(t=>t?.recipe==='名'&&t.side===0);[s.board[10],s.board[at]]=[s.board[at],s.board[10]];const profile={collected:E.C.ids.slice(0,8),results:Object.fromEntries([0,1,2,3].map(id=>[id,{stars:3,moves:30,score:400}]))};localStorage.setItem('kanji-pop-n5-v1',JSON.stringify({course:E.C.id,state:s,profile,history:[],undos:2,view:'play',sound:false}));});
 await p.reload();if(await p.locator('[data-action="begin-level"]').isVisible())await p.locator('[data-action="begin-level"]').click();
 await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));await p.waitForTimeout(900);
 assert.equal(await p.locator('#tiles .objective-anchor').count(),1);assert.equal(await p.locator('#tiles .objective-fx').count(),1);assert.equal(await p.locator('#tiles .objective-pointer').count(),0);
 console.log('initial',await p.evaluate(()=>KanjiTargetVFX.state));await p.screenshot({path:__dirname+'/hybrid-mobile.png'});
 const original=await p.locator('.objective-anchor').getAttribute('data-id');
 for(const width of [320,390,1440]){await p.setViewportSize({width,height:width===1440?900:844});await p.waitForTimeout(350);assert.equal(await p.locator('.objective-anchor').count(),1);await p.screenshot({path:__dirname+'/hybrid-'+width+'.png'});}
 await p.reload();await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));assert.equal(await p.locator('.objective-anchor').getAttribute('data-id'),original);
 await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(150);const count=await p.evaluate(()=>KanjiTargetVFX.state.paintCount);await p.waitForTimeout(250);assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.paintCount),count);assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.animated),false);await p.emulateMedia({reducedMotion:'no-preference'});
 await p.locator('#help').click();await p.waitForTimeout(120);assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.active),0);assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.animated),false);await p.keyboard.press('Escape');
 await p.reload();await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));
 // Exercise every production palette/cut/element through the actual marker renderer.
 const samples=[];
 for(let pair=0;pair<24;pair++){
  await p.evaluate(pair=>{const el=document.querySelector('.objective-anchor');el.dataset.pair=pair;el.querySelector('.objective-halo').innerHTML=KanjiGemArt.focus(pair);},pair);
  await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));
  await p.waitForTimeout(90);
  const info=await p.evaluate(()=>{const c=document.querySelector('.objective-fx'),pixels=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>20)visible++;return {...KanjiTargetVFX.state,visible,css:getComputedStyle(c).getPropertyValue('--tile-mid').trim()};});
  assert(info.visible>300);assert.equal(info.instances,1);assert.equal(info.markers[0].pair,pair);assert(info.tintCache<=4);samples.push({pair,...info.markers[0],visible:info.visible,cost:info.lastCost});
  if([0,1,2,4,5,11,12].includes(pair))await p.locator('.objective-anchor').screenshot({path:__dirname+'/hybrid-element-'+info.markers[0].element+'.png'});
 }
 assert.equal(new Set(samples.map(s=>s.element)).size,7);assert.equal(new Set(samples.map(s=>s.cut)).size,7);assert.equal(new Set(samples.map(s=>s.rgb.join(','))).size,24);
 for(const quality of ['light','full']){await p.evaluate(q=>{const r=document.querySelector('#kanji-pop');r.dataset.quality=q;r.dataset.markerQuality=q;},quality);await p.waitForTimeout(200);assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.markers[0].light),quality==='light');}
 console.log('24 palettes / 7 cuts / 7 elements',JSON.stringify(samples));assert.deepEqual(errors,[]);console.log('PASS: production, resize, reload, reduced motion, modal pause, cache bounds, full/light');
 await p.close();
 const fallback=await browser.newPage();await fallback.route('**/*ribbon-atlas.webp',r=>r.abort());await fallback.route('**/target-vfx-assets/*',r=>r.abort());await fallback.goto('http://127.0.0.1:8765/');await fallback.evaluate(()=>{document.querySelector('#kanji-pop').insertAdjacentHTML('beforeend','<div class="board-tile objective-anchor" style="position:relative;width:100px;height:100px;--tile-mid:#9855e8"><span class="objective-halo">'+KanjiGemArt.focus(1)+'</span></div>');});await fallback.waitForSelector('[data-asset="fallback"]');assert.equal(await fallback.evaluate(()=>KanjiTargetVFX.state.markers[0].paints>0),true);console.log('PASS: failed atlas retains core + energy marker');await fallback.close();
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
