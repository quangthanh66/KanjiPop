(()=>{
 const layer=document.getElementById('modal');let queued=false;
 function fit(){queued=false;const modal=layer.querySelector('.cinematic-reveal');if(!modal)return;delete modal.dataset.density;
  const overflow=()=>modal.scrollHeight>modal.clientHeight+1||modal.querySelector('.reveal-stage').clientHeight<64;
  if(overflow())modal.dataset.density='1';if(overflow())modal.dataset.density='2';
 }
 function schedule(){if(!queued){queued=true;requestAnimationFrame(fit);}}
 new MutationObserver(schedule).observe(layer,{childList:true,subtree:true,characterData:true});
 new ResizeObserver(schedule).observe(layer);window.addEventListener('resize',schedule,{passive:true});
 document.fonts?.ready.then(schedule);
})();
