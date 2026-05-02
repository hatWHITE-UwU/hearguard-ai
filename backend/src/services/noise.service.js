'use strict';

/**
 * @param {number} dbLevel
 * @returns {'bajo'|'moderado'|'alto'|'muy_alto'}
 */
function classifyRiskTag(dbLevel) {
  if (dbLevel < 55) return 'bajo';
  if (dbLevel < 75) return 'moderado';
  if (dbLevel < 95) return 'alto';
  return 'muy_alto';
}

/**
 * @param {import('../models/NoiseRecord')} Model
 * @param {import('mongoose').Types.ObjectId} userId
 * @param {Date} [startOfDay]
 */
async function statsForToday(Model, userId, startOfDay = null) {
  const start = startOfDay || new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const rows = await Model.find({
    userId,
    recordedAt: { $gte: start, $lt: end },
  })
    .select('dbLevel recordedAt')
    .lean();

  if (rows.length === 0) {
    return {
      count: 0,
      avgDb: 0,
      maxDb: 0,
      exposureMinutes: 0,
    };
  }

  const sum = rows.reduce((a, r) => a + r.dbLevel, 0);
  const maxDb = Math.max(...rows.map((r) => r.dbLevel));
  /** Aproximación: 1 registro ≈ 1 minuto por encima de 70 dB */
  const exposureMinutes = rows.filter((r) => r.dbLevel > 70).length;

  return {
    count: rows.length,
    avgDb: Math.round((sum / rows.length) * 10) / 10,
    maxDb,
    exposureMinutes,
  };
}

/**
 * @param {import('../models/NoiseRecord')} Model
 * @param {import('mongoose').Types.ObjectId} userId
 */
async function statsForWeek(Model, userId) {
  const start = new Date();
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);

  const rows = await Model.find({
    userId,
    recordedAt: { $gte: start },
  })
    .select('dbLevel')
    .lean();

  if (rows.length === 0) {
    return { count: 0, avgDb: 0, maxDb: 0, exposureMinutes: 0 };
  }

  const sum = rows.reduce((a, r) => a + r.dbLevel, 0);
  const maxDb = Math.max(...rows.map((r) => r.dbLevel));
  const exposureMinutes = rows.filter((r) => r.dbLevel > 70).length;

  return {
    count: rows.length,
    avgDb: Math.round((sum / rows.length) * 10) / 10,
    maxDb,
    exposureMinutes,
  };
}

module.exports = {
  classifyRiskTag,
  statsForToday,
  statsForWeek,
};
