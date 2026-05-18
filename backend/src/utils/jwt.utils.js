const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

/**
 * @param {{ id: string, email: string }} payload
 * @returns {string}
 */
function generateAccessToken(payload) {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(
    { id: payload.id, email: payload.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

/**
 * @param {{ id: string }} payload
 * @returns {string}
 */
function generateRefreshToken(payload) {
  const { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = getEnv();
  return jwt.sign(
    { id: payload.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );
}

/**
 * @param {string} token
 * @returns {{ id: string, email: string, iat?: number, exp?: number }}
 */
function verifyAccessToken(token) {
  const { JWT_SECRET } = getEnv();
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

/**
 * @param {string} token
 * @returns {{ id: string, type?: string, iat?: number, exp?: number }}
 */
function verifyRefreshToken(token) {
  const { JWT_REFRESH_SECRET } = getEnv();
  const decoded = jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  if (decoded.type && decoded.type !== 'refresh') {
    const err = new Error('Token de refresco inválido');
    err.name = 'JsonWebTokenError';
    throw err;
  }
  return decoded;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
