# BÁO CÁO TOÀN DIỆN: SYSTEM AUDIT & TRACEABILITY HỆ THỐNG
## Dự Án: Hệ Thống An Toàn Xe Máy IoT (SmartBike)
**Ngày thực hiện**: 2026-09-11  
**Vai trò**: Technical Project Manager / System Architect  
**Trạng thái**: Đã phê duyệt (Approved by User)

---

# PHẦN 1 — SYSTEM INVENTORY (KIỂM KÊ HỆ THỐNG THỰC TẾ)

### A. IoT HARDWARE / FIRMWARE WORKSTREAM
- **MCU**: NodeMCU ESP32 (32-bit dual-core Xtensa @ 240MHz, 4MB Flash, Wi-Fi & Bluetooth, UART0/UART2).
- **Cảm biến quán tính (IMU)**: MPU6050 6 trục (Gia tốc 3 trục $a_x, a_y, a_z$ và Vận tốc góc 3 trục $\omega_x, \omega_y, \omega_z$), giao tiếp I2C qua chân D32 (SDA), D33 (SCL).
- **Mô-đun GPS**: GY-NEO 7M (U-blox), giao tiếp UART2 qua chân D22 (RX), D23 (TX), phân tách bản tin NMEA `$GPRMC` lấy tọa độ và vận tốc tức thời $v_{GPS}$.
- **Mô-đun truyền thông di động**: SIM 7020C / SIM7000 Series (NB-IoT/4G) giao tiếp UART chân D2, D4 với tập lệnh AT.
- **Nguồn nuôi (Power)**: 2 cell pin 18650 mắc nối tiếp (6.4V - 8.4V), mạch hạ áp LM2596 (5V/3A) và AMS1117 (3.3V), cầu phân áp $10\text{k}\Omega / 2\text{k}\Omega$ đưa vào ADC đo dung lượng pin.
- **Cảnh báo phần cứng**: Còi chíp 5V điều khiển qua transistor C1815, đèn LED trạng thái.
- **Tần số lấy mẫu (Sampling rate)**: Chu kỳ đọc cảm biến IMU là 10ms (100Hz).
- **Giao thức truyền thông**: 
  - Đề tài gốc: MQTT Broker qua EMQX Cloud.
  - Mã nguồn hiện tại: RESTful API qua HTTP (`POST /api/v1/devices/{id}/locations`).
  - Hướng phát triển: Bổ sung API tiếp nhận gói viễn thám đa chiều `POST /devices/{id}/telemetry` và bộ mô phỏng phần cứng (Hardware Simulator).
- **Thuật toán tai nạn cũ**: `crashDetAlgo` với ngưỡng $cTHRD = 48$ ($\approx 3.0g$) $\rightarrow$ **Hủy bỏ hoàn toàn để thay bằng mô hình AI tại Backend**.

### B. BACKEND WORKSTREAM
- **Framework**: FastAPI $\ge 0.115.0$, Python 3.11-slim, Uvicorn ASGI Server.
- **Bảo mật & Xác thực**: JWT Bearer Token, băm mật khẩu PBKDF2 (120.000 vòng), phân quyền RBAC (`get_current_user`, `require_admin`).
- **Nghiệp vụ Thiết bị & Phương tiện**: CRUD thiết bị, liên kết qua mã xác thực và mã PIN, cập nhật thông tin xe, bật/tắt chống trộm `anti_thief`.
- **Phân hệ AI Engine (Cần bổ sung)**: Thư viện `onnxruntime`, module `ai_service.py` thực hiện suy luận trên CPU với độ trễ $< 50\text{ ms}$.
- **Hậu kiểm trạng thái (Cần bổ sung)**: Logic kiểm tra góc nghiêng ngã xe ($\ge 60^\circ$) và dừng xe ($v \approx 0$), làm mượt xác suất theo thời gian.

### C. DATABASE / STORAGE WORKSTREAM
- **Cơ sở dữ liệu**: Google Cloud Firestore (NoSQL Document Store).
- **Collection `users`**: Thông tin người dùng, mật khẩu băm, quyền admin, mảng 3 số SOS khẩn cấp (`sosNumbers`).
- **Collection `devices`**: Thông tin thiết bị, mã xác thực, mã PIN bí mật, cấu hình chống trộm nhúng, thông tin xe nhúng, tọa độ GPS nhúng.
- **Collection `user-notifications`**: Danh sách thông báo khẩn cấp, loại thông báo, trạng thái đã đọc.
- **Collection `accident-logs` (Tạo mới)**: Hộp đen lưu vết toàn bộ bản chụp 50-100 mẫu cảm biến thô, xác suất $P(\text{ACCIDENT})$, góc nghiêng, vận tốc trước va chạm.
- **Media Cloud**: Cloudinary SDK lưu trữ ảnh đại diện người dùng.

### D. AI / MACHINE LEARNING WORKSTREAM
- **Quy trình chuẩn tắc**: Dataset $\rightarrow$ EDA $\rightarrow$ Preprocessing $\rightarrow$ Baseline $\rightarrow$ Candidate Models $\rightarrow$ Benchmark & Evaluation $\rightarrow$ Model Selection $\rightarrow$ Deployment.
- **Tiền xử lý & Cửa sổ trượt**: Sliding Window 1.0s - 2.0s (overlap 50%), chuẩn hóa `StandardScaler`.
- **Mô hình ứng viên**: Đánh giá công bằng nhóm Tree-based (LightGBM, XGBoost) và nhóm Deep Learning (1D-CNN, GRU/LSTM). Không chọn trước model.
- **Ngưỡng quyết định $P_{threshold}$**: Là decision threshold trên xác suất $P(\text{ACCIDENT})$, tối ưu hóa từ đường cong PR-Curve thực tế.
- **Đóng gói**: Xuất model sang định dạng ONNX (`model.onnx`).

### E. WEB APPLICATION WORKSTREAM (NỀN TẢNG DUY NHẤT)
- Loại bỏ hoàn toàn Flutter di động; Web App (React 19 + Vite + PWA) là giao diện duy nhất chạy trên mọi thiết bị.
- Bao phủ đầy đủ 14 phân hệ:
  1. Authentication (Đăng ký, đăng nhập JWT).
  2. Quản lý Profile & danh bạ 3 số SOS.
  3. Dashboard trung tâm (Thẻ xe, trạng thái pin, toggle chống trộm).
  4. Quản lý Phương tiện (Hãng xe, model, biển số).
  5. Quản lý Thiết bị IoT (Liên kết mã xác thực & PIN, hủy liên kết).
  6. Bản đồ số & Định vị trực tiếp (Leaflet Map, ping vị trí).
  7. Giám sát Cảm biến (Biểu đồ sóng gia tốc & góc nghiêng).
  8. Lịch sử Tai nạn (Danh sách sự kiện, bộ lọc).
  9. Chi tiết Sự cố Tai nạn (Thông số AI, biểu đồ hộp đen).
  10. Hệ thống Thông báo (Dropdown chuông, badge chưa đọc).
  11. Cảnh báo Khẩn cấp Toàn màn hình & Bộ đếm ngược 30s tắt báo giả.
  12. Quản trị viên (Admin Dashboard: quản lý user, device).
  13. Cài đặt AI (Admin Settings: cấu hình $P_{threshold}$).
  14. Responsive Web & PWA (Adaptive routing, service worker).

### F. DEPLOYMENT & TESTING WORKSTREAM
- **Docker Compose**: Sẵn sàng chạy 1 lệnh `docker compose up --build`.
- **Testing**: Bổ sung Unit Test (Backend/Frontend), Hardware Simulator (`simulate_device_telemetry.py`), và E2E System Test.

---

# PHẦN 2 — BẢNG MA TRẬN TRUY XUẤT (TRACEABILITY MATRIX)

| Yêu Cầu Cốt Lõi Trong Đề Tài | Phân Hệ Tương Ứng | Tệp Tin Hiện Hữu | Trạng Thái | Thay Đổi Bắt Buộc | Phase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Thu thập IMU 6 trục (MPU6050 100Hz) | IoT Hardware & Firmware | Chưa có mã nguồn trong repo | **MISSING** | Xây dựng Firmware FreeRTOS đa nhiệm ESP32 | **Phase 1** |
| Thu thập GPS (NEO-7M) & Pin ADC | IoT Hardware & Firmware | Chưa có mã nguồn trong repo | **MISSING** | Parser NMEA UART2 & Đo ADC pin GPIO 35 | **Phase 1** |
| Mô phỏng luồng viễn thám thiết bị | Device Simulator | Chưa có công cụ giả lập | **MISSING** | Xây dựng script `device_simulator.py` 6 kịch bản | **Phase 2** |
| Nền tảng Web App & Sửa 6 file rỗng| Web App (React 19) | 6 tệp rỗng 0-byte trong `frontend/`| **PARTIAL** | Hoàn thiện services, hooks, context, Vite proxy | **Phase 2** |
| 8 Module nghiệp vụ Web App & APIs | Web App & Backend | Các trang user, dashboard, map | **EXISTING (PARTIAL)** | Hoàn thiện Auth 3 SOS, Dashboard, Xe, Thiết bị, Map | **Phase 3** |
| Khảo sát dữ liệu & EDA phổ va chạm | AI Research | Chưa có thư mục dữ liệu | **MISSING** | Thu thập dataset, EDA phổ FFT, sliding window | **Phase 4** |
| Đa mô hình & Benchmark P_threshold | AI Research | Chưa có pipeline huấn luyện | **MISSING** | Huấn luyện Tree vs Deep Learning, xuất `model.onnx`| **Phase 5** |
| Tích hợp ONNX & API Telemetry | Backend FastAPI | `device_controller.py` | **MUST MODIFY** | Nhúng `onnxruntime`, tạo API `/telemetry` đa chiều | **Phase 6** |
| Hậu kiểm xe ngã & Hộp đen Firestore | Backend & Database | Chưa có logic hậu kiểm | **NEW** | Hậu kiểm $\theta \ge 60^\circ, v \approx 0$, tạo `accident-logs` | **Phase 7** |
| Cảnh báo đỏ 30s & Quản trị AI | Web App & Backend | `AlertPopup.jsx`, `AdminSettings` | **MUST MODIFY** | Modal khẩn cấp 30s "Tôi an toàn", chỉnh $P_{threshold}$| **Phase 8** |
| Kiểm thử toàn trình E2E & Đo độ trễ | Testing & Deployment | Chưa có test suite | **MISSING** | Kịch bản E2E pytest 4 tình huống, latency < 500ms | **Phase 9** |

---

# PHẦN 3 — BẢNG PHÂN LOẠI KHOẢNG TRỐNG (GAP CLASSIFICATION)

1. **Đã hoàn thành**: Khung FastAPI, JWT auth, RBAC, kết nối Firestore, upload Cloudinary, khung React 19 Vite, Docker Compose live reload.
2. **Đang có nhưng cần sửa**:
   - 6 tệp tin rỗng 0-byte trong frontend (`accidentService.js`, `sensorService.js`, `useDevice.js`, `useNotifications.js`, `useVehicle.js`, `NotificationContext.jsx`).
   - Màn hình `SensorData.jsx` chuyển từ mock sang dữ liệu viễn thám thật.
   - Màn hình `AdminSettings.jsx` chuyển từ ngưỡng G-force tĩnh sang tham số AI động ($P_{threshold}$).
   - Endpoint viễn thám mở rộng tiếp nhận mảng 50-100 mẫu IMU 6 trục và GPS.
3. **Chưa có (Khoảng trống lớn)**:
   - **Mã nguồn Firmware ESP32 vật lý** (đọc I2C MPU6050, NMEA GPS, AT commands SIM7020C, WDT, bộ đệm Flash SPIFFS).
   - Bộ mô phỏng viễn thám `tools/device_simulator.py`.
   - Toàn bộ phân hệ nghiên cứu AI (Dataset, EDA, Preprocessing, Benchmark, Tuyển chọn, ONNX Export).
   - Collection hộp đen `accident-logs` lưu 100 mẫu cảm biến thô.
   - Modal cảnh báo khẩn cấp toàn màn hình có còi hú và bộ đếm ngược 30 giây ("Tôi an toàn").
   - Bộ kiểm thử tự động toàn trình (Unit, API, E2E test suite) và công cụ đo kiểm độ trễ.
4. **Cần xóa**: Toàn bộ tài liệu/ràng buộc về Flutter Mobile App; thuật toán cứng `crashDetAlgo` và tham số tĩnh $cTHRD$.
