'use strict';

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const deviceController = require('../controllers/device.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  deviceController.createValidators,
  deviceController.create,
);

router.get('/', deviceController.list);

module.exports = router;
