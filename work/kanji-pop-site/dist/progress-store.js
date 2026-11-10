(function(host){
 'use strict';
 const DEFAULT_KEY='kanji-pop-n5-v1',LIMIT=2*1024*1024;
 function create(storage,E,mode,notify=()=>{},options={}){
  const KEY=options.key||DEFAULT_KEY;
  // Browser consumers must supply an exclusive writer guard. Node-only tests use
  // their isolated in-memory adapters and remain synchronous.
  const canWrite=typeof options.canWrite==='function'?options.canWrite:()=>typeof module!=='undefined'&&!!module.exports;
  let observed=null,blocked=false;
  function decode(raw){
   if(typeof raw!=='string'||raw.length>LIMIT)throw Error('File quá lớn hoặc không phải dữ liệu tiến trình.');
   const input=JSON.parse(raw),v=input.format==='kanji-pop-progress'?input.save:input;
   if(input.format&& (input.format!=='kanji-pop-progress'||input.version!==1))throw Error('Định dạng bản sao chưa được hỗ trợ.');
   if(v?.course!==E.C.id)throw Error('Bản sao không thuộc bộ 24 chữ hiện tại.');
   const state=E.upgrade(v.state,mode());
   if(!E.valid(state)||!Number.isInteger(state.level))throw Error('Trạng thái bàn chơi không hợp lệ.');
   function cleanUI(s){
    // Engine validation covers game rules; optional display metadata also comes from imported JSON.
    if(s.benchmark&&(!Number.isSafeInteger(s.benchmark.three)||s.benchmark.three<1||!Number.isSafeInteger(s.benchmark.two)||s.benchmark.two<s.benchmark.three))delete s.benchmark;
    s.entryGuideSeen=!!s.entryGuideSeen;s.experienceComplete=!!s.experienceComplete;return s;
   }
   cleanUI(state);
   const p=v.profile;
   if(!p||!Array.isArray(p.collected)||p.collected.length>E.C.ids.length||!p.collected.every(id=>E.C.ids.includes(id))||!p.results||typeof p.results!=='object'||Array.isArray(p.results))throw Error('Album không hợp lệ.');
   const collected=[...new Set(p.collected)],results={};let unlocked=0;
   for(const l of E.C.levels){const r=p.results[l.id];if(!r)break;if(!Number.isInteger(r.stars)||r.stars<1||r.stars>3||!Number.isSafeInteger(r.moves)||r.moves<1||!l.targets.every(id=>collected.includes(id)))throw Error('Kết quả màn không hợp lệ.');results[l.id]={stars:r.stars,moves:r.moves};unlocked++;}
   if(Object.keys(results).length!==Object.keys(p.results).length||state.level>unlocked||!state.found.every(id=>collected.includes(id)))throw Error('Tiến trình mở màn không nhất quán.');
   if(!Array.isArray(v.history)||v.history.length>3||!Number.isInteger(v.undos)||v.undos<0||v.undos>3)throw Error('Lịch sử hoàn tác không hợp lệ.');
   const history=v.history.map(s=>E.upgrade(s,mode()));
   if(!history.every(s=>E.valid(s)&&s.level===state.level&&!s.pending&&s.status==='playing'))throw Error('Bản sao chứa lượt hoàn tác không hợp lệ.');
   history.forEach(cleanUI);
   return {course:E.C.id,state,profile:{collected,results},history,undos:v.undos,view:['map','play','album'].includes(v.view)?v.view:'map',sound:!!v.sound};
  }
  function validRaw(raw){try{return decode(raw);}catch{return null;}}
  function read(){
   try{
    observed=storage.getItem(KEY);const current=validRaw(observed);if(current)return current;
    const backup=validRaw(storage.getItem(KEY+'-backup'));
    if(observed&&canWrite()){
     // Preserve the unreadable original before the game writes a new save.
     try{storage.setItem(KEY+'-damaged',observed);}catch{blocked=true;notify('blocked');return backup;}
    }
    if(backup){notify('recovered');return backup;}
    if(observed)notify('damaged');return null;
   }catch{blocked=true;notify('blocked');return null;}
  }
  function write(value){
   if(!canWrite()){notify('readonly');return false;}
   if(blocked){notify('blocked');return false;}
   try{
    const current=storage.getItem(KEY);
    if(current!==observed){notify('conflict');return false;}
    // Validate before persisting; a bad in-memory state must not replace a good save.
    decode(JSON.stringify(value));
    const raw=JSON.stringify({...value,savedAt:new Date().toISOString()});
    if(validRaw(current))storage.setItem(KEY+'-backup',current);
    storage.setItem(KEY,raw);observed=raw;return true;
   }catch{notify('write-failed');return false;}
  }
  function backup(){try{return decode(storage.getItem(KEY+'-backup'));}catch{return null;}}
  function pack(value){return JSON.stringify({format:'kanji-pop-progress',version:1,exportedAt:new Date().toISOString(),save:decode(JSON.stringify(value))},null,2);}
  function restore(value){
   // Explicit user confirmation is required by the UI before calling this.
   // Do not overwrite a newer tab even during a restore.
   return write(decode(JSON.stringify(value)));
  }
  return {read,write,backup,decode,pack,restore,key:KEY,limit:LIMIT};
 }
 host.KanjiProgress={create};if(typeof module!=='undefined')module.exports={create};
})(globalThis);
