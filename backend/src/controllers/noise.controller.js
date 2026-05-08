'use strict';

const { validationResult } = require('express-validator');
const NoiseRecord = require('../models/NoiseRecord');
const Device = require('../models/Device');
const {
  classifyRiskTag,
  statsForToday,
  statsForWeek,
} = require('../services/noise.service');
const {
  HIGH_RISK_DB_THRESHOLD,
  DEFAULT_NOISE_LIMIT,
  MAX_NOISE_LIMIT,
} = require('../config/constants');

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function create(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg,
    });
  }
  try {
    const { dbLevel, source, deviceId, location } = req.body;
    if (deviceId) {
      const dev = await Device.findOne({
        _id: deviceId,
        userId: req.user.id,
      });
      if (!dev) {
        return res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: 'Dispositivo no encontrado',
        });
      }
    }
    const riskTag = classifyRiskTag(dbLevel);
    const highRisk = dbLevel > HIGH_RISK_DB_THRESHOLD;
    const doc = await NoiseRecord.create({
      userId: req.user.id,
      deviceId: deviceId || undefined,
      dbLevel,
      riskTag,
      source,
      location,
      highRisk,
    });
    return res.status(201).json({
      success: true,
      data: { record: doc.toJSON() },
      message: 'Registro de ruido creado',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function createIot(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg,
    });
  }
  try {
    const key = req.header('x-device-key') || req.header('X-Device-Key');
    if (!key) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'X-Device-Key requerido',
      });
    }
    const device = await Device.findOne({ apiKey: key }).select('+apiKey');
    if (!device || !device.isActive) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Dispositivo no válido',
      });
    }
    const { dbLevel } = req.body;
    const riskTag = classifyRiskTag(dbLevel);
    const highRisk = dbLevel > HIGH_RISK_DB_THRESHOLD;
    device.lastSeenAt = new Date();
    await device.save();

    const doc = await NoiseRecord.create({
      userId: device.userId,
      deviceId: device._id,
      dbLevel,
      riskTag,
      source: 'iot',
      highRisk,
    });
    return res.status(201).json({
      success: true,
      data: { record: doc.toJSON() },
      message: 'Registro IoT guardado',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Builds a MongoDB date range filter from raw query strings.
 * Returns null when neither bound produces a valid Date.
 * Vuln-safe: rejects non-string inputs and invalid Date values.
 * @param {unknown} from
 * @param {unknown} to
 * @returns {{ $gte?: Date, $lte?: Date } | null}
 */
function buildDateFilter(from, to) {
  const range = {};
  if (typeof from === 'string') {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) range.$gte = d;
  }
  if (typeof to === 'string') {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) range.$lte = d;
  }
  return Object.keys(range).length > 0 ? range : null;
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function list(req, res, next) {
  try {
    // Vuln-fix: parse to bounded integers — prevents DoS and NoSQL operator injection
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || DEFAULT_NOISE_LIMIT, 1), MAX_NOISE_LIMIT);
    const skip  = Math.max(Number.parseInt(req.query.skip,  10) || 0, 0);

    const filter = { userId: req.user.id };

    if (req.query.from || req.query.to) {
      const range = buildDateFilter(req.query.from, req.query.to);
      if (range) filter.recordedAt = range;
    }

    // Vuln-fix: reject non-string to prevent ?source[$ne]=null NoSQL injection
    if (typeof req.query.source === 'string' && req.query.source.length > 0) {
      filter.source = req.query.source;
    }
    const rows = await NoiseRecord.find(filter)
      .sort({ recordedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await NoiseRecord.countDocuments(filter);
    const avgDb =
      rows.length > 0
        ? rows.reduce((a, r) => a + r.dbLevel, 0) / rows.length
        : 0;
    const maxDb =
      rows.length > 0 ? Math.max(...rows.map((r) => r.dbLevel)) : 0;
    return res.status(200).json({
      success: true,
      data: {
        items: rows,
        total,
        page: { limit, skip },
        avgDb: Math.round(avgDb * 10) / 10,
        maxDb,
      },
      message: 'Historial de ruido',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function latest(req, res, next) {
  try {
    const doc = await NoiseRecord.findOne({ userId: req.user.id })
      .sort({ recordedAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      data: { record: doc },
      message: 'Último registro',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function statsToday(req, res, next) {
  try {
    const data = await statsForToday(NoiseRecord, req.user.id);
    return res.status(200).json({
      success: true,
      data,
      message: 'Estadísticas de hoy',
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function statsWeek(req, res, next) {
  try {
    const data = await statsForWeek(NoiseRecord, req.user.id);
    return res.status(200).json({
      success: true,
      data,
      message: 'Estadísticas de la semana',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  createIot,
  list,
  latest,
  statsToday,
  statsWeek,
};
