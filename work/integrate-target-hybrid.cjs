const fs=require('fs');
const root='work/kanji-pop-site/dist/';
let js=fs.readFileSync(root+'gem-art.js','utf8');
const start=js.indexOf(' // Local material shapes'),end=js.indexOf(' window.KanjiGemArt=',start);
if(start<0||end<0)throw Error('Marker source not found');
js=js.slice(0,start)+` function focus(pair){
  const index=assignment[pair%assignment.length];
  return '<canvas class="objective-fx" data-vfx="hybrid" data-pair="'+pair+'" data-focus-cut="'+focusKinds[index]+'" data-focus-element="'+focusElements[pair%focusElements.length]+'" aria-hidden="true"></canvas>';
 }
`+js.slice(end);fs.writeFileSync(root+'gem-art.js',js);
let html=fs.readFileSync(root+'index.html','utf8').replace('<script src="gem-art.js"></script>','<script src="gem-art.js"></script><script src="target-vfx.js"></script>');fs.writeFileSync(root+'index.html',html);
fs.writeFileSync(root+'target-marker.css',`/* Hybrid material follows the actual cut. Canvas extends beyond the tile. */
#kanji-pop .board-tile{--focus-color:var(--tile-mid)}
#kanji-pop .objective-halo{display:none;position:absolute;inset:0;pointer-events:none;z-index:2;overflow:visible}
#kanji-pop .objective-anchor .objective-halo{display:block}
#kanji-pop .objective-fx[data-vfx="hybrid"]{display:block;position:absolute;left:-32%;top:-32%;width:164%;height:164%;pointer-events:none;max-width:none}
#kanji-pop#kanji-pop button.board-tile.objective-anchor{z-index:4}
#kanji-pop#kanji-pop button.board-tile.objective-anchor .tile-glyph{z-index:3}
#kanji-pop#kanji-pop button.board-tile.objective-anchor .jewel-art{filter:brightness(1.08) drop-shadow(0 0 2px var(--focus-color))}
#kanji-pop#kanji-pop button.board-tile.objective-mate-hint .jewel-art{filter:drop-shadow(0 0 4px #fff) drop-shadow(0 0 10px var(--focus-color)) brightness(1.3)}
`);
