(async()=>{
 'use strict';
 await window.KanjiWriterReady;
 const E=window.KanjiN5,root=document.getElementById('kanji-pop'),$=s=>root.querySelector(s);
 let currentGrade=localStorage.getItem('kanji-pop-grade')||'N5';
 if(!window.KanjiCourses?.[currentGrade])currentGrade='N5';
 let C=window.KanjiCourses?window.KanjiCourses[currentGrade]:E.C;
 E.setCourse?.(C);
 const key=KanjiSession.progressKey;
 function getGradeStorageKey(g){return 'kanji-pop-profile-'+(g||currentGrade).toLowerCase()+'-v1';}
 function loadGradeProfile(g){try{const raw=localStorage.getItem(getGradeStorageKey(g));if(raw)return JSON.parse(raw);}catch(e){}return {collected:[],results:{}};}
 function saveGradeProfile(g){try{localStorage.setItem(getGradeStorageKey(g||currentGrade),JSON.stringify(profile));}catch(e){}}
 const X=window.KanjiExperience,plans=window.KanjiCoursePlans;
 const deviceMode=()=>matchMedia('(min-width:900px)').matches?'desktop':'mobile';
 function makeFresh(id){const mode=deviceMode(),list=(C.grade==='N4'?(plans.modesN4?.[mode]||plans.modes[mode]):plans.modes[mode])||plans.modes[mode],p=list[id]||{seed:((id+1)*1337+Math.sin(id*99)*1000000)>>>0,baseline:40,three:50,two:75,opening:0};const s=E.fresh(id,p.seed,mode);s.benchmark={three:p.three,two:p.two};s.entryGuideSeen=false;s.runId=crypto.randomUUID();return s;}
 let state=makeFresh(0),profile=loadGradeProfile(currentGrade),history=[],undos=3,view='map',selected=null,busy=false,sound=false,gesture,audio;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,delay=ms=>new Promise(r=>setTimeout(r,reduced?0:ms));
 function syncSummaryHeight(){const panel=$('.kp-board'),summary=$('.play-summary');if(!panel||!summary)return;if(matchMedia('(min-width:900px)').matches&&view==='play'&&!$('#play-screen').hidden){const h=panel.getBoundingClientRect().height;if(h>0)summary.style.height=h+'px';}else summary.style.removeProperty('height');}
 const summaryObserver=new ResizeObserver(syncSummaryHeight);summaryObserver.observe($('.kp-board'));window.addEventListener('resize',syncSummaryHeight,{passive:true});
 // Fit the board to its actual reserved area, never to guessed header/message heights.
 function fitMobileBoard(){
  const mobile=matchMedia('(max-width:899px)').matches;$('#help').setAttribute('aria-label','Mở menu màn chơi');
  if(!mobile||view!=='play')return;
  const stage=$('.board-stage'),rect=stage.getBoundingClientRect();if(!rect.width||!rect.height)return;
  const infoHeight=$('.board-info').getBoundingClientRect().height,objectiveHeight=$('#play-objective').getBoundingClientRect().height;
  const footer=infoHeight+objectiveHeight+(infoHeight||objectiveHeight?8:0);
  const border=2,inset=14,gap=6,minCell=44;
  const landscape=matchMedia('(min-width:650px) and (max-height:600px) and (orientation:landscape)').matches;
  if(!landscape){
   const css=getComputedStyle(root),px=name=>parseFloat(css[name])||0;
   const rowGap=px('rowGap'),paddingY=px('paddingTop')+px('paddingBottom');
   // Reserve tutorial height when fitting, even when the compact footer is shown.
   // Hiding a tip can shrink the shell without resizing or moving the board.
   const fixed=($('#kp-home')?.getBoundingClientRect().height || 0)+$('.target-toolbar').getBoundingClientRect().height+44+rowGap*3+paddingY+footer;
   const minWidth=state.cols*minCell+(state.cols-1)*gap+inset+border;
   const minHeight=fixed+minWidth*state.rows/state.cols;
   const available=Math.max(innerHeight,minHeight)-fixed;
   const width=Math.min(root.clientWidth-px('paddingLeft')-px('paddingRight'),available*state.cols/state.rows);
   for(const [el,name,value] of [[root,'--mobile-min-height',minHeight],[root,'--mobile-frame-width',width],[stage,'--mobile-board-width',width]]){
    if(Math.abs((parseFloat(el.style.getPropertyValue(name))||0)-value)>.4)el.style.setProperty(name,value.toFixed(2)+'px');
   }
   return;
  }
  const available=Math.max(0,rect.height-footer),minWidth=state.cols*minCell+(state.cols-1)*gap+inset+border;
  const minHeight=root.getBoundingClientRect().height-rect.height+minWidth*state.rows/state.cols+footer;
  if(Math.abs((parseFloat(root.style.getPropertyValue('--mobile-min-height'))||0)-minHeight)>.4)root.style.setProperty('--mobile-min-height',minHeight.toFixed(2)+'px');
  const width=Math.min(rect.width,Math.max(Math.min(minWidth,rect.width),available*state.cols/state.rows));
  const current=parseFloat(stage.style.getPropertyValue('--mobile-board-width'))||0;
  if(Math.abs(current-width)>.4)stage.style.setProperty('--mobile-board-width',width.toFixed(2)+'px');
 }
 // A classic scrollbar can change the root's content width without resizing
 // the stage, whose grid width is still fixed by the previous fitted value.
 // Observe that available space directly instead of waiting for the next move.
 const mobileFitObserver=new ResizeObserver(fitMobileBoard);for(const el of [root,$('.board-stage'),$('.board-info'),$('#play-objective')])mobileFitObserver.observe(el);window.addEventListener('resize',fitMobileBoard,{passive:true});
 function unlocked(){let i=0;while(i<C.levels.length&&profile.results[i])i++;return i;}
 const saveNotice=document.createElement('button');saveNotice.className='save-notice';saveNotice.hidden=true;saveNotice.type='button';saveNotice.setAttribute('role','status');root.append(saveNotice);
 function storageNotice(kind){const messages={readonly:KanjiWriter.reason()==='other-tab'?'Tab khác đang giữ quyền lưu. Đóng tab đó rồi tải lại tab này; bạn vẫn có thể xuất bản sao.':'Trình duyệt chưa hỗ trợ khóa lưu an toàn. Bạn vẫn có thể xuất bản sao.',recovered:'Đã mở bản dự phòng vì bản lưu chính không đọc được.',damaged:'Bản lưu cũ bị lỗi. Đã giữ lại dữ liệu gốc; bạn có thể nhập bản sao.',blocked:'Trình duyệt không cho lưu an toàn. Hãy xuất tiến trình trước khi đóng.', 'write-failed':'Chưa lưu được tiến trình. Hãy xuất bản sao để tránh mất lượt chơi.',conflict:'Một tab khác đã cập nhật tiến trình. Tab này sẽ không ghi đè.'};saveNotice.textContent=messages[kind]+' Mở sao lưu';saveNotice.hidden=false;}
 const progressStore=KanjiProgress.create({getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},E,deviceMode,storageNotice,{key,canWrite:()=>KanjiWriter.canWrite()});
 const restored=progressStore.read();
 if(restored){({state,profile,history,undos,view,sound}=restored);}
 function snapshot(){return {course:C.id,state,profile,history,undos,view,sound};}
 function switchGrade(grade){
  if(grade===currentGrade||!window.KanjiCourses?.[grade])return;
  save();
  currentGrade=grade;
  localStorage.setItem('kanji-pop-grade',currentGrade);
  C=window.KanjiCourses[currentGrade];
  window.KanjiCourse=C;
  E.setCourse?.(C);
  profile=loadGradeProfile(currentGrade);
  state=makeFresh(0);
  history=[];undos=3;selected=null;mapChapter=0;mapSelected=0;
  if(view==='play')view='map';
  render();
  icons();
 }
 function save(){saveGradeProfile();return progressStore.write(snapshot());}

 // -------------------------------------------------------------
 // i18n & Language Switcher
 // -------------------------------------------------------------
 const I18N = window.KanjiI18n || {
  getLang: () => 'vi',
  setLang: () => {},
  toggleLang: () => 'vi',
  t: k => k,
  getRecipeMeaning: r => r?.meaning || '',
  getRecipeTranslation: r => r?.translation || '',
  getRecipeNote: r => r?.note || ''
 };

 function updateLangUi(){
  const lang = I18N.getLang();
  const langBtn = $('#kp-lang');
  if(langBtn){
   langBtn.innerHTML = `<span>${lang === 'vi' ? 'EN' : 'VI'}</span>`;
   langBtn.title = lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt';
   langBtn.setAttribute('aria-label', lang === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt');
  }
  if(typeof document !== 'undefined'){
   document.documentElement.lang = lang;
  }
  const navMap = $('#nav-map');
  if(navMap) navMap.innerHTML = `<i data-lucide="map"></i>${I18N.t('navJourney')}`;
  const navPlay = $('#nav-play');
  if(navPlay) navPlay.innerHTML = `<i data-lucide="play"></i>${I18N.t('navPlay')}`;
  const navAlbum = $('#nav-album');
  if(navAlbum) navAlbum.innerHTML = `<i data-lucide="book-open"></i>${I18N.t('navAlbum')} <b id="album-count">${profile.collected.length}</b>`;
 }

 // -------------------------------------------------------------
 // Daily Kanji Puzzle (Wordle-style Challenge)
 // -------------------------------------------------------------
 function getDailyKey(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
 }

 function getDailyTarget(key = getDailyKey(), grade = currentGrade){
  let h = 0;
  const str = key + '-' + grade;
  for(let i=0; i<str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  const pool = C.ids;
  return pool[Math.abs(h) % pool.length];
 }

 function getDailyRecord(key = getDailyKey(), grade = currentGrade){
  try {
   const raw = localStorage.getItem('kp-daily-' + key + '-' + grade);
   if(raw) return JSON.parse(raw);
  } catch(e){}
  return null;
 }

 function saveDailyRecord(rec){
  try {
   localStorage.setItem('kp-daily-' + rec.date + '-' + rec.grade, JSON.stringify(rec));
  } catch(e){}
 }

 function generateDailyShareText(dateStr, r, moves, lang = I18N.getLang()){
  const meaning = I18N.getRecipeMeaning(r);
  const reading = r.reading || r.kunyomi || r.onyomi || '';
  const stars = moves <= 15 ? '🟩🟩🟩🟩' : moves <= 25 ? '🟩🟩🟨🟩' : '🟩🟨🟨🟩';
  if(lang === 'en'){
   return `Kanjidle Daily · ${dateStr}\n✦ Secret Kanji: ${r.id} (${meaning} · ${reading})\n🎯 ${moves} moves · Solved!\n💎 ${stars}\n👉 Play: https://quangthanh66.github.io/kanjipop/`;
  }
  return `Kanjidle Daily · ${dateStr}\n✦ Chữ bí mật: ${r.id} (${r.hanViet || meaning} · ${reading})\n🎯 ${moves} lượt đi · Hoàn thành!\n💎 ${stars}\n👉 Chơi tại: https://quangthanh66.github.io/kanjipop/`;
 }

 function showToast(msg){
  let toast = document.querySelector('.kp-share-toast');
  if(!toast){
   toast = document.createElement('div');
   toast.className = 'kp-share-toast';
   document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('visible');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=>{
   toast.classList.remove('visible');
  }, 2600);
 }

 function copyShareText(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
   navigator.clipboard.writeText(text).then(()=>{
    showToast(I18N.t('dailyCopied'));
   }).catch(()=>{
    fallbackCopy(text);
   });
  } else {
   fallbackCopy(text);
  }
 }

 function fallbackCopy(text){
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
   document.execCommand('copy');
   showToast(I18N.t('dailyCopied'));
  } catch(e){}
  ta.remove();
 }

 function startDailyPuzzle(){
  const key = getDailyKey();
  const targetId = getDailyTarget(key, currentGrade);
  const mode = deviceMode();
  let h = 0;
  for(let i=0; i<key.length; i++) h = (Math.imul(31, h) + key.charCodeAt(i)) | 0;
  const seed = Math.abs(h);

  const s = E.fresh(0, seed, mode);
  s.isDaily = true;
  s.dailyDate = key;
  s.dailyTarget = targetId;
  s.dailyGrade = currentGrade;

  const hasTarget = s.board.some(t => t && t.recipe === targetId);
  if(!hasTarget){
   const p0 = s.board.filter(t => t && t.pair === 0);
   p0.forEach(t => { t.recipe = targetId; });
  }

  state = s;
  state.entryGuideSeen = true;
  X.start(state, 'new');
  history = [];
  undos = 3;
  selected = null;
  comboStreak = 0;
  movesSinceMatch = 0;
  changeView('play');
  say(I18N.t('dailyGoal'));
 }

 function showDailyWin(r){
  const key = state.dailyDate || getDailyKey();
  const grade = state.dailyGrade || currentGrade;
  const rec = getDailyRecord(key, grade) || { moves: state.moves, date: key, target: r.id };
  const moves = rec.moves || state.moves || 0;
  const lang = I18N.getLang();
  const shareText = generateDailyShareText(key, r, moves, lang);

  burst(4, 0);
  A?.win();

  const bodyHtml = `
  <section class="kp-modal daily-win-modal" role="dialog" aria-modal="true" aria-label="${I18N.t('dailySolved')}">
   <div class="daily-win-badge">✦ ${I18N.t('dailyBadge')} · ${key} ✦</div>
   <h2>${I18N.t('dailySolved')}</h2>
   
   <div class="daily-target-card">
    <div class="daily-kanji-big" lang="ja">${r.id}</div>
    <div class="daily-kanji-info">
     <strong class="daily-meaning">${I18N.getRecipeMeaning(r)}</strong>
     <div class="daily-readings">
      <span>On: <b lang="ja">${r.onyomi||'—'}</b></span>
      <span>Kun: <b lang="ja">${r.kunyomi||'—'}</b></span>
     </div>
     <div class="daily-word">
      <span lang="ja">${r.word}</span> <small>【${r.reading}】</small> <em>${I18N.getRecipeTranslation(r)}</em>
      <button type="button" class="btn-voice-speak" data-speak="${r.reading||r.word}" aria-label="${I18N.t('pronounce')}">
       <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
       <span>${I18N.t('pronounce')}</span>
      </button>
     </div>
    </div>
   </div>
   
   <div class="daily-stats-row">
    <div class="daily-stat-item">
     <small>${I18N.t('dailyMoves')}</small>
     <strong>${moves}</strong>
    </div>
    <div class="daily-stat-item">
     <small>${I18N.t('formulaLabel')}</small>
     <strong lang="ja">${r.parts.join(' + ')}</strong>
    </div>
   </div>

   <div class="daily-share-preview" aria-hidden="true">
    <pre>${shareText}</pre>
   </div>

   <div class="daily-modal-actions">
    <button type="button" class="kp-action daily-share-btn" data-daily-share="${encodeURIComponent(shareText)}">
     <span>${I18N.t('dailyShareBtn')}</span>
    </button>
    <button type="button" class="kp-secondary" data-action="map">
     <span>${I18N.t('toJourney')}</span>
    </button>
   </div>
  </section>`;
  modalOpen(bodyHtml, I18N.t('dailySolved'));
 }
 let stagedProgress=null;
 function showProgress(){
  if(busy)return;stagedProgress=null;
  modalOpen('<section class="kp-modal progress-panel" role="dialog" aria-modal="true"><h2>Sao lưu tiến trình</h2><p>Tiến trình chỉ nằm trên trình duyệt này. Bản sao gồm bàn chơi, album, sao và lượt hoàn tác; không gồm nhật ký chơi thử hoặc tùy chỉnh hiệu ứng.</p><button class="kp-secondary" data-progress-export>Xuất tiến trình hiện tại</button><label id="progress-export-label" hidden>Bản JSON để sao chép<textarea id="progress-export-json" readonly></textarea></label><label>Nhập file bản sao<input type="file" accept="application/json,.json" id="progress-file"></label><button class="kp-secondary" data-progress-backup>Mở bản dự phòng tự động</button><div id="progress-preview" class="progress-confirm" hidden><p id="progress-summary"></p><p>Khôi phục sẽ thay tiến trình hiện tại. Hãy xuất bản sao trước nếu muốn giữ cả hai.</p><button class="kp-secondary" data-progress-confirm>Xác nhận khôi phục</button></div><p id="progress-status" role="status"></p><button class="kp-secondary" data-progress-reload>Tải lại bản lưu trên trình duyệt</button><button class="kp-action" data-action="close">Quay lại</button></section>','Sao lưu và khôi phục tiến trình');
 }
 function previewProgress(value){stagedProgress=value;$('#progress-preview').hidden=false;$('#progress-summary').textContent='Bản sao: '+value.profile.collected.length+'/24 chữ · '+Object.keys(value.profile.results).length+'/15 màn hoàn thành · đang ở màn '+(value.state.level+1)+', '+value.state.moves+' lượt.';$('#progress-status').textContent='Bản sao hợp lệ. Chưa thay đổi tiến trình.';}
 function exportProgress(){
  try{const payload=progressStore.pack(snapshot());$('#progress-export-label').hidden=false;$('#progress-export-json').value=payload;const url=URL.createObjectURL(new Blob([payload],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kanjidle-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#progress-status').textContent='Đã yêu cầu tải bản sao. Nếu tải không được, hãy sao chép JSON bên trên.';}catch{$('#progress-status').textContent='Không xuất được. Tiến trình hiện tại vẫn được giữ trong phiên chơi.';}
 }
 saveNotice.addEventListener('click',showProgress);
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null)storageNotice('conflict');});
 window.addEventListener('pagehide',()=>{save();X.save();KanjiWriter.release();});
 window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
 window.addEventListener('kanji-study-save-error',()=>storageNotice('write-failed'));
 root.addEventListener('change',async e=>{
  if(e.target.id!=='progress-file')return;stagedProgress=null;$('#progress-preview').hidden=true;const file=e.target.files[0];if(!file)return;
  try{if(file.size>progressStore.limit)throw Error('File vượt quá 2 MB.');const value=progressStore.decode(await file.text());if($('#progress-status'))previewProgress(value);}catch{if($('#progress-status'))$('#progress-status').textContent='File không hợp lệ hoặc thuộc phiên bản chưa hỗ trợ. Tiến trình chưa thay đổi.';}
 });
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-progress]'))showProgress();
  if(e.target.closest('[data-progress-export]'))exportProgress();
  if(e.target.closest('[data-progress-backup]')){const value=progressStore.backup();if(value)previewProgress(value);else $('#progress-status').textContent='Chưa có bản dự phòng hợp lệ.';}
  if(e.target.closest('[data-progress-confirm]')&&stagedProgress){
   if(progressStore.restore(stagedProgress)){({state,profile,history,undos,view,sound}=stagedProgress);selected=null;saveNotice.hidden=true;closeModal();render();if(view==='play')enterPlay();save();}
   else $('#progress-status').textContent='Chưa khôi phục được. Kiểm tra quyền lưu hoặc xuất bản sao rồi tải lại nếu đang mở nhiều tab.';
  }
  if(e.target.closest('[data-progress-reload]')){stagedProgress=null;modalOpen('<section class="kp-modal progress-panel" role="dialog" aria-modal="true"><h2>Tải lại tiến trình?</h2><p>Lượt chơi chưa lưu của tab này sẽ mất. Chọn Quay lại để xuất bản sao trước.</p><button class="kp-secondary" data-progress-reload-confirm>Tải lại bản đã lưu</button><button class="kp-action" data-progress>Quay lại</button></section>','Xác nhận tải lại');}
  if(e.target.closest('[data-progress-reload-confirm]'))location.reload();
 });
 let partnerTimer,lastLearned=null,revealStarted=0,activeFx=null,hintedTile=null,hintUntil=0,comboStreak=0,movesSinceMatch=0;
 const A=window.KanjiAudio;
 const thresholds=()=>state.benchmark||{three:C.levels[state.level].targets.length*8,two:C.levels[state.level].targets.length*16};
 const lessons=['Đưa ô trống tới cặp cần ghép','Đổi hướng để mở đường','Lên kế hoạch qua nhiều bước','Nhịp nghỉ · gặp lại chữ quen','Thử thách tổng hợp'];
 const icons=()=>globalThis.lucide?.createIcons(),say=text=>$('#feedback').textContent=text;
 function part(g){return g==='𠂇'?'<svg class="part-glyph" viewBox="0 0 100 100" role="img" aria-label="𠂇"><path d="M17 34H83M48 16C47 49 39 72 17 86"/></svg>':g;}
 function formula(r,pair){const cut=window.KanjiGemArt.cutFor(pair),gem=(glyph,i)=>`<span class="formula-gem result-gem" data-pair="${pair}" style="--gem-label-y:${cut.labelY}%">${resultGem(pair,part(glyph),'formula-'+i)}</span>`;return r.parts.map((glyph,i)=>gem(glyph,i)).join('<span class="formula-operator">+</span>')+'<span class="formula-operator">=</span>'+gem(r.kanji,'result');}
 function tone(pair=0,combo=1){if(A)A.fusion(pair,combo);}
 function showComboCallout(at,combo,pair){
  if(reduced||combo<2)return;
  const w=($('#tiles').clientWidth-(state.cols-1)*6)/state.cols,h=($('#tiles').clientHeight-(state.rows-1)*6)/state.rows,size=Math.min(w,h);
  const x=at%state.cols*(w+6)+size/2,y=Math.floor(at/state.cols)*(h+6)+size/2;
  const label=combo===2?'TUYỆT VỜI!':combo===3?'XUẤT SẮC!':'SIÊU PHÀM!';
  const colors=['#ffd86b','#85f3ff','#ff94e8','#9aff9f'];
  const badge=document.createElement('div');badge.className='combo-callout';badge.setAttribute('aria-hidden','true');
  badge.style.left=x+'px';badge.style.top=y+'px';badge.style.setProperty('--combo-color',colors[(combo-2)%colors.length]);
  badge.innerHTML=`<b>COMBO ×${combo}</b><span>${label}</span>`;
  $('#effects').append(badge);setTimeout(()=>badge.remove(),1250);
 }
 const effectStyleNames=['ripple','orbit','starfall','prism'];
 function effectTier(level=state.level){return 1+Math.min(3,Math.floor(level*4/C.levels.length));}
 function burst(tier=effectTier(),style=(state.level+state.matches)%4){if(reduced)return;const amount=[12,22,36,52][tier-1],colors=['#ffd230','#aa6cef','#78dd26','#ff7e91','#fff','#32c9e8','#ff8a34'];for(let i=0;i<amount;i++){const p=document.createElement('span');p.className='kp-particle';p.dataset.style=effectStyleNames[style];p.style.cssText=`--x:${(Math.random()-.5)*(330+tier*70)}px;--y:${(Math.random()-.7)*(360+tier*90)}px;--r:${Math.random()*650}deg;--c:${colors[(i+style*2)%colors.length]};--delay:${Math.random()*260}ms;--particle-size:${6+Math.random()*(5+tier*2)}px;--duration:${1.45+Math.random()*.65+tier*.12}s`;$('#kp-confetti').append(p);setTimeout(()=>p.remove(),3300);}}
 function position(el,at){const w=($('#tiles').clientWidth-(state.cols-1)*6)/state.cols,h=($('#tiles').clientHeight-(state.rows-1)*6)/state.rows;const size=Math.min(w,h);el.style.setProperty('--gem-glyph-size',Math.max(14,Math.round(size*.31))+'px');el.style.width=size+'px';el.style.height=size+'px';el.style.transform=`translate(${at%state.cols*(w+6)}px,${Math.floor(at/state.cols)*(h+6)}px)`;}
 function tile(t,at,board){const b=document.createElement('button'),movable=E.neighbors(at,state.rows,state.cols).some(i=>board[i]===null),cut=window.KanjiGemArt.cutFor(t.pair),shape=cut.name;b.type='button';b.className='board-tile'+(selected===at?' selected':'')+(movable?' movable':'');b.dataset.at=at;b.dataset.id=t.id;b.dataset.pair=t.pair;b.dataset.recipe=t.recipe;b.dataset.shape=shape;b.dataset.gem='true';b.style.setProperty('--gem-label-y',cut.labelY+'%');b.style.setProperty('--glint-delay',((t.pair%7)*-.41)+'s');b.lang='ja';b.setAttribute('aria-pressed',String(selected===at));b.setAttribute('aria-label',t.part+', nhóm '+(t.pair+1)+', dáng '+shape+', hàng '+(Math.floor(at/state.cols)+1)+', cột '+(at%state.cols+1)+(movable?', chạm để trượt':', chưa sát ô trống'));b.innerHTML=window.KanjiGemArt.render(t.pair,t.id)+'<span class="tile-glyph">'+part(t.part)+'</span><span class="objective-halo" aria-hidden="true"></span>';position(b,at);return b;}
 function highlightDestinations(board=state.board){
  const legal=selected!==null&&board[selected]?E.directions.map(dir=>({dir,at:E.destination(selected,dir,state.rows,state.cols)})).filter(x=>x.at>=0&&board[x.at]===null):[],arrows={left:'←',right:'→',up:'↑',down:'↓'};
  for(const cell of $('.board-cells').children){const at=Number(cell.dataset.empty),route=legal.find(x=>x.at===at),can=Boolean(route);cell.classList.toggle('destination',can);cell.classList.toggle('has-arrow',can&&legal.length>1);cell.classList.remove('hint-target');const arrow=cell.querySelector('.move-arrow');if(arrow){arrow.textContent=can&&legal.length>1?arrows[route.dir]:'';arrow.dataset.direction=route?.dir||'';}}
 }
 function draw(board=state.board){
  if(view!=='play')return;
  $('#tiles').innerHTML='';$('#effects').innerHTML='';const cells=$('.board-cells');cells.innerHTML='';
  board.forEach((p,i)=>{const cell=document.createElement(p===null?'button':'span');cell.className='board-cell'+(p===null?' empty':'');if(p){cell.setAttribute('aria-hidden','true');$('#tiles').append(tile(p,i,board));}else{cell.type='button';cell.dataset.empty=i;cell.innerHTML='TRỐNG<span class="move-arrow" aria-hidden="true"></span>';cell.setAttribute('aria-label','Ô trống, hàng '+(Math.floor(i/state.cols)+1)+', cột '+(i%state.cols+1)+'. Chọn khối bên cạnh rồi chạm để trượt.');}cells.append(cell);});
  highlightDestinations(board);coach();highlightObjective();
 }
 function controls(){root.querySelectorAll('#restart,#hint,#help,#kp-home,.course-nav button').forEach(b=>b.disabled=busy);root.setAttribute('aria-busy',String(busy));}

 function highlightObjective(){
  root.dataset.markerQuality=X.budget();
  const anchor=E.targetAnchor(state),active=!state.pending&&state.status==='playing';
  for(const el of $('#tiles').children){const id=Number(el.dataset.id),marked=active&&id===anchor?.id;el.classList.toggle('objective-anchor',marked);el.classList.toggle('objective-mate-hint',active&&id===hintedTile&&performance.now()<hintUntil);
   const halo=el.querySelector('.objective-halo');if(marked){if(!halo.firstChild){halo.innerHTML=window.KanjiGemArt.focus(Number(el.dataset.pair));el.dataset.marker=halo.firstElementChild.dataset.focusCut;halo.style.setProperty('--marker-phase',(-performance.now())+'ms');}}
   else if(halo?.firstChild){halo.replaceChildren();delete el.dataset.marker;}
  }
 }
 function renderMissions(){
  if(state.isDaily){
   const target=state.dailyTarget;
   const isDone=state.found.includes(target);
   $('#level-title').textContent=I18N.t('dailyTitle');
   $('#mission-count').textContent=isDone?'1/1':'0/1';
   $('#mission-count').setAttribute('aria-label',I18N.t('dailyTitle'));
   $('#mission-cards').innerHTML=`<div class="objective-current"><span class="objective-preview waiting">${isDone?'✓':'✦'}</span><div><strong>${I18N.t('dailySecret')}: <span lang="ja">${isDone?target:'?'}</span></strong><span>${I18N.t('dailyGoal')}</span></div></div>`;
   $('#mission-done').hidden=true;
   $('#mission-status').textContent=isDone?I18N.t('dailySolved'):I18N.t('dailyGoal');
   return;
  }
  const targets=C.levels[state.level].targets,done=targets.filter(id=>state.found.includes(id)),current=E.currentTarget(state),anchor=E.targetAnchor(state);
  $('#level-title').textContent='Đã khám phá '+done.length+'/'+targets.length+' chữ';
  $('#mission-count').textContent=done.length+'/'+targets.length;
  $('#mission-count').setAttribute('aria-label','Đã khám phá '+done.length+' trên '+targets.length+' mục tiêu');
  const preview=anchor?`<span class="objective-preview result-gem" data-pair="${anchor.pair}" style="--gem-label-y:${KanjiGemArt.cutFor(anchor.pair).labelY}%" lang="ja" aria-label="Viên được đánh dấu: ${anchor.part}">${resultGem(anchor.pair,part(anchor.part),'objective-preview')}</span>`:'<span class="objective-preview waiting">'+(current?'✧':'✓')+'</span>';
  $('#mission-cards').innerHTML=`<div class="objective-current">${preview}<div><strong>${current?'Gợi ý tìm cặp':'Hoàn thành màn!'}</strong><span>${current?'Có thể ghép cặp khác trước':'Bạn đã khám phá đủ các chữ.'}</span></div></div><ol class="objective-route" aria-label="Lộ trình khám phá của màn">${targets.map((id,i)=>{const found=done.includes(id),active=id===current;return `<li class="${found?'done':active?'current':'locked'}" ${active?'aria-current="step"':''} aria-label="${found?'Đã khám phá '+id:active?'Mục tiêu hiện tại':'Mục tiêu tiếp theo '+(i+1)}"><span lang="ja">${found?id:'?'}</span>${found?'<i aria-hidden="true">✓</i>':''}</li>`;}).join('')}</ol>`;
  $('#mission-done').hidden=true;
  $('#mission-status').textContent=current?'Thu đủ '+targets.length+' chữ mục tiêu để qua màn · Không cần đúng thứ tự.':'Đã khám phá đủ các chữ mục tiêu!';
 }
 let mapChapter=null,mapSelected=null;
 function renderMap(){
 const next=unlocked(),ongoing=state.status==='playing'&&(state.moves>0||state.pending)&&state.level<=next;
 const recommended=ongoing?state.level:Math.min(next,C.levels.length-1);
 if(mapChapter===null)mapChapter=C.levels[recommended].chapter;
 const chapter=C.chapters[mapChapter],levels=C.levels.filter(l=>l.chapter===mapChapter),done=levels.filter(l=>profile.results[l.id]).length;
 if(!levels.some(l=>l.id===mapSelected))mapSelected=levels.some(l=>l.id===recommended)?recommended:levels.find(l=>!profile.results[l.id])?.id??levels.at(-1).id;
 const selectedLevel=C.levels[mapSelected],locked=mapSelected>next,resume=ongoing&&mapSelected===state.level,result=profile.results[mapSelected];
 const action=resume?'resume':mapSelected,label=locked?'Hoàn thành chương trước':(resume?I18N.t('resume'):result?I18N.t('replay'):I18N.t('play'))+' màn '+String(mapSelected+1).padStart(2,'0');
 const rows=[5,4,3,2,1],cols=[4,8,3,8,5],paths=['M 38 88 C 38 77 71 80 71 69','M 71 69 C 71 58 29 61 29 50','M 29 50 C 29 39 71 42 71 31','M 71 31 C 71 20 50 23 50 12'];

  // Chapter Kanji Shelf (8 characters)
  const chapterChars=C.ids.filter(id=>C.recipes[id].chapter===mapChapter);
  const chapterCollectedCount=chapterChars.filter(id=>profile.collected.includes(id)).length;
  const chapterTotalStars=levels.reduce((acc,l)=>acc+(profile.results[l.id]?.stars||0),0);
  const maxChapterStars=levels.length*3;

  const todayKey=getDailyKey();
  const dailyRec=getDailyRecord(todayKey,currentGrade);
  const dailyDone=!!dailyRec;
  const dailyPillHtml=`<button type="button" class="grade-pill daily-pill ${state?.isDaily?'active':''}" data-daily-play aria-label="${I18N.t('dailyTitle')}"><span class="grade-tag">📅 ${I18N.t('dailyBadge')}</span> ${dailyDone?'★':''}</button>`;

  const shelfCards=chapterChars.map((id, idx)=>{
   const r=C.recipes[id],known=profile.collected.includes(id),intro=C.levels.find(l=>l.newChars&&l.newChars.includes(id));
   const lvl=intro?intro.id+1:(mapChapter*5+1);
   const tileIdx = (idx % 8) + 1;
   return `<button type="button" class="shelf-gem-card kanji-key ${known?'unlocked':'locked'}" style="background-image: url('anime-tile-${tileIdx}.webp');" data-kanji-preview="${id}" aria-label="${known?id+' — '+(r.hanViet||I18N.getRecipeMeaning(r)):'Chưa mở khóa, màn '+lvl}"><span class="shelf-gem-icon" lang="ja">${id}</span></button>`;
  }).join('');

  // Exact percentage coordinates on 2D anime cloud-path background (anime-bg-stage.webp)
  const nodeCoords = [
    { left: '56.2%', top: '70.0%', cls: 'node-01', sprite: 'anime-node-1.webp' },
    { left: '42.8%', top: '58.0%', cls: 'node-02', sprite: 'anime-node-2.webp' },
    { left: '54.0%', top: '48.8%', cls: 'node-03', sprite: 'anime-node-3.webp' },
    { left: '46.6%', top: '40.4%', cls: 'node-04', sprite: 'anime-node-4.webp' },
    { left: '50.2%', top: '30.2%', cls: 'node-05', sprite: 'anime-node-5.webp' }
  ];

  // Separate decorative 2D anime gemstones & floating Kanji charms in open sky flanks
  const skyDecors = `
    <div class="anime-sky-decors" aria-hidden="true">
      <img src="anime-gem-1.webp" class="anime-float-gem g1" alt="">
      <img src="anime-gem-2.webp" class="anime-float-gem g2" alt="">
      <img src="anime-gem-3.webp" class="anime-float-gem g3" alt="">
      <img src="anime-gem-4.webp" class="anime-float-gem g4" alt="">
      <img src="anime-gem-5.webp" class="anime-float-gem g5" alt="">
      <img src="anime-gem-6.webp" class="anime-float-gem g6" alt="">

      <div class="anime-float-kanji k1" style="background-image:url('anime-tile-1.webp')" lang="ja">日</div>
      <div class="anime-float-kanji k2" style="background-image:url('anime-tile-4.webp')" lang="ja">月</div>
      <div class="anime-float-kanji k3" style="background-image:url('anime-tile-2.webp')" lang="ja">火</div>
      <div class="anime-float-kanji k4" style="background-image:url('anime-tile-5.webp')" lang="ja">水</div>
      <div class="anime-float-kanji k5" style="background-image:url('anime-tile-3.webp')" lang="ja">木</div>
      <div class="anime-float-kanji k6" style="background-image:url('anime-tile-8.webp')" lang="ja">花</div>
      <div class="anime-float-kanji k7" style="background-image:url('anime-tile-7.webp')" lang="ja">星</div>
      <div class="anime-float-kanji k8" style="background-image:url('anime-tile-6.webp')" lang="ja">空</div>
    </div>
  `;

   $('#map-screen').innerHTML = `<div class="chapter-bar">
    <div class="grade-toggle-group">
      <button type="button" class="grade-pill ${currentGrade==='N5'?'active':''}" data-switch-grade="N5"><span class="grade-tag">JLPT N5</span></button>
      <button type="button" class="grade-pill ${currentGrade==='N4'?'active':''}" data-switch-grade="N4"><span class="grade-tag">JLPT N4</span></button>
      ${dailyPillHtml}
    </div>
    <div class="chapter-nav-center">
      <button data-chapter-step="-1" aria-label="Chương trước" ${mapChapter===0?'disabled':''}><i data-lucide="chevron-left" aria-hidden="true"></i></button>
      <span>${I18N.t('chapter')} ${String(mapChapter+1).padStart(2,'0')}</span>
      <button data-chapter-step="1" aria-label="Chương tiếp theo" ${mapChapter===2?'disabled':''}><i data-lucide="chevron-right" aria-hidden="true"></i></button>
    </div>
    <button type="button" class="hud-pill stars" data-journey-album aria-label="Tiến trình: ${chapterTotalStars}/${maxChapterStars} sao">★ ${chapterTotalStars}/${maxChapterStars}</button>
    <button type="button" class="journey-menu" data-journey-menu aria-label="${I18N.t('menuTitle')}"><i data-lucide="ellipsis" aria-hidden="true"></i></button>
  </div>

  <div class="journey-layout cozy-layout" data-chapter="${mapChapter}">
    <div class="mountain-stage-wrap">
      <div class="mountain-area mountain-canvas">
        ${skyDecors}
        <!-- 5 2D Anime Level Medallions on Winding Cloud Path -->
        ${levels.map((l, i) => {
          const r = profile.results[l.id], isLocked = l.id > next, current = l.id === mapSelected;
          const pos = nodeCoords[i];
          const playText = action === 'resume' ? I18N.t('resume') : result ? I18N.t('replay') : I18N.t('play');
          const crownBadge = i === 4 ? '<img src="anime-crown.webp" class="crown-crest-img" alt="" aria-hidden="true">' : '';
          const playBubble = current ? `<div role="button" tabindex="0" class="play-bubble journey-node-play-btn" data-main="${action}" ${locked?'aria-disabled="true"':'aria-label="'+playText+' màn '+(l.id+1)+'"'}><span>${playText} ▶</span></div>` : '';
          const starRow = r ? `<span class="node-stars" aria-hidden="true">${'★'.repeat(r.stars)}${'☆'.repeat(3-r.stars)}</span>` : '';
          return `<button type="button" class="candy-node ${pos.cls} journey-stop ${r?'completed':''} ${current?'selected':''} ${i===4?'treasure':''}" style="left: ${pos.left}; top: ${pos.top}; background-image: url('${pos.sprite}');" data-journey-level="${l.id}" ${isLocked?'disabled':''} aria-pressed="${current}" aria-label="Màn ${l.id+1}: ${l.title}${isLocked?', chưa mở khóa':r?', '+r.stars+' sao':''}">
            ${crownBadge}
            ${playBubble}
            <span class="dome-num">${String(l.id+1).padStart(2,'0')}</span>
            ${starRow}
          </button>`;
        }).join('')}
      </div>
    </div>

    <!-- Bottom Kanji Drawer -->
    <div class="kanji-drawer journey-kanji-shelf">
      ${shelfCards}
    </div>

    <div class="journey-hero-cta" style="display:none;" aria-hidden="true">
      <button type="button" class="journey-hero-play-btn" data-hero-play="${action}" ${locked?'disabled':''}>
        <span class="hero-play-arrow">▶</span>
      </button>
    </div>
  </div>`;
 }
 function showJourneyMenu(){modalOpen('<section class="kp-modal journey-options" role="dialog" aria-modal="true"><h2>Hành trình của bạn</h2><p>24 chữ ghép tuyển chọn · 3 chương · 15 màn.<br>Đây là bộ sơ cấp tham khảo, chưa phải toàn bộ Kanji N5.</p><button class="kp-secondary" data-audio-studio style="background:#f0f8ff;border-color:#53aadc;color:#0d5c8a"><i data-lucide="headphones" aria-hidden="true"></i>🎧 Phòng thử & chọn âm thanh từng chức năng</button><button class="kp-secondary" data-settings><i data-lucide="settings" aria-hidden="true"></i>Tùy chỉnh & chơi thử</button><button class="kp-secondary" data-progress><i data-lucide="save" aria-hidden="true"></i>Sao lưu tiến trình</button><button class="kp-secondary" data-about><i data-lucide="info" aria-hidden="true"></i>Bộ chữ & nguồn tham khảo</button><button class="kp-action" data-action="close">Về hành trình</button></section>','Menu hành trình');}
 function renderAlbum(){
  const todayKey=getDailyKey();
  const dailyRec=getDailyRecord(todayKey,currentGrade);
  const dailyDone=!!dailyRec;
  const dailyPillHtml=`<button type="button" class="grade-pill daily-pill ${state?.isDaily?'active':''}" data-daily-play aria-label="${I18N.t('dailyTitle')}"><span class="grade-tag">📅 ${I18N.t('dailyBadge')}</span> ${I18N.t('dailyTitle')} ${dailyDone?'★':''}</button>`;

  $('#album-screen').innerHTML=`<div class="album-head"><div class="grade-toggle-bar"><button type="button" class="grade-pill ${currentGrade==='N5'?'active':''}" data-switch-grade="N5"><span class="grade-tag">JLPT N5</span> Sơ cấp</button><button type="button" class="grade-pill ${currentGrade==='N4'?'active':''}" data-switch-grade="N4"><span class="grade-tag">JLPT N4</span> Mới ✦</button>${dailyPillHtml}</div><span class="course-badge">BỘ SƯU TẬP ${currentGrade}</span><h1>Những chữ bạn đã gặp</h1><p><strong>${profile.collected.length}/24</strong> thẻ đã thu thập · Chạm thẻ để xem lại</p></div>`+C.chapters.map((ch,c)=>`<section class="album-group ${chaptersDone()[c]?'chapter-earned':''}" data-chapter="${c}"><h2>${c+1}. ${ch.name}</h2>${chaptersDone()[c]?'<p class="album-seal">✦ TRANG SAO · HOÀN THÀNH CHƯƠNG</p>':''}<div class="album-grid">`+C.ids.filter(id=>C.recipes[id].chapter===c).map(id=>{const r=C.recipes[id],known=profile.collected.includes(id),intro=C.levels.find(l=>l.newChars.includes(id));return `<button class="album-card" data-card="${id}" ${known?'':'disabled'} aria-label="${known?id+' — '+(r.hanViet||I18N.getRecipeMeaning(r)):'Chưa khám phá, màn '+(intro.id+1)}"><strong lang="ja">${known?id:'?'}</strong><span>${known?I18N.getRecipeMeaning(r):'Chưa khám phá'}</span><small>${known?(X.data.reviewed[id]?'ĐÃ ÔN · '+X.data.reviewed[id]+' LẦN':'ĐÃ KHÁM PHÁ'):'Mốc luyện: màn '+(intro.id+1)}</small></button>`;}).join('')+'</div></section>').join('')+rewardsMarkup()+'<p class="scope-note">Bạn có thể khám phá chữ trước mốc luyện tập. Đã ôn ghi nhận lần gặp lại, không khẳng định đã thuộc.<br>Thu thập ghi nhận chữ bạn đã khám phá. Chơi lại các màn ôn để luyện nhớ cấu tạo và nghĩa.</p>';
 }
 function render(){
  if(!busy)alignDeviceLayout();
  root.dataset.view=view;X.apply();
  updateLangUi();
  $('#desktop-collected').textContent=profile.collected.length+' / 24';
  $('#desktop-progress').value=profile.collected.length;
  $('#desktop-chapter').textContent=state.isDaily ? (I18N.t('dailyBadge') + ' · ' + state.dailyDate) : (I18N.t('chapter') + ' ' + (C.levels[state.level].chapter+1)+' · '+(C.grade||currentGrade));
  ['map','play','album'].forEach(name=>{$('#'+name+'-screen').hidden=view!==name;$('#nav-'+name).setAttribute('aria-current',view===name?'page':'false');});
  $('#album-count').textContent=profile.collected.length;
  if(state.isDaily){
   $('#level-no').textContent='📅';
   $('#level-title').textContent=I18N.t('dailyTitle');
   $('#play-objective').textContent=I18N.t('dailyGoal');
   $('#level-kind').textContent=I18N.t('dailyBadge')+' · '+state.dailyDate;
  }else{
   const l=C.levels[state.level];$('#level-no').textContent=String(state.level+1).padStart(2,'0');$('#level-title').textContent=l.title;$('#play-objective').textContent='★★★ ≤ '+thresholds().three+' lượt · '+lessons[state.level%5];$('#level-kind').textContent=l.review?'ÔN TẬP · THU ĐỦ THẺ':'KHÁM PHÁ · CHƠI TRƯỚC, HỌC SAU';
  }
  renderMissions();
  $('#kp-points').textContent=state.score;$('#moves').textContent=state.moves;$('#pair-count').textContent=state.matches;$('#free-spaces').textContent=state.board.filter(x=>x===null).length;
  $('#slide-board').style.setProperty('--rows',state.rows);$('#slide-board').style.setProperty('--cols',state.cols);$('#slide-board').dataset.cols=state.cols;$('#slide-board').classList.toggle('tall',state.rows>=5);$('.kp-board-tab').textContent='GHÉP CHỮ · '+state.cols+' × '+state.rows;
  const b=$('#kp-sound');b.setAttribute('aria-pressed',String(sound));b.setAttribute('aria-label',sound?'Tắt âm thanh':'Bật âm thanh');b.innerHTML=`<i data-lucide="${sound?'volume-2':'volume-x'}" aria-hidden="true"></i>`;
  A?.setEnabled(sound);A?.setBgm(sound&&(view==='play'||view==='map'));
  if(view==='map')renderMap();if(view==='album')renderAlbum();draw();controls();icons();requestAnimationFrame(()=>{syncSummaryHeight();fitMobileBoard();});
 }
 function alignDeviceLayout(){
  const mode=deviceMode();if(state.mode===mode)return false;
  const next=E.reorient(state,mode),nextHistory=history.map(s=>E.reorient(s,mode));
  state=next;history=nextHistory;selected=null;gesture=null;return true;
 }
 let layoutTimer;
 function updateDeviceLayout(){
  clearTimeout(layoutTimer);
  if(busy){layoutTimer=setTimeout(updateDeviceLayout,100);return;}
  if(alignDeviceLayout()){render();save();}
 }
 window.addEventListener('resize',()=>{clearTimeout(layoutTimer);layoutTimer=setTimeout(updateDeviceLayout,100);});
 function closeModal(){$('#modal').hidden=true;$('#modal').innerHTML='';[...root.children].forEach(e=>e.inert=false);}
 function modalOpen(html,label,focus=true){const m=$('#modal');m.hidden=false;[...root.children].filter(e=>!['modal','kp-confetti'].includes(e.id)).forEach(e=>e.inert=true);m.innerHTML=html;m.querySelector('[role="dialog"]').setAttribute('aria-label',label);if(focus)m.querySelector('button')?.focus({preventScroll:true});icons();}
 function changeView(next){if(busy)return;if(next==='map'&&view!=='map'){mapChapter=null;mapSelected=null;}if(view==='play'&&next!=='play')X.log('level_exit',{reason:'navigation'});X.log('view',{view:next,level:state.level});closeModal();clearTimeout(partnerTimer);hintedTile=null;hintUntil=0;$('#quick-card').hidden=true;view=next;selected=null;render();save();if(next==='play')enterPlay();}
 function startLevel(id){if(busy||!C.levels[id]||id>unlocked())return;if(state.runStarted&&state.status==='playing')X.log('level_exit',{reason:'restart-or-change'});state=makeFresh(id);X.start(state,'new');history=[];undos=3;selected=null;comboStreak=0;movesSinceMatch=0;changeView('play');say('Chạm một khối cạnh ô trống. Thu đủ các thẻ để qua màn.');}

 function showLevelIntro(){
  const count=C.levels[state.level].targets.length;
  const gem=(id,cls)=>`<span class="intro-demo-gem result-gem ${cls}" data-pair="4">${KanjiGemArt.render(4,'intro-'+id)}</span>`;
  modalOpen(`<section class="kp-modal level-intro" role="dialog" aria-modal="true" aria-describedby="intro-rule"><span class="intro-level">MÀN ${String(state.level+1).padStart(2,'0')}</span><h2>Cùng màu, cùng dáng!</h2><div class="intro-demo" role="img" aria-label="Hai viên cùng màu và cùng dáng. Trượt viên bên trái vào ô trống ở giữa để chúng chạm cạnh và ghép."><span class="intro-demo-empty">TRỐNG</span>${gem('left','demo-left')}${gem('right','demo-right')}<span class="intro-demo-pop" aria-hidden="true">✦</span><span class="intro-demo-arrow" aria-hidden="true">→</span></div><div class="intro-instructions" id="intro-rule"><p><b>1</b><span>Trượt một viên vào <strong>ô trống ngay cạnh.</strong></span></p><p><b>2</b><span>Hai viên <strong>cùng màu, cùng dáng</strong> chạm cạnh sẽ tự ghép!</span></p></div><p class="intro-halo-note">Hào quang chỉ gợi ý. Bạn có thể ghép cặp khác trước.</p><div class="intro-goal"><strong>Thu đủ ${count} chữ mục tiêu để qua màn.</strong><small>Chữ khác vẫn cho điểm và thêm vào album.</small></div><button class="kp-action" data-action="begin-level">Hiểu rồi, chơi thôi! →</button></section>`,'Hướng dẫn ghép cặp — màn '+(state.level+1));
  X.log('level_guide_open',{level:state.level});
 }
 function beginLevel(){state.entryGuideSeen=true;save();closeModal();X.ready();const b=$('#slide-board');b.tabIndex=-1;b.focus({preventScroll:true});}
 async function presentMatch(){if(state.pending)showReveal();}
 function enterPlay(){X.start(state);save();if(state.pending)presentMatch();else if(state.status==='won')showWin();else if(!state.entryGuideSeen)showLevelIntro();}
 function select(at,silent=false){if(busy||view!=='play'||!$('#modal').hidden||!state.board[at]||state.pending||state.status!=='playing')return;if(!silent&&selected!==at)A?.select();selected=at;for(const t of $('#tiles').children){t.classList.toggle('selected',Number(t.dataset.at)===at);t.setAttribute('aria-pressed',String(Number(t.dataset.at)===at));t.classList.remove('hinted');}highlightDestinations();}
 function fusionHalo(pair,boost='flight'){return `<span class="fusion-halo" aria-hidden="true"><canvas class="fusion-gem-fx" data-pair="${pair}" data-boost="${boost}" width="160" height="160"></canvas></span>`;}
 function fusionIngredients(result){
  return result.match.ids.flatMap(id=>{
   const tile=$(`#tiles [data-id="${id}"]`);if(!tile)return [];
   const box=tile.getBoundingClientRect(),style=getComputedStyle(tile),node=document.createElement('span'),pair=Number(tile.dataset.pair);
   node.dataset.pair=String(pair);
   node.append(tile.querySelector('.jewel-art').cloneNode(true));
   const halo=document.createElement('span');halo.className='fusion-halo';halo.setAttribute('aria-hidden','true');halo.innerHTML=`<canvas class="fusion-gem-fx" data-pair="${pair}" data-boost="flight" width="160" height="160"></canvas>`;node.append(halo);
   const glyph=tile.querySelector('.tile-glyph').cloneNode(true);glyph.className='result-glyph';node.append(glyph);
   for(const key of ['--tile-top','--tile-mid','--tile-base','--tile-edge','--gem-label-y','--gem-glyph-size'])node.style.setProperty(key,style.getPropertyValue(key));
   return [{node,x:box.x+box.width/2,y:box.y+box.height/2,width:box.width,height:box.height}];
  });
 }
 function mergeBurst(result,ingredients=[]){
  const tier=effectTier(result.state.level),host=$('#effects'),w=($('#tiles').clientWidth-(state.cols-1)*6)/state.cols,h=($('#tiles').clientHeight-(state.rows-1)*6)/state.rows,size=Math.min(w,h),point=at=>({x:at%state.cols*(w+6)+size/2,y:Math.floor(at/state.cols)*(h+6)+size/2});
  const fx=window.KanjiFusion.play({host,center:point(result.to),source:point(result.match.cells[1]),tier,sequence:result.state.matches-1+result.state.level*3,reduced:reduced||document.hidden,quality:X.budget(),pair:result.state.pending.pair,ingredients,cinematic:true,onFrame:X.frame});
  $('#slide-board').dataset.fusion=fx.theme.id;
  window.KanjiTargetVFX?.sync?.();
  activeFx=fx;return fx;
 }
 async function move(dir){
  if(busy||view!=='play'||!$('#modal').hidden)return;
  const guidedRecipe=E.currentTarget(state),result=E.move(state,selected,dir);if(!result.changed){A?.invalid();X.log('invalid_move',{reason:result.reason,level:state.level});say('Chỉ trượt được vào ô trống ngay bên cạnh.');return;}
  A?.slide(!!result.match);movesSinceMatch++;
  X.moves(result.state,!!result.match);busy=true;controls();history.push(E.clone(state));history=history.slice(-3);
  try{
   const moving=$(`#tiles [data-at="${result.from}"]`);if(moving){moving.style.zIndex=5;moving.classList.add('sliding');void moving.offsetWidth;position(moving,result.to);}
   if(result.match){
    comboStreak=movesSinceMatch<=6?comboStreak+1:1;movesSinceMatch=0;
    result.state.pending.combo=comboStreak;
    A?.contact(result.state.pending.pair);
    for(const id of result.match.ids){const t=$(`#tiles [data-id="${id}"]`);if(!t)continue;t.classList.add('fusion-contact');if(!t.querySelector('.fusion-halo'))t.insertAdjacentHTML('beforeend',fusionHalo(Number(t.dataset.pair),'contact'));}
    showComboCallout(result.to,comboStreak,result.state.pending.pair);
    window.KanjiTargetVFX?.sync?.();
   }
   await delay(result.match?260:180);
   if(result.match){
    const ingredients=fusionIngredients(result);result.state.pending.guided=result.match.recipe===guidedRecipe;result.state.pending.creditedTarget=C.levels[state.level].targets.includes(result.match.recipe)&&!state.found.includes(result.match.recipe);result.state.pending.firstTime=!profile.collected.includes(result.match.recipe);if(result.state.pending.firstTime)profile.collected.push(result.match.recipe);X.learn(result.match.recipe,result.state.pending.firstTime);if(!X.data.tutorialDone&&state.level===0)X.finishTutorial();X.log('match',{recipe:result.match.recipe,first:result.state.pending.firstTime,target:C.levels[state.level].targets.includes(result.match.recipe),level:state.level,moves:result.state.moves,combo:comboStreak});lastLearned=result.match.recipe;selected=null;state=result.state;render();save();
    showReveal(true);
    // Let the existing responsive card reserve its final space before flying.
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const fx=mergeBurst(result,ingredients);fx.placeResult?.($('#modal .reveal-char'));tone(result.state.pending.pair,comboStreak);
    try{await delay(fx.duration);}finally{fx.cancel?.();activeFx=null;finishReveal();}
   }else{selected=result.selected;state=result.state;render();save();}
   say(result.match?(comboStreak>=2?`Combo ×${comboStreak}! Ghép liên hoàn thật chuẩn xác!`:'Ghép thành công! Khám phá chữ vừa tạo nhé.'):'Đưa hai khối cùng màu chạm cạnh nhau.');
  }finally{busy=false;controls();}
  if(!result.match)X.ready();
 }
 function tap(at){if(busy||view!=='play'||!$('#modal').hidden)return;const dir=E.directionToBlank(state,at);if(dir){select(at,true);move(dir);}else{select(at,false);if(E.legalDirections(state,at).length>1)say('Có hai hướng trượt: chạm ô trống muốn đến, hoặc vuốt khối.');else{A?.invalid();X.log('invalid_tap',{level:state.level,at});say('Khối này chưa sát ô trống. Chạm một khối ngay cạnh ô TRỐNG.');}}}
 function resultGem(pair,glyph,id){const halo=id==='reveal-result'?fusionHalo(pair,'reveal'):'';return window.KanjiGemArt.render(pair,id)+halo+'<span class="result-glyph">'+glyph+'</span>';}
 function revealBody(r,extras=''){
  const pair=state.pending?.recipe===r.id?state.pending.pair:Math.max(0,C.ids.indexOf(r.id)),cut=window.KanjiGemArt.cutFor(pair);
  const hanVietBadge=r.hanViet?`<span class="badge-hanviet">${r.hanViet}</span>`:'';
  const strokeBadge=r.strokes?`<span class="badge-strokes">${r.strokes} ${I18N.t('strokes')}</span>`:'';
  const gradeBadge=`<span class="badge-grade">${r.grade||currentGrade}</span>`;
  const yomiHtml=`<div class="reveal-readings"><div class="reading-item on"><small>${I18N.t('onReading')}</small><strong lang="ja">${r.onyomi||'—'}</strong></div><div class="reading-item kun"><small>${I18N.t('kunReading')}</small><strong lang="ja">${r.kunyomi||'—'}</strong></div></div>`;
  const voiceBtn=`<button type="button" class="btn-voice-speak" data-speak="${r.reading||r.word}" aria-label="${I18N.t('pronounce')}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg><span>${I18N.t('pronounce')}</span></button>`;
  const wordHtml=`<div class="reveal-word"><div class="word-header"><span class="example-label">${I18N.t('exampleReading')}</span>${voiceBtn}</div><div class="word-content"><strong lang="ja">${r.word}</strong><span class="reading" lang="ja">【${r.reading}】</span><small>${I18N.getRecipeTranslation(r)}</small></div></div>`;
  const mnemonicHtml=r.note?`<div class="reveal-mnemonic"><span class="mnemonic-icon">💡</span><p>${I18N.getRecipeNote(r)}</p></div>`:'';

  return `<div class="reveal-stage"><div class="reveal-rays" aria-hidden="true"></div><span class="reveal-spark a" aria-hidden="true">✦</span><span class="reveal-spark b" aria-hidden="true">✧</span><span class="reveal-spark c" aria-hidden="true">✦</span><span class="reveal-spark d" aria-hidden="true">✧</span><span class="reveal-spark e" aria-hidden="true">✦</span><span class="reveal-spark f" aria-hidden="true">✧</span><i class="reveal-dust dust-a" aria-hidden="true"></i><i class="reveal-dust dust-b" aria-hidden="true"></i><i class="reveal-dust dust-c" aria-hidden="true"></i><i class="reveal-dust dust-d" aria-hidden="true"></i><i class="reveal-dust dust-e" aria-hidden="true"></i><i class="reveal-dust dust-f" aria-hidden="true"></i><i class="reveal-dust dust-g" aria-hidden="true"></i><i class="reveal-dust dust-h" aria-hidden="true"></i><i class="reveal-dust dust-i" aria-hidden="true"></i><i class="reveal-dust dust-j" aria-hidden="true"></i><span class="reveal-char result-gem learning-gem" data-pair="${pair}" style="--gem-label-y:${cut.labelY}%" lang="ja">${composition(r)}${resultGem(pair,r.kanji,'reveal-result')}</span></div><div class="reveal-info-panel"><div class="reveal-meta-row">${gradeBadge} ${hanVietBadge} ${strokeBadge}</div><div class="reveal-meaning">${I18N.getRecipeMeaning(r)}</div><div class="reveal-formula" lang="ja">${formula(r,pair)}</div>${yomiHtml}${wordHtml}${mnemonicHtml}${extras}</div>`;
}
 function showReveal(staged=false){
  if(!state.pending)return;
  const r=C.recipes[state.pending.recipe];

  if(state.isDaily){
   const isTarget=r.id===state.dailyTarget;
   if(isTarget){
    saveDailyRecord({date:state.dailyDate,grade:state.dailyGrade||currentGrade,target:r.id,solved:true,moves:state.moves,timestamp:Date.now()});
    if(!profile.collected.includes(r.id)){
     profile.collected.push(r.id);
     saveGradeProfile();
    }
   }
   const extras=`<div class="reveal-count">+100 điểm · ${isTarget?'✦ GIẢI THÀNH CÔNG CHỮ BÍ MẬT HÔM NAY!':'Khám phá thêm thẻ'}</div><button class="kp-action" data-action="${isTarget?'daily-win':'continue'}">${isTarget?(I18N.t('dailySolved')+' →'):(I18N.t('continuePlay')+' →')}</button>`;
   if(sound&&window.KanjiAudio?.speak)setTimeout(()=>{try{window.KanjiAudio.speak(r.reading||r.word);}catch(e){}},300);
   modalOpen(`<section class="kp-modal reveal-modal cinematic-reveal" data-fusion="${staged?'fusing':'ready'}" role="dialog" aria-modal="true" aria-busy="${staged}"><div class="kp-modal-title">${isTarget?I18N.t('dailySolved'):I18N.t('matchFound')}</div><div class="reveal-kicker">${isTarget?'✦ HOÀN THÀNH THỬ THÁCH HÀNG NGÀY':I18N.t('newInAlbum')}</div>${revealBody(r,extras)}</section>`,r.kanji+' — '+I18N.getRecipeMeaning(r),!staged);
   if(staged){$('#modal .reveal-info-panel').inert=true;$('#modal [data-action]').disabled=true;}else finishReveal();
   return;
  }

  const required=state.pending.creditedTarget??C.levels[state.level].targets.includes(r.id),combo=state.pending.combo||1,comboBadge=combo>=2?`<span class="reveal-combo-badge">✦ COMBO ×${combo}</span>`:'',extras=`<div class="reveal-count">+100 điểm · ${required?'Mục tiêu +1 · Đã mở thẻ của màn này':(state.pending.firstTime?'Khám phá thêm · Đã thêm vào album':'Ôn lại chữ đã biết')}${comboBadge}</div><button class="kp-action" data-action="continue">${state.pending.complete?I18N.t('levelComplete'):I18N.t('continuePlay')} →</button>${state.pending.complete?'':'<p class="refill-note">Cặp mới cách nhau ít nhất 5 ô</p>'}`;if(sound&&window.KanjiAudio?.speak)setTimeout(()=>{try{window.KanjiAudio.speak(r.reading||r.word);}catch(e){}},300);
  modalOpen(`<section class="kp-modal reveal-modal cinematic-reveal" data-fusion="${staged?'fusing':'ready'}" role="dialog" aria-modal="true" aria-busy="${staged}"><div class="kp-modal-title">${state.pending.firstTime?I18N.t('newCardDiscovered'):I18N.t('matchFound')}</div><div class="reveal-kicker">${state.pending.firstTime?I18N.t('newInAlbum'):I18N.t('metFamiliar')}</div>${revealBody(r,extras)}</section>`,r.kanji+' — '+I18N.getRecipeMeaning(r),!staged);if(staged){$('#modal .reveal-info-panel').inert=true;$('#modal [data-action="continue"]').disabled=true;}else finishReveal();
 }
 function finishReveal(){const modal=$('#modal .cinematic-reveal');if(!modal||!state.pending)return;modal.dataset.fusion='ready';modal.setAttribute('aria-busy','false');modal.querySelector('.reveal-info-panel').inert=false;const button=modal.querySelector('[data-action="continue"]');button.disabled=false;button.focus({preventScroll:true});if(!revealStarted){revealStarted=Date.now();X.log('card_open',{recipe:state.pending.recipe});}} 
 function stars(){const p=thresholds();return state.moves<=p.three?3:state.moves<=p.two?2:1;}
 function recordWin(){if(!state.experienceComplete){X.log('level_complete',{level:state.level,mode:state.mode,moves:state.moves,stars:stars()});state.experienceComplete=true;}const old=profile.results[state.level];profile.results[state.level]={stars:Math.max(old?.stars||0,stars()),moves:Math.min(old?.moves||Infinity,state.moves)};save();}
 function showWin(){
  const l=C.levels[state.level],last=state.level===C.levels.length-1;recordWin();A?.win();
  modalOpen(`<section class="kp-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">${last?I18N.t('allWon'):I18N.t('levelWon')}</div><div class="win-stars" aria-label="${stars()} ${I18N.t('stars')}">${'★'.repeat(stars())}<span class="off">${'★'.repeat(3-stars())}</span></div><p class="win-caption">${last?'Bạn đã đi hết 15 màn của lộ trình '+currentGrade+' tuyển chọn.':'Bạn đã thu đủ '+l.targets.length+' thẻ của màn '+(l.id+1)+'.'}<br>${state.moves} ${I18N.t('moves')} · ${state.score} điểm<br>★★★ ≤ ${thresholds().three} ${I18N.t('moves')} · ★★ ≤ ${thresholds().two} ${I18N.t('moves')}</p>${rewardWin()}<div class="won-chars">${l.targets.map(id=>'<span lang="ja">'+id+'</span>').join('')}</div><button class="kp-action" data-action="${last?'album':'next'}">${last?I18N.t('viewAlbum'):I18N.t('nextLevel')} →</button><button class="kp-secondary" data-action="map">${I18N.t('toJourney')}</button></section>`,I18N.t('levelComplete')+' '+(l.id+1));burst();
 }
 async function continueGame(){
  if(busy||!state.pending)return;busy=true;controls();const pending=state.pending;if(revealStarted){X.log('card_close',{recipe:pending.recipe,readMs:Date.now()-revealStarted});revealStarted=0;}
  if(pending.complete){state=E.resume(state);closeModal();render();save();busy=false;controls();if(state.isDaily){showDailyWin(C.recipes[state.dailyTarget]);}else{showWin();}return;}
  closeModal();const board=E.clone(state.board),shifts=pending.plan.motions.length,reflow=(pending.plan.reflow||[]).filter(m=>m.from!==m.to);const movedTiles=new Set([...pending.plan.motions,...reflow].map(m=>m.id));X.log('refill',{level:state.level,shifts,reflow:reflow.length,movedTiles:movedTiles.size,anchorMoved:movedTiles.has(E.targetAnchor(state)?.id),spawnDistance:E.distance(pending.plan.spawn[0].at,pending.plan.spawn[1].at,state.cols)});if(shifts||reflow.length){const moving=new Set([...pending.plan.motions,...reflow].map(m=>m.id));for(const el of $('#tiles').children)if(moving.has(Number(el.dataset.id)))el.classList.add('will-shift');say('Bù cặp mới: '+moving.size+' viên có viền tím sẽ chuyển vị trí.');await delay(650);}
  for(const m of pending.plan.motions){const t=$(`#tiles [data-id="${m.id}"]`);if(t)position(t,m.to);await delay(180);board[m.to]=board[m.from];board[m.from]=null;draw(board);}
  if(pending.plan.reflow){for(const m of pending.plan.reflow){const t=$(`#tiles [data-id="${m.id}"]`);if(t)position(t,m.to);}say('Đổi vị trí các khối để mở đường mới.');await delay(300);}
  state=E.resume(state);selected=null;render();save();for(const {tile} of pending.plan.spawn)$(`#tiles [data-id="${tile.id}"]`)?.classList.add('spawn');
  say('Cặp mới đã vào bàn. Ghép cặp nào cũng được; hào quang giúp bạn tìm tiếp.');await delay(260);busy=false;controls();X.ready();coach();
 }
 function showHelp(){if(busy)return;modalOpen(`<section class="kp-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">TRƯỢT · CHẠM · POP!</div><div class="rules"><p><strong>Chạm khối sát ô trống</strong> để trượt vào. Nếu có nhiều hướng hợp lệ, các mũi tên sẽ chỉ ô đích. Bạn cũng có thể vuốt hoặc dùng phím mũi tên.</p><p><strong>Cùng màu và cùng hình:</strong> chạm cạnh ngang hoặc dọc sẽ tự ghép. Mỗi cặp có cùng dáng đá để dễ nhận ra khi các màu gần giống; không cần biết chữ trước.</p><p><strong>Hào quang chỉ là gợi ý, không bắt buộc thứ tự.</strong> Tự tìm viên còn lại bằng màu, dáng đá hoặc thành phần Kanji. Bấm Gợi ý để xem viên còn lại trong 2 giây. Chữ kết quả và công thức chỉ hiện sau khi ghép. Ghép mục tiêu phía sau vẫn được tính; lộ trình tự bỏ qua mục tiêu đã hoàn thành. Cặp ngoài lộ trình vẫn cho điểm và thẻ album.</p><p><strong>Sau khi ghép:</strong> cặp mới xuất hiện cách nhau ít nhất 5 ô; việc ghép cần nhiều lượt trượt hơn. Bàn chỉ dịch chuyển khi cần để đạt khoảng cách này.</p><p><strong>Bàn cố định ở mọi màn:</strong> mobile 5×7, PC 7×5. Mỗi bàn có 17 cặp đá và 1 ô trống. Các cặp bổ sung lấy từ bộ 24 chữ, mỗi chữ chỉ có một cặp trên bàn. Bàn tự đổi giữa 5×7 và 7×5 theo màn hình; các cặp kề nhau, điểm và tiến trình được giữ nguyên.</p><p>Không đếm giờ. Album giữ các chữ đã khám phá qua các màn. Ngưỡng sao được hiển thị trước trên bàn, riêng cho từng màn và bố cục. Gợi ý không trừ sao; hoàn thành luôn có ít nhất 1 sao.</p></div><button class="kp-secondary" data-guide-again>Xem minh họa cách ghép</button><button class="kp-secondary" data-settings>Tùy chỉnh · Buổi chơi thử</button><button class="kp-secondary" data-coach>Chơi lại hướng dẫn màn 1</button><button class="kp-action" data-action="close">Chơi tiếp →</button></section>`,'Cách chơi');}
 function showAbout(){modalOpen(`<section class="kp-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">VỀ BỘ CHỮ SƠ CẤP</div><div class="source-list"><p>Bản thử gồm <strong>24 chữ tuyển chọn, 15 màn</strong>. Lộ trình sơ cấp tham khảo N5, chưa bao gồm toàn bộ Kanji N5. Lời giải thích được tự biên soạn và đã được AI đối chiếu nguồn; vẫn chờ biên tập viên tiếng Nhật duyệt trước phát hành.</p><p>Danh sách tham khảo từ JLPT Sensei. JLPT không công bố danh sách Kanji cố định cho từng cấp. Công thức trong game mô tả hình dạng thành phần, không giải thích nguồn gốc lịch sử của chữ.</p><p>Thu thập là đã khám phá, không đồng nghĩa đã ghi nhớ hoặc đạt trình độ N5.</p>${C.sources.map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>`).join('')}</div><button class="kp-action" data-action="close">Đã hiểu</button></section>`,'Về bộ chữ N5');}
 function showMobileMenu(){
  if(busy)return;
  const curSound=A?.getSoundProfile?.()||'gem',curBgm=A?.getBgmStyle?.()||'pop',opt=(v,t,c)=>`<option value="${v}" ${c===v?'selected':''}>${t}</option>`;
  modalOpen(`<section class="kp-modal mobile-play-menu" role="dialog" aria-modal="true"><h2>Màn ${String(state.level+1).padStart(2,'0')}</h2><p class="mobile-menu-stats">${state.moves} lượt · ${state.matches} cặp ghép<br><strong>★★★ ≤ ${thresholds().three} lượt · ★★ ≤ ${thresholds().two} lượt</strong></p><label style="display:block;margin:10px 0 6px;text-align:left;font-size:13px;font-weight:700;color:#c7b7fd">Nhạc nền (BGM):<select data-bgm-style style="display:block;margin-top:5px;width:100%;padding:10px;border-radius:10px;background:#241d4f;color:#fff;border:1px solid #7d65db;font-size:13px;font-weight:600">${opt('pop','🎵 Pop Nhật Bản vui tươi (Bản gốc)',curBgm)}${opt('zen','🍃 Zen Chill thư giãn (Đàn đá & mộc cầm)',curBgm)}${opt('none','🔇 Tắt nhạc nền',curBgm)}</select></label><label style="display:block;margin:6px 0 14px;text-align:left;font-size:13px;font-weight:700;color:#c7b7fd">Hiệu ứng trượt khối:<select data-sound-style style="display:block;margin-top:5px;width:100%;padding:10px;border-radius:10px;background:#241d4f;color:#fff;border:1px solid #7d65db;font-size:13px;font-weight:600">${opt('gem','💎 ① Đá quý & Pha lê (Bản gốc)',curSound)}${opt('tile','🪨 ② Lướt gạch đá êm (Tile Slide)',curSound)}${opt('crystal','✨ ③ Pha lê ngân nhẹ (Crystal Chime)',curSound)}${opt('stone','⚫ ④ Đá cờ vây (Go Stone)',curSound)}${opt('soft','🎋 ⑤ Ngọc bích dịu (Soft Jade)',curSound)}</select></label><button class="kp-secondary" data-audio-studio style="width:100%;margin:4px 0 12px;padding:10px;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px;background:#32205c;color:#fff;border:1px solid #9471f5;border-radius:10px;cursor:pointer"><i data-lucide="headphones" aria-hidden="true"></i>🎧 Phòng thử & Nghe chọn từng âm thanh...</button><div class="mobile-menu-grid"><button data-mobile-help><i data-lucide="circle-help" aria-hidden="true"></i>Cách chơi</button><button data-action="album"><i data-lucide="book-open" aria-hidden="true"></i>Album</button><button data-action="map"><i data-lucide="map" aria-hidden="true"></i>Lộ trình</button><button data-settings><i data-lucide="settings" aria-hidden="true"></i>Tùy chỉnh</button></div><button class="mobile-restart" data-mobile-restart>Chơi lại màn này</button><button class="kp-action" data-action="close">Tiếp tục chơi</button></section>`,'Menu màn chơi');
 }
 function showHint(){
  if(busy||state.pending||state.status!=='playing')return;
  const anchor=E.targetAnchor(state),mate=anchor&&state.board.find(t=>t?.recipe===anchor.recipe&&t.id!==anchor.id);
  if(!mate){say('Cặp mục tiêu sẽ được ưu tiên ở lần bù đá tiếp theo.');return;}
  A?.hint();
  clearTimeout(partnerTimer);hintedTile=mate.id;hintUntil=performance.now()+2000;highlightObjective();
  X.log('hint',{level:state.level,moves:state.moves,kind:'partner'});say('Viên ghép cùng được làm sáng trong 2 giây.');
  partnerTimer=setTimeout(()=>{hintedTile=null;hintUntil=0;highlightObjective();say('Tìm đường để đưa hai viên chạm cạnh nhau.');},2000);
 }
 function coach(){
  const el=$('#coach');if(!el)return;
  const active=view==='play'&&state.level===0&&!X.data.tutorialDone&&!state.pending&&state.status==='playing';el.hidden=!active;if(!active)return;
  const step=Math.min(3,state.moves+1),text=step===1?'Tìm viên cùng màu, cùng dáng với viên có hào quang.':step===2?'Chạm khối cạnh ô trống để mở đường.':'Đưa hai viên cùng cặp chạm cạnh nhau để khám phá chữ.';
  el.innerHTML=`<span><b>BƯỚC ${step}/3</b> ${text}</span><button data-skip-coach>Bỏ qua</button>`;
  root.querySelectorAll('.coach-tile,.coach-hole').forEach(n=>n.classList.remove('coach-tile','coach-hole'));
 }
 function composition(r){
  const lr=['休','外','何','時','話','語','読','校'],enclosed=['国','間','聞'],upper=['友','左','右'];
  const kind=lr.includes(r.id)?'lr':enclosed.includes(r.id)?'enclosed':upper.includes(r.id)?'upper':r.id==='本'?'root':'tb';
  return `<span class="composition-parts ${kind}" aria-hidden="true"><span>${part(r.parts[0])}</span><span>${part(r.parts[1])}</span></span>`;
 }
 function chaptersDone(){return C.chapters.map((_,c)=>C.levels.filter(l=>l.chapter===c).every(l=>profile.results[l.id]));}
 const rewardNames=['Cực quang','Vườn tinh vân','Ánh sao vàng'],rewardThemes=['aurora','rose','gold'];
 function rewardsMarkup(){return '<section class="reward-shelf"><h2>Kho báu hành trình</h2>'+C.chapters.map((c,i)=>{const done=chaptersDone()[i],progress=C.levels.filter(l=>l.chapter===i&&profile.results[l.id]).length;return `<div class="reward-card ${done?'earned':''}"><span class="reward-art sky-${rewardThemes[i]}" aria-hidden="true">${['✧','✿','✦'][i]}</span><div><strong>${rewardNames[i]}</strong><p>${done?'Đã mở nền và trang album sao':`${progress}/5 màn · Hoàn thành chương ${i+1} để mở`}</p></div><button data-reward="${i}" ${done?'':'disabled'}>${X.settings.theme===rewardThemes[i]?'Đang dùng':'Dùng nền'}</button></div>`;}).join('')+'<button class="scope-link" data-settings>Tùy chỉnh nhịp chơi & nền</button></section>';}
 function rewardWin(){const c=C.levels[state.level].chapter;return state.level%5===4?`<div class="reward-unlocked"><span aria-hidden="true">✦</span> Đã mở <strong>${rewardNames[c]}</strong><br>Nền mới · Trang album<button class="kp-secondary" data-reward="${c}">Dùng nền mới</button></div>`:'';}
 function openCard(id){if(busy||!C.recipes[id])return;const r=C.recipes[id];modalOpen(`<section class="kp-modal reveal-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">${X.data.reviewed[id]?'ĐÃ ÔN':'ĐÃ KHÁM PHÁ'}</div>${revealBody(r)}<button class="kp-action" data-action="close">Chơi tiếp →</button></section>`,r.meaning);X.log('card_reopen',{recipe:id});}
 
function showAudioStudio(){
  if(busy) return;
  const curMap = A?.getAudioMap?.() || {};
  const presets = A?.getPresets?.() || {};
  
  const audioFunctions = [
    {
      key: 'tileTap',
      title: '🪨 1. Tương tác khối (Chạm · Trượt · Tiếp xúc)',
      desc: 'Âm thanh xúc giác khi chạm khối, trượt vào ô trống và 2 khối chạm nhau (Đã gộp thống nhất)',
      options: [
        { val: 'tile', label: '🪨 ① Phiến đá mộc êm (Slate Tile - Đề xuất)' },
        { val: 'gem', label: '💎 ② Đá quý & Pha lê trong vắt (Gem Clink)' },
        { val: 'wood', label: '🪵 ③ Mộc bản Marimba ấm áp (Warm Wood)' },
        { val: 'stone', label: '⚫ ④ Quân cờ vây lách cách (Go Stone)' },
        { val: 'soft', label: '🎋 ⑤ Ngọc bích cổ phong dịu nhẹ (Soft Jade)' },
        { val: 'porcelain', label: '🍶 ⑥ Gốm sứ tráng men thanh tao (Porcelain)' },
        { val: 'metal', label: '🔔 ⑦ Kim khí vi mô ngân nhẹ (Metallic Clink)' },
        { val: 'quartz', label: '🔮 ⑧ Thạch anh tím vang nhẹ (Quartz Chime)' },
        { val: 'bamboo', label: '🌿 ⑨ Đốt tre mộc lách cách (Bamboo Snap)' },
        { val: 'water', label: '💧 ⑩ Giọt nước thanh thoát (Water Droplet)' }
      ]
    },
    {
      key: 'fusion',
      title: '🌟 2. Ghép thành công chữ Kanji (Fusion / Match)',
      desc: 'Hiệu ứng âm thanh khi hợp thể thành chữ Kanji hoàn chỉnh (10 phong cách)',
      options: [
        { val: 'pop', label: '🎵 ① Thác ngọc Celesta & J-Pop (Bản gốc - Hân hoan)' },
        { val: 'zen', label: '🍃 ② Đàn đá Lithophone thiền viện (Ấm áp, thanh tịnh)' },
        { val: 'sparkle', label: '✨ ③ Mưa sao băng pha lê (Huyền ảo, lung linh)' },
        { val: 'taiko', label: '🥁 ④ Trống Taiko & Chuông đền (Trang nghiêm)' },
        { val: 'koto', label: '🌸 ⑤ Đàn tranh Koto cổ phong (Nhã nhặn truyền thống)' },
        { val: 'thunder', label: '⚡ ⑥ Sét ma thuật nổ tanh tách (Thunder Spark)' },
        { val: 'water', label: '🌊 ⑦ Sóng nước dâng trào (Ocean Ripple)' },
        { val: 'arcade', label: '🎮 ⑧ Retro 8-Bit Powerup (Pixel Arcade)' },
        { val: 'strings', label: '🎻 ⑨ Dàn dây du dương nở rộ (Strings Blossom)' },
        { val: 'cosmic', label: '🔮 ⑩ Cổng không gian vũ trụ (Cosmic Portal)' }
      ]
    },
    {
      key: 'win',
      title: '🏆 3. Hoàn thành màn chơi (Win Fanfare)',
      desc: 'Giai điệu chiến thắng khi đạt mục tiêu màn chơi (10 phong cách)',
      options: [
        { val: 'pop', label: '🎺 ① J-Pop Joyful Fanfare (Hân hoan tột đỉnh - Bản gốc)' },
        { val: 'zen', label: '🍃 ② Đại hợp âm đàn đá & mộc cầm (Grand Harmony)' },
        { val: 'crystal', label: '✨ ③ Ánh sáng thiên đường (Celestial Chime)' },
        { val: 'matsuri', label: '🥁 ④ Lễ hội Matsuri rộn rã (Festival Taiko)' },
        { val: 'sakura', label: '🌸 ⑤ Khúc hoa anh đào (Sakura Serenade)' },
        { val: 'arcade', label: '🎮 ⑥ Phá đảo Arcade 8-Bit (Stage Clear)' },
        { val: 'brass', label: '👑 ⑦ Kèn đồng hoàng gia khải hoàn (Victory Brass)' },
        { val: 'cathedral', label: '🔔 ⑧ Chuông hòa âm đa tầng (Chime Cathedral)' },
        { val: 'cosmic', label: '🌌 ⑨ Vụ nổ siêu tân tinh (Cosmic Supernova)' },
        { val: 'circus', label: '🎪 ⑩ Khúc ca tưng bừng vui nhộn (Circus Fanfare)' }
      ]
    },
    {
      key: 'bgm',
      title: '🎵 4. Nhạc nền (BGM)',
      desc: 'Giai điệu âm nhạc phát xuyên suốt màn chơi (10 phong cách)',
      options: [
        { val: 'pop', label: '🎵 ① Pop Nhật Bản vui tươi 126 BPM (Bản gốc sôi động)' },
        { val: 'zen', label: '🍃 ② Zen Chill 118 BPM (Đàn đá & mộc cầm thư thái)' },
        { val: 'lofi', label: '☕ ③ Lofi Study Cafe 84 BPM (Ấm cúng, thư giãn)' },
        { val: 'koto', label: '🌸 ④ Cổ phong trà đạo Koto (Phong vị Nhật Bản)' },
        { val: 'citypop', label: '🌆 ⑤ City Pop Tokyo 122 BPM (Hào hứng thập niên 80)' },
        { val: 'chiptune', label: '🎮 ⑥ 8-Bit Chiptune Arcade 130 BPM (Game 4 nút NES)' },
        { val: 'ocean', label: '🌊 ⑦ Sóng biển êm đềm Ambient (Thư thái không lời)' },
        { val: 'synthwave', label: '🌌 ⑧ Cosmic Synthwave 115 BPM (Vũ trụ kỳ ảo)' },
        { val: 'piano', label: '🌧️ ⑨ Đàn Piano đêm mưa (Du dương lãng mạn)' },
        { val: 'none', label: '🔇 ⑩ Tắt nhạc nền (Chỉ nghe tiếng gõ khối & đọc chữ)' }
      ]
    },
    {
      key: 'voice',
      title: '🗣️ 5. Phát âm tiếng Nhật (TTS)',
      desc: 'Giọng đọc native chuẩn tiếng Nhật phát âm Kanji và ví dụ khi ghép',
      options: [
        { val: 'on', label: '🔊 Bật tự động phát âm khi ghép chữ (Đề xuất)' },
        { val: 'off', label: '🔇 Tắt giọng đọc tiếng Nhật' }
      ]
    }
  ];

  const optHtml = (options, selectedVal) =>
    options.map(o => `<option value="${o.val}" ${o.val === selectedVal ? 'selected' : ''}>${o.label}</option>`).join('');

  const rowsHtml = audioFunctions.map(fn => `
    <div class="audio-fn-card">
      <div class="audio-fn-header">
        <span class="audio-fn-title">${fn.title}</span>
        <span class="audio-fn-desc">${fn.desc}</span>
      </div>
      <div class="audio-fn-controls">
        <select data-audio-fn="${fn.key}">
          ${optHtml(fn.options, curMap[fn.key])}
        </select>
        <button type="button" class="audio-preview-btn" data-audio-preview="${fn.key}" title="Bấm để nghe thử âm thanh này">
          ▷ Nghe thử
        </button>
      </div>
    </div>
  `).join('');

  const presetBtnsHtml = Object.entries(presets).map(([k, p]) => `
    <button type="button" class="audio-preset-btn ${p.map.bgm === curMap.bgm && p.map.tileTap === curMap.tileTap ? 'active' : ''}" data-preset-btn="${k}">
      <strong>${p.name}</strong><br><small style="color:#5f829d;font-size:10.5px">${p.desc}</small>
    </button>
  `).join('');

  const bodyHtml = `
    <section class="kp-modal audio-studio-modal" role="dialog" aria-modal="true">
      <div class="kp-modal-title">PHÒNG THỬ ÂM THANH</div>
      <p class="audio-studio-desc">
        Mỗi mục có <strong>10 lựa chọn phong phú</strong>. Bấm nút <strong>▷ Nghe thử</strong> ở từng dòng để nghe thực tế và tự do phối ghép theo ý bạn!
      </p>
      <div class="audio-preset-box">
        <span class="preset-box-title">Bộ phối mẫu nhanh:</span>
        <div class="preset-grid">
          ${presetBtnsHtml}
        </div>
      </div>
      <div class="audio-rows-container">
        ${rowsHtml}
      </div>
      <div class="audio-studio-footer">
        <button type="button" class="kp-action" data-action="save-audio-studio">💾 Lưu & Áp dụng ngay</button>
        <button type="button" class="kp-secondary" data-action="close">Đóng</button>
      </div>
    </section>
  `;

  modalOpen(bodyHtml, 'Phòng thử & Tùy chỉnh âm thanh');
}

function showSettings(){
  if(busy)return;const done=chaptersDone(),opt=(value,text,current)=>`<option value="${value}" ${current===value?'selected':''}>${text}</option>`;
  const curSound=A?.getSoundProfile?.()||'gem',curBgm=A?.getBgmStyle?.()||'pop',isVoice=A?.isVoiceEnabled?A.isVoiceEnabled():true;
  modalOpen(`<section class="kp-modal experience-settings" role="dialog" aria-modal="true"><div class="kp-modal-title">CÀI ĐẶT & NHỊP CHƠI</div><label>Nhạc nền (BGM)<select data-bgm-style>${opt('pop','🎵 Pop Nhật Bản vui tươi 126 BPM (Bản gốc sôi động)',curBgm)}${opt('zen','🍃 Zen Chill 118 BPM (Thư giãn, đàn đá & mộc cầm)',curBgm)}${opt('none','🔇 Tắt nhạc nền (Chỉ giữ hiệu ứng)',curBgm)}</select></label><label>Hiệu ứng trượt khối (SFX)<select data-sound-style>${opt('gem','💎 ① Tiếng đá quý & pha lê (Gem Clink - Bản gốc)',curSound)}${opt('tile','🪨 ② Tiếng lướt gạch đá êm dịu (Tile Slide)',curSound)}${opt('crystal','✨ ③ Tiếng pha lê ngân nhẹ (Crystal Chime)',curSound)}${opt('stone','⚫ ④ Tiếng đá cờ vây đanh gọn (Go Stone)',curSound)}${opt('soft','🎋 ⑤ Tiếng ngọc bích dịu (Soft Jade)',curSound)}</select></label><label>Phát âm tiếng Nhật (TTS)<select data-voice-toggle>${opt('on','🔊 Bật tự động phát âm khi ghép chữ (Đề xuất)',isVoice?'on':'off')}${opt('off','🔇 Tắt giọng đọc tiếng Nhật',isVoice?'on':'off')}</select></label><label>Hiệu ứng<select data-setting="quality">${opt('auto','Tự động theo độ mượt',X.settings.quality)}${opt('light','Nhẹ · tiết kiệm tài nguyên',X.settings.quality)}${opt('full','Đầy đủ',X.settings.quality)}</select></label><label>Nền bàn chơi<select data-setting="theme">${opt('cosmos','Vũ trụ',X.settings.theme)}${rewardThemes.map((id,i)=>done[i]?opt(id,rewardNames[i],X.settings.theme):'').join('')}</select></label><p class="settings-note"><strong>Hiệu ứng ghép theo nguyên tố của viên đá.</strong> Hào quang ma thuật → ghép ma thuật; sét → sét; nước → nước.</p><p class="settings-note">Mọi cặp ghép đều có hiệu ứng đầy đủ và bảng thông tin. Ghép cặp khác vẫn nhận điểm, thêm chữ vào album và tính mục tiêu nếu thuộc màn này. Hoàn thành từng chương để mở nền mới. Gợi ý không trừ sao.</p><button class="kp-secondary" data-audio-studio style="background:#f0f8ff;border-color:#53aadc;color:#0d5c8a"><i data-lucide="headphones" aria-hidden="true"></i>🎧 Mở Phòng thử âm thanh (Nghe thử & đổi từng hiệu ứng) ➔</button><button class="kp-secondary" data-progress>Sao lưu & khôi phục tiến trình</button><button class="kp-secondary" data-study-new>Mở phiên chơi thử riêng</button><button class="kp-secondary" data-playtest>Buổi chơi thử · ghi nhận trên thiết bị</button><button class="kp-action" data-action="close">Lưu & tiếp tục</button></section>`,'Tùy chỉnh nhịp chơi');
 }
 function showStudySetup(){
  if(busy)return;modalOpen('<section class="kp-modal progress-panel" role="dialog" aria-modal="true"><h2>Phiên chơi thử riêng</h2><p>Dành cho người Việt trưởng thành. Bắt đầu từ màn 1 trong tab mới; bàn chơi và nhật ký được lưu riêng, không dùng album chính.</p><label>Mức quen tiếng Nhật<select id="study-familiarity"><option value="">Chọn mức quen thuộc</option><option value="none">Chưa biết tiếng Nhật</option><option value="beginner">Mới bắt đầu học</option></select></label><label class="study-consent"><input id="study-consent" type="checkbox"> Người thử là người trưởng thành và đồng ý ghi thao tác, nhận xét trên máy này để đánh giá game.</label><p>Không cần tên hoặc email. Không gửi dữ liệu lên máy chủ.</p><button class="kp-secondary" data-study-launch>Mở phiên mới</button><p id="study-setup-status" role="status"></p><a id="study-open-link" hidden target="_blank" rel="noopener">Mở phiên đã tạo</a><button class="kp-action" data-action="close">Quay lại</button></section>','Tạo phiên chơi thử riêng');
 }
 function launchStudy(){
  const familiarity=$('#study-familiarity').value;if(!['none','beginner'].includes(familiarity)||!$('#study-consent').checked){$('#study-setup-status').textContent='Chọn mức quen thuộc và xác nhận đồng ý trước khi bắt đầu.';return;}
  const id=crypto.randomUUID(),url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('playtest',id);
  try{localStorage.setItem('kanji-pop-study-meta-'+id,JSON.stringify({id,familiarity,adultConsent:true,createdAt:new Date().toISOString()}));}catch{$('#study-setup-status').textContent='Chưa tạo được phiên. Trình duyệt đang chặn lưu hoặc hết dung lượng.';return;}
  const link=$('#study-open-link');link.href=url.href;link.hidden=false;$('#study-setup-status').textContent='Đã tạo phiên riêng. Nếu tab không mở, bấm liên kết bên dưới. Hãy xuất báo cáo trước khi xóa dữ liệu trình duyệt.';window.open(url.href,'_blank','noopener');
 }
 function showStudyReport(){
  const report=X.report();modalOpen('<section class="kp-modal progress-panel study-report" role="dialog" aria-modal="true"><h2>Báo cáo chơi thử</h2><p id="study-report-scope"></p><div id="study-report-runs"></div><p>Thời gian ghép đầu tính khi trang hiện, gồm cả đọc hướng dẫn. Rời màn không tự được coi là bỏ cuộc. Chưa có dữ liệu không có nghĩa là 0.</p><button class="kp-secondary" data-playtest>Ghi nhận xét & xuất JSON</button><button class="kp-action" data-action="close">Quay lại</button></section>','Báo cáo phiên chơi thử');
  $('#study-report-scope').textContent=(KanjiSession.study?'Phiên thử riêng':'Phiên chơi chính')+' · '+report.runs.length+' lượt chơi · '+report.eventsDropped+' sự kiện cũ đã vượt giới hạn lưu.';
  const host=$('#study-report-runs');if(!report.runs.length)host.textContent='Chưa có lượt chơi được ghi nhận theo định dạng mới.';
  for(const r of report.runs){const item=document.createElement('p');item.className='study-run';item.textContent='Màn '+(r.level+1)+' · '+r.mode+' · '+r.moves+' lượt trượt · '+r.matches+' lần ghép · '+r.hints+' gợi ý · '+r.invalidActions+' thao tác chưa hợp lệ · '+r.anchorMoved+' lần bù dịch viên mục tiêu. Ghép đầu: '+(r.firstMatchVisibleMs===null?'chưa đủ dữ liệu':(r.firstMatchVisibleMs/1000).toFixed(1)+' giây')+'. '+(r.completed?'Đã hoàn thành.':'Chưa ghi nhận hoàn thành.');host.append(item);}
 }
 root.addEventListener('click',e=>{if(e.target.closest('[data-study-new]'))showStudySetup();if(e.target.closest('[data-study-launch]'))launchStudy();if(e.target.closest('[data-study-report]'))showStudyReport();});
 function showPlaytest(){const events=X.data.events,matches=events.filter(e=>e.type==='match'),invalid=events.filter(e=>e.type==='invalid_tap'||e.type==='invalid_move'),refills=events.filter(e=>e.type==='refill');modalOpen(`<section class="kp-modal experience-settings" role="dialog" aria-modal="true"><div class="kp-modal-title">BUỔI CHƠI THỬ</div><p>Chỉ lưu cục bộ trên trình duyệt. Không gửi dữ liệu ra ngoài. ${KanjiSession.study?'Đây là phiên thử riêng, tách khỏi tiến trình chính.':'Đây là dữ liệu chơi chính; hãy mở phiên thử riêng cho người mới.'}</p><button class="kp-secondary" data-study-new>Mở phiên thử cho người tiếp theo</button><button class="kp-secondary" data-study-report>Xem báo cáo phiên này</button><a class="kp-secondary" href="study-dashboard.html" target="_blank" rel="noopener">Tổng hợp các phiên · người điều phối ↗</a><label class="logging-toggle"><input type="checkbox" data-logging ${X.settings.logging?'checked':''}> Ghi nhận thao tác và độ mượt</label><div class="test-stats"><span>${matches.length}<small>lần ghép</small></span><span>${invalid.length}<small>chạm chưa hợp lệ</small></span><span>${refills.filter(e=>e.reflow>0||e.shifts>0).length}<small>lần đổi vị trí</small></span></div><label>Sau buổi chơi, bạn nhớ chữ hoặc nghĩa nào?<textarea id="recall-answer" rows="3" maxlength="1500" placeholder="Tự nhớ trước khi mở album…"></textarea></label><label>Mức độ muốn chơi tiếp<select id="again-answer"><option value="">Chọn câu trả lời</option><option value="yes">Muốn chơi thêm</option><option value="unsure">Chưa chắc</option><option value="no">Muốn dừng</option></select></label><label>Độ dễ hiểu<select id="rating-answer"><option value="">Chọn mức độ</option>${[5,4,3,2,1].map(n=>`<option>${n}</option>`).join('')}</select></label><button class="kp-secondary" data-save-observation>Lưu nhận xét của người chơi</button><button class="kp-secondary" data-export-test>Xuất dữ liệu chơi thử JSON</button><label id="export-backup" hidden>Bản JSON dự phòng · có thể chọn và sao chép nếu trình duyệt chặn tải xuống<textarea id="export-json" readonly rows="4"></textarea></label><p id="observation-status" role="status"></p><button class="kp-action" data-action="close">Quay lại game</button></section>`,'Ghi nhận buổi chơi thử');}
 root.addEventListener('change',e=>{if(e.target.matches('[data-audio-fn]'))A?.preview?.(e.target.dataset.audioFn, e.target.value);if(e.target.matches('[data-sound-style]'))A?.setSoundProfile?.(e.target.value);if(e.target.matches('[data-bgm-style]'))A?.setBgmStyle?.(e.target.value);if(e.target.matches('[data-voice-toggle]'))A?.setVoiceEnabled?.(e.target.value === 'on');if(e.target.matches('[data-setting]')){X.set(e.target.dataset.setting,e.target.value);X.log('setting',{name:e.target.dataset.setting,value:e.target.value});}if(e.target.matches('[data-logging]'))X.set('logging',e.target.checked);});
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-audio-studio]')){showAudioStudio();return;}if(e.target.closest('[data-settings]'))showSettings();
  if(e.target.closest('[data-about]'))showAbout();
  if(e.target.closest('[data-guide-again]'))showLevelIntro();
  if(e.target.closest('[data-playtest]'))showPlaytest();
  if(e.target.closest('[data-export-test]')){const payload=X.exportData();$('#export-backup').hidden=false;$('#export-json').value=payload;$('#observation-status').textContent='Đã yêu cầu tải JSON. Có bản sao bên trên nếu trình duyệt không tải được.';}
  if(e.target.closest('[data-save-observation]')){const ok=X.observation($('#recall-answer').value,$('#again-answer').value,Number($('#rating-answer').value));$('#observation-status').textContent=ok?'Đã lưu nhận xét trên thiết bị này.':'Chọn đủ câu trả lời và kiểm tra tab có quyền lưu. Chưa xác nhận lưu nhận xét.';}
  if(e.target.closest('[data-skip-coach]')){X.finishTutorial(true);coach();root.querySelectorAll('.coach-tile,.coach-hole').forEach(n=>n.classList.remove('coach-tile','coach-hole'));}
  if(e.target.closest('[data-coach]')){X.resetTutorial();closeModal();startLevel(0);}
  if(e.target.closest('[data-dismiss-card]'))$('#quick-card').hidden=true;
  const card=e.target.closest('[data-last-card]');if(card)openCard(card.dataset.lastCard);
  const reward=e.target.closest('[data-reward]');if(reward&&chaptersDone()[Number(reward.dataset.reward)]){X.set('theme',rewardThemes[Number(reward.dataset.reward)]);reward.textContent='Đang dùng';}
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){activeFx?.cancel?.();audio?.suspend();save();}else if(sound)audio?.resume();});

 $('#hint').addEventListener('click',showHint);$('#help').addEventListener('click',showMobileMenu);$('#kp-home')?.addEventListener('click',()=>changeView('map'));
  $('.kp-logo')?.addEventListener('click',()=>{A?.select?.();changeView('map');});
 $('#nav-map').addEventListener('click',()=>changeView('map'));$('#nav-album').addEventListener('click',()=>changeView('album'));$('#nav-play').addEventListener('click',()=>changeView('play'));
 $('#kp-sound').addEventListener('click',()=>{sound=!sound;save();render();if(sound)A?.hint();});
 $('#map-screen').addEventListener('click',e=>{
  if(busy)return;
  if(e.target.closest('[data-concept-logo]')){A?.select?.();changeView('map');return;}
  if(e.target.closest('[data-concept-lang]')){$('#kp-lang')?.click();return;}
  if(e.target.closest('[data-concept-sound]')){$('#kp-sound')?.click();return;}
  const cLvl=e.target.closest('[data-concept-level]');
  if(cLvl){
   const targetLvl=Number(cLvl.dataset.conceptLevel);
   A?.select?.();
   mapSelected=targetLvl;
   const resume=state.status==='playing'&&(state.moves>0||state.pending)&&state.level<=unlocked()&&state.level===targetLvl;
   if(resume)changeView('play');else startLevel(targetLvl);
   return;
  }
  const prev=e.target.closest('[data-kanji-preview]');
  if(prev){
   A?.select();
   const id=prev.dataset.kanjiPreview;
   const r=C.recipes[id];
   if(r&&profile.collected.includes(id)){
    modalOpen(`<section class="kp-modal reveal-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">THẺ KANJI ĐÃ THU THẬP</div>${revealBody(r)}<button class="kp-action" data-action="close">Về hành trình</button></section>`,r.id+' — '+(r.hanViet||r.meaning));
   }else if(r){
    const intro=C.levels.find(l=>l.newChars&&l.newChars.includes(id));
    say('Chữ '+id+' ('+(r.hanViet||r.meaning)+') sẽ xuất hiện tại Màn '+(intro?intro.id+1:'?')+'. Hãy chơi màn để mở khóa!');
    A?.hint();
   }
   return;
  }
  const chapterButton=e.target.closest('[data-chapter-step]');
  if(chapterButton&&!chapterButton.disabled){
   A?.select();
   mapChapter=Math.max(0,Math.min(2,mapChapter+Number(chapterButton.dataset.chapterStep)));
   mapSelected=null;
   renderMap();icons();
   $('#map-screen h1').focus({preventScroll:true});
   return;
  }
  if(e.target.closest('[data-journey-album]')){A?.select();changeView('album');return;}
  if(e.target.closest('[data-journey-menu]')){A?.select();showJourneyMenu();return;}
  const mainBtn=e.target.closest('[data-main],[data-hero-play]');
  if(mainBtn&&!mainBtn.hasAttribute('disabled')&&mainBtn.getAttribute('aria-disabled')!=='true'){
   A?.select();
   const main=mainBtn.dataset.main||mainBtn.dataset.heroPlay;
   if(main==='resume')changeView('play');
   else if(main==='album')changeView('album');
   else startLevel(Number(main));
   return;
  }
  const node=e.target.closest('[data-journey-level]');
  if(node&&!node.disabled){
   const targetLvl=Number(node.dataset.journeyLevel);
   if(mapSelected===targetLvl){
    A?.select();
    const resume=state.status==='playing'&&(state.moves>0||state.pending)&&state.level<=unlocked()&&mapSelected===state.level;
    if(resume)changeView('play');else startLevel(targetLvl);
    return;
   }
   A?.select();
   mapSelected=targetLvl;
   renderMap();icons();
   $('#map-screen [data-journey-level="'+mapSelected+'"]').focus({preventScroll:true});
   return;
  }
 });
 $('#map-screen').addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-main]')){
   e.preventDefault();
   e.target.closest('[data-main]').click();
  }
 });
 $('#album-screen').addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(!b||b.disabled)return;const r=C.recipes[b.dataset.card];modalOpen(`<section class="kp-modal reveal-modal" role="dialog" aria-modal="true"><div class="kp-modal-title">THẺ ĐÃ THU THẬP</div>${revealBody(r)}<button class="kp-action" data-action="close">Về album</button></section>`,r.id+' — '+r.meaning);});
 $('#modal').addEventListener('click',e=>{if(e.target.closest('[data-mobile-help]')){showHelp();return;}if(e.target.closest('[data-mobile-restart]')){startLevel(state.level);return;}
  if(e.target.closest('[data-audio-preview]')){
    const btn = e.target.closest('[data-audio-preview]');
    const fnKey = btn.dataset.audioPreview;
    const card = btn.closest('.audio-fn-card');
    const sel = card?.querySelector('[data-audio-fn]');
    const val = sel?.value || 'gem';
    btn.classList.add('playing');
    btn.textContent = '▶ Đang nghe...';
    A?.preview?.(fnKey, val);
    setTimeout(()=>{
      btn.classList.remove('playing');
      btn.textContent = '▷ Nghe thử';
    }, fnKey === 'bgm' ? 2400 : (fnKey === 'fusion' ? 1200 : 450));
    return;
  }
  if(e.target.closest('[data-preset-btn]')){
    const pBtn = e.target.closest('[data-preset-btn]');
    const pId = pBtn.dataset.presetBtn;
    const presets = A?.getPresets?.() || {};
    const preset = presets[pId];
    if(preset && preset.map){
      $('#modal').querySelectorAll('.audio-preset-btn').forEach(b => b.classList.remove('active'));
      pBtn.classList.add('active');
      Object.entries(preset.map).forEach(([k, v])=>{
        const sel = $('#modal').querySelector(`[data-audio-fn="${k}"]`);
        if(sel) sel.value = v;
      });
      A?.preview?.('fusion', preset.map.fusion || 'pop');
    }
    return;
  }
  if(e.target.closest('[data-action="save-audio-studio"]')){
    const newMap = {};
    $('#modal').querySelectorAll('[data-audio-fn]').forEach(sel=>{
      newMap[sel.dataset.audioFn] = sel.value;
    });
    A?.setAudioMap?.(newMap);
    closeModal();
    say('Đã lưu cấu hình âm thanh của bạn! 🎵');
    return;
  }
  const a=e.target.closest('[data-action]')?.dataset.action;if(a==='begin-level')beginLevel();if(a==='continue')continueGame();if(a==='next')startLevel(state.level+1);if(a==='map')changeView('map');if(a==='album')changeView('album');if(a==='close')closeModal();if(a==='daily-win')showDailyWin(C.recipes[state.dailyTarget]);});
 const board=$('#slide-board');
 $('.board-cells').addEventListener('click',e=>{const cell=e.target.closest('button[data-empty]');if(!cell||busy||view!=='play'||!$('#modal').hidden)return;const to=Number(cell.dataset.empty),dir=E.directions.find(d=>E.destination(selected,d,state.rows,state.cols)===to);if(selected===null||!dir){say('Chọn một khối ngay cạnh ô trống này trước nhé.');return;}move(dir);});
 $('#tiles').addEventListener('click',e=>{const t=e.target.closest('button.board-tile');if(t&&e.detail===0)tap(Number(t.dataset.at));});
 $('#tiles').addEventListener('focusin',e=>{const t=e.target.closest('button.board-tile');if(t)select(Number(t.dataset.at));});
  document.addEventListener('click',e=>{
    const sp=e.target.closest('[data-speak]');
    if(sp){e.preventDefault();e.stopPropagation();window.KanjiAudio?.speak?.(sp.dataset.speak);return;}
    const gb=e.target.closest('[data-switch-grade]');
    if(gb){e.preventDefault();switchGrade(gb.dataset.switchGrade);return;}
    const daily=e.target.closest('[data-daily-play]');
    if(daily){
      e.preventDefault();
      const todayKey = getDailyKey();
      const rec = getDailyRecord(todayKey, currentGrade);
      if(rec && rec.solved && C.recipes[rec.target]){
        showDailyWin(C.recipes[rec.target]);
      } else {
        startDailyPuzzle();
      }
      return;
    }
    const shareBtn=e.target.closest('[data-daily-share]');
    if(shareBtn){
      e.preventDefault();
      copyShareText(decodeURIComponent(shareBtn.dataset.dailyShare));
      return;
    }
  });
 board.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||busy||!$('#modal').hidden)return;const t=e.target.closest('button.board-tile');if(!t)return;const at=Number(t.dataset.at);select(at,true);gesture={id:e.pointerId,at,x:e.clientX,y:e.clientY};board.setPointerCapture(e.pointerId);});
 board.addEventListener('pointerup',e=>{if(!gesture||gesture.id!==e.pointerId)return;const g=gesture,dx=e.clientX-g.x,dy=e.clientY-g.y;gesture=null;if(board.hasPointerCapture(e.pointerId))board.releasePointerCapture(e.pointerId);if(Math.max(Math.abs(dx),Math.abs(dy))<25){tap(g.at);return;}select(g.at,true);move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
 board.addEventListener('pointercancel',()=>gesture=null);board.addEventListener('lostpointercapture',()=>gesture=null);
 document.addEventListener('keydown',e=>{if(!$('#modal').hidden){if(e.key==='Escape'){if($('#modal [data-action="begin-level"]'))beginLevel();else if($('#modal [data-action="close"]'))closeModal();}if(e.key==='Tab'){const bs=[...$('#modal').querySelectorAll('button:not(:disabled),a[href],select:not(:disabled),input:not(:disabled),textarea:not(:disabled)')].filter(n=>n.getClientRects().length);if(!bs.length)return;if(e.shiftKey&&document.activeElement===bs[0]){e.preventDefault();bs.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===bs.at(-1)){e.preventDefault();bs[0].focus();}}return;}if(view!=='play')return;const dir={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'}[e.key];if(dir){e.preventDefault();if(!e.repeat)move(dir);}});
 new ResizeObserver(()=>{if(!busy)draw();}).observe(board);
 const langBtn=$('#kp-lang');if(langBtn){langBtn.addEventListener('click',()=>{I18N.toggleLang();updateLangUi();render();save();});}
 render();if(view==='play')enterPlay();else save();if(KanjiSession.study){const badge=document.createElement('span');badge.className='study-badge';badge.textContent='PHIÊN CHƠI THỬ RIÊNG';$('.kp-header').append(badge);}
})();



