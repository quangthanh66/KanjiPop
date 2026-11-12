---
name: game-ui-design
description: Chuyên môn thiết kế kiến trúc giao diện Game Web & Mobile (Game UI/UX Architecture) cho game giải đố casual/puzzle phong cách Nhật Bản. Xử lý cân bằng thị giác, phân bổ trọng lượng bố cục, thiết kế HUD/World Map, và tương thích mọi kích thước màn hình không cần cuộn trang.
---

# Game UI & Casual Puzzle Screen Architecture

## 1. Nguyên Tắc Cân Bằng Trọng Lượng Thị Giác (Visual Weight Balance)

### Chống Lỗi "Hai Hộp Lạc Lõng" (The Two-Box Orphan Anti-Pattern)
* **Vấn đề**: Đặt 2 khối chữ nhật (Card) độc lập trôi nổi giữa một màn hình nền phẳng lớn tạo cảm giác như form nhập liệu quản trị web app, hoàn toàn mất chất game.
* **Quy chuẩn Game UI**:
  1. **Hợp nhất thành một Thể Thống Nhất (Unified Master Console / Game Cabinet)**: Thay vì tách làm 2 card rời rạc tạo khe nứt ở giữa, hãy gom vào một khung bệ điều khiển duy nhất (Master Stage) với viền kính 3D thủy tinh và phân khu trực quan bằng vách ngăn mờ (frosted divider).
  2. **Cân bằng mật độ thông tin (Information Density)**: Nếu bên trái có chữ và lưới 8 thẻ, thì bên phải (bản đồ chòm sao) không được để trống hoác. Chòm sao phải có kích thước node đủ lớn, đường mòn phát sáng uốn lượn hình chữ S chiếm trọn không gian, kèm hiệu ứng mây bồng bềnh và bệ đá quý đổ bóng nổi.

## 2. Phân Cấp HUD & Điều Hướng (Top Navigation & HUD Hierarchy)

* **Nguyên tắc gom nhóm chức năng**:
  - **Nhóm Nhận diện & Tiến trình (Trái)**: Logo Kanjidle + Chỉ báo Hành trình (`HÀNH TRÌNH N5 · CHƯƠNG 1`).
  - **Nhóm Chế độ chơi (Giữa)**: Bộ chuyển đổi cấp độ (`JLPT N5 | JLPT N4 | 📅 Thử thách hôm nay`).
  - **Nhóm Tiện ích & Hồ sơ (Phải)**: Chuyển ngôn ngữ (`EN/VI`), Âm thanh (`Bật/Tắt`), Thư viện (`Album 0/24`), và Menu (`...`).
* **Không chia nhỏ thành 2 tầng rời rạc**: Toàn bộ thanh điều hướng phía trên phải có cùng độ rộng `max-width` với khung sân khấu chính, tạo thành một trục thẳng hàng hoàn hảo.

## 3. Bản Đồ Chòm Sao (Constellation & World Map Design)

* **Tỷ lệ Node đá quý**:
  - Desktop: Kích thước node từ 64px đến 74px, bệ ngọc nổi 3D, hiệu ứng ánh kim (specular facet highlight), vương miện cho màn Kho báu.
  - Mobile: Kích thước node từ 48px đến 54px.
* **Đường dẫn uốn lượn sinh động**:
  - Tránh vẽ đường thẳng chéo khô khan. Sử dụng đường cong Bezier mềm mại hình chữ S kết nối các node.
  - Node mục tiêu (Màn tiếp theo) phải có hào quang 3 lớp phát xung (3-layer pulsating aura) và nút bấm *"▶ Chơi"* nổi bật ngay bên dưới.

## 4. Bố Cục Thích Ứng Không Cuộn Trang (Zero-Scroll 100dvh Rule)

* Màn hình chính của trò chơi là một **Dashboard tĩnh**, người chơi phải quan sát được toàn bộ tình trạng màn chơi chỉ trong một cái liếc mắt mà **không bao giờ phải cuộn trang**:
  - `height: 100dvh; max-height: 100dvh; overflow: hidden;`
  - Đảm bảo khoảng cách an toàn (safety buffer $\ge 24\text{px}$) giữa các phần tử tương tác đáy và thanh điều hướng (`.course-nav`).
  - WCAG Touch Target: Các nút bấm chính trên di động luôn đảm bảo $\ge 44\times 44\text{px}$.
