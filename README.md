# 🀄 Kanji Pop! — Trò Chơi Xếp Chữ Kanji N5 Tuyển Chọn

> Trò chơi giải đố kết hợp trượt gạch (Sliding Puzzle) và ghép nguyên tố (Elemental Fusion) giúp người học ghi nhớ và làm quen với 24 chữ Hán tự (Kanji) sơ cấp theo lộ trình JLPT N5.

![Bố cục game](work/kanji-pop-site/art-source/round-source.png)

---

## 🌟 Tính Năng Nổi Bật

- **Cơ Chế Trượt Độc Đáo (Sliding Tile & Merge)**:
  - Bàn cờ cố định 17 cặp đá ngọc và 1 ô trống.
  - Tự động thích ứng: **5×7** trên Mobile và **7×5** trên PC/Desktop.
  - Trượt các viên đá cùng màu, cùng dáng lại gần nhau để kích hoạt hợp nhất Kanji.
- **Hiệu Ứng Hình Ảnh & VFX Tinh Xảo**:
  - 8 nguyên tố ma thuật: Hỏa (Fire), Thủy (Water), Băng (Ice), Lôi (Lightning), Mộc (Nature), Vũ trụ (Cosmic Aurora), v.v.
  - Hào quang định hướng (Target Halo) và pháo hoa ăn mừng khi mở chữ mới.
- **Hệ Thống Âm Thanh Chân Thực (Acoustic Audio Engine)**:
  - Tiếng trượt gạch đá êm dịu, thỏa mãn xúc giác (Tactile Tile Slide).
  - Tích hợp bộ chuyển đổi âm thanh (Sound Profile) với 5 phong cách: *Lướt gạch êm*, *Đá quý va chạm trong & sáng*, *Pha lê*, *Đá cờ vây*, *Ngọc bích*.
  - Nhạc nền (BGM) phong cách Japanese Puzzle Pop 126 BPM vui tươi, sôi động.
- **Nội Dung Học Tập N5 Chuẩn Xác**:
  - 15 màn chơi qua 3 chương với 24 chữ Kanji tuyển chọn.
  - Thẻ thông tin (Kanji Reveal Card) đầy đủ: Âm Hán Việt, Nghĩa, Công thức cấu tạo bộ thủ, Từ vựng ví dụ và cách đọc Hiragana.
  - Album lưu trữ chữ đã khám phá, hỗ trợ ôn tập và theo dõi tiến trình.
- **Tiện Ích & Quyền Riêng Tư**:
  - Lưu tiến trình tự động vào `localStorage` kèm công cụ Sao lưu / Khôi phục JSON.
  - Chế độ chơi thử riêng biệt dành cho nghiên cứu (Playtest Session).
  - Hoạt động 100% offline, không gửi dữ liệu ra máy chủ ngoài.

---

## 🚀 Khởi Chạy Cục Bộ (Local Development)

### Yêu cầu
- [Node.js](https://nodejs.org/) (phiên bản 18+ trở lên).

### Khởi động Server
```bash
# Di chuyển vào thư mục game
cd work/kanji-pop-site

# Chạy server cục bộ
node server.js
```
Mở trình duyệt và truy cập: **`http://127.0.0.1:8765/`**

---

## 📁 Cấu Trúc Dự Án

```
KanjiPop/
├── work/
│   ├── kanji-pop-site/
│   │   ├── dist/               # Mã nguồn Web chạy thực tế (HTML, JS, CSS, Audio, Fonts)
│   │   │   ├── index.html      # Giao diện chính của game
│   │   │   ├── n5-game.js      # Bộ điều khiển giao diện, tương tác & hoạt họa
│   │   │   ├── n5-engine.js    # Logic tính toán bàn cờ & nước đi
│   │   │   ├── audio-fx.js     # Audio Engine (SFX đá ngọc, BGM 126 BPM, haptics)
│   │   │   ├── fusion-fx.js    # Hiệu ứng hợp nhất nguyên tố (Canvas VFX)
│   │   │   ├── gem-art.js      # Đồ họa vector các dáng đá quý
│   │   │   ├── audio/          # Bộ tệp âm thanh Foley chất lượng cao
│   │   │   └── ...
│   │   ├── art-source/         # Tài nguyên đồ họa gốc
│   │   ├── server.js           # Máy chủ tĩnh Node.js phục vụ port 8765
│   │   └── GAMEPLAY.md         # Tài liệu thiết kế chi tiết lối chơi
│   ├── fusion-check.cjs        # Bộ kiểm thử tự động Playwright cho VFX & ghép chữ
│   ├── ui-shell-check.cjs      # Bộ kiểm thử điều hướng giao diện (Map, Play, Album)
│   └── mobile-layout-stability-check.cjs # Bộ kiểm thử độ ổn định bố cục đa màn hình
├── .gitignore                  # Cấu hình loại trừ file rác / logs / screenshots
└── README.md                   # Giới thiệu & hướng dẫn dự án
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Vanilla JavaScript (ES2022+)**: Hiệu năng cao, không phụ thuộc framework cồng kềnh.
- **Web Audio API**: Xử lý âm thanh độ trễ thấp, bộ lọc tần số lowpass/highpass và nạp mẫu đa kênh.
- **HTML5 Canvas 2D**: Render hiệu ứng hạt, tia sét, sóng nước, quầng hào quang với 60fps.
- **CSS Grid & Flexbox**: Bố cục đáp ứng mượt mà từ màn hình siêu nhỏ (320px) đến Desktop 4K.
- **Playwright Test Suite**: Đảm bảo chất lượng game tự động qua kiểm thử không giao diện (Headless).
