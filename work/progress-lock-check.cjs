const assert=require('node:assert/strict'),fs=require('node:fs');
const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {create}=require('./kanji-pop-site/dist/progress-lock.js');
const E=require('./kanji-pop-site/dist/n5-engine.js'),{create:store}=require('./kanji-pop-site/dist/progress-store.js');
const fresh=()=>({course:E.C.id,state:E.fresh(0,1234,'mobile'),profile:{collected:[],results:{}},history:[],undos:3,view:'map',sound:false});
const html=`<!doctype html><html lang="vi"><meta charset="utf-8"><title>Writer lock QA harness</title><h1>Writer lock QA harness</h1><p id="status">Loading</p><button id="write">Toggle saved sound</button><button id="export">Export snapshot</button><pre id="result"></pre><script src="/n5-data.js"></script><script src="/n5-engine.js"></script><script src="/progress-store.js"></script><script src="/progress-lock.js"></script><script>
window.qaReady=(async()=>{
const key=new URL(location).searchParams.get('key');window.lock=KanjiProgressLock.create({key});await lock.acquire();window.notes=[];
window.store=KanjiProgress.create(localStorage,KanjiN5,()=> 'mobile',x=>notes.push(x),{key,canWrite:()=>lock.canWrite()});
window.snapshot=store.read()||{course:KanjiN5.C.id,state:KanjiN5.fresh(0,1234,'mobile'),profile:{collected:[],results:{}},history:[],undos:3,view:'map',sound:false};
document.querySelector('#status').textContent=lock.reason();
document.querySelector('#write').onclick=()=>{snapshot.sound=!snapshot.sound;document.querySelector('#result').textContent=String(store.write(snapshot));};
document.querySelector('#export').onclick=()=>document.querySelector('#result').textContent=store.pack(snapshot);
addEventListener('pagehide',()=>lock.release());return lock.canWrite();
})();</script></html>`;
(async()=>{
 const unsupported=create({locks:null});assert.equal(await unsupported.acquire(),false);assert.equal(unsupported.reason(),'unsupported');
 const thrown=create({locks:{request(){throw Error('denied');}}});assert.equal(await thrown.acquire(),false);assert.equal(thrown.reason(),'error');
 const rejected=create({locks:{request(){return Promise.reject(Error('denied'));}}});assert.equal(await rejected.acquire(),false);
 const data=new Map([['test','{damaged']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},ro=store(storage,E,()=> 'mobile',()=>{},{key:'test',canWrite:()=>false});
 assert.equal(ro.read(),null);assert.equal(data.size,1,'read-only recovery must not write quarantine');assert.equal(ro.write(fresh()),false);assert.equal(ro.restore(fresh()),false);assert(ro.decode(ro.pack(fresh())));
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const checks=[];
 try{
  const context=await browser.newContext();await context.route('**/__lock-qa__?*',route=>route.fulfill({contentType:'text/html',body:html}));
  const url=key=>'http://127.0.0.1:8765/__lock-qa__?key='+encodeURIComponent(key);
  const pair=await Promise.all([context.newPage(),context.newPage()]);await Promise.all(pair.map(p=>p.goto(url('isolated-lock-qa'))));
  const owns=await Promise.all(pair.map(p=>p.evaluate(()=>qaReady)));assert.equal(owns.filter(Boolean).length,1);
  const writer=pair[owns.indexOf(true)],reader=pair[owns.indexOf(false)];await writer.locator('#write').click();assert.equal(await writer.locator('#result').textContent(),'true');
  const baseline=await writer.evaluate(()=>localStorage.getItem('isolated-lock-qa'));await reader.locator('#write').click();assert.equal(await reader.locator('#result').textContent(),'false');assert.equal(await reader.evaluate(()=>store.restore(snapshot)),false);assert.equal(await reader.evaluate(()=>localStorage.getItem('isolated-lock-qa')),baseline);
  await reader.locator('#export').click();assert.equal(JSON.parse(await reader.locator('#result').textContent()).format,'kanji-pop-progress');await reader.screenshot({path:__dirname+'/progress-lock-readonly.png'});checks.push('simultaneous acquire: exactly one writer; readonly write/import rejected; export allowed');
  await writer.close();assert.equal(await reader.evaluate(()=>lock.canWrite()),false,'no stale automatic takeover');await reader.reload();assert.equal(await reader.evaluate(()=>qaReady),true);assert.equal(await reader.evaluate(()=>snapshot.sound),true,'new writer loads latest snapshot');await reader.locator('#write').click();assert.equal(await reader.locator('#result').textContent(),'true');checks.push('owner close: explicit reload acquires lock and reads latest snapshot');
  await reader.reload();assert.equal(await reader.evaluate(()=>qaReady),true);assert.equal(await reader.evaluate(()=>snapshot.sound),false);checks.push('owner reload releases and reacquires without losing persisted state');
  const separate=await context.newPage();await separate.goto(url('isolated-other-profile'));assert.equal(await separate.evaluate(()=>qaReady),true);checks.push('different save keys have independent locks');
  const fallback=await separate.evaluate(async()=>{const denied=KanjiProgressLock.create({key:'denied',locks:null});await denied.acquire();const s=KanjiProgress.create(localStorage,KanjiN5,()=> 'mobile',()=>{},{key:'denied',canWrite:()=>denied.canWrite()});s.read();return {reason:denied.reason(),write:s.write(snapshot),payload:s.pack(snapshot),stored:localStorage.getItem('denied'),unguarded:KanjiProgress.create(localStorage,KanjiN5,()=> 'mobile').write(snapshot)};});assert.equal(fallback.reason,'unsupported');assert.equal(fallback.write,false);assert.equal(fallback.stored,null);assert.equal(fallback.unguarded,false);assert.equal(JSON.parse(fallback.payload).format,'kanji-pop-progress');checks.push('unsupported API and missing guard fail closed; manual export still works');
  for(let n=0;n<10;n++){const race=await Promise.all([context.newPage(),context.newPage()]);await Promise.all(race.map(p=>p.goto(url('race-'+n))));const flags=await Promise.all(race.map(p=>p.evaluate(()=>qaReady)));assert.equal(flags.filter(Boolean).length,1);await Promise.all(race.map(p=>p.close()));}checks.push('ten additional simultaneous two-tab starts: exactly one writer each');
  await context.close();
 }finally{await browser.close();}
 const report={at:new Date().toISOString(),scope:'Isolated Chromium browser context and local harness; tests real browser Web Locks and production lock/store modules. Main game integration reviewed separately by parent.',checks,remaining:['Real iOS/Android device lifecycle not tested.','Older app tabs that do not cooperate with Web Locks can still write; existing compare-observed guard remains.','Browser data deletion and manual devtools edits remain outside locking guarantees.']};
 fs.writeFileSync(__dirname+'/kanji-pop-site/progress-lock-results.json',JSON.stringify(report,null,2));console.log(report);
})().catch(e=>{console.error(e);process.exitCode=1;});
