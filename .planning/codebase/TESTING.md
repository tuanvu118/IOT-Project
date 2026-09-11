# Testing Setup, Current Status & Strategy

## 1. Hiện Trạng Kiểm Thử (Current Status)
- **Backend**: Hiện tại chưa có thư mục `tests/` hoặc test suite tự động nào cho các controller, service và repository. Các tương tác trước đây chủ yếu dựa vào việc kiểm thử thủ công qua Swagger UI (`/docs`).
- **Frontend**: Chưa có file test nào được viết bằng Vitest hay React Testing Library. Kiểm thử chủ yếu bằng giao diện trực quan trên trình duyệt (Visual Testing).
- **Phần cứng IoT**: Chưa có mã nguồn firmware trong kho git; giao thức viễn thám chưa có công cụ kiểm thử tự động.

## 2. Chiến Lược Kiểm Thử Chuẩn Hóa Theo Roadmap
Dự án được quy hoạch chiến lược kiểm thử đa tầng để đảm bảo độ tin cậy tuyệt đối:

### Tầng 1: Unit Testing (Kiểm Thử Đơn Vị)
- **Backend Logic**: Sử dụng `pytest` kiểm thử tính toán góc nghiêng $\theta$, logic làm mượt xác suất (exponential moving average / sliding window debounce), kiểm thử Pydantic DTO validation.
- **AI Inference Engine**: Kiểm tra `ai_service.py` nạp đúng file `model.onnx`, truyền ma trận $100 \times 6$ nhận về xác suất trong $[0.0, 1.0]$ với thời gian $< 50\text{ ms}$.

### Tầng 1b: Firmware & Hardware Testing (Kiểm Thử Phần Cứng & Mã Nguồn Nhúng)
- **Kiểm tra phần cứng bo mạch (HIL Test)**: Đo kiểm bus I2C MPU6050 (địa chỉ `0x68`), kiểm tra phân tách bản tin NMEA GPS NEO-7M qua UART2.
- **Kiểm tra truyền thông NB-IoT**: Kiểm thử tập lệnh AT commands modem SIM7020C (`AT+CSQ`, `AT+CGATT=1`), đo kiểm dòng tiêu thụ.
- **Kiểm tra lưu trữ ngoại tuyến**: Giả lập mất sóng mạng, xác nhận gói viễn thám lưu vào Flash SPIFFS và tự động gửi bù khi có mạng trở lại.

### Tầng 2: Integration Testing (Kiểm Thử Tích Hợp)
- **API Flow**: Sử dụng `httpx.AsyncClient` kiểm thử thông luồng các API:
  - Đăng ký $\rightarrow$ Đăng nhập $\rightarrow$ Nhận JWT Token.
  - Gán thiết bị vào tài khoản $\rightarrow$ Bật/tắt chế độ chống trộm.
  - Gửi gói viễn thám `POST /api/v1/devices/{id}/telemetry` $\rightarrow$ Xác nhận Firestore tạo document trong `accident-logs` và `user-notifications`.

### Tầng 3: Hardware Simulation & E2E Testing (Kiểm Thử Giả Lập & Toàn Trình)
- **Bộ mô phỏng `tools/device_simulator.py`**: Giả lập ESP32 phát các gói tin chuẩn NMEA GPS và mẫu cảm biến IMU 50Hz.
- **Kịch bản kiểm thử E2E (`tests/e2e/test_e2e_pipeline.py`)**:
  - Kịch bản 1: Tai nạn ngã xe thật (Impact lớn + Xe đổ nghiêng $\ge 60^\circ$ + dừng hẳn).
  - Kịch bản 2: Gờ giảm tốc / Ổ gà (Xung giật ngắn + Xe thẳng $< 25^\circ$ + tiếp tục chạy) $\rightarrow$ Xác nhận triệt tiêu báo động giả.
  - Kịch bản 3: Phanh gấp khẩn cấp (Hãm tốc mạnh + Xe thẳng đứng).
  - Kịch bản 4: Dắt trộm xe (Phát hiện rung lắc / di chuyển khi `anti_thief == true`).

### Tầng 4: Đo Lường Độ Trễ Toàn Trình (Latency Benchmark)
- Đo đạc chặng truyền tải từ client/simulator $\rightarrow$ backend $\rightarrow$ suy luận AI $\rightarrow$ Firestore $\rightarrow$ Web App hiển thị cảnh báo (Mục tiêu: $< 500\text{ ms}$).
