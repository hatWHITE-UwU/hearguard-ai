'use strict';

/**
 * Pruebas unitarias para ai.service.js
 * Cubre: retry con backoff exponencial, circuit breaker y mapRiskLevelToEnum.
 * Sub-característica ISO 9126 cubierta: Capacidad de recuperación (Fiabilidad).
 */

const {
  postPredictRisk,
  postGenerateRecommendations,
  mapRiskLevelToEnum,
  _resetCircuitBreakerForTesting,
} = require('../src/services/ai.service');

// ── Helpers de mock ───────────────────────────────────────────────────────────

function mockFetchOk(data = {}) {
  return jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => data,
  });
}

function mockFetchStatus(status, body = {}) {
  return jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function mockFetchSequence(responses) {
  const spy = jest.spyOn(global, 'fetch');
  responses.forEach(r => {
    if (r instanceof Error) {
      spy.mockRejectedValueOnce(r);
    } else {
      spy.mockResolvedValueOnce({
        ok: r.status >= 200 && r.status < 300,
        status: r.status,
        json: async () => r.body || {},
      });
    }
  });
  return spy;
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  _resetCircuitBreakerForTesting();
  jest.clearAllMocks();
  jest.useRealTimers();
});

// ── postPredictRisk ───────────────────────────────────────────────────────────

describe('postPredictRisk', () => {
  it('devuelve { ok: true, data } cuando Flask responde 200', async () => {
    mockFetchOk({ riskScore: 42, riskLevel: 'moderado' });
    const res = await postPredictRisk({ age: 25 });
    expect(res.ok).toBe(true);
    expect(res.data.riskScore).toBe(42);
  });

  it('devuelve { ok: false } ante una respuesta 500 del servicio IA', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false, status: 500, json: async () => ({ message: 'Internal Server Error' }),
    });
    const p = postPredictRisk({ age: 25 });
    await jest.runAllTimersAsync();
    const res = await p;
    expect(res.ok).toBe(false);
  });
});

// ── Retry con backoff exponencial ─────────────────────────────────────────────

describe('retry — backoff exponencial', () => {
  it('reintenta hasta 3 veces ante error 503 y retorna ok cuando el 3er intento es 200', async () => {
    jest.useFakeTimers();
    mockFetchSequence([
      { status: 503 },
      { status: 503 },
      { status: 200, body: { riskScore: 10 } },
    ]);

    const promise = postPredictRisk({ age: 22 });
    // avanzar los timers de backoff (500 ms + 1000 ms)
    await jest.runAllTimersAsync();
    const res = await promise;

    expect(res.ok).toBe(true);
    expect(res.data.riskScore).toBe(10);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('retorna { ok: false } cuando los 3 intentos fallan con error de red', async () => {
    jest.useFakeTimers();
    mockFetchSequence([
      new Error('ECONNREFUSED'),
      new Error('ECONNREFUSED'),
      new Error('ECONNREFUSED'),
    ]);

    const promise = postPredictRisk({ age: 22 });
    await jest.runAllTimersAsync();
    const res = await promise;

    expect(res.ok).toBe(false);
    expect(res.error.message).toMatch(/ECONNREFUSED/);
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('NO reintenta ante error 400 (error de cliente)', async () => {
    mockFetchStatus(400, { message: 'Bad Request' });
    const res = await postPredictRisk({ age: -1 });
    expect(res.ok).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('NO reintenta ante error 422 (validación)', async () => {
    mockFetchStatus(422, { message: 'Unprocessable Entity' });
    const res = await postPredictRisk({});
    expect(res.ok).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

// ── Circuit breaker ───────────────────────────────────────────────────────────

describe('circuit breaker', () => {
  it('permanece CLOSED tras menos de 5 fallos consecutivos', async () => {
    jest.useFakeTimers();
    // 4 fallos (umbral es 5)
    for (let i = 0; i < 4; i++) {
      mockFetchSequence([
        new Error('red'),
        new Error('red'),
        new Error('red'),
      ]);
      const p = postPredictRisk({});
      await jest.runAllTimersAsync();
      const r = await p;
      expect(r.ok).toBe(false);
      _resetCircuitBreakerForTesting(); // reset para contar solo 1 fallo por iteración
    }

    // El 5.º intento debe llegar al fetch (circuito CLOSED)
    mockFetchOk({ riskScore: 5 });
    const res = await postPredictRisk({});
    expect(res.ok).toBe(true);
  });

  it('abre el circuito tras 5 fallos consecutivos y fast-falla sin llamar a fetch', async () => {
    jest.useFakeTimers();

    // Producir 5 fallos de red (cada postPredictRisk agota sus 3 reintentos)
    for (let i = 0; i < 5; i++) {
      jest.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('red'))
        .mockRejectedValueOnce(new Error('red'))
        .mockRejectedValueOnce(new Error('red'));
      const p = postPredictRisk({});
      await jest.runAllTimersAsync();
      await p;
      jest.clearAllMocks();
    }

    // Ahora el circuito debe estar OPEN → no llama a fetch
    const spy = mockFetchOk({});
    const res = await postPredictRisk({});

    expect(res.ok).toBe(false);
    expect(res.error.message).toMatch(/circuit breaker/i);
    expect(spy).not.toHaveBeenCalled();
  });

  it('pasa a HALF_OPEN y se recupera tras el período de espera', async () => {
    jest.useFakeTimers();

    // Abrir el circuito con 5 fallos
    for (let i = 0; i < 5; i++) {
      jest.spyOn(global, 'fetch')
        .mockRejectedValueOnce(new Error('red'))
        .mockRejectedValueOnce(new Error('red'))
        .mockRejectedValueOnce(new Error('red'));
      const p = postPredictRisk({});
      await jest.runAllTimersAsync();
      await p;
      jest.clearAllMocks();
    }

    // Avanzar 30 segundos → circuito pasa a HALF_OPEN
    jest.advanceTimersByTime(30_000);

    // La siguiente llamada debe llegar a fetch y, si tiene éxito, cerrar el circuito
    mockFetchOk({ riskScore: 20 });
    const res = await postPredictRisk({});

    expect(res.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

// ── postGenerateRecommendations ───────────────────────────────────────────────

describe('postGenerateRecommendations', () => {
  it('devuelve { ok: true, data } cuando Flask responde 200', async () => {
    mockFetchOk({ recommendations: ['Reduce volumen'] });
    const res = await postGenerateRecommendations({ riskLevel: 'alto' });
    expect(res.ok).toBe(true);
    expect(res.data.recommendations).toHaveLength(1);
  });

  it('devuelve { ok: false } ante error de red', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Network error'));
    const p = postGenerateRecommendations({});
    await jest.runAllTimersAsync();
    const res = await p;
    expect(res.ok).toBe(false);
  });
});

// ── mapRiskLevelToEnum ────────────────────────────────────────────────────────

describe('mapRiskLevelToEnum', () => {
  it.each([
    ['Muy Alto',   'muy_alto'],
    ['muy_alto',   'muy_alto'],
    ['Alto',       'alto'],
    ['alto',       'alto'],
    ['Moderado',   'moderado'],
    ['Bajo',       'bajo'],
    ['bajo',       'bajo'],
    ['',           'moderado'],
    [null,         'moderado'],
    [undefined,    'moderado'],
    ['desconocido','moderado'],
  ])('mapRiskLevelToEnum(%s) → %s', (input, expected) => {
    expect(mapRiskLevelToEnum(input)).toBe(expected);
  });
});
