'use strict';

const { body } = require('express-validator');

const updateProfileValidators = [
  body('name').optional().trim().notEmpty().isLength({ max: 120 }),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_say']),
  body('occupation').optional().trim().isLength({ max: 200 }),
  body('city').optional().trim().isLength({ max: 120 }),
  body('settings.reminders').optional().isBoolean(),
  body('settings.darkTheme').optional().isBoolean(),
  body('settings.volumeUnit').optional().isIn(['dba', 'dbc']),
];

module.exports = { updateProfileValidators };
