'use strict';

const { getEnv } = require('../config/env');

const AI_TIMEOUT_MS = 10_000;

/**
 * POST JSON al servicio Flask de IA. Centraliza headers, timeout y manejo de
 * errores para evitar duplicación entre los distintos endpoints.
 * @param {string} pathName  Ruta relativa, e.g. '/api/predict-risk'.
 * @param {Record<string, unknown>} payload
 * @param {string} errorTag  Prefijo del mensaje de error (ej. 'IA predict').
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, error: Error }>}
 */
async function postJson(pathName, payload, errorTag) {
  const { AI_SERVICE_URL } = getEnv();
  if (!AI_SERVICE_URL) {
    return { ok: false, error: new Error('AI_SERVICE_URL no configurada') };
  }
  const url = `${AI_SERVICE_URL.replace(/\/$/, '')}${pathName}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(AI_TIMEOUT_MS),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: new Error(json.message || `${errorTag} ${res.status}`),
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
function postPredictRisk(payload) {
  return postJson('/api/predict-risk', payload, 'IA predict');
}

/**
 * @param {Record<string, unknown>} payload
 * @returns {Promise<{ ok: true, data: Record<string, unknown> } | { ok: false, error: Error }>}
 */
function postGenerateRecommendations(payload) {
  return postJson('/api/generate-recommendations', payload, 'IA recommendations');
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
