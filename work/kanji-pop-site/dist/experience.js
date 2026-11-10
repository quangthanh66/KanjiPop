(()=>{
 'use strict';
 const context=window.KanjiSession||{},key=context.experienceKey||'kanji-pop-experience-v1',defaults={quality:'auto',pacing:'full',theme:'cosmos',effect:'auto',logging:true};
 let saved={};try{saved=JSON.parse(localStorage.getItem(key))||{};}catch{}
 const settings={...defaults};for(const [k,options] of Object.entries({quality:['auto','light','full'],pacing:['balanced','full'],theme:['cosmos','aurora','rose','gold'],effect:['auto','lightning','nature','fire','magic','water','fireworks']}))if(options.includes(saved.settings?.[k]))settings[k]=saved.settings[k];if(typeof saved.settings?.logging==='boolean')settings.logging=saved.settings.logging;
 settings.pacing='full'; // Every successful pair gets the full learning presentation, including legacy saves.
 let meta=null;try{meta=context.study?JSON.parse(localStorage.getItem(context.metaKey)):null;}catch{}
 const limit=context.study?4000:800,data={settings,study:context.study?{id:context.id,familiarity:['none','beginner'].includes(meta?.familiarity)?meta.familiarity:'unspecified',adultConsent:meta?.adultConsent===true}:null,tutorialDone:!!saved.tutorialDone,reviewed:saved.reviewed&&typeof saved.reviewed==='object'?saved.reviewed:{},events:Array.isArray(saved.events)?saved.events.slice(-limit):[],eventsDropped:Number.isSafeInteger(saved.eventsDropped)&&saved.eventsDropped>=0?saved.eventsDropped:0,observations:Array.isArray(saved.observations)?saved.observations.slice(-30):[],runs:saved.runs&&typeof saved.runs==='object'?saved.runs:{}};
 if(context.study&&meta?.adultConsent!==true)settings.logging=false;
 const session=crypto.randomUUID();let run=null,lastMove=performance.now(),lastMatch=0,pausedAt=null,slow=false,samples=[],visibleAt=null;
 function canWrite(){return window.KanjiWriter?.canWrite()??false;}
 function accrue(){if(run&&visibleAt!==null){run.visibleMs+=Math.max(0,performance.now()-visibleAt);visibleAt=document.hidden?null:performance.now();}}
 function save(){accrue();if(!canWrite())return false;try{localStorage.setItem(key,JSON.stringify(data));return true;}catch{window.dispatchEvent(new CustomEvent('kanji-study-save-error'));return false;}}
 function log(type,detail={}){
  if(!settings.logging){if(run){run.measurementIncomplete=true;if(type==='match')run.firstMatchLogged=true;}return;}accrue();const timing=type==='match'&&run&&!run.firstMatchLogged?{firstMatchVisibleMs:run.observedStart&&!run.measurementIncomplete?Math.round(run.visibleMs):null}:{};
  data.events.push({session,runId:run?.id||null,level:run?.level,mode:run?.mode,time:Date.now(),type,...detail,...timing,measurementIncomplete:!!run?.measurementIncomplete});if(type==='match'&&run)run.firstMatchLogged=true;
  const dropped=Math.max(0,data.events.length-limit);data.eventsDropped+=dropped;data.events=data.events.slice(-limit);save();
 }
 function set(name,value){const loggingChanged=name==='logging'&&value!==settings.logging;if(loggingChanged&&run)run.measurementIncomplete=true;if(loggingChanged&&settings.logging)log('logging_changed',{enabled:!!value});settings[name]=value;if(loggingChanged&&value)log('logging_changed',{enabled:true});save();apply();}
 function apply(){document.getElementById('kanji-pop').dataset.sky=settings.theme;document.getElementById('kanji-pop').dataset.quality=settings.quality;}
 function moves(state,matched){const now=performance.now();log('move',{level:state.level,mode:state.mode,moves:state.moves,matched,thinkingMs:Math.round(now-lastMove),betweenMatches:matched?state.moves-lastMatch:undefined});lastMove=now;if(matched)lastMatch=state.moves;}
 function ready(){lastMove=performance.now();}
 function learn(id,first){if(!first)data.reviewed[id]=Math.min(999,(Number(data.reviewed[id])||0)+1);save();}
 function start(state,kind){
  if(typeof state.runId!=='string'||! /^[a-zA-Z0-9-]{8,64}$/.test(state.runId))state.runId=crypto.randomUUID();if(run?.id===state.runId)return;
  accrue();const isNew=kind==='new'||!state.runStarted&&state.moves===0;state.runStarted=true;
  const previous=data.runs[state.runId];run=previous&&previous.id===state.runId&&Number.isFinite(previous.visibleMs)&&previous.visibleMs>=0?previous:{id:state.runId,level:state.level,mode:state.mode,visibleMs:0,firstMatchLogged:state.matches>0,observedStart:isNew};
  if(state.matches>0)run.firstMatchLogged=true;data.runs[state.runId]=run;const ids=Object.keys(data.runs);for(const id of ids.slice(0,Math.max(0,ids.length-100)))delete data.runs[id];
  visibleAt=document.hidden?null:performance.now();lastMatch=state.matches?state.moves:0;ready();log(isNew?'level_start':'level_resume',{seed:state.seed});
 }
 function finishTutorial(skipped=false){data.tutorialDone=true;save();log(skipped?'tutorial_skipped':'tutorial_complete');}
 function resetTutorial(){data.tutorialDone=false;save();}
 function budget(){return settings.quality==='light'||settings.quality==='auto'&&(slow||(navigator.hardwareConcurrency||8)<=4)?'light':'full';}
 function frame(ms){if(document.hidden||ms>2000)return;samples.push(ms);if(samples.length>=45){const avg=samples.reduce((a,b)=>a+b,0)/samples.length;slow=avg>27;log('frame_sample',{averageMs:Math.round(avg*10)/10,slow});samples=[];}}
 function report(){return KanjiStudyReport.summarize(data);}
 function exportData(){log('export');const payload=JSON.stringify({version:2,exportedAt:new Date().toISOString(),...data,summary:report()},null,2),blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='kanji-pop-playtest-'+(context.id||'main')+'.json';a.hidden=true;document.body.append(a);a.click();setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},30000);return payload;}
 function observation(recall,again,rating){
  if(!canWrite()||typeof recall!=='string'||!['yes','unsure','no'].includes(again)||![1,2,3,4,5].includes(rating))return false;
  const previous=data.observations;data.observations=[...previous,{id:crypto.randomUUID(),session,runId:run?.id||null,time:Date.now(),recall:recall.slice(0,1500),again,rating}].slice(-30);
  if(save())return true;data.observations=previous;return false;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){accrue();visibleAt=null;pausedAt=Date.now();log('background');}else{visibleAt=run?performance.now():null;log('return',{awayMs:pausedAt?Date.now()-pausedAt:0});ready();pausedAt=null;}});
 window.KanjiExperience={data,settings,save,set,apply,log,moves,ready,learn,start,finishTutorial,resetTutorial,budget,frame,exportData,observation,report};
})();
