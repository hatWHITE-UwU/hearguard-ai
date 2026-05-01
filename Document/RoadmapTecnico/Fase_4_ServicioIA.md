# 🧠 Fase 4 — Microservicio IA + Predicción de Riesgo

> **Prerequisito:** Fase 3 completada. Evaluaciones se guardan correctamente en MongoDB.
> **Regla de oro:** El modelo IA debe alcanzar ≥ 85% de precisión en los tests antes de integrar.

---

## 🎯 Objetivo de esta fase

Construir el microservicio Python (Flask + scikit-learn) que predice el nivel de riesgo auditivo, integrarlo con el backend Node.js, y mostrar los resultados en la pantalla de Predicción de Riesgo y Recomendaciones.

---

## 📁 Archivos a crear en esta fase

```
ai-service/
├── app.py                             ← API Flask principal
├── requirements.txt                   ← Dependencias Python
├── .env                               ← Variables de entorno Python
├── model/
│   ├── __init__.py
│   ├── predictor.py                   ← Clase RiskPredictor
│   ├── trainer.py                     ← Entrenar y guardar el modelo
│   ├── features.py                    ← Extracción y normalización de features
│   └── saved/
│       └── risk_model.pkl             ← Modelo entrenado (generado por trainer.py)
└── tests/
    └── test_predictor.py              ← Tests con pytest

frontend/src/app/features/
└── recommendations/
    └── recommendations.component.ts   ← Pantalla 8: Recomendaciones

backend/src/
├── services/
│   └── ai.service.js                  ← Llamada HTTP al microservicio Python
└── routes/
    └── ai.routes.js                   ← /api/ai/* (proxy al microservicio)
```

---

## 🐍 Microservicio Python — Especificación completa

### requirements.txt
```
flask==3.0.0
flask-cors==4.0.0
scikit-learn==1.4.0
numpy==1.26.0
pandas==2.1.0
joblib==1.3.2
python-dotenv==1.0.0
pytest==7.4.0
pytest-cov==4.1.0
```

### Features de entrada al modelo (8 features)

| Feature | Tipo | Rango | Descripción |
|---------|------|-------|-------------|
| `age` | float | 10-90 | Edad del usuario |
| `headphone_hours` | float | 0-24 | Horas diarias con audífonos |
| `volume_level` | float | 0-100 | Nivel de volumen (0=bajo, 100=muy alto) |
| `noise_exposure` | float | 0-2 | 0=No, 1=Ocasional, 2=Frecuente |
| `occupation_risk` | float | 0-3 | 0=Oficina, 1=Educación, 2=Música, 3=Construcción/Industria |
| `smoking` | float | 0-2 | 0=No, 1=Ocasional, 2=Sí |
| `avg_test_score` | float | 0-10 | Promedio de scores de la prueba auditiva |
| `low_freq_score` | float | 0-10 | Score promedio en 250Hz + 500Hz (bajas frecuencias) |

### Output del modelo

```python
{
    "riskScore": 65,          # int 0-100
    "riskLevel": "Moderado",  # str: Bajo / Moderado / Alto / Muy Alto
    "yearsEstimated": 8,      # int: años estimados antes de deterioro notable
    "confidence": 0.82,       # float: confianza del modelo (0-1)
    "topFactors": [           # lista de factores principales del riesgo
        "Exposición frecuente a ruido laboral",
        "Alto volumen de audífonos",
        "Score bajo en frecuencias altas"
    ]
}
```

### Clasificación de niveles
```python
def score_to_level(score: int) -> str:
    if score <= 25:  return "Bajo"
    if score <= 50:  return "Moderado"
    if score <= 75:  return "Alto"
    return "Muy Alto"

def score_to_years(score: int) -> int:
    # Estimación inversa: mayor riesgo = menos años
    if score <= 25:  return random.randint(20, 30)
    if score <= 50:  return random.randint(7, 15)
    if score <= 75:  return random.randint(3, 7)
    return random.randint(1, 3)
```

### trainer.py — Generación del dataset sintético
```python
# Como no hay datos reales, generar dataset sintético de 5000 muestras
# con reglas de negocio médicamente coherentes:
# - Edad > 50 + noise_exposure > 1 → riesgo alto
# - volume_level > 70 + headphone_hours > 4 → riesgo moderado/alto
# - avg_test_score < 5 → siempre riesgo alto independiente
# - occupation_risk == 3 (construcción) → factor multiplicador ×1.5
# - smoking > 0 → factor adicional +5-10 puntos al score
# Algoritmo: RandomForestClassifier o GradientBoostingClassifier
# Guardar con joblib.dump(model, 'model/saved/risk_model.pkl')
```

---

## 🛣️ Endpoints del Microservicio Flask

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Health check → `{ status: "ok", model: "loaded" }` |
| POST | `/api/predict-risk` | Predicción de riesgo auditivo |
| POST | `/api/generate-recommendations` | Generar lista de recomendaciones según nivel |
| GET | `/api/model-info` | Info del modelo (versión, features, accuracy) |

### POST /api/predict-risk — Payload de entrada
```json
{
  "age": 25,
  "headphoneHours": 4,
  "volumeLevel": 75,
  "noiseExposure": 2,
  "occupationRisk": 3,
  "smoking": 1,
  "testScores": [8.5, 9.0, 8.5, 9.5, 7.5, 7.0],
  "habitData": { "headphoneHours": 4, "volumeLevel": "alto" }
}
```

---

## 🔗 Integración Backend Node.js ↔ Python

### ai.service.js
```javascript
// Llamar al microservicio Python después de guardar evaluación
// URL: process.env.AI_SERVICE_URL + '/api/predict-risk'
// Timeout: 10 segundos
// Si falla: loggear error pero NO fallar la evaluación (degraded gracefully)
// Si responde: crear documento RiskResult en MongoDB
// Retornar evaluación + riskResult en la respuesta al frontend
```

### Flujo completo POST /api/evaluations:
```
1. Validar request → 400 si datos inválidos
2. Guardar Evaluation en MongoDB
3. Llamar ai.service.js → POST Python /api/predict-risk
4. Guardar RiskResult en MongoDB (evaluationId referenciado)
5. Llamar Python /api/generate-recommendations con riskLevel
6. Guardar Recommendations en MongoDB
7. Retornar { evaluation, riskResult, recommendations }
```

---

## 🖼️ Pantalla 8 — RecommendationsComponent

**Header:** "Recomendaciones" con flecha back

**Card principal (recomendación top):**
- Ícono grande de auriculares en `var(--accent-cyan)`
- Label: "Recomendación principal"
- Texto principal destacado de la recomendación más urgente

**Sección "Consejos para ti":**
- Lista de 4-5 recomendaciones en tarjetas
- Cada tarjeta: ícono SVG (en caja redondeada `var(--bg-card2)`) + texto + flecha `›`
- Categorías: volumen / exposición / descanso / médico / hábitos

**Botón:** "Entendido" en `var(--accent-cyan)` → navega a Dashboard

### Recomendaciones por nivel de riesgo:
```
BAJO (0-25):
  - Mantén el volumen de tus audífonos por debajo del 60%
  - Continúa realizando pruebas auditivas anuales

MODERADO (26-50):
  - Reduce tu exposición a ruidos fuertes y usa protección auditiva
  - Limita el uso de audífonos a máximo 3 horas diarias
  - Descansa tus oídos cada 30-60 minutos
  - Considera una consulta con un audiólogo

ALTO (51-75):
  - Usa protección auditiva en ambientes ruidosos SIEMPRE
  - Reduce el volumen de tus audífonos al máximo 50%
  - Evita la exposición prolongada a ruidos > 85dB
  - Consulta con un audiólogo en los próximos 30 días

MUY ALTO (76-100):
  - Consulta urgente con un audiólogo
  - Usa protección auditiva en todo ambiente ruidoso
  - Suspende temporalmente el uso de audífonos
  - Informa a tu médico sobre tus resultados
```

---

## 🧪 Tests TDD obligatorios — test_predictor.py

```python
✅ test_predict_risk()
   - Debe retornar score entre 0 y 100
   - Perfil de alto riesgo (construcción + audífonos 6h + volumen alto) → score > 60
   - Perfil de bajo riesgo (oficina + sin audífonos + volumen bajo) → score < 30
   - avg_test_score = 0 siempre produce score > 70

✅ test_score_to_level()
   - score 20 → "Bajo"
   - score 40 → "Moderado"
   - score 65 → "Alto"
   - score 85 → "Muy Alto"

✅ test_missing_data()
   - Debe manejar features faltantes con valores por defecto sin lanzar excepción
   - Debe retornar estructura completa aunque falten campos opcionales

✅ test_model_loaded()
   - El modelo debe cargarse correctamente desde risk_model.pkl
   - Precisión del modelo en test set debe ser ≥ 0.80 (80%)
```

---

## 🏁 Criterio de éxito de esta fase

- [ ] `python app.py` inicia el servidor en puerto 5001 sin errores
- [ ] POST `/api/predict-risk` retorna predicción coherente con los datos de entrada
- [ ] `pytest --cov=model tests/` muestra cobertura ≥ 85%
- [ ] Backend Node.js llama al microservicio y guarda RiskResult en MongoDB
- [ ] Pantalla de resultados muestra riskScore real de la IA (no hardcodeado)
- [ ] RecommendationsComponent muestra recomendaciones personalizadas según nivel
- [ ] Si el servicio IA falla, el backend devuelve la evaluación igualmente (graceful degradation)

---

## 💬 Prompt para Cursor al iniciar esta fase

```
@Fase_4_ServicioIA.md @DB_Modelo_BaseDatos.docx @Normativas_Estandares.docx

Implementa la Fase 4 — Microservicio IA de HearGuard AI:

1. trainer.py: genera dataset sintético de 5000 muestras con RandomForestClassifier
   - Reglas médicamente coherentes (ver Fase 4)
   - Guarda modelo en model/saved/risk_model.pkl
   - Precisión objetivo: ≥ 80%

2. predictor.py: clase RiskPredictor que carga el modelo y expone predict()

3. app.py: API Flask con /health, /api/predict-risk, /api/generate-recommendations

4. ai.service.js en backend Node.js: llama al microservicio Python

5. Actualiza evaluation.controller.js para integrar la IA en el flujo

6. RecommendationsComponent en Angular con las recomendaciones por nivel

7. tests/test_predictor.py con pytest

NO pases a Fase 5 hasta que pytest pase al 100% y la integración Node→Python funcione.
```
