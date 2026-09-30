from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import yaml


def load_config(path: str | Path) -> dict[str, Any]:
    config_path = Path(path)
    with config_path.open("r", encoding="utf-8") as handle:
        config = yaml.safe_load(handle)
    validate_config(config)
    return config


def validate_config(config: dict[str, Any]) -> None:
    required_sections = {"project", "data", "window", "model", "training", "threshold", "artifacts"}
    missing = required_sections.difference(config)
    if missing:
        raise ValueError(f"Missing config sections: {sorted(missing)}")

    split = config["data"]["split"]
    split_total = float(split["train"]) + float(split["validation"]) + float(split["test"])
    if abs(split_total - 1.0) > 1e-6:
        raise ValueError(f"Dataset split must sum to 1.0, got {split_total}")

    overlap = float(config["window"]["overlap"])
    if not 0.0 <= overlap < 1.0:
        raise ValueError("window.overlap must be in [0, 1)")

    window_size, _ = resolve_window_parameters(config)
    if window_size % 4 != 0:
        raise ValueError("The convolutional autoencoder requires a window size divisible by 4")


def resolve_window_parameters(config: dict[str, Any]) -> tuple[int, int]:
    sampling_rate = int(config["window"]["sampling_rate_hz"])
    duration = float(config["window"]["duration_seconds"])
    overlap = float(config["window"]["overlap"])
    window_size = int(round(sampling_rate * duration))
    step_size = max(1, int(round(window_size * (1.0 - overlap))))
    return window_size, step_size


def save_config_snapshot(config: dict[str, Any], path: str | Path) -> None:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", encoding="utf-8") as handle:
        yaml.safe_dump(config, handle, sort_keys=False, allow_unicode=True)


def write_json(payload: Any, path: str | Path) -> None:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2, ensure_ascii=False)


def read_json(path: str | Path) -> Any:
    with Path(path).open("r", encoding="utf-8") as handle:
        return json.load(handle)

