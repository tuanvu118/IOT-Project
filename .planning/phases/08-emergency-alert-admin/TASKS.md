# Nhiệm Vụ Triển Khai: Phase 8 — Cảnh Báo Khẩn Cấp 30s, Chi Tiết Tai Nạn & Quản Trị AI
> **Milestone**: 4 (Integration & Full System Acceptance)  
> **Vai trò phụ trách**: Kỹ sư Frontend Web & Kỹ sư Backend FastAPI

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-801: Xây dựng modal cảnh báo khẩn cấp toàn màn hình viền đỏ & còi hú
- **Tệp tin bàn giao**: `frontend/src/components/layout/AlertPopup.jsx`
- **Mô tả**: Khi có thông báo loại `ACCIDENT`, tự động bật modal khẩn cấp chiếm toàn màn hình với nền đỏ đậm nhấp nháy (pulse animation) và phát âm thanh còi hú qua Web Audio API Oscillator.
- **Tiêu chuẩn nghiệm thu**: Modal bật tức thời khi nhận sự kiện tai nạn, âm thanh còi hú phát ổn định trên trình duyệt.

### [ ] TSK-802: Tích hợp bộ đếm lùi 30 giây trực quan & Nút "Tôi an toàn / Hủy báo động"
- **Tệp tin bàn giao**: `frontend/src/components/layout/AlertPopup.jsx`, `frontend/src/services/accidentService.js`
- **Mô tả**: Hiển thị đồng hồ đếm lùi từ 30s về 0. Bấm nút "Tôi an toàn" gửi request `PUT /api/v1/accidents/{id}/cancel`, tắt còi và dừng gửi SOS. Hết 30s không bấm tự động chuyển trạng thái `SOS_DISPATCHED`.
- **Tiêu chuẩn nghiệm thu**: Bộ đếm lùi hoạt động mượt mà từng giây; bấm nút hủy thành công, tắt âm thanh ngay lập tức.

### [ ] TSK-803: Xây dựng API tiếp nhận hủy cảnh báo `PUT /api/v1/accidents/{id}/cancel`
- **Tệp tin bàn giao**: `backend/app/controller/accident_controller.py`, `backend/app/service/accident_service.py`
- **Mô tả**: API tiếp nhận yêu cầu hủy báo động từ người dùng, cập nhật trạng thái sự cố trong collection `accident-logs` thành `CANCELLED_BY_USER`.
- **Tiêu chuẩn nghiệm thu**: Trạng thái document trong Firestore được cập nhật chính xác thành `CANCELLED_BY_USER`.

### [ ] TSK-804: Nâng cấp trang Chi tiết tai nạn (Bản đồ phóng to, Thẻ chỉ số AI)
- **Tệp tin bàn giao**: `frontend/src/pages/user/accident/AccidentDetail.jsx`
- **Mô tả**: Hiển thị bản đồ Leaflet phóng to vị trí va chạm, hiển thị các thẻ chỉ số AI: Xác suất tin cậy $P(\text{ACCIDENT})$, gia tốc đỉnh ($g$), góc nghiêng khi ngã ($\theta$), vận tốc trước va chạm.
- **Tiêu chuẩn nghiệm thu**: Tọa độ và các tham số phân tích AI hiển thị trực quan, đầy đủ.

### [ ] TSK-805: Tích hợp biểu đồ sóng SVG trực quan hóa mảng mẫu cảm biến thô hộp đen
- **Tệp tin bàn giao**: `frontend/src/pages/user/accident/AccidentDetail.jsx`
- **Mô tả**: Component vẽ biểu đồ sóng SVG biểu diễn 3 trục gia tốc ($a_x$: Đỏ, $a_y$: Xanh lá, $a_z$: Xanh dương) từ mảng 100 mẫu cảm biến thô lưu trong hộp đen, có vạch chỉ thị đỉnh va chạm.
- **Tiêu chuẩn nghiệm thu**: Biểu đồ sóng kết xuất mượt mà, trực quan hóa rõ ràng thời điểm va chạm đỉnh.

### [ ] TSK-806: Nâng cấp trang Quản trị viên: Bảng cấu hình động tham số AI
- **Tệp tin bàn giao**: `frontend/src/pages/admin/settings/AdminSettings.jsx`, `backend/app/controller/admin_controller.py`
- **Mô tả**: Thay thế trường nhập ngưỡng G-force tĩnh cũ bằng giao diện cấu hình tham số AI động: Thanh trượt tinh chỉnh ngưỡng $P_{threshold}$ ($0.50 - 0.95$), thời gian đếm lùi cảnh báo (giây), và xem phiên bản mô hình AI.
- **Tiêu chuẩn nghiệm thu**: Admin thay đổi $P_{threshold}$ trên Web, Backend lưu vào Firestore và áp dụng ngay lập tức mà không cần khởi động lại máy chủ.
