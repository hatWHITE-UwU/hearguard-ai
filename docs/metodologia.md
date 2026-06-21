# Metodología del proyecto HearGuard AI

**Autor:** Equipo HearGuard AI — Universidad Continental
**Versión:** 2.0
**Última actualización:** mayo 2026

---

## Resumen

El desarrollo de HearGuard AI se sustenta en **dos metodologías complementarias** aplicadas a dos componentes diferenciados del sistema:

- **Metodología principal:** **TDD + BDD** (*Test-Driven Development* y *Behavior-Driven Development*) para el ciclo de vida del software, incluyendo backend REST, frontend Angular, aplicación móvil Flutter y firmware IoT.
- **Metodología complementaria:** **CRISP-DM** (*Cross-Industry Standard Process for Data Mining*) para la construcción del modelo de inteligencia artificial que predice el riesgo auditivo del usuario.

Esta combinación se eligió porque cada metodología tiene un dominio en el que es ampliamente aceptada en la literatura científica y porque permite trazabilidad explícita entre requisitos, código, pruebas y modelo predictivo.

---

## 1. Metodología principal — TDD + BDD

### 1.1 Justificación

**Test-Driven Development (TDD)**, formalizado por Beck (2003), establece un ciclo iterativo de tres pasos —*red, green, refactor*— en el que primero se escribe una prueba que falla, luego el código mínimo que la satisface y, finalmente, se refactoriza preservando el comportamiento. Diversos estudios empíricos reportan mejoras consistentes en la calidad interna y externa del software, así como reducción significativa de defectos en producción (Janzen & Saiedian, 2005; Bissi, Neto & Emer, 2016).

**Behavior-Driven Development (BDD)**, propuesto por North (2006) y formalizado por Smart (2014), extiende TDD desplazando el foco hacia el **comportamiento esperado del sistema** desde la perspectiva del usuario. Los escenarios se redactan en lenguaje natural estructurado (Gherkin) con la forma `Dado/Cuando/Entonces`, lo que permite que stakeholders no técnicos participen en la definición de los criterios de aceptación (Solis & Wang, 2011).

Para HearGuard AI se eligió la combinación TDD + BDD como metodología **principal** porque:

- El sistema involucra **múltiples capas heterogéneas** (web, móvil, API REST, IoT) y requiere una red de pruebas automatizadas que valide tanto unidades aisladas como la integración entre ellas.
- Los **requisitos funcionales** —registro de usuario, monitoreo de ruido, prueba auditiva, predicción de riesgo, alertas IoT— se expresan naturalmente como escenarios de comportamiento.
- Existe una restricción académica de **trazabilidad**: cada historia de usuario debe poder vincularse a un escenario BDD y a una prueba ejecutable.
- La cobertura objetiva de pruebas es la **principal evidencia de calidad** del proyecto, medible mediante herramientas estándar (Jest, pytest, Vitest, SonarCloud).

### 1.2 Ciclo de desarrollo aplicado

El ciclo TDD + BDD se ejecutó en cada historia de usuario siguiendo cinco pasos:

1. Redacción del **escenario Gherkin** en `docs/features/*.feature` con el patrón `Dado/Cuando/Entonces`.
2. Traducción del escenario en una **prueba unitaria o de integración** que falla inicialmente (*red*).
3. Implementación del **código mínimo necesario** para que la prueba pase (*green*).
4. **Refactorización** preservando el comportamiento.
5. **Verificación automática** en el pipeline de CI (GitHub Actions) y análisis estático en SonarCloud.

### 1.3 Cobertura de pruebas en el repositorio

| Capa | Framework de pruebas | Carpeta | N.° de casos automatizados |
|------|----------------------|---------|----------------------------|
| Backend Node.js / Express | Jest + Supertest | `backend/tests/` | 230 |
| Servicio de IA Flask | pytest | `ai-service/tests/` | 30 |
| Frontend Angular | Vitest | `frontend/src/app/**/*.spec.ts` | 107 |
| Aplicación móvil Flutter | flutter_test | `flutter_app/test/` | 42 |
| End-to-End multiplataforma | Playwright | `e2e/tests/` | 36 |
| BDD Gherkin | Cucumber.js | `bdd/` + `docs/features/` | 85 |
| **Total** | | | **530** |

La cobertura mínima exigida por el pipeline de CI es del **60 % de líneas** tanto en el backend (verificado con un script Node que parsea `coverage/lcov.info`) como en el servicio de IA (`pytest --cov-fail-under=60`). El reporte de Jest en local supera el 80 % de líneas en el backend; el reporte oficial es validado por SonarCloud en cada push. El plan de pruebas detallado, con identificadores únicos por caso (`CP-B-01`, `CP-AI-02`, etc.), precondiciones, pasos y resultados esperados, se encuentra en `docs/plan-de-pruebas.md`.

### 1.4 Escenarios BDD en Gherkin

Se redactaron seis archivos `.feature` en `docs/features/`, uno por cada módulo funcional del sistema:

| Archivo | Módulo cubierto |
|---------|-----------------|
| `autenticacion.feature` | Registro, login, refresh, logout, perfil |
| `monitoreo-ruido.feature` | Lecturas en tiempo real y estadísticas (hoy/semana) |
| `prueba-auditiva.feature` | Cuestionario auditivo de 6 frecuencias |
| `prediccion-riesgo-ia.feature` | Invocación al servicio Flask y respuestas |
| `dispositivos-iot.feature` | Registro de dispositivos y autenticación por `X-Device-Key` |
| `resultados-y-recomendaciones.feature` | Generación de recomendaciones personalizadas |

Cada escenario sigue la misma estructura, lo que permite trazabilidad directa con los casos de prueba del plan:

```gherkin
Característica: Autenticación de usuarios

  Escenario: Registro exitoso con datos válidos
    Dado que el usuario no está registrado
    Cuando envía un POST a /api/auth/register con nombre, email y contraseña válidos
    Entonces recibe un código 201
    Y la respuesta contiene un accessToken y un refreshToken
```

### 1.5 Pruebas de caja negra y caja blanca

| Enfoque | Aplicación en HearGuard | Evidencia |
|---------|--------------------------|-----------|
| **Caja negra** | API REST verificada por entrada/salida HTTP sin conocer la implementación. Endpoints Flask verificados con `test_api.py`. Pruebas E2E que recorren la app web desplegada en Vercel desde la perspectiva del usuario. Pruebas BDD de aceptación. | `backend/tests/*.test.js` (Jest + Supertest), `ai-service/tests/test_api.py`, `e2e/tests/*.spec.ts` (Playwright), `docs/features/*.feature` |
| **Caja blanca** | Lógica interna de servicios, guards, interceptores, predictor de IA y *mappers* móviles. | `ai-service/tests/test_predictor.py`, `frontend/**/*.spec.ts`, `flutter_app/test/` |

### 1.6 Integración continua

Las pruebas se ejecutan automáticamente en cada *push* a las ramas `main` y `develop`, y en cada *pull request*, mediante GitHub Actions (`.github/workflows/ci.yml`). El pipeline incluye seis jobs principales:

1. **backend** — `npm run lint` + Jest con MongoDB 7 como servicio, umbral mínimo del 60 % de cobertura.
2. **ai-service** — Entrenamiento reproducible del modelo (`python -m model.trainer` con `SEED=42`) + pytest con `--cov-fail-under=60`.
3. **frontend** — `npm run lint` + Vitest en Chromium (vía Playwright) + `npm run build` de Angular.
4. **e2e** — Pruebas Playwright contra el despliegue real del frontend en Vercel; se ejecutan en `main` y en cada *pull request*, generando un reporte HTML como artefacto.
5. **flutter** — `flutter analyze` + `flutter test --coverage`.
6. **deploy** — Solo en `main`: hooks de despliegue a Render (backend e IA) y Vercel (frontend), encadenado a la aprobación de los jobs anteriores.

El análisis estático con **SonarCloud** se ejecuta de forma **automática mediante el GitHub App** ("SonarCloud Automatic Analysis"), por lo que no requiere un job dedicado en el workflow: cada push a `main` dispara el escaneo y publica el resultado en el *quality gate* de la organización `hatwhite-uwu` (proyecto `hatWHITE-UwU_hearguard-ai`).

Esta automatización implementa los principios de *continuous testing* y *continuous delivery* descritos por Humble y Farley (2010), añadiendo además pruebas E2E sobre el entorno de producción del frontend, lo que aporta evidencia directa de comportamiento del sistema integrado.

### 1.7 Resultados obtenidos

- **530 casos de prueba automatizados** en seis capas (230 backend, 30 servicio de IA, 107 frontend, 42 móvil, 36 E2E, 85 BDD), todos en estado pasante.
- Cobertura mínima de líneas exigida por CI: **60 %** en backend y servicio de IA; cobertura del backend verificada en CI al 100 % mediante análisis lcov.
- Pipeline de CI/CD con **diez jobs** en GitHub Actions (`backend`, `ai-service`, `frontend`, `bdd`, `e2e`, `flutter`, `sonarcloud`, `k6-smoke`, `lighthouse`, `deploy`).
- Análisis estático automatizado con **SonarCloud** (Quality Gate aprobado, Rating A en Seguridad, Fiabilidad y Mantenibilidad, 0 issues, 0 % duplicación).
- **Seis archivos de escenarios BDD** en `docs/features/`, ejecutados automáticamente con Cucumber.js en el job `bdd` del pipeline CI.
- Plan de pruebas formal documentado en `docs/plan-de-pruebas.md`.

### 1.8 Referencias citadas

- Beck, K. (2003). *Test-driven development: By example*. Boston: Addison-Wesley.
- Bissi, W., Neto, A. G. S. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. *Information and Software Technology*, 74, 45–54. https://doi.org/10.1016/j.infsof.2016.02.004
- Humble, J., & Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley.
- Janzen, D., & Saiedian, H. (2005). Test-driven development: Concepts, taxonomy, and future direction. *Computer*, 38(9), 43–50. https://doi.org/10.1109/MC.2005.314
- North, D. (2006). Introducing BDD. *Better Software Magazine*.
- Smart, J. F. (2014). *BDD in action: Behavior-driven development for the whole software lifecycle*. Manning Publications.
- Solis, C., & Wang, X. (2011). A study of the characteristics of behaviour driven development. *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*, IEEE, 383–387. https://doi.org/10.1109/SEAA.2011.76

---

## 2. Metodología complementaria — CRISP-DM

### 2.1 Justificación

CRISP-DM (*Cross-Industry Standard Process for Data Mining*) fue formalizado por Shearer (2000) y Wirth & Hipp (2000) como un proceso estándar para proyectos de minería de datos. Una revisión sistemática reciente confirmó que CRISP-DM continúa siendo, dos décadas después, el proceso más utilizado en proyectos de ciencia de datos en producción (Schröer, Kruse & Gómez, 2021; Martínez-Plumed et al., 2021).

Se aplicó como metodología **complementaria** —y no principal— porque el componente de inteligencia artificial es solo una parte del sistema y se despliega como microservicio independiente. Sin embargo, el rigor metodológico que aporta resulta indispensable para garantizar reproducibilidad y trazabilidad del modelo predictivo.

### 2.2 Aplicación en el proyecto

Cada fase de CRISP-DM se mapea a archivos del repositorio:

| Fase CRISP-DM | Actividad realizada | Trazabilidad |
|---------------|---------------------|--------------|
| 1. Comprensión del negocio | Definición del problema: predicción temprana del riesgo auditivo. | `README.md`, `Document/RoadmapTecnico/Fase_4_ServicioIA.md` |
| 2. Comprensión de los datos | Identificación de variables: edad, horas de auriculares, volumen, exposición a ruido, hábitos, puntajes del cuestionario auditivo. | `Document/RoadmapTecnico/Fase_4_ServicioIA.md`, esquema `Evaluation` en `backend/src/models/` |
| 3. Preparación de los datos | Construcción del vector de 8 *features*, normalización, manejo de valores faltantes. | `ai-service/model/features.py`, `ai-service/model/constants.py` |
| 4. Modelado | Entrenamiento de *Random Forest* (Breiman, 2001) con scikit-learn. | `ai-service/model/trainer.py` |
| 5. Evaluación | Validación holdout (R² ≥ 0.8), pruebas con perfiles de riesgo bajo/alto, robustez frente a datos faltantes. | `ai-service/tests/test_predictor.py` |
| 6. Despliegue | Exposición como microservicio REST en Flask, integración con el backend Node.js, despliegue en Render. | `ai-service/app.py`, `ai-service/model/predictor.py`, `render.yaml` |

### 2.3 Métricas reportadas

- R² holdout del modelo entrenado: ≥ 0.80.
- Score de riesgo acotado en [0, 100], mapeado a cuatro niveles: *Bajo*, *Moderado*, *Alto*, *Muy Alto*.
- Robustez ante entrada vacía verificada en `test_missing_data_safe`.

### 2.4 Referencias citadas

- Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324
- Martínez-Plumed, F., Contreras-Ochando, L., Ferri, C., Hernández-Orallo, J., Kull, M., Lachiche, N., Ramírez-Quintana, M. J., & Flach, P. (2021). CRISP-DM twenty years later: From data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*, 33(8), 3048–3061. https://doi.org/10.1109/TKDE.2019.2962680
- Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534. https://doi.org/10.1016/j.procs.2021.01.199
- Shearer, C. (2000). The CRISP-DM model: The new blueprint for data mining. *Journal of Data Warehousing*, 5(4), 13–22.
- Wirth, R., & Hipp, J. (2000). CRISP-DM: Towards a standard process model for data mining. *Proceedings of the 4th International Conference on the Practical Applications of Knowledge Discovery and Data Mining*, 29–39.

---

## 3. Articulación de las dos metodologías

La siguiente tabla resume cómo conviven ambas metodologías sin solaparse:

| Dimensión | TDD + BDD (principal) | CRISP-DM (complementaria) |
|-----------|------------------------|---------------------------|
| Componente del sistema | Software (web, móvil, API, IoT) | Modelo de IA (`ai-service/`) |
| Unidad de trabajo | Historia de usuario / escenario Gherkin | Iteración de modelado |
| Salida principal | Código + pruebas + escenarios | Modelo entrenado + métricas |
| Validación | Cobertura, SonarCloud, pipeline CI | R² holdout, pruebas de perfil |
| Ciclo de vida | *Red → Green → Refactor* | Seis fases iterativas |

Ambas se integran en el pipeline de CI/CD: el job `ai-service` entrena el modelo y ejecuta pytest antes de que el job `deploy` publique el servicio en Render, lo que garantiza que ninguna versión del modelo llegue a producción sin haber superado tanto las fases 4 y 5 de CRISP-DM como la red de pruebas TDD/BDD.

---

## 4. Limitaciones y trabajo futuro

- **Escenarios BDD con pasos pendientes.** Los 85 escenarios Gherkin se ejecutan automáticamente con Cucumber.js en el job `bdd` del pipeline CI; sin embargo, los escenarios que requieren navegador (Angular UI), hardware físico (ESP32) o el microservicio Flask activo permanecen en estado *pending* en sus step definitions (`frontend.steps.js`, `ai.steps.js`). Una mejora directa es levantar los servicios necesarios en CI para cubrir esos pasos.
- **Dataset clínico real.** El modelo se entrena con datos sintéticos basados en heurísticas médicas; incorporar un dataset clínico con consentimiento informado fortalecería la fase 2 de CRISP-DM.
- **MLOps.** La fase 6 (despliegue) puede extenderse con reentrenamiento continuo y monitoreo de *data drift* (Kreuzberger, Kühl & Hirschl, 2023).

---

## 5. Referencias completas

Beck, K. (2003). *Test-driven development: By example*. Boston: Addison-Wesley.

Bissi, W., Neto, A. G. S. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. *Information and Software Technology*, 74, 45–54.

Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32.

Humble, J., & Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley.

Janzen, D., & Saiedian, H. (2005). Test-driven development: Concepts, taxonomy, and future direction. *Computer*, 38(9), 43–50.

Kreuzberger, D., Kühl, N., & Hirschl, S. (2023). Machine learning operations (MLOps): Overview, definition, and architecture. *IEEE Access*, 11, 31866–31879.

Martínez-Plumed, F., Contreras-Ochando, L., Ferri, C., Hernández-Orallo, J., Kull, M., Lachiche, N., Ramírez-Quintana, M. J., & Flach, P. (2021). CRISP-DM twenty years later: From data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*, 33(8), 3048–3061.

North, D. (2006). Introducing BDD. *Better Software Magazine*.

Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534.

Shearer, C. (2000). The CRISP-DM model: The new blueprint for data mining. *Journal of Data Warehousing*, 5(4), 13–22.

Smart, J. F. (2014). *BDD in action: Behavior-driven development for the whole software lifecycle*. Manning Publications.

Solis, C., & Wang, X. (2011). A study of the characteristics of behaviour driven development. *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*, IEEE, 383–387.

Wirth, R., & Hipp, J. (2000). CRISP-DM: Towards a standard process model for data mining. *Proceedings of the 4th International Conference on the Practical Applications of Knowledge Discovery and Data Mining*, 29–39.

---

## 6. Estructura de la Memoria Descriptiva de Software

La Memoria Descriptiva de Software de HearGuard AI v1.0 (`docs/memoria-descriptiva-hearguard-ai.md`) es el documento técnico elaborado para el registro de propiedad intelectual del sistema. Su estructura sigue el esquema formal de 13 capítulos descrito a continuación:

---

**Tabla de Contenido — Memoria Descriptiva HearGuard AI v1.0**

Resumen Ejecutivo

**Capítulo I — Información General del Software**
1.1 Nombre del Software
1.2 Versión
1.3 Institución Titular
1.4 Autores
1.5 Asesor Académico
1.6 Objetivo General
1.7 Objetivos Específicos
1.8 Alcance
1.9 Restricciones
1.10 Usuarios Objetivo

**Capítulo II — Contexto y Problemática del Sector**
2.1 Situación Actual de la Salud Auditiva Preventiva
2.2 Problemática del Usuario Individual
2.3 Los Procesos Aislados y su Fragmentación
2.3.1 La Medición de Ruido sin Continuidad
2.3.2 La Evaluación Auditiva sin Integración
2.3.3 La Ausencia de Predicción Personalizada
2.4 Análisis Causal de la Problemática
2.4.1 Causas Tecnológicas
2.4.2 Causas Metodológicas
2.4.3 Causas de Acceso
2.5 Consecuencias de la Problemática
2.6 Justificación del Proyecto
2.6.1 Justificación Técnica
2.6.2 Justificación Social
2.6.3 Justificación Académica
2.6.4 Justificación Metodológica

**Capítulo III — Descripción General del Software**
3.1 Qué es HearGuard AI
3.2 Qué Problemas Resuelve
3.3 Qué Automatiza
3.4 Qué No Automatiza
3.5 Beneficios
3.6 Ventajas Competitivas
3.7 Casos de Uso

**Capítulo IV — Arquitectura Empresarial**
4.1 Arquitectura de Negocio
4.1.1 Procesos Estratégicos
4.1.2 Procesos Principales
4.1.3 Procesos de Apoyo
4.2 Arquitectura de Datos
4.3 Arquitectura de Aplicaciones
4.4 Arquitectura Tecnológica

**Capítulo V — Arquitectura de Software**
5.1 Arquitectura Cliente-Servidor
5.2 Arquitectura de Microservicios
5.3 Patrón API First
5.4 Modelo de Arquitectura C4
5.5 Componentes del Sistema
5.5.1 Frontend Web — Angular 21
5.5.2 Aplicación Móvil — Flutter 3
5.5.3 Backend API — Node.js 20 + Express 5
5.5.4 Microservicio de IA — Python 3.11 + Flask
5.5.5 Base de Datos — MongoDB Atlas
5.5.6 Firmware IoT — ESP32 + KY-037
5.5.7 Contenerización — Docker
5.6 Interfaces de Programación Externas

**Capítulo VI — Funcionalidades del Sistema**
6.1 Autenticación y Gestión de Sesión
6.2 Gestión de Perfil de Usuario
6.3 Gestión de Sesiones de Monitoreo
6.4 Módulo de Monitoreo de Ruido en Tiempo Real
6.5 Módulo de Evaluación Auditiva
6.6 Motor de Inteligencia Artificial — Predicción de Riesgo
6.7 Módulo de Recomendaciones Preventivas
6.8 Dashboard de Salud Auditiva
6.9 Gestión de Dispositivos IoT
6.10 Documentación y Especificación de la API REST

**Capítulo VII — Modelo de Datos**
7.1 Arquitectura de Persistencia
7.2 Modelo de Colecciones (NoSQL Documental)
7.3 Entidades del Modelo
7.4 Diccionario de Datos
7.5 Relaciones entre Entidades
7.6 Integridad y Consistencia
7.7 Trazabilidad de la Información

**Capítulo VIII — Inteligencia Artificial y Modelo Predictivo**
8.1 Fundamentos Científicos
8.2 Metodología CRISP-DM Aplicada
8.3 Construcción del Dataset Sintético
8.4 Variables del Modelo
8.5 Hiperparámetros del Modelo Random Forest
8.6 Flujo de Procesamiento de la Inteligencia Artificial
8.7 Predicción del Nivel de Riesgo Auditivo
8.8 Generación de Recomendaciones Preventivas
8.9 Intervención Humana en el Ciclo (Human-in-the-Loop)
8.10 Validación del Modelo
8.11 Limitaciones del Enfoque
8.12 Confiabilidad y Mitigación de Errores

**Capítulo IX — Seguridad Informática**
9.1 Marco de Referencia OWASP
9.2 Autenticación mediante Tokens JWT
9.3 Control de Acceso Basado en Roles (RBAC)
9.4 Control de Acceso y Protección de los Datos
9.5 Auditoría y Registro (Logs)
9.6 Respaldo y Recuperación
9.7 Protección de Datos de Salud del Usuario
9.8 Seguridad de las Interfaces de Programación

**Capítulo X — Calidad del Software**
10.1 Modelo de Calidad ISO/IEC 25010
10.2 Procesos de Prueba ISO/IEC/IEEE 29119
10.3 Calidad Funcional
10.4 Rendimiento
10.5 Mantenibilidad
10.6 Seguridad como Característica de Calidad
10.7 Pruebas Unitarias e Integración (TDD)
10.8 Pruebas de Comportamiento (BDD — Gherkin/Cucumber.js)
10.9 Pruebas de Aceptación End-to-End (Playwright)

**Capítulo XI — Innovación y Originalidad**
11.1 Aportes Tecnológicos
11.2 Innovación en el Sector de la Salud Digital
11.3 Comparación con Aplicaciones de Medición de Ruido
11.4 Comparación con Plataformas de Audiometría Clínica
11.5 Comparación con Soluciones de Salud Ocupacional
11.6 Ventajas Competitivas
11.7 Elementos Originales del Software

**Capítulo XII — Resultados Obtenidos**
12.1 Reducción de la Brecha de Acceso Preventivo
12.2 Precisión del Modelo Predictivo
12.3 Trazabilidad Metodológica
12.4 Productividad del Proceso de Desarrollo
12.5 Calidad Demostrada del Software
12.6 Beneficios para el Usuario Final

**Capítulo XIII — Evolución Futura**
13.1 Integración con Wearables y Dispositivos Clínicos
13.2 Dataset Clínico Real y Reentrenamiento del Modelo (MLOps)
13.3 Módulo de Audiometría Tonal Automática
13.4 Inteligencia Artificial Predictiva de Series Temporales
13.5 Expansión a Gestión Grupal y Salud Ocupacional

Conclusiones

Referencias Bibliográficas

Anexos Propuestos
— Anexo A: Diagramas de Arquitectura
— Anexo B: Diagramas UML
— Anexo C: Modelo de Procesos de Negocio (BPMN)
— Anexo D: Modelo de Datos
— Anexo E: Capturas de Pantalla del Sistema
— Anexo F: Reportes de Calidad (SonarCloud, k6, Lighthouse, Cucumber, Playwright)
— Anexo G: Manual de Usuario
