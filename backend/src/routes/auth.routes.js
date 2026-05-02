const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
  registerValidators,
  loginValidators,
  refreshValidators,
} = require('../validators/auth.validators');
const { updateProfileValidators } = require('../validators/profile.validators');

const router = express.Router();

router.post('/register', registerValidators, authController.register);

router.post('/login', loginValidators, authController.login);

router.post('/refresh', refreshValidators, authController.refresh);

router.post('/logout', authenticate, authController.logout);

router.get('/me', authenticate, authController.me);

router.patch(
  '/me',
  authenticate,
  updateProfileValidators,
  authController.patchMe,
);

module.exports = router;
