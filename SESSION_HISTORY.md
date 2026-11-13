# 📜 LỊCH SỬ PHÁT TRIỂN & TIẾN ĐỘ DỰ ÁN KANJI POP (KANJIDLE)
> **Cập nhật ngày:** 13/11/2026  
> **Repository:** https://github.com/quangthanh66/KanjiPop  
> **Nhánh chính:** `main`

---

## 🎯 1. TỔNG QUAN TIẾN ĐỘ HIỆN TẠI
- **Trạng thái:** Toàn bộ giao diện chính (Main Hub / Level Selection) đã được **thiết kế lại hoàn toàn** bằng bộ asset game chuyên nghiệp **Gems Game Free GUI** (tác giả CraftPix.net trên OpenGameArt).
- **Nguyên tắc cốt lõi đã hoàn thành:**
  1. **Toàn bộ UI trang chính:** Sử dụng 100% theme Gems Game (bầu trời mây pastel rực rỡ, logo bảng treo `GEMS GAME`, bảng chọn màn 15 level dạng vòm treo, hệ thống ngôi sao, mũi tên chuyển chương, và thanh dock điều khiển bo tròn).
  2. **Bảo toàn Game Field (Bàn cờ ghép chữ 7×5):** Bàn cờ puzzle, hệ thống đá quý 3D, cơ chế ghép Kanji (Hán tự), lượt đi, combo và các hiệu ứng thưởng âm thanh/hình ảnh được bảo lưu nguyên bản 100%, kết nối mượt mà khi bấm Play.
  3. **Tương thích hoàn hảo (100dvh, Zero-scroll, Không xén ảnh):** Đã kiểm định tự động bằng Playwright trên cả Desktop ($1440 \times 900$) và Mobile ($390 \times 844$, $360 \times 800$), mọi nút bấm, ruy-băng và icon đều nằm trọn vẹn trong màn hình, không có bất kỳ thành phần nào bị cắt xén hay tràn viền.

---

## 🔄 2. CHI TIẾT CÁC GIAI ĐOẠN & YÊU CẦU CỦA NGƯỜI DÙNG (USER REQUESTS LOG)

### Giai đoạn 1: Đánh giá ban đầu & Tinh chỉnh thẩm mỹ
- **Yêu cầu:** Giao diện cần gây ấn tượng mạnh ngay từ cái nhìn đầu tiên; loại bỏ các asset trang trí không ăn nhập với chủ đề (như cá chép, daruma).
- **Thực hiện:** Đã loại bỏ các linh vật daruma, cá chép cũ; đề xuất các phong cách hiện đại hơn kết hợp yếu tố đá quý (Gem) và hòn đảo nổi trên mây (Floating Islands).

### Giai đoạn 2: Hiện thực 3 Concept UI để người dùng chọn
- **Yêu cầu:** Triển khai trực quan cả 3 phương án để người dùng so sánh trực tiếp.
- **Thực hiện:** Xây dựng 3 file preview độc lập:
  - `preview_theme1_crystal_mountain.html`: Vương quốc pha lê & đỉnh núi rực rỡ.
  - `preview_theme2_alchemy_observatory.html`: Đài thiên văn giả kim thuật huyền bí.
  - `preview_theme3_starlight_ribbon.html`: Dải ruy băng sao lung linh.

### Giai đoạn 3: Chọn phương án 1 & Điều chỉnh kích thước Asset
- **Yêu cầu:** Chọn phương án 1, bổ sung các asset kích thước lớn hơn và loại bỏ các asset tái sử dụng bị vỡ nét.
- **Thực hiện:** Tạo mới các hòn đảo đá quý 3D nổi và cụm pha lê độ phân giải cao; chuẩn hóa kích thước responsive.

### Giai đoạn 4: Nghiên cứu phong cách Bejeweled (PopCap) & Candy Crush (King)
- **Yêu cầu:** Tìm kiếm các bộ asset & VFX miễn phí tương đồng với Bejeweled của PopCap và Candy Crush Saga.
- **Thực hiện:** Tìm kiếm và chọn lọc tài nguyên từ OpenGameArt và Kenney.nl:
  - *Kenney Particle Pack*: Hơn 80 hiệu ứng hạt nổ, vầng sáng, tia sao.
  - *Rotating 3D Jewels*: Các khối đá quý đa giác sáng bóng 3D.
  - Loại bỏ các đường link cũ bị hỏng hoặc hết hạn.

### Giai đoạn 5: Đột phá giao diện với Gems Game Free GUI (OpenGameArt)
- **Yêu cầu người dùng:**  
  > *"Thử dùng Gems Game Free GUI (OpenGameArt), thiết kế lại toàn bộ UI, ko giữ lại gì hết, ngoại trừ game field."*
  - Nguồn asset: `https://opengameart.org/content/gems-free-gui` (CraftPix.net)
- **Thực hiện:**
  1. Tải và giải nén toàn bộ gói `Gems-Free-GUI_1.zip` vào thư mục `work/kanji-pop-site/dist/gems_gui/`.
  2. Dùng thư viện `sharp` để trích xuất từng sprite trong suốt chất lượng cao vào `work/kanji-pop-site/dist/gems_gui_assets/`:
     - `gui_bg.png`: Nền trời mây pastel rực rỡ với tia nắng tỏa rộng.
     - `logo_title.png`: Bảng tên 3D `GEMS GAME` viền tím lấp lánh sao vàng.
     - `btn_play_pink.png`: Nút Play tròn lớn màu hồng bóng bẩy, nổi khối 3D.
     - `btn_home.png`, `btn_gamepad.png`, `btn_trophy.png`, `btn_gear.png`, `btn_help.png`: Bộ nút chức năng màu tím viền trắng đồng bộ.
     - `btn_sound_round.png`, `btn_music_round.png`: Nút toggle âm thanh và nhạc nền.
     - `arrow_left.png`, `arrow_right.png`: Mũi tên hồng chuyển chương.
     - `star_gold.png`, `star_gray.png`: Sao vàng và sao xám đánh giá thành tích.
  3. Viết stylesheet chuyên biệt `work/kanji-pop-site/dist/gems-gui.css` thay thế toàn bộ UI bản đồ cũ:
     - Ẩn header và navigation cũ khi ở màn hình chính.
     - Xây dựng **Top HUD**: Cụm âm thanh bên trái, Logo `GEMS GAME` + pill `JLPT N5 · ★ 0/45` ở giữa, Cài đặt & Cúp bên phải.
     - Xây dựng **Hanging Level Card**: Khung tím treo nơ trắng, banner đỏ hồng 3D `CHƯƠNG 01 · CHỌN MÀN`, chứa lưới 15 màn (3×5) tương ứng chính xác 15 màn N5 của game. Màn đang chọn có viền sáng vàng hào quang, màn khóa có biểu tượng ổ khóa, bên dưới mỗi màn có khay 3 ngôi sao.
     - Xây dựng **Bottom Action Dock**: Dock 4 nút (Home đổi JLPT, Gamepad chơi Daily, Cúp xem Album, và Nút Play hồng lớn hiệu ứng thở sinh động).
  4. Cập nhật `work/kanji-pop-site/dist/n5-game.js`:
     - Tích hợp HTML mới vào hàm `renderMap()`.
     - Bắt sự kiện click chuyển chương, chọn màn, đổi cấp độ N5/N4, bật/tắt âm thanh, mở modal hướng dẫn/album, và nút Play để vào bàn cờ.
     - Giữ nguyên 100% logic của `view === 'play'` (game field).

### Giai đoạn 6: Khắc phục triệt để lỗi xén ảnh & tràn viền (Zero-Clipping)
- **Yêu cầu người dùng:**  
  > *"Đảm bảo ko có bất cứ thành phần nào bị xén như trong ảnh"*
- **Nguyên nhân & Xử lý:**
  1. **Lỗi xén viền sprite:** Logo và một số nút bấm cũ bị crop sát viền trong sprite sheet, dẫn đến pixel chạm mép hoặc dính mảnh sprite bên cạnh.
     - *Khắc phục:* Viết script phân tích bounding box và trích xuất lại trực tiếp từ `transparent png/all.png` và `transparent png/main.png`, mở rộng đệm alpha trong suốt 4 phía (padding 6–8px). Kiểm tra tự động xác nhận 100% asset có `0 pixel chạm viền`.
  2. **Lỗi xén mũi tên trên Mobile (390px):** Do thẻ chọn màn cũ dùng chiều rộng cố định khiến tổng bề ngang vượt quá 390px, đẩy mũi tên phải văng ra ngoài mép màn hình.
     - *Khắc phục:* Chuyển `.gui-stage-center` sang mô hình flexbox co giãn: mũi tên có chiều rộng linh hoạt `clamp(24px, 3.2vw, 44px)` với khoảng đệm an toàn, thẻ chọn màn tím tự động co giãn (`flex: 1; min-width: 0`) vừa khít giữa 2 mũi tên, không bao giờ bị tràn.
  3. **Lỗi ngắt dòng chữ trên Ribbon:** Chữ `CHƯƠNG 01 · CHỌN MÀN CHƠI` bị rớt chữ `CHƠI` xuống hàng thứ 2 trên màn hình hẹp.
     - *Khắc phục:* Đổi thành `CHƯƠNG 01 · CHỌN MÀN` với `white-space: nowrap !important;` và `font-size: clamp(10.5px, 1.5vw, 16px);`.
  4. **Lỗi đứt đoạn dây treo giả:** Loại bỏ 2 đường kẻ trắng giả lập dây treo bị đứt đoạn giữa không trung.

---

## 📂 3. CẤU TRÚC TỆP TIN CHÍNH (KEY FILES)

| Tệp tin | Vị trí | Mô tả |
| :--- | :--- | :--- |
| **Gems GUI CSS** | `work/kanji-pop-site/dist/gems-gui.css` | Toàn bộ CSS phong cách Gems Game Free GUI, tối ưu 100dvh, zero-scroll, responsive mọi màn hình |
| **Game Logic** | `work/kanji-pop-site/dist/n5-game.js` | Quản lý state, `renderMap()` với Gems GUI Hub, chuyển đổi giữa Map và Game Field, xử lý trượt ghép |
| **Entry Point** | `work/kanji-pop-site/dist/index.html` | Trang chủ HTML nạp các stylesheet và script của ứng dụng |
| **Gems Assets** | `work/kanji-pop-site/dist/gems_gui_assets/` | Chứa các file ảnh PNG đã được tối ưu, cắt nét không viền (logo, nút bấm, sao, mũi tên, nền) |
| **Original GUI Pack** | `work/kanji-pop-site/dist/gems_gui/` | Toàn bộ tài nguyên gốc của CraftPix (OpenGameArt) để tham khảo hoặc mở rộng sau này |
| **Preview Standalone** | `work/kanji-pop-site/dist/preview_gems_free_gui.html` | Trang chạy thử độc lập giao diện Gems GUI |

---

## 🚀 4. HƯỚNG DẪN CHẠY & KIỂM TRA MÃ NGUỒN TRÊN MÁY KHÁC

### 1. Kéo mã nguồn mới nhất:
```bash
git pull origin main
```

### 2. Khởi động server phát triển:
Tại thư mục gốc của repository, chạy một trong các lệnh sau:
- **Dùng Python (phổ biến nhất):**
  ```bash
  python -m http.server 8765 -d work/kanji-pop-site/dist
  ```
- **Hoặc dùng Node `npx serve`:**
  ```bash
  npx serve work/kanji-pop-site/dist -p 8765
  ```

### 3. Trải nghiệm trên trình duyệt:
- Mở URL: `http://localhost:8765/` (hoặc `http://127.0.0.1:8765/`).
- **Màn hình chính:** Giao diện chọn màn treo phong cách Gems Game với 15 màn chơi.
- **Thao tác:**
  - Bấm nút **Play (màu hồng)** hoặc click đúp vào Màn 1 để vào ngay bàn cờ ghép chữ.
  - Bấm mũi tên trái/phải để chuyển đổi các chương học.
  - Bấm nút **Loa/Nhạc** để bật tắt âm thanh.
  - Bấm nút **Home** để đổi giữa JLPT N5 và JLPT N4.
  - Bấm nút **Gamepad** để chơi câu đố hàng ngày (Daily Puzzle).
  - Bấm nút **Cúp** để mở bộ sưu tập 24 thẻ chữ Kanji đã thu thập.
- **Kiểm tra Responsive:**
  - Nhấn `F12` mở DevTools, chọn chế độ xem Mobile (iPhone 14 / Pixel / Galaxy) hoặc kéo giãn cửa sổ: Mọi thành phần co giãn mượt mà, không xuất hiện thanh cuộn ngang/dọc, không bị cắt xén bất cứ chi tiết nào.
