'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const project=path.dirname(__dirname),dist=path.join(project,'dist'),file=path.join(project,'font-provenance.json'),r=JSON.parse(fs.readFileSync(file)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const glyphSources=['n5-data.js','n5-game.js','gem-art.js'],source=glyphSources.map(f=>fs.readFileSync(path.join(dist,f),'utf8')).join('\n'),chars=[...new Set([...source].filter(c=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c)))];
function covers(range,cp){return range.split(',').some(x=>{const [a,b]=x.trim().replace(/^U\+/i,'').split('-').map(x=>parseInt(x,16));return cp>=a&&cp<=(b??a);});}
const missing=chars.filter(c=>!r.files.some(f=>f.family==='Noto Sans JP'&&covers(f.unicodeRange,c.codePointAt(0))));
assert(missing.every(c=>c==='𠂇'),'Missing glyph subsets: '+missing.join(''));
for(const asset of [...r.files,...r.licenses]){assert.equal(hash(fs.readFileSync(path.join(project,asset.file))),asset.sha256,'Asset changed: '+asset.file);}
assert(!fs.existsSync(path.join(dist,'fonts/fetch-fonts.cjs')),'Build tool must not be served');
const report={checkedAt:new Date().toISOString(),requiredChars:chars.length,fontCoveredChars:chars.length-missing.length,customSVGChars:missing,checksumsVerified:r.files.length+r.licenses.length};
if(process.argv.includes('--refresh-manifest')){
 r.coverage.glyphSources=glyphSources;r.coverage.requiredGameChars=chars.join('');r.coverage.courseDataSha256=hash(fs.readFileSync(path.join(dist,'n5-data.js')));r.coverage.selection='Nunito latin, latin-ext, Vietnamese; Noto subsets covering all Han/kana in active glyph sources plus supported U+3000..30FF punctuation/kana.';r.coverage.lastAudit=report;r.maintenance='From the project directory, run node tools/fetch-fonts.cjs only when deliberately updating fonts. Validate unchanged pinned assets with node tools/audit-fonts.cjs. Add --refresh-manifest to update coverage evidence after an audited content change.';fs.writeFileSync(file,JSON.stringify(r,null,2));
}
console.log(report);
