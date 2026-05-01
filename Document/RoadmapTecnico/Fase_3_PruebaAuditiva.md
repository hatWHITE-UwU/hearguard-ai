# 🎧 Fase 3 — Prueba Auditiva + Web Audio API

> **Prerequisito:** Fase 2 completada. Login → Dashboard funciona end-to-end.
> **Módulo CORE del proyecto.** Es el corazón de HearGuard AI — requiere máxima atención.

---

## 🎯 Objetivo de esta fase

Implementar la prueba de audiometría tonal básica usando Web Audio API, el formulario de hábitos auditivos, el backend de evaluaciones, y la pantalla de resultados con Chart.js.

---

## 📁 Archivos a crear en esta fase

```
frontend/src/app/features/
├── hearing-test/
│   ├── hearing-test.component.ts      ← Pantalla 6: Prueba auditiva
│   ├── hearing-test.service.ts        ← Web Audio API + lógica de tonos
│   └── habit-form/
│       └── habit-form.component.ts    ← Formulario de hábitos (4 preguntas)
└── results/
    └── results.component.ts           ← Pantalla 7: Resultados por frecuencia

backend/src/
├── models/
│   └── Evaluation.js                  ← (ya existe, verificar campos)
├── controllers/
│   └── evaluation.controller.js       ← Lógica CRUD evaluaciones
└── routes/
    └── evaluation.routes.js           ← /api/evaluations/*

tests/
└── evaluation.test.js                 ← Tests TDD obligatorios
```

---

## 🎵 Lógica de Web Audio API (hearing-test.service.ts)

### Frecuencias a evaluar
```typescript
const FREQUENCIES = [250, 500, 1000, 2000, 4000, 8000]; // Hz
const EARS: ('left' | 'right')[] = ['left', 'right'];
// Orden: todas las frecuencias en oído izquierdo, luego oído derecho
// Total: 12 pasos (6 frecuencias × 2 oídos)
```

### Generación de tono
```typescript
// Usar OscillatorNode + GainNode
// OscillatorNode: type = 'sine', frequency = Hz actual
// GainNode: volumen inicial = 0.3 (ajustable por slider)
// Duración del tono: continuo mientras el usuario escucha
// El usuario mueve slider para ajustar hasta percibir el tono
// Al presionar "Escuché el sonido": registrar el gain actual como umbral
// Al presionar "No lo escuché": registrar score = 0 para esa frecuencia
```

### Cálculo de score por frecuencia
```typescript
// score = Math.round((1 - gainThreshold) * 10)  → escala 0-10
// Donde gainThreshold es el volumen mínimo al que el usuario escuchó
// Si no escuchó nada → score = 0
// Rango normal: score ≥ 7 en todas las frecuencias
```

### Canalización estéreo
```typescript
// Usar StereoPannerNode o PannerNode
// ear === 'left'  → pan = -1 (solo canal izquierdo)
// ear === 'right' → pan =  1 (solo canal derecho)
// IMPORTANTE: recomendar auriculares para resultados precisos
```

---

## 🖼️ Especificación Pantalla 6 — HearingTestComponent

**Layout superior:**
- Flecha `←` | Título "Prueba auditiva"
- Texto: "Frecuencia actual" + valor grande en Hz (ej: "1000 Hz")

**Visualizador de onda:**
- 15 barras verticales animadas con CSS (altura varía con requestAnimationFrame usando AnalyserNode)
- Color: `var(--accent-cyan)` `#00E5FF`
- Barras más altas en el centro, más bajas en los extremos

**Pregunta:**
- "¿Escuchas el sonido?"
- Subtexto: "Ajusta el volumen hasta que lo percibas"

**Botón play:**
- Círculo de 56px en `var(--accent-purple)` con ícono play/pause SVG
- Al tocar: inicia/pausa el OscillatorNode

**Slider de volumen:**
- `input[type=range]` de 0.01 a 1.0, step 0.01
- Label izquierdo: "No lo escucho" | Label derecho: "Lo escucho"
- Thumb en `var(--accent-purple)`

**Botón acción:**
- "No escucho nada" → outline en `var(--accent-cyan)`, ancho completo

**Progreso:** "3 / 12" centrado abajo

**Stepper en la parte superior:** indicador visual de oído (izquierdo/derecho)

---

## 📋 Formulario de Hábitos — HabitFormComponent

Aparece ANTES de la prueba auditiva. 5 preguntas:

| # | Pregunta | Tipo | Opciones |
|---|----------|------|---------|
| 1 | ¿A qué te dedicas? | Select | Construcción / Música / Oficina / Educación / Industria / Otro |
| 2 | ¿Cuánto tiempo usas audífonos al día? | Select | < 1h / 1-3h / 3-5h / > 5h |
| 3 | ¿A qué volumen escuchas música normalmente? | Radio | Bajo / Medio / Alto / Muy alto |
| 4 | ¿Estás expuesto a ruidos fuertes en tu trabajo? | Radio | No / Ocasionalmente / Sí, frecuentemente |
| 5 | ¿Fumas o consumes alcohol? | Radio | No / Ocasionalmente / Sí |

Botón "Continuar" → guarda habitData en el servicio → navega a HearingTest

---

## 🖼️ Especificación Pantalla 7 — ResultsComponent

**Gauge principal:**
- SVG circular doughnut, radio 32, color según score:
  - Score ≥ 7.5 → `#22C55E` verde → "Buena"
  - Score 5-7.4 → `#F59E0B` ámbar → "Regular"
  - Score < 5 → `#FF4D4D` rojo → "Deteriorada"
- Texto dentro: label + "X.X / 10"

**Sección "Detalle por frecuencia":**
- Tabla de 6 filas: 250Hz / 500Hz / 1000Hz / 2000Hz / 4000Hz / 8000Hz
- Barra de progreso horizontal (width = score*10%) con color gradiente
- Valor numérico a la derecha
- Colores de barra: verde si ≥7.5, ámbar si 5-7.4, rojo si <5

**Botón:** "Ver recomendaciones" → navega a `/app/recommendations`

---

## 🛣️ Backend — Endpoints de Evaluaciones

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/evaluations` | ✅ | Crear evaluación + llamar IA (Fase 4 integrará IA, por ahora devuelve score promedio) |
| GET | `/api/evaluations` | ✅ | Historial paginado del usuario autenticado |
| GET | `/api/evaluations/:id` | ✅ | Detalle de una evaluación |
| PATCH | `/api/evaluations/:id` | ✅ | Actualizar evaluación parcial |

### Lógica de negocio del controller:
```javascript
// POST /api/evaluations
// 1. Validar que userId coincide con token JWT
// 2. Validar que frequencyScores tiene entre 1 y 12 elementos
// 3. Calcular overallScore = promedio de todos los scores
// 4. Si overallScore disponible → status = 'complete', si no → 'partial'
// 5. Guardar en MongoDB
// 6. En Fase 4: llamar a AI_SERVICE_URL/predict con los datos
// 7. Retornar evaluación creada con overallScore calculado
```

---

## 🧪 Tests TDD obligatorios — evaluation.test.js

```
✅ POST /api/evaluations
   - Debe crear evaluación completa con 12 scores y retornar 201
   - Debe aceptar evaluación parcial (status='partial')
   - Debe calcular overallScore como promedio correcto
   - Debe rechazar scores fuera de rango 0-10
   - Debe rechazar frecuencias fuera de [250,500,1000,2000,4000,8000]
   - Debe rechazar request sin autenticación

✅ GET /api/evaluations
   - Debe retornar solo las evaluaciones del usuario autenticado
   - No debe retornar evaluaciones de otros usuarios
   - Debe paginar correctamente (limit, skip)

✅ hearing-test.service.spec.ts (Angular)
   - generateTone() crea OscillatorNode con la frecuencia correcta
   - stopTone() desconecta el OscillatorNode
   - calculateScore() retorna 0 si gain es 1.0 (máximo volumen necesario)
   - getNextStep() avanza oído izquierdo primero, luego derecho
   - isComplete() retorna true al llegar al paso 12/12
```

---

## 🏁 Criterio de éxito de esta fase

- [ ] Flujo completo: Hábitos → Prueba (12 pasos) → Resultados funciona
- [ ] Los tonos se generan correctamente por oído (izquierdo/derecho) con auriculares
- [ ] El slider de volumen ajusta el GainNode en tiempo real
- [ ] Los resultados se guardan en MongoDB con todos los frecuencyScores
- [ ] La pantalla de resultados muestra gauge + barras por frecuencia con colores
- [ ] `npm test` pasa al 100% en backend y frontend

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_3_PruebaAuditiva.md @DB_Modelo_BaseDatos.docx @Normativas_Estandares.docx

Implementa la Fase 3 — módulo CORE de HearGuard AI:

1. HearingTestService con Web Audio API:
   - OscillatorNode (sine) + GainNode + StereoPannerNode
   - Frecuencias: 250, 500, 1000, 2000, 4000, 8000 Hz
   - Alternancia izquierdo/derecho (12 pasos total)
   - Visualizador de barras animadas con AnalyserNode

2. HabitFormComponent: formulario reactivo de 5 preguntas

3. HearingTestComponent con slider de volumen + botones de respuesta

4. Backend: evaluation.controller.js + evaluation.routes.js
   - POST guarda frequencyScores + habitData
   - Calcula overallScore como promedio

5. ResultsComponent: gauge + barras por frecuencia con Chart.js

Este es el módulo más importante del sistema. Implementa con máxima precisión.
NO avances a Fase 4 hasta que el flujo completo funcione y los tests pasen.
```
