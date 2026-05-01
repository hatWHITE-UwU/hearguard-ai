# 🅰️ Fase 2 — Frontend Angular: Auth + Dashboard

> **Prerequisito:** Fase 1 completada y todos sus tests en verde.
> **Regla de oro:** No pases a la Fase 3 hasta que login → dashboard funcione end-to-end.

---

## 🎯 Objetivo de esta fase

Construir las pantallas de autenticación y el dashboard principal en Angular 17, conectadas al backend de la Fase 1, con la paleta de colores y tipografía oficial de HearGuard AI.

---

## 🎨 Design System (obligatorio en todos los componentes)

```scss
// styles.scss global — aplicar en :root
:root {
  --bg-primary:    #0D1117;
  --bg-secondary:  #0F1923;
  --bg-card:       #15202B;
  --bg-card2:      #1C2A3A;
  --accent-cyan:   #00E5FF;
  --accent-purple: #7C4DFF;
  --success:       #22C55E;
  --warning:       #F59E0B;
  --danger:        #FF4D4D;
  --text-primary:  #E8F4F8;
  --text-muted:    #8BA3B8;
  --text-muted2:   #526070;
  --border:        #1E3040;
}

// Importar Poppins
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
* { font-family: 'Poppins', sans-serif; }
body { background: var(--bg-primary); color: var(--text-primary); }
```

---

## 📁 Archivos a crear en esta fase

```
frontend/src/app/
├── core/
│   ├── guards/
│   │   └── auth.guard.ts              ← Protege rutas /app/*
│   ├── interceptors/
│   │   └── auth.interceptor.ts        ← Inyecta Bearer token
│   └── services/
│       └── auth.service.ts            ← Login/register/logout/currentUser signal
├── shared/
│   ├── components/
│   │   ├── gauge/
│   │   │   └── gauge.component.ts     ← Componente reutilizable de gauge circular
│   │   └── risk-badge/
│   │       └── risk-badge.component.ts ← Badge de nivel de riesgo
│   └── models/
│       ├── user.model.ts              ← Interface User
│       └── auth.model.ts              ← Interfaces LoginRequest, RegisterRequest, AuthResponse
├── features/
│   ├── splash/
│   │   └── splash.component.ts        ← Pantalla 1: animación + botón iniciar
│   ├── auth/
│   │   ├── login/
│   │   │   └── login.component.ts     ← Pantalla 2: Login
│   │   └── register/
│   │       └── register.component.ts  ← Pantalla 3: Registro
│   ├── dashboard/
│   │   └── dashboard.component.ts     ← Pantalla 4: Home/Dashboard
│   └── profile/
│       └── profile.component.ts       ← Pantalla 10: Perfil
└── app.routes.ts                      ← Rutas con lazy loading
```

---

## 🖼️ Especificación de cada pantalla

### Pantalla 1 — SplashComponent (`/`)
- Fondo: `var(--bg-primary)` `#0D1117`
- Logo SVG del oído con ondas en `#00E5FF`
- Título: **"Hear**Guard AI" (Hear en blanco, Guard en cyan)
- Subtítulo: "Cuida tu audición, protege tu futuro." en `var(--text-muted)`
- Animación de onda SVG debajo del texto (polyline animada con CSS)
- Botón primario: "Iniciar evaluación" en `var(--accent-cyan)` con texto negro
- Auto-redirect al Dashboard si ya hay JWT válido en localStorage

### Pantalla 2 — LoginComponent (`/auth/login`)
- Título centrado: "¡Bienvenido!" con logo pequeño del oído arriba
- Subtítulo: "Inicia sesión para continuar"
- Input: Correo electrónico (type=email, reactive form)
- Input: Contraseña (type=password, toggle mostrar/ocultar con ojo SVG)
- Checkbox: "Recordarme" a la izquierda, "¿Olvidaste tu contraseña?" (link cyan) a la derecha
- Botón: "Iniciar sesión" en `var(--accent-cyan)` con texto negro, full width
- Link inferior: "¿No tienes cuenta? **Regístrate**" → `/auth/register`
- Validaciones: mostrar error inline debajo de cada campo
- Loading state: spinner dentro del botón mientras hace la llamada API

### Pantalla 3 — RegisterComponent (`/auth/register`)
- Flecha back `←` arriba izquierda → `/auth/login`
- Título: "Crear cuenta", subtítulo: "Únete a HearGuard AI"
- Inputs: Nombre completo, Correo electrónico, Contraseña, Confirmar contraseña
- Validación de contraseñas iguales en tiempo real
- Botón: "Registrarme" en `var(--accent-cyan)`, full width
- Link inferior: "¿Ya tienes cuenta? Inicia sesión"

### Pantalla 4 — DashboardComponent (`/app/dashboard`)
- Header: ícono hamburguesa (izq) | "Dashboard" (centro) | ícono campana (der)
- Saludo: "Hola, [nombre] 👋" + subtítulo "Resumen de tu salud auditiva"
- **Card de riesgo:** gauge circular SVG (doughnut) con riskScore del último resultado. Color: verde si <26, ámbar si 26-50, rojo si >50. Texto: nivel + score/100
- **Card de ruido:** "Exposición al ruido hoy" con valor en dB promedio + minigráfica de línea (Chart.js)
- **Grid 2x2 de accesos rápidos:** Prueba auditiva / Monitoreo en vivo / Historial / Recomendaciones (cards pequeñas con ícono SVG y label)
- Bottom navbar: Inicio / Historial / Consejos / Perfil (ícono activo en cyan)

### Pantalla 10 — ProfileComponent (`/app/profile`)
- Avatar circular con inicial del nombre en `var(--accent-purple)`
- Nombre + email
- Botón "Editar perfil" outline
- Sección "Información personal": Edad, Género, Ocupación, Ciudad (todos editables)
- Sección "Configuración": Recordatorios (toggle), Tema oscuro (toggle ON), Unidades de volumen
- Botón "Cerrar sesión" en rojo → limpia JWT y redirect a `/`

---

## 🔧 Servicios a implementar

### auth.service.ts
```typescript
// Signals a exponer:
currentUser = signal<User | null>(null);
isAuthenticated = computed(() => !!this.currentUser());

// Métodos:
login(req: LoginRequest): Observable<AuthResponse>
register(req: RegisterRequest): Observable<AuthResponse>
logout(): void                    // limpia storage + resetea signal
refreshToken(): Observable<string>
loadUserFromStorage(): void       // llamar en APP_INITIALIZER
```

### auth.interceptor.ts
```typescript
// Intercepta todos los requests a /api/*
// Agrega header: Authorization: Bearer <token>
// Si recibe 401 → intenta refresh → reintenta request original
// Si refresh falla → logout() + redirect /auth/login
```

### auth.guard.ts
```typescript
// canActivate: verifica isAuthenticated()
// Si no autenticado → redirect a /auth/login
// Si autenticado → permite acceso
```

---

## 📦 Dependencias a instalar

```bash
cd frontend
npm install chart.js ng2-charts @auth0/angular-jwt
```

---

## 🧪 Tests TDD obligatorios — Fase 2

```
✅ auth.service.spec.ts
   - login exitoso guarda token en localStorage
   - login fallido no guarda token y lanza error
   - logout limpia localStorage y resetea currentUser signal
   - loadUserFromStorage restaura sesión si hay token válido
   - loadUserFromStorage no falla si no hay token

✅ auth.guard.spec.ts
   - permite acceso si usuario autenticado
   - redirige a /auth/login si no autenticado

✅ auth.interceptor.spec.ts
   - agrega header Authorization a requests /api/*
   - NO agrega header si no hay token
```

---

## 🏁 Criterio de éxito de esta fase

- [ ] Splash → Login → Register → Dashboard funciona sin errores
- [ ] JWT se guarda en localStorage y persiste al recargar
- [ ] Dashboard muestra datos reales del backend (usuario autenticado)
- [ ] Rutas protegidas redirigen si no hay sesión
- [ ] Paleta de colores y fuente Poppins aplicadas en todas las pantallas
- [ ] `npm test` pasa al 100%
- [ ] No hay `console.error` no manejados en la consola del browser

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_2_Frontend_Auth.md @Normativas_Estandares.docx @HearGuardAI_Empresa_HistoriasUsuario.docx

Implementa la Fase 2 de HearGuard AI completa:
1. Configura el design system global (paleta + Poppins en styles.scss)
2. AuthService con Signals, interceptor y guard
3. SplashComponent, LoginComponent, RegisterComponent con reactive forms
4. DashboardComponent con gauge de riesgo real y mini chart de ruido
5. ProfileComponent con datos del usuario
6. app.routes.ts con lazy loading en todas las rutas

Usa la paleta oficial: #0D1117 fondo, #00E5FF cyan, #7C4DFF purple.
NO pases a Fase 3 hasta que login → dashboard funcione end-to-end.
```
