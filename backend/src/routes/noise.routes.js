'use strict';

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const noiseController = require('../controllers/noise.controller');
const {
  createNoiseValidators,
  listNoiseValidators,
  iotNoiseValidators,
} = require('../validators/noise.validators');

const router = express.Router();

router.post('/iot', iotNoiseValidators, noiseController.createIot);

router.use(authenticate);

router.post('/', createNoiseValidators, noiseController.create);

router.get('/', listNoiseValidators, noiseController.list);

router.get('/latest', noiseController.latest);

router.get('/stats/today', noiseController.statsToday);

router.get('/stats/week', noiseController.statsWeek);

module.exports = router;
