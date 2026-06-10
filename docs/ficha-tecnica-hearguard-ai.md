# FICHA TÉCNICA DEL SOFTWARE

---

## HearGuard AI
### Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma

**Universidad Continental — Ingeniería de Sistemas e Informática** | **v1.0**

---

## 1. Título del Software

| Campo | Valor |
|-------|-------|
| **Nombre del sistema** | HearGuard AI |
| **Nombre completo** | Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva mediante Monitoreo IoT, Machine Learning y Plataforma Multiplataforma en la Universidad Continental |
| **Autores** | Luis Francisco Terreros Hinojosa · Hardy Eduardo Rondinel Aquino |
| **Institución** | Universidad Continental — Escuela Académico Profesional de Ingeniería de Sistemas e Informática |
| **Versión** | v1.0 |
| **Metodología de desarrollo** | TDD + BDD (principal) · CRISP-DM (modelo de IA) |

### Descripción de la denominación

El término **"HearGuard"** identifica la propuesta de valor del sistema: la protección activa (*Guard*) de la salud auditiva (*Hear*) del usuario mediante tecnología preventiva. El sistema actúa como guardián inteligente del sentido del oído, monitoreando continuamente la exposición al ruido y alertando ante niveles de riesgo.

El componente **"AI"** (*Artificial Intelligence*) evidencia que el sistema incorpora un modelo de Machine Learning basado en el algoritmo **Random Forest** —construido bajo la metodología **CRISP-DM**— para predecir el nivel de riesgo de pérdida auditiva de cada usuario a partir de su historial de exposición y datos audiológicos.

La versión **v1.0** corresponde a la primera versión funcional completa del sistema, desarrollada mediante un enfoque orientado a pruebas (**TDD + BDD**), integrando tecnologías de monitoreo IoT, procesamiento en la nube, análisis estático de código y despliegue automatizado.

HearGuard AI constituye una plataforma tecnológica de salud auditiva preventiva (*HealthTech*) orientada a la detección temprana del deterioro auditivo, permitiendo al usuario conocer su nivel de exposición al ruido en tiempo real, realizar pruebas auditivas digitales y recibir predicciones personalizadas de riesgo respaldadas por inteligencia artificial.

---

## 2. Lenguajes y Tecnologías de Programación Utilizados

El desarrollo de HearGuard AI se fundamenta en una arquitectura multiplataforma moderna, basada en tecnologías web, móvil, IoT, computación en la nube e inteligencia artificial.

| Tecnología | Componente | Responsabilidades principales |
|------------|------------|-------------------------------|
| **Frontend Web** | Angular 21 + TypeScript + Signals API + SCSS | • Construcción de la interfaz de usuario web responsive<br>• Componentización standalone y reutilizable<br>• Monitoreo de ruido en tiempo real (interval polling)<br>• Dashboard de salud auditiva y estadísticas<br>• Consumo de APIs REST con interceptor JWT |
| **App Móvil** | Flutter 3 + Dart + Provider + Dio | • Aplicación nativa multiplataforma (Android / iOS)<br>• Captura de decibelios mediante micrófono del dispositivo<br>• Visualización de historial auditivo<br>• Flujo de prueba auditiva interactiva<br>• Integración con Backend API mediante Dio |
| **Backend API** | Node.js 20 + Express 5 + Mongoose 9 (JavaScript) | • Gestión de reglas de negocio y seguridad<br>• API REST: autenticación, ruido, evaluaciones, dispositivos IoT<br>• Orquestación del microservicio de IA<br>• Generación de recomendaciones personalizadas<br>• Middleware JWT, validación express-validator |
| **Microservicio IA/ML** | Python 3.11 + Flask + scikit-learn | • Modelo Random Forest para predicción de riesgo auditivo<br>• Endpoint `POST /api/predict-risk`<br>• Endpoint `POST /api/recommend`<br>• Construcción bajo metodología CRISP-DM<br>• Serialización del modelo en `risk_model.pkl` |
| **Base de Datos** | MongoDB Atlas M0 (NoSQL, cloud AWS São Paulo) | • Colecciones: `users`, `noiseRecords`, `evaluations`, `riskResults`, `devices`<br>• Soft delete (`isDeleted + deletedAt`) — sin DELETE físico<br>• Índices para consultas de historial paginado<br>• Conexión cifrada con TLS desde backend |
| **Autenticación** | JWT + bcrypt (salt=12) | • Access token (15 min) + Refresh token (7 días)<br>• Rotación SHA-256 en cada refresh<br>• Hash de contraseñas con bcrypt salt=12<br>• Secrets en variables de entorno (128 hex chars) |
| **IoT** | ESP32 + KY-037 + puente serial Node.js | • Sensor de sonido KY-037 conectado al microcontrolador ESP32<br>• Firmware Arduino para captura y envío de datos<br>• Puente serial Node.js (`serial_bridge.js`) como interfaz<br>• Autenticación mediante header `X-Device-Key`<br>• Endpoint dedicado `POST /api/noise/iot` |
| **Infraestructura** | Docker + Docker Compose | • Contenerización de todos los servicios<br>• Despliegue reproducible en un solo comando (`npm run docker:up`)<br>• Aislamiento: backend (3000), AI service (5001), frontend (8080)<br>• Imagen pública en GitHub Container Registry (GHCR) |
| **CI/CD** | GitHub Actions + Render + Vercel | • Pipeline automático: test, análisis, build, deploy<br>• Jobs: backend, ai-service, frontend, e2e, flutter, sonarcloud, deploy<br>• Deploy backend + AI en Render, frontend en Vercel |
| **Calidad Estática** | SonarCloud | • Quality Gate: **Aprobado**<br>• Security / Reliability / Maintainability: **Rating A**<br>• Cobertura consolidada: **100 %** · Duplicación: **0 %** · Issues: **0**<br>• Análisis multi-lenguaje (JavaScript, TypeScript, Python) |
| **Control de Versiones** | Git + GitHub + Conventional Commits + Husky | • Gestión de cambios y trazabilidad por fase<br>• Commits semánticos: `feat/fix/test/docs/refactor`<br>• Pre-commit hooks con Husky para validación automática |

---

## 3. Funcionalidad Principal

HearGuard AI es una plataforma de salud auditiva preventiva (*HealthTech*) diseñada para detectar, monitorear y predecir el riesgo de pérdida auditiva mediante la integración de monitoreo IoT en tiempo real, inteligencia artificial y una experiencia multiplataforma accesible desde web y dispositivos móviles.

El sistema gestiona de forma integral el flujo de trabajo que inicia con el registro del usuario y culmina con la emisión de un diagnóstico de riesgo auditivo personalizado respaldado por un modelo de Machine Learning, acompañado de recomendaciones preventivas.

### Capacidades del sistema

- ✅ Registro y autenticación segura de usuarios (JWT + bcrypt)
- ✅ Monitoreo de exposición al ruido en tiempo real (web y móvil)
- ✅ Integración con dispositivos IoT (ESP32 + sensor KY-037)
- ✅ Prueba auditiva digital por cuestionario
- ✅ Predicción de riesgo auditivo mediante Random Forest (IA)
- ✅ Historial cronológico de exposición al ruido
- ✅ Dashboard de salud auditiva con estadísticas personalizadas
- ✅ Generación de recomendaciones preventivas personalizadas
- ✅ Gestión de dispositivos IoT por usuario
- ✅ Aplicación móvil nativa Flutter (Android / iOS)
- ✅ API REST documentada con Swagger UI
- ✅ Modo demostración público (`publicDemo`)
- ✅ Exportación de datos de historial y evaluaciones

El software está orientado principalmente a usuarios individuales preocupados por su salud auditiva y constituye una herramienta de apoyo para profesionales de la salud ocupacional y preventiva.

---

## 4. Fecha de Creación y Ciclo de Desarrollo

HearGuard AI fue concebido como una iniciativa de innovación tecnológica orientada a la transformación digital de la salud preventiva auditiva en el contexto universitario de la Universidad Continental, Perú.

La primera versión funcional corresponde a la versión **v1.0**, desarrollada mediante un proceso iterativo basado en las metodologías **TDD + BDD** para el software y **CRISP-DM** para el modelo de Machine Learning.

### Ciclo de desarrollo

- ✅ Levantamiento de requisitos (60 RF + 10 RNF con criterios BDD)
- ✅ Redacción de escenarios Gherkin por módulo (`docs/features/*.feature`)
- ✅ Diseño arquitectónico del software (multiplataforma, microservicios)
- ✅ Construcción del modelo de IA (CRISP-DM: comprensión → datos → modelado → evaluación)
- ✅ Desarrollo backend REST (Node.js / Express 5)
- ✅ Desarrollo frontend web (Angular 21)
- ✅ Desarrollo aplicación móvil (Flutter 3)
- ✅ Firmware IoT (ESP32 + KY-037)
- ✅ Microservicio de inteligencia artificial (Flask + scikit-learn)
- ✅ Integración continua (GitHub Actions + SonarCloud)
- ✅ Pruebas automatizadas (507 casos en 6 capas + 3 escenarios k6 + 85 escenarios BDD Gherkin)
- ✅ Análisis de calidad estática (SonarCloud — Quality Gate Aprobado)
- ✅ Documentación técnica y académica (IEEE 829, BDD Gherkin, matriz de trazabilidad)

---

## 5. Arquitectura del Sistema

HearGuard AI implementa una arquitectura de **microservicios desacoplados** orientada a la escalabilidad, mantenibilidad y separación de responsabilidades entre el núcleo de negocio, el modelo de inteligencia artificial y los clientes multiplataforma.

### Capas de la arquitectura

| Capa | Tecnología | Responsabilidades |
|------|------------|-------------------|
| **Presentación Web** | Angular 21 + TypeScript + SCSS | Interfaz de usuario web, dashboard, monitoreo en tiempo real, prueba auditiva, historial, gestión de dispositivos |
| **Presentación Móvil** | Flutter 3 + Dart | App nativa multiplataforma, captura de audio mediante micrófono, visualización de riesgo y recomendaciones |
| **Presentación IoT** | ESP32 + Arduino + KY-037 | Captura física de decibelios ambientales, envío periódico al backend con autenticación por `X-Device-Key` |
| **Servicios / Backend** | Node.js 20 + Express 5 + Mongoose | Reglas de negocio, autenticación JWT, validación, orquestación del servicio IA, API REST completa |
| **Inteligencia Artificial** | Python 3.11 + Flask + scikit-learn | Predicción de riesgo auditivo (Random Forest), recomendaciones adaptativas, health check |
| **Persistencia** | MongoDB Atlas M0 | Almacenamiento NoSQL en la nube de usuarios, registros de ruido, evaluaciones, resultados y dispositivos |
| **Infraestructura** | Docker · GitHub Actions · Render · Vercel | Contenerización, CI/CD automatizado, deploy en producción |

### Flujo general del sistema

```
1. Usuario          2. Monitoreo         3. Prueba          4. IA / ML
   (web / móvil)  →    Ruido IoT      →    Auditiva      →   Predicción
                      (ESP32 + API)      (cuestionario)     (RandomForest)
                            ↓                                     ↓
8. Historial         7. Dashboard    ←   6. Recomendaciones ←  5. Riesgo
   Auditivo          Salud Auditiva       Preventivas          Personalizado
```

### Suite de pruebas automatizadas

| Capa | Framework | Casos automatizados |
|------|-----------|---------------------|
| Backend Node.js / Express | Jest + Supertest | 207 |
| Frontend Angular | Vitest | 107 |
| Servicio IA Flask | pytest | 30 |
| App Móvil Flutter | flutter_test | 42 |
| End-to-End | Playwright | 36 |
| Escenarios BDD Gherkin | Cucumber.js | 85 |
| Carga y rendimiento | k6 | 3 escenarios |
| **Total** | | **507 casos + 3 escenarios k6** |

La arquitectura permite incorporar nuevos módulos (p. ej. audiometría clínica, integración con wearables) sin afectar el funcionamiento del sistema principal, garantizando escalabilidad a largo plazo.

---

## 6. Observaciones Finales

La presente ficha técnica constituye una descripción integral del software **HearGuard AI v1.0** y tiene como finalidad documentar sus características técnicas, funcionales y tecnológicas para fines de protección de propiedad intelectual, transferencia tecnológica y registro académico ante la **Universidad Continental, Perú**.

El software representa una solución innovadora aplicada al sector de la salud preventiva (*HealthTech*), integrando tecnologías emergentes como monitoreo IoT en tiempo real, modelos de Machine Learning (Random Forest bajo CRISP-DM), desarrollo multiplataforma (web Angular + móvil Flutter) y aseguramiento de calidad automatizado (TDD + BDD + SonarCloud) en una única plataforma de trabajo.

Su objetivo principal es democratizar el acceso a herramientas de prevención auditiva, permitiendo a cualquier usuario conocer y gestionar su riesgo de pérdida auditiva antes de que el daño sea irreversible, contribuyendo así a la transformación digital de la salud pública auditiva y fortaleciendo la formación en ingeniería de software de calidad en la Universidad Continental.

El sistema alcanzó un **Quality Gate aprobado en SonarCloud** con **100 % de cobertura de pruebas**, **Rating A en Seguridad, Confiabilidad y Mantenibilidad**, **0 issues abiertas** y **0 % de duplicación de código**, sobre un total de **13 000+ líneas de código** en cuatro lenguajes de programación.

---

*HearGuard AI v1.0 · Universidad Continental, Perú · TDD + BDD + CRISP-DM*

---

&nbsp;

___

**Luis Francisco Terreros Hinojosa**
Autor — Ingeniero de Sistemas e Informática
Universidad Continental, Perú

&nbsp;

**Hardy Eduardo Rondinel Aquino**
Autor — Ingeniero de Sistemas e Informática
Universidad Continental, Perú
