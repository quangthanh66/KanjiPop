const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),E=require('./kanji-pop-site/dist/n5-engine.js');const old={KanjiCourse:E.C};vm.runInNewContext(fs.readFileSync(__dirname+'/n5-engine-before-mobile57.cjs','utf8'),old);const O=old.KanjiN5,pc={window:{}},nc={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/course-plans-before-mobile57.js','utf8'),pc);vm.runInNewContext(fs.readFileSync(__dirname+'/kanji-pop-site/dist/course-plans.js','utf8'),nc);assert.equal(JSON.stringify(pc.window.KanjiCoursePlans.modes.desktop),JSON.stringify(nc.window.KanjiCoursePlans.modes.desktop));
let migrated=0,steps=0;
for(let level=0;level<15;level++){
let s=O.fresh(level,pc.window.KanjiCoursePlans.modes.mobile[level].seed,'mobile');const check=()=>{const u=E.upgrade(s);assert(E.valid(u),'migration '+level);assert.equal(u.cols,5);assert.equal(u.rows,7);assert.equal(u.blanks,1);for(const k of ['found','moves','matches','score','status'])assert.equal(JSON.stringify(u[k]),JSON.stringify(s[k]));if(u.pending)assert(E.valid(E.resume(u)));migrated++;};check();
for(const h of pc.window.KanjiCoursePlans.modes.mobile[level].route){s=O.move(s,h.at,h.dir).state;if(s.pending){check();s=O.resume(s);check();}}
}
for(const [mode,levels] of Object.entries(nc.window.KanjiCoursePlans.modes))for(const [level,p] of levels.entries()){
let s=E.fresh(level,p.seed,mode);assert(E.valid(s));for(const h of p.route){const r=E.move(s,h.at,h.dir);assert(r.changed);s=r.state;assert(E.valid(s));steps++;if(s.pending){if(!s.pending.complete)assert(E.distance(s.pending.plan.spawn[0].at,s.pending.plan.spawn[1].at,s.cols)>=5);s=E.resume(s);assert(E.valid(s));}}assert(E.complete(s));}
console.log({migrated,steps,desktopPlans:'unchanged',all30Routes:'pass'});
