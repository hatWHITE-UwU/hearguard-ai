const mongoose = require('mongoose');
const { getEnv } = require('./env');

mongoose.set('strictQuery', true);

/**
 * Conecta a MongoDB una sola vez; reutiliza conexión activa.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }
  const { MONGO_URI } = getEnv();
  await mongoose.connect(MONGO_URI);
  return mongoose;
}

module.exports = {
  connectDatabase,
  mongoose,
};
