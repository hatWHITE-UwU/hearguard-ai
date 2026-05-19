'use strict';

// jest.mock is hoisted before require — replaces the module for the controller too.
// Default: both AI calls return ok:false (matches real test env where AI is not running).
jest.mock('../src/services/ai.service', () => {
  const actual = jest.requireActual('../src/services/ai.service');
  return {
    ...actual,
    postPredictRisk: jest.fn().mockResolvedValue({ ok: false, error: new Error('AI no disponible') }),
    postGenerateRecommendations: jest.fn().mockResolvedValue({ ok: false, error: new Error('AI no disponible') }),
  };
});

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const Evaluation = require('../src/models/Evaluation');

async function registerAndLogin(agent, email) {
  const reg = await agent.post('/api/auth/register').send({
    name: 'Eval User',
    email,
    password: 'TestPass1',
  });
  expect(reg.status).toBe(201);
  const login = await agent.post('/api/auth/login').send({
    email,
    password: 'TestPass1',
  });
  expect(login.status).toBe(200);
  return login.body.data.accessToken;
}

function scores12() {
  const hz = [250, 500, 1000, 2000, 4000, 8000];
  const out = [];
  for (const ear of ['left', 'right']) {
    for (const h of hz) {
      out.push({ hz: h, score: 8, ear });
    }
  }
  return out;
}

describe('Evaluations API', () => {
  beforeAll(async () => {
    await connectDatabase();
  });
  afterAll(async () => {
    await Evaluation.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });
  beforeEach(async () => {
    await Evaluation.deleteMany({});
  });

  // ── POST /api/evaluations ────────────────────────────────────────────────────

  describe('POST /api/evaluations', () => {
    it('crea evaluación completa con 12 scores (201)', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `e12_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12(), habitData: { headphoneHours: 2, volumeLevel: 50 } })
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.evaluation.overallScore).toBe(8);
      expect(res.body.data.evaluation.status).toBe('complete');
    });

    it('crea evaluación parcial con menos de 12 scores', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `epartial_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12().slice(0, 6) })
        .expect(201);
      expect(res.body.data.evaluation.status).toBe('partial');
    });

    it('rechaza scores fuera de rango con 400', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `ebad_${Date.now()}@test.com`);
      const bad = scores12();
      bad[0].score = 11;
      await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: bad })
        .expect(400);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app)
        .post('/api/evaluations')
        .send({ frequencyScores: scores12().slice(0, 3) })
        .expect(401);
    });

    it('rechaza frequencyScores vacío con 400', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eempty_${Date.now()}@test.com`);
      await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: [] })
        .expect(400);
    });
  });

  // ── GET /api/evaluations ─────────────────────────────────────────────────────

  describe('GET /api/evaluations', () => {
    it('lista solo las evaluaciones del usuario autenticado', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `elist_${Date.now()}@test.com`);
      await agent.post('/api/evaluations').set('Authorization', `Bearer ${token}`).send({ frequencyScores: scores12().slice(0, 6) });
      await agent.post('/api/evaluations').set('Authorization', `Bearer ${token}`).send({ frequencyScores: scores12().slice(0, 6) });

      const res = await agent
        .get('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
    });

    it('respeta el límite de paginación', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `epage_${Date.now()}@test.com`);
      for (let i = 0; i < 3; i++) {
        await agent.post('/api/evaluations').set('Authorization', `Bearer ${token}`).send({ frequencyScores: scores12().slice(0, 6) });
      }
      const res = await agent
        .get('/api/evaluations?limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.items.length).toBe(1);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/evaluations').expect(401);
    });
  });

  // ── GET /api/evaluations/:id ─────────────────────────────────────────────────

  describe('GET /api/evaluations/:id', () => {
    it('retorna evaluación por id', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `ebyid_${Date.now()}@test.com`);
      const created = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12() })
        .expect(201);
      const id = created.body.data.evaluation._id;

      const res = await agent
        .get(`/api/evaluations/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.evaluation._id).toBe(id);
    });

    it('retorna 404 para id inexistente', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `enotfound_${Date.now()}@test.com`);
      const res = await agent
        .get('/api/evaluations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('rechaza id con formato inválido con 400', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `ebadid_${Date.now()}@test.com`);
      await agent
        .get('/api/evaluations/id-invalido')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/evaluations/507f1f77bcf86cd799439011').expect(401);
    });
  });

  // ── PATCH /api/evaluations/:id ───────────────────────────────────────────────

  describe('PATCH /api/evaluations/:id', () => {
    it('actualiza habitData de una evaluación', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `epatch_${Date.now()}@test.com`);
      const created = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12().slice(0, 6) })
        .expect(201);
      const id = created.body.data.evaluation._id;

      const res = await agent
        .patch(`/api/evaluations/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ habitData: { headphoneHours: 5, volumeLevel: 70 } })
        .expect(200);
      expect(res.body.data.evaluation.habitData.headphoneHours).toBe(5);
    });

    it('retorna 404 para id inexistente en patch', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `epatchnf_${Date.now()}@test.com`);
      const res = await agent
        .patch('/api/evaluations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ habitData: { headphoneHours: 3 } })
        .expect(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('retorna 400 cuando no hay campos actualizables', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `epatchmt_${Date.now()}@test.com`);
      const created = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12().slice(0, 6) })
        .expect(201);
      const id = created.body.data.evaluation._id;

      const res = await agent
        .patch(`/api/evaluations/${id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ campoInvalido: 'valor' })
        .expect(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app)
        .patch('/api/evaluations/507f1f77bcf86cd799439011')
        .send({ habitData: {} })
        .expect(401);
    });
  });

  // ── GET /api/evaluations — skip ──────────────────────────────────────────────

  describe('GET /api/evaluations — skip', () => {
    it('aplica skip correctamente', async () => {
      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eskip_${Date.now()}@test.com`);
      for (let i = 0; i < 3; i++) {
        await agent
          .post('/api/evaluations')
          .set('Authorization', `Bearer ${token}`)
          .send({ frequencyScores: scores12().slice(0, 6) });
      }
      const res = await agent
        .get('/api/evaluations?limit=10&skip=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.skip).toBe(2);
      expect(res.body.data.items.length).toBeLessThanOrEqual(1);
    });
  });

  // ── AI service — mapRiskLevelToEnum (unit) ───────────────────────────────────

  describe('mapRiskLevelToEnum', () => {
    const { mapRiskLevelToEnum } = require('../src/services/ai.service');

    it('convierte "Muy Alto" → muy_alto', () => {
      expect(mapRiskLevelToEnum('Muy Alto')).toBe('muy_alto');
    });
    it('convierte "Alto" → alto', () => {
      expect(mapRiskLevelToEnum('Alto')).toBe('alto');
    });
    it('convierte "Moderado" → moderado', () => {
      expect(mapRiskLevelToEnum('Moderado')).toBe('moderado');
    });
    it('convierte "Bajo" → bajo', () => {
      expect(mapRiskLevelToEnum('Bajo')).toBe('bajo');
    });
    it('default → moderado cuando no reconoce el nivel', () => {
      expect(mapRiskLevelToEnum('')).toBe('moderado');
      expect(mapRiskLevelToEnum('desconocido')).toBe('moderado');
    });
  });

  // ── POST /api/evaluations — con IA mockeada ──────────────────────────────────

  describe('POST /api/evaluations — con IA mockeada', () => {
    const aiService = require('../src/services/ai.service');

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('guarda riskResult y recommendations cuando la IA responde ok', async () => {
      aiService.postPredictRisk.mockResolvedValueOnce({
        ok: true,
        data: {
          riskLevel: 'alto',
          riskScore: 72,
          yearsEstimated: 5,
          confidence: 0.88,
          topFactors: ['auriculares', 'volumen'],
          aiModel: 'v2.0',
        },
      });
      aiService.postGenerateRecommendations.mockResolvedValueOnce({
        ok: true,
        data: { recommendations: ['Reduce volumen', 'Usa protectores'] },
      });

      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eai1_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12(), habitData: { headphoneHours: 4, volumeLevel: 80 } })
        .expect(201);

      expect(res.body.data.riskResult).not.toBeNull();
      expect(res.body.data.riskResult.riskLevel).toBe('alto');
      expect(res.body.data.riskResult.aiModel).toBe('v2.0');
      expect(res.body.data.recommendations).toEqual(['Reduce volumen', 'Usa protectores']);
    });

    it('maneja topFactors no-array y confidence null (branches alternativos)', async () => {
      aiService.postPredictRisk.mockResolvedValueOnce({
        ok: true,
        data: {
          riskLevel: 'bajo',
          riskScore: 18,
          yearsEstimated: 0,
          confidence: null,
          topFactors: 'no-es-array',
          aiModel: 'v1.0',
        },
      });
      aiService.postGenerateRecommendations.mockResolvedValueOnce({
        ok: false,
        error: new Error('AI no disponible'),
      });

      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eai2_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12() })
        .expect(201);

      expect(res.body.data.riskResult.topFactors).toEqual([]);
      expect(res.body.data.recommendations).toEqual([]);
    });

    it('usa rec.data.items cuando no hay rec.data.recommendations', async () => {
      aiService.postPredictRisk.mockResolvedValueOnce({
        ok: true,
        data: {
          riskLevel: 'moderado',
          riskScore: 50,
          yearsEstimated: 3,
          confidence: 0.75,
          topFactors: ['ruido'],
          aiModel: 'v1.0',
        },
      });
      aiService.postGenerateRecommendations.mockResolvedValueOnce({
        ok: true,
        data: { items: ['Evita lugares ruidosos'] },
      });

      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eai3_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12() })
        .expect(201);

      expect(res.body.data.recommendations).toEqual(['Evita lugares ruidosos']);
    });

    it('maneja riskScore fuera de rango [0-100] truncando con Math.min/max', async () => {
      aiService.postPredictRisk.mockResolvedValueOnce({
        ok: true,
        data: {
          riskLevel: 'muy_alto',
          riskScore: 150,
          yearsEstimated: 10,
          confidence: undefined,
          topFactors: [],
          aiModel: 'v1.0',
        },
      });
      aiService.postGenerateRecommendations.mockResolvedValueOnce({
        ok: true,
        data: { recommendations: [] },
      });

      const agent = request.agent(app);
      const token = await registerAndLogin(agent, `eai4_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: scores12() })
        .expect(201);

      expect(res.body.data.riskResult.riskScore).toBe(100);
      expect(res.body.data.riskResult.riskLevel).toBe('muy_alto');
    });
  });
});
