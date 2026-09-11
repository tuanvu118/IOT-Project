# Technology Stack & Dependencies

## 1. Backend Stack
- **Ngôn ngữ & Runtime**: Python 3.11+
- **Web Framework**: FastAPI 0.115.x (Asynchronous ASGI framework)
- **ASGI Server**: Uvicorn (tiêu chuẩn chạy production qua `main:app`)
- **Database & Cloud SDK**:
  - `firebase-admin` (Google Cloud Firestore NoSQL Database)
  - `google-cloud-firestore`
- **Xác thực & Bảo mật (Auth & Security)**:
  - `python-jose[cryptography]` (Mã hóa và giải mã JWT Access/Refresh Token)
  - `passlib[bcrypt]` (Băm mật khẩu người dùng chuẩn bcrypt)
  - `python-multipart` (Tiếp nhận form-data cho upload avatar)
- **Media Storage**:
  - `cloudinary` (Dịch vụ lưu trữ và biến đổi ảnh đại diện người dùng)
- **AI & Numerical Runtime** (Đang tích hợp theo Roadmap):
  - `onnxruntime` (Thực thi suy luận mô hình AI đã nén trên CPU máy chủ)
  - `numpy`, `scipy` (Tiền xử lý chuỗi tín hiệu IMU và cửa sổ trượt)
  - `pydantic` v2 (Xác thực dữ liệu request/response DTO)

## 2. Frontend Stack
- **Framework & Thư viện UI**: React 19 (React DOM 19.x)
- **Build Tool & Dev Server**: Vite 6.x (Bundler siêu nhanh với HMR)
- **Routing**: `react-router-dom` v7.x (Client-side routing cho SPA)
- **Iconography**: `lucide-react` (Bộ icon vector chuẩn cho Web App)
- **Bản đồ số & Định vị (Maps & Geospatial)**:
  - `leaflet` v1.9.x
  - `react-leaflet` v5.x (Bản đồ tương tác OpenStreetMap)
- **Styling & Theme**:
  - Vanilla CSS kết hợp cấu trúc Design System linh hoạt
  - `tailwind-merge`, `clsx` (Hỗ trợ ghép nối class điều kiện)
- **PWA & Mobile-First**:
  - Hỗ trợ Service Worker, Web App Manifest cho trải nghiệm Responsive / PWA trên thiết bị di động.

## 3. IoT Hardware & Firmware Stack (Theo Hồ Sơ Kỹ Thuật Đồ Án)
- **Vi điều khiển (MCU)**: NodeMCU ESP32 (38 chân, 2 lõi Tensilica Xtensa 32-bit LX6, 240MHz)
- **Cảm biến đo lường quán tính (IMU)**: MPU6050 (Gia tốc 3 trục ±2g đến ±16g, Con quay hồi chuyển 3 trục ±250°/s đến ±2000°/s; giao tiếp I2C chân GPIO 32/33)
- **Mô-đun định vị toàn cầu**: NEO-7M GPS (Giao tiếp UART2 GPIO 22/23, chuẩn NMEA-0183)
- **Mô-đun truyền thông di động viễn thông**: SIM7020C NB-IoT (Giao tiếp UART GPIO 2/4 qua tập lệnh AT Commands; kết nối băng tần Viettel NB-IoT)
- **Mạch nguồn & Cảnh báo phụ trợ**: Còi chip báo động điều khiển qua Transistor C1815 (GPIO 14), mạch cầu phân áp 10k/2k giám sát 2 cell pin 18650 (7.4V - 8.4V vào GPIO 35 ADC).

## 4. Containerization & Môi Trường Triển Khai
- **Docker & Docker Compose**:
  - `backend/Dockerfile`: Base image `python:3.11-slim`, chạy FastAPI qua Uvicorn port `8000`.
  - `frontend/Dockerfile`: Multi-stage build với `node:20-alpine` build static assets và Nginx port `80` (hoặc Vite dev server port `5173`).
  - `docker-compose.yml`: Cấu hình mạng nội bộ liên kết Backend và Frontend với 1 lệnh `docker compose up --build`.
