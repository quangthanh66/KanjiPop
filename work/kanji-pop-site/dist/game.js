(() => {
  'use strict';
  const root = document.getElementById('kanji-pop');
  const $ = selector => root.querySelector(selector);
  const levels = [
    [
      { char:'休', part:'木', meaning:'Nghỉ ngơi', options:['木','本','末'], tip:'木 không có nét ngang ngắn ở gốc như 本, cũng không có nét ngang dài ở trên như 末.' },
      { char:'林', part:'木', meaning:'Rừng cây', options:['木','水','火'], tip:'林 có hai thành phần 木 đặt cạnh nhau.' },
      { char:'明', part:'月', meaning:'Sáng', options:['日','月','目'], tip:'Bên phải 明 là 月: có hai nét ngang ngắn bên trong.' },
      { char:'好', part:'子', meaning:'Yêu thích', options:['了','子','女'], tip:'子 có một nét ngang đi qua giữa; 了 không có nét này.' }
    ],
    [
      { char:'体', part:'本', meaning:'Cơ thể', options:['木','本','末'], tip:'Bên phải 体 là 本: chú ý nét ngang ngắn ở gần gốc.' },
      { char:'村', part:'寸', meaning:'Làng', options:['才','寸','木'], tip:'寸 có một nét chấm, khác với nét phẩy của 才.' },
      { char:'晴', part:'青', meaning:'Trời quang', options:['青','月','生'], tip:'Bên phải 晴 là toàn bộ thành phần 青.' },
      { char:'情', part:'青', meaning:'Tình cảm', options:['月','青','目'], tip:'情 và 晴 cùng có thành phần 青 ở bên phải.' }
    ],
    [
      { char:'住', part:'主', meaning:'Cư trú', options:['王','主','玉'], tip:'主 có một nét chấm ở phía trên; 玉 có nét chấm ở dưới bên phải.' },
      { char:'注', part:'主', meaning:'Rót vào', options:['玉','王','主'], tip:'Bên phải 注 là 主, có nét chấm ở phía trên.' },
      { char:'朋', part:'月', meaning:'Bạn bè', options:['月','目','日'], tip:'朋 gồm hai thành phần 月 đặt cạnh nhau.' },
      { char:'時', part:'寺', meaning:'Thời gian', options:['土','寺','寸'], tip:'Bên phải 時 cần toàn bộ 寺, gồm phần 土 ở trên và 寸 ở dưới.' }
    ]
  ];
  const key = 'kanji-pop-local-v2';
  let modalTimer, audio, unlockTimer, busy = false;
  let state = fresh(0);
  function shuffle(items) {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function fresh(level, sound = false) {
    return {version:2, level, selected:null, solved:[], mistakes:[0,0,0,0], hints:[], failed:[[],[],[],[]], orders:levels[level].map(c=>shuffle(c.options)), score:0, streak:0, best:0, sound};
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(key));
      if (!s || s.version !== 2 || !Number.isInteger(s.level) || !levels[s.level]) return;
      const validIndexes = a => Array.isArray(a) && a.every(i=>Number.isInteger(i)&&i>=0&&i<4);
      if (!validIndexes(s.solved) || !validIndexes(s.hints) || new Set(s.solved).size!==s.solved.length) return;
      if (!Array.isArray(s.mistakes) || s.mistakes.length!==4 || s.mistakes.some(x=>!Number.isInteger(x)||x<0)) return;
      if (!Array.isArray(s.failed) || s.failed.length!==4 || s.failed.some((a,i)=>!Array.isArray(a)||a.some(p=>!levels[s.level][i].options.includes(p)))) return;
      if (!Array.isArray(s.orders) || s.orders.length!==4 || s.orders.some((a,i)=>!Array.isArray(a)||a.length!==3||new Set(a).size!==3||a.some(p=>!levels[s.level][i].options.includes(p)))) return;
      if (![s.score,s.streak,s.best].every(x=>Number.isInteger(x)&&x>=0)) return;
      state = {...s, selected:null, sound:!!s.sound};
    } catch {}
  }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }
  function icons() { globalThis.lucide?.createIcons(); }
  function message(text, type='') { $('#kp-feedback').textContent=text; $('#kp-feedback').className='kp-feedback '+type; }
  function tone(combo) {
    if (!state.sound) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume();
      [523,659,combo?1047:784].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.075;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.22);});
    } catch {}
  }
  function burst() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const colors=['#ffd230','#aa6cef','#78dd26','#ff7e91','#fff9e8'];
    for(let i=0;i<22;i++){const p=document.createElement('span');p.className='kp-particle';p.style.cssText=`--x:${(Math.random()-.5)*330}px;--y:${(Math.random()-.8)*340}px;--r:${Math.random()*650}deg;--c:${colors[i%5]}`;$('#kp-confetti').append(p);setTimeout(()=>p.remove(),1000);}
  }
  function render() {
    $('#kp-level-no').textContent=String(state.level+1).padStart(2,'0');
    $('#kp-points').textContent=state.score; $('#kp-count').textContent=state.solved.length+' / 4';
    $('#kp-fill').style.width=state.solved.length*25+'%'; $('.kp-track').setAttribute('aria-valuenow',state.solved.length);
    $('#kp-grid').innerHTML=levels[state.level].map((c,i)=>{
      const solved=state.solved.includes(i), selected=state.selected===i;
      return `<button type="button" class="kp-kanji-card ${solved?'solved':''} ${selected?'selected':''} ${selected&&state.hints.includes(i)?'revealed':''}" data-card="${i}" ${solved?'disabled':''} aria-pressed="${selected}" aria-label="${solved?c.char+' — '+c.meaning+' — đã hoàn thành':'Chọn ô '+(i+1)+' — '+c.meaning}"><span class="kp-char-area" aria-hidden="true"><span class="kp-full" lang="ja">${c.char}</span><span class="kp-hole">?</span></span><span class="kp-meaning">${c.meaning}</span><span class="kp-check" aria-hidden="true">✓</span></button>`;
    }).join('');
    $('#kp-step').textContent=state.solved.length===4?'HOÀN THÀNH!':state.selected===null?'1 · CHỌN MỘT Ô CHỮ':'2 · CHỌN MẢNH CHO Ô ĐÃ CHỌN';
    const options=state.selected===null?['?','?','?']:state.orders[state.selected];
    $('#kp-pieces').innerHTML=options.map(p=>{
      const failed=state.selected!==null&&state.failed[state.selected].includes(p);
      return `<button type="button" class="kp-piece ${state.selected===null?'empty':''} ${failed?'failed':''}" lang="ja" data-piece="${p}" aria-label="${state.selected===null?'Chọn một ô chữ trước':'Chọn thành phần '+p}" ${state.selected===null||failed||busy?'disabled':''}>${p}</button>`;
    }).join('');
    $('#kp-streak').textContent=state.streak>1?'Chuỗi đúng ×'+state.streak:'Không giới hạn thời gian';
    $('#kp-hint').disabled=state.solved.length===4;
    renderSound(); icons();
  }
  function renderSound(){const b=$('#kp-sound');b.setAttribute('aria-pressed',String(state.sound));b.setAttribute('aria-label',state.sound?'Tắt âm thanh':'Bật âm thanh');b.innerHTML=`<i data-lucide="${state.sound?'volume-2':'volume-x'}" aria-hidden="true">${state.sound?'♫':'♪'}</i>`;}
  function select(index) {
    if(busy || !$('#kp-modal').hidden || state.solved.includes(index))return;
    state.selected=index;render();
    const c=levels[state.level][index];
    message(state.hints.includes(index)?c.tip:'Ô “'+c.meaning+'”: chọn thành phần còn thiếu.');
    $(`[data-card="${index}"]`).focus({preventScroll:true});
  }
  function pick(part) {
    if(busy || !$('#kp-modal').hidden || state.selected===null)return;
    const i=state.selected,c=levels[state.level][i];
    if(state.solved.includes(i)||!c.options.includes(part)||state.failed[i].includes(part))return;
    if(part!==c.part){
      state.mistakes[i]++;state.streak=0;state.failed[i].push(part);busy=true;render();
      message(part+' chưa khớp ô này. '+c.tip,'error');
      $(`[data-card="${i}"]`).classList.add('wrong');save();
      unlockTimer=setTimeout(()=>{busy=false;render();},550);
      return;
    }
    const clean=state.mistakes[i]===0&&!state.hints.includes(i);
    state.streak=clean?state.streak+1:0;state.best=Math.max(state.best,state.streak);
    const gain=100+(state.streak>1?(state.streak-1)*25:0);
    state.score+=gain;state.solved.push(i);state.selected=null;render();
    $(`[data-card="${i}"]`).classList.add('just-solved');
    message(state.streak>1?'✦ ĐÚNG LIÊN TIẾP ×'+state.streak+' · +'+gain+' điểm':c.char+' · '+c.meaning+' — đúng rồi!');
    if(state.streak>1){$('#kp-feedback').classList.add('combo');burst();}tone(state.streak>1);save();
    const next=root.querySelector('[data-card]:not(:disabled)');next?.focus({preventScroll:true});
    if(state.solved.length===4)modalTimer=setTimeout(()=>showModal('complete'),850);
  }
  function hint(){
    if(busy||!$('#kp-modal').hidden||state.solved.length===4)return;
    if(state.selected===null){message('Chọn ô cần giúp trước, rồi chạm Gợi ý.');return;}
    const i=state.selected,c=levels[state.level][i];
    if(!state.hints.includes(i))state.hints.push(i);
    state.streak=0;render();message('Mẫu '+c.char+': '+c.tip);save();
  }
  function closeModal(){$('#kp-modal').hidden=true;$('#kp-modal').innerHTML='';[...root.children].filter(e=>!['kp-modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=false);}
  function showModal(kind){
    clearTimeout(modalTimer);const m=$('#kp-modal');m.hidden=false;
    [...root.children].filter(e=>!['kp-modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=true);
    if(kind==='complete'){
      const clean=state.solved.filter(i=>state.mistakes[i]===0&&!state.hints.includes(i)).length;
      const stars=clean===4?3:clean>=2?2:1;burst();
      m.innerHTML=`<section class="kp-modal" role="dialog" aria-modal="true" aria-label="Hoàn thành màn"><div class="kp-modal-title">TUYỆT VỜI!</div><div class="kp-stars" aria-label="${stars} trên 3 sao">${[0,1,2].map(i=>`<span class="${i>=stars?'kp-empty-star':''}" style="font-size:${i===1?61:45}px">★</span>`).join('')}</div><div class="kp-result-label">ĐIỂM CỦA BẠN</div><div class="kp-score">${state.score}</div><div class="kp-learned"><b lang="ja">${levels[state.level].map(c=>c.char).join(' ')}</b>${clean}/4 chữ đúng ngay lần đầu, không gợi ý.</div><div class="kp-streak-note">Sao: 1 khi hoàn thành · 2 khi tự giải đúng 2 chữ · 3 khi tự giải đúng cả 4 chữ.</div><button class="kp-action" data-action="next">${state.level<levels.length-1?'Màn tiếp theo':'Chơi từ đầu'} →</button><button class="kp-secondary" data-action="replay">Chơi lại màn này</button></section>`;
    }else m.innerHTML='<section class="kp-modal" role="dialog" aria-modal="true" aria-label="Tạm dừng"><div class="kp-modal-title">NGHỈ MỘT CHÚT</div><div class="kp-stars" aria-hidden="true">☁</div><div class="kp-learned">Chọn ô chữ → chọn mảnh phù hợp.<br>Gợi ý luôn có sẵn, không mất lượt.</div><button class="kp-action" data-action="resume">Chơi tiếp →</button><button class="kp-secondary" data-action="replay">Bắt đầu lại màn</button></section>';
    m.querySelector('button').focus({preventScroll:true});
  }
  function reset(next=false){clearTimeout(modalTimer);clearTimeout(unlockTimer);busy=false;state=fresh(next?(state.level+1)%levels.length:state.level,state.sound);closeModal();render();message('Chọn ô chữ bạn muốn hoàn thành.');save();}
  $('#kp-grid').addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(b&&!b.disabled)select(Number(b.dataset.card));});
  $('#kp-pieces').addEventListener('click',e=>{const b=e.target.closest('[data-piece]');if(b&&!b.disabled)pick(b.dataset.piece);});
  $('#kp-hint').addEventListener('click',hint);
  $('#kp-reset').addEventListener('click',()=>reset());
  $('#kp-pause').addEventListener('click',()=>showModal(state.solved.length===4?'complete':'pause'));
  $('#kp-sound').addEventListener('click',()=>{state.sound=!state.sound;renderSound();icons();tone(false);save();});
  $('#kp-modal').addEventListener('click',e=>{const a=e.target.closest('[data-action]')?.dataset.action;if(a==='next')reset(true);if(a==='replay')reset();if(a==='resume'){closeModal();$('#kp-pause').focus();}});
  root.addEventListener('keydown',e=>{if($('#kp-modal').hidden)return;if(e.key==='Escape'){closeModal();$('#kp-pause').focus();}if(e.key==='Tab'){const buttons=[...$('#kp-modal').querySelectorAll('button')];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}}});
  load();render();if(state.solved.length===4)showModal('complete');
})();
