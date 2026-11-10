const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),E=require('./kanji-pop-site/dist/n5-engine.js');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/kanji-pop-site/dist/course-plans.js','utf8'),ctx);
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
for(const [width,height] of [[1440,900],[390,844],[320,568]]){
 const mode=width>=900?'desktop':'mobile',c=await b.newContext({viewport:{width,height},reducedMotion:'reduce'}),p=await c.newPage(),external=[];p.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8765')&&!r.url().startsWith('data:'))external.push(r.url());});
 for(const id of ['本','白','国','休']){
  const level=E.C.levels.find(l=>l.newChars.includes(id)).id,plan=ctx.window.KanjiCoursePlans.modes[mode][level];let s=E.fresh(level,plan.seed,mode);for(const h of plan.route){const r=E.move(s,h.at,h.dir);s=r.state;if(s.pending?.recipe===id)break;if(s.pending)s=E.resume(s);}assert.equal(s.pending.recipe,id);s.pending.guided=true;
  const results={};for(let i=0;i<level;i++)results[i]={stars:1,moves:99};const payload={course:E.C.id,state:s,profile:{collected:E.C.ids,results},history:[],undos:3,view:'play',sound:false};
  await p.goto('http://127.0.0.1:8765/');await p.evaluate(payload=>localStorage.setItem('kanji-pop-n5-v1',JSON.stringify(payload)),payload);await p.reload();await p.locator('.cinematic-reveal').waitFor();await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(100);
  assert((await p.locator('.example-label').innerText()).includes('cách đọc của từ'));const fit=await p.locator('.cinematic-reveal').evaluate(el=>({h:el.clientHeight,s:el.scrollHeight,width:el.clientWidth,sw:el.scrollWidth,body:document.documentElement.scrollWidth,viewport:innerWidth}));assert(fit.s<=fit.h+2&&fit.sw<=fit.width+2&&fit.body<=fit.viewport+2,JSON.stringify({id,width,fit}));if(id==='白')await p.screenshot({path:__dirname+'/content-white-'+width+'.png'});
 }
 assert.deepEqual(external,[]);await c.close();console.log(width+'px: long authored notes, whole-word reading label, no modal overflow, no external requests PASS');
}
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
