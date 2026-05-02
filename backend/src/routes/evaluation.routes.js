'use strict';

const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const evaluationController = require('../controllers/evaluation.controller');
const {
  createEvaluationValidators,
  listEvaluationValidators,
  idParamValidator,
} = require('../validators/evaluation.validators');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  createEvaluationValidators,
  evaluationController.create,
);

router.get('/', listEvaluationValidators, evaluationController.list);

router.get('/:id', idParamValidator, evaluationController.getById);

router.patch('/:id', idParamValidator, evaluationController.patch);

module.exports = router;
