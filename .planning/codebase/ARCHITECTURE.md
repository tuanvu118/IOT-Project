# System Architecture & Component Interactions

## 1. Kiến Trúc Tổng Thể (High-Level Architecture)

Hệ thống An toàn Xe máy Thông minh (SmartBike) được tổ chức theo mô hình kiến trúc phân tầng hiện đại (Layered Microservice-ready Architecture):

```
┌────────────────────────────────────────────────────────┐
│               IoT Edge Device / Simulator              │
│  - ESP32 MCU + MPU6050 (100Hz) + NEO-7M GPS + SIM7020C │
│  - Or `tools/device_simulator.py`                      │
└───────────────────────────┬────────────────────────────┘
                            │ NB-IoT / HTTP Telemetry JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Backend Services (FastAPI)             │
│  ├── API Gateway / Controllers (REST Endpoints)        │
│  ├── Services & Repositories Layer                     │
│  ├── AI Inference Engine (ONNX Runtime, < 50ms)        │
│  └── Post-processing Verification (Tilt & Consensus)   │
└──────────────┬──────────────────────────┬──────────────┘
               │                          │
               │ SDK                      │ REST / Long Polling
               ▼                          ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│ Google Cloud Firestore  │    │  Unified Web Application│
│ - users, devices        │    │  - React 19 + Vite (SPA)│
│ - user-notifications    │    │  - Responsive & PWA     │
│ - accident-logs         │    │  - Realtime Alert Modal │
│ - system-config         │    │  - Admin AI Config Panel│
└─────────────────────────┘    └─────────────────────────┘
```

## 2. Kiến Trúc Luồng Dữ Liệu Phát Hiện Tai Nạn Bằng AI

Quy trình phát hiện tai nạn từ cảm biến đến cảnh báo trải qua 5 bước nghiêm ngặt:

1. **Thu thập dữ liệu quán tính (IMU Acquisition)**:
   - Cảm biến MPU6050 đo gia tốc 3 trục ($a_x, a_y, a_z$) và vận tốc góc 3 trục ($\omega_x, \omega_y, \omega_z$).
   - Thiết bị đóng gói mảng cửa sổ trượt (Sliding Window 1.0s - 2.0s tương ứng 50 - 100 mẫu) gửi qua `POST /api/v1/devices/{id}/telemetry`.

2. **Tiền xử lý & Suy luận AI (Preprocessing & Inference)**:
   - Module `ai_service.py` chuẩn hóa tín hiệu bằng `StandardScaler`.
   - Nạp vào mô hình AI đóng gói định dạng ONNX thực thi trên CPU với độ trễ $< 50\text{ ms}$.
   - Mô hình xuất ra xác suất tai nạn: $P(\text{ACCIDENT}) \in [0.0, 1.0]$.

3. **Hậu kiểm trạng thái xe chống báo động giả (Post-crash Verification)**:
   - Nếu $P(\text{ACCIDENT}) \ge P_{threshold}$: Hệ thống đưa vào trạng thái "Nghi vấn va chạm".
   - Kiểm tra dữ liệu kế tiếp:
     - Góc nghiêng thân xe $\theta \ge 60^\circ$ (xe ngã đổ ngang mặt đường).
     - Vận tốc GPS $v \approx 0$ (xe dừng hẳn).
   - Nếu xe vẫn thẳng đứng ($\theta < 25^\circ$) và tiếp tục di chuyển (gờ giảm tốc / ổ gà): Hệ thống tự động triệt tiêu cảnh báo (`SUPPRESSED_FALSE_ALARM`).

4. **Lưu trữ hộp đen & Tạo cảnh báo (Blackbox & Notification)**:
   - Ghi nhận document đầy đủ vào `accident-logs` (lưu cả 100 mẫu cảm biến thô lúc xảy ra sự cố).
   - Tạo thông báo mới trong `user-notifications` loại `ACCIDENT`.

5. **Giao diện Cảnh báo Khẩn cấp trên Web App (Emergency Modal)**:
   - Web App tự động bật modal khẩn cấp viền đỏ nhấp nháy, phát còi hú và đếm ngược 30 giây.
   - Cho phép người dùng bấm **"Tôi an toàn / Hủy cảnh báo"** nếu là sự cố nhẹ; hết 30s tự động chuyển sang chế độ gọi cứu hộ khẩn cấp SOS.

## 3. Cấu Trúc Backend (FastAPI Layered Pattern)
- **Controller Layer (`backend/app/controller/`)**: Định nghĩa endpoints, nhận DTO, xác thực quyền và ủy thác cho Service.
- **Service Layer (`backend/app/service/`)**: Thực thi logic nghiệp vụ (tính toán, hậu kiểm, mã hóa token, gọi Cloud Firestore, gọi AI engine).
- **Repository Layer (`backend/app/repository/`)**: Tương tác trực tiếp với SDK Google Cloud Firestore.
- **Entity & DTO Layer (`backend/app/entity/`, `backend/app/dto/`)**: Định nghĩa cấu trúc dữ liệu lưu trữ và mô hình xác thực dữ liệu API qua Pydantic.

## 4. Kiến Trúc Phần Mềm Nhúng (ESP32 Firmware Architecture)
Mã nguồn nhúng trên ESP32 được tổ chức theo mô hình FreeRTOS đa nhiệm hướng sự kiện:
- **Core 1 (Task Ưu Tiên Cao - IMU Sampling)**: Đọc thanh ghi I2C cảm biến MPU6050 chu kỳ 10ms (100Hz), kích hoạt bộ lọc DLPF phần cứng để lọc rung lắc động cơ, đẩy các mẫu ($a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$) vào bộ đệm vòng (Ring Buffer).
- **Core 0 (Task NMEA Parser & Telemetry Dispatcher)**:
  - Phân tích luồng ký tự UART2 từ mô-đun GPS NEO-7M (chu kỳ 1s), trích xuất tọa độ GPS và vận tốc mặt đất $v_{GPS}$.
  - Đóng gói mảng mẫu IMU và GPS thành chuỗi JSON Telemetry Contract theo chu kỳ 20ms (50Hz).
  - Điều khiển modem SIM7020C qua tập lệnh AT Command gửi HTTP POST tới endpoint `/api/v1/devices/{id}/telemetry`.
- **Cơ Chế Phục Hồi Lỗi & Ngoại Tuyến**:
  - Watchdog Timer phần cứng (WDT 10s) chống treo hệ thống.
  - Bộ đệm vòng trên bộ nhớ Flash SPIFFS lưu trữ tối đa 200 gói tin viễn thám khi mất sóng mạng NB-IoT và tự động gửi bù (Store-and-forward) khi kết nối lại thành công.

