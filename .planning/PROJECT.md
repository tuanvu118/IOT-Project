# Hệ Thống An Toàn Xe Máy IoT (SmartBike)

## 1. Tổng Quan Dự Án
**Hệ thống An toàn Xe máy IoT (SmartBike)** là một nền tảng công nghệ toàn diện kết hợp giữa thiết bị nhúng IoT, hệ thống máy chủ Backend và ứng dụng Web Application hiện đại. Mục tiêu cốt lõi của hệ thống là bảo vệ an toàn cho người điều khiển phương tiện xe máy tại Việt Nam thông qua:
- **Theo dõi vị trí và lộ trình xe máy theo thời gian thực** trên bản đồ số.
- **Phát hiện và cảnh báo mất trộm** khi xe có dấu hiệu rung lắc hoặc di chuyển trái phép trong trạng thái kích hoạt chống trộm.
- **Phát hiện tai nạn thông minh bằng mô hình Trí tuệ Nhân tạo (AI Model)**: Thay thế hoàn toàn thuật toán ngưỡng cố định (`crashDetAlgo` / $cTHRD$) bằng mô hình AI phân loại chuỗi dữ liệu cảm biến quán tính IMU thời gian thực.
- **Cảnh báo đa kênh tức thời**: Hiển thị cảnh báo trực quan trên Web App, cơ chế đếm ngược chống báo động giả, và kích hoạt liên hệ danh bạ khẩn cấp (SOS).
- **Loại bỏ hoàn toàn ứng dụng di động Flutter**: Toàn bộ chức năng giám sát, điều khiển và quản trị được hợp nhất trên một nền tảng **Web Application duy nhất (Responsive / PWA)** hoạt động đồng nhất trên cả thiết bị di động và máy tính để bàn.

---

## 2. Đối Tượng Người Dùng & Vai Trò (Personas & Roles)

### 2.1. Chủ phương tiện xe máy (End User)
- Đăng ký và đăng nhập tài khoản an toàn thông qua JWT.
- Quản lý hồ sơ cá nhân và danh sách số điện thoại liên hệ khẩn cấp (SOS numbers).
- Liên kết tài khoản với thiết bị IoT gắn trên xe máy thông qua mã thiết bị (`verification_code`) và mã PIN bảo mật (`secret_code`).
- Cập nhật thông tin nhận diện phương tiện (hãng xe, dòng xe, màu sắc, biển số xe).
- Theo dõi vị trí xe trực tiếp trên bản đồ số (Leaflet / OpenStreetMap).
- Bật/tắt chế độ chống trộm (`anti_thief`) từ xa qua Web App.
- Giám sát trạng thái hoạt động của thiết bị (trực tuyến/ngoại tuyến, pin, kết nối).
- Nhận cảnh báo tai nạn và cảnh báo trộm tức thì trên Web App; sử dụng cơ chế đếm ngược để xác nhận hoặc hủy cảnh báo khi có va quẹt nhẹ/báo động giả.
- Xem lại lịch sử các sự kiện tai nạn, thông số phân tích của mô hình AI, và lịch sử lộ trình di chuyển.

### 2.2. Người liên hệ khẩn cấp (SOS Contact)
- Tiếp nhận thông tin cảnh báo khẩn cấp khi người lái xe gặp tai nạn và không thể phản hồi sau thời gian đếm ngược.

### 2.3. Quản trị viên hệ thống (System Administrator)
- Truy cập bảng điều khiển quản trị tập trung (Admin Dashboard).
- Khởi tạo và cấp phát thiết bị IoT mới vào hệ thống cùng mã xác thực.
- Quản lý danh sách người dùng, kích hoạt hoặc khóa tài khoản vi phạm.
- Quản trị và giám sát các tham số vận hành của mô hình AI (ngưỡng quyết định $P_{threshold}$, thời gian kiểm tra trạng thái xe sau va chạm).
- Giám sát sức khỏe tổng thể và nhật ký viễn thám (telemetry logs) của hệ thống.

---

## 3. Kiến Trúc & Công Nghệ Nền Tảng (Technical Baseline)

- **Phần cứng IoT (Hardware)**: NodeMCU ESP32 (38 chân, 2 lõi Tensilica Xtensa 32-bit @ 240MHz), cảm biến quán tính 6 trục MPU6050 (I2C GPIO 32/33), mô-đun định vị GPS U-blox NEO-7M (UART2 GPIO 22/23), mô-đun truyền thông SIM7020C NB-IoT (UART GPIO 2/4), còi báo động qua transistor C1815 (GPIO 14), cầu phân áp pin $10\text{k}\Omega / 2\text{k}\Omega$ nối vào GPIO 35 (ADC đo pin 2S 18650 7.4V - 8.4V).
- **Phần mềm nhúng (Firmware)**: FreeRTOS đa nhiệm chạy trên ESP32 (PlatformIO / Arduino Framework). Task đọc IMU chu kỳ 10ms (100Hz) với bộ đệm vòng (Ring Buffer), Task đọc NMEA GPS, Task điều khiển modem SIM7020C gửi HTTP POST telemetry 50Hz, cơ chế Watchdog Timer và bộ nhớ đệm Flash SPIFFS lưu ngoại tuyến khi mất sóng mạng.
- **Bộ mô phỏng thiết bị (Simulator)**: Công cụ `tools/device_simulator.py` giả lập 6 kịch bản viễn thám thực tế phục vụ kiểm thử song song.
- **Hệ thống Backend**: FastAPI (Python 3.11), máy chủ ASGI Uvicorn, Pydantic v2 chuẩn hóa DTO, phân quyền RBAC (`USER`/`ADMIN`).
- **Phân hệ Trí tuệ Nhân tạo (AI Engine)**: Pipeline khoa học gồm Preprocessing, Sliding Window (1-2s gối đầu 50%), Benchmark các mô hình ứng viên (Tree-based vs Deep Learning), tối ưu hóa $P_{threshold}$ và đóng gói mô hình sang định dạng ONNX (`onnxruntime` trên CPU máy chủ với độ trễ $< 50\text{ms}$).
- **Cơ sở dữ liệu**: Google Cloud Firestore (NoSQL) lưu trữ dữ liệu người dùng (`users`), thiết bị (`devices`), thông báo (`user-notifications`), cấu hình hệ thống (`system-config`) và hộp đen cảm biến thô (`accident-logs`).
- **Lưu trữ đa phương tiện**: Cloudinary SDK phục vụ lưu trữ và tối ưu hóa ảnh đại diện người dùng.
- **Giao diện người dùng (Frontend)**: Web Application duy nhất xây dựng trên React 19, Vite, React Router v7, Leaflet / React-Leaflet, tối ưu hóa giao diện đa kích thước (Responsive Web) và hỗ trợ Progressive Web App (PWA).
- **Hạ tầng triển khai (DevOps)**: Đóng gói Docker và Docker Compose đa container, khởi chạy trơn tru toàn bộ hệ thống bằng một lệnh duy nhất: `docker compose up --build`.

---

## 4. Lộ Trình Triển Khai Chuẩn Hóa (4 Milestones & 9 Phases)
- **Milestone 1: Embedded Hardware & Firmware** (Phase 1: Nghiên cứu Phần cứng IoT & Phát triển Firmware ESP32)
- **Milestone 2: Simulation & Web Application** (Phase 2: Bộ Mô Phỏng Viễn Thám & Chuẩn Hóa Nền Tảng Web, Phase 3: 8 Phân Hệ Nghiệp Vụ Web App & Backend APIs)
- **Milestone 3: AI Core Research** (Phase 4: Khảo Sát Dataset, EDA & Pipeline Tiền Xử Lý IMU, Phase 5: Benchmark Đa Mô Hình, Tuyển Chọn & Tối Ưu Hóa Ngưỡng $P_{threshold}$)
- **Milestone 4: Integration & Full System Acceptance** (Phase 6: Tích Hợp AI ONNX Vào Backend, Phase 7: Hậu Kiểm Chống Báo Giả & Hộp Đen, Phase 8: Cảnh Báo Khẩn Cấp 30s & Quản Trị AI, Phase 9: Kiểm Thử Toàn Trình E2E & Nghiệm Thu).
