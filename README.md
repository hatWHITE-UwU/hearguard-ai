# HearGuard AI

[![CI](https://github.com/hatWHITE-UwU/hearguard-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/hatWHITE-UwU/hearguard-ai/actions/workflows/ci.yml)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=alert_status)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=coverage)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=bugs)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=hatWHITE-UwU_hearguard-ai&metric=security_rating)](https://sonarcloud.io/project/overview?id=hatWHITE-UwU_hearguard-ai)

Plataforma de salud auditiva preventiva con IA. Monitorea la exposición al ruido en tiempo real, realiza pruebas auditivas por cuestionario y genera predicciones de riesgo personalizadas mediante un modelo de Machine Learning.

### Identificación del software

| Campo | Valor |
|-------|--------|
| **Nombre** | HearGuard AI |
| **Descripción funcional** | Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva |
| **Versión** | v1.0 |
| **Autores** | Luis Francisco Terreros Hinojosa · Hardy Eduardo Rondinel Aquino |
| **Institución** | Universidad Continental, Perú — Ingeniería de Sistemas |
| **Repositorio** | [github.com/hatWHITE-UwU/hearguard-ai](https://github.com/hatWHITE-UwU/hearguard-ai) |

---

## Estado del proyecto (mayo 2026)

Hitos principales completados en el repositorio:

| Área | Logro |
|------|--------|
| **Funcionalidad** | API REST (auth, ruido, evaluaciones, dispositivos IoT), web Angular, app Flutter, firmware ESP32, microservicio IA Flask |
| **Metodología** | TDD + BDD (principal) documentado en [`docs/metodologia.md`](docs/metodologia.md); CRISP-DM para el modelo ML |
| **Pruebas** | **422** casos automatizados + **3** escenarios k6; plan IEEE 829 en [`docs/plan-de-pruebas.md`](docs/plan-de-pruebas.md) |
| **Trazabilidad** | 60 RF + 10 RNF → BDD → tests en [`docs/matriz-trazabilidad.md`](docs/matriz-trazabilidad.md) |
| **SonarCloud** | Quality Gate **OK** · Security / Reliability / Maintainability **A** · **0** issues · duplicación **0 %** · cobertura **100 %** |
| **CI/CD** | GitHub Actions (backend, IA, frontend, e2e, flutter, **sonarcloud**, deploy) + Render + Vercel |
| **Cobertura** | Job `sonarcloud` con artefactos lcov/coverage.xml; script [`scripts/fix-sonar-coverage-paths.js`](scripts/fix-sonar-coverage-paths.js) para mapeo de rutas |
| **Seguridad** | Suite `security.test.js`; correcciones S2068, S5147, regresiones C→A en Sonar |
| **Documentación académica** | [`docs/articulo.md`](docs/articulo.md), matriz Excel [`docs/matriz-registro-hearguard.xlsx`](docs/matriz-registro-hearguard.xlsx) |
| **Operaciones** | Runbook v1.0 + Prompt maestro para ejecución por fases (estabilización y routing multi-entorno) |

Pendientes documentados (no bloquean el MVP v1.0): ejecución automática de `.feature` con Cucumber; reporte k6 en producción.

---

## Arquitectura

```
┌────────────────────────────────────────────────────────────────┐
│                        Clientes                                │
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
| CI | GitHub Actions (backend, AI, frontend, e2e, flutter, **sonarcloud**, deploy) |
| Calidad estática | SonarCloud (análisis CI con `SONAR_TOKEN` + `sonar-project.properties`) |
| Deploy | GitHub Container Registry → Render (backend + AI) + Vercel (frontend) |
| Metodología | **TDD + BDD** (principal) y **CRISP-DM** (modelo de IA) — ver [`docs/metodologia.md`](docs/metodologia.md) y [`docs/articulo.md`](docs/articulo.md) |
| Calidad SonarCloud | Quality Gate **Aprobado** · Security **A** · Reliability **A** · Maintainability **A** · 0 issues abiertas · 13 K LOC · duplicación **0 %** · cobertura **100 %** |

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
| POST | `/api/auth/logout` | Revocar refresh token (requiere JWT) |
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
| GET | `/api/evaluations` | Historial (paginado: `limit`, `skip`) |
| GET | `/api/evaluations/:id` | Detalle con `riskResult` |
| PATCH | `/api/evaluations/:id` | Actualizar `habitData`, `status` o `frequencyScores` |

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
| Backend (API + Seguridad) | `cd backend && npm test -- --runInBand` | **207** (Jest + Supertest — auth, noise, evaluation, device, middleware, seguridad, env, logger, coverage-extra, evaluation-ai) |
| AI Service | `cd ai-service && pytest tests/ -v` | **30** (test_predictor.py × 7 + test_api.py × 23) |
| Frontend Angular | `cd frontend && npm run test:ci` | **107** (auth service, interceptor, guards, hearing-test, noise-monitor, gauge, risk-badge, app) |
| Flutter | `cd flutter_app && flutter test` | **42** (user, api_response, hearing_mapper, auth_service) |
| E2E Playwright | `cd e2e && npx playwright test --project=chromium` | **36** (smoke + autenticación + prueba auditiva, chromium contra Vercel preview) |
| Rendimiento k6 | `k6 run tests/k6/load-test.js` | 3 escenarios (smoke / load / spike) |

**Total automatizado:** **422** casos de prueba + 3 escenarios de rendimiento.

> **Nota:** el backend se ejecuta con `--runInBand` para garantizar cobertura precisa — la ejecución paralela produce conflictos de conexión MongoDB cuando hay múltiples workers simultáneos.

Umbrales de cobertura aplicados en CI:

| Capa | Umbral | Verificación |
|------|--------|--------------|
| Backend | **100 %** statements, branches, functions, lines | `ci.yml` job `backend` |
| AI Service | ≥ 60 % líneas | `pytest --cov-fail-under=60` |

**Cobertura backend (local, `--runInBand`):** statements **100 %** · branches **100 %** · functions **100 %** · lines **100 %**

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

Workflow [`ci.yml`](.github/workflows/ci.yml) en cada push a `main`/`develop` y en pull requests:

| Job | Qué hace |
|-----|----------|
| `backend` | ESLint + Jest (`--runInBand`) con MongoDB 7 + umbral cobertura ≥ 60 % + artefacto `lcov.info` |
| `ai-service` | `python -m model.trainer` (`SEED=42`) + pytest `--cov-fail-under=60` + `coverage.xml` |
| `frontend` | ESLint + Vitest (Chromium) + `ng build` + artefacto lcov (`hearguard-frontend/`) |
| `e2e` | Playwright contra preview Vercel; reporte HTML como artefacto |
| `k6-smoke` | K6 smoke (1 VU, 30 s) contra backend en producción; artefacto de texto |
| `lighthouse` | Lighthouse CI contra Vercel — accessibility ≥ 90 % (error), perf/BP/SEO ≥ 80/85/80 (warn) |
| `flutter` | `flutter analyze` + `flutter test --coverage` |
| `sonarcloud` | Descarga coberturas, ejecuta `fix-sonar-coverage-paths.js`, escaneo SonarCloud scan-action v6 |
| `deploy` | Solo en `main`: hooks Render (backend + IA) y Vercel (frontend) |

**SonarCloud:** requiere secret `SONAR_TOKEN` y **Automatic Analysis desactivado** en el proyecto SonarCloud. La cobertura se inyecta desde los artefactos de los jobs anteriores (ver [`sonar-project.properties`](sonar-project.properties)).

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
| `SONAR_TOKEN` | Token de análisis SonarCloud (job `sonarcloud` en `ci.yml`) |
| `VERCEL_FRONTEND_URL` | URL del frontend en Vercel (jobs `e2e` y `lighthouse`) |

Ejecutar deploy manualmente: GitHub → Actions → **Deploy** → Run workflow.

Regenerar matriz de registro académica (Excel):

```bash
python scripts/generar-matriz-registro.py
```

---

## Calidad del código

### Análisis estático

| Herramienta | Scope | Reglas clave |
|-------------|-------|-------------|
| **ESLint** (`backend/eslint.config.js`) | Node.js backend | `eslint-plugin-n` (Node builtins), `eslint-plugin-security` (OWASP), `eqeqeq`, `no-shadow`, `no-return-await` |
| **SonarCloud** (job CI + `sonar-project.properties`) | Backend + Frontend + AI | Quality Gate **OK** — 0 issues · Security / Reliability / Maintainability **A** · duplicación **0 %** · cobertura **100 %** |
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
| [`docs/matriz-registro-hearguard.xlsx`](docs/matriz-registro-hearguard.xlsx) | Matriz de registro (Intents/Bolts, evidencia IA, avance) — regenerar con `python scripts/generar-matriz-registro.py` |
| [`docs/Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md`](docs/Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md) | Runbook operativo v1.0 — baseline, puertos, auth, polling y routing multi-entorno |
| [`docs/PROMPT_MAESTRO_Ejecucion_Controlada_Runbook_HearGuard_AI_v1.0.md`](docs/PROMPT_MAESTRO_Ejecucion_Controlada_Runbook_HearGuard_AI_v1.0.md) | Prompt maestro para ejecutar cada fase del Runbook (0–9) con informe de cumplimiento |
| [`docs/runbook/informes-cumplimiento/`](docs/runbook/informes-cumplimiento/) | Plantilla `Informe_Fase_TEMPLATE.md` para certificar cada fase |
| [`docs/metodologia.md`](docs/metodologia.md) | Metodología TDD+BDD + CRISP-DM con referencias APA |
| [`docs/articulo.md`](docs/articulo.md) | Borrador del artículo / paper del proyecto |
| [`docs/api-spec.yml`](docs/api-spec.yml) | Especificación OpenAPI 3.1 — 18 endpoints. Swagger UI en `/api/docs` |
| [`docs/features/`](docs/features/) | 6 archivos Gherkin — 85 escenarios BDD |

---

## Estructura del proyecto

```
hearguard-ai/
├── backend/                      Node.js / Express API
│   ├── src/
│   │   ├── config/               env.js · database.js · constants.js
│   │   ├── controllers/          auth · noise · evaluation · device
│   │   ├── middleware/           auth.middleware.js · errorHandler.js
│   │   ├── models/               User · NoiseRecord · Evaluation · RiskResult · Device
│   │   ├── routes/               auth · noise · evaluation · device
│   │   ├── services/             noise.service.js · ai.service.js
│   │   ├── utils/                jwt.utils.js · logger.js
│   │   └── validators/           auth · noise · evaluation · device · profile
│   ├── eslint.config.js          ESLint flat config (plugin-n + plugin-security)
│   └── tests/                    207 tests Jest + Supertest
│       ├── auth.test.js          autenticación (register, login, refresh, logout, me, patch)
│       ├── noise.test.js         ruido (CRUD, IoT, filtros, stats)
│       ├── evaluation.test.js    evaluaciones (create, list, getById, patch)
│       ├── device.test.js        dispositivos IoT
│       ├── middleware.test.js    auth middleware (401, 403, expirado)
│       ├── security.test.js      22 casos de seguridad (NoSQL, XSS, IDOR, brute-force)
│       ├── noise.service.test.js lógica de clasificación y estadísticas
│       ├── database.test.js      reconexión, reintentos, entornos
│       ├── logger.test.js        modo producción (JSON format)
│       ├── evaluation-ai.test.js integración evaluación → AI service (mocked)
│       ├── env.test.js           ramas de fallback de env.js (dotenv mockeado)
│       └── coverage-extra.test.js ramas residuales (buildDateFilter, deviceId, pagination)
├── ai-service/                   Flask + scikit-learn
│   ├── model/                    trainer (numpy default_rng, SEED=42) · predictor · constants.py
│   └── tests/                    30 tests pytest (test_predictor × 7 + test_api × 23)
├── frontend/                     Angular 21 SPA (standalone + Signals)
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── guards/           auth.guard.ts
│   │   │   ├── interceptors/     auth.interceptor.ts (JWT + refresh automático)
│   │   │   └── services/         auth.service.ts
│   │   ├── features/
│   │   │   ├── auth/             login · register
│   │   │   ├── dashboard/        dashboard.component.ts
│   │   │   ├── monitor/          monitor.component.ts + noise-monitor.service.ts
│   │   │   ├── hearing-test/     hearing-test.component.ts + habit-form + service
│   │   │   ├── results/          results.component.ts
│   │   │   ├── history/          history.component.ts
│   │   │   ├── records/          all-records.component.ts
│   │   │   ├── profile/          profile.component.ts
│   │   │   ├── devices/          devices.component.ts
│   │   │   ├── recommendations/  recommendations.component.ts
│   │   │   ├── shell/            app-shell.component.ts
│   │   │   └── splash/           splash.component.ts
│   │   └── shared/components/   gauge · risk-badge
│   └── 107 specs (Vitest vía ng test)
├── flutter_app/                  App móvil Flutter 3 (42 tests)
│   ├── lib/
│   │   ├── core/                 models, services, config, providers
│   │   └── screens/              Splash · Login · Register · MainShell
│   │                              Dashboard · Monitor · HearingTest · Results
│   │                              History · Profile
│   └── test/                     user · api_response · hearing_mapper · auth_service
├── e2e/                          Playwright — 36 tests (smoke + auth + hearing-test)
├── arduino/                      Firmware IoT
│   ├── hearguard_esp32/          ESP32 con WiFi + HTTP (KY-037)
│   ├── hearguard_sensor/         Arduino Uno (modo serial)
│   ├── wokwi/                    Simulación ESP32 (diagram.json, sketch.ino)
│   └── serial_bridge.js          Puente serie → backend Node.js
├── docs/
│   ├── metodologia.md · articulo.md · plan-de-pruebas.md · matriz-trazabilidad.md
│   ├── Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md
│   ├── PROMPT_MAESTRO_Ejecucion_Controlada_Runbook_HearGuard_AI_v1.0.md
│   ├── matriz-registro-hearguard.xlsx
│   ├── features/                 6 .feature Gherkin (85 escenarios)
│   └── runbook/informes-cumplimiento/
├── Document/                     Roadmap técnico por fases
├── scripts/
│   ├── generar-matriz-registro.py    Excel matriz Intents/Bolts (curso UC)
│   ├── fix-sonar-coverage-paths.js   prefijos lcov para SonarCloud
│   └── claude-*.ps1 · list-claude-sessions.ps1
├── docker/                       Dockerfiles + nginx config
├── .github/workflows/            ci.yml + deploy.yml
└── docker-compose.yml            Stack completo local
```

---

## Scripts útiles

| Script | Uso |
|--------|-----|
| `python scripts/generar-matriz-registro.py` | Genera `docs/matriz-registro-hearguard.xlsx` |
| `node scripts/fix-sonar-coverage-paths.js` | Corrige rutas `SF:` en lcov antes del scan SonarCloud |
| `npm run docker:up` / `docker:down` | Stack completo local (ver `package.json` raíz) |
| `k6 run tests/k6/load-test.js` | Pruebas de rendimiento (smoke / load / spike) |

---

## Licencia

MIT — Universidad Continental · Ingeniería de Sistemas · Luis Francisco Terreros Hinojosa · Hardy Eduardo Rondinel Aquino

