'use strict';

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  verbose: true,
  setupFiles: ['<rootDir>/tests/jest.setup.env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.mongodb.js'],
  // Fase 1: auth + User; modelos IoT/evaluación se cubrirán en fases siguientes.
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/services/ai.service.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
