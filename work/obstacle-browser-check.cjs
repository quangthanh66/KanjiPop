const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'),assert=require('node:assert/strict'),O=require('./kanji-pop-site/dist/n5-legacy-v9.js');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const old=O.fresh(0,1234,'mobile'),fixture={course:O.C.id,state:old,profile:{collected:[],results:{}},history:[],undos:3,view:'play',sound:false};
 const p=await b.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(v=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem('kanji-pop-n5-v1',JSON.stringify(v));sessionStorage.setItem('seeded','1');}},fixture);
 await p.goto('http://127.0.0.1:8765/');await p.locator('.board-cells .obstacle').first().waitFor();
 const read=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('kanji-pop-n5-v1')));
 const migrated=await read();assert.equal(migrated.state.version,10);assert.equal(migrated.state.rows,8);assert.equal(await p.locator('.board-cells .obstacle').count(),3);assert.deepEqual(migrated.profile,fixture.profile);
 await p.setViewportSize({width:1440,height:900});await p.waitForFunction(()=>document.querySelector('#slide-board').dataset.cols==='8');assert.equal((await read()).state.rows,5);
 await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>document.querySelector('#slide-board').dataset.cols==='5');assert.deepEqual((await read()).state.board,migrated.state.board);
 await p.reload();await p.locator('.board-cells .obstacle').first().waitFor();assert.deepEqual((await read()).state.board,migrated.state.board);
 await p.close();const small=await b.newPage({viewport:{width:320,height:568}});await small.goto('http://127.0.0.1:8765/');await small.locator('[data-main="0"]').click();const button=small.locator('[data-action="begin-level"]');await button.waitFor();const box=await button.boundingBox();assert(box.y>=0&&box.y+box.height<=568);await small.screenshot({path:__dirname+'/obstacle-intro-320.png'});assert.deepEqual(errors,[]);console.log('Browser migration, resize round-trip, reload, 320px onboarding PASS');
 }finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});

