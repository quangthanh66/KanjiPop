(()=>{
 'use strict';
 const E=window.KanjiPairs,root=document.getElementById('kanji-pop'),$=s=>root.querySelector(s),key='kanji-pop-pairs-v6';
 let state=E.fresh(),history=[],undos=3,selected=null,sound=false,busy=false,audio,gesture;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,delay=ms=>new Promise(r=>setTimeout(r,reduced?0:ms));
 try{const saved=JSON.parse(localStorage.getItem(key));if(E.valid(saved?.state)){state=saved.state;history=(Array.isArray(saved.history)?saved.history:[]).filter(s=>E.valid(s)&&s.pending===null).slice(-3);undos=Number.isInteger(saved.undos)?Math.max(0,Math.min(3,saved.undos)):3;sound=!!saved.sound;}}catch{}
 function save(){try{localStorage.setItem(key,JSON.stringify({state,history,undos,sound}));}catch{}}
 function icons(){globalThis.lucide?.createIcons();}
 function say(text){$('#feedback').textContent=text;}
 function tone(){if(!sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();[523,659,784,1047].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.09;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.055,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.31);});}catch{}}
 function burst(){if(reduced)return;for(let i=0;i<28;i++){const p=document.createElement('span');p.className='kp-particle';p.style.cssText=`--x:${(Math.random()-.5)*330}px;--y:${(Math.random()-.7)*360}px;--r:${Math.random()*650}deg;--c:${['#ffd230','#aa6cef','#78dd26','#ff7e91','#fff'][i%5]}`;$('#kp-confetti').append(p);setTimeout(()=>p.remove(),1100);}}
 function position(el,at){const w=($('#tiles').clientWidth-(E.COLS-1)*6)/E.COLS,h=($('#tiles').clientHeight-(E.ROWS-1)*6)/E.ROWS;el.style.width=w+'px';el.style.height=h-3+'px';el.style.transform=`translate(${at%E.COLS*(w+6)}px,${Math.floor(at/E.COLS)*(h+6)}px)`;}
 function tile(piece,at,board){
  const movable=E.neighbors(at).some(i=>board[i]===null),t=document.createElement('button');t.type='button';t.className='board-tile'+(selected===at?' selected':'')+(movable?' movable':'');t.dataset.at=at;t.dataset.id=piece.id;t.dataset.pair=piece.pair;t.lang='ja';t.setAttribute('aria-label',piece.part+', nhóm '+(piece.pair+1)+', hàng '+(Math.floor(at/E.COLS)+1)+', cột '+(at%E.COLS+1)+(movable?', chạm để trượt vào ô trống':', chưa sát ô trống'));
  t.innerHTML=piece.part+'<span class="pair-mark" aria-hidden="true">'+E.recipes[piece.pair].mark+'</span>';position(t,at);return t;
 }
 function draw(board=state.board){
  $('#tiles').innerHTML='';$('#effects').innerHTML='';board.forEach((p,i)=>{if(p)$('#tiles').append(tile(p,i,board));});
  [...$('.board-cells').children].forEach((c,i)=>{c.classList.toggle('empty',board[i]===null);c.textContent=board[i]===null?'TRỐNG':'';});
 }
 function controls(){root.querySelectorAll('#restart,#help,#kp-pause').forEach(b=>b.disabled=busy);$('#undo').disabled=busy||!history.length||!undos;$('#undo-count').textContent=undos;root.setAttribute('aria-busy',String(busy));}
 function soundIcon(){const b=$('#kp-sound');b.setAttribute('aria-pressed',String(sound));b.setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');b.innerHTML=`<i data-lucide="${sound?'volume-2':'volume-x'}" aria-hidden="true">♪</i>`;}
 function render(){
  $('#kp-points').textContent=state.score;$('#moves').textContent=state.moves;$('#pair-count').textContent=state.matches;$('#free-spaces').textContent=state.board.filter(x=>x===null).length;
  draw();soundIcon();controls();icons();
 }
 function select(at){if(busy||!$('#modal').hidden||!state.board[at]||state.pending!==null)return;selected=at;for(const t of $('#tiles').children)t.classList.toggle('selected',Number(t.dataset.at)===at);}
 async function move(dir){
  if(busy||!$('#modal').hidden)return;
  const result=E.move(state,selected,dir);
  if(!result.changed){say(result.reason==='select'?'Chạm một khối cạnh ô trống nhé.':'Chỉ được trượt vào ô trống ngay bên cạnh.');return;}
  busy=true;controls();history.push(E.clone(state));history=history.slice(-3);
  try{
   const moving=$(`#tiles [data-at="${result.from}"]`);if(moving){moving.style.zIndex=5;void moving.offsetWidth;position(moving,result.to);}await delay(190);
   if(result.match){
    for(const id of result.match.ids)$(`#tiles [data-id="${id}"]`)?.classList.add('merging');await delay(190);
    draw(result.state.board);
    const merged=document.createElement('span');merged.className='board-tile pair-result';merged.lang='ja';merged.textContent=E.recipes[result.match.pair].kanji;position(merged,result.to);$('#effects').append(merged);tone();await delay(320);
    selected=null;say('Hai khối cùng màu đã ghép! +100 điểm.');
   }else{selected=result.selected;say('Đưa hai khối cùng màu chạm cạnh nhau để ghép.');}
   state=result.state;save();render();
  }finally{busy=false;controls();}
  if(result.match)showReveal();
 }
 function tap(at){if(busy||!$('#modal').hidden)return;select(at);const dir=E.directionToBlank(state,at);if(dir)move(dir);else say('Khối này chưa sát ô trống. Chạm khối có viền sáng nhé.');}
 function modalOpen(html,label){const m=$('#modal');m.hidden=false;[...root.children].filter(e=>!['modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=true);m.innerHTML=html;m.querySelector('[role="dialog"]').setAttribute('aria-label',label);m.querySelector('button')?.focus({preventScroll:true});}
 function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';[...root.children].filter(e=>!['modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=false);}
 function showReveal(){
  if(!state.pending)return;const r=E.recipes[state.pending.pair];
  modalOpen(`<section class="kp-modal reveal-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">GHÉP THÀNH CÔNG!</div><div class="reveal-kicker">BẠN VỪA TẠO RA</div><div class="reveal-stage"><div class="reveal-rays" aria-hidden="true"></div><span class="reveal-spark a" aria-hidden="true">✦</span><span class="reveal-spark b" aria-hidden="true">✧</span><span class="reveal-spark c" aria-hidden="true">✦</span><span class="reveal-char" lang="ja">${r.kanji}</span></div><div class="reveal-meaning">${r.meaning}</div><div class="reveal-formula" lang="ja">${r.parts.join(' + ')} → ${r.kanji}</div><p class="reveal-note">${r.note}</p><div class="reveal-word"><strong lang="ja">${r.word}</strong><span class="reading" lang="ja">${r.reading}</span><small>${r.translation}</small></div><div class="reveal-count">+100 điểm · Đã khám phá ${state.discovered.length} chữ</div><button class="kp-action" data-action="continue">Tiếp tục chơi →</button><p class="refill-note">2 khối mới sẽ lấp vào chỗ vừa ghép</p></section>`,r.kanji+' — '+r.meaning);burst();
 }
 async function continueGame(){
  if(busy||!state.pending)return;busy=true;const spawn=state.pending.spawn;state=E.resume(state);selected=null;closeModal();save();render();
  for(const {tile} of spawn)$(`#tiles [data-id="${tile.id}"]`)?.classList.add('spawn');
  say('Đã bù 2 khối mới. Bàn vẫn còn đúng 1 ô trống.');await delay(320);busy=false;controls();
 }
 function showHelp(){
  if(busy)return;
  modalOpen(`<section class="kp-modal help-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">TRƯỢT · CHẠM · POP!</div><div class="rules"><p><strong>1. Tìm ô trống.</strong><br>Chạm một khối sát ô trống để trượt vào đó. Bạn cũng có thể vuốt khối theo hướng ô trống.</p><p><strong>2. Đưa hai màu giống nhau lại gần.</strong><br>Hai khối cùng màu chạm cạnh ngang hoặc dọc sẽ tự biến mất và cộng 100 điểm. Chạm chéo không tính.</p><p><strong>3. Chơi trước, học sau.</strong><br>Xem chữ Kanji vừa tạo, rồi tiếp tục. Hai khối mới xuất hiện đúng chỗ vừa ghép; các khối khác đứng yên.</p><p>Luôn còn <strong>1 ô trống</strong> sau khi bù khối. Chơi liên tục, không đếm giờ. Viền sáng đánh dấu các khối có thể trượt.</p><p class="keyboard-note">Bàn phím: Tab chọn khối, Enter để trượt hoặc dùng phím mũi tên.</p></div><button class="kp-action" data-action="resume">Chơi tiếp →</button></section>`,'Cách chơi');
 }
 function undo(){if(busy||!history.length||!undos)return;state=history.pop();selected=null;undos--;closeModal();render();save();say('Đã khôi phục bàn và điểm trước lượt vừa rồi.');}
 function restart(){if(busy)return;state=E.fresh();history=[];selected=null;undos=3;closeModal();render();save();say('Chạm một khối sát ô trống để trượt vào.');}
 $('.board-cells').innerHTML='<span class="board-cell"></span>'.repeat(E.SIZE);
 $('#undo').addEventListener('click',undo);$('#restart').addEventListener('click',restart);$('#help').addEventListener('click',showHelp);$('#kp-pause').addEventListener('click',showHelp);
 $('#kp-sound').addEventListener('click',()=>{sound=!sound;soundIcon();icons();save();tone();});
 $('#modal').addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='resume'){closeModal();$('#help').focus({preventScroll:true});}if(a==='continue')continueGame();});
 const board=$('#slide-board');
 // Pointer gestures are resolved once on release. Native keyboard clicks use detail=0.
 $('#tiles').addEventListener('click',e=>{const t=e.target.closest('button.board-tile');if(t&&e.detail===0)tap(Number(t.dataset.at));});
 $('#tiles').addEventListener('focusin',e=>{const t=e.target.closest('button.board-tile');if(t)select(Number(t.dataset.at));});
 board.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||busy||!$('#modal').hidden)return;const t=e.target.closest('button.board-tile');if(!t)return;const at=Number(t.dataset.at);select(at);gesture={id:e.pointerId,at,x:e.clientX,y:e.clientY};board.setPointerCapture(e.pointerId);});
 board.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const g=gesture,dx=e.clientX-g.x,dy=e.clientY-g.y;gesture=null;if(board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId);if(Math.max(Math.abs(dx),Math.abs(dy))<25){tap(g.at);return;}select(g.at);move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
 board.addEventListener('pointercancel',()=>gesture=null);board.addEventListener('lostpointercapture',()=>gesture=null);
 document.addEventListener('keydown',e=>{if(!$('#modal').hidden){if(e.key==='Escape'&&$('#modal [data-action="resume"]'))closeModal();if(e.key==='Tab'){const bs=[...$('#modal').querySelectorAll('button')];if(e.shiftKey&&document.activeElement===bs[0]){e.preventDefault();bs.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===bs.at(-1)){e.preventDefault();bs[0].focus();}}return;}const dirs={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(dirs[e.key]){e.preventDefault();if(!e.repeat)move(dirs[e.key]);}});
 new ResizeObserver(()=>{if(!busy)draw();}).observe(board);
 render();if(state.pending!==null)showReveal();
})();
