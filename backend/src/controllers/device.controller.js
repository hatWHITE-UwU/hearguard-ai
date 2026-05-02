'use strict';

const crypto = require('crypto');
const { validationResult, body } = require('express-validator');
const Device = require('../models/Device');

const createValidators = [
  body('name').trim().notEmpty().isLength({ max: 120 }),
  body('type').optional().isIn(['arduino', 'esp32', 'other']),
  body('hardwareId').optional().trim().isLength({ max: 120 }),
  body('firmwareVersion').optional().trim().isLength({ max: 80 }),
];

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
    const apiKey = crypto.randomBytes(32).toString('hex');
    const device = await Device.create({
      userId: req.user.id,
      name: req.body.name,
      type: req.body.type || 'arduino',
      hardwareId: req.body.hardwareId,
      firmwareVersion: req.body.firmwareVersion,
      apiKey,
    });
    const json = device.toJSON();
    return res.status(201).json({
      success: true,
      data: {
        device: json,
        apiKey,
      },
      message:
        'Dispositivo registrado. Guarda apiKey en el firmware (solo se muestra una vez).',
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
    const items = await Device.find({ userId: req.user.id }).lean();
    return res.status(200).json({
      success: true,
      data: { items },
      message: 'Dispositivos',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  create,
  createValidators,
  list,
};
