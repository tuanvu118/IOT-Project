# Nhiệm Vụ Triển Khai: Phase 1 — Nghiên Cứu Phần Cứng IoT & Phát Triển Firmware ESP32
> **Milestone**: 1 (Embedded Hardware & Firmware)  
> **Vai trò phụ trách**: Kỹ sư Phần cứng & Lập trình Nhúng (Embedded / IoT Hardware Engineer)

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-101: Khảo sát sơ đồ nguyên lý mạch điện & bảng kết nối chân GPIO ESP32
- **Tệp tin bàn giao**: `docs/hardware_schematic.md`
- **Mô tả**: Khảo sát tài liệu luận văn và bảng mạch thực tế, tài liệu hóa sơ đồ chân GPIO ESP32:
  - MPU6050: I2C SDA (GPIO 32), SCL (GPIO 33).
  - GPS NEO-7M: UART2 RX (GPIO 22), TX (GPIO 23).
  - SIM7020C: UART TX (GPIO 2), RX (GPIO 4).
  - Còi báo động: GPIO 14 kích chân Base transistor C1815.
  - Cầu phân áp pin: $10\text{k}\Omega / 2\text{k}\Omega$ nối vào GPIO 35 (ADC1_CH7).
- **Tiêu chuẩn nghiệm thu**: Sơ đồ mạch điện chính xác 100%, có bảng ánh xạ chân pinout và mức điện áp hoạt động.

### [ ] TSK-102: Khởi tạo cấu trúc dự án Firmware FreeRTOS đa nhiệm PlatformIO
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/platformio.ini`, `firmware/smartbike_esp32/src/main.cpp`, `firmware/smartbike_esp32/include/config.h`
- **Mô tả**: Khởi tạo dự án biên dịch PlatformIO với framework Arduino-ESP32, cấu hình FreeRTOS đa nhiệm 2 nhân (Dual-core).
- **Tiêu chuẩn nghiệm thu**: Dự án biên dịch thành công, nạp được vào board ESP32 không phát sinh cảnh báo lỗi.

### [ ] TSK-103: Viết Driver I2C MPU6050 lấy mẫu chu kỳ 10ms (100Hz) & Ring Buffer
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/src/mpu6050_driver.cpp`, `firmware/smartbike_esp32/include/mpu6050_driver.h`
- **Mô tả**: Viết task FreeRTOS chạy trên Core 1 đọc 6 trục quán tính ($a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$) chu kỳ 10ms, cấu hình bộ lọc số DLPF phần cứng để lọc rung động máy, đẩy mẫu vào bộ đệm vòng (Ring Buffer).
- **Tiêu chuẩn nghiệm thu**: Đọc dữ liệu cảm biến ổn định ở tần số 100Hz không gây nghẽn bus I2C.

### [ ] TSK-104: Viết Driver UART2 Parser phân tích cú pháp NMEA GPS NEO-7M
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/src/gps_parser.cpp`, `firmware/smartbike_esp32/include/gps_parser.h`
- **Mô tả**: Viết task FreeRTOS trên Core 0 đọc bản tin NMEA-0183 từ UART2, trích xuất kinh độ, vĩ độ, thời gian UTC và vận tốc mặt đất $v_{GPS}$ từ bản tin `$GPRMC`.
- **Tiêu chuẩn nghiệm thu**: Nhận và phân tách chính xác tọa độ GPS và vận tốc xe khi có tín hiệu vệ tinh ngoài trời.

### [ ] TSK-105: Viết module Quản lý nguồn & Đo điện áp pin qua ADC GPIO 35
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/src/power_manager.cpp`, `firmware/smartbike_esp32/include/power_manager.h`
- **Mô tả**: Đọc giá trị ADC từ chân GPIO 35, áp dụng công thức cầu phân áp $10\text{k}\Omega / 2\text{k}\Omega$ để tính điện áp thực của khối pin 2S 18650 (6.4V - 8.4V) và quy đổi ra phần trăm dung lượng pin.
- **Tiêu chuẩn nghiệm thu**: Đo và tính toán dung lượng pin chính xác với sai số dưới 3%.

### [ ] TSK-106: Viết AT Client SIM7020C kết nối NB-IoT Viettel và gửi HTTP POST telemetry
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/src/nbiot_client.cpp`, `firmware/smartbike_esp32/include/nbiot_client.h`
- **Mô tả**: Điều khiển modem SIM7020C qua tập lệnh AT Command (`AT+CSQ`, `AT+CGATT=1`, `AT+CHTTPSEND`), đóng gói chuỗi JSON viễn thám chu kỳ 20ms (50Hz) chứa mảng mẫu IMU, GPS, pin gửi về Backend.
- **Tiêu chuẩn nghiệm thu**: Gói tin JSON viễn thám gửi thành công tới API Backend qua sóng NB-IoT Viettel.

### [ ] TSK-107: Triển khai Watchdog Timer (WDT 10s) và Bộ đệm Flash SPIFFS lưu ngoại tuyến
- **Tệp tin bàn giao**: `firmware/smartbike_esp32/src/offline_buffer.cpp`, `firmware/smartbike_esp32/include/offline_buffer.h`
- **Mô tả**: Thiết lập Hardware WDT 10s tự khởi động lại khi treo; khi mất sóng NB-IoT tự lưu tối đa 200 gói viễn thám vào bộ nhớ Flash SPIFFS và tự động gửi bù khi có sóng trở lại.
- **Tiêu chuẩn nghiệm thu**: Thiết bị ngắt mạng không bị treo, tự lưu dữ liệu ngoại tuyến và gửi bù đầy đủ khi kết nối lại mạng.

### [ ] TSK-108: Kiểm thử tích hợp phần cứng HIL Test (Đo dòng tiêu thụ, test 24h liên tục)
- **Tệp tin bàn giao**: `firmware/tests/test_hardware.cpp`
- **Mô tả**: Chạy thử nghiệm hệ thống phần cứng và firmware liên tục trong 24 giờ, đo dòng tiêu thụ trong các chế độ hoạt động và kiểm tra độ ổn định.
- **Tiêu chuẩn nghiệm thu**: Mạch hoạt động liên tục 24h không rò rỉ bộ nhớ, không khởi động lại ngoài ý muốn.
