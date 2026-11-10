const fs=require('fs'),base='work/kanji-pop-site/dist/';
const a='M -100 70 C 10 280 560 230 560 470 C 560 690 30 665 -80 900 L -110 830 C 60 590 450 630 450 465 C 450 300 0 330 -100 130 Z';
const b='M -100 120 C 90 160 480 350 525 495 C 590 700 160 700 -80 850 L -110 790 C 100 610 445 645 425 495 C 405 345 15 285 -100 180 Z';
const c='M -100 40 C -40 350 600 220 590 455 C 580 680 -40 730 -80 950 L -110 865 C -10 625 475 615 480 455 C 485 295 -30 405 -100 115 Z';
const svg=`<svg class="silk-ribbon" viewBox="0 0 600 900" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="silk-color" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#47ebd4"/><stop offset=".35" stop-color="#47cbd7"/><stop offset=".62" stop-color="#7c8bf4"/><stop offset="1" stop-color="#3ad8cb"/></linearGradient><linearGradient id="silk-fold" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c5fff5" stop-opacity=".03"/><stop offset=".6" stop-color="#b2d7ff" stop-opacity=".04"/><stop offset=".9" stop-color="#d3e2ff" stop-opacity=".32"/><stop offset="1" stop-color="#d3e2ff" stop-opacity=".03"/></linearGradient><filter id="silk-soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="15"/></filter><filter id="silk-edge" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="2.5"/></filter></defs><g class="silk-flow"><path class="silk-band silk-glow" d="${a}"/><path class="silk-band silk-surface" d="${a}"/><path class="silk-band silk-fold" d="${a}"/></g></svg>`;
let html=fs.readFileSync(base+'index.html','utf8');const old='<div class="cosmic-depth" aria-hidden="true"><div class="cosmic-nebula"></div><div class="cosmic-stars cosmic-stars-far"></div><div class="cosmic-stars cosmic-stars-near"></div></div>';if(!html.includes(old))throw Error('background markup changed');html=html.replace(old,`<div class="cosmic-depth" aria-hidden="true"><div class="cosmic-nebula"></div>${svg}</div>`);fs.writeFileSync(base+'index.html',html);
let css=fs.readFileSync(base+'gem-art.css','utf8');css=css.slice(0,css.indexOf('/* Approved option 1:'))+`/* Option 3: one continuous silk ribbon, morphing rather than sliding a still image. */
#kanji-pop .cosmic-depth{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;isolation:isolate;background:radial-gradient(ellipse at 45% 45%,#143d56,#0b3b4b 65%,#145b68)}
#kanji-pop .cosmic-depth::after{content:'';position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 1px #d6fff590,inset 0 0 26px #062e4445}
#kanji-pop .cosmic-nebula{position:absolute;inset:-15%;background:radial-gradient(ellipse at 10% 25%,#39cfbc30,transparent 50%),radial-gradient(ellipse at 90% 75%,#4c79c51c,transparent 45%);animation:silk-atmosphere 21s linear infinite;will-change:transform}
#kanji-pop .silk-ribbon{position:absolute;inset:-5%;width:110%;height:110%;overflow:visible;pointer-events:none}
#kanji-pop .silk-flow{transform-origin:50% 50%;animation:silk-sway 19s linear infinite}
#kanji-pop .silk-band{animation:silk-morph 16s linear infinite;fill:url(#silk-color)}
#kanji-pop .silk-glow{filter:url(#silk-soft);opacity:.28}
#kanji-pop .silk-surface{filter:url(#silk-edge);opacity:.27}
#kanji-pop .silk-fold{fill:url(#silk-fold);filter:url(#silk-edge);opacity:.6}
@keyframes silk-morph{0%,100%{d:path('${a}')}33%{d:path('${b}')}66%{d:path('${c}')}}
@keyframes silk-sway{0%,100%{transform:translate(0,0) rotate(-3deg)}25%{transform:translate(-9px,12px) rotate(0deg)}50%{transform:translate(0,20px) rotate(3deg)}75%{transform:translate(9px,8px) rotate(0deg)}}
@keyframes silk-atmosphere{0%,100%{transform:translate3d(-2%,0,0)}50%{transform:translate3d(3%,3%,0)}}
#kanji-pop[data-quality="light"] .silk-glow,#kanji-pop[data-marker-quality="light"] .silk-glow{display:none}
#kanji-pop[data-quality="light"] .silk-band,#kanji-pop[data-marker-quality="light"] .silk-band{filter:none;animation-duration:22s}
@media(prefers-reduced-motion:reduce){#kanji-pop .silk-band,#kanji-pop .silk-flow,#kanji-pop .cosmic-nebula{animation:none!important;will-change:auto}}
`;
fs.writeFileSync(base+'gem-art.css',css);
