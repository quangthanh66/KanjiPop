# 🤖 AI Agent Onboarding & Project Context — Kanji Pop!

> **Tài liệu chuẩn hóa dành riêng cho AI Agent (Antigravity, Cursor, Claude Code, GitHub Copilot, Codex, Aider, v.v.)**  
> Khi bạn (AI) được khởi động trên bất kỳ thiết bị mới nào sau khi clone/pull repository này, hãy đọc kỹ tài liệu này. Toàn bộ kiến trúc, quy tắc bất biến, tiến độ thực tế, cách chạy server, test suite và các bài học kinh nghiệm đã được đóng gói đầy đủ dưới đây. Bạn có thể bắt đầu xử lý task tiếp theo ngay lập tức mà không cần hỏi lại người dùng về bối cảnh dự án.

---

## 1. 📌 Tổng Quan Dự Án (Project Mission)

* **Tên dự án**: **Kanji Pop!**
* **Mục tiêu**: Trò chơi giải đố Web (Web-based Puzzle Game) kết hợp giữa cơ chế **Trượt gạch (Sliding Puzzle)** và **Hợp nhất nguyên tố (Elemental Fusion)** để hỗ trợ người mới bắt đầu học và ghi nhớ 24 chữ Hán tự (Kanji) sơ cấp cấp độ **JLPT N5**.
* **Đối tượng người dùng**: Người học tiếng Nhật sơ cấp (đặc biệt là người Việt Nam), ưu tiên trải nghiệm thư giãn, mượt mà, phản hồi âm thanh và xúc giác sống động (tactile haptics & acoustics).
* **Triết lý kỹ thuật**: **Zero-Build, Pure Vanilla**. Hoạt động độc lập 100% không cần bundler (Webpack, Vite, Rollup, Babel), không phụ thuộc npm dependencies lúc runtime, toàn bộ font chữ và tài nguyên âm thanh/hình ảnh lưu cục bộ (offline-first).

---

## 2. 🚦 Trạng Thái Hiện Tại & Bảng Tiến Độ (Progress Matrix)

| Hệ thống / Tính năng | Trạng thái | Ghi chú kỹ thuật |
| :--- | :---: | :--- |
| **Bàn cờ trượt (Slide Engine)** | ✅ Hoàn thành | Bàn cờ 35 ô: Mobile 5×7 $\leftrightarrow$ Desktop 7×5 (34 viên đá = 17 cặp, 1 ô trống). |
| **Hệ thống chuyển đổi màn hình (Transposition)** | ✅ Hoàn thành | Tự động đổi trục $5\times 7 \leftrightarrow 7\times 5$ khi resize viewport mà không mất trạng thái game. |
| **Bỏ chướng ngại vật (No Obstacles)** | ✅ Hoàn thành | Đã loại bỏ hoàn toàn các khối đá xám (obstacles) để tránh gây ức chế/deadlock cho người học. |
| **Cơ chế tái sinh ngọc (Refill Engine)** | ✅ Hoàn thành | Áp dụng thuật toán Manhattan distance $\ge 5$ giữa 2 viên mới để đảm bảo không bị kẹt. |
| **Giáo trình Kanji N5 (Curriculum)** | ✅ Hoàn thành | 15 màn chơi qua 3 chương với 24 chữ Kanji N5 kèm bộ thủ, âm Hán Việt, nghĩa và từ vựng. |
| **Đồ họa đá quý (Gem Art)** | ✅ Hoàn thành | Sử dụng bộ sprite **Hybrid Clear Crystal** (7 dáng cắt: diamond, hexagon, pentagon, point, round, square, triangle). |
| **Hiệu ứng hợp nhất (Fusion VFX)** | ✅ Hoàn thành | 8 nguyên tố ma thuật: Lửa, Nước, Băng, Sấm, Mộc, Đất, Ma thuật, Vũ trụ trên HTML5 Canvas. |
| **Hào quang mục tiêu (Target Marker)** | ✅ Hoàn thành | Hào quang 3 lớp bám sát alpha viền đá quý, lưu thông hạt nguyên tố theo chu kỳ 5.8s. |
| **Audio Engine (Acoustic & BGM)** | ✅ Hoàn thành | Bộ tổng hợp Web Audio API + Foley thực tế. BGM Nhật Pop 126 BPM. Tích hợp 5 Sound Profiles. |
| **Khử lỗi âm thanh đôi (Audio Fix)** | ✅ Hoàn thành | Đã giải quyết triệt để lỗi âm thanh va chạm đôi (double-trigger); mặc định dùng `tile_slide.mp3`. |
| **Lưu tiến trình (Persistence v11)** | ✅ Hoàn thành | Schema v11, Web Locks API chống ghi đè đa tab, xoay vòng backup, nhập/xuất JSON. |
| **Bộ kiểm thử tự động (Test Suite)** | ✅ Hoàn thành | Playwright test suites kiểm tra logic, layout responsive, audio và VFX đạt 100% pass. |
| **Git Repository** | ✅ Hoàn thành | Đã đưa lên GitHub: `quangthanh66/KanjiPop` (nhánh `main`). |

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

### Quy tắc 4: Audio Engine & Sound Profiles
* **Kiến trúc bus**: `sfxBus` đi qua filter Lowpass 5200Hz; `bgmBus` đi qua filter Lowpass 4000Hz; gom vào compressor chống clip (`masterBus`) trước khi ra `ctx.destination`.
* **Tránh lỗi double-trigger**: Khi một khối ngọc trượt, chỉ phát **đúng 1 âm thanh trượt** theo profile đang chọn. Không phát kèm tiếng tap/click hay tiếng va chạm (contact) trong lúc trượt thường.
* **5 Sound Profiles** được lưu tại `localStorage.getItem('kanji-pop-sound-profile')`:
  1. `'tile'` (Mặc định): Lướt gạch êm dịu từ file thực `audio/tile_slide.mp3`.
  2. `'gem'`: Tiếng đá quý chạm nhau trong và sáng (`audio/gem_clink.ogg`).
  3. `'crystal'`: Tiếng pha lê cao vút, thanh thoát.
  4. `'stone'`: Tiếng đá cờ vây mộc mạc (`audio/go_stone_*.mp3`).
  5. `'soft'`: Tiếng ngọc bích êm nhẹ.

### Quy tắc 5: Định Dạng Dữ Liệu Lưu Trữ (Schema v11)
* Khóa chính trong localStorage: `kanji-pop-n5-v1`.
* Bản backup quay vòng: `kanji-pop-n5-v1-backup`.
* Phiên chơi thử riêng (Playtest): Namespace `kanji-pop-experience-v1` hoặc URL `?playtest=<id>`.
* Khi nâng cấp logic lưu trữ, luôn duy trì hàm migration để không làm mất tiến trình đã chơi của người dùng.

---

## 4. 🗺️ Bản Đồ Thư Mục & Trách Nhiệm Từng File (File Architecture)

```
KanjiPop/
├── AGENTS.md                   # [FILE NÀY] Tài liệu chỉ dẫn toàn diện cho AI
├── README.md                   # Tài liệu giới thiệu dự án cho con người & tổng quan
├── .gitignore                  # Bỏ qua screenshots test Playwright (~93MB), logs, caches
│
└── work/
    ├── kanji-pop-site/         # Thư mục chính chứa mã nguồn ứng dụng Web
    │   ├── server.js           # Máy chủ tĩnh Node.js phục vụ port 8765
    │   ├── GAMEPLAY.md         # Toàn bộ lịch sử thiết kế và chi tiết cơ chế game
    │   ├── AGENTS.md           # Chỉ dẫn cục bộ trỏ về tài liệu gốc
    │   ├── art-source/         # File ảnh PNG gốc, prompt AI sinh sprite, atlas VFX
    │   │   ├── gem-hybrid/     # Source hình ảnh đá quý hybrid crystal
    │   │   ├── target-vfx/     # Atlas hiệu ứng hạt của 7 nguyên tố
    │   │   └── vfx-study/      # Các mẫu nghiên cứu ribbon/khói
    │   │
    │   └── dist/               # Web App hoàn chỉnh (Root thư mục web phục vụ)
    │       ├── index.html      # Trang chủ game, nạp scripts và css theo thứ tự chuẩn
    │       ├── n5-game.js      # Controller chính: Quản lý vòng lặp, tương tác Touch/Mouse, UI
    │       ├── n5-engine.js    # Logic bàn cờ thuần: Tính toán di chuyển, solver BFS, refill
    │       ├── n5-data.js      # Bộ dữ liệu 24 Kanji N5 (Hán Việt, bộ thủ, nghĩa, từ vựng)
    │       ├── audio-fx.js     # Web Audio API Engine: 5 sound profiles, BGM 126 BPM, haptics
    │       ├── fusion-fx.js    # Canvas 2D VFX: Hoạt họa va chạm nguyên tố khi hợp nhất
    │       ├── target-vfx.js   # Hiệu ứng hào quang mục tiêu 3 lớp bám viền đá quý
    │       ├── gem-art.js      # Vector & WebP sprite renderer cho 7 dáng đá quý
    │       ├── course-plans.js # 30 lộ trình giải mẫu đã xác thực (15 Mobile + 15 Desktop)
    │       ├── progress-store.js # Quản lý lưu trữ localStorage, backup, export/import JSON
    │       ├── progress-lock.js  # Khóa Web Locks API chống xung đột đa tab
    │       ├── aurora-background.js # Canvas nền cực quang và sao trôi lơ lửng
    │       ├── audio/          # Bộ file âm thanh Foley thực tế (*.mp3, *.ogg, *.wav)
    │       ├── fonts/          # Font Noto Sans JP và Nunito WOFF2 offline
    │       └── *.css           # Toàn bộ hệ thống giao diện responsive (theme, slide, pairs...)
    │
    └── *.cjs                   # Bộ kịch bản kiểm thử tự động Playwright (Chạy ở môi trường Node)
        ├── fusion-check.cjs    # Test toàn diện VFX, hợp nhất, thẻ học và dọn dẹp bộ nhớ
        ├── ui-shell-check.cjs  # Test chuyển đổi màn hình (Lộ trình, Bàn chơi, Menu, Album)
        ├── mobile-layout-stability-check.cjs # Test ổn định bố cục di động qua 36 nước đi
        └── ...
```

---

## 5. 🛠️ Hướng Dẫn Vận Hành & Kiểm Thử (Developer Playbook)

### 5.1. Khởi động Local Server

Server phục vụ ứng dụng tại địa chỉ: **`http://127.0.0.1:8765/`**.

```powershell
# Di chuyển vào thư mục game
cd c:\Users\Admin\Documents\Codex\2026-10-23\c-c\KanjiPop\work\kanji-pop-site

# Chạy server bằng Node.js tiêu chuẩn (nếu có trong PATH):
node server.js

# Hoặc nếu chạy trên máy Windows này khi Node chưa trong System PATH:
& "C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" server.js
```

### 5.2. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suites)

Các script kiểm thử sử dụng Playwright headless để kiểm tra trực tiếp trên trình duyệt local:

```powershell
# Chạy từ thư mục gốc KanjiPop (cần server 8765 đang chạy):

# 1. Kiểm tra toàn diện cơ chế Fusion & Ghép chữ:
node work/fusion-check.cjs

# 2. Kiểm tra điều hướng toàn bộ UI Shell (Map -> Play -> Album -> Settings):
node work/ui-shell-check.cjs

# 3. Kiểm tra độ ổn định Layout trên 6 độ phân giải màn hình (320px -> 1440px):
node work/mobile-layout-stability-check.cjs

# 4. Kiểm tra Lộ trình hành trình 3 chương:
node work/journey-map-check.cjs
```

---

## 6. 💡 Các Bài Học Kỹ Thuật & Lỗi Thường Gặp Cần Tránh (Gotchas)

1. **Lỗi âm thanh kép (Double audio on tile slide)**:
   * *Nguyên nhân trước đây*: Khi bấm vào viên đá, hàm `select()` được gọi phát tiếng tap, sau đó `slide()` lại phát tiếp tiếng slide, gây ra cảm giác "loạn âm".
   * *Giải pháp*: Trong `audio-fx.js`, hàm `slide()` xử lý một âm duy nhất tương ứng với sound profile được chọn. Chỉ phát âm thanh hợp nhất sau khi hai viên đã tiếp xúc xong.
2. **Lỗi Submodule Git (`160000`)**:
   * *Nguyên nhân*: Thư mục `work/kanji-pop-site/` từng chứa thư mục `.git` con từ template cũ, khiến Git ở root coi nó là một unlinked submodule và không track file bên trong.
   * *Giải pháp*: Đã xóa bỏ `.git` con và đưa toàn bộ file vào root Git tracking. Tuyệt đối không khởi tạo `git init` bên trong các thư mục con.
3. **Tràn ngang màn hình Mobile (Horizontal Scrollbar Overflow)**:
   * *Nguyên nhân*: Canvas của hào quang mục tiêu (`target-vfx`) khi mở rộng kích thước có thể chạm vào mép màn hình 320px/360px gây xuất hiện thanh cuộn ngang.
   * *Giải pháp*: `mobile-fullscreen.css` và `responsive.css` phải luôn duy trì `overflow-x: hidden` trên khung chứa chính nhưng vẫn giữ cho canvas render tràn tự nhiên bên trên bàn cờ.
4. **Vị trí của Node.js trên máy hiện tại**:
   * Trên máy tính hiện tại, Node.js nằm ở `C:\Users\Admin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`. Hãy lưu ý đường dẫn này khi thực thi lệnh nếu `node` chưa có trong PATH toàn cục.

---

## 7. 🎯 Các Bước Đề Xuất Cho Nhiệm Vụ Tiếp Theo (Next Suggested Steps)

Khi nhận yêu cầu tiếp tục phát triển, bạn có thể tham khảo các hướng mở rộng tiềm năng sau:
1. **Âm thanh bổ sung (Audio Polish)**: Bổ sung thêm tùy chọn âm lượng riêng biệt cho BGM và SFX trong phần Cài đặt (Settings).
2. **Nội dung Kanji N4**: Thiết kế bộ thẻ và lộ trình tiếp theo cho cấp độ N4 kế thừa kiến trúc 24 chữ của N5.
3. **PWA (Progressive Web App)**: Bổ sung `manifest.json` và `service-worker.js` để người dùng có thể "Cài đặt vào màn hình chính" (Add to Home Screen) trên iPhone và Android để chơi offline hoàn toàn.
