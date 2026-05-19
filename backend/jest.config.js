'use strict';

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  verbose: true,
  setupFiles: ['<rootDir>/tests/jest.setup.env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.mongodb.js'],
  // Cubre todos los controllers: auth, noise, evaluation, device.
  coverageReporters: ['lcov', 'text-summary', 'text'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/services/ai.service.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 88,
      lines: 88,
      statements: 88,
    },
  },
};
