# ============================================================
# Feature: Monitoreo de Ruido Ambiental
# Módulo:  Backend API + Frontend Angular + IoT ESP32
# Rutas:   POST /api/noise         (registro manual/app)
#          POST /api/noise/iot     (registro desde dispositivo ESP32)
#          GET  /api/noise         (listado paginado)
#          GET  /api/noise/latest  (último registro)
#          GET  /api/noise/stats/today
#          GET  /api/noise/stats/week
# Pruebas: CP-B-11 al CP-B-16, CP-IOT-01 al CP-IOT-06
# ============================================================

Feature: Monitoreo y registro de niveles de ruido ambiental

  Como usuario de HearGuard AI
  Quiero registrar y consultar los niveles de ruido a los que estoy expuesto
  Para monitorear el riesgo acústico y proteger mi salud auditiva

  Background:
    Given el usuario "luis@continental.edu.pe" está autenticado
    And posee un "accessToken" válido en el header de autorización

  # ── Clasificación de riesgo ───────────────────────────────────────────────────

  Scenario Outline: Clasificación automática de riesgo por nivel dB (CP-B-11)
    When envío POST a "/api/noise" con dbLevel <dbLevel> y source "app"
    Then el código de respuesta HTTP es 201
    And el campo "record.riskTag" es "<riskTag>"
    And el campo "record.highRisk" es <highRisk>

    Examples:
      | dbLevel | riskTag   | highRisk |
      | 45      | bajo      | false    |
      | 72      | moderado  | false    |
      | 87      | alto      | true     |
      | 105     | muy_alto  | true     |

  Scenario: Registro de ruido con nivel límite exacto de alto riesgo (85 dB)
    When envío POST a "/api/noise" con dbLevel 85 y source "app"
    Then el código de respuesta HTTP es 201
    And el campo "record.highRisk" es false

  Scenario: Registro de ruido con nivel superior al límite (86 dB)
    When envío POST a "/api/noise" con dbLevel 86 y source "app"
    Then el código de respuesta HTTP es 201
    And el campo "record.highRisk" es true

  # ── Validaciones ──────────────────────────────────────────────────────────────

  Scenario: Rechazo de registro sin campo dbLevel (CP-B-12)
    When envío POST a "/api/noise" sin el campo "dbLevel"
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Rechazo de dbLevel fuera de rango (201 dB)
    When envío POST a "/api/noise" con dbLevel 201
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Rechazo de dbLevel negativo
    When envío POST a "/api/noise" con dbLevel -5
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Rechazo de registro sin autenticación
    Given no incluyo el header de autorización
    When envío POST a "/api/noise" con dbLevel 60
    Then el código de respuesta HTTP es 401

  Scenario: Rechazo de registro con deviceId inexistente
    When envío POST a "/api/noise" con dbLevel 60 y deviceId "507f1f77bcf86cd799439011"
    Then el código de respuesta HTTP es 404
    And la respuesta contiene "error" igual a "NOT_FOUND"

  # ── Consulta de registros ─────────────────────────────────────────────────────

  Scenario: Listado paginado de registros del usuario (CP-B-13)
    Given el usuario tiene al menos 3 registros de ruido guardados
    When envío GET a "/api/noise?limit=2"
    Then el código de respuesta HTTP es 200
    And "data.items" contiene exactamente 2 elementos
    And "data.total" es mayor o igual a 3
    And todos los registros pertenecen al usuario autenticado

  Scenario: Aislamiento IDOR — usuario A no ve registros de usuario B
    Given el usuario B tiene registros de ruido guardados
    When el usuario A envía GET a "/api/noise"
    Then "data.items" no contiene registros del usuario B
    And "data.items" contiene solo registros del usuario A

  Scenario: Filtro por source en listado
    Given el usuario tiene registros con source "app" y source "iot"
    When envío GET a "/api/noise?source=app"
    Then todos los registros en "data.items" tienen source "app"

  Scenario: Último registro más reciente
    Given el usuario tiene múltiples registros de ruido
    When envío GET a "/api/noise/latest"
    Then el código de respuesta HTTP es 200
    And "data.record" corresponde al registro más reciente del usuario

  # ── Estadísticas ──────────────────────────────────────────────────────────────

  Scenario: Estadísticas del día actual
    Given el usuario tiene al menos 1 registro de ruido hoy
    When envío GET a "/api/noise/stats/today"
    Then el código de respuesta HTTP es 200
    And la respuesta contiene estadísticas de promedio, máximo y conteo del día

  Scenario: Estadísticas de la semana
    When envío GET a "/api/noise/stats/week"
    Then el código de respuesta HTTP es 200
    And la respuesta contiene datos agrupados por día de la semana actual

  # ── IoT: Registro desde ESP32 ─────────────────────────────────────────────────

  Scenario: Registro IoT con API key válida del dispositivo (CP-IOT-01)
    Given existe un dispositivo registrado con apiKey "hg_abc123_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
    When envío POST a "/api/noise/iot" con header "X-Device-Key: hg_abc123_xxxxxxxxxxxxxxxxxxxxxxxxxxx" y dbLevel 66
    Then el código de respuesta HTTP es 201
    And el campo "record.source" es "iot"
    And el registro queda asociado al usuario propietario del dispositivo

  Scenario: Rechazo de registro IoT sin X-Device-Key (CP-IOT-02)
    When envío POST a "/api/noise/iot" sin el header "X-Device-Key"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  Scenario: Rechazo de registro IoT con X-Device-Key inválida (CP-IOT-03)
    When envío POST a "/api/noise/iot" con header "X-Device-Key: clave-falsa-000"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  Scenario: Registro IoT activa LED de riesgo en ESP32 cuando dB > 85
    Given el firmware ESP32 está en ejecución en simulación Wokwi
    And el potenciómetro simula un nivel de ruido de 90 dB
    When transcurren 5 segundos (intervalo de muestreo)
    Then el LED en GPIO2 se activa (HIGH)
    And se envía una lectura a "/api/noise/iot" con dbLevel 90

  Scenario: LED apagado cuando el nivel es seguro
    Given el potenciómetro simula 50 dB
    When transcurren 5 segundos
    Then el LED en GPIO2 permanece apagado (LOW)
    And se envía lectura con dbLevel 50 y campo highRisk false
