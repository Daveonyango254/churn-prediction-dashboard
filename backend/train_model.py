from __future__ import annotations

import json

from backend.config import MODEL_PATH, TRAIN_DATA_PATH
from backend.training import ensure_model_artifact, load_training_frame


def main() -> None:
    frame = load_training_frame(TRAIN_DATA_PATH)
    artifact = ensure_model_artifact(frame, MODEL_PATH, force_retrain=True)

    summary = {
        "model_path": str(MODEL_PATH),
        "trained_at": artifact["trained_at"],
        "metrics": artifact["metrics"],
        "confusion_matrix": artifact["confusion_matrix"],
        "train_size": artifact["train_size"],
        "test_size": artifact["test_size"],
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
