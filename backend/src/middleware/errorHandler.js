const { getEnv } = require('../config/env');

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Recurso no encontrado',
  });
}

/**
 * @param {Error & { statusCode?: number, code?: string }} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  const env = getEnv();
  const isProd = env.NODE_ENV === 'production';

  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
  } else if (err.code === 11000 || err.code === '11000') {
    statusCode = 409;
    code = 'CONFLICT';
  }

  let message = err.message || 'Error interno del servidor';
  if (statusCode === 500 && isProd) {
    message = 'Error interno del servidor';
  }

  if (!isProd || statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: code,
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
