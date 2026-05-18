# language: es
# ============================================================
# Feature: Autenticación y Gestión de Sesión
# Módulo:  Backend API + Frontend Angular
# Rutas:   POST /api/auth/register
#          POST /api/auth/login
#          POST /api/auth/refresh
#          POST /api/auth/logout
#          GET  /api/auth/me
# Pruebas: CP-B-01 al CP-B-10
# ============================================================

Feature: Autenticación y gestión de sesión de usuario

  Como usuario de HearGuard AI
  Quiero poder registrarme, iniciar sesión y gestionar mi cuenta
  Para acceder de forma segura a mis datos de salud auditiva

  Background:
    Given el servidor backend está en ejecución
    And la base de datos MongoDB está disponible
    And los endpoints de autenticación responden en "/api/auth"

  # ── Registro ─────────────────────────────────────────────────────────────────

  Scenario: Registro exitoso con datos válidos (CP-B-01)
    Given no existe ningún usuario registrado con el email "luis@continental.edu.pe"
    When envío POST a "/api/auth/register" con:
      | name     | Luis García              |
      | email    | luis@continental.edu.pe  |
      | password | Segura123!               |
    Then el código de respuesta HTTP es 201
    And la respuesta contiene "success" igual a true
    And la respuesta contiene un "accessToken" no vacío
    And la respuesta contiene un "refreshToken" no vacío
    And el campo "user.password" no aparece en la respuesta
    And el usuario queda almacenado en la base de datos con la contraseña hasheada

  Scenario: Registro rechazado con email duplicado (CP-B-02)
    Given existe un usuario registrado con el email "luis@continental.edu.pe"
    When envío POST a "/api/auth/register" con el mismo email
    Then el código de respuesta HTTP es 409
    And la respuesta contiene "error" igual a "CONFLICT"

  Scenario: Registro rechazado con contraseña débil (CP-B-03)
    Given no existe ningún usuario registrado con el email "test@hearguard.com"
    When envío POST a "/api/auth/register" con password "123"
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Registro rechazado con email inválido
    When envío POST a "/api/auth/register" con email "correo-invalido"
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  Scenario: Registro rechazado con campos faltantes
    When envío POST a "/api/auth/register" sin el campo "password"
    Then el código de respuesta HTTP es 400
    And la respuesta contiene "error" igual a "VALIDATION_ERROR"

  # ── Login ────────────────────────────────────────────────────────────────────

  Scenario: Login exitoso con credenciales correctas (CP-B-04)
    Given existe un usuario registrado con email "luis@continental.edu.pe" y password "Segura123!"
    When envío POST a "/api/auth/login" con:
      | email    | luis@continental.edu.pe |
      | password | Segura123!              |
    Then el código de respuesta HTTP es 200
    And la respuesta contiene un "accessToken" válido firmado con JWT
    And la respuesta contiene un "refreshToken"
    And el campo "user.password" no aparece en la respuesta

  Scenario: Login rechazado con contraseña incorrecta (CP-B-05)
    Given existe un usuario registrado con email "luis@continental.edu.pe"
    When envío POST a "/api/auth/login" con password "ClaveIncorrecta1"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"
    And el mensaje es "Credenciales inválidas"

  Scenario: Login rechazado con email inexistente
    When envío POST a "/api/auth/login" con email "noexiste@hearguard.com"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  # ── Refresh Token ─────────────────────────────────────────────────────────────

  Scenario: Renovación de access token con refresh token válido (CP-B-06)
    Given el usuario "luis@continental.edu.pe" tiene sesión iniciada
    And posee un "refreshToken" válido
    When envío POST a "/api/auth/refresh" con el refreshToken
    Then el código de respuesta HTTP es 200
    And la respuesta contiene un nuevo "accessToken"

  Scenario: Renovación rechazada con refresh token inválido
    When envío POST a "/api/auth/refresh" con un token aleatorio "token-invalido-xyz"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  # ── Sesión activa ─────────────────────────────────────────────────────────────

  Scenario: Obtener perfil del usuario autenticado
    Given el usuario "luis@continental.edu.pe" tiene un "accessToken" válido
    When envío GET a "/api/auth/me" con el header "Authorization: Bearer <accessToken>"
    Then el código de respuesta HTTP es 200
    And la respuesta contiene el email "luis@continental.edu.pe"
    And el campo "password" no aparece en la respuesta

  Scenario: Acceso denegado a ruta protegida sin token
    When envío GET a "/api/auth/me" sin header de autorización
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  # ── Seguridad: JWT Tampering ──────────────────────────────────────────────────

  Scenario: Rechazo de token con firma manipulada
    When envío GET a "/api/noise" con un JWT con firma alterada
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  Scenario: Rechazo de ataque alg:none en JWT
    When envío GET a "/api/noise" con un JWT usando algoritmo "none"
    Then el código de respuesta HTTP es 401
    And la respuesta contiene "error" igual a "UNAUTHORIZED"

  # ── Seguridad: NoSQL Injection ────────────────────────────────────────────────

  Scenario: Rechazo de inyección NoSQL con operador $gt en email
    When envío POST a "/api/auth/login" con email igual a '{"$gt": ""}' y password "cualquiera"
    Then el código de respuesta HTTP no es 200
    And la respuesta no contiene "accessToken"

  Scenario: Rechazo de inyección NoSQL con operador $ne en password
    When envío POST a "/api/auth/login" con password igual a '{"$ne": null}'
    Then el código de respuesta HTTP no es 200
    And la respuesta no contiene "accessToken"
