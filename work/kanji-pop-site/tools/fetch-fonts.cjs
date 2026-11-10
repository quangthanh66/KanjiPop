// Explicit maintenance command, not loaded by the game. Downloads only official Google font assets.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const project=path.dirname(__dirname),dist=path.join(project,'dist'),fontDir=path.join(dist,'fonts'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
async function get(url){const allowed=['fonts.googleapis.com','fonts.gstatic.com','raw.githubusercontent.com','api.github.com'];if(!allowed.includes(new URL(url).hostname))throw Error('Unexpected download origin');const r=await fetch(url,{headers:{'User-Agent':ua},signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(url+' '+r.status);return Buffer.from(await r.arrayBuffer());}
function covers(block,cp){const ranges=block.match(/unicode-range:\s*([^;]+)/)?.[1]||'';return ranges.split(',').some(x=>{const [a,b]=x.trim().replace(/^U\+/i,'').split('-').map(x=>parseInt(x,16));return cp>=a&&cp<=(b??a);});}
(async()=>{
 const source=fs.readFileSync(path.join(dist,'n5-data.js'),'utf8');
 const glyphSources=['n5-data.js','n5-game.js','gem-art.js'],glyphSource=glyphSources.map(file=>fs.readFileSync(path.join(dist,file),'utf8')).join('\n');
 const chars=new Set([...glyphSource].filter(c=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c)));
 // Include the full kana blocks and Japanese punctuation for normal new examples.
 for(let cp=0x3000;cp<=0x30ff;cp++)chars.add(String.fromCodePoint(cp));
 const codes=[...chars].map(c=>c.codePointAt(0)),records=[],rules=[],cssSources=[];
 for(const [family,slug,axis] of [['Nunito','nunito','600..1000'],['Noto Sans JP','noto-sans-jp','600..700']]){
  const url='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family+':wght@'+axis)+'&display=swap';
  const bytes=await get(url),css=bytes.toString('utf8');fs.writeFileSync(path.join(fontDir,slug+'-source.css'),bytes);cssSources.push({family,url,sha256:hash(bytes),userAgent:ua});
  const blocks=[...css.matchAll(/(?:\/\*\s*([^*]+)\*\/\s*)?(@font-face\s*\{[^}]+\})/g)].filter(m=>family==='Nunito'?['latin','latin-ext','vietnamese'].includes(m[1]?.trim()):codes.some(cp=>covers(m[2],cp)));
  for(let index=0;index<blocks.length;index++){
   const block=blocks[index][2],remote=block.match(/url\(([^)]+)\)/)[1],buf=await get(remote);
   if(buf.subarray(0,4).toString()!=='wOF2')throw Error('Not WOFF2: '+remote);
   const name=slug+'-'+String(index).padStart(2,'0')+'-'+hash(buf).slice(0,12)+'.woff2';fs.writeFileSync(path.join(fontDir,name),buf);
   rules.push(block.replace(remote,'fonts/'+name));records.push({family,file:'dist/fonts/'+name,source:remote,cdnVersion:new URL(remote).pathname.match(/\/v\d+\//)?.[0].replaceAll('/','')||null,sha256:hash(buf),bytes:buf.length,unicodeRange:block.match(/unicode-range:\s*([^;]+)/)?.[1]||null});
  }
 }
 const licenses=[];
 for(const [family,slug] of [['Nunito','nunito'],['Noto Sans JP','notosansjp']]){
  const commit=JSON.parse((await get('https://api.github.com/repos/google/fonts/commits?path=ofl/'+slug+'/OFL.txt&per_page=1')).toString())[0].sha;
  const url='https://raw.githubusercontent.com/google/fonts/'+commit+'/ofl/'+slug+'/OFL.txt',bytes=await get(url),name=slug+'-OFL.txt';fs.writeFileSync(path.join(fontDir,name),bytes);licenses.push({family,file:'dist/fonts/'+name,source:url,revision:commit,sha256:hash(bytes),license:'SIL Open Font License 1.1'});
 }
 const missing=[...chars].filter(c=>!records.some(r=>r.family==='Noto Sans JP'&&covers('unicode-range:'+r.unicodeRange+';',c.codePointAt(0))));
 fs.writeFileSync(path.join(dist,'fonts.css'),'/* Pinned Google Fonts WOFF2 subsets. See ../font-provenance.json and fonts/*-OFL.txt. */\n'+rules.join('\n'));
 const report={generatedAt:new Date().toISOString(),scope:'Exact downloaded binaries are pinned by source URL, CDN version and SHA-256. OFL notices are pinned to official google/fonts file-history revisions; no commercial/legal clearance issued.',families:['Nunito','Noto Sans JP'],cssSources,files:records,licenses,bytes:records.reduce((n,r)=>n+r.bytes,0),coverage:{selection:'Nunito latin, latin-ext, Vietnamese; Noto subsets covering all Han/kana in active glyph sources, all U+3000..30FF punctuation/kana where font supports them.',glyphSources,courseDataSha256:hash(source),requiredGameChars:[...glyphSource].filter(c=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c)).filter((c,i,a)=>a.indexOf(c)===i).join(''),unsupportedRequestedChars:missing,customGlyphs:{'𠂇':'Existing part() renderer uses inline SVG; verify visual rendering separately.'}},maintenance:'From the project directory, run node tools/fetch-fonts.cjs only when deliberately updating fonts. This fetches current official assets, rewrites fonts.css and provenance. Revalidate glyph coverage whenever curriculum changes.'};
 fs.writeFileSync(path.join(project,'font-provenance.json'),JSON.stringify(report,null,2));console.log({files:records.length,bytes:report.bytes,missingRequested:missing.join('')});
})().catch(e=>{console.error(e);process.exitCode=1;});
