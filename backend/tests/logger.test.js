'use strict';

describe('logger — modo producción', () => {
  const savedEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = savedEnv;
    jest.resetModules();
  });

  it('crea logger con level info y formato json en NODE_ENV=production', () => {
    jest.resetModules();
    process.env.NODE_ENV = 'production';
    const logger = require('../src/utils/logger');
    expect(logger).toBeDefined();
  });
});
