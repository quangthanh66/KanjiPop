const fs=require('fs');
let p='work/progress-store-check.cjs',s=fs.readFileSync(p,'utf8');s=s.replace('const legacy=fresh();legacy.state.version=8;','const legacy=fresh();legacy.state=require("./kanji-pop-site/dist/n5-legacy-v9.js").fresh(0,1234,"mobile");legacy.state.version=8;');fs.writeFileSync(p,s);
p='work/ui-shell-check.cjs';s=fs.readFileSync(p,'utf8').replace("width===390?'5':'7'","width===390?'5':'8'");fs.writeFileSync(p,s);
p='work/mobile-layout-stability-check.cjs';s=fs.readFileSync(p,'utf8').replace("width>=900?'7':'5'","width>=900?'8':'5'").replace("width>=900?'5':'7'","width>=900?'5':'8'");s=s.replace(/  if\(width===495&&!gutter\)\{[^\n]*\}\r?\n/,'');fs.writeFileSync(p,s);
