# Technical Debt, Concerns & Risk Management

## 1. Nợ Kỹ Thuật Trong Mã Nguồn Hiện Tại (Existing Technical Debt)

### 1.1. Sáu (06) Tệp Tin Frontend Đang Rỗng 0-Byte
- Trong `frontend/src/`:
  - `services/accidentService.js` (0 byte)
  - `services/sensorService.js` (0 byte)
  - `hooks/useDevice.js` (0 byte)
  - `hooks/useNotifications.js` (0 byte)
  - `hooks/useVehicle.js` (0 byte)
  - `context/NotificationContext.jsx` (0 byte)
- **Tác động**: Khi các component nghiệp vụ gọi tới các hook hoặc service này sẽ gây lỗi runtime (Import/Execution Error).
- **Giải pháp xử lý**: Đã được đưa vào nhiệm vụ ưu tiên của **Phase 2: Chuẩn Hóa Nền Tảng Web & Bộ Mô Phỏng**.

### 1.2. Thiếu Mã Nguồn Firmware ESP32 Trong Repository
- Luận văn tốt nghiệp có đầy đủ sơ đồ mạch điện, bảng chân kết nối ESP32, MPU6050, SIM7020C, NEO-7M GPS, nhưng trong thư mục mã nguồn git hiện chưa có thư mục mã nguồn firmware `.ino`/ESP-IDF.
- **Tác động**: Không thể nạp code ngay cho phần cứng nếu thiếu file code nạp.
- **Giải pháp xử lý**:
  - Xây dựng hoàn chỉnh mã nguồn Firmware FreeRTOS đa nhiệm trong **Phase 1** (`firmware/smartbike_esp32/`) bao gồm I2C MPU6050 100Hz, NMEA GPS UART2, SIM7020C AT commands, WDT và bộ nhớ đệm Flash SPIFFS lưu ngoại tuyến.
  - Đồng thời xây dựng bộ mô phỏng phần cứng viễn thám `tools/device_simulator.py` (**Phase 2**) để nhóm Web và AI kiểm thử độc lập mà không bị nghẽn phụ thuộc vào phần cứng vật lý.

### 1.3. Cấu Trúc Endpoint Viễn Thám Cũ Còn Sơ Khai
- Hiện tại Backend chỉ có endpoint `POST /devices/{id}/locations` nhận duy nhất 2 trường `latitude` và `longitude`.
- Chưa có cấu trúc nhận gói dữ liệu cảm biến đa chiều quán tính 6 trục (IMU).
- **Giải pháp xử lý**: Đã được quy hoạch trong **Phase 6** với endpoint `POST /api/v1/devices/{id}/telemetry`.

## 2. Rủi Ro Nghiệp Vụ & Kiến Trúc (Architectural Risks)

### 2.1. Rủi Ro Báo Động Giả Do Mặt Đường Xấu
- **Vấn đề**: Xe máy di chuyển tại Việt Nam thường xuyên gặp ổ gà sâu, gờ giảm tốc cao hoặc phanh gấp; các tình huống này tạo ra xung gia tốc tức thời rất lớn có thể đánh lừa mô hình nếu chỉ nhìn vào 1 đỉnh gia tốc đơn lẻ.
- **Giải pháp xử lý**:
  - Không dựa vào 1 mẫu đơn lẻ: Sử dụng cơ chế cửa sổ trượt (Sliding Window 1.0s - 2.0s gối đầu 50%) để nắm bắt toàn bộ hình thái xung lực (**Phase 4**).
  - Triển khai bộ lọc hậu kiểm trạng thái xe: Kiểm tra góc nghiêng xe ngã đổ ($\theta \ge 60^\circ$) và vận tốc dừng ($v \approx 0$) trong 1.5s kế tiếp để triệt tiêu báo động giả (**Phase 7**).
  - Tích hợp bộ đếm ngược 30 giây kèm nút "Tôi an toàn" trên Web App cho phép người dùng tự hủy báo động nếu chỉ là va quẹt nhẹ (**Phase 8**).

### 2.2. Rủi Ro Độ Trễ Mạng & Suy Luận
- **Vấn đề**: Việc truyền dữ liệu qua mạng di động NB-IoT và suy luận mô hình Deep Learning nặng có thể gây chậm trễ việc gửi thông báo cứu hộ.
- **Giải pháp xử lý**:
  - Đóng gói mô hình sang định dạng ONNX Runtime tối ưu cho CPU máy chủ (thời gian suy luận $< 50\text{ ms}$) (**Phase 5 & 6**).
  - Sử dụng cơ chế nạp sẵn mô hình (Pre-load InferenceSession) ngay khi khởi động FastAPI `lifespan`.
  - Tổng độ trễ toàn trình (E2E Latency) được đo kiểm khắt khe với mục tiêu $< 500\text{ ms}$ (**Phase 9**).
