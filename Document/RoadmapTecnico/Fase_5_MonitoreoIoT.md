# 📡 Fase 5 — Monitoreo en Vivo + Historial + IoT Arduino

> **Prerequisito:** Fase 4 completada. La predicción IA funciona y se guarda en MongoDB.
> **Novedad de esta fase:** Primera integración con hardware real (Arduino/ESP32).

---

## 🎯 Objetivo de esta fase

Implementar el monitoreo de ruido en tiempo real (desde el micrófono del dispositivo o desde el sensor IoT Arduino), el historial paginado con filtros, y la integración completa del flujo de datos IoT → Backend → Frontend.

---

## 📁 Archivos a crear en esta fase

```
frontend/src/app/features/
├── monitor/
│   ├── monitor.component.ts           ← Pantalla 5: Monitoreo en vivo
│   └── noise-monitor.service.ts       ← Lógica de lectura de micrófono
└── history/
    └── history.component.ts           ← Pantalla 9: Historial

backend/src/
├── controllers/
│   └── noise.controller.js            ← CRUD registros de ruido
├── routes/
│   └── noise.routes.js                ← /api/noise/*
└── services/
    └── noise.service.js               ← Lógica clasificación + estadísticas

arduino/
├── hearguard_sensor/
│   └── hearguard_sensor.ino           ← Sketch Arduino C++
└── README_arduino.md                  ← Instrucciones de conexión

tests/
└── noise.test.js                      ← Tests TDD obligatorios
```

---

## 🎤 Servicio de Monitoreo — noise-monitor.service.ts

### Fuente 1: Micrófono del dispositivo (Web Audio API)
```typescript
// Usar getUserMedia({ audio: true }) para acceder al micrófono
// Crear AnalyserNode con fftSize = 2048
// Calcular RMS del buffer de audio → convertir a dB:
//   dB = 20 * Math.log10(rms) + 94  (referencia SPL de micrófono)
// Polling cada 1 segundo: actualizar dBLevel$ signal
// Al superar umbral configurable: disparar alerta visual
```

### Fuente 2: Backend polling (IoT Arduino)
```typescript
// GET /api/noise/latest cada 5 segundos
// Mostrar el dato más reciente del dispositivo IoT registrado
// Si no hay dispositivo registrado → usar micrófono como fallback
```

### Clasificación de niveles de riesgo:
```typescript
const classifyRisk = (db: number): { tag: string; color: string } => {
  if (db < 55)  return { tag: 'Bajo',     color: '#22C55E' };
  if (db < 70)  return { tag: 'Moderado', color: '#F59E0B' };
  if (db < 85)  return { tag: 'Alto',     color: '#FF8C00' };
  return            { tag: 'Muy Alto',  color: '#FF4D4D' };
};
// OMS: exposición segura < 70 dB por 8h, daño en > 85 dB
```

---

## 🖼️ Especificación Pantalla 5 — MonitorComponent

**Header:** "Monitoreo en vivo" | flecha back `←` | ícono configuración ⚙️

**Gauge principal de dB (grande, centrado):**
- SVG semicircular tipo velocímetro (180°)
- Track completo en `var(--border)`
- Fill en gradiente: verde → ámbar → rojo según valor
- Número grande centrado: `XX dB`
- Label debajo: nivel actual (Bajo / Moderado / Alto / Muy Alto)

**Sección "Historial en tiempo real":**
- Chart.js LineChart: actualización en tiempo real con los últimos 30 puntos
- Eje Y: 0-120 dB
- Eje X: timestamps de los últimos 5 minutos
- Línea en `var(--accent-cyan)`, área rellena con opacidad 0.1
- Línea de referencia horizontal en 85 dB (zona de daño) en rojo punteado

**Card "Tiempo expuesto hoy":**
- Ícono reloj en `var(--accent-cyan)`
- Valor: "Xh Ym" en texto grande
- Subtexto: "de 8h recomendadas"
- Barra de progreso: verde si <4h, ámbar si 4-6h, rojo si >6h

**Estado de fuente de datos:**
- Indicador: "🎤 Micrófono" o "📡 Dispositivo: [nombre]"
- Punto verde parpadeante si activo

---

## 🛣️ Backend — Endpoints de Ruido

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/noise` | ✅ o API Key | Registrar nuevo nivel de ruido |
| GET | `/api/noise` | ✅ | Historial filtrado por fechas |
| GET | `/api/noise/latest` | ✅ | Último registro del usuario |
| GET | `/api/noise/stats/today` | ✅ | Estadísticas del día (promedio, máx, tiempo expuesto) |
| GET | `/api/noise/stats/week` | ✅ | Estadísticas de la semana |

### Lógica POST /api/noise:
```javascript
// Clasificar automáticamente el riskTag según el dbLevel
// Si source === 'iot': validar que deviceId existe en BD y pertenece al usuario
// Si dbLevel > 85: guardar con flag highRisk: true para alertas futuras
// Calcular tiempo expuesto acumulado del día si dbLevel > 70
```

### Lógica GET /api/noise (con filtros):
```javascript
// Query params: from (Date), to (Date), source, limit (default:50), skip
// Siempre filtrar por userId del token JWT
// Ordenar por recordedAt DESC
// Retornar array + metadata: { total, page, avgDb, maxDb, exposureMinutes }
```

---

## 🖼️ Especificación Pantalla 9 — HistoryComponent

**Header:** "Historial" | filtro ícono `⊿`

**Tabs horizontales (sin bordes):**
- "Ruido" | "Pruebas" | "Recomendaciones"
- Tab activo: texto en `var(--accent-cyan)` con borde inferior de 2px cyan

**Sección Ruido:**
- Label de mes: "Junio 2024" en cyan
- Lista de registros: [timestamp] [valor dB] [badge de nivel]
- Badge colores: verde/ámbar/rojo según nivel
- Al hacer tap en registro → mostrar detalles (ubicación, fuente)

**Sección Pruebas:**
- Lista de evaluaciones: fecha + score general + gauge mini
- Gauge mini: círculo SVG 28px con % de score
- Al hacer tap → navegar a `/app/results/:id`

**Sección Recomendaciones:**
- Lista de recomendaciones recibidas con fecha
- Ícono de categoría + título + si fue "leída"

---

## 🔧 Arduino — Sketch C++ (hearguard_sensor.ino)

```cpp
// Hardware requerido:
// - Arduino Uno/Nano o ESP8266/ESP32
// - Módulo sensor de sonido KY-037 o MAX4466
// - (Opcional ESP32/8266) Módulo WiFi integrado para HTTP

// Pines:
// - Sensor analógico: A0
// - LED indicador: D13

// Lógica principal:
// 1. Leer valor analógico del sensor (0-1023)
// 2. Convertir a dB: dB = map(sensorValue, 0, 1023, 30, 130)
// 3. Cada 5 segundos: enviar POST a backend
// 4. Para ESP32/8266 con WiFi: HTTP POST a /api/noise con JSON
// 5. Para Arduino sin WiFi: enviar por Serial al PC → app puente Node.js

// Payload JSON a enviar:
// { "dbLevel": 75, "deviceMac": "AA:BB:CC:DD:EE:FF", "source": "iot" }

// En backend: crear endpoint especial /api/noise/iot
// que acepta autenticación por API Key en header X-Device-Key
// La API Key se genera al registrar el dispositivo en el perfil del usuario
```

### README_arduino.md debe incluir:
- Lista de componentes con links de compra
- Esquema de conexión (Fritzing o descripción textual)
- Cómo obtener la MAC address del dispositivo
- Cómo registrar el dispositivo en la app
- Instrucciones de upload del sketch

---

## 🧪 Tests TDD obligatorios — noise.test.js

```
✅ POST /api/noise
   - Debe crear registro con riskTag calculado automáticamente
   - dbLevel 45 → riskTag = 'bajo'
   - dbLevel 72 → riskTag = 'moderado'
   - dbLevel 87 → riskTag = 'alto'
   - dbLevel 105 → riskTag = 'muy_alto'
   - Debe rechazar request sin autenticación
   - Debe rechazar dbLevel fuera de rango (< 0 o > 200)
   - Source 'iot' con deviceId inexistente → HTTP 404

✅ GET /api/noise
   - Debe retornar solo registros del usuario autenticado
   - Filtro por fecha from/to funciona correctamente
   - Paginación limit/skip funciona
   - No retorna registros de otros usuarios

✅ GET /api/noise/stats/today
   - Retorna avgDb, maxDb, exposureMinutes correctos
   - exposureMinutes cuenta solo los registros con dbLevel > 70

✅ noise-monitor.service.spec.ts (Angular)
   - classifyRisk(45) → { tag: 'Bajo', color: '#22C55E' }
   - classifyRisk(95) → { tag: 'Muy Alto', color: '#FF4D4D' }
```

---

## 🏁 Criterio de éxito de esta fase

- [ ] MonitorComponent muestra dB en tiempo real desde el micrófono del dispositivo
- [ ] La gráfica de Chart.js se actualiza en tiempo real (nuevos puntos cada segundo)
- [ ] HistoryComponent muestra las 3 pestañas con datos reales de MongoDB
- [ ] Filtros por fecha y tipo funcionan correctamente
- [ ] Backend acepta registros de Arduino via POST /api/noise/iot con API Key
- [ ] `npm test` pasa al 100% en backend
- [ ] El sketch Arduino compila sin errores en Arduino IDE

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_5_MonitoreoIoT.md @DB_Modelo_BaseDatos.docx @Normativas_Estandares.docx

Implementa la Fase 5 de HearGuard AI:

1. noise-monitor.service.ts:
   - Leer micrófono con getUserMedia + AnalyserNode
   - Calcular dB en tiempo real (polling cada 1s)
   - Clasificar: < 55=Bajo, 55-70=Moderado, 70-85=Alto, > 85=Muy Alto

2. MonitorComponent:
   - Gauge semicircular SVG (velocímetro) con gradiente de color
   - Chart.js LineChart en tiempo real (últimos 30 puntos)
   - Card de tiempo expuesto hoy con barra de progreso

3. Backend noise.controller.js + noise.routes.js:
   - POST /api/noise con clasificación automática
   - GET /api/noise con filtros from/to + paginación
   - GET /api/noise/stats/today

4. HistoryComponent con 3 tabs (Ruido / Pruebas / Recomendaciones)

5. Sketch Arduino C++ para sensor KY-037

6. Tests noise.test.js con Jest + Supertest

NO avances a Fase 6 hasta que el monitoreo en tiempo real funcione y los tests pasen.
```
