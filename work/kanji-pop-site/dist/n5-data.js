(function(host){
 'use strict';

 const n5Entries = [
  ["休", ["亻", "木"], "Nghỉ ngơi", "休む", "やすむ", "Nghỉ ngơi, nghỉ phép", "Nhìn bên trái là 亻, bên phải là bóng mát của 木. Người tựa cây nghỉ ngơi.", "HƯU", "キュウ", "やす・む", 6],
  ["男", ["田", "力"], "Nam giới", "男", "おとこ", "Người đàn ông", "Phần trên là 田 (ruộng), phần dưới là 力 (sức mạnh). Dùng sức cày cấy trên đồng.", "NAM", "ダン, ナン", "おとこ", 7],
  ["分", ["八", "刀"], "Chia; phút", "分ける", "わける", "Chia ra, phân chia", "Tìm 八 (tách ra) ở phía trên và 刀 (con dao) ở phía dưới để chia phần.", "PHÂN", "ブン, フン", "わ・ける", 4],
  ["名", ["夕", "口"], "Tên gọi", "名前", "なまえ", "Tên gọi", "Trời tối 夕 không thấy mặt nhau, phải dùng miệng 口 gọi to tên.", "DANH", "メイ, ミョウ", "な", 6],
  ["外", ["夕", "卜"], "Bên ngoài", "外", "そと", "Bên ngoài", "Hai phần đứng cạnh nhau: 夕 bên trái và 卜 bên phải. Bước chân ra bên ngoài.", "NGOẠI", "ガイ, ゲ", "そと", 5],
  ["何", ["亻", "可"], "Cái gì", "何", "なに", "Cái gì, điều gì", "Bên trái là người 亻, bên phải là 可. Người gánh vác vật gì trên vai.", "HÀ", "カ", "なに, なん", 7],
  ["見", ["目", "儿"], "Nhìn, thấy", "見る", "みる", "Nhìn ngắm, xem", "Phía trên là con mắt 目, phía dưới là đôi chân 儿. Con người mở mắt nhìn quanh.", "KIẾN", "ケン", "み・る", 7],
  ["国", ["口", "玉"], "Đất nước", "国", "くに", "Quốc gia, đất nước", "Khung viền 口 vững chắc che chở cho viên ngọc quý 玉 bên trong biên cương.", "QUỐC", "コク", "くに", 8],
  ["時", ["日", "寺"], "Thời gian, giờ", "時間", "じかん", "Thời gian", "Mặt trời 日 chiếu bóng qua mái chùa 寺 để đo đếm từng giờ trong ngày.", "THỜI", "ジ", "とき", 10],
  ["間", ["門", "日"], "Khoảng cách, giữa", "間", "あいだ", "Khoảng giữa", "Cánh cổng 門 hé mở để ánh nắng mặt trời 日 lọt qua khe giữa.", "GIAN", "カン, ケン", "あいだ, ま", 12],
  ["聞", ["門", "耳"], "Nghe", "聞く", "きく", "Nghe, hỏi thăm", "Ghé sát vành tai 耳 vào cánh cổng 門 để lắng nghe âm thanh từ xa.", "VĂN", "ブン, モン", "き・く", 14],
  ["話", ["言", "舌"], "Nói chuyện", "話す", "はなす", "Trò chuyện, tâm sự", "Dùng lời nói 言 kết hợp cùng chiếc lưỡi 舌 để trò chuyện tâm tình.", "THOẠI", "ワ", "はな・す", 13],
  ["語", ["言", "吾"], "Ngôn ngữ", "日本語", "にほんご", "Tiếng Nhật", "Lời nói 言 xuất phát từ chính bản thân mình 吾 tạo thành ngôn ngữ.", "NGỮ", "ゴ", "かた・る", 14],
  ["読", ["言", "売"], "Đọc sách", "読む", "よむ", "Đọc sách báo", "Dùng lời nói 言 đọc vang những trang sách quý được bán 売.", "ĐỘC", "ドク", "よ・む", 14],
  ["校", ["木", "交"], "Trường học", "学校", "がっこう", "Trường học", "Cây xanh bóng mát 木 quanh nơi bạn bè giao lưu 交 gặp gỡ là trường học.", "HIỆU", "コウ", "—", 10],
  ["友", ["𠂇", "又"], "Bạn bè", "友達", "ともだち", "Bạn bè thân thiết", "Hai bàn tay 𠂇 và 又 cùng nắm chặt, biểu tượng cho tình bạn bền lâu.", "HỮU", "ユウ", "とも", 4],
  ["二", ["一", "一"], "Số hai", "二つ", "ふたつ", "Hai cái", "Hai nét ngang xếp song song với nhau biểu thị con số 2.", "NHỊ", "ニ", "ふた・つ", 2],
  ["三", ["二", "一"], "Số ba", "三", "さん", "Số ba", "Ba nét ngang xếp tầng biểu thị con số 3 tròn đầy.", "TAM", "サン", "み・っつ", 3],
  ["天", ["一", "大"], "Bầu trời", "天気", "てんき", "Thời tiết", "Một nét ngang 一 trên đỉnh đầu người to lớn 大 chính là bầu trời bao la.", "THIÊN", "テン", "あめ, あま", 4],
  ["本", ["木", "一"], "Sách; gốc rễ", "本", "ほん", "Quyển sách", "Một nét ngang đánh dấu dưới gốc thân cây 木, nơi khởi nguồn của trang sách.", "BẢN", "ホン", "もと", 5],
  ["白", ["丿", "日"], "Màu trắng", "白い", "しろい", "Trắng, màu trắng", "Tia sáng nhỏ 丿 tỏa rạng từ vầng mặt trời 日 mang màu trắng thanh khiết.", "BẠCH", "ハク, ビャク", "しろ・i", 5],
  ["百", ["一", "白"], "Một trăm", "百", "ひゃく", "Số một trăm", "Nét ngang 一 đặt trên chữ Bạch 白 tượng trưng cho con số 100 viên mãn.", "BÁCH", "ヒャク", "—", 6],
  ["左", ["𠂇", "工"], "Bên trái", "左", "ひだり", "Bên trái", "Bàn tay 𠂇 cầm thước thợ 工 đặt ở bên tay trái hỗ trợ công việc.", "TẢ", "サ", "ひだり", 5],
  ["右", ["𠂇", "口"], "Bên phải", "右", "みぎ", "Bên phải", "Bàn tay 𠂇 đưa thức ăn vào miệng 口 là bên tay phải khéo léo.", "HỮU", "ウ, ユウ", "みぎ", 5]
 ];

 const n4Entries = [
  ["晴", ["日", "青"], "Trời nắng, tạnh ráo", "晴れ", "はれ", "Trời nắng đẹp", "Mặt trời 日 chiếu sáng bầu trời xanh trong 青 tạo nên ngày nắng đẹp.", "TÌNH", "セイ", "は・れる", 12],
  ["暗", ["日", "音"], "Tối, u ám", "暗い", "くらい", "Trời tối, u ám", "Mặt trời 日 lặn mất, chỉ còn nghe tiếng âm thanh 音 văng vẳng trong bóng tối.", "ÁM", "アン", "くら・い", 13],
  ["春", ["三", "日"], "Mùa xuân", "春", "はる", "Mùa xuân", "Ba 三 tháng cây cỏ đâm chồi dưới ánh nắng mặt trời 日 ấm áp của mùa xuân.", "XUÂN", "シュン", "はる", 9],
  ["秋", ["禾", "火"], "Mùa thu", "秋", "あき", "Mùa thu", "Cây lúa 禾 chín vàng rực rỡ như màu lửa 火 vào tiết trời mùa thu mát lành.", "THU", "シュウ", "あき", 9],
  ["野", ["里", "予"], "Cánh đồng, hoang dã", "野菜", "やさい", "Rau củ", "Khu đất rộng 里 đã được chuẩn bị 予 sẵn để gieo trồng trên cánh đồng quê.", "DÃ", "ヤ", "の", 11],
  ["林", ["木", "木"], "Rừng nhỏ, rặng cây", "林", "はやし", "Rừng thưa", "Hai cái cây 木 đứng cạnh nhau tạo thành rặng cây xanh râm mát.", "LÂM", "リン", "はやし", 8],
  ["森", ["木", "林"], "Rừng rậm", "森", "もり", "Rừng rậm rạp", "Nhiều cây xanh 木 họp lại rậm rạp tạo thành cánh rừng bạt ngàn.", "SÂM", "シン", "もり", 12],
  ["池", ["氵", "也"], "Cái ao, hồ nước", "池", "いけ", "Cái ao", "Làn nước trong 氵 đọng lại trong lòng đất 也 tạo thành chiếc ao thanh bình.", "TRÌ", "チ", "いけ", 6],
  ["体", ["亻", "本"], "Cơ thể, thân thể", "体", "からだ", "Cơ thể", "Thân thể con người 亻 chính là cái gốc rễ 本 quý giá nhất của cuộc đời.", "THỂ", "タイ", "からだ", 7],
  ["親", ["立", "見"], "Cha mẹ; thân thiết", "親", "おや", "Cha mẹ", "Cha mẹ đứng 立 từ xa dõi mắt trông ngóng 見 và thương yêu con cái.", "THÂN", "シン", "おや, した・しい", 16],
  ["作", ["亻", "乍"], "Chế tạo, làm ra", "作る", "つくる", "Làm, chế tạo", "Bàn tay con người 亻 thoăn thoắt làm ra 乍 những món đồ thủ công tinh xảo.", "TÁC", "サク", "つく・る", 7],
  ["借", ["亻", "昔"], "Vay mượn", "借りる", "かりる", "Vay, mượn", "Người bạn cũ ngày xưa 昔 đến thăm và mượn 亻 quyển sách hay.", "TÁ", "シャク", "か・りる", 10],
  ["飯", ["飠", "反"], "Cơm, bữa ăn", "ご飯", "ごはん", "Bữa cơm", "Món ăn 飠 được lật qua xới lại 反 trên bếp lửa chính là chén cơm nóng hổi.", "PHẠN", "ハン", "めし", 12],
  ["飲", ["飠", "欠"], "Uống nước", "飲む", "のむ", "Uống nước", "Mở rộng khuôn miệng 欠 để thưởng thức thức uống 飠 ngon lành giải khát.", "ẨM", "イン", "の・む", 12],
  ["病", ["疒", "丙"], "Bệnh tật, ốm", "病気", "びょうき", "Bị ốm, bệnh tật", "Căn bệnh 疒 ập đến khiến người mệt mỏi nằm nghỉ trên giường bệnh 丙.", "BỆNH", "ビョウ", "や・む", 10],
  ["院", ["阝", "完"], "Viện, tòa nhà lớn", "病院", "びょういん", "Bệnh viện", "Khu nhà khang trang 阝 hoàn chỉnh 完 nơi chữa trị bệnh tình chu đáo.", "VIỆN", "イン", "—", 10],
  ["電", ["雨", "田"], "Điện, tia chớp", "電車", "でんしゃ", "Tàu điện", "Cơn mưa rào 雨 làm lóe lên những tia sét phát điện sáng rực cánh đồng 田.", "ĐIỆN", "デン", "—", 13],
  ["銀", ["金", "艮"], "Bạc; ngân hàng", "銀行", "ぎんこう", "Ngân hàng", "Kim loại quý 金 sáng lấp lánh xếp sau vàng chính là bạc 艮.", "NGÂN", "ギン", "しろがね", 14],
  ["鉄", ["金", "失"], "Sắt thép", "地下鉄", "ちかてつ", "Tàu điện ngầm", "Thanh kim loại 金 bền chắc không thể mất đi 失 tạo nên những đường ray xe lửa.", "THIẾT", "テツ", "くろがね", 13],
  ["紙", ["糸", "氏"], "Tờ giấy", "手紙", "てがみ", "Bức thư", "Những sợi tơ trắng 糸 kết tinh thành những trang giấy 氏 mịn để viết thư tay.", "CHỈ", "シ", "かみ", 10],
  ["答", ["竹", "合"], "Câu trả lời, đáp án", "答え", "こたえ", "Câu trả lời", "Khắc những lời giải đáp phù hợp 合 lên thanh thẻ tre 竹 của tiền nhân.", "ĐÁP", "トウ", "こた・える", 12],
  ["思", ["田", "心"], "Suy nghĩ, cảm nghĩ", "思う", "おもう", "Suy nghĩ, cho rằng", "Trí tuệ của khối óc 田 hòa cùng cảm xúc chân thành nơi trái tim 心.", "TƯ", "シ", "おmo・う", 9],
  ["知", ["矢", "口"], "Biết, tri thức", "知る", "しる", "Biết, nhận biết", "Lời nói từ miệng 口 chuẩn xác, nhanh như mũi tên 矢 bay chính là tri thức.", "TRI", "チ", "し・る", 8],
  ["考", ["耂", "丂"], "Suy xét, khảo cứu", "考える", "かんがえる", "Suy nghĩ, cân nhắc", "Người cao niên 耂 chống gậy trầm ngâm suy xét 丂 kỹ càng mọi việc.", "KHẢO", "コウ", "かんが・える", 6]
 ];

 function buildCurriculum(grade, entries, chapters, title){
  const recipes = Object.fromEntries(entries.map(([id, parts, meaning, word, reading, translation, note, hanViet, onyomi, kunyomi, strokes], i) => [
   id,
   {
    id,
    kanji: id,
    parts,
    meaning,
    word,
    reading,
    translation,
    note,
    hanViet: hanViet || '',
    onyomi: onyomi || '—',
    kunyomi: kunyomi || '—',
    strokes: strokes || 0,
    grade,
    chapter: Math.floor(i / 8)
   }
  ]));
  const ids = entries.map(e => e[0]), levels = [];
  function add(chapter, levelTitle, targets, newChars, limit){
   levels.push({
    id: levels.length,
    chapter,
    title: levelTitle,
    targets,
    newChars,
    pool: ids.slice(0, limit),
    rows: limit < 7 ? 3 : 5,
    review: newChars.length === 0
   });
  }
  add(0, chapters[0].levelTitles ? chapters[0].levelTitles[0] : 'Chạm là khám phá', ids.slice(0, 4), ids.slice(0, 4), 4);
  add(0, chapters[0].levelTitles ? chapters[0].levelTitles[1] : 'Ra ngoài một chút', ids.slice(4, 6), ids.slice(4, 6), 6);
  add(0, chapters[0].levelTitles ? chapters[0].levelTitles[2] : 'Nhìn quanh mình', ids.slice(6, 8), ids.slice(6, 8), 8);
  add(0, 'Gặp lại bạn cũ', ids.slice(0, 4), [], 8);
  add(0, 'Kho báu chương 1', ids.slice(0, 8), [], 8);
  for(let c = 1; c < 3; c++){
   const titles = chapters[c].levelTitles || ['Bài 1', 'Bài 2', 'Bài 3', 'Bài 4'];
   for(let n = 0; n < 4; n++){
    const start = c * 8 + n * 2;
    add(c, titles[n], ids.slice(start, start + 2), ids.slice(start, start + 2), start + 2);
   }
   add(c, 'Kho báu chương ' + (c + 1), ids.slice(c * 8, c * 8 + 8), [], c * 8 + 8);
  }
  return {
   id: grade.toLowerCase() + '-compose-24-v1',
   grade,
   title: title || `${grade} · Hành trình ghép chữ`,
   recipes,
   ids,
   chapters,
   levels,
   marks: ['●', '◆', '★', '♥', '✦', '■', '✿', '▲', '☾', '✚', '✕', '⬟', '◎', '≋', '◈', '⬢', '✪', '⬣', '✧', '✥', '✺', '✹', '✷', '❖'],
   sources: [
    { title: `Danh sách ${grade} tham khảo · JLPT Sensei`, url: `https://jlptsensei.com/jlpt-${grade.toLowerCase()}-kanji-list/` },
    { title: 'Phạm vi JLPT · FAQ chính thức', url: 'https://www.jlpt.jp/e/faq/' },
    { title: 'Đối chiếu cấu tạo · CJKVI IDS', url: 'https://github.com/cjkvi/cjkvi-ids' }
   ]
  };
 }

 const n5Chapters = [
  { name: 'Những điều gần gũi', subtitle: 'Con người & cuộc sống', icon: 'sprout', levelTitles: ['Chạm là khám phá', 'Ra ngoài một chút', 'Nhìn quanh mình', 'Gặp lại bạn cũ'] },
  { name: 'Một ngày khám phá', subtitle: 'Thời gian & trường học', icon: 'sun', levelTitles: ['Một khoảng thời gian', 'Lắng nghe & trò chuyện', 'Ngôn ngữ & trang sách', 'Trường học & bạn bè'] },
  { name: 'Nhìn ra thế giới', subtitle: 'Số đếm & hình dạng', icon: 'compass', levelTitles: ['Hai rồi đến ba', 'Bầu trời & quyển sách', 'Trắng & một trăm', 'Trái hay phải?'] }
 ];

 const n4Chapters = [
  { name: 'Giao hòa đất trời', subtitle: 'Thiên nhiên & Bốn mùa', icon: 'sun', levelTitles: ['Nắng ấm & chiều tối', 'Mùa xuân & mùa thu', 'Cánh đồng & rặng cây', 'Rừng rậm & mặt ao'] },
  { name: 'Nhịp sống quanh ta', subtitle: 'Con người & Sinh hoạt', icon: 'sprout', levelTitles: ['Thân thể & song thân', 'Khéo tay làm & mượn đồ', 'Bữa cơm & chén nước', 'Ốm đau & bệnh viện'] },
  { name: 'Trí tuệ & Văn minh', subtitle: 'Kỹ thuật & Tư duy', icon: 'compass', levelTitles: ['Tàu điện & ngân hàng', 'Đường ray sắt & lá thư', 'Câu trả lời & nghĩ suy', 'Hiểu biết & suy xét'] }
 ];

 const curriculumN5 = buildCurriculum('N5', n5Entries, n5Chapters, 'N5 · Hành trình ghép chữ');
 const curriculumN4 = buildCurriculum('N4', n4Entries, n4Chapters, 'N4 · Khám phá nâng cao');

 const courses = { N5: curriculumN5, N4: curriculumN4 };

 host.KanjiCourses = courses;
 host.KanjiCourse = curriculumN5; // Default for backwards compatibility
 if(typeof module !== 'undefined') module.exports = curriculumN5;
})(globalThis);
