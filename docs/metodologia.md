# Metodología del proyecto HearGuard AI

**Autor:** Equipo HearGuard AI — Universidad Continental
**Versión:** 1.0
**Última actualización:** mayo 2026

---

## Resumen

El desarrollo de HearGuard AI combinó **dos metodologías complementarias** aplicadas a dos componentes diferenciados del sistema:

1. **TDD + BDD** (*Test-Driven Development* y *Behavior-Driven Development*) para el desarrollo del software: backend REST, frontend Angular, aplicación móvil Flutter y firmware IoT.
2. **CRISP-DM** (*Cross-Industry Standard Process for Data Mining*) para la construcción del modelo de inteligencia artificial que predice el riesgo auditivo del usuario.

Esta combinación se eligió porque cada metodología tiene un dominio en el que es ampliamente aceptada en la literatura científica: TDD/BDD en ingeniería de software y CRISP-DM en proyectos de ciencia de datos y aprendizaje automático.

---

## 1. TDD + BDD — Desarrollo del software

### 1.1 Justificación

**Test-Driven Development (TDD)**, formalizado por Beck (2003), establece un ciclo iterativo de tres pasos —*red, green, refactor*— en el que primero se escribe una prueba que falla, luego el código mínimo que la satisface y, finalmente, se refactoriza. Diversos estudios empíricos reportan mejoras en la calidad interna y externa del software, así como una reducción significativa de defectos en producción (Janzen & Saiedian, 2005; Bissi, Neto & Emer, 2016).

**Behavior-Driven Development (BDD)**, propuesto por North (2006) y formalizado posteriormente por Smart (2014), extiende TDD desplazando el foco hacia el **comportamiento esperado del sistema** desde la perspectiva del usuario. Los escenarios se redactan en lenguaje natural estructurado (Gherkin) con la forma `Dado/Cuando/Entonces`, lo que permite que stakeholders no técnicos participen en la definición de los criterios de aceptación (Solis & Wang, 2011).

Para HearGuard AI se eligió la combinación TDD + BDD porque:

- El sistema involucra **múltiples capas** (web, móvil, API REST, IoT) y necesita una red de pruebas automatizadas que valide la integración entre ellas.
- Los **requisitos funcionales** —registro de usuario, monitoreo de ruido, prueba auditiva, predicción de riesgo, alertas IoT— pueden expresarse claramente como escenarios de comportamiento.
- Existe restricción académica de **trazabilidad**: cada historia de usuario debe poder vincularse a una prueba ejecutable.

### 1.2 Aplicación en el proyecto

El ciclo TDD se siguió en las cuatro capas de software:

| Capa | Framework de pruebas | N.° de casos automatizados |
|------|----------------------|----------------------------|
| Backend Node.js / Express | Jest + Supertest | 72 |
| Servicio de IA Flask | pytest | 7 |
| Frontend Angular | Vitest | 18 |
| Aplicación móvil Flutter | flutter_test | 42 |
| **Total** | | **~139** |

La cobertura de líneas del backend alcanzó **~84 %** según los reportes de Jest, validados con SonarCloud.

Los escenarios BDD se redactaron como archivos `.feature` ubicados en `docs/features/`, uno por cada módulo funcional:

- `autenticacion.feature` — registro, login, refresh, logout, perfil.
- `monitoreo-ruido.feature` — lecturas en tiempo real y estadísticas.
- `prueba-auditiva.feature` — cuestionario auditivo de 12 frecuencias.
- `prediccion-riesgo-ia.feature` — invocación al servicio Flask y respuestas.
- `dispositivos-iot.feature` — registro de dispositivos y autenticación por `X-Device-Key`.
- `resultados-y-recomendaciones.feature` — generación de recomendaciones personalizadas.

El plan de pruebas detallado, con identificadores únicos (`CP-B-01`, `CP-AI-02`, etc.), precondiciones, pasos y resultados esperados, se encuentra en `docs/plan-de-pruebas.md`.

### 1.3 Integración continua

Las pruebas se ejecutan automáticamente en cada *push* a las ramas `main` y `develop`, así como en cada *pull request*, mediante GitHub Actions (`.github/workflows/ci.yml`). El pipeline incluye seis jobs en paralelo o encadenados:

1. **backend** — Jest + MongoDB en servicio.
2. **ai-service** — entrenamiento del modelo + pytest.
3. **frontend** — Vitest + build Angular.
4. **flutter** — `flutter analyze` + `flutter test`.
5. **sonar** — análisis estático SonarCloud.
6. **deploy** — solo en `main`: despliegue automático a Render y Vercel.

Esta automatización implementa el principio de *continuous testing* recomendado por Humble y Farley (2010).

### 1.4 Referencias citadas

- Beck, K. (2003). *Test-driven development: By example*. Boston: Addison-Wesley.
- Bissi, W., Neto, A. G. S. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. *Information and Software Technology*, 74, 45–54. https://doi.org/10.1016/j.infsof.2016.02.004
- Humble, J., & Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley.
- Janzen, D., & Saiedian, H. (2005). Test-driven development: Concepts, taxonomy, and future direction. *Computer*, 38(9), 43–50. https://doi.org/10.1109/MC.2005.314
- North, D. (2006). Introducing BDD. *Better Software Magazine*.
- Smart, J. F. (2014). *BDD in action: Behavior-driven development for the whole software lifecycle*. Manning Publications.
- Solis, C., & Wang, X. (2011). A study of the characteristics of behaviour driven development. *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*, IEEE, 383–387. https://doi.org/10.1109/SEAA.2011.76

---

## 2. CRISP-DM — Modelo de IA

### 2.1 Justificación

CRISP-DM (*Cross-Industry Standard Process for Data Mining*) fue formalizado por Shearer (2000) y Wirth & Hipp (2000) como un proceso estándar e independiente de la industria para proyectos de minería de datos. Una revisión sistemática reciente reportó que CRISP-DM continúa siendo, dos décadas después, el proceso más utilizado en proyectos de ciencia de datos en producción (Schröer, Kruse & Gómez, 2021; Martínez-Plumed et al., 2021).

CRISP-DM organiza el trabajo en **seis fases iterativas**: comprensión del negocio, comprensión de los datos, preparación de los datos, modelado, evaluación y despliegue. Esta iteración entre fases —especialmente entre preparación, modelado y evaluación— es coherente con el enfoque experimental requerido para entrenar y validar un modelo predictivo.

Para HearGuard AI se eligió CRISP-DM porque:

- El componente de IA es **independiente** del software web/móvil y se despliega como un microservicio; un proceso específico de minería de datos resulta más adecuado que un proceso general de ingeniería de software.
- El modelo debe **iterar** entre selección de variables, hiperparámetros y métricas; CRISP-DM contempla explícitamente este ciclo.
- El despliegue como microservicio Flask exige una **fase final estructurada**, también prevista en CRISP-DM.

### 2.2 Aplicación en el proyecto

Cada fase de CRISP-DM se mapea a archivos y artefactos reales del repositorio:

| Fase CRISP-DM | Actividades realizadas | Trazabilidad en el repositorio |
|---------------|------------------------|--------------------------------|
| 1. Comprensión del negocio | Definición del problema: predicción temprana del riesgo auditivo en jóvenes y adultos jóvenes expuestos a ruido y uso prolongado de auriculares. | `README.md` (sección Arquitectura), `Document/RoadmapTecnico/Fase_4_ServicioIA.md` |
| 2. Comprensión de los datos | Variables identificadas: edad, horas de auriculares, volumen, exposición a ruido ocupacional, hábitos (tabaco), puntajes del cuestionario auditivo en 6 frecuencias. | `Document/RoadmapTecnico/Fase_4_ServicioIA.md`, esquema de `Evaluation` en `backend/src/models/` |
| 3. Preparación de los datos | Construcción del vector de características (8 features). Normalización de tipos, manejo de valores faltantes con valores por defecto seguros, cálculo de puntaje promedio y bajas frecuencias. | `ai-service/model/features.py`, `ai-service/model/constants.py` |
| 4. Modelado | Entrenamiento de un clasificador *RandomForest* (Breiman, 2001) implementado en scikit-learn. Generación de un *bundle* serializado con el modelo y métricas de holdout. | `ai-service/model/trainer.py` |
| 5. Evaluación | Validación del modelo con conjunto holdout (R² ≥ 0.8). Pruebas automatizadas con perfiles representativos de riesgo bajo y alto. Verificación de robustez ante datos faltantes. | `ai-service/tests/test_predictor.py` (7 tests, incluyendo `test_high_risk_profile`, `test_low_risk_profile`, `test_missing_data_safe`) |
| 6. Despliegue | Exposición del modelo como microservicio REST Flask con endpoints `/api/predict-risk` y `/api/generate-recommendations`. Integración con el backend Node.js. Despliegue en Render. | `ai-service/app.py`, `ai-service/model/predictor.py`, `render.yaml` |

### 2.3 Iteración y refinamiento

CRISP-DM no es un proceso lineal: la fase de evaluación retroalimenta a la de preparación de datos y modelado. En HearGuard AI esta iteración se evidencia en:

- Ajustes sucesivos en `features.py` (incorporación de `lowFreqScore` y `avgTestScore` calculados a partir del cuestionario auditivo).
- Cambios en las dependencias del entrenador para alcanzar compatibilidad con Render (commits `a009cd2`, `6d75311`, `72f3240`).
- Modificación del umbral `score_to_level` y ampliación de recomendaciones por nivel.

### 2.4 Métricas reportadas

- **R² holdout** del modelo entrenado: ≥ 0.80 (validado por `test_model_loaded`).
- **Score de riesgo** acotado al rango [0, 100] y mapeado a cuatro niveles: *Bajo*, *Moderado*, *Alto*, *Muy Alto*.
- **Robustez ante entrada vacía**: el predictor responde correctamente incluso con un payload sin datos (`test_missing_data_safe`).

### 2.5 Referencias citadas

- Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324
- Martínez-Plumed, F., Contreras-Ochando, L., Ferri, C., Hernández-Orallo, J., Kull, M., Lachiche, N., Ramírez-Quintana, M. J., & Flach, P. (2021). CRISP-DM twenty years later: From data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*, 33(8), 3048–3061. https://doi.org/10.1109/TKDE.2019.2962680
- Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534. https://doi.org/10.1016/j.procs.2021.01.199
- Shearer, C. (2000). The CRISP-DM model: The new blueprint for data mining. *Journal of Data Warehousing*, 5(4), 13–22.
- Wirth, R., & Hipp, J. (2000). CRISP-DM: Towards a standard process model for data mining. *Proceedings of the 4th International Conference on the Practical Applications of Knowledge Discovery and Data Mining*, 29–39.

---

## 3. Articulación de las dos metodologías

La siguiente tabla resume cómo conviven ambas metodologías sin solaparse:

| Dimensión | TDD + BDD | CRISP-DM |
|-----------|-----------|----------|
| Componente del sistema | Software (web, móvil, API, IoT) | Modelo de IA (`ai-service/`) |
| Unidad de trabajo | Historia de usuario / escenario Gherkin | Iteración de modelado |
| Salida principal | Código + pruebas | Modelo entrenado + métricas |
| Validación | Cobertura de pruebas, SonarCloud | R² holdout, pruebas de perfil |
| Ciclo de vida | *Red → Green → Refactor* | Seis fases iterativas |

Ambas se integran en el pipeline de CI/CD descrito en la sección 1.3: el job `ai-service` entrena el modelo y ejecuta pytest antes de que el job `deploy` publique el servicio en Render, lo que garantiza que ninguna versión del modelo llega a producción sin haber pasado por las fases 4 y 5 de CRISP-DM ni por la red de pruebas de TDD.

---

## 4. Limitaciones y trabajo futuro

- **Tamaño del dataset.** El modelo actual se entrena con un conjunto sintético basado en heurísticas médicas; el siguiente paso natural —dentro de la fase 2 de CRISP-DM— es incorporar un dataset clínico real con consentimiento informado.
- **Pruebas de aceptación automatizadas.** Los escenarios Gherkin actualmente están documentados en `.feature`, pero su ejecución automática con Cucumber/SpecFlow se contempla como mejora de la metodología BDD.
- **MLOps.** La fase 6 (despliegue) podría extenderse con reentrenamiento continuo y monitoreo de *data drift*, alineándose con prácticas emergentes de MLOps (Kreuzberger, Kühl & Hirschl, 2023).

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
