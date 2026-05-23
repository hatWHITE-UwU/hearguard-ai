'use strict';

/**
 * Covers uncovered || branches in env.js by mocking dotenv so .env values
 * are not auto-injected, giving full control over process.env in each test.
 */

const ALL_KEYS = [
  'PORT', 'JWT_EXPIRES_IN', 'JWT_REFRESH_EXPIRES_IN', 'NODE_ENV',
  'MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL', 'AI_SERVICE_URL',
];

describe('env.js — ramas de fallback (dotenv mockeado)', () => {
  const saved = {};

  beforeEach(() => {
    ALL_KEYS.forEach((k) => { saved[k] = process.env[k]; });
    jest.resetModules();
    jest.doMock('dotenv', () => ({ config: jest.fn() }));
  });

  afterEach(() => {
    ALL_KEYS.forEach((k) => {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    });
    jest.resetModules();
  });

  it('usa PORT definido — Number(PORT) || 3000 rama izquierda', () => {
    process.env.PORT = '4321';
    const { getEnv } = require('../src/config/env');
    expect(getEnv().PORT).toBe(4321);
  });

  it('usa fallback 3000 cuando PORT no está definido — rama derecha', () => {
    delete process.env.PORT;
    const { getEnv } = require('../src/config/env');
    expect(getEnv().PORT).toBe(3000);
  });

  it('usa JWT_EXPIRES_IN definido — rama izquierda', () => {
    process.env.JWT_EXPIRES_IN = '30m';
    const { getEnv } = require('../src/config/env');
    expect(getEnv().JWT_EXPIRES_IN).toBe('30m');
  });

  it('usa fallback "15m" cuando JWT_EXPIRES_IN no está — rama derecha', () => {
    delete process.env.JWT_EXPIRES_IN;
    const { getEnv } = require('../src/config/env');
    expect(getEnv().JWT_EXPIRES_IN).toBe('15m');
  });

  it('usa JWT_REFRESH_EXPIRES_IN definido — rama izquierda', () => {
    process.env.JWT_REFRESH_EXPIRES_IN = '14d';
    const { getEnv } = require('../src/config/env');
    expect(getEnv().JWT_REFRESH_EXPIRES_IN).toBe('14d');
  });

  it('usa fallback "7d" cuando JWT_REFRESH_EXPIRES_IN no está — rama derecha', () => {
    delete process.env.JWT_REFRESH_EXPIRES_IN;
    const { getEnv } = require('../src/config/env');
    expect(getEnv().JWT_REFRESH_EXPIRES_IN).toBe('7d');
  });

  it('usa "development" como fallback y cubre ramas derechas de AI_SERVICE_URL y FRONTEND_URL', () => {
    delete process.env.NODE_ENV;
    delete process.env.AI_SERVICE_URL;
    delete process.env.FRONTEND_URL;
    const { getEnv } = require('../src/config/env');
    const env = getEnv();
    expect(env.NODE_ENV).toBe('development');
  });

  it('detecta variable vacía en validateEnv — value === "" rama derecha', () => {
    process.env.MONGO_URI = '';
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_REFRESH_SECRET = 'refresh';
    process.env.FRONTEND_URL = 'http://localhost';
    const { validateEnv } = require('../src/config/env');
    expect(() => validateEnv()).toThrow(/faltantes/);
  });
});
