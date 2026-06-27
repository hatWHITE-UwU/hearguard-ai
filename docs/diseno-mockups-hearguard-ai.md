# DISEÑO Y MOCKUPS
## HearGuard AI v1.0 — Interfaz Web (Angular 21) y Móvil (Flutter 3)

---

**Institución:** Universidad Continental
**Autores:** Terreros Hinojosa, Luis Francisco / Rondinel Aquino, Hardy Eduardo
**Asesor:** Maglioni Arana Caparachín
**Versión:** 1.0 · Junio 2026
**Despliegue web:** https://frontend-tau-tan-95.vercel.app

---

## 1. SISTEMA DE DISEÑO

### 1.1 Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `--color-primary` | `#1F4E79` | Navbar, botones primarios, encabezados |
| `--color-accent` | `#2E75B6` | Botones secundarios, links, badges |
| `--color-risk-low` | `#22C55E` | Nivel de riesgo Bajo |
| `--color-risk-moderate` | `#F59E0B` | Nivel de riesgo Moderado |
| `--color-risk-high` | `#FF8C00` | Nivel de riesgo Alto |
| `--color-risk-very-high` | `#EF4444` | Nivel de riesgo Muy Alto |
| `--color-bg` | `#F8FAFC` | Fondo general de la aplicación |
| `--color-surface` | `#FFFFFF` | Fondo de tarjetas y paneles |
| `--color-text` | `#1E293B` | Texto principal |
| `--color-text-muted` | `#64748B` | Texto secundario, etiquetas |

### 1.2 Tipografía

| Uso | Fuente | Tamaño | Peso |
|---|---|---|---|
| Títulos principales | Inter | 24–32 px | 700 |
| Subtítulos de sección | Inter | 18–20 px | 600 |
| Cuerpo de texto | Inter | 14–16 px | 400 |
| Etiquetas / badges | Inter | 11–13 px | 500 |
| Valores numéricos (gauge) | Inter | 36–48 px | 700 |

### 1.3 Componentes base

| Componente | Descripción |
|---|---|
| `RiskBadgeComponent` | Badge coloreado con icono y etiqueta del nivel de riesgo |
| `GaugeComponent` | Indicador circular animado 0–100 con zonas de color |
| `CardComponent` | Contenedor con sombra, borde redondeado y padding estándar |
| `AlertComponent` | Mensaje de estado (success/warning/error/info) |
| `LoadingSpinnerComponent` | Indicador de carga centrado |

---

## 2. ARQUITECTURA DE NAVEGACIÓN

```
┌─────────────────────────────────────────────────────┐
│                    SPLASH SCREEN                    │
│              (Logo + animación 2.5 s)               │
└─────────────────────┬───────────────────────────────┘
                      │
          ┌───────────▼───────────┐
          │   ¿Tiene sesión?      │
          └───┬───────────────────┘
        No ◄──┤►── Sí
              │         │
    ┌─────────▼──┐  ┌───▼──────────────────────────────────┐
    │   AUTH     │  │           APP SHELL                  │
    │ ┌────────┐ │  │  ┌──────────────────────────────┐   │
    │ │ Login  │ │  │  │       Menú lateral           │   │
    │ └────────┘ │  │  │  • Dashboard                 │   │
    │ ┌────────┐ │  │  │  • Monitor de ruido          │   │
    │ │Register│ │  │  │  • Prueba auditiva           │   │
    │ └────────┘ │  │  │  • Historial                 │   │
    └────────────┘  │  │  • Dispositivos IoT          │   │
                    │  │  • Perfil                    │   │
                    │  │  • Cerrar sesión             │   │
                    │  └──────────────────────────────┘   │
                    └──────────────────────────────────────┘
```

---

## 3. MOCKUPS POR PANTALLA

### 3.1 Pantalla de Inicio — Splash Screen

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│           🎧                        │
│      ╔═══════════╗                  │
│      ║ HearGuard ║                  │
│      ║    AI     ║                  │
│      ╚═══════════╝                  │
│                                     │
│   Protegiendo tu salud auditiva     │
│                                     │
│         ████████░░░░  75%           │
│                                     │
│                                     │
└─────────────────────────────────────┘
Color fondo: #1F4E79  |  Logo: blanco
Barra de carga animada: #2E75B6
```

---

### 3.2 Pantalla de Login

```
┌─────────────────────────────────────┐
│  HearGuard AI                       │
│  ─────────────────────────────────  │
│                                     │
│          Iniciar sesión             │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  📧  correo@email.com       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  🔒  ••••••••••             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │      INICIAR SESIÓN         │    │  ← Botón #1F4E79
│  └─────────────────────────────┘    │
│                                     │
│  ¿No tienes cuenta? Regístrate →   │
│                                     │
└─────────────────────────────────────┘
```

---

### 3.3 Pantalla de Registro

```
┌─────────────────────────────────────┐
│  ← Volver                           │
│  ─────────────────────────────────  │
│         Crear cuenta                │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  👤  Nombre completo        │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  📧  Correo electrónico     │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  🔒  Contraseña (min. 8)   │    │
│  └─────────────────────────────┘    │
│  ┌──────────────────────┐           │
│  │  🎂  Edad  [  25  ]  │           │
│  └──────────────────────┘           │
│                                     │
│  ┌─────────────────────────────┐    │
│  │         REGISTRARSE         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

---

### 3.4 Dashboard Principal

```
┌────────┬────────────────────────────────────────────┐
│        │  Dashboard de Salud Auditiva               │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │  ┌──────────────┐  ┌───────────────────┐  │
│   Ú    │  │  RIESGO      │  │  EXPOSICIÓN       │  │
│        │  │  ACTUAL      │  │  ESTA SEMANA      │  │
│  📊    │  │              │  │                   │  │
│ Dashboard│  │    ╭───╮    │  │  █               │  │
│        │  │   /  42  \   │  │  █  █            │  │
│  🎙️   │  │  │ MODER. │  │  │  █  █  █         │  │
│ Monitor│  │   \      /   │  │  █  █  █  █      │  │
│        │  │    ╰───╯    │  │  L  M  X  J  V   │  │
│  👂    │  │  ⚠️ Moderado │  │  62 dB promedio  │  │
│ Prueba │  └──────────────┘  └───────────────────┘  │
│        │                                            │
│  📋    │  ┌────────────────────────────────────┐   │
│ Histor.│  │  ÚLTIMA EVALUACIÓN — 25 Jun 2026   │   │
│        │  │  Score: 7.2/10 · Riesgo: Moderado  │   │
│  📡    │  └────────────────────────────────────┘   │
│ IoT    │                                            │
│        │  ┌────────────────────────────────────┐   │
│  👤    │  │  RECOMENDACIONES ACTIVAS           │   │
│ Perfil │  │  • Reduce el volumen al 60 %       │   │
│        │  │  • Descansa 10 min/hora de audio   │   │
└────────┴────────────────────────────────────────────┘
```

---

### 3.5 Monitor de Ruido en Tiempo Real

```
┌────────┬────────────────────────────────────────────┐
│        │  Monitor de Ruido                          │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │         ╭───────────────╮                  │
│   Ú    │        /                 \                 │
│        │       /    ╭───────╮     \                │
│        │      │    /         \     │                │
│        │      │   │   68 dB  │     │               │
│        │      │   │ MODERADO │     │               │
│        │      │    \         /     │               │
│        │       \    ╰───────╯     /                │
│        │        \                 /                 │
│        │         ╰───────────────╯                  │
│        │         🟡 Nivel Moderado                  │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ Clasificación:                       │ │
│        │  │ < 55 dB  🟢 Bajo                    │ │
│        │  │ 55-75 dB 🟡 Moderado  ← ACTUAL      │ │
│        │  │ 75-90 dB 🟠 Alto                    │ │
│        │  │ > 90 dB  🔴 Muy Alto                │ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │  [ ⏹ DETENER ]  [ 💾 GUARDAR LECTURA ]   │
└────────┴────────────────────────────────────────────┘
```

---

### 3.6 Prueba Auditiva — Paso 5 de 12

```
┌────────┬────────────────────────────────────────────┐
│        │  Prueba Auditiva                           │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │  Progreso: ████████████░░░░░░  5 / 12     │
│   Ú    │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │                                      │ │
│        │  │   Frecuencia: 1 000 Hz               │ │
│        │  │   Oído: IZQUIERDO  👂                 │ │
│        │  │                                      │ │
│        │  │   ¿Qué tan bien percibes sonidos     │ │
│        │  │   en esta frecuencia?                │ │
│        │  │                                      │ │
│        │  │   0 ──────────●────────── 10         │ │
│        │  │   No escucho            Perfecto     │ │
│        │  │                                      │ │
│        │  │   Puntaje actual: 7                  │ │
│        │  │                                      │ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │   [ ← ANTERIOR ]    [ SIGUIENTE → ]       │
└────────┴────────────────────────────────────────────┘
```

---

### 3.7 Resultados — Nivel de Riesgo

```
┌────────┬────────────────────────────────────────────┐
│        │  Resultado de tu Evaluación                │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │  ┌──────────────────────────────────────┐ │
│   Ú    │  │                                      │ │
│        │  │           NIVEL DE RIESGO            │ │
│        │  │                                      │ │
│        │  │         ╭─────────────╮              │ │
│        │  │        /               \             │ │
│        │  │       │   🔴  ALTO     │             │ │
│        │  │       │    Score: 68   │             │ │
│        │  │        \               /             │ │
│        │  │         ╰─────────────╯              │ │
│        │  │                                      │ │
│        │  │  Equivale a ~8 años de exposición   │ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │  Principales factores de riesgo:          │
│        │  ⚠️  Alto uso de auriculares (8h/día)     │
│        │  ⚠️  Volumen elevado (85%)               │
│        │  ⚠️  Exposición laboral al ruido          │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │  RECOMENDACIONES                     │ │
│        │  │  ✓ Usa protección auditiva           │ │
│        │  │  ✓ Reduce el tiempo con auriculares  │ │
│        │  │  ✓ Consulta a un audiólogo           │ │
│        │  └──────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────┘
```

---

### 3.8 Historial de Evaluaciones

```
┌────────┬────────────────────────────────────────────┐
│        │  Historial de Evaluaciones                 │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │  Evolución del riesgo:                     │
│   Ú    │                                            │
│        │   Alto ─── ─── ─── ─── ●                 │
│        │   Mod. ─── ─── ─●─ ─●─ ─── ─●            │
│        │   Bajo ─●─ ─●─ ─── ─── ─── ───            │
│        │         E  F  M  A  M  J                  │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ 25 Jun 2026    🔴 ALTO      Score 68 │ │
│        │  └──────────────────────────────────────┘ │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ 10 Jun 2026    🟡 MODERADO  Score 52 │ │
│        │  └──────────────────────────────────────┘ │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ 28 May 2026    🟡 MODERADO  Score 48 │ │
│        │  └──────────────────────────────────────┘ │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ 05 May 2026    🟢 BAJO      Score 22 │ │
│        │  └──────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────┘
```

---

### 3.9 Gestión de Dispositivos IoT

```
┌────────┬────────────────────────────────────────────┐
│        │  Dispositivos IoT                          │
│   M    │  ──────────────────────────────────────    │
│   E    │                                 [+ Agregar]│
│   N    │                                            │
│   Ú    │  ┌──────────────────────────────────────┐ │
│        │  │ 📡 Sensor Laboratorio 1              │ │
│        │  │ Estado: 🟢 Activo                    │ │
│        │  │ Última conexión: hace 5 minutos       │ │
│        │  │ Lecturas hoy: 48                      │ │
│        │  │                    [Desactivar]       │ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ 📡 Sensor Habitación                 │ │
│        │  │ Estado: ⚫ Inactivo                  │ │
│        │  │ Última conexión: hace 3 días          │ │
│        │  │                    [Activar]          │ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │  ℹ️ Cómo conectar un ESP32           │ │
│        │  │  Ver manual de instalación →          │ │
│        │  └──────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────┘
```

---

### 3.10 Perfil de Usuario

```
┌────────┬────────────────────────────────────────────┐
│        │  Mi Perfil                                 │
│   M    │  ──────────────────────────────────────    │
│   E    │                                            │
│   N    │         ╭───────╮                          │
│   Ú    │        │   LT   │  ← Avatar iniciales     │
│        │         ╰───────╯                          │
│        │      Luis Terreros                        │
│        │      luisterreroshinojosa@gmail.com        │
│        │      Miembro desde: Enero 2026            │
│        │                                            │
│        │  ┌──────────────────────────────────────┐ │
│        │  │ Nombre      [ Luis Francisco T.     ]│ │
│        │  │ Edad        [        25             ]│ │
│        │  │ Ocupación   [ Estudiante universitario│ │
│        │  └──────────────────────────────────────┘ │
│        │                                            │
│        │  Resumen de salud:                        │
│        │  📊 Evaluaciones realizadas: 4            │
│        │  🎙️ Lecturas de ruido: 127                │
│        │  📡 Dispositivos activos: 1               │
│        │                                            │
│        │  [   GUARDAR CAMBIOS   ]                  │
└────────┴────────────────────────────────────────────┘
```

---

## 4. MOCKUPS APLICACIÓN MÓVIL (Flutter 3)

### 4.1 Login Móvil

```
┌─────────────────────┐
│  ████ HearGuard AI  │  ← Status bar
│                     │
│                     │
│       🎧            │
│   HearGuard AI      │
│                     │
│ ┌─────────────────┐ │
│ │ correo@email.com│ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ ••••••••••      │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ INICIAR SESIÓN  │ │
│ └─────────────────┘ │
│                     │
│ ¿Sin cuenta?        │
│ Regístrate aquí →  │
│                     │
└─────────────────────┘
```

### 4.2 Dashboard Móvil

```
┌─────────────────────┐
│  ████  Dashboard ≡  │
│                     │
│  ╭───────────────╮  │
│  │    ╭─────╮    │  │
│  │   /  42   \   │  │
│  │  │ MODERADO│  │  │
│  │   \       /   │  │
│  │    ╰─────╯    │  │
│  │ ⚠️ Moderado   │  │
│  ╰───────────────╯  │
│                     │
│ ╭───────────────╮   │
│ │ Exposición    │   │
│ │ █ █ █ █      │   │
│ │ L M X J      │   │
│ ╰───────────────╯   │
│                     │
│ ╭───────────────╮   │
│ │ Última evalua.│   │
│ │ 25 Jun · Alto │   │
│ ╰───────────────╯   │
└─────────────────────┘
```

### 4.3 Monitor Móvil

```
┌─────────────────────┐
│  ████  Monitor   ≡  │
│                     │
│                     │
│     ╭─────────╮     │
│    /           \    │
│   /   72 dB    \   │
│  │   MODERADO   │  │
│   \             /   │
│    \           /    │
│     ╰─────────╯     │
│     🟡 Moderado     │
│                     │
│  Hoy: 65 dB prom.  │
│                     │
│ ┌─────────────────┐ │
│ │  ⏹ DETENER     │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 💾 GUARDAR      │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 5. DIAGRAMA DE FLUJO DE USUARIO PRINCIPAL

```
USUARIO
  │
  ▼
[Splash] ──2.5s──► [Login / Registro]
                         │
                         ▼
                    [Dashboard]
                    /    |     \
                   /     |      \
                  ▼      ▼       ▼
            [Monitor] [Prueba  [Historial]
            [Ruido]   auditiva]
                │         │
                │         ▼
                │    [Resultados]
                │         │
                └────┬────┘
                     ▼
              [Dashboard actualizado]
                     │
                     ▼
              [Recomendaciones]
```

---

## 6. DECISIONES DE DISEÑO

| Decisión | Justificación |
|---|---|
| Gauge circular como indicador principal | Comunica el riesgo de forma intuitiva sin necesidad de leer texto; universal para usuarios no técnicos |
| Código de colores semáforo (verde/amarillo/naranja/rojo) | Convención reconocida internacionalmente para niveles de alerta; accesible con suficiente contraste |
| Menú lateral fijo (no bottom bar) en web | Permite visibilidad permanente de las secciones en pantallas de escritorio (≥ 1024 px) |
| Bottom navigation bar en móvil Flutter | Patrón Material Design 3 estándar para apps Android/iOS; acceso con el pulgar |
| Flujo linear de 12 pasos en la prueba auditiva | Reduce la carga cognitiva presentando un estímulo a la vez; barra de progreso reduce la ansiedad |
| Soft delete visual (badge "Inactivo") | El usuario percibe que el dispositivo sigue existiendo aunque desactivado; reduce errores de borrado accidental |
| Score numérico + nivel cualitativo | El número (0–100) satisface a usuarios técnicos; el nivel (Bajo/Alto) es comprensible para todos |

---

*HearGuard AI v1.0 · Universidad Continental · 2026*
*Implementación web: Angular 21 · Implementación móvil: Flutter 3*
*URL de producción: https://frontend-tau-tan-95.vercel.app*
