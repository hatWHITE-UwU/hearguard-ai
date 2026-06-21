"""Carga el modelo y expone predicción + recomendaciones."""

from __future__ import annotations

import os
import secrets
from typing import Any

import joblib
import numpy as np

from model.features import build_feature_vector
from model.constants import (
    RISK_LOW_THRESHOLD,
    RISK_MODERATE_THRESHOLD,
    RISK_HIGH_THRESHOLD,
    SCORE_MIN,
    SCORE_MAX,
    NOISE_EXPOSURE_FACTOR_THRESHOLD,
    HEADPHONE_HOURS_FACTOR_THRESHOLD,
    VOLUME_LEVEL_FACTOR_THRESHOLD,
    TEST_SCORE_FACTOR_THRESHOLD,
    TOP_FACTORS_LIMIT,
    CONFIDENCE_MAX,
    CONFIDENCE_BASE,
    CONFIDENCE_R2_WEIGHT,
    YEARS_LOW_MIN,
    YEARS_LOW_RANGE,
    YEARS_MODERATE_MIN,
    YEARS_MODERATE_RANGE,
    YEARS_HIGH_MIN,
    YEARS_HIGH_RANGE,
    YEARS_VERY_HIGH_MIN,
    YEARS_VERY_HIGH_RANGE,
)

_MODEL_BUNDLE: dict | None = None


def _bundle_path() -> str:
    base = os.path.dirname(__file__)
    return os.path.join(base, "saved", "risk_model.pkl")


def load_model() -> dict:
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is None:
        path = _bundle_path()
        if not os.path.isfile(path):
            raise FileNotFoundError(
                f"No existe {path}. Ejecuta: python -m model.trainer"
            )
        _MODEL_BUNDLE = joblib.load(path)
    return _MODEL_BUNDLE


def score_to_level(score: float) -> str:
    s = int(round(float(score)))
    if s <= RISK_LOW_THRESHOLD:
        return "Bajo"
    if s <= RISK_MODERATE_THRESHOLD:
        return "Moderado"
    if s <= RISK_HIGH_THRESHOLD:
        return "Alto"
    return "Muy Alto"


def score_to_years(score: float) -> int:
    s = int(round(float(score)))
    if s <= RISK_LOW_THRESHOLD:
        return secrets.randbelow(YEARS_LOW_RANGE) + YEARS_LOW_MIN
    if s <= RISK_MODERATE_THRESHOLD:
        return secrets.randbelow(YEARS_MODERATE_RANGE) + YEARS_MODERATE_MIN
    if s <= RISK_HIGH_THRESHOLD:
        return secrets.randbelow(YEARS_HIGH_RANGE) + YEARS_HIGH_MIN
    return secrets.randbelow(YEARS_VERY_HIGH_RANGE) + YEARS_VERY_HIGH_MIN


def predict_risk(payload: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model()
    model = bundle["model"]
    vec = np.asarray([build_feature_vector(payload)], dtype=np.float32)
    raw = float(model.predict(vec)[0])
    risk_score = int(round(float(np.clip(raw, SCORE_MIN, SCORE_MAX))))
    level = score_to_level(risk_score)
    years = score_to_years(risk_score)

    factors: list[str] = []
    if float(payload.get("noiseExposure") or 0) >= NOISE_EXPOSURE_FACTOR_THRESHOLD:
        factors.append("Exposición frecuente a ruido")
    if float(payload.get("headphoneHours") or 0) > HEADPHONE_HOURS_FACTOR_THRESHOLD:
        factors.append("Uso prolongado de audífonos")
    if float(payload.get("volumeLevel") or 0) > VOLUME_LEVEL_FACTOR_THRESHOLD:
        factors.append("Alto volumen habitual")
    test_scores = payload.get("testScores") or []
    if test_scores:
        avg = sum(float(x) for x in test_scores) / len(test_scores)
        if avg < TEST_SCORE_FACTOR_THRESHOLD:
            factors.append("Scores bajos en la prueba tonal")
    if not factors:
        factors.append("Perfil general de hábitos auditivos")

    confidence = min(CONFIDENCE_MAX, CONFIDENCE_BASE + bundle.get("r2_holdout", 0.2) * CONFIDENCE_R2_WEIGHT)

    return {
        "riskScore": risk_score,
        "riskLevel": level,
        "yearsEstimated": years,
        "confidence": round(confidence, 2),
        "topFactors": factors[:TOP_FACTORS_LIMIT],
        "aiModel": "risk_rf_v1",
    }


def recommendations_for_level(level: str) -> list[str]:
    lvl = (level or "").lower()
    if "muy" in lvl:
        return [
            "Consulta urgente con un audiólogo (estimación, no diagnóstico).",
            "Usa protección auditiva en ambientes ruidosos.",
            "Reduce o suspende temporalmente el uso de audífonos a alto volumen.",
        ]
    if "alto" in lvl and "muy" not in lvl:
        return [
            "Protección auditiva SIEMPRE en ambientes > 85 dB.",
            "Limita volumen de audífonos al ~50% y descansos cada hora.",
            "Agenda consulta con audiólogo en las próximas semanas.",
        ]
    if "moderado" in lvl:
        return [
            "Reduce exposición a ruidos fuertes y usa tapones cuando sea posible.",
            "Máximo ~3 h/día de audífonos con volumen moderado.",
            "Considera evaluación anual con audiólogo.",
        ]
    return [
        "Mantén volumen de audífonos por debajo del ~60%.",
        "Continúa pruebas auditivas periódicas.",
        "Evita exposición prolongada a ruido sin protección.",
    ]
