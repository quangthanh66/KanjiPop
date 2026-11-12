# 🤖 AI Agent Onboarding & Project Context — Kanjidle!

> **Tài liệu chuẩn hóa dành riêng cho AI Agent (Antigravity, Cursor, Claude Code, GitHub Copilot, Codex, Aider, v.v.)**  
> Khi bạn (AI) được khởi động trên bất kỳ thiết bị mới nào sau khi clone/pull repository này, hãy đọc kỹ tài liệu này. Toàn bộ kiến trúc, quy tắc bất biến, tiến độ thực tế, cách chạy server, test suite, bài học kinh nghiệm và **lịch sử trò chuyện chi tiết** đã được đóng gói đầy đủ dưới đây. Bạn có thể bắt đầu xử lý task tiếp theo ngay lập tức mà không cần hỏi lại người dùng về bối cảnh dự án.

---

## 1. 📌 Tổng Quan Dự Án (Project Mission)

* **Tên dự án**: **Kanjidle** *(The Daily Kanji Sliding Puzzle · 漢字ポップ)*
* **Mục tiêu**: Trò chơi giải đố Web (Web-based Puzzle Game) kết hợp giữa cơ chế **Trượt gạch (Sliding Puzzle)** và **Hợp nhất nguyên tố (Elemental Fusion)** để hỗ trợ người học ghi nhớ và làm quen với 24 chữ Hán tự (Kanji) sơ cấp cấp độ **JLPT N5** (và mở rộng sang **JLPT N4**). Tích hợp chế độ Thử thách hàng ngày (Daily Puzzle) phong cách Wordle.
* **Đối tượng người dùng**: Người học tiếng Nhật sơ cấp (đặc biệt là người Việt Nam và cộng đồng quốc tế), ưu tiên trải nghiệm thư giãn, mượt mà, phản hồi âm thanh sống động (tactile haptics & acoustics) và phát âm tiếng Nhật chuẩn.
* **Triết lý kỹ thuật**: **Zero-Build, Pure Vanilla**. Hoạt động độc lập 100% không cần bundler (Webpack, Vite, Rollup, Babel), không phụ thuộc npm dependencies lúc runtime, toàn bộ font chữ và tài nguyên âm thanh/hình ảnh lưu cục bộ (offline-first).

---

## 2. 🚦 Trạng Thái Hiện Tại & Bảng Tiến Độ (Progress Matrix)

| Hệ thống / Tính năng | Trạng thái | Ghi chú kỹ thuật |
| :--- | :---: | :--- |
| **Thương hiệu & Nhận diện (Kanjidle Brand)** | ✅ Hoàn thành | Đổi tên sang **Kanjidle**, Logo 3D Mẫu 4 Twin Gem Fusion + chữ nổi 3D cầu vồng (`cozy-logo-text.webp`), Favicon SVG/PNG, Clickable Logo về trang chủ. |
| **Màn hình chính Cozy Casual 3D World (Option 5)** | ✅ Hoàn thành | Thiết kế lại toàn bộ màn hình chính (`#map-screen`) theo phong cách **3D Clay & Candy Cozy Casual** dùng bộ 16 file 3D WebP asset độc lập (`cozy-*.webp`, tổng ~118KB): Đồi đất sét bậc thang 3D & mây bông (`cozy-mountain-stage.webp`), 5 nút kẹo 3D trên bệ bánh quy vàng (`cozy-node-1..5.webp`), Vương miện 3D đính kim cương hồng (`cozy-crown.webp`), 8 phím Kanji đất sét pastel 3D (`cozy-tile-1..8.webp`), Thanh Capsule HUD hợp nhất trên đỉnh màn hình, hiển thị trọn vẹn `100dvh` (Zero-Scroll) trên mọi kích thước màn hình Desktop & Mobile. |
| **Kỹ năng chuyên dụng Game UI/UX (`game-ui-design`)** | ✅ Hoàn thành | Đóng gói tại `.agents/skills/game-ui-design/SKILL.md` để chuẩn hóa kiến trúc giao diện game giải đố casual/puzzle Nhật Bản. |
| **Đa ngôn ngữ (i18n VI $\leftrightarrow$ EN)** | ✅ Hoàn thành | `dist/i18n.js` chuyển đổi song ngữ tức thì (Tiếng Việt & English) 1-click cho toàn bộ UI, menu và thẻ học. |
| **Phát âm tiếng Nhật (Native Audio TTS)** | ✅ Hoàn thành | Nút loa trên thẻ học phát âm chuẩn tiếng Nhật từ vựng và chữ Hán (`KanjiAudio.speak(text, lang)`). |
| **Thử thách hàng ngày (Daily Kanji Puzzle)** | ✅ Hoàn thành | Chế độ Wordle-style đố chữ mỗi ngày (`.grade-pill.daily-pill`), tự động sinh bảng chia sẻ kết quả chuỗi thắng. |
| **Phòng thu âm thanh (Audio Studio)** | ✅ Hoàn thành | Bộ Audio Studio tương tác trong Cài đặt: 10 tùy chọn cho mỗi nhóm (Chạm gạch, Hợp nhất, Thắng cuộc, Nhạc nền BGM). |
| **Bàn cờ trượt (Slide Engine)** | ✅ Hoàn thành | Bàn cờ 35 ô: Mobile 5×7 $\leftrightarrow$ Desktop 7×5 (34 viên đá = 17 cặp, 1 ô trống). |
| **Hệ thống chuyển đổi màn hình (Transposition)** | ✅ Hoàn thành | Tự động đổi trục $5\times 7 \leftrightarrow 7\times 5$ khi resize viewport mà không mất trạng thái game. |
| **Bỏ chướng ngại vật (No Obstacles)** | ✅ Hoàn thành | Loại bỏ hoàn toàn các khối đá xám (obstacles) để tránh gây ức chế/deadlock cho người học. |
| **Cơ chế tái sinh ngọc (Refill Engine)** | ✅ Hoàn thành | Áp dụng thuật toán khoảng cách Manhattan $\ge 5$ giữa 2 viên mới để đảm bảo không bị kẹt. |
| **Giáo trình Kanji N5 & N4 (Curriculum)** | ✅ Hoàn thành | 15 màn chơi qua 3 chương với 24 chữ Kanji N5 (và bộ N4) kèm bộ thủ, âm Hán Việt, nghĩa và từ vựng. |
| **Đồ họa đá quý (Gem Art)** | ✅ Hoàn thành | Bộ sprite **Hybrid Clear Crystal** (7 dáng cắt: diamond, hexagon, pentagon, point, round, square, triangle). |
| **Hiệu ứng hợp nhất (Fusion VFX)** | ✅ Hoàn thành | 8 nguyên tố ma thuật: Lửa, Nước, Băng, Sấm, Mộc, Đất, Ma thuật, Vũ trụ trên HTML5 Canvas 60fps. |
| **Hào quang mục tiêu (Target Marker)** | ✅ Hoàn thành | Hào quang 3 lớp bám sát alpha viền đá quý, lưu thông hạt nguyên tố theo chu kỳ 5.8s. |
| **Lưu tiến trình (Persistence v11)** | ✅ Hoàn thành | Schema v11, Web Locks API chống ghi đè đa tab, xoay vòng backup, nhập/xuất JSON. |
| **Git Repository** | ✅ Hoàn thành | Đã đồng bộ hoàn chỉnh trên GitHub: `quangthanh66/KanjiPop` (nhánh `main`). |

---

## 3. ⚖️ Các Quy Tắc Bất Biến & Ràng Buộc Cốt Lõi (Core Rules & Invariants)

> [!CAUTION]
> Khi thực hiện bất kỳ thay đổi mã nguồn nào, bạn **BẮT BUỘC** phải tuân thủ các quy tắc bất biến sau:

### Quy tắc 1: Kích thước bàn cờ & Cơ chế Transposition
* **Mobile (< 900px)**: Bắt buộc $5 \text{ cột} \times 7 \text{ hàng}$ (35 ô: 17 cặp ngọc + 1 ô trống duy nhất).
* **Desktop ($\ge 900px$)**: Bắt buộc $7 \text{ cột} \times 5 \text{ hàng}$ (35 ô: 17 cặp ngọc + 1 ô trống duy nhất).
* **Transposition**: Khi viewport thay đổi qua lại giữa Desktop và Mobile, hàm hoán vị tọa độ trong `n5-engine.js` / `slide-engine.js` phải giữ nguyên cặp ghép, điểm số, lịch sử undo và mục tiêu hiện tại.
* **KHÔNG đưa chướng ngại vật (rocks/obstacles) quay trở lại** trừ khi người dùng yêu cầu rõ ràng.

### Quy tắc 2: Không sử dụng Build Tools & Dependency ngoài
* Mã nguồn trong `work/kanji-pop-site/dist/` chạy trực tiếp trên trình duyệt bằng ES Modules / Vanilla JS thuần.
* **KHÔNG** thêm Webpack, Vite, Babel, TypeScript compiler hoặc các thư viện npm phức tạp vào runtime client.
* Toàn bộ font chữ (`dist/fonts/`), sprite WebP, và file audio (`dist/audio/`) phải tự phục vụ cục bộ.

### Quy tắc 3: Quy tắc Refill Khoảng Cách 5 Bước (Distance-5 Invariant)
* Khi một cặp ngọc ghép thành công và biến mất, cặp ngọc thay thế mới xuất hiện phải được bố trí ở 2 vị trí có khoảng cách Manhattan tối thiểu là 5 bước ($|x_1 - x_2| + |y_1 - y_2| \ge 5$).
* Điều này đảm bảo người chơi luôn có không gian trượt giải đố, không bị tình trạng ngọc mới sinh ra tự động dính vào nhau gây deadlock.

### Quy tắc 4: Audio Engine & Audio Studio
* **Kiến trúc bus**: `sfxBus` đi qua filter Lowpass 5200Hz; `bgmBus` đi qua filter Lowpass 4000Hz; gom vào compressor chống clip (`masterBus`) trước khi ra `ctx.destination`.
* **Tránh lỗi double-trigger**: Khi một khối ngọc trượt, chỉ phát **đúng 1 âm thanh trượt** theo profile đang chọn.
* **Mặc định**: BGM vui tươi Nhật Pop 126 BPM (`pop`) + Hiệu ứng âm thanh đá ngọc trong sáng (`gem`).
* **Audio Studio**: Cung cấp 10 tùy chọn âm thanh phong phú cho mỗi nhóm (Trượt gạch, Hợp nhất, Chiến thắng, Nhạc nền) và bật/tắt phát âm tiếng Nhật.

### Quy tắc 5: Định Dạng Dữ Liệu Lưu Trữ (Schema v11)
* Khóa chính trong localStorage: `kanji-pop-n5-v1`.
* Bản backup quay vòng: `kanji-pop-n5-v1-backup`.
* Phiên chơi thử riêng (Playtest): Namespace `kanji-pop-experience-v1` hoặc URL `?playtest=<id>`.
* Khi nâng cấp logic lưu trữ, luôn duy trì hàm migration để không làm mất tiến trình đã chơi của người dùng.

### Quy tắc 6: Nguyên Tắc Đồng Bộ Git & Push GitHub (User Permission Invariant)
* **TUYỆT ĐỐI KHÔNG tự ý thực hiện `git push`** lên kho lưu trữ từ xa (GitHub/origin).
* AI chỉ được phép thực thi lệnh `git push` **khi và chỉ khi có yêu cầu trực tiếp, rõ ràng từ người dùng** (ví dụ: *"hãy push lên github"*, *"push code đi"*, v.v.).
* Mọi thao tác sửa đổi, kiểm thử tự động hay tạo local commit có thể thực hiện trên máy cục bộ, nhưng bước đẩy lên remote luôn phải chờ lệnh của người dùng.

---

## 4. 🗺️ Bản Đồ Thư Mục & Trách Nhiệm Từng File (File Architecture)

```
KanjiPop/
├── AGENTS.md                   # [FILE NÀY] Bảng chỉ dẫn toàn diện & lịch sử phiên làm việc cho AI
├── README.md                   # Tài liệu giới thiệu dự án cho con người & tổng quan
├── .gitignore                  # Bỏ qua screenshots test Playwright (~93MB), logs, caches
├── .agents/
│   └── skills/
│       └── game-ui-design/
│           └── SKILL.md        # Kỹ năng chuyên dụng thiết kế kiến trúc Game UI/UX Nhật Bản (Zero-Scroll)
│
└── work/
    ├── kanji-pop-site/         # Thư mục chính chứa mã nguồn ứng dụng Web
    │   ├── server.js           # Máy chủ tĩnh Node.js phục vụ port 8765
    │   ├── GAMEPLAY.md         # Toàn bộ lịch sử thiết kế và chi tiết cơ chế game
    │   ├── AGENTS.md           # Chỉ dẫn cục bộ trỏ về tài liệu gốc
    │   ├── art-source/         # File ảnh PNG gốc, prompt AI sinh sprite, atlas VFX
    │   │
    │   └── dist/               # Web App hoàn chỉnh (Root thư mục web phục vụ)
    │       ├── index.html      # Trang chủ game, nạp scripts và css theo thứ tự chuẩn
    │       ├── i18n.js         # Hệ thống đa ngôn ngữ song ngữ Việt - Anh (VI / EN)
    │       ├── n5-game.js      # Controller chính: Quản lý vòng lặp, tương tác Touch/Mouse, UI, 3D Cozy Map
    │       ├── n5-engine.js    # Logic bàn cờ thuần: Tính toán di chuyển, solver BFS, refill
    │       ├── n5-data.js      # Bộ dữ liệu 24 Kanji N5 & N4 (Hán Việt, bộ thủ, nghĩa, từ vựng)
    │       ├── audio-fx.js     # Web Audio API Engine: Audio Studio, 10 options/nhóm, BGM 126 BPM, TTS
    │       ├── fusion-fx.js    # Canvas 2D VFX: Hoạt họa va chạm nguyên tố khi hợp nhất
    │       ├── target-vfx.js   # Hiệu ứng hào quang mục tiêu 3 lớp bám viền đá quý
    │       ├── gem-art.js      # Vector & WebP sprite renderer cho 7 dáng đá quý
    │       ├── course-plans.js # 30 lộ trình giải mẫu đã xác thực (15 Mobile + 15 Desktop)
    │       ├── progress-store.js # Quản lý lưu trữ localStorage, backup, export/import JSON
    │       ├── progress-lock.js  # Khóa Web Locks API chống xung đột đa tab
    │       ├── aurora-background.js # Canvas nền cực quang và sao trôi lơ lửng
    │       ├── cozy-mountain-stage.webp # Nền 3D đồi đất sét bậc thang uốn lượn & mây bông (1376x768)
    │       ├── cozy-node-1..5.webp      # 5 nút kẹo 3D trên bệ bánh quy vàng (theo phối cảnh 3D)
    │       ├── cozy-crown.webp          # Vương miện vàng 3D đính kim cương hồng cho màn cuối chương
    │       ├── cozy-tile-1..8.webp      # 8 viên gạch đất sét 3D pastel cho khay Kanji dưới đáy
    │       ├── cozy-logo-text.webp      # Chữ nổi Kanjidle 3D cầu vồng viền trắng
    │       ├── kanjidle-logo.png        # Logo 3D Mẫu 4 Twin Gem Fusion
    │       ├── audio/          # Bộ file âm thanh Foley thực tế (*.mp3, *.ogg, *.wav)
    │       ├── fonts/          # Font Noto Sans JP và Nunito WOFF2 offline
    │       └── *.css           # Toàn bộ hệ thống giao diện responsive (journey-map.css, theme.css, slide.css...)
    │
    └── *.cjs                   # Bộ kịch bản kiểm thử tự động Playwright (Chạy ở môi trường Node)
        ├── ui-shell-check.cjs           # Test điều hướng Map -> Intro -> Play -> Menu -> Album (390px & 1440px)
        ├── verify-three-features.cjs    # Test i18n, Native Audio TTS và Daily Puzzle (Desktop & Mobile)
        ├── audio-settings-check.cjs     # Test cài đặt âm thanh & menu trong màn chơi
        ├── mobile-layout-stability-check.cjs # Test ổn định bố cục di động qua 36 nước đi
        ├── fusion-check.cjs             # Test toàn diện VFX, hợp nhất, thẻ học và dọn dẹp bộ nhớ
        └── take-screenshots.cjs         # Chụp ảnh & đo lường Zero-Scroll trên 6 độ phân giải màn hình
```

---

## 5. 🛠️ Hướng Dẫn Vận Hành & Kiểm Thử (Developer Playbook)

### 5.1. Khởi động Local Server

Server phục vụ ứng dụng tại địa chỉ: **`http://127.0.0.1:8765/`**.

```powershell
# Di chuyển vào thư mục game
cd work/kanji-pop-site

# Chạy server bằng Node.js tiêu chuẩn (nếu có trong PATH):
node server.js

# Hoặc nếu chạy trên máy Windows này khi Node chưa trong System PATH:
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

### 5.2. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suites)

Các script kiểm thử sử dụng Playwright headless để kiểm tra trực tiếp trên trình duyệt local:

```powershell
# Chạy từ thư mục gốc KanjiPop (cần server 8765 đang chạy):

# 1. Kiểm tra luồng điều hướng UI Shell (Map / Intro / Play / Menu / Album):
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" work/ui-shell-check.cjs

# 2. Kiểm tra 3 tính năng (i18n VI/EN, Native Audio TTS, Daily Puzzle):
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" work/verify-three-features.cjs

# 3. Kiểm tra Audio Settings & In-Game Menu:
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" work/audio-settings-check.cjs

# 4. Kiểm tra độ ổn định Layout trên 6 độ phân giải màn hình (360px -> 1920px):
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" work/take-screenshots.cjs
```

---

## 6. 💡 Các Bài Học Kỹ Thuật & Lỗi Thường Gặp Cần Tránh (Gotchas)

1. **Kiến trúc Tọa độ Bất Biến trên Màn hình chính 3D (`#map-screen`)**:
   - Nền đồi đất sét 3D `cozy-mountain-stage.webp` (`1376x768`) được gắn vào `.mountain-canvas` với `background-size: 100% 100%`.
   - 5 nút màn chơi `.candy-node.journey-stop[data-journey-level="..."]` đặt bên trong `.mountain-canvas` theo tọa độ phần trăm cố định:
     - Màn 01: `left: 50.5%; top: 80.5%` (`cozy-node-1.webp`)
     - Màn 02: `left: 31.5%; top: 68.5%` (`cozy-node-2.webp`)
     - Màn 03: `left: 66.5%; top: 55.2%` (`cozy-node-3.webp`)
     - Màn 04: `left: 35.5%; top: 41.8%` (`cozy-node-4.webp`)
     - Màn 05: `left: 46.5%; top: 22.0%` (`cozy-node-5.webp` + vương miện `cozy-crown.webp`)
   - Nhờ gắn trực tiếp trong `.mountain-canvas`, dù trên Widescreen Desktop (`1920x1080`) hay Mobile dọc (`360x740`, nơi `.mountain-canvas` mở rộng `width: 184vw; height: 82dvh` để khúc cua đường núi lấp đầy chiều ngang màn hình), cả 5 nút **luôn nằm chính xác 100% trên vạch đường trắng** mà không bao giờ bị lệch.
2. **Tránh `transform: scale()` lặp vô hạn trên nút bấm tương tác Playwright**:
   - Không dùng `animation` thay đổi `transform: scale(...)` liên tục trên `.play-bubble.journey-node-play-btn` (`[data-main="0"]`), vì cơ chế kiểm tra độ ổn định bounding-box của Playwright sẽ đợi vô hạn và gây timeout khi click. Chỉ animate `box-shadow` (`cozyGlowPulse`).
3. **Tránh `box-shadow` mặc định của `button` đè lên 3D Sprite**:
   - Trong `journey-map.css`, các nút 3D sprite (`#kanji-pop#kanji-pop button.candy-node` và `#kanji-pop#kanji-pop button.kanji-key`) bắt buộc có `box-shadow: none !important; border: none !important; background-color: transparent !important;` để không bị rule toàn cục của button vẽ khung chữ nhật mờ bao quanh ảnh WebP trong suốt.
4. **Stacking Context giữa `.kp-header` và `#map-screen`**:
   - Trên Desktop ($\ge 860\text{px}$), thanh `.chapter-bar` được neo vào chính giữa thanh `.kp-header` tạo thành một thanh Capsule HUD duy nhất ở đỉnh màn hình. Do đó `#map-screen` phải để `z-index: auto` để `.mountain-stage-wrap` (`z-index: 1`) nằm dưới `.kp-header` (`z-index: 25`) và `.chapter-bar` (`z-index: 35`).
5. **Kích thước vùng chạm Mobile ($\ge 44\times 44\text{px}$)**:
   - Hai nút `#kp-lang` và `#kp-sound` trên thanh header bắt buộc duy trì kích thước tối thiểu `44px × 44px` trên cả Desktop và Mobile để vượt qua bài kiểm thử chuẩn Accessibility trong `verify-three-features.cjs`.

---

## 7. 📜 Lịch Sử Phiên Làm Việc & Bối Cảnh Trò Chuyện (Session & Conversation History)

> **Tóm tắt đầy đủ diễn biến cuộc trò chuyện gần nhất (cập nhật ngày 2026-11-12)** để bất kỳ thiết bị mới nào khi `git pull` về đều nắm trọn vẹn mạch làm việc:

1. **Thiết lập Quy tắc Git Push (Quy tắc 6)**:
   - Người dùng yêu cầu: *"từ nay về sau mỗi khi có yêu cầu của tôi thì bạn mới được phép push lên github"*.
   - Đã ghi nhận vào `AGENTS.md` (Quy tắc 6) và tuân thủ nghiêm ngặt.
2. **Vấn đề giao diện màn hình chính ban đầu (Bị thưa thớt, phải cuộn trang, dư 2 cột xanh 2 bên)**:
   - Người dùng phản ánh giao diện màn hình chính (`#map-screen`) bị thưa thớt, phải cuộn trang dọc và thừa 2 khoảng trống xanh lớn ở hai bên trên màn hình rộng, đồng thời nhìn mất cân đối.
   - Đã tạo kỹ năng chuyên dụng `.agents/skills/game-ui-design/SKILL.md` chuyên xử lý kiến trúc Game UI/UX phong cách Nhật Bản (Zero-Scroll `100dvh`, cân bằng thị giác).
3. **Tạo 5 Phương án Concept bằng Hình ảnh (Visual UI Options)**:
   - Theo yêu cầu của người dùng (*"tạo giao diện theo dạng ảnh, cho tôi 5 option để chọn ngay trong đoạn chat"*), AI đã sinh 5 bản thiết kế hình ảnh trực quan:
     - *Option 1*: Celestial Floating Archipelago (Đảo nổi thiên hà)
     - *Option 2*: Arcade Split-Deck Neo-Glass (Bảng đôi hiện đại)
     - *Option 3*: Japanese Zen Shrine Diorama (Đền thần Nhật Bản)
     - *Option 4*: Cosmic Astrolabe Dial (Vòng sao thiên văn)
     - *Option 5 (Recommended & Selected)*: **Cozy Casual 3D World** (Đồi đất sét bậc thang 3D màu hồng đào – xanh pastel uốn lượn giữa biển mây bông 3D, 5 nút kẹo 3D trên bệ bánh quy vàng, vương miện vàng 3D trên đỉnh màn 05, thanh Capsule HUD trắng ở đỉnh và khay 8 phím Kanji đất sét pastel 3D ở đáy).
   - Người dùng đã chọn **Option 5**.
4. **Từ bản dựng CSS/SVG sang Bộ 3D Asset Độc Lập Từng Phần**:
   - Ban đầu, AI thử tái tạo Option 5 bằng vector SVG/CSS thuần nhưng hình ảnh phẳng không đạt được độ khối 3D đất sét/kẹo bóng như ảnh demo Option 5.
   - Người dùng yêu cầu: *"vẫn chưa được, bạn có thể tạo asset riêng từng phần để dùng được ko"*.
   - AI đã tiến hành sinh riêng từng bộ 3D asset chất lượng cao và dùng script Canvas + Flood-fill khử nền trắng/viền xám sang định dạng `.webp` trong suốt lưu trực tiếp tại `work/kanji-pop-site/dist/`:
     - `cozy-mountain-stage.webp` (37.8 KB): Nền đồi bậc thang 3D & mây bông đã mở rộng bầu trời phía trên đỉnh núi để nhường không gian cho Vương miện 3D và thanh HUD.
     - `cozy-node-1.webp` .. `cozy-node-5.webp` (~7.5 KB/file): 5 nút kẹo 3D trên bệ bánh quy vàng theo đúng góc nghiêng phối cảnh.
     - `cozy-crown.webp` (9.2 KB): Vương miện hoàng gia 3D đính kim cương hồng.
     - `cozy-tile-1.webp` .. `cozy-tile-8.webp` (~3.4 KB/file): 8 viên gạch đất sét 3D bo góc pastel cho khay Kanji cuối trang.
     - `cozy-logo-text.webp` (5.9 KB): Chữ `Kanjidle` 3D cầu vồng viền trắng sắc nét.
5. **Hoàn thiện Lắp ghép & Kiểm thử Tự động (100% Pass)**:
   - Đã cập nhật `dist/index.html`, `dist/n5-game.js`, và `dist/journey-map.css` sử dụng bộ 16 file 3D asset trên.
   - Đã kiểm tra thực tế trên 6 độ phân giải (`1920x1080`, `1440x900`, `1366x768`, `1280x720`, `390x844`, `360x740`): **0 thanh cuộn dọc/ngang (`hasScroll = false`), 0 chồng lấp (`overlapsNav = false`)**.
   - Đã chạy và vượt qua 100% toàn bộ các bộ test Playwright (`ui-shell-check.cjs`, `verify-three-features.cjs`, `audio-settings-check.cjs`).

---

## 8. 🎯 Các Bước Đề Xuất Cho Nhiệm Vụ Tiếp Theo (Next Suggested Steps)

Khi nhận yêu cầu tiếp tục phát triển trên thiết bị mới, bạn có thể tham khảo các hướng tiếp theo:
1. **Đồng bộ phong cách 3D Cozy Casual sang màn hình Chơi (`#play-screen`) hoặc Album (`#album-screen`)** nếu người dùng muốn mở rộng chủ đề đất sét/kẹo 3D sang các màn hình còn lại.
2. **PWA (Progressive Web App)**: Bổ sung `manifest.json` và `service-worker.js` để người dùng có thể "Cài đặt vào màn hình chính" (Add to Home Screen) trên iPhone và Android để chơi offline hoàn toàn.
3. **Mở rộng nội dung Giáo trình Kanji N4/N3**: Bổ sung thêm các chương ôn tập hoặc chế độ giải đố nâng cao.
