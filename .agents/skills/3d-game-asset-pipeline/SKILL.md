---
name: 3d-game-asset-pipeline
description: Quy trình chuẩn hóa thiết kế, sinh ảnh, trích xuất và tối ưu hóa tài nguyên đồ họa 3D (3D Game Asset & UI Pipeline) cho game Web & Mobile. Định hình phong cách Stylized 3D (Claymorphism, Isometric Diorama, Candy & Crystal), xử lý ánh sáng PBR/Subsurface Scattering, trích xuất Alpha trong suốt không răng cưa và tích hợp Responsive Zero-Scroll.
---

# 3D Game Asset & UI Pipeline

Tài liệu hướng dẫn và quy chuẩn kỹ thuật cho AI Agent thiết kế và triển khai toàn bộ tài nguyên đồ họa 3D trong game giải đố casual/puzzle (dựa trên các chuẩn `gamedev-skills` và `agentic-awesome-skills` hàng đầu trên GitHub).

---

## 1. 🎨 Ngôn Ngữ Thị Giác 3D (Visual Aesthetics Standard)

1. **Phong cách nghệ thuật (Art Direction)**:
   - **Stylized 3D Casual / Claymorphism / Toy-box Diorama**: Không dùng 2D viền đen sketch. Tất cả vật thể phải có độ dày khối, đổ bóng mềm (ambient occlusion), ánh sáng hội tụ (rim lighting), và độ bóng bề mặt (specular gloss).
   - **Chất liệu đặc trưng**:
     - *Đá quý (Gemstones)*: Tinh thể 3D trong suốt, khúc xạ ánh sáng (refraction), giác cắt đa diện sắc nét, tán sắc ánh kim.
     - *Nút bấm & Bệ đỡ (Nodes & Pedestals)*: Dạng kẹo dẻo/nhựa bóng cao cấp (glossy candy/resin) đặt trên bệ vàng/bạc/bánh quy 3D bo góc tròn trịa.
     - *Thẻ chữ Hán (Kanji Tiles)*: Đất sét pastel nung mịn (matte pastel clay) hoặc gốm sứ bo góc (ceramic squircle), dập nổi hoặc in chìm sắc nét.
     - *Môi trường (Clouds & Islands)*: Mây bông 3D mềm xốp (marshmallow volumetric clouds), đảo bay dạng mô hình tiểu cảnh diorama (floating grassy island diorama).

2. **Quy tắc phối cảnh (Perspective Consistency)**:
   - Tất cả các vật thể tương tác và trang trí phải dùng chung một góc nhìn **Isometric / Low-angle Orthographic (30°–45°)**.
   - Nguồn sáng chính thống nhất: Chiếu từ góc trên-trái (Top-Left Sunlight ~10:30) tạo vệt bóng đổ tự nhiên sang góc dưới-phải.

---

## 2. ✂️ Trích Xuất Asset Độc Lập Không Răng Cưa (Alpha Precision Extraction)

Khi trích xuất sprite 3D từ spritesheet hoặc canvas nguồn sang file WebP trong suốt:

1. **Phát hiện cụm chính xác (Connected Component / Contour Detection)**:
   - TUYỆT ĐỐI KHÔNG dùng khung tọa độ chia đều giả định (`[c * colW, ...]`).
   - Quét thuật toán BFS / Flood-fill tìm biên ngoài thực tế của từng cụm điểm ảnh không phải màu nền (`r < 238 || g < 238 || b < 238`).
   - Thêm viền an toàn (safety padding $\ge 4\text{px}$) bao bọc trọn vẹn mọi chi tiết nhô ra ngoài (góc cạnh đá quý, cánh hoa, ánh sao).

2. **Khử viền trắng & Khử răng cưa (De-fringing & Alpha Feathering)**:
   - Đối với pixel biên giới giữa vật thể và nền trắng:
     - Tính độ sáng `lum = (r + g + b) / 3`.
     - Nếu `lum > 210` (vệt sáng trắng của nền), làm suy giảm alpha mềm `Math.max(0, 1 - (lum - 195) / 55) * 0.55` để loại bỏ vệt hào quang trắng (white halo).
   - Duy trì độ phân giải gốc 1x, xuất sang định dạng `image/webp` với chất lượng $\ge 0.94$.

3. **Kiểm tra biên giới (Border Clipping Validation Invariant)**:
   - Mọi asset xuất xưởng phải thỏa mãn điều kiện kiểm thử:
     `topClip === 0 && bottomClip === 0 && leftClip === 0 && rightClip === 0`.
   - Không một pixel không-trong-suốt nào được chạm vào mép ngoài cùng của canvas cắt.

---

## 3. 📐 Tích Hợp Vào Bố Cục Responsive (Responsive UI Integration)

1. **Nền Gradient CSS/SVG thay vì Bitmap**:
   - Bầu trời và đường dẫn chính dùng vector thuần (CSS `linear-gradient` / SVG) để giữ độ sắc nét vô cực ở màn hình 2K/4K/8K mà không bị nặng dung lượng mạng hay vỡ pixel.
2. **Neo tọa độ theo tỷ lệ phần trăm (Percentage Anchoring)**:
   - Các bệ nút màn chơi `01..05` neo theo phần trăm cố định trên con đường uốn lượn.
   - Các asset trang trí (đá quý, đám mây, đảo nổi) được định vị bằng lớp nổi `.anime-sky-decors` có `pointer-events: none` và chuyển động trôi nhẹ `animeFloatSlow`.
3. **Quy tắc bảo vệ vùng an toàn (Safe Area Zero-Scroll)**:
   - Giữ khoảng cách $\ge 24\text{px}$ giữa khay chữ Kanji/nút điều hướng đáy và các nút màn chơi, đảm bảo hiển thị trọn vẹn trong `100dvh` trên mọi màn hình.
