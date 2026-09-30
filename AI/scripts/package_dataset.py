from __future__ import annotations

import argparse
import json
import zipfile
from collections import Counter
from pathlib import Path


EXPECTED_FOLDERS = {"cruise", "traffic", "fun", "wait", "overtake"}


def package_dataset(source: Path, output: Path) -> None:
    source = source.resolve()
    output = output.resolve()
    if not source.is_dir():
        raise FileNotFoundError(source)
    available = {path.name for path in source.iterdir() if path.is_dir()}
    missing = EXPECTED_FOLDERS.difference(available)
    if missing:
        raise ValueError(f"Dataset is missing expected folders: {sorted(missing)}")

    csv_files = sorted(source.rglob("*.csv"))
    counts = Counter(path.relative_to(source).parts[0] for path in csv_files)
    if not csv_files:
        raise ValueError("No CSV files found")
    output.parent.mkdir(parents=True, exist_ok=True)
    manifest = {
        "source_folder": source.name,
        "csv_file_count": len(csv_files),
        "behavior_file_counts": dict(sorted(counts.items())),
    }
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        archive.writestr("TrainingData/MANIFEST.json", json.dumps(manifest, indent=2))
        for index, path in enumerate(csv_files, start=1):
            archive.write(path, Path("TrainingData") / path.relative_to(source))
            if index % 1000 == 0:
                print(f"Packed {index}/{len(csv_files)} CSV files")
    print(f"Created {output}")
    print(json.dumps(manifest, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a Drive-friendly TrainingData.zip")
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    package_dataset(args.source, args.output)


if __name__ == "__main__":
    main()

