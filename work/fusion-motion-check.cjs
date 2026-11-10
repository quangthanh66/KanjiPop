const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{for(const width of [390,1440]){
  const p=await browser.newPage({viewport:{width,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/fusion-motion-preview.html');
  for(const [pair,name] of [[0,'lightning'],[6,'water'],[1,'magic']]){
   await p.locator('nav [data-pair="'+pair+'"]').click();
   assert.equal(await p.locator('.fusion-overlay').getAttribute('data-choreography'),name);
   assert.equal(await p.locator('.fusion-ingredient').count(),2);
   assert.equal(await p.locator('.fusion-result').evaluate(e=>getComputedStyle(e).opacity),'0');
   await p.waitForFunction(()=>document.querySelector('.fusion-overlay')?.dataset.phase==='compress');
   const initial=await p.locator('.fusion-ingredient').evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));
   await p.screenshot({path:__dirname+'/motion-'+width+'-'+name+'-charge.png'});
   await p.waitForFunction(()=>document.querySelector('.fusion-overlay')?.dataset.phase==='impact');
   await p.waitForTimeout(200);
   assert(await p.locator('.fusion-result').evaluate(e=>Number(getComputedStyle(e).opacity)>.9));
   assert(await p.locator('.fusion-ingredient').evaluateAll(es=>es.every(e=>Number(getComputedStyle(e).opacity)<.05)));
   await p.screenshot({path:__dirname+'/motion-'+width+'-'+name+'-impact.png'});
   assert(initial.every(t=>t!=='none'));
   await p.waitForFunction(()=>!document.querySelector('.fusion-overlay'));
   assert.equal(await p.locator('#stage .result-glyph').textContent(),'三');
  }
  await p.emulateMedia({reducedMotion:'reduce'});await p.locator('#replay').click();assert.equal(await p.locator('.fusion-overlay').count(),0);
  assert.deepEqual(errors,[]);console.log(width+'px: three choreographies, pull/compress/impact/result timing, cleanup and reduced motion PASS');await p.close();
 }}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
