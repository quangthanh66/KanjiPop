(function(host){
 'use strict';
 // Lock names match save namespaces. Other tabs remain read-only until a reload;
 // automatically taking over could commit their stale in-memory board.
 function create(options={}){
  const key=options.key||'kanji-pop-n5-v1';
  let state='idle',pending=null,releaseHeld=null,requestTask=null;
  function canWrite(){return state==='writer';}
  function reason(){return state;}
  function release(){
   state='released';
   if(releaseHeld){releaseHeld();releaseHeld=null;}
  }
  function acquire(){
   if(pending)return pending;
   if(state==='released')return Promise.resolve(false);
   pending=new Promise(resolve=>{
    let locks;
    try{locks=Object.prototype.hasOwnProperty.call(options,'locks')?options.locks:host.navigator?.locks;}catch{state='error';resolve(false);return;}
    if(!locks||typeof locks.request!=='function'){state='unsupported';resolve(false);return;}
    state='acquiring';
    let settled=false;
    const settle=value=>{if(!settled){settled=true;resolve(value);}};
    try{
     requestTask=Promise.resolve(locks.request('kanji-pop:writer:'+key,{mode:'exclusive',ifAvailable:true},lock=>{
      if(state==='released'){settle(false);return;}
      if(!lock){state='other-tab';settle(false);return;}
      state='writer';
      const held=new Promise(done=>{releaseHeld=done;});
      settle(true);return held;
     })).catch(()=>{state='error';releaseHeld=null;settle(false);});
    }catch{state='error';settle(false);}
   });
   return pending;
  }
  return {acquire,canWrite,reason,release,key};
 }
 host.KanjiProgressLock={create};
 if(typeof module!=='undefined')module.exports={create};
})(globalThis);
