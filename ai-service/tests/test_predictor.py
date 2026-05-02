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
