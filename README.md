# 🀄 Kanji Pop! — Trò Chơi Xếp Chữ Kanji N5 Tuyển Chọn

> Trò chơi giải đố kết hợp trượt gạch (**Sliding Puzzle**) và ghép nguyên tố (**Elemental Fusion**) giúp người học ghi nhớ và làm quen với 24 chữ Hán tự (Kanji) sơ cấp theo lộ trình JLPT N5.  
> **100% Zero-Build, Offline-First, Vanilla Web Standards.**

---

> [!TIP]
> 🤖 **Dành cho AI Agent & Lập trình viên mới**:  
> Vui lòng tham khảo tài liệu chuẩn hóa toàn diện tại **[`AGENTS.md`](./AGENTS.md)** để nắm bắt ngay kiến trúc, các quy tắc bất biến (invariants), bảng tiến độ và bộ kiểm thử mà không cần rà soát thủ công.

---

## 🌟 Tính Năng Nổi Bật

- **Cơ Chế Trượt Độc Đáo (Sliding Tile & Merge)**:
  - Bàn cờ cố định 17 cặp đá ngọc và 1 ô trống (35 ô).
  - Tự động thích ứng & hoán vị tọa độ: **5×7** trên Mobile và **7×5** trên PC/Desktop.
  - Trượt các viên đá cùng màu, cùng dáng lại gần nhau để kích hoạt hợp nhất Kanji.
  - Cơ chế tái sinh ngọc đảm bảo khoảng cách Manhattan $\ge 5$, không bị deadlock.
- **Hiệu Ứng Hình Ảnh & VFX Tinh Xảo**:
  - 8 nguyên tố ma thuật: Hỏa (Fire), Thủy (Water), Băng (Ice), Lôi (Lightning), Mộc (Nature), Vũ trụ (Cosmic Aurora), v.v.
  - Hào quang định hướng (Target Halo) 3 lớp bám viền đá quý bốc sáng và lưu thông hạt.
  - Pháo hoa và hoạt họa hợp nhất điện ảnh khi mở chữ mới.
- **Hệ Thống Âm Thanh Chân Thực (Acoustic Audio Engine)**:
  - Mô phỏng âm học va chạm đá quý kết hợp bộ mẫu Foley thu âm thực tế.
  - Tiếng trượt gạch êm dịu, thỏa mãn xúc giác (Tactile Tile Slide).
  - Tích hợp **5 Sound Profiles** tùy chọn trong Cài đặt:
    1. *Lướt gạch êm dịu* (`tile` - Mặc định).
    2. *Đá quý va chạm trong & sáng* (`gem`).
    3. *Pha lê thanh thoát* (`crystal`).
    4. *Đá cờ vây mộc mạc* (`stone`).
    5. *Ngọc bích nhẹ nhàng* (`soft`).
  - Nhạc nền (BGM) phong cách Japanese Puzzle Pop 126 BPM vui tươi, sôi động.
- **Nội Dung Học Tập N5 Chuẩn Xác**:
  - 15 màn chơi qua 3 chương với 24 chữ Kanji tuyển chọn.
  - Thẻ thông tin (Kanji Reveal Card) đầy đủ: Âm Hán Việt, Nghĩa, Công thức cấu tạo bộ thủ, Từ vựng ví dụ và cách đọc Hiragana.
  - Album lưu trữ chữ đã khám phá, hỗ trợ ôn tập và theo dõi tiến trình.
- **Tiện Ích & Quyền Riêng Tư**:
  - Lưu tiến trình tự động vào `localStorage` kèm công cụ Sao lưu / Khôi phục JSON (Schema v11).
  - Khóa Web Locks API độc quyền ngăn chặn xung đột dữ liệu đa tab.
  - Chế độ chơi thử riêng biệt dành cho nghiên cứu (Playtest Session).
  - Hoạt động 100% offline, không gửi dữ liệu ra máy chủ ngoài.

---

## 🚀 Khởi Chạy Cục Bộ (Local Development)

### Yêu cầu
- [Node.js](https://nodejs.org/) (phiên bản 18+ trở lên).

### Khởi động Server
```bash
# 1. Di chuyển vào thư mục game
cd work/kanji-pop-site

# 2. Chạy server cục bộ
node server.js
```

Mở trình duyệt và truy cập: **`http://127.0.0.1:8765/`**

---

## 🧪 Kiểm Thử Tự Động (Automated Testing)

Dự án tích hợp bộ kiểm thử Playwright tự động chạy không giao diện (Headless):

```bash
# Chạy từ thư mục gốc KanjiPop (yêu cầu local server 8765 đang chạy):

# Kiểm tra hợp nhất nguyên tố & hiển thị thẻ Kanji:
node work/fusion-check.cjs

# Kiểm tra điều hướng toàn bộ UI (Lộ trình, Bàn chơi, Menu, Album):
node work/ui-shell-check.cjs

# Kiểm tra ổn định bố cục đa kích thước màn hình (320px đến 1440px):
node work/mobile-layout-stability-check.cjs
```

---

## 📁 Cấu Trúc Dự Án

```
KanjiPop/
├── AGENTS.md                   # 🤖 Hướng dẫn AI Agent & đặc tả kỹ thuật chi tiết
├── README.md                   # 📖 Tài liệu giới thiệu tổng quan dự án
├── .gitignore                  # Loại trừ screenshots test (~93MB) và logs
│
└── work/
    ├── kanji-pop-site/         # Mã nguồn chính của trò chơi
    │   ├── server.js           # Máy chủ tĩnh Node.js phục vụ port 8765
    │   ├── GAMEPLAY.md         # Toàn bộ lịch sử thiết kế và chi tiết cơ chế game
    │   ├── art-source/         # Tài nguyên đồ họa gốc & prompt sinh hình ảnh
    │   │
    │   └── dist/               # Ứng dụng Web hoàn chỉnh (chạy trực tiếp không cần build)
    │       ├── index.html      # Trang chủ game
    │       ├── n5-game.js      # Bộ điều khiển giao diện & sự kiện người dùng
    │       ├── n5-engine.js    # Logic bàn cờ, solver BFS & cơ chế refill
    │       ├── n5-data.js      # Dữ liệu 24 Kanji N5 và từ vựng
    │       ├── audio-fx.js     # Audio Engine (5 sound profiles + BGM 126 BPM)
    │       ├── fusion-fx.js    # Canvas 2D VFX hiệu ứng hợp nhất nguyên tố
    │       ├── target-vfx.js   # Hào quang mục tiêu 3 lớp bám viền đá quý
    │       ├── gem-art.js      # Đồ họa đá quý (7 dáng cắt x 24 bảng màu)
    │       ├── course-plans.js # 30 lộ trình giải mẫu đã xác thực
    │       ├── progress-store.js # Lưu tiến trình, backup và export/import JSON
    │       ├── audio/          # Bộ tệp âm thanh Foley chất lượng cao
    │       ├── fonts/          # Font tiếng Nhật offline (Noto Sans JP, Nunito)
    │       └── *.css           # Giao diện responsive đa nền tảng
    │
    └── *.cjs                   # Kịch bản kiểm thử tự động Playwright
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Vanilla JavaScript (ES2022+)**: Hiệu năng cao, zero-dependency, zero-build.
- **Web Audio API**: Xử lý âm thanh độ trễ thấp, lọc tần số lowpass, compressor và bộ tổng hợp nốt nhạc.
- **HTML5 Canvas 2D**: Render hiệu ứng hạt, hào quang ma thuật, tia sét, sóng nước đạt 60fps.
- **CSS Grid & Flexbox**: Bố cục đáp ứng mượt mà từ màn hình siêu nhỏ (320px) đến Desktop 4K.
- **Playwright Test Suite**: Đảm bảo chất lượng game tự động qua kiểm thử không giao diện (Headless).
