"""Extracción y normalización de features para el predictor."""

from __future__ import annotations

from typing import Any, Mapping, Sequence

from model.constants import DEFAULT_AGE, DEFAULT_VOLUME_LEVEL, DEFAULT_AVG_SCORE


def _f(value: Any, default: float) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def build_feature_vector(payload: Mapping[str, Any]) -> list[float]:
    """Orden fijo alineado con el entrenamiento."""
    age = _f(payload.get("age"), DEFAULT_AGE)
    headphone_hours = _f(payload.get("headphoneHours"), 0.0)
    volume_level = _f(payload.get("volumeLevel"), DEFAULT_VOLUME_LEVEL)
    noise_exposure = _f(payload.get("noiseExposure"), 0.0)
    occupation_risk = _f(payload.get("occupationRisk"), 0.0)
    smoking = _f(payload.get("smoking"), 0.0)

    test_scores: Sequence[Any] = payload.get("testScores") or []
    if len(test_scores) >= 1:
        avg_test = sum(_f(s, 0.0) for s in test_scores) / len(test_scores)
    else:
        avg_test = _f(payload.get("avgTestScore"), DEFAULT_AVG_SCORE)

    if len(test_scores) >= 2:
        low_freq = (_f(test_scores[0], 0.0) + _f(test_scores[1], 0.0)) / 2.0
    else:
        low_freq = _f(payload.get("lowFreqScore"), avg_test)

    return [
        age,
        headphone_hours,
        volume_level,
        noise_exposure,
        occupation_risk,
        smoking,
        avg_test,
        low_freq,
    ]
