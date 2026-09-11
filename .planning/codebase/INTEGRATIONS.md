# External Integrations & Service Contracts

## 1. Google Cloud Firestore (NoSQL Database)
- **Phương thức tích hợp**: Firebase Admin SDK (`firebase_admin.credentials.Certificate`, `firebase_admin.firestore.client`).
- **Tệp chứng thực**: `backend/firebase-credentials.json` (Service Account Key).
- **Cấu trúc Collections dữ liệu**:
  1. `users/{uid}`: Lưu trữ thông tin tài khoản người dùng, họ tên, email, CCCD, số điện thoại, danh bạ khẩn cấp SOS (`emergency_contacts`), `role` (`user` / `admin`).
  2. `devices/{id}`: Lưu trữ trạng thái thiết bị IoT, mã định danh `device_id`, `verification_code`, `secret_code`, `status` (`ONLINE`/`OFFLINE`), `anti_thief` (`boolean`), tọa độ GPS mới nhất (`latitude`, `longitude`), mức pin (`battery_level`).
  3. `user-notifications/{id}`: Hộp thư thông báo người dùng gồm các loại `ACCIDENT`, `THEFT_ALERT`, `BATTERY_LOW`, `SYSTEM`, cờ trạng thái `is_read`.
  4. `accident-logs/{id}` (Mở rộng cho AI & Hộp đen): Lưu trữ sự kiện tai nạn chi tiết, xác suất $P(\text{ACCIDENT})$, gia tốc đỉnh, góc nghiêng thân xe, tọa độ va chạm và snapshot 50-100 mẫu cảm biến thô.
  5. `system-config/{id}` (Mở rộng cho Quản trị AI): Cấu hình động ngưỡng $P_{threshold}$, thời gian đếm lùi và phiên bản mô hình AI.

## 2. Cloudinary Media Storage
- **Mục đích**: Tải lên, lưu trữ và sinh URL ảnh đại diện (avatar) của người dùng.
- **Phương thức tích hợp**: Thư viện Python `cloudinary.uploader.upload` trong `backend/app/service/user_service.py`.
- **Cấu hình**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` qua biến môi trường `.env`.

## 3. OpenStreetMap & Leaflet Geospatial Integration
- **Mục đích**: Trực quan hóa bản đồ vệ tinh và đường sá trên Web App; hiển thị vị trí thời gian thực của phương tiện và điểm xảy ra tai nạn.
- **Phương thức tích hợp**: `react-leaflet` kết nối máy chủ Tile layer công khai của OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).

## 4. Viettel NB-IoT Network & SIM7020C Integration (Phần cứng IoT)
- **Giao thức mạng**: NarrowBand IoT (Băng tần B3/B8/B20/B28).
- **Phương thức truyền dữ liệu**: HTTP POST qua tập lệnh AT Command (`AT+CHTTPCREATE`, `AT+CHTTPCON`, `AT+CHTTPSEND`).
- **Điểm tiếp nhận Backend**:
  - Tọa độ GPS: `POST /devices/{id}/locations`
  - Gói dữ liệu viễn thám cảm biến: `POST /api/v1/devices/{id}/telemetry`
