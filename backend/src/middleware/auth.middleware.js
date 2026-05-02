const { verifyAccessToken } = require('../utils/jwt.utils');

/**
 * Requiere Authorization: Bearer <access_token>
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token de acceso requerido',
    });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token de acceso requerido',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token inválido o expirado',
    });
  }
}

module.exports = {
  authenticate,
};
