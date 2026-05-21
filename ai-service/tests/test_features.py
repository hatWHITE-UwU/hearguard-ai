"""Tests for features.py — _f helper and build_feature_vector."""

from __future__ import annotations

import os
import sys

import pytest

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from model.features import _f, build_feature_vector  # noqa: E402
from model.constants import DEFAULT_AGE, DEFAULT_VOLUME_LEVEL, DEFAULT_AVG_SCORE  # noqa: E402


def test_f_none_returns_default():
    assert _f(None, 9.5) == 9.5


def test_f_valid_number():
    assert _f(42, 0.0) == 42.0


def test_f_string_number():
    assert _f("3.14", 0.0) == 3.14


def test_f_invalid_string_returns_default():
    """Covers the except (TypeError, ValueError) branch in _f."""
    assert _f("not-a-number", 7.0) == 7.0


def test_f_list_returns_default():
    """list cannot be converted to float — covers except branch."""
    assert _f([1, 2, 3], 5.0) == 5.0


def test_build_feature_vector_empty_payload():
    vec = build_feature_vector({})
    assert len(vec) == 8
    assert vec[0] == DEFAULT_AGE
    assert vec[2] == DEFAULT_VOLUME_LEVEL
    assert vec[6] == DEFAULT_AVG_SCORE


def test_build_feature_vector_full():
    vec = build_feature_vector({
        "age": 30,
        "headphoneHours": 2.0,
        "volumeLevel": 60,
        "noiseExposure": 1,
        "occupationRisk": 1,
        "smoking": 0,
        "testScores": [8, 7, 9, 6, 8, 7],
    })
    assert len(vec) == 8
    assert vec[0] == 30.0
    assert vec[2] == 60.0


def test_build_feature_vector_one_test_score():
    """len(testScores)==1: avg computed from scores, low_freq from lowFreqScore."""
    vec = build_feature_vector({
        "testScores": [8.0],
        "lowFreqScore": 6.5,
    })
    assert vec[6] == 8.0   # avg_test = 8.0 / 1
    assert vec[7] == 6.5   # low_freq taken from lowFreqScore


def test_build_feature_vector_invalid_score_in_list():
    """Invalid item in testScores: _f coerces to 0.0."""
    vec = build_feature_vector({
        "testScores": ["bad", 8.0],
    })
    assert vec[6] == pytest.approx(4.0)  # (0.0 + 8.0) / 2
