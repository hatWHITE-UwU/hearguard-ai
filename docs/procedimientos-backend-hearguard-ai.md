# PROCEDIMIENTOS DEL BACKEND
## HearGuard AI v1.0 — Vinculación Código ↔ Documento

---

**Institución:** Universidad Continental
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión:** 1.0 · Junio 2026
**Repositorio:** https://github.com/hatWHITE-UwU/hearguard-ai

> Este documento vincula cada procedimiento del sistema con el archivo, función y línea exacta del código fuente del backend, cumpliendo el requisito de trazabilidad código ↔ documentación del examen final.

---

## MAPA DE CAPAS DEL BACKEND

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1 — RUTAS (routes/)                                   │
│  Registra el endpoint y encadena middleware + controlador   │
│  Archivos: auth.routes.js · noise.routes.js                 │
│            evaluation.routes.js · device.routes.js          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2 — MIDDLEWARE (middleware/)                          │
│  authenticate.js → verifica JWT y adjunta req.user          │
│  validators/ → express-validator valida el body/params      │
│  errorHandler.js → captura errores y responde JSON          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3 — CONTROLADORES (controllers/)                      │
│  Orquesta la lógica: llama servicios, persiste, responde    │
│  Archivos: auth.controller.js · noise.controller.js         │
│            evaluation.controller.js · device.controller.js  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4 — SERVICIOS (services/)                             │
│  Lógica reutilizable desacoplada del HTTP                   │
│  Archivos: ai.service.js · noise.service.js                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 5 — MODELOS (models/) — Mongoose + MongoDB Atlas      │
│  Archivos: User.js · NoiseRecord.js · Evaluation.js         │
│            RiskResult.js · Device.js                        │
└─────────────────────────────────────────────────────────────┘
```

---

## MÓDULO 1 — AUTENTICACIÓN Y SESIÓN (RF-01)

### Endpoints

| Método | Ruta | Archivo de ruta | Línea |
|---|---|---|:---:|
| POST | `/api/auth/register` | `backend/src/routes/auth.routes.js` | 13 |
| POST | `/api/auth/login` | `backend/src/routes/auth.routes.js` | 15 |
| POST | `/api/auth/refresh` | `backend/src/routes/auth.routes.js` | 17 |
| POST | `/api/auth/logout` | `backend/src/routes/auth.routes.js` | 19 |
| GET | `/api/auth/me` | `backend/src/routes/auth.routes.js` | 21 |
| PATCH | `/api/auth/me` | `backend/src/routes/auth.routes.js` | 23 |

### Procedimientos del Controlador

#### PROC-AUTH-01: Registro de Usuario
- **Archivo:** `backend/src/controllers/auth.controller.js`
- **Función:** `register()` — línea 53
- **Flujo:**
```
1. express-validator valida email, password, name (auth.validators.js)
2. Consulta User.findOne({ email }) — respuesta en tiempo constante (anti-enumeración)
3. Si existe → HTTP 409 "Email ya registrado"
4. bcrypt.hash(password, 12) → passwordHash
5. User.create({ name, email, password: passwordHash, age })
6. generateAccessToken(userId) → JWT HS256, exp 15 min
7. generateRefreshToken() → 128 bytes aleatorios
8. hashRefreshToken(token) → SHA-256 → almacena en user.refreshTokenHash
9. HTTP 201 → { accessToken, refreshToken, user: { id, name, email } }
```

#### PROC-AUTH-02: Inicio de Sesión
- **Archivo:** `backend/src/controllers/auth.controller.js`
- **Función:** `login()` — línea 123
- **Flujo:**
```
1. Validadores (loginValidators)
2. User.findOne({ email, isDeleted: false })
3. bcrypt.compare(password, user.password) — siempre ejecutado (anti-timing)
4. Si email no existe ó contraseña incorrecta → HTTP 401 "Credenciales inválidas"
5. generateAccessToken(userId) + generateRefreshToken()
6. Almacena hash SHA-256 del refresh token en user.refreshTokenHash
7. HTTP 200 → { accessToken, refreshToken, user }
```

#### PROC-AUTH-03: Renovación de Token (Refresh)
- **Archivo:** `backend/src/controllers/auth.controller.js`
- **Función:** `refresh()` — línea 188
- **Flujo:**
```
1. Recibe { refreshToken } en el body
2. Extrae userId del token mediante jwt.decode() (sin verificar firma)
3. Busca user.refreshTokenHash en BD
4. safeEqualHex(hashOf(refreshToken), user.refreshTokenHash) — comparación segura
5. Si no coincide → HTTP 401
6. Genera NUEVO par access + refresh token
7. Actualiza user.refreshTokenHash con el nuevo hash (rotación)
8. HTTP 200 → { accessToken, refreshToken }
```

#### PROC-AUTH-04: Cierre de Sesión
- **Archivo:** `backend/src/controllers/auth.controller.js`
- **Función:** `logout()` — línea 262
- **Flujo:**
```
1. authenticate middleware → req.user
2. User.findByIdAndUpdate(userId, { refreshTokenHash: null })
3. HTTP 200 "Sesión cerrada"
```

#### PROC-AUTH-05: Actualización de Perfil
- **Archivo:** `backend/src/controllers/auth.controller.js`
- **Función:** `patchMe()` — línea 321
- **Flujo:**
```
1. authenticate middleware → req.user
2. profileValidators validan campos permitidos (name, age, occupation)
3. User.findByIdAndUpdate(userId, campos, { new: true, select: '-password' })
4. HTTP 200 → usuario actualizado sin campo password
```

### Funciones de Soporte Auth

| Función | Archivo | Línea | Descripción |
|---|---|:---:|---|
| `hashRefreshToken(token)` | `auth.controller.js` | 25 | SHA-256 del token en hex |
| `safeEqualHex(a, b)` | `auth.controller.js` | 34 | Comparación en tiempo constante |
| `generateAccessToken(id)` | `src/utils/jwt.utils.js` | — | JWT HS256, exp 15 min |
| `generateRefreshToken()` | `src/utils/jwt.utils.js` | — | 128 bytes crypto.randomBytes |
| `authenticate` | `src/middleware/auth.middleware.js` | 9 | Valida JWT + adjunta req.user |

---

## MÓDULO 2 — MONITOREO DE RUIDO (RF-02)

### Endpoints

| Método | Ruta | Archivo de ruta | Línea |
|---|---|---|:---:|
| POST | `/api/noise/iot` | `backend/src/routes/noise.routes.js` | 14 |
| POST | `/api/noise` | `backend/src/routes/noise.routes.js` | 18 |
| GET | `/api/noise` | `backend/src/routes/noise.routes.js` | 20 |
| GET | `/api/noise/latest` | `backend/src/routes/noise.routes.js` | 22 |
| GET | `/api/noise/stats/today` | `backend/src/routes/noise.routes.js` | 24 |
| GET | `/api/noise/stats/week` | `backend/src/routes/noise.routes.js` | 26 |

### Procedimientos del Controlador

#### PROC-NOISE-01: Registrar Lectura de Ruido (web/móvil)
- **Archivo:** `backend/src/controllers/noise.controller.js`
- **Función:** `create()` — línea 23
- **Flujo:**
```
1. authenticate middleware → req.user.id
2. createNoiseValidators → valida dbLevel (number), source (enum)
3. noise.service.classifyRiskTag(dbLevel):
   - < 55 dB  → 'bajo'
   - 55-75 dB → 'moderado'
   - 75-90 dB → 'alto'
   - > 90 dB  → 'muy_alto'
4. NoiseRecord.create({ userId, dbLevel, riskTag, source, timestamp })
5. HTTP 201 → { record: { id, dbLevel, riskTag, source, timestamp } }
```

#### PROC-NOISE-02: Registrar Lectura IoT (ESP32)
- **Archivo:** `backend/src/controllers/noise.controller.js`
- **Función:** `createIot()` — línea 84
- **Flujo:**
```
1. deviceAuth middleware: X-Device-Key header
   → Device.findOne() + sha256(key) === device.deviceKeyHash
   → Si no coincide → HTTP 401
2. iotNoiseValidators → valida dbLevel
3. noise.service.classifyRiskTag(dbLevel)
4. NoiseRecord.create({ userId: device.userId, deviceId, dbLevel, riskTag, source:'iot' })
5. Device.findByIdAndUpdate(deviceId, { lastSeen: Date.now() })
6. HTTP 201 → { record }
```

#### PROC-NOISE-03: Estadísticas del Día
- **Archivo:** `backend/src/services/noise.service.js`
- **Función:** `statsForToday()` — línea 45
- **Flujo:**
```
1. Calcula startOfDay = inicio del día UTC
2. NoiseRecord.find({ userId, timestamp: { $gte: startOfDay }, isDeleted:false })
3. noise.service.computeStats(rows):
   - count, avg, max, min por riskTag
4. HTTP 200 → { stats: { count, avg, max, min, byLevel } }
```

### Funciones de Servicio Ruido

| Función | Archivo | Línea | Descripción |
|---|---|:---:|---|
| `classifyRiskTag(dbLevel)` | `services/noise.service.js` | 14 | Clasifica dB → bajo/moderado/alto/muy_alto |
| `computeStats(rows)` | `services/noise.service.js` | 25 | Calcula avg, max, min, count, byLevel |
| `statsForToday(Model, userId)` | `services/noise.service.js` | 45 | Agrega estadísticas del día actual |
| `statsForWeek(Model, userId)` | `services/noise.service.js` | 65 | Agrega estadísticas de los últimos 7 días |
| `buildDateFilter(from, to)` | `noise.controller.js` | 142 | Construye filtro $gte/$lte para MongoDB |

---

## MÓDULO 3 — EVALUACIÓN AUDITIVA (RF-03)

### Endpoints

| Método | Ruta | Archivo de ruta | Línea |
|---|---|---|:---:|
| POST | `/api/evaluations` | `backend/src/routes/evaluation.routes.js` | 16 |
| GET | `/api/evaluations` | `backend/src/routes/evaluation.routes.js` | 22 |
| GET | `/api/evaluations/:id` | `backend/src/routes/evaluation.routes.js` | 24 |
| PATCH | `/api/evaluations/:id` | `backend/src/routes/evaluation.routes.js` | 26 |

### Procedimientos del Controlador

#### PROC-EVAL-01: Crear Evaluación Auditiva
- **Archivo:** `backend/src/controllers/evaluation.controller.js`
- **Función:** `create()` — línea 115
- **Flujo:**
```
1. authenticate → req.user
2. evaluationValidators → valida frequencyScores (array), habitData (opcional)
3. aggregateTestScoresByFrequency(frequencyScores):
   - Agrupa scores por Hz promediando oído izq + der
   - avgTestScore = media de todos los puntajes (0–10)
4. lowFreqAverage(freqAvgs):
   - lowFreqScore = media de 250 Hz + 500 Hz
5. Evaluation.create({ userId, frequencyScores, avgTestScore, lowFreqScore, habitData })
6. buildAiPayload(user, evaluation):
   - Vector 8 features: [age, headphoneHours, volumeLevel, noiseExposure,
     occupationRisk, smoking, avgTestScore, lowFreqScore]
7. applyAiPrediction(user, evaluation):
   - ai.service.postPredictRisk(payload) → riskScore, riskLevel, topFactors
   - ai.service.postGenerateRecommendations(payload) → recommendations
   - RiskResult.create({ userId, evaluationId, riskScore, riskLevel, ... })
8. HTTP 201 → { evaluation, riskResult, recommendations }
```

### Funciones de Soporte Evaluación

| Función | Archivo | Línea | Descripción |
|---|---|:---:|---|
| `aggregateTestScoresByFrequency(scores)` | `evaluation.controller.js` | 25 | Agrupa y promedia 12 puntajes por frecuencia |
| `lowFreqAverage(freqAvgs)` | `evaluation.controller.js` | 42 | Promedio 250 Hz + 500 Hz |
| `buildAiPayload(user, evaluation)` | `evaluation.controller.js` | 50 | Construye vector de 8 features para Flask |
| `applyAiPrediction(user, evaluation)` | `evaluation.controller.js` | 74 | Orquesta llamada IA + persistencia RiskResult |

---

## MÓDULO 4 — PREDICCIÓN DE RIESGO IA (RF-04)

### Procedimientos del Servicio IA

#### PROC-AI-01: Invocación al Microservicio Flask con Resiliencia
- **Archivo:** `backend/src/services/ai.service.js`
- **Función:** `postJson()` — línea 57
- **Flujo:**
```
1. Verificar AI_SERVICE_URL configurada
2. _cbIsOpen() → si circuit breaker OPEN:
   - Verificar si han pasado 30 s (→ HALF_OPEN)
   - Si OPEN activo → HTTP 503 inmediato (fast-fail)
3. Bucle de reintentos (MAX_RETRIES = 3):
   a. fetch(url, { method:'POST', body, signal: AbortSignal.timeout(10_000) })
   b. Si HTTP 4xx → error del cliente, NO reintenta → _cbRecordFailure()
   c. Si HTTP 5xx → reintentable → _sleep(500 * 2^(intento-1))
   d. Si error de red → reintentable → _sleep(backoff)
4. Si todos los intentos fallan → _cbRecordFailure()
   - Si failures >= CB_FAIL_THRESHOLD (5) → state = 'OPEN'
5. Si éxito → _cbRecordSuccess() → state = 'CLOSED', failures = 0
6. Retorna { ok: true, data } | { ok: false, error }
```

#### PROC-AI-02: Circuit Breaker — Gestión de Estado
- **Archivo:** `backend/src/services/ai.service.js`
- **Estados y transiciones:**

```
        _cbRecordFailure() × 5
CLOSED ─────────────────────► OPEN
  ▲                              │
  │  _cbRecordSuccess()          │ 30 segundos (CB_RECOVERY_MS)
  │                              ▼
  └────────────────────── HALF_OPEN
      (si el intento tiene éxito)
```

| Función | Línea | Descripción |
|---|:---:|---|
| `_cbRecordSuccess()` | 18 | failures=0, state='CLOSED' |
| `_cbRecordFailure()` | 23 | failures++; si ≥5 → state='OPEN' |
| `_cbIsOpen()` | 31 | Evalúa estado; si OPEN+30s→HALF_OPEN |
| `_sleep(ms)` | 43 | Promise setTimeout para backoff |
| `postPredictRisk(payload)` | 115 | Llama `POST /api/predict-risk` |
| `postGenerateRecommendations(payload)` | 123 | Llama `POST /api/generate-recommendations` |
| `mapRiskLevelToEnum(level)` | 131 | 'Muy Alto'→'muy_alto', 'Alto'→'alto', etc. |

---

## MÓDULO 5 — DISPOSITIVOS IoT (RF-06)

### Endpoints

| Método | Ruta | Archivo de ruta | Línea |
|---|---|---|:---:|
| POST | `/api/devices` | `backend/src/routes/device.routes.js` | 11 |
| GET | `/api/devices` | `backend/src/routes/device.routes.js` | 17 |

### Procedimientos

#### PROC-DEVICE-01: Registro de Dispositivo IoT
- **Archivo:** `backend/src/controllers/device.controller.js`
- **Función:** `create()` — línea 15
- **Flujo:**
```
1. authenticate → req.user.id
2. deviceValidators → valida name (string requerido)
3. crypto.randomBytes(64).toString('hex') → deviceKey (128 hex chars)
4. sha256(deviceKey) → deviceKeyHash
5. Device.create({ userId, name, deviceKeyHash, isActive: true })
6. HTTP 201 → { device: { id, name }, deviceKey } ← texto plano SOLO esta vez
   (deviceKey NO se almacena en BD, solo su hash)
```

---

## MODELO DE DATOS — COLECCIONES MONGODB

### User (`backend/src/models/User.js`)

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `_id` | ObjectId | auto | Identificador único |
| `name` | String | required | Nombre completo |
| `email` | String | required, unique | Correo de autenticación |
| `password` | String | required, select:false | Hash bcrypt (salt 12) |
| `age` | Number | min:1, max:120 | Edad (variable del modelo IA) |
| `refreshTokenHash` | String | nullable | Hash SHA-256 del refresh token activo |
| `isDeleted` | Boolean | default:false | Soft delete |
| `deletedAt` | Date | nullable | Timestamp del borrado lógico |
| `createdAt` | Date | auto | Timestamps Mongoose |
| `updatedAt` | Date | auto | Timestamps Mongoose |

### NoiseRecord (`backend/src/models/NoiseRecord.js`)

| Campo | Tipo | Restricción | Descripción |
|---|---|---|---|
| `userId` | ObjectId | ref:User | Propietario |
| `deviceId` | ObjectId | ref:Device, nullable | Dispositivo origen (null si web/móvil) |
| `dbLevel` | Number | required | Nivel en dB |
| `riskTag` | String | enum | bajo/moderado/alto/muy_alto |
| `source` | String | enum | web/mobile/iot |
| `timestamp` | Date | default:now | Momento de la medición |
| `isDeleted` | Boolean | default:false | Soft delete |

### Evaluation (`backend/src/models/Evaluation.js`)

| Campo | Tipo | Descripción |
|---|---|---|
| `userId` | ObjectId | Propietario |
| `frequencyScores` | Array | [{hz, score, ear}] — 12 elementos |
| `avgTestScore` | Number | Puntaje promedio (0–10) |
| `lowFreqScore` | Number | Promedio 250+500 Hz |
| `headphoneHours` | Number | Horas/día de auriculares |
| `volumeLevel` | Number | Nivel de volumen (0–100) |
| `noiseExposure` | Number | Exposición laboral (0–2) |
| `occupationRisk` | Number | Riesgo ocupacional (0–3) |
| `smoking` | Number | Tabaquismo (0–2) |
| `status` | String | pending/completed/reviewed |
| `isDeleted` | Boolean | Soft delete |

### RiskResult (`backend/src/models/RiskResult.js`)

| Campo | Tipo | Descripción |
|---|---|---|
| `userId` | ObjectId | Propietario |
| `evaluationId` | ObjectId | Evaluación asociada |
| `riskScore` | Number | Score del modelo (0–100) |
| `riskLevel` | String | Bajo/Moderado/Alto/Muy Alto |
| `topFactors` | [String] | Principales factores de riesgo |
| `yearsEstimated` | Number | Años de exposición equivalente |
| `recommendations` | [String] | Recomendaciones generadas por Flask |

### Device (`backend/src/models/Device.js`)

| Campo | Tipo | Descripción |
|---|---|---|
| `userId` | ObjectId | Propietario |
| `name` | String | Nombre descriptivo del dispositivo |
| `deviceKeyHash` | String | Hash SHA-256 de la clave del dispositivo |
| `isActive` | Boolean | Estado activo/inactivo |
| `lastSeen` | Date | Último timestamp de comunicación |
| `isDeleted` | Boolean | Soft delete |

---

## MIDDLEWARE Y UTILIDADES

### `backend/src/middleware/auth.middleware.js` — `authenticate()` línea 9

```
Recibe req con header Authorization: Bearer <token>
  │
  ├─ Sin header → HTTP 401 "Token requerido"
  │
  ├─ jwt.verify(token, JWT_SECRET) → { userId }
  │     └─ Error: expirado/inválido → HTTP 401 "Token inválido"
  │
  └─ req.user = { id: userId } → next()
```

### `backend/src/middleware/errorHandler.js`

Captura todos los errores no manejados con `next(err)` y responde:
```json
{ "success": false, "message": "descripción del error", "code": "ERROR_CODE" }
```

### `backend/server.js` — Endpoints especiales

| Endpoint | Línea | Descripción |
|---|:---:|---|
| `GET /health` | 71 | Estado del servicio + conexión MongoDB |
| `GET /metrics` | 85 | `process.memoryUsage()` + `process.cpuUsage()` + uptime |
| `GET /api` | 103 | Listado de rutas disponibles |

---

## RESUMEN DE TRAZABILIDAD COMPLETA

| RF | Procedimiento | Ruta HTTP | Controlador:Línea | Servicio | Modelo |
|---|---|---|---|---|---|
| RF-01 | PROC-AUTH-01 Registro | POST /api/auth/register | auth.controller.js:53 | jwt.utils.js | User.js |
| RF-01 | PROC-AUTH-02 Login | POST /api/auth/login | auth.controller.js:123 | jwt.utils.js | User.js |
| RF-01 | PROC-AUTH-03 Refresh | POST /api/auth/refresh | auth.controller.js:188 | jwt.utils.js | User.js |
| RF-01 | PROC-AUTH-04 Logout | POST /api/auth/logout | auth.controller.js:262 | — | User.js |
| RF-01 | PROC-AUTH-05 Perfil | PATCH /api/auth/me | auth.controller.js:321 | — | User.js |
| RF-02 | PROC-NOISE-01 Web/Móvil | POST /api/noise | noise.controller.js:23 | noise.service.js:14 | NoiseRecord.js |
| RF-02 | PROC-NOISE-02 IoT | POST /api/noise/iot | noise.controller.js:84 | noise.service.js:14 | NoiseRecord.js + Device.js |
| RF-02 | PROC-NOISE-03 Stats hoy | GET /api/noise/stats/today | noise.controller.js:232 | noise.service.js:45 | NoiseRecord.js |
| RF-02 | PROC-NOISE-04 Stats semana | GET /api/noise/stats/week | noise.controller.js:250 | noise.service.js:65 | NoiseRecord.js |
| RF-03 | PROC-EVAL-01 Crear | POST /api/evaluations | evaluation.controller.js:115 | ai.service.js | Evaluation.js + RiskResult.js |
| RF-03 | PROC-EVAL-02 Listar | GET /api/evaluations | evaluation.controller.js:171 | — | Evaluation.js |
| RF-04 | PROC-AI-01 Predicción | interno → Flask | ai.service.js:57 | — | RiskResult.js |
| RF-04 | PROC-AI-02 Circuit Breaker | interno | ai.service.js:18–43 | — | — |
| RF-06 | PROC-DEVICE-01 Registro | POST /api/devices | device.controller.js:15 | — | Device.js |
| RF-06 | PROC-DEVICE-02 Listar | GET /api/devices | device.controller.js:54 | — | Device.js |

---

*HearGuard AI v1.0 · Universidad Continental · 2026*
*Documento vinculado al Informe Final: `docs/informe-final-hearguard-ai.md`*
