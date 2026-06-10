# HearGuard AI: Plataforma de salud auditiva preventiva basada en TDD/BDD e integrada con un modelo de Random Forest desarrollado bajo CRISP-DM

---

## Información de los autores

- **Autor(es):** Luis Francisco Terreros Hinojosa · Hardy Eduardo Rondinel Aquino
- **Asesor(es):** [Nombre del docente asesor]
- **Institución:** Universidad Continental — Escuela Académico Profesional de Ingeniería de Sistemas e informatica
- **Correo de contacto:** [luisterreroshinojosa@gmail.com]
- **Año:** 2026

---

## Resumen

HearGuard AI es una plataforma de salud auditiva preventiva que monitorea la exposición al ruido en tiempo real, ejecuta una prueba auditiva por cuestionario y predice el nivel de riesgo del usuario mediante un modelo de aprendizaje automático. El sistema se compone de una API REST en Node.js/Express, una aplicación web en Angular, una aplicación móvil en Flutter, un microservicio Python/Flask con un clasificador Random Forest y un firmware IoT para ESP32. El desarrollo se realizó aplicando **Test-Driven Development y Behavior-Driven Development** como metodología principal, complementada con **CRISP-DM** para la construcción del modelo predictivo. Como resultados, se reportan **507 casos de prueba automatizados** distribuidos en seis capas (backend, servicio de IA, frontend, aplicación móvil, E2E con Playwright y **85 escenarios BDD Gherkin/Cucumber.js**), un modelo con R² holdout ≥ 0.80 y un pipeline de diez jobs en GitHub Actions con análisis estático en SonarCloud (cobertura 100 %), rendimiento con k6, auditoría Lighthouse, y despliegue continuo en Render y Vercel.

**Palabras clave:** salud auditiva, IoT, Random Forest, TDD, BDD, CRISP-DM, ingeniería de software, machine learning.

---

## 1. Introducción

La pérdida auditiva inducida por ruido (PAIR) es una de las principales causas de discapacidad sensorial prevenible en el mundo. La Organización Mundial de la Salud estima que más de 1 000 millones de personas entre 12 y 35 años están expuestas a niveles de sonido superiores a los recomendados, principalmente por el uso prolongado de dispositivos personales de audio, actividades de ocio en entornos ruidosos y exposición ocupacional sin protección adecuada. La exposición continua a niveles superiores a 85 dB(A) deteriora de forma progresiva e irreversible las células ciliadas del oído interno, lo que produce hipoacusia, tinnitus y, en casos avanzados, aislamiento social y deterioro cognitivo en edades tempranas.

La práctica clínica tradicional aborda esta problemática de manera **reactiva**: el paciente acude a consulta cuando ya percibe síntomas, momento en el que el daño es habitualmente irreversible. Las soluciones digitales actuales —aplicaciones móviles que miden decibelios en tiempo real— ofrecen información puntual pero no consolidan el historial de exposición, no incluyen evaluación auditiva y no producen una estimación cuantitativa del riesgo del usuario. Existe, por tanto, una **brecha entre la medición individual y la intervención preventiva personalizada**, que puede cerrarse mediante una plataforma integral que combine monitoreo continuo, autoevaluación auditiva y predicción de riesgo con aprendizaje automático.

El presente trabajo describe **HearGuard AI**, una plataforma multiplataforma (web, móvil e IoT) que integra estos tres componentes y predice el nivel de riesgo auditivo del usuario a partir de variables auto-reportadas y mediciones de ruido. El sistema se diseñó con un enfoque metodológico formal: **Test-Driven Development (TDD)** y **Behavior-Driven Development (BDD)** para el ciclo de vida del software, y **CRISP-DM** para la construcción del modelo predictivo.

**Pregunta de investigación.** ¿Es posible construir una plataforma multiplataforma que estime el riesgo auditivo del usuario, a partir de variables auto-reportadas y mediciones de ruido obtenidas mediante un dispositivo IoT de bajo costo, aplicando metodologías formales de ingeniería de software y minería de datos que garanticen reproducibilidad y trazabilidad?

**Objetivo general.** Desarrollar y validar una plataforma de salud auditiva preventiva basada en monitoreo IoT, cuestionario auditivo y predicción de riesgo con aprendizaje automático, siguiendo TDD/BDD y CRISP-DM.

**Objetivos específicos.**

1. Diseñar e implementar una API REST con autenticación segura que centralice la información de usuarios, lecturas de ruido, evaluaciones auditivas y dispositivos IoT.
2. Construir interfaces de usuario en web (Angular) y móvil (Flutter) con experiencia de usuario coherente.
3. Implementar un firmware ESP32 capaz de medir el nivel de ruido ambiental y reportarlo al backend de forma autenticada.
4. Entrenar un modelo Random Forest que estime el riesgo auditivo a partir de ocho variables y mapearlo a cuatro niveles cualitativos (Bajo, Moderado, Alto, Muy Alto).
5. Aplicar TDD y BDD a lo largo del desarrollo y CRISP-DM al ciclo de modelado, generando trazabilidad explícita entre requisitos, escenarios, pruebas y código.
6. Desplegar la plataforma en una infraestructura de producción (Render, Vercel, MongoDB Atlas) con integración y despliegue continuos.

---

## 2. Trabajos relacionados

### 2.1 Aplicaciones de monitoreo de ruido

En el mercado existen aplicaciones móviles dedicadas a la medición del nivel sonoro mediante el micrófono del dispositivo, como *Decibel X*, *Sound Meter Pro* y *NIOSH SLM* (publicada por el National Institute for Occupational Safety and Health de los Estados Unidos). Estas aplicaciones reportan el nivel sonoro instantáneo en dB(A), algunas incorporan promedios temporales, y NIOSH SLM en particular ha sido validada contra sonómetros clase 2 (Kardous & Shaw, 2014). Su limitación principal es que se enfocan exclusivamente en la **medición**: no consolidan el historial del usuario, no incorporan una evaluación auditiva subjetiva ni producen una estimación cuantitativa del riesgo individual.

### 2.2 Aprendizaje automático aplicado a salud auditiva

Diversos trabajos académicos han explorado el uso de aprendizaje automático para clasificar audiogramas, predecir pérdida auditiva ocupacional y estimar el riesgo a partir de variables clínicas y de exposición. Lenatti et al. (2022) reportan un clasificador basado en árboles para detección temprana de hipoacusia neurosensorial. Bing et al. (2018) emplean *Random Forest* y regresión logística para clasificar audiogramas con precisión superior al 90 %. Vlaming, MacKinnon, Jansen y Moore (2014) proponen una prueba auditiva digital validada para *screening* poblacional. Estos trabajos confirman que técnicas clásicas como *Random Forest* son adecuadas para este dominio, especialmente cuando se dispone de un número moderado de variables auto-reportadas.

### 2.3 Plataformas IoT en salud preventiva

El uso de sensores conectados para monitoreo preventivo de salud ha crecido sostenidamente. Islam, Mahmud y Rahman (2020) presentan una arquitectura genérica IoT–nube–usuario aplicable a múltiples dominios de salud. En el ámbito acústico, Picaut, Can, Fortin, Ardouin y Lagrange (2020) describen redes urbanas de sensores para vigilancia ambiental del ruido. Estos trabajos demuestran la viabilidad técnica de sensores conectados de bajo costo, pero raramente se acoplan a un modelo predictivo personalizado para el usuario final.

### 2.4 Vacío identificado

A partir de la revisión anterior se identifican tres carencias en las soluciones existentes:

- **Falta de integración** entre monitoreo, autoevaluación y predicción en una misma plataforma.
- **Trazabilidad metodológica limitada**: la mayoría de soluciones comerciales no documenta el proceso de desarrollo ni el proceso de modelado.
- **Limitada reproducibilidad** del modelo predictivo, ya que los datasets y el código rara vez se publican.

HearGuard AI aborda estas tres carencias integrando los componentes en una sola plataforma, aplicando TDD/BDD + CRISP-DM con trazabilidad explícita y publicando el código completo en un repositorio público.

---

## 3. Metodología

### 3.1 Metodología principal: TDD + BDD

El ciclo de vida del software siguió **Test-Driven Development (TDD)**, formalizado por Beck (2003), en su patrón clásico *red–green–refactor*: se redacta primero una prueba que falla, después el código mínimo que la hace pasar y, finalmente, se refactoriza preservando el comportamiento. Estudios empíricos como los de Janzen y Saiedian (2005) y la revisión sistemática de Bissi, Neto y Emer (2016) reportan mejoras consistentes en calidad interna y externa cuando se aplica TDD de forma disciplinada.

TDD se complementó con **Behavior-Driven Development (BDD)**, propuesto por North (2006) y formalizado por Smart (2014). En BDD los criterios de aceptación de cada historia de usuario se redactan en lenguaje natural estructurado mediante Gherkin (`Dado/Cuando/Entonces`), lo que permite que actores no técnicos participen en su definición (Solis & Wang, 2011). En HearGuard AI se crearon seis archivos `.feature` en `docs/features/`, uno por módulo funcional, que sirven a la vez como **especificación**, **documentación viva** y **base para los casos de prueba** del plan formal documentado en `docs/plan-de-pruebas.md`.

El ciclo aplicado por cada historia de usuario fue de cinco pasos: (1) redacción del escenario Gherkin, (2) traducción a una prueba unitaria o de integración que falla, (3) implementación del código mínimo necesario, (4) refactorización y (5) verificación automática en el pipeline de GitHub Actions, complementada con análisis estático en SonarCloud mediante el job `sonarcloud` del workflow CI. La aplicación de la metodología en las seis capas del software se resume en la siguiente tabla:

| Capa | Framework de pruebas | Carpeta | Casos automatizados |
|------|----------------------|---------|---------------------|
| Backend Node.js / Express | Jest + Supertest | `backend/tests/` | 207 |
| Servicio de IA Flask | pytest | `ai-service/tests/` | 30 |
| Frontend Angular | Vitest | `frontend/src/app/**/*.spec.ts` | 107 |
| Aplicación móvil Flutter | flutter_test | `flutter_app/test/` | 42 |
| End-to-End multiplataforma | Playwright | `e2e/tests/` | 36 |
| Escenarios BDD (Gherkin/Cucumber.js) | Cucumber.js | `bdd/step_definitions/` | 85 |
| **Total** | | | **507** |

Se aplicaron tanto pruebas de **caja negra** —API REST verificada mediante Supertest y 85 escenarios de aceptación ejecutados con Cucumber.js— como pruebas de **caja blanca** sobre la lógica interna del predictor de IA, los servicios Angular, los guards e interceptores y los *mappers* de Flutter. El detalle completo se encuentra en `docs/metodologia.md` y `docs/plan-de-pruebas.md`.

### 3.2 Metodología complementaria: CRISP-DM

Para el componente de inteligencia artificial se aplicó **CRISP-DM** (*Cross-Industry Standard Process for Data Mining*), formalizado por Shearer (2000) y Wirth & Hipp (2000). La revisión sistemática de Schröer, Kruse y Gómez (2021) y el análisis longitudinal de Martínez-Plumed et al. (2021) confirman que CRISP-DM continúa siendo el proceso más utilizado en proyectos de ciencia de datos en producción, dos décadas después de su publicación.

El modelo se construyó iterando entre las seis fases del proceso. Cada fase se mapea a archivos concretos del repositorio:

| Fase CRISP-DM | Actividad | Trazabilidad |
|---------------|-----------|--------------|
| 1. Comprensión del negocio | Definición del problema: predicción temprana del riesgo auditivo en jóvenes y adultos jóvenes expuestos a ruido y uso prolongado de auriculares. | `README.md`, `Document/RoadmapTecnico/Fase_4_ServicioIA.md` |
| 2. Comprensión de los datos | Identificación de variables: edad, horas de auriculares, volumen, exposición a ruido ocupacional, hábitos (tabaco) y puntajes del cuestionario auditivo. | Esquema `Evaluation` en `backend/src/models/` |
| 3. Preparación de los datos | Construcción del vector de 8 *features*, normalización, manejo seguro de valores faltantes. | `ai-service/model/features.py`, `ai-service/model/constants.py` |
| 4. Modelado | Entrenamiento de un clasificador *Random Forest* (Breiman, 2001) implementado en scikit-learn. | `ai-service/model/trainer.py` |
| 5. Evaluación | Validación holdout (R² ≥ 0.80), pruebas con perfiles de riesgo bajo/alto, robustez frente a datos faltantes. | `ai-service/tests/test_predictor.py` |
| 6. Despliegue | Exposición como microservicio Flask con endpoints `/api/predict-risk` y `/api/generate-recommendations`. Despliegue en Render. | `ai-service/app.py`, `render.yaml` |

### 3.3 Articulación de ambas metodologías

Las dos metodologías no se solapan: TDD/BDD rige el ciclo de vida del **software** (backend, web, móvil, IoT) mientras que CRISP-DM rige el ciclo del **modelo predictivo**. Ambas se integran en el pipeline de CI/CD: el job `ai-service` entrena el modelo y ejecuta pytest (fases 4 y 5 de CRISP-DM) antes de que el job `deploy` publique el servicio en Render (fase 6 de CRISP-DM), de modo que ninguna versión del modelo llega a producción sin haber superado la red de pruebas TDD ni las fases de evaluación de CRISP-DM.

---

## 4. Arquitectura del sistema

La arquitectura del sistema sigue un patrón de microservicios desacoplados, con clientes heterogéneos que se comunican exclusivamente mediante HTTP/REST con la API central:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Clientes                                 │
│   Angular 21 (web)         Flutter 3 (móvil)   ESP32 (IoT)      │
└──────────────┬─────────────────┬───────────────────┬────────────┘
               │ HTTP/REST       │ HTTP/REST         │ X-Device-Key
               ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Node.js / Express 5                        │
│   /api/auth   /api/noise   /api/evaluations   /api/devices      │
│              JWT access 15 min + refresh 7 d                    │
└──────────┬──────────────────────────────┬───────────────────────┘
           │ HTTP                          │ Mongoose
           ▼                               ▼
┌──────────────────────┐     ┌────────────────────────────────────┐
│  AI Service (Flask)  │     │        MongoDB Atlas               │
│  POST /predict-risk  │     │  users · noiseRecords              │
│  POST /recommend     │     │  evaluations · riskResults         │
│  RandomForest scikit │     │  devices                           │
└──────────────────────┘     └────────────────────────────────────┘
```

**Capas del sistema:**

- **Clientes:** Angular (web), Flutter (móvil), ESP32 (IoT).
- **Backend:** API REST en Node.js/Express 5 con autenticación JWT (access 15 min + refresh 7 días). Endpoints organizados en `/api/auth`, `/api/noise`, `/api/evaluations`, `/api/devices`.
- **Persistencia:** MongoDB Atlas (colecciones `users`, `noiseRecords`, `evaluations`, `riskResults`, `devices`).
- **Servicio de IA:** microservicio Flask con un modelo *Random Forest* (scikit-learn) servido en `/api/predict-risk` y `/api/generate-recommendations`.
- **IoT:** firmware ESP32 con sensor KY-037 que envía lecturas vía HTTP autenticado con `X-Device-Key`.
- **Infraestructura:** Docker Compose para entorno local; GitHub Actions, Render y Vercel para producción.

---

## 5. Implementación

### 5.1 Modelo de datos

La base de datos MongoDB contiene cinco colecciones principales con responsabilidades bien delimitadas:

| Colección | Campos principales | Propósito |
|-----------|--------------------|-----------|
| `users` | `name`, `email`, `password` (bcrypt), `refreshTokenHash`, `settings` | Identidad del usuario y preferencias personales (tema, recordatorios). |
| `noiseRecords` | `userId`, `dbLevel`, `source` (`app`/`iot`), `deviceId`, `riskTag` (`bajo`/`moderado`/`alto`/`muy_alto`), `highRisk`, `createdAt` | Lecturas de nivel sonoro provenientes de la app o de un dispositivo IoT. |
| `evaluations` | `userId`, `frequencyScores` (6 frecuencias × 2 oídos), `habitData`, `riskResult` | Resultados del cuestionario auditivo y de la predicción de riesgo. |
| `riskResults` | `riskScore` (0–100), `riskLevel`, `topFactors`, `recommendations` | Salida del servicio de IA persistida junto a la evaluación. |
| `devices` | `userId`, `name`, `type`, `apiKey` (SHA-256), `hardwareId`, `firmwareVersion` | Dispositivos IoT registrados, autenticados por `X-Device-Key`. |

Las relaciones son por referencia (`userId`, `deviceId`) y todas las consultas se aíslan por usuario autenticado, lo que garantiza la confidencialidad de los datos.

### 5.2 Modelo de Machine Learning

El modelo predictivo se construyó siguiendo CRISP-DM y se serializa como un *bundle* con el clasificador, el escalador y las métricas de holdout.

- **Algoritmo:** *Random Forest Classifier* (Breiman, 2001) implementado en scikit-learn.
- **Features (8):** `age`, `headphoneHours`, `volumeLevel`, `noiseExposure`, `occupationRisk`, `smoking`, `avgTestScore`, `lowFreqScore`.
- **Salida:** `riskScore` ∈ [0, 100] y `riskLevel` ∈ {Bajo, Moderado, Alto, Muy Alto}, complementado con los `topFactors` que más contribuyen al score y un conjunto de recomendaciones personalizadas.
- **Entrenamiento:** `ai-service/model/trainer.py` (ejecutado automáticamente en el job `ai-service` del pipeline CI).
- **Inferencia:** `ai-service/model/predictor.py`, expuesto vía Flask en `ai-service/app.py`.

### 5.3 Integración continua y despliegue

- **CI:** `.github/workflows/ci.yml` con diez jobs: `backend`, `ai-service`, `frontend`, `bdd` (Cucumber.js, 85 escenarios), `e2e`, `flutter`, `sonarcloud`, `k6-smoke` (reporte HTML con `handleSummary`), `lighthouse` (accessibility ≥ 90 %) y `deploy` (hooks a Render y Vercel, solo en `main`).
- **Análisis estático:** SonarCloud mediante job CI con `SONAR_TOKEN` y `sonar-project.properties` (proyecto `hatWHITE-UwU_hearguard-ai`, organización `hatwhite-uwu`). Los artefactos de cobertura se normalizan con `scripts/fix-sonar-coverage-paths.js` antes del escaneo.
- **Despliegue:** Render para backend e IA, Vercel para el frontend; los hooks se disparan automáticamente tras la aprobación de los jobs de pruebas en `main`.

---

## 6. Validación y resultados

### 6.1 Resultados de las pruebas automatizadas

| Capa | Herramienta | Casos | Estado |
|------|-------------|-------|--------|
| Backend | Jest + Supertest | 207 | Pasan |
| Servicio IA | pytest | 30 | Pasan |
| Frontend | Vitest | 107 | Pasan |
| Móvil | flutter_test | 42 | Pasan |
| End-to-End | Playwright | 36 | Pasan |
| BDD Gherkin | Cucumber.js | 85 | Pasan (API); frontend/IA → pending |
| **Total** | | **507** | **Pasan** |

**Cobertura mínima exigida por el pipeline:** 60 % de líneas en backend y en servicio de IA. En local, el backend alcanza 100 % de líneas con `--runInBand`. SonarCloud consolida la cobertura de las tres capas analizadas (backend, frontend, IA) y reporta **100 %** en el Quality Gate.

### 6.2 Resultados del modelo de IA

- **R² holdout:** ≥ 0.80, validado por `test_model_loaded`.
- **Robustez ante entrada vacía:** verificada por `test_missing_data_safe`; el predictor retorna un score acotado y un `topFactors` válido.
- **Clasificación de perfiles representativos:** un perfil de riesgo alto (edad 60, 8 h de auriculares, volumen 95 dB, exposición ocupacional alta, tabaquismo, puntajes auditivos bajos) obtiene score > 60; un perfil sano (edad 22, 0.5 h, volumen 25 dB, sin exposición, sin tabaquismo, puntajes altos) obtiene score < 40.

### 6.3 Métricas de SonarCloud

El análisis estático en SonarCloud reporta el siguiente estado del proyecto (mayo 2026):

| Métrica | Resultado |
|---------|-----------|
| Quality Gate | Aprobado |
| Tamaño del proyecto | ~13 000 líneas de código (TypeScript, JavaScript, Python) |
| Mantenibilidad | A |
| Fiabilidad | A |
| Seguridad | A |
| Issues abiertos | 0 |
| Duplicación de código | 0 % |
| Cobertura | 100 % |

Las remediaciones de seguridad (host Flask configurable, CORS endurecido, manejo de excepciones en `/api/predict-risk`, suite `security.test.js`) se incorporaron al repositorio y se validan en cada ejecución del pipeline CI.

### 6.4 Trazabilidad escenario BDD ↔ prueba automatizada

La siguiente tabla muestra ejemplos representativos de la trazabilidad entre escenarios Gherkin ejecutados con Cucumber.js y casos de prueba automatizados a través de las seis capas:

| Escenario Gherkin | Capa | Prueba automatizada |
|-------------------|------|---------------------|
| `autenticacion.feature`: registro exitoso con datos válidos | Backend | `auth.test.js`: `POST /api/auth/register devuelve 201 y tokens` |
| `autenticacion.feature`: refresh con token válido | Backend | `auth.test.js`: `renueva access token con refresh válido` |
| `autenticacion.feature`: rechazo de inyección NoSQL | Backend | `security.test.js`: `rechaza email con operador $gt` |
| `monitoreo-ruido.feature`: lectura de ruido autenticada | Backend | `noise.test.js`: `clasifica riskTag bajo/moderado/alto/muy_alto` |
| `dispositivos-iot.feature`: lectura IoT con `X-Device-Key` válido | Backend | `noise.test.js`: `guarda registro con X-Device-Key válido` |
| `prediccion-riesgo-ia.feature`: perfil de alto riesgo | IA | `test_predictor.py`: `test_high_risk_profile` + `test_api.py`: `test_high_risk_patient_scores_high` |
| `prediccion-riesgo-ia.feature`: entrada vacía no rompe el servicio | IA | `test_predictor.py`: `test_missing_data_safe` + `test_api.py`: `test_empty_payload_safe` |
| `prediccion-riesgo-ia.feature`: R² del modelo en producción ≥ 0.80 | IA | `test_api.py`: `test_r2_above_threshold` |
| `prueba-auditiva.feature`: cuestionario auditivo completo | Frontend / Móvil | `hearing-test.service.spec.ts` (Angular) + `hearing_mapper_test.dart` (Flutter) |
| `autenticacion.feature`: login desde la app web (flujo completo) | E2E | `e2e/tests/auth.spec.ts` (Playwright contra Vercel) |
| `autenticacion.feature`: registro exitoso ejecutado por Cucumber | BDD | `bdd/step_definitions/auth.steps.js`: `POST /api/auth/register` con supertest |
| `monitoreo-ruido.feature`: IDOR — userA no accede a registros de userB | BDD | `bdd/step_definitions/noise.steps.js`: aserción `items.length === 0` sobre userA autenticado |

---

## 7. Discusión

Los resultados muestran que la combinación TDD/BDD + CRISP-DM es viable y efectiva para un proyecto de salud auditiva preventiva con componentes heterogéneos (software multiplataforma + modelo de IA + hardware IoT). Tres observaciones merecen destacarse.

**Beneficio del enfoque TDD/BDD en proyectos multiplataforma.** Disponer de 507 casos automatizados distribuidos en seis capas —incluyendo 85 escenarios Gherkin ejecutados con Cucumber.js en CI y 36 pruebas E2E con Playwright contra el frontend desplegado en Vercel— permitió detectar regresiones rápidamente durante los cambios estructurales del proyecto, por ejemplo durante la migración del servicio de IA a Python 3.11 y la actualización de dependencias para compatibilidad con Render. Sin esta red de pruebas, cada cambio habría exigido validación manual de extremo a extremo. La existencia previa de los seis archivos `.feature` facilitó identificar qué comportamientos críticos debían quedar cubiertos por pruebas automatizadas y, en particular, qué flujos completos merecían una prueba E2E (autenticación, prueba auditiva y *smoke* del despliegue).

**Adecuación de CRISP-DM al microservicio de IA.** CRISP-DM aportó al modelo predictivo el rigor que TDD aporta al resto del sistema. Su separación clara entre comprensión del problema, preparación de datos, modelado y evaluación permitió iterar sobre el conjunto de variables sin acoplar esta evolución al ciclo del software principal. Esto resultó especialmente útil porque el modelo se entrena dentro del pipeline de CI (`python -m model.trainer`), lo que convierte cada *push* a `main` en una nueva ejecución reproducible de las fases 3, 4 y 5 de CRISP-DM.

**Diferenciación frente a soluciones existentes.** En comparación con apps comerciales centradas exclusivamente en medición (NIOSH SLM, Decibel X), HearGuard AI integra monitoreo, cuestionario y predicción en una plataforma única. En comparación con estudios académicos de clasificación auditiva (Bing et al., 2018; Lenatti et al., 2022), HearGuard AI publica el código completo, los escenarios BDD y el plan de pruebas, lo que aumenta su reproducibilidad y permite que otros investigadores reutilicen la arquitectura.

**Lecciones aprendidas.** Tres aprendizajes principales se derivan del proceso: (1) la inversión inicial en infraestructura de pruebas paga dividendos durante todo el ciclo de vida; (2) la trazabilidad explícita entre escenarios Gherkin, casos de prueba y código fuente facilita el mantenimiento y la incorporación de nuevos miembros al equipo; y (3) integrar las fases de CRISP-DM directamente en el pipeline de CI evita el riesgo común de que el modelo "se entrene una vez y nunca se vuelva a auditar".

---

## 8. Limitaciones

- **Dataset sintético.** El modelo se entrena con datos generados a partir de heurísticas médicas y no a partir de un dataset clínico real. Esto limita la generalización del modelo y debe interpretarse como una **prueba de concepto** del proceso CRISP-DM, no como una herramienta diagnóstica.
- **Escenarios BDD frontend/hardware/IA pendientes.** Los 85 escenarios Gherkin se ejecutan automáticamente con Cucumber.js en CI; sin embargo, los escenarios que requieren navegador (Angular), hardware físico (ESP32) o el microservicio Flask activo permanecen en estado *pending* y no se ejecutan en el pipeline principal, a la espera de integración con Playwright E2E y un entorno de pruebas del servicio de IA.
- **Calibración del sensor de ruido.** El mapeo lineal del ADC del ESP32 a dB(A) es una aproximación didáctica; el uso clínico exigiría calibración contra un sonómetro de referencia clase 2.

---

## 9. Conclusiones

Este trabajo presentó HearGuard AI, una plataforma de salud auditiva preventiva que integra monitoreo IoT, cuestionario auditivo y predicción de riesgo con aprendizaje automático, desarrollada bajo TDD/BDD como metodología principal y CRISP-DM como metodología complementaria para el modelado predictivo.

A partir de la pregunta de investigación planteada en la introducción —si era posible construir tal plataforma aplicando metodologías formales que garantizaran reproducibilidad y trazabilidad—, los resultados obtenidos respaldan una respuesta afirmativa: se construyó un sistema funcional, multiplataforma y desplegado en producción, con **507 casos de prueba automatizados** en seis capas (incluyendo 85 escenarios Gherkin ejecutados con Cucumber.js en CI y pruebas E2E con Playwright contra el frontend en Vercel), cobertura consolidada del **100 %** en SonarCloud, un modelo con R² holdout ≥ 0.80 validado en producción mediante el endpoint `/api/model-info`, y trazabilidad explícita entre escenarios Gherkin, casos de prueba y código fuente.

La combinación TDD/BDD + CRISP-DM demostró ser adecuada para gestionar la heterogeneidad del sistema: TDD/BDD aportó disciplina al ciclo del software multiplataforma y CRISP-DM aportó rigor al ciclo del modelo de IA, sin solapamiento entre ambas. Ambas se integraron en el mismo pipeline de CI/CD, lo que permite que cada *push* a `main` regenere y valide tanto el software como el modelo.

### Trabajo futuro

- Completar los step definitions BDD de escenarios frontend/Angular (con Playwright) y del microservicio de IA (Flask en contenedor), de modo que los 85 escenarios pasen de *pending* a *executed*.
- Reentrenar el modelo con un dataset clínico real, recolectado con consentimiento informado, para fortalecer la fase 2 de CRISP-DM y aumentar la validez externa del clasificador.
- Incorporar prácticas de MLOps (Kreuzberger, Kühl & Hirschl, 2023) para reentrenamiento continuo y monitoreo de *data drift* en producción.
- Calibrar el sensor de ruido del ESP32 contra un sonómetro de referencia clase 2 para uso en estudios de campo.

---

## Referencias

Beck, K. (2003). *Test-driven development: By example*. Boston: Addison-Wesley.

Bing, D., Ying, J., Miao, J., Lan, L., Wang, D., Zhao, L., Yin, Z., Yu, L., Guan, J., & Wang, Q. (2018). Predicting the hearing outcome in sudden sensorineural hearing loss via machine learning models. *Clinical Otolaryngology*, 43(3), 868–874. https://doi.org/10.1111/coa.13068

Bissi, W., Neto, A. G. S. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. *Information and Software Technology*, 74, 45–54. https://doi.org/10.1016/j.infsof.2016.02.004

Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324

Humble, J., & Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley.

Islam, M. M., Mahmud, S., & Rahman, A. (2020). The Internet of Things for health care: A comprehensive survey. *IEEE Access*, 8, 30716–30748.

Janzen, D., & Saiedian, H. (2005). Test-driven development: Concepts, taxonomy, and future direction. *Computer*, 38(9), 43–50. https://doi.org/10.1109/MC.2005.314

Kardous, C. A., & Shaw, P. B. (2014). Evaluation of smartphone sound measurement applications. *The Journal of the Acoustical Society of America*, 135(4), EL186–EL192. https://doi.org/10.1121/1.4865269

Kreuzberger, D., Kühl, N., & Hirschl, S. (2023). Machine learning operations (MLOps): Overview, definition, and architecture. *IEEE Access*, 11, 31866–31879.

Lenatti, M., Moreno-Sánchez, P. A., Polo, E. M., Mollura, M., Barbieri, R., & Paglialonga, A. (2022). Evaluation of machine learning algorithms and explainability techniques to detect hearing loss from a speech-in-noise screening test. *American Journal of Audiology*, 31(3S), 961–979.

Martínez-Plumed, F., Contreras-Ochando, L., Ferri, C., Hernández-Orallo, J., Kull, M., Lachiche, N., Ramírez-Quintana, M. J., & Flach, P. (2021). CRISP-DM twenty years later: From data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*, 33(8), 3048–3061. https://doi.org/10.1109/TKDE.2019.2962680

North, D. (2006). Introducing BDD. *Better Software Magazine*.

Picaut, J., Can, A., Fortin, N., Ardouin, J., & Lagrange, M. (2020). Low-cost sensors for urban noise monitoring networks: A literature review. *Sensors*, 20(8), 2256. https://doi.org/10.3390/s20082256

Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534. https://doi.org/10.1016/j.procs.2021.01.199

Shearer, C. (2000). The CRISP-DM model: The new blueprint for data mining. *Journal of Data Warehousing*, 5(4), 13–22.

Smart, J. F. (2014). *BDD in action: Behavior-driven development for the whole software lifecycle*. Manning Publications.

Solis, C., & Wang, X. (2011). A study of the characteristics of behaviour driven development. *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*, IEEE, 383–387. https://doi.org/10.1109/SEAA.2011.76

Vlaming, M. S. M. G., MacKinnon, R. C., Jansen, M., & Moore, D. R. (2014). Automated screening for high-frequency hearing loss by an app on iOS devices. *International Journal of Audiology*, 53(8), 564–572.

Wirth, R., & Hipp, J. (2000). CRISP-DM: Towards a standard process model for data mining. *Proceedings of the 4th International Conference on the Practical Applications of Knowledge Discovery and Data Mining*, 29–39.

---

## Anexos

- **Anexo A.** Plan de pruebas detallado (ver `docs/plan-de-pruebas.md`).
- **Anexo B.** Escenarios Gherkin (ver `docs/features/`).
- **Anexo C.** Reporte completo de SonarCloud (capturas y notas vigentes).
- **Anexo D.** Análisis de complejidad ciclomática (ver `docs/complejidad-ciclomatica.md`).
- **Anexo E.** Repositorio público: https://github.com/hatWHITE-UwU/hearguard-ai
