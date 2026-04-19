from __future__ import annotations

import os
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
MODELS_DIR = ROOT_DIR / "models"

TRAIN_DATA_PATH = DATA_DIR / "train_churn.csv"
DEMO_DATA_PATH = DATA_DIR / "demo_events.csv"
MODEL_PATH = MODELS_DIR / "churn_random_forest_pipeline.pkl"

APP_NAME = "Churn Platform API"
APP_VERSION = "1.0.0"


def _env_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _env_float(name: str, default: float) -> float:
    raw = os.getenv(name)
    if raw is None:
        return default
    try:
        return float(raw)
    except ValueError:
        return default


def allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "*")
    if raw.strip() == "*":
        return ["*"]
    return [item.strip() for item in raw.split(",") if item.strip()]


MAX_CONCURRENT_DEMO_SESSIONS = _env_int("DEMO_MAX_CONCURRENT_SESSIONS", 4)
MAX_DEMO_EVENTS = _env_int("DEMO_MAX_EVENTS", 12)
DEMO_COOLDOWN_SECONDS = _env_int("DEMO_COOLDOWN_SECONDS", 30)
DEMO_DURATION_SECONDS = _env_int("DEMO_DURATION_SECONDS", 45)
DEMO_EVENT_INTERVAL_SECONDS = _env_float("DEMO_EVENT_INTERVAL_SECONDS", 1.1)
