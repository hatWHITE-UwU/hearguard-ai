'use strict';

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const NoiseRecord = require('../src/models/NoiseRecord');
const Device = require('../src/models/Device');

async function login(agent, email) {
  const reg = await agent.post('/api/auth/register').send({
    name: 'N User',
    email,
    password: 'TestPass1',
  });
  expect(reg.status).toBe(201);
  const loginRes = await agent.post('/api/auth/login').send({
    email,
    password: 'TestPass1',
  });
  expect(loginRes.status).toBe(200);
  return loginRes.body.data.accessToken;
}

describe('Noise API', () => {
  beforeAll(async () => {
    await connectDatabase();
  });
  afterAll(async () => {
    await NoiseRecord.deleteMany({});
    await Device.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('POST /api/noise clasifica riskTag bajo/moderado/alto/muy_alto', async () => {
    const agent = request.agent(app);
    const token = await login(agent, `noise1_${Date.now()}@test.com`);
    const cases = [
      [45, 'bajo'],
      [72, 'moderado'],
      [87, 'alto'],
      [105, 'muy_alto'],
    ];
    for (const [db, tag] of cases) {
      const res = await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ dbLevel: db, source: 'app' })
        .expect(201);
      expect(res.body.data.record.riskTag).toBe(tag);
    }
  });

  it('rechaza sin autenticación', async () => {
    await request(app)
      .post('/api/noise')
      .send({ dbLevel: 50, source: 'app' })
      .expect(401);
  });

  it('POST /api/noise/iot con X-Device-Key válido', async () => {
    const agent = request.agent(app);
    const token = await login(agent, `iotuser_${Date.now()}@test.com`);
    const dev = await agent
      .post('/api/devices')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Arduino 1' })
      .expect(201);
    const apiKey = dev.body.data.apiKey;
    const res = await request(app)
      .post('/api/noise/iot')
      .set('X-Device-Key', apiKey)
      .send({ dbLevel: 66 })
      .expect(201);
    expect(res.body.data.record.source).toBe('iot');
  });
});
