'use strict';

jest.mock('../src/config/env', () => ({
  getEnv: jest.fn(() => ({ MONGO_URI: 'mongodb://127.0.0.1:27017/hearguard_test' })),
}));

jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('connectDatabase', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('reutiliza conexión activa sin llamar a connect (readyState === 1)', async () => {
    const mongoose = {
      connection: { readyState: 1 },
      connect: jest.fn(),
      set: jest.fn(),
    };
    jest.doMock('mongoose', () => mongoose);

    const { connectDatabase } = require('../src/config/database');
    const result = await connectDatabase();

    expect(result).toBe(mongoose);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('conecta en el primer intento en entorno test', async () => {
    const mongoose = {
      connection: { readyState: 0 },
      connect: jest.fn().mockResolvedValue({}),
      set: jest.fn(),
    };
    jest.doMock('mongoose', () => mongoose);

    const { connectDatabase } = require('../src/config/database');
    await connectDatabase();

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(
      'mongodb://127.0.0.1:27017/hearguard_test',
      expect.objectContaining({ serverSelectionTimeoutMS: 5000 }),
    );
  });

  it('reintenta y lanza el último error si todos los intentos fallan', async () => {
    const mongoose = {
      connection: { readyState: 0 },
      connect: jest.fn().mockRejectedValue(new Error('connection refused')),
      set: jest.fn(),
    };
    jest.doMock('mongoose', () => mongoose);

    const { connectDatabase } = require('../src/config/database');
    await expect(connectDatabase({ maxAttempts: 2, delayMs: 1 })).rejects.toThrow(
      'connection refused',
    );
    expect(mongoose.connect).toHaveBeenCalledTimes(2);
  });
});
