const fs=require('fs'),E=require('./kanji-pop-site/dist/n5-engine.js'),assert=require('assert');
const out={version:1,description:'Verified guided solutions, not proven shortest paths.',modes:{}};
for(const mode of ['mobile','desktop']){
 out.modes[mode]=[];
 for(let level=0;level<E.C.levels.length;level++){
  let seed=1234+level,opening=[];
  // Three intentionally selected openings: approach, turn a corner, then plan a longer route.
  if(level<3)for(let attempt=0;attempt<25;attempt++){
   seed=1234+level+attempt*31;let s=E.fresh(level,seed,mode);opening=[];
   for(let j=0;j<40&&!s.pending;j++){const h=E.hint(s);if(!h)break;opening.push(h);s=E.move(s,h.at,h.dir).state;}
   const bounds=[[8,16],[12,22],[14,28]][level],turns=opening.filter((h,i)=>i&&h.dir!==opening[i-1].dir).length;
   if(s.pending&&opening.length>=bounds[0]&&opening.length<=bounds[1]&&(level===0||turns>=2))break;
   if(attempt===24)throw Error('Opening not found');
  }
  let s=E.fresh(level,seed,mode),steps=[],reflows=0,shifts=0;const start=Date.now();
  while(!E.complete(s)&&steps.length<800){const h=E.hint(s);assert(h,'no guided route');const r=E.move(s,h.at,h.dir);assert(r.changed);s=r.state;assert(E.valid(s));steps.push(h);if(s.pending){reflows+=!!s.pending.plan?.reflow;shifts+=s.pending.plan?.motions.length||0;s=E.resume(s);assert(E.valid(s));}}
  assert(E.complete(s),'did not solve');const base=steps.length;
  out.modes[mode].push({seed,baseline:base,three:Math.ceil(base*1.25),two:Math.ceil(base*1.9),opening:opening.length,route:steps,reflows,shifts});
  console.log(mode,level+1,seed,'moves',base,'opening',opening.length,'ms',Date.now()-start);
 }
}
fs.writeFileSync(__dirname+'/kanji-pop-site/dist/course-plans.js','window.KanjiCoursePlans='+JSON.stringify(out)+';\n');
