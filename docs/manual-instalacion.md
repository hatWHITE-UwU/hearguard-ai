# MANUAL DE INSTALACIÓN
## HearGuard AI v1.0
### Guía técnica para despliegue local y en producción

---

**Institución:** Universidad Continental
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión del manual:** 1.0
**Fecha:** Junio 2026

---

## Tabla de Contenido

1. [Requisitos Previos](#1-requisitos-previos)
2. [Obtención del Código Fuente](#2-obtención-del-código-fuente)
3. [Variables de Entorno](#3-variables-de-entorno)
4. [Instalación con Docker (recomendado)](#4-instalación-con-docker-recomendado)
5. [Instalación Manual — Backend Node.js](#5-instalación-manual--backend-nodejs)
6. [Instalación Manual — Microservicio IA Flask](#6-instalación-manual--microservicio-ia-flask)
7. [Instalación Manual — Frontend Angular](#7-instalación-manual--frontend-angular)
8. [Instalación Manual — App Móvil Flutter](#8-instalación-manual--app-móvil-flutter)
9. [Instalación del Firmware IoT (ESP32)](#9-instalación-del-firmware-iot-esp32)
10. [Verificación de la Instalación](#10-verificación-de-la-instalación)
11. [Despliegue en Producción](#11-despliegue-en-producción)
12. [Solución de Problemas Comunes](#12-solución-de-problemas-comunes)

---

## 1. Requisitos Previos

### 1.1 Software requerido

| Herramienta | Versión mínima | Verificación |
|---|---|---|
| Git | 2.40+ | `git --version` |
| Node.js | 20.x LTS | `node --version` |
| npm | 10.x | `npm --version` |
| Python | 3.11+ | `python --version` |
| pip | 23+ | `pip --version` |
| Docker Desktop | 24+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Flutter SDK | 3.22+ | `flutter --version` |
| Arduino IDE | 2.x | Interfaz gráfica |

### 1.2 Cuentas en servicios externos (para producción)

| Servicio | Uso | URL de registro |
|---|---|---|
| MongoDB Atlas | Base de datos en la nube | cloud.mongodb.com |
| Render | Despliegue del backend e IA | render.com |
| Vercel | Despliegue del frontend | vercel.com |
| GitHub | Repositorio y CI/CD | github.com |
| SonarCloud | Análisis estático | sonarcloud.io |

### 1.3 Puertos utilizados (instalación local)

| Servicio | Puerto |
|---|:---:|
| Backend Node.js | 3000 |
| Microservicio IA Flask | 5001 |
| Frontend Angular (Nginx) | 8080 |
| MongoDB (si es local) | 27017 |

---

## 2. Obtención del Código Fuente

```bash
# Clonar el repositorio
git clone https://github.com/hatWHITE-UwU/hearguard-ai.git

# Ingresar al directorio del proyecto
cd hearguard-ai
```

### 2.1 Estructura del repositorio

```
hearguard-ai/
├── backend/            # API REST Node.js + Express
├── ai-service/         # Microservicio Flask + Random Forest
├── frontend/           # Aplicación web Angular 21
├── flutter_app/        # Aplicación móvil Flutter 3
├── bdd/                # Escenarios BDD Cucumber.js
├── e2e/                # Pruebas E2E Playwright
├── tests/k6/           # Pruebas de rendimiento k6
├── docs/               # Documentación técnica
├── scripts/            # Scripts auxiliares
├── docker/             # Configuración Nginx para Docker
├── docker-compose.yml  # Orquestación local
└── .env.example        # Plantilla de variables de entorno
```

---

## 3. Variables de Entorno

Antes de iniciar cualquier servicio, configure el archivo de variables de entorno.

```bash
# Copiar la plantilla
cp .env.example .env
```

Abra el archivo `.env` con cualquier editor de texto y complete los valores:

```env
# ── Base de datos ─────────────────────────────────────────
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/hearguard

# ── Autenticación JWT ─────────────────────────────────────
JWT_SECRET=<cadena-aleatoria-minimo-64-caracteres>
JWT_REFRESH_SECRET=<otra-cadena-aleatoria-minimo-64-caracteres>

# ── CORS ──────────────────────────────────────────────────
FRONTEND_URL=http://localhost:8080

# ── Microservicio IA ──────────────────────────────────────
AI_SERVICE_URL=http://localhost:5001

# ── Entorno ───────────────────────────────────────────────
NODE_ENV=development
PORT=3000
```

> **Seguridad:** Nunca comparta el archivo `.env` ni lo suba al repositorio. Está incluido en `.gitignore`.

### 3.1 Generar secrets seguros

En Linux/macOS:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

En Windows (PowerShell):
```powershell
[System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

---

## 4. Instalación con Docker (recomendado)

Docker levanta todos los servicios automáticamente con un solo comando. Es la forma más rápida y reproducible de instalar el sistema localmente.

### 4.1 Prerrequisito

Asegúrese de que Docker Desktop esté iniciado y ejecutándose.

### 4.2 Construir e iniciar todos los servicios

```bash
# Desde la raíz del repositorio
docker compose up --build
```

Este comando realiza automáticamente:
- Instalación de dependencias npm del backend
- Instalación de dependencias pip del microservicio IA
- Entrenamiento del modelo Random Forest (`python -m model.trainer`)
- Compilación del frontend Angular (`ng build`)
- Configuración del servidor Nginx para servir el frontend
- Inicio coordinado de los tres servicios

### 4.3 Verificar que los servicios están activos

```bash
docker compose ps
```

Resultado esperado:

```
NAME                STATUS          PORTS
hearguard-backend   Up              0.0.0.0:3000->3000/tcp
hearguard-ai        Up              0.0.0.0:5001->5001/tcp
hearguard-frontend  Up              0.0.0.0:8080->80/tcp
```

### 4.4 Acceder al sistema

| Servicio | URL |
|---|---|
| Frontend web | http://localhost:8080 |
| API backend | http://localhost:3000 |
| Health check | http://localhost:3000/health |
| Microservicio IA | http://localhost:5001/api/model-info |

### 4.5 Detener los servicios

```bash
docker compose down
```

Para detener y eliminar los volúmenes (reinicio limpio):
```bash
docker compose down -v
```

---

## 5. Instalación Manual — Backend Node.js

Use esta opción si no dispone de Docker o desea ejecutar los servicios por separado.

### 5.1 Instalar dependencias

```bash
cd backend
npm install
```

### 5.2 Configurar variables de entorno

El backend lee las variables desde el archivo `.env` en la raíz del repositorio. Asegúrese de haberlo configurado (sección 3).

### 5.3 Iniciar el servidor en modo desarrollo

```bash
npm run dev
```

El servidor inicia en `http://localhost:3000` con recarga automática (nodemon).

### 5.4 Iniciar en modo producción

```bash
npm start
```

### 5.5 Ejecutar las pruebas

```bash
# Todas las pruebas con cobertura
npm test -- --runInBand

# Solo las pruebas de seguridad
npm test -- --testPathPattern=security
```

### 5.6 Verificar el servicio

```bash
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

---

## 6. Instalación Manual — Microservicio IA Flask

### 6.1 Crear entorno virtual de Python

```bash
cd ai-service

# Crear entorno virtual
python -m venv venv

# Activar en Linux/macOS
source venv/bin/activate

# Activar en Windows
venv\Scripts\activate
```

### 6.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

Dependencias principales instaladas:

| Paquete | Versión | Uso |
|---|---|---|
| flask | 3.x | Servidor web del microservicio |
| scikit-learn | 1.5+ | Algoritmo Random Forest |
| numpy | 1.26+ | Operaciones numéricas |
| joblib | 1.4+ | Serialización del modelo |
| pytest | 8.x | Framework de pruebas |
| pytest-cov | 5.x | Cobertura de pruebas |

### 6.3 Entrenar el modelo

El modelo debe entrenarse antes de iniciar el servicio. Si el archivo `model/saved/risk_model.pkl` no existe, el entrenamiento se ejecuta automáticamente al iniciar Flask.

Para entrenar manualmente:

```bash
python -m model.trainer
```

Resultado esperado:
```
Entrenando modelo Random Forest (n=5000, SEED=42)...
R² holdout: 0.8X
Modelo guardado en: model/saved/risk_model.pkl
Metadatos: model/saved/model_metadata.json
```

### 6.4 Iniciar el microservicio

```bash
python app.py
```

El servicio inicia en `http://localhost:5001`.

### 6.5 Ejecutar las pruebas

```bash
pytest tests/ -v --cov=app --cov=model --cov-report=term-missing
```

### 6.6 Verificar el servicio

```bash
curl http://localhost:5001/api/model-info
```

Respuesta esperada:
```json
{
  "model": "RandomForestRegressor",
  "n_estimators": 120,
  "r2_score": 0.8X,
  "features": ["age","headphoneHours","volumeLevel",...]
}
```

---

## 7. Instalación Manual — Frontend Angular

### 7.1 Instalar dependencias

```bash
cd frontend
npm install
```

### 7.2 Iniciar en modo desarrollo

```bash
npm start
```

La aplicación inicia en `http://localhost:4200` con recarga automática.

> **Nota:** En modo desarrollo, las peticiones al backend se redirigen automáticamente a `http://localhost:3000` mediante el proxy configurado en `proxy.conf.json`.

### 7.3 Compilar para producción

```bash
npm run build
```

Los archivos compilados se generan en `dist/hearguard-frontend/`.

### 7.4 Ejecutar las pruebas

```bash
# Pruebas unitarias con Vitest
npm run test:ci

# Pruebas E2E con Playwright (requiere el frontend desplegado)
cd ../e2e
npm install
npx playwright install --with-deps chromium
npx playwright test --project=chromium
```

### 7.5 Análisis estático

```bash
npm run lint
```

---

## 8. Instalación Manual — App Móvil Flutter

### 8.1 Verificar la instalación de Flutter

```bash
flutter doctor
```

Asegúrese de que no haya errores críticos. Los avisos sobre Xcode son opcionales si solo desarrolla para Android.

### 8.2 Instalar dependencias

```bash
cd flutter_app
flutter pub get
```

### 8.3 Configurar la URL del backend

Abra `flutter_app/lib/core/constants/api_constants.dart` y verifique:

```dart
// Para desarrollo local
static const String baseUrl = 'http://10.0.2.2:3000'; // Android emulator
// static const String baseUrl = 'http://localhost:3000'; // iOS simulator

// Para producción
// static const String baseUrl = 'https://backend-hearguard.onrender.com';
```

> Use `10.0.2.2` para el emulador de Android (equivale a `localhost` del host).

### 8.4 Ejecutar en emulador o dispositivo físico

```bash
# Listar dispositivos disponibles
flutter devices

# Ejecutar en el dispositivo seleccionado
flutter run
```

### 8.5 Compilar APK para Android

```bash
flutter build apk --release
```

El archivo APK se genera en `build/app/outputs/flutter-apk/app-release.apk`.

### 8.6 Ejecutar las pruebas

```bash
flutter test --coverage
```

### 8.7 Análisis estático

```bash
flutter analyze --no-fatal-infos
```

---

## 9. Instalación del Firmware IoT (ESP32)

### 9.1 Materiales necesarios

| Componente | Cantidad |
|---|:---:|
| Placa ESP32 (cualquier variante con Wi-Fi) | 1 |
| Sensor de sonido KY-037 | 1 |
| Cables jumper hembra-hembra | 3 |
| Cable USB Micro-B o USB-C (según el ESP32) | 1 |

### 9.2 Conexiones del circuito

| Pin KY-037 | Pin ESP32 |
|---|---|
| VCC | 3.3V |
| GND | GND |
| A0 (analógico) | GPIO 34 |

### 9.3 Configurar el Arduino IDE

1. Abra el **Arduino IDE 2.x**.
2. Vaya a **Archivo → Preferencias**.
3. En "Gestor de URLs adicionales de tarjetas" agregue:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Vaya a **Herramientas → Placa → Gestor de tarjetas**.
5. Busque **"esp32"** e instale el paquete de Espressif Systems.

### 9.4 Cargar el firmware

1. Abra el archivo `firmware/hearguard_sensor/hearguard_sensor.ino`.
2. Edite las constantes de configuración:
   ```cpp
   #define DEVICE_KEY  "su_device_key_aqui"
   #define API_HOST    "backend-hearguard.onrender.com"
   // Si usa instalación local:
   // #define API_HOST "192.168.x.x"  // IP local del servidor
   #define API_PORT    443
   ```
3. Seleccione la placa: **Herramientas → Placa → ESP32 Arduino → ESP32 Dev Module**.
4. Seleccione el puerto COM del ESP32: **Herramientas → Puerto**.
5. Haga clic en **Subir** (→).

### 9.5 Iniciar el puente serial

El puente serial Node.js reenvía las lecturas del ESP32 al backend:

```bash
# Desde la raíz del repositorio
node serial_bridge.js
```

Resultado esperado:
```
Puerto serial abierto: COM3 (o /dev/ttyUSB0 en Linux)
Enviando lectura: 62.3 dB → backend OK (201)
```

---

## 10. Verificación de la Instalación

Ejecute esta lista de verificación después de instalar todos los componentes:

| Verificación | Comando / URL | Resultado esperado |
|---|---|---|
| Backend activo | `curl http://localhost:3000/health` | `{"status":"ok"}` |
| IA activa | `curl http://localhost:5001/api/model-info` | JSON con métricas del modelo |
| Frontend visible | Abrir `http://localhost:8080` en el navegador | Pantalla de inicio de HearGuard AI |
| Conexión backend→BD | Crear un usuario de prueba vía `POST /api/auth/register` | HTTP 201 |
| Predicción IA | Completar una evaluación auditiva | Nivel de riesgo calculado |
| Pruebas backend | `cd backend && npm test` | Todos los tests en verde |
| Pruebas IA | `cd ai-service && pytest tests/ -q` | Todos los tests en verde |
| Pruebas frontend | `cd frontend && npm run test:ci` | Todos los tests en verde |
| Pruebas Flutter | `cd flutter_app && flutter test` | Todos los tests en verde |

---

## 11. Despliegue en Producción

### 11.1 Backend e IA en Render

1. Cree una cuenta en [render.com](https://render.com).
2. Cree dos **Web Services** (uno para el backend, uno para la IA).
3. Conecte el repositorio de GitHub en cada servicio.
4. Configure los comandos de build y start:

**Backend Node.js:**
```
Build command:  cd backend && npm install
Start command:  cd backend && npm start
```

**Microservicio IA:**
```
Build command:  cd ai-service && pip install -r requirements.txt && python -m model.trainer
Start command:  cd ai-service && python app.py
```

5. Agregue las variables de entorno en **Environment → Environment Variables** de cada servicio (los mismos valores del `.env`).
6. Copie las URLs de los servicios desplegados (por ejemplo, `https://backend-hearguard.onrender.com`).

### 11.2 Frontend en Vercel

1. Cree una cuenta en [vercel.com](https://vercel.com).
2. Importe el repositorio de GitHub.
3. Configure el proyecto:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/hearguard-frontend/browser`
4. Agregue la variable de entorno `API_URL` con la URL del backend en Render.
5. Haga clic en **Deploy**.

### 11.3 Base de datos en MongoDB Atlas

1. Cree un clúster **M0 (gratuito)** en [cloud.mongodb.com](https://cloud.mongodb.com).
2. Cree un usuario de base de datos con contraseña segura.
3. En **Network Access**, agregue `0.0.0.0/0` para permitir acceso desde Render y Vercel.
4. Copie la **Connection String** y úsela como valor de `MONGO_URI` en Render.

### 11.4 Configuración de secretos en GitHub Actions

Para que el pipeline CI/CD funcione correctamente, configure los siguientes secretos en **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Descripción |
|---|---|
| `RENDER_BACKEND_HOOK` | URL del deploy hook del backend en Render |
| `RENDER_AI_HOOK` | URL del deploy hook del microservicio IA en Render |
| `VERCEL_FRONTEND_URL` | URL pública del frontend en Vercel |
| `VERCEL_FRONTEND_HOOK` | URL del deploy hook del frontend en Vercel |
| `SONAR_TOKEN` | Token de SonarCloud para análisis estático |

---

## 12. Solución de Problemas Comunes

### El backend no inicia — error de conexión a MongoDB

**Síntoma:** `MongoNetworkError: failed to connect to server`

**Solución:**
1. Verifique que `MONGO_URI` en `.env` sea correcto.
2. En MongoDB Atlas, confirme que su IP esté en la lista blanca de Network Access.
3. Si usa MongoDB local, asegúrese de que el servicio esté activo: `mongod --version`.

---

### El microservicio IA no carga el modelo

**Síntoma:** `FileNotFoundError: model/saved/risk_model.pkl not found`

**Solución:**
```bash
cd ai-service
python -m model.trainer
```

---

### El frontend no se conecta al backend

**Síntoma:** Errores `ERR_CONNECTION_REFUSED` o `CORS error` en la consola del navegador

**Solución:**
1. Confirme que el backend está activo en `http://localhost:3000`.
2. Verifique que `FRONTEND_URL` en `.env` coincide con el origen del frontend.
3. En modo desarrollo Angular, verifique `proxy.conf.json`:
   ```json
   { "/api": { "target": "http://localhost:3000", "changeOrigin": true } }
   ```

---

### Docker Compose falla en el build del frontend

**Síntoma:** `ng: command not found` durante el build

**Solución:**
```bash
# Limpiar imágenes y reconstruir
docker compose down
docker system prune -f
docker compose up --build
```

---

### El ESP32 no envía datos

**Síntoma:** El campo "Última conexión" del dispositivo no se actualiza

**Solución:**
1. Verifique que el puente serial está activo: `node serial_bridge.js`.
2. Confirme que `DEVICE_KEY` en el firmware coincide exactamente con la clave generada en la plataforma.
3. Verifique el puerto COM en el Arduino IDE y en `serial_bridge.js`.
4. Revise el Monitor Serie del Arduino IDE (115200 baud) para ver los logs del ESP32.

---

### Las pruebas del backend fallan por error de base de datos

**Síntoma:** `MongoError` durante `npm test`

**Solución:**

Las pruebas usan MongoDB en memoria (`mongodb-memory-server`). Si falla, reinstale las dependencias:
```bash
cd backend
rm -rf node_modules
npm install
npm test
```

---

---

## 13. Intercambiabilidad de Componentes

Esta sección documenta cómo sustituir cada componente tecnológico principal del sistema sin reescribir la plataforma completa, cubriendo la sub-característica **Intercambiabilidad** de Portabilidad (ISO 9126).

### 13.1 Sustituir MongoDB Atlas por otro motor de base de datos

HearGuard AI usa **Mongoose** como ODM, que abstrae la capa de persistencia. Para migrar a otro motor:

| Motor alternativo | Cambios requeridos |
|---|---|
| **MongoDB local** | Solo cambiar `MONGO_URI` en `.env` a `mongodb://localhost:27017/hearguard` |
| **MongoDB en Docker** | Agregar servicio `mongo:7` en `docker-compose.yml` y actualizar `MONGO_URI` |
| **DocumentDB (AWS)** | Cambiar `MONGO_URI` por la cadena de conexión de DocumentDB; agregar flag `tls=true` |
| **CosmosDB (Azure)** | Usar la API de MongoDB de CosmosDB; cambiar solo `MONGO_URI` |

Los modelos Mongoose (`User`, `Evaluation`, `NoiseRecord`, `RiskResult`, `Device`) no requieren cambios porque definen el esquema a nivel de aplicación.

### 13.2 Sustituir el microservicio Flask por otro motor de IA

El backend Node.js se comunica con el microservicio IA únicamente a través de `ai.service.js`, que llama a tres endpoints REST (`/api/predict-risk`, `/api/generate-recommendations`, `/api/model-info`). Para sustituir Flask:

1. Implementar el nuevo servicio en el lenguaje deseado (FastAPI, Express, Spring Boot…).
2. Exponer los mismos tres endpoints con el mismo contrato JSON.
3. Cambiar solo la variable `AI_SERVICE_URL` en `.env`.
4. El backend no requiere ningún otro cambio.

### 13.3 Sustituir el frontend Angular por otro framework web

Todos los datos del sistema se consumen desde la API REST documentada en `docs/api-spec.yml` (OpenAPI 3.1). Para reemplazar Angular:

1. Crear el nuevo frontend en el framework deseado (React, Vue, Svelte…).
2. Apuntar las peticiones HTTP a la misma URL del backend.
3. Implementar el interceptor JWT de la misma forma (Bearer token en header `Authorization`).
4. No se requieren cambios en el backend.

### 13.4 Sustituir el sensor KY-037 por otro sensor de ruido

El firmware ESP32 convierte las lecturas analógicas del sensor a decibelios mediante la función de calibración en `firmware/hearguard_sensor/hearguard_sensor.ino`. Para usar otro sensor:

1. Ajustar los pines y la función de conversión analógica→dB en el firmware.
2. El protocolo de comunicación (HTTP POST con header `X-Device-Key`) no cambia.
3. El backend y la base de datos no requieren cambios.

### 13.5 Sustituir Render por otro proveedor de despliegue

El backend y el microservicio IA están contenerizados con Docker. Para migrar de Render a otro proveedor:

| Proveedor alternativo | Método |
|---|---|
| **Railway** | `railway up` con el `Dockerfile` existente |
| **Fly.io** | `fly deploy` con el `Dockerfile` existente |
| **AWS ECS** | Subir imagen a ECR y crear tarea ECS |
| **VPS propio** | `docker compose up -d` en el servidor |

Solo se requiere actualizar las URLs en las variables de entorno del frontend y en el archivo `.env` del backend.

---

*HearGuard AI v1.0 · Universidad Continental · Escuela Académico Profesional de Ingeniería de Sistemas e Informática · 2026*

*Repositorio oficial: https://github.com/hatWHITE-UwU/hearguard-ai*
