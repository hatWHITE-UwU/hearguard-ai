# EJEMPLAR DEL SOFTWARE

---

## HearGuard AI
### Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma

**Universidad Continental — Ingeniería de Sistemas e Informática** | **v1.0**

---

A continuación se presentan las secciones principales del código fuente del sistema HearGuard AI. Los fragmentos seleccionados representan los módulos de mayor valor técnico y originalidad del software: autenticación segura con rotación de tokens JWT mediante SHA-256, monitoreo de ruido con integración de dispositivos IoT, predicción de riesgo auditivo mediante modelo Random Forest entrenado con CRISP-DM, y el controlador de evaluaciones audiológicas con orquestación del microservicio de inteligencia artificial.

---

## 1. Código Fuente del Software

Se adjunta un archivo comprimido denominado **HearGuardAI_v1.0.zip**, que contiene los componentes principales del software HearGuard AI — Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma.

### 1.1 Estructura del archivo comprimido

| Carpeta / Archivo | Contenido |
|-------------------|-----------|
| `/backend` | Código fuente en Node.js 20 + Express 5 + Mongoose 9<br>• API REST principal: autenticación, ruido, evaluaciones, dispositivos IoT<br>• Middleware JWT, validación con express-validator<br>• Protección anti-enumeración (timing attack), hash SHA-256 de refresh tokens<br>• Modelo User con bcrypt salt=12 y soft delete (`isDeleted + deletedAt`) |
| `/frontend` | Interfaz web desarrollada en Angular 21 + TypeScript + Signals API + SCSS<br>• Componentes standalone: dashboard, monitor de ruido, prueba auditiva, historial<br>• Guards de rutas, interceptor JWT con refresh automático<br>• Modo demostración público (`publicDemo`) |
| `/flutter_app` | Aplicación móvil nativa desarrollada en Flutter 3 + Dart<br>• Pantallas: Login, Register, Dashboard, Monitor, Historial, Prueba Auditiva, Perfil<br>• Captura de decibelios mediante micrófono físico del dispositivo<br>• Integración con Backend API mediante Dio + Provider |
| `/ai-service` | Microservicio de inteligencia artificial en Python 3.11 + Flask<br>• Modelo Random Forest entrenado con metodología CRISP-DM<br>• Endpoint `POST /api/predict-risk`: predicción de riesgo auditivo<br>• Endpoint `POST /api/recommend`: recomendaciones por nivel de riesgo<br>• Modelo serializado en `model/saved/risk_model.pkl` |
| `/firmware` | Firmware Arduino para dispositivos ESP32 + sensor KY-037<br>• Captura de decibelios ambientales en tiempo real<br>• Transmisión serial hacia el puente Node.js (`serial_bridge.js`)<br>• Autenticación mediante header `X-Device-Key` en el backend |
| `/e2e` | Pruebas End-to-End con Playwright (36 casos)<br>• Flujos: registro → login → monitoreo → evaluación → resultados |
| `/docs` | Arquitectura del sistema y diagramas ASCII<br>• Especificación API (Swagger/OpenAPI en `api-spec.yml`)<br>• Plan de pruebas IEEE 829 y matriz de trazabilidad BDD<br>• Metodología TDD + BDD + CRISP-DM |
| `docker-compose.yml` | Orquestación de todos los servicios (backend:3000, AI:5001, frontend:8080) |
| `README.md` | Requisitos de instalación y variables de entorno<br>• Configuración Docker y procedimiento de despliegue<br>• Ejecución de las 422 pruebas automatizadas |

El archivo comprimido constituye una versión representativa del software HearGuard AI y acredita la autoría, estructura funcional y desarrollo tecnológico realizado en la Universidad Continental, siendo suficiente para demostrar su existencia y funcionamiento ante las autoridades competentes.

---

## 2. Manual Técnico

### 2.1 Objetivo

El presente manual técnico tiene como finalidad describir los procedimientos necesarios para la instalación, configuración, operación y mantenimiento del sistema HearGuard AI.

### 2.2 Requisitos del Sistema

**Servidor**

| Campo | Valor |
|-------|-------|
| Sistema Operativo | Windows 11 / Ubuntu 22.04 LTS |
| Procesador | 2 vCPU mínimo |
| Memoria RAM | 4 GB mínimo |
| Almacenamiento | 20 GB SSD mínimo |
| Docker Engine | 25.x o superior |
| Docker Compose | 2.x o superior |

**Software requerido (desarrollo local sin Docker)**

- ✅ Node.js 20 LTS o superior
- ✅ Python 3.11
- ✅ Flutter 3.22 o superior (para la app móvil)
- ✅ Git 2.x o superior
- ✅ Cuenta en MongoDB Atlas (o MongoDB local ≥ 7.0)

**Navegador del cliente**

- ✅ Google Chrome 120+
- ✅ Microsoft Edge 120+
- ✅ Mozilla Firefox 120+

### 2.3 Instalación

**Paso 1 — Obtener el código fuente**
Descargar `HearGuardAI_v1.0.zip` y descomprimirlo, o clonar el repositorio:
```bash
git clone https://github.com/hatWHITE-UwU/hearguard-ai.git
cd hearguard-ai
```

**Paso 2 — Configurar variables de entorno**
Crear el archivo `.env` a partir de la plantilla:
```bash
cp .env.example .env
# Editar .env con los parámetros de la sección Variables de Entorno
```

**Paso 3 — Levantar todos los servicios con Docker**
```bash
npm run docker:up
# equivalente a: docker compose up -d --build
```

**Paso 4 — Entrenar el modelo de IA (primera vez)**
```bash
cd ai-service
python -m model.trainer
# Genera: model/saved/risk_model.pkl
```

**Paso 5 — Verificar funcionamiento**

| Servicio | URL |
|----------|-----|
| Frontend Angular | http://localhost:8080 |
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api/docs |
| AI Service | http://localhost:5001 |
| Health Backend | http://localhost:3000/health |
| Health AI | http://localhost:5001/health |

### 2.4 Variables de Entorno

Crear el archivo `.env` en la raíz del proyecto y configurar las siguientes variables:

```
# Base de datos
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/hearguard

# JWT — generar con: node -e "require('crypto').randomBytes(64).toString('hex')"
JWT_SECRET=<128 caracteres hex aleatorios>
JWT_REFRESH_SECRET=<128 caracteres hex aleatorios>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Servicio IA
AI_SERVICE_URL=http://localhost:5001

# CORS
FRONTEND_URL=http://localhost:8080

# Entorno
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 2.5 Configuración Inicial

**Modelo de usuario y roles**

HearGuard AI implementa un modelo de usuario único con autenticación basada en JWT. No existe un sistema de roles jerárquico: cada usuario autenticado accede exclusivamente a sus propios datos, garantizado a nivel de middleware y consultas a base de datos.

| Tipo | Descripción y accesos |
|------|-----------------------|
| `user` (autenticado) | Acceso completo a sus registros de ruido, evaluaciones, dispositivos IoT y resultados de IA |
| `device` (IoT) | Acceso limitado al endpoint `POST /api/noise/iot` mediante `X-Device-Key` |
| `public` (demo) | Acceso de solo lectura al modo demostración (`publicDemo`) sin registro |

**Configuración del modelo de IA**

- ✅ Ejecutar entrenamiento inicial: `python -m model.trainer`
- ✅ Verificar archivo `ai-service/model/saved/risk_model.pkl`
- ✅ Validar health check: `GET http://localhost:5001/health`

### 2.6 Operación del Sistema

| Módulo | Capacidades |
|--------|-------------|
| **Autenticación** | ✅ Registro de usuario con validación estricta<br>✅ Login con protección anti-enumeración (timing attack)<br>✅ Refresh automático de tokens JWT (rotación SHA-256)<br>✅ Logout con invalidación del refresh en base de datos<br>✅ Actualización de perfil (PATCH /api/auth/me) |
| **Monitoreo de Ruido** | ✅ Registro manual de niveles de decibelios<br>✅ Integración con dispositivos IoT (ESP32 + X-Device-Key)<br>✅ Historial paginado con filtros por fecha y fuente<br>✅ Estadísticas del día y de la semana<br>✅ Clasificación automática de riesgo por nivel dB |
| **Evaluación Auditiva** | ✅ Prueba auditiva por frecuencias (250–8000 Hz, ambos oídos)<br>✅ Registro de hábitos auditivos (headphoneHours, volumeLevel, occupationRisk)<br>✅ Orquestación automática del microservicio IA<br>✅ Historial de evaluaciones del usuario |
| **Predicción IA** | ✅ Predicción de riesgo auditivo con Random Forest<br>✅ Niveles: Bajo / Moderado / Alto / Muy Alto<br>✅ Factores principales de riesgo identificados<br>✅ Recomendaciones adaptativas por nivel de riesgo<br>✅ Estimación de años hasta deterioro significativo |
| **Dispositivos IoT** | ✅ Registro de dispositivos ESP32 con apiKey única<br>✅ Activación / desactivación de dispositivos<br>✅ Envío de datos desde firmware en tiempo real<br>✅ Registro de última conexión (`lastSeenAt`) |
| **App Móvil** | ✅ Flujo completo: Login → Dashboard → Monitor → Prueba → Resultados<br>✅ Captura de dB desde micrófono físico (noise_meter)<br>✅ Visualización de historial y recomendaciones |

### 2.7 Mantenimiento

| Área | Tarea |
|------|-------|
| **Base de datos** | Respaldo periódico de MongoDB Atlas (plan M0 incluye snapshots automáticos) · Monitoreo de índices y rendimiento de consultas |
| **Modelo IA** | Re-entrenamiento periódico con nuevos datos: `python -m model.trainer` · Validar métricas R² tras cada re-entrenamiento |
| **Pruebas** | `cd backend && npm test` (Jest + Supertest, 207 casos) · `cd ai-service && pytest tests/ -q --cov=model` (30 casos) · `cd frontend && npm run test:ci` (Vitest, 107 casos) · `flutter test --coverage` (42 casos) |
| **Calidad** | Pipeline CI automático en GitHub Actions · Análisis SonarCloud en cada push a `main` · Monitorear Quality Gate en sonarcloud.io |
| **Actualizaciones** | Conventional Commits (`feat/fix/test/docs/refactor`) · Pre-commit hooks con Husky para validación automática · Actualizar documentación técnica tras cada fase |

---

## 3. Fragmentos de Código Fuente

A continuación se presentan los fragmentos de código más representativos del sistema, correspondientes a los componentes de mayor valor técnico y originalidad.

---

### SECCIÓN 1 — Controlador de Autenticación con Rotación de Tokens JWT

**`backend/src/controllers/auth.controller.js`**

Implementa el flujo completo de autenticación: registro con detección de duplicados, login con protección anti-enumeración de email mediante `timingSafeEqual` y `bcrypt` constante (evita oracle de temporización), emisión de access token (15 min) y refresh token (7 días), rotación segura del refresh token mediante hash SHA-256 (`crypto.createHash('sha256')`), y logout con invalidación en base de datos. Es el componente de seguridad crítica del sistema.

```javascript
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../utils/jwt.utils');

// Hash pre-computado usado SOLO para forzar bcrypt en usuarios no encontrados
// y equalizar tiempo de respuesta (previene enumeración de emails). // NOSONAR
const BCRYPT_TIMING_DUMMY =
  '$2b$12$KIX.nAbFUhIGxEimqfFAL.BvG5VGGPiPrE5e/Y/oE9HQ4f9GmcGjS'; // NOSONAR

function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token, 'utf8').digest('hex');
}

function safeEqualHex(a, b) {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

async function register(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: errors.array()[0].msg,
    });
  }
  try {
    const { name, email, password, age, gender, occupation, city } = req.body;
    const existing = await User.findOne({ email: String(email) });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'CONFLICT',
        message: 'Este correo ya está registrado',
      });
    }
    const user = new User({ name, email, password, age, gender, occupation, city });
    const accessToken  = generateAccessToken({ id: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();
    return res.status(201).json({
      success: true,
      data: { user: user.toJSON(), accessToken, refreshToken },
      message: 'Usuario registrado correctamente',
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false, error: 'CONFLICT',
        message: 'Este correo ya está registrado',
      });
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email), isDeleted: false })
                           .select('+password');
    // Siempre ejecutar bcrypt para prevenir oracle de temporización
    let passwordOk = false;
    if (user) {
      passwordOk = await user.comparePassword(password);
    } else {
      await bcrypt.compare(password, BCRYPT_TIMING_DUMMY);
    }
    if (!user || !passwordOk) {
      return res.status(401).json({
        success: false, error: 'UNAUTHORIZED',
        message: 'Credenciales inválidas',
      });
    }
    const accessToken  = generateAccessToken({ id: user._id.toString(), email: user.email });
    const refreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshTokenHash = hashRefreshToken(refreshToken);
    await user.save();
    return res.status(200).json({
      success: true,
      data: { user: user.toJSON(), accessToken, refreshToken },
      message: 'Sesión iniciada correctamente',
    });
  } catch (err) { return next(err); }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    let decoded;
    try { decoded = verifyRefreshToken(refreshToken); }
    catch {
      return res.status(401).json({
        success: false, error: 'UNAUTHORIZED',
        message: 'Token de refresco inválido o expirado',
      });
    }
    const incomingHash = hashRefreshToken(refreshToken);
    const user = await User.findOne({ _id: decoded.id, isDeleted: false })
                           .select('+refreshTokenHash');
    if (!user?.refreshTokenHash || !safeEqualHex(user.refreshTokenHash, incomingHash)) {
      return res.status(401).json({
        success: false, error: 'UNAUTHORIZED',
        message: 'Token de refresco inválido o expirado',
      });
    }
    const newAccessToken  = generateAccessToken({ id: user._id.toString(), email: user.email });
    const newRefreshToken = generateRefreshToken({ id: user._id.toString() });
    user.refreshTokenHash = hashRefreshToken(newRefreshToken);
    await user.save();
    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      message: 'Token renovado correctamente',
    });
  } catch (err) { return next(err); }
}

module.exports = { register, login, refresh, logout, me, patchMe };
```

---

### SECCIÓN 2 — Middleware de Autenticación JWT y Utilidades de Token

**`backend/src/middleware/auth.middleware.js`** · **`backend/src/utils/jwt.utils.js`**

Middleware de autenticación que verifica el header `Authorization: Bearer <token>` en cada ruta protegida. La utilidad `jwt.utils.js` implementa la generación y verificación de access tokens (HS256, 15 min) y refresh tokens (HS256, 7 días) con validación de tipo para prevenir uso cruzado entre ambos tokens.

```javascript
// ── auth.middleware.js ────────────────────────────────────────────
const { verifyAccessToken } = require('../utils/jwt.utils');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Token de acceso requerido',
    });
  }
  const token = header.slice('Bearer '.length).trim();
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
module.exports = { authenticate };

// ── jwt.utils.js ──────────────────────────────────────────────────
const jwt = require('jsonwebtoken');
const { getEnv } = require('../config/env');

function generateAccessToken(payload) {
  const { JWT_SECRET, JWT_EXPIRES_IN } = getEnv();
  return jwt.sign(
    { id: payload.id, email: payload.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  );
}

function generateRefreshToken(payload) {
  const { JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN } = getEnv();
  return jwt.sign(
    { id: payload.id, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );
}

function verifyAccessToken(token) {
  const { JWT_SECRET } = getEnv();
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

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
  generateAccessToken, generateRefreshToken,
  verifyAccessToken, verifyRefreshToken,
};
```

---

### SECCIÓN 3 — Controlador de Monitoreo de Ruido con Integración IoT

**`backend/src/controllers/noise.controller.js`**

Controlador REST para el monitoreo de exposición al ruido. Implementa creación de registros desde la web (`POST /api/noise`) y desde dispositivos IoT (`POST /api/noise/iot`) mediante autenticación por header `X-Device-Key`, clasificación automática del nivel de riesgo por decibelios, historial paginado con filtros de fecha y fuente, y protección contra inyección NoSQL en los parámetros de paginación.

```javascript
'use strict';
const { validationResult } = require('express-validator');
const { Types } = require('mongoose');
const NoiseRecord = require('../models/NoiseRecord');
const Device = require('../models/Device');
const { classifyRiskTag, statsForToday, statsForWeek } = require('../services/noise.service');
const { HIGH_RISK_DB_THRESHOLD, DEFAULT_NOISE_LIMIT, MAX_NOISE_LIMIT } = require('../config/constants');

// Endpoint web: registra nivel de ruido del usuario autenticado
async function create(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false, error: 'VALIDATION_ERROR',
      message: errors.array()[0]?.msg,
    });
  }
  try {
    const { dbLevel, source, deviceId, location } = req.body;
    let safeDeviceId;
    if (deviceId !== undefined && deviceId !== null && deviceId !== '') {
      if (typeof deviceId !== 'string' || !Types.ObjectId.isValid(deviceId)) {
        return res.status(400).json({
          success: false, error: 'VALIDATION_ERROR', message: 'deviceId inválido',
        });
      }
      safeDeviceId = new Types.ObjectId(deviceId);
      const dev = await Device.findOne({
        _id: safeDeviceId,
        userId: new Types.ObjectId(String(req.user.id)),
      });
      if (!dev) return res.status(404).json({
        success: false, error: 'NOT_FOUND', message: 'Dispositivo no encontrado',
      });
    }
    const riskTag  = classifyRiskTag(dbLevel);
    const highRisk = dbLevel > HIGH_RISK_DB_THRESHOLD;
    const doc = await NoiseRecord.create({
      userId: req.user.id, deviceId: safeDeviceId,
      dbLevel, riskTag, source, location, highRisk,
    });
    return res.status(201).json({
      success: true,
      data: { record: doc.toJSON() },
      message: 'Registro de ruido creado',
    });
  } catch (err) { return next(err); }
}

// Endpoint IoT: recibe datos desde ESP32 autenticado por X-Device-Key
async function createIot(req, res, next) {
  try {
    const key = req.header('x-device-key') || req.header('X-Device-Key');
    if (!key) {
      return res.status(401).json({
        success: false, error: 'UNAUTHORIZED', message: 'X-Device-Key requerido',
      });
    }
    const device = await Device.findOne({ apiKey: { $eq: String(key) } }).select('+apiKey');
    if (!device?.isActive) {
      return res.status(401).json({
        success: false, error: 'UNAUTHORIZED', message: 'Dispositivo no válido',
      });
    }
    const { dbLevel } = req.body;
    const riskTag  = classifyRiskTag(dbLevel);
    const highRisk = dbLevel > HIGH_RISK_DB_THRESHOLD;
    device.lastSeenAt = new Date();
    await device.save();
    const doc = await NoiseRecord.create({
      userId: device.userId, deviceId: device._id,
      dbLevel, riskTag, source: 'iot', highRisk,
    });
    return res.status(201).json({
      success: true,
      data: { record: doc.toJSON() },
      message: 'Registro IoT guardado',
    });
  } catch (err) { return next(err); }
}

// Historial paginado con protección anti-inyección NoSQL en parámetros
async function list(req, res, next) {
  try {
    // Parseo a enteros acotados — previene DoS e inyección con operadores Mongo
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || DEFAULT_NOISE_LIMIT, 1),
      MAX_NOISE_LIMIT,
    );
    const skip = Math.max(Number.parseInt(req.query.skip, 10) || 0, 0);
    const filter = { userId: req.user.id };
    if (req.query.from || req.query.to) {
      const range = buildDateFilter(req.query.from, req.query.to);
      if (range) filter.recordedAt = range;
    }
    // Rechaza no-string para prevenir ?source[$ne]=null
    if (typeof req.query.source === 'string' && req.query.source.length > 0) {
      filter.source = String(req.query.source);
    }
    const rows  = await NoiseRecord.find(filter).sort({ recordedAt: -1 }).skip(skip).limit(limit).lean();
    const total = await NoiseRecord.countDocuments(filter);
    return res.status(200).json({
      success: true,
      data: { items: rows, total, page: { limit, skip } },
      message: 'Historial de ruido',
    });
  } catch (err) { return next(err); }
}

module.exports = { create, createIot, list, latest, statsToday, statsWeek };
```

---

### SECCIÓN 4 — Modelo de IA: Predictor de Riesgo Auditivo (Random Forest)

**`ai-service/model/predictor.py`**

Módulo de predicción del microservicio Flask. Carga el modelo Random Forest serializado (`risk_model.pkl`, entrenado con CRISP-DM), construye el vector de características a partir de los datos audiológicos y de hábitos del usuario, predice un puntaje de riesgo (0–100), lo convierte a nivel de riesgo (Bajo/Moderado/Alto/Muy Alto), identifica los factores de riesgo principales y genera recomendaciones preventivas personalizadas. Usa `secrets.randbelow()` para la estimación de años, garantizando valores no predecibles.

```python
"""Carga el modelo y expone predicción + recomendaciones."""
from __future__ import annotations

import os
import secrets
from typing import Any

import joblib
import numpy as np

from model.features import build_feature_vector
from model.constants import (
    RISK_LOW_THRESHOLD, RISK_MODERATE_THRESHOLD, RISK_HIGH_THRESHOLD,
    SCORE_MIN, SCORE_MAX,
    NOISE_EXPOSURE_FACTOR_THRESHOLD, HEADPHONE_HOURS_FACTOR_THRESHOLD,
    VOLUME_LEVEL_FACTOR_THRESHOLD, TEST_SCORE_FACTOR_THRESHOLD,
    TOP_FACTORS_LIMIT, CONFIDENCE_MAX, CONFIDENCE_BASE, CONFIDENCE_R2_WEIGHT,
    YEARS_LOW_MIN, YEARS_LOW_RANGE, YEARS_MODERATE_MIN, YEARS_MODERATE_RANGE,
    YEARS_HIGH_MIN, YEARS_HIGH_RANGE, YEARS_VERY_HIGH_MIN, YEARS_VERY_HIGH_RANGE,
)

_MODEL_BUNDLE: dict | None = None

def load_model() -> dict:
    global _MODEL_BUNDLE
    if _MODEL_BUNDLE is None:
        path = os.path.join(os.path.dirname(__file__), "saved", "risk_model.pkl")
        if not os.path.isfile(path):
            raise FileNotFoundError(f"No existe {path}. Ejecuta: python -m model.trainer")
        _MODEL_BUNDLE = joblib.load(path)
    return _MODEL_BUNDLE

def score_to_level(score: float) -> str:
    s = int(round(float(score)))
    if s <= RISK_LOW_THRESHOLD:      return "Bajo"
    if s <= RISK_MODERATE_THRESHOLD: return "Moderado"
    if s <= RISK_HIGH_THRESHOLD:     return "Alto"
    return "Muy Alto"

def score_to_years(score: float) -> int:
    s = int(round(float(score)))
    if s <= RISK_LOW_THRESHOLD:
        return secrets.randbelow(YEARS_LOW_RANGE) + YEARS_LOW_MIN
    if s <= RISK_MODERATE_THRESHOLD:
        return secrets.randbelow(YEARS_MODERATE_RANGE) + YEARS_MODERATE_MIN
    if s <= RISK_HIGH_THRESHOLD:
        return secrets.randbelow(YEARS_HIGH_RANGE) + YEARS_HIGH_MIN
    return secrets.randbelow(YEARS_VERY_HIGH_RANGE) + YEARS_VERY_HIGH_MIN

def predict_risk(payload: dict[str, Any]) -> dict[str, Any]:
    bundle = load_model()
    model  = bundle["model"]
    vec    = np.asarray([build_feature_vector(payload)], dtype=np.float32)
    raw    = float(model.predict(vec)[0])
    risk_score = int(round(float(np.clip(raw, SCORE_MIN, SCORE_MAX))))
    level  = score_to_level(risk_score)
    years  = score_to_years(risk_score)

    factors: list[str] = []
    if float(payload.get("noiseExposure") or 0) >= NOISE_EXPOSURE_FACTOR_THRESHOLD:
        factors.append("Exposición frecuente a ruido")
    if float(payload.get("headphoneHours") or 0) > HEADPHONE_HOURS_FACTOR_THRESHOLD:
        factors.append("Uso prolongado de audífonos")
    if float(payload.get("volumeLevel") or 0) > VOLUME_LEVEL_FACTOR_THRESHOLD:
        factors.append("Alto volumen habitual")
    test_scores = payload.get("testScores") or []
    if test_scores:
        avg = sum(float(x) for x in test_scores) / len(test_scores)
        if avg < TEST_SCORE_FACTOR_THRESHOLD:
            factors.append("Scores bajos en la prueba tonal")
    if not factors:
        factors.append("Perfil general de hábitos auditivos")

    confidence = min(
        CONFIDENCE_MAX,
        CONFIDENCE_BASE + bundle.get("r2_holdout", 0.2) * CONFIDENCE_R2_WEIGHT,
    )
    return {
        "riskScore":      risk_score,
        "riskLevel":      level,
        "yearsEstimated": years,
        "confidence":     round(confidence, 2),
        "topFactors":     factors[:TOP_FACTORS_LIMIT],
        "aiModel":        "risk_rf_v1",
    }

def recommendations_for_level(level: str) -> list[str]:
    lvl = (level or "").lower()
    if "muy" in lvl:
        return [
            "Consulta urgente con un audiólogo (estimación, no diagnóstico).",
            "Usa protección auditiva en ambientes ruidosos.",
            "Reduce o suspende temporalmente el uso de audífonos a alto volumen.",
        ]
    if "alto" in lvl and "muy" not in lvl:
        return [
            "Protección auditiva SIEMPRE en ambientes > 85 dB.",
            "Limita volumen de audífonos al ~50% y descansos cada hora.",
            "Agenda consulta con audiólogo en las próximas semanas.",
        ]
    if "moderado" in lvl:
        return [
            "Reduce exposición a ruidos fuertes y usa tapones cuando sea posible.",
            "Máximo ~3 h/día de audífonos con volumen moderado.",
            "Considera evaluación anual con audiólogo.",
        ]
    return [
        "Mantén volumen de audífonos por debajo del ~60%.",
        "Continúa pruebas auditivas periódicas.",
        "Evita exposición prolongada a ruido sin protección.",
    ]
```

---

## 4. Observaciones Finales

El ejemplar del software **HearGuard AI v1.0** — Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma, constituye evidencia suficiente para acreditar su existencia, estructura funcional y desarrollo tecnológico ante las autoridades académicas de la **Universidad Continental, Perú** y ante el **Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI)**.

El material presentado incluye una representación significativa del código fuente, la estructura general de la solución en cuatro capas tecnológicas (web Angular, móvil Flutter, backend Node.js y microservicio IA Python), los componentes principales del sistema y la documentación técnica necesaria para demostrar la originalidad de la obra informática. Asimismo, refleja la integración de tecnologías de monitoreo IoT en tiempo real, modelos de Machine Learning con CRISP-DM, desarrollo multiplataforma y aseguramiento de calidad automatizado con **422 casos de prueba** y **100 % de cobertura** validada en SonarCloud.

El presente ejemplar forma parte del expediente de registro y deberá ser complementado con la **Ficha Técnica del Software**, la **Memoria Descriptiva**, el **Manual Técnico**, el **Manual de Usuario**, la **Declaración Jurada de Autoría** y la documentación académica correspondiente de la Universidad Continental. En conjunto, estos documentos constituyen el soporte técnico y legal necesario para sustentar la titularidad, originalidad y protección de los derechos patrimoniales del software HearGuard AI ante las autoridades competentes.

---

*HearGuard AI v1.0 · Universidad Continental, Perú · TDD + BDD + CRISP-DM*

---

&nbsp;

___

**Luis Francisco Terreros Hinojosa**
Autor — Ingeniero de Sistemas e Informática
Universidad Continental, Perú

&nbsp;

**Hardy Eduardo Rondinel Aquino**
Autor — Ingeniero de Sistemas e Informática
Universidad Continental, Perú
