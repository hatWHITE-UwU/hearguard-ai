"""Tests de los endpoints Flask de la AI Service."""

from __future__ import annotations

import os
import sys

import pytest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from app import app  # noqa: E402


@pytest.fixture()
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


# ── GET /health ────────────────────────────────────────────────────────────────

class TestHealth:
    def test_returns_200(self, client):
        res = client.get("/health")
        assert res.status_code == 200

    def test_response_schema(self, client):
        data = client.get("/health").get_json()
        assert data["success"] is True
        assert data["data"]["status"] == "ok"
        assert data["data"]["model"] in {"loaded", "missing"}

    def test_model_missing_when_load_fails(self, client, monkeypatch):
        def _missing():
            raise FileNotFoundError("no model")

        monkeypatch.setattr("app.load_model", _missing)
        data = client.get("/health").get_json()
        assert data["data"]["model"] == "missing"


# ── POST /api/predict-risk ─────────────────────────────────────────────────────

class TestPredictRisk:
    _valid_payload = {
        "age": 30,
        "headphoneHours": 2,
        "volumeLevel": 50,
        "noiseExposure": 1,
        "occupationRisk": 1,
        "smoking": 0,
        "testScores": [7, 7, 7, 7, 7, 7],
    }

    def test_returns_200_with_valid_payload(self, client):
        res = client.post("/api/predict-risk", json=self._valid_payload)
        assert res.status_code == 200

    def test_response_schema(self, client):
        data = client.post("/api/predict-risk", json=self._valid_payload).get_json()
        assert data["success"] is True
        assert "riskScore" in data["data"]
        assert "riskLevel" in data["data"]
        assert "topFactors" in data["data"]
        assert "confidence" in data["data"]

    def test_risk_score_in_range(self, client):
        data = client.post("/api/predict-risk", json=self._valid_payload).get_json()
        assert 0 <= data["data"]["riskScore"] <= 100

    def test_risk_level_valid_values(self, client):
        data = client.post("/api/predict-risk", json=self._valid_payload).get_json()
        assert data["data"]["riskLevel"] in {"Bajo", "Moderado", "Alto", "Muy Alto"}

    def test_empty_payload_safe(self, client):
        res = client.post("/api/predict-risk", json={})
        assert res.status_code == 200
        data = res.get_json()
        assert 0 <= data["data"]["riskScore"] <= 100

    def test_no_json_body_safe(self, client):
        res = client.post("/api/predict-risk", data="not-json", content_type="text/plain")
        assert res.status_code == 200

    def test_high_risk_patient_scores_high(self, client):
        payload = {
            "age": 65,
            "headphoneHours": 10,
            "volumeLevel": 100,
            "noiseExposure": 3,
            "occupationRisk": 3,
            "smoking": 2,
            "testScores": [1, 1, 1, 1, 1, 1],
        }
        data = client.post("/api/predict-risk", json=payload).get_json()
        assert data["data"]["riskScore"] > 60

    def test_low_risk_patient_scores_low(self, client):
        payload = {
            "age": 20,
            "headphoneHours": 0,
            "volumeLevel": 20,
            "noiseExposure": 0,
            "occupationRisk": 0,
            "smoking": 0,
            "testScores": [10, 10, 10, 10, 10, 10],
        }
        data = client.post("/api/predict-risk", json=payload).get_json()
        assert data["data"]["riskScore"] < 40

    def test_top_factors_is_list(self, client):
        data = client.post("/api/predict-risk", json=self._valid_payload).get_json()
        assert isinstance(data["data"]["topFactors"], list)

    def test_boundary_age_zero(self, client):
        payload = {**self._valid_payload, "age": 0}
        res = client.post("/api/predict-risk", json=payload)
        assert res.status_code == 200

    def test_boundary_volume_max(self, client):
        payload = {**self._valid_payload, "volumeLevel": 100}
        data = client.post("/api/predict-risk", json=payload).get_json()
        assert 0 <= data["data"]["riskScore"] <= 100

    def test_string_numbers_coerced_or_safe(self, client):
        payload = {**self._valid_payload, "age": "30", "volumeLevel": "50"}
        res = client.post("/api/predict-risk", json=payload)
        # Must not crash with 500
        assert res.status_code in {200, 400}

    def test_predict_internal_error_returns_500(self, client, monkeypatch):
        def _boom(_body):
            raise RuntimeError("model broken")

        monkeypatch.setattr("app.predict_risk", _boom)
        res = client.post("/api/predict-risk", json=self._valid_payload)
        assert res.status_code == 500
        body = res.get_json()
        assert body["success"] is False
        assert body["error"] == "PREDICT_ERROR"


# ── POST /api/generate-recommendations ────────────────────────────────────────

class TestGenerateRecommendations:
    def test_returns_200_with_level(self, client):
        res = client.post("/api/generate-recommendations", json={"riskLevel": "Alto"})
        assert res.status_code == 200

    def test_response_schema(self, client):
        data = client.post(
            "/api/generate-recommendations", json={"riskLevel": "Bajo"}
        ).get_json()
        assert data["success"] is True
        assert isinstance(data["data"]["recommendations"], list)
        assert len(data["data"]["recommendations"]) >= 1

    def test_all_risk_levels(self, client):
        for level in ("Bajo", "Moderado", "Alto", "Muy Alto"):
            data = client.post(
                "/api/generate-recommendations", json={"riskLevel": level}
            ).get_json()
            assert data["success"] is True
            assert len(data["data"]["recommendations"]) >= 1

    def test_uses_risk_score_when_provided(self, client):
        data = client.post(
            "/api/generate-recommendations", json={"riskScore": 85}
        ).get_json()
        # Score 85 → Muy Alto — still returns valid recommendations
        assert data["success"] is True
        assert len(data["data"]["recommendations"]) >= 1

    def test_unknown_level_returns_default(self, client):
        data = client.post(
            "/api/generate-recommendations", json={"riskLevel": "Desconocido"}
        ).get_json()
        assert data["success"] is True

    def test_empty_payload_returns_defaults(self, client):
        res = client.post("/api/generate-recommendations", json={})
        assert res.status_code == 200

    def test_invalid_risk_score_keeps_level_from_body(self, client):
        data = client.post(
            "/api/generate-recommendations",
            json={"riskLevel": "Bajo", "riskScore": "not-a-number"},
        ).get_json()
        assert data["success"] is True
        assert len(data["data"]["recommendations"]) >= 1


# ── GET /api/model-info ────────────────────────────────────────────────────────

class TestModelInfo:
    def test_returns_200(self, client):
        res = client.get("/api/model-info")
        assert res.status_code == 200

    def test_response_schema(self, client):
        data = client.get("/api/model-info").get_json()
        assert data["success"] is True
        assert "type" in data["data"]
        assert data["data"]["features"] == 8
        assert data["data"]["r2_holdout"] is not None

    def test_r2_above_threshold(self, client):
        data = client.get("/api/model-info").get_json()
        assert data["data"]["r2_holdout"] >= 0.8


# ── _parse_allowed_origins ──────────────────────────────────────────────────────

class TestParseAllowedOrigins:
    def test_returns_wildcard_when_no_env(self):
        from app import _parse_allowed_origins
        assert _parse_allowed_origins(None) == "*"

    def test_returns_list_when_env_set(self):
        from app import _parse_allowed_origins
        result = _parse_allowed_origins("http://localhost:4200,https://example.com")
        assert result == ["http://localhost:4200", "https://example.com"]

    def test_strips_whitespace(self):
        from app import _parse_allowed_origins
        result = _parse_allowed_origins(" http://a.com , http://b.com ")
        assert result == ["http://a.com", "http://b.com"]
