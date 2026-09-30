from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Sequence

import numpy as np
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit


DATE_PATTERN = re.compile(r"Daten_(\d{4}_\d{2}_\d{2})", re.IGNORECASE)
BASE_FEATURES = ("Acc_X", "Acc_Y", "Acc_Z", "Gyr_X", "Gyr_Y", "Gyr_Z")
MAGNITUDE_FEATURES = ("Acc_Magnitude", "Gyr_Magnitude")


@dataclass(frozen=True)
class FileRecord:
    path: Path
    behavior: str
    group_id: str


def infer_group_id(path: Path) -> str:
    match = DATE_PATTERN.search(path.stem)
    if match:
        return f"date:{match.group(1)}"
    return f"file:{path.name}"


def discover_records(
    dataset_root: str | Path,
    expected_behaviors: Sequence[str] | None = None,
) -> list[FileRecord]:
    root = Path(dataset_root).expanduser().resolve()
    if not root.is_dir():
        raise FileNotFoundError(f"Dataset directory does not exist: {root}")

    allowed = set(expected_behaviors or [])
    records: list[FileRecord] = []
    for path in sorted(root.rglob("*.csv")):
        try:
            relative = path.relative_to(root)
        except ValueError:
            continue
        if len(relative.parts) < 2:
            continue
        behavior = relative.parts[0]
        if allowed and behavior not in allowed:
            continue
        records.append(FileRecord(path=path, behavior=behavior, group_id=infer_group_id(path)))

    if not records:
        raise ValueError(f"No CSV files found below {root}")
    return records


def feature_names(include_magnitudes: bool) -> list[str]:
    names = list(BASE_FEATURES)
    if include_magnitudes:
        names.extend(MAGNITUDE_FEATURES)
    return names


def read_imu_file(
    path: str | Path,
    required_columns: Sequence[str] = BASE_FEATURES,
    include_magnitudes: bool = False,
) -> np.ndarray:
    csv_path = Path(path)
    header = pd.read_csv(csv_path, nrows=0).columns.astype(str).str.strip().tolist()
    missing = [column for column in required_columns if column not in header]
    if missing:
        raise ValueError(f"{csv_path} is missing required columns: {missing}")

    frame = pd.read_csv(csv_path, usecols=list(required_columns))
    frame.columns = frame.columns.astype(str).str.strip()
    for column in required_columns:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame = frame.replace([np.inf, -np.inf], np.nan)
    frame = frame.interpolate(method="linear", limit_direction="both").dropna()

    values = frame[list(required_columns)].to_numpy(dtype=np.float32, copy=True)
    if include_magnitudes:
        acc_magnitude = np.linalg.norm(values[:, 0:3], axis=1, keepdims=True)
        gyro_magnitude = np.linalg.norm(values[:, 3:6], axis=1, keepdims=True)
        values = np.concatenate([values, acc_magnitude, gyro_magnitude], axis=1)
    return values.astype(np.float32, copy=False)


def split_records_by_group(
    records: Sequence[FileRecord],
    train_ratio: float,
    validation_ratio: float,
    test_ratio: float,
    seed: int,
) -> dict[str, list[FileRecord]]:
    if len({record.group_id for record in records}) < 3:
        raise ValueError("At least three independent date/session groups are required")

    indices = np.arange(len(records))
    groups = np.asarray([record.group_id for record in records])
    holdout_ratio = validation_ratio + test_ratio
    first_split = GroupShuffleSplit(n_splits=1, test_size=holdout_ratio, random_state=seed)
    train_index, holdout_index = next(first_split.split(indices, groups=groups))

    holdout_groups = groups[holdout_index]
    relative_test_ratio = test_ratio / holdout_ratio
    second_split = GroupShuffleSplit(n_splits=1, test_size=relative_test_ratio, random_state=seed + 1)
    validation_local, test_local = next(
        second_split.split(holdout_index, groups=holdout_groups)
    )
    validation_index = holdout_index[validation_local]
    test_index = holdout_index[test_local]

    result = {
        "train": [records[index] for index in train_index],
        "validation": [records[index] for index in validation_index],
        "test": [records[index] for index in test_index],
    }
    assert_no_group_leakage(result)
    return result


def assert_no_group_leakage(splits: dict[str, Sequence[FileRecord]]) -> None:
    group_sets = {
        name: {record.group_id for record in split_records}
        for name, split_records in splits.items()
    }
    names = list(group_sets)
    for index, left in enumerate(names):
        for right in names[index + 1 :]:
            overlap = group_sets[left].intersection(group_sets[right])
            if overlap:
                raise AssertionError(f"Group leakage between {left} and {right}: {sorted(overlap)}")


def limit_records_per_split(
    splits: dict[str, list[FileRecord]],
    maximum: int | None,
) -> dict[str, list[FileRecord]]:
    if maximum is None or maximum <= 0:
        return splits
    return {name: values[:maximum] for name, values in splits.items()}


def records_to_manifest(
    splits: dict[str, Sequence[FileRecord]], dataset_root: str | Path
) -> dict[str, list[dict[str, str]]]:
    root = Path(dataset_root).resolve()
    return {
        split_name: [
            {
                "path": record.path.resolve().relative_to(root).as_posix(),
                "behavior": record.behavior,
                "group_id": record.group_id,
            }
            for record in records
        ]
        for split_name, records in splits.items()
    }


def manifest_to_records(
    entries: Iterable[dict[str, str]], dataset_root: str | Path
) -> list[FileRecord]:
    root = Path(dataset_root).resolve()
    return [
        FileRecord(
            path=root / entry["path"],
            behavior=entry["behavior"],
            group_id=entry["group_id"],
        )
        for entry in entries
    ]

