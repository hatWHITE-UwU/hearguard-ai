const { body } = require('express-validator');

const registerValidators = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio')
    .isLength({ max: 120 })
    .withMessage('El nombre es demasiado largo'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .isEmail()
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'La contraseña debe incluir al menos una mayúscula y un número',
    ),
  body('age')
    .optional()
    .isInt({ min: 0, max: 120 })
    .withMessage('La edad debe ser un número entre 0 y 120'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_say'])
    .withMessage('Género no válido'),
  body('occupation').optional().trim().isLength({ max: 200 }),
  body('city').optional().trim().isLength({ max: 120 }),
];

const loginValidators = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El correo es obligatorio')
    .isEmail()
    .withMessage('Correo electrónico inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria'),
];

const refreshValidators = [
  body('refreshToken')
    .trim()
    .notEmpty()
    .withMessage('El token de refresco es obligatorio'),
];

module.exports = {
  registerValidators,
  loginValidators,
  refreshValidators,
};
