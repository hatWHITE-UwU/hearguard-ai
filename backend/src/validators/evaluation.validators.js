'use strict';

const { body, param, query } = require('express-validator');

const ALLOWED_HZ = new Set([250, 500, 1000, 2000, 4000, 8000]);

const createEvaluationValidators = [
  body('frequencyScores')
    .isArray({ min: 1, max: 12 })
    .withMessage('frequencyScores debe tener entre 1 y 12 elementos'),
  body('frequencyScores.*.hz')
    .isInt()
    .custom((v) => ALLOWED_HZ.has(v))
    .withMessage('Frecuencia no permitida'),
  body('frequencyScores.*.score')
    .isFloat({ min: 0, max: 10 })
    .withMessage('score debe estar entre 0 y 10'),
  body('frequencyScores.*.ear')
    .isIn(['left', 'right', 'both'])
    .withMessage('ear inválido'),
  body('habitData').optional().isObject(),
  body('habitData.headphoneHours').optional().isFloat({ min: 0 }),
  body('habitData.volumeLevel').optional().isFloat({ min: 0, max: 100 }),
  body('habitData.noiseExposure').optional().isFloat({ min: 0 }),
  body('habitData.occupationRisk').optional().isFloat({ min: 0, max: 3 }),
  body('habitData.smoking').optional().isFloat({ min: 0, max: 2 }),
];

const listEvaluationValidators = [
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
];

const idParamValidator = [
  param('id').isMongoId().withMessage('ID inválido'),
];

module.exports = {
  createEvaluationValidators,
  listEvaluationValidators,
  idParamValidator,
  ALLOWED_HZ,
};
