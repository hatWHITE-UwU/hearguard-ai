# ============================================================
# Feature: Predicción de Riesgo Auditivo con IA
# Módulo:  AI Service (Python / Flask / scikit-learn)
# Rutas:   POST /api/predict-risk
#          POST /api/generate-recommendations
#          GET  /api/model-info
#          GET  /health
# Pruebas: CP-AI-01 al CP-AI-06
# ============================================================

Feature: Predicción de riesgo auditivo mediante inteligencia artificial

  Como sistema HearGuard AI
  Quiero analizar los datos de hábitos y resultados de prueba auditiva del usuario
  Para generar una predicción de riesgo personalizada con recomendaciones de prevención

  Background:
    Given el servicio de IA está en ejecución en el puerto 5001
    And el modelo Random Forest está cargado desde el archivo "risk_model.pkl"
    And el R² del modelo en el conjunto de validación es mayor o igual a 0.80

  # ── Salud del servicio ────────────────────────────────────────────────────────

  Scenario: Verificar disponibilidad del servicio de IA (CP-AI-01)
    When envío GET a "/health"
    Then el código de respuesta HTTP es 200
    And "data.status" es "ok"
    And "data.model" es "loaded"

  # ── Predicción de riesgo ──────────────────────────────────────────────────────

  Scenario: Predicción exitosa con perfil de riesgo bajo (CP-AI-02)
    When envío POST a "/api/predict-risk" con:
      | age             | 20  |
      | headphoneHours  | 0   |
      | volumeLevel     | 20  |
      | noiseExposure   | 0   |
      | occupationRisk  | 0   |
      | smoking         | 0   |
      | testScores      | [9,9,9,9,9,9] |
    Then el código de respuesta HTTP es 200
    And "data.riskScore" es menor que 40
    And "data.riskLevel" es "Bajo"

  Scenario: Predicción exitosa con perfil de alto riesgo (CP-AI-03)
    When envío POST a "/api/predict-risk" con:
      | age             | 60  |
      | headphoneHours  | 10  |
      | volumeLevel     | 95  |
      | noiseExposure   | 3   |
      | occupationRisk  | 3   |
      | smoking         | 2   |
      | testScores      | [1,1,1,1,1,1] |
    Then el código de respuesta HTTP es 200
    And "data.riskScore" es mayor que 60
    And "data.riskLevel" está en ["Alto", "Muy Alto"]

  Scenario Outline: Clasificación correcta por nivel de riskScore (CP-AI-04)
    Given el modelo retorna un riskScore de <score>
    Then el nivel de riesgo es "<nivel>"

    Examples:
      | score | nivel    |
      | 15    | Bajo     |
      | 35    | Moderado |
      | 65    | Alto     |
      | 85    | Muy Alto |

  Scenario: El riskScore siempre está en el rango 0–100
    When envío POST a "/api/predict-risk" con cualquier combinación de parámetros
    Then "data.riskScore" es mayor o igual a 0
    And "data.riskScore" es menor o igual a 100

  Scenario: El servicio es robusto ante payload vacío (CP-AI-05)
    When envío POST a "/api/predict-risk" con cuerpo JSON vacío {}
    Then el código de respuesta HTTP es 200
    And "data.riskScore" está en el rango 0–100
    And "data.topFactors" es una lista

  Scenario: El servicio es robusto ante cuerpo sin JSON
    When envío POST a "/api/predict-risk" con Content-Type "text/plain"
    Then el código de respuesta HTTP es 200
    And el servicio no retorna código 500

  Scenario: La respuesta incluye factores de riesgo detectados (CP-AI-06)
    When envío POST a "/api/predict-risk" con un perfil de riesgo moderado
    Then "data.topFactors" es una lista con al menos 1 elemento
    And "data.confidence" es un número entre 0 y 1
    And "data.riskLevel" es uno de ["Bajo", "Moderado", "Alto", "Muy Alto"]

  # ── Generación de recomendaciones ─────────────────────────────────────────────

  Scenario Outline: Generación de recomendaciones según nivel de riesgo
    When envío POST a "/api/generate-recommendations" con riskLevel "<nivel>"
    Then el código de respuesta HTTP es 200
    And "data.recommendations" contiene al menos 1 recomendación
    And cada recomendación es una cadena de texto no vacía

    Examples:
      | nivel    |
      | Bajo     |
      | Moderado |
      | Alto     |
      | Muy Alto |

  Scenario: Generación de recomendaciones por riskScore sin riskLevel
    When envío POST a "/api/generate-recommendations" con riskScore 85
    Then el código de respuesta HTTP es 200
    And "data.recommendations" contiene al menos 1 recomendación

  Scenario: Nivel desconocido retorna recomendaciones por defecto
    When envío POST a "/api/generate-recommendations" con riskLevel "Desconocido"
    Then el código de respuesta HTTP es 200
    And "data.recommendations" es una lista no vacía

  # ── Información del modelo ────────────────────────────────────────────────────

  Scenario: Información del modelo entrenado
    When envío GET a "/api/model-info"
    Then el código de respuesta HTTP es 200
    And "data.type" contiene el nombre del algoritmo ("RandomForestRegressor")
    And "data.features" es 8
    And "data.r2_holdout" es mayor o igual a 0.80
