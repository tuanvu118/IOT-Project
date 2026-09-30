from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

from AI.src.dataset import (
    BASE_FEATURES,
    discover_records,
    feature_names,
    split_records_by_group,
)
from AI.src.preprocessing import fit_standardizer
from AI.src.windowing import sliding_windows


class PipelineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        behaviors = ["cruise", "traffic", "fun", "wait", "overtake"]
        dates = ["2021_01_01", "2021_01_02", "2021_01_03", "2021_01_04", "2021_01_05"]
        for behavior_index, behavior in enumerate(behaviors):
            folder = self.root / behavior
            folder.mkdir()
            for date_index, date in enumerate(dates):
                rows = 120
                base = behavior_index * 10 + date_index
                frame = pd.DataFrame(
                    {
                        "SampleTimeFine": np.arange(rows) * 200,
                        "Acc_X": np.arange(rows, dtype=float) + base,
                        "Acc_Y": np.ones(rows) * (base + 1),
                        "Acc_Z": np.ones(rows) * 9.81,
                        "Gyr_X": np.ones(rows) * 0.1,
                        "Gyr_Y": np.ones(rows) * 0.2,
                        "Gyr_Z": np.ones(rows) * 0.3,
                    }
                )
                frame.to_csv(folder / f"{behavior}_Daten_{date}_0.csv", index=False)

    def tearDown(self) -> None:
        self.temp.cleanup()

    def test_group_split_has_no_date_leakage(self) -> None:
        records = discover_records(self.root)
        splits = split_records_by_group(records, 0.6, 0.2, 0.2, seed=42)
        groups = {name: {record.group_id for record in values} for name, values in splits.items()}
        self.assertTrue(groups["train"].isdisjoint(groups["validation"]))
        self.assertTrue(groups["train"].isdisjoint(groups["test"]))
        self.assertTrue(groups["validation"].isdisjoint(groups["test"]))

    def test_standardizer_uses_selected_records(self) -> None:
        records = discover_records(self.root)
        scaler = fit_standardizer(
            records[:3], BASE_FEATURES, True, feature_names(True), min_valid_rows=100
        )
        self.assertEqual(scaler.mean.shape, (8,))
        self.assertTrue(np.all(scaler.std > 0))

    def test_window_shape(self) -> None:
        values = np.zeros((500, 8), dtype=np.float32)
        windows = sliding_windows(values, window_size=100, step_size=50)
        self.assertEqual(windows.shape, (9, 100, 8))


if __name__ == "__main__":
    unittest.main()

