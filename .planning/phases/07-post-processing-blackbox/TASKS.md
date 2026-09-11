# Nhiệm Vụ Triển Khai: Phase 7 — Hậu Kiểm Chống Báo Giả & Lưu Trữ Hộp Đen Firestore
> **Milestone**: 4 (Integration & Full System Acceptance)  
> **Vai trò phụ trách**: Kỹ sư Backend FastAPI & Kỹ sư Cơ Sở Dữ Liệu

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-701: Triển khai thuật toán hậu kiểm góc nghiêng ngã xe & dừng xe
- **Tệp tin bàn giao**: `backend/app/service/device_service.py`
- **Mô tả**: Khi AI dự đoán $P(\text{ACCIDENT}) \ge P_{threshold}$, kích hoạt cờ nghi vấn và kiểm tra dữ liệu 1.5s kế tiếp:
  1. *Kiểm tra góc nghiêng (Tilt Check)*: $\theta = \arccos\left(\frac{a_z}{\sqrt{a_x^2 + a_y^2 + a_z^2}}\right)$. Nếu $\theta \ge 60^\circ$ (xe ngã đổ) $\rightarrow$ Thỏa mãn.
  2. *Kiểm tra vận tốc (Speed Check)*: $v_{GPS} \approx 0$ $\rightarrow$ Thỏa mãn.
  3. *Trường hợp gờ giảm tốc / ổ gà*: Xe vẫn dựng thẳng ($\theta < 25^\circ$) và tiếp tục chạy $\rightarrow$ Triệt tiêu cảnh báo (`SUPPRESSED_FALSE_ALARM`).
- **Tiêu chuẩn nghiệm thu**: Phân biệt chính xác giữa va chạm ngã xe thật và tình huống xóc nảy gờ giảm tốc/ổ gà.

### [ ] TSK-702: Triển khai cơ chế làm mượt xác suất theo thời gian (Temporal Debounce)
- **Tệp tin bàn giao**: `backend/app/service/device_service.py`
- **Mô tả**: Áp dụng bộ lọc trung bình động hàm mũ (EMA) hoặc yêu cầu ít nhất 2 cửa sổ trượt liên tiếp vượt ngưỡng $P_{threshold}$ trước khi kích hoạt cảnh báo, loại trừ hoàn toàn các xung đơn lẻ do nhiễu cảm biến.
- **Tiêu chuẩn nghiệm thu**: Triệt tiêu các xung kích tức thời giả mạo, chỉ kích hoạt khi có chuỗi tín hiệu bất thường kéo dài.

### [ ] TSK-703: Thiết kế Entity & DTO cho collection hộp đen `accident-logs`
- **Tệp tin bàn giao**: `backend/app/entity/accident_log.py`, `backend/app/dto/accident_dto.py`
- **Mô tả**: Thiết lập schema cho collection `accident-logs`: ID sự cố, mã thiết bị, timestamp, trạng thái (`CONFIRMED`, `CANCELLED_BY_USER`, `SUPPRESSED_FALSE_ALARM`), tọa độ GPS, chỉ số AI ($P$, gia tốc đỉnh, góc nghiêng, vận tốc trước va chạm), và mảng 100 mẫu cảm biến thô làm hộp đen.
- **Tiêu chuẩn nghiệm thu**: Document được khởi tạo đầy đủ các trường thông tin trong Firestore.

### [ ] TSK-704: Xử lý lưu vết sự kiện & Tự động sinh thông báo khẩn cấp
- **Tệp tin bàn giao**: `backend/app/service/notification_service.py`, `backend/app/service/device_service.py`
- **Mô tả**: Khi sự cố đạt trạng thái `CONFIRMED`, tự động tạo bản ghi trong `accident-logs` và đồng thời tạo document thông báo loại `ACCIDENT` trong `user-notifications` gắn khóa ngoại `accident_log_id`.
- **Tiêu chuẩn nghiệm thu**: Tạo thành công bản ghi hộp đen và thông báo khẩn cấp tương ứng cho người dùng trong cơ sở dữ liệu.
