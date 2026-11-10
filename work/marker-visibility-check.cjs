const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const E=require('./kanji-pop-site/dist/n5-engine.js');
const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/kanji-pop-site/dist/course-plans.js','utf8'),ctx);
let steps=0,refills=0;
for(const [mode,plans] of Object.entries(ctx.window.KanjiCoursePlans.modes))for(const [level,plan] of plans.entries()){
 let s=E.fresh(level,plan.seed,mode);
 const check=()=>{if(s.status==='playing'&&!s.pending&&!E.complete(s)){
  const a=E.targetAnchor(s);assert(a,'missing anchor: '+mode+' level '+level);
  assert.equal(a.recipe,E.currentTarget(s));assert.equal(s.board.filter(t=>t?.recipe===a.recipe).length,2);
 }};
 check();for(const move of plan.route){s=E.move(s,move.at,move.dir).state;check();steps++;
  if(s.pending){s=E.resume(s);refills++;check();}
 }
}
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 const p=await b.newPage({viewport:{width:390,height:844}});await p.goto('http://127.0.0.1:8765/');
 const styles=await p.locator('link[rel=stylesheet]').evaluateAll(es=>es.map(e=>e.href));
 await p.setContent('<html><head>'+styles.map(h=>'<link rel="stylesheet" href="'+h+'">').join('')+'</head><body><main id="kanji-pop" style="display:flex;flex-wrap:wrap;background:#080e24;padding:12px"></main></body></html>');
 await p.addScriptTag({url:'http://127.0.0.1:8765/gem-art.js'});
 await p.evaluate(()=>{const root=document.querySelector('#kanji-pop');for(let pair=0;pair<24;pair++){
  const t=document.createElement('button');t.className='board-tile objective-anchor';t.dataset.pair=pair;t.dataset.gem='true';t.style.cssText='position:relative;width:70px;height:70px;margin:7px';
  t.innerHTML=KanjiGemArt.render(pair,'visibility')+'<span class="objective-halo">'+KanjiGemArt.focus(pair)+'</span>';root.append(t);
 }});
 for(const quality of ['full','light']){
  await p.evaluate(q=>document.querySelector('#kanji-pop').dataset.markerQuality=q,quality);
  const failures=await p.evaluate(()=>{
   const failures=[],tiles=[...document.querySelectorAll('.objective-anchor')];
   const visible=el=>{for(let n=el;n instanceof Element;n=n.parentElement)if(getComputedStyle(n).display==='none')return false;return +getComputedStyle(el).opacity>=.65;};
   const animations=tiles.flatMap(el=>el.getAnimations({subtree:true}));animations.forEach(a=>a.pause());
   // Sample a full minute without wall-clock waits, including all staggered phases.
   for(let t=0;t<=60000;t+=125){animations.forEach(a=>a.currentTime=t);
    for(const tile of tiles)if([...tile.querySelectorAll('.ribbon-body')].filter(visible).length<3)failures.push({pair:tile.dataset.pair,t});
   }
   return failures.slice(0,5);
  });assert.deepEqual(failures,[],quality+' must keep visible target cues throughout the animation');
 }
 await p.emulateMedia({reducedMotion:'reduce'});
 assert(await p.locator('.ribbon-body').evaluateAll(es=>es.every(e=>+getComputedStyle(e).opacity>=.65&&getComputedStyle(e).animationName==='none')));
 await p.screenshot({path:__dirname+'/marker-visibility-390.png',fullPage:true});
 console.log({steps,refills,palettes:24,visibility:'60s full/light + reduced motion PASS'});
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
