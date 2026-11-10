const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {pathToFileURL}=require('node:url');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});try{
 for(const [width,height] of [[1440,900],[390,844],[320,568],[844,390]]){
  const p=await b.newPage({viewport:{width,height}}),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8765/');await p.locator('[data-main="0"]').click();
  for(let theme=0;theme<8;theme++)for(let corner=0;corner<4;corner++){
   const result=await p.evaluate(({theme,corner})=>{
    const host=document.querySelector('#effects'),w=host.clientWidth,h=host.clientHeight;
    const center={x:corner%2?w-12:12,y:corner<2?12:h-12};
    const raf=window.requestAnimationFrame,caf=window.cancelAnimationFrame;let callback;window.requestAnimationFrame=fn=>(callback=fn,999);window.cancelAnimationFrame=()=>{};
    const fx=KanjiFusion.play({host,center,source:{x:w/2,y:h/2},tier:4,themeId:KanjiFusion.themes[theme].id}),sampleStart=performance.now();for(const sampleTime of [950,1450,2400,3200,4000]){callback(sampleStart+sampleTime);const cv=document.querySelector('.fusion-overlay canvas'),pixels=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let clipped=0;for(let x=0;x<cv.width;x++)for(const y of [0,cv.height-1])if(pixels[(y*cv.width+x)*4+3]>5)clipped++;for(let y=0;y<cv.height;y++)for(const x of [0,cv.width-1])if(pixels[(y*cv.width+x)*4+3]>5)clipped++;if(clipped)throw Error(JSON.stringify({theme,corner,sampleTime,clipped}));}callback(sampleStart+1450);
    window.requestAnimationFrame=raf;window.cancelAnimationFrame=caf;
    const canvas=document.querySelector('.fusion-overlay canvas'),box=canvas.getBoundingClientRect(),pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;let edgePixels=0;
    for(let x=0;x<canvas.width;x++)for(const y of [0,canvas.height-1])if(pixels[(y*canvas.width+x)*4+3]>5)edgePixels++;
    for(let y=0;y<canvas.height;y++)for(const x of [0,canvas.width-1])if(pixels[(y*canvas.width+x)*4+3]>5)edgePixels++;
    window.testFx=fx;return {edgePixels,w:box.width,h:box.height,parent:canvas.parentElement.parentElement.tagName};
   },{theme,corner});
   assert.equal(result.parent,'BODY');assert.equal(result.w,width);assert.equal(result.h,height);assert.equal(result.edgePixels,0,JSON.stringify({width,height,theme,corner,...result}));
   if(corner===0&&[1440,390].includes(width))await p.screenshot({path:__dirname+'/fusion-edge-'+width+'-'+theme+'.png'});
   await p.evaluate(()=>testFx.cancel());assert.equal(await p.locator('.fusion-overlay').count(),0);
  }
  assert.deepEqual(errors,[]);console.log(width,height,'eight themes × four corners, no clipped edge pixels');await p.close();
 }
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
