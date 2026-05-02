const mongoose = require('mongoose');
const { getEnv } = require('./env');

mongoose.set('strictQuery', true);

/**
 * Conecta a MongoDB una sola vez; reutiliza conexión activa.
 * En desarrollo reintenta (Atlas IP / red intermitente).
 * @param {{ maxAttempts?: number, delayMs?: number }} [opts]
 * @returns {Promise<typeof mongoose>}
 */
async function connectDatabase(opts = {}) {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  const { MONGO_URI } = getEnv();
  const isTest = process.env.NODE_ENV === 'test';
  const maxAttempts = opts.maxAttempts ?? (isTest ? 1 : 8);
  const delayMs = opts.delayMs ?? 4000;
  /** En test, fallar rápido (evita 30s de serverSelection y timeout del hook Jest). */
  const connectOpts = isTest
    ? { serverSelectionTimeoutMS: 5000, connectTimeoutMS: 5000 }
    : {};

  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(MONGO_URI, connectOpts);
      if (attempt > 1) {
        console.log(`MongoDB conectado (intento ${attempt} de ${maxAttempts})`);
      }
      return mongoose;
    } catch (err) {
      lastErr = err;
      const msg = err?.message?.split('\n')[0] || String(err);
      if (attempt < maxAttempts) {
        console.warn(
          `[MongoDB] ${attempt}/${maxAttempts} falló: ${msg}. Reintento en ${delayMs / 1000}s…`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }
  throw lastErr;
}

module.exports = {
  connectDatabase,
  mongoose,
};
