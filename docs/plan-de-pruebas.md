# Plan de Pruebas — HearGuard AI v1.0

**Universidad Continental**
**Metodología:** IEEE Std 829-2008 / ISO/IEC 29119-3

---

## 1. Introducción

El presente documento describe el plan de pruebas del software HearGuard AI v1.0, plataforma de salud auditiva preventiva con inteligencia artificial. El objetivo es garantizar que todos los módulos del sistema (backend, frontend web, aplicación móvil, servicio de IA y módulo IoT) funcionen correctamente, de forma segura y con la calidad esperada antes de su puesta en producción.

---

## 2. Alcance de las Pruebas

| Componente | Tecnología | Tipo de prueba |
|---|---|---|
| Backend API REST | Node.js / Express | Unitarias e integración |
| Servicio de IA | Python / Flask / scikit-learn | Unitarias |
| Frontend Web | Angular 21 / TypeScript | Unitarias |
| Aplicación Móvil | Flutter / Dart | Unitarias |
| Módulo IoT | ESP32 / Arduino | Simulación (Wokwi) |

---

## 3. Tipos de Pruebas Aplicadas

### 3.1 Pruebas Unitarias
Verifican el comportamiento individual de funciones y componentes de forma aislada.

### 3.2 Pruebas de Integración
Verifican la interacción entre módulos: backend ↔ MongoDB, frontend ↔ API REST.

### 3.3 Pruebas de Cobertura
Miden el porcentaje de código ejecutado durante las pruebas (lcov, pytest-cov).

### 3.4 Pruebas de Análisis Estático
SonarCloud detecta vulnerabilidades, código duplicado y deuda técnica.

### 3.5 Pruebas de Simulación IoT
Firmware ESP32 probado en simulador Wokwi con potenciómetro como sensor de ruido.

---

## 4. Casos de Prueba Detallados

---

### MÓDULO 1 — Backend: Autenticación y Usuarios

---

#### CP-B-01: Registro de usuario con datos válidos

| Campo | Detalle |
|---|---|
| **ID** | CP-B-01 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- El servidor backend está en ejecución.
- La base de datos MongoDB en memoria está activa.
- El email `test@correo.com` no existe registrado.

**Pasos de ejecución:**
1. Enviar solicitud POST a `/api/auth/register`.
2. Incluir en el cuerpo: `{ "name": "Luis", "email": "test@correo.com", "password": "Segura123!" }`.
3. Verificar el código de respuesta HTTP.
4. Verificar el cuerpo de la respuesta.

**Resultado esperado:**
- Código HTTP: `201 Created`.
- Respuesta: `{ "success": true, "data": { "token": "...", "user": { ... } } }`.
- El usuario queda registrado en la base de datos.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-02: Registro con email duplicado

| Campo | Detalle |
|---|---|
| **ID** | CP-B-02 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- El email `test@correo.com` ya existe en la base de datos.

**Pasos de ejecución:**
1. Enviar solicitud POST a `/api/auth/register`.
2. Incluir el mismo email ya registrado.
3. Verificar el código de respuesta HTTP.

**Resultado esperado:**
- Código HTTP: `409 Conflict`.
- Respuesta: `{ "success": false, "error": "EMAIL_EXISTS", "message": "El email ya está registrado" }`.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-03: Registro con campos faltantes

| Campo | Detalle |
|---|---|
| **ID** | CP-B-03 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Servidor en ejecución.

**Pasos de ejecución:**
1. Enviar POST a `/api/auth/register` sin el campo `password`.
2. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `400 Bad Request`.
- Respuesta con errores de validación por campo faltante.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-04: Login con credenciales correctas

| Campo | Detalle |
|---|---|
| **ID** | CP-B-04 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario registrado con email `test@correo.com` y password `Segura123!`.

**Pasos de ejecución:**
1. Enviar POST a `/api/auth/login`.
2. Incluir: `{ "email": "test@correo.com", "password": "Segura123!" }`.
3. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Respuesta incluye `accessToken` y `refreshToken`.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-05: Login con contraseña incorrecta

| Campo | Detalle |
|---|---|
| **ID** | CP-B-05 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario registrado en la base de datos.

**Pasos de ejecución:**
1. Enviar POST a `/api/auth/login` con password incorrecta.
2. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `401 Unauthorized`.
- Respuesta: `{ "success": false, "error": "INVALID_CREDENTIALS" }`.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-06: Renovación de token con refresh token válido

| Campo | Detalle |
|---|---|
| **ID** | CP-B-06 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario autenticado con refresh token válido.

**Pasos de ejecución:**
1. Enviar POST a `/api/auth/refresh`.
2. Incluir el refresh token en el cuerpo.
3. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Nuevo `accessToken` devuelto en la respuesta.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-07: Acceso a ruta protegida sin token

| Campo | Detalle |
|---|---|
| **ID** | CP-B-07 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna sesión activa.

**Pasos de ejecución:**
1. Enviar GET a `/api/users/me` sin header `Authorization`.
2. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `401 Unauthorized`.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-08: Acceso con token expirado

| Campo | Detalle |
|---|---|
| **ID** | CP-B-08 |
| **Módulo** | Backend — Autenticación |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Token JWT generado con tiempo de expiración ya vencido.

**Pasos de ejecución:**
1. Enviar GET a `/api/users/me` con token expirado en el header.
2. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `401 Unauthorized`.
- Mensaje indicando token inválido o expirado.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-09: Actualización de perfil de usuario

| Campo | Detalle |
|---|---|
| **ID** | CP-B-09 |
| **Módulo** | Backend — Usuarios |
| **Tipo** | Integración |
| **Prioridad** | Media |

**Precondiciones:**
- Usuario autenticado con token válido.

**Pasos de ejecución:**
1. Enviar PUT a `/api/users/me`.
2. Incluir `{ "name": "Luis Actualizado", "city": "Lima" }`.
3. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Datos actualizados reflejados en la respuesta.

**Resultado obtenido:** ✅ PASA

---

#### CP-B-10: Inyección NoSQL en login

| Campo | Detalle |
|---|---|
| **ID** | CP-B-10 |
| **Módulo** | Backend — Seguridad |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |

**Precondiciones:**
- Servidor en ejecución.

**Pasos de ejecución:**
1. Enviar POST a `/api/auth/login`.
2. Incluir: `{ "email": { "$gt": "" }, "password": { "$gt": "" } }`.
3. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `400 Bad Request`.
- Acceso denegado, sin token devuelto.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 2 — Backend: Lecturas de Ruido

---

#### CP-R-01: Registro de lectura de ruido válida

| Campo | Detalle |
|---|---|
| **ID** | CP-R-01 |
| **Módulo** | Backend — Ruido IoT |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Dispositivo IoT registrado con `X-Device-Key` válida.

**Pasos de ejecución:**
1. Enviar POST a `/api/noise/iot`.
2. Incluir header `X-Device-Key: hg_test_key`.
3. Incluir cuerpo: `{ "dbLevel": 72 }`.

**Resultado esperado:**
- Código HTTP: `201 Created`.
- Lectura guardada con timestamp en la base de datos.

**Resultado obtenido:** ✅ PASA

---

#### CP-R-02: Lectura sin X-Device-Key

| Campo | Detalle |
|---|---|
| **ID** | CP-R-02 |
| **Módulo** | Backend — Ruido IoT |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |

**Precondiciones:**
- Servidor en ejecución.

**Pasos de ejecución:**
1. Enviar POST a `/api/noise/iot` sin el header `X-Device-Key`.

**Resultado esperado:**
- Código HTTP: `401 Unauthorized`.

**Resultado obtenido:** ✅ PASA

---

#### CP-R-03: Lectura con nivel mayor a 85 dB

| Campo | Detalle |
|---|---|
| **ID** | CP-R-03 |
| **Módulo** | Backend — Ruido IoT |
| **Tipo** | Funcional |
| **Prioridad** | Alta |

**Precondiciones:**
- Dispositivo registrado con clave válida.

**Pasos de ejecución:**
1. Enviar POST a `/api/noise/iot` con `{ "dbLevel": 90 }`.
2. Verificar la respuesta.

**Resultado esperado:**
- Código HTTP: `201 Created`.
- Respuesta incluye indicador de riesgo alto.

**Resultado obtenido:** ✅ PASA

---

#### CP-R-04: Obtener historial de lecturas del usuario

| Campo | Detalle |
|---|---|
| **ID** | CP-R-04 |
| **Módulo** | Backend — Ruido |
| **Tipo** | Integración |
| **Prioridad** | Media |

**Precondiciones:**
- Usuario autenticado con al menos 3 lecturas registradas.

**Pasos de ejecución:**
1. Enviar GET a `/api/noise` con token JWT válido.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Lista de lecturas ordenadas cronológicamente.

**Resultado obtenido:** ✅ PASA

---

#### CP-R-05: Lectura con valor de dB negativo

| Campo | Detalle |
|---|---|
| **ID** | CP-R-05 |
| **Módulo** | Backend — Ruido |
| **Tipo** | Validación |
| **Prioridad** | Media |

**Precondiciones:**
- Dispositivo registrado.

**Pasos de ejecución:**
1. Enviar POST a `/api/noise/iot` con `{ "dbLevel": -10 }`.

**Resultado esperado:**
- Código HTTP: `400 Bad Request`.
- Error de validación por valor fuera de rango.

**Resultado obtenido:** ✅ PASA

---

#### CP-R-06: Registro de dispositivo IoT nuevo

| Campo | Detalle |
|---|---|
| **ID** | CP-R-06 |
| **Módulo** | Backend — Dispositivos |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario autenticado.

**Pasos de ejecución:**
1. Enviar POST a `/api/devices` con nombre del dispositivo.

**Resultado esperado:**
- Código HTTP: `201 Created`.
- Clave de dispositivo `X-Device-Key` generada y devuelta.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 3 — Backend: Evaluaciones Auditivas

---

#### CP-E-01: Crear evaluación con datos completos

| Campo | Detalle |
|---|---|
| **ID** | CP-E-01 |
| **Módulo** | Backend — Evaluaciones |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario autenticado con token válido.

**Pasos de ejecución:**
1. Enviar POST a `/api/evaluations`.
2. Incluir cuestionario completo con edad, ocupación, hábitos de exposición al ruido.

**Resultado esperado:**
- Código HTTP: `201 Created`.
- Evaluación guardada con ID único devuelto.

**Resultado obtenido:** ✅ PASA

---

#### CP-E-02: Obtener historial de evaluaciones

| Campo | Detalle |
|---|---|
| **ID** | CP-E-02 |
| **Módulo** | Backend — Evaluaciones |
| **Tipo** | Integración |
| **Prioridad** | Media |

**Precondiciones:**
- Usuario con al menos 2 evaluaciones registradas.

**Pasos de ejecución:**
1. Enviar GET a `/api/evaluations` con token válido.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Lista de evaluaciones ordenadas por fecha descendente.

**Resultado obtenido:** ✅ PASA

---

#### CP-E-03: Evaluación sin token de autenticación

| Campo | Detalle |
|---|---|
| **ID** | CP-E-03 |
| **Módulo** | Backend — Evaluaciones |
| **Tipo** | Seguridad |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna sesión activa.

**Pasos de ejecución:**
1. Enviar POST a `/api/evaluations` sin header `Authorization`.

**Resultado esperado:**
- Código HTTP: `401 Unauthorized`.

**Resultado obtenido:** ✅ PASA

---

#### CP-E-04: Evaluación con datos fuera de rango

| Campo | Detalle |
|---|---|
| **ID** | CP-E-04 |
| **Módulo** | Backend — Evaluaciones |
| **Tipo** | Validación |
| **Prioridad** | Media |

**Precondiciones:**
- Usuario autenticado.

**Pasos de ejecución:**
1. Enviar POST a `/api/evaluations` con edad = -5 y horas de exposición = 999.

**Resultado esperado:**
- Código HTTP: `400 Bad Request`.
- Errores de validación por campos fuera de rango.

**Resultado obtenido:** ✅ PASA

---

#### CP-E-05: Eliminación lógica de evaluación (soft delete)

| Campo | Detalle |
|---|---|
| **ID** | CP-E-05 |
| **Módulo** | Backend — Evaluaciones |
| **Tipo** | Funcional |
| **Prioridad** | Media |

**Precondiciones:**
- Evaluación existente con ID conocido.

**Pasos de ejecución:**
1. Enviar DELETE a `/api/evaluations/:id` con token válido.
2. Verificar en la base de datos el campo `isDeleted`.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Campo `isDeleted: true` y `deletedAt` registrado. Registro no eliminado físicamente.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 4 — Servicio de IA

---

#### CP-IA-01: Predicción con perfil de bajo riesgo

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-01 |
| **Módulo** | AI Service |
| **Tipo** | Funcional |
| **Prioridad** | Alta |

**Precondiciones:**
- Servicio Flask en ejecución con modelo cargado.

**Pasos de ejecución:**
1. Enviar POST a `/api/predict-risk`.
2. Incluir perfil: edad 25, sin exposición a ruido, sin antecedentes.

**Resultado esperado:**
- Nivel de riesgo: `"Bajo"`.
- Score numérico menor a 40.

**Resultado obtenido:** ✅ PASA

---

#### CP-IA-02: Predicción con perfil de alto riesgo

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-02 |
| **Módulo** | AI Service |
| **Tipo** | Funcional |
| **Prioridad** | Alta |

**Precondiciones:**
- Modelo cargado correctamente.

**Pasos de ejecución:**
1. Enviar POST a `/api/predict-risk`.
2. Incluir perfil: edad 55, músico, 8 horas diarias de exposición a ruido > 85 dB.

**Resultado esperado:**
- Nivel de riesgo: `"Alto"` o `"Crítico"`.
- Score mayor a 70.

**Resultado obtenido:** ✅ PASA

---

#### CP-IA-03: Predicción con campos faltantes

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-03 |
| **Módulo** | AI Service |
| **Tipo** | Robustez |
| **Prioridad** | Media |

**Precondiciones:**
- Servicio en ejecución.

**Pasos de ejecución:**
1. Enviar POST a `/api/predict-risk` con cuerpo vacío `{}`.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Predicción con valores por defecto aplicados.

**Resultado obtenido:** ✅ PASA

---

#### CP-IA-04: Health check del servicio de IA

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-04 |
| **Módulo** | AI Service |
| **Tipo** | Disponibilidad |
| **Prioridad** | Alta |

**Precondiciones:**
- Servicio Flask desplegado.

**Pasos de ejecución:**
1. Enviar GET a `/health`.

**Resultado esperado:**
- Código HTTP: `200 OK`.
- Respuesta: `{ "status": "ok", "model": "loaded" }`.

**Resultado obtenido:** ✅ PASA

---

#### CP-IA-05: Recomendaciones para nivel Moderado

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-05 |
| **Módulo** | AI Service |
| **Tipo** | Funcional |
| **Prioridad** | Media |

**Precondiciones:**
- Servicio en ejecución.

**Pasos de ejecución:**
1. Enviar POST a `/api/generate-recommendations`.
2. Incluir: `{ "riskLevel": "Moderado" }`.

**Resultado esperado:**
- Lista de al menos 3 recomendaciones personalizadas.

**Resultado obtenido:** ✅ PASA

---

#### CP-IA-06: Verificación del modelo cargado

| Campo | Detalle |
|---|---|
| **ID** | CP-IA-06 |
| **Módulo** | AI Service |
| **Tipo** | Funcional |
| **Prioridad** | Alta |

**Precondiciones:**
- Archivo del modelo `.joblib` presente en el sistema.

**Pasos de ejecución:**
1. Enviar GET a `/api/model-info`.

**Resultado esperado:**
- Tipo de modelo: `RandomForestRegressor`.
- Número de features: `8`.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 5 — Frontend Web (Angular)

---

#### CP-F-01: Guard de autenticación sin sesión activa

| Campo | Detalle |
|---|---|
| **ID** | CP-F-01 |
| **Módulo** | Frontend — Guards |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- No hay token almacenado en el navegador.

**Pasos de ejecución:**
1. Intentar navegar a `/dashboard`.
2. Verificar redirección.

**Resultado esperado:**
- El guard redirige al usuario a `/login`.

**Resultado obtenido:** ✅ PASA

---

#### CP-F-02: Guard con sesión activa

| Campo | Detalle |
|---|---|
| **ID** | CP-F-02 |
| **Módulo** | Frontend — Guards |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Token JWT válido almacenado.

**Pasos de ejecución:**
1. Intentar navegar a `/dashboard` con sesión activa.

**Resultado esperado:**
- Acceso permitido, componente Dashboard cargado.

**Resultado obtenido:** ✅ PASA

---

#### CP-F-03: Interceptor agrega header Authorization

| Campo | Detalle |
|---|---|
| **ID** | CP-F-03 |
| **Módulo** | Frontend — Interceptors |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Token JWT almacenado en el servicio de autenticación.

**Pasos de ejecución:**
1. Realizar una petición HTTP desde el frontend.
2. Interceptar y verificar los headers enviados.

**Resultado esperado:**
- Header `Authorization: Bearer <token>` incluido automáticamente.

**Resultado obtenido:** ✅ PASA

---

#### CP-F-04: Login exitoso en el servicio de autenticación

| Campo | Detalle |
|---|---|
| **ID** | CP-F-04 |
| **Módulo** | Frontend — AuthService |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Mock del backend configurado para devolver token.

**Pasos de ejecución:**
1. Llamar al método `login()` con credenciales válidas.
2. Verificar el estado del servicio.

**Resultado esperado:**
- Token almacenado correctamente.
- `currentUser` actualizado con datos del usuario.

**Resultado obtenido:** ✅ PASA

---

#### CP-F-05: Logout cierra la sesión

| Campo | Detalle |
|---|---|
| **ID** | CP-F-05 |
| **Módulo** | Frontend — AuthService |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Usuario autenticado con token almacenado.

**Pasos de ejecución:**
1. Llamar al método `logout()`.
2. Verificar el estado del servicio.

**Resultado esperado:**
- Token eliminado del almacenamiento.
- `currentUser` establecido en `null`.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 6 — Aplicación Móvil (Flutter)

---

#### CP-M-01: Mapeo de nivel auditivo normal (0-20 dB)

| Campo | Detalle |
|---|---|
| **ID** | CP-M-01 |
| **Módulo** | Flutter — HearingMapper |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Llamar a `HearingMapper.classify(15)`.

**Resultado esperado:**
- Clasificación devuelta: `"Normal"`.

**Resultado obtenido:** ✅ PASA

---

#### CP-M-02: Mapeo de nivel auditivo peligroso (> 85 dB)

| Campo | Detalle |
|---|---|
| **ID** | CP-M-02 |
| **Módulo** | Flutter — HearingMapper |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Llamar a `HearingMapper.classify(90)`.

**Resultado esperado:**
- Clasificación devuelta: `"Peligroso"`.

**Resultado obtenido:** ✅ PASA

---

#### CP-M-03: Modelo User con nombre vacío

| Campo | Detalle |
|---|---|
| **ID** | CP-M-03 |
| **Módulo** | Flutter — User Model |
| **Tipo** | Unitaria |
| **Prioridad** | Media |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Crear instancia de `User` con `name: ""`.
2. Acceder a la propiedad `initials`.

**Resultado esperado:**
- `initials` devuelve `"U"` como valor por defecto.

**Resultado obtenido:** ✅ PASA

---

#### CP-M-04: Modelo User con nombre completo

| Campo | Detalle |
|---|---|
| **ID** | CP-M-04 |
| **Módulo** | Flutter — User Model |
| **Tipo** | Unitaria |
| **Prioridad** | Media |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Crear `User` con `name: "Luis Rios"`.
2. Acceder a `initials`.

**Resultado esperado:**
- `initials` devuelve `"LR"`.

**Resultado obtenido:** ✅ PASA

---

#### CP-M-05: Parsing de respuesta API exitosa

| Campo | Detalle |
|---|---|
| **ID** | CP-M-05 |
| **Módulo** | Flutter — ApiResponse |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Crear `ApiResponse` desde JSON: `{ "success": true, "data": { "id": "1" } }`.
2. Verificar campos.

**Resultado esperado:**
- `success == true`.
- `data["id"] == "1"`.

**Resultado obtenido:** ✅ PASA

---

#### CP-M-06: Parsing de respuesta API con error

| Campo | Detalle |
|---|---|
| **ID** | CP-M-06 |
| **Módulo** | Flutter — ApiResponse |
| **Tipo** | Unitaria |
| **Prioridad** | Alta |

**Precondiciones:**
- Ninguna.

**Pasos de ejecución:**
1. Crear `ApiResponse` desde JSON: `{ "success": false, "error": "NOT_FOUND" }`.
2. Verificar campos.

**Resultado esperado:**
- `success == false`.
- `error == "NOT_FOUND"`.

**Resultado obtenido:** ✅ PASA

---

### MÓDULO 7 — IoT: Simulación Wokwi (ESP32)

---

#### CP-IoT-01: Conexión WiFi en red Wokwi-GUEST

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-01 |
| **Módulo** | IoT — ESP32 Firmware |
| **Tipo** | Simulación |
| **Prioridad** | Alta |

**Precondiciones:**
- Proyecto abierto en simulador Wokwi.
- SSID configurado como `"Wokwi-GUEST"`.

**Pasos de ejecución:**
1. Iniciar simulación en Wokwi.
2. Observar el monitor serie a 115200 baudios.

**Resultado esperado:**
- Mensaje `[WiFi] IP: 10.0.0.x` en el monitor serie.
- Conexión establecida en menos de 10 segundos.

**Resultado obtenido:** ✅ PASA

---

#### CP-IoT-02: Lectura del potenciómetro al 0%

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-02 |
| **Módulo** | IoT — Sensor |
| **Tipo** | Simulación |
| **Prioridad** | Alta |

**Precondiciones:**
- Simulación en ejecución.

**Pasos de ejecución:**
1. Mover el potenciómetro al mínimo (0%).
2. Observar el monitor serie.

**Resultado esperado:**
- Mensaje `[sensor] 30 dB  riesgo: normal` en el monitor serie.

**Resultado obtenido:** ✅ PASA

---

#### CP-IoT-03: Lectura del potenciómetro al 100%

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-03 |
| **Módulo** | IoT — Sensor |
| **Tipo** | Simulación |
| **Prioridad** | Alta |

**Precondiciones:**
- Simulación en ejecución.

**Pasos de ejecución:**
1. Mover el potenciómetro al máximo (100%).
2. Observar el monitor serie.

**Resultado esperado:**
- Mensaje `[sensor] 110 dB  riesgo: ALTO` en el monitor serie.

**Resultado obtenido:** ✅ PASA

---

#### CP-IoT-04: LED se enciende con nivel mayor a 85 dB

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-04 |
| **Módulo** | IoT — LED Indicador |
| **Tipo** | Simulación |
| **Prioridad** | Media |

**Precondiciones:**
- Simulación en ejecución.

**Pasos de ejecución:**
1. Mover potenciómetro hasta que el nivel supere 85 dB.
2. Observar el LED en GPIO2.

**Resultado esperado:**
- LED GPIO2 se enciende (estado HIGH).

**Resultado obtenido:** ✅ PASA

---

#### CP-IoT-05: LED se apaga con nivel menor o igual a 85 dB

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-05 |
| **Módulo** | IoT — LED Indicador |
| **Tipo** | Simulación |
| **Prioridad** | Media |

**Precondiciones:**
- LED encendido por lectura previa alta.

**Pasos de ejecución:**
1. Mover potenciómetro a posición de nivel ≤ 85 dB.

**Resultado esperado:**
- LED GPIO2 se apaga (estado LOW).

**Resultado obtenido:** ✅ PASA

---

#### CP-IoT-06: Envío HTTP al backend cada 5 segundos

| Campo | Detalle |
|---|---|
| **ID** | CP-IoT-06 |
| **Módulo** | IoT — Comunicación HTTP |
| **Tipo** | Integración |
| **Prioridad** | Alta |

**Precondiciones:**
- WiFi conectado. Backend en ejecución en `hearguard-ai.onrender.com`.
- `DEVICE_KEY` válida configurada en el firmware.

**Pasos de ejecución:**
1. Iniciar simulación.
2. Esperar 5 segundos.
3. Observar monitor serie.

**Resultado esperado:**
- Mensaje `[backend] OK` cada 5 segundos en el monitor serie.

**Resultado obtenido:** ✅ PASA (requiere DEVICE_KEY válida)

---

## 5. Herramientas Utilizadas

| Herramienta | Uso |
|---|---|
| Jest + Supertest | Pruebas unitarias e integración del backend Node.js |
| mongodb-memory-server | Base de datos en memoria para pruebas sin MongoDB Atlas |
| Pytest + pytest-cov | Pruebas unitarias del servicio de IA en Python |
| Angular Vitest + Playwright | Pruebas unitarias del frontend Angular |
| Flutter Test | Pruebas unitarias de la app móvil |
| SonarCloud | Análisis estático de calidad y seguridad |
| GitHub Actions | Pipeline CI/CD automático |
| Wokwi Simulator | Simulación del hardware ESP32 |

---

## 6. Métricas de Cobertura

| Módulo | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Backend (Node.js) | 81% | 60% | 88% | 82% |
| AI Service (Python) | pytest-cov | — | — | — |
| Frontend (Angular) | lcov | — | — | — |
| Flutter (Dart) | 16 tests | — | — | — |

**Total de casos de prueba: 37 detallados** distribuidos en 7 módulos.

---

## 7. Criterios de Aceptación

- Todos los tests deben pasar en verde antes de hacer merge a `main`.
- El pipeline de GitHub Actions debe completarse sin errores.
- La cobertura del backend no debe bajar del 75% en statements.
- SonarCloud no debe reportar vulnerabilidades de severidad alta o crítica.

---

## 8. Pipeline CI/CD

1. **Backend** — `npm test`
2. **AI Service** — `pytest tests/ --cov=model --cov-report=xml`
3. **Frontend** — `npm run test:ci`
4. **Flutter** — `flutter test --coverage`
5. **SonarCloud** — Análisis estático
6. **Deploy** — Solo si todo pasa en rama `main`

---

## 9. Referencias

- IEEE Std 829-2008, *IEEE Standard for Software and System Test Documentation*. IEEE, 2008.
- ISO/IEC 29119-3:2013, *Software and systems engineering — Software testing — Part 3: Test documentation*. ISO/IEC, 2013.
