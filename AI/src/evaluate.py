from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
import pandas as pd

from .config import load_config, read_json, resolve_window_parameters, write_json
from .dataset import manifest_to_records
from .models import load_autoencoder
from .preprocessing import Standardizer, build_window_array


def reconstruction_errors(model, windows: np.ndarray, batch_size: int = 256) -> np.ndarray:
    reconstructed = model.predict(windows, batch_size=batch_size, verbose=0)
    return np.mean(np.square(windows - reconstructed), axis=(1, 2))


def summarize_normal_scores(scores: np.ndarray, threshold: float) -> dict[str, float | int]:
    return {
        "window_count": int(len(scores)),
        "mean": float(np.mean(scores)),
        "std": float(np.std(scores)),
        "minimum": float(np.min(scores)),
        "p50": float(np.percentile(scores, 50)),
        "p95": float(np.percentile(scores, 95)),
        "p99": float(np.percentile(scores, 99)),
        "maximum": float(np.max(scores)),
        "threshold": float(threshold),
        "false_positive_windows": int(np.sum(scores > threshold)),
        "false_positive_rate": float(np.mean(scores > threshold)),
    }


def evaluate_run(run_dir: Path, dataset_root: Path) -> dict[str, float | int]:
    config = load_config(run_dir / "config.yaml")
    manifest = read_json(run_dir / "split_manifest.json")
    threshold_payload = read_json(run_dir / "threshold.json")
    standardizer = Standardizer.load(run_dir / "scaler.json")
    test_records = manifest_to_records(manifest["test"], dataset_root)
    window_size, step_size = resolve_window_parameters(config)
    windows, sources = build_window_array(
        test_records,
        standardizer,
        config["data"]["required_columns"],
        bool(config["data"]["include_magnitudes"]),
        window_size,
        step_size,
        int(config["data"]["min_valid_rows"]),
    )
    model = load_autoencoder(str(run_dir / "best_model.keras"))
    scores = reconstruction_errors(model, windows, int(config["training"]["batch_size"]))
    threshold = float(threshold_payload["threshold"])
    metrics = summarize_normal_scores(scores, threshold)
    write_json(metrics, run_dir / "test_metrics.json")
    pd.DataFrame(
        {"source_file": sources, "anomaly_score": scores, "is_abnormal": scores > threshold}
    ).to_csv(run_dir / "test_window_scores.csv", index=False)
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate a trained anomaly detector on held-out normal files")
    parser.add_argument("--run", required=True, type=Path)
    parser.add_argument("--dataset", required=True, type=Path)
    args = parser.parse_args()
    metrics = evaluate_run(args.run.resolve(), args.dataset.resolve())
    print("Normal-only test metrics:")
    for key, value in metrics.items():
        print(f"  {key}: {value}")
    print("No fall recall/precision is reported because the dataset contains no labeled falls.")


if __name__ == "__main__":
    main()

