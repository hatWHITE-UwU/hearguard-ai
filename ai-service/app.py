"""API Flask — predicción de riesgo y recomendaciones."""

from __future__ import annotations

import logging
import os
import time

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from model.predictor import load_model, predict_risk, recommendations_for_level, score_to_level

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","msg":"%(message)s"}',
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("hearguard.ai")

app = Flask(__name__)
# Stateless JWT API — CSRF does not apply (no cookies sent cross-origin).
# Set ALLOWED_ORIGINS=https://your-frontend.com in production.
def _parse_allowed_origins(env_val: str | None) -> list | str:
    if env_val:
        return [o.strip() for o in env_val.split(",") if o.strip()]
    return "*"

_ALLOWED_ORIGINS = _parse_allowed_origins(os.environ.get("ALLOWED_ORIGINS"))
CORS(app, resources={r"/api/*": {"origins": _ALLOWED_ORIGINS}})  # nosonar


@app.before_request
def _log_request():
    request._start = time.monotonic()  # type: ignore[attr-defined]


@app.after_request
def _log_response(response):
    elapsed_ms = round((time.monotonic() - getattr(request, "_start", time.monotonic())) * 1000)
    logger.info(
        "%s %s → %d (%dms)",
        request.method,
        request.path,
        response.status_code,
        elapsed_ms,
    )
    return response


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
        logger.info("predict-risk score=%s level=%s", data.get("riskScore"), data.get("riskLevel"))
        return jsonify({"success": True, "data": data, "message": "Predicción lista"})
    except Exception as exc:  # noqa: BLE001
        logger.exception("predict-risk failed")
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


if __name__ == "__main__":  # pragma: no cover
    port = int(os.environ.get("PORT", "5001"))
    host = os.environ.get("HOST", "0.0.0.0")
    app.run(host=host, port=port, debug=os.environ.get("FLASK_DEBUG") == "1")
