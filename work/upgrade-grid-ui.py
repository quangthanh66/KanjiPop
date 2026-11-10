from pathlib import Path
root=Path('work/kanji-pop-site/dist')
p=root/'n5-game.js'
s=p.read_text(encoding='utf-8')
s=s.replace(" let state=E.fresh(0,1234)"," const deviceMode=()=>matchMedia('(min-width:900px)').matches?'desktop':'mobile';\n let state=E.fresh(0,1234,deviceMode())")
s=s.replace("   if(E.valid(saved.state)","   saved.state=E.upgrade(saved.state);\n   if(E.valid(saved.state)")
s=s.replace("saved.history:[]).filter", "saved.history:[]).map(E.upgrade).filter")
s=s.replace("1234+Math.min(unlocked(),C.levels.length-1));", "1234+Math.min(unlocked(),C.levels.length-1),deviceMode());")
s=s.replace("E.fresh(id,1234+id)","E.fresh(id,1234+id,deviceMode())")
s=s.replace("($('#tiles').clientWidth-12)/3", "($('#tiles').clientWidth-(state.cols-1)*6)/state.cols")
s=s.replace("at%3", "at%state.cols").replace("Math.floor(at/3)", "Math.floor(at/state.cols)")
s=s.replace("E.neighbors(at,state.rows)","E.neighbors(at,state.rows,state.cols)")
s=s.replace("b.lang='ja';b.setAttribute", "b.lang='ja';b.setAttribute('aria-pressed',String(selected===at));b.setAttribute")
a=s.index(" function draw(board=state.board)")
b=s.index(" function controls()",a)
s=s[:a]+''' function highlightDestinations(){
  for(const cell of $('.board-cells').children){const at=Number(cell.dataset.empty),can=selected!==null&&state.board[selected]&&E.neighbors(selected,state.rows,state.cols).includes(at);cell.classList.toggle('destination',Boolean(can));cell.classList.remove('hint-target');}
 }
 function draw(board=state.board){
  if(view!=='play')return;
  $('#tiles').innerHTML='';$('#effects').innerHTML='';const cells=$('.board-cells');cells.innerHTML='';
  board.forEach((p,i)=>{const cell=document.createElement(p?'span':'button');cell.className='board-cell'+(p?'':' empty');if(p){cell.setAttribute('aria-hidden','true');$('#tiles').append(tile(p,i,board));}else{cell.type='button';cell.dataset.empty=i;cell.textContent='TRỐNG';cell.setAttribute('aria-label','Ô trống, hàng '+(Math.floor(i/state.cols)+1)+', cột '+(i%state.cols+1)+'. Chọn khối bên cạnh rồi chạm để trượt.');}cells.append(cell);});
  highlightDestinations();
 }
''' + s[b:]
s=s.replace("$('#slide-board').style.setProperty('--rows',state.rows);$('#slide-board').classList.toggle('tall',state.rows===5);", "$('#slide-board').style.setProperty('--rows',state.rows);$('#slide-board').style.setProperty('--cols',state.cols);$('#slide-board').dataset.cols=state.cols;$('#slide-board').classList.toggle('tall',state.rows>=5);$('.kp-board-tab').textContent='GHÉP CHỮ · '+state.cols+' × '+state.rows;")
s=s.replace("for(const t of $('#tiles').children)t.classList.toggle('selected',Number(t.dataset.at)===at);", "for(const t of $('#tiles').children){t.classList.toggle('selected',Number(t.dataset.at)===at);t.setAttribute('aria-pressed',String(Number(t.dataset.at)===at));t.classList.remove('hinted');}highlightDestinations();")
s=s.replace("else say('Khối này chưa sát ô trống. Chạm khối có viền sáng nhé.');", "else if(E.legalDirections(state,at).length>1)say('Có hai hướng trượt: chạm ô trống muốn đến, hoặc vuốt khối.');else say('Khối này chưa sát ô trống. Chạm khối có viền sáng nhé.');")
s=s.replace("bàn dồn nhẹ, bù một cặp ở hai vị trí cách nhau và còn đúng một ô trống.","bàn dồn nhẹ, bù một cặp ở hai vị trí cách nhau và còn ${state.blanks} ô trống.")
s=s.replace("Bạn cũng có thể vuốt hoặc dùng phím mũi tên sau khi chọn khối.", "Nếu cạnh hai ô trống, chọn khối rồi chạm ô đích. Bạn cũng có thể vuốt hoặc dùng phím mũi tên.")
s=s.replace("<p>Không đếm giờ.","<p><strong>Bàn lớn dần:</strong> từ 3×3 lên 4×5 trên mobile (màn 6), hoặc 5×6 trên PC (màn 8). Màn đang chơi giữ nguyên khi đổi màn hình; chơi lại hoặc sang màn mới để đổi kích thước.</p><p>Không đếm giờ.")
s=s.replace("say('Chạm khối được viền vàng để trượt '","$(`.board-cells [data-empty=\"${E.destination(h.at,h.dir,state.rows,state.cols)}\"]`)?.classList.add('hint-target');say('Trượt khối viền vàng vào ô trống viền vàng, '")
s=s.replace(" const board=$('#slide-board');", """ const board=$('#slide-board');
 $('.board-cells').addEventListener('click',e=>{const cell=e.target.closest('button[data-empty]');if(!cell||busy||view!=='play'||!$('#modal').hidden)return;const to=Number(cell.dataset.empty),dir=E.directions.find(d=>E.destination(selected,d,state.rows,state.cols)===to);if(selected===null||!dir){say('Chọn một khối ngay cạnh ô trống này trước nhé.');return;}move(dir);});""")
s=s.replace("24 chữ ghép tuyển chọn · Chưa phải toàn bộ Kanji N5.</p>","Bàn lớn dần · Mobile tối đa 4×5 từ màn 6 · PC tối đa 5×6 từ màn 8.<br>24 chữ ghép tuyển chọn · Chưa phải toàn bộ Kanji N5.</p>")
p.write_text(s,encoding='utf-8')
p=root/'index.html';s=p.read_text(encoding='utf-8').replace('<div class="board-cells" aria-hidden="true">','<div class="board-cells">');p.write_text(s,encoding='utf-8')
p=root/'n5-data.js';s=p.read_text(encoding='utf-8').replace("marks:['●','◆','★','♥','✦','■','✿']", "marks:['●','◆','★','♥','✦','■','✿','▲','☾','✚','✕','⬟','◎','≋']");p.write_text(s,encoding='utf-8')
