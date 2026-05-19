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
  beforeEach(async () => {
    await NoiseRecord.deleteMany({});
  });

  // ── POST /api/noise ──────────────────────────────────────────────────────────

  describe('POST /api/noise', () => {
    it('clasifica riskTag bajo/moderado/alto/muy_alto', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_tag_${Date.now()}@test.com`);
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

    it('rechaza sin autenticación con 401', async () => {
      await request(app)
        .post('/api/noise')
        .send({ dbLevel: 50, source: 'app' })
        .expect(401);
    });

    it('rechaza dbLevel faltante con 400', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_val_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ source: 'app' })
        .expect(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza dbLevel fuera de rango con 400', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_range_${Date.now()}@test.com`);
      await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ dbLevel: 201, source: 'app' })
        .expect(400);
    });

    it('marca highRisk=true cuando dbLevel > 85', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_hr_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ dbLevel: 90, source: 'app' })
        .expect(201);
      expect(res.body.data.record.highRisk).toBe(true);
    });

    it('rechaza deviceId inexistente con 404', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_dev_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ dbLevel: 60, source: 'app', deviceId: '507f1f77bcf86cd799439011' })
        .expect(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  // ── GET /api/noise ───────────────────────────────────────────────────────────

  describe('GET /api/noise', () => {
    it('retorna lista paginada del usuario', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_list_${Date.now()}@test.com`);
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 55, source: 'app' });
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 65, source: 'app' });

      const res = await agent
        .get('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.total).toBeGreaterThanOrEqual(2);
    });

    it('respeta el límite de paginación', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_page_${Date.now()}@test.com`);
      for (let i = 0; i < 5; i++) {
        await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 50 + i, source: 'app' });
      }
      const res = await agent
        .get('/api/noise?limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.items.length).toBe(2);
    });

    it('aplica filtro de source correctamente', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_src_${Date.now()}@test.com`);
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 55, source: 'app' });

      const res = await agent
        .get('/api/noise?source=app')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.items.every((r) => r.source === 'app')).toBe(true);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/noise').expect(401);
    });
  });

  // ── GET /api/noise/latest ────────────────────────────────────────────────────

  describe('GET /api/noise/latest', () => {
    it('retorna el registro más reciente', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_lat_${Date.now()}@test.com`);
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 60, source: 'app' });
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 80, source: 'app' });

      const res = await agent
        .get('/api/noise/latest')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.record).toBeDefined();
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/noise/latest').expect(401);
    });
  });

  // ── GET /api/noise/stats/today ───────────────────────────────────────────────

  describe('GET /api/noise/stats/today', () => {
    it('retorna estadísticas del día', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_today_${Date.now()}@test.com`);
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 65, source: 'app' });

      const res = await agent
        .get('/api/noise/stats/today')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/noise/stats/today').expect(401);
    });
  });

  // ── GET /api/noise/stats/week ────────────────────────────────────────────────

  describe('GET /api/noise/stats/week', () => {
    it('retorna estadísticas de la semana', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_week_${Date.now()}@test.com`);
      const res = await agent
        .get('/api/noise/stats/week')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).get('/api/noise/stats/week').expect(401);
    });
  });

  // ── POST /api/noise/iot ──────────────────────────────────────────────────────

  describe('POST /api/noise/iot', () => {
    it('guarda registro con X-Device-Key válido', async () => {
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

    it('rechaza sin X-Device-Key con 401', async () => {
      const res = await request(app)
        .post('/api/noise/iot')
        .send({ dbLevel: 55 })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza X-Device-Key inválido con 401', async () => {
      const res = await request(app)
        .post('/api/noise/iot')
        .set('X-Device-Key', 'clave-invalida-000')
        .send({ dbLevel: 55 })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza device inactivo con 401', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `iot_inactive_${Date.now()}@test.com`);
      const dev = await agent
        .post('/api/devices')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Dispositivo Inactivo' })
        .expect(201);
      await Device.findByIdAndUpdate(dev.body.data.device.id, { isActive: false });
      const res = await request(app)
        .post('/api/noise/iot')
        .set('X-Device-Key', dev.body.data.apiKey)
        .send({ dbLevel: 55 })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  // ── GET /api/noise — filtros de fecha ────────────────────────────────────────

  describe('GET /api/noise — filtros avanzados', () => {
    it('aplica filtro from/to de fecha correctamente', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_dates_${Date.now()}@test.com`);
      await agent.post('/api/noise').set('Authorization', `Bearer ${token}`).send({ dbLevel: 60, source: 'app' });

      const from = new Date(Date.now() - 60000).toISOString();
      const to = new Date(Date.now() + 60000).toISOString();
      const res = await agent
        .get(`/api/noise?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('ignora from/to con fecha inválida (no falla)', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_badate_${Date.now()}@test.com`);
      const res = await agent
        .get('/api/noise?from=no-es-fecha&to=tampoco')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('retorna avgDb=0 y maxDb=0 cuando no hay registros', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_empty_${Date.now()}@test.com`);
      const res = await agent
        .get('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.avgDb).toBe(0);
      expect(res.body.data.maxDb).toBe(0);
    });
  });

  // ── POST /api/noise — campos opcionales ──────────────────────────────────────

  describe('POST /api/noise — location', () => {
    it('guarda location cuando se incluye', async () => {
      const agent = request.agent(app);
      const token = await login(agent, `noise_loc_${Date.now()}@test.com`);
      const res = await agent
        .post('/api/noise')
        .set('Authorization', `Bearer ${token}`)
        .send({ dbLevel: 70, source: 'app', location: 'Lima Centro' })
        .expect(201);
      expect(res.body.data.record.location).toBe('Lima Centro');
    });
  });
});
