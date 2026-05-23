'use strict';

/**
 * Covers evaluation.controller.js lines 82-107 (applyAiPrediction when pred.ok=true)
 * and the aggregateTestScoresByFrequency `return 0` branch (line 34).
 * Uses jest.mock so the hoisted module replacement intercepts the destructured imports.
 */

jest.mock('../src/services/ai.service', () => ({
  postPredictRisk: jest.fn(),
  postGenerateRecommendations: jest.fn(),
  mapRiskLevelToEnum: jest.fn((level) => {
    const s = String(level || '').toLowerCase();
    if (s.includes('muy')) return 'muy_alto';
    if (s.includes('alto') && !s.includes('muy')) return 'alto';
    if (s.includes('moderado')) return 'moderado';
    if (s.includes('bajo')) return 'bajo';
    return 'moderado';
  }),
}));

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const Evaluation = require('../src/models/Evaluation');
const RiskResult = require('../src/models/RiskResult');
const aiService = require('../src/services/ai.service');

const PREDICT_SUCCESS = {
  ok: true,
  data: {
    riskScore: 75,
    riskLevel: 'alto',
    yearsEstimated: 5,
    confidence: 0.9,
    topFactors: ['Uso prolongado de audífonos', 'Alto volumen'],
    aiModel: 'risk_rf_v1',
  },
};

const RECOMMEND_SUCCESS = {
  ok: true,
  data: { recommendations: ['Usa protección auditiva', 'Reduce volumen al 50%'] },
};

function scores12() {
  const hz = [250, 500, 1000, 2000, 4000, 8000];
  const out = [];
  for (const ear of ['left', 'right']) {
    for (const h of hz) out.push({ hz: h, score: 8, ear });
  }
  return out;
}

function scoresPartialHz() {
  return [
    { hz: 250, score: 8, ear: 'left' },
    { hz: 500, score: 7, ear: 'left' },
  ];
}

async function registerAndLogin(email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'AI User', email, password: 'TestPass1' });
  expect(res.status).toBe(201);
  return res.body.data.accessToken;
}

describe('Evaluation — AI prediction success path', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await RiskResult.deleteMany({});
    await Evaluation.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await RiskResult.deleteMany({});
    await Evaluation.deleteMany({});
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  it('guarda riskResult y recomendaciones cuando pred.ok=true y rec.ok=true', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const token = await registerAndLogin(`aiok_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.riskResult).not.toBeNull();
    expect(res.body.data.riskResult.riskScore).toBe(75);
    expect(res.body.data.recommendations).toHaveLength(2);
  });

  it('maneja confidence null (d.confidence == null → undefined)', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce({
      ok: true,
      data: {
        riskScore: 50,
        riskLevel: 'moderado',
        yearsEstimated: 8,
        confidence: null,
        topFactors: [],
        aiModel: 'v1',
      },
    });
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const token = await registerAndLogin(`nullconf_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.riskResult.riskScore).toBe(50);
  });

  it('maneja topFactors que no es array (usa [] como fallback)', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce({
      ok: true,
      data: {
        riskScore: 30,
        riskLevel: 'bajo',
        yearsEstimated: 15,
        confidence: 0.7,
        topFactors: 'not-an-array',
        aiModel: 'v1',
      },
    });
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const token = await registerAndLogin(`nonarr_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
  });

  it('maneja rec.ok=false (recomendaciones fallidas → lista vacía)', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce({
      ok: false,
      error: new Error('Recommendations service down'),
    });

    const token = await registerAndLogin(`recfail_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.recommendations).toHaveLength(0);
    expect(res.body.data.riskResult).not.toBeNull();
  });

  it('usa rec.data.items cuando rec.data.recommendations no existe', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce({
      ok: true,
      data: { items: ['Usa tapones en conciertos'] },
    });

    const token = await registerAndLogin(`items_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.recommendations).toHaveLength(1);
  });

  it('cubre ramas || 0 y || v1.0 con riskScore=0, yearsEstimated=null y aiModel=null', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce({
      ok: true,
      data: {
        riskScore: 0,
        riskLevel: 'bajo',
        yearsEstimated: null,
        confidence: 0.5,
        topFactors: [],
        aiModel: null,
      },
    });
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const token = await registerAndLogin(`zeroval_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.riskResult.riskScore).toBe(0);
  });

  it('cubre Array.isArray false cuando rec.data.recommendations no es array', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce({
      ok: true,
      data: { recommendations: 'no-es-array' },
    });

    const token = await registerAndLogin(`noarrrec_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.recommendations).toHaveLength(0);
  });

  it('cubre fallback [] cuando rec.data no tiene recommendations ni items', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce({
      ok: true,
      data: {},
    });

    const token = await registerAndLogin(`nokeys_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12() });

    expect(res.status).toBe(201);
    expect(res.body.data.recommendations).toHaveLength(0);
  });

  it('cubre ramas ?? izquierdas con user.age y habitData completos', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const email = `habitage_${Date.now()}@t.com`;
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User', email, password: 'TestPass1', age: 25 });
    expect(reg.status).toBe(201);
    const token = reg.body.data.accessToken;

    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        frequencyScores: scores12(),
        habitData: {
          headphoneHours: 3,
          volumeLevel: 70,
          noiseExposure: 2,
          occupationRisk: 1,
          smoking: 0,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.data.riskResult).not.toBeNull();
  });

  it('cubre return 0 en aggregateTestScoresByFrequency con Hz incompletos', async () => {
    aiService.postPredictRisk.mockResolvedValueOnce(PREDICT_SUCCESS);
    aiService.postGenerateRecommendations.mockResolvedValueOnce(RECOMMEND_SUCCESS);

    const token = await registerAndLogin(`partial_${Date.now()}@t.com`);
    const res = await request(app)
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scoresPartialHz() });

    expect(res.status).toBe(201);
    expect(res.body.data.evaluation.status).toBe('partial');
  });
});
