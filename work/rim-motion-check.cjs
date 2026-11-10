const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
const p=await b.newPage({viewport:{width:1100,height:240}});await p.goto('http://127.0.0.1:8765/');
const styles=await p.locator('link[rel=stylesheet]').evaluateAll(es=>es.map(e=>e.href));
await p.setContent('<html><head>'+styles.map(h=>'<link rel="stylesheet" href="'+h+'">').join('')+'</head><body><main id="kanji-pop" style="display:flex;gap:12px;padding:24px;background:#080e24;width:1100px;min-height:240px"></main></body></html>');
await p.addScriptTag({url:'http://127.0.0.1:8765/gem-art.js'});
await p.evaluate(()=>KanjiGemArt.cuts.forEach((cut,i)=>{const pair=KanjiGemArt.assignment.indexOf(i),el=document.createElement('button');el.className='board-tile objective-anchor';el.dataset.gem='true';el.dataset.pair=pair;el.style.cssText='position:relative;width:130px;height:130px;flex:none;--gem-glyph-size:30px;--gem-label-y:'+cut.labelY+'%';el.innerHTML=KanjiGemArt.render(pair,'rim')+'<span class="tile-glyph">田</span><span class="objective-halo">'+KanjiGemArt.focus(pair)+'</span>';document.querySelector('#kanji-pop').append(el);}));
const results=await p.evaluate(()=>[...document.querySelectorAll('.objective-fx')].map((svg,i)=>{
 const g=svg.querySelector('.ribbon-dust-motion'),a=g.getAnimations()[0],points=[];
 const cut=KanjiGemArt.cuts[i],dist=(p,u,v)=>{const dx=v[0]-u[0],dy=v[1]-u[1],t=Math.max(0,Math.min(1,((p.x-u[0])*dx+(p.y-u[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-u[0]-t*dx,p.y-u[1]-t*dy);};
 a.pause();const duration=a.effect.getTiming().duration;
 for(let t=0;t<16;t++){a.currentTime=t*duration/16;const m=svg.getCTM().inverse().multiply(g.getCTM()),point={x:m.e,y:m.f};points.push({...point,edgeDistance:Math.min(...cut.outer.map((v,j)=>dist(point,v,cut.outer[(j+1)%cut.outer.length])))});}
 const band=svg.querySelector('.ribbon-body'),motion=band.getAnimations()[0];motion.pause();motion.currentTime=0;const before=getComputedStyle(band).strokeDashoffset;motion.currentTime=1200;return {cut:svg.dataset.focusCut,path:getComputedStyle(g).offsetPath,points,before,after:getComputedStyle(band).strokeDashoffset,colors:[...svg.querySelectorAll('.ribbon-body')].map(e=>getComputedStyle(e).stroke)};
}));
assert.equal(new Set(results.map(r=>r.path)).size,7);
for(const r of results){assert.notEqual(r.before,r.after);assert.equal(new Set(r.colors).size,3);assert(new Set(r.points.map(p=>p.x.toFixed(1)+','+p.y.toFixed(1))).size>=12,r.cut+' must travel');assert(r.points.every(p=>p.edgeDistance<4),r.cut+' follows its bevel: '+JSON.stringify(r.points));}
await p.screenshot({path:__dirname+'/rim-motion-seven-cuts.png'});
await p.evaluate(()=>document.querySelector('#kanji-pop').dataset.markerQuality='light');assert(await p.locator('.ribbon-dust-motion').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
await p.emulateMedia({reducedMotion:'reduce'});assert(await p.locator('.ribbon-dust-motion').evaluateAll(es=>es.every(e=>getComputedStyle(e).display==='none')));
console.log('7 unique cuts, 16 motion phases each: particles stay within 4 SVG units of bevel; light/reduced-motion PASS');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
