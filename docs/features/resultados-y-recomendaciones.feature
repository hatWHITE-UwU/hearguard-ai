# ============================================================
# Feature: Resultados y Recomendaciones de Salud Auditiva
# Módulo:  Frontend Angular (ResultsComponent)
#          Backend API GET/POST /api/evaluations
#          AI Service POST /api/predict-risk
# Pruebas: CP-F-05, CP-AI-04 al CP-AI-06
# ============================================================

Feature: Visualización de resultados y recomendaciones personalizadas

  Como usuario de HearGuard AI
  Quiero ver los resultados de mi prueba auditiva con un análisis de riesgo
  Para entender mi estado auditivo actual y recibir consejos preventivos personalizados

  Background:
    Given el usuario completó la prueba auditiva con 12 frecuencias
    And el servicio de IA está disponible y respondiendo

  # ── Visualización de resultados ───────────────────────────────────────────────

  Scenario: Ver resultados inmediatamente al finalizar la prueba (CP-F-05)
    Given el usuario acaba de completar el último paso de la prueba auditiva
    When es redirigido automáticamente a "/app/results/new"
    Then ve una pantalla de resultados con:
      | Elemento                  | Visible |
      | Puntuación global (0–10)  | Sí      |
      | Nivel de riesgo           | Sí      |
      | Recomendaciones           | Sí      |
      | Gráfica audiométrica      | Sí      |
    And no ve errores en la pantalla

  Scenario: Resultados reflejan los scores reales de la prueba
    Given el usuario obtuvo puntuaciones altas en todas las frecuencias (score 9)
    When se muestran los resultados
    Then la puntuación global mostrada es 9 (o cercana)
    And el nivel de riesgo mostrado es "Bajo"

  Scenario: Resultados reflejan deterioro auditivo severo
    Given el usuario obtuvo puntuaciones bajas en todas las frecuencias (score 1)
    When se muestran los resultados
    Then el nivel de riesgo mostrado es "Alto" o "Muy Alto"
    And las recomendaciones incluyen orientación a especialista

  # ── Historial de evaluaciones ─────────────────────────────────────────────────

  Scenario: Consultar historial de evaluaciones anteriores
    Given el usuario tiene 3 evaluaciones previas guardadas
    When navega a "/app/history"
    Then ve las 3 evaluaciones ordenadas por fecha descendente
    And cada evaluación muestra fecha, puntuación global y nivel de riesgo

  Scenario: Evaluación marcada como "complete" con 12 scores
    Given el usuario envió 12 scores válidos
    When se guarda la evaluación en el backend
    Then "data.evaluation.status" es "complete"

  Scenario: Evaluación marcada como "partial" con menos de 12 scores
    Given el usuario envió solo 6 scores (interrumpió la prueba)
    When se guarda la evaluación en el backend
    Then "data.evaluation.status" es "partial"

  # ── Gráfica audiométrica ──────────────────────────────────────────────────────

  Scenario: Gráfica muestra resultados por frecuencia y oído
    When el usuario ve sus resultados
    Then la gráfica audiométrica muestra 6 puntos por oído (250, 500, 1000, 2000, 4000, 8000 Hz)
    And el oído izquierdo se muestra en color diferente al oído derecho

  # ── Recomendaciones de IA ─────────────────────────────────────────────────────

  Scenario Outline: Recomendaciones apropiadas según nivel de riesgo
    Given el nivel de riesgo calculado es "<nivel>"
    Then las recomendaciones mostradas son coherentes con ese nivel
    And hay al menos 1 recomendación visible

    Examples:
      | nivel    |
      | Bajo     |
      | Moderado |
      | Alto     |
      | Muy Alto |

  Scenario: Recomendaciones visibles en modo demo sin backend
    Given PUBLIC_DEMO está activo
    And el usuario no tiene sesión real
    When navega a "/app/results/new"
    Then ve resultados de demostración con recomendaciones
    And no ve errores de autenticación

  # ── Monitor de ruido en tiempo real ──────────────────────────────────────────

  Scenario: Monitor clasifica el nivel de ruido correctamente
    Given el micrófono del dispositivo captura audio en tiempo real
    When el nivel medido es 40 dB
    Then el clasificador muestra "Bajo" con color verde (#22C55E)
    When el nivel medido es 60 dB
    Then el clasificador muestra "Moderado" con color ámbar (#F59E0B)
    When el nivel medido es 80 dB
    Then el clasificador muestra "Alto" con color naranja (#FF8C00)
    When el nivel medido es 100 dB
    Then el clasificador muestra "Muy Alto" con color rojo (#FF4D4D)

  Scenario: Historial del monitor mantiene máximo 30 muestras
    Given el monitor lleva más de 30 muestras registradas
    When se toma una nueva muestra
    Then el array "history" contiene exactamente 30 elementos (FIFO)
    And el elemento más antiguo fue eliminado
