from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Sequence

import numpy as np

from .config import read_json, write_json
from .dataset import FileRecord, read_imu_file
from .windowing import sliding_windows


@dataclass
class Standardizer:
    feature_names: list[str]
    mean: np.ndarray
    std: np.ndarray

    def transform(self, values: np.ndarray) -> np.ndarray:
        return ((values - self.mean) / self.std).astype(np.float32)

    def save(self, path: str | Path) -> None:
        write_json(
            {
                "feature_names": self.feature_names,
                "mean": self.mean.tolist(),
                "std": self.std.tolist(),
            },
            path,
        )

    @classmethod
    def load(cls, path: str | Path) -> "Standardizer":
        payload = read_json(path)
        return cls(
            feature_names=list(payload["feature_names"]),
            mean=np.asarray(payload["mean"], dtype=np.float32),
            std=np.asarray(payload["std"], dtype=np.float32),
        )


def fit_standardizer(
    records: Sequence[FileRecord],
    required_columns: Sequence[str],
    include_magnitudes: bool,
    feature_names: list[str],
    min_valid_rows: int,
) -> Standardizer:
    count = 0
    running_sum = np.zeros(len(feature_names), dtype=np.float64)
    running_sum_squares = np.zeros(len(feature_names), dtype=np.float64)

    for record in records:
        values = read_imu_file(record.path, required_columns, include_magnitudes)
        if len(values) < min_valid_rows:
            continue
        count += len(values)
        running_sum += values.sum(axis=0, dtype=np.float64)
        running_sum_squares += np.square(values, dtype=np.float64).sum(axis=0)

    if count == 0:
        raise ValueError("No valid training rows were available to fit the standardizer")
    mean = running_sum / count
    variance = np.maximum(running_sum_squares / count - np.square(mean), 1e-12)
    std = np.sqrt(variance)
    return Standardizer(
        feature_names=feature_names,
        mean=mean.astype(np.float32),
        std=std.astype(np.float32),
    )


def build_window_array(
    records: Sequence[FileRecord],
    standardizer: Standardizer,
    required_columns: Sequence[str],
    include_magnitudes: bool,
    window_size: int,
    step_size: int,
    min_valid_rows: int,
) -> tuple[np.ndarray, list[str]]:
    batches: list[np.ndarray] = []
    source_files: list[str] = []
    for record in records:
        values = read_imu_file(record.path, required_columns, include_magnitudes)
        if len(values) < max(window_size, min_valid_rows):
            continue
        normalized = standardizer.transform(values)
        windows = sliding_windows(normalized, window_size, step_size)
        if len(windows) == 0:
            continue
        batches.append(windows)
        source_files.extend([str(record.path)] * len(windows))

    if not batches:
        raise ValueError("No windows could be created from the selected records")
    return np.concatenate(batches, axis=0).astype(np.float32), source_files

