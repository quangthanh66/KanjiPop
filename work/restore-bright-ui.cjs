const fs=require('fs');
const base='work/kanji-pop-site/dist/';
fs.writeFileSync(base+'ui-shell.css',`/* Original bright theme is supplied by theme.css and mobile-fullscreen.css.
   Keep only shared interaction refinements here; do not recolor the playfield. */
#kanji-pop#kanji-pop button:not(.board-tile):not(.board-cell):focus-visible{outline:2px solid #315c9b;outline-offset:3px;text-decoration:none}
@media(hover:hover){#kanji-pop#kanji-pop button:not(.board-tile):not(.board-cell):not(:disabled):hover{filter:brightness(1.05)}}
`);
let css=fs.readFileSync(base+'journey-map.css','utf8');
css=css.replace('radial-gradient(ellipse at 65% 42%,#2f275750,transparent 55%),radial-gradient(ellipse at 5% 80%,#17435240,transparent 50%),#0c1428','radial-gradient(ellipse at 50% 15%,#b4edff 0,transparent 65%),linear-gradient(#69d4fc,#50bef3 80%,#67cef3)');
const colors={
'#9caac7':'#286393','#697993':'#437694','#e6dcfa':'#184879','#b89cde':'#8052ed','#98a9c5':'#397299','#b4c1da':'#23618f',
'#8195c033':'#ffffffcc','#8ca6d108':'#e1f9ff88','#d8e2f3':'#23618f','#f0edff':'#184879','#9caecb':'#29658e','#899ebc':'#306a91',
'#31405c':'#8ac9e7','#92cdbb':'#65b70a','#8365c818':'#ffffff50','#c4c6ed':'#ffffff','#8c9dbe':'#fffbd4','#708fb0':'#ffffff','#b4c3e1':'#fffbd4','#6c82a9':'#ffffff',
'#697ca73d':'#ffffffb0','#82bfa7a3':'#6bb716','#d1daed':'#ffffff','#3a4669':'#acebff','#202d49':'#309cd5','#9cb5e24d':'#ffffff',
'#d5e9ff0d':'#ffffff70','#02061644':'#16557718','#8597b6':'#2d6a93','#ebc88b':'#ffcb24','#3b4862':'#8ac0d9',
'#3c766e':'#b9f55a','#214a4c':'#56b705','#83d4b97a':'#ffffff','#dcf9e9':'#ffffff',
'#c5a3f2':'#c7a5ff','#9065cd':'#9a70fc','#6345a7':'#7849e9','#e3ceff':'#ffffff','#a88bd112':'#ffffff55','#a683dd3b':'#9161ee30','#d5c1f5':'#5b3ea0',
'#16223a':'#ade0f2','#667a9b3d':'#ffffffa0','#647797':'#3c7196','#677b99':'#396f96','#24324c':'#e6f8ff','#9eafc8':'#3a749e',
'#b5a1d1':'#42669b','#f0ecff':'#184879','#92a4c1':'#30668d','#d3bcff70':'#ffffffe6',
'#a882e9':'#baff42','#7253b5':'#68ce00','#e7d3ff33':'#ffffff80','#8860cc1a':'#548d1215',
'#25314b':'#b4deed','#8196c126':'#ffffffaa','#8193b0':'#42708f','#8ca2cc15':'#ffffff70','#8293b2':'#2f6f9d','#d5c3f3':'#5a36ac','#b696e7':'#8052ed',
'#a6b7d3':'#376b90','#9cacca':'#29658e','#c5a2e6':'#8052ed','#c3cee5':'#24618f'
};
for(const [a,b] of Object.entries(colors))css=css.split(a).join(b);
css=css.replace('stroke-width:1.5;stroke-dasharray:2 5','stroke-width:3;stroke-dasharray:2 6').replace('stroke-width:2;stroke-dasharray:none','stroke-width:3;stroke-dasharray:none');
css+=`\n/* Bright candy controls, matching the original game artwork. */
#kanji-pop#kanji-pop[data-view="map"] #kp-sound{border:2px solid #fff9ed;border-radius:16px;background:linear-gradient(#80eeff,#08a4e7);color:white;box-shadow:none}
#kanji-pop#kanji-pop[data-view="map"] .journey-play{color:#245b05;border-width:2px}
#kanji-pop#kanji-pop[data-view="map"] .journey-play:disabled{color:#42708f}
#kanji-pop .journey-stop-body,#kanji-pop .journey-stop.selected .journey-stop-body{border-width:2px}
#kanji-pop .journey-stars{text-shadow:0 1px #a97513}
#kanji-pop .journey-options{color:#184879}
`;
fs.writeFileSync(base+'journey-map.css',css);
