# ============================================================
# Feature: Gestión de Dispositivos IoT
# Módulo:  Backend API
# Rutas:   POST /api/devices       (registrar dispositivo)
#          GET  /api/devices       (listar dispositivos del usuario)
#          GET  /api/devices/:id   (obtener dispositivo)
#          DELETE /api/devices/:id (eliminar dispositivo)
# Hardware: ESP32 DevKit + sensor KY-037
# Pruebas: CP-B-22 al CP-B-26, CP-IOT-01 al CP-IOT-06
# ============================================================

Feature: Gestión de dispositivos IoT y pairing con ESP32

  Como usuario de HearGuard AI
  Quiero registrar y administrar mis dispositivos ESP32
  Para recibir lecturas automáticas de ruido ambiental desde mi entorno físico

  Background:
    Given el usuario "luis@continental.edu.pe" está autenticado
    And posee un "accessToken" válido

  # ── Registro de dispositivo ───────────────────────────────────────────────────

  Scenario: Registrar un nuevo dispositivo ESP32 (CP-B-22)
    When envío POST a "/api/devices" con nombre "Sensor Oficina"
    Then el código de respuesta HTTP es 201
    And la respuesta contiene un "apiKey" con formato "hg_XXXX_..."
    And el dispositivo queda asociado al usuario autenticado
    And el campo "isActive" es true

  Scenario: Rechazo de registro sin nombre
    When envío POST a "/api/devices" sin el campo "name"
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Rechazo de registro sin autenticación
    Given no incluyo el header de autorización
    When envío POST a "/api/devices" con nombre "Sensor Test"
    Then el código de respuesta HTTP es 401

  # ── Listado de dispositivos ───────────────────────────────────────────────────

  Scenario: Listar dispositivos propios del usuario
    Given el usuario tiene 2 dispositivos registrados
    When envío GET a "/api/devices"
    Then el código de respuesta HTTP es 200
    And "data.devices" contiene exactamente 2 dispositivos
    And todos los dispositivos pertenecen al usuario autenticado

  Scenario: Aislamiento IDOR — usuario A no ve dispositivos de usuario B
    Given el usuario B tiene 1 dispositivo registrado
    When el usuario A envía GET a "/api/devices"
    Then "data.devices" no contiene el dispositivo del usuario B

  # ── Eliminación de dispositivo ────────────────────────────────────────────────

  Scenario: Eliminar dispositivo propio
    Given el usuario tiene un dispositivo con id "abc123"
    When envío DELETE a "/api/devices/abc123"
    Then el código de respuesta HTTP es 200
    And el dispositivo ya no aparece en GET "/api/devices"

  Scenario: Rechazo de eliminación de dispositivo ajeno
    Given el dispositivo "xyz789" pertenece al usuario B
    When el usuario A envía DELETE a "/api/devices/xyz789"
    Then el código de respuesta HTTP es 404
    And la respuesta contiene "error" igual a "NOT_FOUND"

  # ── Integración ESP32 + API Key ───────────────────────────────────────────────

  Scenario: Flujo completo de pairing y envío de datos IoT
    Given el usuario registra un nuevo dispositivo "Sensor Dormitorio"
    And recibe la apiKey "hg_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    And configura el firmware ESP32 con esa apiKey en DEVICE_KEY
    When el ESP32 toma una lectura de 72 dB del micrófono KY-037
    And envía POST a "/api/noise/iot" con X-Device-Key y dbLevel 72
    Then el código de respuesta HTTP es 201
    And el registro tiene source "iot"
    And el registro aparece en GET "/api/noise" del usuario propietario
    And el campo "record.riskTag" es "moderado"

  Scenario: ESP32 reconecta WiFi automáticamente si se pierde la conexión
    Given el ESP32 está en ejecución pero pierde la conexión WiFi
    When se llama a la función ensureWifi() en el siguiente ciclo del loop
    Then el firmware intenta reconectar hasta 20 veces con intervalos de 500ms
    And si la reconexión falla, imprime "[WiFi] sin conexión — se intentará en el próximo ciclo"
    And no bloquea el loop principal de lectura del sensor
