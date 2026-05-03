'use strict';

const { validationResult } = require('express-validator');
const Evaluation = require('../models/Evaluation');
const RiskResult = require('../models/RiskResult');
const User = require('../models/User');
const {
  postPredictRisk,
  postGenerateRecommendations,
  mapRiskLevelToEnum,
} = require('../services/ai.service');

const HZ_ORDER = [250, 500, 1000, 2000, 4000, 8000];

/**
 * @param {{ hz: number, score: number, ear: string }[]} frequencyScores
 * @returns {number[]}
 */
function aggregateTestScoresByFrequency(frequencyScores) {
  const byHz = new Map();
  for (const row of frequencyScores) {
    const list = byHz.get(row.hz) || [];
    list.push(row.score);
    byHz.set(row.hz, list);
  }
  return HZ_ORDER.map((hz) => {
    const list = byHz.get(hz);
    if (!list || list.length === 0) return 0;
    return list.reduce((a, b) => a + b, 0) / list.length;
  });
}

/**
 * @param {number[]} freqAvgs
 */
function lowFreqAverage(freqAvgs) {
  return (freqAvgs[0] + freqAvgs[1]) / 2;
}

/**
 * @param {import('mongoose').Document} user
 * @param {import('mongoose').Document} evaluation
 */
function buildAiPayload(user, evaluation) {
  const freqAvgs = aggregateTestScoresByFrequency(evaluation.frequencyScores);
  const habit = evaluation.habitData || {};
  return {
    age: user.age != null ? Number(user.age) : 28,
    headphoneHours: habit.headphoneHours != null ? Number(habit.headphoneHours) : 0,
    volumeLevel: habit.volumeLevel != null ? Number(habit.volumeLevel) : 40,
    noiseExposure: habit.noiseExposure != null ? Number(habit.noiseExposure) : 0,
    occupationRisk:
      habit.occupationRisk != null ? Number(habit.occupationRisk) : 0,
    smoking: habit.smoking != null ? Number(habit.smoking) : 0,
    testScores: freqAvgs,
    habitData: habit,
    avgTestScore:
      freqAvgs.reduce((a, b) => a + b, 0) / (freqAvgs.length || 1),
    lowFreqScore: lowFreqAverage(freqAvgs),
  };
}

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
      message: errors.array()[0]?.msg || 'Datos inválidos',
    });
  }

  try {
    const { frequencyScores, habitData } = req.body;
    const scores = frequencyScores.map((f) => f.score);
    const overallScore =
      Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) /
      100;
    const status = frequencyScores.length >= 12 ? 'complete' : 'partial';

    const evaluation = await Evaluation.create({
      userId: req.user.id,
      frequencyScores,
      habitData: habitData || {},
      overallScore,
      status,
    });

    const user = await User.findById(req.user.id);
    let riskResultDoc = null;
    let recommendationsList = [];

    const aiPayload = buildAiPayload(user, evaluation);
    const pred = await postPredictRisk(aiPayload);
    if (pred.ok) {
      const d = pred.data;
      const riskLevelEnum = mapRiskLevelToEnum(d.riskLevel);
      riskResultDoc = await RiskResult.findOneAndUpdate(
        { evaluationId: evaluation._id },
        {
          evaluationId: evaluation._id,
          riskScore: Math.min(100, Math.max(0, Number(d.riskScore) || 0)),
          riskLevel: riskLevelEnum,
          yearsEstimated: Number(d.yearsEstimated) || 0,
          confidence:
            d.confidence != null ? Number(d.confidence) : undefined,
          topFactors: Array.isArray(d.topFactors) ? d.topFactors : [],
          recommendations: [],
          aiModel: String(d.aiModel || 'v1.0'),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      const rec = await postGenerateRecommendations({
        riskLevel: d.riskLevel,
        riskScore: d.riskScore,
      });
      if (rec.ok) {
        const items = rec.data.recommendations || rec.data.items || [];
        recommendationsList = Array.isArray(items) ? items : [];
        riskResultDoc.recommendations = recommendationsList;
        await riskResultDoc.save();
      }
    } else if (process.env.NODE_ENV !== 'test') {
      console.warn('[ai.service] predict degradado:', pred.error?.message);
    }

    const populated = evaluation.toObject();
    return res.status(201).json({
      success: true,
      data: {
        evaluation: populated,
        riskResult: riskResultDoc ? riskResultDoc.toJSON() : null,
        recommendations: recommendationsList,
      },
      message: 'Evaluación guardada',
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
async function list(req, res, next) {
  try {
    // Vuln-fix: parse to bounded integers — prevents DoS and NoSQL operator injection
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip  = Math.max(parseInt(req.query.skip,  10) || 0, 0);
    const filter = { userId: req.user.id };
    const [items, total] = await Promise.all([
      Evaluation.find(filter)
        .sort({ takenAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Evaluation.countDocuments(filter),
    ]);
    return res.status(200).json({
      success: true,
      data: { items, total, limit, skip },
      message: 'Historial de evaluaciones',
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
async function getById(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg,
    });
  }
  try {
    const doc = await Evaluation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).lean();
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Evaluación no encontrada',
      });
    }
    const risk = await RiskResult.findOne({ evaluationId: doc._id }).lean();
    return res.status(200).json({
      success: true,
      data: { evaluation: doc, riskResult: risk },
      message: 'Detalle de evaluación',
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
async function patch(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg,
    });
  }
  try {
    const allowed = new Set(['habitData', 'status', 'frequencyScores']);
    const update = {};
    for (const key of Object.keys(req.body || {})) {
      if (allowed.has(key)) {
        update[key] = req.body[key];
      }
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Nada que actualizar',
      });
    }

    const doc = await Evaluation.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: update },
      { new: true },
    );
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Evaluación no encontrada',
      });
    }
    return res.status(200).json({
      success: true,
      data: { evaluation: doc.toJSON() },
      message: 'Evaluación actualizada',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  list,
  getById,
  patch,
};
