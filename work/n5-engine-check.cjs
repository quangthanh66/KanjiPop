const E=require('./kanji-pop-site/dist/n5-engine.js'),assert=require('node:assert/strict'),fs=require('node:fs');
let all=new Set(),solutions=[],results=[];
for(const l of E.C.levels){
 let s=E.fresh(l.id,1234+l.id),steps=[],shifts=0;assert(E.valid(s));
 while(s.status!=='won'&&steps.length<500){
  const h=E.hint(s);assert(h,'No target path at level '+l.id+' step '+steps.length);
  const r=E.move(s,h.at,h.dir);assert(r.changed);assert(E.valid(r.state));steps.push(h);s=r.state;
  if(s.pending){all.add(s.pending.recipe);shifts+=s.pending.plan?.motions.length||0;s=E.resume(s);assert(E.valid(s));}
 }
 assert.equal(s.status,'won');for(const id of l.targets)assert(s.found.includes(id));
 results.push({level:l.id+1,moves:steps.length,matches:s.matches,shifts});solutions.push(steps);
}
assert.equal(all.size,24);fs.writeFileSync('work/n5-solutions.json',JSON.stringify(solutions));console.log(JSON.stringify({status:'PASS',coverage:all.size,levels:results}));
