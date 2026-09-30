# AI-SPEC — Phase 04: Normal-Only IMU Anomaly Detection

> Thiết kế này thay thế giả định phân loại NORMAL/ACCIDENT trong giai đoạn chưa có dữ liệu tai nạn thật.

## 1. System Classification

**System Type:** Unsupervised time-series anomaly detection.

**Description:** Mô hình học miền tín hiệu IMU 6 trục của các hành vi lái xe bình thường. Mỗi cửa sổ được tái tạo bởi convolutional autoencoder; reconstruction error cao hơn ngưỡng validation được gắn `ABNORMAL_SUSPECTED_FALL`.

**Critical Failure Modes:**

1. Rò rỉ cửa sổ của cùng ngày/chuyến chạy giữa train, validation và test.
2. Chọn threshold bằng test set hoặc gọi anomaly là tai nạn đã xác nhận.
3. Scaler học từ validation/test hoặc inference dùng scaler khác training.
4. Báo giả liên tục trên hành vi bình thường chưa xuất hiện đủ trong train.

## 1b. Domain Context

**Industry Vertical:** Motorcycle IoT safety.

**User Population:** Người điều khiển xe máy và hệ thống cảnh báo khẩn cấp.

**Stakes Level:** High.

**Output Consequence:** Một anomaly có thể kích hoạt bước xác minh tai nạn; báo giả gây hoảng loạn, bỏ sót có thể làm chậm cứu hộ.

### What Domain Experts Evaluate Against

| Dimension | Good | Bad | Stakes |
|---|---|---|---|
| False alarms | Rất ít cảnh báo trong nhiều giờ chạy bình thường | Ổ gà/phanh/cua thường xuyên kích hoạt | High |
| Event sensitivity | Score tăng rõ trên thử nghiệm đổ/ngã an toàn | Score không tách khỏi normal | Critical |
| Generalization | Ổn định qua ngày, người lái, vị trí lắp | Học dấu vết riêng của session | High |

### Known Failure Modes in This Domain

- Thay đổi vị trí/hướng gắn cảm biến tạo distribution shift.
- Đường xấu, phanh gấp và nghiêng sâu trở thành false positive.
- Cảm biến lỏng, mất mẫu hoặc sai đơn vị làm anomaly score tăng giả.

### Regulatory / Compliance Context

Chưa xác định yêu cầu chứng nhận trong giai đoạn nghiên cứu; không quảng bá kết quả như thiết bị cứu hộ đã được chứng nhận.

### Domain Expert Roles for Evaluation

| Role | Responsibility |
|---|---|
| Kỹ sư dữ liệu IMU | Kiểm tra đơn vị, trục, sampling rate và leakage |
| Người thử nghiệm xe | Xác minh kịch bản normal/hard-negative và thử nghiệm đổ xe an toàn |

## 2. Framework Decision

**Selected Framework:** TensorFlow/Keras 2.16–2.19, scikit-learn cho grouped split.

**Rationale:** Keras chạy trực tiếp trên Colab, API checkpoint/early-stopping ổn định và có đường chuyển đổi TFLite trong giai đoạn sau. scikit-learn chỉ dùng cho split theo group, không phải model quyết định.

| Alternative | Ruled Out Because |
|---|---|
| PyTorch | Tốt cho nghiên cứu nhưng tăng công việc khi mục tiêu sau này là TFLite/TFLite Micro |
| Isolation Forest | Baseline tốt nhưng làm mất cấu trúc chuỗi nếu chỉ dùng feature thống kê |
| Transformer | Quá nặng và không có căn cứ cần thiết cho baseline hiện tại |

**Vendor Lock-In Accepted:** Partial; artifact Keras được dùng trong giai đoạn Colab, export triển khai chưa thuộc scope hiện tại.

## 3. Framework Quick Reference

```bash
pip install -r AI/requirements-colab.txt
```

```python
import tensorflow as tf
from sklearn.model_selection import GroupShuffleSplit
```

```python
model.fit(train_windows, train_windows, validation_data=(val_windows, val_windows))
error = ((windows - model.predict(windows)) ** 2).mean(axis=(1, 2))
threshold = np.percentile(validation_error, 99.5)
```

| Concept | What It Is | When Used |
|---|---|---|
| Group split | Chia theo ngày/session trước windowing | Ngăn leakage |
| Autoencoder | Học tái tạo normal windows | Training normal-only |
| Reconstruction error | MSE giữa input và reconstruction | Anomaly score |

Common pitfalls: random split theo window, fit scaler toàn dataset, threshold theo test, và coi mọi anomaly là crash.

## 4. Implementation Guidance

- Input mặc định: `(100, 8)` tại 50 Hz, gồm 6 trục + hai magnitude tùy chọn.
- Core pattern: fit scaler trên raw TRAIN rows, tạo windows riêng từng split, train input=target.
- State: `config.yaml`, `scaler.json`, `threshold.json`, manifest và model phải được version cùng nhau.
- Không tích hợp backend, ESP32, ONNX hoặc TFLite trong phase này.

## 4b. Typed Configuration Contract

```python
from pydantic import BaseModel, Field

class AnomalyOutput(BaseModel):
    anomaly_score: float = Field(ge=0)
    threshold: float = Field(gt=0)
    status: str  # NORMAL | ABNORMAL_SUSPECTED_FALL
```

Training là batch workflow, không cần async/prompt/context-window. Chi phí chính là I/O 10.272 CSV và GPU training; vì vậy dataset được ZIP trên Drive rồi giải nén vào `/content`.

## 5. Evaluation Strategy

| Dimension | Rubric | Measurement | Priority |
|---|---|---|---|
| Leakage | Không có group giao nhau giữa các split | Code assertion | Critical |
| Normal false-positive rate | Báo cáo theo test normal độc lập | Code metric | High |
| Reproducibility | Seed, config, scaler, manifest, best/last model đầy đủ | Artifact check | High |
| Fall detection | Chưa được kết luận khi không có positive labels | Human review | Critical |

**Eval tooling:** pytest/unittest + artifact JSON/CSV; Arize Phoenix được hoãn vì phase hiện tại là notebook offline, chưa có production tracing.

**Reference Dataset:** Toàn bộ normal dataset chia theo ngày/session; bổ sung tối thiểu các thử nghiệm đổ xe an toàn có nhãn trước khi đo Recall/Precision ngã.

## 6. Guardrails

| Guardrail | Trigger | Intervention |
|---|---|---|
| Semantic guardrail | Model trả anomaly | Chỉ gắn SUSPECTED, không CONFIRMED |
| Consecutive windows | Một window đơn lẻ vượt threshold | Chưa phát cảnh báo cuối |
| Data contract | Thiếu 1 trong 6 channel/NaN kéo dài | Từ chối inference và log lỗi |

Offline theo dõi false-positive rate theo ngày, hành vi, người lái và phiên bản model.

## 7. Production Monitoring

Production monitoring chưa thuộc scope. Artifact bắt buộc lưu: distribution reconstruction error, threshold, test FPR, model version, config và split manifest. Khi tích hợp backend, bổ sung telemetry tracing và human-confirmed false alarm labels.

## Checklist

- [x] System type classified
- [x] Critical failure modes identified
- [x] Domain context and stakes documented
- [x] Framework selected with rationale
- [x] Alternatives considered
- [x] Entry-point pattern documented
- [x] Typed output contract documented
- [x] Evaluation dimensions defined
- [x] Online/offline guardrails defined
- [x] Monitoring artifacts defined

