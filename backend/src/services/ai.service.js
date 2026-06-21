'use strict';

const { getEnv } = require('../config/env');

const AI_TIMEOUT_MS      = 10_000;
const MAX_RETRIES        = 3;
const RETRY_BASE_MS      = 500;   // backoff: 500 ms, 1 000 ms, 2 000 ms
const CB_FAIL_THRESHOLD  = 5;     // abrir el circuito tras 5 fallos consecutivos
const CB_RECOVERY_MS     = 30_000; // intentar recuperación tras 30 s

// ── Circuit breaker (estado en memoria del proceso) ───────────────────────────
const _cb = {
  state: 'CLOSED',   // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failures: 0,
  openedAt: 0,
};

function _cbRecordSuccess() {
  _cb.failures = 0;
  _cb.state = 'CLOSED';
}

function _cbRecordFailure() {
  _cb.failures += 1;
  if (_cb.failures >= CB_FAIL_THRESHOLD) {
    _cb.state = 'OPEN';
    _cb.openedAt = Date.now();
  }
}

function _cbIsOpen() {
  if (_cb.state === 'CLOSED') return false;
  if (_cb.state === 'OPEN') {
    if (Date.now() - _cb.openedAt >= CB_RECOVERY_MS) {
      _cb.state = 'HALF_OPEN';
      return false; // permitir un intento de recuperación
    }
    return true;
  }
  return false; // HALF_OPEN: permitir el intento
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Ejecuta una petición HTTP POST con reintentos (backoff exponencial) y
 * circuit breaker. Cubre la sub-característica "Capacidad de recuperación"
 * de ISO/IEC 9126 Fiabilidad.
 *
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

  if (_cbIsOpen()) {
    return {
      ok: false,
      error: new Error(`${errorTag}: servicio IA no disponible (circuit breaker OPEN)`),
    };
  }

  const url = `${AI_SERVICE_URL.replace(/\/$/, '')}${pathName}`;
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        // 4xx → error del cliente, no reintentable
        if (res.status >= 400 && res.status < 500) {
          _cbRecordFailure();
          return {
            ok: false,
            error: new Error(json.message || `${errorTag} ${res.status}`),
          };
        }
        // 5xx → reintentable
        lastError = new Error(json.message || `${errorTag} ${res.status}`);
      } else {
        _cbRecordSuccess();
        return { ok: true, data: json.data || json };
      }
    } catch (err) {
      lastError = err;
    }

    if (attempt < MAX_RETRIES) {
      await _sleep(RETRY_BASE_MS * 2 ** (attempt - 1));
    }
  }

  _cbRecordFailure();
  return { ok: false, error: lastError };
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

/** Solo para pruebas unitarias — restablece el estado del circuit breaker. */
function _resetCircuitBreakerForTesting() {
  _cb.state = 'CLOSED';
  _cb.failures = 0;
  _cb.openedAt = 0;
}

module.exports = {
  postPredictRisk,
  postGenerateRecommendations,
  mapRiskLevelToEnum,
  _resetCircuitBreakerForTesting,
};
