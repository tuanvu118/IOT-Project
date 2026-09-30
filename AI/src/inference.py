from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from .config import load_config, read_json, resolve_window_parameters
from .dataset import read_imu_file
from .evaluate import reconstruction_errors
from .models import load_autoencoder
from .preprocessing import Standardizer
from .windowing import sliding_windows


def infer_file(run_dir: Path, csv_path: Path) -> pd.DataFrame:
    config = load_config(run_dir / "config.yaml")
    threshold = float(read_json(run_dir / "threshold.json")["threshold"])
    standardizer = Standardizer.load(run_dir / "scaler.json")
    model = load_autoencoder(str(run_dir / "best_model.keras"))
    window_size, step_size = resolve_window_parameters(config)

    values = read_imu_file(
        csv_path,
        config["data"]["required_columns"],
        bool(config["data"]["include_magnitudes"]),
    )
    windows = sliding_windows(standardizer.transform(values), window_size, step_size)
    if len(windows) == 0:
        raise ValueError(f"{csv_path} is shorter than one window ({window_size} samples)")
    scores = reconstruction_errors(model, windows, int(config["training"]["batch_size"]))
    sampling_rate = float(config["window"]["sampling_rate_hz"])
    starts = np.arange(len(scores)) * step_size / sampling_rate
    results = pd.DataFrame(
        {
            "window_index": np.arange(len(scores)),
            "start_seconds": starts,
            "end_seconds": starts + window_size / sampling_rate,
            "anomaly_score": scores,
            "threshold": threshold,
            "status": np.where(scores > threshold, "ABNORMAL_SUSPECTED_FALL", "NORMAL"),
        }
    )
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Run anomaly inference on one unseen IMU CSV")
    parser.add_argument("--run", type=Path, required=True)
    parser.add_argument("--csv", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    results = infer_file(args.run.resolve(), args.csv.resolve())
    print(results.to_string(index=False))
    abnormal_count = int((results["status"] != "NORMAL").sum())
    print(f"Abnormal windows: {abnormal_count}/{len(results)}")
    print("ABNORMAL_SUSPECTED_FALL is an anomaly indication, not a confirmed crash.")
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        results.to_csv(args.output, index=False)
        print(f"Saved: {args.output}")


if __name__ == "__main__":
    main()

