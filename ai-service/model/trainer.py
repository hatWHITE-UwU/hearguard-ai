"""Entrena RandomForest sobre dataset sintético y guarda risk_model.pkl + model_metadata.json."""

from __future__ import annotations

import json
import logging
import os
import random
from datetime import datetime, timezone

_LOG = logging.getLogger(__name__)

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error
from sklearn.model_selection import train_test_split

from model.features import build_feature_vector

FEATURE_NAMES = [
    "age",
    "headphoneHours",
    "volumeLevel",
    "noiseExposure",
    "occupationRisk",
    "smoking",
    "avgTestScore",
    "lowFreqScore",
]

MODEL_VERSION = "risk_rf_v1"

SEED = 42
random.seed(SEED)
_RNG = np.random.default_rng(SEED)

N_SAMPLES = 5000


def _synthetic_row() -> tuple[list[float], float]:
    age = float(_RNG.integers(18, 75))
    headphone_hours = float(_RNG.uniform(0, 10))
    volume_level = float(_RNG.uniform(10, 100))
    noise_exposure = float(_RNG.choice([0.0, 1.0, 2.0], p=[0.5, 0.35, 0.15]))
    occupation_risk = float(_RNG.choice([0.0, 1.0, 2.0, 3.0], p=[0.35, 0.25, 0.2, 0.2]))
    smoking = float(_RNG.choice([0.0, 1.0, 2.0], p=[0.55, 0.3, 0.15]))
    test_scores = [float(_RNG.uniform(0, 10)) for _ in range(6)]
    avg_test = float(np.mean(test_scores))
    low_freq = float((test_scores[0] + test_scores[1]) / 2.0)

    payload = {
        "age": age,
        "headphoneHours": headphone_hours,
        "volumeLevel": volume_level,
        "noiseExposure": noise_exposure,
        "occupationRisk": occupation_risk,
        "smoking": smoking,
        "testScores": test_scores,
        "avgTestScore": avg_test,
        "lowFreqScore": low_freq,
    }
    x = build_feature_vector(payload)

    risk = 15.0
    risk += (age - 30.0) * 0.35
    risk += headphone_hours * 3.2
    risk += max(0.0, volume_level - 55.0) * 0.35
    risk += noise_exposure * 12.0
    risk += occupation_risk * 8.5
    risk += smoking * 7.0
    risk += max(0.0, 7.0 - avg_test) * 6.5
    risk += max(0.0, 6.5 - low_freq) * 4.0
    if occupation_risk >= 3.0:
        risk *= 1.25
    if age > 50 and noise_exposure > 1.0:
        risk += 12.0
    if volume_level > 70 and headphone_hours > 4.0:
        risk += 10.0
    if avg_test < 5.0:
        risk += 22.0

    noise = float(_RNG.normal(0, 4))
    risk = float(np.clip(risk + noise, 0.0, 100.0))
    return x, risk


RF_PARAMS: dict = {
    "n_estimators": 120,
    "max_depth": 12,
    "min_samples_leaf": 1,
    "max_features": 1.0,
    "random_state": SEED,
    "n_jobs": -1,
}


def train_and_save() -> str:
    x_rows: list[list[float]] = []
    y_vals: list[float] = []
    for _ in range(N_SAMPLES):
        x, y = _synthetic_row()
        x_rows.append(x)
        y_vals.append(y)

    x_arr = np.asarray(x_rows, dtype=np.float32)
    y_arr = np.asarray(y_vals, dtype=np.float32)

    x_train, x_test, y_train, y_test = train_test_split(
        x_arr, y_arr, test_size=0.2, random_state=SEED
    )

    model = RandomForestRegressor(**RF_PARAMS)
    model.fit(x_train, y_train)

    y_pred = model.predict(x_test)
    r2 = float(model.score(x_test, y_test))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    out_dir = os.path.join(os.path.dirname(__file__), "saved")
    os.makedirs(out_dir, exist_ok=True)

    out_path = os.path.join(out_dir, "risk_model.pkl")
    joblib.dump({"model": model, "r2_holdout": r2}, out_path)

    metadata = {
        "model_version": MODEL_VERSION,
        "algorithm": "RandomForestRegressor",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "hyperparameters": {k: v for k, v in RF_PARAMS.items() if k != "n_jobs"},
        "features": FEATURE_NAMES,
        "dataset": {
            "n_samples": N_SAMPLES,
            "n_train": len(x_train),
            "n_test": len(x_test),
            "test_size": 0.2,
            "seed": SEED,
            "source": "synthetic",
        },
        "metrics": {
            "r2_holdout": round(r2, 4),
            "mae_holdout": round(mae, 4),
            "rmse_holdout": round(rmse, 4),
        },
        "score_range": {"min": 0, "max": 100},
        "output_file": "risk_model.pkl",
    }
    meta_path = os.path.join(out_dir, "model_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)

    _LOG.info(
        "Modelo guardado en %s | R²=%.3f MAE=%.2f RMSE=%.2f",
        out_path, r2, mae, rmse,
    )
    return out_path


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    train_and_save()
