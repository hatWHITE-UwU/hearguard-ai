const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/** Variables obligatorias; JWT expiry puede omitirse y usar defaults en readEnv(). */
const requiredKeys = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'FRONTEND_URL'];

function readEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: Number(process.env.PORT) || 3000,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    FRONTEND_URL: process.env.FRONTEND_URL,
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  };
}

let cachedEnv;

function getEnv() {
  if (!cachedEnv) {
    cachedEnv = readEnv();
  }
  // MONGO_URI / NODE_ENV pueden cambiar tras validate (p. ej. Jest + Mongo en memoria).
  return {
    ...cachedEnv,
    NODE_ENV: process.env.NODE_ENV || cachedEnv.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
    AI_SERVICE_URL:
      process.env.AI_SERVICE_URL || cachedEnv.AI_SERVICE_URL,
    FRONTEND_URL: process.env.FRONTEND_URL || cachedEnv.FRONTEND_URL,
  };
}

function validateEnv() {
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }
  const env = readEnv();
  const missing = requiredKeys.filter((key) => {
    const value = process.env[key]; // eslint-disable-line security/detect-object-injection
    return value === undefined || value === '';
  });
  if (missing.length > 0) {
    throw new Error(
      `Variables de entorno faltantes o vacías: ${missing.join(', ')}`,
    );
  }
  cachedEnv = env;
  return env;
}

module.exports = {
  getEnv,
  validateEnv,
};
