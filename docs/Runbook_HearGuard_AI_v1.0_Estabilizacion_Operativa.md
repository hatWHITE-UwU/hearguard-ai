# Runbook HearGuard AI v1.0 — Estabilización operativa y saneamiento del entorno

**Proyecto:** HearGuard AI v1.0 — Sistema Inteligente para la Prevención y Predicción de la Pérdida Auditiva  
**Autores:** Terreros Hinojosa Luis Francisco · Rondinel Aquino Hardy Eduardo  
**Institución:** Universidad Continental, Perú  
**Repositorio:** [hatWHITE-UwU/hearguard-ai](https://github.com/hatWHITE-UwU/hearguard-ai)  
**Documento:** `docs/Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md`  
**Fecha:** mayo 2026  
**Estado:** Documento de planificación — **no implica cambios de código por sí solo**

---

## Objetivo general

Analizar exhaustivamente el repositorio **hearguard-ai** y usar este documento como hoja de ruta oficial para la versión **v1.0 estable**, enfocada en:

- estabilizar el sistema en local, Docker y producción (Render + Vercel);
- eliminar configuraciones históricas inconsistentes (demo, mocks, `.env` obsoletos);
- reconstruir una línea base limpia de datos y artefactos;
- corregir regresiones operativas detectadas en pruebas;
- formalizar el modelo de **URLs y puertos multi-entorno** (no multi-tenant);
- preparar el proyecto para entrega académica y despliegue productivo.

> **Nota de alcance:** HearGuard AI **no es multi-tenant** (no hay empresas/tenants con puertos 8001+). El equivalente operativo es el stack **multi-servicio** y **multi-entorno** (desarrollo, Docker, CI, producción).

---

## Contexto

La versión actual del repositorio incluye:

| Área | Estado documentado |
|------|-------------------|
| Backend API (Express 5) | JWT, auth, noise, evaluations, devices, IoT |
| Servicio IA (Flask + Random Forest) | CRISP-DM, R² ≥ 0.80, integración vía `ai.service.js` |
| Frontend Angular 21 | Web + modo demo (`publicDemo`, `useDemoMocks`) |
| App Flutter + firmware ESP32 | Clientes adicionales |
| Calidad | SonarCloud: Quality Gate OK, cobertura 100 %, ratings A |
| Pruebas | 422 casos automatizados + k6 (3 escenarios) |
| CI/CD | GitHub Actions + deploy Render/Vercel |

Sin embargo, en pruebas operativas y despliegues pueden aparecer inconsistencias que deben resolverse **antes** de agregar nuevas funcionalidades de negocio (p. ej. multi-clínica, subdominios por institución).

---

## Principio rector

> **Antes de corregir errores, debe existir un entorno limpio.**

El Runbook asume que cualquier dato histórico en MongoDB, tokens en `localStorage`, volúmenes Docker o variables `.env` mezcladas pueden contaminar el comportamiento actual.

Por lo tanto:

**La limpieza y reconstrucción del entorno tiene prioridad sobre la depuración ad hoc.**

---

## Arquitectura de referencia

```
Clientes (Angular :4200/:8080 · Flutter · ESP32)
        │ HTTP/REST                    │ X-Device-Key
        ▼                              ▼
Backend Node.js (:3000)  ──HTTP──►  AI Flask (:5001)
        │
        ▼
MongoDB (:27017 local / Atlas en prod)
```

| Entorno | Frontend | Backend | IA | Base de datos |
|---------|----------|---------|-----|---------------|
| Dev local | `localhost:4200` | `localhost:3000` | `localhost:5001` | Atlas o `mongodb://127.0.0.1:27017` |
| Docker Compose | `localhost:8080` | `localhost:3000` | `localhost:5001` | `mongodb://mongodb:27017/hearguard` |
| Producción | Vercel | Render `hearguard-backend` | Render `hearguard-ai` | MongoDB Atlas M0 |

---

# Problema 1 — Baseline limpio

### Situación actual

Pueden coexistir:

- usuarios y registros de prueba en MongoDB (Atlas compartido o volumen Docker `mongo_data`);
- tokens JWT/refresh en `localStorage` del navegador (`hearguard_access`, `hearguard_refresh`);
- artefactos del modelo IA (`ai-service/saved/` o bundle generado en CI);
- configuración **demo** en `frontend/src/environments/environment.ts` (`publicDemo: true`, `useDemoMocks: true`) distinta de producción (`environment.production.ts` generado por `scripts/set-env.js`);
- secretos JWT distintos entre `.env` local, Docker y Render (invalida sesiones previas);
- reportes E2E/HTML y cobertura en `reports/` (no afectan runtime, pero confunden auditorías).

### Estrategia de respaldo

| Qué respaldar | Cómo | Motivo |
|---------------|------|--------|
| Base MongoDB de prueba | `mongodump` o export Atlas | Evitar pérdida si se limpia |
| `.env` local (sin commitear) | Copia segura fuera del repo | Secretos JWT y `MONGO_URI` |
| Modelo entrenado | `ai-service/saved/` o artefacto CI | Reentrenamiento tarda ~5 s pero conviene snapshot |
| Variables Render/Vercel | Dashboard o `render.yaml` + secrets GH | Reproducir producción |
| Usuarios demo necesarios para defensa | Export JSON de colección `users` | Evidencia académica |

### Estrategia de limpieza

| Qué puede eliminarse/reiniciarse | Acción |
|----------------------------------|--------|
| Colecciones de prueba en MongoDB | `deleteMany` en `users`, `noiseRecords`, `evaluations`, `riskResults`, `devices` **solo en DB de test** |
| Volumen Docker `mongo_data` | `docker compose down -v` (destructivo) |
| `localStorage` del navegador | DevTools → Application → Clear |
| `node_modules`, `dist`, `.angular`, `coverage` | Regenerables con `npm ci` / `ng build` |
| Tokens CI obsoletos | Rotar `JWT_SECRET` implica logout global |

**No eliminar en producción** sin ventana de mantenimiento y backup.

### Estrategia de reconstrucción (flujo objetivo)

```
Base limpia (Mongo vacío o DB test dedicada)
        ↓
docker:up  O  stack local (mongo + ai + backend + frontend)
        ↓
python -m model.trainer  (si IA sin bundle)
        ↓
POST /api/auth/register  (usuario de prueba)
        ↓
Login → JWT en localStorage
        ↓
POST /api/noise  +  POST /api/evaluations  (flujo completo)
        ↓
GET /api/evaluations/:id  (riskResult)
        ↓
Operación normal (monitor, historial, dispositivos)
```

**Criterio de éxito:** el flujo anterior funciona **sin** depender de datos creados en sesiones anteriores ni de `useDemoMocks`.

---

# Problema 2 — Asignación de puertos y configuración centralizada

### Situación actual (evidencia en repo)

| Servicio | Puerto por defecto | Fuente |
|----------|-------------------|--------|
| Backend | `3000` | `.env.example` `PORT`, `render.yaml`, `docker-compose.yml` |
| AI Service | `5001` | `ai-service/app.py`, `docker-compose.yml` |
| Frontend dev | `4200` | `ng serve`, `FRONTEND_URL` en `.env.example` |
| Frontend Docker | `8080` | `docker-compose.yml` |
| MongoDB | `27017` | `docker-compose.yml` |

Variables críticas centralizadas:

- `PORT`, `MONGO_URI`, `JWT_*`, `FRONTEND_URL`, `AI_SERVICE_URL` → `backend/src/config/env.js`
- `API_URL`, `PUBLIC_DEMO` → `scripts/set-env.js` → `environment.production.ts`
- `apiUrl`, `publicDemo`, `useDemoMocks` → `frontend/src/environments/environment.ts`

### Requisito obligatorio

La asignación **no debe depender de URLs hardcodeadas dispersas** en componentes.

Debe existir configuración centralizada:

```env
# Backend (.env)
PORT=3000
AI_SERVICE_URL=http://localhost:5001
FRONTEND_URL=http://localhost:4200

# Frontend (build producción)
API_URL=https://api.hearguard.onrender.com
PUBLIC_DEMO=false
```

Si en otro entorno se cambia, por ejemplo:

```env
PORT=8080
AI_SERVICE_URL=https://hearguard-ai.onrender.com
```

el sistema debe adaptarse **solo** vía variables, sin editar código fuente.

### Análisis obligatorio del Runbook (checklist)

- [ ] ¿Dónde se lee `PORT` en backend? → `env.js`, `server.js`
- [ ] ¿Dónde se construye la URL del API en Angular? → `environment.apiUrl`, interceptor, servicios HTTP
- [ ] ¿CORS en backend usa `FRONTEND_URL`? → verificar `server.js` / middleware CORS
- [ ] ¿El proxy de `ng serve` (`proxy.conf.json`) coincide con `apiUrl` en dev?
- [ ] ¿Docker usa nombres de servicio (`http://ai-service:5001`) vs localhost?
- [ ] ¿Render tiene `AI_SERVICE_URL` y `FRONTEND_URL` sincronizados post-deploy?

### Documentación obligatoria

| Cambio | Dónde documentar |
|--------|------------------|
| Puertos y URLs por entorno | `README.md` § Inicio rápido |
| Variables `.env` | `.env.example` + comentarios |
| Build frontend producción | `scripts/set-env.js`, `frontend/angular.json` |
| Secrets CI/CD | `.env.example` § GitHub Actions Secrets |
| Nuevo desarrollador | README → orden: `.env` → trainer → backend → frontend |

---

# Problema 3 — Login y sesiones (usuarios “históricos”)

### Síntoma

Usuarios creados en pruebas anteriores:

- no pueden autenticarse;
- reciben 401 en `/api/auth/me` o rutas protegidas;
- el frontend redirige a `/login` o muestra usuario demo inconsistente.

### No asumir causas — investigar

| Área | Archivos / puntos de revisión |
|------|------------------------------|
| Registro / login | `backend/src/controllers/auth.controller.js` |
| JWT access/refresh | `backend/src/utils/jwt.utils.js`, rotación `refreshTokenHash` |
| Middleware | `backend/src/middleware/auth.middleware.js` |
| Usuario eliminado | `User.isDeleted`, tests en `coverage-extra.test.js` |
| CORS / credenciales | `FRONTEND_URL`, headers en producción Vercel→Render |
| Modo demo | `environment.publicDemo` — guard permite acceso sin token |
| Frontend sesión | `auth.service.ts`, `auth.interceptor.ts` (refresh en 401) |
| Secretos distintos | Cambio de `JWT_SECRET` invalida todos los tokens emitidos |

### Estrategia de corrección (Runbook)

1. Confirmar que `JWT_SECRET` y `JWT_REFRESH_SECRET` son **los mismos** en el entorno donde falla el login.
2. Limpiar `localStorage` y volver a registrar usuario.
3. Verificar en MongoDB que el usuario existe y `isDeleted !== true`.
4. Comparar `publicDemo` / `useDemoMocks` entre dev y producción.
5. Revisar logs backend en intento de login (401 vs 500).
6. Ejecutar `backend/tests/auth.test.js` y `security.test.js` contra el mismo `MONGO_URI`.

**Evidencia esperada:** traza HTTP (status, body `error`), documento MongoDB del usuario, valor de `environment` en build desplegado.

---

# Problema 4 — Bucles de consulta y tareas de larga duración

### Equivalente HearGuard (no hay `/control/simulations`)

En este proyecto, los patrones de **polling / suscripción continua** relevantes son:

| Componente | Comportamiento | Archivo |
|------------|----------------|---------|
| Monitor de ruido | `setInterval` cada 1000 ms para muestreo micrófono | `noise-monitor.service.ts` |
| Interceptor auth | Reintento tras 401 con `refreshToken()` | `auth.interceptor.ts` |
| Carga de evaluación | `subscribe` a `GET /api/evaluations/:id` | `results.component.ts` |
| Dashboard / historial | Múltiples `http.get` en paralelo | `dashboard.component.ts`, `history.component.ts` |
| Integración IA | `postPredictRisk` con timeout 10 s | `backend/src/services/ai.service.js` |

### Análisis obligatorio

- [ ] ¿`noise-monitor.service` detiene el timer en `stop()` y al destruir el componente?
- [ ] ¿El interceptor evita bucle infinito si refresh también devuelve 401?
- [ ] ¿`results.component` maneja error cuando la evaluación no tiene `riskResult` (IA caída)?
- [ ] ¿Hay suscripciones sin `unsubscribe` / `takeUntilDestroyed`?
- [ ] ¿k6 o E2E muestran endpoints lentos recurrentes?

### Criterio de corrección

Toda operación repetitiva debe tener:

- condición de salida clara;
- timeout o máximo de reintentos;
- cleanup al salir de la ruta (`ngOnDestroy`).

---

# Problema 5 — Formalización del routing multi-entorno

HearGuard **no** usa routing por tenant con puertos 8001+. El evolutivo equivalente es:

### Estado actual — Puertos y hosts separados

```
http://localhost:4200/login          → frontend dev
http://127.0.0.1:3000/api/auth/login → API directa (CORS)
http://localhost:8080/login          → frontend Docker
```

### Estado intermedio — Rutas bajo un solo origen (proxy / reverse proxy)

```
https://app.hearguard.com/login
https://app.hearguard.com/api/auth/login   (proxy al backend)
```

Implementación típica: Vercel rewrites, nginx, o Render static + API gateway.

### Estado futuro — Subdominios o path por institución (si escala multi-organización)

```
https://continental.hearguard.com/login
https://app.hearguard.com/continental/login
```

Requiere diseño de **multi-tenancy** (no implementado en v1.0).

### Análisis de impacto obligatorio

| Componente | Impacto al cambiar routing |
|------------|---------------------------|
| `environment.apiUrl` | Alto — todos los servicios HTTP |
| CORS `FRONTEND_URL` | Alto |
| `auth.interceptor` | Medio — rutas `/api/auth/*` excluidas |
| Cookies vs Bearer | Bajo hoy (solo JWT en header) |
| IoT `X-Device-Key` | Bajo — URL del backend en firmware |
| Swagger `/api/docs` | Medio — URL pública del API |
| Playwright E2E `BASE_URL` | Alto — secret `VERCEL_FRONTEND_URL` |
| Flutter `baseUrl` | Alto — configuración Dio |

---

# Fases del Runbook

| Fase | Nombre | Entregable |
|------|--------|------------|
| **0** | Baseline limpio | Inventario datos + backup |
| **1** | Saneamiento de entorno | Mongo/volúmenes/localStorage limpios |
| **2** | Reconstrucción desde cero | Flujo registro→evaluación OK |
| **3** | Validación servicios | Health checks 3000/5001/8080 |
| **4** | Corrección autenticación | Matriz causas 401 documentada |
| **5** | Corrección bucles/polling | Lista componentes con cleanup |
| **6** | Diseño routing unificado | ADR o diagrama URLs objetivo |
| **7** | Implementación routing | Proxy Vercel/nginx (si aplica) |
| **8** | Pruebas integrales | Jest + pytest + Vitest + Playwright + k6 |
| **9** | Validación final | SonarCloud + checklist entrega UC |

---

# Restricciones de esta fase documental

Al usar este Runbook como **especificación de trabajo**:

- No implementar cambios de código hasta aprobar la Fase 0–2.
- No ejecutar limpieza de producción sin backup.
- No asumir causas sin evidencia (logs, tests, MongoDB).
- Todas las conclusiones deben citar archivos del repositorio.

---

# Resultado esperado

Este Runbook es la hoja de ruta oficial para **HearGuard AI v1.0** y permite:

1. Limpiar y reconstruir el entorno de forma reproducible.  
2. Centralizar puertos y URLs en variables de entorno.  
3. Diagnosticar fallos de login y sesión JWT.  
4. Auditar polling y reintentos en frontend/backend.  
5. Planificar la evolución de URLs (local → proxy → subdominio).  
6. Certificar estabilidad antes de nuevas funcionalidades.

---

# Anexo A — Prompt de generación adaptado (para auditoría con IA)

```markdown
# GENERACIÓN DEL RUNBOOK — HEARGUARD AI v1.0

Analizar el repositorio hatWHITE-UwU/hearguard-ai y ampliar:
docs/Runbook_HearGuard_AI_v1.0_Estabilizacion_Operativa.md

Objetivo: estabilización operativa (NO nuevas features).

Contexto: stack Node 3000 + Flask 5001 + Angular 4200/8080 + MongoDB;
deploy Render+Vercel; JWT; modos publicDemo/useDemoMocks; 422 tests; Sonar 100%.

Problemas a investigar con evidencia:
1. Baseline limpio (Mongo, Docker volumes, localStorage, demo flags).
2. Puertos/URLs centralizados (.env, env.js, set-env.js, render.yaml).
3. Login/sesiones (auth.controller, jwt, interceptor, isDeleted, CORS).
4. Polling (noise-monitor setInterval, auth refresh, results subscribe).
5. Routing multi-entorno (actual → proxy único → subdominio futuro).

Fases 0-9 según el Runbook. No modificar código; solo documentar hallazgos.
```

---

# Anexo B — Comandos rápidos de operación

```bash
# Stack completo
cp .env.example .env   # completar secretos
npm run docker:up

# Health checks
curl http://localhost:3000/health
curl http://localhost:5001/health

# Tests regresión
cd backend && npm test -- --runInBand
cd ai-service && pytest tests/ -q
cd frontend && npm run test:ci
cd e2e && npx playwright test --project=chromium

# Rendimiento
k6 run tests/k6/load-test.js

# Regenerar matriz de registro académica
python scripts/generar-matriz-registro.py
```

---

*HearGuard AI v1.0 · TDD+BDD + CRISP-DM · Universidad Continental, Perú*
