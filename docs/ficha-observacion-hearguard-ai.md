# FICHA DE OBSERVACIÓN
## Instrumento de Recolección de Datos — HearGuard AI v1.0

---

**Institución:** Universidad Continental
**Escuela:** Ingeniería de Sistemas e Informática
**Investigadores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Período:** 2026-I

---

### I. DATOS GENERALES DE LA OBSERVACIÓN

| Campo | Detalle |
|---|---|
| Nombre del sistema observado | HearGuard AI v1.0 |
| Tipo de observación | Directa — estructurada |
| Unidad de observación | Plataforma de salud auditiva preventiva (web + móvil + IoT) |
| Entorno de observación | Producción: Render (backend/IA) + Vercel (frontend) + MongoDB Atlas |
| Fecha de observación | \_\_\_\_\_ / \_\_\_\_\_ / 2026 |
| Hora de inicio | \_\_\_\_\_ : \_\_\_\_\_ |
| Hora de cierre | \_\_\_\_\_ : \_\_\_\_\_ |
| Observador | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| N.° de sesión | \_\_\_\_ |

---

### II. OBJETIVO

Registrar de manera sistemática y verificable el comportamiento funcional, el rendimiento y la calidad del sistema HearGuard AI v1.0 durante su ejecución en el entorno de producción, a fin de contrastar los resultados observados con los requisitos funcionales (RF-01 al RF-06) y los requisitos no funcionales (RNF-01 al RNF-10) definidos en la especificación del sistema.

---

### III. ESCALA DE VALORACIÓN

| Valor | Símbolo | Descripción |
|:---:|:---:|---|
| 3 | ✅ | Cumple completamente — el comportamiento observado coincide con el esperado |
| 2 | ⚠️ | Cumple parcialmente — el comportamiento presenta desviaciones menores |
| 1 | ❌ | No cumple — el comportamiento no corresponde al esperado |
| — | — | No observado durante la sesión |

---

### IV. MÓDULO 1 — AUTENTICACIÓN Y GESTIÓN DE SESIÓN (RF-01)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 1.1 | Registro de nuevo usuario | HTTP 201 + par access/refresh token | ___ | |
| 1.2 | Login con credenciales válidas | HTTP 200 + access token (15 min) + refresh token (7 d) | ___ | |
| 1.3 | Login con credenciales inválidas | HTTP 401 sin revelar si falla email o contraseña | ___ | |
| 1.4 | Renovación de token (refresh) | Nuevo par de tokens emitido; token anterior revocado | ___ | |
| 1.5 | Acceso a ruta protegida sin token | HTTP 401 — Unauthorized | ___ | |
| 1.6 | Logout | Refresh token revocado en base de datos | ___ | |
| 1.7 | Consulta de perfil autenticado | HTTP 200 + datos sin campo `password` | ___ | |

**Subtotal RF-01:** \_\_\_\_ / 21

---

### V. MÓDULO 2 — MONITOREO DE RUIDO EN TIEMPO REAL (RF-02)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 2.1 | Activación del micrófono (web) | El navegador solicita permiso y el gauge muestra nivel en dB | ___ | |
| 2.2 | Clasificación en tiempo real | < 55 dB → Bajo · 55–75 → Moderado · 75–90 → Alto · > 90 → Muy Alto | ___ | |
| 2.3 | Registro de lectura en backend | `POST /api/noise` → HTTP 201 + documento almacenado | ___ | |
| 2.4 | Estadísticas del día | `GET /api/noise/stats/today` → promedio y máximo del día | ___ | |
| 2.5 | Estadísticas semanales | `GET /api/noise/stats/week` → distribución por nivel | ___ | |
| 2.6 | Historial de lecturas | `GET /api/noise` → lista paginada ordenada por fecha | ___ | |
| 2.7 | Lectura desde dispositivo IoT | `POST /api/noise/iot` con header `X-Device-Key` → HTTP 201 | ___ | |

**Subtotal RF-02:** \_\_\_\_ / 21

---

### VI. MÓDULO 3 — EVALUACIÓN AUDITIVA (RF-03)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 3.1 | Inicio del cuestionario | 12 pasos presentados (6 frecuencias × 2 oídos) | ___ | |
| 3.2 | Registro de puntajes por frecuencia | Puntaje 0–10 aceptado por cada paso | ___ | |
| 3.3 | Cálculo del puntaje promedio | `avgTestScore` = media de los 12 puntajes | ___ | |
| 3.4 | Cálculo de puntaje frecuencias bajas | `lowFreqScore` = media de 250 Hz + 500 Hz | ___ | |
| 3.5 | Almacenamiento de evaluación | `POST /api/evaluations` → HTTP 201 + vector de 8 características | ___ | |
| 3.6 | Consulta de historial de evaluaciones | `GET /api/evaluations` → lista ordenada por fecha | ___ | |

**Subtotal RF-03:** \_\_\_\_ / 18

---

### VII. MÓDULO 4 — PREDICCIÓN DE RIESGO CON IA (RF-04)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 4.1 | Invocación al microservicio Flask | El backend llama a `POST /api/predict-risk` tras completar evaluación | ___ | |
| 4.2 | Respuesta del microservicio | JSON con `riskScore` (0–100), `riskLevel`, `topFactors`, `yearsEstimated` | ___ | |
| 4.3 | Clasificación por nivel de riesgo | 0–25 → Bajo · 26–50 → Moderado · 51–75 → Alto · 76–100 → Muy Alto | ___ | |
| 4.4 | Almacenamiento del resultado | `riskResults` creado y vinculado a la evaluación | ___ | |
| 4.5 | Retry con backoff exponencial | Si Flask falla, el backend reintenta hasta 3 veces (500 ms → 1 000 ms → 2 000 ms) | ___ | |
| 4.6 | Circuit breaker — apertura | Tras 5 fallos consecutivos el circuito se abre y retorna error inmediato sin llamar a Flask | ___ | |
| 4.7 | Circuit breaker — recuperación | Tras 30 s en estado OPEN, el circuito pasa a HALF_OPEN y permite un intento de recuperación | ___ | |
| 4.8 | Endpoint de información del modelo | `GET /api/model-info` → métricas R², MAE, n_estimators | ___ | |

**Subtotal RF-04:** \_\_\_\_ / 24

---

### VIII. MÓDULO 5 — RESULTADOS Y RECOMENDACIONES (RF-05)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 5.1 | Visualización del nivel de riesgo | Badge con color y etiqueta según nivel (Bajo/Moderado/Alto/Muy Alto) | ___ | |
| 5.2 | Presentación de recomendaciones | Lista de recomendaciones adaptadas al nivel de riesgo calculado | ___ | |
| 5.3 | Historial de resultados | `GET /api/evaluations` muestra evolución cronológica del riesgo | ___ | |
| 5.4 | Dashboard integrado | El dashboard muestra nivel actual + historial + dispositivos activos | ___ | |

**Subtotal RF-05:** \_\_\_\_ / 12

---

### IX. MÓDULO 6 — DISPOSITIVOS IoT — ESP32 (RF-06)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| 6.1 | Registro de dispositivo | `POST /api/devices` → HTTP 201 + `deviceKey` en texto plano (única vez) | ___ | |
| 6.2 | Listado de dispositivos del usuario | `GET /api/devices` → lista de dispositivos activos | ___ | |
| 6.3 | Autenticación del ESP32 | Header `X-Device-Key` verificado correctamente | ___ | |
| 6.4 | Rechazo de clave inválida | HTTP 401 si la `deviceKey` no corresponde a ningún dispositivo | ___ | |
| 6.5 | Envío de lectura desde ESP32 | Lectura en dB registrada en `noiseRecords` con `source: "iot"` | ___ | |

**Subtotal RF-06:** \_\_\_\_ / 15

---

### X. REQUISITOS NO FUNCIONALES (RNF)

| N.° | Requisito no funcional | Criterio de verificación | Valor | Resultado medido |
|:---:|---|---|:---:|---|
| RNF-01 | Latencia API p95 < 2 000 ms | k6 threshold `http_req_duration['p(95)'] < 2000` | ___ | \_\_\_\_ ms |
| RNF-02 | Tasa de error < 5 % bajo carga | k6 threshold `http_req_failed < 0.05` | ___ | \_\_\_\_ % |
| RNF-03 | Cobertura backend 100 % | Jest lcov verificado en CI | ___ | \_\_\_\_ % |
| RNF-04 | Cobertura IA ≥ 60 % | pytest `--cov-fail-under=60` | ___ | \_\_\_\_ % |
| RNF-05 | ESLint sin errores | `npm run lint` en CI sin warnings | ___ | |
| RNF-06 | Protección NoSQL injection | `security.test.js` — 22 casos pasantes | ___ | |
| RNF-07 | JWT HS256 / rechazo `alg:none` | `security.test.js` — token manipulado rechazado | ___ | |
| RNF-08 | Rate limiting activo | Peticiones excesivas retornan HTTP 429 | ___ | |
| RNF-09 | SonarCloud Quality Gate OK | Rating A en Seguridad, Fiabilidad y Mantenibilidad | ___ | |
| RNF-10 | Conventional Commits (Husky) | Hook `commit-msg` rechaza mensajes fuera del formato | ___ | |

**Subtotal RNF:** \_\_\_\_ / 30

---

### XI. MÉTRICAS DE RECURSOS (ISO 9126 — Eficiencia)

| N.° | Indicador | Umbral esperado | Valor medido | Cumple |
|:---:|---|---|---|:---:|
| R.1 | Latencia p95 endpoints principales | < 2 000 ms | \_\_\_\_ ms | ___ |
| R.2 | Heap Node.js bajo carga (k6) | p95 < 200 MB | \_\_\_\_ MB | ___ |
| R.3 | RSS proceso bajo carga (k6) | p95 < 350 MB | \_\_\_\_ MB | ___ |
| R.4 | `GET /metrics` disponible | HTTP 200 + campos memory y cpu | ___ | ___ |
| R.5 | Lighthouse Performance | ≥ 80 % | \_\_\_\_ % | ___ |
| R.6 | Lighthouse Accessibility | ≥ 90 % | \_\_\_\_ % | ___ |

**Subtotal Recursos:** \_\_\_\_ / 18

---

### XII. ISO 9126 — USABILIDAD Y DOCUMENTACIÓN

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| U.1 | Manual de usuario disponible | `docs/manual-usuario-hearguard-ai.md` accesible; cubre 17 secciones incluyendo glosario y FAQ | ___ | |
| U.2 | Manual de instalación disponible | `docs/manual-instalacion.md` cubre instalación Docker, manual, producción e intercambiabilidad | ___ | |
| U.3 | Cuestionario SUS preparado | `docs/cuestionario-sus-hearguard-ai.md` listo para aplicar a usuarios reales (10 ítems + 5 complementarios) | ___ | |
| U.4 | Lighthouse Accessibility | Job `lighthouse` en CI reporta Accessibility ≥ 90 % | ___ | \_\_\_\_ % |
| U.5 | Lighthouse Performance | Job `lighthouse` en CI reporta Performance ≥ 80 % | ___ | \_\_\_\_ % |
| U.6 | Memoria Descriptiva completa | `docs/memoria-descriptiva-hearguard-ai.md` contiene 13 capítulos, referencias ISO y anexos | ___ | |

**Subtotal Usabilidad/Docs:** \_\_\_\_ / 18

---

### XIII. APP MÓVIL (Flutter 3)

| N.° | Indicador observado | Comportamiento esperado | Valor | Observaciones |
|:---:|---|---|:---:|---|
| M.1 | Inicio de sesión en Flutter | Autenticación exitosa y redirección al dashboard | ___ | |
| M.2 | Monitor de ruido móvil | Captura de nivel dB mediante micrófono del dispositivo | ___ | |
| M.3 | Evaluación auditiva móvil | Los 12 pasos del cuestionario se presentan correctamente | ___ | |
| M.4 | Visualización del riesgo | Badge de nivel de riesgo y recomendaciones visibles | ___ | |
| M.5 | Sincronización con backend | Datos creados en la app móvil visibles en la web | ___ | |

**Subtotal Móvil:** \_\_\_\_ / 15

---

### XIV. RESUMEN DE PUNTUACIÓN

| Módulo | Indicadores | Puntaje obtenido | Puntaje máximo | % |
|---|:---:|:---:|:---:|:---:|
| RF-01 — Autenticación y sesión | 7 | ___ | 21 | \_\_\_ % |
| RF-02 — Monitoreo de ruido | 7 | ___ | 21 | \_\_\_ % |
| RF-03 — Evaluación auditiva | 6 | ___ | 18 | \_\_\_ % |
| RF-04 — Predicción IA + Resiliencia | 8 | ___ | 24 | \_\_\_ % |
| RF-05 — Resultados y recomendaciones | 4 | ___ | 12 | \_\_\_ % |
| RF-06 — Dispositivos IoT | 5 | ___ | 15 | \_\_\_ % |
| RNF — No funcionales | 10 | ___ | 30 | \_\_\_ % |
| Recursos — Eficiencia (ISO 9126) | 6 | ___ | 18 | \_\_\_ % |
| Usabilidad y Documentación (ISO 9126) | 6 | ___ | 18 | \_\_\_ % |
| App Móvil Flutter | 5 | ___ | 15 | \_\_\_ % |
| **TOTAL** | **64** | **___** | **192** | **\_\_\_ %** |

**Nivel de cumplimiento:**

| Rango | Nivel |
|---|---|
| 173 – 192 (90–100 %) | Excelente |
| 154 – 172 (80–89 %) | Bueno |
| 135 – 153 (70–79 %) | Regular |
| < 135 (< 70 %) | Deficiente |

---

### XV. OBSERVACIONES GENERALES

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

---

### XVI. FIRMAS

|  |  |
|---|---|
| **Observador** | **Asesor** |
| \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ | \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ |
| Terreros Hinojosa, Luis Francisco | Maglioni Arana Caparachín |
| DNI 76926326 | Universidad Continental |

---

*HearGuard AI v1.0 · Universidad Continental · 2026 · Instrumento validado por el asesor académico*
