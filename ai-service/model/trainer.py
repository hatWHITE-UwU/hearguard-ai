"""Entrena RandomForest sobre dataset sintético y guarda risk_model.pkl."""

from __future__ import annotations

import os
import random

import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

from model.features import build_feature_vector

SEED = 42
random.seed(SEED)
np.random.seed(SEED)

N_SAMPLES = 5000


def _synthetic_row() -> tuple[list[float], float]:
    age = float(np.random.randint(18, 75))
    headphone_hours = float(np.random.uniform(0, 10))
    volume_level = float(np.random.uniform(10, 100))
    noise_exposure = float(np.random.choice([0.0, 1.0, 2.0], p=[0.5, 0.35, 0.15]))
    occupation_risk = float(np.random.choice([0.0, 1.0, 2.0, 3.0], p=[0.35, 0.25, 0.2, 0.2]))
    smoking = float(np.random.choice([0.0, 1.0, 2.0], p=[0.55, 0.3, 0.15]))
    test_scores = [float(np.random.uniform(0, 10)) for _ in range(6)]
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

    noise = float(np.random.normal(0, 4))
    risk = float(np.clip(risk + noise, 0.0, 100.0))
    return x, risk


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

    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=12,
        random_state=SEED,
        n_jobs=-1,
    )
    model.fit(x_train, y_train)
    score = model.score(x_test, y_test)

    out_dir = os.path.join(os.path.dirname(__file__), "saved")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "risk_model.pkl")
    joblib.dump({"model": model, "r2_holdout": float(score)}, out_path)
    print(f"Modelo guardado en {out_path} (R2 holdout ~ {score:.3f})")
    return out_path


if __name__ == "__main__":
    train_and_save()
