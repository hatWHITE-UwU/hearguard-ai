"""Tests del predictor y utilidades."""

from __future__ import annotations

import os
import sys

import pytest

# Asegura import `model` desde raíz ai-service
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from model.predictor import (  # noqa: E402
    load_model,
    predict_risk,
    recommendations_for_level,
    score_to_level,
)


def test_model_loaded():
    bundle = load_model()
    assert "model" in bundle
    assert bundle.get("r2_holdout", 0) >= 0.8


def test_predict_risk_range():
    out = predict_risk(
        {
            "age": 25,
            "headphoneHours": 1,
            "volumeLevel": 40,
            "noiseExposure": 0,
            "occupationRisk": 0,
            "smoking": 0,
            "testScores": [8, 8, 8, 8, 8, 8],
        }
    )
    assert 0 <= out["riskScore"] <= 100
    assert out["riskLevel"] in {"Bajo", "Moderado", "Alto", "Muy Alto"}


def test_high_risk_profile():
    out = predict_risk(
        {
            "age": 60,
            "headphoneHours": 8,
            "volumeLevel": 95,
            "noiseExposure": 2,
            "occupationRisk": 3,
            "smoking": 2,
            "testScores": [2, 2, 2, 2, 2, 2],
        }
    )
    assert out["riskScore"] > 60


def test_low_risk_profile():
    out = predict_risk(
        {
            "age": 22,
            "headphoneHours": 0.5,
            "volumeLevel": 25,
            "noiseExposure": 0,
            "occupationRisk": 0,
            "smoking": 0,
            "testScores": [9, 9, 9, 9, 9, 9],
        }
    )
    assert out["riskScore"] < 40


def test_score_to_level():
    assert score_to_level(20) == "Bajo"
    assert score_to_level(40) == "Moderado"
    assert score_to_level(65) == "Alto"
    assert score_to_level(85) == "Muy Alto"


def test_missing_data_safe():
    out = predict_risk({})
    assert 0 <= out["riskScore"] <= 100
    assert isinstance(out["topFactors"], list)


def test_recommendations_non_empty():
    assert len(recommendations_for_level("Alto")) >= 1


def test_load_model_raises_when_file_missing(monkeypatch):
    """Covers the FileNotFoundError branch in load_model()."""
    import model.predictor as pred
    saved_bundle = pred._MODEL_BUNDLE
    pred._MODEL_BUNDLE = None  # force re-load
    monkeypatch.setattr("os.path.isfile", lambda _path: False)
    try:
        with pytest.raises(FileNotFoundError):
            pred.load_model()
    finally:
        pred._MODEL_BUNDLE = saved_bundle  # restore cache so other tests are unaffected


def test_score_to_years_all_branches():
    """Cubre las cuatro bandas y verifica que los valores caen en rango."""
    from model.predictor import score_to_years
    assert 20 <= score_to_years(10) <= 30   # Bajo
    assert 7  <= score_to_years(35) <= 15   # Moderado
    assert 3  <= score_to_years(60) <= 7    # Alto
    assert 1  <= score_to_years(90) <= 3    # Muy Alto


def test_score_to_years_is_deterministic():
    """Mismo score produce el mismo resultado en llamadas sucesivas."""
    from model.predictor import score_to_years
    for s in [5, 25, 26, 50, 51, 75, 76, 100]:
        assert score_to_years(s) == score_to_years(s), f"No determinista para score={s}"


def test_score_to_years_monotonic():
    """Mayor score de riesgo → menos años estimados (o igual)."""
    from model.predictor import score_to_years
    scores = [0, 10, 20, 25, 30, 40, 50, 55, 65, 75, 80, 90, 100]
    years  = [score_to_years(s) for s in scores]
    for i in range(len(years) - 1):
        assert years[i] >= years[i + 1], (
            f"No monótono: score {scores[i]}→{years[i]}y > {scores[i+1]}→{years[i+1]}y"
        )
