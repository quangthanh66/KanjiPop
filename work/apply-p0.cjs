const fs=require('node:fs'),path=require('node:path');
const dir=path.join(__dirname,'kanji-pop-site/dist');
let file=path.join(dir,'n5-game.js'),s=fs.readFileSync(file,'utf8');
const start=s.indexOf(' try{\n'.replace('\n','\r\n')); // Source uses CRLF; normalize for precise replacements.
s=s.replace(/\r\n/g,'\n');
const a=s.indexOf(' try{\n  const saved='),b=s.indexOf(' let partnerTimer',a);
if(a<0||b<0)throw Error('save block not found');
s=s.slice(0,a)+` const saveNotice=document.createElement('button');saveNotice.className='save-notice';saveNotice.hidden=true;saveNotice.type='button';saveNotice.setAttribute('role','status');root.append(saveNotice);
 function storageNotice(kind){const messages={recovered:'Đã mở bản dự phòng vì bản lưu chính không đọc được.',damaged:'Bản lưu cũ bị lỗi. Đã giữ lại dữ liệu gốc; bạn có thể nhập bản sao.',blocked:'Trình duyệt không cho lưu an toàn. Hãy xuất tiến trình trước khi đóng.', 'write-failed':'Chưa lưu được tiến trình. Hãy xuất bản sao để tránh mất lượt chơi.',conflict:'Một tab khác đã cập nhật tiến trình. Tab này sẽ không ghi đè.'};saveNotice.textContent=messages[kind]+' Mở sao lưu';saveNotice.hidden=false;}
 const progressStore=KanjiProgress.create({getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},E,deviceMode,storageNotice);
 const restored=progressStore.read();
 if(restored){({state,profile,history,undos,view,sound}=restored);}
 function snapshot(){return {course:C.id,state,profile,history,undos,view,sound};}
 function save(){return progressStore.write(snapshot());}
 let stagedProgress=null;
 function showProgress(){
  if(busy)return;stagedProgress=null;
  modalOpen('<section class="kp-modal progress-panel" role="dialog" aria-modal="true"><h2>Sao lưu tiến trình</h2><p>Tiến trình chỉ nằm trên trình duyệt này. Bản sao gồm bàn chơi, album, sao và lượt hoàn tác; không gồm nhật ký chơi thử hoặc tùy chỉnh hiệu ứng.</p><button class="kp-secondary" data-progress-export>Xuất tiến trình hiện tại</button><label id="progress-export-label" hidden>Bản JSON để sao chép<textarea id="progress-export-json" readonly></textarea></label><label>Nhập file bản sao<input type="file" accept="application/json,.json" id="progress-file"></label><button class="kp-secondary" data-progress-backup>Mở bản dự phòng tự động</button><div id="progress-preview" class="progress-confirm" hidden><p id="progress-summary"></p><p>Khôi phục sẽ thay tiến trình hiện tại. Hãy xuất bản sao trước nếu muốn giữ cả hai.</p><button class="kp-secondary" data-progress-confirm>Xác nhận khôi phục</button></div><p id="progress-status" role="status"></p><button class="kp-secondary" data-progress-reload>Tải lại bản lưu trên trình duyệt</button><button class="kp-action" data-action="close">Quay lại</button></section>','Sao lưu và khôi phục tiến trình');
 }
 function previewProgress(value){stagedProgress=value;$('#progress-preview').hidden=false;$('#progress-summary').textContent='Bản sao: '+value.profile.collected.length+'/24 chữ · '+Object.keys(value.profile.results).length+'/15 màn hoàn thành · đang ở màn '+(value.state.level+1)+', '+value.state.moves+' lượt.';$('#progress-status').textContent='Bản sao hợp lệ. Chưa thay đổi tiến trình.';}
 function exportProgress(){
  try{const payload=progressStore.pack(snapshot());$('#progress-export-label').hidden=false;$('#progress-export-json').value=payload;const url=URL.createObjectURL(new Blob([payload],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kanji-pop-progress-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);$('#progress-status').textContent='Đã yêu cầu tải bản sao. Nếu tải không được, hãy sao chép JSON bên trên.';}catch{$('#progress-status').textContent='Không xuất được. Tiến trình hiện tại vẫn được giữ trong phiên chơi.';}
 }
 saveNotice.addEventListener('click',showProgress);
 window.addEventListener('storage',e=>{if(e.key===key||e.key===null)storageNotice('conflict');});
 window.addEventListener('pagehide',()=>save());
 root.addEventListener('change',async e=>{
  if(e.target.id!=='progress-file')return;stagedProgress=null;$('#progress-preview').hidden=true;const file=e.target.files[0];if(!file)return;
  try{if(file.size>progressStore.limit)throw Error('File vượt quá 2 MB.');const value=progressStore.decode(await file.text());if($('#progress-status'))previewProgress(value);}catch{if($('#progress-status'))$('#progress-status').textContent='File không hợp lệ hoặc thuộc phiên bản chưa hỗ trợ. Tiến trình chưa thay đổi.';}
 });
 root.addEventListener('click',e=>{
  if(e.target.closest('[data-progress]'))showProgress();
  if(e.target.closest('[data-progress-export]'))exportProgress();
  if(e.target.closest('[data-progress-backup]')){const value=progressStore.backup();if(value)previewProgress(value);else $('#progress-status').textContent='Chưa có bản dự phòng hợp lệ.';}
  if(e.target.closest('[data-progress-confirm]')&&stagedProgress){
   if(progressStore.restore(stagedProgress)){({state,profile,history,undos,view,sound}=stagedProgress);selected=null;saveNotice.hidden=true;closeModal();render();X.start(state);if(view==='play')enterPlay();}
   else $('#progress-status').textContent='Chưa khôi phục được. Kiểm tra quyền lưu hoặc xuất bản sao rồi tải lại nếu đang mở nhiều tab.';
  }
  if(e.target.closest('[data-progress-reload]')){stagedProgress=null;modalOpen('<section class="kp-modal progress-panel" role="dialog" aria-modal="true"><h2>Tải lại tiến trình?</h2><p>Lượt chơi chưa lưu của tab này sẽ mất. Chọn Quay lại để xuất bản sao trước.</p><button class="kp-secondary" data-progress-reload-confirm>Tải lại bản đã lưu</button><button class="kp-action" data-progress>Quay lại</button></section>','Xác nhận tải lại');}
  if(e.target.closest('[data-progress-reload-confirm]'))location.reload();
 });
`+s.slice(b);
s=s.replace('<button class="kp-secondary" data-playtest>Buổi chơi thử · ghi nhận trên thiết bị</button>','<button class="kp-secondary" data-progress>Sao lưu & khôi phục tiến trình</button><button class="kp-secondary" data-playtest>Buổi chơi thử · ghi nhận trên thiết bị</button>');
s=s.replace('VỀ BỘ CHỮ N5','VỀ BỘ CHỮ SƠ CẤP').replace('Đây là phần ghép chữ trong lộ trình N5, chưa bao gồm toàn bộ Kanji N5.','Lộ trình sơ cấp tham khảo N5, chưa bao gồm toàn bộ Kanji N5. Nội dung đang chờ người có chuyên môn tiếng Nhật duyệt trước phát hành.');
fs.writeFileSync(file,s);
file=path.join(dir,'index.html');s=fs.readFileSync(file,'utf8').replace('Kanji Pop! — Hành trình N5','Kanji Pop! — 24 Kanji sơ cấp · Bản thử local').replace('href="level-intro.css"','href="progress.css"><link rel="stylesheet" href="level-intro.css"').replace('<script src="n5-game.js">','<script src="progress-store.js"></script><script src="n5-game.js">');fs.writeFileSync(file,s);
