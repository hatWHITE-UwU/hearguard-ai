# 🚀 Fase 1 — Base del Sistema (Auth + DB)

> **Regla de oro:** No pases a la Fase 2 hasta que todos los tests de esta fase pasen al 100%.

---

## 🎯 Objetivo de esta fase

Construir la base sólida del backend: autenticación segura con JWT, modelos MongoDB, y estructura de proyecto lista para escalar.

---

## 📁 Archivos a crear en esta fase

```
backend/
├── server.js                          ← Punto de entrada Express
├── .env                               ← Variables de entorno
├── .env.example                       ← Plantilla pública
├── src/
│   ├── config/
│   │   └── database.js                ← Conexión Mongoose
│   ├── models/
│   │   ├── User.js                    ← Modelo usuario con bcrypt
│   │   ├── Evaluation.js              ← Modelo evaluación auditiva
│   │   ├── NoiseRecord.js             ← Modelo registro de ruido
│   │   └── RiskResult.js              ← Modelo resultado IA
│   ├── controllers/
│   │   └── auth.controller.js         ← Lógica register/login/refresh
│   ├── routes/
│   │   └── auth.routes.js             ← Rutas /api/auth/*
│   ├── middleware/
│   │   ├── auth.middleware.js         ← Validar JWT en requests
│   │   └── errorHandler.js            ← Manejo centralizado de errores
│   └── utils/
│       └── jwt.utils.js               ← Generar/verificar tokens
├── tests/
│   └── auth.test.js                   ← Tests TDD obligatorios
└── package.json
```

---

## ⚙️ Dependencias a instalar

```bash
# Producción
npm install express mongoose bcryptjs jsonwebtoken cors helmet dotenv express-rate-limit express-validator morgan

# Desarrollo
npm install -D nodemon jest supertest
```

---

## 🔐 Variables de entorno (.env)

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/hearguard_db
JWT_SECRET=hearguard_super_secret_key_cambiar_en_produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=hearguard_refresh_secret_key_cambiar
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:4200
AI_SERVICE_URL=http://localhost:5001
```

---

## 🗄️ Modelos MongoDB a implementar

### User.js
- Campos: `name`, `email` (unique), `password` (hash bcrypt salt:12), `age`, `gender`, `occupation`, `city`, `settings{reminders, darkTheme, volumeUnit}`, `isDeleted` (soft delete), `deletedAt`
- Pre-save hook: hashear contraseña si fue modificada
- Método de instancia: `comparePassword(candidate)` → Boolean
- Nunca devolver el campo `password` en queries (usar `.select('-password')`)
- Timestamps automáticos: `createdAt`, `updatedAt`

### Evaluation.js
- Campos: `userId` (ref:User), `frequencyScores[]` → `{hz, score, ear}`, `habitData{headphoneHours, volumeLevel, noiseExposure, occupationRisk, smoking}`, `status` (enum: complete/partial), `takenAt`

### NoiseRecord.js
- Campos: `userId` (ref:User), `deviceId` (ref:Device, optional), `dbLevel`, `riskTag` (enum: bajo/moderado/alto/muy_alto), `source` (enum: iot/manual/app), `location`, `recordedAt`

### RiskResult.js
- Campos: `evaluationId` (ref:Evaluation, unique), `riskScore` (0-100), `riskLevel` (enum), `yearsEstimated`, `aiModel` (default:'v1.0'), `generatedAt`

---

## 🛣️ Endpoints a implementar

| Método | Ruta | Descripción | Auth requerida |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | Crear nuevo usuario | ❌ |
| POST | `/api/auth/login` | Login → JWT | ❌ |
| POST | `/api/auth/refresh` | Renovar access token | ❌ (con refresh token) |
| POST | `/api/auth/logout` | Invalidar refresh token | ✅ |
| GET | `/api/auth/me` | Datos del usuario actual | ✅ |

---

## 📋 Reglas de negocio críticas

1. **Registro:** Verificar email duplicado antes de crear. Si existe → HTTP 409 con `{ success: false, error: "CONFLICT", message: "Este correo ya está registrado" }`
2. **Login:** Si email no existe O contraseña incorrecta → siempre HTTP 401 (no revelar cuál falló)
3. **Contraseña:** Mínimo 8 chars, al menos 1 número y 1 letra mayúscula. Validar con express-validator
4. **JWT Access Token:** Expira en 15 minutos. Payload: `{ id, email, iat, exp }`
5. **JWT Refresh Token:** Expira en 7 días. Almacenar hash en BD para poder invalidar en logout
6. **Soft Delete:** Nunca eliminar usuarios físicamente. Usar `isDeleted: true` + `deletedAt: Date.now()`
7. **Formato de respuesta:** SIEMPRE `{ success: Boolean, data: Object|null, message: String }`

---

## 🧪 Tests TDD obligatorios — auth.test.js

```
✅ POST /api/auth/register
   - Debe crear usuario y retornar JWT con status 201
   - Debe rechazar email duplicado con status 409
   - Debe rechazar contraseña débil (<8 chars) con status 400
   - No debe devolver el campo password en la respuesta
   - Debe hashear la contraseña (no guardar en texto plano)

✅ POST /api/auth/login
   - Debe retornar access token y refresh token con status 200
   - Debe rechazar email inexistente con status 401
   - Debe rechazar contraseña incorrecta con status 401
   - El mensaje de error NO debe indicar si el email o contraseña es lo incorrecto

✅ POST /api/auth/refresh
   - Debe retornar nuevo access token con refresh token válido
   - Debe rechazar refresh token expirado con status 401
   - Debe rechazar refresh token inválido con status 401

✅ GET /api/auth/me
   - Debe retornar datos del usuario con token válido
   - Debe rechazar request sin token con status 401
   - Debe rechazar token expirado con status 401
```

---

## 🏁 Criterio de éxito de esta fase

- [ ] `npm test` pasa al 100% (todos los tests en verde)
- [ ] Cobertura de código ≥ 80% en módulo auth
- [ ] Conexión a MongoDB funcionando (local o Atlas)
- [ ] Postman/Insomnia puede hacer register → login → acceder a /me
- [ ] No hay contraseñas en texto plano en la BD
- [ ] Variables sensibles solo en .env (nunca en el código)

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_1_MVP.md @DB_Modelo_BaseDatos.docx @Normativas_Estandares.docx

Basado en este hito, implementa la Fase 1 completa:
1. Estructura de carpetas del backend
2. Modelos MongoDB (User, Evaluation, NoiseRecord, RiskResult)
3. Auth completo (register, login, refresh, logout, me)
4. Middleware de auth y manejo de errores
5. Tests TDD en auth.test.js

NO pases a la siguiente fase hasta que todos los tests pasen al 100%.
Sigue estrictamente el diccionario de datos y los estándares de seguridad definidos.
```
