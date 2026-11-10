from pathlib import Path
p=Path('work/grid-engine-check.cjs');s=p.read_text(encoding='utf-8');s=s[:s.index('// Legacy migration')];s=s.replace('assert(E.valid(s));\n  while',"assert(E.valid(s));assert.equal(s.cols,mode==='desktop'?5:4);assert.equal(s.rows,mode==='desktop'?6:5);assert.equal(s.blanks,2);\n  while")
s+='''// Old 3x3 runs, pending reveals and undo snapshots expand without losing counters.
function oldState(){let s=E.fresh(0,1234,'desktop');const tiles=s.board.filter(t=>t&&t.pair<4).sort((a,b)=>a.id-b.id);s.board=[2,0,4,6,null,1,3,5,7].map(i=>i===null?null:tiles[i]);s.cols=3;s.rows=3;s.blanks=1;s.version=8;return s;}
for(const pending of [false,true]){let old=oldState();if(pending)old=E.move(old,5,'left').state;assert.equal(Boolean(old.pending),pending);const s=E.upgrade(old);assert(E.valid(s));assert.equal(s.board.length,30);assert.equal(s.moves,old.moves);assert.equal(s.score,old.score);assert.deepEqual(s.found,old.found);assert.equal(s.pending?.recipe,old.pending?.recipe);if(pending)assert(E.valid(E.resume(s)));}
let v7=oldState();v7.version=7;delete v7.cols;delete v7.blanks;delete v7.mode;const m=E.upgrade(v7,'mobile');assert(E.valid(m));assert.equal(m.board.length,20);
// Existing full-size saves retain exact positions and pending refill plans.
let big=E.fresh(7,1241,'desktop');big.version=8;const migrated=E.upgrade(big);assert(E.valid(migrated));assert.deepEqual(migrated.board,big.board);
const report={status:'PASS',checks,ambiguous,refills,maxHintMs:Math.round(maxHint),results};fs.writeFileSync('work/fixed-grid-check-results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks,ambiguous,refills,maxHintMs:report.maxHintMs}));
''';Path('work/fixed-grid-check.cjs').write_text(s,encoding='utf-8')
