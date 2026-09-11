# Coding Conventions & Project Standards

## 1. Backend Conventions (Python & FastAPI)
- **Chuẩn phong cách**: Tuân thủ PEP 8, sử dụng `snake_case` cho tên hàm, biến, phương thức và tên file (ví dụ: `device_service.py`, `get_device_by_id`).
- **Đặt tên Lớp (Classes)**: Sử dụng `PascalCase` (ví dụ: `DeviceService`, `DeviceRepository`, `SensorSampleDTO`).
- **Phân tách trách nhiệm (Separation of Concerns)**:
  - `Controller`: Chỉ nhận HTTP Request, gọi Pydantic validate và gọi xuống Service. Không nhúng logic nghiệp vụ hay truy vấn database trực tiếp.
  - `Service`: Chứa toàn bộ nghiệp vụ, quy tắc xác thực, thuật toán AI/hậu kiểm.
  - `Repository`: Đóng gói toàn bộ câu lệnh truy vấn Firestore (`collection.where()`, `document.set()`, `document.update()`).
  - `DTO (Data Transfer Object)`: Sử dụng Pydantic v2 `BaseModel` để kiểm tra chặt chẽ kiểu dữ liệu vào/ra.
- **Xử lý bất đồng bộ (Async/Await)**: Khai báo `async def` cho các controller endpoint và hàm dịch vụ gọi mạng/I/O để tận dụng hiệu năng của ASGI Uvicorn.
- **Xử lý ngoại lệ (Exception Handling)**: Sử dụng `HTTPException(status_code=..., detail=...)` chuẩn RESTful, không để lộ traceback ra ngoài client.

## 2. Frontend Conventions (JavaScript & React 19)
- **Cấu trúc Component**: Đặt tên file và component bằng `PascalCase` với đuôi `.jsx` (ví dụ: `AlertPopup.jsx`, `AccidentDetail.jsx`, `Header.jsx`).
- **Hooks & Dịch vụ**: Đặt tên Custom Hooks bắt đầu bằng `use` dạng `camelCase` (ví dụ: `useDevice.js`, `useNotifications.js`).
- **State Management**:
  - Global State dùng React Context API (`AuthContext.jsx`, `NotificationContext.jsx`).
  - Local State dùng `useState`, `useReducer`, `useEffect`.
- **Gọi API Backend**:
  - Tập trung toàn bộ hàm gọi API trong `frontend/src/services/` (ví dụ: `authService.js`, `deviceService.js`, `accidentService.js`).
  - Sử dụng đường dẫn tương đối `/api/v1/...` để tận dụng reverse proxy của Vite (`vite.config.js`) hoặc Nginx, tránh hard-code `http://localhost:8000`.

## 3. Database Conventions (Google Cloud Firestore)
- **Quy ước đặt tên Collection**: Dùng danh từ số nhiều, ngăn cách bằng dấu gạch ngang (kebab-case), ví dụ: `users`, `devices`, `user-notifications`, `accident-logs`.
- **Quy ước đặt tên Trường (Fields)**: Dùng `snake_case` cho tất cả các trường dữ liệu (ví dụ: `device_id`, `is_read`, `created_at`, `battery_level`, `peak_acceleration`).
- **Mốc thời gian (Timestamps)**: Lưu trữ chuẩn ISO 8601 UTC string (ví dụ: `2026-09-11T07:30:00Z`).
