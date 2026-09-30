from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

from .config import load_config, write_json
from .dataset import BASE_FEATURES, discover_records


def analyze_dataset(dataset_root: Path, config_path: Path, output: Path, plot_dir: Path | None, max_files: int | None):
    config = load_config(config_path)
    records = discover_records(dataset_root, config["data"]["expected_behaviors"])
    if max_files and max_files > 0:
        by_behavior: dict[str, list] = {}
        for record in records:
            by_behavior.setdefault(record.behavior, []).append(record)
        selected = []
        per_behavior = max(1, max_files // max(1, len(by_behavior)))
        for behavior_records in by_behavior.values():
            selected.extend(behavior_records[:per_behavior])
        records = sorted(selected, key=lambda record: str(record.path))[:max_files]

    behavior_counts = Counter(record.behavior for record in records)
    group_counts = Counter(record.group_id for record in records)
    row_counts: list[int] = []
    sampling_rates: list[float] = []
    invalid_files: list[dict[str, str]] = []
    missing_by_channel = Counter()
    channel_accumulators = {
        channel: {"count": 0, "sum": 0.0, "sum_squares": 0.0, "minimum": np.inf, "maximum": -np.inf}
        for channel in BASE_FEATURES
    }
    plotted_behaviors: set[str] = set()

    if plot_dir:
        plot_dir.mkdir(parents=True, exist_ok=True)

    for record in records:
        try:
            frame = pd.read_csv(record.path)
            frame.columns = frame.columns.astype(str).str.strip()
            missing_columns = [column for column in BASE_FEATURES if column not in frame.columns]
            if missing_columns:
                raise ValueError(f"missing columns {missing_columns}")
            row_counts.append(len(frame))
            for column in BASE_FEATURES:
                numeric = pd.to_numeric(frame[column], errors="coerce")
                missing_by_channel[column] += int(numeric.isna().sum())
                finite = numeric[np.isfinite(numeric)]
                if len(finite):
                    values = finite.to_numpy(dtype=np.float64)
                    accumulator = channel_accumulators[column]
                    accumulator["count"] += len(values)
                    accumulator["sum"] += float(values.sum(dtype=np.float64))
                    accumulator["sum_squares"] += float(np.square(values).sum(dtype=np.float64))
                    accumulator["minimum"] = min(accumulator["minimum"], float(values.min()))
                    accumulator["maximum"] = max(accumulator["maximum"], float(values.max()))

            time_column = config["data"].get("sample_time_column")
            if time_column in frame.columns and len(frame) > 1:
                time_values = pd.to_numeric(frame[time_column], errors="coerce").dropna().to_numpy()
                differences = np.diff(time_values) * float(config["data"]["sample_time_scale_seconds"])
                positive = differences[differences > 0]
                if len(positive):
                    sampling_rates.append(float(1.0 / np.median(positive)))

        except Exception as exc:
            invalid_files.append({"path": str(record.path), "error": str(exc)})
            continue

        if plot_dir and record.behavior not in plotted_behaviors:
            try:
                plotted_behaviors.add(record.behavior)
                figure, axes = plt.subplots(2, 1, figsize=(12, 7), sharex=True)
                frame[list(BASE_FEATURES[:3])].plot(ax=axes[0], title=f"{record.behavior}: accelerometer")
                frame[list(BASE_FEATURES[3:])].plot(ax=axes[1], title=f"{record.behavior}: gyroscope")
                axes[1].set_xlabel("Sample")
                figure.tight_layout()
                figure.savefig(plot_dir / f"sample_{record.behavior}.png", dpi=140)
                plt.close(figure)
            except Exception as exc:
                print(f"Warning: could not plot {record.path}: {exc}")

    channel_statistics = {}
    for channel, accumulator in channel_accumulators.items():
        count = int(accumulator["count"])
        if count == 0:
            continue
        mean = accumulator["sum"] / count
        variance = max(accumulator["sum_squares"] / count - mean * mean, 0.0)
        channel_statistics[channel] = {
            "minimum": float(accumulator["minimum"]),
            "maximum": float(accumulator["maximum"]),
            "mean": float(mean),
            "std": float(np.sqrt(variance)),
        }

    report = {
        "dataset_root": str(dataset_root),
        "files_scanned": len(records),
        "behavior_file_counts": dict(sorted(behavior_counts.items())),
        "group_file_counts": dict(sorted(group_counts.items())),
        "row_count": {
            "minimum": int(np.min(row_counts)) if row_counts else 0,
            "maximum": int(np.max(row_counts)) if row_counts else 0,
            "mean": float(np.mean(row_counts)) if row_counts else 0.0,
            "median": float(np.median(row_counts)) if row_counts else 0.0,
            "total": int(np.sum(row_counts)) if row_counts else 0,
        },
        "sampling_rate_hz": {
            "median": float(np.median(sampling_rates)) if sampling_rates else None,
            "minimum": float(np.min(sampling_rates)) if sampling_rates else None,
            "maximum": float(np.max(sampling_rates)) if sampling_rates else None,
        },
        "missing_values_by_channel": dict(missing_by_channel),
        "channel_statistics": channel_statistics,
        "invalid_files": invalid_files,
        "label_finding": "All discovered folders are normal riding behaviors; no crash/fall label was found.",
    }
    write_json(report, output)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect the real TrainingData directory")
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--config", type=Path, default=Path("AI/configs/anomaly_autoencoder.yaml"))
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--plot-dir", type=Path)
    parser.add_argument("--max-files", type=int, default=None)
    args = parser.parse_args()
    report = analyze_dataset(
        args.dataset.resolve(), args.config.resolve(), args.output.resolve(), args.plot_dir, args.max_files
    )
    print(f"Scanned {report['files_scanned']} CSV files")
    print(f"Behavior counts: {report['behavior_file_counts']}")
    print(f"Rows: {report['row_count']}")
    print(f"Sampling rate: {report['sampling_rate_hz']}")
    print(report["label_finding"])
    print(f"Saved report: {args.output.resolve()}")


if __name__ == "__main__":
    main()

