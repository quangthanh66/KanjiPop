'use strict';
// Regression contract for measurement integrity. VM checks only; no real participant findings.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'kanji-pop-site/dist');
const report=require(path.join(root,'study-report.js'));
const source=fs.readFileSync(path.join(root,'experience.js'),'utf8');
function boot(){
 let t=0,writable=true,fail=false;const storage=new Map(),notices=[],handlers={};let serial=0;
 const document={hidden:false,addEventListener:(name,fn)=>handlers[name]=fn,getElementById(){return {dataset:{}}}};
 const win={KanjiSession:{},KanjiWriter:{canWrite:()=>writable},dispatchEvent:e=>notices.push(e.type)};
 const sandbox={window:win,document,crypto:{randomUUID:()=>`test-uuid-${++serial}`},performance:{now:()=>t},Date,CustomEvent:function(type){this.type=type;},navigator:{hardwareConcurrency:8},KanjiStudyReport:report,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>{if(fail)throw Error('quota');storage.set(k,v);}}};
 vm.runInNewContext(source,sandbox);return {x:win.KanjiExperience,clock:n=>t=n,write:b=>writable=b,fail:b=>fail=b,visibility:hidden=>{document.hidden=hidden;handlers.visibilitychange();},storage,notices};
}
const results=[];function check(name,fn){try{fn();results.push({name,result:'PASS'});}catch(e){results.push({name,result:'FAIL',message:e.message});}}
function start(b,id='test-run-0001'){b.x.start({runId:id,level:0,mode:'mobile',moves:0,matches:0},'new');}
check('Readonly observation is not accepted into report',()=>{const b=boot();b.write(false);assert.equal(b.x.observation('remembered','yes',4),false);assert.equal(b.x.data.observations.length,0);assert.equal(b.x.report().observations.length,0);assert.equal(b.storage.size,0);});
check('Quota fail rolls back; retry after recovery records once',()=>{const b=boot();b.fail(true);assert.equal(b.x.observation('remembered','yes',4),false);assert.equal(b.x.observation('remembered','yes',4),false);assert.equal(b.x.data.observations.length,0);b.fail(false);assert.equal(b.x.observation('remembered','yes',4),true);assert.equal(b.x.data.observations.length,1);});
check('Clean first match keeps valid visible time',()=>{const b=boot();start(b);b.clock(1000);b.x.log('match',{recipe:'休'});const r=b.x.report().runs[0];assert.equal(r.firstMatchVisibleMs,1000);assert.notEqual(r.measurementIncomplete,true);});
check('Background time is excluded',()=>{const b=boot();start(b);b.clock(1000);b.visibility(true);b.clock(4000);b.visibility(false);b.clock(5000);b.x.log('match',{recipe:'休'});assert.equal(b.x.report().runs[0].firstMatchVisibleMs,2000);});
check('Unlogged first match is never reassigned to later match',()=>{const b=boot();start(b);b.x.set('logging',false);b.clock(1000);b.x.log('match',{recipe:'休'});b.x.set('logging',true);b.clock(5000);b.x.log('match',{recipe:'男'});const r=b.x.report().runs[0];assert.equal(r.firstMatchVisibleMs,null);assert.equal(r.measurementIncomplete,true);});
check('Logging gap without match still marks incomplete counts',()=>{const b=boot();start(b);b.x.set('logging',false);b.clock(1000);b.x.log('move');b.x.set('logging',true);b.clock(2000);b.x.log('match',{recipe:'休'});const r=b.x.report().runs[0];assert.equal(r.measurementIncomplete,true);assert.equal(r.firstMatchVisibleMs,null);});
check('No observed start yields no first-match timing',()=>{const b=boot();b.x.set('logging',false);start(b);b.x.set('logging',true);b.clock(1000);b.x.log('match',{recipe:'休'});assert.equal(b.x.report().runs[0].firstMatchVisibleMs,null);});
check('Leaving logging off still marks exported summary incomplete',()=>{const b=boot();start(b);b.x.set('logging',false);b.clock(1000);b.x.log('move');assert.equal(b.x.report().runs[0].measurementIncomplete,true);});
console.log(JSON.stringify({method:'Node VM; fake storage/lock/monotonic clock; synthetic events only',results},null,2));if(results.some(x=>x.result==='FAIL'))process.exitCode=1;

