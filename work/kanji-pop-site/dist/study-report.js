(function(host){
 'use strict';
 function summarize(data){
  const events=Array.isArray(data.events)?data.events.filter(e=>e&&typeof e==='object'&&typeof e.type==='string'):[],runs=new Map();
  for(const e of events){
   if(!e.runId)continue;
   if(!runs.has(e.runId))runs.set(e.runId,{id:e.runId,level:e.level,mode:e.mode,startObserved:false,resumes:0,moves:0,invalidActions:0,hints:0,matches:0,targetMatches:0,refills:0,movedTiles:0,anchorMoved:0,firstMatchVisibleMs:null,completed:false,exits:0,measurementIncomplete:false});
   const r=runs.get(e.runId);if(Number.isInteger(e.level))r.level=e.level;if(e.mode)r.mode=e.mode;
   if(e.type==='level_start')r.startObserved=true;
   if(e.type==='level_resume')r.resumes++;
   if(e.type==='move')r.moves++;
   if(['invalid_move','invalid_tap'].includes(e.type))r.invalidActions++;
   if(e.type==='hint')r.hints++;
   if(e.measurementIncomplete)r.measurementIncomplete=true;
   if(e.type==='match'){r.matches++;if(e.target)r.targetMatches++;if(r.firstMatchVisibleMs===null&&r.startObserved&&Number.isFinite(e.firstMatchVisibleMs)&&e.firstMatchVisibleMs>=0)r.firstMatchVisibleMs=e.firstMatchVisibleMs;}
   if(e.type==='refill'){r.refills++;r.movedTiles+=e.movedTiles??e.shifts??e.reflow??0;if(e.anchorMoved)r.anchorMoved++;}
   if(e.type==='level_complete')r.completed=true;
   if(e.type==='level_exit')r.exits++;
  }
  return {version:1,study:data.study||null,eventsRetained:events.length,eventsDropped:data.eventsDropped||0,legacyEventsWithoutRun:events.filter(e=>!e.runId).length,runs:[...runs.values()],observations:data.observations||[],limitations:['Visible time excludes background tabs but includes guide reading and pauses while the page stays visible.','Missing first-match timing is null, never zero. Resume without observed start is incomplete evidence.','An exit is not classified as abandonment; no human answers or learning outcomes are inferred.','Truncated logs cannot provide complete session totals.']};
 }
 host.KanjiStudyReport={summarize};if(typeof module!=='undefined')module.exports={summarize};
})(globalThis);
