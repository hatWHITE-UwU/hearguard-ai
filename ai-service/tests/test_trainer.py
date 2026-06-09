"""Tests de train_and_save() — verifica artefactos y metadatos generados."""

from __future__ import annotations

import json
import os
import sys

import pytest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)


@pytest.fixture()
def fast_train(tmp_path, monkeypatch):
    """Redirige la carpeta 'saved' a tmp_path y reduce N_SAMPLES a 100."""
    import model.trainer as tr

    monkeypatch.setattr(tr, "N_SAMPLES", 100)

    saved_dir = tmp_path / "saved"
    saved_dir.mkdir()

    original_join = os.path.join

    def patched_join(*parts):
        result = original_join(*parts)
        if "saved" in result and ("risk_model.pkl" in result or "model_metadata.json" in result):
            return str(saved_dir / os.path.basename(result))
        return result

    monkeypatch.setattr("os.path.join", patched_join)
    monkeypatch.setattr("os.makedirs", lambda *a, **kw: None)

    return saved_dir


def test_train_creates_pkl(fast_train):
    from model.trainer import train_and_save
    path = train_and_save()
    assert path.endswith("risk_model.pkl")
    assert os.path.isfile(path)


def test_train_creates_metadata_json(fast_train):
    from model.trainer import train_and_save
    train_and_save()
    meta_path = str(fast_train / "model_metadata.json")
    assert os.path.isfile(meta_path)


def test_metadata_has_required_keys(fast_train):
    from model.trainer import train_and_save
    train_and_save()
    meta_path = str(fast_train / "model_metadata.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    for key in ("model_version", "algorithm", "trained_at", "hyperparameters",
                "features", "dataset", "metrics", "score_range"):
        assert key in meta, f"Falta clave: {key}"


def test_metadata_metrics_valid(fast_train):
    from model.trainer import train_and_save
    train_and_save()
    meta_path = str(fast_train / "model_metadata.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    metrics = meta["metrics"]
    assert 0.0 <= metrics["r2_holdout"] <= 1.0
    assert metrics["mae_holdout"] >= 0.0
    assert metrics["rmse_holdout"] >= 0.0


def test_metadata_features_order(fast_train):
    from model.trainer import train_and_save, FEATURE_NAMES
    train_and_save()
    meta_path = str(fast_train / "model_metadata.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    assert meta["features"] == FEATURE_NAMES
    assert len(meta["features"]) == 8


def test_metadata_dataset_counts(fast_train):
    from model.trainer import train_and_save
    train_and_save()
    meta_path = str(fast_train / "model_metadata.json")
    with open(meta_path, encoding="utf-8") as f:
        meta = json.load(f)

    ds = meta["dataset"]
    assert ds["n_train"] + ds["n_test"] == ds["n_samples"]
    assert ds["source"] == "synthetic"
