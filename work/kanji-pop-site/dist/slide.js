(() => {
 'use strict';
 const E=window.KanjiSlide,root=document.getElementById('kanji-pop'),$=s=>root.querySelector(s),key='kanji-pop-single-v4';
 let state=E.fresh(),history=[],undos=3,sound=false,busy=false,audio=null,gesture=null,selected=null;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,reduced?0:ms));
 function valid(s){return s&&s.version===4&&Number.isInteger(s.level)&&E.levels[s.level]&&Array.isArray(s.board)&&s.board.length===16&&s.board.every(v=>[null,'木','亻','日','月'].includes(v))&&E.recipes.every(r=>Number.isInteger(s.collected?.[r.char])&&s.collected[r.char]>=0)&&['moves','score','seed','spawnIndex','spawnClock'].every(k=>Number.isInteger(s[k])&&s[k]>=0);}
 try{const saved=JSON.parse(localStorage.getItem(key));if(valid(saved?.state)){state=saved.state;history=Array.isArray(saved.history)?saved.history.filter(s=>valid(s)&&s.level===state.level).slice(-3):[];undos=Number.isInteger(saved.undos)?Math.max(0,Math.min(3,saved.undos)):3;sound=!!saved.sound;}}catch{}
 function save(){try{localStorage.setItem(key,JSON.stringify({state,history,undos,sound}));}catch{}}
 function icons(){globalThis.lucide?.createIcons();}
 function say(text,combo=false){$('#feedback').textContent=text;$('#feedback').classList.toggle('combo',combo);}
 function tone(combo){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();[523,659,combo?1047:784].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.075;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.22);});}catch{}}
 function confetti(){if(reduced)return;for(let i=0;i<22;i++){const p=document.createElement('span');p.className='kp-particle';p.style.cssText=`--x:${(Math.random()-.5)*330}px;--y:${(Math.random()-.8)*340}px;--r:${Math.random()*650}deg;--c:${['#ffd230','#aa6cef','#78dd26','#ff7e91'][i%4]}`;$('#kp-confetti').append(p);setTimeout(()=>p.remove(),1000);}}
 function geometry(at){const width=$('#tiles').clientWidth,cell=(width-18)/4;return {x:(at%4)*(cell+6),y:Math.floor(at/4)*(cell+6),cell};}
 function position(tile,at){const {x,y,cell}=geometry(at);tile.style.width=cell+'px';tile.style.height=(cell-3)+'px';tile.style.transform=`translate(${x}px,${y}px)`;}
 function tile(symbol,at,extra=''){const effect=extra.includes('result'),el=document.createElement(effect?'span':'button');if(!effect){el.type='button';el.setAttribute('aria-pressed',String(selected===at));}el.className='board-tile '+extra+(!effect&&selected===at?' selected':'');el.dataset.at=at;el.dataset.symbol=symbol;el.lang='ja';el.textContent=symbol;el.setAttribute('aria-label','Chọn '+symbol+' — hàng '+(Math.floor(at/4)+1)+', cột '+(at%4+1));position(el,at);return el;}
 function drawBoard(spawnAt=-1){$('#tiles').innerHTML='';$('#effects').innerHTML='';state.board.forEach((v,i)=>{if(v)$('#tiles').append(tile(v,i,i===spawnAt?'spawn':''));});}
 function controls(){root.querySelectorAll('#restart,#help,#kp-pause').forEach(el=>el.disabled=busy);root.querySelectorAll('.direction').forEach(el=>el.disabled=busy||selected===null||!E.slide(state.board,el.dataset.dir,selected).changed);$('#undo').disabled=busy||!history.length||undos===0;$('#undo-count').textContent=undos;root.setAttribute('aria-busy',String(busy));}
 function select(at){if(busy||!$('#modal').hidden||!state.board[at]||E.done(state))return;selected=at;for(const t of $('#tiles').children){const active=Number(t.dataset.at)===at;t.classList.toggle('selected',active);t.setAttribute('aria-pressed',String(active));}controls();say(E.directions.some(d=>E.slide(state.board,d,at).changed)?'Đã chọn '+state.board[at]+'. Vuốt một hướng hoặc bấm mũi tên.':'Khối '+state.board[at]+' đang bị chặn. Chọn khối khác nhé.');}
 function render(spawnAt=-1){
  const config=E.levels[state.level];$('#kp-level-no').textContent=String(state.level+1).padStart(2,'0');$('#kp-points').textContent=state.score;
  $('#goals').innerHTML=E.recipes.map(r=>{const need=config.targets[r.char],n=Math.min(need,state.collected[r.char]);return `<div class="goal ${n===need?'complete':''}" aria-label="${r.parts.join(' cộng ')} thành ${r.char}, ${r.meaning}, đã thu thập ${n} trên ${need}"><div class="goal-formula" lang="ja">${r.parts.join(' + ')}</div><div class="goal-result"><span class="goal-char" lang="ja">${r.char}</span><span class="goal-count">${n===need?'✓ ':''}${n}/${need}</span></div><div class="goal-name">${r.meaning}</div></div>`;}).join('');
  const done=E.recipes.reduce((n,r)=>n+Math.min(config.targets[r.char],state.collected[r.char]),0),total=Object.values(config.targets).reduce((a,b)=>a+b,0);
  $('#kp-progress').textContent=done+' / '+total;$('#moves').textContent=state.moves;$('#free-spaces').textContent=state.board.filter(x=>x===null).length;$('#next-piece').textContent=E.done(state)?'—':E.next(state);$('#spawn-after').textContent=Math.max(1,3-state.spawnClock);
  $('#kp-sound').setAttribute('aria-pressed',String(sound));$('#kp-sound').setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');$('#kp-sound').innerHTML=`<i data-lucide="${sound?'volume-2':'volume-x'}" aria-hidden="true">♪</i>`;
  drawBoard(spawnAt);controls();icons();
 }
 async function move(dir){
  if(busy||!$('#modal').hidden||E.done(state))return;
  const result=E.step(state,dir,selected);
  if(!result.changed){say(result.plan.reason==='select'?'Chạm chọn một khối trước nhé.':result.plan.reason==='edge'?'Khối đã sát mép bàn. Chọn hướng khác.':'Ô bên cạnh có mảnh không ghép được. Chọn hướng khác.');if(result.stuck)showModal('stuck');return;}
  busy=true;controls();history.push(E.clone(state));history=history.slice(-3);
  try{
   const before=[...$('#tiles').children];void $('#tiles').offsetWidth;
   for(const m of result.plan.motions){const el=before.find(t=>Number(t.dataset.at)===m.from);if(el)position(el,m.to);}
   await delay(190);
   $('#tiles').innerHTML='';
   result.plan.board.forEach((v,i)=>{if(v)$('#tiles').append(tile(v,i));});
   for(const m of result.plan.merges)$('#effects').append(tile(m.char,m.at,'result'));
   if(result.plan.merges.length){
    const names=result.plan.merges.map(m=>m.char+' · '+m.meaning).join(' / ');
    say((result.plan.merges.length>1?'COMBO ×'+result.plan.merges.length+'! ':'')+names,result.plan.merges.length>1);
    tone(result.plan.merges.length>1);if(result.plan.merges.length>1)confetti();
    await delay(340);
    for(const el of $('#effects').children){const at=Number(el.dataset.at),g=geometry(at);el.classList.add('collect');el.style.transform=`translate(${g.x}px,${g.y-35}px) scale(.65)`;}
    await delay(190);
   }else say(result.spawn?'Đã đi một ô. Một khối mới vừa xuất hiện.':'Đã đi một ô. Bạn có thể đi tiếp hoặc chọn khối khác.');
   state=result.state;selected=result.plan.selected;save();render(result.spawn?.at??-1);
  }finally{busy=false;controls();}
  if(result.won)showModal('complete');else if(result.stuck)showModal('stuck');
 }
 function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';[...root.children].filter(e=>!['modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=false);}
 function showModal(type){
  if(busy)return;
  const m=$('#modal');m.hidden=false;[...root.children].filter(e=>!['modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=true);
  let title,body,actions;
  if(type==='complete'){
   title='THU THẬP ĐỦ RỒI!';body=`<div class="result-words" lang="ja">林 休 明</div><div class="kp-result-label">${state.moves} LƯỢT DI CHUYỂN</div><div class="kp-score">${state.score} điểm</div><div class="kp-learned">Bạn đã hoàn thành tất cả mục tiêu.<br>Thử bàn mới với ít khoảng trống hơn!</div>`;
   actions=`<button class="kp-action" data-action="next">${state.level<2?'Màn tiếp theo':'Chơi từ đầu'} →</button><button class="kp-secondary" data-action="restart">Chơi lại màn này</button>`;confetti();
  }else if(type==='stuck'){
   title='BÀN ĐÃ ĐẦY!';body='<div class="result-words">✦</div><div class="kp-learned">Không còn hướng trượt hoặc cặp ghép hợp lệ. Thử quay lại một bước để đổi hướng.</div>';
   actions=`${history.length&&undos>0?'<button class="kp-action" data-action="undo">Hoàn tác · còn '+undos+'</button>':''}<button class="kp-action" data-action="restart">Chơi lại</button>`;
  }else{
   title='CHỌN · DỊCH · GHÉP';body='<div class="rules"><p><strong>1. Chạm chọn một khối.</strong> Khối được chọn có viền tím.</p><p><strong>2. Vuốt hoặc bấm mũi tên.</strong> Chỉ khối đó đi đúng một ô. Các khối khác đứng yên.</p><p><strong>3. Đi vào mảnh ghép phù hợp</strong> để tạo chữ theo công thức phía trên. Hai mảnh được thu thập, giải phóng chỗ.</p><p>Sau <strong>3 lượt hợp lệ</strong>, thêm một khối mới. Nếu bàn trống hoàn toàn, thêm khối ngay. Không giới hạn thời gian; có 3 lần hoàn tác.</p></div>';
   actions='<button class="kp-action" data-action="resume">Chơi tiếp →</button>';
  }
  m.innerHTML=`<section class="kp-modal" role="dialog" aria-modal="true" aria-label="${title}"><div class="kp-modal-title">${title}</div>${body}${actions}</section>`;m.querySelector('button')?.focus({preventScroll:true});
 }
 function undo(){if(busy||!history.length||undos===0)return;state=history.pop();selected=null;undos--;closeModal();render();save();say('Đã hoàn tác. Chọn một khối để thử hướng khác!');}
 function restart(next=false){if(busy)return;state=E.fresh(next?(state.level+1)%E.levels.length:state.level);history=[];undos=3;selected=null;closeModal();render();save();say('Chạm một khối → vuốt để đi đúng một ô.');}
 $('.board-cells').innerHTML='<span class="board-cell"></span>'.repeat(16);
 root.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));
 $('#undo').addEventListener('click',undo);$('#restart').addEventListener('click',()=>restart());$('#help').addEventListener('click',()=>showModal('help'));$('#kp-pause').addEventListener('click',()=>showModal('help'));
 $('#kp-sound').addEventListener('click',()=>{sound=!sound;save();$('#kp-sound').setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');$('#kp-sound').setAttribute('aria-pressed',String(sound));$('#kp-sound').innerHTML=`<i data-lucide="${sound?'volume-2':'volume-x'}">♪</i>`;icons();tone(false);});
 $('#modal').addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='resume'){closeModal();$('#help').focus({preventScroll:true});}if(a==='restart')restart();if(a==='next')restart(true);if(a==='undo')undo();});
 const board=$('#slide-board');
 $('#tiles').addEventListener('click',e=>{const t=e.target.closest('button.board-tile');if(t)select(Number(t.dataset.at));});
 board.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||busy||!$('#modal').hidden)return;const t=e.target.closest('button.board-tile');if(t)select(Number(t.dataset.at));if(selected===null)return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY};board.setPointerCapture(e.pointerId);});
 board.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.max(Math.abs(dx),Math.abs(dy))<25)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
 board.addEventListener('pointercancel',()=>gesture=null);board.addEventListener('lostpointercapture',()=>gesture=null);
 document.addEventListener('keydown',e=>{
  if(!$('#modal').hidden){if(e.key==='Tab'){const bs=[...$('#modal').querySelectorAll('button')];if(e.shiftKey&&document.activeElement===bs[0]){e.preventDefault();bs.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===bs.at(-1)){e.preventDefault();bs[0].focus();}}if(e.key==='Escape'&&$('#modal [data-action="resume"]'))closeModal();return;}
  const dirs={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(dirs[e.key]){e.preventDefault();if(!e.repeat)move(dirs[e.key]);}
 });
 new ResizeObserver(()=>{if(!busy)drawBoard();}).observe(board);
 render();if(E.done(state))showModal('complete');else if(!E.hasMoves(state.board))showModal('stuck');
})();
