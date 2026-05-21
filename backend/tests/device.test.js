'use strict';

const request = require('supertest');
const { expectStatus } = require('./supertest-assert');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const Device = require('../src/models/Device');

async function login(agent, email) {
  await agent.post('/api/auth/register').send({ name: 'Dev User', email, password: 'TestPass1' });
  const res = await agent.post('/api/auth/login').send({ email, password: 'TestPass1' });
  return res.body.data.accessToken;
}

describe('Devices API', () => {
  beforeAll(async () => { await connectDatabase(); });
  afterAll(async () => {
    await Device.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });
  afterEach(async () => { await Device.deleteMany({}); });

  // ── POST /api/devices ────────────────────────────────────────────────────────

  describe('POST /api/devices', () => {
    it('crea dispositivo y retorna apiKey única', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_create_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'ESP32 Principal', type: 'esp32' })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.device.name).toBe('ESP32 Principal');
      expect(res.body.data.device.type).toBe('esp32');
      expect(typeof res.body.data.apiKey).toBe('string');
      expect(res.body.data.apiKey.length).toBe(64);
    });

    it('usa tipo arduino por defecto cuando no se especifica', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_default_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Arduino Nano' })
        .expect(201);

      expect(res.body.data.device.type).toBe('arduino');
    });

    it('acepta hardwareId y firmwareVersion opcionales', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_hw_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sensor v2', type: 'esp32', hardwareId: 'ESP32-ABC123', firmwareVersion: '1.2.0' })
        .expect(201);

      expect(res.body.data.device.hardwareId).toBe('ESP32-ABC123');
      expect(res.body.data.device.firmwareVersion).toBe('1.2.0');
    });

    it('rechaza nombre vacío con 400', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_val_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: '' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza tipo inválido con 400', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_type_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Sensor', type: 'raspberry' })
        .expect(400);

      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza sin autenticación con 401', async () => {
      await expectStatus(
        request(app).post('/api/devices').send({ name: 'Sin auth' }),
        401,
      );
    });
  });

  // ── GET /api/devices ─────────────────────────────────────────────────────────

  describe('GET /api/devices', () => {
    it('retorna lista de dispositivos del usuario', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `dev_list_${Date.now()}@test.com`);
      await agent.post('/api/devices').set('Authorization', `Bearer ${token}`).send({ name: 'Dev A' });
      await agent.post('/api/devices').set('Authorization', `Bearer ${token}`).send({ name: 'Dev B' });

      const res = await agent
        .get('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
    });

    it('no retorna dispositivos de otros usuarios', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);
      const token1 = await login(agent1, `dev_iso1_${Date.now()}@test.com`);
      const token2 = await login(agent2, `dev_iso2_${Date.now()}@test.com`);

      await agent1.post('/api/devices').set('Authorization', `Bearer ${token1}`).send({ name: 'Solo mio' });

      const res = await agent2.get('/api/devices').set('Authorization', `Bearer ${token2}`).expect(200);
      expect(res.body.data.items.length).toBe(0);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/devices').expect(401);
    });
  });
});
