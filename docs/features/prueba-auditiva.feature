# ============================================================
# Feature: Prueba Auditiva por Frecuencias
# Módulo:  Frontend Angular (HearingTestService + HearingTestComponent)
#          Backend API POST /api/evaluations
# Flujo:   Hábitos → Test de tonos → Resultados → IA
# Pruebas: CP-F-01 al CP-F-05, CP-B-17 al CP-B-21
# ============================================================

Feature: Prueba auditiva completa por frecuencias

  Como usuario de HearGuard AI
  Quiero completar una prueba auditiva con tonos a distintas frecuencias
  Para obtener una evaluación de mi salud auditiva y recomendaciones personalizadas

  Background:
    Given el usuario está autenticado en la aplicación web
    And se encuentra en la ruta "/app/hearing"

  # ── Cuestionario de hábitos ───────────────────────────────────────────────────

  Scenario: Completar el cuestionario de hábitos auditivos (CP-F-01)
    Given el usuario está en "/app/hearing/habits"
    When selecciona las siguientes opciones:
      | Campo               | Valor          |
      | Ocupación           | Oficina        |
      | Horas con auriculares | 1–3 h        |
      | Nivel de volumen    | Medio          |
      | Ruido en trabajo    | Ocasional      |
      | Sustancias          | No             |
    And hace clic en "Continuar"
    Then es redirigido a "/app/hearing/test"
    And el servicio HearingTestService tiene habitData con los valores seleccionados

  Scenario: No puede acceder a la prueba sin completar hábitos
    Given el usuario navega directamente a "/app/hearing/test"
    And el campo habitData está vacío
    Then ve el mensaje "Primero completa el cuestionario de hábitos auditivos"
    And aparece el botón "Ir al cuestionario"

  # ── Flujo de la prueba de tonos ───────────────────────────────────────────────

  Scenario: Prueba genera exactamente 12 pasos (6 frecuencias × 2 oídos)
    Given el usuario completa el cuestionario de hábitos
    When inicia la prueba auditiva
    Then el test contiene 12 pasos en total
    And los primeros 6 pasos corresponden al oído izquierdo
    And los últimos 6 pasos corresponden al oído derecho
    And las frecuencias son 250, 500, 1000, 2000, 4000 y 8000 Hz en cada oído

  Scenario: Reproducir y detener tono en cada paso (CP-F-02)
    Given el usuario está en el paso 1 (250 Hz — oído izquierdo)
    When hace clic en el botón de reproducción
    Then se inicia el AudioContext y el oscilador con frecuencia 250 Hz
    And el panner estéreo se posiciona en -1 (izquierdo)
    And el visualizador de barras comienza a animarse
    When hace clic de nuevo en el botón de reproducción
    Then el tono se detiene
    And el visualizador se resetea a altura mínima

  Scenario: Ajustar volumen durante la reproducción del tono (CP-F-03)
    Given el tono está reproduciéndose
    When el usuario mueve el slider de volumen a 0.3
    Then el GainNode del AudioContext actualiza su valor a 0.3
    And el signal "volume" del servicio refleja el valor 0.3

  Scenario: Registrar que se escuchó el tono — avance correcto
    Given el usuario está en el paso 3 (1000 Hz — oído izquierdo)
    And el volumen actual es 0.5
    When hace clic en "Escuché el sonido"
    Then se registra una fila con hz=1000, ear="left", score=5
    And el paso avanza al paso 4 (2000 Hz — oído izquierdo)
    And el tono se detiene automáticamente

  Scenario: Registrar que no se escuchó el tono — score 0
    Given el usuario está en el paso 1 (250 Hz)
    When hace clic en "No escucho nada"
    Then se registra una fila con hz=250, ear="left", score=0
    And el paso avanza al paso 2

  Scenario Outline: Cálculo de score según ganancia de volumen (caja blanca)
    Given el volumen está ajustado a <ganancia>
    When el usuario hace clic en "Escuché el sonido"
    Then el score registrado es <score>

    Examples:
      | ganancia | score |
      | 0.01     | 10    |
      | 0.10     | 9     |
      | 0.50     | 5     |
      | 0.90     | 1     |
      | 1.00     | 0     |

  Scenario: Completar la prueba completa — redirección a resultados (CP-F-04)
    Given el usuario ha respondido los 12 pasos de la prueba
    When se registra el último paso
    Then el campo "isComplete" es true
    And el usuario es redirigido automáticamente a "/app/results/new"

  Scenario: Reiniciar la prueba desde el principio
    Given el usuario ha completado algunos pasos de la prueba
    When se llama a resetFlow()
    Then currentStepIndex vuelve a 0
    And el array de scores queda vacío
    And isComplete es false

  # ── Envío de evaluación al backend ────────────────────────────────────────────

  Scenario: Crear evaluación completa con 12 scores (CP-B-17)
    Given el usuario completó la prueba con 12 scores de valor 8
    When envío POST a "/api/evaluations" con los 12 scores y habitData
    Then el código de respuesta HTTP es 201
    And "data.evaluation.overallScore" es 8
    And "data.evaluation.status" es "complete"

  Scenario: Crear evaluación parcial con menos de 12 scores (CP-B-18)
    When envío POST a "/api/evaluations" con solo 6 scores
    Then el código de respuesta HTTP es 201
    And "data.evaluation.status" es "partial"

  Scenario: Rechazo de evaluación con scores fuera de rango (CP-B-19)
    When envío POST a "/api/evaluations" con un score de valor 11
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Rechazo de evaluación sin autenticación
    Given no incluyo el header de autorización
    When envío POST a "/api/evaluations" con scores válidos
    Then el código de respuesta HTTP es 401

  Scenario: Aislamiento IDOR — usuario A no ve evaluaciones de usuario B
    Given el usuario B tiene evaluaciones guardadas
    When el usuario A envía GET a "/api/evaluations"
    Then "data.items" no contiene evaluaciones del usuario B

  # ── Modo demo ────────────────────────────────────────────────────────────────

  Scenario: Modo demo semilla — sesión predeterminada sin servidor
    Given PUBLIC_DEMO está activado (true)
    When se llama a seedDemoSession() con overallTarget=7
    Then el array de scores contiene exactamente 12 filas
    And todos los scores están en el rango 0–10
    And habitData no es null
    And isComplete es true
