# INFORME FINAL
## HearGuard AI v1.0
### Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva

---

**Institución:** Universidad Continental
**Escuela:** Ingeniería de Sistemas e Informática
**Autores:**
- Terreros Hinojosa, Luis Francisco — DNI 76926326
- Rondinel Aquino, Hardy Eduardo — DNI 71798927

**Asesor:** Maglioni Arana Caparachín
**Repositorio:** https://github.com/hatWHITE-UwU/hearguard-ai
**Despliegue:** https://frontend-tau-tan-95.vercel.app
**Período:** 2026-I
**Fecha:** Junio 2026

---

## TABLA DE CONTENIDO

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado del Arte](#2-estado-del-arte)
3. [Descripción de la Herramienta IA](#3-descripción-de-la-herramienta-ia)
4. [Plan de Pruebas](#4-plan-de-pruebas)
5. [Diseño — Mockups](#5-diseño--mockups)
6. [Código](#6-código)
7. [Mantenimiento](#7-mantenimiento)
8. [Despliegue de la Primera Versión](#8-despliegue-de-la-primera-versión)
9. [Enfoque ISO 9001](#9-enfoque-iso-9001)
10. [Enfoque ISO 25000](#10-enfoque-iso-25000)
11. [Enfoque ISO 29119](#11-enfoque-iso-29119)
12. [Enfoque ISO 27000](#12-enfoque-iso-27000)
13. [Conclusiones](#13-conclusiones)
14. [Referencias Bibliográficas](#14-referencias-bibliográficas)

---

## 1. RESUMEN EJECUTIVO

HearGuard AI v1.0 es una plataforma de salud auditiva preventiva que integra monitoreo de ruido en tiempo real, evaluación auditiva por cuestionario digital y predicción del riesgo de pérdida auditiva mediante inteligencia artificial (Random Forest), desplegada en producción sobre una arquitectura de microservicios multiplataforma (Angular 21 + Flutter 3 + Node.js 20 + Python 3.11 + MongoDB Atlas + ESP32).

El sistema fue desarrollado aplicando **TDD + BDD** como metodología principal y **CRISP-DM** como metodología complementaria para el modelo predictivo, generando 530 casos de prueba automatizados en seis capas, un pipeline de integración continua de 10 jobs en GitHub Actions y análisis estático con SonarCloud (Quality Gate aprobado, Rating A en Seguridad, Fiabilidad y Mantenibilidad, cobertura 100 %, 0 issues).

La documentación del proyecto cubre los enfoques ISO 9001 (gestión de calidad), ISO 25000/25010 (calidad del producto), ISO 29119 (pruebas de software) e ISO 27001 (seguridad de la información), proporcionando una base técnica completa para la presentación del examen final.

---

## 2. ESTADO DEL ARTE

### 2.1 Problemática

La Organización Mundial de la Salud estima que más de 1 000 millones de personas entre 12 y 35 años están en riesgo de pérdida auditiva por exposición a niveles sonoros elevados. La PAIR (Pérdida Auditiva Inducida por Ruido) es irreversible pero totalmente prevenible. En el Perú, el acceso a herramientas digitales de evaluación auditiva preventiva es prácticamente inexistente fuera del entorno clínico.

### 2.2 Soluciones Existentes y sus Limitaciones

| Solución | Funcionalidad | Limitación principal |
|---|---|---|
| Decibel X / NIOSH SLM | Medición de dB en tiempo real | Sin evaluación auditiva ni predicción de riesgo |
| Mimi Hearing Test | Prueba auditiva gamificada | Sin monitoreo de ruido ni IA |
| Sound Meter Pro | Historial básico de dB | Sin continuidad de riesgo individual |
| Plataformas industriales (3M E-A-Rfit) | Alta precisión clínica | Costo > USD 2 000, inaccesible para usuarios individuales |

**Brecha identificada:** ninguna solución existente integra monitoreo IoT + evaluación auditiva + predicción ML en una única plataforma accesible.

### 2.3 Fundamentos Científicos

- **Random Forest (Breiman, 2001):** Bing et al. (2018) reportan > 90 % de precisión en predicción de riesgo auditivo con variables similares a las de HearGuard AI.
- **CRISP-DM (Shearer, 2000):** Schröer et al. (2021) confirman que es el proceso más usado en proyectos de ciencia de datos en producción (43 % de adopción).
- **TDD (Beck, 2003):** Bissi et al. (2016) reportan reducción de defectos del 40–80 % respecto al desarrollo tradicional.
- **IoT en salud (Islam et al., 2020):** el patrón microcontrolador + API REST + dashboard es el más adoptado (61 % de los casos).

**Documento completo:** `docs/estado-del-arte-hearguard-ai.md`

---

## 3. DESCRIPCIÓN DE LA HERRAMIENTA IA

### 3.1 ¿Qué es HearGuard AI?

HearGuard AI es una plataforma HealthTech que transforma la exposición sonora cotidiana del usuario en un perfil de riesgo auditivo personalizado, expresado en cuatro niveles (Bajo, Moderado, Alto, Muy Alto) con recomendaciones preventivas adaptativas.

### 3.2 Arquitectura General

```
┌─────────────┐   ┌─────────────┐   ┌──────────────────┐
│  Angular 21 │   │  Flutter 3  │   │  ESP32 + KY-037  │
│  (Vercel)   │   │  (APK/IPA)  │   │  (IoT sensor)    │
└──────┬──────┘   └──────┬──────┘   └────────┬─────────┘
       │                 │                    │
       └─────────────────┼────────────────────┘
                         │ HTTPS / REST API
                         ▼
              ┌──────────────────────┐
              │  Node.js 20/Express 5│
              │  API Gateway + Logic │
              │  (Render)            │
              └──────────┬───────────┘
                    ┌────┴────┐
                    │         │
          ┌─────────▼──┐  ┌───▼──────────────┐
          │ MongoDB    │  │ Python 3.11/Flask │
          │ Atlas M0   │  │ Random Forest     │
          │ (AWS SP)   │  │ (Render)          │
          └────────────┘  └──────────────────┘
```

### 3.3 Módulos Funcionales

| Módulo | RF | Descripción |
|---|---|---|
| Autenticación | RF-01 | JWT HS256 + bcrypt + refresh SHA-256 + rotación |
| Monitoreo de ruido | RF-02 | Captura dB en tiempo real (web/móvil/IoT), clasificación 4 niveles |
| Evaluación auditiva | RF-03 | Cuestionario 12 pasos (6 frecuencias × 2 oídos) |
| Predicción IA | RF-04 | Random Forest → riskScore 0–100 + nivel + factores + recomendaciones |
| Resultados | RF-05 | Dashboard, historial cronológico, evolución del riesgo |
| Dispositivos IoT | RF-06 | Registro ESP32, autenticación `X-Device-Key`, lecturas automáticas |

### 3.4 Modelo de IA — Random Forest

| Parámetro | Valor |
|---|---|
| Algoritmo | RandomForestRegressor (scikit-learn) |
| n_estimators | 120 |
| max_depth | 12 |
| Semilla de reproducibilidad | SEED = 42 |
| Dataset de entrenamiento | 5 000 muestras sintéticas (heurísticas médicas) |
| Variables predictoras | 8 (edad, horas auriculares, volumen, exposición laboral, ocupación, tabaquismo, puntaje auditivo promedio, puntaje frecuencias bajas) |
| Métrica mínima exigida | R² holdout ≥ 0.80 |
| Metodología | CRISP-DM (6 fases) |

---

## 4. PLAN DE PRUEBAS

**Documento completo:** `docs/plan-de-pruebas.md` (IEEE 829-2008 / ISO/IEC/IEEE 29119-3:2021)

### 4.1 Suite de Pruebas Automatizadas

| Capa | Framework | Casos | Comando |
|---|---|:---:|---|
| Backend API + Seguridad | Jest + Supertest | **230** | `cd backend && npm test -- --runInBand` |
| Servicio IA Flask | pytest | **30** | `cd ai-service && pytest tests/ -v` |
| Frontend Angular | Vitest | **107** | `cd frontend && npm run test:ci` |
| App Móvil Flutter | flutter_test | **42** | `cd flutter_app && flutter test` |
| E2E multiplataforma | Playwright | **36** | `cd e2e && npx playwright test` |
| BDD Gherkin | Cucumber.js | **85** | `cd bdd && npm test` |
| **TOTAL** | | **530** | |
| Rendimiento | k6 | 3 escenarios | `k6 run tests/k6/load-test.js` |

### 4.2 Tipos de Prueba Aplicados

| Tipo | Técnica | Herramienta | Cobertura |
|---|---|---|---|
| Pruebas unitarias | Caja blanca — lógica interna | Jest, pytest, Vitest | Funciones, servicios, guards |
| Pruebas de integración | Caja negra — entrada/salida HTTP | Jest + Supertest | Todos los endpoints REST |
| Pruebas de aceptación | BDD — escenarios Gherkin | Cucumber.js | 6 módulos funcionales |
| Pruebas E2E | Flujo completo en browser | Playwright + Chromium | Registro, login, prueba auditiva |
| Pruebas de seguridad | Caja negra — vectores OWASP | Jest + Supertest | JWT, IDOR, NoSQL injection |
| Pruebas de rendimiento | Carga y estrés | k6 | API endpoints en producción |
| Pruebas de accesibilidad | Análisis automático | Lighthouse CI | Frontend Angular en Vercel |

### 4.3 Umbrales de Calidad (CI)

| Métrica | Umbral | Verificación |
|---|---|---|
| Cobertura backend | 100 % líneas | Jest lcov + script Node |
| Cobertura IA | ≥ 60 % | pytest --cov-fail-under=60 |
| Latencia API p95 | < 2 000 ms | k6 threshold |
| Tasa de error | < 5 % | k6 threshold |
| Accessibility | ≥ 90 % | Lighthouse CI |
| Performance | ≥ 80 % | Lighthouse CI |

### 4.4 Escenarios BDD — Archivos Feature

| Archivo | Escenarios | Módulo |
|---|:---:|---|
| `autenticacion.feature` | 18 | Registro, login, refresh, logout, perfil |
| `monitoreo-ruido.feature` | 15 | Captura dB, clasificación, historial, estadísticas |
| `prueba-auditiva.feature` | 14 | Cuestionario 12 pasos, scoring, evaluación |
| `prediccion-riesgo-ia.feature` | 16 | Invocación Flask, respuesta, niveles |
| `dispositivos-iot.feature` | 12 | Registro ESP32, autenticación, lecturas |
| `resultados-y-recomendaciones.feature` | 10 | Historial, dashboard, recomendaciones |
| **Total** | **85** | |

---

## 5. DISEÑO — MOCKUPS

**Documento completo:** `docs/diseno-mockups-hearguard-ai.md`

### 5.1 Sistema de Diseño

| Token | Color | Uso |
|---|---|---|
| Primary | `#1F4E79` | Navbar, botones principales, encabezados |
| Risk Low | `#22C55E` | Nivel Bajo |
| Risk Moderate | `#F59E0B` | Nivel Moderado |
| Risk High | `#FF8C00` | Nivel Alto |
| Risk Very High | `#EF4444` | Nivel Muy Alto |

### 5.2 Pantallas Principales

**Dashboard:**
```
┌────────┬──────────────────────────────────────────┐
│  MENÚ  │  Dashboard de Salud Auditiva             │
│        │                                          │
│ 📊 Dashboard│  ┌────────────┐  ┌────────────────┐│
│ 🎙️ Monitor│  │  RIESGO    │  │ EXPOSICIÓN SEM.││
│ 👂 Prueba│  │  ╭──42──╮   │  │  █ █ █ █      ││
│ 📋 Histor│  │  │MODER.│   │  │  62 dB prom.  ││
│ 📡 IoT  │  └────────────┘  └────────────────┘│
│ 👤 Perfil│  ┌────────────────────────────────┐  │
│        │  │ RECOMENDACIONES ACTIVAS        │  │
│        │  │ • Reduce volumen al 60 %       │  │
│        │  └────────────────────────────────┘  │
└────────┴──────────────────────────────────────────┘
```

**Monitor de Ruido:**
```
┌────────┬──────────────────────────────────────────┐
│  MENÚ  │  Monitor de Ruido                        │
│        │         ╭──────────╮                     │
│        │        /   68 dB    \                    │
│        │       │  🟡MODERADO │                    │
│        │        \            /                    │
│        │         ╰──────────╯                     │
│        │   [ ⏹ DETENER ] [ 💾 GUARDAR ]          │
└────────┴──────────────────────────────────────────┘
```

**Resultado de Evaluación:**
```
┌────────┬──────────────────────────────────────────┐
│  MENÚ  │  Resultado de tu Evaluación              │
│        │    ╭─────────────╮                       │
│        │   │  🔴 ALTO    │  Score: 68/100        │
│        │    ╰─────────────╯                       │
│        │  ⚠️ Alto uso de auriculares (8h/día)    │
│        │  ⚠️ Volumen elevado (85%)               │
│        │  ✓ Usa protección auditiva              │
│        │  ✓ Consulta a un audiólogo              │
└────────┴──────────────────────────────────────────┘
```

**Pantallas implementadas:** Splash, Login, Registro, Dashboard, Monitor de Ruido, Prueba Auditiva (12 pasos), Resultados, Historial, Dispositivos IoT, Perfil — en Angular 21 (web) y Flutter 3 (móvil).

---

## 6. CÓDIGO

### 6.1 Matriz de Doble Entrada — Módulos × ISO 25010

| Módulo / Componente | Adec. Func. | Efic. Rend. | Compat. | Usab. | Fiab. | Segur. | Mant. | Portab. |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| RF-01 Autenticación | ● | ○ | ○ | ○ | ● | ● | ● | ○ |
| RF-02 Monitoreo ruido | ● | ● | ● | ● | ○ | ○ | ● | ○ |
| RF-03 Evaluación auditiva | ● | ○ | ○ | ● | ○ | ○ | ● | ○ |
| RF-04 Predicción IA | ● | ● | ○ | ○ | ● | ○ | ● | ○ |
| RF-05 Resultados | ● | ○ | ○ | ● | ○ | ● | ● | ○ |
| RF-06 Dispositivos IoT | ● | ● | ● | ○ | ● | ● | ● | ● |
| Angular 21 Frontend | ○ | ● | ● | ● | ○ | ○ | ● | ● |
| Flutter 3 App | ○ | ● | ● | ● | ○ | ○ | ● | ● |
| Node.js Backend | ○ | ● | ● | ○ | ● | ● | ● | ● |
| Flask + Random Forest | ○ | ● | ● | ○ | ● | ○ | ● | ● |
| MongoDB Atlas | ○ | ● | ● | ○ | ● | ● | ● | ● |
| ESP32 + KY-037 | ○ | ● | ● | — | ● | ● | ● | ● |
| GitHub Actions CI/CD | ○ | ○ | ○ | — | ● | ○ | ● | ● |
| SonarCloud | ○ | ○ | — | — | ● | ● | ● | ○ |
| Suite 530 tests TDD/BDD | ● | ○ | ○ | ○ | ● | ● | ● | ○ |

**● Cobertura principal · ○ Cobertura secundaria · — No aplica**
**Archivo Excel:** `docs/matriz-registro-hearguard.xlsx` (hoja "ISO 25010 — Calidad")

### 6.2 Macro Procesos

```
PROCESO PRINCIPAL: CICLO DE GESTIÓN DE SALUD AUDITIVA

INICIO
  │
  ▼
[1] USUARIO se registra / inicia sesión
  │   RF-01 · POST /api/auth/register · POST /api/auth/login
  ▼
[2] MONITOREA el ruido ambiental
  │   RF-02 · Web Audio API / micrófono Flutter / ESP32 + KY-037
  │   POST /api/noise · POST /api/noise/iot
  ▼
[3] REALIZA la evaluación auditiva
  │   RF-03 · 12 pasos (6 Hz × 2 oídos) · POST /api/evaluations
  ▼
[4] SISTEMA invoca el modelo de IA
  │   RF-04 · ai.service.js → POST /api/predict-risk (Flask)
  │   Retry backoff (3 intentos) + Circuit breaker
  ▼
[5] PRESENTA resultados y recomendaciones
  │   RF-05 · riskScore + riskLevel + topFactors + recommendations
  ▼
[6] USUARIO consulta el dashboard e historial
  │   RF-05 · GET /api/evaluations · GET /api/noise/stats/week
  ▼
[7] CICLO se repite periódicamente
FIN
```

### 6.3 Procedimientos Principales — Backend Vinculado

> Documento completo con flujos paso a paso, líneas exactas y modelos de datos:
> **`docs/procedimientos-backend-hearguard-ai.md`**

#### PROC-AUTH-01 — Registro de Usuario
- **Ruta:** `POST /api/auth/register` → `backend/src/routes/auth.routes.js:13`
- **Controlador:** `auth.controller.js` → función `register()` línea **53**
- **Flujo resumido:** validar email único → bcrypt.hash(12) → User.create → JWT(15min) + refreshToken(SHA-256) → HTTP 201

#### PROC-AUTH-02 — Inicio de Sesión
- **Ruta:** `POST /api/auth/login` → `backend/src/routes/auth.routes.js:15`
- **Controlador:** `auth.controller.js` → función `login()` línea **123**
- **Flujo resumido:** bcrypt.compare (siempre ejecutado, anti-timing) → generar par tokens → guardar hash en BD → HTTP 200

#### PROC-AUTH-03 — Renovación de Token
- **Ruta:** `POST /api/auth/refresh` → `backend/src/routes/auth.routes.js:17`
- **Controlador:** `auth.controller.js` → función `refresh()` línea **188**
- **Flujo resumido:** safeEqualHex(SHA-256 presentado, hash almacenado) → rotar tokens → HTTP 200

#### PROC-NOISE-01 — Registrar Lectura de Ruido (web/móvil)
- **Ruta:** `POST /api/noise` → `backend/src/routes/noise.routes.js:18`
- **Controlador:** `noise.controller.js` → función `create()` línea **23**
- **Servicio:** `noise.service.js` → `classifyRiskTag(dbLevel)` línea **14**
- **Flujo resumido:** autenticar → validar dbLevel → classifyRiskTag → NoiseRecord.create → HTTP 201

#### PROC-NOISE-02 — Lectura IoT desde ESP32
- **Ruta:** `POST /api/noise/iot` → `backend/src/routes/noise.routes.js:14`
- **Controlador:** `noise.controller.js` → función `createIot()` línea **84**
- **Flujo resumido:** verificar X-Device-Key (SHA-256) → classifyRiskTag → NoiseRecord.create → Device.lastSeen → HTTP 201

#### PROC-NOISE-03 — Estadísticas del día / semana
- **Rutas:** `GET /api/noise/stats/today` (línea 24) · `GET /api/noise/stats/week` (línea 26)
- **Servicio:** `noise.service.js` → `statsForToday()` línea **45** · `statsForWeek()` línea **65**
- **Flujo resumido:** filtrar por userId + rango de fecha → computeStats(count/avg/max/min/byLevel) → HTTP 200

#### PROC-EVAL-01 — Crear Evaluación Auditiva + Predicción IA
- **Ruta:** `POST /api/evaluations` → `backend/src/routes/evaluation.routes.js:16`
- **Controlador:** `evaluation.controller.js` → función `create()` línea **115**
- **Flujo resumido:**
  1. `aggregateTestScoresByFrequency()` línea **25** → avgTestScore, lowFreqScore
  2. `buildAiPayload()` línea **50** → vector 8 features
  3. `applyAiPrediction()` línea **74**:
     - `ai.service.postPredictRisk()` línea **115** → retry + circuit breaker → Flask
     - `RiskResult.create()` → persiste riskScore, riskLevel, topFactors
  4. HTTP 201 → { evaluation, riskResult, recommendations }

#### PROC-AI-01 — Retry con Backoff Exponencial (Circuit Breaker)
- **Archivo:** `backend/src/services/ai.service.js`
- **Función:** `postJson()` línea **57**

```
Estado inicial: CLOSED
     │
     ├─ _cbIsOpen()? ──SÍ──► Fast-fail HTTP 503 (circuit OPEN)
     │
     └─ NO → Intento 1 → fallo → _sleep(500ms)
              Intento 2 → fallo → _sleep(1000ms)
              Intento 3 → fallo → _cbRecordFailure()
                                   └─ failures ≥ 5 → state = OPEN
              Tras 30s → HALF_OPEN → permite 1 intento
              Éxito → _cbRecordSuccess() → state = CLOSED
```

#### PROC-DEVICE-01 — Registro de Dispositivo IoT
- **Ruta:** `POST /api/devices` → `backend/src/routes/device.routes.js:11`
- **Controlador:** `device.controller.js` → función `create()` línea **15**
- **Flujo resumido:** crypto.randomBytes(64) → deviceKey → SHA-256 → Device.create (almacena hash) → HTTP 201 con deviceKey en texto plano SOLO esta vez

#### Funciones de Soporte Backend

| Función | Archivo | Línea | Descripción |
|---|---|:---:|---|
| `hashRefreshToken(token)` | `auth.controller.js` | 25 | SHA-256 del refresh token |
| `safeEqualHex(a, b)` | `auth.controller.js` | 34 | Comparación tiempo constante |
| `classifyRiskTag(dbLevel)` | `noise.service.js` | 14 | dB → bajo/moderado/alto/muy_alto |
| `computeStats(rows)` | `noise.service.js` | 25 | avg, max, min, count, byLevel |
| `aggregateTestScoresByFrequency()` | `evaluation.controller.js` | 25 | 12 puntajes → avgTestScore |
| `lowFreqAverage(freqAvgs)` | `evaluation.controller.js` | 42 | Media 250+500 Hz |
| `buildAiPayload(user, eval)` | `evaluation.controller.js` | 50 | Vector 8 features |
| `applyAiPrediction(user, eval)` | `evaluation.controller.js` | 74 | Orquesta IA + persiste RiskResult |
| `postJson(path, payload)` | `ai.service.js` | 57 | Retry backoff + circuit breaker |
| `_cbRecordSuccess()` | `ai.service.js` | 18 | Cierra el circuito, failures=0 |
| `_cbRecordFailure()` | `ai.service.js` | 23 | Incrementa fallos; abre si ≥5 |
| `_cbIsOpen()` | `ai.service.js` | 31 | Evalúa estado OPEN/HALF_OPEN |
| `authenticate` | `auth.middleware.js` | 9 | Valida JWT → adjunta req.user |
| `mapRiskLevelToEnum(level)` | `ai.service.js` | 131 | 'Alto'→'alto', 'Muy Alto'→'muy_alto' |

### 6.4 Actividades del Pipeline CI/CD

| Job | Actividades | Disparo |
|---|---|---|
| `backend` | lint → Jest (230 tests) → cobertura lcov → upload artefacto | Cada push |
| `ai-service` | pip install → entrenar modelo (SEED=42) → pytest (30 tests) | Cada push |
| `frontend` | npm ci → lint → Vitest (107 tests) → ng build | Cada push |
| `bdd` | npm ci → Cucumber.js (85 escenarios) → reporte HTML | Cada push |
| `e2e` | npm ci → Playwright (36 tests) contra Vercel | main + PRs |
| `flutter` | pub get → flutter analyze → flutter test (42 tests) | Cada push |
| `sonarcloud` | descargar cobertura → SonarCloud scan → quality gate | Cada push |
| `k6-smoke` | k6 smoke (1 VU, 30 s) contra backend Render | main |
| `lighthouse` | Lighthouse CI contra frontend Vercel | main |
| `deploy` | Render hook (backend + IA) → Vercel hook (frontend) | main (si pasan todos) |

### 6.5 Funciones Clave del Sistema

| Función | Módulo | Descripción |
|---|---|---|
| `postJson()` | `ai.service.js` | POST al microservicio IA con retry backoff + circuit breaker |
| `build_feature_vector()` | `features.py` | Construye el vector de 8 características para el modelo |
| `train_and_save()` | `trainer.py` | Entrena RandomForestRegressor (N=5000, SEED=42) y serializa |
| `predict()` | `predictor.py` | Carga modelo y genera riskScore, riskLevel, topFactors |
| `score_to_level()` | `predictor.py` | Mapea score [0-100] → Bajo/Moderado/Alto/Muy Alto |
| `authenticate` | `middleware/authenticate.js` | Valida JWT y adjunta userId al request |
| `aggregateTestScoresByFrequency()` | `evaluation.service.js` | Calcula avgTestScore y lowFreqScore del cuestionario |
| `NoiseMonitorService` | Angular | Accede a Web Audio API y clasifica nivel dB en tiempo real |

### 6.6 Trazabilidad Requisito → BDD → Test → Código

| RF | Escenario BDD | Test (Jest/pytest) | Controlador/Servicio |
|---|---|---|---|
| RF-01 Registro | `autenticacion.feature:3` | `auth.test.js:CP-B-01` | `auth.controller.js` |
| RF-01 Login | `autenticacion.feature:12` | `auth.test.js:CP-B-05` | `auth.controller.js` |
| RF-02 Registro ruido | `monitoreo-ruido.feature:4` | `noise.test.js:CP-B-20` | `noise.controller.js` |
| RF-03 Evaluación | `prueba-auditiva.feature:5` | `evaluation.test.js:CP-B-35` | `evaluation.controller.js` |
| RF-04 Predicción IA | `prediccion-riesgo-ia.feature:3` | `evaluation-ai.test.js:CP-B-50` | `ai.service.js` |
| RF-06 IoT | `dispositivos-iot.feature:6` | `device.test.js:CP-B-70` | `device.controller.js` |

**Matriz completa:** `docs/matriz-trazabilidad.md`

---

## 7. MANTENIMIENTO

### 7.1 Software Quality (SQ) — SonarCloud

| Métrica | Resultado |
|---|---|
| Quality Gate | **Aprobado** |
| Security Rating | **A** — 0 vulnerabilidades |
| Reliability Rating | **A** — 0 bugs |
| Maintainability Rating | **A** — 0 code smells |
| Coverage | **100 %** |
| Duplications | **0 %** |
| Lines of Code | **13 000+** (4 lenguajes) |

### 7.2 Implementación del Plan de Pruebas

El plan de pruebas (`docs/plan-de-pruebas.md`) se implementa en cada push mediante el pipeline CI/CD:

```
Commit → Push → GitHub Actions (10 jobs)
                  │
         ┌────────┴─────────────────────┐
         │                              │
    [Tests 530]               [Análisis calidad]
    Backend 230                SonarCloud
    IA 30                      Quality Gate
    Frontend 107               0 issues
    Flutter 42                 Rating A × 3
    E2E 36                     Coverage 100%
    BDD 85                     │
         │                     │
         └────────┬────────────┘
                  │
         [Deploy automático]
         Render + Vercel
         (solo si TODOS los jobs pasan)
```

### 7.3 Resiliencia y Recuperación

| Mecanismo | Implementación | Parámetros |
|---|---|---|
| Retry backoff exponencial | `ai.service.js` → `postJson()` | 3 intentos: 500ms → 1000ms → 2000ms |
| Circuit Breaker | `ai.service.js` → estado `_cb` | Abre tras 5 fallos; recupera en 30 s (HALF_OPEN) |
| Monitoreo de recursos | `GET /metrics` | `process.memoryUsage()` + `process.cpuUsage()` |
| Soft delete | Todos los modelos Mongoose | `isDeleted: true` + `deletedAt` — nunca DELETE físico |

### 7.4 Métricas de Recursos (ISO 9126 — Eficiencia)

| Métrica | Umbral k6 | Evidencia |
|---|---|---|
| Heap Node.js (p95) | < 200 MB | `resource_heap_used_mb` — k6 Trend |
| RSS proceso (p95) | < 350 MB | `resource_rss_mb` — k6 Trend |
| Latencia API (p95) | < 2 000 ms | `http_req_duration` — k6 threshold |
| Picos de heap > 150 MB | < 5 eventos | `resource_mem_warnings` — k6 Counter |

### 7.5 Documentos de Mantenimiento

| Documento | Ubicación |
|---|---|
| Runbook de estabilización operativa | `docs/Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md` |
| Runbook de ejecución controlada | `docs/PROMPT_MAESTRO_Ejecucion_Controlada_Runbook_HearGuard_AI_v1.0.md` |
| Manual de instalación | `docs/manual-instalacion.md` |
| Ficha de observación | `docs/ficha-observacion-hearguard-ai.md` |

---

## 8. DESPLIEGUE DE LA PRIMERA VERSIÓN

### 8.1 Infraestructura de Producción

| Servicio | Plataforma | URL | Tecnología |
|---|---|---|---|
| Frontend web | Vercel | https://frontend-tau-tan-95.vercel.app | Angular 21 + Nginx |
| Backend API | Render | https://backend-hearguard.onrender.com | Node.js 20 / Express 5 |
| Microservicio IA | Render | https://ai-hearguard.onrender.com | Python 3.11 / Flask |
| Base de datos | MongoDB Atlas M0 | AWS São Paulo (sa-east-1) | MongoDB 7 + TLS |

### 8.2 Proceso de Despliegue Automatizado

```
git push origin main
        │
        ▼
  GitHub Actions
  (10 jobs — ~8 min)
        │
   ✅ Todos pasan
        │
        ▼
   Job: deploy
   ┌────┴────┐
   │         │
[Render    [Vercel
 Backend]   Frontend]
   │              │
[curl hook]  [curl hook]
   │              │
 Rebuild       Rebuild
 & Deploy    & Deploy
```

### 8.3 Verificación del Despliegue

| Check | Comando | Resultado esperado |
|---|---|---|
| Backend health | `curl https://backend-hearguard.onrender.com/health` | `{"status":"ok"}` |
| Métricas de recursos | `curl .../metrics` | JSON con heap, RSS, CPU, uptime |
| Frontend disponible | Abrir URL en navegador | Splash screen de HearGuard AI |
| Modelo IA cargado | `curl .../api/model-info` | R², n_estimators, features |

### 8.4 Variables de Entorno Configuradas en Producción

| Variable | Servicio | Descripción |
|---|---|---|
| `MONGO_URI` | Render backend | Cadena de conexión MongoDB Atlas |
| `JWT_SECRET` | Render backend | Secret HMAC-SHA256 (64 hex) |
| `JWT_REFRESH_SECRET` | Render backend | Secret refresh token (64 hex) |
| `AI_SERVICE_URL` | Render backend | URL interna del microservicio Flask |
| `RENDER_BACKEND_HOOK` | GitHub Secrets | Deploy hook del backend |
| `RENDER_AI_HOOK` | GitHub Secrets | Deploy hook del microservicio IA |
| `VERCEL_FRONTEND_HOOK` | GitHub Secrets | Deploy hook del frontend |
| `SONAR_TOKEN` | GitHub Secrets | Token de análisis SonarCloud |

---

## 9. ENFOQUE ISO 9001

**Documento completo:** `docs/iso-9001-hearguard-ai.md`

### 9.1 Política de Calidad

HearGuard AI se compromete a desarrollar y mantener una plataforma que satisfaga los requisitos de sus usuarios, cumpla con estándares internacionales (ISO 9001, ISO 25010, ISO 29119, ISO 27001) y mejore continuamente mediante TDD + BDD + CRISP-DM + CI/CD automatizado.

### 9.2 Objetivos de Calidad (selección)

| Objetivo | Meta | Estado |
|---|---|:---:|
| OC-01 — Cobertura backend | 100 % líneas | ✅ |
| OC-03 — SonarCloud Quality Gate | Aprobado, Rating A × 3 | ✅ |
| OC-04 — Latencia API p95 | < 2 000 ms | ✅ |
| OC-07 — Trazabilidad RF → test | 100 % RF-01 a RF-06 | ✅ |
| OC-09 — R² del modelo RF | ≥ 0.80 | ✅ |
| OC-10 — SUS usabilidad | ≥ 70 / 100 | ⏳ Fieldwork |

### 9.3 Ciclo PDCA

| Fase | Aplicación |
|---|---|
| **Planificar** | Escenarios BDD + casos de prueba antes de implementar |
| **Hacer** | TDD: código mínimo que satisface la prueba |
| **Verificar** | Pipeline CI 10 jobs + SonarCloud en cada push |
| **Actuar** | Refactorización para eliminar code smells |

---

## 10. ENFOQUE ISO 25000

**ISO/IEC 25010:2011** es la norma vigente de calidad del producto software dentro de la familia ISO/IEC 25000 (SQuaRE).

### 10.1 Cumplimiento por Característica

| Característica ISO 25010 | Evidencia | Estado |
|---|---|:---:|
| Adecuación funcional | 530 tests, 60 RF trazados, Quality Gate | ✅ |
| Eficiencia de rendimiento | k6 p95 < 2000 ms, Lighthouse ≥ 80 % | ✅ |
| Compatibilidad | Angular + Flutter + ESP32 + Docker | ✅ |
| Usabilidad | Lighthouse ≥ 90 %, manual usuario, SUS ≥ 70 | ✅ |
| Fiabilidad | SonarCloud Rating A, retry, circuit breaker | ✅ |
| Seguridad | OWASP Top 10, JWT, bcrypt, RBAC | ✅ |
| Mantenibilidad | SonarCloud Rating A, CC ≤ 7, TDD | ✅ |
| Portabilidad | Docker, Render, Vercel, APK/IPA | ✅ |

**Matriz completa:** `docs/matriz-registro-hearguard.xlsx` (hoja "ISO 25010 — Calidad")

---

## 11. ENFOQUE ISO 29119

**ISO/IEC/IEEE 29119-3:2021** — Software Testing: Test Documentation.

### 11.1 Documentos de Prueba Producidos

| Documento ISO 29119 | HearGuard AI | Ubicación |
|---|---|---|
| Plan de pruebas del proyecto | Plan de pruebas IEEE 829 | `docs/plan-de-pruebas.md` |
| Especificación de casos de prueba | 530 casos con ID, precondición, pasos, resultado | `docs/plan-de-pruebas.md` |
| Informe de ejecución | Reportes HTML de Jest, Playwright, Cucumber, k6 | Artefactos CI/CD |
| Informe de cobertura | lcov + XML + SonarCloud dashboard | `backend/coverage/` |
| Trazabilidad | Matriz requisito → BDD → test → código | `docs/matriz-trazabilidad.md` |

### 11.2 Niveles de Prueba

| Nivel | Descripción | Herramienta |
|---|---|---|
| Unitarias | Funciones y servicios aislados | Jest, pytest, Vitest, flutter_test |
| Integración | Endpoints API con BD real en memoria | Jest + Supertest + mongodb-memory-server |
| Sistema | Flujos completos en producción | Playwright (E2E contra Vercel) |
| Aceptación | Escenarios BDD desde perspectiva del usuario | Cucumber.js |

---

## 12. ENFOQUE ISO 27000

**ISO/IEC 27001:2022** — Gestión de Seguridad de la Información.

**Documento completo:** `docs/iso-27000-hearguard-ai.md`

### 12.1 Controles Implementados

| Dominio | Control principal | Implementación |
|---|---|---|
| Autenticación | JWT HS256 + refresh SHA-256 (rotación) | `auth.service.js` |
| Criptografía | bcrypt salt 12 + TLS + AES-256 Atlas | `auth.controller.js` + Render/Atlas |
| Control de acceso | RBAC — `userId` verificado en todos los endpoints | `middleware/authenticate.js` |
| Protección web | Helmet.js + CORS restrictivo + rate limiting | `server.js` |
| Vulnerabilidades | `npm audit` en CI + SonarCloud Security Rating A | `.github/workflows/ci.yml` |
| Respaldo | MongoDB Atlas snapshots diarios + soft delete | MongoDB Atlas |
| Registro de auditoría | `logger.js` — método, path, código, userId | `utils/logger.js` |

### 12.2 Pruebas de Seguridad

**Archivo:** `backend/tests/security.test.js` — 22 casos cubriendo:
- JWT inválido, expirado y con algoritmo `alg:none`
- Inyección NoSQL en login
- IDOR — acceso a recursos de otro usuario
- Acceso a rutas protegidas sin token
- Rate limiting (HTTP 429)
- Anti-enumeración de usuarios

### 12.3 OWASP Top 10 2021

| ID | Vulnerabilidad | Mitigación |
|---|---|:---:|
| A01 | Broken Access Control | RBAC + verificación userId | ✅ |
| A02 | Cryptographic Failures | bcrypt 12 + JWT HS256 + TLS | ✅ |
| A03 | Injection | Mongoose typing + express-validator | ✅ |
| A06 | Vulnerable Components | npm audit en CI (0 high/critical) | ✅ |
| A07 | Auth Failures | Anti-enumeración + rotación tokens | ✅ |

---

## 13. CONCLUSIONES

1. HearGuard AI v1.0 demuestra que es viable construir una plataforma de salud digital con calidad industrial aplicando TDD + BDD + CRISP-DM en un contexto universitario, evidenciado por 530 tests automatizados, Quality Gate SonarCloud aprobado y Rating A en las tres dimensiones de calidad.

2. La integración de monitoreo IoT (ESP32 + KY-037), evaluación auditiva digital y predicción de riesgo mediante Random Forest (R² ≥ 0.80, CRISP-DM) en una única plataforma multiplataforma (Angular + Flutter) constituye la aportación técnica diferencial del proyecto, cerrando la brecha identificada en el estado del arte.

3. El cumplimiento de las normas ISO 9001, ISO 25000/25010, ISO 29119 e ISO 27001 aporta un marco de referencia riguroso que garantiza la calidad del proceso de desarrollo, la calidad del producto, la trazabilidad de las pruebas y la seguridad de los datos de salud del usuario.

4. La arquitectura de microservicios con circuit breaker, retry backoff exponencial y endpoint `/metrics` de monitoreo de recursos implementa las sub-características de Fiabilidad y Eficiencia de ISO 9126, elevando la resiliencia del sistema más allá de los requisitos mínimos académicos.

5. Con el despliegue exitoso en producción (Render + Vercel + MongoDB Atlas), la generación automática de la primera versión del producto mediante el pipeline CI/CD y la documentación completa del sistema, HearGuard AI v1.0 cumple la totalidad de los requisitos del examen final.

---

## 14. REFERENCIAS BIBLIOGRÁFICAS

BECK, Kent. *Test-driven development: by example*. Boston: Addison-Wesley, 2003.

BING, Dai, et al. Predicting the hearing outcome in sudden sensorineural hearing loss via machine learning models. *Clinical Otinaryngology*. 2018, vol. 43, no. 3, pp. 868–874. DOI 10.1111/coa.13068.

BISSI, Wilson, NETO, Adolfo Gustavo Serra Seca, EMER, Maria Claudia Figueiredo Pereira. The effects of test driven development on internal quality, external quality and productivity. *Information and Software Technology*. 2016, vol. 74, pp. 45–54.

BREIMAN, Leo. Random forests. *Machine Learning*. 2001, vol. 45, no. 1, pp. 5–32.

HUMBLE, Jez, FARLEY, David. *Continuous delivery*. Boston: Addison-Wesley, 2010.

ISO/IEC 25010:2011. *Systems and software engineering — System and software quality models*. Ginebra: ISO, 2011.

ISO/IEC/IEEE 29119-3:2021. *Software testing — Part 3: Test documentation*. Ginebra: ISO, 2021.

ISO/IEC 27001:2022. *Information security management systems — Requirements*. Ginebra: ISO, 2022.

ISO 9001:2015. *Quality management systems — Requirements*. Ginebra: ISO, 2015.

ISLAM, S. M. R., MAHMUD, S., RAHMAN, M. A. IoT-based pervasive health monitoring. *Journal of Ambient Intelligence and Humanized Computing*. 2020, vol. 11, no. 6, pp. 1–22.

MARTÍNEZ-PLUMED, F., et al. CRISP-DM twenty years later. *IEEE Transactions on Knowledge and Data Engineering*. 2021, vol. 33, no. 8, pp. 3048–3061.

ORGANIZACIÓN MUNDIAL DE LA SALUD. *World report on hearing* [en línea]. Ginebra: WHO, 2021.

OWASP FOUNDATION. *OWASP Top Ten 2021* [en línea]. 2021. Disponible en: https://owasp.org/www-project-top-ten/

SCHRÖER, C., KRUSE, F., GÓMEZ, J. M. A systematic literature review on applying CRISP-DM. *Procedia Computer Science*. 2021, vol. 181, pp. 526–534.

SHEARER, Colin. The CRISP-DM model: the new blueprint for data mining. *Journal of Data Warehousing*. 2000, vol. 5, no. 4, pp. 13–22.

SMART, John Ferguson. *BDD in action*. Shelter Island: Manning Publications, 2014.

---

*HearGuard AI v1.0 · Universidad Continental · Escuela de Ingeniería de Sistemas e Informática*
*Repositorio: https://github.com/hatWHITE-UwU/hearguard-ai*
*Contacto: luisterreroshinojosa@gmail.com*
