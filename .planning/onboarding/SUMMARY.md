# Báo Cáo Tóm Lược Nhập Môn Mã Nguồn (Codebase Onboarding Summary)

---

## 1. Kết Quả Khảo Sát Hệ Thống (What Was Learned)

### 1.1. Hiện Trạng Dự Án (Baseline)
- **Tên dự án**: Hệ Thống An Toàn Xe Máy Thông Minh IoT (SmartBike).
- **Phân hệ chính**:
  1. **IoT Hardware & Firmware (Mạch nhúng thật)**: NodeMCU ESP32, MPU6050 (100Hz I2C), NEO-7M GPS (UART2), SIM7020C NB-IoT (AT commands), còi C1815, cầu phân áp pin ADC GPIO 35. Kiến trúc FreeRTOS đa nhiệm, bộ đệm Flash SPIFFS lưu ngoại tuyến.
  2. **Hardware Simulator (Công cụ kiểm thử)**: Script `tools/device_simulator.py` giả lập 6 kịch bản viễn thám độc lập qua HTTP.
  3. **Backend**: FastAPI 0.115, Python 3.11, Google Cloud Firestore, JWT Auth, Cloudinary.
  4. **Frontend**: React 19, Vite, React Router v7, Leaflet OpenStreetMap, Responsive / PWA UI.
  5. **AI Engine**: Khảo sát dữ liệu $\rightarrow$ EDA $\rightarrow$ Pipeline tiền xử lý $\rightarrow$ Thử nghiệm các mô hình ứng viên (Tree-based vs Deep Learning) $\rightarrow$ Tuyển chọn tối ưu theo Recall/Precision trade-off $\rightarrow$ Triển khai ONNX Runtime CPU.

### 1.2. Nợ Kỹ Thuật Đã Xác Định & Quy Hoạch Xử Lý
- Kho git thiếu mã nguồn firmware nhúng cho ESP32 $\rightarrow$ Đưa vào phát triển chuyên biệt tại **Phase 1**.
- 6 tệp tin JavaScript/JSX rỗng 0-byte trong `frontend/src/` được lên lịch hoàn thiện ngay trong **Phase 2**.
- Logic phát hiện va chạm chuyển hoàn toàn từ thuật toán ngưỡng tĩnh ($cTHRD$) sang mô hình AI trên Backend, kết hợp bộ lọc hậu kiểm góc nghiêng ngã xe $\theta \ge 60^\circ$ và lưu trữ hộp đen `accident-logs`.
- Giao diện người dùng tích hợp modal cảnh báo khẩn cấp toàn màn hình với âm thanh còi hú, bộ đếm ngược 30s ("Tôi an toàn") và bảng điều khiển Admin tinh chỉnh tham số AI động.

### 1.3. Bản Đồ Mã Nguồn Đã Tạo Lập Trong `.planning/codebase/`
- [STACK.md](file:///d:/IOT/IOT-Project/.planning/codebase/STACK.md): Toàn bộ danh mục công nghệ và thư viện phụ thuộc.
- [INTEGRATIONS.md](file:///d:/IOT/IOT-Project/.planning/codebase/INTEGRATIONS.md): Hợp đồng tích hợp Firestore, Cloudinary, Leaflet, NB-IoT.
- [ARCHITECTURE.md](file:///d:/IOT/IOT-Project/.planning/codebase/ARCHITECTURE.md): Kiến trúc tổng thể và luồng dữ liệu phát hiện tai nạn AI 5 bước.
- [STRUCTURE.md](file:///d:/IOT/IOT-Project/.planning/codebase/STRUCTURE.md): Sơ đồ tổ chức cây thư mục toàn diện.
- [CONVENTIONS.md](file:///d:/IOT/IOT-Project/.planning/codebase/CONVENTIONS.md): Quy ước lập trình chuẩn mực cho Backend, Frontend và Database.
- [TESTING.md](file:///d:/IOT/IOT-Project/.planning/codebase/TESTING.md): Hiện trạng kiểm thử và chiến lược kiểm thử 4 tầng.
- [CONCERNS.md](file:///d:/IOT/IOT-Project/.planning/codebase/CONCERNS.md): Đánh giá nợ kỹ thuật và các biện pháp quản trị rủi ro.

---

## 2. Các Tài Liệu Quy Hoạch & Kế Hoạch Sẵn Có
- **Kế hoạch tổng thể toàn dự án**: [MASTER_IMPLEMENTATION_PLAN.md](file:///d:/IOT/IOT-Project/.planning/MASTER_IMPLEMENTATION_PLAN.md)
- **Báo cáo kiểm kê hệ thống**: [SYSTEM_AUDIT_REPORT.md](file:///d:/IOT/IOT-Project/.planning/SYSTEM_AUDIT_REPORT.md)
- **Lộ trình phát triển chuẩn hóa**: [ROADMAP.md](file:///d:/IOT/IOT-Project/.planning/ROADMAP.md) (4 Milestones & 9 Phases)
- **Đặc tả yêu cầu hệ thống**: [REQUIREMENTS.md](file:///d:/IOT/IOT-Project/.planning/REQUIREMENTS.md)
- **Bộ nhớ dự án**: [STATE.md](file:///d:/IOT/IOT-Project/.planning/STATE.md)
- **Cấu trúc 9 Phases**:
  - Phase 1: Nghiên Cứu Phần Cứng IoT & Phát Triển Firmware ESP32
  - Phase 2: Xây Dựng Bộ Mô Phỏng Viễn Thám & Chuẩn Hóa Nền Tảng Web
  - Phase 3: Triển Khai 8 Phân Hệ Nghiệp Vụ Web App & Backend APIs
  - Phase 4: Khảo Sát Dataset, EDA & Pipeline Tiền Xử Lý Tín Hiệu IMU
  - Phase 5: Benchmark Đa Mô Hình, Tuyển Chọn & Tối Ưu Hóa Ngưỡng $P_{threshold}$
  - Phase 6: Tích Hợp Mô Hình AI (ONNX) Vào Backend FastAPI
  - Phase 7: Hậu Kiểm Chống Báo Giả & Lưu Trữ Hộp Đen Firestore
  - Phase 8: Cảnh Báo Khẩn Cấp 30s, Chi Tiết Tai Nạn & Quản Trị AI
  - Phase 9: Kiểm Thử Toàn Trình E2E, Đo Độ Trễ & Nghiệm Thu Hệ Thống

---

## 3. Lệnh Đề Xuất Kế Tiếp (Next Command)

Hệ thống đã hoàn thành 100% quy trình onboarding mã nguồn và đồng bộ lộ trình Master Roadmap cho toàn bộ 9 phases.

Các bước tiếp theo bạn có thể thực hiện:
1. **Phân công đầu việc cho đội ngũ phát triển** dựa trên [ROADMAP.md](file:///d:/IOT/IOT-Project/.planning/ROADMAP.md) và [MASTER_IMPLEMENTATION_PLAN.md](file:///d:/IOT/IOT-Project/.planning/MASTER_IMPLEMENTATION_PLAN.md).
2. **Khởi động thực thi Phase đầu tiên**:
   ```bash
   Bắt đầu triển khai Phase 1
   ```
