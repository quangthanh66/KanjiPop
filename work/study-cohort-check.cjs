const assert=require('node:assert/strict'),A=require('./kanji-pop-site/dist/study-cohort.js');
function fixture(id='study-0001',ms=1000){return {version:2,exportedAt:'2026-11-08T00:00:00Z',study:{id,familiarity:'none',adultConsent:true},eventsDropped:0,observations:[],events:[{type:'level_start',time:1,runId:'run-00001',level:0,mode:'mobile'},{type:'match',time:2,runId:'run-00001',level:0,mode:'mobile',firstMatchVisibleMs:ms}],summary:{runs:[],fake:true}};}
const parse=d=>A.parse(JSON.stringify(d));
if(require.main===module){
 const d=parse(fixture());assert.equal(d.summary.runs[0].matches,1);assert(!d.summary.fake);
 for(const mutate of [d=>d.study.id=12345678,d=>d.events[0]=null,d=>d.events[0].runId=12345678,d=>d.events[1].firstMatchVisibleMs=-1,d=>d.eventsDropped=-1,d=>d.events[0].measurementIncomplete='yes',d=>d.observations=[{recall:'x',rating:0,again:'yes'}]]){const x=fixture();mutate(x);assert.throws(()=>parse(x));}
 const records=new Map();assert.equal(A.merge(records,d),'added');assert.equal(A.merge(records,parse(fixture())),'duplicate');let newer=fixture();newer.exportedAt='2026-11-08T01:00:00Z';assert.equal(A.merge(records,parse(newer)),'updated');assert.equal(A.merge(records,d),'duplicate');newer.events.push({type:'hint',time:3,runId:'run-00001'});assert.equal(A.merge(records,parse(newer)),'conflict');assert.equal(records.values().next().value.summary.runs[0].hints,0);
 const rows=[fixture('study-0001',1000),fixture('study-0002',3000),fixture('study-0003',null),fixture('study-0004',99999),fixture('study-0005',99999),fixture('study-0006',99999)];rows[3].eventsDropped=1;rows[4].events.push({type:'logging_changed',time:3,runId:'run-00001',measurementIncomplete:true});rows[5].study.adultConsent=false;
 const c=A.cohort(rows.map(parse));assert.equal(c.sessions,6);assert.equal(c.partialSessions,2);assert.equal(c.firstMatchSampleCount,2);assert.equal(c.firstMatchMedianMs,2000);assert.equal(c.observedThreeLevelCompletions,0);assert.equal(A.cohort([]).firstMatchMedianMs,null);
 console.log('Cohort: recomputed summary, malformed imports, snapshot replacement/conflict, missing/gapped/truncated/unconsented timing PASS');
}
module.exports={fixture};
