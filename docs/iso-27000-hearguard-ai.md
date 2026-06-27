# GESTIÓN DE SEGURIDAD DE LA INFORMACIÓN
## HearGuard AI v1.0 — Conforme a ISO/IEC 27001:2022

---

**Institución:** Universidad Continental
**Escuela:** Ingeniería de Sistemas e Informática
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión:** 1.0 · Junio 2026

---

## 1. POLÍTICA DE SEGURIDAD DE LA INFORMACIÓN

HearGuard AI garantiza la confidencialidad, integridad y disponibilidad de la información de salud auditiva de sus usuarios mediante la implementación de controles técnicos y organizacionales alineados con la norma ISO/IEC 27001:2022 y el marco de referencia OWASP Top 10. El sistema gestiona datos de salud sensibles —historial de exposición al ruido, evaluaciones auditivas y niveles de riesgo personal— y reconoce que su protección es un requisito ético, académico y técnico fundamental.

**Principios de seguridad (Triada CIA):**

| Principio | Definición | Implementación en HearGuard AI |
|---|---|---|
| **Confidencialidad** | Solo los usuarios autorizados acceden a sus propios datos | JWT HS256 + RBAC + aislamiento por `userId` en todos los endpoints |
| **Integridad** | Los datos no se alteran sin autorización | Mongoose schema validation + soft delete (nunca DELETE físico) + bcrypt para contraseñas |
| **Disponibilidad** | El sistema está accesible cuando el usuario lo necesita | Render + Vercel con SLA de plataforma + retry/circuit breaker ante fallos del microservicio IA |

---

## 2. ALCANCE DEL SGSI

El Sistema de Gestión de Seguridad de la Información aplica a:

- **Datos en tránsito:** toda comunicación entre clientes (Angular, Flutter, ESP32) y servidores (Render, Vercel)
- **Datos en reposo:** colecciones MongoDB Atlas (`users`, `noiseRecords`, `evaluations`, `riskResults`, `devices`)
- **Credenciales y secretos:** JWT secrets, refresh token hashes, device keys, MONGO_URI
- **Código fuente:** repositorio GitHub `hatWHITE-UwU/hearguard-ai`
- **Infraestructura:** Render (backend + IA), Vercel (frontend), MongoDB Atlas M0

---

## 3. EVALUACIÓN DE RIESGOS DE SEGURIDAD

| ID | Activo | Amenaza | Probabilidad | Impacto | Nivel de riesgo |
|:---:|---|---|:---:|:---:|:---:|
| RS-01 | Tokens JWT | Robo de access token | Media | Alto | **Alto** |
| RS-02 | Contraseñas de usuario | Ataque de fuerza bruta | Media | Alto | **Alto** |
| RS-03 | Base de datos MongoDB | Inyección NoSQL | Baja | Crítico | **Alto** |
| RS-04 | API REST | Enumeración de usuarios | Media | Medio | **Medio** |
| RS-05 | Datos de evaluación auditiva | Acceso no autorizado (IDOR) | Baja | Alto | **Medio** |
| RS-06 | Dependencias npm | Vulnerabilidad en paquetes | Media | Medio | **Medio** |
| RS-07 | Clave de dispositivo IoT | Robo de `deviceKey` | Baja | Medio | **Bajo** |
| RS-08 | Variables de entorno | Exposición de secrets en repositorio | Baja | Crítico | **Alto** |

---

## 4. CONTROLES DE SEGURIDAD IMPLEMENTADOS

### 4.1 Control de Acceso (ISO 27001 — A.5.15, A.8.2, A.8.3)

| Control | Implementación | Archivo |
|---|---|---|
| Autenticación multifactor de sesión | JWT access token (15 min) + refresh token SHA-256 (7 días) con rotación | `backend/src/services/auth.service.js` |
| Control de acceso basado en roles | Cada recurso verifica que `userId` del token coincida con el propietario | `backend/src/middleware/authenticate.js` |
| Revocación de acceso | Logout invalida el refresh token en MongoDB | `backend/src/controllers/auth.controller.js` |
| Autenticación de dispositivos IoT | Header `X-Device-Key` verificado contra hash SHA-256 almacenado | `backend/src/middleware/deviceAuth.js` |

### 4.2 Criptografía (ISO 27001 — A.8.24)

| Control | Implementación | Parámetros |
|---|---|---|
| Hash de contraseñas | bcrypt | Salt rounds = 12 |
| Firma de tokens JWT | HMAC-SHA256 (HS256) | Secret mínimo 64 caracteres hexadecimales |
| Hash de refresh tokens | SHA-256 | 128 caracteres aleatorios como entrada |
| Hash de device keys | SHA-256 | Generado con `crypto.randomBytes(64)` |
| Cifrado en tránsito | TLS 1.2+ | Proporcionado por Render y Vercel |
| Cifrado en reposo | AES-256 | Proporcionado por MongoDB Atlas |

### 4.3 Protección contra Amenazas Web (ISO 27001 — A.8.8 / OWASP Top 10)

| Amenaza OWASP 2021 | Control implementado | Evidencia |
|---|---|---|
| A01 — Broken Access Control | RBAC + verificación de `userId` en cada endpoint | `security.test.js` — casos IDOR |
| A02 — Cryptographic Failures | bcrypt salt 12 + JWT HS256 + TLS | `auth.controller.js` |
| A03 — Injection (NoSQL) | Mongoose castea tipos automáticamente; `express-validator` valida entradas | `security.test.js` — casos NoSQL injection |
| A04 — Insecure Design | Arquitectura API First con contratos OpenAPI 3.1 | `docs/api-spec.yml` |
| A05 — Security Misconfiguration | Helmet.js + CORS restrictivo + rate limiting (100 req/15 min) | `server.js` |
| A06 — Vulnerable Components | `npm audit --audit-level=high` en CI; 0 vulnerabilidades high/critical | Job `backend` en CI |
| A07 — Auth Failures | Anti-enumeración (respuesta idéntica para email y contraseña incorrectos) | `auth.service.js` |
| A08 — Software Integrity | Conventional Commits + Husky hook + SonarCloud en cada push | `.husky/` + `.github/workflows/ci.yml` |
| A09 — Logging & Monitoring | `logger.js` registra método, path, código y userId por operación | `backend/src/utils/logger.js` |
| A10 — SSRF | El backend no acepta URLs de usuario como parámetro de redirección | Revisado en code review SonarCloud |

### 4.4 Seguridad en el Ciclo de Desarrollo (ISO 27001 — A.8.25, A.8.28)

| Práctica | Implementación |
|---|---|
| Revisión de código | SonarCloud analiza cada push — 0 security hotspots, Rating A |
| Pruebas de seguridad | `backend/tests/security.test.js` — 22 casos: JWT, IDOR, NoSQL, rutas protegidas |
| Gestión de secretos | Secrets en variables de entorno de Render/GitHub; nunca en el código fuente |
| `.gitignore` activo | `.env` excluido del repositorio en todas las ramas |
| Rotación de tokens | Cada refresh invalida el token anterior (rotación completa) |

### 4.5 Respaldo y Recuperación (ISO 27001 — A.8.13, A.8.14)

| Control | Implementación |
|---|---|
| Backup de base de datos | MongoDB Atlas M0 realiza snapshots automáticos diarios |
| Soft delete | Ningún dato se elimina físicamente — `isDeleted: true` + `deletedAt` |
| Recuperación del servicio IA | Retry con backoff exponencial (3 intentos) + circuit breaker (recuperación en 30 s) |
| Alta disponibilidad | Render reinicia el servicio automáticamente ante fallos del proceso |

### 4.6 Seguridad Física y Ambiental (ISO 27001 — A.7)

| Control | Implementación |
|---|---|
| Infraestructura en la nube | Render y MongoDB Atlas gestionan la seguridad física de los centros de datos |
| Aislamiento de red | El microservicio Flask no está expuesto públicamente — solo accesible desde el backend |
| Acceso al repositorio | Repositorio privado con acceso restringido a los autores |

---

## 5. DECLARACIÓN DE APLICABILIDAD (SoA)

Controles del Anexo A de ISO/IEC 27001:2022 aplicables a HearGuard AI:

| Dominio | Control | Aplicado | Justificación |
|---|---|:---:|---|
| A.5 Controles organizacionales | A.5.1 Política de SI | ✅ | Sección 1 de este documento |
| | A.5.15 Control de acceso | ✅ | JWT + RBAC + deviceKey |
| | A.5.33 Protección de registros | ✅ | Soft delete + logger.js |
| A.6 Controles de personas | A.6.3 Concienciación de SI | ✅ | Documentación de seguridad para desarrolladores |
| A.8 Controles tecnológicos | A.8.2 Derechos de acceso privilegiado | ✅ | RBAC — usuarios solo acceden a sus datos |
| | A.8.3 Restricción de acceso a información | ✅ | `userId` verificado en todos los endpoints |
| | A.8.5 Autenticación segura | ✅ | JWT HS256 + bcrypt salt 12 + refresh SHA-256 |
| | A.8.7 Protección contra malware | ✅ | `npm audit` + SonarCloud |
| | A.8.8 Gestión de vulnerabilidades técnicas | ✅ | CI audita dependencias en cada push |
| | A.8.13 Respaldo de información | ✅ | MongoDB Atlas snapshots diarios |
| | A.8.14 Redundancia | ✅ | Retry + circuit breaker |
| | A.8.20 Seguridad de redes | ✅ | TLS en todos los canales + CORS restrictivo |
| | A.8.24 Uso de criptografía | ✅ | bcrypt + HS256 + SHA-256 + TLS + AES-256 Atlas |
| | A.8.25 Ciclo de vida de desarrollo seguro | ✅ | TDD + security.test.js + SonarCloud |
| | A.8.28 Codificación segura | ✅ | express-validator + Mongoose typing + Helmet |

---

## 6. INDICADORES DE SEGURIDAD

| Indicador | Meta | Fuente de verificación |
|---|---|---|
| Vulnerabilidades high/critical en dependencias | 0 | `npm audit` en job CI |
| Security Rating en SonarCloud | A (0 vulnerabilidades) | Dashboard SonarCloud |
| Casos de seguridad en `security.test.js` | 22 pasantes | `npm test -- --testPathPatterns=security` |
| Tokens JWT correctamente rechazados (alg:none) | 100 % | `security.test.js` caso JWT-002 |
| Intentos de IDOR bloqueados | 100 % | `security.test.js` casos IDOR-001 a IDOR-004 |

---

*HearGuard AI v1.0 · Universidad Continental · ISO/IEC 27001:2022 · Junio 2026*
