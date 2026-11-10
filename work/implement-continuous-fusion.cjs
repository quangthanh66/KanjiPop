const fs=require('fs'),file='work/kanji-pop-site/dist/n5-game.js';let s=fs.readFileSync(file,'utf8');
s=s.replace('function modalOpen(html,label){','function modalOpen(html,label,focus=true){').replace("m.querySelector('button')?.focus({preventScroll:true});icons();}","if(focus)m.querySelector('button')?.focus({preventScroll:true});icons();}");
s=s.replace('pair:result.state.pending.pair,ingredients,onFrame:X.frame','pair:result.state.pending.pair,ingredients,cinematic:true,onFrame:X.frame');
s=s.replace(/  if\(!reduced\)\{const label=document.createElement\('span'\);label.className='fusion-caption';[^\n]+\n/,'');
s=s.replace("const crafted=['thunder','water','magic'].includes(KanjiGemArt.elementFor(result.state.pending.pair)),ingredients=crafted&&!reduced?fusionIngredients(result):[];if(!crafted)for(const id of result.match.ids)$(`#tiles [data-id=\"${id}\"]`)?.classList.add('merging');await delay(crafted?60:440);",'const ingredients=fusionIngredients(result);');
const old="const fx=mergeBurst(result,ingredients),merged=document.createElement('span');";
const start=s.indexOf(old),end=s.indexOf('\n   }else{selected=result.selected;',start);if(start<0||end<0)throw Error('Merge branch not found');
s=s.slice(0,start)+`showReveal(true);
    // Let the existing responsive card reserve its final space before flying.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const fx=mergeBurst(result,ingredients);fx.placeResult?.($('#modal .reveal-char'));tone();
    try{await delay(fx.duration);}finally{fx.cancel?.();activeFx=null;finishReveal();}`+s.slice(end);
s=s.replace("if(result.match)await presentMatch();else X.ready();","if(!result.match)X.ready();");
s=s.replace("function showReveal(){if(!state.pending)return;revealStarted=Date.now();X.log('card_open',{recipe:state.pending.recipe});", "function showReveal(staged=false){if(!state.pending)return;");
s=s.replace('<section class="kp-modal reveal-modal cinematic-reveal" role="dialog" aria-modal="true"><div class="kp-modal-title">${state.pending.firstTime?', '<section class="kp-modal reveal-modal cinematic-reveal" data-fusion="${staged?\'fusing\':\'ready\'}" role="dialog" aria-modal="true" aria-busy="${staged}"><div class="kp-modal-title">${state.pending.firstTime?');
s=s.replace("r.kanji+' — '+r.meaning);burst();}","r.kanji+' — '+r.meaning,!staged);if(staged){$('#modal .reveal-info-panel').inert=true;$('#modal [data-action=\"continue\"]').disabled=true;}else finishReveal();}\n function finishReveal(){const modal=$('#modal .cinematic-reveal');if(!modal||!state.pending)return;modal.dataset.fusion='ready';modal.setAttribute('aria-busy','false');modal.querySelector('.reveal-info-panel').inert=false;const button=modal.querySelector('[data-action=\"continue\"]');button.disabled=false;button.focus({preventScroll:true});if(!revealStarted){revealStarted=Date.now();X.log('card_open',{recipe:state.pending.recipe});}} ");
fs.writeFileSync(file,s);
