'use strict';

module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  forceExit: true,
  verbose: true,
  setupFiles: ['<rootDir>/tests/jest.setup.env.js'],
  // Fase 1: auth + User; modelos IoT/evaluación se cubrirán en fases siguientes.
  collectCoverageFrom: [
    'src/config/env.js',
    'src/controllers/auth.controller.js',
    'src/middleware/auth.middleware.js',
    'src/models/User.js',
    'src/routes/auth.routes.js',
    'src/utils/jwt.utils.js',
    'src/validators/auth.validators.js',
  ],
  coverageThreshold: {
    global: {
      // Ramas en env (caché) y catch 11000 en auth son difíciles sin mocks; líneas/funciones ≥80%.
      branches: 72,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
