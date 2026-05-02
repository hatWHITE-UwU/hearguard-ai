const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');

/**
 * @param {string} token
 * @returns {string}
 */
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function safeEqualHex(a, b) {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length !== bb.length) {
      return false;
    }
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg || 'Datos inválidos',
    });
  }

  try {
    const { name, email, password, age, gender, occupation, city } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Este correo ya está registrado',
      });
    }

    const user = new User({
      name,
      email,
      password,
      age,
      gender,
      occupation,
      city,
    });

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshTokenHash = hashRefreshToken(refreshToken);

    await user.save();

    const userJson = user.toJSON();

    return res.status(201).json({
      success: true,
      data: {
        user: userJson,
        accessToken,
        refreshToken,
      },
      message: 'Usuario registrado correctamente',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Este correo ya está registrado',
      });
    }
    return next(err);
  }
}

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function login(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg || 'Datos inválidos',
    });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email,
      isDeleted: false,
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Credenciales inválidas',
      });
    }

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();

    const userJson = user.toJSON();

    return res.status(200).json({
      success: true,
      data: {
        user: userJson,
        accessToken,
        refreshToken,
      },
      message: 'Sesión iniciada correctamente',
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
async function refresh(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg || 'Datos inválidos',
    });
  }

  try {
    const { refreshToken } = req.body;

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Token de refresco inválido o expirado',
      });
    }

    const incomingHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.id,
      isDeleted: false,
    }).select('+refreshTokenHash');

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Token de refresco inválido o expirado',
      });
    }

    if (!safeEqualHex(user.refreshTokenHash, incomingHash)) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Token de refresco inválido o expirado',
      });
    }

    const newAccessToken = generateAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
    const newRefreshToken = generateRefreshToken({
      id: user._id.toString(),
    });
    user.refreshTokenHash = hashRefreshToken(newRefreshToken);
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: 'Token renovado correctamente',
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
async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('+refreshTokenHash');
    if (!user || user.isDeleted) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Usuario no válido',
      });
    }

    user.refreshTokenHash = null;
    await user.save();

    return res.status(200).json({
      success: true,
      data: null,
      message: 'Sesión cerrada correctamente',
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
async function me(req, res, next) {
  try {
    const user = await User.findOne({
      _id: req.user.id,
      isDeleted: false,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Usuario no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
      message: 'Perfil obtenido correctamente',
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};
