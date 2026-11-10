const fs=require('node:fs'),path=require('node:path'),dir=path.join(__dirname,'kanji-pop-site/dist');
let file=path.join(dir,'n5-game.js'),s=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
s=s.replace('(()=>{', '(async()=>{').replace(" 'use strict';"," 'use strict';\n await window.KanjiWriterReady;");
s=s.replace("key='kanji-pop-n5-v1'","key=KanjiSession.progressKey");
s=s.replace('s.entryGuideSeen=false;return s;','s.entryGuideSeen=false;s.runId=crypto.randomUUID();return s;');
s=s.replace("const messages={recovered:","const messages={readonly:KanjiWriter.reason()==='other-tab'?'Tab khác đang giữ quyền lưu. Đóng tab đó rồi tải lại tab này; bạn vẫn có thể xuất bản sao.':'Trình duyệt chưa hỗ trợ khóa lưu an toàn. Bạn vẫn có thể xuất bản sao.',recovered:");
s=s.replace('},E,deviceMode,storageNotice);','},E,deviceMode,storageNotice,{key,canWrite:()=>KanjiWriter.canWrite()});');
s=s.replace('render();X.start(state);if(view===\'play\')enterPlay();','render();if(view===\'play\')enterPlay();save();');
s=s.replace("window.addEventListener('pagehide',()=>save());","window.addEventListener('pagehide',()=>{save();X.save();KanjiWriter.release();});\n window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});\n window.addEventListener('kanji-study-save-error',()=>storageNotice('write-failed'));");
s=s.replace('function enterPlay(){if(state.pending)',"function enterPlay(){X.start(state);save();if(state.pending)");
s=s.replace("state=makeFresh(id);X.start(state);","if(state.runStarted&&state.status==='playing')X.log('level_exit',{reason:'restart-or-change'});state=makeFresh(id);X.start(state,'new');");
s=s.replace("function changeView(next){if(busy)return;","function changeView(next){if(busy)return;if(view==='play'&&next!=='play')X.log('level_exit',{reason:'navigation'});");
s=s.replace("X.log('refill',{level:state.level,shifts,reflow:reflow.length});","const movedTiles=new Set([...pending.plan.motions,...reflow].map(m=>m.id));X.log('refill',{level:state.level,shifts,reflow:reflow.length,movedTiles:movedTiles.size,anchorMoved:movedTiles.has(E.targetAnchor(state)?.id),spawnDistance:E.distance(pending.plan.spawn[0].at,pending.plan.spawn[1].at,state.cols)});");
s=s.replace('<button class="kp-secondary" data-progress>Sao lưu & khôi phục tiến trình</button>','<button class="kp-secondary" data-progress>Sao lưu & khôi phục tiến trình</button><button class="kp-secondary" data-study-new>Mở phiên chơi thử riêng</button>');
s=s.replace('Số liệu gồm nhiều phiên trên thiết bị này.','${KanjiSession.study?\'Đây là phiên thử riêng, tách khỏi tiến trình chính.\':\'Đây là dữ liệu chơi chính; hãy mở phiên thử riêng cho người mới.\'}');
s=s.replace('<label class="logging-toggle">','<button class="kp-secondary" data-study-new>Mở phiên thử cho người tiếp theo</button><button class="kp-secondary" data-study-report>Xem báo cáo phiên này</button><label class="logging-toggle">');
s=s.replace('<select id="again-answer"><option value="yes">','<select id="again-answer"><option value="">Chọn câu trả lời</option><option value="yes">');
s=s.replace('<select id="rating-answer">${[5,4,3,2,1]','<select id="rating-answer"><option value="">Chọn mức độ</option>${[5,4,3,2,1]');
s=s.replace("X.observation($('#recall-answer').value,$('#again-answer').value,Number($('#rating-answer').value));$('#observation-status').textContent='Đã lưu trên thiết bị này.';","const ok=X.observation($('#recall-answer').value,$('#again-answer').value,Number($('#rating-answer').value));$('#observation-status').textContent=ok?'Đã lưu nhận xét trên thiết bị này.':'Chọn đủ câu trả lời và kiểm tra tab có quyền lưu. Chưa xác nhận lưu nhận xét.';");
s=s.replace("render();save();X.start(state);if(view==='play')enterPlay();","render();if(view==='play')enterPlay();else save();if(KanjiSession.study){const badge=document.createElement('span');badge.className='study-badge';badge.textContent='PHIÊN CHƠI THỬ RIÊNG';$('.kp-header').append(badge);}");
const insert=s.indexOf(' function showPlaytest()');
s=s.slice(0,insert)+` function showStudySetup(){
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
`+s.slice(insert);
fs.writeFileSync(file,s);
file=path.join(dir,'index.html');s=fs.readFileSync(file,'utf8');s=s.replace('<script src="experience.js">','<script src="progress-lock.js"></script><script src="session-context.js"></script><script src="study-report.js"></script><script src="experience.js">');fs.writeFileSync(file,s);
