# 🤖 AI Agent Local Pointer — Kanji Pop!

Tài liệu hướng dẫn và đặc tả toàn diện cho AI Agent hiện được đặt tại tệp gốc của dự án:
👉 **[`../../AGENTS.md`](../../AGENTS.md)**

### Tóm tắt nhanh khi làm việc trong thư mục này:
- **Thư mục phục vụ Web**: `dist/` (chứa toàn bộ HTML, JS, CSS, Audio, Fonts chạy trực tiếp trên browser, không qua build).
- **Máy chủ cục bộ**: Chạy `node server.js` từ thư mục này (hoặc `node work/kanji-pop-site/server.js` từ thư mục gốc).
- **Cổng kết nối**: `http://127.0.0.1:8765/`.
- **Quy tắc quan trọng**: Bàn cờ Mobile 5×7 $\leftrightarrow$ Desktop 7×5; 100% offline-first; không thêm bundler/build tool; duy trì 5 sound profiles trong `dist/audio-fx.js`.

Chi tiết kiến trúc, các quy tắc bất biến và hướng dẫn kiểm thử vui lòng xem tại **[`../../AGENTS.md`](../../AGENTS.md)**.
