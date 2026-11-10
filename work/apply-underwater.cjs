const fs=require('fs'),p='work/kanji-pop-site/dist/gem-art.css';let s=fs.readFileSync(p,'utf8');
s=s.replace('linear-gradient(145deg,#246e91,#173e68)','linear-gradient(145deg,#176978,#07394d)');
s=s.slice(0,s.indexOf('/* Crystal lagoon:'))+`/* Approved option 1: diffuse underwater light. These legacy layer names are
   retained for DOM compatibility; no stars, line texture or ribbon is rendered. */
#kanji-pop .cosmic-depth{position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none;isolation:isolate;background:radial-gradient(ellipse at 50% 48%,#07374a 0%,#0b4657 55%,#176878 100%)}
#kanji-pop .cosmic-depth::after{content:'';position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% 50%,#032c3b30,transparent 75%);box-shadow:inset 0 1px 0 #d6fff5a0,inset 0 0 24px #04374735}
#kanji-pop .cosmic-nebula,#kanji-pop .cosmic-stars{position:absolute;inset:-18%;width:auto;height:auto;pointer-events:none;background-repeat:no-repeat;will-change:transform;transform-origin:50% 50%}
#kanji-pop .cosmic-nebula{background:radial-gradient(ellipse 28% 29% at 22% 20%,#75e5cd85 0%,#37bbaa40 43%,transparent 76%),radial-gradient(ellipse 30% 34% at 83% 82%,#56d6c46b 0%,#21969c26 47%,transparent 78%);animation:underwater-light-a 28s ease-in-out infinite;opacity:.95}
#kanji-pop .cosmic-stars-far{background:radial-gradient(ellipse 24% 34% at 84% 24%,#5bd1bd60 0%,#359f9f30 48%,transparent 80%),radial-gradient(ellipse 30% 28% at 15% 80%,#70e9cd66 0%,#2bada530 45%,transparent 80%);animation:underwater-light-b 34s ease-in-out -11s infinite;opacity:.85}
#kanji-pop .cosmic-stars-near{background:radial-gradient(ellipse 25% 40% at 35% 50%,#59c7d025 0%,transparent 80%),radial-gradient(ellipse 34% 22% at 70% 65%,#63dbca22 0%,transparent 80%);animation:underwater-light-c 23s ease-in-out -7s infinite;opacity:.8}
@keyframes underwater-light-a{0%,100%{transform:translate3d(-3%,-2%,0) scale(1.02) rotate(-5deg)}35%{transform:translate3d(5%,4%,0) scale(1.1) rotate(3deg)}70%{transform:translate3d(-1%,7%,0) scale(1.04) rotate(7deg)}}
@keyframes underwater-light-b{0%,100%{transform:translate3d(3%,2%,0) scale(1.05) rotate(4deg)}40%{transform:translate3d(-6%,-3%,0) scale(.96) rotate(-5deg)}75%{transform:translate3d(-2%,4%,0) scale(1.08) rotate(-2deg)}}
@keyframes underwater-light-c{0%,100%{transform:translate3d(-3%,4%,0) rotate(-7deg) scale(1)}50%{transform:translate3d(5%,-5%,0) rotate(8deg) scale(1.14)}}
#kanji-pop[data-quality="light"] .cosmic-depth>div,#kanji-pop[data-marker-quality="light"] .cosmic-depth>div{animation:none;will-change:auto}
#kanji-pop[data-quality="light"] .cosmic-stars-near,#kanji-pop[data-marker-quality="light"] .cosmic-stars-near{display:none}
@media(prefers-reduced-motion:reduce){#kanji-pop .cosmic-depth>div{animation:none!important;will-change:auto}}
`;
fs.writeFileSync(p,s);
