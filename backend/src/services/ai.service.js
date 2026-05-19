'use strict';

const { getEnv } = require('../config/env');

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, error: Error }>}
 */
async function postPredictRisk(payload) {
  const { AI_SERVICE_URL } = getEnv();
  if (!AI_SERVICE_URL) return { ok: false, error: new Error('AI_SERVICE_URL no configurada') };
  const url = `${AI_SERVICE_URL.replace(/\/$/, '')}/api/predict-risk`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: new Error(json.message || `IA predict ${res.status}`),
      };
    }
    return { ok: true, data: json.data || json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, error: Error }>}
 */
async function postGenerateRecommendations(payload) {
  const { AI_SERVICE_URL } = getEnv();
  if (!AI_SERVICE_URL) return { ok: false, error: new Error('AI_SERVICE_URL no configurada') };
  const url = `${AI_SERVICE_URL.replace(/\/$/, '')}/api/generate-recommendations`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: new Error(json.message || `IA recommendations ${res.status}`),
      };
    }
    return { ok: true, data: json.data || json };
  } catch (err) {
    return { ok: false, error: err };
  }
}

/**
 * @param {string} levelTitle
 * @returns {'bajo'|'moderado'|'alto'|'muy_alto'}
 */
function mapRiskLevelToEnum(levelTitle) {
  const s = String(levelTitle || '').toLowerCase();
  if (s.includes('muy')) return 'muy_alto';
  if (s.includes('alto') && !s.includes('muy')) return 'alto';
  if (s.includes('moderado')) return 'moderado';
  if (s.includes('bajo')) return 'bajo';
  return 'moderado';
}

module.exports = {
  postPredictRisk,
  postGenerateRecommendations,
  mapRiskLevelToEnum,
};
