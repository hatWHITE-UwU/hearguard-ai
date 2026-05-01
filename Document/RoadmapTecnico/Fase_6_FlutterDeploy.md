# 📱 Fase 6 — Flutter App + Deploy + CI/CD

> **Prerequisito:** Fases 1-5 completadas y funcionando end-to-end.
> **Objetivo final:** Sistema completo en producción y app móvil publicable.

---

## 🎯 Objetivo de esta fase

Migrar el frontend a Flutter para iOS/Android, dockerizar toda la arquitectura, hacer deploy en la nube, y configurar CI/CD con GitHub Actions.

---

## 📁 Archivos a crear en esta fase

```
hearguard-ai/
├── flutter_app/                       ← App Flutter
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   ├── theme/
│   │   │   │   └── app_theme.dart     ← Paleta de colores oficial
│   │   │   ├── network/
│   │   │   │   └── api_client.dart    ← Dio HTTP client + interceptors
│   │   │   └── storage/
│   │   │       └── secure_storage.dart ← JWT en flutter_secure_storage
│   │   └── features/
│   │       ├── splash/
│   │       ├── auth/                  ← login_screen.dart, register_screen.dart
│   │       ├── dashboard/             ← dashboard_screen.dart
│   │       ├── monitor/               ← monitor_screen.dart
│   │       ├── hearing_test/          ← hearing_test_screen.dart
│   │       ├── results/               ← results_screen.dart
│   │       ├── recommendations/       ← recommendations_screen.dart
│   │       ├── history/               ← history_screen.dart
│   │       └── profile/               ← profile_screen.dart
│   └── pubspec.yaml
├── docker/
│   ├── backend.Dockerfile
│   ├── ai-service.Dockerfile
│   └── nginx.conf                     ← Reverse proxy
├── docker-compose.yml                 ← Orquestación completa local
├── docker-compose.prod.yml            ← Configuración de producción
└── .github/
    └── workflows/
        ├── ci.yml                     ← Tests en cada PR
        └── deploy.yml                 ← Deploy en merge a main
```

---

## 🐦 Flutter App — Especificación completa

### pubspec.yaml — Dependencias clave
```yaml
dependencies:
  flutter:
    sdk: flutter
  dio: ^5.4.0                    # HTTP client
  flutter_secure_storage: ^9.0.0  # JWT seguro
  provider: ^6.1.0               # State management
  fl_chart: ^0.66.0              # Gráficas (equivalente a Chart.js)
  just_audio: ^0.9.36            # Audio para prueba auditiva
  permission_handler: ^11.0.0    # Permisos micrófono
  record: ^5.0.0                 # Grabación de micrófono para monitoreo
  intl: ^0.19.0                  # Formateo de fechas
  shimmer: ^3.0.0                # Loading skeletons
  lottie: ^3.0.0                 # Animaciones (splash screen)
```

### app_theme.dart — Paleta oficial
```dart
class AppTheme {
  // Colores primarios
  static const Color bgPrimary    = Color(0xFF0D1117);
  static const Color bgSecondary  = Color(0xFF0F1923);
  static const Color bgCard       = Color(0xFF15202B);
  static const Color bgCard2      = Color(0xFF1C2A3A);

  // Acentos
  static const Color accentCyan   = Color(0xFF00E5FF);
  static const Color accentPurple = Color(0xFF7C4DFF);

  // Semánticos
  static const Color success      = Color(0xFF22C55E);
  static const Color warning      = Color(0xFFF59E0B);
  static const Color danger       = Color(0xFFFF4D4D);

  // Texto
  static const Color textPrimary  = Color(0xFFE8F4F8);
  static const Color textMuted    = Color(0xFF8BA3B8);
  static const Color textMuted2   = Color(0xFF526070);
  static const Color border       = Color(0xFF1E3040);

  static ThemeData get darkTheme => ThemeData(
    brightness: Brightness.dark,
    scaffoldBackgroundColor: bgPrimary,
    fontFamily: 'Poppins',          // Agregar Poppins en pubspec.yaml fonts
    colorScheme: const ColorScheme.dark(
      primary: accentCyan,
      secondary: accentPurple,
      surface: bgCard,
    ),
  );
}
```

### 10 pantallas a implementar en Flutter

| Pantalla | Archivo Dart | Equivalente Angular |
|----------|-------------|---------------------|
| Splash | splash_screen.dart | SplashComponent |
| Login | login_screen.dart | LoginComponent |
| Registro | register_screen.dart | RegisterComponent |
| Dashboard | dashboard_screen.dart | DashboardComponent |
| Monitoreo | monitor_screen.dart | MonitorComponent |
| Prueba Auditiva | hearing_test_screen.dart | HearingTestComponent |
| Resultados | results_screen.dart | ResultsComponent |
| Recomendaciones | recommendations_screen.dart | RecommendationsComponent |
| Historial | history_screen.dart | HistoryComponent |
| Perfil | profile_screen.dart | ProfileComponent |

### Prueba Auditiva en Flutter (just_audio)
```dart
// Usar just_audio para generar tonos en lugar de Web Audio API
// Generar archivo WAV de tono puro para cada frecuencia
// O usar AudioPlayer con frecuencia generada por ToneGenerator
// Canal izquierdo/derecho: usando balance del AudioPlayer
// Slider de volumen: AudioPlayer.setVolume()
```

---

## 🐳 Docker — Configuración completa

### docker-compose.yml (desarrollo local)
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: [mongo_data:/data/db]
    environment:
      MONGO_INITDB_DATABASE: hearguard_db

  backend:
    build: { context: ./backend, dockerfile: ../docker/backend.Dockerfile }
    ports: ["3000:3000"]
    environment:
      - MONGO_URI=mongodb://mongodb:27017/hearguard_db
      - AI_SERVICE_URL=http://ai-service:5001
    depends_on: [mongodb, ai-service]

  ai-service:
    build: { context: ./ai-service, dockerfile: ../docker/ai-service.Dockerfile }
    ports: ["5001:5001"]

  nginx:
    image: nginx:alpine
    ports: ["80:80"]
    volumes: [./docker/nginx.conf:/etc/nginx/nginx.conf]
    depends_on: [backend, ai-service]

volumes:
  mongo_data:
```

### backend.Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

### ai-service.Dockerfile
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python model/trainer.py    # Entrenar modelo al construir imagen
EXPOSE 5001
CMD ["python", "app.py"]
```

---

## ☁️ Deploy en la Nube

### Opción A: Railway (recomendada para este proyecto)
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y deploy
railway login
railway init
railway add mongodb          # MongoDB plugin
railway up                   # Deploy automático desde Git

# Variables de entorno en Railway dashboard:
# NODE_ENV=production
# MONGO_URI=${{MongoDB.MONGODB_URL}}
# JWT_SECRET=<generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
# FRONTEND_URL=https://tu-dominio.com
```

### Opción B: Render.com
```yaml
# render.yaml
services:
  - type: web
    name: hearguard-backend
    env: node
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        fromDatabase:
          name: hearguard-mongo
          property: connectionString

  - type: web
    name: hearguard-ai
    env: python
    buildCommand: pip install -r requirements.txt && python model/trainer.py
    startCommand: gunicorn app:app
```

### MongoDB Atlas (producción):
```
1. Crear cuenta en mongodb.com/cloud/atlas
2. Crear cluster M0 (gratuito)
3. Network Access → Allow from anywhere (0.0.0.0/0)
4. Database Access → crear usuario con contraseña fuerte
5. Connect → Drivers → copiar connection string
6. Reemplazar MONGO_URI en variables de entorno de producción
```

---

## ⚙️ GitHub Actions — CI/CD

### .github/workflows/ci.yml
```yaml
name: CI — Tests
on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd backend && npm ci
      - run: cd backend && npm test -- --coverage
      - name: Coverage badge
        run: echo "Coverage OK"

  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with: { python-version: '3.11' }
      - run: cd ai-service && pip install -r requirements.txt
      - run: cd ai-service && python model/trainer.py
      - run: cd ai-service && pytest --cov=model tests/ --cov-fail-under=80

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: cd frontend && npm ci
      - run: cd frontend && npx ng test --watch=false --browsers=ChromeHeadless
```

### .github/workflows/deploy.yml
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    needs: [test-backend, test-python]  # Solo despliega si los tests pasan
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service hearguard-backend
          railway up --service hearguard-ai
```

---

## 📱 Compilar Flutter APK

```bash
cd flutter_app

# Android APK debug
flutter build apk --debug

# Android APK release (necesita keystore)
flutter build apk --release

# Android App Bundle (para Play Store)
flutter build appbundle

# iOS (solo en macOS con Xcode)
flutter build ios --release

# Archivo generado en:
# build/app/outputs/flutter-apk/app-release.apk
```

---

## 🏁 Criterio de éxito de esta fase (= éxito del proyecto completo)

- [ ] `docker-compose up` levanta todo el sistema en un solo comando
- [ ] Flutter app compila y corre en emulador Android sin errores
- [ ] Las 10 pantallas de Flutter replican fielmente los mockups
- [ ] Backend desplegado en Railway/Render y accesible desde internet
- [ ] MongoDB Atlas configurado con los datos de producción
- [ ] GitHub Actions ejecuta tests en cada PR automáticamente
- [ ] Deploy automático en cada merge a `main` que pase los tests
- [ ] APK de Android generado y funcionando en dispositivo físico
- [ ] URL de producción del backend documentada en README.md

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_6_FlutterDeploy.md @Normativas_Estandares.docx

Implementa la Fase 6 final de HearGuard AI:

1. Flutter app completa con las 10 pantallas del mockup:
   - app_theme.dart con la paleta oficial (#0D1117, #00E5FF, #7C4DFF)
   - Fuente Poppins configurada
   - Todas las pantallas replicando el diseño exacto de los mockups

2. Docker setup completo:
   - backend.Dockerfile, ai-service.Dockerfile
   - docker-compose.yml con MongoDB + Backend + AI + Nginx

3. GitHub Actions:
   - ci.yml: tests en Node.js, Python y Flutter
   - deploy.yml: deploy automático a Railway en merge a main

4. README.md actualizado con instrucciones de deploy

Este es el sprint final. El objetivo es tener el sistema completo
corriendo en producción y el APK de Android compilado.
```
