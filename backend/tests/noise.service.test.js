'use strict';

const {
  classifyRiskTag,
  statsForToday,
  statsForWeek,
} = require('../src/services/noise.service');
const NoiseRecord = require('../src/models/NoiseRecord');
const { connectDatabase, mongoose } = require('../src/config/database');
const { Types } = require('mongoose');

describe('noise.service', () => {
  beforeAll(async () => {
    await connectDatabase();
  });

  afterAll(async () => {
    await NoiseRecord.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await NoiseRecord.deleteMany({});
  });

  describe('classifyRiskTag', () => {
    it('clasifica muy_alto en umbral alto', () => {
      expect(classifyRiskTag(95)).toBe('muy_alto');
    });
  });

  describe('statsForToday', () => {
    it('retorna ceros sin registros', async () => {
      const userId = new Types.ObjectId();
      const stats = await statsForToday(NoiseRecord, userId);
      expect(stats).toEqual({
        count: 0,
        avgDb: 0,
        maxDb: 0,
        exposureMinutes: 0,
      });
    });

    it('agrega métricas con registros del día', async () => {
      const userId = new Types.ObjectId();
      const now = new Date();
      await NoiseRecord.create([
        { userId, dbLevel: 80, riskTag: 'alto', source: 'app', recordedAt: now },
        { userId, dbLevel: 50, riskTag: 'bajo', source: 'app', recordedAt: now },
      ]);
      const stats = await statsForToday(NoiseRecord, userId, now);
      expect(stats.count).toBe(2);
      expect(stats.maxDb).toBe(80);
      expect(stats.exposureMinutes).toBe(1);
    });
  });

  describe('statsForWeek', () => {
    it('retorna ceros sin registros en la semana', async () => {
      const userId = new Types.ObjectId();
      const stats = await statsForWeek(NoiseRecord, userId);
      expect(stats.count).toBe(0);
      expect(stats.avgDb).toBe(0);
    });
  });
});
