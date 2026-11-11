(function(host){
 'use strict';

 const translations = {
  vi: {
   journeyEyebrow: 'HÀNH TRÌNH',
   chapter: 'CHƯƠNG',
   play: 'Chơi',
   resume: 'Tiếp tục',
   replay: 'Chơi lại',
   locked: 'Chưa mở khóa',
   unlocked: 'Khám phá',
   treasure: 'KHO BÁU',
   levelsDone: 'màn',
   stars: 'sao',
   starsEarned: 'sao',
   shelfTitle: 'MỤC TIÊU CHƯƠNG',
   shelfOpened: 'ĐÃ MỞ',
   shelfTip: '🌿 Chạm thẻ đã mở để xem phát âm, bộ thủ và từ vựng.',
   previewTip: 'sẽ xuất hiện tại Màn',
   playToUnlock: 'Hãy chơi màn để mở khóa!',
   menuTitle: 'Menu hành trình',
   navJourney: 'Lộ trình',
   navPlay: 'Chơi',
   navAlbum: 'Album',
   moves: 'Lượt',
   pairs: 'cặp ghép',
   freeSpace: 'ô trống',
   emptyCell: 'TRỐNG',
   hint: 'Gợi ý',
   menu: 'Menu',
   tapToSlide: 'Chạm một khối sát ô trống để trượt vào.',
   matchFound: 'GHÉP THÀNH CÔNG!',
   newCardDiscovered: 'THÊM MỘT KHÁM PHÁ!',
   newInAlbum: 'THẺ MỚI TRONG ALBUM',
   metFamiliar: 'GẶP LẠI MỘT CHỮ QUEN',
   continuePlay: 'Tiếp tục chơi',
   levelComplete: 'Hoàn thành màn',
   levelWon: 'HOÀN THÀNH MÀN!',
   allWon: 'TRỌN BỘ BẢN THỬ!',
   nextLevel: 'Màn tiếp theo',
   viewAlbum: 'Mở album',
   toJourney: 'Về lộ trình',
   backToMap: 'Về hành trình',
   close: 'Đóng',
   pronounce: 'Phát âm',
   strokes: 'NÉT',
   onReading: 'Âm On',
   kunReading: 'Âm Kun',
   exampleReading: 'Từ ví dụ · Cách đọc',
   formulaLabel: 'Công thức ghép',
   dailyBadge: 'HÔM NAY',
   dailyTitle: 'Thử thách hôm nay',
   dailySecret: 'Chữ bí mật',
   dailyGoal: 'Tìm và ghép đúng chữ bí mật của ngày hôm nay!',
   dailySolved: 'XUẤT SẮC! ĐÃ GIẢI ĐƯỢC CHỮ HÔM NAY!',
   dailyMoves: 'Lượt giải',
   dailyShareBtn: 'Chia sẻ kết quả 📋',
   dailyCopied: 'Đã sao chép kết quả để chia sẻ!',
   dailyShareTitle: 'Kanji Pop! Daily Puzzle',
   langBtn: 'EN'
  },
  en: {
   journeyEyebrow: 'JOURNEY',
   chapter: 'CHAPTER',
   play: 'Play',
   resume: 'Resume',
   replay: 'Replay',
   locked: 'Locked',
   unlocked: 'Discover',
   treasure: 'TREASURE',
   levelsDone: 'levels',
   stars: 'stars',
   starsEarned: 'stars',
   shelfTitle: 'CHAPTER TARGETS',
   shelfOpened: 'UNLOCKED',
   shelfTip: '🌿 Tap an unlocked card to hear audio, stroke count & radicals.',
   previewTip: 'will appear in Level',
   playToUnlock: 'Play levels to unlock!',
   menuTitle: 'Journey Menu',
   navJourney: 'Journey',
   navPlay: 'Play',
   navAlbum: 'Album',
   moves: 'Moves',
   pairs: 'pairs merged',
   freeSpace: 'empty slot',
   emptyCell: 'EMPTY',
   hint: 'Hint',
   menu: 'Menu',
   tapToSlide: 'Tap a gem next to an empty space to slide.',
   matchFound: 'FUSION SUCCESS!',
   newCardDiscovered: 'NEW DISCOVERY!',
   newInAlbum: 'NEW CARD IN ALBUM',
   metFamiliar: 'PRACTICED FAMILIAR KANJI',
   continuePlay: 'Continue Playing',
   levelComplete: 'Level Complete',
   levelWon: 'LEVEL CLEARED!',
   allWon: 'ALL LEVELS COMPLETED!',
   nextLevel: 'Next Level',
   viewAlbum: 'View Album',
   toJourney: 'To Journey',
   backToMap: 'Back to Map',
   close: 'Close',
   pronounce: 'Pronounce',
   strokes: 'STROKES',
   onReading: "On'yomi",
   kunReading: "Kun'yomi",
   exampleReading: 'Example Word · Reading',
   formulaLabel: 'Component Formula',
   dailyBadge: 'DAILY',
   dailyTitle: 'Daily Puzzle',
   dailySecret: 'Secret Kanji',
   dailyGoal: "Find and fuse today's secret Kanji gem!",
   dailySolved: 'CONGRATULATIONS! DAILY PUZZLE SOLVED!',
   dailyMoves: 'Moves taken',
   dailyShareBtn: 'Share Result 📋',
   dailyCopied: 'Result copied to clipboard!',
   dailyShareTitle: 'Kanji Pop! Daily Puzzle',
   langBtn: 'VI'
  }
 };

 const enData = {
  // N5 (24 items)
  "休": { meaning: "Rest, Break", translation: "To rest, take a break", note: "A person (亻) resting under the shade of a tree (木)." },
  "男": { meaning: "Man, Male", translation: "Man, male", note: "Power (力) working in the rice field (田) represents a man." },
  "分": { meaning: "Divide, Minute, Part", translation: "To divide, separate", note: "A knife (刀) splitting something into separate parts (八)." },
  "名": { meaning: "Name, Fame", translation: "Name, full name", note: "In the evening dusk (夕), you use your mouth (口) to call a name." },
  "外": { meaning: "Outside, Foreign", translation: "Outside, outdoors", note: "Evening (夕) divination (卜) practiced out in the open." },
  "何": { meaning: "What", translation: "What, which", note: "A person (亻) carrying something (可): 'What is that?'" },
  "見": { meaning: "See, Look", translation: "To see, look, watch", note: "An eye (目) moving on legs (儿): looking around." },
  "国": { meaning: "Country, Nation", translation: "Country, nation", note: "A precious jade gem (玉) safely guarded inside borders (口)." },
  "時": { meaning: "Time, Hour", translation: "Time, hour", note: "The sun (日) shining over the temple (寺) to track the hours." },
  "間": { meaning: "Interval, Between", translation: "Between, interval, space", note: "Sunlight (日) shining through the gap in the gate (門)." },
  "聞": { meaning: "Hear, Listen", translation: "To hear, listen, ask", note: "Pressing an ear (耳) against the gate (門) to listen." },
  "話": { meaning: "Talk, Speak, Story", translation: "To speak, talk, converse", note: "Words (言) shaped by the tongue (舌) create conversation." },
  "語": { meaning: "Language, Word", translation: "Japanese language", note: "Words (言) spoken by oneself (吾) form a language." },
  "読": { meaning: "Read", translation: "To read books", note: "Speaking words (言) to read aloud books on sale (売)." },
  "校": { meaning: "School", translation: "School", note: "Trees (木) shading the place where people interact (交): a school." },
  "友": { meaning: "Friend", translation: "Close friend", note: "Two hands (𠂇 & 又) reaching out and holding each other." },
  "二": { meaning: "Two", translation: "Two items", note: "Two parallel horizontal lines representing number 2." },
  "三": { meaning: "Three", translation: "Number three", note: "Three horizontal strokes representing number 3." },
  "天": { meaning: "Sky, Heaven", translation: "Weather", note: "A line (一) above a great person (大) is the infinite sky." },
  "本": { meaning: "Book, Origin, Root", translation: "Book", note: "A mark (一) at the base of a tree (木): the root origin." },
  "白": { meaning: "White", translation: "White color", note: "A ray of sunlight (丿 + 日) shining pure white." },
  "百": { meaning: "Hundred", translation: "One hundred", note: "A stroke (一) above white (白) representing 100." },
  "左": { meaning: "Left", translation: "Left side", note: "The hand (𠂇) holding a craft tool (工): the left hand." },
  "右": { meaning: "Right", translation: "Right side", note: "The hand (𠂇) bringing food to the mouth (口): the right hand." },

  // N4 (24 items)
  "晴": { meaning: "Clear, Sunny", translation: "Clear weather, sunny", note: "The sun (日) shining in a clear blue sky (青)." },
  "暗": { meaning: "Dark, Gloomy", translation: "Dark, gloomy", note: "When the sun (日) sets, only sounds (音) echo in the dark." },
  "春": { meaning: "Spring", translation: "Spring season", note: "Three (三) months of warm sunshine (日) bring spring blossoms." },
  "秋": { meaning: "Autumn, Fall", translation: "Autumn, fall", note: "Golden grain (禾) glowing like fire (火) in cool autumn." },
  "野": { meaning: "Field, Wild", translation: "Vegetables", note: "A village field (里) prepared in advance (予) for planting." },
  "林": { meaning: "Grove, Woods", translation: "Small woods, grove", note: "Two trees (木 + 木) standing side by side make a grove." },
  "森": { meaning: "Forest", translation: "Dense forest", note: "Three trees (木 + 林) clustered together create a forest." },
  "池": { meaning: "Pond", translation: "Pond, reservoir", note: "Water (氵) collected inside the earth (也) forms a pond." },
  "体": { meaning: "Body", translation: "Human body", note: "A person's (亻) body is their fundamental origin (本)." },
  "親": { meaning: "Parents, Intimacy", translation: "Parents", note: "Parents standing (立) watching over (見) their beloved child." },
  "作": { meaning: "Make, Create", translation: "To make, produce", note: "A person's hands (亻) crafting suddenly (乍) beautiful items." },
  "借": { meaning: "Borrow", translation: "To borrow, rent", note: "A person (亻) borrowing a treasure from the old past (昔)." },
  "飯": { meaning: "Meal, Cooked Rice", translation: "Meal, cooked rice", note: "Food (飠) turned over (反) the flame: hot steamed rice." },
  "飲": { meaning: "Drink", translation: "To drink", note: "Opening the mouth (欠) to swallow fresh food/drink (飠)." },
  "病": { meaning: "Illness, Sickness", translation: "Illness, sickness", note: "A sickness (疒) confining a person to their third bed (丙)." },
  "院": { meaning: "Institution, Hospital", translation: "Hospital", note: "A sheltered courtyard (阝) completed (完) for medical care." },
  "電": { meaning: "Electricity, Lightning", translation: "Electric train", note: "Rain clouds (雨) striking lightning across the field (田)." },
  "銀": { meaning: "Silver, Bank", translation: "Bank", note: "Precious metal (金) shining right behind gold: silver (艮)." },
  "鉄": { meaning: "Iron, Steel", translation: "Subway, metro", note: "Enduring metal (金) that is never lost (失): solid iron." },
  "紙": { meaning: "Paper", translation: "Letter, mail", note: "Fine silk fibers (糸) refined into smooth sheets (氏)." },
  "答": { meaning: "Answer, Reply", translation: "Answer, solution", note: "Fitting words (合) carved into bamboo slips (竹): an answer." },
  "思": { meaning: "Think, Feel", translation: "To think, consider", note: "Brain's intellect (田) blending with heart's feeling (心)." },
  "知": { meaning: "Know, Wisdom", translation: "To know, understand", note: "Words from the mouth (口) as swift and true as an arrow (矢)." },
  "考": { meaning: "Consider, Ponder", translation: "To ponder, reflect", note: "An elder (耂) leaning on a cane, deeply contemplating (丂)." }
 };

 let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('kp-lang')) || 'vi';

 function getLang(){ return currentLang; }
 function setLang(lang){
  if(lang !== 'vi' && lang !== 'en') return;
  currentLang = lang;
  if(typeof localStorage !== 'undefined') localStorage.setItem('kp-lang', lang);
  if(typeof document !== 'undefined') document.documentElement.lang = lang;
 }
 function toggleLang(){
  setLang(currentLang === 'vi' ? 'en' : 'vi');
  return currentLang;
 }
 function t(key){
  return (translations[currentLang] && translations[currentLang][key]) || translations.vi[key] || key;
 }
 function getRecipeMeaning(r){
  if(currentLang === 'en' && enData[r.id]?.meaning) return enData[r.id].meaning;
  return r.meaning;
 }
 function getRecipeTranslation(r){
  if(currentLang === 'en' && enData[r.id]?.translation) return enData[r.id].translation;
  return r.translation;
 }
 function getRecipeNote(r){
  if(currentLang === 'en' && enData[r.id]?.note) return enData[r.id].note;
  return r.note;
 }

 host.KanjiI18n = {
  getLang,
  setLang,
  toggleLang,
  t,
  getRecipeMeaning,
  getRecipeTranslation,
  getRecipeNote,
  enData
 };
})(typeof window !== 'undefined' ? window : globalThis);
