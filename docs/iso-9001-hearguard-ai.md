# SISTEMA DE GESTIÓN DE CALIDAD
## HearGuard AI v1.0 — Conforme a ISO 9001:2015

---

**Institución:** Universidad Continental
**Escuela:** Ingeniería de Sistemas e Informática
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión:** 1.0 · Junio 2026

---

## 1. POLÍTICA DE CALIDAD

HearGuard AI se compromete a desarrollar y mantener una plataforma de salud auditiva preventiva que satisfaga los requisitos funcionales y no funcionales definidos por sus usuarios, cumpla con los estándares internacionales de calidad de software (ISO/IEC 25010, ISO/IEC 29119, ISO 9001) y mejore continuamente sus procesos de desarrollo mediante metodologías formales (TDD + BDD + CRISP-DM), integración continua y análisis estático automatizado.

**Principios que guían la política de calidad:**

| Principio ISO 9001 | Aplicación en HearGuard AI |
|---|---|
| Enfoque al cliente | Los 60 RF y 10 RNF se definen desde la perspectiva del usuario final (monitoreo, evaluación, predicción de riesgo auditivo) |
| Liderazgo | Los autores asumen la responsabilidad de la arquitectura, el cumplimiento de la cobertura de pruebas y la calidad del código entregado |
| Compromiso de las personas | Ambos integrantes participan en el ciclo TDD: escribir prueba → implementar → refactorizar |
| Enfoque a procesos | El pipeline de CI/CD de 10 jobs garantiza que cada cambio supere las pruebas antes de llegar a producción |
| Mejora continua | SonarCloud detecta desviaciones de calidad en cada commit; el circuit breaker y el retry mejoran la resiliencia en cada iteración |
| Toma de decisiones basada en evidencia | Las métricas de SonarCloud, k6 y Lighthouse CI orientan las decisiones de refactorización |
| Gestión de las relaciones | La integración MongoDB Atlas, Render, Vercel y ESP32 se gestiona mediante contratos de API documentados en OpenAPI 3.1 |

---

## 2. OBJETIVOS DE CALIDAD

| N.° | Objetivo | Indicador | Meta | Evidencia |
|:---:|---|---|---|---|
| OC-01 | Cobertura de pruebas del backend | % líneas cubiertas (lcov) | 100 % | `backend/coverage/lcov.info` · job `backend` CI |
| OC-02 | Cobertura del servicio de IA | % líneas cubiertas (pytest-cov) | ≥ 60 % | `ai-service/coverage.xml` · job `ai-service` CI |
| OC-03 | Calidad estática del código | SonarCloud Quality Gate | Aprobado (Rating A × 3) | SonarCloud dashboard |
| OC-04 | Latencia de la API bajo carga | p95 de `http_req_duration` (k6) | < 2 000 ms | Reporte k6 HTML |
| OC-05 | Tasa de errores bajo carga | `http_req_failed` (k6) | < 5 % | Reporte k6 HTML |
| OC-06 | Accesibilidad del frontend | Lighthouse Accessibility score | ≥ 90 % | Reporte Lighthouse CI |
| OC-07 | Trazabilidad requisito → prueba | RF con escenario BDD y test asociado | 100 % RF-01 a RF-06 | `docs/matriz-trazabilidad.md` |
| OC-08 | Cero vulnerabilidades críticas | `npm audit --audit-level=high` | 0 high/critical | Job `backend` CI |
| OC-09 | Precisión del modelo predictivo | R² holdout del Random Forest | ≥ 0.80 | `ai-service/model/saved/model_metadata.json` |
| OC-10 | Usabilidad percibida | Puntaje SUS promedio (usuarios reales) | ≥ 70 / 100 | `docs/cuestionario-sus-hearguard-ai.md` |

---

## 3. ALCANCE DEL SGC

El Sistema de Gestión de Calidad aplica al ciclo de vida completo del software HearGuard AI v1.0, desde la definición de requisitos hasta el despliegue en producción, incluyendo:

- Desarrollo del backend API REST (Node.js 20 / Express 5)
- Desarrollo del microservicio de IA (Python 3.11 / Flask / scikit-learn)
- Desarrollo del frontend web (Angular 21)
- Desarrollo de la aplicación móvil (Flutter 3)
- Firmware IoT (ESP32 + KY-037)
- Infraestructura y despliegue (Docker, Render, Vercel, MongoDB Atlas)
- Documentación técnica y académica

**Exclusiones justificadas:** El SGC no aplica a la calibración clínica del sensor KY-037 (dispositivo de grado educativo, no médico) ni a la validación clínica de los resultados del modelo predictivo (fuera del alcance académico).

---

## 4. MAPA DE PROCESOS

### 4.1 Procesos estratégicos

| Proceso | Responsable | Entrada | Salida |
|---|---|---|---|
| Definición de requisitos | Autores + Asesor | Problemática del sector auditivo | 60 RF + 10 RNF documentados |
| Planificación de la calidad | Autores | Requisitos | Objetivos de calidad OC-01 a OC-10 |
| Revisión por el asesor | Maglioni Arana Caparachín | Avance del proyecto | Observaciones y validaciones |

### 4.2 Procesos principales

| Proceso | Metodología | Herramientas | Evidencia |
|---|---|---|---|
| Desarrollo TDD | Red → Green → Refactor | Jest, pytest, Vitest, flutter_test | 530 casos de prueba |
| Especificación BDD | Gherkin Dado/Cuando/Entonces | Cucumber.js | 6 archivos `.feature`, 85 escenarios |
| Modelado CRISP-DM | 6 fases iterativas | scikit-learn, joblib | `ai-service/model/` |
| Integración continua | Commit → CI → Deploy | GitHub Actions | `.github/workflows/ci.yml` (10 jobs) |
| Análisis estático | Cada push a `main` | SonarCloud | Quality Gate aprobado |

### 4.3 Procesos de apoyo

| Proceso | Herramienta | Frecuencia |
|---|---|---|
| Control de versiones | Git + GitHub (Conventional Commits) | Cada cambio |
| Gestión de dependencias | npm, pip | Cada PR |
| Auditoría de seguridad | `npm audit`, SonarCloud Security | Cada push |
| Monitoreo de rendimiento | k6, Lighthouse CI | Cada push a `main` |
| Monitoreo de recursos | `GET /metrics` (process.memoryUsage) | En tiempo real |

---

## 5. CONTROL DE DOCUMENTOS

| Documento | Ubicación | Versión | Estado |
|---|---|---|---|
| Especificación de requisitos | `docs/matriz-trazabilidad.md` | 1.0 | Vigente |
| Plan de pruebas (IEEE 829) | `docs/plan-de-pruebas.md` | 1.0 | Vigente |
| Especificación API (OpenAPI 3.1) | `docs/api-spec.yml` | 1.0 | Vigente |
| Metodología TDD+BDD+CRISP-DM | `docs/metodologia.md` | 2.1 | Vigente |
| Memoria Descriptiva | `docs/memoria-descriptiva-hearguard-ai.md` | 1.0 | Vigente |
| Manual de usuario | `docs/manual-usuario-hearguard-ai.md` | 1.0 | Vigente |
| Manual de instalación | `docs/manual-instalacion.md` | 1.0 | Vigente |
| Ficha de observación | `docs/ficha-observacion-hearguard-ai.md` | 1.0 | Vigente |
| Cuestionario SUS | `docs/cuestionario-sus-hearguard-ai.md` | 1.0 | Vigente |
| Matriz de registro | `docs/matriz-registro-hearguard.xlsx` | 3.0 | Vigente |

---

## 6. GESTIÓN DE RIESGOS DE CALIDAD

| ID | Riesgo | Probabilidad | Impacto | Mitigación implementada |
|:---:|---|:---:|:---:|---|
| RQ-01 | Degradación de la cobertura de pruebas | Media | Alto | Umbral mínimo 60 % en CI; falla el build si no se cumple |
| RQ-02 | Regresión funcional no detectada | Baja | Alto | 530 tests + pipeline CI obligatorio antes del despliegue |
| RQ-03 | Fallo del microservicio Flask | Media | Medio | Retry backoff (3 intentos) + circuit breaker (umbral 5 fallos) |
| RQ-04 | Vulnerabilidad en dependencias npm | Media | Alto | `npm audit --audit-level=high` en cada push; 0 high/critical |
| RQ-05 | Desviación de la precisión del modelo | Baja | Medio | Test `test_model_loaded` verifica R² ≥ 0.80 en cada entrenamiento |
| RQ-06 | Inconsistencia entre documentación y código | Media | Medio | Conventional Commits + revisión del asesor por versión |

---

## 7. MEJORA CONTINUA

El proceso de mejora continua sigue el ciclo **PDCA (Planificar → Hacer → Verificar → Actuar)**:

| Fase | Actividad | Frecuencia |
|---|---|---|
| **Planificar** | Definir escenarios BDD y casos de prueba antes de implementar | Antes de cada funcionalidad |
| **Hacer** | Implementar el código mínimo que satisfaga las pruebas (TDD green) | Durante el desarrollo |
| **Verificar** | Ejecutar el pipeline CI completo (10 jobs) y revisar métricas SonarCloud | Cada push a `main` |
| **Actuar** | Refactorizar el código para eliminar code smells y reducir complejidad ciclomática | Tras cada verificación |

---

*HearGuard AI v1.0 · Universidad Continental · ISO 9001:2015 · Junio 2026*
