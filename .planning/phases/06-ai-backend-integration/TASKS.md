# Nhiệm Vụ Triển Khai: Phase 6 — Tích Hợp Mô Hình AI (ONNX) Vào Backend FastAPI
> **Milestone**: 4 (Integration & Full System Acceptance)  
> **Vai trò phụ trách**: Kỹ sư Backend FastAPI & Kỹ sư AI Deployment

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-601: Cài đặt thư viện `onnxruntime` và `numpy` vào Backend
- **Tệp tin bàn giao**: `backend/requirements.txt`, `backend/Dockerfile`
- **Mô tả**: Bổ sung `onnxruntime>=1.18.0` và `numpy>=1.26.0` vào cấu hình môi trường Python 3.11 của Backend.
- **Tiêu chuẩn nghiệm thu**: Thư viện được cài đặt thành công trong container Backend không gây xung đột package.

### [ ] TSK-602: Xây dựng module `ai_service.py` quản lý session ONNX (Pre-load tại lifespan)
- **Tệp tin bàn giao**: `backend/app/service/ai_service.py`, `backend/app/ai/model.onnx`
- **Mô tả**: Tạo lớp `AccidentClassifier` nạp sẵn `InferenceSession` của ONNX ngay khi FastAPI khởi động (`lifespan`), cung cấp phương thức `predict_proba(sensor_window)` nhận mảng mẫu cảm biến và trả về xác suất $P(\text{ACCIDENT}) \in [0.0, 1.0]$.
- **Tiêu chuẩn nghiệm thu**: Session ONNX được tải vào bộ nhớ khi server start, hàm `predict_proba()` trả về giá trị xác suất hợp lệ.

### [ ] TSK-603: Định nghĩa Pydantic Schemas tiếp nhận gói dữ liệu viễn thám cảm biến
- **Tệp tin bàn giao**: `backend/app/dto/telemetry_dto.py`
- **Mô tả**: Xây dựng các DTO `SensorSampleDTO` (ax, ay, az, gx, gy, gz), `GPSDataDTO` (lat, lng, speed), `TelemetryBatchRequestDTO`, `TelemetryInferenceResponseDTO`.
- **Tiêu chuẩn nghiệm thu**: Schemas kiểm tra chặt chẽ kiểu dữ liệu đầu vào, tự động từ chối các gói tin sai định dạng với mã HTTP 422.

### [ ] TSK-604: Xây dựng endpoint tiếp nhận viễn thám `POST /api/v1/devices/{id}/telemetry`
- **Tệp tin bàn giao**: `backend/app/controller/device_controller.py`, `backend/app/service/device_service.py`
- **Mô tả**: Tạo endpoint tiếp nhận mảng mẫu IMU từ thiết bị hoặc simulator, tiền xử lý và gọi `ai_service.predict_proba()` để đánh giá tức thời.
- **Tiêu chuẩn nghiệm thu**: Endpoint phản hồi HTTP 200 kèm xác suất $P(\text{ACCIDENT})$ khi nhận gói tin cảm biến hợp lệ.

### [ ] TSK-605: Viết unit test đo độ trễ suy luận của AI Engine trên CPU Backend
- **Tệp tin bàn giao**: `tests/unit/test_ai_inference.py`
- **Mô tả**: Viết test case giả lập gửi mảng 100 mẫu cảm biến vào `ai_service.py`, đo thời gian suy luận trung bình qua 100 lần chạy liên tiếp.
- **Tiêu chuẩn nghiệm thu**: Thời gian suy luận trung bình trên CPU máy chủ đạt $< 50\text{ ms}$.
