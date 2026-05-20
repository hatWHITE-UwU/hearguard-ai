'use strict';

/**
 * Antes de cargar tests: .env + NODE_ENV=test.
 * La URI de Mongo para tests la fija tests/jest.mongodb.js (memoria) salvo en CI.
 */
const path = require('node:path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'test';
