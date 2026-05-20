const { connectDatabase } = require('../src/config/database');
const { app } = require('../server');

let dbReady = false;

async function handler(req, res) {
  if (!dbReady) {
    await connectDatabase({ maxAttempts: 3, delayMs: 1000 });
    dbReady = true;
  }
  return app(req, res);
}

module.exports = handler;
