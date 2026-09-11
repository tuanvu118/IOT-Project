# Nhiệm Vụ Triển Khai: Phase 2 — Xây Dựng Bộ Mô Phỏng Viễn Thám & Chuẩn Hóa Nền Tảng Web
> **Milestone**: 2 (Simulation & Web Application)  
> **Vai trò phụ trách**: Kỹ sư QA / Mô Phỏng & Kỹ sư Frontend Web

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-201: Viết script Python `tools/device_simulator.py` phát gói viễn thám qua HTTP
- **Tệp tin bàn giao**: `tools/device_simulator.py`
- **Mô tả**: Xây dựng công cụ dòng lệnh Python độc lập giả lập thiết bị IoT, đóng gói dữ liệu JSON Telemetry Contract chứa mảng mẫu IMU 6 trục và GPS gửi định kỳ 50Hz tới Backend.
- **Tiêu chuẩn nghiệm thu**: Script chạy độc lập, phát gói tin JSON 50Hz đúng định dạng với timestamp thực.

### [ ] TSK-202: Tích hợp 6 kịch bản viễn thám thực tế vào Simulator
- **Tệp tin bàn giao**: `tools/scenarios/` (normal_driving, speed_bump, hard_braking, crash_fall, theft, offline)
- **Mô tả**: Tạo các bộ dữ liệu kịch bản mô phỏng chuyển động thực tế của xe máy, hỗ trợ tham số CLI `--scenario <tên_kịch_bản>` và `--device-id`.
- **Tiêu chuẩn nghiệm thu**: Simulator chuyển đổi linh hoạt giữa các kịch bản, phát đúng dữ liệu mẫu mô phỏng.

### [ ] TSK-203: Dọn dẹp triệt để các ghi chú và cấu hình tàn dư Flutter/Mobile
- **Tệp tin bàn giao**: `frontend/`, `README.md`, `package.json`
- **Mô tả**: Rà soát toàn bộ dự án, gỡ bỏ các thư mục, file cấu hình hoặc ghi chú liên quan đến ứng dụng Flutter, Android, iOS.
- **Tiêu chuẩn nghiệm thu**: Không còn bất kỳ tham chiếu hay tệp tin tàn dư nào của ứng dụng di động Flutter.

### [ ] TSK-204: Hoàn thiện nội dung 6 tệp tin rỗng 0-byte trong `frontend/src/`
- **Tệp tin bàn giao**:
  - `frontend/src/services/accidentService.js`
  - `frontend/src/services/sensorService.js`
  - `frontend/src/hooks/useDevice.js`
  - `frontend/src/hooks/useNotifications.js`
  - `frontend/src/hooks/useVehicle.js`
  - `frontend/src/context/NotificationContext.jsx`
- **Mô tả**: Bổ sung đầy đủ cấu trúc export hàm gọi API và custom hooks React chuẩn, xử lý state và try/catch.
- **Tiêu chuẩn nghiệm thu**: Cả 6 tệp tin đều có nội dung hợp lệ, không gây lỗi import hay crash ứng dụng khi build.

### [ ] TSK-205: Chuẩn hóa Vite reverse proxy (`/api/v1`) và kiểm tra Docker Compose
- **Tệp tin bàn giao**: `frontend/vite.config.js`, `docker-compose.yml`
- **Mô tả**: Cấu hình proxy chuyển tiếp request `/api/v1` sang backend `localhost:8000`, kiểm tra kết nối mạng giữa các container trong Docker.
- **Tiêu chuẩn nghiệm thu**: Lệnh `docker compose up --build` khởi chạy thành công cả Web App (`localhost:5173`) và Backend API (`localhost:8000`).
