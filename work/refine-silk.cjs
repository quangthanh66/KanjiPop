const fs=require('fs'),p='work/kanji-pop-site/dist/index.html';let s=fs.readFileSync(p,'utf8');s=s.replace(/<svg class="silk-ribbon"[\s\S]*?<\/svg>/,'<canvas class="silk-ribbon" aria-hidden="true"></canvas>');s=s.replace('<script src="reveal-layout.js"></script>','<script src="reveal-layout.js"></script><script src="silk-background.js"></script>');fs.writeFileSync(p,s);
const css='work/kanji-pop-site/dist/gem-art.css';s=fs.readFileSync(css,'utf8');s=s.slice(0,s.indexOf('#kanji-pop .silk-ribbon{'))+`#kanji-pop .silk-ribbon{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:1}
@keyframes silk-atmosphere{0%,100%{transform:translate3d(-2%,0,0)}50%{transform:translate3d(3%,3%,0)}}
@media(prefers-reduced-motion:reduce){#kanji-pop .cosmic-nebula{animation:none!important;will-change:auto}}
`;fs.writeFileSync(css,s);
