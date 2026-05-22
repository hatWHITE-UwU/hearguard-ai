'use strict';

/**
 * Targeted tests for specific uncovered branches in:
 * auth.controller.js, noise.service.js, noise.controller.js, env.js,
 * evaluation.controller.js
 */

const request = require('supertest');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const NoiseRecord = require('../src/models/NoiseRecord');
const Evaluation = require('../src/models/Evaluation');

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
    await Evaluation.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await NoiseRecord.deleteMany({});
    await Evaluation.deleteMany({});
  });

  // ── env.js — validateEnv ──────────────────────────────────────────────────

  describe('env.js — validateEnv', () => {
    it('asigna NODE_ENV development si no está definido', () => {
      const prev = process.env.NODE_ENV;
      delete process.env.NODE_ENV;
      const savedUri = process.env.MONGO_URI;
      const savedJwt = process.env.JWT_SECRET;
      const savedRefresh = process.env.JWT_REFRESH_SECRET;
      const savedFront = process.env.FRONTEND_URL;
      try {
        const { validateEnv } = require('../src/config/env');
        validateEnv();
        expect(process.env.NODE_ENV).toBe('development');
      } finally {
        if (prev === undefined) {
          delete process.env.NODE_ENV;
        } else {
          process.env.NODE_ENV = prev;
        }
        process.env.MONGO_URI = savedUri;
        process.env.JWT_SECRET = savedJwt;
        process.env.JWT_REFRESH_SECRET = savedRefresh;
        process.env.FRONTEND_URL = savedFront;
      }
    });

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

  describe('PATCH /api/auth/me — isPlainObject ramas null y primitivo', () => {
    it('ignora settings=null (val !== null → false)', async () => {
      const { accessToken } = await registerAndLogin(`nullset_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ settings: null })
        .expect(200);
      expect(res.body.success).toBe(true);
    });

    it('ignora settings primitivo string (typeof !== object → false)', async () => {
      const { accessToken } = await registerAndLogin(`strset_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ settings: 'not-an-object' })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/auth/me — settings.volumeUnit', () => {
    it('actualiza volumeUnit en settings', async () => {
      const { accessToken } = await registerAndLogin(`vol_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ settings: { volumeUnit: 'dbc' } })
        .expect(200);
      expect(res.body.data.user.settings.volumeUnit).toBe('dbc');
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

  describe('POST /api/auth/register — error interno', () => {
    it('propaga error distinto de 11000 al manejador', async () => {
      const saveSpy = jest.spyOn(User.prototype, 'save').mockImplementationOnce(() => {
        return Promise.reject(new Error('fallo de base de datos'));
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Err',
        email: `dberr_${Date.now()}@t.com`,
        password: 'TestPass1',
      });
      expect(res.status).toBe(500);
      saveSpy.mockRestore();
    });
  });

  describe('POST /api/auth/register — duplicate key MongoDB', () => {
    it('retorna 409 cuando save lanza código 11000', async () => {
      const saveSpy = jest.spyOn(User.prototype, 'save').mockImplementationOnce(function mockSave() {
        const err = new Error('E11000 duplicate key');
        err.code = 11000;
        return Promise.reject(err);
      });
      const res = await request(app).post('/api/auth/register').send({
        name: 'Dup Key',
        email: `dupkey_${Date.now()}@t.com`,
        password: 'TestPass1',
      });
      expect(res.status).toBe(409);
      expect(res.body.error).toBe('CONFLICT');
      saveSpy.mockRestore();
    });
  });

  describe('POST /api/auth/refresh — hash inválido', () => {
    it('retorna 401 si la comparación de hash falla internamente', async () => {
      const email = `bufhex_${Date.now()}@t.com`;
      const { refreshToken } = await registerAndLogin(email);
      const origFrom = Buffer.from;
      let hexCalls = 0;
      const fromSpy = jest.spyOn(Buffer, 'from').mockImplementation((input, encoding) => {
        if (encoding === 'hex') {
          hexCalls += 1;
          if (hexCalls === 2) {
            throw new TypeError('hex inválido');
          }
        }
        return origFrom.call(Buffer, input, encoding);
      });
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(401);
      fromSpy.mockRestore();
    });

    it('retorna 401 cuando refreshTokenHash tiene longitud distinta al token', async () => {
      const email = `lenhex_${Date.now()}@t.com`;
      const { refreshToken } = await registerAndLogin(email);
      const user = await User.findOne({ email }).select('+refreshTokenHash');
      user.refreshTokenHash = 'aa';
      await user.save();
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('retorna 401 cuando refreshTokenHash no es hex válido', async () => {
      const email = `badhex_${Date.now()}@t.com`;
      const { refreshToken } = await registerAndLogin(email);
      const user = await User.findOne({ email }).select('+refreshTokenHash');
      user.refreshTokenHash = 'not-valid-hex';
      await user.save();
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/refresh — hash no coincide', () => {
    it('retorna 401 cuando refreshTokenHash almacenado difiere del token', async () => {
      const email = `badhash_${Date.now()}@t.com`;
      const { refreshToken } = await registerAndLogin(email);
      const user = await User.findOne({ email }).select('+refreshTokenHash');
      user.refreshTokenHash = 'b'.repeat(64);
      await user.save();
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /api/auth/me — validación', () => {
    it('retorna 400 con datos inválidos', async () => {
      const { accessToken } = await registerAndLogin(`val_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ age: 'no-es-numero' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
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

  describe('POST /api/devices — validación', () => {
    it('retorna 400 sin nombre', async () => {
      const { accessToken } = await registerAndLogin(`devval_${Date.now()}@t.com`);
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ type: 'arduino' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/evaluations — usuario eliminado', () => {
    it('retorna 401 si el usuario ya no existe', async () => {
      const email = `evgone_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      await User.deleteOne({ email });
      const res = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ frequencyScores: scores12() });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /api/evaluations/:id — con riskResult', () => {
    it('incluye riskResult cuando existe', async () => {
      const email = `risk_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      const created = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ frequencyScores: scores12() })
        .expect(201);
      const id = created.body.data.evaluation._id;
      const res = await request(app)
        .get(`/api/evaluations/${id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(res.body.data.evaluation._id).toBe(id);
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

    it('rechaza deviceId con formato inválido', async () => {
      const { accessToken } = await registerAndLogin(`baddev_${Date.now()}@t.com`);
      const res = await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 60, source: 'app', deviceId: 'no-es-object-id' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza deviceId que no es string', async () => {
      const { accessToken } = await registerAndLogin(`baddev2_${Date.now()}@t.com`);
      const res = await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 60, source: 'app', deviceId: ['507f1f77bcf86cd799439011'] });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/deviceId/i);
    });
  });

  describe('PATCH /api/auth/me — usuario inexistente', () => {
    it('retorna 401 si el usuario fue eliminado', async () => {
      const email = `patchgone_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      await User.deleteOne({ email });
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Nuevo' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/evaluations — IA degradada con log', () => {
    it('registra warn cuando predict falla fuera de NODE_ENV=test', async () => {
      const aiService = require('../src/services/ai.service');
      const logger = require('../src/utils/logger');
      const predictSpy = jest
        .spyOn(aiService, 'postPredictRisk')
        .mockResolvedValueOnce({ ok: false, error: new Error('IA caída') });
      const warnSpy = jest.spyOn(logger, 'warn').mockImplementation(() => {});
      const prevEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      try {
        const { accessToken } = await registerAndLogin(`ailog_${Date.now()}@t.com`);
        const res = await request(app)
          .post('/api/evaluations')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ frequencyScores: scores12() });
        expect(res.status).toBe(201);
        expect(warnSpy).toHaveBeenCalled();
      } finally {
        process.env.NODE_ENV = prevEnv;
        predictSpy.mockRestore();
        warnSpy.mockRestore();
      }
    });
  });

  describe('auth.middleware — token vacío', () => {
    it('rechaza Bearer con solo espacios (rama token vacío)', () => {
      const { authenticate } = require('../src/middleware/auth.middleware');
      const req = { headers: { authorization: 'Bearer      ' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();
      authenticate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/evaluations/:id — validación de id', () => {
    it('retorna 400 con id inválido en la ruta', async () => {
      const { accessToken } = await registerAndLogin(`evbad_${Date.now()}@t.com`);
      const res = await request(app)
        .patch('/api/evaluations/no-es-un-id')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'complete' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/noise/iot — errores', () => {
    it('retorna 400 si la validación del body falla', async () => {
      const res = await request(app)
        .post('/api/noise/iot')
        .set('X-Device-Key', 'clave-temporal')
        .send({});
      expect(res.status).toBe(400);
    });

    it('propaga fallo al crear registro IoT', async () => {
      const email = `iotfail_${Date.now()}@t.com`;
      const { accessToken } = await registerAndLogin(email);
      const dev = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'IoT Dev' })
        .expect(201);
      jest.spyOn(NoiseRecord, 'create').mockRejectedValueOnce(new Error('db'));
      const res = await request(app)
        .post('/api/noise/iot')
        .set('X-Device-Key', dev.body.data.apiKey)
        .send({ dbLevel: 70 });
      expect(res.status).toBe(500);
    });
  });

  describe('errores internos — next(err)', () => {
    afterEach(() => jest.restoreAllMocks());

    it('POST /api/auth/refresh propaga fallo al guardar', async () => {
      const { refreshToken } = await registerAndLogin(`rfdb_${Date.now()}@t.com`);
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('db'));
      const res = await request(app).post('/api/auth/refresh').send({ refreshToken });
      expect(res.status).toBe(500);
    });

    it('POST /api/auth/logout propaga fallo al guardar', async () => {
      const { accessToken } = await registerAndLogin(`lodb_${Date.now()}@t.com`);
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('db'));
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('GET /api/auth/me propaga fallo de consulta', async () => {
      const { accessToken } = await registerAndLogin(`medb_${Date.now()}@t.com`);
      const findSpy = jest.spyOn(User, 'findOne');
      findSpy.mockImplementationOnce(() => Promise.reject(new Error('db')));
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
      findSpy.mockRestore();
    });

    it('PATCH /api/auth/me propaga fallo al guardar', async () => {
      const { accessToken } = await registerAndLogin(`patdb_${Date.now()}@t.com`);
      jest.spyOn(User.prototype, 'save').mockRejectedValueOnce(new Error('db'));
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'X' });
      expect(res.status).toBe(500);
    });

    it('GET /api/devices propaga fallo de consulta', async () => {
      const Device = require('../src/models/Device');
      const { accessToken } = await registerAndLogin(`devdb_${Date.now()}@t.com`);
      jest.spyOn(Device, 'find').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const res = await request(app)
        .get('/api/devices')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('POST /api/devices propaga fallo al crear', async () => {
      const Device = require('../src/models/Device');
      const { accessToken } = await registerAndLogin(`cdevdb_${Date.now()}@t.com`);
      jest.spyOn(Device, 'create').mockRejectedValueOnce(new Error('db'));
      const res = await request(app)
        .post('/api/devices')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Sensor' });
      expect(res.status).toBe(500);
    });

    it('GET /api/noise propaga fallo de consulta', async () => {
      jest.spyOn(NoiseRecord, 'find').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const { accessToken } = await registerAndLogin(`nldb_${Date.now()}@t.com`);
      const res = await request(app)
        .get('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('GET /api/noise/latest propaga fallo', async () => {
      jest.spyOn(NoiseRecord, 'findOne').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const { accessToken } = await registerAndLogin(`latdb_${Date.now()}@t.com`);
      const res = await request(app)
        .get('/api/noise/latest')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('POST /api/noise propaga fallo al crear', async () => {
      jest.spyOn(NoiseRecord, 'create').mockRejectedValueOnce(new Error('db'));
      const { accessToken } = await registerAndLogin(`ncdb_${Date.now()}@t.com`);
      const res = await request(app)
        .post('/api/noise')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ dbLevel: 55, source: 'app' });
      expect(res.status).toBe(500);
    });

    it('GET /api/noise/stats/today propaga fallo', async () => {
      jest.spyOn(NoiseRecord, 'find').mockImplementationOnce(() => ({
        select: () => ({
          lean: () => Promise.reject(new Error('db')),
        }),
      }));
      const { accessToken } = await registerAndLogin(`stdb_${Date.now()}@t.com`);
      const res = await request(app)
        .get('/api/noise/stats/today')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('GET /api/noise/stats/week propaga fallo', async () => {
      jest.spyOn(NoiseRecord, 'find').mockImplementationOnce(() => ({
        select: () => ({
          lean: () => Promise.reject(new Error('db')),
        }),
      }));
      const { accessToken } = await registerAndLogin(`swdb_${Date.now()}@t.com`);
      const res = await request(app)
        .get('/api/noise/stats/week')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('POST /api/evaluations propaga fallo al crear', async () => {
      jest.spyOn(Evaluation, 'create').mockRejectedValueOnce(new Error('db'));
      const { accessToken } = await registerAndLogin(`evcdb_${Date.now()}@t.com`);
      const res = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ frequencyScores: scores12() });
      expect(res.status).toBe(500);
    });

    it('GET /api/evaluations propaga fallo', async () => {
      jest.spyOn(Evaluation, 'find').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const { accessToken } = await registerAndLogin(`evldb_${Date.now()}@t.com`);
      const res = await request(app)
        .get('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('GET /api/evaluations/:id propaga fallo', async () => {
      const { accessToken } = await registerAndLogin(`evgdb_${Date.now()}@t.com`);
      const created = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ frequencyScores: scores12() })
        .expect(201);
      jest.spyOn(Evaluation, 'findOne').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const res = await request(app)
        .get(`/api/evaluations/${created.body.data.evaluation._id}`)
        .set('Authorization', `Bearer ${accessToken}`);
      expect(res.status).toBe(500);
    });

    it('PATCH /api/evaluations/:id propaga fallo', async () => {
      const { accessToken } = await registerAndLogin(`evpdb_${Date.now()}@t.com`);
      const created = await request(app)
        .post('/api/evaluations')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ frequencyScores: scores12() })
        .expect(201);
      jest.spyOn(Evaluation, 'findOneAndUpdate').mockImplementationOnce(() => {
        throw new Error('db');
      });
      const res = await request(app)
        .patch(`/api/evaluations/${created.body.data.evaluation._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ status: 'complete' });
      expect(res.status).toBe(500);
    });
  });
});
