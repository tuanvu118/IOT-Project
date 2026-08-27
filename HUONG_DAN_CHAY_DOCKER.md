# 🚀 Hướng Dẫn Chạy Dự Án Bằng Docker & Docker Compose (Hỗ Trợ Hot-Reload)

Tài liệu này hướng dẫn chi tiết cách chạy toàn bộ dự án **IoT Motorcycle Safety** (bao gồm **Backend FastAPI** và **Frontend React + Vite**) bằng **Docker Compose** với tính năng **Live Hot-Reloading** (tự động nhận diện thay đổi khi sửa code ở cả FE và BE mà không cần khởi động lại container).

---

## 📋 Mục Lục
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Yêu cầu chuẩn bị](#2-yêu-cầu-chuẩn-bị)
3. [Cấu hình trước khi khởi chạy](#3-cấu-hình-trước-khi-khởi-chạy)
4. [Các lệnh khởi chạy & quản lý dự án](#4-các-lệnh-khởi-chạy--quản-lý-dự-án)
5. [Địa chỉ truy cập các dịch vụ](#5-địa-chỉ-truy-cập-các-dịch-vụ)
6. [Cơ chế Hot-Reloading & Cách kiểm tra](#6-cơ-chế-hot-reloading--cách-kiểm-tra)
7. [Lưu ý khi thêm thư viện mới](#7-lưu-ý-khi-thêm-thư-viện-mới)
8. [Xử lý các lỗi thường gặp (Troubleshooting)](#8-xử-lý-các-lỗi-thường-gặp-troubleshooting)

---

## 1. Tổng quan kiến trúc

| Dịch vụ | Công nghệ | Cổng Host | Chế độ Hot-Reload |
| :--- | :--- | :--- | :--- |
| **Backend** | Python 3.11, FastAPI, Uvicorn | `8000` | Uvicorn `--reload` + Volume Bind Mount |
| **Frontend** | React 19, Vite, React Router | `5173` | Vite HMR + Polling Watcher + Anonymous Volume |

---

## 2. Yêu cầu chuẩn bị

- Máy tính đã cài đặt **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows / macOS / Linux).
- Đảm bảo Docker Desktop đang ở trạng thái **Running**.

---

## 3. Cấu hình trước khi khởi chạy

### 3.1. Cấu hình Backend

1. **Tạo file `.env` cho Backend**:
   - Sao chép file `.env.example` thành file `.env` trong thư mục `backend/`:
     ```powershell
     copy backend\.env.example backend\.env
     ```
   - Cập nhật các thông tin cấu hình bên trong `backend/.env`:
     ```env
     # Firebase Configuration
     FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json
     FIREBASE_PROJECT_ID=your-firebase-project-id

     # App Configuration
     APP_ENV=development
     APP_DEBUG=true

     # Cloudinary Configuration
     CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
     CLOUDINARY_API_KEY=your-cloudinary-api-key
     CLOUDINARY_API_SECRET=your-cloudinary-api-secret
     CLOUDINARY_AVATAR_FOLDER=iot-project/avatars
     CLOUDINARY_TIMEOUT=120

     # JWT Configuration
     JWT_SECRET_KEY=secret-key-ngau-nhien-rat-dai-va-an-toan
     JWT_ALGORITHM=HS256
     JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440
     ```

2. **File chứng thực Firebase (`firebase-credentials.json`)**:
   - Tải file Service Account JSON từ Firebase Console của bạn.
   - Đặt tên file là `firebase-credentials.json` và lưu vào thư mục `backend/` (đường dẫn: `backend/firebase-credentials.json`).

> [!NOTE]
> Bên trong container, thư mục `backend/` được mount vào `/app`, vì vậy file credentials sẽ nằm ở `/app/firebase-credentials.json`.

### 3.2. Cấu hình Frontend (Tùy chọn)

1. Sao chép file `.env.example` thành `.env` trong thư mục `frontend/`:
   ```powershell
   copy frontend\.env.example frontend\.env
   ```
2. Nội dung file `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api/v1
   ```

---

## 4. Các lệnh khởi chạy & quản lý dự án

Mở Terminal / PowerShell tại **thư mục gốc của dự án** (`IOT-Project/`) và sử dụng các lệnh sau:

### 4.1. Khởi chạy toàn bộ hệ thống (Lần đầu hoặc khi sửa Dockerfile)
```bash
docker compose up --build
```
> Lệnh này sẽ build image cho Backend & Frontend rồi khởi chạy cả 2 container. Các log của hệ thống sẽ hiển thị trực tiếp trên Terminal.

### 4.2. Khởi chạy ở chế độ chạy ngầm (Background / Detached mode)
```bash
docker compose up -d
```

### 4.3. Xem Logs thời gian thực
- **Xem logs của toàn bộ hệ thống**:
  ```bash
  docker compose logs -f
  ```
- **Chỉ xem logs của Backend**:
  ```bash
  docker compose logs -f backend
  ```
- **Chỉ xem logs của Frontend**:
  ```bash
  docker compose logs -f frontend
  ```

### 4.4. Dừng toàn bộ hệ thống
```bash
docker compose down
```

### 4.5. Dừng và xóa toàn bộ dữ liệu tạm / anonymous volumes
```bash
docker compose down -v
```

---

## 5. Địa chỉ truy cập các dịch vụ

Sau khi Docker khởi chạy thành công, bạn mở trình duyệt và truy cập:

- 🌐 **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
- 🔌 **Backend Root API**: [http://localhost:8000](http://localhost:8000)
- 📖 **Tài liệu Swagger API (Interactive Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📑 **Tài liệu ReDoc API**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 6. Cơ chế Hot-Reloading & Cách kiểm tra

Dự án đã được cấu hình tối ưu để hỗ trợ **Live Reload** tức thì mà **KHÔNG CẦN restart Docker**:

### 🔍 Cách kiểm tra Backend Hot-Reload:
1. Mở file [backend/main.py](file:///d:/IOT/IOT-Project/backend/main.py).
2. Sửa thông báo tại endpoint `@app.get("/")`, ví dụ sửa message thành `"IoT Motorcycle Safety API - Updated!"`.
3. Lưu file (`Ctrl + S`).
4. Quan sát cửa sổ log terminal: Uvicorn sẽ hiển thị `WARNING: WatchFiles detected changes... Reloading process...`.
5. Tải lại trang [http://localhost:8000](http://localhost:8000) -> Kết quả thay đổi ngay lập tức!

### 🔍 Cách kiểm tra Frontend Hot-Reload:
1. Mở bất kỳ file React nào trong `frontend/src/` (ví dụ: `frontend/src/pages/Home.jsx` hoặc `frontend/src/App.jsx`).
2. Sửa text hoặc giao diện và lưu file (`Ctrl + S`).
3. Nhìn sang trình duyệt [http://localhost:5173](http://localhost:5173) -> Giao diện tự động cập nhật ngay mà không cần F5!

> [!TIP]
> Frontend sử dụng cơ chế `usePolling: true` trong `vite.config.js` kết hợp biến `CHOKIDAR_USEPOLLING=true`, đảm bảo 100% bắt được file change ngay cả trên môi trường Windows / WSL2.

---

## 7. Lưu ý khi thêm thư viện mới

Nếu bạn thêm thư viện mới vào dự án:

1. **Đối với Backend**: Sau khi thêm thư viện vào `backend/requirements.txt`, hãy chạy lệnh:
   ```bash
   docker compose up --build backend
   ```
2. **Đối với Frontend**: Sau khi thêm package vào `frontend/package.json`, hãy chạy lệnh:
   ```bash
   docker compose up --build frontend
   ```

---

## 8. Xử lý các lỗi thường gặp (Troubleshooting)

### 🔴 Lỗi 1: Port 8000 hoặc 5173 đã bị chiếm dụng (Port is already allocated)
- **Nguyên nhân**: Đang có ứng dụng khác hoặc container khác chạy trên cổng 8000 hoặc 5173.
- **Khắc phục**:
  1. Kiểm tra tiến trình đang dùng cổng và tắt đi, hoặc đổi port map trong `docker-compose.yml` (ví dụ `"8001:8000"` hoặc `"5174:5173"`).

### 🔴 Lỗi 2: Backend báo `FileNotFoundError: ./firebase-credentials.json`
- **Nguyên nhân**: Chưa đặt file `firebase-credentials.json` vào thư mục `backend/` hoặc biến `FIREBASE_CREDENTIALS_PATH` trong `.env` chưa đúng.
- **Khắc phục**:
  1. Tải Service Account key từ Firebase Console.
  2. Đặt file vào `backend/firebase-credentials.json`.
  3. Đảm bảo biến trong `backend/.env` là `FIREBASE_CREDENTIALS_PATH=/app/firebase-credentials.json`.

### 🔴 Lỗi 3: Node modules không nhận diện sau khi thay đổi package.json
- **Khắc phục**:
  Chạy lệnh sau để xóa volume cũ và build lại `node_modules`:
  ```bash
  docker compose down -v
  docker compose up --build
  ```
