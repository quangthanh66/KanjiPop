const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const p=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
  p.on('pageerror',e=>errors.push(e.message));
  await p.goto('http://127.0.0.1:8765/');
  const styles=await p.locator('link[rel=stylesheet]').evaluateAll(es=>es.map(e=>e.href));
  await p.goto('http://127.0.0.1:8765/focus-preview-qa.html');
  await p.setContent('<html><head>'+styles.map(h=>'<link rel="stylesheet" href="'+h+'">').join('')+'</head><body><main id="kanji-pop"></main></body></html>');
  await p.addScriptTag({url:'http://127.0.0.1:8765/gem-art.js'});
  await p.addScriptTag({url:'http://127.0.0.1:8765/fusion-fx.js'});
  await p.evaluate(()=>{
   const root=document.querySelector('#kanji-pop');root.dataset.markerQuality='full';
   root.style.cssText='display:grid;grid-template-columns:repeat(8,140px);gap:28px;padding:28px;background:#080e24;color:white';
   root.innerHTML=Array.from({length:24},(_,pair)=>{
    const cut=KanjiGemArt.cutFor(pair);
    return '<div style="height:190px;text-align:center"><button class="board-tile objective-anchor" data-pair="'+pair+'" data-gem="true" style="position:relative;inset:auto;width:140px;height:140px;--gem-glyph-size:38px;--gem-label-y:'+cut.labelY+'%">'+KanjiGemArt.render(pair,'element-preview')+'<span class="tile-glyph">田</span><span class="objective-halo">'+KanjiGemArt.focus(pair)+'</span></button><p>'+pair+'</p></div>';
   }).join('');
  });
  await p.waitForLoadState('networkidle');
  const samples=await p.locator('.objective-fx').evaluateAll(els=>els.map(el=>({element:el.dataset.focusElement,motifs:el.querySelectorAll('.ribbon-body').length,color:getComputedStyle(el).getPropertyValue('--focus-color').trim(),animations:el.querySelector('.ribbon-body')?.getAnimations().length||0})));
  assert.equal(samples.length,24);assert.equal(new Set(samples.map(s=>s.element)).size,7);
  assert.equal(samples[0].element,'thunder');assert.equal(samples[1].element,'magic');assert.equal(samples[6].element,'water');
  assert(samples.every(s=>s.color&&s.motifs===3&&s.animations));
  const materials=await p.locator('.objective-fx').evaluateAll(els=>els.map(el=>{
   const g=el.querySelector('.element-motion'),anim=g.getAnimations()[0];anim.pause();anim.currentTime=0;const start=g.getCTM();anim.currentTime=1100;const end=g.getCTM();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const c=canvas.getContext('2d');
   const hue=value=>{c.clearRect(0,0,1,1);c.fillStyle=value;c.fillRect(0,0,1,1);const [r,g,b]=c.getImageData(0,0,1,1).data,min=Math.min(r,g,b),span=Math.max(r,g,b)-min;return span<3?null:[r,g,b].map(v=>(v-min)/span);};
   const base=hue(getComputedStyle(el).getPropertyValue('--focus-color'));
   const tones=[...el.querySelectorAll('.ribbon-body')].map(e=>hue(getComputedStyle(e).stroke));
   return {kind:el.dataset.focusElement,details:el.querySelector('.element-material').innerHTML,count:el.querySelectorAll('.element-motion').length,moved:Math.hypot(end.e-start.e,end.f-start.f),toneError:base?Math.max(...tones.filter(Boolean).flatMap(t=>t.map((v,i)=>Math.abs(v-base[i])))):0};
  }));
  assert.equal(new Set(materials.map(m=>m.details)).size,7,'each element needs distinct material artwork');
  assert(materials.every(m=>m.count===3&&m.moved>5&&m.toneError<.04),'materials circulate and retain the gem hue');
  const fusionThemes=await p.evaluate(()=>Array.from({length:24},(_,pair)=>KanjiFusion.play({pair,sequence:99,themeId:'fireworks',reduced:true}).theme.id));
  samples.forEach((sample,pair)=>assert.equal(fusionThemes[pair],sample.element==='thunder'?'lightning':sample.element));
  await p.screenshot({path:__dirname+'/element-focus-all.png',fullPage:true});
  await p.evaluate(()=>document.querySelector('#kanji-pop').dataset.markerQuality='light');
  assert(await p.locator('.ribbon-dust-motion').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
  await p.evaluate(()=>document.querySelector('#kanji-pop').dataset.markerQuality='full');
  await p.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await p.locator('.element-motion').count(),72);
  assert(await p.locator('.element-motion').evaluateAll(es=>es.every(e=>getComputedStyle(e).animationName==='none')));
  assert.deepEqual(errors,[]);
  console.log('24 palettes, 7 fusion elements, circulating ribbons, bounded particles, light/reduced-motion and no JS errors PASS');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
