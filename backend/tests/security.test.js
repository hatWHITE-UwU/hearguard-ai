'use strict';

/**
 * Security-focused tests: NoSQL injection, JWT tampering, IDOR, oversized payloads.
 */

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const NoiseRecord = require('../src/models/NoiseRecord');
const Evaluation = require('../src/models/Evaluation');

async function registerAndLogin(email) {
  const agent = request.agent(app);
  await agent
    .post('/api/auth/register')
    .send({ name: 'Sec User', email, password: 'SecurePass1' })
    .expect(201);
  const res = await agent
    .post('/api/auth/login')
    .send({ email, password: 'SecurePass1' })
    .expect(200);
  return { agent, token: res.body.data.accessToken };
}

describe('Security — HearGuard API', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await NoiseRecord.deleteMany({});
    await Evaluation.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await NoiseRecord.deleteMany({});
    await Evaluation.deleteMany({});
  });

  // ── NoSQL Injection ──────────────────────────────────────────────────────────

  describe('NoSQL Injection', () => {
    it('rechaza operador $gt en campo email del login', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'V', email: 'victim@test.com', password: 'ValidPass1' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: { $gt: '' }, password: 'anything' });

      // Debe retornar 400 (validación) o 401 (credenciales), nunca 200
      expect([400, 401]).toContain(res.status);
      expect(res.body.data?.accessToken).toBeUndefined();
    });

    it('rechaza operador $regex en campo email del login', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: { $regex: '.*' }, password: 'anything' });

      expect([400, 401]).toContain(res.status);
      expect(res.body.data?.accessToken).toBeUndefined();
    });

    it('rechaza operador $ne en campo password (no autentica)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'V2', email: 'victim2@test.com', password: 'ValidPass1' });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'victim2@test.com', password: { $ne: null } });

      // Must never return 200 — 400 (validation), 401 (auth fail) or 500 (unhandled object) are all acceptable
      expect(res.status).not.toBe(200);
      expect(res.body.data?.accessToken).toBeUndefined();
    });

    it('rechaza registro con email que contiene operadores mongo', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Attacker', email: { $exists: true }, password: 'ValidPass1' });

      expect([400, 422]).toContain(res.status);
    });
  });

  // ── JWT Tampering ────────────────────────────────────────────────────────────

  describe('JWT Tampering', () => {
    it('rechaza token con firma inválida', async () => {
      const fakeToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
        'eyJpZCI6IjY0YWFhYWFhYWFhYWFhYWFhYWFhYWFhIiwiaWF0IjoxNjAwMDAwMDAwfQ.' +
        'INVALIDSIGNATURE';

      const res = await request(app)
        .get('/api/noise')
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza token sin prefijo Bearer', async () => {
      const { token } = await registerAndLogin(`jwt_nobearer_${Date.now()}@test.com`);
      const res = await request(app)
        .get('/api/noise')
        .set('Authorization', token)
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza token expirado (firmado manualmente con exp pasado)', async () => {
      const jwt = require('jsonwebtoken');
      const secret = process.env.JWT_SECRET || 'test_jwt_secret_min_32_chars_long_abc123';
      const expired = jwt.sign(
        { id: new mongoose.Types.ObjectId().toString() },
        secret,
        { expiresIn: -1 },
      );

      const res = await request(app)
        .get('/api/noise')
        .set('Authorization', `Bearer ${expired}`)
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza token con algoritmo none (alg:none attack)', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({ id: new mongoose.Types.ObjectId().toString(), iat: Date.now() }),
      ).toString('base64url');
      const noneToken = `${header}.${payload}.`;

      const res = await request(app)
        .get('/api/noise')
        .set('Authorization', `Bearer ${noneToken}`)
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  // ── Insecure Direct Object Reference (IDOR) ──────────────────────────────────

  describe('IDOR — aislamiento de datos por usuario', () => {
    it('usuario A no puede ver registros de ruido de usuario B', async () => {
      const emailA = `idor_a_${Date.now()}@test.com`;
      const emailB = `idor_b_${Date.now()}@test.com`;
      const { agent: agentA, token: tokenA } = await registerAndLogin(emailA);
      const { token: tokenB } = await registerAndLogin(emailB);

      // Usuario B crea un registro de ruido
      await agentA
        .post('/api/noise')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ dbLevel: 80, source: 'app' })
        .expect(201);

      // Usuario A consulta sus registros — no debe ver los de B
      const res = await agentA
        .get('/api/noise')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.data.items).toHaveLength(0);
    });

    it('usuario A no puede ver evaluaciones de usuario B', async () => {
      const emailA = `idor_eval_a_${Date.now()}@test.com`;
      const emailB = `idor_eval_b_${Date.now()}@test.com`;
      const { agent: agentA, token: tokenA } = await registerAndLogin(emailA);
      const { token: tokenB } = await registerAndLogin(emailB);

      const scores = ['left', 'right'].flatMap((ear) =>
        [250, 500, 1000, 2000, 4000, 8000].map((hz) => ({ hz, score: 7, ear })),
      );

      await agentA
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ frequencyScores: scores, habitData: { headphoneHours: 2, volumeLevel: 50 } })
        .expect(201);

      const res = await agentA
        .get('/api/evaluations')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.data.items).toHaveLength(0);
    });
  });

  // ── Oversized Payloads ───────────────────────────────────────────────────────

  describe('Oversized Payloads', () => {
    it('rechaza payload mayor a 100KB en /api/auth/register', async () => {
      const bigString = 'x'.repeat(120_000);
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: bigString, email: 'big@test.com', password: 'ValidPass1' });

      // El servidor debe rechazar con 400 o 413
      expect([400, 413]).toContain(res.status);
    });

    it('rechaza array de scores excesivamente largo en /api/evaluations', async () => {
      const { agent, token } = await registerAndLogin(
        `oversize_eval_${Date.now()}@test.com`,
      );
      const hugeScores = Array.from({ length: 10_000 }, () => ({
        hz: 1000,
        score: 5,
        ear: 'left',
      }));

      const res = await agent
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${token}`)
        .send({ frequencyScores: hugeScores, habitData: {} });

      // Debe rechazar validación (400) o entity too large (413), nunca 201
      expect([400, 413]).toContain(res.status);
    });
  });

  // ── Missing Authentication ───────────────────────────────────────────────────

  describe('Rutas protegidas sin token', () => {
    const protectedRoutes = [
      { method: 'get', path: '/api/noise' },
      { method: 'post', path: '/api/noise' },
      { method: 'get', path: '/api/noise/latest' },
      { method: 'get', path: '/api/noise/stats/today' },
      { method: 'get', path: '/api/noise/stats/week' },
      { method: 'get', path: '/api/evaluations' },
      { method: 'post', path: '/api/evaluations' },
      { method: 'get', path: '/api/devices' },
      { method: 'post', path: '/api/devices' },
    ];

    protectedRoutes.forEach(({ method, path }) => {
      it(`${method.toUpperCase()} ${path} devuelve 401 sin token`, async () => {
        const res = await request(app)[method](path).send({});
        expect(res.status).toBe(401);
      });
    });
  });

  // ── XSS — Script tags in name field stored and retrieved safely ──────────────

  describe('XSS — almacenamiento de scripts en campos de texto', () => {
    it('nombre con etiqueta <script> se guarda sin ejecutarse (no HTML encoding requerido en JSON)', async () => {
      const xssName = '<script>alert(1)</script>';
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: xssName, email: `xss_${Date.now()}@test.com`, password: 'ValidPass1' })
        .expect(201);

      // El backend devuelve el nombre como texto plano en JSON — no debe fallar ni ejecutar nada
      // (La sanitización XSS ocurre en el frontend al renderizar, no en la API REST)
      expect(typeof res.body.data.user.name).toBe('string');
    });
  });
});
