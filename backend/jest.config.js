'use strict';

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  verbose: true,
  setupFiles: ['<rootDir>/tests/jest.setup.env.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/jest.mongodb.js'],
  // Cubre todos los controllers: auth, noise, evaluation, device.
  coverageReporters: ['lcov', 'text-summary'],
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
