# Đặc Tả Yêu Cầu Hệ Thống (System Requirements Specification)

---

## 1. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS - FR)

### 1.0. Phân Hệ Phần Cứng IoT & Phần Mềm Nhúng (Hardware & Firmware)
- **FR-HW-01 (Thu thập cảm biến IMU 6 trục)**: Mạch phần cứng NodeMCU ESP32 giao tiếp với cảm biến MPU6050 qua I2C (GPIO 32/33) với tần số lấy mẫu 100Hz (chu kỳ 10ms), đo 3 trục gia tốc ($a_x, a_y, a_z$) và 3 trục vận tốc góc ($\omega_x, \omega_y, \omega_z$).
- **FR-HW-02 (Định vị GPS & Truyền thông NB-IoT)**: Mô-đun GPS U-blox NEO-7M giao tiếp UART2 (GPIO 22/23) thu thập tọa độ và vận tốc tức thời $v_{GPS}$; mô-đun SIM7020C giao tiếp UART (GPIO 2/4) truyền thông tin viễn thám qua mạng di động NB-IoT Viettel.
- **FR-HW-03 (Ngoại vi & Quản lý nguồn điện)**: Kích hoạt còi chip 5V qua transistor C1815 (GPIO 14) khi có cảnh báo; mạch cầu phân áp điện trở $10\text{k}\Omega / 2\text{k}\Omega$ kết nối với chân ADC GPIO 35 để giám sát dung lượng nguồn 2 cell pin 18650 (7.4V - 8.4V).
- **FR-FW-01 (Kiến trúc đa nhiệm FreeRTOS)**: Mã nguồn nhúng FreeRTOS trên ESP32 phân chia các tác vụ độc lập: Task đọc IMU 100Hz (Core 1), Task phân tích GPS (Core 0), Task điều khiển truyền thông SIM7020C (Core 0) và Task quản lý pin.
- **FR-FW-02 (Bộ đệm vòng & Lọc nhiễu sơ bộ DLPF)**: Tích hợp bộ lọc Digital Low Pass Filter trên MPU6050 để loại bỏ rung động cơ học tần số cao của động cơ xe; lưu trữ mẫu trong bộ đệm vòng (Ring Buffer) 100 mẫu.
- **FR-FW-03 (Hợp đồng viễn thám Telemetry Contract)**: Đóng gói dữ liệu IMU, GPS và pin thành mảng JSON chuẩn gửi về Backend qua HTTP POST định kỳ 50Hz.
- **FR-FW-04 (Chống treo hệ thống & Lưu trữ ngoại tuyến)**: Cấu hình Watchdog Timer (WDT 10s) tự động khởi động lại nếu vi điều khiển bị treo; lưu trữ tạm thời tối đa 200 gói viễn thám vào bộ nhớ Flash SPIFFS khi mất sóng NB-IoT và tự động gửi bù khi có mạng (Store-and-forward).
- **FR-SIM-01 (Bộ mô phỏng phần cứng)**: Công cụ phần mềm độc lập `device_simulator.py` giả lập luồng dữ liệu viễn thám 50Hz cho 6 kịch bản (lái xe bình thường, gờ giảm tốc, phanh gấp, ngã xe thật, dắt trộm xe, mất mạng) phục vụ kiểm thử song song.

---

### 1.1. Phân Hệ Xác Thực & Tài Khoản (Authentication & Account)
- **FR-AUTH-01 (Đăng ký tài khoản)**: Người dùng có thể đăng ký tài khoản mới bằng email, số điện thoại, họ và tên và mật khẩu.
- **FR-AUTH-02 (Đăng nhập & Phiên làm việc)**: Hệ thống xác thực thông tin đăng nhập và cấp phát mã thông báo JWT có chữ ký điện tử an toàn; toàn bộ API bảo vệ phải kiểm tra Bearer token.
- **FR-AUTH-03 (Quản lý hồ sơ)**: Người dùng có thể xem và cập nhật thông tin cá nhân (địa chỉ, số căn cước công dân, ngày sinh).
- **FR-AUTH-04 (Ảnh đại diện)**: Người dùng có thể tải lên ảnh đại diện; hệ thống kiểm tra định dạng/dung lượng và lưu trữ ảnh an toàn qua dịch vụ Cloudinary.
- **FR-AUTH-05 (Danh bạ khẩn cấp)**: Người dùng có thể thiết lập và chỉnh sửa danh sách tối đa 3 số điện thoại người thân để phục vụ trường hợp gửi cảnh báo khẩn cấp (SOS).
- **FR-AUTH-06 (Đổi mật khẩu)**: Người dùng có thể thay đổi mật khẩu sau khi xác minh chính xác mật khẩu hiện tại.

---

### 1.2. Phân Hệ Thiết Bị & Phương Tiện (Device & Vehicle Management)
- **FR-DEV-01 (Cấp phát thiết bị bởi Admin)**: Quản trị viên hệ thống có thể tạo mới bản ghi thiết bị IoT với mã nhận diện duy nhất (`verification_code`) và mã bí mật (`secret_code`).
- **FR-DEV-02 (Liên kết thiết bị)**: Người dùng có thể liên kết thiết bị IoT với tài khoản của mình bằng cách nhập chính xác mã thiết bị và mã PIN bảo mật.
- **FR-DEV-03 (Hủy liên kết thiết bị)**: Người dùng có thể hủy liên kết thiết bị khỏi tài khoản khi chuyển nhượng hoặc ngừng sử dụng.
- **FR-DEV-04 (Cập nhật phương tiện)**: Người dùng có thể cập nhật thông tin nhận diện phương tiện gắn liền với thiết bị (hãng xe, dòng xe, màu sắc, biển số xe).
- **FR-DEV-05 (Chế độ chống trộm)**: Người dùng có thể bật hoặc tắt chế độ giám sát chống trộm (`anti_thief: true/false`) trực tiếp từ giao diện Web App.
- **FR-DEV-06 (Yêu cầu gửi vị trí tức thời)**: Người dùng có thể gửi lệnh yêu cầu thiết bị IoT phản hồi và cập nhật tọa độ GPS mới nhất.

---

### 1.3. Phân Hệ Thu Thập Dữ Liệu Viễn Thám (Sensor Telemetry Ingestion)
- **FR-TEL-01 (Tiếp nhận gói dữ liệu cảm biến)**: Backend phải cung cấp API tiếp nhận gói dữ liệu viễn thám định kỳ từ thiết bị IoT (`POST /api/v1/devices/{id}/telemetry`).
- **FR-TEL-02 (Cấu trúc gói viễn thám)**: Gói dữ liệu từ thiết bị bao gồm: mã thiết bị, mốc thời gian (timestamp), dữ liệu GPS (kinh độ, vĩ độ, vận tốc $v_{GPS}$) và mảng mẫu cảm biến quán tính 6 trục (IMU: gia tốc $a_x, a_y, a_z$ và vận tốc góc $\omega_x, \omega_y, \omega_z$).
- **FR-TEL-03 (Tạo cửa sổ trượt)**: Dữ liệu cảm biến được tổ chức thành các cửa sổ dữ liệu theo chuỗi thời gian (Sliding Window) có độ dài thời gian và độ trượt gối đầu (overlap) phù hợp để chuẩn bị đầu vào cho phân hệ AI.

---

### 1.4. Phân Hệ AI Phát Hiện Tai Nạn (AI Accident Detection Engine)
- **FR-AI-01 (Thay thế hoàn toàn thuật toán ngưỡng cứng)**: Hệ thống loại bỏ hoàn toàn thuật toán cố định `crashDetAlgo` và ngưỡng tĩnh $cTHRD$. Toàn bộ quyết định nhận diện tín hiệu tai nạn phải do mô hình Trí tuệ Nhân tạo (AI Model) đảm nhiệm.
- **FR-AI-02 (Luồng xử lý quyết định AI)**: Dữ liệu cảm biến sau khi tạo cửa sổ trượt (Sliding Window) và tiền xử lý (Preprocessing) được đưa vào mô hình AI để suy luận xác suất xảy ra tai nạn:
  $$\text{IoT Sensor Data} \longrightarrow \text{Preprocessing / Windowing} \longrightarrow \text{AI Model} \longrightarrow P(\text{ACCIDENT}) \longrightarrow \text{Decision / Post-processing} \longrightarrow \text{Accident Event}$$
- **FR-AI-03 (Quy trình phát triển & tuyển chọn mô hình)**:
  - Tiến hành khảo sát dữ liệu thực tế (Dataset), phân tích khám phá (EDA), tiền xử lý và chuẩn hóa.
  - Xây dựng mô hình đường cơ sở (Baseline Model) làm mốc so chuẩn.
  - Thử nghiệm đánh giá công bằng các mô hình ứng viên (Candidate Models) tiềm năng (thuộc nhóm Gradient Boosting / Cây quyết định và nhóm Mạng nơ-ron học sâu Deep Learning).
  - Lựa chọn mô hình tốt nhất dựa trên phân tích tương quan giữa các độ đo kỹ thuật và yêu cầu triển khai thực tế.
- **FR-AI-04 (Ngưỡng quyết định $P_{threshold}$)**:
  - $P_{threshold}$ là ngưỡng quyết định (decision threshold) áp dụng trên xác suất $P(\text{ACCIDENT})$ do AI Model sinh ra để xác định trạng thái va chạm nghi vấn.
  - $P_{threshold}$ **KHÔNG phải là ngưỡng cảm biến vật lý** và **KHÔNG phải là thuật toán phát hiện tai nạn thay thế**.
  - Không gán cứng giá trị $P_{threshold}$ ở thời điểm thiết kế ban đầu; giá trị tối ưu của $P_{threshold}$ phải được xác định dựa trên kết quả kiểm thử (validation) và sự đánh đổi (trade-off) giữa Recall và Precision sau khi hoàn thành thực nghiệm với dataset.
  - Giá trị $P_{threshold}$ có thể được cấu hình linh hoạt từ bảng điều khiển quản trị hệ thống.
- **FR-AI-05 (Cơ chế hậu xử lý & kiểm chứng trạng thái)**:
  - Nhằm triệt tiêu báo động giả do nhiễu tức thời từ mặt đường (như gờ giảm tốc, ổ gà sâu, phanh gấp), hệ thống thực hiện kiểm chứng trạng thái phương tiện (ví dụ: góc nghiêng đổ ngã của xe, trạng thái dừng hẳn của vận tốc GPS) và làm mượt xác suất qua các cửa sổ liên tiếp (temporal smoothing/debounce).
  - Bộ lọc hậu kiểm chỉ đóng vai trò phối hợp xác thực hỗ trợ, tuyệt đối không thay thế vai trò chẩn đoán cốt lõi của AI Model.
- **FR-AI-06 (Lưu trữ dữ liệu phục vụ tái huấn luyện - Blackbox Logging)**: Mỗi khi xuất hiện sự kiện tai nạn (kể cả sự kiện được xác nhận hoặc sự kiện bị người dùng hủy), hệ thống phải lưu trữ đầy đủ bản chụp gói mẫu cảm biến thô (raw telemetry snapshot), xác suất dự đoán $P(\text{ACCIDENT})$, phiên bản mô hình và tọa độ GPS vào cơ sở dữ liệu làm bằng chứng số và dữ liệu tái huấn luyện (retraining).

---

### 1.5. Phân Hệ Ứng Dụng Web Đồng Nhất (Unified Web Application)
- **FR-WEB-01 (Thay thế hoàn toàn Mobile App)**: Toàn bộ chức năng của ứng dụng di động trong tài liệu gốc được chuyển đổi sang nền tảng Web Application duy nhất (Responsive Web / PWA), hỗ trợ trải nghiệm mượt mà từ màn hình điện thoại, máy tính bảng đến máy tính để bàn.
- **FR-WEB-02 (Bản đồ & Giám sát vị trí trực quan)**: Hiển thị vị trí xe máy hiện tại trên nền tảng bản đồ số (Leaflet/OpenStreetMap), xem lại lịch sử hành trình và các điểm dừng đỗ.
- **FR-WEB-03 (Bảng điều khiển trạng thái thiết bị)**: Hiển thị trực quan trạng thái kết nối (Online/Offline), trạng thái chống trộm (Bật/Tắt), và mức pin của thiết bị.
- **FR-WEB-04 (Giao diện cảnh báo khẩn cấp toàn màn hình)**: Khi phát hiện tai nạn từ phân hệ AI hoặc phát hiện mất trộm, Web App hiển thị ngay lập tức cửa sổ cảnh báo khẩn cấp toàn màn hình với màu sắc nổi bật và âm thanh cảnh báo.
- **FR-WEB-05 (Bộ đếm ngược hủy cảnh báo giả)**: Cung cấp bộ đếm ngược (countdown) trực quan trên giao diện cảnh báo để người điều khiển phương tiện có thể chủ động bấm **"Tôi an toàn / Tắt cảnh báo"** khi chỉ là va quẹt nhẹ hoặc đổ xe ngoài ý muốn.
- **FR-WEB-06 (Lịch sử cảnh báo & Sự kiện)**: Cung cấp danh sách lịch sử cảnh báo phân loại rõ ràng (Tai nạn AI, Mất trộm, Cảnh báo pin), cho phép xem lại chi tiết tọa độ và độ tin cậy của mô hình tại thời điểm xảy ra.
- **FR-WEB-07 (Bảng điều khiển quản trị - Admin Dashboard)**: Dành riêng cho quản trị viên để giám sát danh sách toàn bộ thiết bị, người dùng, xem xét các thông số hoạt động của AI và nhật ký hệ thống.

---

## 2. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

### 2.1. Độ Chính Xác & Đánh Giá AI (NFR-AI-EVAL)
- **NFR-AI-01 (Bộ chỉ số đánh giá đa chiều)**: Mô hình AI phải được đo lường và đánh giá toàn diện bằng các chỉ số:
  - **Recall (Sensitivity)**: Đảm bảo không bỏ sót các trường hợp tai nạn thật.
  - **Precision**: Kiểm soát và hạn chế tối đa các cảnh báo sai gây hoảng loạn.
  - **F1-Score / Macro F1**: Đánh giá sự cân bằng giữa Recall và Precision trên tập dữ liệu mất cân bằng.
  - **ROC-AUC & PR-AUC**: Đánh giá khả năng phân loại tổng thể của mô hình.
  - Mục tiêu chỉ số định lượng cụ thể sẽ được xác lập sau khi hoàn thành bước khám phá dữ liệu (EDA) và khảo sát dataset thực tế.
- **NFR-AI-02 (Tối ưu hóa thời gian suy luận)**: Thời gian suy luận (Inference Latency) trên CPU máy chủ Backend phải được tối ưu hóa để đảm bảo khả năng phản hồi thời gian thực khi xử lý liên tục các luồng dữ liệu cảm biến.

### 2.2. Bảo Mật & Toàn Vẹn Dữ Liệu (NFR-SEC)
- **NFR-SEC-01 (Quản lý bí mật an toàn)**: Tuyệt đối không commit các file khóa bí mật (`firebase-credentials.json`), biến môi trường chứa API secret (`.env`) vào kho lưu trữ mã nguồn; toàn bộ cấu hình nhạy cảm phải được nạp qua biến môi trường của hệ điều hành/container.
- **NFR-SEC-02 (Mã hóa mật khẩu)**: Mật khẩu người dùng phải được băm an toàn với salt ngẫu nhiên sử dụng thuật toán tiêu chuẩn công nghiệp (Bcrypt/PBKDF2).
- **NFR-SEC-03 (Phân quyền truy cập - RBAC)**: Phân định ranh giới bảo mật nghiêm ngặt giữa người dùng thông thường và quyền Quản trị viên (Admin) thông qua token claims và middleware kiểm soát.

### 2.3. Hiệu Năng & Độ Ổn Định (NFR-PERF)
- **NFR-PERF-01 (Tốc độ phản hồi API)**: Các endpoint tiếp nhận viễn thám và xử lý cảnh báo phải duy trì thời gian đáp ứng nhanh, không làm nghẽn hàng đợi xử lý.
- **NFR-PERF-02 (Khả năng tương thích Web)**: Giao diện Web App tương thích hoàn hảo trên các trình duyệt phổ biến (Chrome, Safari, Edge, Firefox) và đáp ứng chuẩn thiết kế Responsive trên các kích thước màn hình di động phổ dụng.
