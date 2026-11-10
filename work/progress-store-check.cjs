const assert=require('node:assert/strict'),E=require('./kanji-pop-site/dist/n5-engine.js'),{create}=require('./kanji-pop-site/dist/progress-store.js');
const key='kanji-pop-n5-v1',fresh=()=>({course:E.C.id,state:E.fresh(0,1234,'mobile'),profile:{collected:[],results:{}},history:[],undos:3,view:'map',sound:false});
const memory=()=>({map:new Map(),getItem(k){return this.map.get(k)??null;},setItem(k,v){this.map.set(k,v);}});
let m=memory(),notes=[],a=create(m,E,()=> 'mobile',x=>notes.push(x));assert.equal(a.read(),null);let v=fresh();assert(a.write(v));v.sound=true;assert(a.write(v));assert.equal(a.backup().sound,false);
const exported=a.pack(v);assert.equal(a.decode(exported).sound,true);assert.equal(a.decode(JSON.stringify(v)).state.mode,'mobile');
const legacy=fresh();legacy.state=require("./kanji-pop-site/dist/n5-legacy-v9.js").fresh(0,1234,"mobile");legacy.state.version=8;assert(E.valid(a.decode(JSON.stringify(legacy)).state),'legacy engine migration');
for(const mutation of [x=>x.course='other',x=>x.state.board[0]={id:999},x=>x.profile.collected=['<script>'],x=>x.profile.results={4:{stars:3,moves:1}},x=>x.undos=8,x=>x.history=[{}],x=>x.state.found=['休']]){const x=fresh();mutation(x);assert.throws(()=>a.decode(JSON.stringify(x)));assert.equal(a.write(x),false);}
assert.throws(()=>a.decode('x'.repeat(2*1024*1024+1)));assert.throws(()=>a.decode('{'));
// Corrupt current save recovers a validated backup without throwing away raw data.
m.setItem(key,'{corrupt');notes=[];a=create(m,E,()=> 'mobile',x=>notes.push(x));const recovered=a.read();assert(recovered);assert(notes.includes('recovered'));assert.equal(m.getItem(key+'-damaged'),'{corrupt');assert(a.write(recovered));
// A second tab cannot replace a newer board, including with an explicit restore.
const b=create(m,E,()=> 'mobile',x=>notes.push(x));b.read();v.sound=true;assert(a.write(v));assert.equal(b.write(fresh()),false);assert.equal(b.restore(fresh()),false);assert(notes.includes('conflict'));assert.equal(JSON.parse(m.getItem(key)).sound,true);
// Full storage must preserve the last persisted board and report failure.
const before=m.getItem(key),real=m.setItem;m.setItem=()=>{throw Error('quota');};assert.equal(a.write(fresh()),false);assert.equal(m.getItem(key),before);m.setItem=real;
// Blocked storage still lets the user export the in-memory session.
notes=[];a=create({getItem(){throw Error('denied');},setItem(){throw Error('denied');}},E,()=> 'mobile',x=>notes.push(x));assert.equal(a.read(),null);assert.equal(a.write(fresh()),false);assert(a.decode(a.pack(fresh())));assert(notes.includes('blocked'));
// Pending match and undo round-trip, including resume after importing.
v=fresh();for(let i=0;i<120;i++){const h=E.hint(v.state),r=E.move(v.state,h.at,h.dir);v.history=[v.state];v.state=r.state;if(r.match){v.profile.collected.push(r.match.recipe);break;}}
assert(v.state.pending);const p=a.decode(a.pack(v));assert(E.valid(p.state));assert(E.valid(E.resume(p.state)));assert.deepEqual(p.history[0].board,v.history[0].board);
v.state.benchmark={three:'<img src=x onerror=alert(1)>',two:10};assert.equal(a.decode(a.pack(v)).state.benchmark,undefined);
console.log('PASS: export/import, legacy migration, malformed files, automatic recovery, quota/denial, cross-tab conflicts, pending match and undo.');
