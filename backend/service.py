from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

from backend.config import DEMO_DATA_PATH, MODEL_PATH, TRAIN_DATA_PATH
from backend.training import (
    CATEGORICAL_COLUMNS,
    FEATURE_COLUMNS,
    IDENTITY_COLUMN,
    MODEL_INPUT_COLUMNS,
    NUMERIC_COLUMNS,
    PREDICTION_THRESHOLD,
    TARGET_COLUMN,
    ensure_model_artifact,
    load_training_frame,
    prepare_frame,
)
SEGMENT_FIELDS = ("Contract", "InternetService", "PaymentMethod")


def _json_value(value: Any) -> Any:
    if isinstance(value, np.generic):
        return value.item()
    if pd.isna(value):
        return None
    return value


def _safe_record(record: dict[str, Any]) -> dict[str, Any]:
    return {key: _json_value(value) for key, value in record.items()}


def _aggregate_feature_importance(model: Pipeline) -> list[dict[str, Any]]:
    classifier = model.named_steps["classifier"]
    if not hasattr(classifier, "feature_importances_"):
        return []

    preprocessor = model.named_steps["preprocessor"]
    transformed = preprocessor.get_feature_names_out()
    grouped: dict[str, float] = defaultdict(float)

    for name, score in zip(transformed, classifier.feature_importances_):
        raw_name = name.split("__", 1)[-1]
        if name.startswith("cat__"):
            for candidate in CATEGORICAL_COLUMNS:
                prefix = f"{candidate}_"
                if raw_name == candidate or raw_name.startswith(prefix):
                    raw_name = candidate
                    break
        grouped[raw_name] += float(score)

    ranked = sorted(grouped.items(), key=lambda item: item[1], reverse=True)
    return [
        {"feature": feature, "importance": round(score, 4)}
        for feature, score in ranked[:10]
    ]


def _risk_notes(customer: dict[str, Any]) -> list[str]:
    notes: list[str] = []

    contract = customer.get("Contract")
    if contract in {"Month-to-month", "Monthly"}:
        notes.append("Month-to-month contracts trend toward higher churn risk.")

    if customer.get("TechSupport") == "No":
        notes.append("No tech support is a common risk factor in the training data.")

    if customer.get("OnlineSecurity") == "No":
        notes.append("Missing online security often correlates with churn.")

    if customer.get("InternetService") == "Fiber optic":
        notes.append("Fiber optic customers show elevated churn in this dataset.")

    tenure = customer.get("Tenure") or 0
    if isinstance(tenure, (int, float)) and tenure < 12:
        notes.append("Low tenure customers are historically more likely to leave.")

    monthly = customer.get("MonthlyCharges") or 0
    if isinstance(monthly, (int, float)) and monthly >= 80:
        notes.append("Higher monthly charges increase risk for similar customer profiles.")

    if not notes:
        notes.append("This profile aligns with lower-risk patterns seen in the historical dataset.")

    return notes[:3]


@dataclass
class PredictionResult:
    customer: dict[str, Any]
    probability: float
    prediction: str
    risk_notes: list[str]


class ChurnService:
    def __init__(
        self,
        train_path=TRAIN_DATA_PATH,
        demo_path=DEMO_DATA_PATH,
        model_path=MODEL_PATH,
    ) -> None:
        self.train_path = train_path
        self.demo_path = demo_path
        self.model_path = model_path

        historical_source = load_training_frame(self.train_path)
        self.model_artifact = ensure_model_artifact(historical_source, self.model_path)
        self.model = self.model_artifact["pipeline"]
        self.model_metrics = self.model_artifact.get("metrics", {})
        self.model_confusion_matrix = self.model_artifact.get("confusion_matrix", [])

        scored_historical = self._score_frame(historical_source[list(FEATURE_COLUMNS)])
        scored_historical["actual_churn"] = historical_source[TARGET_COLUMN]
        self.historical = scored_historical

        self.demo_seed = prepare_frame(pd.read_csv(self.demo_path), expect_target=False)
        self.feature_importance = _aggregate_feature_importance(self.model)
        self.default_profile = self._build_default_profile(historical_source)
        self.segment_options = self._build_segment_options(historical_source)
        self.predictor_options = self._build_predictor_options(historical_source)

    def _score_frame(self, frame: pd.DataFrame) -> pd.DataFrame:
        prepared = prepare_frame(frame, expect_target=False)
        model_input = prepared[list(MODEL_INPUT_COLUMNS)]
        probabilities = self.model.predict_proba(model_input)[:, 1]
        predictions = np.where(probabilities >= PREDICTION_THRESHOLD, "Yes", "No")

        scored = prepared.copy()
        scored["probability"] = probabilities
        scored["prediction"] = predictions
        return scored

    def _build_default_profile(self, frame: pd.DataFrame) -> dict[str, Any]:
        profile: dict[str, Any] = {}
        for column in MODEL_INPUT_COLUMNS:
            if column in NUMERIC_COLUMNS:
                value = frame[column].median()
                profile[column] = round(float(value), 1) if not pd.isna(value) else 0
            else:
                modes = frame[column].mode(dropna=True)
                profile[column] = None if modes.empty else _json_value(modes.iloc[0])
        return profile

    def _build_segment_options(self, frame: pd.DataFrame) -> list[dict[str, Any]]:
        options: list[dict[str, Any]] = []
        for field in SEGMENT_FIELDS:
            counts = (
                frame[field]
                .fillna("Unknown")
                .astype(str)
                .value_counts()
                .sort_index()
            )
            options.append(
                {
                    "field": field,
                    "label": field.replace("Service", " Service"),
                    "options": [
                        {"value": value, "label": value, "count": int(count)}
                        for value, count in counts.items()
                    ],
                }
            )
        return options

    def _build_predictor_options(self, frame: pd.DataFrame) -> dict[str, Any]:
        option_fields = (
            "Contract",
            "InternetService",
            "TechSupport",
            "OnlineSecurity",
            "PaymentMethod",
            "Partner",
            "Dependents",
            "Gender",
        )

        options: dict[str, Any] = {}
        for column in option_fields:
            values = frame[column].fillna("Unknown").astype(str).sort_values().unique()
            options[column] = values.tolist()

        for column in NUMERIC_COLUMNS:
            series = frame[column].dropna()
            options[column] = {
                "min": float(series.min()),
                "max": float(series.max()),
                "step": 1 if column == "Tenure" else 0.1,
            }

        return options

    def _apply_filters(
        self, filters: dict[str, str] | None = None, search: str | None = None
    ) -> pd.DataFrame:
        filtered = self.historical.copy()

        for field, value in (filters or {}).items():
            if field in SEGMENT_FIELDS and value:
                filtered = filtered[filtered[field].astype(str) == str(value)]

        if search:
            search_value = search.strip().lower()
            filtered = filtered[
                filtered[IDENTITY_COLUMN].astype(str).str.lower().str.contains(search_value)
            ]

        return filtered

    def metadata(self) -> dict[str, Any]:
        return {
            "default_profile": self.default_profile,
            "segment_fields": self.segment_options,
            "predictor_options": self.predictor_options,
            "feature_columns": list(MODEL_INPUT_COLUMNS),
            "historical_rows": int(len(self.historical)),
            "demo_rows": int(len(self.demo_seed)),
            "model_metrics": self.model_metrics,
            "confusion_matrix": self.model_confusion_matrix,
        }

    def overview(self, filters: dict[str, str] | None = None) -> dict[str, Any]:
        frame = self._apply_filters(filters=filters)
        total = int(len(frame))
        avg_probability = float(frame["probability"].mean()) if total else 0.0
        high_risk = int((frame["prediction"] == "Yes").sum())
        actual_churn = int((frame["actual_churn"] == "Yes").sum()) if total else 0

        return {
            "total_customers": total,
            "avg_predicted_risk": round(avg_probability, 3),
            "high_risk_customers": high_risk,
            "high_risk_rate": round(high_risk / total, 3) if total else 0.0,
            "actual_churn_customers": actual_churn,
            "actual_churn_rate": round(actual_churn / total, 3) if total else 0.0,
        }

    def distribution(self, filters: dict[str, str] | None = None) -> list[dict[str, Any]]:
        frame = self._apply_filters(filters=filters)
        bins = np.linspace(0, 1, 11)
        labels = [f"{bins[idx]:.1f}-{bins[idx + 1]:.1f}" for idx in range(len(bins) - 1)]
        counts, _ = np.histogram(frame["probability"], bins=bins)
        return [
            {"bin": labels[index], "count": int(counts[index])}
            for index in range(len(labels))
        ]

    def customers(
        self,
        filters: dict[str, str] | None = None,
        search: str | None = None,
        limit: int = 50,
    ) -> list[dict[str, Any]]:
        frame = self._apply_filters(filters=filters, search=search)
        ordered = frame.sort_values("probability", ascending=False).head(limit)
        records = ordered.to_dict(orient="records")
        return [_safe_record(record) for record in records]

    def predict(self, payload: dict[str, Any]) -> PredictionResult:
        candidate = dict(self.default_profile)
        for column in MODEL_INPUT_COLUMNS:
            if column in payload and payload[column] is not None and payload[column] != "":
                candidate[column] = payload[column]

        if "Tenure" in candidate:
            candidate["Tenure"] = int(float(candidate["Tenure"]))

        row = {IDENTITY_COLUMN: payload.get(IDENTITY_COLUMN, "ad-hoc-customer"), **candidate}
        scored = self._score_frame(pd.DataFrame([row])).iloc[0].to_dict()

        probability = round(float(scored["probability"]), 3)
        prediction = str(scored["prediction"])
        customer = _safe_record({column: scored[column] for column in FEATURE_COLUMNS})

        return PredictionResult(
            customer=customer,
            probability=probability,
            prediction=prediction,
            risk_notes=_risk_notes(customer),
        )

    def score_demo_customer(self, payload: dict[str, Any]) -> dict[str, Any]:
        result = self.predict(payload)
        return {
            "customer": result.customer,
            "probability": result.probability,
            "prediction": result.prediction,
            "risk_notes": result.risk_notes,
        }
