# BẢNG PHÂN CÔNG NHIỆM VỤ DỰ ÁN (TEAM TASK ASSIGNMENT MATRIX)
> **Dự án**: Hệ Thống An Toàn Xe Máy Thông Minh IoT (SmartBike)  
> **Mục đích**: Bảng phân công chi tiết 36 nhiệm vụ nguyên tử (Atomic Tasks) theo từng nhóm chuyên môn / vai trò thành viên để tiện theo dõi tiến độ và nghiệm thu.

---

# MỤC LỤC PHÂN CÔNG THEO VAI TRÒ
1. [NHÓM 1: KỸ SƯ PHẦN CỨNG & FIRMWARE (Embedded / IoT Hardware Engineer)](#nhóm-1-kỹ-sư-phần-cứng--firmware-embedded--iot-hardware-engineer) — 8 Tasks
2. [NHÓM 2: KỸ SƯ FRONTEND WEB (Frontend Web Application Engineer)](#nhóm-2-kỹ-sư-frontend-web-frontend-web-application-engineer) — 11 Tasks
3. [NHÓM 3: KỸ SƯ BACKEND & CƠ SỞ DỮ LIỆU (Backend & Cloud Database Engineer)](#nhóm-3-kỹ-sư-backend--cơ-sở-dữ-liệu-backend--cloud-database-engineer) — 11 Tasks
4. [NHÓM 4: KỸ SƯ AI & KHOA HỌC DỮ LIỆU (AI / Machine Learning Engineer)](#nhóm-4-kỹ-sư-ai--khoa-học-dữ-liệu-ai--machine-learning-engineer) — 7 Tasks
5. [NHÓM 5: KỸ SƯ QA, SIMULATOR & DEVOPS (QA, Simulation & Deployment Engineer)](#nhóm-5-kỹ-sư-qa-simulator--devops-qa-simulation--deployment-engineer) — 7 Tasks

---

## NHÓM 1: KỸ SƯ PHẦN CỨNG & FIRMWARE (Embedded / IoT Hardware Engineer)
> **Trọng tâm**: Nghiên cứu sơ đồ mạch, lập trình nhúng ESP32 FreeRTOS, đọc MPU6050 100Hz, NMEA GPS, điều khiển modem SIM7020C NB-IoT và cơ chế lưu đệm Flash SPIFFS.

| Task ID | Phase | Tên Nhiệm Vụ | Tệp Tin Bàn Giao | Phụ Thuộc | Tiêu Chuẩn Nghiệm Thu | Tiến Độ |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **TSK-101** | Phase 1 | Khảo sát & lập tài liệu sơ đồ mạch điện, pinout GPIO ESP32 | `docs/hardware_schematic.md` | Không | Sơ đồ khớp 100% tài liệu luận văn và bảng kết nối chân vật lý | [ ] Chưa |
| **TSK-102** | Phase 1 | Khởi tạo cấu trúc dự án Firmware FreeRTOS đa nhiệm PlatformIO | `firmware/smartbike_esp32/platformio.ini`, `src/main.cpp` | TSK-101 | Dự án biên dịch thành công, nạp được vào board ESP32 không lỗi | [ ] Chưa |
| **TSK-103** | Phase 1 | Viết Driver I2C đọc MPU6050 6 trục 100Hz & bộ đệm vòng Ring Buffer | `firmware/smartbike_esp32/src/mpu6050_driver.cpp` | TSK-102 | Đọc gia tốc và con quay hồi chuyển chu kỳ 10ms liên tục không nghẽn bus | [ ] Chưa |
| **TSK-104** | Phase 1 | Viết Driver UART2 phân tích cú pháp bản tin NMEA GPS NEO-7M | `firmware/smartbike_esp32/src/gps_parser.cpp` | TSK-102 | Trích xuất đúng tọa độ GPS, thời gian UTC và vận tốc $v_{GPS}$ từ `$GPRMC` | [ ] Chưa |
| **TSK-105** | Phase 1 | Viết module Quản lý nguồn & Đo pin qua ADC GPIO 35 (Cầu phân áp 10k/2k) | `firmware/smartbike_esp32/src/power_manager.cpp` | TSK-102 | Đo ADC và quy đổi chính xác mức điện áp pin 2S 18650 (6.4V - 8.4V) | [ ] Chưa |
| **TSK-106** | Phase 1 | Viết AT Client SIM7020C kết nối NB-IoT Viettel và gửi HTTP POST telemetry | `firmware/smartbike_esp32/src/nbiot_client.cpp` | TSK-103, TSK-104 | Đóng gói JSON viễn thám chu kỳ 20ms (50Hz), gửi thành công tới Backend | [ ] Chưa |
| **TSK-107** | Phase 1 | Triển khai Watchdog Timer (WDT 10s) và Bộ đệm Flash SPIFFS ngoại tuyến | `firmware/smartbike_esp32/src/offline_buffer.cpp` | TSK-106 | Mất sóng NB-IoT tự lưu 200 gói vào SPIFFS; có sóng tự động gửi bù về máy chủ | [ ] Chưa |
| **TSK-108** | Phase 1 | Kiểm thử tích hợp phần cứng HIL Test (Đo dòng tiêu thụ, test mất sóng 24h) | `firmware/tests/test_hardware.cpp` | TSK-103 - TSK-107 | Mạch vận hành liên tục 24 giờ ổn định không bị rò rỉ bộ nhớ hay tự reset | [ ] Chưa |

---

## NHÓM 2: KỸ SƯ FRONTEND WEB (Frontend Web Application Engineer)
> **Trọng tâm**: Chuẩn hóa nền tảng React 19, hoàn thiện 6 file rỗng, phát triển 8 module nghiệp vụ Web App, xây dựng Modal cảnh báo khẩn cấp 30s ("Tôi an toàn"), biểu đồ sóng hộp đen SVG và giao diện cấu hình AI.

| Task ID | Phase | Tên Nhiệm Vụ | Tệp Tin Bàn Giao | Phụ Thuộc | Tiêu Chuẩn Nghiệm Thu | Tiến Độ |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **TSK-203** | Phase 2 | Dọn dẹp triệt để các ghi chú và cấu hình tàn dư Flutter/Mobile | `frontend/`, `README.md` | Không | Mã nguồn Web sạch sẽ, không còn bất kỳ tham chiếu nào về Flutter | [ ] Chưa |
| **TSK-204** | Phase 2 | Hoàn thiện nội dung 6 tệp tin rỗng 0-byte (services, hooks, context) | `frontend/src/services/`, `hooks/`, `context/` | Không | Đầy đủ cấu trúc export hàm API call và hook, không lỗi import khi chạy | [ ] Chưa |
| **TSK-205** | Phase 2 | Chuẩn hóa Vite reverse proxy (`/api/v1`) kết nối Backend | `frontend/vite.config.js` | TSK-204 | Gọi API `/api/v1/...` tự động chuyển tiếp tới backend `localhost:8000` | [ ] Chưa |
| **TSK-301** | Phase 3 | Module 1: Giao diện Auth (Đăng nhập, Đăng ký, Profile, Avatar, 3 số SOS) | `frontend/src/pages/auth/`, `Profile.jsx` | TSK-204 | Form cập nhật hồ sơ lưu thành công mảng 3 số SOS vào Firestore | [ ] Chưa |
| **TSK-302** | Phase 3 | Module 2: Dashboard hiển thị trạng thái xe, mức pin, toggle chống trộm | `frontend/src/pages/user/dashboard/Dashboard.jsx` | TSK-301 | Nút bật/tắt chống trộm phản hồi mượt mà, đồng bộ tức thời với database | [ ] Chưa |
| **TSK-303** | Phase 3 | Module 3: Quản lý phương tiện (Hãng xe, dòng xe, màu sắc, biển số) | `frontend/src/pages/user/vehicle/Vehicle.jsx` | TSK-302 | Hiển thị danh thiếp xe trực quan (Vehicle Card) | [ ] Chưa |
| **TSK-304** | Phase 3 | Module 4: Quản lý thiết bị IoT (Liên kết mã xác thực + PIN, hủy liên kết) | `frontend/src/pages/user/device/Device.jsx` | TSK-302 | Nhập đúng mã xác thực và mã PIN mới cho phép gán thiết bị | [ ] Chưa |
| **TSK-305** | Phase 3 | Module 5: Giám sát dữ liệu cảm biến thời gian thực (Gia tốc & Góc nghiêng) | `frontend/src/pages/user/sensor/SensorData.jsx` | TSK-204 | Thay thế mock UI bằng vẽ biểu đồ dữ liệu cảm biến thật từ API | [ ] Chưa |
| **TSK-306** | Phase 3 | Module 6: Bản đồ số Leaflet định vị xe thời gian thực, nút ping vị trí | `frontend/src/pages/user/tracking/Tracking.jsx` | TSK-304 | Ghim chính xác vị trí GPS của xe trên bản đồ OpenStreetMap | [ ] Chưa |
| **TSK-307** | Phase 3 | Module 7: Lịch sử sự cố tai nạn (Danh sách sự kiện, bộ lọc thời gian) | `frontend/src/pages/user/accident/AccidentHistory.jsx` | TSK-304 | Bảng danh sách sự cố tai nạn hiển thị đầy đủ ngày giờ, trạng thái | [ ] Chưa |
| **TSK-308** | Phase 3 | Module 8: Trung tâm thông báo (Dropdown chuông, badge đếm tin chưa đọc) | `frontend/src/components/layout/Header.jsx` | TSK-204 | Huy hiệu hiển thị đúng số tin chưa đọc; bấm đánh dấu đọc cập nhật tức thời | [ ] Chưa |
| **TSK-801** | Phase 8 | Xây dựng Modal cảnh báo khẩn cấp toàn màn hình viền đỏ nhấp nháy & còi hú | `frontend/src/components/layout/AlertPopup.jsx` | TSK-308 | Modal bật tức thời khi có thông báo `ACCIDENT`, phát âm thanh báo động | [ ] Chưa |
| **TSK-802** | Phase 8 | Tích hợp bộ đếm lùi 30 giây trực quan và nút **"Tôi an toàn / Hủy báo động"** | `AlertPopup.jsx`, `accidentService.js` | TSK-801 | Bấm nút hủy cảnh báo thành công, tắt còi; hết 30s chuyển trạng thái SOS | [ ] Chưa |
| **TSK-804** | Phase 8 | Nâng cấp trang Chi tiết tai nạn: Bản đồ phóng to, thẻ chỉ số AI ($P, g, \theta, v$) | `frontend/src/pages/user/accident/AccidentDetail.jsx` | TSK-703 | Hiển thị bản đồ vị trí va chạm và các thẻ chỉ số phân tích AI | [ ] Chưa |
| **TSK-805** | Phase 8 | Tích hợp biểu đồ sóng SVG trực quan hóa mảng mẫu cảm biến thô từ hộp đen | `AccidentDetail.jsx` | TSK-804 | Vẽ đồ thị 3 trục gia tốc có vạch chỉ thị đỉnh va chạm trực quan | [ ] Chưa |
| **TSK-806** | Phase 8 | Nâng cấp trang Admin: Bảng điều khiển tinh chỉnh tham số AI $P_{threshold}$ động | `frontend/src/pages/admin/settings/AdminSettings.jsx` | TSK-604 | Admin thay đổi $P_{threshold}$ và thời gian đếm lùi trực tiếp trên giao diện | [ ] Chưa |

---

## NHÓM 3: KỸ SƯ BACKEND & CƠ SỞ DỮ LIỆU (Backend & Cloud Database Engineer)
> **Trọng tâm**: Phát triển API FastAPI, phân quyền RBAC, tích hợp Cloud Firestore, endpoint viễn thám `/telemetry`, nhúng ONNX runtime, thuật toán hậu kiểm góc nghiêng và lưu trữ hộp đen `accident-logs`.

| Task ID | Phase | Tên Nhiệm Vụ | Tệp Tin Bàn Giao | Phụ Thuộc | Tiêu Chuẩn Nghiệm Thu | Tiến Độ |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **TSK-301** | Phase 3 | Hoàn thiện APIs Xác thực JWT, Cập nhật Profile, Upload Avatar Cloudinary | `backend/app/controller/auth_controller.py` | TSK-205 | Đăng nhập trả về JWT hợp lệ; upload avatar lưu URL Cloudinary | [ ] Chưa |
| **TSK-302** | Phase 3 | API Bật/tắt chế độ chống trộm `anti_thief` cho thiết bị | `backend/app/service/device_service.py` | TSK-301 | Cập nhật chính xác trường `anti_thief` trong document `devices/{id}` | [ ] Chưa |
| **TSK-303** | Phase 3 | API Cập nhật thông tin phương tiện gắn liền với thiết bị | `backend/app/dto/device_dto.py` | TSK-302 | Cập nhật thông tin hãng, dòng xe, màu sắc, biển số vào Firestore | [ ] Chưa |
| **TSK-304** | Phase 3 | API Liên kết thiết bị (kiểm tra `verification_code` và `secret_code`), Hủy liên kết | `backend/app/controller/device_controller.py` | TSK-302 | Kiểm tra đúng mã xác thực và mã PIN mới cho phép gán quyền sở hữu | [ ] Chưa |
| **TSK-601** | Phase 6 | Bổ sung thư viện `onnxruntime` và `numpy` vào `requirements.txt` | `backend/requirements.txt`, `Dockerfile` | Không | Cài đặt thư viện thành công trong container Python 3.11 | [ ] Chưa |
| **TSK-602** | Phase 6 | Xây dựng module `ai_service.py` quản lý session ONNX (Pre-load tại lifespan) | `backend/app/service/ai_service.py` | TSK-506, TSK-601 | Session ONNX nạp sẵn sàng vào bộ nhớ máy chủ ngay khi khởi động FastAPI | [ ] Chưa |
| **TSK-603** | Phase 6 | Định nghĩa Pydantic Schemas tiếp nhận gói viễn thám cảm biến đa chiều | `backend/app/dto/telemetry_dto.py` | Không | Schema kiểm tra chặt chẽ cấu trúc mảng IMU, tọa độ GPS và thông tin pin | [ ] Chưa |
| **TSK-604** | Phase 6 | Xây dựng endpoint tiếp nhận viễn thám `POST /api/v1/devices/{id}/telemetry` | `backend/app/controller/device_controller.py` | TSK-602, TSK-603 | Endpoint nhận gói viễn thám, gọi AI suy luận trả về xác suất $P(\text{ACCIDENT})$ | [ ] Chưa |
| **TSK-701** | Phase 7 | Triển khai thuật toán hậu kiểm góc nghiêng ngã xe ($\theta \ge 60^\circ$) và dừng xe ($v \approx 0$) | `backend/app/service/device_service.py` | TSK-604 | Phân biệt chính xác giữa ngã xe thật và xóc gờ giảm tốc/ổ gà mặt đường | [ ] Chưa |
| **TSK-702** | Phase 7 | Triển khai cơ chế làm mượt xác suất theo thời gian (EMA / Window Consensus Debouncing) | `backend/app/service/device_service.py` | TSK-701 | Triệt tiêu các xung kích tức thời đơn lẻ do nhiễu cảm biến | [ ] Chưa |
| **TSK-703** | Phase 7 | Thiết kế Entity và DTO cho collection hộp đen `accident-logs` trong Firestore | `backend/app/entity/accident_log.py`, `accident_dto.py` | Không | Khai báo đầy đủ các trường: snapshot 100 mẫu thô, $P$, tilt angle, GPS, model version | [ ] Chưa |
| **TSK-704** | Phase 7 | Xử lý lưu vết sự kiện: Tạo bản ghi `accident-logs` và kích hoạt `user-notifications` | `backend/app/service/notification_service.py` | TSK-702, TSK-703 | Sự cố va chạm xác nhận tự động sinh thông báo khẩn cấp gắn mã hộp đen liên kết | [ ] Chưa |
| **TSK-803** | Phase 8 | Xây dựng API tiếp nhận hủy cảnh báo `PUT /api/v1/accidents/{id}/cancel` | `backend/app/controller/accident_controller.py` | TSK-704 | Cập nhật trạng thái sự cố trong `accident-logs` thành `CANCELLED_BY_USER` | [ ] Chưa |
| **TSK-806** | Phase 8 | Xây dựng API Quản trị cấu hình AI `GET/PUT /api/v1/admin/ai-config` | `backend/app/controller/admin_controller.py` | TSK-604 | Cho phép Admin đọc và cập nhật tham số $P_{threshold}$ động vào bộ nhớ | [ ] Chưa |

---

## NHÓM 4: KỸ SƯ AI & KHOA HỌC DỮ LIỆU (AI / Machine Learning Engineer)
> **Trọng tâm**: Khảo sát dữ liệu cảm biến, phân tích EDA phổ tần số, xây dựng pipeline tiền xử lý sliding window, huấn luyện đa mô hình ứng viên (Tree vs Deep Learning), benchmark định lượng, tối ưu hóa $P_{threshold}$ và xuất file `model.onnx`.

| Task ID | Phase | Tên Nhiệm Vụ | Tệp Tin Bàn Giao | Phụ Thuộc | Tiêu Chuẩn Nghiệm Thu | Tiến Độ |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **TSK-401** | Phase 4 | Thu thập và chuẩn hóa tập dữ liệu cảm biến IMU 6 trục (tai nạn thật vs lái xe) | `ai_research/data/` | Không | Bộ dữ liệu có đầy đủ 6 trục quán tính ($a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$), nhãn rõ ràng | [ ] Chưa |
| **TSK-402** | Phase 4 | Phân tích khám phá dữ liệu (EDA): Phân bố gia tốc, phổ tần số FFT, lệch nhãn | `ai_research/notebooks/01_eda.ipynb` | TSK-401 | Báo cáo trực quan hóa chứng minh đặc trưng phân biệt giữa va chạm và xóc mặt đường | [ ] Chưa |
| **TSK-403** | Phase 4 | Xây dựng pipeline tiền xử lý tín hiệu: Bộ lọc khử nhiễu, chuẩn hóa `StandardScaler` | `ai_research/src/preprocessing.py` | TSK-402 | Dữ liệu đầu vào được chuẩn hóa về phân phối chuẩn không có giá trị NaN hoặc Inf | [ ] Chưa |
| **TSK-404** | Phase 4 | Xây dựng cơ chế cửa sổ trượt (Sliding Window 1.0s - 2.0s, gối đầu 50%) | `ai_research/src/windowing.py` | TSK-403 | Ma trận cửa sổ trượt xuất ra có kích thước cố định, giữ nguyên vẹn đỉnh va chạm | [ ] Chưa |
| **TSK-501** | Phase 5 | Xây dựng mô hình cơ sở (Baseline Model: Decision Tree / Logistic Regression) | `ai_research/src/baseline.py` | TSK-404 | Thiết lập mốc tham chiếu định lượng ban đầu về Recall, Precision và F1-Score | [ ] Chưa |
| **TSK-502** | Phase 5 | Thử nghiệm nhóm Tree-based: LightGBM, XGBoost, Random Forest (đặc trưng FFT) | `ai_research/src/train_trees.py` | TSK-404 | Huấn luyện và xuất ma trận nhầm lẫn (Confusion Matrix) trên tập validation | [ ] Chưa |
| **TSK-503** | Phase 5 | Thử nghiệm nhóm Deep Learning: 1D-CNN, GRU, LSTM, CNN-LSTM trên chuỗi thời gian | `ai_research/src/train_deep.py` | TSK-404 | Huấn luyện với cơ chế Early Stopping và Class Weights để xử lý lệch nhãn | [ ] Chưa |
| **TSK-504** | Phase 5 | Đánh giá so sánh định lượng (Recall, Precision, F1-Score, PR-AUC, Latency CPU) | `ai_research/reports/BENCHMARK.md` | TSK-502, TSK-503 | Bảng so chuẩn định lượng minh bạch giữa tất cả các mô hình ứng viên | [ ] Chưa |
| **TSK-505** | Phase 5 | Tuyển chọn mô hình tối ưu & xác định khoảng tối ưu cho ngưỡng $P_{threshold}$ | `ai_research/reports/SELECTION.md` | TSK-504 | Chọn ra 1 mô hình tối ưu; xác định khoảng $P_{threshold}$ dựa trên đánh đổi Recall vs Precision | [ ] Chưa |
| **TSK-506** | Phase 5 | Đóng gói mô hình chiến thắng và pipeline tiền xử lý sang định dạng chuẩn ONNX | `ai_research/exported/model.onnx` | TSK-505 | Tệp `model.onnx` hợp lệ, thực thi suy luận độc lập trên CPU không phụ thuộc framework gốc | [ ] Chưa |

---

## NHÓM 5: KỸ SƯ QA, SIMULATOR & DEVOPS (QA, Simulation & Deployment Engineer)
> **Trọng tâm**: Xây dựng công cụ giả lập `device_simulator.py`, đo kiểm độ trễ suy luận AI, bộ kiểm thử tích hợp tự động E2E 4 kịch bản, tối ưu Docker Compose và lập báo cáo nghiệm thu kỹ thuật.

| Task ID | Phase | Tên Nhiệm Vụ | Tệp Tin Bàn Giao | Phụ Thuộc | Tiêu Chuẩn Nghiệm Thu | Tiến Độ |
| :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **TSK-201** | Phase 2 | Xây dựng script Python `tools/device_simulator.py` phát gói viễn thám qua HTTP | `tools/device_simulator.py` | TSK-106 (Contract) | Script chạy độc lập qua CLI, phát gói tin 50Hz đúng định dạng Telemetry Contract | [ ] Chưa |
| **TSK-202** | Phase 2 | Tích hợp 6 kịch bản viễn thám (Lái bình thường, Gờ giảm tốc, Phanh gấp, Ngã xe, Trộm, Offline) | `tools/scenarios/` | TSK-201 | Người dùng chọn kịch bản qua tham số `--scenario` và điều chỉnh tốc độ phát linh hoạt | [ ] Chưa |
| **TSK-605** | Phase 6 | Viết unit test tự động đo độ trễ suy luận của AI Engine trên CPU máy chủ Backend | `tests/unit/test_ai_inference.py` | TSK-604 | Thời gian suy luận cho một cửa sổ trượt đạt $< 50\text{ ms}$ | [ ] Chưa |
| **TSK-901** | Phase 9 | Xây dựng bộ kịch bản kiểm thử tích hợp tự động toàn trình pytest (`test_e2e_pipeline.py`) | `tests/e2e/test_e2e_pipeline.py` | TSK-202, TSK-803 | Tự động thực thi và xác nhận tính toàn vẹn dữ liệu trong Cloud Firestore | [ ] Chưa |
| **TSK-902** | Phase 9 | Kiểm thử kịch bản kép: Va chạm ngã xe thật (bật cảnh báo) vs Gờ giảm tốc/Phanh gấp (triệt tiêu) | `tests/e2e/test_scenarios.py` | TSK-901 | 100% kịch bản phản hồi đúng logic thiết kế; không có báo động sai gây phiền | [ ] Chưa |
| **TSK-903** | Phase 9 | Đo lường và kiểm chứng độ trễ toàn trình từ lúc phát gói tin đến lúc Web App hiển thị cảnh báo | `tests/e2e/benchmark_latency.py` | TSK-901 | Tổng độ trễ toàn trình đạt $< 500\text{ ms}$ trên môi trường mạng tiêu chuẩn | [ ] Chưa |
| **TSK-904** | Phase 9 | Kiểm chứng và tối ưu hóa quy trình khởi chạy 1 lệnh bằng Docker Compose | `docker-compose.yml`, `Dockerfile` | Toàn bộ Phase | Chạy `docker compose up --build` khởi động trơn tru toàn bộ dịch vụ trên máy sạch | [ ] Chưa |
| **TSK-905** | Phase 9 | Xuất bản Báo cáo Nghiệm thu Toàn diện Hệ thống và hoàn thiện tài liệu bàn giao dự án | `docs/SYSTEM_VERIFICATION_REPORT.md`, `README.md` | Toàn bộ Phase | Báo cáo đầy đủ số liệu đo kiểm định lượng, ma trận kiểm thử và hướng dẫn vận hành | [ ] Chưa |
