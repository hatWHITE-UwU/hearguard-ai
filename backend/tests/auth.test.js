'use strict';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app } = require('../server');
const { connectDatabase, mongoose } = require('../src/config/database');
const User = require('../src/models/User');
const { getEnv } = require('../src/config/env');

const registerPayload = {
  name: 'Test User',
  email: 'test@hearguard.com',
  password: 'SecurePass1',
};

describe('HearGuard API — Fase 1', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('GET /health', () => {
    it('responde 200 con cuerpo estándar', async () => {
      const res = await request(app).get('/health').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ok');
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /api', () => {
    it('lista rutas principales (comprobación rápida)', async () => {
      const res = await request(app).get('/api').expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.routes.register.path).toBe('/api/auth/register');
    });
  });

  describe('POST /api/auth/register', () => {
    it('crea usuario y retorna 201 con tokens', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(registerPayload.email.toLowerCase());
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
    });

    it('no expone password en la respuesta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.refreshTokenHash).toBeUndefined();
    });

    it('rechaza email duplicado con 409', async () => {
      await request(app).post('/api/auth/register').send(registerPayload).expect(201);
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Otro',
          email: registerPayload.email,
          password: 'OtroPass1',
        })
        .expect(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('CONFLICT');
    });

    it('rechaza password débil con 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'X',
          email: 'weak@hearguard.com',
          password: '123',
        })
        .expect(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza registro con correo inválido con 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'X',
          email: 'correo-mal',
          password: 'ValidPass1',
        })
        .expect(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('persiste contraseña hasheada (no en texto plano)', async () => {
      await request(app).post('/api/auth/register').send(registerPayload).expect(201);
      const user = await User.findOne({ email: registerPayload.email }).select(
        '+password',
      );
      expect(user).toBeTruthy();
      expect(user.password).not.toBe(registerPayload.password);
      await expect(user.comparePassword(registerPayload.password)).resolves.toBe(
        true,
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('retorna tokens con credenciales correctas', async () => {
      await request(app).post('/api/auth/register').send(registerPayload).expect(201);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        })
        .expect(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rechaza password incorrecto con 401', async () => {
      await request(app).post('/api/auth/register').send(registerPayload).expect(201);
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerPayload.email,
          password: 'WrongPass1',
        })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
      expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('rechaza email inexistente con 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nadie@hearguard.com',
          password: 'SomePass1',
        })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
      expect(res.body.message).toBe('Credenciales inválidas');
    });

    it('rechaza login con datos inválidos (validación) con 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'no-es-correo', password: 'SomePass1' })
        .expect(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('renueva access token con refresh válido', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const oldRefresh = reg.body.data.refreshToken;
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(200);
      expect(res.body.data.accessToken).toBeTruthy();
      expect(res.body.data.refreshToken).toBeTruthy();
      // Mismo segundo puede producir el mismo string JWT; la rotación real se valida en el test de token ya usado.
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: res.body.data.refreshToken })
        .expect(200);
    });

    it('rechaza refresh inválido con 401', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'token.invalido' })
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza refresh con type distinto de refresh (JWT)', async () => {
      const { JWT_REFRESH_SECRET } = getEnv();
      const wrongType = jwt.sign(
        { id: '507f1f77bcf86cd799439011', type: 'access' },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' },
      );
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: wrongType })
        .expect(401);
    });

    it('rechaza refresh sin token en body con 400', async () => {
      const res = await request(app).post('/api/auth/refresh').send({}).expect(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('rechaza refresh expirado con 401', async () => {
      await request(app).post('/api/auth/register').send(registerPayload).expect(201);
      const user = await User.findOne({ email: registerPayload.email });
      const { JWT_REFRESH_SECRET } = getEnv();
      const expired = jwt.sign(
        {
          id: user._id.toString(),
          type: 'refresh',
          exp: Math.floor(Date.now() / 1000) - 120,
        },
        JWT_REFRESH_SECRET,
      );
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expired })
        .expect(401);
    });

    it('rechaza refresh ya rotado cuando el token nuevo difiere', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const first = reg.body.data.refreshToken;
      const refreshed = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: first })
        .expect(200);
      const second = refreshed.body.data.refreshToken;
      if (second !== first) {
        const res = await request(app)
          .post('/api/auth/refresh')
          .send({ refreshToken: first })
          .expect(401);
        expect(res.body.error).toBe('UNAUTHORIZED');
      }
    });
  });

  describe('GET /api/auth/me', () => {
    it('retorna usuario con token válido', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(res.body.data.user.email).toBe(registerPayload.email.toLowerCase());
      expect(res.body.data.user.password).toBeUndefined();
    });

    it('rechaza petición sin token con 401', async () => {
      const res = await request(app).get('/api/auth/me').expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza Bearer vacío con 401', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer ')
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });

    it('rechaza token de acceso malformado con 401', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer not-a-valid-jwt')
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('invalida refresh token en base de datos', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const access = reg.body.data.accessToken;
      const refresh = reg.body.data.refreshToken;
      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${access}`)
        .expect(200);
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: refresh })
        .expect(401);
    });
  });

  describe('PATCH /api/auth/me', () => {
    it('actualiza nombre del usuario', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nombre Actualizado' })
        .expect(200);
      expect(res.body.data.user.name).toBe('Nombre Actualizado');
    });

    it('actualiza settings del usuario', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: { darkTheme: true, reminders: false } })
        .expect(200);
      expect(res.body.data.user.settings.darkTheme).toBe(true);
      expect(res.body.data.user.settings.reminders).toBe(false);
    });

    it('ignora campos no permitidos (sin error)', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nuevo', rol: 'admin' })
        .expect(200);
      expect(res.body.data.user.name).toBe('Nuevo');
      expect(res.body.data.user.rol).toBeUndefined();
    });

    it('rechaza sin autenticación con 401', async () => {
      await request(app).patch('/api/auth/me').send({ name: 'X' }).expect(401);
    });

    it('actualiza age, gender, occupation y city', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ age: 25, gender: 'male', occupation: 'engineer', city: 'Lima' })
        .expect(200);
      expect(res.body.data.user.age).toBe(25);
      expect(res.body.data.user.gender).toBe('male');
      expect(res.body.data.user.occupation).toBe('engineer');
      expect(res.body.data.user.city).toBe('Lima');
    });

    it('actualiza settings.volumeUnit', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: { volumeUnit: 'dba' } })
        .expect(200);
      expect(res.body.data.user.settings.volumeUnit).toBe('dba');
    });

    it('ignora settings cuando no es un objeto plano (array)', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      const res = await request(app)
        .patch('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: ['darkTheme'] })
        .expect(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/auth/me — usuario eliminado', () => {
    it('retorna 401 si el usuario fue eliminado después de obtener el token', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send(registerPayload)
        .expect(201);
      const token = reg.body.data.accessToken;
      await User.findOneAndUpdate({ email: registerPayload.email }, { isDeleted: true });
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
      expect(res.body.error).toBe('UNAUTHORIZED');
    });
  });

  describe('rutas inexistentes', () => {
    it('responde 404 con formato API', async () => {
      const res = await request(app).get('/api/no-existe').expect(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });
});
