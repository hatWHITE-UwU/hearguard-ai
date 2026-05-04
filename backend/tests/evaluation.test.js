'use strict';

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
});
