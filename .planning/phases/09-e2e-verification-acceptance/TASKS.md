# Nhiệm Vụ Triển Khai: Phase 9 — Kiểm Thử Toàn Trình E2E, Đo Độ Trễ & Nghiệm Thu Hệ Thống
> **Milestone**: 4 (Integration & Full System Acceptance)  
> **Vai trò phụ trách**: Kỹ sư QA / Kiểm Thử & Kỹ sư DevOps

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-901: Xây dựng bộ kịch bản kiểm thử tích hợp tự động toàn trình pytest
- **Tệp tin bàn giao**: `tests/e2e/test_e2e_pipeline.py`
- **Mô tả**: Sử dụng `pytest` kết hợp `httpx` để thực thi tự động toàn trình: Giả lập gửi viễn thám $\rightarrow$ Backend suy luận AI $\rightarrow$ Hậu kiểm $\rightarrow$ Kiểm tra trạng thái trong Firestore (`accident-logs`, `user-notifications`).
- **Tiêu chuẩn nghiệm thu**: Bộ test tự động chạy pass 100%, kiểm tra tính toàn vẹn dữ liệu trong cơ sở dữ liệu.

### [ ] TSK-902: Kiểm thử kịch bản kép (Va chạm ngã xe thật vs Gờ giảm tốc/Phanh gấp)
- **Tệp tin bàn giao**: `tests/e2e/test_scenarios.py`
- **Mô tả**: Kiểm thử hệ thống với 4 tình huống thực tế:
  1. *Kịch bản 1*: Tai nạn ngã xe thật (Kích hoạt còi và modal cảnh báo khẩn cấp 30s).
  2. *Kịch bản 2*: Đi qua gờ giảm tốc cao / sụp ổ gà (Triệt tiêu cảnh báo, không báo động giả).
  3. *Kịch bản 3*: Phanh gấp khẩn cấp tốc độ cao (Triệt tiêu cảnh báo, nhận diện xe dừng an toàn).
  4. *Kịch bản 4*: Dắt trộm xe khi bật chống trộm (Kích hoạt cảnh báo mất trộm).
- **Tiêu chuẩn nghiệm thu**: 100% kịch bản phản hồi đúng logic thiết kế; không có báo động giả gây phiền người dùng.

### [ ] TSK-903: Đo lường và kiểm chứng độ trễ toàn trình (Latency Benchmark)
- **Tệp tin bàn giao**: `tests/e2e/benchmark_latency.py`
- **Mô tả**: Đo đạc chi tiết thời gian từng chặng: Truyền tải mạng $\rightarrow$ Suy luận AI trên CPU $\rightarrow$ Ghi Firestore $\rightarrow$ Web App hiển thị cảnh báo.
- **Tiêu chuẩn nghiệm thu**: Tổng độ trễ toàn trình từ lúc phát sinh va chạm đến khi Web App hiển thị cảnh báo đạt $< 500\text{ ms}$.

### [ ] TSK-904: Kiểm chứng và tối ưu hóa quy trình khởi chạy 1 lệnh bằng Docker Compose
- **Tệp tin bàn giao**: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`
- **Mô tả**: Kiểm tra việc khởi động toàn bộ dự án trên môi trường sạch không có cấu hình sẵn với một câu lệnh: `docker compose up --build`.
- **Tiêu chuẩn nghiệm thu**: Toàn bộ hệ sinh thái (Backend, Frontend, Reverse Proxy) khởi chạy ổn định, không xung đột port, truy cập được ngay qua trình duyệt.

### [ ] TSK-905: Xuất bản Báo cáo Nghiệm thu Toàn diện Hệ thống & Bàn giao
- **Tệp tin bàn giao**: `docs/SYSTEM_VERIFICATION_REPORT.md`, `README.md`
- **Mô tả**: Tổng hợp toàn bộ kết quả đo kiểm định lượng, ma trận Pass/Fail của các kịch bản test, phân tích độ trễ và cập nhật hướng dẫn vận hành chi tiết trong `README.md`.
- **Tiêu chuẩn nghiệm thu**: Có đầy đủ hồ sơ nghiệm thu kỹ thuật hoàn chỉnh phục vụ bảo vệ đề tài và bàn giao cho đội ngũ vận hành.
