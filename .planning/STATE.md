# Trạng Thái Dự Án & Bộ Nhớ Hệ Thống (Project State & Memory)

---

## 1. Trạng Thái Hiện Tại (Current Status)
- **Tình trạng**: Đã hoàn thành lập và đồng bộ TOÀN DIỆN MASTER ROADMAP (Phiên bản 3.1.0) cho TOÀN BỘ 11 WORKSTREAMS (A – K), phân bổ thành 4 Milestones & 9 Phases logic.
- **Tiến độ Planning**: [ROADMAP.md](file:///d:/IOT/IOT-Project/.planning/ROADMAP.md) và [MASTER_IMPLEMENTATION_PLAN.md](file:///d:/IOT/IOT-Project/.planning/MASTER_IMPLEMENTATION_PLAN.md) là nguồn chân lý duy nhất (Source of Truth) cho toàn bộ dự án.
- **Thời điểm cập nhật**: 2026-09-11
- **Trạng thái mã nguồn**: Tuyệt đối CHƯA can thiệp chỉnh sửa source code (PLANNING ONLY theo đúng chỉ thị).
- **Mục tiêu đạt được**: Bộ tài liệu kiến trúc và roadmap chuẩn mực, chi tiết và đồng nhất để review và phân chia 36 task nguyên tử cho đội ngũ phát triển.

---

## 2. Các Quyết Định Kiến Trúc Đã Được Khóa (Locked Architectural Decisions)

1. **Hợp nhất hoàn toàn trên nền tảng Web Application duy nhất (Responsive / PWA)**:
   - Loại bỏ hoàn toàn ứng dụng di động Flutter (Android/iOS) trong tài liệu gốc.
   - Giao diện người dùng duy nhất là Web App xây dựng trên React 19 + Vite, cung cấp đầy đủ các tính năng giám sát xe, bản đồ GPS, bật/tắt chống trộm, cảnh báo khẩn cấp và bảng điều khiển quản trị trên cả thiết bị di động và máy tính.
2. **Ưu tiên sự tiện lợi khi chạy thử nghiệm (Development / Academic Project Friendly)**:
   - Giữ nguyên cơ chế chạy 1 lệnh bằng Docker Compose (`docker compose up --build`).
   - Duy trì các file môi trường `.env` và `firebase-credentials.json` để thuận tiện cho việc chạy demo và đánh giá bài tập lớn, không làm phức tạp hóa cấu hình bảo mật môi trường production.
3. **AI là trung tâm phát hiện tai nạn**:
   - Bãi bỏ hoàn toàn thuật toán ngưỡng cứng `crashDetAlgo` và tham số $cTHRD$.
   - Mô hình AI là thành phần đưa ra quyết định chẩn đoán chính dựa trên chuỗi dữ liệu cảm biến quán tính 6 trục (IMU).
4. **Quy trình phát triển AI theo thực nghiệm khoa học**:
   - Không ấn định trước kiến trúc model cuối cùng (1D-CNN, BiLSTM/GRU, LightGBM, XGBoost... là các ứng viên cần được thực nghiệm so chuẩn).
   - Không áp đặt các chỉ số phần trăm cứng trước khi có dữ liệu; mục tiêu cụ thể được xác định sau bước khảo sát dataset và EDA.
   - Quy trình thực hiện: Dataset $\rightarrow$ EDA $\rightarrow$ Tiền xử lý (Preprocessing) $\rightarrow$ Mô hình cơ sở (Baseline) $\rightarrow$ Thử nghiệm các mô hình ứng viên $\rightarrow$ Đánh giá so sánh $\rightarrow$ Tuyển chọn mô hình tốt nhất $\rightarrow$ Đóng gói và triển khai.
5. **Bản chất của ngưỡng quyết định $P_{threshold}$**:
   - $P_{threshold}$ là decision threshold áp dụng trên xác suất $P(\text{ACCIDENT})$ do AI Model sinh ra, **KHÔNG phải threshold cảm biến** và **KHÔNG phải một thuật toán phát hiện tai nạn thay thế**.
   - Không hard-code giá trị $P_{threshold}$ cố định ở thời điểm ban đầu; giá trị tối ưu được xác định từ kết quả validation và trade-off giữa Recall và Precision sau khi có dataset thực tế, đồng thời có thể tinh chỉnh từ bảng điều khiển quản trị.
6. **Cơ chế hậu kiểm chống báo động giả (Anti-False Alarm Verification)**:
   - Hậu kiểm trạng thái xe (góc nghiêng đổ ngã, vận tốc dừng) và bộ đếm ngược hủy cảnh báo trên Web App chỉ đóng vai trò lọc nhiễu hỗ trợ, tuyệt đối không thay thế vai trò chẩn đoán của AI.
7. **Lưu trữ hộp đen (Blackbox Logging)**:
   - Mọi sự kiện va chạm đều lưu trữ bản chụp mẫu cảm biến thô (raw telemetry snapshot) và xác suất $P(\text{ACCIDENT})$ vào Firestore để phục vụ kiểm toán và tái huấn luyện (retraining).
8. **Phần Cứng & Firmware Là Workstream Độc Lập — KHÔNG Bị Đánh Đồng Với Simulator**:
   - **Hardware Simulator KHÔNG PHẢI là Firmware**. Repository hiện chưa có source code firmware thật; đây là khoảng trống (gap) lớn được quản lý độc lập tại **Phase 1**. Simulator tại **Phase 2** đóng vai trò công cụ kiểm thử viễn thám song song cho nhóm Web, Backend và AI.

---

## 3. Lộ Trình 4 Milestones & 9 Phases Chuẩn Hóa
- **Milestone 1: Embedded Hardware & Firmware**:
  - Phase 1: Nghiên Cứu Phần Cứng IoT & Phát Triển Firmware ESP32
- **Milestone 2: Simulation & Web Application**:
  - Phase 2: Xây Dựng Bộ Mô Phỏng Viễn Thám & Chuẩn Hóa Nền Tảng Web
  - Phase 3: Triển Khai 8 Phân Hệ Nghiệp Vụ Web App & Backend APIs
- **Milestone 3: AI Core Research**:
  - Phase 4: Khảo Sát Dataset, EDA & Pipeline Tiền Xử Lý Tín Hiệu IMU
  - Phase 5: Benchmark Đa Mô Hình, Tuyển Chọn & Tối Ưu Hóa Ngưỡng $P_{threshold}$
- **Milestone 4: Integration & Full System Acceptance**:
  - Phase 6: Tích Hợp Mô Hình AI (ONNX) Vào Backend FastAPI
  - Phase 7: Hậu Kiểm Chống Báo Giả & Lưu Trữ Hộp Đen Firestore
  - Phase 8: Cảnh Báo Khẩn Cấp 30s, Chi Tiết Tai Nạn & Quản Trị AI
  - Phase 9: Kiểm Thử Toàn Trình E2E, Đo Độ Trễ & Nghiệm Thu Hệ Thống
