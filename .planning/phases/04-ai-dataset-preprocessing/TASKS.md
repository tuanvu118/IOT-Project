# Nhiệm Vụ Triển Khai: Phase 4 — Khảo Sát Dataset, EDA & Pipeline Tiền Xử Lý Tín Hiệu IMU
> **Milestone**: 3 (AI Core Research)  
> **Vai trò phụ trách**: Kỹ sư AI & Khoa Học Dữ Liệu (AI / Data Science Engineer)

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-401: Thu thập và chuẩn hóa tập dữ liệu cảm biến IMU 6 trục
- **Tệp tin bàn giao**: `ai_research/data/` (raw và processed), `ai_research/data/README.md`
- **Mô tả**: Thu thập các tập dữ liệu cảm biến va chạm/ngã xe công khai uy tín (FallAllD, SisFall, UTD-MHAD, Kaggle motorcycle crash) kết hợp các mẫu lái xe thông thường (đường bằng, đường xóc, gờ giảm tốc, ổ gà, phanh gấp).
- **Tiêu chuẩn nghiệm thu**: Bộ dữ liệu chuẩn hóa có đầy đủ 6 trục quán tính ($a_x, a_y, a_z, \omega_x, \omega_y, \omega_z$), nhãn rõ ràng (0: Normal, 1: Accident).

### [ ] TSK-402: Phân tích khám phá dữ liệu (EDA) & Phổ tần số FFT
- **Tệp tin bàn giao**: `ai_research/notebooks/01_dataset_eda.ipynb`
- **Mô tả**: Vẽ đồ thị phân phối gia tốc và vận tốc góc, phân tích phổ tần số (FFT) để tìm miền tần số đặc trưng của xung va chạm so với rung sóc mặt đường; đánh giá mức độ mất cân bằng lớp (Class Imbalance).
- **Tiêu chuẩn nghiệm thu**: Báo cáo EDA trực quan hóa chỉ rõ đặc trưng phân biệt giữa va chạm thật và rung chấn mặt đường.

### [ ] TSK-403: Xây dựng pipeline tiền xử lý tín hiệu (Preprocessing & Scaling)
- **Tệp tin bàn giao**: `ai_research/src/preprocessing.py`, `ai_research/exported/scaler.joblib`
- **Mô tả**: Xây dựng module làm sạch dữ liệu: Lọc nhiễu, xử lý khuyết thiếu, chuẩn hóa biên độ bằng `StandardScaler`, lưu trữ trọng số chuẩn hóa phục vụ suy luận production.
- **Tiêu chuẩn nghiệm thu**: Dữ liệu sau tiền xử lý có kỳ vọng xấp xỉ 0 và độ lệch chuẩn xấp xỉ 1, không có giá trị lỗi (NaN/Inf).

### [ ] TSK-404: Xây dựng cơ chế cửa sổ trượt (Sliding Window) trích xuất ma trận
- **Tệp tin bàn giao**: `ai_research/src/windowing.py`
- **Mô tả**: Phân đoạn chuỗi tín hiệu thành các cửa sổ trượt thời gian $1.0\text{s} - 2.0\text{s}$ (50 - 100 mẫu tại 50Hz) có độ trượt gối đầu 50% (overlap 50%) để không bỏ sót đỉnh va chạm.
- **Tiêu chuẩn nghiệm thu**: Pipeline xuất ra ma trận tensor 3 chiều $(N, T, 6)$ sẵn sàng làm đầu vào cho các mô hình học máy và học sâu.
