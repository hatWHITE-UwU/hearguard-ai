'use strict';

const { body, query } = require('express-validator');

const createNoiseValidators = [
  body('dbLevel').isFloat({ min: 0, max: 200 }).withMessage('dbLevel inválido'),
  body('source').isIn(['iot', 'manual', 'app']).withMessage('source inválido'),
  body('deviceId').optional().isMongoId(),
  body('location').optional().trim().isLength({ max: 200 }),
];

const iotNoiseValidators = [
  body('dbLevel').isFloat({ min: 0, max: 200 }).withMessage('dbLevel inválido'),
  body('deviceMac').optional().trim(),
];

const listNoiseValidators = [
  query('limit').optional().isInt({ min: 1, max: 200 }).toInt(),
  query('skip').optional().isInt({ min: 0 }).toInt(),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  query('source').optional().isIn(['iot', 'manual', 'app']),
];

module.exports = {
  createNoiseValidators,
  iotNoiseValidators,
  listNoiseValidators,
};
