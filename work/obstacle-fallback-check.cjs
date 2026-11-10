const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),C=require('./kanji-pop-site/dist/n5-data.js');
const source=fs.readFileSync(__dirname+'/kanji-pop-site/dist/n5-engine.js','utf8');
for(const full of [false,true]){
 let code=source.replace('depth<=20','depth<=-1');if(full)code=code.replace('for(const a of initialHoles)','for(const a of [])');
 const cx={KanjiCourse:C};vm.runInNewContext(code,cx);const E=cx.KanjiN5;
 for(const mode of ['mobile','desktop']){let s=E.fresh(0,1234,mode);for(let i=0;i<100&&!s.pending;i++){const h=E.hint(s);assert(h);s=E.move(s,h.at,h.dir).state;}
 assert(s.pending?.plan?.reflow);assert(E.valid(s));const p=s.pending.plan;assert(E.walkDistance(s,p.spawn[0].at,p.spawn[1].at)>=5);s=E.resume(s);assert(E.valid(s));assert.equal(s.board.filter(x=>x===null).length,1);for(const at of s.blocked)assert.equal(s.board[at],false);
 console.log(mode,full?'full rearrangement':'single relocation','fallback PASS');}
}
