"""API Flask — predicción de riesgo y recomendaciones."""

from __future__ import annotations

import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from model.predictor import load_model, predict_risk, recommendations_for_level, score_to_level

load_dotenv()

app = Flask(__name__)
# Stateless JWT API — CSRF does not apply (no cookies sent cross-origin).
# Set ALLOWED_ORIGINS=https://your-frontend.com in production.
_origins_env = os.environ.get("ALLOWED_ORIGINS")
_ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] if _origins_env else None
CORS(app, resources={r"/api/*": {"origins": _ALLOWED_ORIGINS}})  # nosonar


@app.get("/health")
def health():
    try:
        load_model()
        model_state = "loaded"
    except FileNotFoundError:
        model_state = "missing"
    return jsonify({"success": True, "data": {"status": "ok", "model": model_state}})


@app.post("/api/predict-risk")
def predict():
    body = request.get_json(silent=True) or {}
    try:
        data = predict_risk(body)
        return jsonify({"success": True, "data": data, "message": "Predicción lista"})
    except Exception as exc:  # noqa: BLE001
        return (
            jsonify(
                {
                    "success": False,
                    "error": "PREDICT_ERROR",
                    "message": str(exc),
                }
            ),
            500,
        )


@app.post("/api/generate-recommendations")
def recommend():
    body = request.get_json(silent=True) or {}
    level = body.get("riskLevel") or "Moderado"
    if body.get("riskScore") is not None:
        try:
            level = score_to_level(float(body.get("riskScore")))
        except (TypeError, ValueError):
            pass
    items = recommendations_for_level(str(level))
    return jsonify(
        {
            "success": True,
            "data": {"recommendations": items},
            "message": "Recomendaciones generadas",
        }
    )


@app.get("/api/model-info")
def model_info():
    bundle = load_model()
    model = bundle["model"]
    return jsonify(
        {
            "success": True,
            "data": {
                "type": type(model).__name__,
                "features": 8,
                "r2_holdout": bundle.get("r2_holdout"),
            },
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5001"))
    host = os.environ.get("HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
