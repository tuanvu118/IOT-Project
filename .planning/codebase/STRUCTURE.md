# Codebase Directory Structure & File Organization

```
d:\IOT\IOT-Project\
├── .planning/                              # Toàn bộ tài liệu quy hoạch, kiến trúc & kế hoạch
│   ├── codebase/                           # Tài liệu khảo sát mã nguồn (Codebase Map)
│   │   ├── STACK.md                        # Công nghệ & thư viện phụ thuộc
│   │   ├── INTEGRATIONS.md                 # Dịch vụ tích hợp bên ngoài
│   │   ├── ARCHITECTURE.md                 # Kiến trúc tổng thể & luồng dữ liệu
│   │   ├── STRUCTURE.md                    # Cấu trúc thư mục & phân bổ tệp tin
│   │   ├── CONVENTIONS.md                  # Quy ước lập trình & đặt tên
│   │   ├── TESTING.md                      # Thực trạng & chiến lược kiểm thử
│   │   └── CONCERNS.md                     # Nợ kỹ thuật & các rủi ro cần xử lý
│   ├── onboarding/
│   │   └── SUMMARY.md                      # Báo cáo tóm lược Onboarding & bước đi tiếp theo
│   ├── MASTER_IMPLEMENTATION_PLAN.md       # Kế hoạch tổng thể toàn dự án (4 Milestones & 9 Phases)
│   ├── SYSTEM_AUDIT_REPORT.md              # Báo cáo kiểm toán & đối chiếu hệ thống
│   ├── PROJECT.md                          # Tổng quan dự án & nhân khẩu học người dùng
│   ├── REQUIREMENTS.md                     # Đặc tả yêu cầu chức năng & phi chức năng
│   ├── ROADMAP.md                          # Lộ trình 4 Milestones & 9 Phases (Source of Truth)
│   └── STATE.md                            # Bộ nhớ dự án & các quyết định kiến trúc đã khóa
│
├── docs/                                   # Tài liệu kỹ thuật phần cứng & đồ án
│   └── hardware_schematic.md               # Sơ đồ mạch điện, kết nối pinout ESP32, MPU6050, GPS, SIM7020C
│
├── firmware/                               # [Mới theo Phase 1] Mã nguồn nhúng ESP32 vật lý
│   └── smartbike_esp32/                    # Dự án PlatformIO / Arduino Framework
│       ├── platformio.ini                  # Cấu hình biên dịch & nạp board ESP32
│       ├── include/config.h                # Khai báo chân GPIO, baudrate, server URL
│       ├── src/
│       │   ├── main.cpp                    # Khởi tạo FreeRTOS đa nhiệm & tasks
│       │   ├── mpu6050_driver.cpp          # Driver I2C đọc cảm biến IMU 6 trục 100Hz
│       │   ├── gps_parser.cpp              # Parser UART2 phân tích NMEA GPS
│       │   ├── nbiot_client.cpp            # Điều khiển SIM7020C qua AT commands
│       │   ├── offline_buffer.cpp          # Bộ nhớ đệm Flash SPIFFS lưu ngoại tuyến
│       │   └── power_manager.cpp           # Đo ADC pin 18650 qua GPIO 35
│       └── tests/test_hardware.cpp         # Kiểm thử phần cứng HIL Test
│
├── backend/                                # Phân hệ Backend FastAPI
│   ├── app/
│   │   ├── ai/                             # [Mới theo Roadmap] Mô hình ONNX & preprocessor
│   │   ├── controller/                     # REST API Controllers (auth, user, device, notif, accident)
│   │   ├── service/                        # Business Services (auth, user, device, notif, ai, accident)
│   │   ├── repository/                     # Data Access Layer giao tiếp Firestore
│   │   ├── entity/                         # Database Model Entities (User, Device, AccidentLog)
│   │   ├── dto/                            # Pydantic Schemas (UserDTO, DeviceDTO, TelemetryDTO)
│   │   ├── core/                           # Cấu hình hệ thống (config.py, security.py, database.py)
│   │   └── main.py                         # FastAPI Application Entrypoint & Lifespan
│   ├── firebase-credentials.json           # Khóa xác thực Google Firebase Admin SDK
│   ├── requirements.txt                    # Thư viện Python phụ thuộc
│   └── Dockerfile                          # Cấu hình container Python 3.11-slim
│
├── frontend/                               # Phân hệ Web App React 19 + Vite
│   ├── src/
│   │   ├── components/                     # UI Components dùng chung (Header, Sidebar, AlertPopup, Cards)
│   │   ├── context/                        # React Context State (AuthContext, NotificationContext)
│   │   ├── hooks/                          # Custom Hooks (useAuth, useDevice, useNotifications, useVehicle)
│   │   ├── pages/                          # Các màn hình ứng dụng
│   │   │   ├── admin/                      # Trang quản trị (AdminDashboard, AdminSettings)
│   │   │   ├── auth/                       # Đăng nhập, đăng ký, quên mật khẩu
│   │   │   ├── mobile/                     # Các view tối ưu riêng cho giao diện màn hình nhỏ PWA
│   │   │   └── user/                       # Dashboard, Vehicle, Device, Sensor, Map, History, Detail
│   │   ├── services/                       # API Client Services (authService, deviceService, accidentService)
│   │   ├── App.jsx                         # Cấu hình Router & Providers
│   │   ├── main.jsx                        # React DOM Entrypoint
│   │   └── index.css                       # Global styles & Design Tokens
│   ├── index.html                          # HTML5 Entry point
│   ├── package.json                        # Khai báo dependencies NPM
│   ├── vite.config.js                      # Cấu hình Vite & Proxy API backend
│   └── Dockerfile                          # Multi-stage build container
│
├── tools/                                  # [Mới theo Roadmap] Công cụ hỗ trợ & bộ mô phỏng
│   └── device_simulator.py                 # Bộ giả lập viễn thám cảm biến phần cứng IoT
│
├── ai_research/                            # [Mới theo Roadmap] Nghiên cứu AI, EDA & Huấn luyện
│   ├── data/                               # Thư mục lưu trữ dataset
│   ├── notebooks/                          # Jupyter Notebooks (EDA & Benchmarking)
│   └── src/                                # Source code huấn luyện, trích xuất đặc trưng & xuất ONNX
│
├── tests/                                  # [Mới theo Roadmap] Bộ kiểm thử tự động
│   └── e2e/                                # Kiểm thử toàn trình và đo độ trễ E2E
│
├── docker-compose.yml                      # Cấu hình điều phối chạy 1 lệnh
├── README.md                               # Tài liệu hướng dẫn chung dự án
└── HUONG_DAN_CHAY_DOCKER.md                # Hướng dẫn chạy dự án qua Docker
```
