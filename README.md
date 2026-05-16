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
| Metodología | Desarrollo **iterativo por fases** (roadmap en `Document/`), pruebas automatizadas y **CI/CD** |

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
git clone https://github.com/hatWHITE-UwU/hearguard-ai.git
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

Detalle de cableado y librerías: [`arduino/README_arduino.md`](arduino/README_arduino.md).

1. Registrar dispositivo en la app (`/app/devices`) → copiar `apiKey`.
2. **ESP32 con WiFi**: editar `arduino/hearguard_esp32/hearguard_esp32.ino` (`WIFI_*`, `BACKEND_URL`, `DEVICE_KEY`) y subir con Arduino IDE.
3. **Simulación Wokwi** (sin hardware): carpeta [`arduino/wokwi/`](arduino/wokwi/) (`sketch.ino`, `diagram.json`, `libraries.txt`). Ver [`arduino/wokwi/README.md`](arduino/wokwi/README.md).
4. **Arduino Uno** (sin WiFi): subir `arduino/hearguard_sensor/hearguard_sensor.ino` y ejecutar el puente:
   ```bash
   cd arduino && npm install
   DEVICE_KEY=hg_xxx PORT=COM3 node serial_bridge.js
   ```

---

## Claude Code — conversaciones anteriores

Claude Code guarda el historial por **carpeta del proyecto**. Si ejecutas solo `claude`, suele abrirse una **sesión nueva** (pantalla de bienvenida). Para **ver** sesiones guardadas de este repo y **abrir** una:

```powershell
cd C:\Proyectos\hearguard-ai
.\scripts\list-claude-sessions.ps1    # fechas de cada sesión (.jsonl)
.\scripts\claude-resume.ps1            # menú para elegir y continuar
.\scripts\claude-continue.ps1          # sigue la última sesión de esta carpeta (sin menú)
```

Equivalente manual: `claude --resume` o `claude --continue` desde la raíz del repo. Los archivos en bruto están en `%USERPROFILE%\.claude\projects\c--Proyectos-hearguard-ai\`.

---

## Tests

Plan detallado de casos (IDs, precondiciones, resultados esperados): [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md).

| Capa | Comando | Pruebas (aprox.) |
|------|---------|------------------|
| Backend | `cd backend && npm test` | **72** (Jest + Supertest) |
| AI Service | `cd ai-service && pytest tests/ -v` | **7** (pytest) |
| Frontend | `cd frontend && npm run test:ci` | **18** (`.spec.ts`) |
| Flutter | `cd flutter_app && flutter test` | **42** (`test/`) |

**Total automatizado:** ~**139** casos (sin contar pruebas manuales IoT / E2E en navegador).

### Caja negra y caja blanca

| Enfoque | Dónde se aplica en HearGuard |
|---------|------------------------------|
| **Caja negra** | Tests de API (`backend/tests/*.test.js`): solo HTTP, JSON y códigos de respuesta. Uso de la web/móvil e IoT (`POST /api/noise/iot`). Casos del plan por endpoint. |
| **Caja blanca** | `ai-service/tests/test_predictor.py` (lógica del modelo). `frontend/**/*.spec.ts` y `flutter_app/test/` (servicios, guards, mappers). Cobertura Jest/pytest y SonarCloud. |

Detalle por módulo y tipo IEEE/ISO: ver sección 3 de [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md).

Cobertura backend (última ejecución local): statements ~83% · branches ~60% · functions ~90% · lines ~84%.

---

## Despliegue

### CI automático (GitHub Actions)

Workflow [`ci.yml`](.github/workflows/ci.yml) en cada push a `main`/`develop` y en pull requests:

| Job | Qué hace |
|-----|----------|
| `backend` | Tests Jest (MongoDB en servicio) + cobertura |
| `ai-service` | Entrena modelo + pytest |
| `frontend` | `npm run test:ci` + `ng build` |
| `flutter` | `flutter analyze` + `flutter test` |
| `sonar` | SonarCloud (tras los jobs anteriores) |
| `deploy` | Solo en push a `main`: hooks Render (backend + IA) y Vercel (frontend) |

Workflow adicional [`deploy.yml`](.github/workflows/deploy.yml): build de imágenes Docker (GHCR) y despliegue manual o por push.

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
| `VERCEL_FRONTEND_HOOK` | Deploy hook de Vercel (usado en `ci.yml`) |

Ejecutar deploy manualmente: GitHub → Actions → **Deploy** → Run workflow.

---

## Estructura del proyecto

```
hearguard-ai/
├── backend/              Node.js / Express API
│   ├── src/              controllers, models, routes, services, validators
│   └── tests/            72 tests Jest + Supertest
├── ai-service/           Flask + scikit-learn
│   ├── model/            trainer, predictor, features
│   └── tests/            7 tests pytest
├── frontend/             Angular 21 SPA
│   └── src/app/features/ auth, dashboard, monitor, hearing-test,
│                          results, history, profile, devices, recommendations
├── flutter_app/          App móvil Flutter
├── arduino/              Firmware IoT
│   ├── hearguard_esp32/  ESP32 con WiFi + HTTP
│   ├── hearguard_sensor/ Arduino Uno (modo serie)
│   ├── wokwi/            Simulación ESP32 (diagram.json, sketch.ino)
│   └── serial_bridge.js  Puente serie → backend
├── docs/                 plan-de-pruebas.md
├── Document/             Roadmap técnico por fases
├── scripts/              utilidades (Claude Code: resume / continue)
├── docker/               Dockerfiles + nginx config
├── .github/workflows/    ci.yml + deploy.yml
└── docker-compose.yml    Stack completo local
```

---

## Licencia

MIT — Universidad Continental · Ingeniería de Sistemas

