(function(host){
 'use strict';
 const summarize=host.KanjiStudyReport?.summarize||(typeof require!=='undefined'?require('./study-report.js').summarize:null);
 const idPattern=/^[a-zA-Z0-9-]{8,64}$/;
 function parse(raw){
  if(typeof raw!=='string'||raw.length>2*1024*1024)throw Error('File vượt 2 MB.');
  const d=JSON.parse(raw);if(d?.version!==2||typeof d.study?.id!=='string'||!idPattern.test(d.study.id)||!Array.isArray(d.events)||d.events.length>4000||!Array.isArray(d.observations)||d.observations.length>30)throw Error('Cần JSON phiên chơi thử riêng phiên bản 2.');
  if(!['none','beginner','unspecified'].includes(d.study.familiarity)||typeof d.study.adultConsent!=='boolean'||!Number.isSafeInteger(d.eventsDropped)||d.eventsDropped<0)throw Error('Thông tin phiên không hợp lệ.');
  if(!d.exportedAt||!Number.isFinite(Date.parse(d.exportedAt)))throw Error('Ngày xuất không hợp lệ.');
  for(const e of d.events){
   if(!e||typeof e.type!=='string'||e.type.length>80||!Number.isFinite(e.time)||e.time<0||(e.runId!==null&&e.runId!==undefined&&(typeof e.runId!=='string'||!idPattern.test(e.runId))))throw Error('Sự kiện không hợp lệ.');
   if(e.measurementIncomplete!==undefined&&typeof e.measurementIncomplete!=='boolean')throw Error('Trạng thái đo không hợp lệ.');
   if(e.level!==undefined&&(!Number.isInteger(e.level)||e.level<0||e.level>14)||e.mode!==undefined&&!['mobile','desktop'].includes(e.mode))throw Error('Màn hoặc bố cục không hợp lệ.');
   for(const k of ['firstMatchVisibleMs','shifts','reflow','movedTiles'])if(e[k]!==undefined&&e[k]!==null&&(!Number.isFinite(e[k])||e[k]<0||e[k]>1e10))throw Error('Số đo không hợp lệ.');
  }
  for(const o of d.observations)if(!o||typeof o.recall!=='string'||o.recall.length>1500||!['yes','unsure','no'].includes(o.again)||![1,2,3,4,5].includes(o.rating))throw Error('Nhận xét không hợp lệ.');
  // The supplied summary is not trusted; always derive it from retained events.
  return {version:2,exportedAt:d.exportedAt,study:{id:d.study.id,familiarity:d.study.familiarity,adultConsent:d.study.adultConsent},events:d.events,eventsDropped:d.eventsDropped,observations:d.observations,summary:summarize(d)};
 }
 function merge(list,incoming){
  const old=list.get(incoming.study.id);
  if(!old||Date.parse(incoming.exportedAt)>Date.parse(old.exportedAt)){list.set(incoming.study.id,incoming);return old?'updated':'added';}
  if(Date.parse(incoming.exportedAt)===Date.parse(old.exportedAt)&&JSON.stringify(incoming)!==JSON.stringify(old))return 'conflict';
  return 'duplicate';
 }
 function cohort(records){
  const rows=[...records].map(d=>{const r=d.summary,first=r.runs.find(x=>x.level===0&&x.startObserved),complete=[0,1,2].filter(level=>r.runs.some(x=>x.level===level&&x.completed));return {id:d.study.id,familiarity:d.study.familiarity,consent:d.study.adultConsent,runs:r.runs.length,moves:r.runs.reduce((n,x)=>n+x.moves,0),hints:r.runs.reduce((n,x)=>n+x.hints,0),matches:r.runs.reduce((n,x)=>n+x.matches,0),anchorMoved:r.runs.reduce((n,x)=>n+x.anchorMoved,0),completedFirstThree:complete.length,firstMatchMs:first?.firstMatchVisibleMs??null,partial:r.eventsDropped>0||r.runs.some(x=>!x.startObserved||x.measurementIncomplete),observations:r.observations};});
  const samples=rows.filter(r=>r.consent&&!r.partial&&r.firstMatchMs!==null).map(r=>r.firstMatchMs).sort((a,b)=>a-b),n=samples.length;
  return {sessions:rows.length,consentedSessions:rows.filter(r=>r.consent).length,partialSessions:rows.filter(r=>r.partial).length,firstMatchSampleCount:n,firstMatchMedianMs:n?(n%2?samples[(n-1)/2]:(samples[n/2-1]+samples[n/2])/2):null,observedThreeLevelCompletions:rows.filter(r=>r.completedFirstThree===3).length,rows,limitations:['Sessions are not verified unique people.','No retention rate or learning efficacy is inferred.','Median uses complete retained logs with an observed first-level start, timing and consent.','Unobserved completion is unknown, not failure.','Imported files stay in memory until exported; main game saves are never replaced.']};
 }
 host.KanjiStudyCohort={parse,merge,cohort,idPattern};if(typeof module!=='undefined')module.exports=host.KanjiStudyCohort;
})(globalThis);
