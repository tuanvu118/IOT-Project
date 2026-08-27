# 🚀 Hướng Dẫn Chạy Dự Án Bằng Docker (Chỉ Cần 1 Lệnh - Ready to Run)

Dự án đã được cấu hình sẵn toàn bộ file môi trường (`.env`), cổng kết nối và cơ chế **Live Hot-Reloading** cho cả **Backend (FastAPI)** và **Frontend (React + Vite)**. Người khác khi tải (clone) dự án về **chỉ cần chạy 1 lệnh duy nhất là hệ thống tự khởi chạy toàn bộ**, không cần tạo file `.env` thủ công.

---

## ⚡ 1. Khởi Chạy Dự Án (Chỉ 1 Lệnh)

Mở Terminal / PowerShell tại thư mục gốc của dự án (`IOT-Project/`) và chạy:

```bash
docker compose up --build
```

*(Lần đầu chạy Docker sẽ tự động tải thư viện và build các container, từ các lần sau hệ thống sẽ khởi động gần như tức thì).*

---

## 🌐 2. Địa Chỉ Truy Cập Các Dịch Vụ

Sau khi Docker khởi chạy xong, bạn mở trình duyệt:

- 🖥️ **Giao diện Web (Frontend)**: [http://localhost:5173](http://localhost:5173)
- 🔌 **API Server (Backend)**: [http://localhost:8000](http://localhost:8000)
- 📖 **Tài liệu API Swagger (Interactive Docs)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- 📑 **Tài liệu ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔥 3. Cơ Chế Live Hot-Reload (Sửa Code Tự Động Cập Nhật)

Hệ thống đã được thiết lập volume mount và polling watcher:
- **Sửa Backend**: Khi bạn sửa bất kỳ file `.py` nào trong `backend/` và lưu lại (`Ctrl + S`), FastAPI/Uvicorn sẽ tự động reload lại server ngay lập tức.
- **Sửa Frontend**: Khi bạn sửa code trong `frontend/src/` và lưu lại (`Ctrl + S`), Vite HMR sẽ cập nhật giao diện trên trình duyệt tức thì mà không cần F5 hay restart container.

---

## 🛠️ 4. Các Lệnh Quản Lý Docker Thông Dụng

| Thao tác | Lệnh thực hiện |
| :--- | :--- |
| **Khởi chạy và hiển thị logs** | `docker compose up --build` |
| **Khởi chạy chạy ngầm (nền)** | `docker compose up -d` |
| **Xem logs thời gian thực** | `docker compose logs -f` |
| **Chỉ xem log Backend** | `docker compose logs -f backend` |
| **Chỉ xem log Frontend** | `docker compose logs -f frontend` |
| **Dừng toàn bộ hệ thống** | `docker compose down` |
| **Dừng và dọn dẹp sạch volume** | `docker compose down -v` |

---

## 📌 5. Lưu Ý Về Firebase (Nếu có)
- File chứng thực Firebase được cấu hình mặc định tại `backend/firebase-credentials.json` (bên trong container là `/app/firebase-credentials.json`).
- Nếu bạn có file `firebase-credentials.json` của nhóm thì chỉ cần đặt vào thư mục `backend/` là xong.
