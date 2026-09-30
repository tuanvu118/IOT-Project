from __future__ import annotations

import numpy as np


def sliding_windows(values: np.ndarray, window_size: int, step_size: int) -> np.ndarray:
    if values.ndim != 2:
        raise ValueError(f"Expected a 2D [time, features] array, got shape {values.shape}")
    if window_size <= 0 or step_size <= 0:
        raise ValueError("window_size and step_size must be positive")
    if len(values) < window_size:
        return np.empty((0, window_size, values.shape[1]), dtype=np.float32)

    starts = range(0, len(values) - window_size + 1, step_size)
    windows = np.stack([values[start : start + window_size] for start in starts])
    return windows.astype(np.float32, copy=False)

