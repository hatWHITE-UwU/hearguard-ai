'use strict';

const {
  DB_LOW_THRESHOLD,
  DB_MODERATE_THRESHOLD,
  DB_HIGH_THRESHOLD,
  DB_EXPOSURE_THRESHOLD,
} = require('../config/constants');

/**
 * @param {number} dbLevel
 * @returns {'bajo'|'moderado'|'alto'|'muy_alto'}
 */
function classifyRiskTag(dbLevel) {
  if (dbLevel < DB_LOW_THRESHOLD) return 'bajo';
  if (dbLevel < DB_MODERATE_THRESHOLD) return 'moderado';
  if (dbLevel < DB_HIGH_THRESHOLD) return 'alto';
  return 'muy_alto';
}

/**
 * @param {{ dbLevel: number }[]} rows
 * @returns {{ count: number, avgDb: number, maxDb: number, exposureMinutes: number }}
 */
function computeStats(rows) {
  if (rows.length === 0) {
    return { count: 0, avgDb: 0, maxDb: 0, exposureMinutes: 0 };
  }
  const sum = rows.reduce((a, r) => a + r.dbLevel, 0);
  const maxDb = rows.reduce((m, r) => Math.max(m, r.dbLevel), rows[0].dbLevel);
  const exposureMinutes = rows.filter((r) => r.dbLevel > DB_EXPOSURE_THRESHOLD).length;
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
 * @param {Date} [startOfDay]
 */
async function statsForToday(Model, userId, startOfDay = null) {
  const start = startOfDay ? new Date(startOfDay) : new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const rows = await Model.find({
    userId,
    recordedAt: { $gte: start, $lt: end },
  })
    .select('dbLevel recordedAt')
    .lean();

  return computeStats(rows);
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

  return computeStats(rows);
}

module.exports = {
  classifyRiskTag,
  statsForToday,
  statsForWeek,
};
