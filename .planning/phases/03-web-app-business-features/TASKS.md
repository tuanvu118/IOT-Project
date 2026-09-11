# Nhiệm Vụ Triển Khai: Phase 3 — Triển Khai 8 Phân Hệ Nghiệp Vụ Web App & Backend APIs
> **Milestone**: 2 (Simulation & Web Application)  
> **Vai trò phụ trách**: Kỹ sư Frontend Web & Kỹ sư Backend FastAPI

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-301: Module 1 — Luồng Xác Thực (Đăng ký, Đăng nhập JWT, Profile, Avatar, 3 số SOS)
- **Tệp tin**: `frontend/src/pages/auth/`, `frontend/src/pages/user/profile/Profile.jsx`, `backend/app/controller/auth_controller.py`, `backend/app/service/user_service.py`
- **Mô tả**: Đăng nhập/đăng ký nhận JWT token, quản lý hồ sơ cá nhân, upload avatar Cloudinary, form nhập và lưu trữ danh bạ 3 số điện thoại SOS vào Firestore.
- **Tiêu chuẩn nghiệm thu**: Đăng nhập thành công cấp JWT; cập nhật profile và lưu mảng 3 số SOS vào Firestore.

### [ ] TSK-302: Module 2 — Dashboard Trung Tâm (Trạng thái xe, Mức pin, Toggle chống trộm)
- **Tệp tin**: `frontend/src/pages/user/dashboard/Dashboard.jsx`, `backend/app/service/device_service.py`
- **Mô tả**: Hiển thị thẻ tóm tắt trạng thái xe (chạy/dừng/mất kết nối), phần trăm pin, nút gạt bật/tắt chống trộm `anti_thief` đồng bộ thời gian thực với Firestore.
- **Tiêu chuẩn nghiệm thu**: Gạt công tắc chống trộm cập nhật ngay lập tức trường `anti_thief` trong Firestore.

### [ ] TSK-303: Module 3 — Quản Lý Thông Tin Phương Tiện (Hãng xe, Dòng xe, Màu sắc, Biển số)
- **Tệp tin**: `frontend/src/pages/user/vehicle/Vehicle.jsx`, `backend/app/dto/device_dto.py`
- **Mô tả**: Form cập nhật thông tin xe máy gắn liền với thiết bị, hiển thị danh thiếp phương tiện trực quan (Vehicle Card).
- **Tiêu chuẩn nghiệm thu**: Thêm và sửa thông tin xe hiển thị chính xác, lưu đúng vào Firestore.

### [ ] TSK-304: Module 4 — Quản Lý Thiết Bị IoT (Liên kết mã xác thực + PIN, Hủy liên kết)
- **Tệp tin**: `frontend/src/pages/user/device/Device.jsx`, `backend/app/controller/device_controller.py`
- **Mô tả**: Nhập `verification_code` và `secret_code` để liên kết thiết bị với tài khoản người dùng, chức năng hủy liên kết an toàn.
- **Tiêu chuẩn nghiệm thu**: Chỉ cho phép liên kết khi nhập đúng mã xác thực và mã PIN; hủy liên kết thành công.

### [ ] TSK-305: Module 5 — Giám Sát Cảm Biến Viễn Thám Thời Gian Thực
- **Tệp tin**: `frontend/src/pages/user/sensor/SensorData.jsx`, `frontend/src/services/sensorService.js`
- **Mô tả**: Chuyển đổi từ giao diện mock UI sang kết nối API viễn thám thật, vẽ biểu đồ sóng thể hiện gia tốc 3 trục ($a_x, a_y, a_z$) và góc nghiêng thân xe.
- **Tiêu chuẩn nghiệm thu**: Biểu đồ hiển thị liên tục các điểm dữ liệu viễn thám thực tế nhận từ thiết bị.

### [ ] TSK-306: Module 6 — Bản Đồ Số Leaflet Định Vị Xe & Nút Yêu Cầu Vị Trí
- **Tệp tin**: `frontend/src/pages/user/tracking/Tracking.jsx`, `frontend/src/components/map/MapComponent.jsx`
- **Mô tả**: Bản đồ OpenStreetMap hiển thị biểu tượng xe máy theo tọa độ GPS mới nhất, nút bấm "Yêu cầu gửi vị trí tức thời".
- **Tiêu chuẩn nghiệm thu**: Ghim chính xác vị trí xe trên bản đồ, chuyển đổi chế độ xem đường sá/vệ tinh mượt mà.

### [ ] TSK-307: Module 7 — Lịch Sử Sự Cố Tai Nạn (Danh sách sự kiện, Bộ lọc ngày tháng)
- **Tệp tin**: `frontend/src/pages/user/accident/AccidentHistory.jsx`, `backend/app/controller/accident_controller.py`
- **Mô tả**: Danh sách các sự cố va chạm theo trình tự thời gian, bộ lọc tìm kiếm theo khoảng ngày và trạng thái (`CONFIRMED`, `CANCELLED_BY_USER`, `SUPPRESSED_FALSE_ALARM`).
- **Tiêu chuẩn nghiệm thu**: Bảng sự cố hiển thị đúng dữ liệu, bộ lọc hoạt động chính xác.

### [ ] TSK-308: Module 8 — Trung Tâm Thông Báo (Dropdown chuông, Badge đếm tin chưa đọc)
- **Tệp tin**: `frontend/src/components/layout/Header.jsx`, `frontend/src/context/NotificationContext.jsx`, `backend/app/controller/notification_controller.py`
- **Mô tả**: Biểu tượng chuông trên thanh Header hiển thị huy hiệu đếm tin chưa đọc, dropdown xem nhanh, tính năng đánh dấu đã đọc từng tin hoặc tất cả.
- **Tiêu chuẩn nghiệm thu**: Huy hiệu đếm đúng số tin chưa đọc; bấm đánh dấu đọc sẽ cập nhật tức thời trên UI và database.
