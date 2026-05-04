# HearGuard AI

Plataforma de salud auditiva preventiva con IA. Monitorea la exposición al ruido en tiempo real, realiza pruebas auditivas por cuestionario y genera predicciones de riesgo personalizadas mediante un modelo de Machine Learning.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Clientes                                 │
│   Angular 21 (web)         Flutter 3 (móvil)   ESP32 (IoT)     │
└──────────────┬─────────────────┬───────────────────┬───────────┘
               │ HTTP/REST       │ HTTP/REST          │ X-Device-Key
               ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Node.js / Express 5                        │
│   /api/auth   /api/noise   /api/evaluations   /api/devices      │
│              JWT access 15min + refresh 7d                      │
└──────────┬──────────────────────────────┬───────────────────────┘
           │ HTTP                          │ Mongoose
           ▼                              ▼
┌──────────────────────┐     ┌────────────────────────────────────┐
│  AI Service (Flask)  │     │        MongoDB Atlas               │
│  POST /predict-risk  │     │  users · noiseRecords              │
│  POST /recommend     │     │  evaluations · riskResults         │
│  RandomForest scikit │     │  devices                           │
└──────────────────────┘     └────────────────────────────────────┘
```

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend web | Angular 21 + Signals API + SCSS |
| App móvil | Flutter 3 + Dart + Provider + Dio |
| Backend API | Node.js 18 + Express 5 + Mongoose 9 |
| IA/ML | Python 3.11 + Flask + scikit-learn (RandomForest) |
| Base de datos | MongoDB Atlas M0 |
| Auth | JWT (access 15min + refresh 7d, rotación SHA-256) |
| IoT | ESP32 + KY-037, puente serial Node.js |
| CI | GitHub Actions (backend tests, AI tests, Angular build, Flutter analyze) |
| Deploy | GitHub Container Registry → Render (backend + AI) + Vercel (frontend) |

---

## Requisitos previos

- Node.js ≥ 18
- Python 3.11
- Flutter ≥ 3.22 (para la app móvil)
- Docker + Docker Compose (para levantar todo en un comando)
- Cuenta en MongoDB Atlas (o MongoDB local)

---

## Inicio rápido — Docker Compose

```bash
# 1. Clonar
git clone https://github.com/tu-usuario/hearguard-ai.git
cd hearguard-ai

# 2. Variables de entorno
cp .env.example .env
#    → editar .env con tu MONGO_URI y secretos JWT

# 3. Levantar todo el stack
npm run docker:up
```

| Servicio | URL |
|---|---|
| Frontend Angular | http://localhost:8080 |
| Backend API | http://localhost:3000 |
| AI Service | http://localhost:5001 |

---

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend
cp .env.example .env   # completar JWT_SECRET, JWT_REFRESH_SECRET, MONGO_URI
npm install
npm run dev            # nodemon en puerto 3000
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
python -m model.trainer          # entrena y guarda el modelo (~5s)
python app.py                    # Flask en puerto 5001
```

### Frontend Angular

```bash
cd frontend
npm install
npm start              # ng serve en puerto 4200 con proxy al backend
```

### App Flutter

```bash
cd flutter_app
flutter pub get
# Editar lib/core/config/app_config.dart → apiUrl según tu entorno
flutter run            # requiere emulador o dispositivo
```

---

## Variables de entorno

Ver `.env.example` en la raíz. Las críticas:

| Variable | Descripción |
|---|---|
| `MONGO_URI` | URI de MongoDB Atlas |
| `JWT_SECRET` | Secreto JWT (≥ 64 hex chars) |
| `JWT_REFRESH_SECRET` | Secreto refresh token |
| `AI_SERVICE_URL` | URL interna del servicio Flask |
| `FRONTEND_URL` | URL del frontend (CORS) |

Generar secretos:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## API — Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login → access + refresh tokens |
| POST | `/api/auth/refresh` | Renovar access token |
| GET | `/api/auth/me` | Perfil del usuario autenticado |
| PATCH | `/api/auth/me` | Actualizar nombre |

### Ruido
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/noise` | Guardar lectura (app) |
| POST | `/api/noise/iot` | Guardar lectura (dispositivo, `X-Device-Key`) |
| GET | `/api/noise` | Historial con filtros |
| GET | `/api/noise/stats/today` | Estadísticas del día |
| GET | `/api/noise/stats/week` | Estadísticas de la semana |

### Evaluaciones
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/evaluations` | Crear evaluación → llama al AI service |
| GET | `/api/evaluations` | Historial |
| GET | `/api/evaluations/:id` | Detalle con `riskResult` |

### Dispositivos IoT
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/devices` | Registrar dispositivo → devuelve `apiKey` |
| GET | `/api/devices` | Listar dispositivos del usuario |

---

## Integración IoT

1. Registrar dispositivo en `/app/devices` → copiar `apiKey`.
2. **ESP32 con WiFi**: editar `arduino/hearguard_esp32/hearguard_esp32.ino` con tu SSID, contraseña y `apiKey`, subir con Arduino IDE.
3. **Arduino Uno** (sin WiFi): subir `arduino/hearguard_sensor/hearguard_sensor.ino` y ejecutar el puente:
   ```bash
   cd arduino && npm install
   DEVICE_KEY=hg_xxx PORT=COM3 node serial_bridge.js
   ```

---

## Tests

```bash
# Backend — 63 tests (Jest + Supertest + mongodb-memory-server)
cd backend && npm test

# AI Service — 7 tests (pytest)
cd ai-service && pytest tests/ -v
```

Cobertura backend: statements 81% · branches 60% · functions 88% · lines 82%.

---

## Despliegue

### CI automático (GitHub Actions)

Al hacer push a `main` se ejecutan 4 jobs en paralelo:
- `backend` — tests Jest con MongoDB en servicio
- `ai-service` — entrenamiento del modelo + pytest
- `frontend` — `ng build`
- `flutter` — `flutter analyze`

### Deploy (manual o automático tras CI)

Configura los siguientes secrets en GitHub → Settings → Secrets:

| Secret | Valor |
|---|---|
| `RENDER_BACKEND_HOOK` | Deploy hook de tu servicio backend en Render |
| `RENDER_AI_HOOK` | Deploy hook de tu servicio AI en Render |
| `BACKEND_URL` | URL pública del backend (p.ej. `https://api.hearguard.onrender.com`) |
| `VERCEL_TOKEN` | Token de Vercel |
| `VERCEL_ORG_ID` | ID de organización Vercel |
| `VERCEL_PROJECT_ID` | ID de proyecto Vercel |

Ejecutar deploy manualmente: GitHub → Actions → Deploy → Run workflow.

---

## Estructura del proyecto

```
hearguard-ai/
├── backend/              Node.js / Express API
│   ├── src/
│   │   ├── controllers/  auth, noise, evaluation, device
│   │   ├── models/       User, NoiseRecord, Evaluation, RiskResult, Device
│   │   ├── routes/       Rutas Express
│   │   ├── services/     ai.service, noise.service
│   │   └── validators/   express-validator
│   └── tests/            63 tests Jest + Supertest
├── ai-service/           Flask + scikit-learn
│   ├── model/            trainer, predictor, features
│   └── tests/            7 tests pytest
├── frontend/             Angular 21 SPA
│   └── src/app/features/ auth, dashboard, monitor, hearing-test,
│                          results, history, profile, devices, recommendations
├── flutter_app/          App móvil Flutter
│   └── lib/
│       ├── core/         config, models, services, theme
│       └── features/     splash, auth, dashboard, monitor,
│                          history, profile, hearing, results, shell
├── arduino/              Firmware IoT
│   ├── hearguard_esp32/  ESP32 con WiFi + HTTP
│   ├── hearguard_sensor/ Arduino Uno (modo serie)
│   └── serial_bridge.js  Puente serie → backend
├── docker/               Dockerfiles + nginx config
├── .github/workflows/    CI (ci.yml) + Deploy (deploy.yml)
└── docker-compose.yml    Stack completo local
```

---

## Licencia

MIT — Universidad Continental · Ingeniería de Sistemas
