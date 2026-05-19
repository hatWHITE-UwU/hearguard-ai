# HearGuard AI: Plataforma de salud auditiva preventiva basada en TDD/BDD e integrada con un modelo de Random Forest desarrollado bajo CRISP-DM

> Plantilla de artículo lista para llenar. Las secciones con `[…]` son las que aún hay que completar con texto narrativo; el resto ya contiene contenido extraído del proyecto y solo requiere revisión final.

---

## Información de los autores

- **Autor(es):** [Nombre completo del estudiante / equipo]
- **Asesor(es):** [Nombre del docente asesor]
- **Institución:** Universidad Continental — Escuela Académico Profesional de Ingeniería de Sistemas
- **Correo de contacto:** [correo institucional]
- **Año:** 2026

---

## Resumen

HearGuard AI es una plataforma de salud auditiva preventiva que monitorea la exposición al ruido en tiempo real, ejecuta una prueba auditiva por cuestionario y predice el nivel de riesgo del usuario mediante un modelo de aprendizaje automático. El sistema se compone de una API REST en Node.js/Express, una aplicación web en Angular, una aplicación móvil en Flutter, un microservicio Python/Flask con un clasificador Random Forest y un firmware IoT para ESP32. El desarrollo se realizó aplicando **Test-Driven Development y Behavior-Driven Development** como metodología principal, complementada con **CRISP-DM** para la construcción del modelo predictivo. Como resultados, se reportan aproximadamente 139 casos de prueba automatizados con una cobertura de líneas del backend cercana al 84 %, un modelo con R² holdout ≥ 0.80 y un pipeline completo de integración y despliegue continuo basado en GitHub Actions, SonarCloud, Render y Vercel.

**Palabras clave:** salud auditiva, IoT, Random Forest, TDD, BDD, CRISP-DM, ingeniería de software, machine learning.

---

## 1. Introducción

[Plantear el problema: la pérdida auditiva inducida por ruido es una de las principales causas de discapacidad sensorial en jóvenes y adultos jóvenes. Citar estadísticas de la OMS sobre exposición prolongada a niveles superiores a 85 dB. Justificar por qué una intervención preventiva basada en monitoreo + autoevaluación + predicción de riesgo aporta valor frente a la consulta médica reactiva.]

[Cerrar con el objetivo del trabajo y la pregunta de investigación: ¿es posible construir una plataforma multiplataforma (web, móvil, IoT) que estime el riesgo auditivo del usuario a partir de variables auto-reportadas y mediciones de ruido, aplicando metodologías formales de ingeniería de software y minería de datos?]

---

## 2. Trabajos relacionados

[Hacer una breve revisión de:
- Apps de monitoreo de ruido (Decibel X, NIOSH SLM, Sound Meter Pro): qué miden y qué no.
- Trabajos académicos sobre detección de pérdida auditiva con ML (modelos clásicos y redes neuronales).
- Aplicaciones IoT en salud preventiva.
- Vacío identificado: pocas soluciones integran monitoreo, cuestionario y predicción en una sola plataforma con rigor metodológico documentado.]

---

## 3. Metodología

### 3.1 Metodología principal: TDD + BDD

[Resumir en 3–4 párrafos el contenido de `docs/metodologia.md` § 1. Incluir:
- Definición de TDD (Beck, 2003) y BDD (North, 2006).
- Por qué se eligió esta combinación para HearGuard.
- Ciclo de cinco pasos aplicado (escenario Gherkin → prueba → código → refactor → CI).
- Aplicación a las cuatro capas del software (tabla de cobertura).
- Mención de los seis archivos `.feature` en `docs/features/`.
- Caja negra (Supertest) y caja blanca (servicios, guards, mappers).]

### 3.2 Metodología complementaria: CRISP-DM

[Resumir en 2–3 párrafos el contenido de `docs/metodologia.md` § 2. Incluir:
- Definición y referencia a Shearer (2000) y Schröer (2021).
- Justificación de aplicarla solo al módulo de IA.
- Tabla de las seis fases con trazabilidad a archivos del repositorio.]

### 3.3 Articulación de ambas metodologías

[Explicar cómo coexisten sin solaparse: TDD/BDD para el ciclo de software; CRISP-DM para el ciclo del modelo. Mencionar que el pipeline CI/CD (job `ai-service`) ejecuta tanto el entrenamiento (fase 4 CRISP-DM) como las pruebas (TDD) antes del despliegue (fase 6 CRISP-DM).]

---

## 4. Arquitectura del sistema

[Insertar el diagrama de arquitectura del `README.md` o una versión equivalente en Mermaid.]

**Capas del sistema:**

- **Clientes:** Angular (web), Flutter (móvil), ESP32 (IoT).
- **Backend:** API REST en Node.js/Express 5 con autenticación JWT (access 15 min + refresh 7 días). Endpoints organizados en `/api/auth`, `/api/noise`, `/api/evaluations`, `/api/devices`.
- **Persistencia:** MongoDB Atlas (colecciones `users`, `noiseRecords`, `evaluations`, `riskResults`, `devices`).
- **Servicio de IA:** Microservicio Flask con un modelo Random Forest (scikit-learn) servido en `/api/predict-risk` y `/api/generate-recommendations`.
- **IoT:** firmware ESP32 con sensor KY-037 que envía lecturas vía HTTP autenticado con `X-Device-Key`.
- **Infraestructura:** Docker Compose para entorno local; GitHub Actions, Render y Vercel para producción.

---

## 5. Implementación

### 5.1 Modelo de datos

[Describir las colecciones principales:
- `User` (email, password bcrypt, settings).
- `NoiseRecord` (dbLevel, source, deviceId, riskTag, highRisk, timestamp).
- `Evaluation` (frequencyScores, habitData, riskResult).
- `RiskResult` (riskScore, riskLevel, topFactors, recommendations).
- `Device` (apiKey, type, hardwareId, firmwareVersion).]

### 5.2 Modelo de Machine Learning

- **Algoritmo:** Random Forest Classifier (Breiman, 2001) implementado en scikit-learn.
- **Features (8):** `age`, `headphoneHours`, `volumeLevel`, `noiseExposure`, `occupationRisk`, `smoking`, `avgTestScore`, `lowFreqScore`.
- **Salida:** `riskScore` ∈ [0, 100] y `riskLevel` ∈ {Bajo, Moderado, Alto, Muy Alto}.
- **Entrenamiento:** `ai-service/model/trainer.py`.
- **Inferencia:** `ai-service/model/predictor.py`.

### 5.3 Integración continua y despliegue

- **CI:** `.github/workflows/ci.yml` con seis jobs (backend, ai-service, frontend, flutter, sonar, deploy).
- **Análisis estático:** SonarCloud (proyecto `hatWHITE-UwU_hearguard-ai`).
- **Despliegue:** Render para backend e IA, Vercel para el frontend.

---

## 6. Validación y resultados

### 6.1 Resultados de las pruebas automatizadas

| Capa | Herramienta | Casos | Estado |
|------|-------------|-------|--------|
| Backend | Jest + Supertest | 72 | Pasan |
| Servicio IA | pytest | 7 | Pasan |
| Frontend | Vitest | 18 | Pasan |
| Móvil | flutter_test | 42 | Pasan |
| **Total** | | **~139** | **Pasan** |

**Cobertura del backend (líneas):** ≈ 84 %.

### 6.2 Resultados del modelo de IA

- **R² holdout:** ≥ 0.80 (validado por `test_model_loaded`).
- **Robustez ante entrada vacía:** verificada por `test_missing_data_safe`.
- **Clasificación correcta** de perfiles representativos de riesgo alto y bajo.

### 6.3 Métricas de SonarCloud

[Insertar capturas con las notas finales del proyecto en SonarCloud. Reportar:
- Seguridad: [nota final].
- Fiabilidad: [nota final].
- Mantenibilidad: [nota final].
- Duplicación de código: [%].
- Security Hotspots revisados: [%].]

### 6.4 Trazabilidad escenario BDD ↔ prueba automatizada

[Incluir una tabla con 4–5 escenarios `.feature` y su prueba correspondiente en `tests/`. Por ejemplo:
- `autenticacion.feature: Registro exitoso` ↔ `auth.test.js: 'crea usuario y retorna 201 con tokens'`.
- `dispositivos-iot.feature: Lectura IoT válida` ↔ `noise.test.js: 'guarda registro con X-Device-Key válido'`.]

---

## 7. Discusión

[Comentar:
- Cómo TDD/BDD permitió detectar regresiones tempranas durante el desarrollo.
- Qué aportó CRISP-DM al rigor del modelo y a la reproducibilidad del entrenamiento.
- Comparación con apps existentes: HearGuard integra monitoreo + cuestionario + IA en una sola plataforma.
- Cómo la trazabilidad escenario → prueba → código facilita el mantenimiento futuro.]

---

## 8. Limitaciones

- **Dataset sintético.** El modelo se entrena con datos generados por heurísticas, no clínicos.
- **Escenarios BDD no automatizados.** Los `.feature` documentan comportamiento pero aún no se ejecutan con Cucumber.
- **Calibración del micrófono.** El mapeo dB del ESP32 es aproximado y requiere un sonómetro de referencia para uso clínico.

---

## 9. Conclusiones

[Cerrar respondiendo la pregunta de investigación. Resumir:
- Se construyó una plataforma multiplataforma funcional con 139 pruebas automatizadas.
- La combinación TDD/BDD + CRISP-DM resultó adecuada para gestionar la heterogeneidad del sistema (software + IA + IoT).
- Las métricas obtenidas (cobertura ≈ 84 %, R² ≥ 0.80, nota A en SonarCloud) respaldan la calidad técnica del producto.]

### Trabajo futuro

- Automatizar los escenarios BDD con Cucumber/SpecFlow.
- Reentrenar el modelo con datos clínicos reales.
- Incorporar prácticas de MLOps (Kreuzberger, Kühl & Hirschl, 2023): reentrenamiento continuo y monitoreo de *data drift*.
- Calibración del sensor de ruido con instrumento de referencia.

---

## Agradecimientos

[Asesor, universidad, colaboradores.]

---

## Referencias

(Formato APA; el orden y el formato pueden cambiarse a IEEE numerado si la revista lo exige.)

Beck, K. (2003). *Test-driven development: By example*. Boston: Addison-Wesley.

Bissi, W., Neto, A. G. S. S., & Emer, M. C. F. P. (2016). The effects of test driven development on internal quality, external quality and productivity: A systematic review. *Information and Software Technology*, 74, 45–54. https://doi.org/10.1016/j.infsof.2016.02.004

Breiman, L. (2001). Random forests. *Machine Learning*, 45(1), 5–32. https://doi.org/10.1023/A:1010933404324

Humble, J., & Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Boston: Addison-Wesley.

Janzen, D., & Saiedian, H. (2005). Test-driven development: Concepts, taxonomy, and future direction. *Computer*, 38(9), 43–50. https://doi.org/10.1109/MC.2005.314

Kreuzberger, D., Kühl, N., & Hirschl, S. (2023). Machine learning operations (MLOps): Overview, definition, and architecture. *IEEE Access*, 11, 31866–31879.

Martínez-Plumed, F., Contreras-Ochando, L., Ferri, C., Hernández-Orallo, J., Kull, M., Lachiche, N., Ramírez-Quintana, M. J., & Flach, P. (2021). CRISP-DM twenty years later: From data mining processes to data science trajectories. *IEEE Transactions on Knowledge and Data Engineering*, 33(8), 3048–3061. https://doi.org/10.1109/TKDE.2019.2962680

North, D. (2006). Introducing BDD. *Better Software Magazine*.

Schröer, C., Kruse, F., & Gómez, J. M. (2021). A systematic literature review on applying CRISP-DM process model. *Procedia Computer Science*, 181, 526–534. https://doi.org/10.1016/j.procs.2021.01.199

Shearer, C. (2000). The CRISP-DM model: The new blueprint for data mining. *Journal of Data Warehousing*, 5(4), 13–22.

Smart, J. F. (2014). *BDD in action: Behavior-driven development for the whole software lifecycle*. Manning Publications.

Solis, C., & Wang, X. (2011). A study of the characteristics of behaviour driven development. *Proceedings of the 37th EUROMICRO Conference on Software Engineering and Advanced Applications*, IEEE, 383–387. https://doi.org/10.1109/SEAA.2011.76

Wirth, R., & Hipp, J. (2000). CRISP-DM: Towards a standard process model for data mining. *Proceedings of the 4th International Conference on the Practical Applications of Knowledge Discovery and Data Mining*, 29–39.

---

## Anexos sugeridos

- **Anexo A.** Plan de pruebas detallado (ver `docs/plan-de-pruebas.md`).
- **Anexo B.** Escenarios Gherkin (ver `docs/features/`).
- **Anexo C.** Reporte completo de SonarCloud.
- **Anexo D.** Diagrama de complejidad ciclomática (ver `docs/complejidad-ciclomatica.md`).
- **Anexo E.** Repositorio público: https://github.com/hatWHITE-UwU/hearguard-ai
