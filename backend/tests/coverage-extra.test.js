'use strict';

/**
 * Targeted tests for specific uncovered branches in:
 * auth.controller.js, noise.service.js, noise.controller.js, env.js
 */

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const NoiseRecord = require('../src/models/NoiseRecord');

async function registerAndLogin(email) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Extra', email, password: 'TestPass1' });
  expect(res.status).toBe(201);
  return res.body.data; // { accessToken, refreshToken, user }
}

describe('Coverage extras — auth, noise, env', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await NoiseRecord.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await NoiseRecord.deleteMany({});
  });

  // ── env.js — validateEnv ──────────────────────────────────────────────────

  describe('env.js — validateEnv', () => {
    it('lanza error cuando faltan variables requeridas', () => {
      const savedUri = process.env.MONGO_URI;
      const savedJwt = process.env.JWT_SECRET;
      try {
        delete process.env.MONGO_URI;
        delete process.env.JWT_SECRET;
        const { validateEnv } = require('../src/config/env');
        expect(() => validateEnv()).toThrow(/faltantes/);
      } finally {
        process.env.MONGO_URI = savedUri;
        process.env.JWT_SECRET = savedJwt;
      }
    });
  });

  // ── auth.controller.js — ramas adicionales ────────────────────────────────

  describe('PATCH /api/auth/me — settings.volumeUnit', () => {
    it('actualiza volumeUnit en settings', async () => {
      const { accessToken } = await registerAndLogin(`vol_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ settings: { volumeUnit: 'dBA' } })
        .expect(200);
      expect(res.body.data.user.settings.volumeUnit).toBe('dBA');
    });

    it('ignora settings que no es un objeto plano (array)', async () => {
      const { accessToken } = await registerAndLogin(`arr_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ settings: [1, 2, 3] })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/logout — usuario eliminado', () => {
    it('retorna 401 si el usuario fue eliminado antes del logout', async () => {
      const email = `del_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      await User.findOneAndUpdate({ email }, { isDeleted: true });
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/auth/me — usuario eliminado', () => {
    it('retorna 401 si el usuario fue borrado entre auth y me', async () => {
      const email = `me_del_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      await User.findOneAndUpdate({ email }, { isDeleted: true });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/refresh — refreshTokenHash nulo', () => {
    it('retorna 401 cuando refreshTokenHash es null (después de logout)', async () => {
      const email = `nullhash_${Date.now()}@t.com`;
      const { accessToken, refreshToken } = await registerAndLogin(email);
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  // ── noise.service.js — statsForWeek con registros ─────────────────────────

  describe('GET /api/noise/stats/week — con registros', () => {
    it('devuelve métricas reales cuando hay registros esta semana', async () => {
      const email = `wk_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);

      await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 90, source: 'app' });
      await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 50, source: 'app' });

      const res = await request(app)
        .get('/api/noise/stats/week')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.count).toBe(2);
      expect(res.body.data.maxDb).toBe(90);
      expect(res.body.data.avgDb).toBeGreaterThan(0);
      expect(res.body.data.exposureMinutes).toBeGreaterThanOrEqual(1);
    });
  });

  // ── noise.controller.js — date range filter ───────────────────────────────

  describe('GET /api/noise — filtro de fechas', () => {
    it('filtra registros por rango from/to', async () => {
      const email = `dr_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);

      await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 65, source: 'app' });

      const from = new Date(Date.now() - 3_600_000).toISOString();
      const to = new Date(Date.now() + 3_600_000).toISOString();

      const res = await request(app)
        .get(`/api/noise?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });

    it('retorna lista vacía con rango en el futuro', async () => {
      const email = `dr2_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);

      await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 65, source: 'app' });

      const from = new Date(Date.now() + 3_600_000).toISOString();
      const to = new Date(Date.now() + 7_200_000).toISOString();

      const res = await request(app)
        .get(`/api/noise?from=${from}&to=${to}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.data.items.length).toBe(0);
    });
  });
});
