'use strict';

/**
 * Ejecuta antes de cargar el entorno de pruebas.
 * Carga .env del backend y fuerza NODE_ENV=test + base hearguard_test.
 */
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

process.env.NODE_ENV = 'test';

if (process.env.MONGO_URI) {
  process.env.MONGO_URI = process.env.MONGO_URI.replace(
    /\/([^/?]+)(\?.*)?$/,
    (_match, _dbName, querySuffix = '') => `/hearguard_test${querySuffix || ''}`,
  );
}
