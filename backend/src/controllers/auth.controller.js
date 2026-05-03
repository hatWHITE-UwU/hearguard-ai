const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Valid bcrypt hash used only to equalize timing when user is not found.
// Prevents email enumeration via response-time oracle.
const BCRYPT_TIMING_DUMMY = '$2b$12$KIX.nAbFUhIGxEimqfFAL.BvG5VGGPiPrE5e/Y/oE9HQ4f9GmcGjS';
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

    // Vuln-fix: always run bcrypt to prevent timing oracle (email enumeration).
    // When user not found, a dummy compare runs so response time is always ~250ms.
    const passwordOk = user
      ? await user.comparePassword(password)
      : (await bcrypt.compare(password, BCRYPT_TIMING_DUMMY), false);

    if (!user || !passwordOk) {
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

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
async function patchMe(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg || 'Datos inválidos',
    });
  }
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
    const {
      name,
      age,
      gender,
      occupation,
      city,
      settings,
    } = req.body;
    if (name != null) user.name = name;
    if (age != null) user.age = age;
    if (gender != null) user.gender = gender;
    if (occupation != null) user.occupation = occupation;
    if (city != null) user.city = city;
    // Vuln-fix: require plain object to block prototype pollution and MongoDB operator injection.
    // Explicit typeof guards ensure each field gets only its expected primitive type.
    if (settings !== null && typeof settings === 'object' && !Array.isArray(settings)) {
      if (typeof settings.reminders === 'boolean') {
        user.settings.reminders = settings.reminders;
      }
      if (typeof settings.darkTheme === 'boolean') {
        user.settings.darkTheme = settings.darkTheme;
      }
      if (typeof settings.volumeUnit === 'string') {
        user.settings.volumeUnit = settings.volumeUnit;
      }
    }
    await user.save();
    return res.status(200).json({
      success: true,
      data: { user: user.toJSON() },
      message: 'Perfil actualizado',
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
  patchMe,
};
