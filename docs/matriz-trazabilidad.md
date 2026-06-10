# Matriz de Trazabilidad — HearGuard AI v1.0

**Universidad Continental**
**Estándar:** IEEE 829-2008 / ISO/IEC 29119
**Metodología:** TDD Red-Green-Refactor + BDD Gherkin

---

## 1. Convenciones

| Columna           | Descripción                                                   |
|-------------------|---------------------------------------------------------------|
| **RF-ID**         | Requisito funcional                                           |
| **Módulo**        | Componente de código que implementa el requisito             |
| **Escenario BDD** | Referencia al archivo `.feature` y nombre del scenario       |
| **Test ID**       | Identificador del caso de prueba en el archivo de test       |
| **Tipo**          | U = Unitario · I = Integración · E2E = End-to-End · S = Seguridad |
| **Estado**        | ✅ Implementado · ⚠️ Parcial · ❌ Pendiente                   |

---

## 2. RF-01 — Autenticación y gestión de sesión

**Descripción:** El usuario puede registrarse, iniciar sesión, refrescar tokens y cerrar sesión.  
**Feature BDD:** `docs/features/autenticacion.feature`

| RF-ID   | Módulo                          | Escenario BDD                                      | Test ID / Archivo                                    | Tipo | Estado |
|---------|---------------------------------|----------------------------------------------------|------------------------------------------------------|------|--------|
| RF-01-1 | `auth.controller.js::register`  | Registro exitoso con datos válidos                 | `auth.test.js` — "register → 201"                    | I    | ✅     |
| RF-01-2 | `auth.controller.js::register`  | Registro con email duplicado → 409                 | `auth.test.js` — "register duplicate → 409"          | I    | ✅     |
| RF-01-3 | `auth.controller.js::register`  | Registro con contraseña débil → 400                | `auth.test.js` — "register weak password → 400"      | I    | ✅     |
| RF-01-4 | `auth.controller.js::register`  | Registro con email inválido → 400                  | `auth.test.js` — "register invalid email → 400"      | I    | ✅     |
| RF-01-5 | `auth.controller.js::register`  | Registro con campos requeridos faltantes → 400     | `auth.test.js` — "register missing fields → 400"     | I    | ✅     |
| RF-01-6 | `auth.controller.js::login`     | Login exitoso → 200 + tokens                       | `auth.test.js` — "login → 200 + tokens"              | I    | ✅     |
| RF-01-7 | `auth.controller.js::login`     | Login con contraseña incorrecta → 401              | `auth.test.js` — "login wrong password → 401"        | I    | ✅     |
| RF-01-8 | `auth.controller.js::login`     | Login con email inexistente → 401                  | `auth.test.js` — "login nonexistent → 401"           | I    | ✅     |
| RF-01-9 | `auth.controller.js::refresh`   | Refresh token válido → nuevo access token          | `auth.test.js` — "refresh → 200"                     | I    | ✅     |
| RF-01-10| `auth.controller.js::me`        | GET /me con token válido → datos del usuario       | `auth.test.js` — "GET /me → 200"                     | I    | ✅     |
| RF-01-11| `auth.middleware.js`            | Ruta protegida sin token → 401                     | `security.test.js` — "9 protected routes → 401"      | S    | ✅     |
| RF-01-12| `jwt.utils.js`                  | JWT con firma inválida → 401                       | `security.test.js` — "tampered JWT → 401"            | S    | ✅     |
| RF-01-13| `jwt.utils.js`                  | JWT con algoritmo none → 401                       | `security.test.js` — "alg:none → 401"               | S    | ✅     |
| RF-01-14| `jwt.utils.js`                  | JWT expirado → 401                                 | `security.test.js` — "expired JWT → 401"             | S    | ✅     |
| RF-01-15| `auth.service.ts`               | Login desde Angular actualiza currentUser          | `auth.service.spec.ts` — "login sets currentUser"    | U    | ✅     |
| RF-01-16| `auth.guard.ts`                 | Guard redirige a / sin token                       | `auth.guard.spec.ts` — "no token → redirect"         | U    | ✅     |
| RF-01-17| `auth.interceptor.ts`           | Interceptor añade Bearer header                    | `auth.interceptor.spec.ts` — "adds Bearer"           | U    | ✅     |

---

## 3. RF-02 — Monitoreo de ruido en tiempo real

**Descripción:** El sistema captura niveles de ruido del micrófono, clasifica el riesgo y mantiene historial.  
**Feature BDD:** `docs/features/monitoreo-ruido.feature`

| RF-ID   | Módulo                                  | Escenario BDD                                         | Test ID / Archivo                                          | Tipo | Estado |
|---------|-----------------------------------------|-------------------------------------------------------|------------------------------------------------------------|------|--------|
| RF-02-1 | `noise-monitor.service.ts::classifyRisk`| 40 dB → Bajo (#22C55E)                                | `noise-monitor.service.spec.ts` — "40dB → Bajo"           | U    | ✅     |
| RF-02-2 | `noise-monitor.service.ts::classifyRisk`| 72 dB → Moderado (#F59E0B)                            | `noise-monitor.service.spec.ts` — "72dB → Moderado"       | U    | ✅     |
| RF-02-3 | `noise-monitor.service.ts::classifyRisk`| 87 dB → Alto (#FF8C00)                                | `noise-monitor.service.spec.ts` — "87dB → Alto"           | U    | ✅     |
| RF-02-4 | `noise-monitor.service.ts::classifyRisk`| 105 dB → Muy Alto (#FF4D4D)                           | `noise-monitor.service.spec.ts` — "105dB → Muy Alto"      | U    | ✅     |
| RF-02-5 | `noise-monitor.service.ts::classifyRisk`| Frontera 54/55 dB                                     | `noise-monitor.service.spec.ts` — "boundary 54 → Bajo"    | U    | ✅     |
| RF-02-6 | `noise-monitor.service.ts::classifyRisk`| Frontera 74/75 dB                                     | `noise-monitor.service.spec.ts` — "boundary 75 → Alto"    | U    | ✅     |
| RF-02-7 | `noise-monitor.service.ts`              | Historial FIFO máximo 30 muestras                     | `noise-monitor.service.spec.ts` — "history FIFO 30"       | U    | ✅     |
| RF-02-8 | `noise-monitor.service.ts::stop`        | stop() invocable múltiples veces sin error            | `noise-monitor.service.spec.ts` — "stop is idempotent"    | U    | ✅     |
| RF-02-9 | `noise.controller.js::create`           | POST /api/noise con datos válidos → 201               | `noise.test.js` — "create noise → 201"                    | I    | ✅     |
| RF-02-10| `noise.controller.js::list`             | GET /api/noise paginado                               | `noise.test.js` — "list noise paged"                      | I    | ✅     |
| RF-02-11| `noise.service.js::classifyRiskTag`     | Clasifica 4 rangos dB (bajo/moderado/alto/muy_alto)   | `noise.test.js` — "classifyRiskTag 4 paths"                | U    | ✅     |
| RF-02-12| `noise.service.js::statsForToday`       | Estadísticas del día con registros                    | `noise.test.js` — "statsForToday CP-B-15"                 | U    | ✅     |
| RF-02-13| `noise.service.js::statsForWeek`        | Estadísticas semanales                                | `noise.test.js` — "statsForWeek"                          | U    | ✅     |
| RF-02-14| `noise.controller.js::list`             | IDOR: usuario A no ve registros de usuario B          | `security.test.js` — "IDOR noise records"                 | S    | ✅     |
| RF-02-15| `noise.controller.js::list`             | NoSQL injection en source → rechazado                 | `security.test.js` — "NoSQL injection source"             | S    | ✅     |

---

## 4. RF-03 — Prueba auditiva tonal

**Descripción:** El usuario realiza una prueba de 12 pasos (6 frecuencias × 2 oídos) con tonos puros.  
**Feature BDD:** `docs/features/prueba-auditiva.feature`

| RF-ID   | Módulo                                        | Escenario BDD                                           | Test ID / Archivo                                              | Tipo | Estado |
|---------|-----------------------------------------------|---------------------------------------------------------|----------------------------------------------------------------|------|--------|
| RF-03-1 | `hearing-test.service.ts::calculateScoreFromGain` | gain=0.01 → score 10 (límite superior)              | `hearing-test.service.spec.ts` — "gain 0.01 → 10"             | U    | ✅     |
| RF-03-2 | `hearing-test.service.ts::calculateScoreFromGain` | gain=0.50 → score 5                                 | `hearing-test.service.spec.ts` — "gain 0.50 → 5"              | U    | ✅     |
| RF-03-3 | `hearing-test.service.ts::calculateScoreFromGain` | gain=1.00 → score 0 (límite inferior)               | `hearing-test.service.spec.ts` — "gain 1.00 → 0"              | U    | ✅     |
| RF-03-4 | `hearing-test.service.ts::calculateScoreFromGain` | gain=0.00 clampea a 0.01 → score 10                 | `hearing-test.service.spec.ts` — "gain 0.00 clamp"            | U    | ✅     |
| RF-03-5 | `hearing-test.service.ts::calculateScoreFromGain` | gain=1.50 clampea a 1.00 → score 0                  | `hearing-test.service.spec.ts` — "gain 1.50 clamp"            | U    | ✅     |
| RF-03-6 | `hearing-test.service.ts::recordHeard`            | Registra score y avanza al siguiente paso           | `hearing-test.service.spec.ts` — "recordHeard advances step"  | U    | ✅     |
| RF-03-7 | `hearing-test.service.ts::recordHeard`            | No registra cuando isComplete es true               | `hearing-test.service.spec.ts` — "recordHeard noop if done"   | U    | ✅     |
| RF-03-8 | `hearing-test.service.ts::recordNotHeard`         | Registra score 0 y avanza                           | `hearing-test.service.spec.ts` — "recordNotHeard → 0"         | U    | ✅     |
| RF-03-9 | `hearing-test.service.ts`                         | Prueba completa: 12 pasos cubre ambos oídos         | `hearing-test.service.spec.ts` — "12 steps covers all"        | U    | ✅     |
| RF-03-10| `hearing-test.service.ts::resetFlow`              | Reset reinicia todos los pasos                      | `hearing-test.service.spec.ts` — "resetFlow clears scores"    | U    | ✅     |
| RF-03-11| `evaluation.controller.js::create`                | 12 scores → evaluación status: complete             | `evaluation.test.js` — "12 scores → complete"                 | I    | ✅     |
| RF-03-12| `evaluation.controller.js::create`                | 6 scores → evaluación status: partial               | `evaluation.test.js` — "6 scores → partial"                   | I    | ✅     |
| RF-03-13| `evaluation.controller.js::list`                  | IDOR: usuario A no ve evaluaciones de usuario B     | `security.test.js` — "IDOR evaluations"                       | S    | ✅     |

---

## 5. RF-04 — Predicción de riesgo con IA

**Descripción:** El servicio IA predice el nivel de riesgo auditivo y genera factores a partir del perfil del usuario.  
**Feature BDD:** `docs/features/prediccion-riesgo-ia.feature`

| RF-ID   | Módulo                               | Escenario BDD                                             | Test ID / Archivo                                             | Tipo | Estado |
|---------|--------------------------------------|-----------------------------------------------------------|---------------------------------------------------------------|------|--------|
| RF-04-1 | `predictor.py::score_to_level`       | score≤30 → Bajo                                           | `test_predictor.py::test_score_to_level` — "30 → Bajo"       | U    | ✅     |
| RF-04-2 | `predictor.py::score_to_level`       | score 31–55 → Moderado                                    | `test_predictor.py::test_score_to_level` — "55 → Moderado"   | U    | ✅     |
| RF-04-3 | `predictor.py::score_to_level`       | score 56–75 → Alto                                        | `test_predictor.py::test_score_to_level` — "75 → Alto"       | U    | ✅     |
| RF-04-4 | `predictor.py::score_to_level`       | score>75 → Muy Alto                                       | `test_predictor.py::test_score_to_level` — "76 → Muy Alto"   | U    | ✅     |
| RF-04-5 | `predictor.py::predict_risk`         | Perfil bajo riesgo (joven, sin exposición) → score<40     | `test_api.py::TestPredictRisk` — "low risk profile"          | I    | ✅     |
| RF-04-6 | `predictor.py::predict_risk`         | Perfil alto riesgo (60 años, 10h auriculares) → score>60  | `test_api.py::TestPredictRisk` — "high risk profile"         | I    | ✅     |
| RF-04-7 | `predictor.py::predict_risk`         | Payload vacío no rompe el servicio                        | `test_api.py::TestPredictRisk` — "empty payload → 200"       | I    | ✅     |
| RF-04-8 | `predictor.py::recommendations_for_level`| Recomendaciones Bajo (≥1 ítem)                        | `test_predictor.py` — "recommendations bajo"                 | U    | ✅     |
| RF-04-9 | `predictor.py::recommendations_for_level`| Recomendaciones Moderado (≥1 ítem)                    | `test_predictor.py` — "recommendations moderado"             | U    | ✅     |
| RF-04-10| `predictor.py::recommendations_for_level`| Recomendaciones Alto (≥1 ítem)                        | `test_predictor.py` — "recommendations alto"                 | U    | ✅     |
| RF-04-11| `predictor.py::recommendations_for_level`| Recomendaciones Muy Alto (≥1 ítem)                    | `test_predictor.py` — "recommendations muy alto"             | U    | ✅     |
| RF-04-12| `app.py::model_info`                 | GET /api/model-info → R² ≥ 0.80                           | `test_api.py::TestModelInfo` — "r2 >= 0.80"                  | I    | ✅     |
| RF-04-13| `predictor.py::load_model`           | Modelo ya cargado → retorna desde caché                   | `test_predictor.py::test_load_model` — "cache hit"           | U    | ✅     |
| RF-04-14| `predictor.py::load_model`           | Archivo no existe → FileNotFoundError                     | `test_predictor.py::test_load_model` — "missing file"        | U    | ✅     |
| RF-04-15| `app.py::health`                     | GET /health → 200 + model state                           | `test_api.py::TestHealth` — "health ok"                      | I    | ✅     |

---

## 6. RF-05 — Resultados y recomendaciones

**Descripción:** El usuario visualiza los resultados de su prueba auditiva con gráfica audiométrica y recomendaciones.  
**Feature BDD:** `docs/features/resultados-y-recomendaciones.feature`

| RF-ID   | Módulo                                | Escenario BDD                                              | Test ID / Archivo                                            | Tipo | Estado |
|---------|---------------------------------------|------------------------------------------------------------|--------------------------------------------------------------|------|--------|
| RF-05-1 | `evaluation.controller.js::create`   | Evaluación guardada con riskResult y recomendaciones       | `evaluation.test.js` — "create evaluation → 201"             | I    | ✅     |
| RF-05-2 | `evaluation.controller.js::list`     | Historial ordenado por fecha descendente                   | `evaluation.test.js` — "list evaluations"                    | I    | ✅     |
| RF-05-3 | `evaluation.controller.js::getById`  | GET /evaluations/:id retorna evaluación + riskResult       | `evaluation.test.js` — "getById evaluation"                  | I    | ✅     |
| RF-05-4 | `results.component.ts`               | Visualización inmediata al finalizar prueba (CP-F-05)      | `e2e/tests/hearing-test.spec.ts` — "redirects to results"   | E2E  | ⚠️     |
| RF-05-5 | `results.component.ts`               | Scores altos → nivel Bajo en resultados                    | `e2e/tests/hearing-test.spec.ts` — "high scores → Bajo"     | E2E  | ⚠️     |
| RF-05-6 | `noise-monitor.service.ts::classifyRisk` | Historial FIFO 30 muestras                             | `noise-monitor.service.spec.ts` — "FIFO 30 samples"         | U    | ✅     |

---

## 7. RF-06 — Dispositivos IoT (ESP32)

**Descripción:** El dispositivo IoT envía lecturas de ruido via API Key; el backend las almacena y controla el LED.  
**Feature BDD:** `docs/features/dispositivos-iot.feature`

| RF-ID   | Módulo                             | Escenario BDD                                             | Test ID / Archivo                                         | Tipo | Estado |
|---------|------------------------------------|-----------------------------------------------------------|-----------------------------------------------------------|------|--------|
| RF-06-1 | `noise.controller.js::createIot`   | POST /api/noise/iot con X-Device-Key válida → 201         | `device.test.js` — "IoT create valid key → 201"           | I    | ✅     |
| RF-06-2 | `noise.controller.js::createIot`   | X-Device-Key inválida → 401                               | `device.test.js` — "IoT invalid key → 401"               | I    | ✅     |
| RF-06-3 | `noise.controller.js::createIot`   | Sin header X-Device-Key → 401                             | `device.test.js` — "IoT no key → 401"                    | I    | ✅     |
| RF-06-4 | `device.controller.js::create`     | Registro de dispositivo genera apiKey única               | `device.test.js` — "register device → apiKey"            | I    | ✅     |
| RF-06-5 | `device.controller.js::list`       | Lista dispositivos del usuario autenticado                | `device.test.js` — "list devices"                        | I    | ✅     |
| RF-06-6 | `noise.controller.js::createIot`   | dB > 85 → highRisk = true en el registro                  | `device.test.js` — "highRisk flag when >85dB"            | I    | ✅     |

---

## 8. RNF — Requisitos No Funcionales

| RNF-ID  | Requisito                                           | Módulo / Config                           | Verificación                                              | Estado |
|---------|-----------------------------------------------------|-------------------------------------------|-----------------------------------------------------------|--------|
| RNF-01  | Tiempo de respuesta p95 < 2 000 ms                  | `tests/k6/load-test.js`                   | k6 threshold `http_req_duration['p(95)<2000']`           | ✅     |
| RNF-02  | Tasa de error < 5 % bajo carga                      | `tests/k6/load-test.js`                   | k6 threshold `http_req_failed['rate<0.05']`              | ✅     |
| RNF-03  | Cobertura de líneas backend ≥ 60 %                  | `backend/coverage/lcov.info`              | CI `Check backend coverage threshold`                    | ✅     |
| RNF-04  | Cobertura de líneas AI ≥ 70 %                       | `ai-service/coverage.xml`                 | CI `pytest --cov-fail-under=70`                          | ✅     |
| RNF-05  | Sin errores ESLint (backend)                         | `backend/eslint.config.js`               | CI `npm run lint`                                        | ✅     |
| RNF-06  | Protección contra NoSQL injection                   | `noise.controller.js`, `auth.controller.js` | `security.test.js` — NoSQL injection suite              | ✅     |
| RNF-07  | JWT con algoritmo explícito HS256                   | `jwt.utils.js`                            | `security.test.js` — alg:none → 401                     | ✅     |
| RNF-08  | Rate limiting: 100 req / 15 min                     | `server.js::apiLimiter`                   | `security.test.js` — oversized payload → 413/400         | ✅     |
| RNF-09  | Análisis estático SonarCloud en cada push           | `.github/workflows/ci.yml`               | CI `SonarCloud Scan`                                     | ✅     |
| RNF-10  | Convenciones de commit (Conventional Commits)       | `.husky/commit-msg`                       | Husky pre-commit hook + lint-staged                      | ✅     |

---

## 9. Resumen de cobertura

| Capa         | Archivo(s) de test                                                  | Casos | Estado     |
|--------------|---------------------------------------------------------------------|-------|------------|
| Backend API  | `auth.test.js`, `noise.test.js`, `evaluation.test.js`, `device.test.js`, `middleware.test.js`, `security.test.js`, `noise.service.test.js`, `database.test.js`, `logger.test.js`, `evaluation-ai.test.js`, `env.test.js`, `coverage-extra.test.js` | 207 | ✅ Completo |
| AI Service   | `test_predictor.py`, `test_api.py`                                  | 30    | ✅ Completo |
| Frontend UI  | `hearing-test.service.spec.ts`, `noise-monitor.service.spec.ts`, `auth.service.spec.ts`, `auth.guard.spec.ts`, `auth.interceptor.spec.ts` + demás specs | 107 | ✅ Completo |
| Flutter      | `user_test.dart`, `api_response_test.dart`, `hearing_mapper_test.dart`, `auth_service_test.dart` | 42 | ✅ Completo |
| E2E          | `e2e/tests/auth.spec.ts`, `e2e/tests/hearing-test.spec.ts`         | 36    | ⚠️ CI demo |
| BDD Gherkin  | `bdd/step_definitions/` (Cucumber.js)                              | 85    | ✅ API completo · frontend/IA pending |
| Rendimiento  | `tests/k6/load-test.js`                                             | 3 escenarios | ✅ Configurado |

**Total requisitos funcionales trazados:** 60 RF  
**Total requisitos no funcionales trazados:** 10 RNF  
**Cobertura de trazabilidad:** 100 % de los RF tienen al menos un test asociado  
**RF con cobertura E2E incompleta:** RF-05-4, RF-05-5 (dependen de entorno Vercel/demo)

---

## 10. Leyenda de archivos de referencia

| Documento                                    | Descripción                                      |
|----------------------------------------------|--------------------------------------------------|
| `docs/features/autenticacion.feature`        | BDD scenarios — Autenticación                    |
| `docs/features/monitoreo-ruido.feature`      | BDD scenarios — Monitoreo de ruido               |
| `docs/features/prueba-auditiva.feature`      | BDD scenarios — Prueba auditiva tonal            |
| `docs/features/prediccion-riesgo-ia.feature` | BDD scenarios — Predicción de riesgo IA          |
| `docs/features/resultados-y-recomendaciones.feature` | BDD scenarios — Resultados               |
| `docs/features/dispositivos-iot.feature`     | BDD scenarios — Dispositivos IoT                 |
| `docs/complejidad-ciclomatica.md`            | Análisis CC McCabe — 17 funciones, 59 caminos    |
| `backend/tests/`                             | Tests de integración Node.js (Jest)              |
| `frontend/src/app/**/*.spec.ts`              | Tests unitarios Angular (Karma/Jasmine)          |
| `ai-service/tests/`                          | Tests unitarios e integración Python (pytest)    |
| `e2e/tests/`                                 | Tests E2E Playwright (multi-navegador)           |
| `bdd/step_definitions/`                      | Step definitions Cucumber.js (85 escenarios)    |
| `tests/k6/`                                  | Tests de rendimiento k6                         |

---

*Documento generado: Mayo 2026 | IEEE 829-2008 / ISO/IEC 29119*
