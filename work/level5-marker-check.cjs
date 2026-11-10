const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const width of [476,390,320,1440]){
 const p=await browser.newPage({viewport:{width,height:width===1440?900:887}});await p.goto('http://127.0.0.1:8765/');
 await p.evaluate(()=>{
  const E=KanjiN5,s=E.fresh(4,1234,innerWidth>=900?'desktop':'mobile');
  s.found=['休','男','分'];s.score=500;s.matches=5;s.moves=61;
  const at=s.board.findIndex(t=>t?.recipe==='名'&&t.side===0),to=10;[s.board[to],s.board[at]]=[s.board[at],s.board[to]];
  if(!E.valid(s))throw Error('Invalid fixture');const profile={collected:E.C.ids.slice(0,8),results:Object.fromEntries([0,1,2,3].map(id=>[id,{stars:3,moves:30,score:400}]))};
  localStorage.setItem('kanji-pop-n5-v1',JSON.stringify({course:E.C.id,state:s,profile,history:[],undos:2,view:'play',sound:false}));
 });
 await p.reload();if(await p.locator('[data-action="begin-level"]').isVisible())await p.locator('[data-action="begin-level"]').click();
 await p.evaluate(()=>document.fonts.ready);
 const a=p.locator('.objective-anchor');assert.equal(await a.count(),1);assert.equal(await a.getAttribute('data-recipe'),'名');
 for(const quality of ['full','light']){
  await p.evaluate(q=>document.querySelector('#kanji-pop').dataset.markerQuality=q,quality);
  assert.equal(await p.locator('#tiles .objective-pointer').count(),0);
  await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));assert.equal(await a.locator('canvas.objective-fx').count(),1);
  const before=await a.locator('canvas').evaluate(c=>c.toDataURL());await p.waitForTimeout(240);const after=await a.locator('canvas').evaluate(c=>c.toDataURL());assert.notEqual(before,after);
  assert(await p.locator('.board-tile:not(.objective-anchor) .jewel-art').evaluateAll(es=>es.every(e=>!e.getAnimations().length)));
 }
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await a.locator('.jewel-art').evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.equal(await p.evaluate(()=>KanjiTargetVFX.state.animated),false);assert.equal(await a.locator('canvas').getAttribute('data-asset'),'ready');
 const id=await a.getAttribute('data-id');await p.reload();assert.equal(await p.locator('.objective-anchor').getAttribute('data-id'),id);assert.equal(await p.locator('#tiles .objective-pointer').count(),0);
 await p.emulateMedia({reducedMotion:'no-preference'});
 console.log(width,'level 5 / 3 of 8 / pink target: no pointer, hybrid sprite/core/fluid, full/light/reduced motion, reload PASS');
 await p.screenshot({path:__dirname+'/level5-marker-'+width+'.png'});await p.close();
 }
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

