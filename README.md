# HearGuard AI

[![CI](https://github.com/hatWHITE-UwU/hearguard-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hatWHITE-UwU/hearguard-ai/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=alert_status)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=coverage)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=bugs)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=security_rating)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)

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
| Backend API | Node.js 20 + Express 5 + Mongoose 9 |
| IA/ML | Python 3.11 + Flask + scikit-learn (RandomForest) |
| Base de datos | MongoDB Atlas M0 |
| Auth | JWT (access 15min + refresh 7d, rotación SHA-256) |
| IoT | ESP32 + KY-037, puente serial Node.js |
| CI | GitHub Actions (backend, AI, Angular, Playwright E2E, Flutter) + SonarCloud GitHub App |
| Deploy | GitHub Container Registry → Render (backend + AI) + Vercel (frontend) |
| Metodología | **TDD + BDD** (principal) y **CRISP-DM** (modelo de IA) — ver [`docs/metodologia.md`](docs/metodologia.md) y [`docs/articulo.md`](docs/articulo.md) |
| Calidad SonarCloud | Quality Gate **Aprobado** · Security **A** · Reliability **A** · Maintainability **A** · 0 issues abiertas · 13 K LOC · duplicación 1.4 % |

---

## Requisitos previos

- Node.js ≥ 20
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
| **Swagger UI** | http://localhost:3000/api/docs |
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

| Capa | Comando | Pruebas |
|------|---------|---------|
| Backend (API + Seguridad) | `cd backend && npm test` | **126** (Jest + Supertest — auth, noise, evaluation, device, middleware, seguridad) |
| AI Service | `cd ai-service && pytest tests/ -v` | **30** (test_predictor.py × 7 + test_api.py × 23) |
| Frontend Angular | `cd frontend && npm run test:ci` | **74** (hearing-test, noise-monitor, auth service, guards, interceptors) |
| Flutter | `cd flutter_app && flutter test` | **42** (`test/`) |
| E2E Playwright | `cd e2e && npx playwright test --project=chromium` | **36** (smoke + autenticación + prueba auditiva, chromium contra Vercel preview) |
| Rendimiento k6 | `k6 run tests/k6/load-test.js` | 3 escenarios (smoke / load / spike) |

**Total automatizado:** **308** casos de prueba + 3 escenarios de rendimiento.

Umbrales de cobertura mínima aplicados en CI:

| Capa | Umbral | Verificación |
|------|--------|--------------|
| Backend | líneas ≥ 60 % (CI) — script Node parsea `coverage/lcov.info` | `ci.yml` job `backend` |
| AI Service | ≥ 60 % líneas | `pytest --cov-fail-under=60` |

Cobertura backend (última ejecución local): statements 91.3 % · branches 82.3 % · functions 93.2 % · lines 91.9 %.

### Caja negra y caja blanca

| Enfoque | Dónde se aplica en HearGuard |
|---------|------------------------------|
| **Caja negra** | Tests de API (`backend/tests/*.test.js`): solo HTTP, JSON y códigos de respuesta. Uso de la web/móvil e IoT (`POST /api/noise/iot`). Casos del plan por endpoint. |
| **Caja blanca** | `ai-service/tests/test_predictor.py` (lógica del modelo). `frontend/**/*.spec.ts` y `flutter_app/test/` (servicios, guards, mappers). Cobertura Jest/pytest y SonarCloud. |

Detalle por módulo y tipo IEEE/ISO: ver sección 3 de [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md).

### BDD — Gherkin / Cucumber

Escenarios conductuales en lenguaje natural (Given / When / Then) en [`docs/features/`](docs/features/):

| Feature | Escenarios |
|---------|-----------|
| [`autenticacion.feature`](docs/features/autenticacion.feature) | 15 — registro, login, refresh, seguridad JWT |
| [`monitoreo-ruido.feature`](docs/features/monitoreo-ruido.feature) | 17 — clasificación dB, IDOR, IoT |
| [`prueba-auditiva.feature`](docs/features/prueba-auditiva.feature) | 17 — 12 pasos tonales, gain → score, API evaluaciones |
| [`prediccion-riesgo-ia.feature`](docs/features/prediccion-riesgo-ia.feature) | 14 — perfiles bajo/alto riesgo, score_to_level |
| [`resultados-y-recomendaciones.feature`](docs/features/resultados-y-recomendaciones.feature) | 13 — historial, gráfica, recomendaciones por nivel |
| [`dispositivos-iot.feature`](docs/features/dispositivos-iot.feature) | 9 — registro ESP32, apiKey, LED GPIO |

---

## Despliegue

### CI automático (GitHub Actions)

Workflow [`ci.yml`](.github/workflows/ci.yml) en cada push a `main`/`develop` y en pull requests. Seis jobs:

| Job | Qué hace |
|-----|----------|
| `backend` | **ESLint** (`npm run lint`) + Tests Jest (MongoDB en servicio) + verificación de cobertura de líneas ≥ 60 % parseando `coverage/lcov.info` |
| `ai-service` | Entrena modelo (`python -m model.trainer`, `SEED=42`) + pytest con `--cov-fail-under=60` |
| `frontend` | `npm run lint` + `npm run test:ci` (Vitest sobre Chromium) + `ng build` |
| `e2e` | Playwright sobre Chromium contra el preview de Vercel; reporte HTML subido como artefacto |
| `flutter` | `flutter analyze` + `flutter test --coverage` |
| `deploy` | Solo en push a `main`: hooks Render (backend + IA) y Vercel (frontend) tras la aprobación de los jobs anteriores |

> El análisis estático de **SonarCloud** se ejecuta de forma automática vía el GitHub App "SonarCloud Automatic Analysis", no como job del workflow. Cada push a `main` dispara el escaneo y publica el resultado en el Quality Gate del proyecto.

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

## Calidad del código

### Análisis estático

| Herramienta | Scope | Reglas clave |
|-------------|-------|-------------|
| **ESLint** (`backend/eslint.config.js`) | Node.js backend | `eslint-plugin-n` (Node builtins), `eslint-plugin-security` (OWASP), `eqeqeq`, `no-shadow`, `no-return-await` |
| **SonarCloud** (GitHub App de Análisis Automático) | Backend + Frontend + AI | Quality Gate **Aprobado** — 0 bugs, 0 vulnerabilidades, 0 code smells abiertos · Security **A** · Reliability **A** · Maintainability **A** · duplicación 1.4 % sobre 13 K LOC |
| **flutter analyze** | App móvil | Análisis estático Dart |

Ejecutar lint backend:

```bash
cd backend && npm run lint      # 0 errores, 0 warnings
```

### Pre-commit hooks (Husky + lint-staged)

Al hacer `git commit`, se ejecutan automáticamente:

- **Backend JS** — `npm run lint --prefix backend` (ESLint, 0 warnings max)
- **Frontend TS** — `npm run lint --prefix frontend`
- **Python** — `python -m py_compile` (verifica sintaxis)
- **commit-msg** — valida formato [Conventional Commits](https://www.conventionalcommits.org/): `feat|fix|docs|style|refactor|test|chore(scope): descripción`

### Complejidad ciclomática

Análisis McCabe (1976) de las 17 funciones críticas: [`docs/complejidad-ciclomatica.md`](docs/complejidad-ciclomatica.md).

| Función más compleja | CC | Riesgo | Tests |
|---------------------|----|--------|-------|
| `predict_risk` | 7 | Moderado | 5+ |
| `register` / `login` | 5 | Moderado | 5 c/u |
| Resto de funciones | 1–4 | Bajo | ≥ 2 c/u |

**59 caminos independientes** identificados; ≥ 52 cubiertos (88 % de cobertura de rutas).

### Documentación QA

| Documento | Descripción |
|-----------|-------------|
| [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md) | Plan de pruebas IEEE 829-2008 con casos, precondiciones y resultados esperados |
| [`docs/complejidad-ciclomatica.md`](docs/complejidad-ciclomatica.md) | Análisis CC McCabe — 17 funciones, escala de riesgo |
| [`docs/matriz-trazabilidad.md`](docs/matriz-trazabilidad.md) | Matriz IEEE 829 — 60 RF + 10 RNF → BDD → tests → estado |
| [`docs/api-spec.yml`](docs/api-spec.yml) | Especificación OpenAPI 3.1 — 18 endpoints con esquemas completos. Swagger UI interactivo en `/api/docs` |
| [`docs/features/`](docs/features/) | 6 Feature files Gherkin — 85 escenarios BDD |

---

## Estructura del proyecto

```
hearguard-ai/
├── backend/              Node.js / Express API
│   ├── src/              controllers, models, routes, services, validators
│   ├── eslint.config.js  ESLint flat config (plugin-n + plugin-security)
│   └── tests/            126 tests Jest + Supertest (incl. 22 de seguridad)
├── ai-service/           Flask + scikit-learn
│   ├── model/            trainer (numpy default_rng), predictor, features
│   └── tests/            30 tests pytest (test_predictor × 7 + test_api × 23)
├── frontend/             Angular 21 SPA
│   ├── src/app/features/ auth, dashboard, monitor, hearing-test,
│   │                      results, history, profile, devices, recommendations
│   └── 74 specs Vitest
├── flutter_app/          App móvil Flutter (42 tests)
├── e2e/                  Playwright — 36 tests (smoke + auth + hearing-test)
├── arduino/              Firmware IoT
│   ├── hearguard_esp32/  ESP32 con WiFi + HTTP
│   ├── hearguard_sensor/ Arduino Uno (modo serie)
│   ├── wokwi/            Simulación ESP32 (diagram.json, sketch.ino)
│   └── serial_bridge.js  Puente serie → backend
├── docs/                 metodologia.md · articulo.md · plan-de-pruebas.md
│   │                     complejidad-ciclomatica.md · matriz-trazabilidad.md · api-spec.yml
│   └── features/         6 .feature Gherkin (85 escenarios BDD)
├── Document/             Roadmap técnico por fases
├── scripts/              utilidades (Claude Code: resume / continue)
├── docker/               Dockerfiles + nginx config
├── .github/workflows/    ci.yml + deploy.yml
└── docker-compose.yml    Stack completo local
```

---

## Licencia

MIT — Universidad Continental · Ingeniería de Sistemas

