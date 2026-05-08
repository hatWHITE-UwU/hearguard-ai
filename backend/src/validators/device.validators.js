'use strict';

const { body } = require('express-validator');

const createDeviceValidators = [
  body('name').trim().notEmpty().withMessage('El nombre es obligatorio').isLength({ max: 120 }),
  body('type').optional().isIn(['arduino', 'esp32', 'other']).withMessage('Tipo inválido'),
  body('hardwareId').optional().trim().isLength({ max: 120 }),
  body('firmwareVersion').optional().trim().isLength({ max: 80 }),
];

module.exports = { createDeviceValidators };
