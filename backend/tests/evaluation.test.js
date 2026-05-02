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

  it('POST /api/evaluations crea evaluación con 12 scores (201)', async () => {
    const agent = request.agent(app);
    const token = await registerAndLogin(agent, `e12_${Date.now()}@test.com`);
    const res = await agent
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({
        frequencyScores: scores12(),
        habitData: { headphoneHours: 2, volumeLevel: 50 },
      })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.evaluation.overallScore).toBe(8);
    expect(res.body.data.evaluation.status).toBe('complete');
  });

  it('rechaza scores fuera de rango', async () => {
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

  it('rechaza sin autenticación', async () => {
    await request(app).post('/api/evaluations').send({ frequencyScores: scores12().slice(0, 3) }).expect(401);
  });

  it('GET /api/evaluations lista solo del usuario', async () => {
    const agent = request.agent(app);
    const token = await registerAndLogin(agent, `elist_${Date.now()}@test.com`);
    await agent
      .post('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .send({ frequencyScores: scores12().slice(0, 6) })
      .expect(201);
    const res = await agent
      .get('/api/evaluations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
  });
});
