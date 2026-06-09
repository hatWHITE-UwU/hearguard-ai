'use strict';

const { BeforeAll, AfterAll, Before } = require('@cucumber/cucumber');

let mongod;

BeforeAll({ timeout: 120000 }, async function () {
  if (process.env.CI !== 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create({ instance: { dbName: 'hearguard_bdd_test' } });
    const base = mongod.getUri().replace(/\/?$/, '');
    process.env.MONGO_URI = `${base}/hearguard_bdd_test`;
  }
  const { connectDatabase } = require('../../backend/src/config/database');
  await connectDatabase();
});

AfterAll({ timeout: 60000 }, async function () {
  const { mongoose } = require('../../backend/src/config/database');
  await mongoose.connection.close();
  if (mongod) await mongod.stop();
});

Before(async function () {
  const { mongoose } = require('../../backend/src/config/database');
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({});
  }
});
