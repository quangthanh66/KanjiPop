const {chromium}=require('C:/Users/Windows/Downloads/Bomb/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const [width,height,gutter] of [[495,900,false],[495,900,true],[390,844,false],[320,568,false],[810,540,false],[1440,900,false]]){
  const p=await b.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{const f=sessionStorage.getItem('fixture');if(f){localStorage.setItem('kanji-pop-n5-v1',f);sessionStorage.removeItem('fixture');}});
  await p.goto('http://127.0.0.1:8765/');await p.evaluate(()=>{const E=KanjiN5,mode=innerWidth>=900?'desktop':'mobile',s=E.fresh(5,KanjiCoursePlans.modes[mode][5].seed,mode);s.entryGuideSeen=true;sessionStorage.setItem('fixture',JSON.stringify({course:E.C.id,state:s,profile:{collected:E.C.ids,results:Object.fromEntries([0,1,2,3,4].map(id=>[id,{stars:3,moves:30}]))},history:[],undos:3,view:'play',sound:false}));});await p.reload();
  if(gutter)await p.addStyleTag({content:'html{scrollbar-gutter:stable;overflow-y:scroll}'});
  await p.waitForFunction(()=>KanjiTargetVFX.state.markers.some(m=>m.asset));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
  await p.evaluate(()=>{const selectors=['#kanji-pop','#slide-board','.mission-stack','.kp-tools','#kp-home','#kp-sound'];window.layoutSamples=[];window.sampleLayout=()=>({scrollWidth:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth,rects:selectors.map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height];})});window.layoutBaseline=sampleLayout();window.trackLayout=true;const tick=()=>{if(!trackLayout)return;layoutSamples.push(sampleLayout());requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  for(let i=0;i<6;i++){const move=await p.evaluate(i=>{const s=JSON.parse(localStorage.getItem('kanji-pop-n5-v1')).state,m=[];for(let at=0;at<s.board.length;at++)for(const dir of KanjiN5.legalDirections(s,at))if(!KanjiN5.move(s,at,dir).match)m.push({at,dir});return m[i%m.length];},i);assert(move);await p.locator('[data-at="'+move.at+'"]').click();await p.waitForFunction(()=>document.querySelector('#kanji-pop').getAttribute('aria-busy')==='false');await p.waitForTimeout(80);}
  const result=await p.evaluate(()=>{trackLayout=false;return {baseline:layoutBaseline,samples:layoutSamples,cols:document.querySelector('#slide-board').style.getPropertyValue('--cols'),rows:document.querySelector('#slide-board').style.getPropertyValue('--rows')};});
  for(const s of result.samples){assert(s.scrollWidth<=s.viewport+1,'horizontal overflow');s.rects.forEach((r,i)=>r.forEach((v,j)=>assert(Math.abs(v-result.baseline.rects[i][j])<.6,`${width}x${height} element ${i} coordinate ${j} shifted`)));}
  assert.equal(result.cols,width>=900?'7':'5');assert.equal(result.rows,width>=900?'5':'7');assert.deepEqual(errors,[]);
  await p.screenshot({path:__dirname+`/layout-stable-${width}${gutter?'-gutter':''}.png`});console.log(`${width}x${height}${gutter?' reserved scrollbar':''}: ${result.samples.length} frames, 6 moves, stable HUD/board/buttons, no horizontal overflow`);await p.close();
 }
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

