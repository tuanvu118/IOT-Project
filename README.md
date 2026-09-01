# 🛵 IoT Motorcycle Safety System

Hệ thống IoT hỗ trợ theo dõi vị trí phương tiện, giám sát trạng thái và phát hiện/cảnh báo các sự kiện an toàn của xe máy.

## 🧰 Công nghệ sử dụng

- Frontend: React + Vite
- Backend: FastAPI
- Database: Firebase / Firestore
- Map: Leaflet / OpenStreetMap
- PWA: vite-plugin-pwa
- Docker / Docker Compose

---

# 🚀 Hướng dẫn chạy dự án

## 1. Cập nhật source code

```bash
git pull origin main
```

---

## 2. Tạo file môi trường Frontend

File `.env` không được lưu trên GitHub.

Tại thư mục gốc của project, chạy PowerShell:

```powershell
Copy-Item .\frontend\.env.example .\frontend\.env
```

Cấu hình mặc định:

```env
VITE_API_BASE_URL=/api/v1
```

Frontend sẽ gọi Backend thông qua Vite Proxy.

---

## 3. Cài mkcert

Project sử dụng HTTPS trong môi trường development để hỗ trợ PWA.

Trên Windows:

```powershell
winget install FiloSottile.mkcert
```

Sau khi cài xong:

```powershell
mkcert -install
```

> Nếu PowerShell chưa nhận lệnh `mkcert`, hãy mở PowerShell mới hoặc kiểm tra lại PATH.

---

## 4. Lấy địa chỉ IP LAN của máy

Chạy:

```powershell
ipconfig
```

Tìm IPv4 của card Wi-Fi/Ethernet đang sử dụng.

Ví dụ:

```text
192.168.1.20
```

Mỗi máy có thể có IP khác nhau.

---

## 5. Tạo HTTPS certificate

Tại thư mục gốc project:

```powershell
New-Item -ItemType Directory -Force .\frontend\certs
cd .\frontend
```

Thay `192.168.1.20` bằng IP LAN thực tế của máy:

```powershell
mkcert -cert-file .\certs\localhost+lan.pem `
       -key-file .\certs\localhost+lan-key.pem `
       localhost 127.0.0.1 192.168.1.20
```

Quay lại thư mục project:

```powershell
cd ..
```

> `frontend/certs/` chỉ dùng trên máy local và không được commit lên GitHub.

---

## 6. Chạy project bằng Docker

```powershell
docker compose up -d --build
```

Kiểm tra container:

```powershell
docker compose ps
```

Hai service cần ở trạng thái `Up`:

```text
iot_backend
iot_frontend
```

---

# 🌐 Địa chỉ truy cập

Frontend:

```text
https://localhost:5173
```

Backend:

```text
http://localhost:8000
```

Swagger API:

```text
http://localhost:8000/docs
```

---

# 📱 Chạy trên điện thoại / PWA

Điện thoại và máy tính cần kết nối cùng mạng Wi-Fi.

Truy cập bằng IP LAN của máy chạy Docker:

```text
https://<IP-LAN>:5173
```

Ví dụ:

```text
https://192.168.1.20:5173
```

Để HTTPS được tin cậy trên điện thoại, cần cài Root CA của mkcert trên thiết bị.

Sau khi HTTPS được tin cậy, có thể cài SmartBike dưới dạng PWA.

---

# 🔄 Khi có code mới trên GitHub

Cập nhật:

```powershell
git pull origin main
```

Sau đó nếu có thay đổi dependency hoặc Docker configuration:

```powershell
docker compose down
docker compose up -d --build
```

Kiểm tra:

```powershell
docker compose ps
```

---

# 🔐 Lưu ý bảo mật

Không commit các file local hoặc certificate lên GitHub:

```text
frontend/.env
frontend/certs/
*.pem
*.key
*.crt
```

Đặc biệt không chia sẻ private key của mkcert.

---

# 🛑 Dừng project

```powershell
docker compose down
```

# 📋 Xem log

Backend:

```powershell
docker compose logs backend --tail 100
```

Frontend:

```powershell
docker compose logs frontend --tail 100
```
