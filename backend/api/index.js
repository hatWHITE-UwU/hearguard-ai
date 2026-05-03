const { connectDatabase } = require('../src/config/database');
const { app } = require('../server');

let dbReady = false;

module.exports = async (req, res) => {
  if (!dbReady) {
    await connectDatabase({ maxAttempts: 3, delayMs: 1000 });
    dbReady = true;
  }
  return app(req, res);
};
