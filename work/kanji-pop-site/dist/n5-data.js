(function(host){
 'use strict';
 // Curated subset of the cited N5 study list. Visual decomposition, not etymology.
 const entries=[
  [
    "休",
    [
      "亻",
      "木"
    ],
    "Nghỉ ngơi",
    "休む",
    "やすむ",
    "Nghỉ ngơi",
    "Nhìn bên trái là 亻, bên phải là 木. 亻 là dạng của 人 khi đứng ở bên trái."
  ],
  [
    "男",
    [
      "田",
      "力"
    ],
    "Nam giới",
    "男",
    "おとこ",
    "Người đàn ông",
    "Nhìn phần trên là 田; phần dưới là 力."
  ],
  [
    "分",
    [
      "八",
      "刀"
    ],
    "Chia",
    "分ける",
    "わける",
    "Chia, chia ra",
    "Tìm 八 ở phía trên và 刀 ở phía dưới."
  ],
  [
    "名",
    [
      "夕",
      "口"
    ],
    "Tên",
    "名前",
    "なまえ",
    "Tên gọi",
    "夕 nằm phía trên; 口 nằm phía dưới."
  ],
  [
    "外",
    [
      "夕",
      "卜"
    ],
    "Bên ngoài",
    "外",
    "そと",
    "Bên ngoài",
    "Hai phần đứng cạnh nhau: 夕 bên trái và 卜 bên phải."
  ],
  [
    "何",
    [
      "亻",
      "可"
    ],
    "Cái gì",
    "何",
    "なに",
    "Cái gì?",
    "亻 đứng bên trái 可. 亻 là dạng của 人 khi đứng ở bên trái."
  ],
  [
    "見",
    [
      "目",
      "儿"
    ],
    "Nhìn",
    "見る",
    "みる",
    "Nhìn, xem",
    "Phần trên giống 目; phần dưới là 儿."
  ],
  [
    "国",
    [
      "囗",
      "玉"
    ],
    "Đất nước",
    "国",
    "くに",
    "Đất nước",
    "玉 nằm trong khung 囗. Khung 囗 là thành phần bao ngoài, khác chữ 口."
  ],
  [
    "時",
    [
      "日",
      "寺"
    ],
    "Thời gian",
    "時",
    "とき",
    "Lúc, thời điểm",
    "日 đứng bên trái; 寺 đứng bên phải."
  ],
  [
    "間",
    [
      "門",
      "日"
    ],
    "Khoảng",
    "間",
    "あいだ",
    "Khoảng, khoảng giữa",
    "日 nằm dưới phần mái và giữa hai bên của 門; phía dưới vẫn mở."
  ],
  [
    "聞",
    [
      "門",
      "耳"
    ],
    "Nghe",
    "聞く",
    "きく",
    "Nghe, hỏi",
    "耳 nằm dưới phần mái và giữa hai bên của 門; phía dưới vẫn mở."
  ],
  [
    "話",
    [
      "言",
      "舌"
    ],
    "Nói chuyện",
    "話す",
    "はなす",
    "Nói, nói chuyện",
    "Nhìn 言 ở nửa trái, 舌 ở nửa phải."
  ],
  [
    "語",
    [
      "言",
      "吾"
    ],
    "Ngôn ngữ",
    "日本語",
    "にほんご",
    "Tiếng Nhật",
    "Nhìn 言 ở nửa trái, 吾 ở nửa phải."
  ],
  [
    "読",
    [
      "言",
      "売"
    ],
    "Đọc",
    "読む",
    "よむ",
    "Đọc",
    "Trong chữ 読 hiện nay, 言 đứng bên trái 売."
  ],
  [
    "校",
    [
      "木",
      "交"
    ],
    "Trường học",
    "学校",
    "がっこう",
    "Trường học",
    "木 đứng bên trái 交; hai phần được thu gọn khi ghép."
  ],
  [
    "友",
    [
      "𠂇",
      "又"
    ],
    "Bạn bè",
    "友達",
    "ともだち",
    "Bạn bè",
    "Phần 𠂇 ôm phía trên và bên trái của 又."
  ],
  [
    "二",
    [
      "一",
      "一"
    ],
    "Hai",
    "二",
    "に",
    "Số hai",
    "Hai nét ngang xếp thành hai tầng; nét dưới dài hơn nét trên."
  ],
  [
    "三",
    [
      "一",
      "二"
    ],
    "Ba",
    "三",
    "さん",
    "Số ba",
    "Thêm một nét ngang phía trên 二 để có ba tầng ngang."
  ],
  [
    "天",
    [
      "一",
      "大"
    ],
    "Bầu trời",
    "天",
    "てん",
    "Trời, bầu trời",
    "Nhìn một nét ngang ở phía trên hình 大."
  ],
  [
    "本",
    [
      "木",
      "一"
    ],
    "Sách; gốc",
    "本",
    "ほん",
    "Quyển sách",
    "Mẹo nhìn hình: thêm nét ngang ngắn vào phần gốc của 木. Nét này cắt qua thân cây."
  ],
  [
    "白",
    [
      "丿",
      "日"
    ],
    "Trắng",
    "白い",
    "しろい",
    "Trắng; có màu trắng",
    "Mẹo nhìn hình: tìm nét phẩy ngắn ở phía trên hình 日. Đây không phải giải thích nguồn gốc chữ."
  ],
  [
    "百",
    [
      "一",
      "白"
    ],
    "Một trăm",
    "百",
    "ひゃく",
    "Số một trăm",
    "Nhìn một nét ngang ở phía trên 白."
  ],
  [
    "左",
    [
      "𠂇",
      "工"
    ],
    "Bên trái",
    "左",
    "ひだり",
    "Bên trái",
    "Phần 𠂇 ôm phía trên và bên trái của 工."
  ],
  [
    "右",
    [
      "𠂇",
      "口"
    ],
    "Bên phải",
    "右",
    "みぎ",
    "Bên phải",
    "Phần 𠂇 ôm phía trên và bên trái của 口."
  ]
];
 const recipes=Object.fromEntries(entries.map(([id,parts,meaning,word,reading,translation,note],i)=>[id,{id,kanji:id,parts,meaning,word,reading,translation,note,chapter:Math.floor(i/8)}]));
 const editorial={"休":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0001375100"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"男":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0004638500"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"分":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0006175200"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"名":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0006666900","https://a2-2.marugotoweb.jp/en/kanji/vocab/namae/"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"外":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0000841200"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"何":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0000641500"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"見":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0001896200"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"国":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002372600"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"時":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002876900"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"間":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0001083500"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"聞":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0006190200"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"話":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0007407700"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"語":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002110200","https://words.marugotoweb.jp/static_contents/pc/about/about.php?lang=en"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"読":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0005324000"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"校":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002236900"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"友":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0006843100"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"二":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0005418000"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"三":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002622000"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"天":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0005033300"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"本":{"compositionType":"visual-mnemonic","evidence":["https://www.kanjipedia.jp/kanji/0006505700"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"白":{"compositionType":"visual-mnemonic","evidence":["https://www.kanjipedia.jp/kanji/0005607600"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"百":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0005920000"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"左":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0002452500"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"},"右":{"compositionType":"modern-shape","evidence":["https://www.kanjipedia.jp/kanji/0000308000"],"wordReadingScope":"whole-example-word","authorship":"project-authored-vietnamese-note","sourceReview":"AI-source-checked","humanReview":"pending"}};
 for(const [id,meta] of Object.entries(editorial))Object.assign(recipes[id],meta);
 const chapters=[{name:'Những điều gần gũi',subtitle:'Con người & cuộc sống',icon:'sprout'},{name:'Một ngày khám phá',subtitle:'Thời gian & trường học',icon:'sun'},{name:'Nhìn ra thế giới',subtitle:'Số đếm & hình dạng',icon:'compass'}];
 const ids=entries.map(e=>e[0]),levels=[];
 function add(chapter,title,targets,newChars,limit){levels.push({id:levels.length,chapter,title,targets,newChars,pool:ids.slice(0,limit),rows:limit<7?3:5,review:newChars.length===0});}
 add(0,'Chạm là khám phá',ids.slice(0,4),ids.slice(0,4),4);
 add(0,'Ra ngoài một chút',ids.slice(4,6),ids.slice(4,6),6);
 add(0,'Nhìn quanh mình',ids.slice(6,8),ids.slice(6,8),8);
 add(0,'Gặp lại bạn cũ',ids.slice(0,4),[],8);
 add(0,'Kho báu chương 1',ids.slice(0,8),[],8);
 for(let c=1;c<3;c++){
  const titles=c===1?['Một khoảng thời gian','Lắng nghe & trò chuyện','Ngôn ngữ & trang sách','Trường học & bạn bè']:['Hai rồi đến ba','Bầu trời & quyển sách','Trắng & một trăm','Trái hay phải?'];
  for(let n=0;n<4;n++){const start=c*8+n*2;add(c,titles[n],ids.slice(start,start+2),ids.slice(start,start+2),start+2);}
  add(c,'Kho báu chương '+(c+1),ids.slice(c*8,c*8+8),[],c*8+8);
 }
 const curriculum={id:'n5-compose-24-v1',title:'N5 · Hành trình ghép chữ',recipes,ids,chapters,levels,marks:['●','◆','★','♥','✦','■','✿','▲','☾','✚','✕','⬟','◎','≋','◈','⬢','✪','⬣','✧','✥','✺','✹','✷','❖'],sources:[{title:'Danh sách N5 tham khảo · JLPT Sensei',url:'https://jlptsensei.com/jlpt-n5-kanji-list/'},{title:'Phạm vi JLPT · FAQ chính thức',url:'https://www.jlpt.jp/e/faq/'},{title:'Đối chiếu cấu tạo · CJKVI IDS',url:'https://github.com/cjkvi/cjkvi-ids'}]};
 host.KanjiCourse=curriculum;if(typeof module!=='undefined')module.exports=curriculum;
})(globalThis);

