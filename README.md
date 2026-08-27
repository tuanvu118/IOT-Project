# 🛵 IoT Motorcycle Safety System

Hệ thống IoT phát hiện và cảnh báo mất trộm, tai nạn xe máy.

---

## 🏗️ Cấu Trúc Dự Án

- **`backend/`**: Backend RESTful API xây dựng bằng **Python (FastAPI)**, Firebase Firestore, Firebase Auth, Cloudinary.
- **`frontend/`**: Ứng dụng Web quản lý và giám sát xây dựng bằng **React + Vite**, React Router.
- **`docker-compose.yml`**: Cấu hình khởi chạy toàn bộ hệ thống với tính năng **Live Hot-Reloading** cho cả Frontend và Backend.

---

## ⚡ Khởi Động Nhanh Bằng Docker

### 1. Chuẩn bị file cấu hình
```bash
# Tạo file .env cho backend
copy backend\.env.example backend\.env

# Đặt file Service Account Firebase vào backend/firebase-credentials.json
```

### 2. Khởi chạy toàn bộ hệ thống
```bash
docker compose up --build
```

### 3. Truy cập hệ thống
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📖 Hướng Dẫn Chi Tiết
Xem tài liệu hướng dẫn đầy đủ tại: **[HUONG_DAN_CHAY_DOCKER.md](file:///d:/IOT/IOT-Project/HUONG_DAN_CHAY_DOCKER.md)**.
