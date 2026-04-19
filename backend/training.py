from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn import __version__ as sklearn_version
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.exceptions import InconsistentVersionWarning
from sklearn.impute import KNNImputer, SimpleImputer
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from backend.config import MODELS_DIR, TRAIN_DATA_PATH


IDENTITY_COLUMN = "customerID"
TARGET_COLUMN = "Churn"
PREDICTION_THRESHOLD = 0.5

NUMERIC_COLUMNS = ("Tenure", "MonthlyCharges", "TotalCharges")
CATEGORICAL_COLUMNS = (
    "Gender",
    "SeniorCitizen",
    "Partner",
    "Dependents",
    "PhoneService",
    "MultipleLines",
    "InternetService",
    "OnlineSecurity",
    "OnlineBackup",
    "DeviceProtection",
    "TechSupport",
    "StreamingTV",
    "StreamingMovies",
    "Contract",
    "PaperlessBilling",
    "PaymentMethod",
)
FEATURE_COLUMNS = (IDENTITY_COLUMN, *NUMERIC_COLUMNS, *CATEGORICAL_COLUMNS)
MODEL_INPUT_COLUMNS = (*NUMERIC_COLUMNS, *CATEGORICAL_COLUMNS)


@dataclass
class TrainingResult:
    pipeline: Pipeline
    evaluation_pipeline: Pipeline
    metrics: dict[str, Any]
    confusion_matrix: list[list[int]]
    classification_report: dict[str, Any]
    train_size: int
    test_size: int


def prepare_frame(frame: pd.DataFrame, expect_target: bool) -> pd.DataFrame:
    prepared = frame.copy()
    prepared.columns = [column.strip() for column in prepared.columns]

    required = [IDENTITY_COLUMN, *MODEL_INPUT_COLUMNS]
    if expect_target:
        required.append(TARGET_COLUMN)

    missing = [column for column in required if column not in prepared.columns]
    if missing:
        raise ValueError(f"Dataset is missing required columns: {', '.join(missing)}")

    for column in NUMERIC_COLUMNS:
        prepared[column] = pd.to_numeric(prepared[column], errors="coerce")

    prepared["SeniorCitizen"] = pd.to_numeric(
        prepared["SeniorCitizen"], errors="coerce"
    ).fillna(0).astype(int)
    prepared[IDENTITY_COLUMN] = prepared[IDENTITY_COLUMN].astype(str)
    return prepared


def load_training_frame(path: Path = TRAIN_DATA_PATH) -> pd.DataFrame:
    return prepare_frame(pd.read_csv(path), expect_target=True)


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                Pipeline(
                    steps=[
                        ("imputer", KNNImputer(n_neighbors=2, weights="distance")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                list(NUMERIC_COLUMNS),
            ),
            (
                "cat",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                list(CATEGORICAL_COLUMNS),
            ),
        ]
    )

    classifier = RandomForestClassifier(
        n_estimators=250,
        max_depth=12,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )

    return Pipeline(
        steps=[("preprocessor", preprocessor), ("classifier", classifier)]
    )


def train_and_evaluate(frame: pd.DataFrame) -> TrainingResult:
    X = frame[list(MODEL_INPUT_COLUMNS)]
    y = frame[TARGET_COLUMN]

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    evaluation_pipeline = build_pipeline()
    evaluation_pipeline.fit(X_train, y_train)

    y_pred = evaluation_pipeline.predict(X_test)
    y_proba = evaluation_pipeline.predict_proba(X_test)[:, 1]
    matrix = confusion_matrix(y_test, y_pred, labels=["No", "Yes"])

    metrics = {
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "precision": round(
            float(precision_score(y_test, y_pred, pos_label="Yes")), 4
        ),
        "recall": round(float(recall_score(y_test, y_pred, pos_label="Yes")), 4),
        "f1": round(float(f1_score(y_test, y_pred, pos_label="Yes")), 4),
        "roc_threshold": PREDICTION_THRESHOLD,
        "positive_rate_test": round(float((y_test == "Yes").mean()), 4),
        "avg_predicted_probability": round(float(np.mean(y_proba)), 4),
    }

    pipeline = build_pipeline()
    pipeline.fit(X, y)

    return TrainingResult(
        pipeline=pipeline,
        evaluation_pipeline=evaluation_pipeline,
        metrics=metrics,
        confusion_matrix=matrix.tolist(),
        classification_report=classification_report(
            y_test, y_pred, output_dict=True, zero_division=0
        ),
        train_size=int(len(X_train)),
        test_size=int(len(X_test)),
    )


def build_model_artifact(result: TrainingResult) -> dict[str, Any]:
    return {
        "pipeline": result.pipeline,
        "sklearn_version": sklearn_version,
        "trained_at": datetime.now(tz=UTC).isoformat(),
        "metrics": result.metrics,
        "confusion_matrix": result.confusion_matrix,
        "classification_report": result.classification_report,
        "feature_columns": list(MODEL_INPUT_COLUMNS),
        "train_size": result.train_size,
        "test_size": result.test_size,
    }


def save_model_artifact(artifact: dict[str, Any], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, path)
    return path


def load_model_artifact(path: Path) -> dict[str, Any] | None:
    if not path.exists():
        return None

    with warnings.catch_warnings():
        warnings.simplefilter("ignore", InconsistentVersionWarning)
        try:
            artifact = joblib.load(path)
        except Exception:
            return None

    if (
        not isinstance(artifact, dict)
        or artifact.get("sklearn_version") != sklearn_version
        or not isinstance(artifact.get("pipeline"), Pipeline)
    ):
        return None

    return artifact


def ensure_model_artifact(
    frame: pd.DataFrame, model_path: Path, force_retrain: bool = False
) -> dict[str, Any]:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    if not force_retrain and model_path.exists():
        if model_path.stat().st_mtime >= TRAIN_DATA_PATH.stat().st_mtime:
            artifact = load_model_artifact(model_path)
            if artifact is not None:
                return artifact

    result = train_and_evaluate(frame)
    artifact = build_model_artifact(result)
    save_model_artifact(artifact, model_path)
    return artifact
