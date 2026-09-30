# SmartBike AI — Normal-Only IMU Anomaly Detection

Thư mục này chứa pipeline Colab hoàn chỉnh cho giai đoạn hiện tại:

```text
TrainingData (NORMAL only)
  -> kiểm tra dataset
  -> chia train/validation/test theo ngày hoặc source CSV
  -> fit scaler chỉ trên train
  -> cửa sổ 2 giây, overlap 50%
  -> convolutional autoencoder
  -> reconstruction error
  -> threshold từ validation
  -> NORMAL hoặc ABNORMAL_SUSPECTED_FALL
```

`ABNORMAL_SUSPECTED_FALL` chỉ có nghĩa tín hiệu khác xa dữ liệu bình thường. Nó không phải bằng chứng đã xảy ra tai nạn.

## Cấu trúc

```text
AI/
├── configs/anomaly_autoencoder.yaml
├── notebooks/training_colab.ipynb
├── scripts/package_dataset.py
├── src/
│   ├── analyze_dataset.py
│   ├── dataset.py
│   ├── preprocessing.py
│   ├── windowing.py
│   ├── models.py
│   ├── train.py
│   ├── evaluate.py
│   └── inference.py
├── tests/
└── runs/                       # model/output, không commit Git
```

## Chuẩn bị dataset một lần trên máy Windows

Colab không thể tự đọc `C:\Users\ADMIN\Downloads\TrainingData` trên máy cá nhân. Cách ổn định nhất là đóng gói thành một file ZIP rồi upload lên Google Drive.

Chạy tại thư mục gốc repository:

```powershell
python .\AI\scripts\package_dataset.py `
  --source "C:\Users\ADMIN\Downloads\TrainingData" `
  --output "C:\Users\ADMIN\Downloads\TrainingData.zip"
```

Script kiểm tra năm thư mục mong đợi, đếm CSV và tạo:

```text
TrainingData.zip
└── TrainingData/
    ├── cruise/
    ├── traffic/
    ├── fun/
    ├── wait/
    └── overtake/
```

Upload đúng một file `TrainingData.zip` lên:

```text
My Drive/SmartBike/datasets/TrainingData.zip
```

Không đưa dataset vào GitHub vì có hơn 10.000 CSV và không phải source code.

## Chạy trên Google Colab

1. Mở `AI/notebooks/training_colab.ipynb` bằng Colab.
2. Chọn Runtime > Change runtime type > T4 GPU nếu có.
3. Sửa `REPO_URL` nếu repository đổi địa chỉ.
4. Chạy lần lượt tất cả cell.
5. Cho phép Colab truy cập Google Drive khi được hỏi.

Notebook tự động:

- Clone repository nếu chưa có.
- Nếu đã clone, chạy `git pull --ff-only` để lấy code mới nhất.
- Mount Drive.
- Tìm `TrainingData.zip` hoặc thư mục `TrainingData`.
- Giải nén/copy về ổ `/content` để đọc nhanh hơn Drive.
- Phân tích dataset.
- Huấn luyện và lưu artifact trở lại Drive.
- Load lại best model và inference trên một CSV thuộc test set.

Artifact mặc định nằm ở:

```text
My Drive/SmartBike/runs/anomaly_autoencoder/
├── best_model.keras
├── last_model.keras
├── scaler.json
├── threshold.json
├── config.yaml
├── split_manifest.json
├── history.json
├── training_log.csv
├── test_metrics.json
├── test_window_scores.csv
└── model_metadata.json
```

## Pull code mới trên Colab

Sau khi sửa code local, commit và push lên GitHub. Chạy lại cell **Đồng bộ source code** trong notebook. Cell dùng:

```bash
git fetch origin main
git checkout main
git pull --ff-only origin main
```

Không chỉnh trực tiếp file bên trong clone Colab nếu muốn `pull --ff-only` luôn thành công.

## Smoke test trước khi train đầy đủ

Trong notebook đặt:

```python
MAX_FILES_PER_SPLIT = 20
EPOCH_OVERRIDE = 2
```

Sau khi smoke test chạy hết pipeline, đổi:

```python
MAX_FILES_PER_SPLIT = None
EPOCH_OVERRIDE = None
```

rồi train toàn bộ.

## Chạy bằng CLI

```bash
pip install -r AI/requirements-colab.txt

python -m AI.src.analyze_dataset \
  --dataset /path/to/TrainingData \
  --output AI/runs/dataset_report.json \
  --plot-dir AI/runs/plots

python -m AI.src.train \
  --config AI/configs/anomaly_autoencoder.yaml \
  --dataset /path/to/TrainingData \
  --output AI/runs/anomaly_autoencoder

python -m AI.src.inference \
  --run AI/runs/anomaly_autoencoder \
  --csv /path/to/unseen.csv \
  --output AI/runs/anomaly_autoencoder/inference.csv
```

Resume từ `last_model.keras`:

```bash
python -m AI.src.train --config AI/configs/anomaly_autoencoder.yaml \
  --dataset /path/to/TrainingData \
  --output AI/runs/anomaly_autoencoder \
  --resume
```

## Tiêu chí đọc kết quả

Với dataset hiện tại chỉ có NORMAL, các số hợp lệ là:

- Validation reconstruction-error distribution.
- Threshold được chọn từ validation percentile.
- False-positive rate trên test NORMAL độc lập.
- Số cảnh báo bất thường trên từng file chưa thấy.

Không được báo cáo Recall/Precision phát hiện ngã cho tới khi có dữ liệu ngã thật được gán nhãn.

