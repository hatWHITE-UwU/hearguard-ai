'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongo;

/** En CI ya hay Mongo; en local usamos instancia en memoria (sin Atlas ni Docker). */
beforeAll(async () => {
  if (process.env.CI === 'true' || process.env.JEST_SKIP_MEMORY === '1') {
    return;
  }
  mongo = await MongoMemoryServer.create({
    instance: { dbName: 'hearguard_test' },
  });
  const base = mongo.getUri().replace(/\/?$/, '');
  process.env.MONGO_URI = `${base}/hearguard_test`;
}, 120000);

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
}, 60000);
