from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split

from .ensemble import MODEL_NAMES, SixModelTextEnsemble


COLUMN_ALIASES = {
    "text": ["text", "complaint", "grievance", "complaint_text", "content", "sentence"],
    "category": ["category", "category_label", "service_category", "class", "label"],
    "severity": ["severity", "severity_label", "priority", "urgency"],
}

CATEGORY_ALIASES = {
    "road": "road_transport",
    "road and transport": "road_transport",
    "road & transport": "road_transport",
    "transport": "road_transport",
    "roads": "road_transport",
    "সড়ক ও পরিবহন": "road_transport",
    "সড়ক ও পরিবহন": "road_transport",
    "water": "water",
    "পানি": "water",
    "waste": "waste",
    "garbage": "waste",
    "বর্জ্য": "waste",
    "electricity": "electricity",
    "বিদ্যুৎ": "electricity",
    "healthcare": "healthcare",
    "health": "healthcare",
    "স্বাস্থ্য": "healthcare",
    "food": "food",
    "খাদ্য": "food",
}

SEVERITY_ALIASES = {
    "low": "low",
    "নিম্ন": "low",
    "medium": "medium",
    "moderate": "medium",
    "মাঝারি": "medium",
    "high": "high",
    "urgent": "high",
    "উচ্চ": "high",
}


def _find_column(frame: pd.DataFrame, role: str) -> str:
    lookup = {str(column).strip().lower(): str(column) for column in frame.columns}
    for alias in COLUMN_ALIASES[role]:
        if alias in lookup:
            return lookup[alias]
    raise ValueError(
        f"Could not identify the {role!r} column. Expected one of {COLUMN_ALIASES[role]}, "
        f"found {list(frame.columns)}"
    )


def load_dataset(path: Path) -> pd.DataFrame:
    if path.suffix.lower() == ".csv":
        frame = pd.read_csv(path)
    elif path.suffix.lower() in {".xlsx", ".xls"}:
        frame = pd.read_excel(path)
    elif path.suffix.lower() in {".json", ".jsonl"}:
        frame = pd.read_json(path, lines=path.suffix.lower() == ".jsonl")
    else:
        raise ValueError("Use a CSV, XLSX, JSON or JSONL dataset.")

    text_column = _find_column(frame, "text")
    category_column = _find_column(frame, "category")
    severity_column = _find_column(frame, "severity")
    clean = frame[[text_column, category_column, severity_column]].copy()
    clean.columns = ["text", "category", "severity"]
    clean = clean.dropna().drop_duplicates(subset=["text"]).reset_index(drop=True)
    clean["text"] = clean["text"].astype(str).str.strip()
    clean["category"] = clean["category"].astype(str).str.strip().str.lower().map(
        lambda value: CATEGORY_ALIASES.get(value, value.replace(" ", "_"))
    )
    clean["severity"] = clean["severity"].astype(str).str.strip().str.lower().map(
        lambda value: SEVERITY_ALIASES.get(value, value)
    )
    clean = clean[clean["text"].str.len() >= 8]
    return clean


def _evaluate(
    ensemble: SixModelTextEnsemble,
    texts: list[str],
    labels: list[str],
) -> dict[str, Any]:
    predictions = ensemble.predict(texts)
    ordered_labels = [str(label) for label in ensemble.classes_]
    per_model: dict[str, Any] = {}
    for model_id, model in ensemble.models.items():
        model_prediction = model.predict(texts)
        per_model[model_id] = {
            "name": MODEL_NAMES[model_id],
            "macro_f1": float(
                f1_score(labels, model_prediction, average="macro", zero_division=0)
            ),
        }
    return {
        "macro_f1": float(f1_score(labels, predictions, average="macro", zero_division=0)),
        "labels": ordered_labels,
        "confusion_matrix": confusion_matrix(labels, predictions, labels=ordered_labels).tolist(),
        "classification_report": classification_report(
            labels,
            predictions,
            labels=ordered_labels,
            output_dict=True,
            zero_division=0,
        ),
        "per_model": per_model,
        "validation_f1": ensemble.validation_f1_,
        "weights": ensemble.weights_,
    }


def train_target(frame: pd.DataFrame, target: str, seed: int) -> tuple[SixModelTextEnsemble, dict[str, Any]]:
    counts = frame[target].value_counts()
    if counts.min() < 6:
        raise ValueError(
            f"Every {target} class needs at least 6 examples for a reliable split and calibration. "
            f"Counts: {counts.to_dict()}"
        )

    train_validation, test = train_test_split(
        frame,
        test_size=0.20,
        stratify=frame[target],
        random_state=seed,
    )
    train, validation = train_test_split(
        train_validation,
        test_size=0.25,
        stratify=train_validation[target],
        random_state=seed,
    )
    min_train_count = int(train[target].value_counts().min())
    calibration_cv = max(2, min(3, min_train_count))
    ensemble = SixModelTextEnsemble(random_state=seed, calibration_cv=calibration_cv)
    ensemble.fit(
        train["text"].tolist(),
        train[target].tolist(),
        validation["text"].tolist(),
        validation[target].tolist(),
    )
    metrics = _evaluate(ensemble, test["text"].tolist(), test[target].tolist())
    metrics["split"] = {
        "train": len(train),
        "validation": len(validation),
        "test": len(test),
    }
    return ensemble, metrics


def train(data_path: Path, output_dir: Path, seed: int = 42) -> dict[str, Any]:
    frame = load_dataset(data_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    category_model, category_metrics = train_target(frame, "category", seed)
    severity_model, severity_metrics = train_target(frame, "severity", seed + 7)
    bundle = {
        "version": "1.0.0",
        "trained_from": data_path.name,
        "row_count": len(frame),
        "category": category_model,
        "severity": severity_model,
        "category_labels": [str(item) for item in category_model.classes_],
        "severity_labels": [str(item) for item in severity_model.classes_],
    }
    joblib.dump(bundle, output_dir / "nagarai_ensemble.joblib")
    metrics = {
        "warning": "Metrics describe only the held-out split of the named dataset; do not generalize them to deployment.",
        "dataset": data_path.name,
        "rows": len(frame),
        "category": category_metrics,
        "severity": severity_metrics,
    }
    (output_dir / "metrics.json").write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Train NagarAI's two six-model ensembles.")
    parser.add_argument("--data", type=Path, default=Path("../data/demo_complaints.csv"))
    parser.add_argument("--output", type=Path, default=Path("artifacts"))
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    metrics = train(args.data, args.output, args.seed)
    summary = {
        "dataset": metrics["dataset"],
        "rows": metrics["rows"],
        "category_macro_f1": metrics["category"]["macro_f1"],
        "severity_macro_f1": metrics["severity"]["macro_f1"],
        "artifact": str(args.output / "nagarai_ensemble.joblib"),
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

