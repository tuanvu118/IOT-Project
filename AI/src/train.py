from __future__ import annotations

import argparse
import json
import os
import random
from pathlib import Path

import numpy as np
import pandas as pd

from .config import load_config, resolve_window_parameters, save_config_snapshot, write_json
from .dataset import (
    discover_records,
    feature_names,
    limit_records_per_split,
    records_to_manifest,
    split_records_by_group,
)
from .evaluate import reconstruction_errors, summarize_normal_scores
from .models import build_conv1d_autoencoder, load_autoencoder, require_tensorflow
from .preprocessing import Standardizer, build_window_array, fit_standardizer


def set_global_seed(seed: int) -> None:
    os.environ["PYTHONHASHSEED"] = str(seed)
    random.seed(seed)
    np.random.seed(seed)
    tf = require_tensorflow()
    tf.random.set_seed(seed)


def merge_history(old_history: dict[str, list[float]], new_history: dict[str, list[float]]):
    merged = {key: list(values) for key, values in old_history.items()}
    for key, values in new_history.items():
        merged.setdefault(key, []).extend(float(value) for value in values)
    return merged


def train(config_path: Path, dataset_root: Path, output_dir: Path, resume: bool, max_files: int | None) -> None:
    config = load_config(config_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    config["artifacts"]["output_dir"] = str(output_dir)
    save_config_snapshot(config, output_dir / "config.yaml")

    seed = int(config["project"]["seed"])
    set_global_seed(seed)
    tf = require_tensorflow()

    records = discover_records(dataset_root, config["data"]["expected_behaviors"])
    ratios = config["data"]["split"]
    splits = split_records_by_group(
        records,
        float(ratios["train"]),
        float(ratios["validation"]),
        float(ratios["test"]),
        seed,
    )
    splits = limit_records_per_split(splits, max_files)
    write_json(records_to_manifest(splits, dataset_root), output_dir / "split_manifest.json")

    print("File-level split (no date/session leakage):")
    for name, values in splits.items():
        groups = sorted({record.group_id for record in values})
        print(f"  {name}: {len(values)} files, {len(groups)} groups -> {groups}")

    include_magnitudes = bool(config["data"]["include_magnitudes"])
    names = feature_names(include_magnitudes)
    required_columns = list(config["data"]["required_columns"])
    min_valid_rows = int(config["data"]["min_valid_rows"])
    standardizer = fit_standardizer(
        splits["train"],
        required_columns,
        include_magnitudes,
        names,
        min_valid_rows,
    )
    standardizer.save(output_dir / "scaler.json")

    window_size, step_size = resolve_window_parameters(config)
    arrays: dict[str, np.ndarray] = {}
    sources: dict[str, list[str]] = {}
    for split_name in ("train", "validation", "test"):
        arrays[split_name], sources[split_name] = build_window_array(
            splits[split_name],
            standardizer,
            required_columns,
            include_magnitudes,
            window_size,
            step_size,
            min_valid_rows,
        )
        print(f"  {split_name} windows: {arrays[split_name].shape}")

    best_model_path = output_dir / "best_model.keras"
    last_model_path = output_dir / "last_model.keras"
    history_path = output_dir / "history.json"
    old_history: dict[str, list[float]] = {}
    initial_epoch = 0

    if resume and last_model_path.exists():
        model = load_autoencoder(str(last_model_path))
        if history_path.exists():
            old_history = json.loads(history_path.read_text(encoding="utf-8"))
            initial_epoch = len(old_history.get("loss", []))
        print(f"Resuming from epoch {initial_epoch}: {last_model_path}")
    else:
        model = build_conv1d_autoencoder(
            window_size=window_size,
            feature_count=len(names),
            encoder_filters=list(config["model"]["encoder_filters"]),
            latent_filters=int(config["model"]["latent_filters"]),
            kernel_size=int(config["model"]["kernel_size"]),
            learning_rate=float(config["training"]["learning_rate"]),
        )

    class SaveLastModel(tf.keras.callbacks.Callback):
        def on_epoch_end(self, epoch, logs=None):
            self.model.save(last_model_path)

    callbacks = [
        tf.keras.callbacks.ModelCheckpoint(
            filepath=best_model_path,
            monitor="val_loss",
            save_best_only=True,
            verbose=1,
        ),
        SaveLastModel(),
        tf.keras.callbacks.EarlyStopping(
            monitor="val_loss",
            patience=int(config["training"]["early_stopping_patience"]),
            restore_best_weights=True,
            verbose=1,
        ),
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            patience=int(config["training"]["reduce_lr_patience"]),
            factor=float(config["training"]["reduce_lr_factor"]),
            min_lr=float(config["training"]["minimum_learning_rate"]),
            verbose=1,
        ),
        tf.keras.callbacks.CSVLogger(output_dir / "training_log.csv", append=resume),
    ]

    total_epochs = int(config["training"]["epochs"])
    history = model.fit(
        arrays["train"],
        arrays["train"],
        validation_data=(arrays["validation"], arrays["validation"]),
        batch_size=int(config["training"]["batch_size"]),
        epochs=total_epochs,
        initial_epoch=initial_epoch,
        shuffle=True,
        callbacks=callbacks,
        verbose=1,
    )
    merged_history = merge_history(old_history, history.history)
    write_json(merged_history, history_path)

    best_model = load_autoencoder(str(best_model_path))
    validation_scores = reconstruction_errors(
        best_model, arrays["validation"], int(config["training"]["batch_size"])
    )
    percentile = float(config["threshold"]["validation_percentile"])
    threshold = float(np.percentile(validation_scores, percentile))
    threshold_payload = {
        "threshold": threshold,
        "selection_source": "normal validation reconstruction errors",
        "percentile": percentile,
        "validation_window_count": int(len(validation_scores)),
        "warning": "ABNORMAL is not equivalent to a confirmed crash.",
    }
    write_json(threshold_payload, output_dir / "threshold.json")

    test_scores = reconstruction_errors(
        best_model, arrays["test"], int(config["training"]["batch_size"])
    )
    test_metrics = summarize_normal_scores(test_scores, threshold)
    write_json(test_metrics, output_dir / "test_metrics.json")
    pd.DataFrame(
        {
            "source_file": sources["test"],
            "anomaly_score": test_scores,
            "is_abnormal": test_scores > threshold,
        }
    ).to_csv(output_dir / "test_window_scores.csv", index=False)

    write_json(
        {
            "model_type": config["model"]["type"],
            "input_shape": [window_size, len(names)],
            "feature_names": names,
            "sampling_rate_hz": config["window"]["sampling_rate_hz"],
            "window_duration_seconds": config["window"]["duration_seconds"],
            "step_size": step_size,
            "label_semantics": {"0": "NORMAL", "1": "ABNORMAL_SUSPECTED_FALL"},
            "limitations": [
                "Training data contains normal riding only.",
                "An abnormal window is not proof of a crash or fall.",
                "Fall recall and precision cannot be measured without labeled fall data.",
            ],
        },
        output_dir / "model_metadata.json",
    )

    print("Training complete")
    print(f"  best model: {best_model_path}")
    print(f"  anomaly threshold: {threshold:.8f} (validation p{percentile})")
    print(f"  normal test false-positive rate: {test_metrics['false_positive_rate']:.6f}")
    print("  Important: ABNORMAL means out-of-distribution, not a confirmed accident.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train the SmartBike normal-only IMU anomaly detector")
    parser.add_argument("--config", type=Path, default=Path("AI/configs/anomaly_autoencoder.yaml"))
    parser.add_argument("--dataset", type=Path, required=True)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument(
        "--max-files-per-split",
        type=int,
        default=None,
        help="Use a small deterministic subset for a smoke test; omit for full training.",
    )
    args = parser.parse_args()
    config = load_config(args.config)
    output = args.output or Path(config["artifacts"]["output_dir"])
    train(args.config.resolve(), args.dataset.resolve(), output.resolve(), args.resume, args.max_files_per_split)


if __name__ == "__main__":
    main()

