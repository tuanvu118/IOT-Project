# Nhiệm Vụ Triển Khai: Phase 5 — Benchmark Đa Mô Hình, Tuyển Chọn & Tối Ưu Hóa Ngưỡng $P_{threshold}$
> **Milestone**: 3 (AI Core Research)  
> **Vai trò phụ trách**: Kỹ sư AI & Machine Learning

---

## Danh Sách Nhiệm Vụ (Task Checklist)

### [ ] TSK-501: Xây dựng mô hình cơ sở (Baseline Model)
- **Tệp tin bàn giao**: `ai_research/src/baseline.py`
- **Mô tả**: Xây dựng mô hình cơ sở đơn giản (Decision Tree hoặc Logistic Regression) trên các đặc trưng thống kê thô ($|a|_{max}, |a|_{mean}, \text{Std}(a)$) để thiết lập mốc tham chiếu so sánh.
- **Tiêu chuẩn nghiệm thu**: Xuất kết quả đo Recall, Precision, F1-Score của Baseline Model làm mốc chuẩn.

### [ ] TSK-502: Thử nghiệm nhóm Tree-based (LightGBM, XGBoost, Random Forest)
- **Tệp tin bàn giao**: `ai_research/src/train_trees.py`, `ai_research/src/features.py`
- **Mô tả**: Trích xuất đặc trưng miền thời gian (Mean, Std, Max, Min, Skewness, Kurtosis) và miền tần số (FFT Spectral Energy); huấn luyện LightGBM, XGBoost với `class_weight="balanced"`.
- **Tiêu chuẩn nghiệm thu**: Huấn luyện thành công các mô hình Tree-based, xuất ma trận nhầm lẫn và chỉ số đo lường trên tập validation.

### [ ] TSK-503: Thử nghiệm nhóm Deep Learning (1D-CNN, GRU, LSTM, CNN-LSTM)
- **Tệp tin bàn giao**: `ai_research/src/train_deep.py`, `ai_research/src/models_dl.py`
- **Mô tả**: Xây dựng kiến trúc 1D-CNN trích xuất đặc trưng không gian cục bộ kết hợp GRU nắm bắt chuỗi phụ thuộc thời gian; huấn luyện bằng PyTorch với cơ chế Early Stopping và Focal Loss.
- **Tiêu chuẩn nghiệm thu**: Huấn luyện thành công mô hình Deep Learning, đường cong hàm mất mát (loss) hội tụ ổn định không overfitting.

### [ ] TSK-504: Đánh giá so sánh định lượng trên cùng tập kiểm thử độc lập
- **Tệp tin bàn giao**: `ai_research/reports/BENCHMARK.md`, `ai_research/notebooks/02_benchmark.ipynb`
- **Mô tả**: Đánh giá tất cả các mô hình ứng viên trên cùng một tập test độc lập qua: Recall (độ nhạy), Precision (độ chính xác), F1-Score, PR-AUC, dung lượng file và thời gian suy luận (Latency CPU).
- **Tiêu chuẩn nghiệm thu**: Có bảng đối sánh định lượng minh bạch chứng minh tính ưu việt của mô hình chiến thắng so với Baseline.

### [ ] TSK-505: Tuyển chọn mô hình tối ưu & Tối ưu hóa ngưỡng quyết định $P_{threshold}$
- **Tệp tin bàn giao**: `ai_research/reports/SELECTION.md`
- **Mô tả**: Lựa chọn 1 mô hình tốt nhất đáp ứng cân bằng giữa Recall và Precision; phân tích đường cong PR-Curve để xác định khoảng tối ưu cho ngưỡng quyết định $P_{threshold}$ trên xác suất $P(\text{ACCIDENT})$.
- **Tiêu chuẩn nghiệm thu**: Báo cáo luận giải rõ ràng căn cứ lựa chọn mô hình chiến thắng và khoảng tối ưu của $P_{threshold}$.

### [ ] TSK-506: Đóng gói mô hình chiến thắng sang định dạng chuẩn ONNX
- **Tệp tin bàn giao**: `ai_research/exported/model.onnx`, `ai_research/src/export_onnx.py`
- **Mô tả**: Chuyển đổi và tối ưu hóa mô hình đã chọn sang định dạng ONNX (`.onnx`), kiểm thử suy luận độc lập trên CPU máy chủ.
- **Tiêu chuẩn nghiệm thu**: Tệp `model.onnx` hợp lệ, thực thi suy luận trên CPU qua `onnxruntime` với kết quả trùng khớp mô hình gốc.
